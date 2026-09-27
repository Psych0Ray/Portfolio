/* Project pages: the video player and the scaled product stages.

   PLAYER (.vp). Each project video sits at one fixed size inside the page grid, never pinned
   and never zoomed. It starts playing, muted, when half of it is on screen and pauses when it
   leaves, like a normal embedded clip. The viewer owns it from the first touch: once they
   pause, scrolling past it will not start it again. The bar gives play/pause, back and
   forward 10 seconds, a draggable seek bar with keyboard steps, the time, and full screen,
   which takes the whole player so the controls stay. Long walkthroughs carry chapters, which
   are buttons that jump to a moment and also show which part is playing. Only Relique's video
   has sound, with its own button. Under reduced motion nothing starts on its own.

   STAGE (.stage[data-w]). A product screen built at its own design width (a 1200px dashboard,
   say) is laid out at that width and scaled down to fit the column, so it keeps its real
   proportions on a laptop and still fits on a phone. Its height follows the scale. */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    s = Math.floor(s);
    var m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function player(fig) {
    var v = fig.querySelector('video');
    var big = fig.querySelector('.vp-big');
    var playBtn = fig.querySelector('.vp-play');
    var back = fig.querySelector('.vp-back');
    var fwd = fig.querySelector('.vp-fwd');
    var cur = fig.querySelector('.vp-cur');
    var durEl = fig.querySelector('.vp-dur');
    var track = fig.querySelector('.vp-track');
    var fill = fig.querySelector('.vp-fill');
    var knob = fig.querySelector('.vp-knob');
    var full = fig.querySelector('.vp-full');
    var vol = fig.querySelector('.vp-vol');
    var chapters = [].slice.call(fig.querySelectorAll('.vp-ch button'));
    var dur = parseFloat(fig.getAttribute('data-dur')) || 0;
    /* a video with sound still starts muted when it plays on its own (browsers refuse sound
       without a gesture); pressing play or a chapter is that gesture, so the sound comes on
       then, unless the viewer has turned it off with the sound button */
    var audio = fig.hasAttribute('data-audio'), userMuted = false;
    var userPaused = false, dragging = false, raf = 0, idleT = 0;

    v.muted = true; v.defaultMuted = true; v.setAttribute('muted', '');

    function D() { return (v.duration && isFinite(v.duration)) ? v.duration : dur; }

    function paint() {
      var d = D(), t = v.currentTime || 0, p = d ? Math.min(1, t / d) : 0;
      fill.style.transform = 'scaleX(' + p + ')';
      knob.style.left = (p * 100) + '%';
      cur.textContent = fmt(t);
      durEl.textContent = ' / ' + fmt(d);
      track.setAttribute('aria-valuenow', Math.round(t));
      track.setAttribute('aria-valuetext', fmt(t) + ' of ' + fmt(d));
      if (chapters.length) {
        var on = 0;
        chapters.forEach(function (b, i) { if (t + 0.25 >= parseFloat(b.getAttribute('data-t'))) on = i; });
        chapters.forEach(function (b, i) {
          var cur = i === on;
          b.classList.toggle('on', cur);
          if (cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
        });
      }
    }
    function loop() { paint(); if (!v.paused) raf = requestAnimationFrame(loop); }

    function state() {
      var playing = !v.paused && !v.ended;
      fig.classList.toggle('playing', playing);
      playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      big.setAttribute('aria-label', playing ? 'Pause' : 'Play video');
      cancelAnimationFrame(raf);
      if (playing) raf = requestAnimationFrame(loop); else paint();
    }

    function play() {
      if (v.preload === 'none') v.preload = 'auto';
      var p = v.play();
      if (p && p.catch) p.catch(function () { state(); });
    }
    function sound() { if (audio && !userMuted) v.muted = false; }
    function toggle() {
      if (v.paused || v.ended) { userPaused = false; sound(); play(); }
      else { userPaused = true; v.pause(); }
    }
    function volState() {
      fig.classList.toggle('muted', v.muted);
      if (vol) vol.setAttribute('aria-label', v.muted ? 'Turn sound on' : 'Turn sound off');
    }
    function seek(t) {
      var d = D();
      if (v.preload === 'none') v.preload = 'auto';
      v.currentTime = Math.max(0, Math.min(d ? d - 0.05 : t, t));
      paint();
    }

    v.addEventListener('play', state);
    v.addEventListener('pause', state);
    v.addEventListener('ended', state);
    v.addEventListener('loadedmetadata', function () { track.setAttribute('aria-valuemax', Math.round(D())); paint(); });
    v.addEventListener('seeked', paint);
    v.addEventListener('volumechange', volState);

    big.addEventListener('click', toggle);
    v.addEventListener('click', toggle);
    playBtn.addEventListener('click', toggle);
    back.addEventListener('click', function () { seek((v.currentTime || 0) - 10); });
    fwd.addEventListener('click', function () { seek((v.currentTime || 0) + 10); });
    if (vol) vol.addEventListener('click', function () {
      v.muted = !v.muted;
      userMuted = v.muted;
    });
    chapters.forEach(function (b) {
      b.addEventListener('click', function () {
        seek(parseFloat(b.getAttribute('data-t')));
        userPaused = false; sound(); play();
      });
    });

    /* seek bar: press anywhere on it and drag; the pointer is captured so a drag that
       leaves the bar keeps scrubbing */
    function at(e) {
      var r = track.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * D();
    }
    track.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      dragging = true; fig.classList.add('scrub');
      track.setPointerCapture(e.pointerId);
      seek(at(e));
    });
    track.addEventListener('pointermove', function (e) { if (dragging) seek(at(e)); });
    function end() { dragging = false; fig.classList.remove('scrub'); }
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    track.addEventListener('keydown', function (e) {
      var k = e.key, t = v.currentTime || 0, step = D() > 120 ? 10 : 5;
      if (k === 'ArrowRight' || k === 'ArrowUp') seek(t + step);
      else if (k === 'ArrowLeft' || k === 'ArrowDown') seek(t - step);
      else if (k === 'Home') seek(0);
      else if (k === 'End') seek(D());
      else if (k === 'PageUp') seek(t + 30);
      else if (k === 'PageDown') seek(t - 30);
      else return;
      e.preventDefault();
    });
    /* space or k anywhere on the player toggles, f goes full screen, as on every video site */
    fig.addEventListener('keydown', function (e) {
      if (e.target.closest('button') && e.key === ' ') return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
      else if (e.key === 'f') { e.preventDefault(); fullscreen(); }
    });

    /* full screen takes the whole player, so the bar, the seek bar and the exit button come
       along. While it plays and the pointer rests for 2.5s, the bar and cursor step aside;
       moving, tapping or a key brings them back. Esc still works. iPhones, which cannot put
       an element in full screen, get the system player instead. */
    function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement; }
    function fullscreen() {
      if (fsEl()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      if (fig.requestFullscreen) fig.requestFullscreen();
      else if (fig.webkitRequestFullscreen) fig.webkitRequestFullscreen();
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    }
    function wake() {
      fig.classList.remove('idle');
      clearTimeout(idleT);
      if (fig.classList.contains('fs') && !v.paused) {
        idleT = setTimeout(function () { if (!dragging) fig.classList.add('idle'); }, 2500);
      }
    }
    function fsChange() {
      var on = fsEl() === fig;
      fig.classList.toggle('fs', on);
      full.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen');
      wake();
    }
    full.addEventListener('click', fullscreen);
    document.addEventListener('fullscreenchange', fsChange);
    document.addEventListener('webkitfullscreenchange', fsChange);
    fig.addEventListener('pointermove', wake);
    fig.addEventListener('pointerdown', wake);
    fig.addEventListener('keydown', wake);
    v.addEventListener('play', wake);
    v.addEventListener('pause', wake);

    /* on screen: play, unless the viewer paused it or asked for less motion */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { if (!reduced && !userPaused && v.paused) play(); }
          else if (!v.paused) v.pause();
        });
      }, { threshold: 0.5 }).observe(v);
      /* fetch the first frames a little before it arrives, so it does not open on a spinner */
      var near = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { if (v.preload === 'none') v.preload = 'metadata'; near.disconnect(); }
      }, { rootMargin: '600px 0px' });
      near.observe(v);
    }
    paint();
    volState();
  }

  [].forEach.call(document.querySelectorAll('.vp'), player);

  /* the nav wears the project's colours while the trailer is under it (work.css, INSIDE THE
     WORK): an observer watches a one-pixel line through the middle of the nav bar */
  var deck = document.querySelector('.deck');
  if (deck && 'IntersectionObserver' in window) {
    var io = null;
    var watch = function () {
      if (io) io.disconnect();
      var line = 52;   /* the nav bar's middle: 22px from the top, 66px tall (the phone button: 16 + 58) */
      io = new IntersectionObserver(function (es) {
        document.documentElement.classList.toggle('on-deck', es[es.length - 1].isIntersecting);
      }, { rootMargin: '-' + line + 'px 0px -' + Math.max(0, window.innerHeight - line - 1) + 'px 0px' });
      io.observe(deck);
    };
    watch();
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(watch, 150); });
  }

  /* sideways strips of frames: each arrow moves one frame, and greys out at its end */
  [].forEach.call(document.querySelectorAll('[data-strip]'), function (w) {
    var s = w.querySelector('.strip');
    var prev = w.querySelector('[data-dir="-1"]'), next = w.querySelector('[data-dir="1"]');
    function step() {
      var a = s.children[0], b = s.children[1];
      return b ? b.offsetLeft - a.offsetLeft : s.clientWidth;
    }
    function sync() {
      prev.disabled = s.scrollLeft <= 2;
      next.disabled = s.scrollLeft >= s.scrollWidth - s.clientWidth - 2;
    }
    w.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dir]');
      if (b) s.scrollBy({ left: step() * +b.getAttribute('data-dir'), behavior: reduced ? 'auto' : 'smooth' });
    });
    s.addEventListener('scroll', function () { cancelAnimationFrame(s._r); s._r = requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* slideshows of screens (work.css .t-slides): the arrows, a tab, the arrow keys or a swipe
     change the screen, which slides in from the side it is coming from. While on screen the
     show also moves on by itself every 7s (the playing tab's line fills; hover pauses it) until
     the viewer takes over, after which it stays where they put it. */
  [].forEach.call(document.querySelectorAll('[data-slides]'), function (box) {
    var view = box.querySelector('.t-slides-view');
    var imgs = [].slice.call(view.querySelectorAll(':scope > img'));
    var tabs = [].slice.call(box.querySelectorAll('.t-slides-tabs button'));
    var n = tabs.length, at = 0;
    function show(i, byUser, dir) {
      var next = (i + n) % n;
      if (next === at) return;
      view.classList.toggle('back', (dir || (i > at ? 1 : -1)) < 0);
      imgs.forEach(function (im, k) {
        im.classList.toggle('out', k === at);
        im.classList.toggle('on', k === next);
      });
      at = next;
      tabs.forEach(function (t, k) { t.setAttribute('aria-pressed', k === at ? 'true' : 'false'); });
      if (byUser) box.classList.remove('auto');
    }
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { show(i, true); }); });
    [].forEach.call(box.querySelectorAll('.t-slides-arrow'), function (b) {
      b.addEventListener('click', function () { var d = +b.getAttribute('data-dir'); show(at + d, true, d); });
    });
    box.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d || !e.target.closest('button')) return;
      e.preventDefault(); show(at + d, true, d);
      if (e.target.closest('.t-slides-tabs')) tabs[at].focus();
    });
    box.addEventListener('animationend', function (e) {
      if (box.classList.contains('auto') && e.target.parentElement === tabs[at]) show(at + 1, false, 1);
    });
    var x0 = null;
    view.addEventListener('pointerdown', function (e) { if (!e.target.closest('button')) x0 = e.clientX; });
    view.addEventListener('pointerup', function (e) {
      if (x0 !== null && Math.abs(e.clientX - x0) > 40) { var d = e.clientX < x0 ? 1 : -1; show(at + d, true, d); }
      x0 = null;
    });
    if (!reduced && 'IntersectionObserver' in window) {
      box.classList.add('auto');
      new IntersectionObserver(function (es) { box.classList.toggle('live', es[0].isIntersecting); }, { threshold: 0.4 }).observe(view);
    }
  });

  /* scaled stages */
  var stages = [].slice.call(document.querySelectorAll('.stage[data-w]'));
  /* data-min: below this scale the screen stops shrinking and the stage pans sideways
     instead, so a dashboard stays readable and usable on a phone. data-focus (0 to 1) is
     where the pan starts, so the part the caption talks about is what shows first. */
  function fit(st) {
    var inner = st.firstElementChild, w = parseFloat(st.getAttribute('data-w'));
    var min = parseFloat(st.getAttribute('data-min')) || 0;
    var s = Math.min(1, st.clientWidth / w), pan = s < min;
    if (pan) s = min;
    inner.style.width = w + 'px';
    inner.style.transform = 'scale(' + s + ')';
    st.classList.toggle('pan', pan);
    st.style.height = Math.ceil(inner.offsetHeight * s) + (pan ? 14 : 0) + 'px';
    st.style.setProperty('--s', s);
    if (pan && !st._panned) {
      st._panned = true;
      var f = parseFloat(st.getAttribute('data-focus')) || 0;
      st.scrollLeft = Math.max(0, (w * s - st.clientWidth) * f);
    }
    if (!pan) st._panned = false;
    /* a clipped edge alone does not say the screen goes on, so say it once, under it */
    if (pan && !st._hint) {
      st._hint = document.createElement('p');
      st._hint.className = 'pan-hint';
      st._hint.textContent = 'Swipe sideways to see the whole screen';
      st.after(st._hint);
    }
    if (st._hint) st._hint.hidden = !pan;
  }
  function fitAll() { stages.forEach(fit); }
  fitAll();
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function (es) {
      es.forEach(function (e) { fit(e.target.classList.contains('stage') ? e.target : e.target.parentElement); });
    });
    stages.forEach(function (st) { ro.observe(st); ro.observe(st.firstElementChild); });
  } else window.addEventListener('resize', fitAll);
  window.FIT_STAGES = fitAll;
})();
