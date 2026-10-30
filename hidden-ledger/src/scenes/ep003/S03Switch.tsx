import React from 'react';
import {interpolate} from 'remotion';
import {Camera} from '../../components/apps';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Kicker, Source, Title} from '../../components/ui';
import {C, FONT_TITLE} from '../../themes/theme';

// Adobe's switch, as revenue towers built from blocks: grey = other revenue (boxes, licences, services),
// orange = subscription. Heights to scale ($B, Adobe Forms 10-K FY2014 / FY2025). The camera starts tight on
// FY2012-14, then pulls back to reveal FY2025. Side panels: net income coins; one box vs a year of payments.

const YEARS = [
  {fy: 'FY2012', rev: 4.4037, sub: 0.15, x: 300},
  {fy: 'FY2013', rev: 4.0552, sub: 0.28, x: 560},
  {fy: 'FY2014', rev: 4.1471, sub: 0.5, x: 820},
  {fy: 'FY2025', rev: 23.769, sub: 0.96, x: 1100},
];
const BASE = 900;
const PX = 70; // px per $1B
const BLOCK = 0.25; // $B per block row

const Tower: React.FC<{rev: number; sub: number; x: number; t: number; label: string; w?: number}> = ({rev, sub, x, t, label, w = 190}) => {
  const rows = Math.ceil(rev / BLOCK);
  const shown = Math.floor(rows * t);
  const subRows = Math.round(rows * sub);
  return (
    <g>
      {Array.from({length: shown}).map((_, i) => {
        const isSub = i < subRows;
        const h = i === rows - 1 ? ((rev - BLOCK * (rows - 1)) / BLOCK) * BLOCK * PX : BLOCK * PX;
        return <rect key={i} x={x - w / 2} y={BASE - (i * BLOCK * PX) - h} width={w} height={h - 3} rx={3} fill={isSub ? C.orange : '#59616C'} />;
      })}
      <text x={x} y={BASE + 56} textAnchor="middle" fontSize={44} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk" opacity={t > 0 ? 1 : 0}>
        {label}
      </text>
      <text x={x} y={BASE - Math.min(shown, rows) * BLOCK * PX - 26} textAnchor="middle" fontSize={50} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk" opacity={t > 0.95 ? 1 : 0}>
        ${rev.toFixed(rev > 10 ? 1 : 2)}B
      </text>
      <text x={x} y={BASE - 20} textAnchor="middle" fontSize={40} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk" opacity={t > 0.95 ? 1 : 0}>
        {Math.round(sub * 100)}%
      </text>
    </g>
  );
};

export const S03Switch: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  const towersO = Math.max(b.during(0, 1), b.during(4, 5));
  const tw = (i: number) => (i === 0 ? b.ramp(0, 0, 1.0) : i === 1 ? b.rampAt(b.word(1, /later|28|twenty-eight/i, 0.4), 1.0) : i === 2 ? b.rampAt(b.word(4, /2014|fourteen|half/i, 0.15), 1.0) : b.rampAt(b.word(4, /2025|ninety|96/i, 0.6), 2.0));
  const pull = b.word(4, /2025|ninety|96/i, 0.6);
  const keys: [number, number, number, number][] = [
    [0, 560, 620, 1.15],
    [b.at(1), 560, 620, 1.15],
    [b.at(4), 700, 600, 1.0],
    [pull - 10, 700, 600, 1.0],
    [pull + 50, 760, 120, 0.36],
  ];
  const crack = b.rampAt(b.word(1, /fell/i, 0.7), 0.5);
  return (
    <SceneShell drift={[-14, 0]} zoom={0.03} beatCamera={false}>
      {/* towers on a camera canvas */}
      <div style={{position: 'absolute', inset: 0, opacity: towersO}}>
        <Camera frame={frame} keys={keys} sway={10}>
          <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <line x1={-400} y1={BASE} x2={2400} y2={BASE} stroke={C.line} strokeWidth={6} />
            {YEARS.map((y, i) => (
              <Tower key={y.fy} rev={y.rev} sub={y.sub} x={y.x} t={tw(i)} label={y.fy} w={i === 3 ? 260 : 190} />
            ))}
            {/* the dip: a red arrow from FY2012 to FY2013 */}
            <g opacity={crack}>
              <path d={`M300 ${BASE - 4.4037 * PX - 90} Q430 ${BASE - 4.4037 * PX - 140} 560 ${BASE - 4.0552 * PX - 90}`} fill="none" stroke={C.red} strokeWidth={8} />
              <text x={430} y={BASE - 4.4037 * PX - 150} textAnchor="middle" fontSize={56} fontWeight={700} fill={C.red} fontFamily="Space Grotesk">
                −8%
              </text>
            </g>
          </svg>
        </Camera>
        <Source>Adobe Forms 10-K (FY2014, FY2025) · heights to scale</Source>
        <Abs x={150} y={150} w={900} o={b.during(0, 1)}>
          <Kicker>Adobe revenue by year</Kicker>
          <div style={{display: 'flex', gap: 30, marginTop: 10, fontFamily: FONT_TITLE, fontSize: 32, fontWeight: 700}}>
            <span style={{color: C.orange}}>■ subscriptions</span>
            <span style={{color: '#8C949F'}}>■ everything else</span>
          </div>
        </Abs>
        <Abs x={1360} y={230} w={480} o={b.during(0, 0)}>
          <Title size={76}>In the short run, the switch hurt.</Title>
        </Abs>
        {/* readable labels once the camera has pulled back */}
        <Abs x={1220} y={330} w={620} o={b.rampAt(pull + 40, 0.4)}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 110, color: C.orange, lineHeight: 1}}>$23.8B</div>
          <Body size={36}>FY2025 · 96% subscriptions</Body>
          <Body size={30} color={C.muted} style={{marginTop: 18}}>
            FY2012: $4.4B · 15% subscriptions
          </Body>
        </Abs>
        <Abs x={150} y={150} w={820} o={b.during(5, 5)}>
          <div style={{marginTop: 70}}>
            <Title size={60}>Not all of that growth came from the switch.</Title>
            <Body size={36} color={C.muted} style={{marginTop: 12}}>
              But today almost all of Adobe’s revenue comes from customers who keep paying.
            </Body>
          </div>
        </Abs>
      </div>

      {/* beat 2: net income coins */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 2)}}>
        <Source>Adobe Form 10-K FY2014 · net income FY2012 $832.8M, FY2013 $290.0M</Source>
        <Abs x={0} y={160} w={1920} align="center">
          <Kicker>Adobe net income</Kicker>
        </Abs>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {[
            {x: 620, v: 833, label: 'FY2012', at: 0},
            {x: 1300, v: 290, label: 'FY2013', at: 1.2},
          ].map((c) => {
            const n = Math.round(c.v / 25);
            const t = b.ramp(2, c.at, 0.9);
            return (
              <g key={c.label}>
                {Array.from({length: Math.floor(n * t)}).map((_, i) => (
                  <ellipse key={i} cx={c.x + (i % 2 ? 4 : -4) + Math.sin(frame / 18 + i * 0.4) * 2} cy={820 - i * 17} rx={110} ry={26} fill={i === Math.floor(n * t) - 1 ? (Math.sin(frame / 6) > 0 ? '#F7C55A' : '#FFD97A') : C.orange} stroke={C.bg} strokeWidth={3} />
                ))}
                <text x={c.x} y={900} textAnchor="middle" fontSize={44} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
                  {c.label}
                </text>
                <text x={c.x} y={820 - n * 17 - 50} textAnchor="middle" fontSize={84} fontWeight={700} fill={c.v > 500 ? C.cream : C.red} fontFamily="Space Grotesk" opacity={t > 0.95 ? 1 : 0}>
                  ${c.v}M
                </text>
              </g>
            );
          })}
          <text x={960} y={560} textAnchor="middle" fontSize={64} fontWeight={700} fill={C.red} fontFamily="Space Grotesk" opacity={b.ramp(2, 2.0, 0.4)}>
            −65%
          </text>
        </svg>
      </div>

      {/* beat 3: one box vs a year of payments */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <line x1={160} y1={760} x2={1760} y2={760} stroke={C.line} strokeWidth={6} />
          {Array.from({length: 12}).map((_, m) => (
            <text key={m} x={240 + m * 130} y={820} textAnchor="middle" fontSize={30} fill={C.muted} fontFamily="Inter">
              {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][m]}
            </text>
          ))}
          {/* one burst in month 1 */}
          <rect x={200} y={760 - 300 * b.ramp(3, -0.2, 0.4)} width={80} height={300 * b.ramp(3, -0.2, 0.4)} rx={8} fill="#8C949F" />
          {/* running total of the monthly payments */}
          <polyline
            points={Array.from({length: 13}).map((_, m) => `${220 + m * 130},${760 - 25 * Math.min(m, 12 * b.rampAt(b.word(3, /again/i, 0.5), 2.0))}`).join(' ')}
            fill="none"
            stroke={C.orange}
            strokeWidth={6}
            strokeDasharray="14 10"
            opacity={b.rampAt(b.word(3, /spread/i, 0.5), 0.4)}
          />
          {/* steady monthly payments */}
          {Array.from({length: 12}).map((_, m) => {
            const o = b.rampAt(b.word(3, /again/i, 0.5) + m * 4, 0.2);
            // each month adds 1/12 of the box price; the running total line reaches the box height in December
            return <rect key={m} x={240 + m * 130 - 20} y={760 - 25 * o} width={40} height={25 * o} rx={6} fill={C.orange} opacity={o} />;
          })}
        </svg>
        <Abs x={160} y={250} w={700} o={b.ramp(3, -0.2)}>
          <Title size={56} color="#B5BCC6">
            A box: sold once
          </Title>
        </Abs>
        <Abs x={900} y={250} w={860} align="right" o={b.rampAt(b.word(3, /again/i, 0.5), 0.4)}>
          <Title size={56} color={C.orange}>
            A subscription: billed again and again
          </Title>
        </Abs>
        <Abs x={0} y={880} w={1920} align="center" o={b.rampAt(b.word(3, /spread/i, 0.8), 0.4)}>
          <Body size={36}>One burst becomes a stream spread across months and years</Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
