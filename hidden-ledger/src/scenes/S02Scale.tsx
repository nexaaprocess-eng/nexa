import React from 'react';
import {interpolate} from 'remotion';
import {Doc, Place} from '../components/icons';
import {Conveyor, WarehouseSet} from '../components/sets';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../components/timeline';
import {Abs, Body, Card, Counter, DotGrid, HBar, Kicker, Source, Stage, Title} from '../components/ui';
import {C, FONT_TITLE} from '../themes/theme';

const NRF = 'NRF & Happy Returns (a UPS company), “2025 Retail Returns Landscape,” Oct 15, 2025 · U.S. · surveys fielded Aug–Sep 2025';

// NRF historical series as printed in the report (2023 used a non-comparable method and is omitted by NRF).
const HISTORY = [
  {y: '2019', v: 309},
  {y: '2020', v: 428},
  {y: '2021', v: 760.8},
  {y: '2022', v: 816.8},
  {y: '2024', v: 890},
  {y: '2025*', v: 849.9},
];

export const S02Scale: React.FC = () => {
  const b = useBeats();
  const {frame} = b;

  const many = b.ramp(0, 0.0, 1.3);
  return (
    <SceneShell drift={[0, -10]} zoom={0.02}>
      {/* beat 0: zoom out of one rack into a whole returns warehouse */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${interpolate(many, [0, 1], [2.6, 1])})`, transformOrigin: '22% 45%'}}>
          <Stage>
            <WarehouseSet t={frame / 30} fill={0.35 + 0.65 * many} />
            <Conveyor y={860} t={frame / 30} speed={380} gap={150} scale={0.38} />
          </Stage>
        </div>
      </div>

      {/* sources stay on screen while figures are shown */}
      <Source o={b.during(1, 7)}>{NRF}</Source>

      {/* beat 1: the report */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
        <Stage>
          <Place x={470} y={560} s={1.7 * (0.9 + 0.1 * b.pop(1))} r={-4}>
            <Doc />
          </Place>
        </Stage>
        <Abs x={760} y={330} w={1000} o={b.ramp(1, 0.3)}>
          <Kicker>The source</Kicker>
          <Title size={64} style={{marginTop: 12}}>
            2025 Retail Returns Landscape
          </Title>
          <Body size={32} color={C.muted} style={{marginTop: 14}}>
            National Retail Federation & Happy Returns (owned by UPS) · published Oct 15, 2025
          </Body>
          <div style={{display: 'flex', gap: 28, marginTop: 40, opacity: b.ramp(1, 3.5)}}>
            <Card w={440} accent={C.blue}>
              <Title size={64}>2,006</Title>
              <Body size={28} color={C.muted}>
                U.S. consumers who had returned an online purchase in the past 12 months
              </Body>
            </Card>
            <Card w={440}>
              <Title size={64}>358</Title>
              <Body size={28} color={C.muted}>
                e-commerce professionals at large U.S. retailers ($500M+ revenue)
              </Body>
            </Card>
          </div>
        </Abs>
      </div>

      {/* beat 2: 15.8% of sales */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 2)}}>
        <Stage>
          <g transform="translate(560 540) rotate(-90)">
            <circle r={230} fill="none" stroke={C.line} strokeWidth={70} />
            <circle
              r={230}
              fill="none"
              stroke={C.orange}
              strokeWidth={70}
              strokeDasharray={`${2 * Math.PI * 230 * 0.158 * b.ramp(2, 0.3, 1.2)} 9999`}
            />
          </g>
        </Stage>
        <Abs x={330} y={470} w={460} align="center">
          <Counter value={15.8} decimals={1} suffix="%" t={b.ramp(2, 0.3, 1.2)} size={128} />
        </Abs>
        <Abs x={960} y={380} w={820} o={b.ramp(2, 0.5)}>
          <Kicker>Retailers’ estimate</Kicker>
          <Title size={64} style={{marginTop: 14}}>
            of annual sales expected to be returned in 2025
          </Title>
          <Body size={30} color={C.muted} style={{marginTop: 20}}>
            Average estimate across surveyed retailers · projection, not a final count
          </Body>
        </Abs>
      </div>

      {/* beat 3: $849.9B */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <Abs x={160} y={300} w={900}>
          <Kicker>Projected · U.S. · 2025</Kicker>
          <div style={{marginTop: 10}}>
            <Counter value={849.9} decimals={1} prefix="$" suffix="B" t={b.ramp(3, 0.2, 2.2)} size={230} color={C.orange} />
          </div>
          <Body size={36} style={{marginTop: 10}}>
            worth of merchandise returned
          </Body>
        </Abs>
        <Abs x={1030} y={330} w={760} o={b.ramp(3, 1.2)}>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 22, height: 380}}>
            {HISTORY.map((d, i) => {
              const t = b.ramp(3, 1.2 + i * 0.18, 0.6);
              return (
                <div key={d.y} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
                  <div style={{fontFamily: FONT_TITLE, fontSize: 24, color: C.cream, opacity: t}}>${d.v}B</div>
                  <div style={{width: 96, height: (d.v / 900) * 300 * t, background: i === HISTORY.length - 1 ? C.orange : C.line, borderRadius: 6}} />
                  <div style={{fontFamily: FONT_TITLE, fontSize: 24, color: C.muted}}>{d.y}</div>
                </div>
              );
            })}
          </div>
          <Body size={22} color={C.muted} style={{marginTop: 18}}>
            NRF series. 2023 omitted by NRF (different method). *2025 = projection.
          </Body>
        </Abs>
      </div>

      {/* beat 4: overall vs online */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <Abs x={260} y={330} w={1400}>
          <Kicker>Share of sales expected back, 2025</Kicker>
          <div style={{marginTop: 40}}>
            <HBar label="All retail sales" value={15.8} max={25} t={b.ramp(4, 0.1, 0.8)} valueText="15.8%" color={C.line} w={1400} h={80} />
            <HBar label="Online sales" value={19.3} max={25} t={b.ramp(4, 0.9, 0.8)} valueText="19.3%" w={1400} h={80} />
          </div>
          <Body size={30} color={C.muted} style={{opacity: b.ramp(4, 2.2)}}>
            Roughly one in five online purchases, by retailers’ own estimates.
          </Body>
        </Abs>
      </div>

      {/* beat 5: caveat */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(5, 5)}}>
        <Abs x={0} y={350} w={1920} align="center">
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 50}}>
            <Card w={560} accent={C.orange}>
              <Title size={54}>Value of goods sent back</Title>
              <Body size={28} color={C.muted} style={{marginTop: 10}}>
                what the $849.9B measures
              </Body>
            </Card>
            <div style={{fontFamily: FONT_TITLE, fontSize: 180, color: C.red, fontWeight: 700, transform: `scale(${b.pop(5, 0.8)})`}}>≠</div>
            <Card w={560} accent={C.red} style={{opacity: b.ramp(5, 1.0)}}>
              <Title size={54}>Cost of processing them</Title>
              <Body size={28} color={C.muted} style={{marginTop: 10}}>
                not measured by this figure
              </Body>
            </Card>
          </div>
          <div style={{marginTop: 60, display: 'flex', gap: 20, justifyContent: 'center', opacity: b.ramp(5, 4.0)}}>
            {['Projection', 'United States', 'Not a final count'].map((t) => (
              <span key={t} style={{fontFamily: FONT_TITLE, fontSize: 30, color: C.cream, border: `2px solid ${C.line}`, borderRadius: 40, padding: '10px 26px'}}>
                {t}
              </span>
            ))}
          </div>
        </Abs>
      </div>

      {/* beats 6-7: shoppers */}
      {[
        {i: 6, n: 82, color: C.orange, text: 'say free returns are an important consideration when shopping online'},
        {i: 7, n: 57, color: C.red, text: 'decided not to shop with a retailer after it started charging for returns'},
      ].map((d) => (
        <div key={d.i} style={{position: 'absolute', inset: 0, opacity: b.during(d.i, d.i)}}>
          <Abs x={240} y={250}>
            <DotGrid n={d.n} t={b.ramp(d.i, 0.2, 1.4)} color={d.color} size={36} gap={14} />
          </Abs>
          <Abs x={960} y={230} w={820}>
            <Kicker>Consumer survey · 2025</Kicker>
            <div style={{marginTop: 8}}>
              <Counter value={d.n} suffix="%" t={b.ramp(d.i, 0.2, 1.4)} size={260} color={d.color} />
            </div>
            <Title size={48} weight={600} style={{marginTop: 4}}>
              {d.text}
            </Title>
            <Body size={28} color={C.muted} style={{marginTop: 16}}>
              Base: 2,006 U.S. shoppers who had returned an online purchase in the past year
            </Body>
          </Abs>
        </div>
      ))}

      {/* beat 8: the squeeze */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(8, 8)}}>
        <Stage>
          <g transform={`translate(960 330) rotate(${Math.sin(frame / 18) * 4 * b.ramp(8, 0.3)})`}>
            <line x1={-520} y1={0} x2={520} y2={0} stroke={C.cream} strokeWidth={10} strokeLinecap="round" />
            <line x1={-460} y1={0} x2={-460} y2={140} stroke={C.cream} strokeWidth={4} />
            <line x1={460} y1={0} x2={460} y2={140} stroke={C.cream} strokeWidth={4} />
          </g>
          <path d="M960 330 L900 640 L1020 640 Z" fill={C.panel} stroke={C.cream} strokeWidth={6} />
          <circle cx={960} cy={330} r={18} fill={C.orange} />
        </Stage>
        <Abs x={240} y={480} w={560} align="center" o={b.ramp(8, 0.6)}>
          <Card accent={C.red}>
            <Title size={46}>Returns are expensive</Title>
          </Card>
        </Abs>
        <Abs x={1120} y={480} w={560} align="center" o={b.ramp(8, 2.6)}>
          <Card accent={C.orange}>
            <Title size={46}>Friction pushes customers away</Title>
          </Card>
        </Abs>
      </div>
    </SceneShell>
  );
};
