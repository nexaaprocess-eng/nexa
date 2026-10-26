#!/usr/bin/env node
// Hidden Ledger pipeline orchestrator (Windows PowerShell / macOS / Linux).
// Usage: node scripts/pipeline.mjs <command> [--episode 001] [--quality preview|hd] [--no-subs] [--concurrency N]
//        episode options: [--name full_video_v2] [--bitrate 8M]
// Commands: setup | doctor | voices | narration | pilot | episode | shorts | thumbnails | verify
import {spawnSync} from 'node:child_process';
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
      const seg = (k) => tl.scenes.flatMap((x) => x.segments).find((g) => g.key === k);
      const from = Math.max(0, seg(s.from).start - 0.3);
      const to = Math.min(tl.duration, seg(s.to).end + 0.8);
      const name = `short_${i + 1}`;
      const silent = renderVideo(name, fullProps, dest, {quality: 'hd', composition: 'Short', extraProps: {from, to, title: s.title}});
      const file = path.join(dest, `${name}.mp4`);
      mux(silent, path.join(AUDIO, 'full', 'mix.wav'), file, {from, to});
      report.push(validateVideo(file, {minDur: 15, maxDur: 60}));
    }
    writeReport('shorts_report', report);
    console.log(JSON.stringify(report, null, 2));
  },
  thumbnails() {
    const dest = path.join(OUT, 'thumbnails');
    fs.mkdirSync(dest, {recursive: true});
    for (const v of [1, 2, 3]) {
      const f = path.join(dest, `thumbnail_${v}.png`);
      run(NPX, ['remotion', 'still', 'Thumbnail', f, `--props=${JSON.stringify({variant: v})}`, '--image-format=png', '--log=error']);
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
