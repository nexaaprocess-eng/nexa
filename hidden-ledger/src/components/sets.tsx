import React from 'react';
import {Box, Pallet, Truck} from './icons';
import {C} from '../themes/theme';

// Reusable animated 2D "sets": full-frame environments drawn in the 1920x1080 SVG space.
// They are pure functions of time/progress props, so any scene can drive them from narration beats.

/** Deterministic pseudo-random in [0,1). */
export const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const wrap = (v: number, period: number) => ((v % period) + period) % period;

// ------------------------------------------------------------------ street with parallax
export const StreetSet: React.FC<{scroll: number; horizon?: number}> = ({scroll, horizon = 760}) => {
  const sky = Array.from({length: 26});
  const houses = Array.from({length: 7});
  return (
    <g>
      {/* skyline (slow layer) */}
      {sky.map((_, i) => {
        const w = 60 + rnd(i) * 90;
        const h = 120 + rnd(i + 50) * 260;
        const x = wrap(i * 110 - scroll * 0.15, 26 * 110) - 120;
        return (
          <g key={`s${i}`}>
            <rect x={x} y={horizon - 60 - h} width={w} height={h + 60} fill="#181D24" />
            {Array.from({length: Math.floor(h / 46)}).map((__, k) =>
              rnd(i * 31 + k) > 0.55 ? <rect key={k} x={x + 14} y={horizon - 40 - h + k * 46} width={12} height={16} fill="rgba(245,158,11,0.25)" /> : null,
            )}
          </g>
        );
      })}
      {/* houses (mid layer) */}
      {houses.map((_, i) => {
        const x = wrap(i * 420 - scroll * 0.55, 7 * 420) - 300;
        const body = [C.panel, '#232A33', '#1F262E'][i % 3];
        return (
          <g key={`h${i}`} transform={`translate(${x} ${horizon})`} stroke={C.cream} strokeWidth={4} strokeLinejoin="round">
            <path d="M0 -190 L130 -300 L260 -190" fill={body} />
            <rect x={14} y={-190} width={232} height={190} fill={body} />
            <rect x={110} y={-110} width={50} height={110} fill={i % 2 ? C.orange : C.blue} />
            <rect x={36} y={-160} width={48} height={42} fill={rnd(i) > 0.4 ? 'rgba(245,158,11,0.55)' : C.bg} />
            <rect x={180} y={-160} width={48} height={42} fill={rnd(i + 9) > 0.5 ? 'rgba(245,158,11,0.55)' : C.bg} />
          </g>
        );
      })}
      {/* sidewalk + road (fast layer) */}
      <rect x={0} y={horizon} width={1920} height={40} fill="#2A3038" />
      <rect x={0} y={horizon + 40} width={1920} height={1080 - horizon - 40} fill="#15191E" />
      {Array.from({length: 12}).map((_, i) => (
        <rect key={i} x={wrap(i * 200 - scroll, 2400) - 200} y={horizon + 150} width={110} height={12} rx={6} fill="rgba(243,235,221,0.35)" />
      ))}
    </g>
  );
};

// ------------------------------------------------------------------ conveyor belt
export const Conveyor: React.FC<{
  x0?: number;
  x1?: number;
  y: number;
  t: number; // seconds
  speed?: number; // px per second
  gap?: number;
  scale?: number;
  flag?: (i: number) => boolean;
  scannerX?: number;
  showItems?: boolean;
}> = ({x0 = -100, x1 = 2020, y, t, speed = 260, gap = 190, scale = 0.42, flag, scannerX, showItems = true}) => {
  const offset = t * speed;
  const first = Math.floor((offset - (x1 - x0)) / gap) - 1;
  const items = [];
  for (let k = first; k <= Math.floor(offset / gap) + 1; k++) {
    const x = x0 + offset - k * gap;
    if (x < x0 - 100 || x > x1 + 100) continue;
    const red = flag ? flag(k) && scannerX !== undefined && x > scannerX : false;
    items.push(
      <g key={k} transform={`translate(${x} ${y - 52 * scale * 2.1}) scale(${scale})`}>
        <Box fill={red ? C.red : '#C8A675'} />
      </g>,
    );
  }
  const rollers = Math.ceil((x1 - x0) / 60);
  return (
    <g>
      <rect x={x0} y={y} width={x1 - x0} height={26} rx={13} fill="#2A3038" stroke={C.cream} strokeWidth={3} />
      {Array.from({length: rollers}).map((_, i) => (
        <g key={i} transform={`translate(${x0 + 30 + i * 60} ${y + 13}) rotate(${(offset / 9) * 57.3})`}>
          <circle r={9} fill={C.bg} stroke={C.muted} strokeWidth={2} />
          <line x1={-7} y1={0} x2={7} y2={0} stroke={C.muted} strokeWidth={2} />
        </g>
      ))}
      {Array.from({length: Math.ceil((x1 - x0) / 300)}).map((_, i) => (
        <rect key={`l${i}`} x={x0 + 120 + i * 300} y={y + 26} width={14} height={1080 - y} fill="#1D2229" />
      ))}
      {showItems && items}
      {scannerX !== undefined && (
        <g>
          <path d={`M${scannerX - 90} ${y} L${scannerX - 90} ${y - 210} L${scannerX + 90} ${y - 210} L${scannerX + 90} ${y}`} fill="none" stroke={C.cream} strokeWidth={8} />
          <rect x={scannerX - 100} y={y - 232} width={200} height={34} rx={8} fill={C.panel} stroke={C.cream} strokeWidth={4} />
          <rect x={scannerX - 3} y={y - 198} width={6} height={198} fill={C.red} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 7))} />
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ warehouse interior
export const WarehouseSet: React.FC<{t: number; fill?: number}> = ({t, fill = 1}) => {
  const racks = [0, 1, 2, 3];
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#14181D" />
      {/* roof trusses */}
      {Array.from({length: 9}).map((_, i) => (
        <path key={i} d={`M${i * 240} 120 L${i * 240 + 120} 60 L${i * 240 + 240} 120`} fill="none" stroke="#232A33" strokeWidth={6} />
      ))}
      {/* hanging lights with cones */}
      {[320, 960, 1600].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={60} x2={x} y2={150} stroke="#2A3038" strokeWidth={4} />
          <path d={`M${x - 40} 170 L${x + 40} 170 L${x + 260} 820 L${x - 260} 820 Z`} fill="rgba(245,158,11,0.05)" opacity={0.8 + 0.2 * Math.sin(t * 2 + i)} />
          <rect x={x - 40} y={150} width={80} height={20} rx={6} fill={C.orange} />
        </g>
      ))}
      {/* racks */}
      {racks.map((r) => (
        <g key={r} transform={`translate(${120 + r * 440} 240)`}>
          {[0, 1, 2].map((lvl) => (
            <g key={lvl}>
              <rect x={0} y={lvl * 170 + 150} width={380} height={12} fill={C.orange} opacity={0.85} />
              {Array.from({length: 4}).map((_, k) => {
                const idx = r * 12 + lvl * 4 + k;
                const show = rnd(idx) < fill;
                return show ? (
                  <g key={k} transform={`translate(${50 + k * 92} ${lvl * 170 + 108}) scale(0.48)`}>
                    <Box />
                  </g>
                ) : null;
              })}
            </g>
          ))}
          <rect x={-8} y={0} width={16} height={520} fill="#2A3038" />
          <rect x={372} y={0} width={16} height={520} fill="#2A3038" />
        </g>
      ))}
      {/* floor */}
      <rect x={0} y={760} width={1920} height={320} fill="#101317" />
      {Array.from({length: 13}).map((_, i) => (
        <line key={i} x1={960 + (i - 6) * 60} y1={760} x2={960 + (i - 6) * 340} y2={1080} stroke="#1B2027" strokeWidth={3} />
      ))}
    </g>
  );
};

// ------------------------------------------------------------------ loading dock
export const DockSet: React.FC<{t: number; truckIn: number; loaded: number}> = ({t, truckIn, loaded}) => {
  const truckX = 1500 - 420 * truckIn;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#14181D" />
      {/* building wall + dock door */}
      <rect x={0} y={180} width={1180} height={620} fill="#1A1F26" />
      <rect x={760} y={360} width={360} height={360} fill="#0E1114" stroke={C.cream} strokeWidth={6} />
      {Array.from({length: 6}).map((_, i) => (
        <line key={i} x1={760} y1={370 + i * 22} x2={1120} y2={370 + i * 22} stroke="#2A3038" strokeWidth={6} />
      ))}
      <rect x={720} y={720} width={440} height={80} fill={C.orange} />
      {/* conveyor feeding the dock */}
      <Conveyor x0={-60} x1={760} y={640} t={t} speed={300} gap={170} scale={0.4} />
      {/* pallet stack growing inside the trailer as it loads */}
      <g transform={`translate(${truckX + 180} 600) scale(${0.5 + 0.5 * loaded})`} opacity={Math.min(1, loaded * 3)}>
        <Pallet n={Math.max(1, Math.round(6 * loaded))} />
      </g>
      {/* truck (trailer facing the dock) */}
      <g transform={`translate(${truckX + 420} 650) scale(-2.4 2.4)`}>
        <Truck wheel={t * 120 * (1 - truckIn)} />
      </g>
      <rect x={0} y={800} width={1920} height={280} fill="#101317" />
      {Array.from({length: 10}).map((_, i) => (
        <rect key={i} x={i * 210 + 20} y={900} width={120} height={10} fill="#2A3038" />
      ))}
    </g>
  );
};

/** A rounded "cinematic window" that frames part of a full-frame set (viewBox crop), for scenes with a persistent header. */
export const SetWindow: React.FC<{x: number; y: number; w: number; h: number; view: [number, number, number, number]; o?: number; children: React.ReactNode}> = ({
  x,
  y,
  w,
  h,
  view,
  o = 1,
  children,
}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', borderRadius: 26, border: `3px solid ${C.line}`, opacity: o, boxShadow: '0 30px 70px rgba(0,0,0,0.45)'}}>
    <svg viewBox={view.join(' ')} width={w} height={h} preserveAspectRatio="xMidYMid slice">
      {children}
    </svg>
  </div>
);
