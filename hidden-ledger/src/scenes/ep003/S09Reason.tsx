import React from 'react';
import {interpolate} from 'remotion';
import {APPS, AppIcon, Figure, Phone} from '../../components/apps';
import {rnd} from '../../components/sets';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, LedgerMark, Title} from '../../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';

// The real reason. A wall of apps asking for monthly payments; a single receipt becomes a chain of
// monthly links (a relationship); the customer's scale (good deal vs worse deal, with the boxed v6 from
// scene 2 as a callback); the few that survive (callback to the retention road); the renewal decision.

const Link: React.FC<{x: number; y: number; t: number; label: string}> = ({x, y, t, label}) => (
  <g transform={`translate(${x} ${y}) scale(${t})`} opacity={t}>
    <rect x={-70} y={-44} width={140} height={88} rx={44} fill="none" stroke={C.orange} strokeWidth={14} />
    <text y={12} textAnchor="middle" fontSize={30} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
      {label}
    </text>
  </g>
);

export const S09Reason: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hover = Math.sin(frame / 14);
  return (
    <SceneShell drift={[0, 0]} zoom={0.012} beatCamera={false}>
      {/* beat 0: every app wants a subscription */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <div style={{position: 'absolute', left: 260, top: 240, display: 'grid', gridTemplateColumns: 'repeat(10, 120px)', gap: 22, transform: `scale(${1.15 - 0.15 * b.ramp(0, 0, 2.5)})`, transformOrigin: '700px 300px'}}>
          {Array.from({length: 40}).map((_, i) => {
            const a = Object.values(APPS)[i % 8];
            const o = b.ramp(0, rnd(i) * 1.2, 0.3);
            return (
              <div key={i} style={{position: 'relative', opacity: o}}>
                <AppIcon app={a} size={120} />
                <div style={{position: 'absolute', right: -10, top: -10, background: C.orange, color: C.bg, borderRadius: 99, padding: '2px 10px', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 26}}>/mo</div>
              </div>
            );
          })}
        </div>
        <Abs x={0} y={820} w={1920} align="center">
          <div style={{display: 'inline-block', background: 'rgba(17,20,24,0.9)', padding: '10px 30px', borderRadius: 16}}>
            <Title size={60}>So why does every app want a subscription?</Title>
          </div>
        </Abs>
      </div>

      {/* beat 1: a sale becomes a relationship */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {months.map((m, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const t = b.ramp(1, -0.15 + i * 0.15, 0.35);
            return <Link key={m} x={960 + Math.cos(a) * 340} y={540 + Math.sin(a) * 270} t={t} label={m} />;
          })}
          <circle cx={960 + Math.cos(frame / 20 - Math.PI / 2) * 340} cy={540 + Math.sin(frame / 20 - Math.PI / 2) * 270} r={22} fill={C.green} opacity={b.ramp(1, 2.6, 0.4)} />
        </svg>
        <Abs x={760} y={480} w={400} align="center" o={b.ramp(1, -0.2)}>
          <Title size={58}>a sale</Title>
          <Body size={36} color={C.orange} weight={700} style={{opacity: b.ramp(1, 1.5)}}>
            → a relationship
          </Body>
        </Abs>
        <Abs x={150} y={170} w={1620} o={b.rampAt(b.word(1, /forecast|pays/i, 0.6), 0.4)}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            {['pays every month', 'can be forecast', 'funds the work'].map((t, i) => (
              <div key={t} style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 42, color: C.cream, opacity: b.rampAt(b.word(1, [/pays/i, /forecast/i, /fund/i][i], 0.5 + i * 0.15), 0.4)}}>
                {t}
              </div>
            ))}
          </div>
        </Abs>
      </div>

      {/* beats 2-3: the customer's scale */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 3)}}>
        {(() => {
          const good = b.ramp(2, 0.3, 1.5);
          const bad = b.ramp(3, 0.3, 1.5);
          const tilt = (bad - good) * 8;
          return (
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
              <path d="M930 860 L990 860 L970 470 L950 470 Z" fill={C.panel} stroke={C.cream} strokeWidth={5} />
              <g transform={`translate(960 470) rotate(${tilt})`}>
                <line x1={-520} y1={0} x2={520} y2={0} stroke={C.cream} strokeWidth={12} strokeLinecap="round" />
                {[-1, 1].map((s) => (
                  <g key={s} transform={`translate(${s * 470} 0) rotate(${-tilt})`}>
                    <line x1={-120} y1={140} x2={0} y2={0} stroke={C.cream} strokeWidth={4} />
                    <line x1={120} y1={140} x2={0} y2={0} stroke={C.cream} strokeWidth={4} />
                    <path d="M-170 140 L170 140 Q150 200 0 200 Q-150 200 -170 140 Z" fill={s < 0 ? 'rgba(78,159,125,0.5)' : 'rgba(228,87,87,0.4)'} stroke={C.cream} strokeWidth={5} />
                  </g>
                ))}
              </g>
            </svg>
          );
        })()}
        <Abs x={140} y={170} w={700}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 52, color: C.green}}>Can be a good deal</div>
          {['less to pay upfront', 'updates & new features', 'leave when it’s not worth it'].map((t, i) => (
            <div key={t} style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 36, color: C.cream, marginTop: 10, opacity: b.ramp(2, 0.6 + i * 0.9, 0.4)}}>
              ✓ {t}
            </div>
          ))}
        </Abs>
        <Abs x={1080} y={170} w={700} align="right">
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 52, color: C.red, opacity: b.ramp(3, 0)}}>Can be a worse deal</div>
          {['you rarely use it', 'an older version would do', 'owning it costs less'].map((t, i) => (
            <div key={t} style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 36, color: C.cream, marginTop: 10, opacity: b.ramp(3, 0.5 + i * 0.9, 0.4)}}>
              {t} ✗
            </div>
          ))}
        </Abs>
        {/* callback: the boxed v6 from scene 2 */}
        <div style={{position: 'absolute', left: 1330, top: 520, width: 200, height: 250, background: '#3A8FD9', border: '4px solid #F3EBDD', borderRadius: 6, opacity: b.rampAt(b.word(3, /one-time|disappeared/i, 0.6), 0.5), transform: `rotate(${-6 + hover * 2}deg)`, padding: 16, boxSizing: 'border-box', fontFamily: FONT_TITLE, fontWeight: 700, color: '#fff'}}>
          <div style={{fontSize: 26}}>PHOTO STUDIO</div>
          <div style={{fontSize: 70, textAlign: 'right', marginTop: 90}}>v6</div>
        </div>
        <Abs x={1020} y={800} w={760} align="right" o={b.rampAt(b.word(3, /Adobe|perpetual/i, 0.5), 0.4)}>
          <div style={{display: 'inline-block', background: 'rgba(17,20,24,0.9)', borderRadius: 12, padding: '6px 16px'}}>
            <Body size={30} weight={700} color={C.cream}>
              Adobe still licenses perpetual versions of some products
            </Body>
          </div>
        </Abs>
      </div>

      {/* beat 4: the few that survive */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <rect x={160} y={500} width={1600} height={140} rx={70} fill="#1A1F26" />
          {Array.from({length: 100}).map((_, i) => {
            const keep = rnd(i * 5) < 0.1;
            const p = b.ramp(4, 0.2, 5);
            const drop = keep ? 2 : rnd(i + 3) * 0.9 + 0.05;
            const x = 200 + Math.min(p, drop) * 1460 + (i % 10) * 7;
            const y = 520 + Math.floor(i / 10) * 10 + (p > drop ? (p - drop) * 260 : 0);
            return (
              <g key={i} transform={`translate(${x} ${y})`} opacity={p > drop ? Math.max(0, 1 - (p - drop) * 4) : 1}>
                <Figure color={keep ? C.green : C.orange} s={0.5} />
              </g>
            );
          })}
        </svg>
        <Abs x={160} y={140} w={1600} o={b.ramp(4, -0.2)}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 32, letterSpacing: 4, color: C.orange}}>EASY TO MISS</div>
        </Abs>
        <Abs x={160} y={200} w={1600}>
          {['Most subscriptions don’t last.', 'Most apps never make much money.'].map((t, i) => (
            <div key={t} style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 60, color: C.cream, opacity: b.rampAt(b.word(4, [/subscriptions/i, /apps/i][i], 0.3 + i * 0.2), 0.4)}}>
              {t}
            </div>
          ))}
        </Abs>
        <Abs x={160} y={720} w={1600} o={b.rampAt(b.word(4, /win/i, 0.7), 0.4)}>
          <Title size={56} color={C.green}>
            The few that win are still worth paying for, month after month.
          </Title>
        </Abs>
      </div>

      {/* beat 5: the renewal decision */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(5, 5)}}>
        <Phone x={960} y={530} w={340} s={0.95 + 0.05 * b.ramp(5, 0, 2)}>
          <div style={{padding: 26, textAlign: 'center'}}>
            <AppIcon app={APPS.photo} size={120} style={{margin: '20px auto 16px'}} />
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 36}}>Lumen Premium</div>
            <div style={{fontSize: 26, color: '#6A665F', marginTop: 6}}>renews tomorrow · $9.99</div>
            <div style={{marginTop: 50, display: 'flex', flexDirection: 'column', gap: 16}}>
              <div style={{background: APPS.photo.color, color: '#fff', borderRadius: 22, padding: '18px 0', fontWeight: 700, fontSize: 32, transform: `scale(${1 + 0.04 * Math.max(0, hover)})`}}>Keep</div>
              <div style={{border: '3px solid #C9C2B6', borderRadius: 22, padding: '15px 0', fontWeight: 700, fontSize: 32, color: '#6A665F', transform: `scale(${1 + 0.04 * Math.max(0, -hover)})`}}>Cancel</div>
            </div>
          </div>
        </Phone>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
          <path d={`M${1080 + hover * 10} ${interpolate(hover, [-1, 1], [690, 610])} l0 44 l12 -12 l10 22 l8 -4 l-10 -22 l18 0 Z`} fill={C.cream} stroke={C.bg} strokeWidth={3} />
        </svg>
        <Abs x={140} y={330} w={560}>
          <Title size={58}>Companies want it automatic.</Title>
        </Abs>
        <Abs x={1240} y={330} w={560} o={b.rampAt(b.word(5, /best|earn/i, 0.4), 0.5)}>
          <Title size={58} color={C.orange}>
            The best still earn it, every month.
          </Title>
        </Abs>
      </div>

      {/* beat 6: end card */}
      <div style={{position: 'absolute', inset: 0, opacity: b.ramp(6, -0.2, 0.6)}}>
        <Abs x={0} y={330} w={1920} align="center">
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
            <LedgerMark size={120} />
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 110, letterSpacing: 10, color: C.cream}}>HIDDEN LEDGER</div>
          </div>
          <Body size={40} color={C.muted} style={{marginTop: 40}}>
            Every number in this video is sourced in the description
          </Body>
          <Body size={34} color={C.orange} style={{marginTop: 24, fontWeight: 700}}>
            Episode 003 · Why Every App Wants a Subscription
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
