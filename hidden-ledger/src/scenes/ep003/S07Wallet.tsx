import React from 'react';
import {interpolate} from 'remotion';
import {APPS, AppDef, AppIcon, Paywall, Phone, Tap, usd} from '../../components/apps';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Illustrative, Kicker, Source, Title} from '../../components/ui';
import {C, FONT_TITLE} from '../../themes/theme';

// The competition for your wallet. A fixed-width monthly budget bar where a new subscription knocks
// another one out; apps from different categories competing for the same slot; the paywall levers;
// hard paywall vs freemium funnels (RevenueCat); the hypothetical bundle as a daily coin; lifetime option.

const SRC = 'RevenueCat, State of Subscription Apps 2026 · apps using RevenueCat';
const BUDGET = 1300; // px for a hypothetical $80 monthly budget
const pxOf = (a: AppDef) => (a.price / 80) * BUDGET;

export const S07Wallet: React.FC = () => {
  const b = useBeats();
  const {frame} = b;

  // beat 1: the budget bar fills, then a newcomer pushes one out
  const order: (keyof typeof APPS)[] = ['music', 'stream', 'cloud', 'fit', 'tasks', 'ai'];
  const fill = b.ramp(1, 0.2, 2.4);
  const newcomer = b.rampAt(b.word(1, /pushing|out/i, 0.7), 0.8);

  // beat 5: daily coin into a jar for a year
  const days = Math.floor(interpolate(frame, [b.at(5, 0.5), b.end(5) - 10], [0, 365], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <SceneShell drift={[0, 0]} zoom={0.012} beatCamera={false}>
      {/* beat 0: the customer's side */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <Phone x={960} y={560} w={330} s={0.85 + 0.15 * b.ramp(0, 0, 1.2)} rot={-4}>
          <div style={{padding: 22}}>
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 34, marginBottom: 14}}>My money · May</div>
            {['Rent', 'Groceries', 'Transport', 'Subscriptions'].map((l, i) => (
              <div key={l} style={{display: 'flex', justifyContent: 'space-between', fontSize: 26, padding: '10px 0', borderBottom: '2px solid rgba(0,0,0,0.08)', fontWeight: l === 'Subscriptions' ? 700 : 400, color: l === 'Subscriptions' ? '#B86E00' : '#15181C'}}>
                <span>{l}</span>
                <span>{['■■■■■■', '■■■', '■■', '■'][i]}</span>
              </div>
            ))}
          </div>
        </Phone>
        <Abs x={0} y={160} w={1920} align="center">
          <Title size={64}>Now, the customer’s side</Title>
        </Abs>
      </div>

      {/* beats 1-2: the budget bar and the fight for a slot */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 2)}}>
        <Illustrative />
        <Abs x={310} y={230} w={1300}>
          <Kicker>A monthly budget for apps (hypothetical: $80)</Kicker>
        </Abs>
        <div style={{position: 'absolute', left: 310, top: 300, width: BUDGET, height: 170, border: `5px solid ${C.cream}`, borderRadius: 24}} />
        {(() => {
          let x = 0;
          return order.map((k, i) => {
            const a = APPS[k];
            const w = pxOf(a);
            const t = Math.min(1, Math.max(0, fill * 6 - i));
            // the newcomer (meditation) pushes the cloud tile out
            const pushed = k === 'tasks' ? newcomer : 0;
            const left = 315 + x;
            x += w;
            return (
              <div key={k} style={{position: 'absolute', left: left - 3, top: 305 + pushed * 700, width: w - 6, height: 160, borderRadius: 18, background: a.color, opacity: t * (1 - pushed), transform: `translateY(${(1 - t) * -80}px) rotate(${pushed * 25}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', overflow: 'hidden'}}>
                <div style={{fontSize: 54, fontWeight: 700}}>{a.glyph}</div>
                <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 26, whiteSpace: 'nowrap'}}>{usd(a.price, 0)}</div>
              </div>
            );
          });
        })()}
        {/* newcomer */}
        <div style={{position: 'absolute', left: interpolate(newcomer, [0, 1], [1700, 315 + pxOf(APPS.music) + pxOf(APPS.stream) + pxOf(APPS.cloud) + pxOf(APPS.fit) - 3]), top: 305 - (1 - newcomer) * 0, width: pxOf(APPS.calm) - 6, height: 160, borderRadius: 18, background: APPS.calm.color, opacity: b.rampAt(b.word(1, /new/i, 0.3), 0.4), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 0 6px rgba(245,158,11,0.7)'}}>
          <div style={{fontSize: 54, fontWeight: 700}}>{APPS.calm.glyph}</div>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 26}}>NEW</div>
        </div>
        {/* beat 2: cross-category rivals */}
        <div style={{position: 'absolute', left: 310, top: 560, width: 1300, display: 'flex', justifyContent: 'space-between', opacity: b.during(2, 2)}}>
          {[
            [APPS.calm, APPS.stream, /meditation|streaming/i],
            [APPS.ai, APPS.cloud, /assistant|cloud/i],
          ].map(([a, c, w], i) => {
            const o = b.rampAt(b.word(2, w as RegExp, 0.3 + i * 0.3), 0.4);
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, opacity: o, transform: `scale(${0.9 + 0.1 * o})`}}>
                <AppIcon app={a as AppDef} size={120} />
                <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 60, color: C.orange}}>vs</div>
                <AppIcon app={c as AppDef} size={120} />
              </div>
            );
          })}
        </div>
        <Abs x={310} y={760} w={1300} o={b.during(2, 2)}>
          <Body size={38} weight={700}>
            Rivals aren’t just similar apps: anything competing for the same few dollars
          </Body>
        </Abs>
        <Abs x={310} y={520} w={1300} o={b.during(1, 1) * newcomer}>
          <Body size={38} weight={700} color={C.cream}>
            A new subscription has to push something else out
          </Body>
        </Abs>
      </div>

      {/* beat 3: the paywall levers */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <Phone x={560} y={540} w={330} tilt={8}>
          <Paywall
            app={APPS.fit}
            w={300}
            options={[
              {label: 'Free trial', price: '7 days', note: 'then monthly'},
              {label: 'First month', price: '$0.99', note: 'intro offer'},
              {label: 'Yearly', price: '−40%', note: 'vs monthly'},
            ]}
            pick={Math.min(2, Math.floor(b.ramp(3, 0.5, 3) * 3))}
            cta="Start"
            press={b.rampAt(b.word(3, /survive|renewal/i, 0.4), 0.3)}
          />
        </Phone>
        <Tap x={560} y={790} t={b.rampAt(b.word(3, /survive|renewal/i, 0.4), 0.5)} />
        <Abs x={850} y={240} w={900}>
          <Kicker>Getting onto the list</Kicker>
          {[
            ['Free trials', /trials/i],
            ['Discounted first months', /discounted/i],
            ['Cheaper yearly plans', /yearly/i],
          ].map(([l, w], i) => {
            const o = b.rampAt(b.word(3, w as RegExp, 0.3 + i * 0.2), 0.4);
            return (
              <div key={l as string} style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 62, color: C.cream, marginTop: 18, opacity: o, transform: `translateX(${(1 - o) * 60}px)`}}>
                {l as string}
              </div>
            );
          })}
          <div style={{marginTop: 40, display: 'inline-block', border: `5px solid ${C.red}`, borderRadius: 18, padding: '12px 26px', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 44, color: C.red, opacity: b.rampAt(b.word(3, /survive|renewal/i, 0.4), 0.4)}}>Then: the first renewal</div>
        </Abs>
        <Abs x={850} y={760} w={900} o={b.ramp(3, 0.5)}>
          <Body size={28} color={C.muted}>
            fictional app and offers
          </Body>
        </Abs>
      </div>

      {/* beat 4: hard paywall vs freemium */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <Source>{SRC} · download-to-paid by day 35, median</Source>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {[
            {x: 520, label: 'Hard paywall', pct: 10.7, color: C.orange, w: /hard|paywall/i},
            {x: 1400, label: 'Freemium', pct: 2.1, color: C.blue, w: /freemium/i},
          ].map((f) => {
            const t = b.rampAt(b.word(4, f.w, 0.3), 1.6);
            const paid = Math.round(f.pct * 10);
            return (
              <g key={f.label}>
                <path d={`M${f.x - 300} 330 L${f.x + 300} 330 L${f.x + 60} 620 L${f.x + 60} 760 L${f.x - 60} 760 L${f.x - 60} 620 Z`} fill="rgba(243,235,221,0.05)" stroke={C.cream} strokeWidth={5} />
                {Array.from({length: 1000}).map((_, i) => {
                  if (i % 5 !== 0) return null;
                  const j = i / 5;
                  const isPaid = j < paid / 5;
                  const y = 350 + (i % 50) * 5;
                  const x = f.x - 280 + ((i * 37) % 560);
                  // paying downloads slide down into the spout and stack there; the rest fade out
                  const tx = f.x - 40 + (j % 5) * 20;
                  const ty = 745 - Math.floor(j / 5) * 20;
                  return <circle key={i} cx={isPaid ? x + (tx - x) * t : x} cy={isPaid ? y + (ty - y) * t : y + t * 30} r={isPaid ? 8 : 6} fill={isPaid ? f.color : C.muted} opacity={isPaid ? 1 : 1 - t * 0.85} />;
                })}
                <text x={f.x} y={850} textAnchor="middle" fontSize={96} fontWeight={700} fill={f.color} fontFamily="Space Grotesk" opacity={t > 0.9 ? 1 : 0}>
                  {f.pct}%
                </text>
                <text x={f.x} y={300} textAnchor="middle" fontSize={48} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
                  {f.label}
                </text>
              </g>
            );
          })}
        </svg>
        <Abs x={0} y={180} w={1920} align="center">
          <Kicker>Of every 1,000 downloads, how many pay?</Kicker>
        </Abs>
        <Abs x={760} y={500} w={400} align="center" o={b.rampAt(b.word(4, /year|retention|same/i, 0.85), 0.4)}>
          <div style={{background: 'rgba(17,20,24,0.92)', border: `3px solid ${C.green}`, borderRadius: 20, padding: '16px 20px'}}>
            <Body size={32} weight={700} color={C.green}>
              a year later: retention nearly the same
            </Body>
          </div>
        </Abs>
      </div>

      {/* beat 5: the bundle, one day at a time */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(5, 5)}}>
        <Illustrative />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {/* jar */}
          <path d="M560 300 L560 820 Q560 860 600 860 L940 860 Q980 860 980 820 L980 300" fill="rgba(243,235,221,0.05)" stroke={C.cream} strokeWidth={8} />
          <rect x={570} y={860 - 540 * (days / 365)} width={400} height={540 * (days / 365)} fill={C.orange} opacity={0.85} />
          <circle cx={770} cy={interpolate((frame % 10) / 10, [0, 1], [200, 860 - 540 * (days / 365)])} r={26} fill={C.orange} stroke={C.cream} strokeWidth={4} opacity={days > 0 && days < 365 ? 1 : 0} />
        </svg>
        <Abs x={1080} y={300} w={760}>
          <Kicker>Our hypothetical bundle</Kicker>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 90, color: C.cream, marginTop: 8}}>$2.41 a day</div>
          <Body size={34} color={C.muted}>
            less than three dollars, every day
          </Body>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64, color: C.orange, marginTop: 40, fontVariantNumeric: 'tabular-nums'}}>
            day {days} · {usd((73.45 * 12 * days) / 365, 0)}
          </div>
        </Abs>
      </div>

      {/* beat 6: lifetime purchase option */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(6, 6)}}>
        <Source>{SRC} · monetization mix</Source>
        <Phone x={520} y={540} w={330} tilt={8}>
          <Paywall app={APPS.tasks} w={300} options={[{label: 'Monthly', price: '$/mo'}, {label: 'Yearly', price: '$/yr'}, {label: 'Lifetime', price: 'pay once', note: 'no renewals'}]} pick={b.ramp(6, 1.0) > 0.5 ? 2 : -1} cta="Continue" />
        </Phone>
        <div style={{position: 'absolute', left: 900, top: 320, display: 'grid', gridTemplateColumns: 'repeat(10, 48px)', gap: 8}}>
          {Array.from({length: 100}).map((_, i) => {
            const on = i < 23 && b.rampAt(b.word(6, /quarter|lifetime/i, 0.4), 1.0) * 23 > i;
            return <div key={i} style={{width: 48, height: 48, borderRadius: 12, background: on ? C.orange : '#2B313A'}} />;
          })}
        </div>
        <Abs x={900} y={200} w={900}>
          <Body size={38} weight={700}>
            <span style={{color: C.orange}}>23%</span> of apps pair subscriptions with a lifetime purchase
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
