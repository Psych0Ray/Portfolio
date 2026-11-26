/* DROBE: the deck as a slideshow. Arrows, the keyboard (left and right, Home and End) and a
   horizontal swipe step through it; the counter and the progress line follow. Slides that are
   not showing are inert, so their links can't be tabbed to. The next and previous slides are
   asked for early, so stepping on never waits on a lazy image. */
(function () {
  var root = document.querySelector('.ss');
  if (!root) return;
  var view = root.querySelector('.ss-view');
  var slides = [].slice.call(root.querySelectorAll('.ss-slide'));
  var n = slides.length, i = 0;
  var num = root.querySelector('.ss-n');
  var bar = root.querySelector('.ss-prog span');
  var prev = root.querySelector('[data-dir="-1"]'), next = root.querySelector('[data-dir="1"]');

  function warm(k) {
    var s = slides[k];
    if (!s) return;
    var img = s.querySelector('img');
    if (img.loading === 'lazy') img.loading = 'eager';
  }

  function go(k) {
    k = Math.max(0, Math.min(n - 1, k));
    if (k === i) return;
    var from = slides[i], to = slides[k];
    from.classList.remove('on'); from.setAttribute('aria-hidden', 'true'); from.inert = true;
    to.classList.add('on'); to.removeAttribute('aria-hidden'); to.inert = false;
    i = k;
    num.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
    bar.style.transform = 'scaleX(' + (i + 1) / n + ')';
    prev.disabled = i === 0;
    next.disabled = i === n - 1;
    warm(i + 1); warm(i - 1);
  }

  prev.addEventListener('click', function () { go(i - 1); });
  next.addEventListener('click', function () { go(i + 1); });
  warm(1);

  // keys work while the slideshow is on screen and nothing is being typed into
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var r = view.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    var to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    go(to);
  });

  // a swipe: mostly sideways, and far enough to mean it
  var x0 = null, y0 = 0;
  view.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    x0 = e.clientX; y0 = e.clientY;
  });
  view.addEventListener('pointerup', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0, dy = e.clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) go(i + (dx < 0 ? 1 : -1));
  });
  view.addEventListener('pointercancel', function () { x0 = null; });
})();
