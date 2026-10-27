import React from 'react';
import {interpolate} from 'remotion';
import {StoreFront} from '../../components/grocery';
import {Place} from '../../components/icons';
import {Conveyor} from '../../components/sets';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Card, Chip, Counter, DotGrid, Kicker, Source, Stage, Title} from '../../components/ui';
import {C, FONT_TITLE} from '../../themes/theme';

// Scale: one store becomes a chain; a $147.6B column with a sliver of operating profit; cents per dollar;
// Walmart's 4.2% on $706B; then "secret #1" as a wall of checkout belts running at once.

const KR_SRC = 'Kroger 10-K, fiscal 2025 and 2024 · sales $147,642M · operating profit $1,890M';

export const S02Scale: React.FC = () => {
  const b = useBeats();
  const {frame, fps} = b;
  const t = frame / fps;

  // beat 0 camera: pull back from one store to a grid of stores
  const pull = b.ramp(0, 0.2, 2.6);
  const gridScale = interpolate(pull, [0, 1], [1.5, 0.62]);
  return (
    <SceneShell drift={[0, -6]} zoom={0.015}>
      {/* beat 0: one store -> a chain */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <Stage>
          <g transform={`translate(960 560) scale(${gridScale})`}>
            {Array.from({length: 49}).map((_, i) => {
              const cx = (i % 7) - 3;
              const cy = Math.floor(i / 7) - 3;
              const o = cx === 0 && cy === 0 ? 1 : interpolate(pull, [0.15 + (Math.abs(cx) + Math.abs(cy)) * 0.08, 0.45 + (Math.abs(cx) + Math.abs(cy)) * 0.08], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              return (
                <Place key={i} x={cx * 560} y={cy * 330} s={0.9} o={o}>
                  <StoreFront type="supermarket" glow={0.5 + 0.5 * Math.sin(t * 2 + i)} />
                </Place>
              );
            })}
          </g>
        </Stage>
        <Abs x={0} y={140} w={1920} align="center" o={b.ramp(0, 0.6)}>
          <span style={{display: 'inline-block', background: 'rgba(17,20,24,0.88)', padding: '10px 30px', borderRadius: 14}}>
            <Title size={76}>Start with the scale</Title>
          </span>
        </Abs>
      </div>

      {/* beats 1-2: the $147.6B column and its sliver */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 2)}}>
        <Source>{KR_SRC}</Source>
        <Stage>
          {/* sales column: 147.6 -> 620 px; operating profit 1.9 -> 8 px */}
          <g transform="translate(330 830)">
            {Array.from({length: 20}).map((_, i) => {
              const o = b.ramp(1, 0.1 + i * 0.06, 0.25);
              return <rect key={i} x={0} y={-31 * (i + 1) + 10 * (1 - o)} width={300} height={29} rx={4} fill={C.orange} opacity={0.35 + 0.5 * o * (i % 2 ? 0.8 : 1)} />;
            })}
            <rect x={0} y={-628} width={300} height={8} fill={C.green} opacity={b.rampAt(b.word(1, /operating/i, 0.6), 0.3)} />
            {/* magnifier callout on the sliver */}
            <g opacity={b.rampAt(b.word(1, /operating/i, 0.6), 0.5)}>
              <circle cx={150} cy={-624} r={38} fill="none" stroke={C.cream} strokeWidth={6} />
              <line x1={176} y1={-650} x2={420} y2={-700} stroke={C.cream} strokeWidth={4} />
            </g>
          </g>
        </Stage>
        <Abs x={330} y={850} w={300} align="center">
          <Body size={34} color={C.muted}>
            Sales
          </Body>
        </Abs>
        <Abs x={760} y={150} w={1080} o={b.ramp(1, 0.2)}>
          <Kicker>Kroger · fiscal year ended Jan 2026</Kicker>
          <div style={{display: 'flex', gap: 60, marginTop: 14}}>
            <div>
              <Counter value={147.6} t={b.ramp(1, 0.4, 1.4)} decimals={1} prefix="$" suffix="B" size={120} />
              <Body size={32} color={C.muted}>
                sales
              </Body>
            </div>
            <div style={{opacity: b.rampAt(b.word(1, /operating/i, 0.6), 0.5)}}>
              <Counter value={1.9} t={b.rampAt(b.word(1, /operating/i, 0.6), 1)} decimals={1} prefix="$" suffix="B" size={120} color={C.green} />
              <Body size={32} color={C.muted}>
                operating profit = <b style={{color: C.green}}>1.28%</b>
              </Body>
            </div>
          </div>
        </Abs>
        {/* beat 2: the charge and the year before */}
        <Abs x={760} y={470} w={1080} o={b.ramp(2, 0.1)}>
          <Card w={1060} accent={C.red} pad={30}>
            <Title size={46}>
              Includes a <span style={{color: C.red}}>$2.5B</span> charge
            </Title>
            <Body size={32} color={C.muted} style={{marginTop: 8}}>
              impairment and related charges tied to its automated fulfillment network
            </Body>
          </Card>
          <div style={{display: 'flex', gap: 40, marginTop: 30, alignItems: 'flex-end', opacity: b.rampAt(b.word(2, /before/i, 0.6), 0.5)}}>
            {[
              {y: 'FY2025', v: 1.28},
              {y: 'FY2024', v: 2.62},
            ].map((d) => (
              <div key={d.y} style={{display: 'flex', alignItems: 'center', gap: 24}}>
                <div style={{width: 46, height: d.v * 70 * b.rampAt(b.word(2, /before/i, 0.6), 0.8), background: C.green, borderRadius: 6}} />
                <div>
                  <div style={{fontFamily: FONT_TITLE, fontSize: 72, fontWeight: 700, color: C.cream}}>{d.v.toFixed(2)}%</div>
                  <Body size={30} color={C.muted}>
                    {d.y} operating margin
                  </Body>
                </div>
              </div>
            ))}
          </div>
        </Abs>
      </div>

      {/* beat 3: one or two cents per dollar */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <Abs x={300} y={200} w={600}>
          <DotGrid n={100} t={1} color="#3A424C" size={44} gap={12} />
        </Abs>
        <Abs x={300} y={200} w={600}>
          <DotGrid n={2} t={b.rampAt(b.word(3, /cents/i, 0.4), 0.6) * 1} color={C.green} size={44} gap={12} />
        </Abs>
        <Abs x={1000} y={300} w={760} o={b.ramp(3, 0.1)}>
          <Kicker>Each dollar of sales = 100 cents</Kicker>
          <Title size={86} style={{marginTop: 14}}>
            <span style={{color: C.green}}>1–2¢</span> of operating profit
          </Title>
          <Body size={36} color={C.muted} style={{marginTop: 20}} >
            …multiplied across a mountain of sales
          </Body>
        </Abs>
      </div>

      {/* beat 4: 1% of nearly $150B */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <Abs x={0} y={330} w={1920} align="center">
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 40, fontFamily: FONT_TITLE, fontWeight: 700, color: C.cream}}>
            <span style={{fontSize: 140, opacity: b.ramp(4, 0)}}>1%</span>
            <span style={{fontSize: 90, color: C.muted, opacity: b.ramp(4, 0.4)}}>×</span>
            <span style={{fontSize: 140, opacity: b.ramp(4, 0.6)}}>$147.6B</span>
            <span style={{fontSize: 90, color: C.muted, opacity: b.ramp(4, 1.4)}}>=</span>
            <span style={{fontSize: 140, color: C.green, opacity: b.ramp(4, 1.6), transform: `scale(${0.8 + 0.2 * b.pop(4, 1.6)})`, display: 'inline-block'}}>$1.48B</span>
          </div>
        </Abs>
        <Abs x={0} y={560} w={1920} align="center" o={b.ramp(4, 2)}>
          <Body size={40} color={C.muted}>
            Every single percentage point is worth well over a billion dollars
          </Body>
        </Abs>
      </div>

      {/* beat 5: Walmart */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(5, 5)}}>
        <Source>Walmart 10-K, fiscal 2026 (ended Jan 31, 2026) · net sales $706,413M · operating income $29,825M</Source>
        <Stage>
          <Place x={340} y={560} s={0.8 * b.pop(5, 0)}>
            <StoreFront type="supercenter" glow={0.6} />
          </Place>
        </Stage>
        <Abs x={720} y={230} w={1120}>
          <Kicker>Walmart · latest fiscal year</Kicker>
          <div style={{marginTop: 20, width: 1080, height: 90, background: C.bg2, border: `2px solid ${C.line}`, borderRadius: 12, position: 'relative', overflow: 'hidden'}}>
            <div style={{position: 'absolute', inset: 0, width: `${100 * b.ramp(5, 0.3, 1.2)}%`, background: 'rgba(127,167,201,0.55)'}} />
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${4.2 * b.rampAt(b.word(5, /4\.2|percent/i, 0.35), 0.6)}%`, background: C.green}} />
          </div>
          <div style={{display: 'flex', gap: 70, marginTop: 26}}>
            <div style={{opacity: b.ramp(5, 0.5)}}>
              <Title size={92}>$706B</Title>
              <Body size={32} color={C.muted}>
                net sales
              </Body>
            </div>
            <div style={{opacity: b.rampAt(b.word(5, /4\.2|percent/i, 0.35), 0.5)}}>
              <Title size={92} color={C.green}>
                4.2%
              </Title>
              <Body size={32} color={C.muted}>
                operating income
              </Body>
            </div>
            <div style={{opacity: b.rampAt(b.word(5, /nearly|30/i, 0.8), 0.5)}}>
              <Title size={92} color={C.green}>
                ≈$30B
              </Title>
              <Body size={32} color={C.muted}>
                $29.8B in dollars
              </Body>
            </div>
          </div>
        </Abs>
      </div>

      {/* beat 6: secret #1 = volume */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(6, 6)}}>
        <Stage>
          {[0, 1, 2, 3].map((r) => (
            <Conveyor key={r} y={360 + r * 150} t={t * (1 + r * 0.15) + r} speed={420 + r * 60} gap={150} scale={0.3} x0={-100} x1={2020} scannerX={1300 - r * 120} />
          ))}
        </Stage>
        <Abs x={0} y={150} w={1920} align="center" o={b.ramp(6, 0.2)}>
          <div>
            <Chip size={40}>SECRET #1</Chip>
          </div>
          <Title size={64} style={{marginTop: 18, display: 'inline-block', background: 'rgba(17,20,24,0.88)', padding: '10px 28px', borderRadius: 14}}>
            Not a lot per sale.
            <br />
            <span style={{color: C.orange}}>An enormous number of sales.</span>
          </Title>
        </Abs>
      </div>
    </SceneShell>
  );
};
