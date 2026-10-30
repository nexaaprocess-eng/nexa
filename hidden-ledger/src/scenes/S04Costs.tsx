import React from 'react';
import {interpolate} from 'remotion';
import {Box, Jacket, Pallet, Place, Tag, Truck} from '../components/icons';
import {Conveyor, WarehouseSet, rnd} from '../components/sets';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../components/timeline';
import {Abs, Body, Illustrative, Kicker, Source, Stage, Title} from '../components/ui';
import {C, FONT_TITLE} from '../themes/theme';

// Scene 4 (final): the "two piles" become two jars that physically fill with cost coins.
// Operating costs: the parcel crosses five illustrated stations; a red coin drops at each spoken item.
// Lost value: the jacket either goes back on the full-price rail or gets marked down / sent to bulk.
// The $100 example (clearly labelled illustrative) reuses the same jars.

const JAR_RED = {x: 250, y: 600};
const JAR_ORANGE = {x: 1670, y: 600};

const Coin: React.FC<{color: string; label?: string; r?: number}> = ({color, label = '$', r = 30}) => (
  <g>
    <circle r={r} fill={color} stroke={C.cream} strokeWidth={4} />
    <text y={r * 0.38} textAnchor="middle" fontSize={r * (label.length > 2 ? 0.75 : 1.05)} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk">
      {label}
    </text>
  </g>
);

/** Glass jar with stacked coins; `n` coins visible (fractional = last coin fading in). */
const Jar: React.FC<{x: number; y: number; color: string; n: number; glow: number; label: string; total?: string; totalO?: number}> = ({x, y, color, n, glow, label, total, totalO = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-150} y={-10} width={300} height={300} rx={40} fill="rgba(243,235,221,0.04)" stroke={glow > 0.5 ? color : C.cream} strokeWidth={glow > 0.5 ? 8 : 5} />
    <rect x={-120} y={-34} width={240} height={30} rx={10} fill={C.panel} stroke={C.cream} strokeWidth={4} />
    {Array.from({length: Math.ceil(n)}).map((_, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const o = Math.min(1, n - i);
      return (
        <g key={i} transform={`translate(${-80 + col * 80 + (row % 2) * 20} ${250 - row * 46})`} opacity={o}>
          <Coin color={color} r={30} />
        </g>
      );
    })}
    <text y={350} textAnchor="middle" fontSize={44} fontWeight={700} fill={color} fontFamily="Space Grotesk">
      {label}
    </text>
    {total && (
      <g opacity={totalO} transform={`translate(0 ${-80 - 20 * (1 - totalO)})`}>
        <rect x={-110} y={-58} width={220} height={84} rx={20} fill={color} />
        <text y={4} textAnchor="middle" fontSize={64} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk">
          {total}
        </text>
      </g>
    )}
  </g>
);

// small illustrated stations for operating costs
const Bench: React.FC = () => (
  <g stroke={C.cream} strokeWidth={6} strokeLinejoin="round">
    <rect x={-100} y={10} width={200} height={20} fill={C.panel} />
    <line x1={-80} y1={30} x2={-80} y2={90} />
    <line x1={80} y1={30} x2={80} y2={90} />
    <g transform="translate(0 -40) scale(0.5)">
      <Box open={1} />
    </g>
    <circle cx={-70} cy={-60} r={16} fill={C.cream} stroke="none" />
    <path d="M-70 -44 L-70 0 M-70 -30 L-30 -20" fill="none" />
  </g>
);
const Repack: React.FC = () => (
  <g stroke={C.cream} strokeWidth={6} strokeLinejoin="round">
    <g transform="translate(-20 10) scale(0.55)">
      <Box />
    </g>
    <g transform="translate(70 -30) rotate(-20) scale(0.35)">
      <Tag text="NEW" />
    </g>
    <path d="M-90 -70 L-60 -40 M-100 -40 L-70 -30" stroke={C.blue} />
  </g>
);
const Headset: React.FC = () => (
  <g stroke={C.cream} strokeWidth={6} fill="none" strokeLinecap="round">
    <path d="M-50 10 A50 50 0 0 1 50 10" />
    <rect x={-66} y={0} width={26} height={44} rx={10} fill={C.blue} />
    <rect x={40} y={0} width={26} height={44} rx={10} fill={C.blue} />
    <path d="M50 44 Q40 74 0 74" />
    <rect x={20} y={-96} width={110} height={60} rx={14} fill={C.panel} />
    <path d="M40 -70 L110 -70 M40 -54 L90 -54" stroke={C.muted} />
  </g>
);
const Screen: React.FC = () => (
  <g stroke={C.cream} strokeWidth={6} strokeLinejoin="round">
    <rect x={-90} y={-70} width={180} height={120} rx={12} fill={C.panel} />
    <line x1={0} y1={50} x2={0} y2={80} />
    <line x1={-40} y1={80} x2={40} y2={80} />
    <path d="M0 -50 L36 -36 L36 -6 Q36 22 0 36 Q-36 22 -36 -6 L-36 -36 Z" fill={C.green} />
    <path d="M-14 -8 L-2 4 L18 -18" fill="none" stroke={C.bg} />
  </g>
);

export const S04Costs: React.FC = () => {
  const b = useBeats();
  const {frame, fps} = b;

  // ---------- stations (beat 2), synced to spoken words
  const ST = [
    {x: 530, re: /shipping/, label: ['Return', 'shipping'], el: <Truck wheel={frame * 4} />, s: 1.0},
    {x: 750, re: /labor/, label: ['Labor', ''], el: <Bench />, s: 1.15},
    {x: 970, re: /cleaning/, label: ['Clean ·', 're-tag'], el: <Repack />, s: 1.25},
    {x: 1190, re: /customer/, label: ['Customer', 'service'], el: <Headset />, s: 1.1},
    {x: 1410, re: /software/, label: ['Fraud', 'checks'], el: <Screen />, s: 1.05},
  ];
  const stF = ST.map((s, i) => b.word(2, s.re, 0.05 + i * 0.2));
  const passed = stF.filter((f) => frame >= f + 18).length + (stF.some((f) => frame >= f && frame < f + 18) ? 0.5 : 0);
  const stationsO = Math.max(b.during(1, 2), b.ramp(0, 0.6) * (1 - b.ramp(1, 0, 0.3))) * (1 - b.ramp(3, 0, 0.5));
  const curSt = Math.max(0, stF.filter((f) => frame >= f).length - 1);
  const parcelX = interpolate(b.rampAt(stF[curSt] - 8, 0.5), [0, 1], [curSt ? ST[curSt - 1].x : 380, ST[curSt].x]);

  // ---------- lost value (beat 4)
  const fFull = b.word(4, /full/, 0.35);
  const fLate = b.word(4, /late/, 0.5);
  const fBulk = b.word(4, /bulk/, 0.85);
  const fMark = b.word(4, /marked/, 0.7);
  const goGood = b.rampAt(fFull - 6, 0.7);
  const badIn = b.rampAt(fLate - 10, 0.5);
  const markT = b.rampAt(fMark, 0.4);
  const bulkT = b.rampAt(fBulk, 0.7);
  const lostO = b.during(3, 4) * 1;

  // ---------- illustrative example (beats 5-8)
  const f8 = b.word(6, /^\$?8/, 0.42);
  const f6 = b.word(6, /^\$?6/, 0.6);
  const f70 = b.word(6, /70/, 0.92);
  const f14 = b.word(7, /14/, 0.25);
  const f30 = b.word(7, /30/, 0.46);
  const f44 = b.word(7, /44/, 0.8);
  const exampleO = b.during(5, 8);
  const inExample = frame >= b.at(5);

  // jar contents per phase
  const redN = inExample ? (frame >= f8 + 14 ? 1 : 0) + (frame >= f6 + 14 ? 1 : 0) : Math.min(5, passed);
  const orangeN = inExample ? (frame >= f70 + 16 ? 3 : 0) : (frame >= fBulk + 18 ? 3 : frame >= fMark + 18 ? 2 : 0);
  const jarsO = b.during(0, 7);
  const flyCoin = (from: [number, number], to: [number, number], f0: number, color: string, label?: string) => {
    const t = interpolate(frame - f0, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    if (t <= 0 || t >= 1) return null;
    const x = from[0] + (to[0] - from[0]) * t;
    const y = from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * 180;
    return (
      <Place x={x} y={y} s={1}>
        <Coin color={color} label={label} r={34} />
      </Place>
    );
  };

  return (
    <SceneShell drift={[0, -6]} zoom={0.015}>
      {/* ================= jars (persist through beats 0-8) */}
      <div style={{position: 'absolute', inset: 0, opacity: jarsO}}>
        <Stage>
          <Jar x={JAR_RED.x} y={JAR_RED.y - 100} color={C.red} n={redN} glow={Math.max(b.during(1, 2), b.during(0, 0))} label="Operating costs"
            total={inExample ? '$14' : undefined} totalO={b.rampAt(f14, 0.4)} />
          <Jar x={JAR_ORANGE.x} y={JAR_ORANGE.y - 100} color={C.orange} n={orangeN} glow={Math.max(b.during(3, 4), b.during(0, 0))} label="Lost value"
            total={inExample ? '$30' : undefined} totalO={b.rampAt(f30, 0.4)} />
        </Stage>
      </div>
      <Abs x={0} y={150} w={1920} align="center" o={b.during(0, 0)}>
        <Title size={70}>Two piles of cost</Title>
      </Abs>

      {/* ================= operating costs: stations */}
      <div style={{position: 'absolute', inset: 0, opacity: stationsO}}>
        <Stage>
          <rect x={420} y={620} width={1080} height={18} rx={9} fill="#2A3038" stroke={C.cream} strokeWidth={3} />
          {ST.map((s, i) => {
            const on = b.popAt(stF[i]);
            const active = i === curSt && frame >= stF[i];
            return (
              <g key={s.label.join()}>
                <Place x={s.x} y={450} s={s.s * (0.75 + 0.25 * Math.max(on, b.during(1, 1)))} o={Math.max(0.35, on)}>
                  {s.el}
                </Place>
                {s.label.map((l, k) => (
                  <text key={k} x={s.x} y={700 + k * 42} textAnchor="middle" fill={active ? C.red : C.cream} opacity={on} fontSize={38} fontWeight={700} fontFamily="Space Grotesk">
                    {l}
                  </text>
                ))}
              </g>
            );
          })}
          {frame >= b.at(2) && (
            <Place x={parcelX} y={590} s={0.4}>
              <Box label="RETURN" />
            </Place>
          )}
          {ST.map((s, i) => (
            <React.Fragment key={`c${i}`}>{flyCoin([s.x, 380], [JAR_RED.x, JAR_RED.y + 40], stF[i] + 2, C.red)}</React.Fragment>
          ))}
        </Stage>
        <Abs x={0} y={160} w={1920} align="center" o={b.during(1, 1)}>
          <Body size={44} weight={600}>
            money spent <span style={{color: C.red}}>moving and handling</span> the item
          </Body>
        </Abs>
      </div>

      {/* ================= lost value */}
      <div style={{position: 'absolute', inset: 0, opacity: lostO}}>
        <Abs x={0} y={150} w={1920} align="center" o={b.during(3, 3)}>
          <Body size={44} weight={600}>
            what the item itself is <span style={{color: C.orange}}>no longer worth</span>
          </Body>
        </Abs>
        <Stage>
          {/* full-price rail */}
          <g opacity={b.ramp(4, 0.2)}>
            <line x1={540} y1={300} x2={860} y2={300} stroke={C.cream} strokeWidth={8} strokeLinecap="round" />
            <text x={700} y={270} textAnchor="middle" fill={C.green} fontSize={40} fontWeight={700} fontFamily="Space Grotesk">
              FULL PRICE
            </text>
          </g>
          {/* markdown / bulk */}
          <g opacity={b.rampAt(fLate, 0.5)}>
            <text x={1220} y={270} textAnchor="middle" fill={C.red} fontSize={40} fontWeight={700} fontFamily="Space Grotesk">
              MARKDOWN · BULK
            </text>
            <Place x={1260} y={700} s={0.9}>
              <Pallet n={5} />
            </Place>
          </g>
          {/* good jacket: in perfect shape, in season */}
          <Place x={interpolate(goGood, [0, 1], [960, 700])} y={interpolate(goGood, [0, 1], [560, 450])} s={1.35} o={b.ramp(4, 0.1)}>
            <Jacket fill={C.green} />
          </Place>
          <Place x={interpolate(goGood, [0, 1], [960, 700]) + 120} y={interpolate(goGood, [0, 1], [560, 450]) - 60} s={0.6 * b.rampAt(fFull, 0.3)} r={-10}>
            <Tag text="$$$" fill={C.green} />
          </Place>
          {/* late / worn jacket */}
          {badIn > 0 && (
            <>
              <Place x={interpolate(bulkT, [0, 1], [1130, 1260])} y={interpolate(bulkT, [0, 1], [460, 620])} s={interpolate(bulkT, [0, 1], [1.3, 0.45])} o={badIn}>
                <Jacket fill="#8C7F6E" sleeve={1} />
              </Place>
              <Place x={1250} y={370} s={0.65 * markT} r={-12} o={1 - bulkT}>
                <Tag text="−%" fill={C.red} textColor={C.cream} />
              </Place>
            </>
          )}
          {flyCoin([1220, 380], [JAR_ORANGE.x, JAR_ORANGE.y + 40], fMark + 2, C.orange)}
          {flyCoin([1260, 600], [JAR_ORANGE.x, JAR_ORANGE.y + 40], fBulk + 2, C.orange)}
        </Stage>
        <Abs x={500} y={790} w={400} align="center" o={b.rampAt(fFull, 0.4)}>
          <Body size={40} weight={700} color={C.green}>
            perfect, in season
          </Body>
        </Abs>
        <Abs x={1010} y={790} w={500} align="center" o={b.rampAt(fLate, 0.4)}>
          <Body size={40} weight={700} color={C.red}>
            late · no tags · worn
          </Body>
        </Abs>
      </div>

      {/* ================= illustrative example (labelled for its whole duration) */}
      <div style={{position: 'absolute', inset: 0, opacity: exampleO}}>
        <Illustrative />
        <Stage>
          <g opacity={1 - b.during(8, 8)}>
            <Place x={960} y={520} s={1.5}>
              <Jacket />
            </Place>
            {/* price tag: $100 -> $70 */}
            <Place x={1130} y={380} s={1.25} r={-8}>
              <Tag text={frame >= f70 ? '$70' : '$100'} fill={frame >= f70 ? C.orange : C.cream} />
            </Place>
            {frame >= f70 && frame < f70 + 20 && (
              <line x1={1040} y1={360} x2={1180} y2={410} stroke={C.red} strokeWidth={10} opacity={1 - (frame - f70) / 20} />
            )}
          </g>
          {flyCoin([1100, 380], [JAR_RED.x, JAR_RED.y + 40], f8, C.red, '8')}
          {flyCoin([1100, 380], [JAR_RED.x, JAR_RED.y + 40], f6, C.red, '6')}
          {flyCoin([1100, 380], [JAR_ORANGE.x, JAR_ORANGE.y + 40], f70 + 2, C.orange, '30')}
        </Stage>
        {/* spoken labels next to the coins */}
        <Abs x={260} y={226} w={1400} align="center" o={b.during(6, 6)}>
          <div style={{display: 'flex', justifyContent: 'center', gap: 36, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 46, whiteSpace: 'nowrap'}}>
            <span style={{opacity: b.rampAt(f8, 0.3), color: C.red}}>shipping −$8</span>
            <span style={{opacity: b.rampAt(f6, 0.3), color: C.red}}>handling −$6</span>
            <span style={{opacity: b.rampAt(f70, 0.3), color: C.orange}}>resale $70</span>
          </div>
        </Abs>
        {/* the total */}
        <Abs x={0} y={760} w={1920} align="center" o={b.rampAt(f44, 0.4) * b.during(7, 7)} s={0.85 + 0.15 * b.popAt(f44)}>
          <div style={{display: 'inline-block', background: 'rgba(14,17,20,0.9)', border: `4px solid ${C.cream}`, borderRadius: 24, padding: '8px 40px'}}>
            <span style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 86, color: C.cream}}>
              $14 + $30 = <span style={{color: C.red}}>$44</span>
            </span>
          </div>
        </Abs>
        {/* assumptions dials */}
        <div style={{opacity: b.during(8, 8)}}>
          <Abs x={0} y={250} w={1920} align="center">
            <Title size={64}>Change an assumption, change the answer</Title>
          </Abs>
          <Abs x={420} y={420} w={1080}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              {[
                ['Product', /product/],
                ['Carrier contract', /carrier/],
                ['Warehouse', /warehouse/],
                ['Item condition', /condition/],
              ].map(([d, re], i) => {
                const f0 = b.word(8, re as RegExp, 0.45 + i * 0.12);
                const rot = Math.sin(frame / (14 + i * 3) + i) * 70 * b.rampAt(f0, 0.5);
                return (
                  <div key={d as string} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: 0.35 + 0.65 * b.rampAt(f0, 0.3)}}>
                    <svg width={200} height={200} viewBox="-110 -110 220 220">
                      <circle r={90} fill={C.panel} stroke={C.line} strokeWidth={8} />
                      <path d="M-70 50 A86 86 0 1 1 70 50" fill="none" stroke={C.orange} strokeWidth={10} strokeLinecap="round" opacity={0.4} />
                      <line x1={0} y1={0} x2={0} y2={-70} stroke={C.cream} strokeWidth={10} strokeLinecap="round" transform={`rotate(${rot})`} />
                      <circle r={12} fill={C.orange} />
                    </svg>
                    <div style={{fontFamily: FONT_TITLE, fontSize: 34, color: C.cream, fontWeight: 600}}>{d as string}</div>
                  </div>
                );
              })}
            </div>
          </Abs>
        </div>
      </div>

      {/* ================= fraud */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(9, 9)}}>
        <Source>NRF & Happy Returns, 2025 Retail Returns Landscape · retailers that track fraud; excludes bracketing & wardrobing</Source>
        <Stage>
          <WarehouseSet t={frame / fps} />
          {/* parcels stream through a scanner; some get flagged (illustration of the retailers' estimate, not a count) */}
          <Conveyor y={860} t={(frame - b.at(9)) / fps} speed={330} gap={140} scale={0.4} scannerX={760} flag={(k) => rnd(k * 7 + 3) < 0.09 || k % 11 === 5} />
          <rect x={0} y={0} width={1920} height={1080} fill="rgba(17,20,24,0.35)" />
        </Stage>
        <Abs x={1000} y={230} w={820}>
          <div style={{background: 'rgba(14,17,20,0.85)', borderRadius: 28, padding: '28px 40px'}}>
            <Kicker color={C.red}>Return fraud, retailers’ estimate</Kicker>
            <Title size={250} color={C.red} style={{marginTop: 6}}>
              ~9%
            </Title>
            <Body size={36} style={{marginTop: 6}}>
              of returns, from empty boxes to swapped items
            </Body>
            <Body size={28} color={C.muted} style={{marginTop: 22, opacity: b.ramp(9, 6)}}>
              Self-reported by retailers that track it · not audited · illustration, not a count
            </Body>
          </div>
        </Abs>
      </div>
    </SceneShell>
  );
};
