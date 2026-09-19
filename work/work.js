/* Project pages: the prototype video plays, muted and looping, whenever it is on screen,
   and pauses when scrolled away. No controls. Under reduced motion it does not autoplay;
   native controls appear instead so the viewer can start it themselves.
   If the browser refuses to autoplay (iOS Low Power Mode, data saver, a site autoplay
   setting), the video starts on the viewer's first tap, click or key press instead. */
(function () {
  var vids = document.querySelectorAll('.film video');
  if (!vids.length) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  vids.forEach(function (v) {
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    if (reduced) { v.controls = true; v.preload = 'metadata'; }
  });
  if (reduced) return;

  var blocked = [];
  function onGesture() {
    var list = blocked; blocked = [];
    list.forEach(function (v) { if (v._inView) play(v); });
  }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (t) {
    document.addEventListener(t, onGesture, { passive: true });
  });

  function play(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () { if (blocked.indexOf(v) < 0) blocked.push(v); });
  }

  if (!('IntersectionObserver' in window)) { vids.forEach(function (v) { v._inView = true; play(v); }); return; }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      v._inView = e.isIntersecting;
      if (e.isIntersecting) play(v); else v.pause();
    });
  }, { threshold: 0.35 });
  vids.forEach(function (v) { io.observe(v); });
})();
