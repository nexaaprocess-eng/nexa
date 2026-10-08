import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {clamp, E, ev, mix, p, rr, tl, useT} from '../anim';
import {Glow, Reveal} from '../components/Common';
import {Logo} from '../components/Logo';
import {Icon} from '../components/Icon';

// Posición del logo en pantalla
const LW = 820, LX = (1080 - LW) / 2, LCY = 860;
const S = LW / 785, LT = LCY - (LW * 310) / 785 / 2;
const toScreen = (ux: number, uy: number) => ({x: LX + (ux + 10) * S, y: LT + (uy + 10) * S});

// Formas del logo para colocar las partículas encima de las letras
const POLYS: number[][][] = [
  [[0, 190], [0, 0], [48, 0], [124, 104], [124, 0], [170, 0], [170, 190], [122, 190], [46, 86], [46, 190]],
  [[190, 0], [340, 0], [340, 40], [236, 40], [236, 75], [332, 75], [332, 115], [236, 115], [236, 150], [340, 150], [340, 190], [190, 190]],
  [[350, 0], [405, 0], [565, 190], [510, 190]],
  [[500, 0], [555, 0], [410, 190], [355, 190]],
  [[575, 190], [648, 0], [692, 0], [765, 190], [715, 190], [670, 72], [625, 190]],
];
const inside = (x: number, y: number, poly: number[][]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const PARTS: {sx: number; sy: number; tx: number; ty: number; d: number; g: boolean}[] = [];
for (let k = 0; PARTS.length < 170 && k < 5000; k++) {
  const ux = rr('px' + k, 0, 765), uy = rr('py' + k, 0, 190);
  const hit = POLYS.findIndex((poly) => inside(ux, uy, poly));
  if (hit < 0) continue;
  const a = rr('pa' + k, 0, Math.PI * 2), r = rr('pr' + k, 450, 1100);
  const T = toScreen(ux, uy);
  PARTS.push({sx: 540 + Math.cos(a) * r, sy: 930 + Math.sin(a) * r * 1.3, tx: T.x, ty: T.y, d: rr('pd' + k, 0, 0.25), g: hit === 2});
}

const MODULES = [
  {x: 225, y: 420, icon: 'file', label: 'Facturas'},
  {x: 855, y: 420, icon: 'mail', label: 'Correo'},
  {x: 225, y: 1380, icon: 'box', label: 'Stock'},
  {x: 855, y: 1380, icon: 'users', label: 'CRM'},
  {x: 540, y: 1530, icon: 'chart', label: 'Informes'},
];

export const S2Brand: React.FC = () => {
  const t = useT();
  const [start, end] = tl.scenes.s2;
  const L = ev.s2_logo;
  const exit = p(t, end - 0.4, 0.4, E.inCubic);
  const push = mix(1, 1.06, p(t, start, end - start, E.inOutSine));
  const breathe = 0.85 + 0.15 * Math.sin((t - L) * 2.2);
  const halo = p(t, L - 0.1, 0.8, E.outCubic) * breathe;
  const conv = (k: number) => p(t, start + PARTS[k].d, L - start - 0.05 - PARTS[k].d, E.inOutCubic);
  const partFade = 1 - p(t, L + 0.05, 0.45, E.outCubic);

  return (
    <AbsoluteFill style={{transform: `scale(${push + exit * 0.25})`, opacity: 1 - exit}}>
      <Glow x={540} y={LCY} r={720} o={0.7 * halo} />
      <Glow x={540} y={LCY} r={320} o={0.5 * halo} color="61,220,151" />

      {/* módulos digitales conectados al fondo */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {MODULES.map((m, i) => {
          const at = ev.s2_links + i * 0.18;
          const v = p(t, at, 0.7, E.inOutCubic);
          const tx = 540, ty = m.y < LCY ? LT - 20 : LT + (LW * 310) / 785 + 150;
          const midY = (m.y + ty) / 2;
          const d = `M${m.x} ${m.y} C ${m.x} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
          const ph = (t * 0.7 + i * 0.23) % 1;
          return (
            <g key={i} opacity={0.9}>
              <path d={d} fill="none" stroke={C.green300} strokeOpacity={0.28} strokeWidth={2} pathLength={1}
                strokeDasharray="1 1" strokeDashoffset={1 - v} />
              {v >= 1 && (
                <path d={d} fill="none" stroke={C.green300} strokeWidth={3} pathLength={1}
                  strokeDasharray="0.08 0.92" strokeDashoffset={-ph} strokeLinecap="round"
                  style={{filter: 'drop-shadow(0 0 6px #3DDC97)'}} />
              )}
            </g>
          );
        })}
      </svg>
      {MODULES.map((m, i) => {
        const v = p(t, ev.s2_links - 0.3 + i * 0.18, 0.6, E.outBack);
        const fl = Math.sin(t * 1.4 + i * 1.7) * 6;
        return (
          <div key={i} style={{position: 'absolute', left: m.x - 95, top: m.y - 52 + fl, width: 190, height: 104,
            borderRadius: 24, background: C.panel, border: `1.5px solid ${C.line}`,
            boxShadow: '0 20px 50px -20px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.06)',
            display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px',
            opacity: clamp(v) * 0.92, transform: `scale(${0.6 + 0.4 * v})`, color: C.green300}}>
            <Icon name={m.icon} size={34} stroke={1.8} />
            <span style={{fontFamily: F.body, fontWeight: 600, fontSize: 25, color: C.white}}>{m.label}</span>
          </div>
        );
      })}

      {/* partículas que forman el logo */}
      {partFade > 0 && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {PARTS.map((q, k) => {
            const v = conv(k);
            const sw = (1 - v) * 120;
            const x = mix(q.sx, q.tx, v) + Math.sin(k + t * 3) * sw * 0.3;
            const y = mix(q.sy, q.ty, v) + Math.cos(k + t * 3) * sw * 0.3;
            return <circle key={k} cx={x} cy={y} r={q.g ? 4 : 3} fill={q.g ? C.green300 : C.white}
              opacity={partFade * (0.35 + 0.65 * v)} />;
          })}
        </svg>
      )}

      <div style={{position: 'absolute', left: LX, top: LT}}>
        <Logo id="s2" width={LW} line={1} green={p(t, L - 0.15, 0.4)} bar={p(t, L, 0.5, E.outCubic)}
          letters={p(t, L + 0.05, 0.9, E.linear)} process={p(t, L + 0.45, 0.7)} glow={0.7 * halo} />
      </div>
      {/* destello al formarse el logo */}
      <Glow x={540} y={LCY} r={560} o={Math.max(0, 1 - Math.abs(t - L - 0.05) / 0.3) * 0.8} color="200,255,230" />

      <div style={{position: 'absolute', left: 0, right: 0, top: LCY + 230}}>
        <div style={{margin: '0 auto 30px', width: 380 * p(t, ev.s2_sub - 0.2, 0.8, E.inOutCubic), height: 2,
          background: `linear-gradient(90deg, transparent, ${C.green300}, transparent)`}} />
        <Reveal text="Automatización" at={ev.s2_sub} size={38} weight={700} tracking="0.18em" stagger={0.05} />
        <Reveal text="+ inteligencia artificial" at={ev.s2_sub + 0.2} size={38} weight={700} tracking="0.18em"
          stagger={0.08} accent={['+']} style={{marginTop: 8}} />
      </div>
    </AbsoluteFill>
  );
};
