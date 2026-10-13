// Shared by tools/pdf_capture.js and tools/pdf/vector_pdf.js: turns a full case study into
// a printable page (site chrome hidden, interactive parts expanded).
const PREP = `
const css = document.createElement('style');
css.textContent = \`
  .navwrap,.cursor,#cursor,.findex,.sec.end,footer.foot,.lb,.strip-nav,.vp-bar,.vp-big,.vp-chapters,.vp-ch,.t-slides-arrow,.jm-bar,.jm-pick,.jm-hint,.findex-toggle{display:none!important}
  html,body{cursor:auto!important}
  html{scrollbar-gutter:auto!important;scrollbar-width:none!important}
  ::-webkit-scrollbar{display:none!important;width:0!important}
  .fwrap{display:block!important;padding:0 120px 140px!important}
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

module.exports = { PREP, FIT };
