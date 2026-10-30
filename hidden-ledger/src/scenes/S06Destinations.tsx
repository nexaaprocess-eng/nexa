import React from 'react';
import {interpolate} from 'remotion';
import {Bin, Box, Heart, Magnifier, Pallet, Place, Recycle, Store, Tag, Truck, Wrench} from '../components/icons';
import {Conveyor} from '../components/sets';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../components/timeline';
import {Abs, Body, Kicker, Source, Title} from '../components/ui';
import {C, FONT_TITLE} from '../themes/theme';

// Scene 6 (final): a returns sorting floor. A conveyor runs across the top; eight chutes lead to the possible
// destinations. Each destination lights up when it is named, and a parcel drops down its chute.
// Possible outcomes only: no shares are implied (the narration says so).

type Dest = {l: string[]; seg: number; re: RegExp; frac: number; color: string; icon: React.ReactNode; s: number};
const DESTS: Dest[] = [
  {l: ['Sold', 'as new'], seg: 1, re: /new/, frac: 0.9, color: C.green, icon: <Store />, s: 0.75},
  {l: ['Used /', 'open-box'], seg: 2, re: /used/, frac: 0.55, color: C.orange, icon: <Tag text="−%" />, s: 0.75},
  {l: ['Repaired', ''], seg: 3, re: /repaired/, frac: 0.12, color: C.blue, icon: <Wrench />, s: 0.75},
  {l: ['Liquidated', 'in bulk'], seg: 3, re: /bulk/, frac: 0.45, color: C.orange, icon: <Pallet />, s: 0.75},
  {l: ['Back to', 'the seller'], seg: 5, re: /seller/, frac: 0.35, color: C.blue, icon: <Truck />, s: 0.6},
  {l: ['Donated', ''], seg: 5, re: /donated/, frac: 0.6, color: C.green, icon: <Heart />, s: 0.7},
  {l: ['Recycled', ''], seg: 5, re: /recycled/, frac: 0.85, color: C.green, icon: <Recycle />, s: 0.8},
  {l: ['Destroyed', ''], seg: 7, re: /destroyed/, frac: 0.1, color: C.red, icon: <Bin />, s: 0.75},
];
const BELT_Y = 420;
const bayX = (i: number) => 170 + i * 226;
const BAY_Y = 628;

const FactPanel: React.FC<{o: number; accent: string; children: React.ReactNode}> = ({o, accent, children}) => (
  <div style={{position: 'absolute', left: 240, right: 240, top: 176, opacity: o, transform: `translateY(${-20 * (1 - o)}px)`}}>
    <div style={{background: 'rgba(14,17,20,0.94)', border: `3px solid ${accent}`, borderRadius: 26, padding: '22px 40px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)'}}>{children}</div>
  </div>
);

export const S06Destinations: React.FC = () => {
  const b = useBeats();
  const {frame, fps} = b;
  const segIdx = Math.max(0, b.ctx.segStart.filter((s) => s <= frame).length - 1);
  const fDest = DESTS.map((d) => b.word(d.seg, d.re, d.frac));
  const fact = [4, 6, 7, 8].includes(segIdx);
  const beltO = 1 - 0.55 * Math.max(b.during(4, 4), b.during(6, 8));

  return (
    <SceneShell drift={[0, 0]} zoom={0.012}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {/* main belt with returns arriving from the inspection station */}
        <g opacity={beltO}>
          <Conveyor y={BELT_Y} t={frame / fps} speed={220} gap={230} scale={0.42} />
          <Place x={140 + Math.sin(frame / 14) * 20} y={BELT_Y - 150} s={0.6} o={b.during(0, 0)}>
            <Magnifier />
          </Place>
        </g>
        {/* bays */}
        {DESTS.map((d, i) => {
          const x = bayX(i);
          const on = b.rampAt(fDest[i], 0.4);
          const isNew = frame >= fDest[i] && frame < fDest[i] + 3 * fps;
          const drop = interpolate(frame - fDest[i] + 14, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <g key={i}>
              {/* chute */}
              <path d={`M${x - 40} ${BELT_Y + 30} L${x - 50} ${BAY_Y - 110} M${x + 40} ${BELT_Y + 30} L${x + 50} ${BAY_Y - 110}`} stroke={on > 0 ? d.color : C.line} strokeWidth={5} opacity={0.4 + 0.6 * on} />
              {/* bay */}
              <rect x={x - 100} y={BAY_Y - 110} width={200} height={190} rx={18} fill={isNew ? 'rgba(245,158,11,0.10)' : 'rgba(29,34,41,0.75)'} stroke={on > 0 ? d.color : C.line} strokeWidth={on > 0 ? 6 : 3} />
              <Place x={x} y={BAY_Y - 15} s={d.s * (0.6 + 0.4 * b.popAt(fDest[i]))} o={0.15 + 0.85 * on}>
                {d.icon}
              </Place>
              {d.l.map((l, k) => (
                <text key={k} x={x} y={BAY_Y + 130 + k * 40} textAnchor="middle" fill={on > 0 ? d.color : C.muted} opacity={0.3 + 0.7 * on} fontSize={36} fontWeight={700} fontFamily="Space Grotesk">
                  {l}
                </text>
              ))}
              {/* parcel dropping down the chute */}
              {drop > 0 && drop < 1 && (
                <Place x={x} y={interpolate(drop, [0, 1], [BELT_Y - 30, BAY_Y - 40])} s={0.4}>
                  <Box />
                </Place>
              )}
            </g>
          );
        })}
      </svg>

      {/* question */}
      <Abs x={0} y={140} w={1920} align="center" o={b.during(0, 0)}>
        <Title size={72}>Where does it actually go?</Title>
        <Body size={34} color={C.muted} style={{marginTop: 10}}>
          Possible outcomes. Shares vary by retailer and product.
        </Body>
      </Abs>

      {/* facts in the top band */}
      <FactPanel o={b.during(4, 4)} accent={C.orange}>
        <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 150, color: C.orange, lineHeight: 1}}>$800B+</div>
          <div>
            <Body size={38} weight={600}>
              of returned <i>and excess</i> inventory moves through secondary-market channels each year
            </Body>
            <Body size={26} color={C.muted} style={{marginTop: 8}}>
              Rogers et al., Journal of Business Logistics (2025) · U.S. context
            </Body>
          </div>
        </div>
      </FactPanel>
      <FactPanel o={b.during(6, 6)} accent={C.blue}>
        <Kicker color={C.blue}>One company’s own account</Kicker>
        <Title size={56} style={{marginTop: 8}}>
          Amazon says the vast majority of its returns are resold as new or used
        </Title>
        <Body size={30} color={C.muted} style={{marginTop: 8}}>
          Items it can’t resell may be donated or recycled · company statement, not an audit · not industry-wide
        </Body>
      </FactPanel>
      <FactPanel o={b.during(7, 7)} accent={C.red}>
        <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 128, color: C.red, lineHeight: 1, whiteSpace: 'nowrap', opacity: b.rampAt(b.word(7, /22/, 0.6), 0.5)}}>22–43%</div>
          <div>
            <Body size={36} weight={600}>
              of returned clothing bought online in <b>Europe</b> may end up destroyed
            </Body>
            <Body size={26} color={C.muted} style={{marginTop: 8}}>
              European Environment Agency, 2024 · estimate from limited data · not U.S., not all products
            </Body>
          </div>
        </div>
      </FactPanel>
      <FactPanel o={b.during(8, 8)} accent={C.green}>
        <Kicker color={C.green}>European Union · since 19 July 2026</Kicker>
        <Title size={54} style={{marginTop: 8}}>
          Large companies may not destroy unsold clothing, accessories &amp; footwear
        </Title>
        <Body size={30} color={C.muted} style={{marginTop: 8}}>
          with some exceptions (e.g. safety, damage) · Regulation (EU) 2024/1781 (ESPR), Art. 25
        </Body>
      </FactPanel>
      {fact && segIdx === 4 && <Source>Journal of Business Logistics (2025), doi:10.1111/jbl.70014</Source>}
    </SceneShell>
  );
};
