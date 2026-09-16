/* ══ Rutujeet — shared behaviour ══════════════════════════════ */
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── CURSOR: dot that swells into a labelled disc ──
   Any element can drive it:  data-cursor="Read"  data-cursor-style="ring"       */
(function cursor(){
  var cur = document.getElementById('cursor');
  if (!cur || !window.matchMedia('(hover:hover)').matches) return;
  var label = cur.querySelector('span');
  var cx = gsap.quickTo(cur,'x',{duration:.13,ease:'power3'});
  var cy = gsap.quickTo(cur,'y',{duration:.13,ease:'power3'});

  window.addEventListener('mousemove', function(e){
    cx(e.clientX); cy(e.clientY); gsap.to(cur,{opacity:1,duration:.2});
  });
  document.addEventListener('mouseleave', function(){ gsap.to(cur,{opacity:0,duration:.2}); });

  function grow(text, ring){
    label.textContent = text || '';
    cur.classList.toggle('ring', !!ring);
    gsap.to(cur,{width:88,height:88,margin:'-44px 0 0 -44px',duration:.28,ease:'power3.out'});
    gsap.to(label,{opacity:1,duration:.2,delay:.06});
  }
  function shrink(){
    gsap.to(label,{opacity:0,duration:.12});
    gsap.to(cur,{width:14,height:14,margin:'-7px 0 0 -7px',duration:.28,ease:'power3.out',
      onComplete:function(){ cur.classList.remove('ring'); }});
  }

  document.querySelectorAll('[data-cursor]').forEach(function(el){
    el.addEventListener('mouseenter', function(){
      grow(el.getAttribute('data-cursor'), el.getAttribute('data-cursor-style') === 'ring');
    });
    el.addEventListener('mouseleave', shrink);
  });
  /* plain links just nudge the dot bigger */
  document.querySelectorAll('a:not([data-cursor])').forEach(function(el){
    el.addEventListener('mouseenter', function(){ gsap.to(cur,{scale:2.4,duration:.22}); });
    el.addEventListener('mouseleave', function(){ gsap.to(cur,{scale:1,duration:.22}); });
  });
})();

/* marquees — <div class="marquee"><div data-words="a|b|c"></div></div> */
(function marquees(){
  document.querySelectorAll('.marquee > div[data-words]').forEach(function(el){
    var run = el.getAttribute('data-words').split('|').map(function(w){
      return '<span class="w">' + w + '</span><i>&#10022;</i>';
    }).join('');
    el.innerHTML = '<span style="display:flex">' + run + '</span><span style="display:flex">' + run + '</span>';
  });
})();

/* media slots — <div class="slot" data-video="clip.mp4"> becomes a real <video> */
(function media(){
  document.querySelectorAll('.slot[data-video]').forEach(function(el){
    var src = el.getAttribute('data-video');
    if (!src) return;
    var v = document.createElement('video');
    v.src = src; v.autoplay = true; v.muted = true; v.loop = true;
    v.playsInline = true; v.setAttribute('playsinline','');
    el.textContent = '';
    el.appendChild(v);
  });
})();

/* cards rise into view once. clearProps so the CSS hover lift still works */
(function reveal(){
  if (REDUCED || typeof ScrollTrigger === 'undefined') return;
  gsap.utils.toArray('[data-reveal]').forEach(function(el, i){
    gsap.from(el, {
      y: 34, opacity: 0, duration: .55, ease: 'power3.out', delay: (i % 3) * .06,
      clearProps: 'transform',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
})();
