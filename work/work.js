/* Project pages: the prototype video.
   Scrolling into it pins the stage and zooms the video box from its framed size to fill the
   screen; it plays while full screen, with the nav hidden; scrolling on zooms it back out and
   the page carries on. Scrolling back up out of it does the same in reverse.
   The box is always sized from the viewport (object-fit:contain inside), so the whole video
   fits the screen on every device, laptop, Mac or phone.
   Muted, looping, no controls. If the browser refuses to autoplay (iOS Low Power Mode, data
   saver, a site autoplay setting) it starts on the viewer's first tap, click or key press.
   Under reduced motion there is no pin or zoom and native controls appear instead. */
(function () {
  var sections = document.querySelectorAll('.film');
  if (!sections.length) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  sections.forEach(function (sec) {
    var v = sec.querySelector('video');
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted', '');
    if (reduced) { v.controls = true; v.preload = 'metadata'; }
  });
  if (reduced) return;

  var blocked = [];
  function play(v) {
    v._want = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () { if (blocked.indexOf(v) < 0) blocked.push(v); });
  }
  function stop(v) { v._want = false; v.pause(); }
  function onGesture() {
    var list = blocked; blocked = [];
    list.forEach(function (v) { if (v._want) play(v); });
  }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (t) {
    document.addEventListener(t, onGesture, { passive: true });
  });

  /* no GSAP: leave the static box and just play it while on screen */
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) play(e.target); else stop(e.target); });
    }, { threshold: 0.35 });
    sections.forEach(function (sec) { io.observe(sec.querySelector('video')); });
    return;
  }

  /* timeline, in units: zoom in 0.7, hold full screen 1.6, zoom out 0.5 */
  var IN = 0.7, HOLD = 1.6, OUT = 0.5, TOTAL = IN + HOLD + OUT;
  var PLAY_FROM = (IN * 0.8) / TOTAL;          // starts once the box is nearly full screen
  var PLAY_TO = (IN + HOLD + OUT * 0.6) / TOTAL;
  var active = 0;

  sections.forEach(function (sec) {
    var stage = sec.querySelector('.film-stage');
    var box = sec.querySelector('.film-box');
    var v = sec.querySelector('video');
    var ar = (+v.getAttribute('width') || 16) / (+v.getAttribute('height') || 9);
    sec.classList.add('pin');

    function framed() {
      var W = stage.clientWidth, H = stage.clientHeight, narrow = W < 900;
      var w = Math.min(W - (narrow ? 44 : 80), (H - (narrow ? 140 : 200)) * ar);
      return { w: w, h: w / ar };
    }
    var on = false;
    function setOn(state) {
      if (state === on) return;
      on = state;
      active += state ? 1 : -1;
      document.body.classList.toggle('film-on', active > 0);
    }

    var tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var p = self.progress;
          setOn(p > 0.01 && p < 0.99);
          if (p >= PLAY_FROM && p <= PLAY_TO) { if (!v._want) play(v); }
          else if (v._want) stop(v);
        },
        onLeave: function () { setOn(false); stop(v); },
        onLeaveBack: function () { setOn(false); stop(v); }
      }
    });
    tl.fromTo(box,
        { width: function () { return framed().w; }, height: function () { return framed().h; }, borderWidth: 3 },
        { width: function () { return stage.clientWidth; }, height: function () { return stage.clientHeight; }, borderWidth: 0, duration: IN })
      .to({}, { duration: HOLD })
      .to(box, { width: function () { return framed().w; }, height: function () { return framed().h; }, borderWidth: 3, duration: OUT });
  });
})();
