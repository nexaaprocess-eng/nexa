import React from 'react';
import {Bin, Box, Person, Place, Store, Warehouse} from '../components/icons';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../components/timeline';
import {Abs, Body, LedgerMark, Stage, Title} from '../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../themes/theme';

const PAYERS = [
  {l: 'Retailer', s: 'out of its margin', c: C.orange, icon: <Store />, re: /retailer/},
  {l: 'Seller', s: 'through marketplace fees', c: C.blue, icon: <Warehouse />, re: /seller/},
  {l: 'Shopper', s: 'fees on some methods, possibly prices', c: C.red, icon: <Person />, re: /shopper/},
  {l: 'Lost value', s: 'or waste', c: C.muted, icon: <Bin fill={C.muted} />, re: /lost/},
];

export const S08Payoff: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  const cardsO = b.during(1, 2);
  return (
    <SceneShell drift={[0, 0]} zoom={0.025}>
      {/* beat 0 */}
      <Abs x={0} y={340} w={1920} align="center" o={b.during(0, 0)} s={0.94 + 0.06 * b.pop(0)}>
        <Title size={110}>So, who really pays?</Title>
      </Abs>

      {/* beats 1-2: the four payers + split */}
      <div style={{position: 'absolute', inset: 0, opacity: cardsO}}>
        <Stage>
          <Place x={960} y={260} s={0.75}>
            <Box label="RETURN" />
          </Place>
          {PAYERS.map((p, i) => {
            const x = 300 + i * 440;
            const t = b.rampAt(b.word(1, p.re, 0.15 + i * 0.25), 0.5);
            const flow = b.ramp(2, 0.2 + i * 0.25, 0.8);
            return (
              <g key={p.l}>
                <path d={`M960 330 C 960 420, ${x} 380, ${x} 470`} fill="none" stroke={p.c} strokeWidth={4 + 14 * flow} strokeLinecap="round" opacity={0.25 + 0.75 * Math.max(flow, t * 0.4)} />
                <g opacity={t} transform={`translate(${x} ${620 - 20 * (1 - t)})`}>
                  <rect x={-190} y={-140} width={380} height={300} rx={22} fill={C.panel} stroke={p.c} strokeWidth={4} />
                  <g transform="translate(0 -60) scale(0.5)">{p.icon}</g>
                  <text y={40} textAnchor="middle" fill={C.cream} fontSize={42} fontWeight={700} fontFamily="Space Grotesk">
                    {p.l}
                  </text>
                </g>
              </g>
            );
          })}
        </Stage>
        {PAYERS.map((p, i) => (
          <Abs key={p.l} x={300 + i * 440 - 170} y={690} w={340} align="center" o={b.rampAt(b.word(1, p.re, 0.15 + i * 0.25), 0.5)}>
            <Body size={26} color={C.muted}>
              {p.s}
            </Body>
          </Abs>
        ))}
        <Abs x={0} y={150} w={1920} align="center" o={b.during(2, 2)}>
          <Title size={52}>
            The cost doesn’t disappear. <span style={{color: C.orange}}>Someone decides where it goes.</span>
          </Title>
        </Abs>
      </div>

      {/* beat 3: FREE* */}
      <Abs x={0} y={300} w={1920} align="center" o={b.during(3, 3)}>
        <div style={{display: 'inline-block', position: 'relative'}}>
          <span style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 220, color: C.bg, background: C.orange, padding: '0 50px', borderRadius: 26, display: 'inline-block', transform: `rotate(${-2 * b.pop(3)}deg)`}}>
            FREE
          </span>
          <span style={{position: 'absolute', right: -70, top: -10, fontFamily: FONT_TITLE, fontSize: 140, fontWeight: 700, color: C.orange, opacity: b.ramp(3, 1.2)}}>*</span>
        </div>
        <div style={{fontFamily: FONT_BODY, fontSize: 54, color: C.cream, marginTop: 50, opacity: b.rampAt(b.word(3, /moment/, 0.8, 0) - 20, 0.6)}}>
          <span style={{color: C.orange}}>*</span> for you, at that moment
        </div>
      </Abs>

      {/* beat 4: the viewer question */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <Abs x={0} y={230} w={1920} align="center">
          <Title size={64}>What would you trade for an easier return?</Title>
        </Abs>
        <Abs x={0} y={420} w={1920} align="center">
          <div style={{display: 'flex', gap: 40, justifyContent: 'center'}}>
            {[
              ['A higher price', /price/],
              ['A shorter window', /window/],
              ['A trip to the store', /store/],
            ].map(([l, re], i) => {
              const t = b.rampAt(b.word(4, re as RegExp, 0.5 + i * 0.2), 0.4);
              return (
                <div key={l as string} style={{border: `3px solid ${C.orange}`, borderRadius: 20, padding: '34px 44px', fontFamily: FONT_TITLE, fontSize: 46, fontWeight: 700, color: C.cream, opacity: t, transform: `translateY(${30 * (1 - t)}px)`, background: C.panel}}>
                  {l as string}
                </div>
              );
            })}
          </div>
        </Abs>
        <Abs x={0} y={680} w={1920} align="center" o={b.ramp(4, 4)}>
          <Body size={34} color={C.muted}>
            Tell us in the comments.
          </Body>
        </Abs>
      </div>

      {/* beat 5: end card */}
      <div style={{position: 'absolute', inset: 0, opacity: b.ramp(5, 0, 0.6)}}>
        <Abs x={0} y={250} w={1920} align="center" s={0.95 + 0.05 * b.pop(5)}>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
            <LedgerMark size={110} />
            <div style={{fontFamily: FONT_TITLE, fontSize: 110, fontWeight: 700, color: C.cream, letterSpacing: 2}}>HIDDEN LEDGER</div>
          </div>
          <Body size={40} color={C.muted} style={{marginTop: 20}}>
            The hidden economics of everyday life
          </Body>
        </Abs>
        <Abs x={0} y={560} w={1920} align="center" o={b.ramp(5, 1.4)}>
          <div style={{display: 'inline-block', border: `2px solid ${C.line}`, borderRadius: 16, padding: '22px 36px', fontFamily: FONT_BODY, fontSize: 34, color: C.cream}}>
            Sources for every number → <span style={{color: C.orange, fontWeight: 700}}>in the description</span>
          </div>
        </Abs>
        <Stage>
          <line x1={560} x2={560 + 800 * b.ramp(5, 0.4, 2.5)} y1={720} y2={720} stroke={C.orange} strokeWidth={4} />
          <circle cx={560 + 800 * b.ramp(5, 0.4, 2.5)} cy={720} r={8} fill={C.orange} opacity={(frame % 30) < 20 ? 1 : 0.3} />
        </Stage>
      </div>
    </SceneShell>
  );
};
