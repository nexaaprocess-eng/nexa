import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {clamp, E, ev, mix, p, rr, tl, useT} from '../anim';
import {Glow} from '../components/Common';
import {Icon} from '../components/Icon';

const CX = 540, CY = 840, R = 340;
const NODES = [
  {a: -135, icon: 'file', label: 'Documentos'},
  {a: -45, icon: 'mail', label: 'Correo'},
  {a: 135, icon: 'box', label: 'Inventario'},
  {a: 45, icon: 'users', label: 'CRM'},
].map((n) => ({...n, x: CX + Math.cos((n.a * Math.PI) / 180) * R, y: CY + Math.sin((n.a * Math.PI) / 180) * R * 1.12}));
const DUST = Array.from({length: 90}, (_, i) => ({a: rr('da' + i, 0, Math.PI * 2), r0: rr('dr' + i, 120, 900), sp: rr('ds' + i, 0.05, 0.16), s: rr('dz' + i, 1.2, 3.2)}));

/** Texto que se transforma letra a letra en otro. */
const Morph: React.FC<{from: string[]; to: string[]; at: number; t: number; inAt: number}> = ({from, to, at, t, inAt}) => {
  const lineStyle: React.CSSProperties = {display: 'flex', justifyContent: 'center', height: 104};
  const ch = (c: string, k: number, v: number, dir: number, green: boolean) => (
    <span key={k} style={{display: 'inline-block', whiteSpace: 'pre', opacity: v, color: green ? C.green300 : C.white,
      transform: `translateY(${(1 - v) * 60 * dir}px) scale(${mix(0.6, 1, v)})`, filter: v < 1 ? `blur(${(1 - v) * 14}px)` : undefined,
      textShadow: green ? '0 0 40px rgba(0,168,107,.7)' : undefined}}>{c}</span>
  );
  let k1 = 0, k2 = 0;
  return (
    <div style={{position: 'relative', fontFamily: F.head, fontWeight: 800, fontSize: 92, letterSpacing: '-0.025em', lineHeight: '104px'}}>
      <div style={{position: 'absolute', left: 0, right: 0}}>
        {from.map((ln, li) => (
          <div key={li} style={lineStyle}>{[...ln].map((c) => {
            const k = k1++;
            const vin = p(t, inAt + k * 0.025, 0.55, E.outQuart);
            const vout = 1 - p(t, at - 0.05 + k * 0.012, 0.3, E.inCubic);
            return ch(c, k, Math.min(vin, vout), t < at - 0.05 ? 1 : -1, false);
          })}</div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0}}>
        {to.map((ln, li) => (
          <div key={li} style={lineStyle}>{[...ln].map((c) => {
            const k = k2++;
            return ch(c, k, p(t, at + 0.22 + k * 0.022, 0.6, E.outQuart), 1, li === 1);
          })}</div>
        ))}
      </div>
    </div>
  );
};

export const S5AI: React.FC = () => {
  const t = useT();
  const [start, end] = tl.scenes.s5;
  const core = p(t, ev.s5_core, 0.9, E.outBack);
  const enter = p(t, start, 0.8, E.outCubic);
  const collapse = p(t, end - 0.5, 0.5, E.inQuart);
  const lift = p(t, ev.s5_menos - 0.4, 0.9, E.inOutCubic);
  const allOn = p(t, ev.s5_nodes[3] + 0.4, 0.6);
  const masFlash = Math.max(0, 1 - Math.abs(t - ev.s5_mas - 0.1) / 0.35);
  const shock = p(t, ev.s5_mas, 1.0, E.outCubic);
  const energy = 0.6 + 0.4 * allOn + masFlash * 0.6;
  const spin = t * 18;

  return (
    <AbsoluteFill style={{opacity: enter * (1 - p(t, end - 0.25, 0.25))}}>
      {/* polvo de datos atraído hacia el núcleo */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {DUST.map((d, i) => {
          const ph = (t * d.sp + i * 0.031) % 1;
          const r = d.r0 * (1 - ph) + 60;
          const a = d.a + ph * 1.2;
          return <circle key={i} cx={CX + Math.cos(a) * r} cy={CY - lift * 160 + Math.sin(a) * r * 1.2} r={d.s * (0.5 + ph)} fill={C.green300} opacity={Math.sin(ph * Math.PI) * 0.6 * core} />;
        })}
      </svg>

      <div style={{position: 'absolute', inset: 0, transformOrigin: `${CX}px ${CY}px`,
        transform: `translateY(${-lift * 170}px) scale(${mix(1.15, 1, enter) * mix(1, 0.86, lift) * (1 - collapse)}) rotate(${mix(-6, 4, p(t, start, end - start, E.inOutSine))}deg)`}}>
        <Glow x={CX} y={CY} r={760} o={0.55 * core * energy} />

        {/* conexiones */}
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {NODES.map((n, i) => {
            const at = ev.s5_nodes[i];
            const v = p(t, at - 0.35, 0.45, E.inOutCubic);
            const mx = (CX + n.x) / 2 + (n.y - CY) * 0.25, my = (CY + n.y) / 2 - (n.x - CX) * 0.25;
            const d = `M${CX} ${CY} Q ${mx} ${my} ${n.x} ${n.y}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={C.green300} strokeOpacity={0.35} strokeWidth={2.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - v} />
                {v >= 1 && [0, 0.5].map((o) => (
                  <path key={o} d={d} fill="none" stroke="#C8FFE6" strokeWidth={5} pathLength={1} strokeLinecap="round"
                    strokeDasharray="0.06 0.94" strokeDashoffset={-((t * (0.8 + allOn * 0.6) + o + i * 0.17) % 1)}
                    style={{filter: 'drop-shadow(0 0 8px #3DDC97)'}} />
                ))}
              </g>
            );
          })}
          {/* anillo entre nodos, cuando todo está conectado */}
          <ellipse cx={CX} cy={CY} rx={R} ry={R * 1.12} fill="none" stroke={C.green300} strokeOpacity={0.25 * allOn} strokeWidth={2}
            pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - allOn} />
          {/* onda expansiva */}
          {shock > 0 && shock < 1 && <circle cx={CX} cy={CY} r={120 + shock * 700} fill="none" stroke={C.green300} strokeWidth={3} opacity={(1 - shock) * 0.7} />}
        </svg>

        {/* núcleo de IA */}
        <div style={{position: 'absolute', left: CX - 200, top: CY - 200, width: 400, height: 400, transform: `scale(${core})`}}>
          <svg width={400} height={400} viewBox="-200 -200 400 400" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <g transform={`rotate(${spin})`}><circle r={180} fill="none" stroke={C.green300} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="4 14" /></g>
            <g transform={`rotate(${-spin * 1.6})`}><circle r={150} fill="none" stroke={C.green300} strokeOpacity={0.6} strokeWidth={3} strokeDasharray="90 40 10 40" /></g>
            <g transform={`rotate(${spin * 2.4})`}><circle r={122} fill="none" stroke={C.green} strokeOpacity={0.9} strokeWidth={2} strokeDasharray="200 566" /></g>
            {Array.from({length: 24}, (_, k) => {
              const a = (k / 24) * Math.PI * 2 + t * 0.4;
              return <line key={k} x1={Math.cos(a) * 192} y1={Math.sin(a) * 192} x2={Math.cos(a) * 202} y2={Math.sin(a) * 202} stroke={C.green300} strokeOpacity={0.5} strokeWidth={2} />;
            })}
          </svg>
          <div style={{position: 'absolute', left: 100, top: 100, width: 200, height: 200, borderRadius: 100,
            background: 'radial-gradient(circle at 42% 38%, #E9FFF5 0%, #7DF0BF 18%, #00A86B 48%, #014D31 78%, #012015 100%)',
            boxShadow: `0 0 ${80 * energy}px ${20 * energy}px rgba(0,168,107,.65), 0 0 ${200 * energy}px ${40 * energy}px rgba(0,168,107,.35), inset 0 0 40px rgba(0,0,0,.35)`,
            transform: `scale(${1 + 0.04 * Math.sin(t * 5) + masFlash * 0.12})`}} />
          <div style={{position: 'absolute', left: 100, top: 100, width: 200, height: 200, display: 'grid', placeItems: 'center',
            fontFamily: F.head, fontWeight: 800, fontSize: 64, color: '#03140D', letterSpacing: '-0.02em'}}>IA</div>
        </div>

        {/* nodos */}
        {NODES.map((n, i) => {
          const at = ev.s5_nodes[i];
          const appear = p(t, ev.s5_core + 0.2 + i * 0.08, 0.6, E.outBack);
          const on = p(t, at, 0.35, E.outCubic);
          const ping = p(t, at, 0.8, E.outCubic);
          return (
            <div key={i} style={{position: 'absolute', left: n.x - 75, top: n.y - 75, width: 150, height: 150, transform: `scale(${appear})`}}>
              {ping > 0 && ping < 1 && <div style={{position: 'absolute', inset: 0, borderRadius: 75, border: `3px solid ${C.green300}`, transform: `scale(${1 + ping * 0.9})`, opacity: 1 - ping}} />}
              <div style={{position: 'absolute', inset: 0, borderRadius: 75, display: 'grid', placeItems: 'center',
                background: on ? `rgba(0,168,107,${0.12 + on * 0.18})` : 'rgba(255,255,255,.04)',
                border: `2px solid rgba(${on ? '61,220,151' : '255,255,255'},${0.18 + on * 0.6})`,
                boxShadow: `0 0 ${on * 50}px rgba(0,168,107,.6), inset 0 1px 0 rgba(255,255,255,.08)`,
                color: on > 0.5 ? C.white : C.text3}}>
                <Icon name={n.icon} size={64} stroke={1.7} />
              </div>
              <div style={{position: 'absolute', left: -60, right: -60, top: n.y < CY ? -54 : 166, textAlign: 'center',
                fontFamily: F.body, fontWeight: 600, fontSize: 26, color: C.white, opacity: on, letterSpacing: '0.02em'}}>{n.label}</div>
            </div>
          );
        })}
      </div>

      {/* MENOS TAREAS REPETITIVAS → MÁS TIEMPO PARA CRECER */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1290, opacity: 1 - collapse}}>
        <Morph from={['MENOS TAREAS', 'REPETITIVAS']} to={['MÁS TIEMPO', 'PARA CRECER']} inAt={ev.s5_menos} at={ev.s5_mas} t={t} />
      </div>
      <Glow x={CX} y={CY - lift * 170} r={900} o={masFlash * 0.5} color="160,255,210" />
      {/* colapso a un punto antes del cierre */}
      {collapse > 0 && <div style={{position: 'absolute', left: CX - 6, top: CY - lift * 170 - 6, width: 12, height: 12, borderRadius: 6, background: '#fff',
        boxShadow: `0 0 40px 12px ${C.green300}`, opacity: collapse * (1 - p(t, end - 0.12, 0.12))}} />}
    </AbsoluteFill>
  );
};
