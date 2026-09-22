/* ══ Rutujeet · shared behaviour ═════════════════════════════════ */
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── SMOOTH SCROLL · Lenis eases the wheel and trackpad everywhere. Touch keeps its native
   scrolling (Lenis leaves it alone by default). Driven by GSAP's ticker so ScrollTrigger stays
   in sync. Off under reduced motion. LENIS is null when it is off; callers fall back.   */
var LENIS = null;
(function smooth(){
  if (REDUCED || typeof Lenis === 'undefined') return;
  LENIS = new Lenis({ lerp:.1, wheelMultiplier:1 });
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') LENIS.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(t){ LENIS.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(t){ LENIS.raf(t); requestAnimationFrame(raf); })(0);
  }
})();
function glideTo(target){
  if (LENIS) LENIS.scrollTo(target, { duration:1.2, easing:function(x){ return 1 - Math.pow(1 - x, 4); } });
  else window.scrollTo({ top: typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY,
                         behavior: REDUCED ? 'auto' : 'smooth' });
}

/* ── CURSOR ─────────────────────────────────────────────────────
   Transform-only. Nothing tweens width/height/margin, which is what
   made the last one jitter. The dot follows; a sticker label pops in
   on anything with data-cursor="…".                                 */
(function cursor(){
  var cur = document.getElementById('cursor');
  if (!cur || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  var dot = cur.querySelector('.dot'), tag = cur.querySelector('.tag');
  gsap.set(dot,{xPercent:-50,yPercent:-50});
  gsap.set(tag,{scale:.6,rotation:-4,opacity:0});
  var cx = gsap.quickTo(cur,'x',{duration:.12,ease:'power3'});
  var cy = gsap.quickTo(cur,'y',{duration:.12,ease:'power3'});
  var shown = false;

  /* pointer events, so a tap on a touch laptop never drags the cursor to the tap point */
  window.addEventListener('pointermove', function(e){
    if (e.pointerType !== 'mouse') return;
    cx(e.clientX); cy(e.clientY);
    if (!shown){ shown = true; gsap.to(cur,{opacity:1,duration:.2}); }
  }, {passive:true});
  window.addEventListener('pointerdown', function(e){
    if (e.pointerType !== 'mouse' && shown){ shown = false; gsap.to(cur,{opacity:0,duration:.1}); }
  }, {passive:true});
  document.documentElement.addEventListener('mouseleave', function(){ shown=false; gsap.to(cur,{opacity:0,duration:.2}); });

  window.setCursorLabel = function(t){ tag.textContent = t; };
  function tagIn(t){
    tag.textContent = t;
    gsap.to(tag,{scale:1,rotation:-4,opacity:1,duration:.24,ease:'back.out(1.8)',overwrite:true});
    gsap.to(dot,{scale:1.35,duration:.2,overwrite:true});
  }
  function tagOut(){
    gsap.to(tag,{scale:.6,opacity:0,duration:.16,overwrite:true});
    gsap.to(dot,{scale:1,duration:.2,overwrite:true});
  }

  document.querySelectorAll('[data-cursor]').forEach(function(el){
    el.addEventListener('mouseenter', function(){ tagIn(el.getAttribute('data-cursor')); });
    el.addEventListener('mouseleave', function(){ tagOut(); });
  });
  document.querySelectorAll('a:not([data-cursor]), button').forEach(function(el){
    el.addEventListener('mouseenter', function(){ gsap.to(dot,{scale:1.9,duration:.2,overwrite:true}); });
    el.addEventListener('mouseleave', function(){ gsap.to(dot,{scale:1,duration:.2,overwrite:true}); });
  });
})();

/* ── NAV · hide going down, show on any scroll up ──────────────── */
(function navScroll(){
  var wrap = document.querySelector('.navwrap');
  if (!wrap) return;
  var last = window.scrollY;
  window.addEventListener('scroll', function(){
    var y = window.scrollY, d = y - last;
    if (Math.abs(d) < 6) return;            // ignore jitter, so a nudge up is enough
    var burger = document.querySelector('.burger');      /* phones: the menu button follows the same rule */
    if (d > 0 && y > 150) { wrap.classList.add('hid'); if (burger && !document.documentElement.classList.contains('menu-open')) burger.classList.add('hid'); }
    else if (d < 0) { wrap.classList.remove('hid'); if (burger) burger.classList.remove('hid'); }
    last = y;
  }, {passive:true});
})();

/* marquee  <div class="marquee"><div data-words="a|b|c"></div></div> */
(function marquees(){
  document.querySelectorAll('.marquee > div[data-words]').forEach(function(el){
    var run = el.getAttribute('data-words').split('|').map(function(w){
      return '<span class="w">' + w + '</span><i></i>';
    }).join('');
    el.innerHTML = '<span style="display:flex">' + run + '</span><span style="display:flex">' + run + '</span>';
  });
})();

/* media slots. Drop a filename into the attribute and the placeholder is replaced.
   <div class="slot" data-video="clip.mp4">  →  <video>
   <div class="poster" data-img="cover.jpg">  →  <img>  (the flat glyph is the empty state) */
(function media(){
  document.querySelectorAll('[data-video]').forEach(function(el){
    var src = el.getAttribute('data-video');
    if (!src) return;
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
    v.setAttribute('playsinline',''); v.setAttribute('muted','');
    v.setAttribute('data-src', src);          /* lazyclips() below turns this into a real src */
    el.textContent = ''; el.appendChild(v); el.classList.add('filled');
  });
  document.querySelectorAll('[data-img]').forEach(function(el){
    var src = el.getAttribute('data-img');
    if (!src) return;
    var i = document.createElement('img');
    i.decoding = 'async';
    i.alt = el.getAttribute('data-alt') || '';
    /* Only a slot already on screen is fetched now; the rest wait for watchMedia() below.

       Do NOT use loading="lazy" here. The hobby rail's slots sit far off to the right and are
       brought across by a transform, never by scrolling, and native lazy loading does not
       react to a transform: the poster stayed blank for good. IntersectionObserver does take
       transforms and ancestor clipping into account, which is why the clips already use it,
       so images go through the same observer. The box is reserved by .slot's aspect-ratio,
       so waiting shifts nothing. */
    if (el.getBoundingClientRect().top < window.innerHeight) {
      i.setAttribute('fetchpriority', 'high');
      i.src = src;
    } else {
      i.setAttribute('data-src', src);
    }
    el.textContent = ''; el.appendChild(i); el.classList.add('filled');
  });
})();

/* ── AUTOPLAY REFUSED ────────────────────────────────────────────────────────
   Browsers block autoplay in more cases than people expect: iOS Low Power Mode, a data
   saver, Chrome's per-site media setting, some in-app browsers. A muted loop that is
   refused just sits there as a still frame, and the viewer has no way of knowing that
   anything was meant to be moving. It reads as a broken image.

   Any clip whose play() is rejected by the autoplay POLICY gets a play button over it that
   says so. Tapping it plays that clip, and because one gesture releases the policy for the
   whole page, every other held clip starts at the same time and its button goes away.

   Deliberately NOT a "go and change your browser setting" prompt. The steps differ by
   browser, version and platform, most people will not follow them, and a tap fixes it here
   and now. The label names the cause, so anyone who does want to change the setting knows
   what they are looking for.

   CLIP_BLOCKED(v, err) to flag one, CLIP_OK(v) to take the button away again (a clip that
   has scrolled out of view is no longer waiting on anything).                            */
window.CLIP_BLOCKED = function(){};
window.CLIP_OK = function(){};
(function autoplay(){
  var held = [];
  var PLAY = '<span class="nb"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg></span>'
           + '<span class="nt">Autoplay is off<br>in your browser &mdash; tap to play</span>';

  function box(v){ return v.parentNode; }
  function show(v){
    var p = box(v);
    if (!p || p.querySelector('.noauto')) return;
    /* the hobby rail's clones are inert duplicates: a button in there cannot be clicked, and
       the real card carries one anyway. Releasing clears both. */
    if (v.closest('[inert],[aria-hidden="true"]')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'noauto'; b.innerHTML = PLAY;
    b.setAttribute('aria-label', 'Autoplay is blocked by your browser. Play this clip.');
    /* Presses are NOT stopped here. They used to be, so a mouse press would not start a drag
       on the hobby rail - but that also swallowed every swipe that began on a clip, and on a
       phone the clip is most of the card: the rail stopped following the finger whenever
       autoplay was blocked. Nothing needs the stop: the page-wide listeners below already
       release every held clip on any press, tap or key. */
    b.addEventListener('click', function(e){ e.preventDefault(); release(); });
    p.appendChild(b);
  }
  function hide(v){
    var p = box(v), b = p && p.querySelector('.noauto');
    if (b) b.parentNode.removeChild(b);
  }
  function release(){
    held.slice().forEach(function(v){
      var pr = v.play();
      if (pr && pr.then) pr.then(function(){ window.CLIP_OK(v); }, function(){});
      else window.CLIP_OK(v);
    });
  }

  window.CLIP_BLOCKED = function(v, err){
    /* only the autoplay policy. A decode or network failure is a different problem and a
       play button would not fix it. */
    if (err && err.name && err.name !== 'NotAllowedError') return;
    if (held.indexOf(v) < 0) held.push(v);
    show(v);
  };
  window.CLIP_OK = function(v){
    var i = held.indexOf(v);
    if (i >= 0) held.splice(i, 1);
    hide(v);
  };

  /* any gesture anywhere lifts the policy, so retry everything that is still waiting.
     On touch screens a press does not count as a user gesture until the finger lifts, so
     pointerup, touchend and click are listened for too; pointerdown alone only works for
     a mouse. */
  ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach(function(t){
    document.addEventListener(t, function(){ if (held.length) release(); }, { passive: true });
  });
})();

/* Media that is not on screen yet costs nothing: clips are not fetched and do not play,
   off-screen images are not fetched at all.

   CLIPS are watched one by one. Watching their section meant every clip on the About page
   played the whole time the section was visible: six of them, when the hobby rail only ever
   shows two or three, because the rail clones its cards for the seamless loop. An observer
   accounts for transforms and ancestor clipping, so a card that has slid out of the rail
   reports as off screen and pauses itself.

   IMAGES are watched by SECTION instead, and this is the part that is easy to get wrong.
   rootMargin expands the viewport, but it does NOT expand an ancestor's overflow clip, so an
   image parked off to the right inside the rail reads as off screen however large the margin
   is, and would only start loading as it slid into view - arriving blank. The section is not
   clipped, so it gives real warning. An image costs nothing once it has loaded, so section
   granularity is the right trade for images and the wrong one for clips.

   Clones do not exist when this runs, so WATCH_MEDIA() re-scans; hobbies() calls it right
   after cloning. It is safe to call whenever a slot is added. */
window.WATCH_MEDIA = function(){};
(function lazymedia(){
  var all = function(sel){ return [].slice.call(document.querySelectorAll(sel)); };
  function loadImg(i){
    if (i.getAttribute('src')) return;
    /* low priority: a deferred image is by definition not what the viewer is looking at, so
       it must not compete with the fold for bandwidth even when its section is close enough
       that the fetch starts straight away. */
    i.setAttribute('fetchpriority', 'low');
    i.setAttribute('src', i.getAttribute('data-src'));
  }
  function wakeVid(v, on){
    if (!on) { v.pause(); window.CLIP_OK(v); return; }   /* gone from view, nothing to wait for */
    if (!v.getAttribute('src')) v.setAttribute('src', v.getAttribute('data-src'));
    var p = v.play();
    if (p && p.catch) p.catch(function(err){ window.CLIP_BLOCKED(v, err); });
  }
  if (!all('video[data-src],img[data-src]').length) return;

  if (!('IntersectionObserver' in window)) {
    window.WATCH_MEDIA = function(){
      all('img[data-src]').forEach(loadImg);
      all('video[data-src]').forEach(function(v){ wakeVid(v, true); });
    };
    window.WATCH_MEDIA();
    return;
  }

  var ioImg = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      /* everything in this section at once, which also catches clones added later */
      [].forEach.call(e.target.querySelectorAll('img[data-src]'), loadImg);
      ioImg.unobserve(e.target);
    });
  }, { rootMargin: '400px 0px' });

  var ioVid = new IntersectionObserver(function(es){
    es.forEach(function(e){ wakeVid(e.target, e.isIntersecting); });
  }, { rootMargin: '200px' });

  window.WATCH_MEDIA = function(){
    all('img[data-src]').forEach(function(i){
      var root = i.closest('section') || i.parentNode;
      if (root._imgWatched) return;
      root._imgWatched = true; ioImg.observe(root);
    });
    all('video[data-src]').forEach(function(v){
      if (v._watched) return;
      v._watched = true; ioVid.observe(v);
    });
  };
  window.WATCH_MEDIA();
})();

/* footer: back to top */
(function totop(){
  var b = document.querySelector('.totop');
  if (!b) return;
  b.addEventListener('click', function(){
    glideTo(0);
  });
})();

/* the CV is not written yet: the button says so instead of 404ing.
   To ship it, point the link at the file and drop data-soon. */
(function soon(){
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('[data-soon]');
    if (!a) return;
    e.preventDefault();
    if (a._busy) return;
    var text = null;
    [].slice.call(a.childNodes).forEach(function(n){ if (!text && n.nodeType === 3 && n.textContent.trim()) text = n; });
    if (!text) return;
    a._busy = true;
    var was = text.textContent, keep = a.getAttribute('data-cursor');
    text.textContent = 'Coming soon ';
    if (window.setCursorLabel) window.setCursorLabel('Soon');
    setTimeout(function(){ text.textContent = was; a._busy = false; if (window.setCursorLabel) window.setCursorLabel(keep); }, 1600);
  });
})();

/* copy the address on click, and say so in the cursor label */
(function mail(){
  var b = document.getElementById('mail');
  if (!b) return;
  var addr = b.getAttribute('data-mail'), stamp = b.querySelector('.stamp'), timer;

  function done(){
    b.classList.add('copied');
    stamp.textContent = 'Copied';
    if (window.setCursorLabel) window.setCursorLabel('Copied');
    clearTimeout(timer);
    timer = setTimeout(function(){
      b.classList.remove('copied');
      stamp.textContent = '';
      if (window.setCursorLabel) window.setCursorLabel(b.getAttribute('data-cursor'));
    }, 1900);
  }
  function fallback(){                       // clipboard API needs a secure context
    var ta = document.createElement('textarea');
    ta.value = addr; ta.setAttribute('readonly','');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }
  b.addEventListener('click', function(){
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(addr).then(done, fallback);
    else fallback();
  });
})();

/* reveal once. clearProps so the CSS :hover lift is not overridden */
(function reveal(){
  if (REDUCED || typeof ScrollTrigger === 'undefined') return;
  gsap.utils.toArray('[data-reveal]').forEach(function(el, i){
    gsap.from(el,{ y:30, opacity:0, duration:.55, ease:'power3.out', delay:(i % 3) * .06,
      clearProps:'transform', scrollTrigger:{ trigger:el, start:'top 88%', once:true } });
  });
})();

/* iOS only applies :active (the pressed state) when the page listens for touches */
document.addEventListener('touchstart', function(){}, {passive:true});

/* in-page links glide instead of jumping (the scroll cue, WORK, Get in touch) */
(function glide(){
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.hash.length < 2) return;
    var t = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!t) return;
    e.preventDefault();
    glideTo(t);
    if (history.pushState) history.pushState(null, '', url.hash);
  });
})();

/* footer entrance: the black slab rises from the bottom edge, then everything on it
   lands in order: the letters of SAY, the HI block slamming in, the address and its
   underline, the links sliding in with their arrows, the rule drawing across, the base. */
(function footIn(){
  var f = document.querySelector('.foot');
  if (!f || REDUCED || typeof ScrollTrigger === 'undefined') return;
  var h = f.querySelector('h2');
  [].slice.call(h.childNodes).forEach(function(n){
    if (n.nodeType !== 3 || !n.textContent.trim()) return;
    var frag = document.createDocumentFragment();
    n.textContent.split('').forEach(function(ch){
      var s = document.createElement('span');
      s.className = 'fch'; s.textContent = ch === ' ' ? '\u00a0' : ch;
      frag.appendChild(s);
    });
    h.replaceChild(frag, n);
  });
  var chars = h.querySelectorAll('.fch'), hl = h.querySelector('.hl');
  var addr = f.querySelector('.mailbtn .addr'), links = f.querySelectorAll('.foot-links a');
  var icons = f.querySelectorAll('.foot-links .ic'), base = f.querySelector('.foot-base');
  var tl = gsap.timeline({ scrollTrigger:{ trigger:f, start:'top 88%', once:true } });
  tl.fromTo(f, { clipPath:'inset(100% 0% 0% 0% round 56px 56px 0px 0px)' },
               { clipPath:'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', duration:1, ease:'expo.inOut', clearProps:'clipPath' })
    .from(chars, { yPercent:115, rotation:10, opacity:0, duration:.6, ease:'power4.out', stagger:.05 }, '-=.3')
    .from(hl, { scale:0, rotation:-28, duration:.75, ease:'back.out(2.2)' }, '-=.35');
  if (addr) tl.from(addr, { y:26, opacity:0, duration:.55, ease:'power3.out', clearProps:'transform' }, '-=.45')
              .fromTo(addr, { '--u':0 }, { '--u':1, duration:.6, ease:'power3.inOut' }, '-=.25');
  tl.from(links, { x:70, opacity:0, duration:.6, ease:'power3.out', stagger:.09, clearProps:'transform' }, '-=.75')
    .from(icons, { rotation:-135, scale:0, duration:.55, ease:'back.out(2.4)', stagger:.09, clearProps:'transform' }, '-=.45');
  if (base) tl.fromTo(base, { '--b':0 }, { '--b':1, duration:.8, ease:'power3.inOut' }, '-=.5')
              .from(base.children, { y:12, opacity:0, duration:.4, ease:'power2.out', stagger:.08 }, '-=.35');
})();

/* ── MOBILE MENU · built from the page's own nav and footer links, so every page gets it ──
   Opening: an ink circle then the blue panel grow out of the burger, the links rise in with a
   stagger, the footer strip fades up. Closing plays it back quickly in reverse. Scroll is
   locked while it is open; Escape and any link close it.                                  */
(function menu(){
  var nav = document.querySelector('.nav');
  if (!nav) return;
  var links = [].slice.call(nav.querySelectorAll('a.lnk'));
  var logo = nav.querySelector('.logo');
  var foot = [].slice.call(document.querySelectorAll('.foot-links a'));
  var mail = document.getElementById('mail');
  var NE = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10"/></svg>';
  var RA = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12h16M13 5l7 7-7 7"/></svg>';

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'burger';
  btn.setAttribute('aria-label', 'Open menu'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'mmenu');
  btn.innerHTML = '<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>';

  var m = document.createElement('div');
  m.className = 'mmenu'; m.id = 'mmenu';
  m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Menu');
  var n = 0;
  var items = links.map(function(a){
    var cta = a.classList.contains('cta'), label = a.textContent.trim();
    if (!cta) n++;
    /* carry target/rel across, or the resume would open in the same tab from the phone menu */
    var ext = a.getAttribute('target') ? ' target="' + a.getAttribute('target') + '" rel="noopener"' : '';
    var icon = a.querySelector('svg');
    return '<li><a href="' + a.getAttribute('href') + '"' + (cta ? ' class="cta"' : '') + ext + (a.hasAttribute('data-soon') ? ' data-soon' : '') + '>'
      + (cta ? label + ' ' + (icon ? icon.outerHTML : RA) : '<small>0' + n + '</small>' + label) + '</a></li>';
  }).join('');
  var socials = foot.map(function(a){
    return '<a href="' + a.href + '" target="_blank" rel="noopener">' + a.textContent.trim() + ' ' + NE + '</a>';
  }).join('');
  m.innerHTML = '<div class="mm-ink"></div><div class="mm-panel">'
    + '<div class="mm-top">' + (logo ? logo.outerHTML : '') + '</div>'
    + '<ul class="mm-links">' + items + '</ul>'
    + '<div class="mm-foot">'
    + (mail ? '<a class="mm-mail" href="mailto:' + mail.getAttribute('data-mail') + '">' + mail.getAttribute('data-mail') + '</a>' : '')
    + '<span style="display:flex;gap:16px">' + socials + '</span>'
    + '</div></div>';
  document.body.appendChild(m);
  document.body.appendChild(btn);

  var ink = m.querySelector('.mm-ink'), panel = m.querySelector('.mm-panel');
  var rows = m.querySelectorAll('.mm-links a'), top = m.querySelector('.mm-top'), bottom = m.querySelector('.mm-foot');
  var open = false, tl = null;

  function origin(){
    var r = btn.getBoundingClientRect();
    return Math.round(r.left + r.width / 2) + 'px ' + Math.round(r.top + r.height / 2) + 'px';
  }
  function lock(on){
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (window.LENIS) { if (on) LENIS.stop(); else LENIS.start(); }
  }
  function show(){
    if (open) return; open = true;
    m.classList.add('open'); document.documentElement.classList.add('menu-open');
    btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close menu');
    lock(true);
    if (tl) tl.kill();
    if (REDUCED || typeof gsap === 'undefined') { if (rows[0]) rows[0].focus(); return; }
    var o = origin();
    tl = gsap.timeline();
    tl.fromTo(ink, { clipPath:'circle(0px at ' + o + ')' }, { clipPath:'circle(150% at ' + o + ')', duration:.6, ease:'power3.inOut' })
      .fromTo(panel, { clipPath:'circle(0px at ' + o + ')' }, { clipPath:'circle(150% at ' + o + ')', duration:.7, ease:'power3.inOut' }, .08)
      .fromTo(top, { opacity:0, y:-12 }, { opacity:1, y:0, duration:.4, ease:'power2.out' }, .42)
      .fromTo(rows, { yPercent:115, rotation:6, opacity:0 }, { yPercent:0, rotation:0, opacity:1, duration:.65, ease:'power4.out', stagger:.07 }, .38)
      .fromTo(bottom, { opacity:0, y:16 }, { opacity:1, y:0, duration:.45, ease:'power2.out' }, .7)
      .add(function(){ if (rows[0]) rows[0].focus({ preventScroll:true }); });
  }
  function hide(){
    if (!open) return; open = false;
    document.documentElement.classList.remove('menu-open');
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu');
    lock(false);
    if (tl) tl.kill();
    if (REDUCED || typeof gsap === 'undefined') { m.classList.remove('open'); return; }
    var o = origin();
    tl = gsap.timeline({ onComplete:function(){ m.classList.remove('open'); } });
    tl.to(rows, { yPercent:-110, opacity:0, duration:.28, ease:'power2.in', stagger:.035 })
      .to([top, bottom], { opacity:0, duration:.2 }, 0)
      .to(panel, { clipPath:'circle(0px at ' + o + ')', duration:.5, ease:'power3.inOut' }, .16)
      .to(ink, { clipPath:'circle(0px at ' + o + ')', duration:.5, ease:'power3.inOut' }, .24);
  }
  btn.addEventListener('click', function(){ if (open) hide(); else show(); });
  m.addEventListener('click', function(e){ if (e.target.closest('a')) hide(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && open) { hide(); btn.focus(); } });
  window.addEventListener('resize', function(){ if (open && window.innerWidth > 900) hide(); });
})();
