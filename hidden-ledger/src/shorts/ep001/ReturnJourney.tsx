import React from 'react';
import {Box, Calendar, Coin, Gear, Jacket, Magnifier, Person, Phone, Place, Scanner, Truck} from '../../components/icons';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';
import {lerp, useClock, VStage, VText} from '../kit';

// Short 1 (s01-01..s01-06): the parcel's return trip is the subject. A jacket is ordered, arrives,
// goes back in its box with a free label, and the box then rides a vertical conveyor past the five
// steps the narration names, each of which picks up a cost.

const Verdict: React.FC<{k: number}> = ({k}) => (
  <g stroke={C.cream} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
    <circle r={78} fill={C.panel} />
    <path d="M0 -78 A78 78 0 0 1 0 78 Z" fill={C.red} opacity={0.25 + 0.75 * k} stroke="none" />
    <path d="M0 -78 A78 78 0 0 0 0 78 Z" fill={C.green} opacity={0.25 + 0.75 * k} stroke="none" />
    <circle r={78} fill="none" />
    <line x1={0} y1={-78} x2={0} y2={78} />
    <path d="M-56 0 L-40 18 L-16 -18" fill="none" strokeWidth={9} />
    <path d="M22 -16 L50 16 M50 -16 L22 16" fill="none" strokeWidth={9} />
  </g>
);

const RAIL_X = 165;
const ROWS = [400, 590, 780, 970, 1160];
const LABELS = ['SCANNED', 'TRUCKED', 'SORTED', 'INSPECTED', 'JUDGED'];

export const ReturnJourney: React.FC = () => {
  const {t, word, ramp, pop, win} = useClock();

  // ---- spoken anchors (same words the mix's SFX are tied to)
  const tOrder = word('s01-01', /^order/);
  const tOnline = word('s01-01', /^online/);
  const tTuesday = word('s01-01', /^Tuesday/);
  const tThursday = word('s01-02', /^Thursday/);
  const tDecided = word('s01-02', /^decided/);
  const tSleeves = word('s01-02', /^sleeves/);
  const tShort = word('s01-02', /^short/);
  const tSend = word('s01-03', /^send/);
  const tFree = word('s01-03', /^free/);
  const tRefund = word('s01-03', /^refund/);
  const tYou = word('s01-04', /^you/);
  const tThere = word('s01-04', /^there/);
  const tJacket = word('s01-04', /^jacket/);
  const steps = [/^scanned/, /^trucked/, /^sorted/, /^inspected/, /^judged/].map((re) => word('s01-05', re));
  const tEvery = word('s01-05', /^every/);
  const tSo = word('s01-06', /^so$/i);
  const tPays = word('s01-06', /^pays/);
  const tFreeQ = word('s01-06', /^free/);

  // ---- phone (order)
  const phoneOut = ramp(tOnline, 0.55);
  const ordered = t >= tOrder + 0.05;
  const tap = ramp(tOrder, 0.45);

  // ---- box: drops in on Tuesday, opens when you decide, closes when you send it back,
  // then shrinks onto the conveyor and rides down it, stopping at each step
  const truckIn = ramp(tOnline + 0.05, 1.5);
  const truckOut = ramp(tTuesday + 0.15, 0.8);
  const land = pop(tTuesday - 0.18, 11);
  const open = ramp(tDecided - 0.2, 0.4) * (1 - ramp(tSend + 0.5, 0.3));
  const toRail = ramp(tJacket - 0.25, 0.8);
  let boxY = t < tTuesday - 0.18 ? -400 : lerp(760, 860, land);
  let boxX = 540;
  let boxS = 2.8;
  boxX = lerp(boxX, RAIL_X, toRail);
  boxY = lerp(boxY, 280, toRail);
  boxS = lerp(boxS, 0.62, toRail);
  steps.forEach((s, i) => {
    boxY = lerp(boxY, ROWS[i], ramp(s - 0.28, 0.3));
  });
  const boxShake = t > tShort && t < tShort + 0.4 ? Math.sin((t - tShort) * 60) * 6 * (1 - (t - tShort) / 0.4) : 0;

  // ---- jacket: rises out of the box, sleeves shrink, goes back in
  const jacketUp = ramp(tDecided, 0.5) * (1 - ramp(tSend + 0.05, 0.45));
  const sleeve = lerp(1, -0.75, ramp(tSleeves, 0.7));
  const tooShort = pop(tShort);

  // ---- calendar TUE -> THU
  const cal = pop(tTuesday) * (1 - ramp(tDecided - 0.1, 0.3));
  const flip = ramp(tThursday, 0.32);
  const day = flip < 0.5 ? 'TUE' : 'THU';

  // ---- label + refund
  const label = pop(tFree - 0.08);
  const refund = pop(tRefund) * (1 - ramp(tJacket - 0.3, 0.4));
  const youCard = ramp(tYou - 0.1, 0.4) * (1 - ramp(tJacket - 0.3, 0.4));
  const youDone = ramp(tThere, 0.4);

  // ---- conveyor + rows
  const rail = ramp(tJacket + 0.5, 0.7);
  const final = ramp(tSo, 0.5);
  const railShift = (t - tJacket) * 90;

  return (
    <>
      <VStage>
        {/* phone ordering the jacket */}
        {phoneOut < 1 && (
          <g transform={`translate(0 ${-1300 * phoneOut})`} opacity={1 - phoneOut}>
            <Place x={540} y={700} s={2.2}>
              <Phone>
                <Place x={0} y={-62} s={0.82}>
                  <Jacket />
                </Place>
                <text x={0} y={48} textAnchor="middle" fontFamily={FONT_TITLE} fontWeight={700} fontSize={24} fill={C.cream}>
                  Field Jacket
                </text>
                <rect x={-78} y={70} width={156} height={44} rx={22} fill={ordered ? C.green : C.orange} />
                <text x={0} y={100} textAnchor="middle" fontFamily={FONT_TITLE} fontWeight={700} fontSize={22} fill={C.bg}>
                  {ordered ? 'Ordered ✓' : 'Order now'}
                </text>
                <text x={0} y={150} textAnchor="middle" fontFamily={FONT_BODY} fontWeight={700} fontSize={14} letterSpacing={1.5} fill={C.green}>
                  FREE RETURNS
                </text>
                {tap > 0 && tap < 1 && <circle cx={0} cy={92} r={20 + 70 * tap} fill="none" stroke={C.cream} strokeWidth={4} opacity={1 - tap} />}
              </Phone>
            </Place>
          </g>
        )}

        {/* delivery truck */}
        {truckIn > 0 && truckOut < 1 && (
          <Place x={lerp(-340, 540, truckIn) + 1000 * truckOut} y={900} s={2.4}>
            <Truck wheel={(t - tOnline) * 500} />
          </Place>
        )}

        {/* calendar */}
        {cal > 0.01 && (
          <g transform={`translate(830 360) scale(${1.25 * cal} ${1.25 * cal * Math.max(0.05, Math.abs(Math.cos(flip * Math.PI)))})`}>
            <Calendar day={day} />
          </g>
        )}

        {/* conveyor rail */}
        {rail > 0 && (
          <g opacity={rail * (1 - 0.7 * final)}>
            <rect x={RAIL_X - 62} y={300} width={124} height={(1240 - 300) * rail} rx={16} fill={C.panel} stroke={C.line} strokeWidth={4} />
            {Array.from({length: 22}).map((_, i) => {
              const y = 320 + ((i * 46 + railShift) % (46 * 22));
              return y < 300 + (1240 - 300) * rail - 10 ? <line key={i} x1={RAIL_X - 50} x2={RAIL_X + 50} y1={y} y2={y} stroke={C.line} strokeWidth={6} /> : null;
            })}
          </g>
        )}

        {/* empty slots for the steps still to come */}
        {rail > 0 &&
          ROWS.map((y, i) => (
            <rect key={i} x={262} y={y - 70} width={640} height={140} rx={22} fill="none" stroke={C.line} strokeWidth={4} strokeDasharray="18 14" opacity={rail * (1 - pop(steps[i] - 0.1)) * 0.9} />
          ))}

        {/* the five steps */}
        {steps.map((s, i) => {
          const k = pop(s - 0.1);
          if (k <= 0.001) return null;
          const y = ROWS[i];
          const active = win(s - 0.1, (steps[i + 1] ?? tEvery) + 0.2, 0.15);
          const cost = pop(tEvery + i * 0.28);
          const iconX = 350;
          const kk = Math.min(1, k);
          return (
            <g key={i} opacity={kk * (1 - 0.75 * final)}>
              <g transform={`translate(${iconX} ${y}) scale(${0.82 * k})`}>
                {i === 0 && <Scanner beam={active} />}
                {i === 1 && <Truck wheel={(t - s) * 400} />}
                {i === 2 && <Gear rot={(t - s) * 160} />}
                {i === 3 && (
                  <g transform={`rotate(${Math.sin((t - s) * 7) * 10 * active})`}>
                    <Magnifier />
                  </g>
                )}
                {i === 4 && <Verdict k={active} />}
              </g>
              <text x={470 + 60 * (1 - kk)} y={y + 22} fontFamily={FONT_TITLE} fontWeight={700} fontSize={64} letterSpacing={1} fill={active > 0.5 ? C.orange : C.cream}>
                {LABELS[i]}
              </text>
              {cost > 0.001 && (
                <Place x={895} y={y} s={0.82 * cost}>
                  <Coin fill={C.red} />
                </Place>
              )}
            </g>
          );
        })}

        {/* the box (with the free label once it is going back) */}
        <g transform={`translate(${boxX + boxShake} ${boxY}) scale(${boxS})`} opacity={1 - 0.6 * final}>
          {jacketUp > 0.01 && (
            <g transform={`translate(0 ${lerp(30, -150, jacketUp)}) scale(${lerp(0.3, 1, jacketUp)})`} opacity={Math.min(1, jacketUp * 3)}>
              <Jacket sleeve={sleeve} />
            </g>
          )}
          <Box open={open} />
          {label > 0.001 && (
            <g transform={`translate(0 16) rotate(${-5 * (1 - label)}) scale(${lerp(1.8, 1, Math.min(1, label))})`} opacity={Math.min(1, label * 2)}>
              <rect x={-66} y={-44} width={132} height={96} rx={6} fill={C.cream} stroke={C.bg} strokeWidth={3} />
              <rect x={-66} y={-44} width={132} height={22} rx={5} fill={C.orange} />
              <text x={0} y={-27} textAnchor="middle" fontFamily={FONT_TITLE} fontWeight={700} fontSize={13} fill={C.bg}>
                RETURN LABEL
              </text>
              {Array.from({length: 16}).map((_, i) => (
                <rect key={i} x={-54 + i * 6.8} y={-14} width={i % 3 === 0 ? 4 : 2} height={26} fill={C.bg} />
              ))}
              <text x={0} y={40} textAnchor="middle" fontFamily={FONT_TITLE} fontWeight={700} fontSize={24} fill={C.green}>
                FREE
              </text>
            </g>
          )}
        </g>

        {/* sleeves too short */}
        {tooShort > 0.01 && jacketUp > 0.5 && (
          <g opacity={Math.min(1, tooShort)}>
            <line x1={905} x2={905} y1={boxY - 420} y2={boxY - 420 + 230} stroke={C.red} strokeWidth={8} strokeDasharray="14 10" />
            <g transform={`translate(540 ${boxY + 260}) scale(${Math.min(1.1, tooShort)})`}>
              <text textAnchor="middle" fontFamily={FONT_TITLE} fontWeight={700} fontSize={72} fill={C.red}>
                TOO SHORT
              </text>
            </g>
          </g>
        )}

        {/* you: refunded, story over */}
        {youCard > 0.01 && (
          <g opacity={youCard * (1 - 0.55 * youDone)}>
            <Place x={250} y={540} s={1.5}>
              <Person />
            </Place>
            <circle cx={320} cy={500} r={34} fill={C.green} stroke={C.cream} strokeWidth={5} />
            <path d="M304 500 L316 513 L337 488" fill="none" stroke={C.cream} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            <text x={400} y={520} fontFamily={FONT_TITLE} fontWeight={700} fontSize={60} fill={C.cream}>
              YOU: DONE
            </text>
          </g>
        )}
      </VStage>

      {/* refund notification */}
      {refund > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 90,
            width: 900,
            top: lerp(-220, 220, Math.min(1, refund)),
            background: C.cream,
            borderRadius: 34,
            padding: '26px 34px',
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{width: 84, height: 84, borderRadius: 42, background: C.green, color: C.cream, fontSize: 56, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_TITLE}}>✓</div>
          <div style={{fontFamily: FONT_TITLE, color: C.bg}}>
            <div style={{fontSize: 52, fontWeight: 700, lineHeight: 1.05}}>Refund issued</div>
            <div style={{fontSize: 32, fontFamily: FONT_BODY, color: '#4A4F57'}}>a few days later</div>
          </div>
        </div>
      )}

      {/* the jacket's side of the story */}
      <VText y={190} size={52} color={C.orange} o={ramp(tJacket - 0.1, 0.4) * (1 - ramp(tSo, 0.4))}>
        THE JACKET'S TRIP IS JUST STARTING
      </VText>

      {/* closing question */}
      {final > 0 && (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 360, height: 720, background: `rgba(17,20,24,${0.85 * final})`}} />
          <VText y={400} size={200} s={lerp(0.6, 1, Math.min(1, pop(tPays)))} o={Math.min(1, pop(tPays) * 2)}>
            WHO
            <br />
            PAYS
          </VText>
          <VText y={860} size={88} o={ramp(tPays + 0.4, 0.4)}>
            for a <span style={{color: C.orange}}>FREE</span>
          </VText>
          <VText y={965} size={88} o={ramp(tFreeQ - 0.25, 0.4)}>
            return?
          </VText>
        </>
      )}
    </>
  );
};
