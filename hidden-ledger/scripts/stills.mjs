#!/usr/bin/env node
// Render many review stills with a single bundle.
// Usage: node scripts/stills.mjs [--comp=Short] <props.json> <outDir> <scale> <t1> <t2> ...   (times in seconds, or f<frame>)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const comp = args[0]?.startsWith('--comp=') ? args.shift().slice(7) : 'Episode';
const [propsFile, outDir, scaleArg, ...times] = args;
if (!propsFile || !outDir || !times.length) {
  console.log('Usage: node scripts/stills.mjs [--comp=Short] <props.json> <outDir> <scale> <seconds...>');
  process.exit(1);
}
const inputProps = JSON.parse(fs.readFileSync(propsFile, 'utf8'));
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'main.ts'), publicDir: path.join(ROOT, 'assets')});
const composition = await selectComposition({serveUrl, id: comp, inputProps});
for (const t of times) {
  // "f1234" = exact frame number; otherwise seconds
  const frame = Math.min(composition.durationInFrames - 1, t.startsWith('f') ? Number(t.slice(1)) : Math.round(Number(t) * composition.fps));
  const output = path.join(outDir, t.startsWith('f') ? `f${String(frame).padStart(6, '0')}.jpg` : `t${String(Number(t).toFixed(1)).padStart(6, '0')}.jpg`);
  await renderStill({composition, serveUrl, output, frame, inputProps, imageFormat: 'jpeg', jpegQuality: 85, scale: Number(scaleArg) || 0.5, timeoutInMilliseconds: 120000});
  console.log(output);
}
