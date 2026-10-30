import React from 'react';
import {interpolate} from 'remotion';
import {SceneShell} from '../../components/SceneShell';
import {rnd} from '../../components/sets';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Illustrative, Kicker, Source, Title} from '../../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';

// Subscription math as one physical metaphor: a leaky bucket.
//  - water level = monthly recurring revenue (MRR); holes = churn; water that stays = retention
//  - the tap pours in new customers, each with a price tag = customer acquisition cost (CAC)
//  - a drop's monthly coins = lifetime value (LTV)
// Then the HYPOTHETICAL $10 app (calculations.json): Apple's 70/85% split, $7/month, churn 10% vs 20%, CAC $40.

const BX = 470; // bucket centre x
const BY = 640; // bucket centre y

const Bucket: React.FC<{level: number; holes: number; leak: number; pour: number; frame: number; holeSize?: number}> = ({level, holes, leak, pour, frame, holeSize = 1}) => {
  const top = BY - 230;
  const bot = BY + 230;
  const waterTop = bot - 420 * level;
  return (
    <g>
      {/* tap + new customers falling in */}
      <g opacity={pour > 0 ? 1 : 0}>
        <path d={`M${BX - 260} ${top - 190} L${BX - 40} ${top - 190} L${BX - 40} ${top - 140} L${BX - 70} ${top - 140}`} fill="none" stroke={C.cream} strokeWidth={22} strokeLinecap="round" />
        {Array.from({length: 6}).map((_, i) => {
          const p = ((frame / 30 + i / 6) % 1) * pour;
          return <circle key={i} cx={BX - 55} cy={top - 130 + p * (waterTop - top + 130)} r={16} fill={C.green} opacity={pour} />;
        })}
      </g>
      {/* bucket body */}
      <clipPath id="bk">
        <path d={`M${BX - 230} ${top} L${BX + 230} ${top} L${BX + 180} ${bot} L${BX - 180} ${bot} Z`} />
      </clipPath>
      <g clipPath="url(#bk)">
        <rect x={BX - 240} y={waterTop + Math.sin(frame / 9) * 4} width={480} height={bot - waterTop + 10} fill="rgba(78,159,125,0.75)" />
        {Array.from({length: 22}).map((_, i) => (
          <circle key={i} cx={BX - 170 + (i % 8) * 48 + (Math.floor(i / 8) % 2) * 24} cy={bot - 30 - Math.floor(i / 8) * 46} r={14} fill="rgba(243,235,221,0.35)" opacity={waterTop < bot - 40 - Math.floor(i / 8) * 46 ? 1 : 0} />
        ))}
      </g>
      <path d={`M${BX - 230} ${top} L${BX + 230} ${top} L${BX + 180} ${bot} L${BX - 180} ${bot} Z`} fill="none" stroke={C.cream} strokeWidth={10} strokeLinejoin="round" />
      {/* holes + leaking drops = churn */}
      {Array.from({length: holes}).map((_, h) => {
        const hx = BX - 120 + h * 120;
        const hy = bot - 30 - (h % 2) * 70;
        return (
          <g key={h}>
            <ellipse cx={hx} cy={hy} rx={16 * holeSize} ry={10 * holeSize} fill={C.bg} stroke={C.red} strokeWidth={4} />
            {Array.from({length: 4}).map((__, k) => {
              const p = ((frame / (24 / holeSize) + k / 4 + rnd(h) * 0.5) % 1) * leak;
              return <circle key={k} cx={hx + (h - 1) * 30 * p} cy={hy + 20 + p * 220} r={10 * holeSize} fill={C.red} opacity={leak * (1 - p)} />;
            })}
          </g>
        );
      })}
    </g>
  );
};

const Coin: React.FC<{x: number; y: number; label: string; color?: string; o?: number; r?: number}> = ({x, y, label, color = C.green, o = 1, r = 34}) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <circle r={r} fill={color} stroke={C.cream} strokeWidth={4} />
    <text y={r * 0.33} textAnchor="middle" fontSize={r * 0.82} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk">
      {label}
    </text>
  </g>
);

export const S05Math: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  const bucketO = b.during(0, 3);
  const level = b.ramp(1, 0, 1.5) * 0.7 - b.ramp(2, 0.5, 4) * 0.12 + b.ramp(3, 0.5, 4) * 0.1;
  const holes = frame >= b.at(2) ? 3 : 0;
  const lab = (i: number, w: RegExp, frac: number) => b.rampAt(b.word(i, w, frac), 0.35);
  return (
    <SceneShell drift={[0, 0]} zoom={0.01} beatCamera={false}>
      {/* beats 0-3: the bucket */}
      <div style={{position: 'absolute', inset: 0, opacity: bucketO}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <Bucket level={Math.max(0.05, level)} holes={holes} leak={b.ramp(2, 0.3, 0.8)} pour={b.rampAt(b.word(3, /acquisition|win/i, 0.2), 0.5)} frame={frame} />
          {/* price tag on each new customer (CAC) */}
          <g opacity={b.rampAt(b.word(3, /acquisition|spends/i, 0.25), 0.4)} transform={`translate(${BX - 330} ${BY - 300})`}>
            <path d="M0 0 L120 0 L150 30 L120 60 L0 60 Z" fill={C.orange} stroke={C.cream} strokeWidth={4} />
            <text x={62} y={42} textAnchor="middle" fontSize={34} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk">
              CAC
            </text>
          </g>
        </svg>
        <Abs x={150} y={150} w={700} o={b.during(0, 0)}>
          <Title size={64}>A handful of numbers, all connected</Title>
        </Abs>
        <div style={{position: 'absolute', left: 980, top: 200, width: 800, display: 'flex', flexDirection: 'column', gap: 22}}>
          {[
            {k: 'MRR', d: 'Monthly recurring revenue', s: 'the water in the bucket: what is billed each month', o: Math.max(b.ramp(0, 0.4), lab(1, /monthly/i, 0.1)), c: C.green},
            {k: 'Churn', d: 'Who leaves', s: 'the holes: share of subscribers who cancel per period', o: Math.max(b.ramp(0, 0.7), lab(2, /churn/i, 0.1)), c: C.red},
            {k: 'Retention', d: 'Who stays', s: 'the water that stays: share still paying', o: Math.max(b.ramp(0, 1.0), lab(2, /retention/i, 0.6)), c: C.green},
            {k: 'CAC', d: 'Customer acquisition cost', s: 'the price tag on each new drop: ads & promotion per paying customer', o: Math.max(b.ramp(0, 1.3), lab(3, /acquisition/i, 0.2)), c: C.orange},
            {k: 'LTV', d: 'Lifetime value', s: 'everything one customer pays while they stay', o: Math.max(b.ramp(0, 1.6), lab(3, /lifetime/i, 0.75)), c: C.blue},
          ].map((r, i) => {
            const active = [1, 2, 2, 3, 3][i];
            const on = b.during(active, active) > 0.5 && r.o > 0.9;
            return (
              <div key={r.k} style={{display: 'flex', gap: 24, alignItems: 'center', opacity: 0.25 + 0.75 * r.o, background: on ? 'rgba(29,34,41,0.95)' : 'transparent', borderRadius: 18, padding: '10px 16px', border: `3px solid ${on ? r.c : 'transparent'}`}}>
                <div style={{width: 270, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 54, color: r.c}}>{r.k}</div>
                <div>
                  <div style={{fontFamily: FONT_BODY, fontWeight: 700, fontSize: 32, color: C.cream}}>{r.d}</div>
                  <div style={{fontFamily: FONT_BODY, fontSize: 28, color: C.muted, display: on ? 'block' : 'none'}}>{r.s}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* beat 4: Apple's split */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <Source>Apple developer documentation, auto-renewable subscriptions (accessed Oct 2026)</Source>
        <Abs x={150} y={200} w={1600}>
          <Kicker>Where a hypothetical $10 payment goes on Apple’s App Store</Kicker>
        </Abs>
        {[
          {l: 'Subscriber’s first year', dev: 70, w: /first/i},
          {l: 'After one year of paid service', dev: 85, w: /after|85|eighty/i},
          {l: 'Small Business Program', dev: 85, w: /Small|Business/i},
        ].map((r, i) => {
          const o = b.rampAt(b.word(4, r.w, 0.3 + i * 0.25, i === 2 ? 0 : 0), 0.6);
          return (
            <div key={r.l} style={{position: 'absolute', left: 150, top: 320 + i * 170, width: 1620, opacity: 0.2 + 0.8 * o}}>
              <div style={{fontFamily: FONT_BODY, fontWeight: 700, fontSize: 34, color: C.cream, marginBottom: 10}}>{r.l}</div>
              <div style={{display: 'flex', height: 90, borderRadius: 16, overflow: 'hidden', border: `3px solid ${C.line}`}}>
                <div style={{width: `${r.dev * o}%`, background: C.green, display: 'flex', alignItems: 'center', paddingLeft: 24, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 44, color: C.bg, whiteSpace: 'nowrap'}}>developer ${(r.dev / 10).toFixed(2)}</div>
                <div style={{flex: 1, background: '#59616C', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 24, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, color: C.cream, whiteSpace: 'nowrap'}}>store ${((100 - r.dev) / 10).toFixed(2)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* beats 5-7: lifetime value vs acquisition cost */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(5, 7)}}>
        <Illustrative />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {/* monthly $7 coins along a timeline: 10 at 10% churn, 5 at 20% churn */}
          {Array.from({length: 10}).map((_, m) => {
            const appear = b.rampAt(b.word(5, /ten months|months/i, 0.6) + m * 4, 0.25);
            const doubled = b.rampAt(b.word(7, /doubles/i, 0.4) + (9 - m) * 3, 0.3);
            const lost = m >= 5 ? doubled : 0;
            return <Coin key={m} x={260 + m * 120} y={520 - 18 * Math.sin(Math.PI * appear)} label="$7" o={appear * (1 - lost)} />;
          })}
          <line x1={210} y1={600} x2={1450} y2={600} stroke={C.line} strokeWidth={5} />
          {Array.from({length: 10}).map((_, m) => (
            <text key={m} x={260 + m * 120} y={650} textAnchor="middle" fontSize={28} fill={C.muted} fontFamily="Inter">
              mo {m + 1}
            </text>
          ))}
          {/* CAC stack */}
          <g opacity={b.ramp(6, 0.1)}>
            <rect x={1560} y={600 - 4 * 35} width={150} height={4 * 35} rx={10} fill={C.red} />
            <text x={1635} y={600 - 4 * 35 - 20} textAnchor="middle" fontSize={44} fontWeight={700} fill={C.red} fontFamily="Space Grotesk">
              CAC $40
            </text>
          </g>
          {/* LTV stack */}
          {(() => {
            const ltv = interpolate(b.rampAt(b.word(7, /doubles/i, 0.4), 1.2), [0, 1], [70, 35]);
            const show = b.rampAt(b.word(5, /seventy|70/i, 0.85), 0.5);
            return (
              <g opacity={show}>
                <rect x={1380} y={600 - (ltv / 10) * 35} width={150} height={(ltv / 10) * 35} rx={10} fill={ltv >= 40 ? C.green : '#B5523B'} />
                <text x={1455} y={600 - (ltv / 10) * 35 - 20} textAnchor="middle" fontSize={44} fontWeight={700} fill={ltv >= 40 ? C.green : C.red} fontFamily="Space Grotesk">
                  LTV ${Math.round(ltv)}
                </text>
              </g>
            );
          })()}
        </svg>
        <Abs x={150} y={200} w={1200}>
          <Kicker>Hypothetical $10 app · developer keeps $7 a month</Kicker>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64, color: C.cream, marginTop: 10}}>
            {b.during(7, 7) > 0.5 ? (
              <span>
                Churn <span style={{color: C.red}}>20%</span> a month → ~5 months
              </span>
            ) : (
              <span>
                Churn <span style={{color: C.green}}>10%</span> a month → ~10 months
              </span>
            )}
          </div>
        </Abs>
        <Abs x={150} y={720} w={1600} o={b.ramp(6, 0.3)}>
          <Body size={44} weight={700} style={{fontFamily: FONT_TITLE}}>
            {b.during(7, 7) > 0.5 ? (
              <span style={{color: C.red}}>$35 in, $40 out: every new customer loses money</span>
            ) : (
              <span style={{color: C.green}}>$70 in, $40 out: a healthy customer</span>
            )}
          </Body>
          <Body size={28} color={C.muted} style={{marginTop: 8}}>
            average months ≈ 1 ÷ monthly churn · before servers, salaries and other costs
          </Body>
        </Abs>
      </div>

      {/* beat 8: churn dashboard */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(8, 8)}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <g transform="translate(960 640)">
            <path d="M-320 0 A320 320 0 0 1 320 0" fill="none" stroke={C.line} strokeWidth={46} />
            <path d="M-320 0 A320 320 0 0 1 -226 -226" fill="none" stroke={C.green} strokeWidth={46} />
            <path d="M-226 -226 A320 320 0 0 1 226 -226" fill="none" stroke={C.orange} strokeWidth={46} />
            <path d="M226 -226 A320 320 0 0 1 320 0" fill="none" stroke={C.red} strokeWidth={46} />
            <g transform={`rotate(${-80 + 120 * b.ramp(8, 0.3, 1.5) + Math.sin(frame / 5) * 3})`}>
              <line x1={0} y1={0} x2={0} y2={-270} stroke={C.cream} strokeWidth={12} strokeLinecap="round" />
            </g>
            <circle r={30} fill={C.cream} />
            <text y={110} textAnchor="middle" fontSize={84} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
              CHURN
            </text>
          </g>
        </svg>
        <Abs x={0} y={160} w={1920} align="center">
          <Title size={64}>The number subscription apps watch most closely</Title>
        </Abs>
      </div>
    </SceneShell>
  );
};
