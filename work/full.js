/* Sideways maps you can drag (journey maps): press and drag to scroll; the site cursor says
   "Drag" over them (data-cursor). The fade at the right edge goes once the end is reached. */
(function () {
  [].forEach.call(document.querySelectorAll('[data-drag]'), function (el) {
    var down = false, x0 = 0, s0 = 0, moved = false;
    function edge() { el.classList.toggle('at-end', el.scrollLeft >= el.scrollWidth - el.clientWidth - 2); }
    el.addEventListener('scroll', edge, { passive: true }); edge();
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; x0 = e.clientX; s0 = el.scrollLeft; el.classList.add('dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - x0; if (Math.abs(dx) > 3) moved = true;
      el.scrollLeft = s0 - dx;
    });
    window.addEventListener('pointerup', function () { down = false; el.classList.remove('dragging'); });
    el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });
})();

/* Journey map tabs (ULS): one actor's map at a time; arrow keys move between tabs. */
(function () {
  [].forEach.call(document.querySelectorAll('[data-jm]'), function (box) {
    var tabs = [].slice.call(box.querySelectorAll('[role="tab"]'));
    function pick(i, focus) {
      tabs.forEach(function (t, k) {
        t.setAttribute('aria-selected', k === i ? 'true' : 'false');
        t.tabIndex = k === i ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = k !== i;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') pick((i + 1) % tabs.length, true);
        if (e.key === 'ArrowLeft') pick((i - 1 + tabs.length) % tabs.length, true);
      });
    });
    pick(0);
  });
})();

/* A dense diagram opens full size in an overlay on the same page (.cs-zoom links), not in a
   new tab: it fits the screen first, a click toggles its real size to pan around, and it
   closes with the X, Esc, the back of the overlay, or the browser's back button. */
(function () {
  var links = document.querySelectorAll('.cs-zoom a[href]');
  if (!links.length || !window.HTMLDialogElement) return;
  var X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var lb = document.createElement('dialog');
  lb.className = 'lb';
  lb.setAttribute('aria-label', 'Diagram, full size');
  lb.innerHTML = '<div class="lb-bar"><p class="lb-hint">Click the diagram to zoom in or out</p>' +
    '<button type="button" class="lb-x" aria-label="Close">' + X + '</button></div>' +
    '<div class="lb-view" data-lenis-prevent><img alt=""></div>';
  document.body.appendChild(lb);
  var view = lb.querySelector('.lb-view'), pic = view.querySelector('img'), pushed = false;
  if (window.matchMedia('(hover: none)').matches) lb.querySelector('.lb-hint').textContent = 'Tap the diagram to zoom in or out';

  function open(a) {
    var im = a.querySelector('img');
    pic.src = a.getAttribute('href');
    pic.alt = im ? im.alt : '';
    lb.classList.remove('zoomed');
    lb.showModal();
    view.scrollTo(0, 0);
    if (window.LENIS) window.LENIS.stop();
    document.documentElement.classList.add('lb-open');
    history.pushState({ lb: 1 }, '');
    pushed = true;
  }
  function closed() {
    if (window.LENIS) window.LENIS.start();
    document.documentElement.classList.remove('lb-open');
    if (pushed) { pushed = false; history.back(); }
  }
  [].forEach.call(links, function (a) {
    a.removeAttribute('target');
    a.addEventListener('click', function (e) { e.preventDefault(); open(a); });
  });
  lb.addEventListener('close', closed);
  lb.querySelector('.lb-x').addEventListener('click', function () { lb.close(); });
  /* a click on the dark space around the diagram closes it */
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target === view) lb.close(); });
  pic.addEventListener('click', function (e) {
    var r = pic.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    lb.classList.toggle('zoomed');
    /* zooming in keeps the spot that was clicked under the pointer */
    if (lb.classList.contains('zoomed')) {
      view.scrollTo(fx * pic.offsetWidth - view.clientWidth / 2, fy * pic.offsetHeight - view.clientHeight / 2);
    }
  });
  /* the browser's back button closes the overlay instead of leaving the page */
  window.addEventListener('popstate', function () { if (lb.open) { pushed = false; lb.close(); } });
})();

/* Full case studies: the index beside the deck.
   Each link knows which image its section is in and how far down it starts, as a fraction of
   that image's height, so the position holds at any width. A click scrolls there (through the
   site's smooth scroll when it is on); the section being read is marked in the index, and on
   phones the index folds into a "Sections" button at the foot of the screen. */
(function () {
  var nav = document.querySelector('.findex');
  if (!nav) return;
  /* a deck shown as slide images (data-shot, data-y), or a case study written as a page,
     whose links point at section ids (data-target) */
  var links = [].slice.call(nav.querySelectorAll('a[data-shot],a[data-target]'));
  var imgs = {};
  [].forEach.call(document.querySelectorAll('.full img[data-name]'), function (im) { imgs[im.getAttribute('data-name')] = im; });
  var toggle = nav.querySelector('.findex-toggle');
  var box = nav.querySelector('.findex-list');

  /* the wheel over the index moves the index, never the page: the site's smooth scroll leaves
     it alone (data-lenis-prevent), and at either end, or when the list is short enough not to
     scroll at all, the wheel simply stops there */
  nav.setAttribute('data-lenis-prevent', '');
  nav.addEventListener('wheel', function (e) {
    var max = box.scrollHeight - box.clientHeight;
    if (max <= 1 || (e.deltaY < 0 && box.scrollTop <= 0) || (e.deltaY > 0 && box.scrollTop >= max - 1)) e.preventDefault();
  }, { passive: false });
  /* a fade at the top or bottom edge while there is more of the list that way */
  function fades() {
    var max = box.scrollHeight - box.clientHeight;
    box.classList.toggle('more-up', box.scrollTop > 2);
    box.classList.toggle('more-down', max > 2 && box.scrollTop < max - 2);
  }
  box.addEventListener('scroll', fades, { passive: true });
  window.addEventListener('resize', fades);
  fades();
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* where a section starts on the page, measured fresh each time (images above may still be
     loading, but they carry their real width and height, so the layout is already final) */
  function top(a) {
    var id = a.getAttribute('data-target');
    if (id) {
      var el = document.getElementById(id);
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    }
    var im = imgs[a.getAttribute('data-shot')];
    if (!im) return 0;
    var r = im.getBoundingClientRect();
    return r.top + window.scrollY + r.height * parseFloat(a.getAttribute('data-y'));
  }
  var OFFSET = 96;   /* clear of the nav bar when it drops back in */

  function go(a) {
    var y = Math.max(0, top(a) - OFFSET);
    if (window.LENIS) window.LENIS.scrollTo(y, { duration: reduced ? 0 : 1.1, easing: function (x) { return 1 - Math.pow(1 - x, 4); } });
    else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', a.getAttribute('href'));
  }
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      go(a);
      setOpen(false);
      a.focus({ preventScroll: true });
    });
  });

  /* the section being read: the last one whose start has passed a line a third down the screen */
  var current = -1, raf = 0;
  function mark() {
    raf = 0;
    var line = window.scrollY + window.innerHeight / 3, at = -1;
    for (var i = 0; i < links.length; i++) { if (top(links[i]) <= line) at = i; else break; }
    if (at === current) return;
    current = at;
    links.forEach(function (a, i) {
      if (i === at) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if (toggle) toggle.textContent = at >= 0 ? links[at].textContent : 'Sections';
    /* keep the marked link in view inside the index when the list is taller than the screen */
    if (at >= 0 && box.scrollHeight > box.clientHeight && !nav.classList.contains('open')) {
      var a = links[at], ar = a.getBoundingClientRect(), br = box.getBoundingClientRect();
      if (ar.top < br.top + 56 || ar.bottom > br.bottom - 72) {
        box.scrollTo({ top: box.scrollTop + (ar.top - br.top) - br.height / 2, behavior: reduced ? 'auto' : 'smooth' });
      }
    }
  }
  function queue() { if (!raf) raf = requestAnimationFrame(mark); }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  mark();

  /* phones: the index is a button at the foot of the screen that opens the list */
  function setOpen(on) {
    nav.classList.toggle('open', on);
    if (toggle) toggle.setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  if (toggle) toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); } });
  document.addEventListener('click', function (e) { if (nav.classList.contains('open') && !nav.contains(e.target)) setOpen(false); });

  /* arriving with #sN in the address goes straight to that section */
  var m = location.hash.match(/^#s(\d+)$/), hit = m && links[+m[1] - 1];
  if (!hit && location.hash) hit = links.filter(function (a) { return a.getAttribute('href') === location.hash; })[0];
  if (hit) window.addEventListener('load', function () { window.scrollTo(0, Math.max(0, top(hit) - OFFSET)); });
})();
