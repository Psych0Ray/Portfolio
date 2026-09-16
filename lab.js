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

/* marquee  <div class="marquee"><div data-words="a|b|c"></div></div> */
(function marquees(){
  document.querySelectorAll('.marquee > div[data-words]').forEach(function(el){
    var run = el.getAttribute('data-words').split('|').map(function(w){
      return '<span class="w">' + w + '</span><i></i>';
    }).join('');
    el.innerHTML = '<span style="display:flex">' + run + '</span><span style="display:flex">' + run + '</span>';
  });
})();

/* media slot  <div class="slot" data-video="clip.mp4">  →  <video> */
(function media(){
  document.querySelectorAll('.slot[data-video]').forEach(function(el){
    var src = el.getAttribute('data-video');
    if (!src) return;
    var v = document.createElement('video');
    v.src = src; v.autoplay = true; v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('playsinline','');
    el.textContent = ''; el.appendChild(v);
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
