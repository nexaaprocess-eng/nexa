import React from 'react';
import {APPS, AppIcon, PayCard} from '../../components/apps';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Kicker, Source, Title} from '../../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';

// Where the model breaks: failed payments (RevenueCat), hype that churns (RevenueCat), the cancellation maze
// and the FTC settlement with Amazon, and Spotify's revenue river splitting into royalties vs gross margin
// (Spotify Form 20-F 2025). All amounts as reported.

const RC = 'RevenueCat, State of Subscription Apps 2026 · apps using RevenueCat';
const SP = 'Spotify Technology S.A., Form 20-F 2025 · € millions';

export const S08Breaks: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  // beat 3: maze cursor path
  const mz = b.ramp(3, 0.5, 4.5);
  const path: [number, number][] = [
    [340, 360], [700, 360], [700, 520], [440, 520], [440, 700], [860, 700], [860, 420], [1080, 420], [1080, 760],
  ];
  const seg = mz * (path.length - 1);
  const k = Math.min(path.length - 2, Math.floor(seg));
  const f = seg - k;
  const cx = path[k][0] + (path[k + 1][0] - path[k][0]) * f;
  const cy = path[k][1] + (path[k + 1][1] - path[k][1]) * f;
  return (
    <SceneShell drift={[0, 0]} zoom={0.012} beatCamera={false}>
      {/* beat 0: recurring ≠ guaranteed ≠ profit */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 14}).map((_, i) => {
            const x = ((frame * 6 + i * 140) % 1960) - 40;
            return <circle key={i} cx={x} cy={560 + Math.sin(i) * 20} r={30} fill={C.orange} stroke={C.cream} strokeWidth={4} />;
          })}
        </svg>
        <Abs x={0} y={250} w={1920} align="center">
          <Title size={80}>Recurring revenue</Title>
        </Abs>
        <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center', gap: 50}}>
          {['≠ guaranteed', '≠ profit'].map((t, i) => (
            <div key={t} style={{border: `7px solid ${C.red}`, color: C.red, borderRadius: 18, padding: '10px 30px', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64, background: 'rgba(17,20,24,0.9)', opacity: b.ramp(0, 1.0 + i * 0.8, 0.2), transform: `rotate(${i ? 4 : -4}deg) scale(${1.4 - 0.4 * b.ramp(0, 1.0 + i * 0.8, 0.25)})`}}>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* beat 1: payments fail */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
        <Source>{RC} · share of subscription cancellations caused by involuntary billing failures</Source>
        <div style={{position: 'absolute', left: 170, top: 330}}>
          <PayCard w={560} declined={b.rampAt(b.word(1, /decline/i, 0.2), 0.9)} />
        </div>
        <Abs x={170} y={720} w={600} o={b.ramp(1, 0.2)}>
          <Body size={36} weight={700}>
            Cards expire. Banks decline charges.
          </Body>
        </Abs>
        {[
          {l: 'Google Play', v: 31, y: 330},
          {l: 'App Store', v: 14, y: 610},
        ].map((r) => {
          const t = b.rampAt(b.word(1, r.v === 31 ? /31|thirty/i : /14|fourteen/i, 0.7), 0.8);
          return (
            <div key={r.l} style={{position: 'absolute', left: 900, top: r.y, width: 860}}>
              <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, color: C.cream}}>{r.l}</div>
              <div style={{display: 'flex', height: 100, marginTop: 10, borderRadius: 16, overflow: 'hidden', border: `3px solid ${C.line}`}}>
                <div style={{width: `${r.v * t}%`, background: C.red}} />
                <div style={{flex: 1, background: '#2B313A'}} />
              </div>
              <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64, color: C.red, marginTop: 6, opacity: t}}>
                {r.v}% <span style={{fontSize: 30, color: C.muted}}>of cancellations: billing failures</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* beat 2: hype fades */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 2)}}>
        <Source>{RC}</Source>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <line x1={900} y1={820} x2={1760} y2={820} stroke={C.line} strokeWidth={5} />
          <line x1={900} y1={820} x2={900} y2={360} stroke={C.line} strokeWidth={5} />
          {[
            {c: C.muted, rate: 1.0, l: 'other apps'},
            {c: C.orange, rate: 1.3, l: 'AI-powered apps'},
          ].map((s) => {
            const t = s.rate > 1 ? b.rampAt(b.word(2, /churned|AI/i, 0.3), 2.0) : b.ramp(2, 0.2, 2.0);
            const pts = Array.from({length: 41}).map((_, i) => {
              const x = i / 40;
              return `${900 + x * 860 * t},${820 - 440 * Math.exp(-2.2 * s.rate * x * t)}`;
            });
            const lx = s.rate > 1 ? 0.18 : 0.62;
            return (
              <g key={s.l}>
                <polyline points={pts.join(' ')} fill="none" stroke={s.c} strokeWidth={9} />
                <text x={900 + lx * 860 + 14} y={820 - 440 * Math.exp(-2.2 * s.rate * lx) + (s.rate > 1 ? 70 : -20)} fontSize={34} fontWeight={700} fill={s.c} fontFamily="Space Grotesk" opacity={t > 0.95 ? 1 : 0}>
                  {s.l}
                </text>
              </g>
            );
          })}
          <text x={910} y={345} fontSize={30} fill={C.muted} fontFamily="Inter">
            subscribers remaining (shape illustrative)
          </text>
        </svg>
        <div style={{position: 'absolute', left: 170, top: 300, width: 640}}>
          <AppIcon app={APPS.ai} size={150} style={{transform: `translateY(${Math.sin(frame / 12) * 10}px)`}} />
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 100, color: C.green, marginTop: 30, opacity: b.rampAt(b.word(2, /41|forty/i, 0.4), 0.4)}}>+41%</div>
          <Body size={32} style={{opacity: b.rampAt(b.word(2, /41|forty/i, 0.4), 0.4)}}>revenue per payer</Body>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 100, color: C.red, marginTop: 20, opacity: b.rampAt(b.word(2, /30|thirty/i, 0.8), 0.4)}}>~30% faster</div>
          <Body size={32} style={{opacity: b.rampAt(b.word(2, /30|thirty/i, 0.8), 0.4)}}>churn</Body>
        </div>
      </div>

      {/* beat 3: the cancellation maze and the FTC settlement */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <Source>U.S. Federal Trade Commission, press release, Sept. 25, 2025 · allegations settled</Source>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {/* maze walls */}
          <rect x={280} y={300} width={880} height={520} rx={20} fill="#161A1F" stroke={C.line} strokeWidth={6} />
          {[
            [280, 440, 760, 440], [520, 440, 520, 600], [600, 600, 1160, 600], [780, 300, 780, 520], [980, 340, 980, 820], [380, 780, 900, 780],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.cream} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
          ))}
          <polyline points={path.slice(0, k + 1).map((p) => p.join(',')).concat([`${cx},${cy}`]).join(' ')} fill="none" stroke={C.orange} strokeWidth={6} strokeDasharray="12 10" />
          {['Are you sure?', 'Special offer!', 'Tell us why'].map((t, i) => (
            <g key={t} opacity={mz > 0.2 + i * 0.25 ? 1 : 0}>
              <rect x={[620, 330, 870][i]} y={[315, 610, 430][i]} width={230} height={60} rx={12} fill="#F7F3EC" />
              <text x={[735, 445, 985][i]} y={[355, 650, 470][i]} textAnchor="middle" fontSize={28} fontWeight={700} fill="#15181C" fontFamily="Inter">
                {t}
              </text>
            </g>
          ))}
          {/* cursor */}
          <path d={`M${cx} ${cy} l0 44 l12 -12 l10 22 l8 -4 l-10 -22 l18 0 Z`} fill={C.cream} stroke={C.bg} strokeWidth={3} />
          <text x={1080} y={800} textAnchor="middle" fontSize={30} fontWeight={700} fill={C.red} fontFamily="Space Grotesk">
            CANCEL
          </text>
        </svg>
        <div style={{position: 'absolute', left: 1260, top: 300, width: 520, opacity: b.rampAt(b.word(3, /billion|Amazon/i, 0.6), 0.5)}}>
          <Kicker>Amazon · FTC settlement · 2025</Kicker>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 130, color: C.cream, lineHeight: 1, marginTop: 10}}>$2.5B</div>
          <Body size={30} color={C.muted}>
            $1B civil penalty + $1.5B in refunds
          </Body>
          <Body size={30} style={{marginTop: 18}}>
            FTC claims: Prime enrollment without consent, and a difficult cancellation process
          </Body>
        </div>
        <Abs x={280} y={200} w={900}>
          <Title size={52}>Easy to sign up, hard to leave</Title>
        </Abs>
      </div>

      {/* beats 4-6: Spotify, revenue is not profit */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 6)}}>
        <Source>{SP}</Source>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {(() => {
            const flow = b.ramp(4, 0.3, 1.5);
            const split = b.rampAt(b.word(5, /royalties|money/i, 0.3), 1.2);
            const wTot = 360;
            const wCost = wTot * 0.68;
            const wGm = wTot * 0.32;
            const off = frame * 4;
            return (
              <g opacity={b.during(4, 5)}>
                {/* revenue river */}
                <rect x={150} y={540 - wTot / 2} width={700 * flow} height={wTot} fill={C.orange} opacity={0.9} />
                {Array.from({length: 10}).map((_, i) => (
                  <rect key={i} x={150 + ((off + i * 80) % (700 * flow + 1))} y={540 + 90} width={40} height={16} rx={8} fill="rgba(17,20,24,0.35)" />
                ))}
                {/* split */}
                <path d={`M850 ${540 - wTot / 2} C1050 ${540 - wTot / 2} 1100 ${330 - wCost / 2} ${850 + 900 * split} ${330 - wCost / 2} L${850 + 900 * split} ${330 + wCost / 2} C1100 ${330 + wCost / 2} 1050 ${540 - wTot / 2 + wCost} 850 ${540 - wTot / 2 + wCost} Z`} fill={C.red} opacity={0.85 * split} />
                <path d={`M850 ${540 + wTot / 2 - wGm} C1050 ${540 + wTot / 2 - wGm} 1100 ${800 - wGm / 2} ${850 + 900 * split} ${800 - wGm / 2} L${850 + 900 * split} ${800 + wGm / 2} C1100 ${800 + wGm / 2} 1050 ${540 + wTot / 2} 850 ${540 + wTot / 2} Z`} fill={C.green} opacity={0.9 * split} />
                <text x={180} y={540 - 40} fontSize={60} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk" opacity={flow > 0.6 ? 1 : 0}>
                  Revenue €17.2B
                </text>
                <text x={1730} y={330 + 18} textAnchor="end" fontSize={44} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk" opacity={split > 0.9 ? 1 : 0}>
                  68% cost of revenue
                </text>
                <text x={1730} y={800 + 16} textAnchor="end" fontSize={40} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk" opacity={split > 0.9 ? 1 : 0}>
                  32% gross margin
                </text>
              </g>
            );
          })()}
        </svg>
        <Abs x={150} y={170} w={1000} o={b.during(4, 5)}>
          <Kicker>Spotify · a streaming service, not a typical app</Kicker>
          <Body size={34} style={{marginTop: 6}}>
            <b style={{color: C.orange}}>290 million</b> premium subscribers at the end of 2025
          </Body>
        </Abs>
        <Abs x={1150} y={420} w={600} align="right" o={b.during(5, 5) * b.rampAt(b.word(5, /royalties/i, 0.5), 0.5)}>
          <Body size={30} color={C.cream}>
            mainly royalties & distribution costs
          </Body>
        </Abs>
        {/* operating result 2023-2025 */}
        <div style={{position: 'absolute', inset: 0, opacity: b.during(6, 6)}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <line x1={400} y1={700} x2={1520} y2={700} stroke={C.cream} strokeWidth={4} />
            {[
              {y: '2023', v: -446, x: 560},
              {y: '2024', v: 1365, x: 960},
              {y: '2025', v: 2198, x: 1360},
            ].map((r, i) => {
              const t = b.ramp(6, 0.2 + i * 0.6, 0.6);
              const h = (r.v / 2198) * 300 * t;
              return (
                <g key={r.y}>
                  <rect x={r.x - 90} y={r.v >= 0 ? 700 - h : 700} width={180} height={Math.abs(h)} rx={8} fill={r.v >= 0 ? C.green : C.red} />
                  <text x={r.x} y={r.v >= 0 ? 700 - h - 20 : 700 + Math.abs(h) + 56} textAnchor="middle" fontSize={50} fontWeight={700} fill={r.v >= 0 ? C.green : C.red} fontFamily="Space Grotesk" opacity={t}>
                    {r.v >= 0 ? `€${(r.v / 1000).toFixed(1)}B` : `−€${-r.v}M`}
                  </text>
                  <text x={r.x} y={r.v >= 0 ? 750 : 660} textAnchor="middle" fontSize={34} fill={C.muted} fontFamily="Inter">
                    {r.y}
                  </text>
                </g>
              );
            })}
          </svg>
          <Abs x={150} y={170} w={1600}>
            <Kicker>Spotify operating income</Kicker>
            <Title size={46} style={{marginTop: 8}}>
              Profitable, once the costs behind the subscriptions were under control
            </Title>
          </Abs>
        </div>
        <Abs x={1150} y={180} w={620} align="right" o={b.during(5, 5) * b.rampAt(b.word(5, /2023|loss/i, 0.6), 0.4)}>
          <div style={{display: 'inline-block', background: 'rgba(17,20,24,0.92)', padding: '6px 16px', borderRadius: 10, fontFamily: FONT_BODY, fontSize: 32, fontWeight: 700, color: C.red}}>2023: operating loss of €446 million</div>
        </Abs>
      </div>
    </SceneShell>
  );
};
