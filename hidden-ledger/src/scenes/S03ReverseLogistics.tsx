import React from 'react';
import {interpolate} from 'remotion';
import {Box, Calendar, Gear, House, Jacket, Mailbox, Magnifier, Pallet, Place, Store, Tag, Truck, Warehouse} from '../components/icons';
import {Conveyor, DockSet, SetWindow, StreetSet, WarehouseSet} from '../components/sets';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../components/timeline';
import {Abs, Body, Chip, DrawPath, HBar, Kicker, Source, Stage, Title} from '../components/ui';
import {C, FONT_TITLE} from '../themes/theme';

const NODES = [
  {x: 230, label: 'Home', icon: <House />},
  {x: 520, label: 'Hand-off', icon: <Mailbox />},
  {x: 810, label: 'Consolidation', icon: <Pallet n={4} />},
  {x: 1100, label: 'Returns center', icon: <Warehouse />},
  {x: 1390, label: 'Inspection', icon: <Magnifier />},
  {x: 1680, label: 'Decision', icon: <Gear />},
];
const MAP_Y = 285;
// which map node is active for each narration segment
const ACTIVE = [0, 1, 1, 2, 3, 4, 5, -1, -1];

export const S03ReverseLogistics: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  const segIdx = b.ctx.segStart.filter((s) => s <= frame).length - 1;
  const active = ACTIVE[Math.max(0, segIdx)] ?? -1;
  const draw = b.ramp(0, 0.3, 2.2);
  const nodeX = (a: number) => (a >= 0 ? NODES[a].x : NODES[NODES.length - 1].x);
  const prev = segIdx > 0 ? ACTIVE[segIdx - 1] ?? -1 : 0;
  // the parcel glides from the previous node to the active one at the start of each segment
  const px = interpolate(b.ramp(Math.max(0, segIdx), 0, 1.0), [0, 1], [nodeX(prev), nodeX(active)]);

  return (
    <SceneShell drift={[0, 0]} zoom={0.015}>
      {/* ---------- persistent route map */}
      <Stage>
        <DrawPath d={`M${NODES[0].x} ${MAP_Y + 60} L${NODES[5].x} ${MAP_Y + 60}`} t={draw} color={C.line} width={8} />
        <line x1={NODES[0].x} x2={px} y1={MAP_Y + 60} y2={MAP_Y + 60} stroke={C.orange} strokeWidth={8} strokeLinecap="round" />
        {NODES.map((n, i) => {
          const on = b.ramp(0, 0.3 + i * 0.3, 0.4);
          const isActive = i === active;
          return (
            <g key={n.label} opacity={on}>
              <Place x={n.x} y={MAP_Y - 30} s={isActive ? 0.62 : 0.48} o={isActive || active < 0 ? 1 : 0.55}>
                {n.icon}
              </Place>
              <circle cx={n.x} cy={MAP_Y + 60} r={isActive ? 16 : 11} fill={i <= Math.max(active, active < 0 ? 5 : -1) ? C.orange : C.bg} stroke={C.cream} strokeWidth={4} />
              <text x={n.x} y={MAP_Y + 108} textAnchor="middle" fill={isActive ? C.orange : C.cream} fontSize={28} fontWeight={600} fontFamily="Space Grotesk">
                {n.label}
              </text>
            </g>
          );
        })}
        {/* travelling parcel */}
        <Place x={px} y={MAP_Y + 30} s={0.25}>
          <Box />
        </Place>
      </Stage>
      <Abs x={0} y={150} w={1920} align="center" o={b.during(0, 0)}>
        <Chip bg="transparent" color={C.orange} size={26}>
          ONE COMMON PATH — NOT THE ONLY ONE
        </Chip>
      </Abs>

      {/* ---------- detail panels (lower half) */}
      {/* beat 0: jacket at home */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <Stage>
          <Place x={960} y={640} s={1.1 * b.pop(0, 0.5)}>
            <Jacket />
          </Place>
        </Stage>
      </div>

      {/* beat 1: hand-off options on a living street */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
        <SetWindow x={110} y={440} w={1700} h={440} view={[0, 420, 1920, 497]}>
          <StreetSet scroll={frame * 3} />
          {[
            {x: 420, icon: <Mailbox />, s: 1.1},
            {x: 980 + 40 * Math.sin(frame / 20), icon: <Truck wheel={frame * 6} />, s: 1.5},
            {x: 1540, icon: <Store />, s: 1.25},
          ].map((o, i) => (
            <Place key={i} x={o.x} y={720} s={o.s * b.pop(1, 1.0 + i * 0.9)}>
              {o.icon}
            </Place>
          ))}
        </SetWindow>
        <Abs x={110} y={455} w={1700}>
          <div style={{display: 'flex', justifyContent: 'space-around'}}>
            {['Mail it', 'Leave it with a carrier', 'Bring it to a counter'].map((l, i) => (
              <Chip key={l} size={34} bg="rgba(17,20,24,0.85)" color={C.cream}>
                <span style={{opacity: b.ramp(1, 1.2 + i * 0.9)}}>{l}</span>
              </Chip>
            ))}
          </div>
        </Abs>
        <Abs x={1240} y={810} w={520} align="center" o={b.ramp(1, 5.5)}>
          <Chip size={30}>sometimes no box or label</Chip>
        </Abs>
      </div>

      {/* beat 2: NRF stat */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 2)}}>
        <Source>NRF & Happy Returns, 2025 Retail Returns Landscape · survey of 358 large U.S. retailers</Source>
        <Abs x={330} y={480} w={1260}>
          <Kicker>Retailers offering no-box, no-label returns to carriers</Kicker>
          <div style={{marginTop: 30}}>
            <HBar label="2024" value={17} max={40} t={b.ramp(2, 0.3)} valueText="17%" color={C.line} w={1260} h={56} />
            <HBar label="2025" value={25} max={40} t={b.ramp(2, 1.0)} valueText="25%" w={1260} h={56} />
          </div>
        </Abs>
      </div>

      {/* beat 3: consolidation at a loading dock */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <SetWindow x={110} y={440} w={1700} h={440} view={[0, 250, 1920, 497 * 1.13]}>
          <DockSet t={(frame - b.at(3)) / 30} truckIn={b.ramp(3, 0.2, 2.0)} loaded={b.ramp(3, 2.2, 4.5)} />
        </SetWindow>
        <Abs x={150} y={460} w={800} o={b.ramp(3, 0.8)}>
          <Chip size={34} bg="rgba(17,20,24,0.85)" color={C.cream}>
            one by one…
          </Chip>
        </Abs>
        <Abs x={1010} y={460} w={760} align="right" o={b.ramp(3, 3)}>
          <Chip size={34}>…pooled and shipped in bulk</Chip>
        </Abs>
      </div>

      {/* beat 4: returns center: conveyor through a scanner */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <SetWindow x={110} y={440} w={1700} h={440} view={[0, 330, 1920, 497 * 1.13]}>
          <WarehouseSet t={frame / 30} />
          <Conveyor y={820} t={(frame - b.at(4)) / 30} speed={300} gap={260} scale={0.62} scannerX={1100} />
        </SetWindow>
        <Abs x={1240} y={470} o={b.ramp(4, 1.6)}>
          <Chip size={40} bg={C.red} color={C.cream}>
            SCANNED
          </Chip>
        </Abs>
      </div>

      {/* beat 5: inspection checklist */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(5, 5)}}>
        <Stage>
          <Place x={520} y={640} s={1.15}>
            <Jacket />
          </Place>
          <Place x={600 + Math.sin(frame / 15) * 40} y={590 + Math.cos(frame / 20) * 30} s={0.9}>
            <Magnifier />
          </Place>
        </Stage>
        <Abs x={900} y={470} w={820}>
          {['Right item?', 'Damaged?', 'Worn?', 'Tags still on?'].map((q, i) => {
            const t = b.ramp(5, 1.2 + i * 1.1, 0.4);
            return (
              <div key={q} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 22, opacity: 0.25 + 0.75 * t}}>
                <div style={{width: 54, height: 54, borderRadius: 10, border: `4px solid ${C.cream}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: C.orange, fontFamily: FONT_TITLE}}>
                  {t > 0.5 ? '✓' : ''}
                </div>
                <Title size={52} weight={600}>
                  {q}
                </Title>
              </div>
            );
          })}
        </Abs>
      </div>

      {/* beat 6: decision fork */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(6, 6)}}>
        <Stage>
          <Place x={330} y={640} s={0.8}>
            <Gear rot={frame * 2} />
          </Place>
          {[
            {y: 470, l: 'Restock', c: C.green},
            {y: 580, l: 'Discount', c: C.orange},
            {y: 690, l: 'Send elsewhere', c: C.blue},
            {y: 800, l: 'Write off', c: C.red},
          ].map((o, i) => {
            const t = b.ramp(6, 1.0 + i * 0.7, 0.6);
            return (
              <g key={o.l}>
                <DrawPath d={`M420 640 C 620 640, 620 ${o.y}, 820 ${o.y}`} t={t} color={o.c} width={7} len={700} />
                <rect x={840} y={o.y - 40} width={520} height={80} rx={14} fill={C.panel} stroke={o.c} strokeWidth={4} opacity={t} />
                <text x={880} y={o.y + 14} fill={C.cream} opacity={t} fontSize={40} fontFamily="Space Grotesk" fontWeight={700}>
                  {o.l}
                </text>
              </g>
            );
          })}
        </Stage>
      </div>

      {/* beat 7: reverse logistics + restock time */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(7, 7)}}>
        <Source o={b.ramp(7, 3)}>NRF & Happy Returns, 2025 Retail Returns Landscape · merchant survey</Source>
        <Abs x={0} y={470} w={1920} align="center" o={b.ramp(7, 0.2)}>
          <Title size={96} color={C.orange}>
            reverse logistics
          </Title>
        </Abs>
        <Abs x={360} y={640} w={1200} o={b.ramp(7, 3.2)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
            <div style={{fontFamily: FONT_TITLE, fontSize: 190, fontWeight: 700, color: C.cream}}>~49%</div>
            <Body size={36}>
              of retailers say it takes <b style={{color: C.orange}}>6–10 days</b> to get a returned item back in stock
            </Body>
          </div>
          <div style={{display: 'flex', gap: 10, marginTop: 20}}>
            {Array.from({length: 10}).map((_, i) => (
              <div key={i} style={{flex: 1, height: 26, borderRadius: 6, background: i < 6 ? C.line : C.orange, opacity: b.ramp(7, 4 + i * 0.12, 0.3)}} />
            ))}
          </div>
          <Body size={24} color={C.muted} style={{marginTop: 8}}>
            day 1 … day 10
          </Body>
        </Abs>
      </div>

      {/* beat 8: value decays while it waits (qualitative) */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(8, 8)}}>
        <Stage>
          <Place x={560} y={640} s={1.0}>
            <Jacket />
          </Place>
          <Place x={760} y={480} s={0.75} r={-12}>
            <Tag text="NOT FOR SALE" fill={C.red} textColor={C.cream} />
          </Place>
          <Place x={1300} y={500} s={0.7}>
            <Calendar day={`W${1 + Math.min(5, Math.floor(b.through(8) * 6))}`} accent={C.orange} />
          </Place>
        </Stage>
        <Abs x={1060} y={640} w={560}>
          <Body size={28} color={C.muted}>
            resale value of a seasonal item
          </Body>
          <div style={{height: 40, marginTop: 12, background: C.bg2, border: `2px solid ${C.line}`, borderRadius: 8, overflow: 'hidden'}}>
            <div style={{width: `${100 - 55 * b.through(8)}%`, height: '100%', background: C.green}} />
          </div>
          <Body size={22} color={C.muted} style={{marginTop: 10}}>
            qualitative — the rate varies by product and season
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
