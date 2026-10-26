import React from 'react';
import {interpolate} from 'remotion';
import {Jacket, Phone, Place, Tag} from '../components/icons';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../components/timeline';
import {Abs, Body, Card, Kicker, Source, Stage, Title} from '../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../themes/theme';

const Arrow: React.FC<{h: number; color: string; label: string; t: number}> = ({h, color, label, t}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 260}}>
    <svg width={160} height={420} viewBox="0 0 160 420">
      <g transform={`translate(80 420)`}>
        <rect x={-34} y={-h * t} width={68} height={h * t} fill={color} rx={6} />
        <path d={`M-70 ${-h * t} L0 ${-h * t - 70} L70 ${-h * t} Z`} fill={color} opacity={t > 0.02 ? 1 : 0} />
      </g>
    </svg>
    <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 42, color: C.cream, marginTop: 14}}>{label}</div>
  </div>
);

export const S07WhyFree: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  return (
    <SceneShell drift={[0, -8]} zoom={0.02}>
      {/* beat 0: the question */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <Stage>
          <Place x={960} y={460} s={1.6 * b.pop(0, 0.2)} r={-8 + Math.sin(frame / 20) * 3}>
            <Tag text="FREE" />
          </Place>
        </Stage>
        <Abs x={0} y={640} w={1920} align="center" o={b.ramp(0, 0.6)}>
          <Title size={76}>Why offer free returns at all?</Title>
        </Abs>
      </div>

      {/* beat 1: meta-analysis */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
        <Source>Janakiraman, Syrdal & Freling (2016), Journal of Retailing 92(2) · meta-analysis of 21 studies · doi:10.1016/j.jretai.2015.11.002</Source>
        <Abs x={240} y={220} w={720}>
          <div style={{display: 'flex', gap: 40, alignItems: 'flex-end'}}>
            <Arrow h={300} color={C.green} label="Purchases" t={b.rampAt(b.word(1, /purchases/, 0.6), 0.8)} />
            <Arrow h={150} color={C.orange} label="Returns" t={b.rampAt(b.word(1, /returns/, 0.8, 1), 0.8)} />
          </div>
        </Abs>
        <Abs x={1040} y={300} w={720} o={b.ramp(1, 0.4)}>
          <Kicker>Research review · 2016</Kicker>
          <Title size={56} style={{marginTop: 12}}>
            More lenient return policies increased purchases
          </Title>
          <Body size={34} style={{marginTop: 18}} color={C.cream}>
            …and returns, but by less.
          </Body>
          <Body size={24} color={C.muted} style={{marginTop: 22}}>
            Arrow heights are qualitative, not effect sizes.
          </Body>
        </Abs>
      </div>

      {/* beat 2: trust */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 2)}}>
        <Stage>
          <Place x={360} y={560} s={1.05}>
            <Phone>
              <g transform="translate(0 -40) scale(0.6)">
                <Jacket />
              </g>
              <rect x={-90} y={80} width={180} height={40} rx={20} fill={C.green} />
              <text x={0} y={107} textAnchor="middle" fill={C.bg} fontSize={20} fontWeight={700} fontFamily="Inter">
                Free returns
              </text>
            </Phone>
          </Place>
        </Stage>
        <Abs x={640} y={430} w={1180}>
          <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
            {[
              {l: 'Risk', s: '↓', c: C.green, at: 0.3},
              {l: 'Trust', s: '↑', c: C.green, at: 3.4},
              {l: 'Buyers', s: '↑', c: C.orange, at: 5.2},
            ].map((d, i) => (
              <React.Fragment key={d.l}>
                {i > 0 && <div style={{fontFamily: FONT_TITLE, fontSize: 60, color: C.muted, opacity: b.ramp(2, d.at)}}>→</div>}
                <Card w={300} accent={d.c} style={{opacity: b.ramp(2, d.at), transform: `translateY(${20 * (1 - b.ramp(2, d.at))}px)`}}>
                  <Title size={60}>
                    {d.l} <span style={{color: d.c}}>{d.s}</span>
                  </Title>
                </Card>
              </React.Fragment>
            ))}
          </div>
        </Abs>
      </div>

      {/* beat 3: bracketing */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <Stage>
          {['S', 'M', 'L'].map((size, i) => {
            const back = i !== 1 ? b.ramp(3, 3.2 + i * 0.2, 1.0) : 0;
            return (
              <g key={size}>
                <Place x={interpolate(back, [0, 1], [640 + i * 320, 640 + i * 320 + (i === 0 ? -260 : 260)])} y={interpolate(back, [0, 1], [520, 330])} s={0.8 + i * 0.12} o={1 - back * 0.6}>
                  <Jacket fill={i === 1 ? C.blue : '#6F8BA5'} />
                </Place>
                <text x={640 + i * 320} y={760} textAnchor="middle" fill={C.cream} fontSize={48} fontWeight={700} fontFamily="Space Grotesk" opacity={1 - back}>
                  {size}
                </text>
              </g>
            );
          })}
        </Stage>
        <Abs x={0} y={170} w={1920} align="center" o={b.ramp(3, 1.2)}>
          <Title size={58}>
            “Bracketing”: order several sizes, <span style={{color: C.orange}}>keep one</span>
          </Title>
        </Abs>
        <Abs x={0} y={800} w={1920} align="center" o={b.ramp(3, 5.5)}>
          <Body size={30} color={C.red} weight={700}>
            …and in some cases, outright abuse
          </Body>
        </Abs>
      </div>

      {/* beat 4: the dials */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <Abs x={0} y={230} w={1920} align="center">
          <Title size={60}>Retailers tune the dials</Title>
        </Abs>
        <Abs x={300} y={380} w={1320}>
          {['Return window', 'Fees for some methods', 'Exchanges instead of refunds', 'Better size guides', 'Fraud screening'].map((d, i) => {
            const t = b.ramp(4, 0.6 + i * 0.9, 0.5);
            const knob = 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(frame / (22 + i * 5) + i * 1.7));
            return (
              <div key={d} style={{display: 'flex', alignItems: 'center', gap: 30, marginBottom: 28, opacity: 0.2 + 0.8 * t}}>
                <div style={{width: 580, fontFamily: FONT_BODY, fontSize: 36, color: C.cream, fontWeight: 600}}>{d}</div>
                <div style={{flex: 1, height: 10, background: C.line, borderRadius: 5, position: 'relative'}}>
                  <div style={{position: 'absolute', left: `${knob * 100}%`, top: -17, width: 44, height: 44, borderRadius: 22, background: C.orange, border: `4px solid ${C.cream}`, transform: 'translateX(-22px)'}} />
                </div>
              </div>
            );
          })}
        </Abs>
      </div>

      {/* beat 5: fees trade-off (NRF) */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(5, 5)}}>
        <Source>NRF & Happy Returns, 2025 Retail Returns Landscape · merchants that implemented return fees</Source>
        <Abs x={0} y={200} w={1920} align="center">
          <Kicker>Retailers that added return fees reported…</Kicker>
        </Abs>
        <Abs x={220} y={280} w={1480}>
          <div style={{display: 'flex', gap: 60}}>
            {[
              {h: 'Upside', c: C.green, items: [['53%', 'fewer returns overall'], ['52%', 'more exchanges']], at: 0.4},
              {h: 'Downside', c: C.red, items: [['47%', 'more customer complaints'], ['37%', 'lost customers over fees']], at: 4.2},
            ].map((col) => (
              <Card key={col.h} w={700} accent={col.c} style={{opacity: b.ramp(5, col.at)}}>
                <Title size={44} color={col.c}>
                  {col.h}
                </Title>
                {col.items.map(([v, l], i) => (
                  <div key={l} style={{display: 'flex', alignItems: 'baseline', gap: 24, marginTop: 22, opacity: b.ramp(5, col.at + 0.6 + i * 0.8)}}>
                    <div style={{fontFamily: FONT_TITLE, fontSize: 80, fontWeight: 700, color: C.cream, width: 200}}>{v}</div>
                    <Body size={32}>{l}</Body>
                  </div>
                ))}
              </Card>
            ))}
          </div>
        </Abs>
      </div>

      {/* beat 6: no free lunch */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(6, 6)}}>
        <Stage>
          <g transform={`translate(960 420) rotate(${Math.sin(frame / 25) * 3})`}>
            <line x1={-420} y1={0} x2={420} y2={0} stroke={C.cream} strokeWidth={10} strokeLinecap="round" />
            <Place x={-360} y={70} s={0.5}>
              <Tag text="COST" fill={C.red} textColor={C.cream} />
            </Place>
            <Place x={360} y={70} s={0.5}>
              <Tag text="SALES" fill={C.green} />
            </Place>
          </g>
          <path d="M960 420 L900 640 L1020 640 Z" fill={C.panel} stroke={C.cream} strokeWidth={6} />
        </Stage>
        <Abs x={0} y={690} w={1920} align="center" o={b.ramp(6, 0.3)}>
          <Title size={64}>No free lunch. Just a business decision.</Title>
        </Abs>
      </div>
    </SceneShell>
  );
};
