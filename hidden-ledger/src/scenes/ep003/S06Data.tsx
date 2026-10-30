import React from 'react';
import {APPS, AppIcon, Camera, Figure, Phone} from '../../components/apps';
import {rnd} from '../../components/sets';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Kicker, Source, Title} from '../../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';

// What the data shows (RevenueCat, State of Subscription Apps 2026). Every figure is from the report;
// the population limit (apps using RevenueCat only) is drawn, not just footnoted.

const SRC = 'RevenueCat, State of Subscription Apps 2026 · apps using RevenueCat, 2025 data';

export const S06Data: React.FC = () => {
  const b = useBeats();
  const {frame} = b;

  // beat 2: skyline of monthly revenue one year after launch (median $72 vs top-10% threshold $2,574)
  const skyT = b.during(2, 2);
  const panStart = b.at(2, 0.3);
  const panEnd = b.word(2, /top|2,500|twenty-five/i, 0.6);
  const sky: [number, number, number, number][] = [
    [0, 700, 760, 1.6],
    [panStart, 700, 760, 1.6],
    [panEnd - 10, 1250, 760, 1.6],
    [panEnd + 40, 1080, 520, 0.62],
  ];
  // heights: 50 buildings; illustrative shape of a right-skewed distribution anchored on the two reported points
  const H = (i: number) => {
    const q = (i + 0.5) / 50;
    const v = q < 0.5 ? 72 * Math.pow(q / 0.5, 1.6) : q < 0.9 ? 72 + (2574 - 72) * Math.pow((q - 0.5) / 0.4, 3) : 2574 * (1 + (q - 0.9) * 3);
    return Math.max(4, v);
  };
  const PX = 0.32; // px per $ of monthly revenue
  return (
    <SceneShell drift={[0, 0]} zoom={0.01} beatCamera={false}>
      {/* beats 0-1: the data set and its boundary */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 1)}}>
        <Source>{SRC}</Source>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 900}).map((_, i) => {
            const x = 60 + rnd(i) * 1800;
            const y = 150 + rnd(i + 999) * 760;
            const inside = Math.hypot(x - 1300, y - 540) < 330;
            const o = inside ? b.ramp(0, -0.3 + rnd(i + 7) * 1.6, 0.4) : 0.35 * b.ramp(0, -0.4 + rnd(i + 5) * 1.2, 0.4) * (1 - 0.6 * b.ramp(1, 2, 0.6));
            return <circle key={i} cx={x} cy={y} r={inside ? 7 : 5} fill={inside ? C.orange : C.muted} opacity={o} />;
          })}
          <circle cx={1300} cy={540} r={340} fill="none" stroke={C.orange} strokeWidth={6} strokeDasharray="20 14" opacity={b.ramp(1, 1.5, 0.5)} />
        </svg>
        <Abs x={150} y={260} w={760}>
          <Kicker>The largest data set we could verify</Kicker>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 130, color: C.cream, lineHeight: 1, marginTop: 10, opacity: b.rampAt(b.word(1, /115|hundred/i, 0.2), 0.4)}}>115,000+</div>
          <Body size={36} color={C.muted} style={{opacity: b.rampAt(b.word(1, /115|hundred/i, 0.2), 0.4)}}>
            subscription apps
          </Body>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 110, color: C.green, lineHeight: 1, marginTop: 20, opacity: b.rampAt(b.word(1, /16|sixteen/i, 0.4), 0.4)}}>$16B+</div>
          <Body size={36} color={C.muted} style={{opacity: b.rampAt(b.word(1, /16|sixteen/i, 0.4), 0.4)}}>
            in revenue
          </Body>
        </Abs>
        <Abs x={150} y={740} w={760} o={b.ramp(1, 1.6, 0.5)}>
          <Body size={34} weight={700} color={C.orange}>
            ◯ only apps that use RevenueCat’s tools, not every app in the world
          </Body>
        </Abs>
      </div>

      {/* beat 2: the skyline */}
      <div style={{position: 'absolute', inset: 0, opacity: skyT}}>
        <Camera frame={frame} keys={sky}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <rect x={-400} y={900} width={2800} height={400} fill="#101317" />
            {Array.from({length: 50}).map((_, i) => {
              const h = H(i) * PX;
              const x = 300 + i * 30;
              const isMed = i === 24 || i === 25;
              const top = i >= 45;
              return (
                <g key={i}>
                  <rect x={x} y={900 - h} width={24} height={h} fill={top ? C.orange : isMed ? C.green : '#3A424C'} />
                  {h > 40 && Array.from({length: Math.floor(h / 30)}).map((__, k) => <rect key={k} x={x + 6} y={900 - h + 10 + k * 30} width={12} height={10} fill="rgba(243,235,221,0.25)" />)}
                </g>
              );
            })}
            <g>
              <line x1={1050} y1={900 - 72 * PX - 10} x2={1050} y2={760} stroke={C.green} strokeWidth={4} />
              <text x={1050} y={745} textAnchor="middle" fontSize={44} fontWeight={700} fill={C.green} fontFamily="Space Grotesk">
                median ~$72/mo
              </text>
            </g>
            <text x={1700} y={900 - 2574 * PX - 60} textAnchor="middle" fontSize={84} fontWeight={700} fill={C.orange} fontFamily="Space Grotesk">
              top 10%: $2,574+/mo
            </text>
          </svg>
        </Camera>
        <Source>{SRC}</Source>
        <Abs x={150} y={170} w={1000}>
          <Kicker>Monthly revenue one year after launch</Kicker>
          <Body size={28} color={C.muted}>
            building heights illustrate the reported median and top-10% threshold
          </Body>
        </Abs>
      </div>

      {/* beat 3: 4.6% reach $10K; pre-2020 apps take 69% */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <Source>{SRC}</Source>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 1000}).map((_, i) => {
            const lit = i % 22 === 7 && i < 1012;
            const on = lit && b.ramp(3, 0.6 + (i / 1000) * 1.5, 0.2) > 0.5;
            return <rect key={i} x={150 + (i % 50) * 16} y={430 + Math.floor(i / 50) * 16} width={12} height={12} rx={3} fill={on ? C.orange : '#2B313A'} />;
          })}
          {/* donut: revenue share by launch year */}
          {(() => {
            const t = b.rampAt(b.word(3, /2020|twenty/i, 0.7), 1.0);
            const a = 0.69 * 360 * t;
            const P = (d: number, r: number) => `${1400 + Math.cos(((d - 90) * Math.PI) / 180) * r} ${640 + Math.sin(((d - 90) * Math.PI) / 180) * r}`;
            return (
              <g opacity={b.rampAt(b.word(3, /2020|twenty/i, 0.7), 0.3)}>
                <circle cx={1400} cy={640} r={190} fill="none" stroke="#2B313A" strokeWidth={80} />
                {a > 1 && <path d={`M${P(0, 190)} A190 190 0 ${a > 180 ? 1 : 0} 1 ${P(a, 190)}`} fill="none" stroke={C.orange} strokeWidth={80} />}
                <text x={1400} y={670} textAnchor="middle" fontSize={96} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
                  69%
                </text>
              </g>
            );
          })()}
        </svg>
        <Abs x={150} y={170} w={780}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 96, color: C.orange, lineHeight: 1}}>4.6%</div>
          <Body size={32}>of new apps reached $10,000 a month within two years</Body>
          <Body size={28} color={C.muted}>
            one square = one in a thousand new apps
          </Body>
        </Abs>
        <Abs x={1090} y={240} w={620} align="center" o={b.rampAt(b.word(3, /2020|twenty/i, 0.7), 0.4)}>
          <Body size={34} weight={700}>
            of all subscription revenue goes to apps launched <span style={{color: C.orange}}>before 2020</span>
          </Body>
        </Abs>
      </div>

      {/* beats 4-5: the retention road */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 5)}}>
        <Source>{SRC} · median share of subscriptions still active after 1 year (2024 cohort)</Source>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {[
            {y: 420, keep: 0.08, label: 'Monthly plans', color: C.orange, firstGate: 0.5},
            {y: 720, keep: 0.28, label: 'Yearly plans', color: C.green, firstGate: 0.28},
          ].map((lane, li) => {
            const p = b.ramp(4, 0.8 + li * 0.4, 5.0);
            return (
              <g key={lane.label}>
                <rect x={300} y={lane.y - 60} width={1460} height={120} rx={60} fill="#1A1F26" />
                <text x={150} y={lane.y + 12} fontSize={34} fontWeight={700} fill={C.cream} fontFamily="Inter">
                  {lane.label.split(' ')[0]}
                </text>
                <line x1={1720} y1={lane.y - 70} x2={1720} y2={lane.y + 70} stroke={C.cream} strokeWidth={6} strokeDasharray="10 8" />
                {Array.from({length: 100}).map((_, i) => {
                  const survives = rnd(i * 3 + li) < lane.keep / (li === 0 ? 1 : 1);
                  const dropAt = survives ? 2 : rnd(i + 50 + li) * 0.9 + 0.05;
                  const x = 340 + Math.min(p, dropAt) * 1360 + (i % 10) * 6;
                  const yy = lane.y - 40 + Math.floor(i / 10) * 8 + (p > dropAt ? (p - dropAt) * 300 : 0);
                  const o = p > dropAt ? Math.max(0, 1 - (p - dropAt) * 4) : 1;
                  return (
                    <g key={i} transform={`translate(${x} ${yy})`} opacity={o * (p > 0 ? 1 : 0)}>
                      <Figure color={lane.color} s={0.45} />
                    </g>
                  );
                })}
                <text x={1700} y={lane.y - 80} textAnchor="end" fontSize={56} fontWeight={700} fill={lane.color} fontFamily="Space Grotesk" opacity={p > 0.97 ? 1 : 0}>
                  {Math.round(lane.keep * 100)}% still active after a year
                </text>
              </g>
            );
          })}
        </svg>
        <Abs x={150} y={170} w={1600}>
          <Kicker>Out of every 100 subscriptions started</Kicker>
        </Abs>
        <Abs x={300} y={228} w={1500} o={b.during(5, 5)}>
          <Body size={40} weight={700} style={{fontFamily: FONT_TITLE}}>
            Nearly half of monthly subscribers <span style={{color: C.red}}>never renew even once</span>
          </Body>
        </Abs>
      </div>

      {/* beat 6: subscriptions, not people */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(6, 6)}}>
        <Phone x={560} y={540} w={300} tilt={10}>
          <div style={{padding: 24, textAlign: 'center'}}>
            <AppIcon app={APPS.fit} size={110} style={{margin: '30px auto 12px'}} />
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 34}}>Pulsefit</div>
            <div style={{marginTop: 16, display: 'inline-block', background: '#E9E3D8', borderRadius: 99, padding: '6px 20px', fontSize: 26, fontWeight: 700}}>Free plan</div>
            <div style={{marginTop: 30, fontSize: 28, color: '#4A4741'}}>Workout of the day ▸</div>
          </div>
        </Phone>
        <Phone x={1360} y={540} w={300} tilt={-10} light={false}>
          <div style={{padding: 24, textAlign: 'center', opacity: 0.55}}>
            <AppIcon app={APPS.calm} size={110} style={{margin: '30px auto 12px', filter: 'grayscale(0.7)'}} />
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 34}}>Stillwater</div>
            <div style={{marginTop: 16, fontSize: 26, color: C.muted}}>last opened: weeks ago</div>
          </div>
        </Phone>
        <Abs x={150} y={160} w={1620} align="center">
          <Title size={58}>Subscriptions, not people. Payments, not use.</Title>
        </Abs>
        <Abs x={720} y={420} w={420} o={b.rampAt(b.word(6, /cancel/i, 0.5), 0.4)}>
          <Body size={30} weight={700} color={C.red}>
            cancelled · still using it free
          </Body>
        </Abs>
        <Abs x={780} y={620} w={400} align="right" o={b.rampAt(b.word(6, /barely|paying/i, 0.8), 0.4)}>
          <Body size={30} weight={700} color={C.green}>
            still paying · barely opens it
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
