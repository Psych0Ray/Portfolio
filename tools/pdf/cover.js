const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1024 }, deviceScaleFactor: 2 });
  await p.goto('file:///' + path.resolve('cover.html').split(path.sep).join('/'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: 'cover.png' });
  const ov = await p.evaluate(() => ({ sh: document.querySelector('.l').scrollHeight, ch: document.querySelector('.l').clientHeight }));
  console.log(ov);
  await b.close();
})();
