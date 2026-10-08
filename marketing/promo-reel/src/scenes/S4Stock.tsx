import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {clamp, E, ev, mix, p, tl, useT, fmt} from '../anim';
import {Reveal} from '../components/Common';
import {Chip, LiveDot} from '../components/Window';
import {Icon} from '../components/Icon';

const Panel: React.FC<{x: number; y: number; w: number; h: number; at: number; t: number; children: React.ReactNode; z?: number}> = ({x, y, w, h, at, t, children, z = 0}) => {
  const v = p(t, at, 0.8, E.outQuart);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 30,
      background: 'linear-gradient(180deg, rgba(12,32,24,.9), rgba(5,16,12,.92))', border: `1.5px solid rgba(61,220,151,.2)`,
      boxShadow: '0 40px 80px -30px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.06)',
      opacity: v, transform: `translateZ(${(1 - v) * -300 + z}px) translateY(${(1 - v) * 80}px)`, overflow: 'hidden'}}>
      {children}
    </div>
  );
};

// Serie de ventas ficticia (30 días)
const SERIES = Array.from({length: 30}, (_, i) => 40 + i * 1.5 + Math.sin(i * 0.9) * 8 + Math.sin(i * 0.37 + 1) * 6 + (i > 24 ? (i - 24) * 3 : 0));
const PRODUCTS = [
  {n: 'Caja cartón 40×30', u: 312, max: 400},
  {n: 'Etiqueta térmica', u: 1840, max: 2400},
  {n: 'Film estirable', u: 18, max: 200, low: true},
  {n: 'Palé europeo', u: 96, max: 140},
];
const APPS = [
  {n: 'Tienda', i: 'store'}, {n: 'ERP', i: 'db'}, {n: 'Almacén', i: 'box'}, {n: 'Contab.', i: 'calc'},
];

export const S4Stock: React.FC = () => {
  const t = useT();
  const [start, end] = tl.scenes.s4;
  const enter = p(t, start, 1.1, E.outQuart);
  const exit = p(t, end - 0.4, 0.4, E.inCubic);
  const drift = p(t, start, end - start, E.inOutSine);
  const A = start + 0.2;
  const reorder = ev.s4_sync[1];
  const cw = 868, ch = 220;
  const chartV = p(t, ev.s4_chart, 1.6, E.inOutCubic);
  const max = Math.max(...SERIES), min = Math.min(...SERIES);
  const pts = SERIES.map((v, i) => [(i / 29) * cw, ch - ((v - min) / (max - min)) * (ch - 30) - 10]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const head = pts[Math.min(29, Math.floor(chartV * 29))];

  return (
    <AbsoluteFill style={{opacity: 1 - exit}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230}}>
        <Reveal text={'Tu stock,\nbajo control'} at={start + 0.4} size={78} accent={['control']} />
      </div>
      <div style={{position: 'absolute', inset: 0, perspective: 2000, perspectiveOrigin: '50% 20%'}}>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d',
          transform: `translateY(${(1 - enter) * 300 - exit * 120}px) rotateX(${mix(28, 6, enter) - drift * 4}deg) rotateZ(${mix(-3, 0, enter)}deg) scale(${mix(1, 1.035, drift)})`}}>

          {/* KPIs */}
          {[
            {l: 'Productos', v: 1248, i: 'box'},
            {l: 'Pedidos hoy', v: 86, i: 'cart'},
            {l: 'Stock crítico', v: t > reorder + 0.3 ? 0 : 1, i: 'alert', warn: true},
          ].map((k, i) => {
            const cnt = p(t, A + 0.1 + i * 0.12, 1.4, E.outCubic);
            const warn = k.warn && k.v > 0;
            return (
              <Panel key={i} x={70 + i * 320} y={520} w={300} h={170} at={A + i * 0.1} t={t}>
                <div style={{padding: '24px 26px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, color: warn ? C.amber : C.green300}}>
                    <Icon name={k.i} size={26} stroke={2} /><span style={{fontFamily: F.body, fontSize: 21, color: C.text2}}>{k.l}</span>
                  </div>
                  <div style={{fontFamily: F.head, fontWeight: 800, fontSize: 60, color: warn ? C.amber : C.white, marginTop: 12, letterSpacing: '-0.02em'}}>
                    {k.warn ? k.v : fmt(Math.round(k.v * cnt))}
                  </div>
                </div>
              </Panel>
            );
          })}

          {/* gráfica */}
          <Panel x={70} y={712} w={940} h={360} at={A + 0.3} t={t}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 36px 0'}}>
              <div>
                <div style={{fontFamily: F.body, fontSize: 21, color: C.text2}}>Ventas · últimos 30 días</div>
                <div style={{fontFamily: F.head, fontWeight: 800, fontSize: 42, color: C.white, marginTop: 4}}>{fmt(48.2 * chartV, 1)} k€</div>
              </div>
              <div style={{display: 'flex', gap: 10}}>
                <Chip tone="green">▲ 18,4 %</Chip><Chip tone="muted">Datos demo</Chip>
              </div>
            </div>
            <svg width={cw} height={ch} style={{position: 'absolute', left: 36, bottom: 24, overflow: 'visible'}}>
              <defs>
                <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={C.green} stopOpacity={0.45} /><stop offset="1" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
                <clipPath id="reveal"><rect x={0} y={-20} width={cw * chartV} height={ch + 40} /></clipPath>
              </defs>
              {[0, 1, 2, 3].map((g) => <line key={g} x1={0} x2={cw} y1={(g * ch) / 3} y2={(g * ch) / 3} stroke="rgba(255,255,255,.06)" strokeWidth={1.5} />)}
              <g clipPath="url(#reveal)">
                <path d={`${line} L${cw} ${ch} L0 ${ch} Z`} fill="url(#area)" />
                <path d={line} fill="none" stroke={C.green300} strokeWidth={4} strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 8px rgba(61,220,151,.8))'}} />
              </g>
              {chartV > 0 && chartV < 1.01 && (
                <g>
                  <circle cx={head[0]} cy={head[1]} r={18} fill={C.green300} opacity={0.2} />
                  <circle cx={head[0]} cy={head[1]} r={8} fill="#fff" />
                </g>
              )}
            </svg>
          </Panel>

          {/* inventario */}
          <Panel x={70} y={1094} w={940} h={300} at={A + 0.45} t={t}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 36px 8px'}}>
              <div style={{fontFamily: F.head, fontWeight: 700, fontSize: 28, color: C.white}}>Inventario</div>
              <span style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: F.body, fontSize: 20, color: C.text2}}><LiveDot t={t} />En tiempo real</span>
            </div>
            {PRODUCTS.map((pr, i) => {
              const fill = p(t, A + 0.7 + i * 0.1, 1, E.outCubic);
              const re = p(t, reorder, 0.8, E.inOutCubic);
              const units = pr.low ? Math.round(mix(pr.u, 180, re)) : pr.u;
              const ratio = (units / pr.max) * fill;
              const low = pr.low && re < 0.5;
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '0 36px', height: 56}}>
                  <span style={{fontFamily: F.body, fontWeight: 500, fontSize: 22, color: C.white, width: 250}}>{pr.n}</span>
                  <div style={{flex: 1, height: 10, borderRadius: 5, background: 'rgba(255,255,255,.07)', overflow: 'hidden'}}>
                    <div style={{width: `${ratio * 100}%`, height: '100%', borderRadius: 5,
                      background: low ? C.amber : `linear-gradient(90deg, ${C.green}, ${C.green300})`,
                      boxShadow: low ? 'none' : '0 0 12px rgba(61,220,151,.6)'}} />
                  </div>
                  <span style={{fontFamily: F.body, fontWeight: 600, fontSize: 21, color: C.text2, width: 110, textAlign: 'right'}}>{fmt(Math.round(units * fill))} uds</span>
                  <div style={{width: 200, display: 'flex', justifyContent: 'flex-end'}}>
                    {pr.low
                      ? (t < reorder ? <Chip tone="amber" style={{fontSize: 18, padding: '5px 12px'}}>Reponer</Chip>
                        : <Chip tone="solid" style={{fontSize: 18, padding: '5px 12px', transform: `scale(${mix(1.25, 1, p(t, reorder, 0.35, E.outBack))})`}}><Icon name="check" size={16} stroke={3} />Pedido enviado</Chip>)
                      : <Chip tone="green" style={{fontSize: 18, padding: '5px 12px'}}>OK</Chip>}
                  </div>
                </div>
              );
            })}
          </Panel>

          {/* aplicaciones conectadas */}
          <Panel x={70} y={1416} w={940} h={150} at={A + 0.6} t={t}>
            <div style={{position: 'absolute', left: 120, right: 120, top: 64, height: 3, background: 'rgba(61,220,151,.18)'}}>
              {[0, 1, 2].map((k) => {
                const ph = (t * 0.55 + k / 3) % 1;
                return <div key={k} style={{position: 'absolute', left: `${ph * 100}%`, top: -3, width: 60, height: 9, borderRadius: 5,
                  background: `linear-gradient(90deg, transparent, ${C.green300})`, boxShadow: `0 0 14px ${C.green300}`}} />;
              })}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '20px 60px 0'}}>
              {APPS.map((a, i) => {
                const syncs = ev.s4_sync.map((s) => Math.max(0, 1 - Math.abs(t - s - i * 0.08) / 0.3));
                const s = Math.max(...syncs);
                return (
                  <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 140}}>
                    <div style={{width: 92, height: 92, borderRadius: 26, display: 'grid', placeItems: 'center',
                      background: `rgba(0,168,107,${0.14 + s * 0.4})`, border: `1.5px solid rgba(61,220,151,${0.3 + s * 0.6})`,
                      boxShadow: `0 0 ${s * 40}px rgba(61,220,151,.7)`, color: s > 0.3 ? '#fff' : C.green300, position: 'relative'}}>
                      <Icon name={a.i} size={40} stroke={1.8} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{position: 'absolute', right: 30, top: 18, display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.body, fontSize: 18, color: C.green300,
              opacity: clamp((t - ev.s4_sync[0]) / 0.3)}}>
              <span style={{display: 'inline-block', transform: `rotate(${t * 240}deg)`}}><Icon name="sync" size={20} /></span>Sincronizado
            </div>
          </Panel>
        </div>
      </div>
    </AbsoluteFill>
  );
};
