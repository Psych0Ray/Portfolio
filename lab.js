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

  document.querySelectorAll('[data-cursor]').forEach(function(el){
    el.addEventListener('mouseenter', function(){
      tag.textContent = el.getAttribute('data-cursor');
      gsap.to(tag,{scale:1,rotation:-4,opacity:1,duration:.24,ease:'back.out(1.8)',overwrite:true});
      gsap.to(dot,{scale:1.35,duration:.2,overwrite:true});
    });
    el.addEventListener('mouseleave', function(){
      gsap.to(tag,{scale:.6,opacity:0,duration:.16,overwrite:true});
      gsap.to(dot,{scale:1,duration:.2,overwrite:true});
    });
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
    i.src = src; i.alt = el.getAttribute('data-alt') || '';
    el.textContent = ''; el.appendChild(i); el.classList.add('filled');
  });
})();

/* the clips cost a few MB between them, so nothing is fetched until its section is near the
   viewport, and everything pauses again once it leaves. The observer watches the *section*
   rather than each video because the hobby rail clones its cards after this file runs; looking
   the videos up at intersection time catches the clones too. */
(function lazyclips(){
  var first = document.querySelector('video[data-src]');
  if (!first) return;
  function wake(root, on){
    [].forEach.call(root.querySelectorAll('video[data-src]'), function(v){
      if (!on) { v.pause(); return; }
      if (!v.getAttribute('src')) v.setAttribute('src', v.getAttribute('data-src'));
      var p = v.play(); if (p && p.catch) p.catch(function(){});
    });
  }
  if (!('IntersectionObserver' in window)) { wake(document, true); return; }
  var seen = [];
  [].forEach.call(document.querySelectorAll('video[data-src]'), function(v){
    var s = v.closest('section') || v.parentNode;
    if (seen.indexOf(s) < 0) seen.push(s);
  });
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ wake(e.target, e.isIntersecting); });
  }, { rootMargin: '300px 0px' });
  seen.forEach(function(s){ io.observe(s); });
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
    return '<li><a href="' + a.getAttribute('href') + '"' + (cta ? ' class="cta"' : '') + (a.hasAttribute('data-soon') ? ' data-soon' : '') + '>'
      + (cta ? label + ' ' + (a.hasAttribute('data-soon') ? a.querySelector('svg').outerHTML : RA) : '<small>0' + n + '</small>' + label) + '</a></li>';
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
