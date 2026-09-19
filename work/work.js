/* Project pages: the prototype video plays, muted and looping, whenever it is on screen,
   and pauses when scrolled away. No controls. Under reduced motion it does not autoplay;
   native controls appear instead so the viewer can start it themselves. */
(function () {
  var vids = document.querySelectorAll('.film video');
  if (!vids.length) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  vids.forEach(function (v) {
    v.muted = true;
    if (reduced) { v.controls = true; v.preload = 'metadata'; }
  });
  if (reduced) return;

  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  if (!('IntersectionObserver' in window)) { vids.forEach(play); return; }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) play(e.target); else e.target.pause();
    });
  }, { threshold: 0.35 });
  vids.forEach(function (v) { io.observe(v); });
})();
