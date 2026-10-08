import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {clamp, E, ev, mix, p, rr, tl, useT} from '../anim';
import {Glow, Reveal} from '../components/Common';

// Red de nodos que nace de un punto verde.
const CX = 540, CY = 930;
type N = {x: number; y: number; r: number; at: number};
const NODES: N[] = Array.from({length: 46}, (_, i) => {
  const a = rr('a' + i, 0, Math.PI * 2);
  const d = 150 + Math.pow(rr('d' + i, 0, 1), 0.75) * 900;
  return {x: CX + Math.cos(a) * d * 0.82, y: CY + Math.sin(a) * d * 1.15, r: d, at: 0};
}).map((n) => ({...n, at: ev.s1_net + (n.r / 1050) * 1.25}));
const EDGES: [number, number][] = [];
NODES.forEach((n, i) => {
  if (n.r < 360) EDGES.push([-1, i]);
  const near = NODES.map((m, j) => ({j, d: Math.hypot(m.x - n.x, m.y - n.y)}))
    .filter((o) => o.j !== i && NODES[o.j].r < n.r).sort((a, b) => a.d - b.d).slice(0, 2);
  near.forEach((o) => EDGES.push([o.j, i]));
});
const pt = (i: number) => (i < 0 ? {x: CX, y: CY, at: ev.s1_net} : NODES[i]);

export const S1Hook: React.FC = () => {
  const t = useT();
  const [, end] = tl.scenes.s1;
  const dot = p(t, ev.s1_dot, 0.5, E.outBack);
  const textOn = p(t, ev.s1_text1, 1.2, E.inOutCubic);
  // cámara: acercamiento suave y, al final, zoom rápido hacia la siguiente escena
  const push = mix(1, 1.1, p(t, 0, end, E.inOutSine));
  const exit = p(t, end - 0.45, 0.45, E.inQuart);
  const netO = mix(1, 0.38, textOn) * (1 - exit);

  return (
    <AbsoluteFill style={{transform: `scale(${push * (1 + exit * 0.35)})`, opacity: 1 - exit * 0.9}}>
      <Glow x={CX} y={CY} r={mix(40, 620, p(t, ev.s1_net, 2.2, E.outCubic))} o={0.55 * dot} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: netO,
        filter: textOn > 0.01 ? `blur(${textOn * 2.5}px)` : undefined, transform: `scale(${1 + textOn * 0.08})`}}>
        {EDGES.map(([a, b], k) => {
          const A = pt(a), B = NODES[b];
          const v = p(t, A.at, Math.max(0.2, B.at - A.at), E.outCubic);
          if (v <= 0) return null;
          // pulso de datos que recorre la línea
          const ph = ((t * 0.9 + k * 0.137) % 1);
          return (
            <g key={k}>
              <line x1={A.x} y1={A.y} x2={mix(A.x, B.x, v)} y2={mix(A.y, B.y, v)}
                stroke={C.green300} strokeOpacity={0.35} strokeWidth={1.6} />
              {v >= 1 && k % 3 === 0 && (
                <circle cx={mix(A.x, B.x, ph)} cy={mix(A.y, B.y, ph)} r={2.6} fill={C.green300} opacity={Math.sin(ph * Math.PI)} />
              )}
            </g>
          );
        })}
        {NODES.map((n, i) => {
          const v = p(t, n.at, 0.35, E.outBack);
          if (v <= 0) return null;
          const tw = 0.6 + 0.4 * Math.sin(t * 3 + i);
          return (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={14 * v} fill={C.green} opacity={0.12 * tw} />
              <circle cx={n.x} cy={n.y} r={(i % 4 === 0 ? 4.5 : 3) * v} fill={i % 4 === 0 ? C.white : C.green300} opacity={tw} />
            </g>
          );
        })}
      </svg>
      {/* punto inicial */}
      <div style={{position: 'absolute', left: CX - 9, top: CY - 9, width: 18, height: 18, borderRadius: 9,
        background: C.white, transform: `scale(${dot * (1 - textOn * 0.6)})`,
        boxShadow: `0 0 18px 6px ${C.green300}, 0 0 60px 24px rgba(0,168,107,.6)`}} />
      {/* pregunta */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 30,
        transform: `scale(${mix(0.96, 1.04, p(t, ev.s1_text1, end - ev.s1_text1, E.outCubic))})`}}>
        <Reveal text="¿Tu empresa sigue" at={ev.s1_text1} size={58} weight={600} tracking="-0.01em" />
        <div style={{height: 10}} />
        <Reveal text="haciéndolo todo" at={ev.s1_text2} size={84} stagger={0.1} />
        <Reveal text="a mano?" at={ev.s1_text2 + 0.45} size={140} accent={['MANO', 'mano']} stagger={0.12} lineHeight={1.02} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: clamp(1 - t / 0.3), background: '#000'}} />
    </AbsoluteFill>
  );
};
