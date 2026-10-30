import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_BODY, FONT_TITLE} from '../themes/theme';
import {Cue, Timeline, useBeats} from './timeline';

// Cinematic layer for character-led episodes (004+): 3D shots rendered in Blender (blender/render_shot.py) are
// composited here; overlays attach to the anchors/screens projected from the 3D scene, inside the same camera move.

// Palette of the character reference sheet
export const K = {
  ivory: '#F2EDE4',
  taupe: '#8E8579',
  ink: '#161616',
  orange: '#E07A3A',
  slate: '#5E7C8E',
  warmBlack: 'rgba(20,17,15,0.78)',
  red: '#D9534A',
  green: '#6FAF8A',
} as const;

export type ShotMeta = {
  id: string;
  scene: string;
  t0: number;
  t1: number;
  frames: number;
  step: number;
  anchors: Record<string, [number, number, number]>;
  screens: Record<string, [number, number][]>;
  file: string;
};

export type CineData = {shots: Record<string, ShotMeta>; assetBase: string};
export const CineContext = createContext<CineData>({shots: {}, assetBase: ''});
export const useCine = () => useContext(CineContext);

// ------------------------------------------------------------------ camera
export type Move = {from?: [number, number, number]; to?: [number, number, number]; ease?: 'io' | 'out' | 'linear'};

/** Scene-local frames [f0, f1) for a shot, from the shot's global times. */
export const useShotRange = (id: string) => {
  const {shots} = useCine();
  const {fps} = useVideoConfig();
  const b = useBeats();
  const m = shots[id];
  if (!m) return {m: undefined, f0: 0, f1: 0, t: 0, local: 0};
  const sceneStartFrame = Math.round(b.ctx.scene.start * fps);
  const f0 = Math.round(m.t0 * fps) - sceneStartFrame;
  const f1 = f0 + m.frames;
  const local = b.frame - f0;
  return {m, f0, f1, t: Math.max(0, Math.min(1, local / Math.max(1, m.frames - 1))), local};
};

/** A virtual camera on the composited shot: [x, y, zoom] at start and end (x, y = image point kept centred). */
export const cameraTransform = (t: number, mv: Move = {}) => {
  const a = mv.from ?? [960, 540, 1.0];
  const z = mv.to ?? [a[0], a[1], a[2] * 1.06];
  const e = mv.ease === 'linear' ? t : mv.ease === 'out' ? Easing.out(Easing.cubic)(t) : Easing.inOut(Easing.sin)(t);
  const x = a[0] + (z[0] - a[0]) * e;
  const y = a[1] + (z[1] - a[1]) * e;
  const s = a[2] + (z[2] - a[2]) * e;
  return `translate(960px, 540px) scale(${s}) translate(${-x}px, ${-y}px)`;
};

/**
 * One 3D shot inside a scene. Renders nothing outside its time range. `children(api)` draws overlays in image space
 * (1920x1080, same camera transform); `hud` draws screen-space overlays (not moved by the camera).
 */
export const Shot: React.FC<{
  id: string;
  move?: Move;
  children?: (api: ShotApi) => React.ReactNode;
  hud?: (api: ShotApi) => React.ReactNode;
  fadeIn?: number;
}> = ({id, move, children, hud, fadeIn = 0}) => {
  const {assetBase} = useCine();
  const r = useShotRange(id);
  const b = useBeats();
  if (!r.m || b.frame < r.f0 || b.frame >= r.f1) return null;
  const m = r.m;
  const api: ShotApi = {
    m,
    local: r.local,
    t: r.t,
    a: (name: string) => m.anchors[name] ?? [960, 540, 1],
    quad: (name: string) => m.screens[name],
  };
  const o = fadeIn ? interpolate(r.local, [0, fadeIn], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <AbsoluteFill style={{transform: cameraTransform(r.t, move), transformOrigin: '0 0', width: 1920, height: 1080}}>
          <Sequence from={r.f0} durationInFrames={m.frames} layout="none">
            <OffthreadVideo src={assetBase + m.file} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}} muted />
          </Sequence>
          {children?.(api)}
        </AbsoluteFill>
      </AbsoluteFill>
      {hud?.(api)}
    </AbsoluteFill>
  );
};

export type ShotApi = {
  m: ShotMeta;
  local: number;
  t: number;
  a: (name: string) => [number, number, number];
  quad: (name: string) => [number, number][] | undefined;
};

// ------------------------------------------------------------------ screens: map HTML onto a projected quad
function solve(A: number[][], bvec: number[]): number[] {
  const n = bvec.length;
  const M = A.map((row, i) => [...row, bvec[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

/** CSS matrix3d mapping the rect (0,0)-(w,h) onto quad [tl, tr, br, bl]. */
export const quadMatrix = (w: number, h: number, q: [number, number][]) => {
  const src = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const A: number[][] = [];
  const B: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = q[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    B.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    B.push(v);
  }
  const [a, b, c, d, e, f, g, hh] = solve(A, B);
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
};

export const OnScreen: React.FC<{quad?: [number, number][]; w?: number; h?: number; children: React.ReactNode; glow?: number}> = ({quad, w = 1280, h = 800, children, glow = 0}) => {
  if (!quad) return null;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: '0 0', transform: quadMatrix(w, h, quad), overflow: 'hidden', boxShadow: glow ? `0 0 ${glow}px rgba(255,220,180,0.6)` : undefined}}>
      {children}
    </div>
  );
};

// ------------------------------------------------------------------ overlay atoms
const appear = (local: number, at: number, dur = 10) => interpolate(local - at, [0, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});

/** A price tag hanging from an anchor (string + tag), pops in at scene-local frame `at`. */
export const PriceTag: React.FC<{p: [number, number, number]; text: string; sub?: string; at: number; frame: number; color?: string; dy?: number; size?: number; tilt?: number}> = ({
  p,
  text,
  sub,
  at,
  frame,
  color = K.ivory,
  dy = -60,
  size = 46,
  tilt = -4,
}) => {
  const k = appear(frame, at, 12);
  if (k <= 0) return null;
  const sw = Math.sin(frame / 18) * 2;
  return (
    <div style={{position: 'absolute', left: p[0], top: p[1], opacity: k}}>
      <svg width={4} height={-dy} style={{position: 'absolute', left: -1, top: dy, overflow: 'visible'}}>
        <line x1={1} y1={0} x2={1} y2={-dy} stroke={K.orange} strokeWidth={3} />
        <circle cx={1} cy={-dy} r={5} fill={K.orange} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: dy,
          transform: `translate(-50%, -100%) rotate(${tilt + sw}deg) scale(${0.6 + 0.4 * k})`,
          transformOrigin: '50% 100%',
          background: color,
          color: K.ink,
          fontFamily: FONT_TITLE,
          fontWeight: 700,
          fontSize: size,
          padding: `${size * 0.18}px ${size * 0.45}px`,
          borderRadius: 12,
          whiteSpace: 'nowrap',
          boxShadow: '0 14px 30px rgba(0,0,0,0.35)',
          textAlign: 'center',
          lineHeight: 1.05,
        }}
      >
        {text}
        {sub && <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: Math.max(26, size * 0.5), color: '#5A534C', marginTop: 4}}>{sub}</div>}
      </div>
    </div>
  );
};

/** Label with a leader line from an anchor point to a card offset by (dx, dy). */
export const Callout: React.FC<{p: [number, number, number]; dx: number; dy: number; title: string; value: string; at: number; frame: number; accent?: string; w?: number}> = ({
  p,
  dx,
  dy,
  title,
  value,
  at,
  frame,
  accent = K.orange,
  w = 360,
}) => {
  const k = appear(frame, at, 12);
  if (k <= 0) return null;
  const x2 = p[0] + dx;
  const y2 = p[1] + dy;
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: k}}>
        <circle cx={p[0]} cy={p[1]} r={9} fill={accent} stroke={K.ivory} strokeWidth={3} />
        <line x1={p[0]} y1={p[1]} x2={p[0] + dx * k} y2={p[1] + dy * k} stroke={K.ivory} strokeWidth={3} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: x2,
          top: y2,
          width: w,
          transform: `translate(${dx < 0 ? '-100%' : '0'}, -50%)`,
          opacity: k,
          background: K.warmBlack,
          border: `2px solid rgba(242,237,228,0.25)`,
          borderLeft: `8px solid ${accent}`,
          borderRadius: 14,
          padding: '12px 20px',
        }}
      >
        <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 28, color: K.taupe, letterSpacing: 1}}>{title}</div>
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 58, color: K.ivory, lineHeight: 1.05}}>{value}</div>
      </div>
    </>
  );
};

/** Big figure card (screen space). */
export const Figure: React.FC<{x: number; y: number; kicker?: string; value: string; note?: string; at: number; frame: number; w?: number; align?: 'left' | 'right' | 'center'; size?: number; accent?: string; until?: number}> = ({
  x,
  y,
  kicker,
  value,
  note,
  at,
  frame,
  w = 640,
  align = 'left',
  size = 120,
  accent = K.orange,
  until,
}) => {
  const k = appear(frame, at, 14) * (until !== undefined ? 1 - appear(frame, until, 10) : 1);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: k, transform: `translateY(${(1 - k) * 24}px)`, textAlign: align}}>
      {kicker && <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 32, letterSpacing: 4, color: accent, textTransform: 'uppercase', textShadow: '0 2px 18px rgba(0,0,0,0.6)'}}>{kicker}</div>}
      <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: size, color: K.ivory, lineHeight: 1.0, letterSpacing: -2, textShadow: '0 6px 30px rgba(0,0,0,0.55)'}}>{value}</div>
      {note && <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 34, color: K.ivory, opacity: 0.9, marginTop: 10, lineHeight: 1.25, textShadow: '0 2px 14px rgba(0,0,0,0.7)'}}>{note}</div>}
    </div>
  );
};

/** Rubber stamp (e.g. MADE-UP EXAMPLE), screen space. */
export const Stamp: React.FC<{x: number; y: number; text: string; at: number; frame: number; rot?: number; color?: string; size?: number}> = ({x, y, text, at, frame, rot = -8, color = K.orange, size = 46}) => {
  const k = appear(frame, at, 8);
  if (k <= 0) return null;
  const s = 1.6 - 0.6 * k;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`,
        opacity: k,
        border: `5px solid ${color}`,
        color,
        fontFamily: FONT_TITLE,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 4,
        padding: '8px 26px',
        borderRadius: 10,
        background: 'rgba(20,17,15,0.55)',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** Discreet source line (screen space, top right under the logo row). */
export const SourceNote: React.FC<{children: React.ReactNode; at?: number; frame?: number}> = ({children, at = 0, frame = 0}) => {
  const k = appear(frame, at, 12);
  return (
    <div style={{position: 'absolute', right: 56, top: 52, maxWidth: 820, textAlign: 'right', opacity: k, fontFamily: FONT_BODY, fontSize: 26, color: K.ivory, lineHeight: 1.3, textShadow: '0 2px 12px rgba(0,0,0,0.85)'}}>
      <span style={{color: K.orange, fontWeight: 700, letterSpacing: 2}}>SOURCE </span>
      {children}
    </div>
  );
};

export const IllustrativeTag: React.FC<{at?: number; frame?: number; text?: string}> = ({at = 0, frame = 0, text = 'ILLUSTRATIVE'}) => {
  const k = appear(frame, at, 10);
  return (
    <div style={{position: 'absolute', left: 56, top: 116, opacity: k, border: `3px dashed ${K.orange}`, color: K.orange, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 30, letterSpacing: 3, padding: '6px 16px', borderRadius: 10, background: 'rgba(20,17,15,0.55)'}}>
      {text}
    </div>
  );
};

/** Title question (screen space). */
export const BigQuestion: React.FC<{lines: string[]; at: number; frame: number; y?: number; size?: number}> = ({lines, at, frame, y = 300, size = 92}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center'}}>
    {lines.map((l, i) => {
      const k = appear(frame, at + i * 14, 16);
      return (
        <div key={i} style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: size, color: i ? K.orange : K.ivory, opacity: k, transform: `translateY(${(1 - k) * 30}px)`, letterSpacing: -2, lineHeight: 1.08, textShadow: '0 6px 36px rgba(0,0,0,0.65)'}}>
          {l}
        </div>
      );
    })}
  </div>
);

// ------------------------------------------------------------------ chrome for cinematic episodes
export const CineHud: React.FC<{timeline: Timeline}> = ({timeline}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = Math.max(0, timeline.scenes.findIndex((s) => t >= s.start && t < s.end));
  const sc = timeline.scenes[idx];
  const st = t - sc.start;
  // chapter card: in at 0.4 s, out at 3.6 s (not on the cold open)
  const k = idx === 0 ? 0 : interpolate(st, [0.4, 0.9, 3.4, 3.9], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 56, top: 50, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.8}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: K.orange}} />
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 26, letterSpacing: 5, color: K.ivory, textShadow: '0 2px 12px rgba(0,0,0,0.7)'}}>HIDDEN LEDGER</div>
      </div>
      {k > 0 && (
        <div style={{position: 'absolute', left: 56, bottom: 190, opacity: k, transform: `translateX(${(1 - k) * -30}px)`}}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: K.orange, textShadow: '0 2px 14px rgba(0,0,0,0.8)'}}>{String(idx).padStart(2, '0')}</div>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64, color: K.ivory, letterSpacing: -1, textShadow: '0 4px 24px rgba(0,0,0,0.75)'}}>{sc.chapter}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const CineSubtitles: React.FC<{cues: Cue[]}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 46, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          maxWidth: 1500,
          background: 'rgba(14,12,11,0.62)',
          color: K.ivory,
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 46,
          lineHeight: 1.28,
          padding: '8px 24px',
          borderRadius: 10,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};

/** Letterbox-free vignette + subtle film grain-ish noise to glue Blender plates and overlays together. */
export const Grade: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(10,6,4,0.38) 100%)'}} />
);
