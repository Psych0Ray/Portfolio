/* ══ Rutujeet · shared behaviour ═════════════════════════════════ */
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── CURSOR ─────────────────────────────────────────────────────
   Transform-only. Nothing tweens width/height/margin, which is what
   made the last one jitter. The dot follows; a sticker label pops in
   on anything with data-cursor="…".                                 */
(function cursor(){
  var cur = document.getElementById('cursor');
  if (!cur || !window.matchMedia('(hover:hover)').matches) return;
  var dot = cur.querySelector('.dot'), tag = cur.querySelector('.tag');
  gsap.set(dot,{xPercent:-50,yPercent:-50});
  gsap.set(tag,{scale:.6,rotation:-4,opacity:0});
  var cx = gsap.quickTo(cur,'x',{duration:.12,ease:'power3'});
  var cy = gsap.quickTo(cur,'y',{duration:.12,ease:'power3'});
  var shown = false;

  window.addEventListener('mousemove', function(e){
    cx(e.clientX); cy(e.clientY);
    if (!shown){ shown = true; gsap.to(cur,{opacity:1,duration:.2}); }
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
    if (d > 0 && y > 150) wrap.classList.add('hid');
    else if (d < 0) wrap.classList.remove('hid');
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
    v.src = src; v.autoplay = true; v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('playsinline','');
    el.textContent = ''; el.appendChild(v);
  });
  document.querySelectorAll('[data-img]').forEach(function(el){
    var src = el.getAttribute('data-img');
    if (!src) return;
    var i = document.createElement('img');
    i.src = src; i.alt = el.getAttribute('data-alt') || '';
    el.textContent = ''; el.appendChild(i);
  });
})();

/* footer: back to top */
(function totop(){
  var b = document.querySelector('.totop');
  if (!b) return;
  b.addEventListener('click', function(){
    window.scrollTo({ top:0, behavior: REDUCED ? 'auto' : 'smooth' });
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
    var y = t.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top:y, behavior: REDUCED ? 'auto' : 'smooth' });
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
