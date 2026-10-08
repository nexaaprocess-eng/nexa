// Renderiza fotogramas sueltos para revisar el diseño: node scripts/stills.mjs <outdir> 1.5 3.2 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [outDir, ...times] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {withAudio: false};
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const composition = await selectComposition({serveUrl, id: 'NexaPromo30', inputProps, browserExecutable});
for (const s of times) {
  const frame = Math.round(Number(s) * 30);
  await renderStill({composition, serveUrl, frame, output: path.join(outDir, `t${String(s).padStart(5, '0')}.png`), inputProps, browserExecutable, chromiumOptions: {gl: 'swangle'}});
  console.log('ok', s);
}
