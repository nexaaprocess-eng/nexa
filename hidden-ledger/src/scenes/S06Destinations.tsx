import React from 'react';
import {Bin, Box, Heart, Jacket, Magnifier, Pallet, Place, Recycle, Store, Tag, Wrench} from '../components/icons';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../components/timeline';
import {Abs, Body, Card, Kicker, Source, Stage, Title} from '../components/ui';
import {C, FONT_TITLE} from '../themes/theme';

type Dest = {l: string; beat: number; off: number; col: 0 | 1; row: number; color: string; icon: React.ReactNode};
const DESTS: Dest[] = [
  {l: 'Sold as new', beat: 1, off: 0.3, col: 0, row: 0, color: C.green, icon: <Store />},
  {l: 'Used / open-box', beat: 2, off: 0.3, col: 0, row: 1, color: C.orange, icon: <Tag text="−%" />},
  {l: 'Repaired first', beat: 3, off: 0.2, col: 0, row: 2, color: C.blue, icon: <Wrench />},
  {l: 'Liquidated in bulk', beat: 3, off: 1.6, col: 0, row: 3, color: C.orange, icon: <Pallet />},
  {l: 'Back to the seller', beat: 5, off: 0.3, col: 1, row: 0, color: C.blue, icon: <Box />},
  {l: 'Donated', beat: 5, off: 1.4, col: 1, row: 1, color: C.green, icon: <Heart />},
  {l: 'Recycled', beat: 5, off: 2.2, col: 1, row: 2, color: C.green, icon: <Recycle />},
  {l: 'Destroyed', beat: 7, off: 0.2, col: 1, row: 3, color: C.red, icon: <Bin />},
];
const ROOT = {x: 250, y: 540};
const colX = [540, 880];
const rowY = (r: number) => 300 + r * 150;

export const S06Destinations: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  const segIdx = Math.max(0, b.ctx.segStart.filter((s) => s <= frame).length - 1);
  const newest = [...DESTS].reverse().find((d) => d.beat === segIdx);
  const cardBeat = [4, 6, 7, 8].includes(segIdx);

  return (
    <SceneShell drift={[0, -6]} zoom={0.02}>
      <Stage>
        {/* root: inspected jacket */}
        <Place x={ROOT.x} y={ROOT.y} s={0.95 * b.pop(0, 0.1)}>
          <Jacket />
        </Place>
        <Place x={ROOT.x + 70 + Math.sin(frame / 16) * 20} y={ROOT.y - 50} s={0.55} o={b.during(0, 0)}>
          <Magnifier />
        </Place>
        {DESTS.map((d) => {
          const t = b.ramp(d.beat, d.off, 0.6);
          if (t <= 0) return null;
          const x = colX[d.col];
          const y = rowY(d.row);
          const fromX = ROOT.x + 110;
          const P: [number, number][] =
            d.col === 0
              ? [[fromX, ROOT.y], [fromX + 100, ROOT.y], [x - 120, y], [x - 30, y]]
              : [[fromX, ROOT.y], [ROOT.x + 240, 200], [x - 140, y - 60], [x - 30, y]];
          const path = `M${P[0][0]} ${P[0][1]} C ${P[1][0]} ${P[1][1]}, ${P[2][0]} ${P[2][1]}, ${P[3][0]} ${P[3][1]}`;
          // a parcel physically travels each new branch (cubic Bézier position)
          const u = b.ramp(d.beat, d.off, 1.1);
          const bez = (k: 0 | 1) => (1 - u) ** 3 * P[0][k] + 3 * (1 - u) ** 2 * u * P[1][k] + 3 * (1 - u) * u ** 2 * P[2][k] + u ** 3 * P[3][k];
          return (
            <g key={d.l} opacity={cardBeat && segIdx !== 7 ? 0.55 : 1}>
              <path d={path} fill="none" stroke={d.color} strokeWidth={5} strokeDasharray="2000" strokeDashoffset={2000 * (1 - t)} opacity={0.7} />
              {u > 0 && u < 1 && (
                <Place x={bez(0)} y={bez(1)} s={0.28}>
                  <Box />
                </Place>
              )}
              <g opacity={t} transform={`translate(${x} ${y})`}>
                <rect x={-30} y={-48} width={310} height={96} rx={16} fill={C.panel} stroke={d.color} strokeWidth={4} />
                <g transform="translate(18 0) scale(0.3)">{d.icon}</g>
                <text x={58} y={10} fill={C.cream} fontSize={26} fontWeight={700} fontFamily="Space Grotesk">
                  {d.l}
                </text>
              </g>
            </g>
          );
        })}
        {/* right panel: big icon of the newest destination when no fact card is shown */}
        {newest && !cardBeat && (
          <Place x={1480} y={540} s={1.6 * b.pop(newest.beat, newest.off)}>
            {newest.icon}
          </Place>
        )}
      </Stage>
      {newest && !cardBeat && (
        <Abs x={1180} y={760} w={600} align="center" o={b.ramp(newest.beat, newest.off + 0.2)}>
          <Title size={50} color={newest.color}>
            {newest.l}
          </Title>
        </Abs>
      )}
      <Abs x={1180} y={360} w={620} o={b.during(0, 0)}>
        <Title size={64}>Where does it actually go?</Title>
        <Body size={30} color={C.muted} style={{marginTop: 16}}>
          Possible outcomes. Shares vary by retailer and product.
        </Body>
      </Abs>

      {/* beat 4: secondary markets */}
      <Abs x={1230} y={250} w={620} o={b.during(4, 4)}>
        <Card w={620} accent={C.orange}>
          <Kicker>Secondary markets</Kicker>
          <Title size={150} color={C.orange} style={{marginTop: 8}}>
            $800B+
          </Title>
          <Body size={32} style={{marginTop: 8}}>
            of returned <i>and excess</i> inventory passes through secondary-market channels each year
          </Body>
          <Body size={22} color={C.muted} style={{marginTop: 16}}>
            Rogers et al., “Unveiling the Structure of Reverse Supply Networks,” Journal of Business Logistics, 2025 (U.S. context)
          </Body>
        </Card>
      </Abs>

      {/* beat 6: Amazon's own account */}
      <Abs x={1230} y={250} w={620} o={b.during(6, 6)}>
        <Card w={620} accent={C.blue}>
          <Kicker color={C.blue}>One company’s own account</Kicker>
          <Title size={48} style={{marginTop: 12}}>
            Amazon says the vast majority of its returns are resold as new or used
          </Title>
          <Body size={30} color={C.cream} style={{marginTop: 14}}>
            Items it can’t resell may be donated or recycled.
          </Body>
          <Body size={24} color={C.muted} style={{marginTop: 16}}>
            Source: aboutamazon.com, “What happens to Amazon returns” · company statement, not an independent audit · not industry-wide
          </Body>
        </Card>
      </Abs>

      {/* beat 7: destruction estimate (EEA) */}
      <Abs x={1230} y={230} w={620} o={b.during(7, 7)}>
        <Card w={620} accent={C.red}>
          <Kicker color={C.red}>Europe · online clothing returns</Kicker>
          <Title size={44} style={{marginTop: 10}}>
            Share estimated to end up destroyed
          </Title>
          <div style={{position: 'relative', height: 70, marginTop: 30, background: C.bg2, borderRadius: 10, border: `2px solid ${C.line}`}}>
            <div
              style={{
                position: 'absolute',
                left: '22%',
                width: `${21 * b.rampAt(b.word(7, /43/, 0.75), 0.8)}%`,
                top: 0,
                bottom: 0,
                background: `repeating-linear-gradient(45deg, ${C.red}, ${C.red} 12px, #B84444 12px, #B84444 24px)`,
                borderRadius: 8,
              }}
            />
          </div>
          <div style={{position: 'relative', height: 50, fontFamily: FONT_TITLE, fontSize: 36, fontWeight: 700, color: C.cream}}>
            <span style={{position: 'absolute', left: '17%', top: 8}}>22%</span>
            <span style={{position: 'absolute', left: '39%', top: 8}}>43%</span>
            <span style={{position: 'absolute', right: 0, top: 8, fontSize: 22, color: C.muted}}>100%</span>
          </div>
          <Body size={24} color={C.muted} style={{marginTop: 18}}>
            European Environment Agency briefing, Mar 2024 · estimate based on limited data · not U.S., not all products
          </Body>
        </Card>
      </Abs>

      {/* beat 8: EU rule */}
      <Abs x={1230} y={260} w={620} o={b.during(8, 8)}>
        <Card w={620} accent={C.green}>
          <Kicker color={C.green}>European Union · since 19 July 2026</Kicker>
          <Title size={50} style={{marginTop: 12}}>
            Large companies may not destroy unsold clothing, accessories & footwear
          </Title>
          <Body size={30} style={{marginTop: 14}}>
            with some exceptions (e.g. safety, damage)
          </Body>
          <Body size={22} color={C.muted} style={{marginTop: 16}}>
            Ecodesign for Sustainable Products Regulation (EU) 2024/1781, Art. 25 · European Commission, Feb 2026
          </Body>
        </Card>
      </Abs>
      {segIdx === 4 && <Source>Journal of Business Logistics (2025), doi:10.1111/jbl.70014</Source>}
    </SceneShell>
  );
};
