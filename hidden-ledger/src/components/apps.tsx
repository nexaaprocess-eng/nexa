import React from 'react';
import {interpolate} from 'remotion';
import {C, FONT_BODY, FONT_TITLE} from '../themes/theme';

// App & subscription kit (episode 003+). HTML-based so phone screens render crisp, light and readable.
// Every app here is FICTIONAL (invented name, glyph and colours); no real product UI is copied.

export type AppDef = {name: string; cat: string; color: string; glyph: string; price: number};

export const APPS: Record<string, AppDef> = {
  music: {name: 'Wavebox', cat: 'Music', color: '#E4572E', glyph: '♪', price: 11.99},
  stream: {name: 'Reelhouse', cat: 'Streaming', color: '#7A4DDB', glyph: '▶', price: 15.49},
  cloud: {name: 'Cloudnest', cat: 'Cloud storage', color: '#3A8FD9', glyph: '☁', price: 2.99},
  fit: {name: 'Pulsefit', cat: 'Fitness', color: '#2FA36B', glyph: '♥', price: 12.99},
  tasks: {name: 'Taskline', cat: 'Productivity', color: '#E0A21A', glyph: '✓', price: 9.99},
  ai: {name: 'Mindmate AI', cat: 'AI assistant', color: '#1F2A44', glyph: '✦', price: 20.0},
  photo: {name: 'Lumen', cat: 'Photo editor', color: '#D9466F', glyph: '◐', price: 10},
  calm: {name: 'Stillwater', cat: 'Meditation', color: '#3BA7A0', glyph: '◌', price: 8.99},
};

export const usd = (v: number, d = 2) => `$${v.toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d})}`;

/** Rounded-square app icon with a glyph. */
export const AppIcon: React.FC<{app: AppDef; size?: number; style?: React.CSSProperties}> = ({app, size = 96, style}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: `linear-gradient(145deg, ${app.color}, ${shade(app.color, -0.25)})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: size * 0.52,
      fontFamily: FONT_TITLE,
      fontWeight: 700,
      boxShadow: `0 ${size * 0.08}px ${size * 0.2}px rgba(0,0,0,0.3)`,
      flexShrink: 0,
      ...style,
    }}
  >
    {app.glyph}
  </div>
);

export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt < 0 ? c : 255 - c) * amt)));
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
}

/**
 * Smartphone with an HTML screen. `w` is the outer width; height follows a 19.5:9 ratio.
 * `tilt` rotates around the Y axis (degrees) for a little depth; `light` = light-mode screen.
 */
export const Phone: React.FC<{x: number; y: number; w?: number; tilt?: number; rot?: number; s?: number; o?: number; light?: boolean; buzz?: number; children?: React.ReactNode}> = ({
  x,
  y,
  w = 430,
  tilt = 0,
  rot = 0,
  s = 1,
  o = 1,
  light = true,
  buzz = 0,
  children,
}) => {
  const h = w * 2.05;
  const bx = buzz ? Math.sin(buzz * 60) * 6 * Math.min(1, buzz) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2 + bx,
        top: y - h / 2,
        width: w,
        height: h,
        opacity: o,
        transform: `perspective(1800px) rotateY(${tilt}deg) rotate(${rot}deg) scale(${s})`,
        transformOrigin: '50% 50%',
      }}
    >
      <div style={{position: 'absolute', inset: 0, borderRadius: w * 0.13, background: '#0B0D10', border: `${w * 0.012}px solid #3A414B`, boxShadow: '0 40px 90px rgba(0,0,0,0.55)'}} />
      <div
        style={{
          position: 'absolute',
          left: w * 0.045,
          top: w * 0.045,
          right: w * 0.045,
          bottom: w * 0.045,
          borderRadius: w * 0.1,
          overflow: 'hidden',
          background: light ? '#F7F3EC' : '#14181D',
          color: light ? '#15181C' : C.cream,
          fontFamily: FONT_BODY,
        }}
      >
        {/* status bar */}
        <div style={{height: w * 0.11, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${w * 0.07}px`, fontSize: w * 0.045, fontWeight: 700}}>
          <span>9:41</span>
          <span style={{width: w * 0.28, height: w * 0.06, borderRadius: w * 0.03, background: '#0B0D10'}} />
          <span>▮▮▮</span>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: w * 0.11, bottom: 0}}>{children}</div>
      </div>
    </div>
  );
};

/** One subscription row inside a phone list. `t` 0..1 reveals it. */
export const SubRow: React.FC<{app: AppDef; t: number; w: number; hi?: number; priceSuffix?: string}> = ({app, t, w, hi = 0, priceSuffix = '/mo'}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: w * 0.04,
      padding: `${w * 0.028}px ${w * 0.05}px`,
      opacity: t,
      transform: `translateX(${(1 - t) * 60}px)`,
      background: hi > 0 ? `rgba(245,158,11,${0.18 * hi})` : 'transparent',
      borderBottom: '2px solid rgba(0,0,0,0.07)',
    }}
  >
    <AppIcon app={app} size={w * 0.13} />
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{fontSize: w * 0.07, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{app.name}</div>
      <div style={{fontSize: w * 0.058, color: '#6A665F'}}>{app.cat}</div>
    </div>
    <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: w * 0.075}}>
      {usd(app.price)}
      <span style={{fontSize: w * 0.05, color: '#6A665F'}}>{priceSuffix}</span>
    </div>
  </div>
);

/** Push notification card (used over phones or floating in space). */
export const Notice: React.FC<{app: AppDef; title: string; body: string; w?: number; o?: number; ty?: number; style?: React.CSSProperties}> = ({app, title, body, w = 620, o = 1, ty = 0, style}) => (
  <div
    style={{
      width: w,
      opacity: o,
      transform: `translateY(${ty}px)`,
      background: 'rgba(247,243,236,0.96)',
      color: '#15181C',
      borderRadius: 26,
      padding: '18px 22px',
      display: 'flex',
      gap: 18,
      alignItems: 'center',
      boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
      fontFamily: FONT_BODY,
      ...style,
    }}
  >
    <AppIcon app={app} size={70} />
    <div style={{flex: 1}}>
      <div style={{fontWeight: 700, fontSize: 30}}>{title}</div>
      <div style={{fontSize: 28, color: '#4A4741'}}>{body}</div>
    </div>
  </div>
);

/** Fictional paywall screen (fills a phone screen). `pick` highlights an option index. */
export const Paywall: React.FC<{app: AppDef; w: number; options: {label: string; price: string; note?: string}[]; pick?: number; cta?: string; press?: number; badge?: string}> = ({
  app,
  w,
  options,
  pick = -1,
  cta = 'Continue',
  press = 0,
  badge,
}) => (
  <div style={{padding: w * 0.06, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box'}}>
    <div style={{display: 'flex', justifyContent: 'center', marginTop: w * 0.02}}>
      <AppIcon app={app} size={w * 0.22} />
    </div>
    <div style={{textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: w * 0.08, marginTop: w * 0.04, lineHeight: 1.1}}>{app.name} Premium</div>
    {badge && (
      <div style={{alignSelf: 'center', marginTop: w * 0.025, background: C.orange, color: C.bg, borderRadius: 99, padding: `${w * 0.008}px ${w * 0.04}px`, fontWeight: 700, fontSize: w * 0.045}}>{badge}</div>
    )}
    <div style={{display: 'flex', flexDirection: 'column', gap: w * 0.03, marginTop: w * 0.06}}>
      {options.map((op, i) => (
        <div
          key={op.label}
          style={{
            border: `${i === pick ? 5 : 3}px solid ${i === pick ? app.color : 'rgba(0,0,0,0.15)'}`,
            borderRadius: w * 0.05,
            padding: `${w * 0.035}px ${w * 0.05}px`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: i === pick ? `${app.color}18` : '#fff',
          }}
        >
          <div>
            <div style={{fontWeight: 700, fontSize: w * 0.074}}>{op.label}</div>
            {op.note && <div style={{fontSize: w * 0.056, color: '#6A665F'}}>{op.note}</div>}
          </div>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: w * 0.076}}>{op.price}</div>
        </div>
      ))}
    </div>
    <div style={{flex: 1}} />
    <div
      style={{
        background: app.color,
        color: '#fff',
        borderRadius: w * 0.06,
        textAlign: 'center',
        padding: `${w * 0.045}px 0`,
        fontWeight: 700,
        fontSize: w * 0.064,
        transform: `scale(${1 - 0.06 * press})`,
        marginBottom: w * 0.03,
      }}
    >
      {cta}
    </div>
  </div>
);

/** A fingertip / tap ripple at (x, y) in the parent's coordinates. `t` 0..1 animates the press. */
export const Tap: React.FC<{x: number; y: number; t: number; o?: number}> = ({x, y, t, o = 1}) => (
  <div style={{position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, opacity: o * (t > 0 ? 1 : 0), pointerEvents: 'none'}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 50, border: `5px solid ${C.orange}`, transform: `scale(${0.4 + 1.2 * t})`, opacity: 1 - t}} />
    <div style={{position: 'absolute', left: 30, top: 30, width: 40, height: 40, borderRadius: 20, background: 'rgba(245,158,11,0.85)', transform: `scale(${1 - 0.3 * Math.sin(Math.PI * Math.min(1, t * 2))})`}} />
  </div>
);

/** Generic credit card (not a real issuer). `declined` 0..1 shakes it and shows a red badge. */
export const PayCard: React.FC<{w?: number; declined?: number; label?: string}> = ({w = 520, declined = 0, label = 'DEBIT'}) => {
  const h = w * 0.62;
  const shake = declined > 0 && declined < 1 ? Math.sin(declined * 40) * 14 * (1 - declined) : 0;
  return (
    <div style={{width: w, height: h, position: 'relative', transform: `translateX(${shake}px)`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: w * 0.06, background: 'linear-gradient(135deg, #2C3440, #12161B)', border: '3px solid #4A5361', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}} />
      <div style={{position: 'absolute', left: w * 0.08, top: h * 0.3, width: w * 0.16, height: h * 0.2, borderRadius: 10, background: 'linear-gradient(135deg,#E8C26B,#B8913C)'}} />
      <div style={{position: 'absolute', left: w * 0.08, bottom: h * 0.14, fontFamily: FONT_TITLE, fontSize: w * 0.065, color: C.cream, letterSpacing: 4}}>•••• •••• •••• 4021</div>
      <div style={{position: 'absolute', right: w * 0.08, top: h * 0.12, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: w * 0.05, color: C.muted, letterSpacing: 3}}>{label}</div>
      <div style={{position: 'absolute', right: w * 0.08, bottom: h * 0.14, fontFamily: FONT_BODY, fontSize: w * 0.045, color: C.muted}}>EXP 09/25</div>
      {declined > 0.3 && (
        <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) rotate(-8deg) scale(${interpolate(declined, [0.3, 0.5], [1.4, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`, border: `6px solid ${C.red}`, color: C.red, background: 'rgba(17,20,24,0.85)', borderRadius: 14, padding: '8px 22px', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: w * 0.09}}>
          DECLINED
        </div>
      )}
    </div>
  );
};

/** Cream "paper" backdrop for archival / history scenes (keeps the brand palette, inverts the tone). */
export const PaperBackdrop: React.FC<{o?: number}> = ({o = 1}) => (
  <div style={{position: 'absolute', inset: 0, opacity: o, background: 'radial-gradient(ellipse at 50% 40%, #F6EFE2 0%, #E9DFCC 70%, #D9CCB4 100%)'}}>
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 18}).map((_, i) => (
        <line key={i} x1={0} x2={1920} y1={60 + i * 60} y2={60 + i * 60} stroke="rgba(17,20,24,0.06)" strokeWidth={2} />
      ))}
      <line x1={150} x2={150} y1={0} y2={1080} stroke="rgba(228,87,87,0.25)" strokeWidth={3} />
    </svg>
  </div>
);

export const INK = '#1B1F25';

/**
 * Keyframed camera over a large canvas: keys = [frame, x, y, zoom]; the canvas point (x, y) is centred.
 * Eased (smoothstep) between keys. Children are laid out in canvas coordinates.
 */
export const Camera: React.FC<{frame: number; keys: [number, number, number, number][]; sway?: number; children: React.ReactNode}> = ({frame, keys, sway = 0, children}) => {
  const ks = [...keys].sort((a, b) => a[0] - b[0]);
  let x = ks[0][1];
  let y = ks[0][2];
  let z = ks[0][3];
  for (let i = 0; i < ks.length - 1; i++) {
    const [f0, x0, y0, z0] = ks[i];
    const [f1, x1, y1, z1] = ks[i + 1];
    if (frame >= f1) {
      x = x1;
      y = y1;
      z = z1;
      continue;
    }
    if (frame > f0) {
      const p = (frame - f0) / Math.max(1, f1 - f0);
      const e = p * p * (3 - 2 * p);
      x = x0 + (x1 - x0) * e;
      y = y0 + (y1 - y0) * e;
      z = z0 * Math.pow(z1 / z0, e);
    }
    break;
  }
  // optional slow hand-held drift so camera holds never become frozen frames
  x += Math.sin(frame / 70) * sway;
  y += Math.cos(frame / 95) * sway * 0.5;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translate(960px, 540px) scale(${z}) translate(${-x}px, ${-y}px)`, transformOrigin: '0 0'}}>{children}</div>
    </div>
  );
};

/** Little person figure (SVG) used in crowds / funnels. */
export const Figure: React.FC<{color?: string; s?: number}> = ({color = C.cream, s = 1}) => (
  <g transform={`scale(${s})`}>
    <circle cx={0} cy={-34} r={12} fill={color} />
    <path d="M-16 0 Q-16 -20 0 -20 Q16 -20 16 0 Z" fill={color} />
  </g>
);
