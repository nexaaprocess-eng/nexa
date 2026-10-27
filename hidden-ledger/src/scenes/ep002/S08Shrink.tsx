import React from 'react';
import {interpolate} from 'remotion';
import {AisleSet, CoinDot, Product, ShelfUnit} from '../../components/grocery';
import {Bin, Place} from '../../components/icons';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Chip, Illustrative, Kicker, Source, Stage, Title} from '../../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';

// Shrink. Red-alert aisle; four ways stock disappears (each acted out on the words); USDA's retail-level
// loss estimate as a produce display; markdown vs bin; the 2% margin arithmetic ($1 lost = $50 of sales,
// HYPOTHETICAL margin); Kroger's own list of reasons its gross margin rose.

export const S08Shrink: React.FC = () => {
  const b = useBeats();
  const {frame, fps} = b;
  const t = frame / fps;
  const alarm = 0.5 + 0.5 * Math.sin(t * 5);

  // beat 4: ring up $50 of sales, 2 cents of operating profit per dollar
  const ring = interpolate(frame, [b.word(4, /needs|fifty|50/i, 0.6) - 30, b.end(4) - 6], [0, 50], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <SceneShell drift={[0, 0]} zoom={0.012} beatCamera={false}>
      {/* beat 0: the danger */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <Stage>
          <AisleSet dolly={0.4 + b.ramp(0, 0, 4) * 0.3} t={t} />
          <rect x={0} y={0} width={1920} height={1080} fill={`rgba(228,87,87,${0.10 + 0.08 * alarm})`} />
        </Stage>
        <Abs x={0} y={380} w={1920} align="center" o={b.ramp(0, 0.1)}>
          <div>
            <Chip bg={C.red} color={C.cream} size={48}>
              THE DANGER
            </Chip>
          </div>
          <Title size={72} style={{marginTop: 24, display: 'inline-block', background: 'rgba(17,20,24,0.9)', padding: '14px 32px', borderRadius: 16}}>
            In a business this thin,
            <br />
            small losses are big problems
          </Title>
        </Abs>
      </div>

      {/* beat 1: four ways stock disappears */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
        <Abs x={120} y={150} w={1700}>
          <Kicker color={C.red}>Shrink</Kicker>
          <Title size={52} style={{marginTop: 8}}>
            Paid for, but never sold
          </Title>
        </Abs>
        <Stage>
          {[
            {w: /spoiled/i, l: 'Spoiled'},
            {w: /damaged/i, l: 'Damaged'},
            {w: /stolen/i, l: 'Stolen'},
            {w: /missing|records/i, l: 'Missing in the records'},
          ].map((c, i) => {
            const f0 = b.word(1, c.w, 0.4 + i * 0.12);
            const p = b.rampAt(f0, 0.8);
            const x = 270 + i * 460;
            return (
              <g key={c.l} transform={`translate(${x} 560)`} opacity={0.3 + 0.7 * Math.min(1, p * 2)}>
                <rect x={-200} y={-200} width={400} height={360} rx={20} fill={C.panel} stroke={p > 0.1 ? C.red : C.line} strokeWidth={4} />
                {i === 0 && (
                  <g transform="scale(1.3)">
                    <Product kind="bananas" spoil={p} />
                  </g>
                )}
                {i === 1 && (
                  <g transform="scale(1.2)">
                    <Product kind="cereal" crush={p} />
                  </g>
                )}
                {i === 2 && (
                  <g>
                    <rect x={-60} y={-90} width={120} height={170} rx={8} fill="none" stroke={C.cream} strokeWidth={4} strokeDasharray="12 10" />
                    <g transform={`translate(${200 * p} ${-180 * p}) scale(${1.1 - 0.4 * p})`} opacity={1 - p}>
                      <Product kind="coffee" />
                    </g>
                  </g>
                )}
                {i === 3 && (
                  <g fontFamily="Space Grotesk" fontWeight={700}>
                    <rect x={-120} y={-120} width={240} height={250} rx={10} fill={C.cream} />
                    <text x={-96} y={-60} fontSize={34} fill={C.bg}>
                      system: 12
                    </text>
                    <text x={-96} y={0} fontSize={34} fill={p > 0.5 ? C.red : C.bg}>
                      shelf: {p > 0.5 ? 10 : 12}
                    </text>
                    <line x1={-96} y1={40} x2={96} y2={40} stroke={C.muted} strokeWidth={4} />
                    <line x1={-96} y1={80} x2={60} y2={80} stroke={C.muted} strokeWidth={4} />
                  </g>
                )}
                <text y={210} textAnchor="middle" fontSize={i === 3 ? 30 : 38} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
                  {c.l}
                </text>
              </g>
            );
          })}
        </Stage>
      </div>

      {/* beat 2: USDA retail-level losses */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 2)}}>
        <Source>USDA Economic Research Service, EIB-121 (Feb 2014) · retail-level food loss, 2010 data</Source>
        <Stage>
          {Array.from({length: 10}).map((_, i) => {
            const lost = i === 9 ? b.rampAt(b.word(2, /10|ten|percent/i, 0.55), 0.6) : 0;
            const x = 210 + (i % 5) * 190;
            const y = 420 + Math.floor(i / 5) * 230;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <path d="M-80 -20 L80 -20 L68 80 L-68 80 Z" fill={lost > 0.5 ? 'rgba(228,87,87,0.6)' : '#8A6E45'} stroke={C.cream} strokeWidth={4} />
                {[-45, 0, 45].map((dx, k) => (
                  <circle key={k} cx={dx} cy={-40 + (k % 2) * 6} r={34} fill={lost > 0.5 ? '#6E4A2A' : [C.red, C.orange, C.green][(i + k) % 3]} stroke={C.cream} strokeWidth={3} />
                ))}
              </g>
            );
          })}
        </Stage>
        <Abs x={1180} y={280} w={680}>
          <Title size={170} color={C.red}>
            10%
          </Title>
          <Body size={36}>of the U.S. food supply was lost at the retail level in 2010</Body>
          <Body size={30} color={C.muted} style={{marginTop: 18}}>
            (43 billion pounds) · an older estimate, shown for scale
          </Body>
        </Abs>
      </div>

      {/* beat 3: markdown vs bin */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <Stage>
          <Place x={560} y={500} s={1.8}>
            <Product kind="salad" tag={b.rampAt(b.word(3, /half/i, 0.5), 0.2) > 0.5 ? '50%' : undefined} />
          </Place>
          {Array.from({length: 4}).map((_, i) => (
            <Place key={i} x={500 + i * 70} y={790 - 30 * b.rampAt(b.word(3, /recovers/i, 0.6) + i * 4, 0.4)} o={b.rampAt(b.word(3, /recovers/i, 0.6) + i * 4, 0.3)}>
              <CoinDot r={30} sign="$" />
            </Place>
          ))}
          <Place x={1380} y={460} s={1.6}>
            <Product kind="salad" spoil={1} />
          </Place>
          <Place x={1380} y={760} s={1.1} o={b.rampAt(b.word(3, /thrown|throne|away/i, 0.85), 0.4)}>
            <Bin />
          </Place>
        </Stage>
        <Abs x={300} y={170} w={600} align="center">
          <Kicker color={C.green}>Marked down</Kicker>
        </Abs>
        <Abs x={1080} y={170} w={600} align="center">
          <Kicker color={C.red}>Thrown away</Kicker>
        </Abs>
        <Abs x={1180} y={830} w={400} align="center" o={b.rampAt(b.word(3, /nothing/i, 0.9), 0.3)}>
          <Title size={56} color={C.red}>
            $0
          </Title>
        </Abs>
        <Abs x={760} y={680} w={420} o={b.rampAt(b.word(3, /recovers/i, 0.6), 0.4)}>
          <Body size={34} color={C.green} weight={700}>
            recovers part of its cost
          </Body>
        </Abs>
      </div>

      {/* beat 4: $1 of shrink vs $50 of sales at a 2% margin */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <Illustrative />
        <Stage>
          {/* the hole: $1 of lost product */}
          <g transform="translate(420 560)">
            <circle r={150} fill="none" stroke={C.red} strokeWidth={8} strokeDasharray="20 14" />
            <circle r={146 * Math.min(1, ring / 50)} fill={C.green} opacity={0.85} />
            <text y={30} textAnchor="middle" fontSize={96} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
              $1
            </text>
          </g>
          {/* fifty one-dollar sales, each dropping 2 cents into the hole */}
          {Array.from({length: 50}).map((_, i) => {
            const on = ring > i ? 1 : 0;
            return <rect key={i} x={760 + (i % 10) * 102} y={360 + Math.floor(i / 10) * 86} width={86} height={66} rx={8} fill={on ? C.orange : C.panel} stroke={C.line} strokeWidth={3} />;
          })}
        </Stage>
        <Abs x={140} y={220} w={560} align="center" o={b.ramp(4, 0.4)}>
          <Body size={34} weight={700}>
            Imagine a <span style={{color: C.green}}>2%</span> operating margin
          </Body>
        </Abs>
        <Abs x={760} y={240} w={1020} o={b.ramp(4, 1.2)}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 72, color: C.cream, fontVariantNumeric: 'tabular-nums'}}>
            ${Math.floor(ring)} <span style={{color: C.muted, fontSize: 40}}>of new sales</span>
          </div>
        </Abs>
        <Abs x={140} y={780} w={1700} o={b.rampAt(b.word(4, /fifty|50/i, 0.8), 0.4)}>
          <Body size={36} weight={600}>
            $1 lost ÷ 2¢ of profit per $1 of sales = <b style={{color: C.orange}}>$50 of sales</b> just to break even on it
          </Body>
        </Abs>
      </div>

      {/* beat 5: Kroger's reasons */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(5, 5)}}>
        <Source>Kroger 10-K fiscal 2025 · gross margin rate 22.9% (2025) vs 22.3% (2024)</Source>
        <Stage>
          <ShelfUnit x={1180} y={330} w={620} levels={3} pitch={130} scale={0.45} seed={2} />
        </Stage>
        <Abs x={120} y={190} w={1000}>
          <Kicker>Why Kroger’s gross margin rose to 22.9%</Kicker>
          <div style={{marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14}}>
            {['sale of its specialty pharmacy business', 'sourcing improvements', 'lower shrink', 'lower supply chain costs', 'decreased fuel sales'].map((r, i) => {
              const hi = r === 'lower shrink';
              const o = b.ramp(5, 0.2 + i * 0.25, 0.4);
              return (
                <div
                  key={r}
                  style={{
                    fontFamily: FONT_BODY,
                    fontWeight: hi ? 700 : 500,
                    fontSize: hi ? 52 : 34,
                    color: hi ? C.cream : C.muted,
                    background: hi ? 'rgba(78,159,125,0.35)' : 'transparent',
                    borderLeft: `8px solid ${hi ? C.green : C.line}`,
                    padding: '6px 18px',
                    opacity: o,
                    transform: `scale(${hi ? 1 + 0.06 * b.pop(5, 1.4) : 1})`,
                    transformOrigin: 'left center',
                  }}
                >
                  {r}
                </div>
              );
            })}
          </div>
          <Body size={28} color={C.muted} style={{marginTop: 18}}>
            …partly offset by other factors, per the 10-K
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
