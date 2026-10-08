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
