const { chromium } = require('playwright-core');
// uso: node frames.js <html> <outdir> <fps> [t1,t2,...]
(async () => {
  const [,, html, out, fpsArg, list] = process.argv;
  const fs = require('fs'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto('file://' + html); await p.evaluate(() => window.ready);
  const total = await p.evaluate(() => window.TOTAL);
  const fps = +fpsArg;
  const times = list ? list.split(',').map(Number) : Array.from({ length: Math.ceil(total * fps) }, (_, i) => i / fps);
  let i = 0;
  for (const t of times) {
    await p.evaluate(s => window.seek(s), t);
    await p.screenshot({ path: `${out}/f${String(i).padStart(5, '0')}.${list ? 'png' : 'jpg'}`, type: list ? 'png' : 'jpeg', quality: list ? undefined : 92 });
    i++; if (!list && i % 300 === 0) console.log('frames', i, '/', times.length);
  }
  await b.close();
})();
