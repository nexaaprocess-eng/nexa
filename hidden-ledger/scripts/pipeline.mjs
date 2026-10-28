#!/usr/bin/env node
// Hidden Ledger pipeline orchestrator (Windows PowerShell / macOS / Linux).
// Usage: node scripts/pipeline.mjs <command> [--episode 001] [--quality preview|hd] [--no-subs] [--concurrency N]
//        episode options: [--name full_video_v2] [--bitrate 8M]
// Commands: setup | doctor | voices | narration | pilot | episode | shorts | thumbnails | verify | final (= audio | render | encode | qa)
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IS_WIN = process.platform === 'win32';
const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : dflt;
};
const flag = (name) => args.includes(`--${name}`);
const EP = opt('episode', '001');
const OUT = path.join(ROOT, 'output', `episode-${EP}`);
const AUDIO = path.join(OUT, 'audio');
const DIAG = path.join(ROOT, 'diagnostics');
const PY = IS_WIN ? path.join(ROOT, '.venv', 'Scripts', 'python.exe') : path.join(ROOT, '.venv', 'bin', 'python');
const NPX = IS_WIN ? 'npx.cmd' : 'npx';
const episode = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', `episode-${EP}`, 'episode.json'), 'utf8'));
const defaultConcurrency = () => Math.max(1, Math.min(4, Math.floor(os.cpus().length / 2) || 1));

function run(bin, argv, {allowFail = false, quiet = false} = {}) {
  if (!quiet) console.log(`\n$ ${path.basename(bin)} ${argv.join(' ')}`);
  const r = spawnSync(bin, argv, {cwd: ROOT, stdio: quiet ? 'pipe' : 'inherit', encoding: 'utf8', shell: IS_WIN && bin.endsWith('.cmd')});
  if (r.status !== 0 && !allowFail) {
    console.error(`\n✖ command failed (${r.status}): ${bin} ${argv.join(' ')}`);
    if (quiet) console.error(r.stdout, r.stderr);
    process.exit(r.status ?? 1);
  }
  return r;
}
const py = (script, argv, o) => run(PY, [path.join('python', script), ...argv], o);
const ffprobeJson = (file) =>
  JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size,bit_rate:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels,nb_frames', '-of', 'json', file], {quiet: true}).stdout);

// ------------------------------------------------------------------ steps
function narration() {
  py('generate_voice.py', ['narration', '--episode', EP]);
}

function timeline(name, scenes, until) {
  const a = ['--episode', EP, '--name', name];
  if (scenes) a.push('--scenes', scenes.join(','));
  if (until) a.push('--until', until);
  py('build_timeline.py', a);
  py('mix.py', ['--episode', EP, '--name', name]);
  const tl = JSON.parse(fs.readFileSync(path.join(AUDIO, name, 'timeline.json'), 'utf8'));
  const props = path.join(AUDIO, name, 'props.json');
  fs.writeFileSync(props, JSON.stringify({timeline: tl, subtitles: !flag('no-subs')}));
  return {tl, props};
}

function renderVideo(name, props, destDir, {quality = opt('quality', 'preview'), composition = 'Episode', extraProps, crf = 20} = {}) {
  fs.mkdirSync(destDir, {recursive: true});
  const scale = quality === 'hd' ? '1' : '0.6666666667';
  const silent = path.join(destDir, `${name}_video.mp4`);
  const conc = opt('concurrency', String(defaultConcurrency()));
  let propsFile = props;
  if (extraProps) {
    propsFile = path.join(path.dirname(props), `${name}_props.json`);
    fs.writeFileSync(propsFile, JSON.stringify({...JSON.parse(fs.readFileSync(props, 'utf8')), ...extraProps}));
  }
  run(NPX, ['remotion', 'render', composition, silent, `--props=${propsFile}`, `--scale=${scale}`, `--concurrency=${conc}`,
    '--muted', '--codec=h264', `--crf=${crf}`, '--timeout=120000', '--log=error']);
  return silent;
}

// YouTube delivery encode: two-pass H.264 High@4.2 at a target bitrate (default 8 Mbps), closed GOP of
// half the frame rate, yuv420p, faststart; AAC-LC 384 kbps / 48 kHz encoded once from the lossless mix.
function encodeForYouTube(silentVideo, mixWav, dest, bitrate = '8M') {
  const kbps = parseInt(bitrate, 10) * (bitrate.toUpperCase().endsWith('M') ? 1000 : 1);
  const v = ['-c:v', 'libx264', '-preset', 'slow', '-b:v', `${kbps}k`, '-maxrate', `${Math.round(kbps * 1.25)}k`, '-bufsize', `${kbps * 2}k`,
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2', '-r', '30', '-g', '15', '-keyint_min', '15', '-sc_threshold', '0', '-bf', '2',
    '-flags', '+cgop', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709'];
  const log = path.join(path.dirname(dest), 'x264_2pass');
  // pad the audio to exactly the video length so no frame is trimmed (v1 lost 4 frames to -shortest)
  const dur = ffprobeJson(silentVideo).format.duration;
  const nul = IS_WIN ? 'NUL' : '/dev/null';
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', silentVideo, ...v, '-pass', '1', '-passlogfile', log, '-an', '-f', 'mp4', nul]);
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', silentVideo, '-i', mixWav, '-map', '0:v:0', '-map', '1:a:0', ...v,
    '-pass', '2', '-passlogfile', log, '-af', `apad=whole_dur=${dur}`, '-c:a', 'aac', '-b:a', '384k', '-ar', '48000', '-ac', '2', '-t', String(dur), '-movflags', '+faststart', dest]);
  for (const f of fs.readdirSync(path.dirname(dest))) if (f.startsWith('x264_2pass')) fs.rmSync(path.join(path.dirname(dest), f));
}

function mux(silent, mixWav, dest, {from, to} = {}) {
  const a = ['-hide_banner', '-loglevel', 'error', '-y', '-i', silent];
  if (from !== undefined) a.push('-ss', String(from), '-to', String(to));
  a.push('-i', mixWav, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-shortest', '-movflags', '+faststart', dest);
  run('ffmpeg', a);
  fs.rmSync(silent);
}

function screenshots(video, prefix, times) {
  const dir = path.join(DIAG, 'screenshots');
  fs.mkdirSync(dir, {recursive: true});
  const out = [];
  for (const t of times) {
    const f = path.join(dir, `${prefix}_${t.toFixed(1).padStart(6, '0')}s.jpg`);
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(t), '-i', video, '-frames:v', '1', '-q:v', '3', f], {quiet: true});
    out.push(path.relative(ROOT, f));
  }
  return out;
}

function validateVideo(file, {minDur, maxDur}) {
  const p = ffprobeJson(file);
  const v = p.streams.find((s) => s.codec_type === 'video');
  const a = p.streams.find((s) => s.codec_type === 'audio');
  const dur = Number(p.format.duration);
  const problems = [];
  if (!v) problems.push('no video stream');
  if (!a) problems.push('no audio stream');
  if (v && v.codec_name !== 'h264') problems.push(`video codec ${v.codec_name}`);
  if (a && a.codec_name !== 'aac') problems.push(`audio codec ${a.codec_name}`);
  if (minDur && dur < minDur) problems.push(`duration ${dur}s < ${minDur}s`);
  if (maxDur && dur > maxDur) problems.push(`duration ${dur}s > ${maxDur}s`);
  // black / silent checks
  const blk = run('ffmpeg', ['-hide_banner', '-i', file, '-vf', 'blackdetect=d=2:pix_th=0.10', '-an', '-f', 'null', '-'], {quiet: true, allowFail: true}).stderr;
  const blacks = (blk.match(/black_start/g) || []).length;
  if (blacks) problems.push(`${blacks} black section(s) >= 2s`);
  const sil = run('ffmpeg', ['-hide_banner', '-i', file, '-af', 'silencedetect=n=-45dB:d=4', '-vn', '-f', 'null', '-'], {quiet: true, allowFail: true}).stderr;
  const silences = (sil.match(/silence_start/g) || []).length;
  if (silences) problems.push(`${silences} silence(s) >= 4s`);
  const loud = run('ffmpeg', ['-hide_banner', '-i', file, '-af', 'ebur128=peak=true', '-vn', '-f', 'null', '-'], {quiet: true, allowFail: true}).stderr;
  const summary = loud.slice(loud.lastIndexOf('Summary:'));
  const I = Number((summary.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]);
  const TP = Number((summary.match(/Peak:\s+(-?[\d.]+) dBFS/) || [])[1]);
  return {
    file: path.relative(ROOT, file),
    duration: dur,
    size_mb: +(Number(p.format.size) / 1e6).toFixed(1),
    video: v && {codec: v.codec_name, width: v.width, height: v.height, fps: v.r_frame_rate, frames: Number(v.nb_frames)},
    audio: a && {codec: a.codec_name, sample_rate: Number(a.sample_rate), channels: a.channels},
    integrated_lufs: I,
    true_peak_dbfs: TP,
    black_sections: blacks,
    long_silences: silences,
    ok: problems.length === 0,
    problems,
  };
}

function writeReport(name, data) {
  fs.mkdirSync(DIAG, {recursive: true});
  fs.writeFileSync(path.join(DIAG, `${name}.json`), JSON.stringify(data, null, 2) + '\n');
}


// ------------------------------------------------------------------ final-render helpers
function loadFull() {
  const tlPath = path.join(AUDIO, 'full', 'timeline.json');
  if (!fs.existsSync(tlPath)) commands.audio();
  const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
  const props = path.join(AUDIO, 'full', 'props.json');
  return {tl, props};
}

function frameCount(f) {
  if (!fs.existsSync(f)) return -1;
  const r = run('ffprobe', ['-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', f], {quiet: true, allowFail: true});
  return parseInt(String(r.stdout).trim(), 10);
}

function hashFiles(h, files) {
  for (const f of files.sort()) {
    h.update(path.relative(ROOT, f));
    h.update(fs.readFileSync(f));
  }
}

function listFiles(dir, re = /\.(tsx?|json|woff2)$/) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? listFiles(p, re) : re.test(d.name) ? [p] : [];
  });
}

/** One chunk per scene; hash = shared code + this scene's source files + its props slice + render settings. */
function renderPlan(tl, crf) {
  const shared = [
    ...listFiles(path.join(ROOT, 'src', 'components')),
    ...listFiles(path.join(ROOT, 'src', 'themes')),
    ...listFiles(path.join(ROOT, 'src', 'compositions')),
    path.join(ROOT, 'src', 'main.ts'),
    path.join(ROOT, 'src', 'scenes', 'index.ts'),
    path.join(ROOT, 'src', 'scenes', 'GenericScene.tsx'),
    ...listFiles(path.join(ROOT, 'assets', 'fonts')),
  ];
  // Episode scene files live in src/scenes/epXXX/SNN*.tsx (episode 001 predates that and keeps them in src/scenes/).
  const epDir = fs.existsSync(path.join(ROOT, 'src', 'scenes', `ep${EP}`)) ? path.join(ROOT, 'src', 'scenes', `ep${EP}`) : path.join(ROOT, 'src', 'scenes');
  const isScene = (f) => /^S\d\d/.test(path.basename(f));
  const epShared = listFiles(epDir).filter((f) => !isScene(f) && !shared.includes(f));
  // thumbnails are stills, not part of the episode render
  const sharedHash = crypto.createHash('sha256');
  hashFiles(sharedHash, [...shared, ...epShared].filter((f) => !/Thumbnail/.test(path.basename(f))));
  const boundaries = tl.scenes.map((s) => [s.id, s.start, s.end, s.chapter]);
  const fps = tl.fps;
  const filesOf = (id) => (id ? listFiles(epDir).filter((f) => isScene(f) && path.basename(f).startsWith(`S${id.slice(1)}`)) : []);
  return tl.scenes.map((sc, i) => {
    const from = i === 0 ? 0 : Math.round(sc.start * fps);
    const to = i === tl.scenes.length - 1 ? tl.durationInFrames - 1 : Math.round(tl.scenes[i + 1].start * fps) - 1;
    // the next scene's file too: the wipe into it starts a few frames before its start, inside this chunk
    const sceneFiles = [...filesOf(sc.id), ...filesOf(tl.scenes[i + 1]?.id)];
    const h = crypto.createHash('sha256');
    h.update(sharedHash.copy().digest('hex'));
    hashFiles(h, sceneFiles);
    const t0 = from / fps;
    const t1 = (to + 1) / fps;
    h.update(JSON.stringify({sc, boundaries, total: tl.durationInFrames, fps, crf, from, to,
      subs: tl.subtitles.filter((c) => c.end > t0 && c.start < t1)}));
    const hash = h.digest('hex').slice(0, 12);
    return {scene: sc.id, from, to, frames: to - from + 1, hash, file: `${sc.id}_${hash}.mp4`};
  });
}

function twoPass(files, mixWav, out, kbps, dur) {
  const inputs = files.flatMap((f) => ['-i', f]);
  const fc = files.map((_, i) => `[${i}:v]`).join('') + `concat=n=${files.length}:v=1:a=0[v]`;
  const v = ['-c:v', 'libx264', '-preset', 'slow', '-b:v', `${kbps}k`, '-maxrate', `${Math.round(kbps * 1.25)}k`, '-bufsize', `${kbps * 2}k`,
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2', '-r', '30', '-g', '15', '-keyint_min', '15', '-sc_threshold', '0', '-bf', '2',
    '-flags', '+cgop', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709'];
  const log = out.replace(/\.mp4$/, '_x264');
  const tmp = out.replace(/\.mp4$/, '.partial.mp4');
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-filter_complex', fc, '-map', '[v]', ...v, '-pass', '1', '-passlogfile', log, '-an', '-f', 'mp4', IS_WIN ? 'NUL' : '/dev/null']);
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-i', mixWav,
    '-filter_complex', `${fc};[${files.length}:a]apad=whole_dur=${dur}[a]`, '-map', '[v]', '-map', '[a]', ...v, '-pass', '2', '-passlogfile', log,
    '-c:a', 'aac', '-b:a', opt('audio-bitrate', '256k'), '-ar', '48000', '-ac', '2', '-t', dur, '-movflags', '+faststart', '-f', 'mp4', tmp]);
  fs.renameSync(tmp, out);
  for (const f of fs.readdirSync(path.dirname(out))) if (f.startsWith(path.basename(log))) fs.rmSync(path.join(path.dirname(out), f));
  console.log(`✔ ${path.relative(ROOT, out)} (${kbps} kbps video)`);
}

// ------------------------------------------------------------------ commands
const commands = {
  setup() {
    if (!fs.existsSync(PY)) run(IS_WIN ? 'python' : 'python3', ['-m', 'venv', '.venv']);
    run(PY, ['-m', 'pip', 'install', '-r', path.join('python', 'requirements.txt')]);
    py('download_model.py', []);
  },
  doctor() {
    py('doctor.py', ['--episode', EP], {allowFail: true});
  },
  voices() {
    py('generate_voice.py', ['voices', '--episode', EP]);
    py('asr_check.py', ['voices', '--episode', EP], {allowFail: true});
    py('write_docs.py', ['voices', '--episode', EP]);
  },
  narration() {
    narration();
  },
  pilot() {
    py('music.py', ['all']);
    narration();
    const ep = episode();
    const {tl, props} = timeline('pilot', ep.pilot.scenes, ep.pilot.until);
    const dest = path.join(OUT, 'preview');
    const silent = renderVideo('pilot', props, dest);
    const file = path.join(dest, 'pilot.mp4');
    mux(silent, path.join(AUDIO, 'pilot', 'mix.wav'), file);
    fs.copyFileSync(path.join(AUDIO, 'pilot', 'pilot.srt'), path.join(dest, 'pilot.srt'));
    const shots = screenshots(file, 'pilot', [3, 14, 24, 40, 52, 62, 76].filter((t) => t < tl.duration));
    const v = validateVideo(file, {minDur: 60, maxDur: 90});
    writeReport('pilot_report', {...v, screenshots: shots, audio_mix: JSON.parse(fs.readFileSync(path.join(AUDIO, 'pilot', 'audio_report.json'), 'utf8'))});
    console.log(JSON.stringify(v, null, 2));
    if (!v.ok) process.exit(2);
  },
  episode() {
    py('music.py', ['all']);
    narration();
    const {tl, props} = timeline('full');
    const dest = path.join(OUT, 'full');
    const name = opt('name', 'full_video');
    const bitrate = opt('bitrate'); // e.g. 8M -> two-pass delivery encode from a high-quality intermediate
    const silent = renderVideo(name, props, dest, {quality: opt('quality', 'hd'), crf: bitrate ? 14 : 20});
    const file = path.join(dest, `${name}.mp4`);
    if (bitrate) {
      encodeForYouTube(silent, path.join(AUDIO, 'full', 'mix.wav'), file, bitrate);
      fs.rmSync(silent);
    } else {
      mux(silent, path.join(AUDIO, 'full', 'mix.wav'), file);
    }
    fs.copyFileSync(path.join(AUDIO, 'full', 'full.srt'), path.join(dest, `${name}.en.srt`));
    py('av_check.py', ['--episode', EP, '--video', path.relative(ROOT, file)]);
    const times = tl.scenes.flatMap((s) => [s.start + 4, (s.start + s.end) / 2]);
    const shots = screenshots(file, name, times);
    const v = validateVideo(file, {minDur: 400, maxDur: 660});
    writeReport(`${name}_report`, {...v, screenshots: shots, chapters: tl.scenes.map((s) => ({start: s.start, title: s.chapter})),
      audio_mix: JSON.parse(fs.readFileSync(path.join(AUDIO, 'full', 'audio_report.json'), 'utf8'))});
    py('write_docs.py', ['chapters', '--episode', EP]);
    console.log(JSON.stringify(v, null, 2));
    if (!v.ok) process.exit(2);
  },
  // ---------------------------------------------------------------- final delivery (resumable stages)
  // `final` = audio + render + encode + qa. Each stage can be run alone and re-running resumes:
  //  * render: one chunk per scene, cached by a content hash (shared source + the scene's own file + its props slice
  //    + render settings). Chunks are written atomically and verified by frame count, so an interrupted render
  //    (container restart, background time limit) only redoes the unfinished scenes.
  //  * encode: two-pass H.264 delivery file + a shareable copy under --share-mib (default 380 MiB).
  final() {
    commands.audio();
    commands.render();
    commands.encode();
    commands.qa();
  },
  audio() {
    py('music.py', ['all']);
    narration();
    timeline('full');
  },
  render() {
    const {tl, props} = loadFull();
    const parts = path.join(OUT, 'final', 'parts');
    fs.mkdirSync(parts, {recursive: true});
    const conc = opt('concurrency', String(defaultConcurrency()));
    const crf = opt('crf', '14');
    const only = opt('only');
    const manifest = renderPlan(tl, crf);
    for (const c of manifest) {
      if (only && !only.split(',').includes(c.scene)) continue;
      const f = path.join(parts, c.file);
      if (fs.existsSync(f) && frameCount(f) === c.frames) {
        console.log(`= ${c.scene} cached (${c.frames} frames, ${c.hash})`);
        continue;
      }
      for (const old of fs.readdirSync(parts)) if (old.startsWith(`${c.scene}_`) && old !== c.file) fs.rmSync(path.join(parts, old));
      const tmp = f.replace(/\.mp4$/, '.partial.mp4');
      const t0 = Date.now();
      run(NPX, ['remotion', 'render', 'Episode', tmp, `--props=${props}`, `--frames=${c.from}-${c.to}`, `--concurrency=${conc}`,
        '--muted', '--codec=h264', `--crf=${crf}`, '--timeout=120000', '--log=error']);
      const n = frameCount(tmp);
      if (n !== c.frames) {
        console.error(`✖ ${c.scene}: rendered ${n} frames, expected ${c.frames}`);
        process.exit(3);
      }
      fs.renameSync(tmp, f);
      console.log(`+ ${c.scene} rendered ${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    fs.writeFileSync(path.join(parts, 'manifest.json'), JSON.stringify(manifest, null, 2));
  },
  encode() {
    const {tl} = loadFull();
    const dest = path.join(OUT, 'final');
    const parts = path.join(dest, 'parts');
    const manifest = renderPlan(tl, opt('crf', '14'));
    const files = manifest.map((c) => path.join(parts, c.file));
    const missing = manifest.filter((c, i) => !fs.existsSync(files[i]) || frameCount(files[i]) !== c.frames);
    if (missing.length) {
      console.error(`✖ missing or stale scene chunks: ${missing.map((c) => c.scene).join(', ')} — run: node scripts/pipeline.mjs render --episode ${EP}`);
      process.exit(3);
    }
    const name = opt('name', `hidden_ledger_episode_${EP}_FINAL_1080p`);
    const out = path.join(dest, `${name}.mp4`);
    const dur = (tl.durationInFrames / tl.fps).toFixed(4);
    const kbps = parseInt(opt('bitrate', '10M'), 10) * 1000;
    const mixWav = path.join(AUDIO, 'full', 'mix.wav');
    // resume: an encode newer than every chunk and the mix, with the full frame count, is kept
    const newest = Math.max(...[...files, mixWav].map((f) => fs.statSync(f).mtimeMs));
    const fresh = (f) => fs.existsSync(f) && fs.statSync(f).mtimeMs > newest && frameCount(f) === tl.durationInFrames;
    if (fresh(out)) console.log(`= ${path.relative(ROOT, out)} up to date`);
    else twoPass(files, mixWav, out, kbps, dur);
    // shareable copy that fits chat/upload limits (same frames, lower bitrate); --share-mib 0 skips it
    const shareMiB = Number(opt('share-mib', '380'));
    const audioMB = (256 * Number(dur)) / 8 / 1000;
    const shareKbps = Math.floor(((shareMiB * 1.048576 - audioMB - 2) * 8 * 1000) / Number(dur));
    const share = out.replace(/\.mp4$/, '_share.mp4');
    if (shareMiB > 0 && shareKbps < kbps) {
      if (fresh(share)) console.log(`= ${path.relative(ROOT, share)} up to date`);
      else twoPass(files, mixWav, share, shareKbps, dur);
    }
    fs.copyFileSync(path.join(AUDIO, 'full', 'full.srt'), path.join(dest, `hidden_ledger_episode_${EP}.srt`));
  },
  qa() {
    const {tl} = loadFull();
    const name = opt('name', `hidden_ledger_episode_${EP}_FINAL_1080p`);
    const out = path.join(OUT, 'final', `${name}.mp4`);
    py('av_check.py', ['--episode', EP, '--video', path.relative(ROOT, out), '--asr'], {allowFail: true});
    py('stem_check.py', ['--episode', EP, '--name', 'full'], {allowFail: true});
    py('content_check.py', ['--video', path.relative(ROOT, out)], {allowFail: true});
    py('final_scan.py', ['--video', path.relative(ROOT, out)], {allowFail: true});
    const rep = validateVideo(out, {minDur: 60, maxDur: 60 * 20});
    rep.expected_frames = tl.durationInFrames;
    writeReport(`${name}_report`, rep);
    console.log(JSON.stringify(rep, null, 2));
  },
  // Collect the delivery files in episode<EP>/ (videos hard-linked, not copied: the master is ~750 MB).
  deliver() {
    const dest = path.join(ROOT, `episode${EP}`);
    fs.mkdirSync(dest, {recursive: true});
    const fin = path.join(OUT, 'final');
    const name = `hidden_ledger_episode_${EP}_FINAL_1080p`;
    for (const f of [`${name}.mp4`, `${name}_share.mp4`]) {
      const src = path.join(fin, f);
      if (!fs.existsSync(src)) continue;
      const to = path.join(dest, f);
      if (fs.existsSync(to)) fs.rmSync(to);
      try {
        fs.linkSync(src, to);
      } catch {
        fs.copyFileSync(src, to);
      }
    }
    const content = path.join(ROOT, 'content', `episode-${EP}`);
    // file names follow the delivery convention used since episode 003
    fs.copyFileSync(path.join(fin, `hidden_ledger_episode_${EP}.srt`), path.join(dest, `episode_${EP}_subtitles.srt`));
    fs.copyFileSync(path.join(content, 'sources.md'), path.join(dest, `episode_${EP}_sources.md`));
    fs.copyFileSync(path.join(content, 'fact_check.csv'), path.join(dest, 'fact_check.csv'));
    if (fs.existsSync(path.join(content, 'script_en.md'))) fs.copyFileSync(path.join(content, 'script_en.md'), path.join(dest, `episode_${EP}_script.md`));
    py('fact_table.py', ['--episode', EP, '--out', path.relative(ROOT, path.join(dest, 'fact_check.md'))]);
    ['A', 'B', 'C'].forEach((letter, i) => {
      const src = path.join(OUT, 'thumbnails', `thumbnail_${i + 1}.png`);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dest, `thumbnail_option_${letter}.png`));
    });
    console.log(fs.readdirSync(dest).join('\n'));
  },
  shorts() {
    const ep = episode();
    const fullProps = path.join(AUDIO, 'full', 'props.json');
    if (!fs.existsSync(fullProps)) {
      console.error('Run `npm run episode:001` first (shorts reuse the full timeline and mix).');
      process.exit(1);
    }
    const tl = JSON.parse(fs.readFileSync(path.join(AUDIO, 'full', 'timeline.json'), 'utf8'));
    const dest = path.join(OUT, 'shorts');
    const report = [];
    for (const [i, s] of (ep.shorts || []).entries()) {
      const segs = tl.scenes.flatMap((x) => x.segments);
      const seg = (k) => segs.find((g) => g.key === k);
      const last = seg(s.to);
      const next = segs[segs.indexOf(last) + 1];
      const nextScene = tl.scenes.find((x) => x.start > last.start);
      const from = Math.max(0, seg(s.from).start - 0.3);
      // end before the next sentence starts and before the wipe into the next scene (11 frames ahead of it, see Episode.tsx)
      const to = Math.min(tl.duration, last.end + 0.8, next ? next.start - 0.08 : Infinity, nextScene ? nextScene.start - 12 / tl.fps : Infinity);
      const name = `short_${i + 1}`;
      const silent = renderVideo(name, fullProps, dest, {quality: 'hd', composition: 'Short', extraProps: {from, to, title: s.title}, crf: 16});
      const file = path.join(dest, `${name}.mp4`);
      // exact length (no -shortest, which can drop the last frames) + fades so the music never cuts hard;
      // the fade-out starts once the last word has been spoken
      const dur = (Math.round((to - from) * tl.fps) / tl.fps).toFixed(4);
      const fadeAt = Math.min(last.end - from + 0.02, Number(dur) - 0.05);
      run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', silent, '-ss', String(from), '-t', dur, '-i', path.join(AUDIO, 'full', 'mix.wav'),
        '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-af', `afade=t=in:d=0.15,afade=t=out:st=${fadeAt.toFixed(3)}:d=${(Number(dur) - fadeAt).toFixed(3)},apad`,
        '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-t', dur, '-movflags', '+faststart', file]);
      fs.rmSync(silent);
      report.push(validateVideo(file, {minDur: 15, maxDur: 60}));
    }
    writeReport('shorts_report', report);
    console.log(JSON.stringify(report, null, 2));
  },
  thumbnails() {
    const dest = path.join(OUT, 'thumbnails');
    fs.mkdirSync(dest, {recursive: true});
    for (const v of opt('variants', EP === '001' ? '1,2,3' : '1,2').split(',').map(Number)) {
      const f = path.join(dest, `thumbnail_${v}.png`);
      run(NPX, ['remotion', 'still', 'Thumbnail', f, `--props=${JSON.stringify({variant: v, episode: EP})}`, '--image-format=png', '--log=error']);
    }
  },
  verify() {
    py('verify.py', ['--episode', EP]);
  },
};

if (!commands[cmd]) {
  console.log(`Usage: node scripts/pipeline.mjs <${Object.keys(commands).join('|')}> [--episode 001] [--quality preview|hd] [--no-subs] [--concurrency N]`);
  process.exit(cmd ? 1 : 0);
}
commands[cmd]();
