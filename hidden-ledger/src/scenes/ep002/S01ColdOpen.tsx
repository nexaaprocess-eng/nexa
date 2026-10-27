import React from 'react';
import {interpolate} from 'remotion';
import {Bill, CheckoutSet, ProductKind} from '../../components/grocery';
import {Place} from '../../components/icons';
import {SceneShell} from '../../components/SceneShell';
import {rnd} from '../../components/sets';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Chip, Counter, Kicker, Source, Stage, Title} from '../../components/ui';
import {C, FONT_TITLE} from '../../themes/theme';

// Cold open: the question is on screen from frame 0, over a checkout lane that is already moving.
// Items cross the scanner on the spoken words (beeps in sfx_cues.json), then the $100 bill shrinks to $1.28.

export const S01ColdOpen: React.FC = () => {
  const b = useBeats();
  const {frame, fps} = b;
  const t = frame / fps;
  const sec = (f: number) => f / fps;
  const items: {kind: ProductKind; at: number}[] = [
    {kind: 'cereal', at: -1.2},
    {kind: 'eggs', at: 0.2},
    {kind: 'bananas', at: 1.4},
    {kind: 'bread', at: sec(b.word(1, /bread/i, 0.05))},
    {kind: 'coffee', at: sec(b.word(1, /coffee/i, 0.15))},
    {kind: 'milk', at: sec(b.word(1, /milk/i, 0.3))},
    {kind: 'deli', at: sec(b.word(1, /dinners/i, 0.45))},
    {kind: 'pasta', at: sec(b.word(1, /beeps/i, 0.55))},
  ];
  const scanned = items.filter((i) => i.at <= t).length;
  const printAt = b.word(1, /prints/i, 0.7);
  const receipt = b.rampAt(printAt, 1.2);
  const totalStr = scanned <= 3 ? `$${(scanned * 4.37).toFixed(2)}` : `$${Math.min(100, 13.11 + (scanned - 3) * 17.4).toFixed(2)}`;

  // beats 0-1: checkout lane, wide
  const lane = b.during(0, 1, 0.3) + (frame < b.at(0) ? 1 : 0);
  // beat 2: question
  const q = b.during(2, 2);
  // beats 3-4: answer
  const ans = b.during(3, 4);
  // beat 5: tiny vs enormous
  const fin = b.during(5, 5);

  const billIn = b.pop(0, 0.15);
  const k = b.ramp(3, 0.2, 1.2); // bill shrinks
  return (
    <SceneShell drift={[-10, 0]} zoom={0.02} fadeIn={false}>
      {/* --- checkout lane --- */}
      <div style={{position: 'absolute', inset: 0, opacity: Math.min(1, lane)}}>
        <Stage>
          <rect x={0} y={0} width={1920} height={1080} fill="#14181D" />
          {/* store lights + aisle hints behind the lane */}
          {Array.from({length: 8}).map((_, i) => (
            <rect key={i} x={60 + i * 240} y={150} width={150} height={360} rx={6} fill="#1A1F26" opacity={0.9} />
          ))}
          {Array.from({length: 8}).map((_, i) =>
            [0, 1, 2].map((l) => <rect key={`${i}${l}`} x={72 + i * 240} y={190 + l * 110} width={126} height={56} fill={['#5B7FA6', '#C8925A', '#4FA3A5', C.orange][Math.floor(rnd(i * 3 + l) * 4)]} opacity={0.25} />),
          )}
          <CheckoutSet t={t} items={items} total={totalStr} receipt={receipt} y={690} />
          {/* the $100 bill being handed over */}
          <Place x={interpolate(billIn, [0, 1], [-300, 330])} y={interpolate(billIn, [0, 1], [380, 450])} s={0.9} r={interpolate(billIn, [0, 1], [-25, -6])} o={1 - b.ramp(1, 4.5, 0.6)}>
            <Bill />
          </Place>
        </Stage>
      </div>

      {/* --- persistent question band (from frame 0) --- */}
      <Abs x={0} y={150} w={1920} align="center" o={1 - Math.max(q, ans, fin)}>
        <Kicker>Of every $100 you spend at a supermarket…</Kicker>
        <Title size={84} style={{marginTop: 14}}>
          how much does the store <span style={{color: C.orange}}>keep</span>?
        </Title>
      </Abs>

      {/* --- beat 2: the question, close-up on the bill --- */}
      <div style={{position: 'absolute', inset: 0, opacity: q}}>
        <Stage>
          <Place x={960} y={500} s={1.6 * (0.9 + 0.1 * b.pop(2))} r={-4}>
            <Bill />
          </Place>
          <Place x={1340} y={330} s={b.pop(2, 1.2)}>
            <circle r={90} fill={C.orange} stroke={C.cream} strokeWidth={8} />
            <text y={44} textAnchor="middle" fontSize={130} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk">
              ?
            </text>
          </Place>
        </Stage>
        <Abs x={0} y={760} w={1920} align="center" o={b.ramp(2, 0.3)}>
          <Title size={72}>How much does the supermarket keep?</Title>
        </Abs>
      </div>

      {/* --- beats 3-4: the answer --- */}
      <div style={{position: 'absolute', inset: 0, opacity: ans}}>
        <Source>Kroger 10-K, fiscal 2025 (52 weeks ended Jan 31, 2026) · operating profit $1,890M on sales $147,642M</Source>
        <Stage>
          <Place x={interpolate(k, [0, 1], [960, 420])} y={interpolate(k, [0, 1], [520, 360])} s={interpolate(k, [0, 1], [1.5, 0.75])} o={1}>
            <Bill />
          </Place>
          {/* stores dot field: nearly 2,700 supermarkets */}
          <g opacity={b.ramp(3, 0.2) * (1 - b.ramp(4, 0, 0.4))}>
            {Array.from({length: 2697}).map((_, i) => {
              const col = i % 75;
              const row = Math.floor(i / 75);
              const on = b.ramp(3, 0.2 + (i / 2697) * 2.4, 0.2);
              return on > 0 ? <rect key={i} x={980 + col * 11} y={250 + row * 11} width={8} height={8} rx={2} fill={C.green} opacity={0.35 + 0.65 * on} /> : null;
            })}
          </g>
        </Stage>
        <Abs x={980} y={660} w={840} o={b.ramp(3, 0.4) * (1 - b.ramp(4, 0, 0.4))}>
          <Chip bg={C.green}>≈2,700 Kroger supermarkets</Chip>
          <Body size={30} color={C.muted} style={{marginTop: 12}}>
            2,697 at fiscal year-end · one square = one store
          </Body>
        </Abs>
        <Abs x={170} y={480} w={500} align="center" o={b.rampAt(b.word(3, /operating|1\.28|dollar/i, 0.75), 0.5)}>
          <Counter value={1.28} t={b.rampAt(b.word(3, /operating|1\.28|dollar/i, 0.75), 1)} decimals={2} prefix="$" size={150} color={C.green} />
          <Body size={32} color={C.cream}>
            operating profit per $100 of sales
          </Body>
        </Abs>
        {/* beat 4: $147.6 billion of sales */}
        <Abs x={900} y={300} w={940} o={b.ramp(4, 0.1)}>
          <Kicker>Kroger sales, fiscal 2025</Kicker>
          <Counter value={147.6} t={b.ramp(4, 0.2, 1.6)} decimals={1} prefix="$" suffix="B" size={220} />
          <Body size={36} color={C.muted} style={{marginTop: 10}}>
            more than $147 billion
          </Body>
        </Abs>
      </div>

      {/* --- beat 5: tiny margins, enormous numbers --- */}
      <div style={{position: 'absolute', inset: 0, opacity: fin}}>
        <Stage>
          <Place x={520} y={560} s={0.32 + 0.05 * Math.sin(frame / 8)}>
            <circle r={60} fill={C.green} stroke={C.cream} strokeWidth={8} />
          </Place>
          {Array.from({length: 60}).map((_, i) => {
            const col = i % 10;
            const row = Math.floor(i / 10);
            const o = b.ramp(5, 1.0 + i * 0.025, 0.25);
            return <rect key={i} x={1060 + col * 70} y={700 - row * 70 - 20 * (1 - o)} width={60} height={60} rx={6} fill={C.orange} opacity={o} stroke={C.cream} strokeWidth={3} />;
          })}
        </Stage>
        <Abs x={320} y={680} w={400} align="center" o={b.ramp(5, 0)}>
          <Title size={80} color={C.green}>
            Tiny margins.
          </Title>
        </Abs>
        <Abs x={1040} y={200} w={760} align="center" o={b.ramp(5, 1.0)}>
          <Title size={80}>Enormous numbers.</Title>
        </Abs>
        <Abs x={0} y={800} w={1920} align="center" o={b.ramp(5, 2.4)}>
          <Body size={44} color={C.cream} weight={600} style={{fontFamily: FONT_TITLE}}>
            How does that business actually work?
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
