import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Timeline} from '../components/timeline';
import {LedgerMark} from '../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../themes/theme';

// Native 9:16 kit. Short scenes are timed in *episode* seconds (the same clock as the narration
// timeline and the mix), so a beat anchored to a spoken word stays on that word in the cut.

export const VW = 1080;
export const VH = 1920;
// YouTube Shorts overlays: header icons on top, title/channel/caption over the bottom ~430 px and
// the like/comment/share column on the right from about y 1000. Story content stays inside SAFE;
// subtitles sit between SAFE.bottom and the caption overlay.
export const SAFE = {top: 190, bottom: 1290, left: 60, right: 950, subTop: 1310};

type ClockCtx = {timeline: Timeline; from: number};
const Clock = createContext<ClockCtx | null>(null);
export const ClockProvider = Clock.Provider;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const smooth = Easing.bezier(0.33, 0, 0.2, 1);

export const useClock = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ctx = useContext(Clock);
  if (!ctx) throw new Error('useClock outside ClockProvider');
  const offset = Math.round(ctx.from * fps);
  /** episode seconds -> frame of this short */
  const f = (sec: number) => Math.round(sec * fps) - offset;
  const t = (frame + offset) / fps;
  const segs = ctx.timeline.scenes.flatMap((s) => s.segments);
  const seg = (key: string) => {
    const s = segs.find((g) => g.key === key);
    if (!s) throw new Error(`short: no segment ${key}`);
    return s;
  };
  /** episode time of the nth spoken word in segment `key` matching `re` (ASR anchor; throws if missing so a script edit cannot silently desync) */
  const word = (key: string, re: RegExp, nth = 0) => {
    const hits = (seg(key).words ?? []).filter(([, w]) => re.test(w.replace(/[^\w$%.,']/g, '')));
    if (!hits[nth]) throw new Error(`short: word ${re} not found in ${key}`);
    return hits[nth][0];
  };
  /** eased 0..1 from episode time `a` over `dur` seconds */
  const ramp = (a: number, dur = 0.5) => interpolate(frame - f(a), [0, Math.max(1, dur * fps)], [0, 1], {...clamp, easing: smooth});
  const pop = (a: number, damping = 13) => spring({frame: frame - f(a), fps, config: {damping, mass: 0.7, stiffness: 130}});
  /** 1 between episode times a and b, soft edges of `fade` seconds */
  const win = (a: number, b: number, fade = 0.35) => {
    const fa = f(a);
    const fb = Math.max(fa + 2, f(b));
    const d = Math.max(1, Math.min(fade * fps, (fb - fa) / 2));
    return interpolate(frame, [fa - d, fa, fb - d, fb], [0, 1, 1, 0], clamp);
  };
  return {frame, fps, t, f, seg, word, ramp, pop, win};
};

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const VStage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox={`0 0 ${VW} ${VH}`} width={VW} height={VH} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    {children}
  </svg>
);

export const VBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.15) % 64;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 32}).map((_, i) => (
          <line key={i} x1={0} x2={VW} y1={i * 64 + drift - 64} y2={i * 64 + drift - 64} stroke="#161A1F" strokeWidth={2} />
        ))}
        <line x1={92} x2={92} y1={0} y2={VH} stroke="rgba(228,87,87,0.10)" strokeWidth={3} />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.5) 100%)'}} />
    </AbsoluteFill>
  );
};

export const Brand: React.FC = () => (
  <div style={{position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, opacity: 0.8}}>
    <LedgerMark size={34} />
    <span style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: C.cream}}>HIDDEN LEDGER</span>
  </div>
);

/** Big text block centred on x (HTML, so it wraps and kerns properly). */
export const VText: React.FC<{
  x?: number;
  y: number;
  w?: number;
  size?: number;
  color?: string;
  o?: number;
  s?: number;
  weight?: number;
  font?: 'title' | 'body';
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x = VW / 2, y, w = 900, size = 72, color = C.cream, o = 1, s = 1, weight = 700, font = 'title', children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y,
      width: w,
      textAlign: 'center',
      fontFamily: font === 'title' ? FONT_TITLE : FONT_BODY,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1.08,
      letterSpacing: font === 'title' ? -1 : 0,
      color,
      opacity: o,
      transform: `scale(${s})`,
      transformOrigin: 'center top',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Dashed "illustrative" stamp, sized for vertical video. */
export const IllustrativeStamp: React.FC<{x?: number; y: number; s?: number; o?: number}> = ({x = VW / 2, y, s = 1, o = 1}) => (
  <div style={{position: 'absolute', left: x - 450, top: y, width: 900, display: 'flex', justifyContent: 'center', opacity: o, transform: `scale(${s})`, transformOrigin: 'center top'}}>
    <div
      style={{
        border: `4px dashed ${C.orange}`,
        borderRadius: 16,
        padding: '14px 34px',
        background: 'rgba(17,20,24,0.92)',
        color: C.orange,
        fontFamily: FONT_TITLE,
        fontWeight: 700,
        fontSize: 54,
        letterSpacing: 2,
        lineHeight: 1.1,
        textAlign: 'center',
      }}
    >
      ILLUSTRATIVE EXAMPLE
      <div style={{fontSize: 40, color: C.cream, letterSpacing: 3}}>NOT INDUSTRY DATA</div>
    </div>
  </div>
);
