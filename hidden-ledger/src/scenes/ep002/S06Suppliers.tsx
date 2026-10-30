import React from 'react';
import {interpolate} from 'remotion';
import {Product, Semi, ShelfUnit, StoreFront} from '../../components/grocery';
import {Doc, Invoice, Place, Warehouse} from '../../components/icons';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Chip, Illustrative, Kicker, Source, Stage, Title} from '../../components/ui';
import {C, FONT_TITLE} from '../../themes/theme';

// Suppliers. Balance scales (accounts payable vs inventory, latest 10-Ks), the unpaid-invoice idea,
// a HYPOTHETICAL 30-day pasta timeline, supplier payments flowing back (Walmart 10-K), and the
// negotiations hidden behind the shelf price.

// $ millions at fiscal year-end (calculations.py); Kroger inventory at FIFO
const SCALES = [
  {n: 'Walmart', ap: 63061, inv: 58851, pct: 107},
  {n: 'Costco', ap: 22591, inv: 19324, pct: 117},
  {n: 'Kroger', ap: 10488, inv: 9445, pct: 111},
];

const Scale: React.FC<{x: number; ap: number; inv: number; t: number; label: string; pct: number}> = ({x, ap, inv, t, label, pct}) => {
  const tilt = -Math.min(14, ((ap - inv) / inv) * 90) * t; // payable side goes down (left)
  const r = (v: number) => 34 + Math.sqrt(v / 63061) * 60;
  return (
    <g transform={`translate(${x} 560)`}>
      <path d="M-40 230 L40 230 L10 0 L-10 0 Z" fill={C.panel} stroke={C.cream} strokeWidth={5} />
      <g transform={`rotate(${tilt})`}>
        <line x1={-210} y1={0} x2={210} y2={0} stroke={C.cream} strokeWidth={10} strokeLinecap="round" />
        {[
          {s: -1, v: ap, c: C.orange, l: 'Payables'},
          {s: 1, v: inv, c: C.blue, l: 'Inventory'},
        ].map((p) => (
          <g key={p.l} transform={`translate(${p.s * 190} 0) rotate(${-tilt})`}>
            <line x1={0} y1={0} x2={0} y2={60} stroke={C.cream} strokeWidth={4} />
            <circle cx={0} cy={60 + r(p.v)} r={r(p.v) * t} fill={p.c} opacity={0.9} stroke={C.cream} strokeWidth={4} />
            <text y={60 + r(p.v) + 14} textAnchor="middle" fontSize={36} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk" opacity={t}>
              ${(p.v / 1000).toFixed(1)}B
            </text>
          </g>
        ))}
      </g>
      <text y={300} textAnchor="middle" fontSize={48} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
        {label}
      </text>
      <text y={-60} textAnchor="middle" fontSize={44} fontWeight={700} fill={C.orange} fontFamily="Space Grotesk" opacity={t}>
        {pct}%
      </text>
    </g>
  );
};

export const S06Suppliers: React.FC = () => {
  const b = useBeats();
  const {frame, fps} = b;
  const t = frame / fps;

  // pasta timeline (beat 2): day 0..30 mapped across ~70% of the segment
  const d0 = b.at(2, 0.6);
  const d1 = b.at(2) + (b.end(2) - b.at(2)) * 0.82;
  const day = interpolate(frame, [d0, d1], [1, 30], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dayX = (d: number) => 180 + ((d - 1) / 29) * 1560;
  const stock = Math.max(0, 1 - (day - 1) / 20);
  const cash = Math.min(1, (day - 1) / 20);
  const paid = day >= 30 ? b.rampAt(d1, 0.6) : 0;
  return (
    <SceneShell drift={[0, 0]} zoom={0.012} beatCamera={false}>
      {/* beat 0: the balance scales */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <Source>Latest 10-K balance sheets · accounts payable vs merchandise inventories at fiscal year-end · Kroger inventory at FIFO</Source>
        <Abs x={120} y={150} w={1100}>
          <Kicker>At fiscal year-end</Kicker>
          <Title size={58} style={{marginTop: 8}}>
            <span style={{color: C.orange}}>Accounts payable</span> &gt; <span style={{color: C.blue}}>inventory</span>
          </Title>
        </Abs>
        <Stage>
          {SCALES.map((s, i) => (
            <Scale key={s.n} x={380 + i * 580} ap={s.ap} inv={s.inv} label={s.n} pct={s.pct} t={b.rampAt(b.word(0, new RegExp(s.n, 'i'), 0.3 + i * 0.15), 0.9)} />
          ))}
        </Stage>
      </div>

      {/* beat 1: unpaid bills */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
        <Stage>
          {Array.from({length: 6}).map((_, i) => (
            <Place key={i} x={420 + i * 18} y={520 - i * 22} s={1.3} r={-8 + i * 3} o={b.ramp(1, i * 0.15)}>
              <Invoice lines={4} />
            </Place>
          ))}
          <g transform={`translate(520 470) rotate(-14) scale(${1.4 - 0.4 * b.pop(1, 1.0)})`} opacity={b.ramp(1, 1.0, 0.2)}>
            <rect x={-170} y={-50} width={340} height={100} rx={12} fill="none" stroke={C.red} strokeWidth={10} />
            <text y={24} textAnchor="middle" fontSize={64} fontWeight={700} fill={C.red} fontFamily="Space Grotesk">
              NOT YET PAID
            </text>
          </g>
        </Stage>
        <Abs x={900} y={280} w={900}>
          <Title size={60}>Accounts payable = bills not paid yet</Title>
          <Body size={38} color={C.cream} style={{marginTop: 28, opacity: b.rampAt(b.word(1, /sell|goods/i, 0.5), 0.4)}}>
            If goods <b style={{color: C.green}}>sell before</b> the invoice is due…
          </Body>
          <Body size={38} color={C.cream} style={{marginTop: 14, opacity: b.rampAt(b.word(1, /suppliers/i, 0.75), 0.4)}}>
            …suppliers are, in effect, <b style={{color: C.orange}}>helping finance the shelves</b>
          </Body>
        </Abs>
      </div>

      {/* beat 2: hypothetical pasta case, 30 days */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 2)}}>
        <Illustrative />
        <Stage>
          {/* timeline axis */}
          <line x1={dayX(1)} y1={720} x2={dayX(30)} y2={720} stroke={C.line} strokeWidth={10} strokeLinecap="round" />
          <line x1={dayX(1)} y1={720} x2={dayX(day)} y2={720} stroke={C.cream} strokeWidth={10} strokeLinecap="round" />
          {[1, 7, 14, 21, 30].map((d) => (
            <g key={d}>
              <line x1={dayX(d)} y1={700} x2={dayX(d)} y2={740} stroke={C.cream} strokeWidth={4} />
              <text x={dayX(d)} y={790} textAnchor="middle" fontSize={34} fontWeight={700} fill={d === 30 ? C.red : C.cream} fontFamily="Space Grotesk">
                day {d}
              </text>
            </g>
          ))}
          {/* "store holds the money" span from sell-out (day 21) to payment (day 30) */}
          <rect x={dayX(21)} y={690} width={(dayX(Math.max(21, Math.min(30, day))) - dayX(21))} height={60} rx={8} fill="rgba(78,159,125,0.45)" />
          {/* truck drops the case on day 1 */}
          <g transform={`translate(${interpolate(b.ramp(2, 0, 0.9), [0, 1], [-500, dayX(1) + 120])} 420) scale(0.55)`} opacity={1 - b.rampAt(d0 + 30, 0.4)}>
            <Semi wheel={-t * 300} />
          </g>
          {/* shelf stock of the pasta case */}
          <g transform="translate(180 330)">
            <rect x={0} y={0} width={420} height={220} rx={14} fill={C.panel} stroke={C.line} strokeWidth={3} />
            {Array.from({length: 12}).map((_, i) => (
              <g key={i} transform={`translate(${50 + (i % 6) * 64} ${70 + Math.floor(i / 6) * 100}) scale(0.32)`} opacity={i < Math.ceil(stock * 12) ? 1 : 0.1}>
                <Product kind="pasta" />
              </g>
            ))}
          </g>
          {/* register cash */}
          <g transform="translate(760 330)">
            <rect x={0} y={0} width={420} height={220} rx={14} fill={C.panel} stroke={C.line} strokeWidth={3} />
            <rect x={30} y={190 - 150 * cash * (1 - paid)} width={360} height={150 * cash * (1 - paid)} rx={8} fill={C.green} />
          </g>
          {/* invoice due day 30 */}
          <Place x={1560} y={440} s={1.0 + 0.2 * b.popAt(d1)} r={6}>
            <Invoice lines={3} />
          </Place>
        </Stage>
        <Abs x={180} y={260} w={420}>
          <Body size={32} color={C.cream} weight={700}>
            Pasta on the shelf
          </Body>
        </Abs>
        <Abs x={760} y={260} w={420}>
          <Body size={32} color={C.green} weight={700}>
            Shoppers’ money in the till
          </Body>
        </Abs>
        <Abs x={1400} y={260} w={420} align="center">
          <Body size={32} color={C.red} weight={700}>
            {paid > 0.5 ? 'Invoice paid' : 'Invoice due day 30'}
          </Body>
        </Abs>
        <Abs x={dayX(21) - 40} y={600} w={600} o={day > 23 ? 1 : 0}>
          <Chip bg={C.green} size={32}>
            9 days holding the cash
          </Chip>
        </Abs>
      </div>

      {/* beat 3: supplier payments flow back */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <Source>Walmart 10-K fiscal 2026 · consideration from suppliers is recorded as a reduction of cost of sales</Source>
        <Stage>
          <Place x={330} y={560} s={1.7}>
            <Warehouse />
          </Place>
          <Place x={1540} y={560} s={0.95}>
            <StoreFront type="supercenter" />
          </Place>
          {['volume incentives', 'warehouse allowances', 'markdowns', 'certain advertising'].map((l, i) => {
            const w = b.word(3, [/volume/i, /warehouse/i, /markdowns/i, /advertising/i][i], 0.3 + i * 0.12);
            const p = b.rampAt(w, 1.0);
            const y = 330 + i * 120;
            return (
              <g key={l} opacity={Math.min(1, p * 3)}>
                <path d={`M520 ${y} L${520 + 760 * p} ${y}`} stroke={C.green} strokeWidth={8} strokeLinecap="round" />
                <path d={`M${520 + 760 * p} ${y - 18} L${548 + 760 * p} ${y} L${520 + 760 * p} ${y + 18} Z`} fill={C.green} />
                <circle cx={520 + 760 * p} cy={y} r={18} fill={C.orange} stroke={C.cream} strokeWidth={3} />
                <text x={540} y={y - 22} fontSize={36} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
                  {l}
                </text>
              </g>
            );
          })}
        </Stage>
        <Abs x={120} y={150} w={1000}>
          <Kicker>Money also flows the other way</Kicker>
        </Abs>
        <Abs x={0} y={800} w={1920} align="center" o={b.rampAt(b.word(3, /reduction/i, 0.85), 0.5)}>
          <Body size={40} weight={600}>
            → booked as a <b style={{color: C.green}}>reduction of cost of sales</b>
          </Body>
        </Abs>
      </div>

      {/* beat 4: negotiations behind the shelf price */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <Stage>
          <ShelfUnit x={120} y={260} w={1680} levels={3} pitch={150} scale={0.48} seed={4} />
          {/* the shelf slides up to reveal what is behind the price */}
          <g opacity={b.ramp(4, 1.2, 0.5)}>
            <rect x={0} y={0} width={1920} height={1080} fill="rgba(17,20,24,0.82)" />
            <Place x={720} y={560} s={1.6}>
              <Doc />
            </Place>
            <Place x={1200} y={560} s={1.6}>
              <Doc />
            </Place>
            <path d="M820 560 L1100 560" stroke={C.orange} strokeWidth={8} strokeDasharray="16 14" />
          </g>
        </Stage>
        <Abs x={0} y={170} w={1920} align="center" o={b.ramp(4, 0.2)}>
          <Title size={64}>
            The shelf price is only part of the story
          </Title>
        </Abs>
        <Abs x={0} y={760} w={1920} align="center" o={b.ramp(4, 1.6)}>
          <Body size={40} style={{fontFamily: FONT_TITLE}} weight={700} color={C.orange}>
            Gross margin is also shaped by negotiations shoppers never see
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
