import React from 'react';
import {interpolate} from 'remotion';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Chip, Kicker, Source, Stage, Title} from '../../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';

// Where $100 of Kroger sales goes (calculations.json: per-$100 figures from the FY2025 10-K).
// Left: 100 one-dollar coins. Right: a horizontal profit waterfall. Coins physically fly into the row
// they belong to as the narrator names it, so the chart is built by the money, not by a static slide.

const ROWS = [
  {k: 'sales', label: 'Sales', v: 100, from: 0, color: C.cream, seg: 0},
  {k: 'cogs', label: 'Cost of goods', v: -77.14, from: 100, color: C.red, seg: 1},
  {k: 'gross', label: 'Gross profit', v: 22.86, from: 0, color: C.orange, seg: 2},
  {k: 'opex', label: 'Running the business', v: -21.58, from: 22.86, color: C.red, seg: 4},
  {k: 'op', label: 'Operating profit', v: 1.28, from: 0, color: C.green, seg: 5},
  {k: 'other', label: 'Interest, taxes, other', v: -0.59, from: 1.28, color: C.red, seg: 6},
  {k: 'net', label: 'Net earnings', v: 0.69, from: 0, color: C.green, seg: 6},
] as const;

const BX = 1100; // bar origin x
const BW = 560; // px per $100
const RY = 210; // first row y
const RH = 84; // row height

const coinHome = (i: number) => ({x: 150 + (i % 10) * 54, y: 250 + Math.floor(i / 10) * 54});

export const S03Margins: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  const showChart = b.during(0, 6);
  const grow = (i: number) => {
    const r = ROWS[i];
    if (r.k === 'net') return b.rampAt(b.word(6, /net|earnings/i, 0.6), 0.7);
    if (r.k === 'other') return b.rampAt(b.word(6, /interest/i, 0.1), 0.7);
    if (r.k === 'cogs') return b.rampAt(b.word(1, /77|seventy/i, 0.75), 1.2);
    if (r.k === 'opex') return b.rampAt(b.word(4, /together/i, 0.8), 1.0);
    return b.ramp(r.seg, 0.15, 0.7);
  };
  // coin -> row assignment: 0..76 cost of goods, 77..98 operating costs, 99 operating profit (≈ $1.28)
  const coinTarget = (i: number) => (i < 77 ? 1 : i < 99 ? 3 : 4);
  const opexChips = [
    {w: /wages/i, l: 'wages & benefits'},
    {w: /utilities/i, l: 'utilities'},
    {w: /rent/i, l: 'rent'},
    {w: /depreciation/i, l: 'depreciation'},
    {w: /charge|billion/i, l: '$2.5B charge'},
  ];
  return (
    <SceneShell drift={[0, 0]} zoom={0.01} beatCamera={false}>
      <div style={{position: 'absolute', inset: 0, opacity: showChart}}>
        <Source>Kroger 10-K fiscal 2025 · per $100 of sales · Hidden Ledger calculation</Source>
        <Abs x={150} y={150} w={560} o={b.ramp(0, 0)}>
          <Kicker>$100 of Kroger sales</Kicker>
        </Abs>
        <Stage>
          {/* coins */}
          {Array.from({length: 100}).map((_, i) => {
            const target = coinTarget(i);
            const h = coinHome(i);
            const startF = target === 1 ? b.word(1, /77|seventy/i, 0.75) - 20 + i * 0.6 : target === 3 ? b.word(4, /together/i, 0.8) - 10 + (i - 77) * 1.2 : b.word(5, /1\.28|dollar/i, 0.6);
            const p = target === 4 ? 0 : interpolate(frame, [startF, startF + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const dest = {x: BX + (ROWS[target].from + ROWS[target].v / 2) * (BW / 100), y: RY + target * RH + 30};
            const x = interpolate(p, [0, 1], [h.x, dest.x]);
            const y = interpolate(p, [0, 1], [h.y, dest.y]) - Math.sin(p * Math.PI) * 120;
            const fill = target === 4 ? C.green : i < 77 ? C.orange : '#E8B04A';
            const pulse = target === 4 ? 1 + 0.25 * b.popAt(b.word(5, /1\.28|dollar/i, 0.6)) : 1;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${(1 - 0.5 * p) * pulse})`} opacity={1 - p * p}>
                <circle r={22} fill={fill} stroke={C.cream} strokeWidth={3} />
                <text y={8} textAnchor="middle" fontSize={22} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk">
                  $
                </text>
              </g>
            );
          })}
          {/* waterfall */}
          {ROWS.map((r, i) => {
            const g = grow(i);
            const x0 = BX + Math.min(r.from, r.from + r.v) * (BW / 100);
            const w = Math.abs(r.v) * (BW / 100);
            const xa = r.v < 0 ? BX + r.from * (BW / 100) - w * g : x0;
            const y = RY + i * RH;
            return (
              <g key={r.k} opacity={g > 0 ? 1 : 0}>
                <rect x={xa} y={y + 6} width={Math.max(4, w * g)} height={RH - 26} rx={6} fill={r.color} opacity={r.v < 0 ? 0.85 : 1} />
                {i > 0 && <line x1={BX + r.from * (BW / 100)} y1={y - 20} x2={BX + r.from * (BW / 100)} y2={y + 6} stroke={C.muted} strokeWidth={3} strokeDasharray="6 6" />}
              </g>
            );
          })}
        </Stage>
        {ROWS.map((r, i) => {
          const g = grow(i);
          const y = RY + i * RH;
          const hi = r.k === 'gross' ? b.during(3, 3) : r.k === 'op' ? b.during(5, 5) : 0;
          return (
            <React.Fragment key={r.k}>
              <div style={{position: 'absolute', left: 740, top: y + 6, width: 340, textAlign: 'right', fontFamily: FONT_BODY, fontWeight: 600, fontSize: 32, color: hi > 0.5 ? r.color : C.cream, opacity: Math.min(1, g * 2)}}>{r.label}</div>
              <div style={{position: 'absolute', left: 1680, top: y - 2, width: 200, textAlign: 'right', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 48, color: r.v < 0 ? C.red : r.color, opacity: Math.min(1, g * 2), fontVariantNumeric: 'tabular-nums'}}>
                {r.v < 0 ? '−' : ''}${Math.abs(r.v).toFixed(2)}
              </div>
            </React.Fragment>
          );
        })}
        {/* cost of goods detail */}
        <Abs x={150} y={820} w={1700} o={b.during(1, 1)}>
          <Body size={32} color={C.muted}>
            Cost of goods includes advertising, warehousing and transportation (Kroger’s own definition)
          </Body>
        </Abs>
        {/* gross margin stamp */}
        <Abs x={150} y={790} w={900} o={b.during(2, 3)}>
          <Title size={58} color={C.orange}>
            Gross margin 22.9%
          </Title>
        </Abs>
        <div style={{position: 'absolute', left: 1180, top: RY + 2 * RH - 4, opacity: b.during(3, 3), transform: `rotate(-6deg) scale(${0.8 + 0.2 * b.pop(3, 0.8)})`}}>
          <Chip bg={C.red} color={C.cream} size={36}>
            NOT PROFIT YET
          </Chip>
        </div>
        {/* operating cost chips on the spoken words */}
        <Abs x={150} y={800} w={1700} o={b.during(4, 4)}>
          <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
            {opexChips.map((c) => (
              <span key={c.l} style={{opacity: b.rampAt(b.word(4, c.w, 0.5), 0.3)}}>
                <Chip bg={c.l.startsWith('$') ? C.red : C.panel} color={C.cream} size={32}>
                  {c.l}
                </Chip>
              </span>
            ))}
          </div>
        </Abs>
        <Abs x={150} y={790} w={900} o={b.during(5, 5)}>
          <Title size={58} color={C.green}>
            Operating margin 1.28%
          </Title>
        </Abs>
        <Abs x={150} y={790} w={900} o={b.during(6, 6)}>
          <Title size={58} color={C.green}>
            Net margin 0.69%
          </Title>
        </Abs>
      </div>

      {/* beat 7: three margins, three questions */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(7, 7)}}>
        <Abs x={0} y={150} w={1920} align="center">
          <Title size={70}>Three margins, three questions</Title>
        </Abs>
        <Abs x={160} y={300} w={1600}>
          <div style={{display: 'flex', gap: 40}}>
            {[
              {n: 'Gross', v: '22.9%', q: 'What survives the cost of the products?', c: C.orange, w: /gross/i},
              {n: 'Operating', v: '1.28%', q: 'What did the business itself earn?', c: C.green, w: /operating/i},
              {n: 'Net', v: '0.69%', q: 'What was left for shareholders?', c: C.green, w: /net/i},
            ].map((d) => {
              const o = b.rampAt(b.word(7, d.w, 0.2), 0.4);
              return (
                <div key={d.n} style={{flex: 1, background: C.panel, border: `2px solid ${C.line}`, borderTop: `10px solid ${d.c}`, borderRadius: 18, padding: 34, opacity: o, transform: `translateY(${30 * (1 - o)}px)`}}>
                  <Kicker color={d.c}>{d.n} margin</Kicker>
                  <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 130, color: C.cream, marginTop: 10}}>{d.v}</div>
                  <Body size={34} color={C.cream}>
                    {d.q}
                  </Body>
                </div>
              );
            })}
          </div>
        </Abs>
        <Abs x={0} y={760} w={1920} align="center" o={b.ramp(7, 5)}>
          <Body size={36} color={C.muted}>
            Kroger, fiscal 2025 · mixing them up is the easiest way to misread a supermarket
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
