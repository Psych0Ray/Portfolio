/* ══ Home work-card thumbnails · inactive → active on hover ════════
   Built from the Figma section "Thumbnails" (2330:3758). Every layer was exported at 2x
   to img/thumbs/. Positions below are in the Figma frame's own units (1192 x 708), so the
   layouts match the designs exactly; the markup turns them into percentages and the
   motion into container units (cqw), which keeps everything in proportion at any card size.

   ULS and Relique: the pieces start stacked in the middle and fly out to their places.
   Canva AI: the gradient washes in, the orb and sparkles pop, the cursor glides to the orb.
   ICCC: a field of device dots ripples out from behind the title (canvas, drawn in JS).
   On touch screens a card turns active while it sits in the middle of the viewport.   */
var THUMBS = (function () {
  var FW = 1192, FH = 708, CX = FW / 2, CY = FH / 2;

  /* [file, x, y, w, h, extra spin in deg as it flies out, delay s, parallax depth] */
  var DATA = {
    'uls': { bg: '#FFD504', logo: ['uls-logo', 329, 242, 534, 224], pieces: [
      ['uls-b', 80, 35, 294.5, 259, -40, 0.00, 1.4],
      ['uls-a', 853, 56, 292.5, 238, 35, 0.05, 1.2],
      ['uls-d', 102, 447, 307.5, 221, 30, 0.10, 1.6],
      ['uls-c', 815.6, 479.6, 376.5, 224, -30, 0.15, 1.8],
      ['uls-f', 550, 122, 114, 63.5, 60, 0.22, 0.7],
      ['uls-e', 569, 529, 85, 56.5, -60, 0.26, 0.7]
    ] },
    /* Relique is re-arranged: three artifacts over the name, three under it, each sized so
       the composition balances around the wordmark instead of crowding one corner. */
    'relique': { bg: '#100800', logo: ['rel-logo', 317, 301, 557.5, 117.5], pieces: [
      ['rel-a', 34, 26, 286, 271.5, -30, 0.00, 1.6],     /* bracelets, top left */
      ['rel-e', 520, 58, 142, 168, 20, 0.08, 0.9],       /* relief panel, top middle */
      ['rel-b', 866, 28, 250, 250, 35, 0.04, 1.3],       /* claw ornament, top right */
      ['rel-c', 150, 470, 176, 178, -25, 0.12, 1.1],     /* coin, bottom left */
      ['rel-f', 488, 452, 224, 224, 40, 0.16, 1.0],      /* dagger, bottom middle */
      ['rel-d', 882, 424, 262, 265, -20, 0.10, 1.7]      /* head, bottom right */
    ] },
    'canva-ai': { bg: '#FFFFFF', logo: ['canva-logo', 296, 249, 600, 211] },
    'iccc-surveillance': { bg: '#FFFFFF', logo: ['iccc-logo', 152.8, 306.9, 889, 93] }
  };

  function pct(v, of) { return (v / of * 100).toFixed(3) + '%'; }
  function cq(v) { return (v / FW * 100).toFixed(3) + 'cqw'; }
  function cqh(v) { return (v / FH * 100).toFixed(3) + 'cqh'; }
  /* anchored by the piece's centre: identical to the Figma layout at 1192:708, and when the
     frame is taller (the phone reel cards) the pieces spread out instead of being cropped */
  function box(x, y, w, h) {
    return 'left:' + pct(x, FW) + ';top:' + pct(y + h / 2, FH) + ';margin-top:-' + (h / FW * 50).toFixed(3) + 'cqw;width:' + pct(w, FW) + ';';
  }
  function img(file, alt) {
    return '<img src="img/thumbs/' + file + '.webp" alt="' + (alt || '') + '" draggable="false" decoding="async" loading="lazy">';
  }
  function piece(p) {
    var cx = p[1] + p[3] / 2, cy = p[2] + p[4] / 2;
    return '<span class="el pop" style="' + box(p[1], p[2], p[3], p[4])
      + '--tx:' + cq(CX - cx) + ';--ty:' + cqh(CY - cy) + ';--spin:' + p[5] + 'deg;--dl:' + p[6] + 's;--z:' + p[7] + '">'
      + '<i>' + img(p[0]) + '</i></span>';
  }

  function html(slug, name) {
    var d = DATA[slug]; if (!d) return '<div class="wc-thumb slot"></div>';
    var out = '<div class="wc-thumb th th-' + slug + '" style="--thbg:' + d.bg + '">';
    if (slug === 'canva-ai') {
      out += '<span class="el wash"><i>' + img('canva-bg') + '</i></span>';
    }
    if (slug === 'iccc-surveillance') out += '<canvas class="dots" aria-hidden="true"></canvas>';
    if (d.pieces) out += d.pieces.map(piece).join('');
    var L = d.logo;
    out += '<span class="el logo" style="' + box(L[1], L[2], L[3], L[4]) + '--z:.4"><i>' + img(L[0], name) + '</i></span>';
    if (slug === 'canva-ai') {
      out += '<span class="el orb" style="' + box(871.7, 0, 293.5, 284.5) + '--z:1.6"><i>' + img('canva-orb') + '</i></span>'
        + '<span class="el cur" style="' + box(1039.9, 165.8, 90, 100.5) + '--z:2"><i>' + img('canva-cursor') + '</i></span>'
        + '<span class="el spark" style="' + box(107, 442, 205, 205) + '--z:1.3"><i>' + img('canva-spark') + '</i></span>';
    }
    return out + '</div>';
  }

  /* ── ICCC device field ─────────────────────────────────────────── */
  function dotField(th) {
    var cv = th.querySelector('canvas.dots'); if (!cv) return null;
    var ctx = cv.getContext('2d'), dpr = 1, W = 0, H = 0, dots = [], rings = [];
    var p = 0, target = 0, raf = 0, t0 = performance.now(), mx = -1e4, my = -1e4;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function rnd(i) { var s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s); }
    function layout() {
      var r = th.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      dots = []; rings = [];
      var cols = Math.max(26, Math.min(52, Math.round(W / 12))), gap = W / cols, rows = Math.ceil(H / gap) + 1, i = 0;
      var ox = (W - (cols - 1) * gap) / 2, oy = (H - (rows - 1) * gap) / 2;
      var maxD = Math.hypot(W / 2, H / 2);
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++, i++) {
        var px = ox + x * gap, py = oy + y * gap, acc = rnd(i + 1) < 0.045;
        dots.push({ x: px, y: py, d: Math.hypot(px - W / 2, py - H / 2) / maxD, acc: acc, ph: rnd(i + 7) * 6.28 });
        if (acc && rnd(i + 3) < 0.35 && dots[dots.length - 1].d < 0.7 && rings.length < 3) rings.push(dots[dots.length - 1]);
      }
      if (!rings.length) rings.push(dots[Math.floor(dots.length / 3)]);
      draw(performance.now());
    }
    function draw(now) {
      var t = (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      if (p <= 0.001) return;
      var R = W * 0.0026 + 0.45, front = p * 1.25;
      for (var i = 0; i < dots.length; i++) {
        var o = dots[i], a = Math.max(0, Math.min(1, (front - o.d) / 0.18));
        if (a <= 0) continue;
        var near = Math.max(0, 1 - Math.hypot(o.x - mx, o.y - my) / (W * 0.13)); near *= near;
        var r = R * (1 + near * 0.9), col;
        if (o.acc) {
          var tw = 0.55 + 0.45 * Math.sin(t * 2.2 + o.ph);
          col = 'rgba(88,59,192,' + (a * (0.25 + 0.6 * tw)).toFixed(3) + ')'; r *= 1.3;
        } else if (near > 0) {
          col = 'rgba(' + Math.round(28 + 60 * near) + ',' + Math.round(26 + 33 * near) + ',' + Math.round(46 + 146 * near) + ',' + (a * (0.13 + 0.45 * near)).toFixed(3) + ')';
        } else col = 'rgba(28,26,46,' + (a * 0.13).toFixed(3) + ')';
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, 6.2832); ctx.fill();
      }
      ctx.lineWidth = Math.max(1, W * 0.0018);
      for (var k = 0; k < rings.length; k++) {
        var g = rings[k], ra = Math.max(0, Math.min(1, (front - g.d) / 0.18));
        if (ra <= 0) continue;
        var ph = ((t * 0.55 + k * 0.37) % 1);
        ctx.strokeStyle = 'rgba(88,59,192,' + (ra * (1 - ph) * 0.8).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(g.x, g.y, R * 2 + ph * W * 0.035, 0, 6.2832); ctx.stroke();
        ctx.strokeStyle = 'rgba(88,59,192,' + (ra * 0.9).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(g.x, g.y, R * 3.2, 0, 6.2832); ctx.stroke();
      }
    }
    function loop(now) {
      var k = target ? 0.045 : 0.08;
      p += (target - p) * (reduced ? 1 : k);
      if (Math.abs(target - p) < 0.002) p = target;
      draw(now);
      raf = (p > 0.001 || target) ? requestAnimationFrame(loop) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    layout();
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(th);
    return {
      set: function (on) { target = on ? 1 : 0; kick(); },
      point: function (x, y) { mx = x; my = y; kick(); }
    };
  }

  /* ── behaviour ─────────────────────────────────────────────────── */
  function wire(root) {
    var hover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    var cards = [].slice.call(root.querySelectorAll('.wc'));
    cards.forEach(function (card) {
      var th = card.querySelector('.th'); if (!th) return;
      var field = dotField(th);
      function set(on) { th.classList.toggle('on', on); if (field) field.set(on); }
      card._thSet = set;
      if (hover) {
        card.addEventListener('pointerenter', function () { set(true); });
        card.addEventListener('pointerleave', function () {
          set(false); th.style.setProperty('--px', 0); th.style.setProperty('--py', 0);
          if (field) field.point(-1e4, -1e4);
        });
        card.addEventListener('pointermove', function (e) {
          var r = th.getBoundingClientRect();
          th.style.setProperty('--px', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
          th.style.setProperty('--py', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
          if (field) field.point(e.clientX - r.left, e.clientY - r.top);
        });
      }
      card.addEventListener('focus', function () { set(true); });
      card.addEventListener('blur', function () { set(false); });
    });
    /* touch: the card in the middle band of the screen is the active one */
    if (!hover && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.target._thSet) e.target._thSet(e.isIntersecting); });
      }, { rootMargin: '-38% 0px -38% 0px' });
      cards.forEach(function (c) { io.observe(c); });
    }
  }

  return { html: html, wire: wire };
})();
