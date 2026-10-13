// Renders each full case study as print pages: site chrome hidden, interactive parts expanded,
// cut at safe lines between blocks. Writes pages/<nn>-<slug>-<k>.jpg and pages.json.
const { chromium } = require('playwright');
const fs = require('fs');
const SLUGS = ['uls', 'iccc-surveillance', 'canva-ai', 'relique'];
const W = 1440, MAXH = 2000, MINH = 700, DPR = 2;

const PREP = `
const css = document.createElement('style');
css.textContent = \`
  .navwrap,.cursor,#cursor,.findex,.sec.end,footer.foot,.lb,.strip-nav,.vp-bar,.vp-big,.vp-chapters,.vp-ch,.t-slides-arrow,.jm-bar,.jm-pick,.jm-hint,.findex-toggle{display:none!important}
  html,body{cursor:auto!important}
  .fwrap{display:block!important;padding:0 120px!important}
  .fcs-body{max-width:1200px;margin:0 auto}
  [data-reveal]{opacity:1!important;transform:none!important}
  *{animation:none!important;transition:none!important}
  .strip{grid-auto-flow:row!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;overflow:visible!important}
  .jm{display:block!important;margin-bottom:40px}
  .jm[hidden]{display:block!important}
  .jm-scroll{overflow:visible!important;-webkit-mask-image:none!important;mask-image:none!important}
  .pdf-jm-h{margin:0 0 12px;font:600 18px/1.3 var(--d-head);color:var(--d-fg)}
  .pdf-slides{grid-column:1/-1;display:grid;gap:48px}
  .pdf-slides figure{margin:0}
  .pdf-slides img{display:block;width:100%;height:auto;border-radius:var(--d-sr,8px)}
  .pdf-slides figcaption{margin-top:14px;font-size:16px;line-height:1.5;color:var(--d-dim)}
  .pdf-slides figcaption b{color:var(--d-fg);margin-right:8px}
  .vp-screen{pointer-events:none}
  .cs-zoom figcaption,.cs-links:has(a[href^="canva-ai.html"]){display:none!important}
  .cs-zoom.cs-narrow a[href*="relique/home.webp"]{width:min(100%,500px)!important}
\`;
document.head.appendChild(css);
document.querySelectorAll('details').forEach(d => d.open = true);
document.querySelectorAll('img').forEach(i => { i.loading = 'eager'; });
// slideshows become a stack of screens, each with its caption
document.querySelectorAll('.t-slides').forEach(s => {
  const imgs = [...s.querySelectorAll('.t-slides-view > img')];
  const tabs = [...s.querySelectorAll('.t-slides-tabs button')];
  const out = document.createElement('div'); out.className = 'pdf-slides';
  imgs.forEach((im, k) => {
    const f = document.createElement('figure');
    const c = im.cloneNode(); c.className = ''; f.appendChild(c);
    if (tabs[k]) { const cap = document.createElement('figcaption');
      const b = tabs[k].querySelector('b'), sp = tabs[k].querySelector('span');
      cap.innerHTML = '<b>' + (b ? b.textContent : '') + '</b>' + (sp ? sp.textContent : ''); f.appendChild(cap); }
    out.appendChild(f);
  });
  s.replaceWith(out);
});
// every journey map shown, each under its actor's name, scaled to the column
document.querySelectorAll('[data-jm]').forEach(box => {
  const tabs = [...box.querySelectorAll('[role="tab"]')];
  box.querySelectorAll('.jm').forEach((p, k) => {
    p.hidden = false;
    const h = document.createElement('p'); h.className = 'pdf-jm-h'; h.textContent = (tabs[k] ? tabs[k].textContent.trim() : '') + ' journey';
    p.prepend(h);
  });
});
`;

const FIT = `
document.querySelectorAll('.jm-grid').forEach(g => {
  const avail = g.parentElement.clientWidth, w = g.scrollWidth;
  if (w > avail) g.style.zoom = (avail / w).toFixed(4);
});
`;

// candidate cuts: midpoints of vertical gaps between atomic blocks; section starts are preferred
const PLAN = `
const body = document.querySelector('.fcs-body');
const sel = 'img,video,svg,p,h1,h2,h3,h4,li,dt,dd,tr,figure,blockquote,.vp,.jm,.t-media,.cs-zoom,.sb-f,table';
const atoms = [...document.querySelectorAll('.t-cover,' + sel)].filter(e => e.offsetParent || e.tagName === 'svg')
  .map(e => { const r = e.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; })
  .filter(([a, b]) => b - a > 2);
// keep-with-next: a heading or intro text stays on the page with what it introduces
const top = e => e.getBoundingClientRect().top + scrollY, bot = e => e.getBoundingClientRect().bottom + scrollY;
const LIM = ${MAXH} - 160;
document.querySelectorAll('.t-feat').forEach(f => { if (bot(f) - top(f) < LIM) atoms.push([top(f), bot(f)]); });
document.querySelectorAll('.t-text, .cs-sub, h2, h3, .t-lead').forEach(t => {
  let n = t.nextElementSibling;
  if (!n && t.parentElement.classList.contains('t-feat')) n = null;
  if (!n) return;
  const a = top(t), b = Math.min(bot(n), top(n) + 420);
  if (b - a < LIM) atoms.push([a, b]);
});
atoms.sort((x, y) => x[0] - y[0]);
const H = document.querySelector('.fwrap').getBoundingClientRect().bottom + scrollY + 120;
const cover = document.querySelector('.t-cover').getBoundingClientRect().bottom + scrollY;
// merge overlapping atoms into covered spans
const spans = [];
for (const [a, b] of atoms) { const l = spans[spans.length - 1]; if (l && a <= l[1] + 1) l[1] = Math.max(l[1], b); else spans.push([a, b]); }
const gaps = [];
for (let k = 0; k + 1 < spans.length; k++) gaps.push([spans[k][1], spans[k + 1][0]]);
const secs = [...body.querySelectorAll(':scope > section')].map(s => s.getBoundingClientRect().top + scrollY);
return { H, cover, gaps, secs };
`;

function plan({ H, cover, gaps, secs }) {
  const cuts = [0, Math.round(cover)];
  let y0 = cover;
  const cut = g => Math.round((g[0] + g[1]) / 2);
  while (H - y0 > MAXH) {
    const win = gaps.filter(g => cut(g) > y0 + MINH && cut(g) <= y0 + MAXH && g[1] - g[0] >= 16);
    // prefer the last section start in the lower half of the window
    const sec = win.filter(g => secs.some(s => Math.abs(s - g[1]) < 140) && cut(g) > y0 + MAXH * 0.5);
    let c;
    if (sec.length) c = cut(sec[sec.length - 1]);
    else if (win.length) { win.sort((a, b) => cut(b) - cut(a)); c = cut(win[0]); }
    else c = Math.round(y0 + MAXH);
    cuts.push(c); y0 = c;
  }
  cuts.push(Math.round(H));
  return cuts;
}

(async () => {
  fs.mkdirSync('pages', { recursive: true });
  const b = await chromium.launch();
  const out = [];
  let n = 0;
  for (const slug of SLUGS) {
    const p = await b.newPage({ viewport: { width: W, height: 1000 }, deviceScaleFactor: DPR });
    await p.goto(`http://localhost:8080/work/${slug}-full.html`, { waitUntil: 'networkidle' });
    await p.evaluate(PREP);
    await p.waitForTimeout(500);
    await p.evaluate(FIT);
    const H0 = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H0; y += 800) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(40); }
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(400);
    const info = await p.evaluate(`(() => { ${PLAN} })()`);
    const cuts = plan(info);
    const bg = await p.evaluate(() => getComputedStyle(document.querySelector('.deck')).backgroundColor);
    for (let k = 0; k + 1 < cuts.length; k++) {
      const y = cuts[k], h = cuts[k + 1] - y;
      n++;
      const file = `pages/${String(n).padStart(2, '0')}-${slug}-${k + 1}.jpg`;
      await p.screenshot({ path: file, type: 'jpeg', quality: 86, fullPage: true, clip: { x: 0, y, width: W, height: h } });
      out.push({ n, slug, k: k + 1, file, h, bg });
    }
    console.log(slug, cuts.length - 1, 'pages', cuts.slice(1).map((c, i) => c - cuts[i]).join(','));
    await p.close();
  }
  fs.writeFileSync('pages.json', JSON.stringify(out, null, 1));
  await b.close();
})();
