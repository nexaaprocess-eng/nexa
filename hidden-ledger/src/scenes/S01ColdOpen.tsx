import React from 'react';
import {interpolate} from 'remotion';
import {Box, Calendar, House, Jacket, Magnifier, Phone, Place, Scanner, Truck, Warehouse, Gear} from '../components/icons';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../components/timeline';
import {Abs, Body, Chip, DrawPath, Stage, Title} from '../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../themes/theme';

// A jacket bought, returned, and followed backwards. No amounts are shown: the cost meter is qualitative.
export const S01ColdOpen: React.FC = () => {
  const b = useBeats();
  const {frame} = b;

  // beat windows
  const homeO = b.during(0, 3);
  const routeO = b.during(4, 4, 0.5);
  const titleO = b.ramp(5, 0, 0.5);

  // box flight phone -> house during beat 0
  const fly = b.ramp(0, 1.3, 1.2);
  const boxX = interpolate(fly, [0, 1], [560, 1330]);
  const boxY = 520 - Math.sin(fly * Math.PI) * 220 + fly * 120;

  // return: box goes back toward phone side in beat 2
  const back = b.ramp(2, 0.2, 0.6);
  const thu = b.at(1) <= frame;
  const refund = b.pop(2, 1.6);

  // beat 3: everything on the left slides out, route reveals
  const slide = b.ramp(3, 1.0, 1.4);

  // beat 4: route stations + travelling box + cost meter
  const stations = [
    {x: 330, el: <Scanner beam={0.6 + 0.4 * Math.sin(frame / 4)} />, label: 'scanned'},
    {x: 640, el: <Truck wheel={frame * 6} />, label: 'trucked'},
    {x: 950, el: <Warehouse />, label: 'sorted'},
    {x: 1260, el: <Magnifier />, label: 'inspected'},
    {x: 1570, el: <Gear rot={frame * 2} />, label: 'judged'},
  ];
  const route = b.through(4);
  const travel = interpolate(route, [0, 0.9], [0, 1], {extrapolateRight: 'clamp'});
  const travX = 180 + travel * 1450;

  return (
    <SceneShell drift={[-20, 0]}>
      {/* ---------- Part A: purchase and return */}
      <div style={{opacity: homeO, transform: `translateX(${-1400 * slide}px)`, position: 'absolute', inset: 0}}>
        <Stage>
          <Place x={560} y={540} s={1.25}>
            <Phone>
              <g transform="translate(0 -60) scale(0.62)">
                <Jacket />
              </g>
              <text x={0} y={60} textAnchor="middle" fill={C.cream} fontSize={22} fontFamily="Inter" fontWeight={600}>
                Field Jacket
              </text>
              <rect x={-80} y={100} width={160} height={46} rx={23} fill={b.frame > b.at(0, 1.0) ? C.green : C.orange} />
              <text x={0} y={131} textAnchor="middle" fill={C.bg} fontSize={20} fontFamily="Space Grotesk" fontWeight={700}>
                {b.frame > b.at(0, 1.0) ? 'Ordered ✓' : 'Add to cart'}
              </text>
              {/* refund notification */}
              <g opacity={refund} transform={`translate(0 ${-150 + 20 * (1 - refund)})`}>
                <rect x={-100} y={-30} width={200} height={56} rx={12} fill={C.green} />
                <text x={0} y={6} textAnchor="middle" fill={C.bg} fontSize={20} fontFamily="Inter" fontWeight={700}>
                  Refund issued ✓
                </text>
              </g>
            </Phone>
          </Place>
          <Place x={1380} y={600} s={1.3}>
            <House />
          </Place>
          <Place x={1600} y={380} s={0.9 * b.pop(0, 2.2)}>
            <Calendar day={thu ? 'THU' : 'TUE'} accent={thu ? C.orange : C.red} />
          </Place>
          {/* flying / returning box */}
          {fly > 0 && (
            <Place
              x={interpolate(back, [0, 1], [boxX, 1150])}
              y={interpolate(back, [0, 1], [boxY, 690])}
              s={0.75}
              r={(1 - fly) * -20}
            >
              <Box label={back > 0.5 ? 'RETURN' : undefined} />
            </Place>
          )}
        </Stage>
        {/* beat 1: sleeves too short */}
        <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
          <Stage>
            <Place x={960} y={470} s={1.6 * (0.9 + 0.1 * b.pop(1))}>
              <Jacket sleeve={0.35} />
              <line x1={-120} y1={58} x2={-120} y2={110} stroke={C.red} strokeWidth={5} strokeDasharray="8 8" />
              <line x1={120} y1={58} x2={120} y2={110} stroke={C.red} strokeWidth={5} strokeDasharray="8 8" />
            </Place>
          </Stage>
          <Abs x={760} y={720} w={400} align="center" o={b.ramp(1, 0.8)}>
            <Chip bg={C.red} color={C.cream}>
              sleeves too short
            </Chip>
          </Abs>
        </div>
        {/* beat 2: free label chip */}
        <Abs x={1010} y={790} o={b.ramp(2, 0.6) * (1 - slide)}>
          <Chip>FREE RETURN LABEL</Chip>
        </Abs>
        {/* beat 3: your story ends */}
        <Abs x={380} y={860} w={400} align="center" o={b.ramp(3, 0.1)}>
          <Body size={34} color={C.green} weight={700}>
            ✓ Done, for you
          </Body>
        </Abs>
      </div>

      {/* ---------- Part B: the jacket's journey */}
      <div style={{position: 'absolute', inset: 0, opacity: Math.max(routeO, b.has(4) ? slide * (1 - titleO) : 0)}}>
        <Stage>
          <DrawPath d="M120 560 L1760 560" t={Math.max(slide, route)} color={C.line} width={8} />
          <DrawPath d="M120 560 L1760 560" t={travel} color={C.orange} width={8} />
          {stations.map((s, i) => {
            const on = b.ramp(4, 0.15 + i * 0.75, 0.4);
            return (
              <g key={i}>
                <Place x={s.x} y={420} s={0.85 * on} o={on}>
                  {s.el}
                </Place>
                <circle cx={s.x} cy={560} r={14} fill={travX > s.x ? C.orange : C.bg} stroke={C.cream} strokeWidth={4} />
                <text x={s.x} y={630} textAnchor="middle" fill={C.cream} opacity={on} fontSize={34} fontFamily="Space Grotesk" fontWeight={600}>
                  {s.label}
                </text>
              </g>
            );
          })}
          <Place x={travX} y={540} s={0.42}>
            <Box label="RETURN" />
          </Place>
        </Stage>
        {/* qualitative cost meter: bars only, no amounts */}
        <Abs x={640} y={720} w={640} align="center" o={b.ramp(4, 1.5)}>
          <div style={{fontFamily: FONT_TITLE, fontSize: 28, color: C.red, letterSpacing: 4, fontWeight: 700, marginBottom: 12}}>COST TO SOMEBODY</div>
          <div style={{display: 'flex', gap: 10, justifyContent: 'center'}}>
            {Array.from({length: 10}).map((_, i) => (
              <div key={i} style={{width: 44, height: 44, borderRadius: 8, border: `3px solid ${C.red}`, background: i < Math.floor(travel * 10.5) ? C.red : 'transparent'}} />
            ))}
          </div>
          <div style={{fontFamily: FONT_BODY, fontSize: 24, color: C.muted, marginTop: 10}}>amount unknown, for now</div>
        </Abs>
      </div>

      {/* ---------- Part C: the question */}
      <Abs x={0} y={330} w={1920} align="center" o={titleO} s={0.94 + 0.06 * b.pop(5)}>
        <Title size={124}>Who really pays for</Title>
        <div style={{marginTop: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
          <span
            style={{
              fontFamily: FONT_TITLE,
              fontWeight: 700,
              fontSize: 150,
              color: C.bg,
              background: C.orange,
              padding: '0 34px',
              borderRadius: 18,
              transform: `rotate(${-3 * b.pop(5, 0.4)}deg)`,
              display: 'inline-block',
            }}
          >
            FREE
          </span>
          <Title size={124}>returns?</Title>
        </div>
      </Abs>
    </SceneShell>
  );
};
