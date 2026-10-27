import React from 'react';
import {interpolate} from 'remotion';
import {Product, Semi, ShelfUnit, StockroomSet} from '../../components/grocery';
import {Calendar, Place, Scanner} from '../../components/icons';
import {SceneShell} from '../../components/SceneShell';
import {Pallet} from '../../components/icons';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Chip, Kicker, Source, Stage, Title} from '../../components/ui';
import {C, FONT_TITLE} from '../../themes/theme';

// Speed. One continuous tracking shot (dock -> stockroom -> shelf) on the spoken words, then the
// turnover formula as a flow, a three-lane "laps per year" race, a 30-day calendar and the earn-again loop.

const TURNS = [
  {n: 'Costco', v: 14.12, days: 25.8, c: C.orange},
  {n: 'Kroger', v: 11.99, days: 30.4, c: C.green},
  {n: 'Walmart', v: 9.29, days: 39.3, c: C.blue},
];

export const S05Speed: React.FC = () => {
  const b = useBeats();
  const {frame, fps} = b;
  const t = frame / fps;

  // ---- tracking shot across a 3-panel set (beat 1)
  const wTruck = b.word(1, /trucks/i, 0.35);
  const wPallet = b.word(1, /pallets/i, 0.5);
  const wShelf = b.word(1, /shelves|refilled/i, 0.7);
  const wEmpty = b.word(1, /emptied/i, 0.9);
  const camX = interpolate(frame, [wTruck + 15, wPallet - 5, wShelf - 10], [0, 1920, 3840], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * (3 - 2 * x)});
  const truckIn = b.rampAt(wTruck - 25, 1.4);
  const refill = b.rampAt(wShelf - 5, 1.0);
  const sold = b.rampAt(wEmpty - 4, 1.4);

  // ---- race (beat 3): one simulated "year" over ~9 s
  const raceT = interpolate(frame, [b.at(3, 0.8), b.at(3, 0.8) + 9 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // ---- loop (beat 5)
  const loopP = Math.max(0, (frame - b.at(5)) / (2.2 * fps));
  return (
    <SceneShell drift={[0, 0]} zoom={0.012} beatCamera={false}>
      {/* beat 0: secret #2 */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <Stage>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={((t * 1400 + i * 520) % 2600) - 600} y={560 + (i % 2) * 70} width={360 - i * 30} height={10} rx={5} fill={C.orange} opacity={0.5} />
          ))}
        </Stage>
        <Abs x={0} y={330} w={1920} align="center">
          <Chip size={44}>SECRET #2</Chip>
          <Title size={150} style={{marginTop: 20}}>
            Speed
          </Title>
        </Abs>
      </div>

      {/* beat 1: dock -> stockroom -> shelf */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
        <Stage>
          <g transform={`translate(${-camX} 0)`}>
            {/* panel 1: loading dock */}
            <rect x={0} y={0} width={1920} height={1080} fill="#14181D" />
            <rect x={0} y={200} width={760} height={600} fill="#1A1F26" />
            <rect x={300} y={380} width={380} height={420} fill="#0E1114" stroke={C.cream} strokeWidth={6} />
            <rect x={280} y={800} width={420} height={60} fill={C.orange} />
            <g transform={`translate(${interpolate(truckIn, [0, 1], [2300, 1240])} 760) scale(1.25)`}>
              <Semi wheel={-t * 200 * (1 - truckIn)} doorOpen={b.rampAt(wTruck + 30, 0.6)} />
            </g>
            <g transform={`translate(${interpolate(b.rampAt(wTruck + 40, 1.4), [0, 1], [720, 480])} 720) scale(0.8)`} opacity={b.rampAt(wTruck + 40, 0.3)}>
              <Pallet n={6} />
            </g>
            <rect x={0} y={860} width={1920} height={220} fill="#101317" />
            {/* panel 2: stockroom */}
            <g transform="translate(1920 0)">
              <StockroomSet t={t} restock={b.rampAt(wPallet + 10, 2.0) * 0.6} />
              <g transform={`translate(${interpolate(b.rampAt(wPallet - 10, 1.8), [0, 1], [200, 1400])} 700) scale(0.9)`}>
                <Pallet n={5} />
              </g>
            </g>
            {/* panel 3: shelf being refilled, then bought down */}
            <g transform="translate(3840 0)">
              <rect x={0} y={0} width={1920} height={1080} fill="#15191E" />
              <ShelfUnit x={160} y={170} w={1600} levels={3} pitch={160} scale={0.55} stock={(i) => Math.min(refill * 1.6 - (i % 7) * 0.08, 1 - Math.max(0, sold * 1.5 - ((i * 37) % 11) / 11))} />
            </g>
          </g>
        </Stage>
        {/* before the trucks: perishables with a clock running */}
        <div style={{position: 'absolute', inset: 0, background: C.bg, opacity: 1 - b.rampAt(wTruck - 12, 0.4)}}>
          <Stage>
            {(['milk', 'bananas', 'bread', 'salad', 'eggs'] as const).map((k, i) => {
              const sweep = ((t * 0.9 + i * 0.37) % 1) * Math.PI * 2;
              return (
                <g key={k} transform={`translate(${260 + i * 350} 560)`} opacity={b.ramp(1, i * 0.25, 0.4)}>
                  <g transform="scale(1.25)">
                    <Product kind={k} spoil={k === 'bananas' ? 0.3 * b.ramp(1, 1, 3) : 0} />
                  </g>
                  <g transform="translate(0 -210)">
                    <circle r={44} fill={C.panel} stroke={C.orange} strokeWidth={6} />
                    <line x1={0} y1={0} x2={Math.sin(sweep) * 30} y2={-Math.cos(sweep) * 30} stroke={C.cream} strokeWidth={6} strokeLinecap="round" />
                  </g>
                </g>
              );
            })}
          </Stage>
          <Abs x={0} y={760} w={1920} align="center" o={b.ramp(1, 0.6)}>
            <Title size={60}>Perishable: it can’t sit for long</Title>
          </Abs>
        </div>
        {[
          {txt: 'Trucks arrive', f: wTruck, until: wPallet},
          {txt: 'Through the stockroom', f: wPallet, until: wShelf},
          {txt: 'Shelves refilled…', f: wShelf, until: wEmpty},
          {txt: '…and emptied again', f: wEmpty, until: 1e9},
        ].map((l) => (
          <Abs key={l.txt} x={120} y={150} w={1200} o={b.rampAt(l.f, 0.3) * (1 - b.rampAt(l.until, 0.2))}>
            <Chip size={44} bg={C.panel} color={C.cream}>
              {l.txt}
            </Chip>
          </Abs>
        ))}
      </div>

      {/* beat 2: inventory turnover as a flow */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 2)}}>
        <Abs x={0} y={150} w={1920} align="center" o={b.ramp(2, 0)}>
          <Kicker>Inventory turnover</Kicker>
        </Abs>
        <Stage>
          {/* a year's worth of goods flowing out (numerator) */}
          {Array.from({length: 24}).map((_, i) => {
            const x = ((t * 260 + i * 80) % 1920) - 40;
            return (
              <g key={i} transform={`translate(${x} 390) scale(0.28)`} opacity={b.rampAt(b.word(2, /cost/i, 0.3), 0.4)}>
                <Product kind={(['cereal', 'milk', 'coffee', 'bread', 'pasta', 'eggs'] as const)[i % 6]} />
              </g>
            );
          })}
          <line x1={560} y1={520} x2={1360} y2={520} stroke={C.cream} strokeWidth={8} opacity={b.rampAt(b.word(2, /divided/i, 0.6), 0.3)} />
          {/* the average stock on hand (denominator) */}
          <g opacity={b.rampAt(b.word(2, /average|inventory/i, 0.8, 1), 0.4)}>
            {Array.from({length: 4}).map((_, i) => (
              <g key={i} transform={`translate(${880 + i * 55} 640) scale(0.3)`}>
                <Product kind={(['cereal', 'milk', 'coffee', 'bread'] as const)[i]} />
              </g>
            ))}
          </g>
        </Stage>
        <Abs x={0} y={250} w={1920} align="center" o={b.rampAt(b.word(2, /cost/i, 0.3), 0.4)}>
          <Title size={50}>cost of goods sold in a year</Title>
        </Abs>
        <Abs x={0} y={720} w={1920} align="center" o={b.rampAt(b.word(2, /average|inventory/i, 0.8, 1), 0.4)}>
          <Title size={50}>average inventory on hand</Title>
        </Abs>
      </div>

      {/* beat 3: laps per year */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <Source>Latest 10-Ks: cost of goods ÷ average of opening and closing inventory · Hidden Ledger calculation</Source>
        <Abs x={140} y={170} w={1000}>
          <Kicker>Times inventory turned over in a year</Kicker>
        </Abs>
        <Stage>
          {TURNS.map((r, i) => {
            const laps = r.v * raceT;
            const frac = laps - Math.floor(laps);
            const cx = 330 + i * 0;
            const y = 330 + i * 170;
            const x0 = 360;
            const x1 = 1460;
            const on = b.rampAt(b.word(3, new RegExp(r.n, 'i'), 0.3 + i * 0.25), 0.4);
            return (
              <g key={r.n} opacity={0.25 + 0.75 * on}>
                <rect x={x0} y={y} width={x1 - x0} height={14} rx={7} fill={C.line} />
                <rect x={x0} y={y} width={(x1 - x0) * frac} height={14} rx={7} fill={r.c} opacity={0.5} />
                <g transform={`translate(${x0 + (x1 - x0) * frac} ${y - 30}) scale(0.35)`}>
                  <Product kind={i === 0 ? 'can' : i === 1 ? 'milk' : 'detergent'} />
                </g>
                <text x={cx - 200} y={y + 18} fontSize={44} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
                  {r.n}
                </text>
                <text x={1700} y={y + 26} textAnchor="end" fontSize={84} fontWeight={700} fill={r.c} fontFamily="Space Grotesk" style={{fontVariantNumeric: 'tabular-nums'}}>
                  {laps.toFixed(1)}×
                </text>
              </g>
            );
          })}
        </Stage>
        <Abs x={140} y={780} w={1600} o={b.ramp(3, 6)}>
          <Body size={30} color={C.muted}>
            Kroger uses FIFO inventory here; Walmart sells far more general merchandise than a supermarket
          </Body>
        </Abs>
      </div>

      {/* beat 4: about a month on the shelf */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <Stage>
          {Array.from({length: 30}).map((_, d) => {
            const lit = b.ramp(4, 0.3 + d * 0.09, 0.15);
            return (
              <g key={d} transform={`translate(${250 + (d % 10) * 145} ${350 + Math.floor(d / 10) * 125})`}>
                <rect x={-60} y={-50} width={120} height={100} rx={12} fill={lit > 0.5 ? 'rgba(78,159,125,0.35)' : C.panel} stroke={C.line} strokeWidth={3} />
                <text y={16} textAnchor="middle" fontSize={44} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
                  {d + 1}
                </text>
              </g>
            );
          })}
          <Place x={110} y={475} s={0.55}>
            <Calendar day="1" />
          </Place>
          <Place x={1780} y={475} s={0.7}>
            <Scanner beam={b.ramp(4, 3.2)} />
          </Place>
        </Stage>
        <Abs x={0} y={150} w={1920} align="center">
          <Title size={58}>
            12 turns a year ≈ <span style={{color: C.green}}>about a month</span> from truck to checkout
          </Title>
        </Abs>
        <Abs x={0} y={720} w={1920} align="center" o={b.rampAt(b.word(4, /faster|cash/i, 0.6), 0.4)}>
          <Body size={40} color={C.cream}>
            Faster cycle → <b style={{color: C.green}}>less cash sitting on the shelves</b> at any moment
          </Body>
          <Body size={28} color={C.muted} style={{marginTop: 8}}>
            An average across everything the store sells: milk moves faster, detergent slower
          </Body>
        </Abs>
      </div>

      {/* beat 5: earn the margin again */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(5, 5)}}>
        <Stage>
          <circle cx={960} cy={540} r={260} fill="none" stroke={C.line} strokeWidth={14} />
          {['Truck', 'Shelf', 'Checkout'].map((l, i) => {
            const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
            return (
              <g key={l} transform={`translate(${960 + Math.cos(a) * 260} ${540 + Math.sin(a) * 260})`}>
                <circle r={86} fill={C.panel} stroke={C.cream} strokeWidth={5} />
                <text y={10} textAnchor="middle" fontSize={30} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
                  {l}
                </text>
              </g>
            );
          })}
          <g transform={`translate(${960 + Math.cos(loopP * Math.PI * 2 - Math.PI / 2) * 260} ${540 + Math.sin(loopP * Math.PI * 2 - Math.PI / 2) * 260})`}>
            <circle r={26} fill={C.orange} stroke={C.cream} strokeWidth={4} />
          </g>
        </Stage>
        <Abs x={1320} y={380} w={520}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 120, color: C.green}}>+{Math.floor(loopP)}</div>
          <Body size={34}>turns, each one earning the thin margin again</Body>
        </Abs>
        <Abs x={80} y={430} w={520}>
          <Body size={34} color={C.muted}>
            Same shelf space. Same money tied up in stock.
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
