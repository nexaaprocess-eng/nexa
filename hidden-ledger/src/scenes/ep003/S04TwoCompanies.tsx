import React from 'react';
import {interpolate} from 'remotion';
import {APPS, AppIcon, Figure, Phone} from '../../components/apps';
import {rnd} from '../../components/sets';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Illustrative, Kicker, Title} from '../../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';

// Two HYPOTHETICAL companies (calculations.json company_*): $120 once vs $10/month, 1,000 customers each.
// Shots: the two offers on two phones; customers pour in and cash counters race in month one; month two
// (one crowd gone, one stays); a 12-month cumulative race; the never-ending costs; customers start to leave.

const LEFT = '#8C949F';
const money = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

const Crowd: React.FC<{x: number; y: number; n: number; t: number; color: string; leave?: number; seed?: number}> = ({x, y, n, t, color, leave = 0, seed = 0}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const col = i % 10;
      const row = Math.floor(i / 10);
      const arrive = Math.min(1, Math.max(0, t * 1.4 - (i / n) * 0.4));
      const gone = rnd(i + seed) < leave;
      const px = x + col * 34 + (row % 2) * 17;
      const py = y + row * 34;
      return (
        <g key={i} transform={`translate(${gone ? px + 600 * leave : px} ${py + (1 - arrive) * -160})`} opacity={arrive * (gone ? 1 - leave : 1)}>
          <Figure color={color} s={0.6} />
        </g>
      );
    })}
  </g>
);

export const S04TwoCompanies: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  // beat 2: month one
  const m1 = b.ramp(2, 0.5, 2.0);
  // beat 4: race over 12 months
  const race = b.ramp(4, 0.2, 3.5);
  return (
    <SceneShell drift={[0, 0]} zoom={0.012} beatCamera={false}>
      <div style={{opacity: b.during(0, 4)}}>
        <Illustrative />
      </div>

      {/* beats 0-1: the two offers */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 1)}}>
        <Phone x={560} y={545} w={330} tilt={10} s={b.pop(0, 0.2)}>
          <div style={{padding: 26, textAlign: 'center'}}>
            <AppIcon app={{...APPS.photo, color: '#59616C'}} size={130} style={{margin: '30px auto 18px'}} />
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40}}>PhotoOnce</div>
            <div style={{fontSize: 28, color: '#6A665F'}}>Company A</div>
            <div style={{marginTop: 50, background: '#59616C', color: '#fff', borderRadius: 24, padding: '20px 0', fontWeight: 700, fontSize: 38, opacity: b.rampAt(b.word(1, /120|hundred/i, 0.3), 0.3)}}>Buy · $120 once</div>
          </div>
        </Phone>
        <Phone x={1360} y={545} w={330} tilt={-10} s={b.pop(0, 0.5)}>
          <div style={{padding: 26, textAlign: 'center'}}>
            <AppIcon app={APPS.photo} size={130} style={{margin: '30px auto 18px'}} />
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40}}>PhotoLoop</div>
            <div style={{fontSize: 28, color: '#6A665F'}}>Company B</div>
            <div style={{marginTop: 50, background: APPS.photo.color, color: '#fff', borderRadius: 24, padding: '20px 0', fontWeight: 700, fontSize: 38, opacity: b.rampAt(b.word(1, /month/i, 0.8), 0.3)}}>Subscribe · $10/mo</div>
          </div>
        </Phone>
        <Abs x={760} y={300} w={400} align="center" o={b.ramp(0, 0.2)}>
          <Title size={60}>Two software companies</Title>
        </Abs>
        <Abs x={760} y={560} w={400} align="center" o={b.ramp(0, 1.0)}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 80, color: C.muted}}>vs</div>
        </Abs>
      </div>

      {/* beats 2-3: month one, month two */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 3)}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <line x1={960} y1={250} x2={960} y2={860} stroke={C.line} strokeWidth={4} />
          <Crowd x={170} y={520} n={60} t={m1} color={LEFT} leave={b.during(3, 3) > 0.5 ? b.rampAt(b.word(3, /next|find/i, 0.3), 1.2) : 0} seed={3} />
          <Crowd x={1110} y={520} n={60} t={m1} color={C.orange} />
          {/* coin flow into each company: a big burst vs a small trickle */}
          {Array.from({length: 18}).map((_, i) => {
            const p = interpolate(frame - b.at(2, 0.6) - i * 2, [0, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return <circle key={i} cx={350 + (i % 6) * 20} cy={interpolate(p, [0, 1], [520, 330])} r={14} fill={C.orange} opacity={p > 0 && p < 1 ? 1 : 0} />;
          })}
          {Array.from({length: 3}).map((_, i) => {
            const p = interpolate(frame - b.at(2, 1.2) - i * 6, [0, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return <circle key={i} cx={1290 + i * 20} cy={interpolate(p, [0, 1], [520, 330])} r={14} fill={C.orange} opacity={p > 0 && p < 1 ? 1 : 0} />;
          })}
        </svg>
        <Abs x={150} y={215} w={760}>
          <Kicker color={C.muted}>Company A · month {b.during(3, 3) > 0.5 ? 'two' : 'one'}</Kicker>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 130, color: C.cream, fontVariantNumeric: 'tabular-nums'}}>{money(b.during(3, 3) > 0.5 ? 0 : 120000 * m1)}</div>
          <Body size={32} color={C.muted}>
            {b.during(3, 3) > 0.5 ? 'needs 1,000 new buyers to do it again' : '1,000 customers × $120, all at once'}
          </Body>
        </Abs>
        <Abs x={1090} y={215} w={760}>
          <Kicker>Company B · month {b.during(3, 3) > 0.5 ? 'two' : 'one'}</Kicker>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 130, color: C.orange, fontVariantNumeric: 'tabular-nums'}}>{money(b.during(3, 3) > 0.5 ? 10000 : 10000 * m1)}</div>
          <Body size={32} color={C.muted}>
            {b.during(3, 3) > 0.5 ? 'the same 1,000 customers pay again' : '1,000 customers × $10'}
          </Body>
        </Abs>
      </div>

      {/* beat 4: twelve-month race */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 12}).map((_, m) => (
            <g key={m}>
              <line x1={300 + m * 115} y1={300} x2={300 + m * 115} y2={800} stroke="#1B2027" strokeWidth={2} />
              <text x={300 + m * 115} y={850} textAnchor="middle" fontSize={30} fill={C.muted} fontFamily="Inter">
                {m + 1}
              </text>
            </g>
          ))}
          <line x1={280} y1={800} x2={1600} y2={800} stroke={C.line} strokeWidth={5} />
          {/* A: one burst, flat */}
          <polyline points={Array.from({length: 12}).map((_, m) => `${300 + m * 115},${800 - 420 * Math.min(1, race * 12 >= m ? 1 : 0)}`).filter((_, m) => race * 12 >= m).join(' ')} fill="none" stroke={LEFT} strokeWidth={10} strokeLinejoin="round" />
          {/* B: climbs by 1/12 per month */}
          <polyline points={Array.from({length: 12}).map((_, m) => `${300 + m * 115},${800 - 35 * (m + 1)}`).filter((_, m) => race * 12 >= m).join(' ')} fill="none" stroke={C.orange} strokeWidth={10} strokeLinejoin="round" />
          {/* B forecast */}
          <line x1={1565} y1={380} x2={1780} y2={300} stroke={C.orange} strokeWidth={6} strokeDasharray="14 12" opacity={b.rampAt(b.word(4, /knows|next/i, 0.7), 0.4)} />
          <text x={300} y={290} fontSize={36} fontWeight={700} fill={LEFT} fontFamily="Space Grotesk" opacity={race > 0 ? 1 : 0}>
            A: $120,000 in month one
          </text>
          <text x={1600} y={570} textAnchor="end" fontSize={36} fontWeight={700} fill={C.orange} fontFamily="Space Grotesk" opacity={race > 0.95 ? 1 : 0}>
            B: $120,000 by month 12
          </text>
          <text x={1790} y={280} textAnchor="end" fontSize={34} fontWeight={700} fill={C.orange} fontFamily="Space Grotesk" opacity={b.rampAt(b.word(4, /knows|next/i, 0.7), 0.4)}>
            next month: predictable
          </text>
        </svg>
        <Abs x={150} y={210} w={1600}>
          <Kicker>Cumulative revenue · if nobody cancels</Kicker>
        </Abs>
      </div>

      {/* beats 5-6: the work that never ends + costs per use */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(5, 6)}}>
        <Abs x={0} y={170} w={1920} align="center">
          <Title size={64}>
            Recurring revenue pays for <span style={{color: C.orange}}>recurring work</span>
          </Title>
        </Abs>
        <div style={{position: 'absolute', left: 200, top: 340, display: 'flex', gap: 40}}>
          {[
            {icon: '🐞', l: 'fixing bugs', w: /bugs/i},
            {icon: '📱', l: 'new phones', w: /phones/i},
            {icon: '🖥', l: 'running servers', w: /servers/i},
            {icon: '🗂', l: 'storing files', w: /stored|files/i, seg: 6},
            {icon: '✦', l: 'computing AI answers', w: /computed|AI/i, seg: 6},
          ].map((c) => {
            const seg = c.seg ?? 5;
            const o = b.rampAt(b.word(seg, c.w, 0.5), 0.4);
            const pulse = seg === 6 ? 1 + 0.06 * Math.sin(frame / 4) : 1;
            return (
              <div key={c.l} style={{width: 270, height: 300, borderRadius: 26, background: seg === 6 && o > 0.5 ? 'rgba(228,87,87,0.14)' : C.panel, border: `3px solid ${o > 0.5 ? (seg === 6 ? C.red : C.orange) : C.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: 0.3 + 0.7 * o, transform: `translateY(${(1 - o) * 20}px) scale(${o > 0.5 ? pulse : 1})`}}>
                <div style={{fontSize: 110}}>{c.icon}</div>
                <div style={{fontFamily: FONT_BODY, fontWeight: 700, fontSize: 32, color: C.cream, textAlign: 'center'}}>{c.l}</div>
              </div>
            );
          })}
        </div>
        <Abs x={0} y={720} w={1920} align="center" o={b.during(6, 6)}>
          <Body size={40} weight={600}>
            Costs that come back <b style={{color: C.red}}>every time you use it</b> don’t fit a one-time price
          </Body>
        </Abs>
        {/* a cost meter ticking up with each use */}
        <Abs x={760} y={800} w={400} align="center" o={b.during(6, 6)}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 48, color: C.red, fontVariantNumeric: 'tabular-nums'}}>uses: {Math.max(0, Math.floor((frame - b.at(6)) / 6))}</div>
        </Abs>
      </div>

      {/* beat 7: the catch */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(7, 7)}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <rect x={1460} y={420} width={160} height={300} rx={10} fill="#0E1114" stroke={C.cream} strokeWidth={6} />
          <text x={1540} y={400} textAnchor="middle" fontSize={40} fontWeight={700} fill={C.red} fontFamily="Space Grotesk">
            CANCEL
          </text>
          <Crowd x={380} y={480} n={60} t={1} color={C.orange} leave={b.ramp(7, 0.8, 2.5) * 0.35} seed={11} />
        </svg>
        <Abs x={150} y={200} w={1600}>
          <Title size={76}>
            The catch: it only works <span style={{color: C.orange}}>if customers stay</span>
          </Title>
        </Abs>
      </div>
    </SceneShell>
  );
};
