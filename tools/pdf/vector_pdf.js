// Prints the cover and the four full case studies as real PDF pages: text stays text (selectable,
// sharp at any zoom), links stay links, only photos and screens are pictures. Each becomes one
// long PDF page in parts/<name>.pdf, with its link rectangles in parts/<name>.json; long_pdf.py
// stacks them into one scrolling page.
// Run from tools/pdf with the site served on :8080 (py tools/serve.py 8080) and NODE_PATH set to
// the npx playwright cache.
const { chromium } = require('playwright');
const fs = require('fs');
const { PREP, FIT } = require('./prep.js');

const SITE = 'https://rutujeetfolio.vercel.app';
const LOCAL = 'http://localhost:8080';
const S = 0.4;
// SELF=1: a self-contained copy (for reviewers who only read the PDF): pictures are not links,
// films are still frames, no "try it on the site". Contact, contents and research links stay.
const SELF = process.env.SELF === '1';
const DIR = SELF ? 'parts-self' : 'parts';   // print scale: keeps each part under the 200-inch PDF page limit
const PARTS = [
  { name: 'cover', url: `${LOCAL}/tools/pdf/cover.html` },
  { name: 'uls', url: `${LOCAL}/work/uls-full.html` },
  { name: 'iccc-surveillance', url: `${LOCAL}/work/iccc-surveillance-full.html` },
  { name: 'canva-ai', url: `${LOCAL}/work/canva-ai-full.html` },
  { name: 'relique', url: `${LOCAL}/work/relique-full.html` },
];

// links: every relative or local link points at the live site; each film links to its page
const LINKS = (slug) => `
document.querySelectorAll('a[href]').forEach(a => {
  const h = a.getAttribute('href');
  if (/^(https?:|mailto:)/.test(h) && !h.startsWith('${LOCAL}')) return;
  const u = new URL(h, location.href);
  a.href = '${SITE}' + u.pathname.replace(/^\\/tools\\/pdf\\/.*$/, '/') + u.search + u.hash;
});
document.querySelectorAll('figure.vp').forEach(v => {
  const a = document.createElement('a');
  a.href = '${SITE}/work/${slug}-full.html#film';
  a.className = 'pdf-film';
  v.parentNode.insertBefore(a, v); a.appendChild(v);
  const cap = document.createElement('p'); cap.className = 'pdf-film-cap';
  cap.innerHTML = 'Watch the film on <u>rutujeetfolio.vercel.app</u>';
  a.appendChild(cap);
});
const st = document.createElement('style');
st.textContent =
  // the grain overlay blends over the whole page, which makes Chromium flatten it into one bitmap
  '.grain{display:none!important}' +
  // print sizes the viewport to the paper, so anything measured in svh is pinned to a 1000px screen
  '.t-media.screen > img{max-height:810px!important}.vp{width:100%!important}' +
  // gradient-clipped text leaves hairlines along its box in PDF viewers: print it in one colour
  '.p-canva-ai .t-h{background:none!important;-webkit-text-fill-color:#4f63dc!important;color:#4f63dc!important}' +
  '.cv-cap .l{background:none!important;-webkit-text-fill-color:#6a4fe0!important;color:#6a4fe0!important}' +
  '.pdf-film{display:block;color:inherit;text-decoration:none}.pdf-film .vp-big{display:grid!important}' +
  '.pdf-film-cap{margin-top:14px;font-size:16px;color:var(--d-dim)}.pdf-film-cap u{color:var(--d-fg)}';
document.head.appendChild(st);
`;

// self-contained: the same link rewriting minus everything that leaves the PDF by accident
const SELF_CONTAINED = `
// keep each picture exactly as laid out (some sizes are keyed on the href), then unlink it
document.querySelectorAll('.cs-zoom a[href], a.cs-zoom[href], .cs-phones a[href]').forEach(a => {
  a.style.width = getComputedStyle(a).width; a.style.display = getComputedStyle(a).display;
});
document.querySelectorAll('.cs-zoom a[href], a.cs-zoom[href], .cs-phones a[href]').forEach(a => a.removeAttribute('href'));
document.querySelectorAll('.cs-links').forEach(p => { if (p.querySelector('a[href^="canva-ai.html"]')) p.remove(); });
document.querySelectorAll('a[href]').forEach(a => {
  const h = a.getAttribute('href');
  if (/^(https?:|mailto:)/.test(h) && !h.startsWith('${LOCAL}')) return;
  a.removeAttribute('href');          // anything else pointed back into the site
});
const st = document.createElement('style');
st.textContent = '.grain{display:none!important}' +
  '.t-media.screen > img{max-height:810px!important}.vp{width:100%!important}' +
  '.p-canva-ai .t-h{background:none!important;-webkit-text-fill-color:#4f63dc!important;color:#4f63dc!important}' +
  '.cv-cap .l{background:none!important;-webkit-text-fill-color:#6a4fe0!important;color:#6a4fe0!important}' +
  '.vp-big{display:none!important}';      // films show as a plain still frame
document.head.appendChild(st);
`;

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const b = await chromium.launch();
  for (const part of PARTS) {
    const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
    await p.emulateMedia({ media: 'screen' });
    await p.goto(part.url, { waitUntil: 'networkidle' });
    if (part.name !== 'cover') {
      await p.evaluate(PREP);
      await p.waitForTimeout(400);
      await p.evaluate(FIT);
    }
    await p.evaluate(SELF ? SELF_CONTAINED : LINKS(part.name));
    // load every image before printing
    const H0 = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H0; y += 900) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(30); }
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(() => window.scrollTo(0, 0));
    const info = await p.evaluate(() => {
      const H = document.documentElement.scrollHeight;
      const go = [...document.querySelectorAll('[data-go]')].map(e => {
        const r = e.getBoundingClientRect();
        return { to: e.dataset.go, x: r.left, y: r.top + scrollY, w: r.width, h: r.height };
      });
      return { H, go };
    });
    await p.pdf({ path: `${DIR}/${part.name}.pdf`, width: `${Math.ceil(1440 * S)}px`, height: `${Math.ceil(info.H * S * 1.15)}px`,
                  scale: S, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    fs.writeFileSync(`${DIR}/${part.name}.json`, JSON.stringify({ H: info.H, go: info.go, scale: S }));
    console.log(part.name, info.H, fs.statSync(`${DIR}/${part.name}.pdf`).size >> 10, 'KB');
    await p.close();
  }
  await b.close();
})();
