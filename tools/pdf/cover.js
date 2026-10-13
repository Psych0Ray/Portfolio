const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1024 }, deviceScaleFactor: 2 });
  await p.goto('file:///' + path.resolve('cover.html').split(path.sep).join('/'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: 'cover.png', fullPage: true });
  const ov = await p.evaluate(() => document.documentElement.scrollHeight);
  console.log(ov);
  await b.close();
})();
