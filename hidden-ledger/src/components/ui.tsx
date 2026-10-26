import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_BODY, FONT_TITLE, H, W} from '../themes/theme';
import {Cue, Timeline} from './timeline';

// ---------------------------------------------------------------- layout primitives
export const Abs: React.FC<{x: number; y: number; w?: number; o?: number; s?: number; ty?: number; tx?: number; align?: 'left' | 'center' | 'right'; children: React.ReactNode; style?: React.CSSProperties}> = ({
  x,
  y,
  w,
  o = 1,
  s = 1,
  ty = 0,
  tx = 0,
  align = 'left',
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      opacity: o,
      transform: `translate(${tx}px, ${ty}px) scale(${s})`,
      transformOrigin: align === 'center' ? 'center top' : align === 'right' ? 'right top' : 'left top',
      textAlign: align,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    {children}
  </svg>
);

// ---------------------------------------------------------------- typography
export const Title: React.FC<{children: React.ReactNode; size?: number; color?: string; weight?: number; style?: React.CSSProperties}> = ({
  children,
  size = 84,
  color = C.cream,
  weight = 700,
  style,
}) => (
  <div style={{fontFamily: FONT_TITLE, fontSize: size, fontWeight: weight, color, lineHeight: 1.05, letterSpacing: -1.5, ...style}}>{children}</div>
);

export const Body: React.FC<{children: React.ReactNode; size?: number; color?: string; weight?: number; style?: React.CSSProperties}> = ({
  children,
  size = 36,
  color = C.cream,
  weight = 500,
  style,
}) => <div style={{fontFamily: FONT_BODY, fontSize: size, fontWeight: weight, color, lineHeight: 1.3, ...style}}>{children}</div>;

export const Kicker: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.orange}) => (
  <div style={{fontFamily: FONT_TITLE, fontSize: 32, fontWeight: 700, color, letterSpacing: 4, textTransform: 'uppercase'}}>{children}</div>
);

export const Chip: React.FC<{children: React.ReactNode; color?: string; bg?: string; size?: number}> = ({children, color = C.bg, bg = C.orange, size = 28}) => (
  <span
    style={{
      display: 'inline-block',
      background: bg,
      color,
      fontFamily: FONT_TITLE,
      fontWeight: 700,
      fontSize: size,
      padding: `${size * 0.25}px ${size * 0.6}px`,
      borderRadius: size * 0.35,
      letterSpacing: 0.5,
    }}
  >
    {children}
  </span>
);

export const Card: React.FC<{children: React.ReactNode; w?: number; accent?: string; pad?: number; style?: React.CSSProperties}> = ({
  children,
  w,
  accent = C.orange,
  pad = 36,
  style,
}) => (
  <div
    style={{
      width: w,
      background: C.panel,
      border: `2px solid ${C.line}`,
      borderLeft: `8px solid ${accent}`,
      borderRadius: 18,
      padding: pad,
      boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Small source line, always visible when a figure is on screen. */
export const Source: React.FC<{children: React.ReactNode; o?: number}> = ({children, o = 1}) => (
  <div
    style={{
      position: 'absolute',
      right: 64,
      top: 112,
      maxWidth: 900,
      textAlign: 'right',
      opacity: o,
      fontFamily: FONT_BODY,
      fontSize: 26,
      color: C.muted,
      lineHeight: 1.35,
    }}
  >
    <span style={{color: C.orange, fontWeight: 700, letterSpacing: 2}}>SOURCE </span>
    {children}
  </div>
);

export const Illustrative: React.FC<{o?: number}> = ({o = 1}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 112, display: 'flex', justifyContent: 'center', opacity: o}}>
    <div
      style={{
        border: `3px dashed ${C.orange}`,
        color: C.orange,
        fontFamily: FONT_TITLE,
        fontWeight: 700,
        fontSize: 38,
        letterSpacing: 2,
        padding: '12px 32px',
        borderRadius: 12,
        background: 'rgba(245,158,11,0.08)',
      }}
    >
      ILLUSTRATIVE EXAMPLE — NOT INDUSTRY DATA
    </div>
  </div>
);

// ---------------------------------------------------------------- data viz
export const fmt = (v: number, decimals = 0) => v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

export const Counter: React.FC<{value: number; t: number; decimals?: number; prefix?: string; suffix?: string; size?: number; color?: string}> = ({
  value,
  t,
  decimals = 0,
  prefix = '',
  suffix = '',
  size = 200,
  color = C.cream,
}) => {
  const eased = 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
  return (
    <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: size, color, letterSpacing: -4, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
      {prefix}
      {fmt(value * eased, decimals)}
      {suffix}
    </div>
  );
};

/** Horizontal bar with label + value; `t` animates the fill. */
export const HBar: React.FC<{label: string; value: number; max: number; t: number; color?: string; w?: number; valueText?: string; h?: number}> = ({
  label,
  value,
  max,
  t,
  color = C.orange,
  w = 900,
  valueText,
  h = 64,
}) => (
  <div style={{width: w, marginBottom: 34}}>
    <Body size={38} color={C.muted} style={{marginBottom: 10}}>
      {label}
    </Body>
    <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
      <div style={{flex: 1, height: h, background: C.bg2, borderRadius: 10, overflow: 'hidden', border: `2px solid ${C.line}`}}>
        <div style={{width: `${(value / max) * 100 * t}%`, height: '100%', background: color, borderRadius: 8}} />
      </div>
      <div style={{width: 250, fontFamily: FONT_TITLE, fontSize: 88, fontWeight: 700, color: C.cream, opacity: t > 0.05 ? 1 : 0, transform: `scale(${0.8 + 0.2 * Math.min(1, t * 1.5)})`, transformOrigin: 'left center'}}>{valueText}</div>
    </div>
  </div>
);

/** 10x10 grid of dots; the first `n` light up progressively with t. */
export const DotGrid: React.FC<{n: number; t: number; color?: string; size?: number; gap?: number; highlightFrom?: number}> = ({
  n,
  t,
  color = C.orange,
  size = 30,
  gap = 14,
}) => {
  const lit = Math.round(n * Math.max(0, Math.min(1, t)));
  return (
    <div style={{display: 'grid', gridTemplateColumns: `repeat(10, ${size}px)`, gap}}>
      {Array.from({length: 100}).map((_, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size,
            background: i < lit ? color : 'transparent',
            border: `3px solid ${i < lit ? color : C.line}`,
          }}
        />
      ))}
    </div>
  );
};

/** Animated SVG path drawing (stroke-dashoffset). */
export const DrawPath: React.FC<{d: string; t: number; color?: string; width?: number; dash?: boolean; len?: number}> = ({
  d,
  t,
  color = C.cream,
  width = 6,
  dash = false,
  len = 3000,
}) => (
  <path
    d={d}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeDasharray={dash ? `14 16` : `${len}`}
    strokeDashoffset={dash ? 0 : len * (1 - t)}
    opacity={dash ? Math.min(1, t * 3) : 1}
    style={dash ? {clipPath: undefined} : undefined}
  />
);

// ---------------------------------------------------------------- persistent chrome
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.15) % 60;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {/* ledger ruling */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 20}).map((_, i) => (
          <line key={i} x1={0} x2={W} y1={i * 60 + drift} y2={i * 60 + drift} stroke="#161A1F" strokeWidth={2} />
        ))}
        <line x1={150} x2={150} y1={0} y2={H} stroke="rgba(228,87,87,0.10)" strokeWidth={3} />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

export const Hud: React.FC<{timeline: Timeline}> = ({timeline}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const idx = Math.max(0, timeline.scenes.findIndex((s) => t >= s.start && t < s.end));
  const sc = timeline.scenes[idx];
  const sceneT = t - sc.start;
  const labelO = interpolate(sceneT, [0.2, 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 64, top: 48, display: 'flex', alignItems: 'center', gap: 18}}>
        <LedgerMark size={34} />
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: C.cream}}>HIDDEN LEDGER</div>
        <div style={{width: 2, height: 26, background: C.line}} />
        <div style={{fontFamily: FONT_BODY, fontSize: 28, color: C.muted, opacity: labelO}}>
          {String(idx + 1).padStart(2, '0')} · {sc.chapter}
        </div>
      </div>
      {/* progress ledger line */}
      <div style={{position: 'absolute', left: 64, right: 64, top: 96, height: 3, background: C.line}}>
        <div style={{width: `${(frame / durationInFrames) * 100}%`, height: '100%', background: C.orange}} />
      </div>
    </AbsoluteFill>
  );
};

export const LedgerMark: React.FC<{size?: number}> = ({size = 40}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <rect x={3} y={3} width={34} height={34} rx={6} fill="none" stroke={C.cream} strokeWidth={3} />
    <line x1={11} y1={13} x2={29} y2={13} stroke={C.cream} strokeWidth={3} />
    <line x1={11} y1={20} x2={29} y2={20} stroke={C.cream} strokeWidth={3} />
    <line x1={11} y1={27} x2={21} y2={27} stroke={C.orange} strokeWidth={3} />
    <circle cx={28} cy={27} r={3} fill={C.orange} />
  </svg>
);

export const Subtitles: React.FC<{cues: Cue[]}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          maxWidth: 1560,
          background: 'rgba(10,12,15,0.88)',
          color: C.cream,
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 50,
          lineHeight: 1.3,
          padding: '12px 28px',
          borderRadius: 12,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};

/** Scene-change wipe: a dark panel with an orange leading edge sweeps across, masking the cut (~0.7 s). */
export const SceneWipe: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const t = frame / dur;
  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  // panel enters from the left, covers, then exits to the right
  const lead = interpolate(ease(Math.min(1, t * 1.6)), [0, 1], [-200, W + 200]);
  const tail = interpolate(ease(Math.max(0, t * 1.6 - 0.6)), [0, 1], [-200, W + 200]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={`M${tail - 160} 0 L${lead} 0 L${lead - 160} ${H} L${tail - 320} ${H} Z`} fill={C.bg} />
        <path d={`M${lead} 0 L${lead + 18} 0 L${lead - 142} ${H} L${lead - 160} ${H} Z`} fill={C.orange} />
      </svg>
    </AbsoluteFill>
  );
};
