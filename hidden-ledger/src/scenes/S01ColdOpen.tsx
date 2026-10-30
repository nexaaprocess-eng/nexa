import React from 'react';
import {interpolate} from 'remotion';
import {Box, Gear, Jacket, Magnifier, Phone, Place, Scanner, Truck, Warehouse} from '../components/icons';
import {Conveyor, StreetSet, WarehouseSet, rnd} from '../components/sets';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../components/timeline';
import {Abs, Stage} from '../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../themes/theme';

// Cold open v2: a fast, word-synced hook. Everything is keyed to ASR word anchors of the existing narration.
// The only figure shown ($849.9B) is sourced (NRF 2025, claim C03) and labelled as a projection.

/** Decaying shake after an impact frame. */
const shake = (frame: number, f0: number, amp = 14) => {
  const d = frame - f0;
  if (d < 0 || d > 14) return [0, 0];
  const k = Math.exp(-d / 4);
  return [Math.sin(d * 2.7) * amp * k, Math.cos(d * 3.3) * amp * 0.6 * k];
};

const Stamp: React.FC<{text: string; t: number; color: string; rot?: number; size?: number}> = ({text, t, color, rot = -8, size = 120}) => (
  <div
    style={{
      display: 'inline-block',
      fontFamily: FONT_TITLE,
      fontWeight: 700,
      fontSize: size,
      color,
      border: `10px solid ${color}`,
      borderRadius: 18,
      padding: '4px 30px',
      letterSpacing: 2,
      transform: `rotate(${rot}deg) scale(${interpolate(t, [0, 1], [2.4, 1])})`,
      opacity: Math.min(1, t * 3),
      background: 'rgba(17,20,24,0.55)',
    }}
  >
    {text}
  </div>
);

export const S01ColdOpen: React.FC = () => {
  const b = useBeats();
  const {frame, fps} = b;

  // ---- anchors (scene-local frames)
  const fBuy = b.word(0, /order/, 0.1);
  const fOnline = b.word(0, /online/, 0.3);
  const fTue = b.word(0, /Tuesday/, 0.8);
  const fThu = b.word(1, /Thursday/, 0.1);
  const fShort = b.word(1, /short/, 0.85);
  const fBack = b.word(2, /back/, 0.15);
  const fFree = b.word(2, /free/, 0.35);
  const fRefund = b.word(2, /refund/, 0.6);
  const fJacket = b.word(3, /jacket/, 0.6);
  const fTitle = b.at(5);

  // ---- phase A: phone close-up then zoom-through into the street
  const tap = b.rampAt(fBuy, 0.35);
  const through = b.rampAt(fOnline, 0.55);
  const phoneO = 1 - through;
  const phoneS = 1.75 + 5 * through * through;

  // truck arrives (decelerating scroll), drops the parcel, leaves later
  const arrive = b.rampAt(fOnline, 1.4);
  const leave = b.rampAt(fRefund + 16, 1.2); // truck leaves after the refund toast
  const scroll = 2200 * (1 - Math.pow(1 - arrive, 3)) + 1800 * leave * leave + frame * 0.6;
  const truckX = interpolate(arrive, [0, 1], [2400, 1430]) - 1900 * leave * leave;
  const drop = b.rampAt(fTue - 8, 0.45);
  const dropY = interpolate(drop, [0, 1], [560, 690]);
  const bounce = Math.max(0, Math.sin(Math.min(1, (frame - (fTue + 5)) / 9) * Math.PI)) * 18 * (frame > fTue + 5 ? 1 : 0);

  // ---- phase B: open box, jacket rises, TOO SHORT stamp
  const openT = b.rampAt(fThu + 6, 0.5);
  const rise = b.rampAt(fThu + 12, 0.6);
  const stampShort = b.rampAt(fShort, 0.25);
  const repack = b.rampAt(fBack - 6, 0.5);
  const stampFree = b.rampAt(fFree, 0.25);
  const pickup = b.rampAt(fRefund + 6, 0.4); // parcel hops into the truck (FREE RETURN stamp stays ~1.4 s)
  const refundT = b.popAt(fRefund);

  // ---- phase D: "for you it ends" -> whip pan to the warehouse + teaser figure
  const doneT = b.ramp(3, 0.0, 0.4);
  const whip = b.rampAt(fJacket - 6, 0.45);
  const teaser = b.rampAt(fJacket + 8, 0.6);
  const journey = b.during(4, 4, 0.3);
  const streetO = (1 - whip) * (frame < b.at(3) + 1 ? 1 : 1);

  const [sx, sy] = (() => {
    const a = shake(frame, fTue + 5, 10);
    const c = shake(frame, fShort, 18);
    const d = shake(frame, fFree, 18);
    return [a[0] + c[0] + d[0], a[1] + c[1] + d[1]];
  })();

  // background giant word
  const dayFlip = b.rampAt(fThu, 0.35);
  const dayO = b.rampAt(fTue - 6, 0.4) * (1 - repack);

  // ---- phase E: conveyor journey
  const jT = Math.max(0, frame - b.at(4)) / fps;
  const stations = [
    {x: 260, el: <Scanner beam={0.6 + 0.4 * Math.sin(frame / 4)} />, label: 'SCANNED', re: /scanned/},
    {x: 610, el: <Truck wheel={frame * 6} />, label: 'TRUCKED', re: /trucked/},
    {x: 960, el: <Warehouse />, label: 'SORTED', re: /sorted/},
    {x: 1310, el: <Magnifier />, label: 'INSPECTED', re: /inspected/},
    {x: 1660, el: <Gear rot={frame * 2} />, label: 'JUDGED', re: /judged/},
  ];
  const costFill = b.rampAt(b.word(4, /costs/, 0.7), 1.2);

  return (
    <SceneShell drift={[0, 0]} zoom={0} beatCamera={false}>
      {/* ================= street world (phases A–C) */}
      <div style={{position: 'absolute', inset: 0, opacity: streetO * (frame < b.at(4) ? 1 : 0), transform: `translate(${sx - 1900 * whip * whip}px, ${sy}px)`}}>
        <Stage>
          <StreetSet scroll={scroll} />
        </Stage>
        {/* giant day word behind the action */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: dayO, overflow: 'hidden', height: 300}}>
          <div style={{transform: `translateY(${-300 * dayFlip}px)`}}>
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 250, lineHeight: '300px', color: 'rgba(243,235,221,0.13)', letterSpacing: 10}}>TUESDAY</div>
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 250, lineHeight: '300px', color: 'rgba(245,158,11,0.32)', letterSpacing: 10}}>THURSDAY</div>
          </div>
        </div>
        <Stage>
          {/* truck */}
          <Place x={truckX} y={770} s={2.3}>
            <Truck wheel={scroll} />
          </Place>
          {/* speed lines while the truck moves fast */}
          {(arrive < 0.95 || leave > 0.05) &&
            Array.from({length: 6}).map((_, i) => (
              <rect key={i} x={truckX + 280 + rnd(i) * 200} y={640 + i * 26} width={120 + rnd(i + 3) * 160} height={5} rx={3} fill="rgba(243,235,221,0.25)" opacity={1 - arrive + leave} />
            ))}
          {/* parcel on the doorstep (drops, opens, re-packs, hops in the truck) */}
          {drop > 0 && pickup < 1 && (
            <Place
              x={interpolate(pickup, [0, 1], [760, truckX - 60])}
              y={dropY - bounce - Math.sin(pickup * Math.PI) * 160}
              s={1.15 * (1 - 0.5 * pickup)}
            >
              <Box open={openT * (1 - repack)} label={repack > 0.5 ? 'RETURN' : undefined} />
            </Place>
          )}
          {/* jacket rising out of the box */}
          {rise > 0 && repack < 1 && (
            <Place x={760} y={interpolate(rise, [0, 1], [680, 420]) + 240 * repack} s={interpolate(rise, [0, 1], [0.4, 1.7]) * (1 - 0.7 * repack)} o={1 - repack}>
              <Jacket sleeve={0.35} />
              <line x1={-120} y1={58} x2={-120} y2={110} stroke={C.red} strokeWidth={5} strokeDasharray="8 8" opacity={stampShort} />
              <line x1={120} y1={58} x2={120} y2={110} stroke={C.red} strokeWidth={5} strokeDasharray="8 8" opacity={stampShort} />
            </Place>
          )}
        </Stage>
        {/* stamps */}
        <Abs x={1080} y={340} o={stampShort * (1 - repack)}>
          <Stamp text="TOO SHORT" t={stampShort} color={C.red} rot={-8} size={96} />
        </Abs>
        <Abs x={500} y={330} o={stampFree * (1 - pickup)}>
          <Stamp text="FREE RETURN" t={stampFree} color={C.orange} rot={-6} size={110} />
        </Abs>
        {/* refund toast */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 130 + 40 * (1 - refundT), display: 'flex', justifyContent: 'center', opacity: refundT * (1 - doneT)}}>
          <div style={{background: C.green, color: C.bg, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64, padding: '18px 44px', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.45)'}}>
            ✓ Refund issued
          </div>
        </div>
        {/* "done, for you" */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: doneT}}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 120, color: C.green}}>DONE.</div>
          <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 48, color: C.cream, marginTop: 6}}>…for you.</div>
        </div>
      </div>

      {/* ================= phase A: phone close-up */}
      {phoneO > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: phoneO, background: `rgba(17,20,24,${phoneO})`}}>
          <Stage>
            <Place x={960} y={545} s={phoneS}>
              <Phone>
                <g transform="translate(0 -70) scale(0.7)">
                  <Jacket />
                </g>
                <text x={0} y={52} textAnchor="middle" fill={C.cream} fontSize={22} fontFamily="Inter" fontWeight={700}>
                  Field Jacket
                </text>
                <rect x={-84} y={84} width={168} height={50} rx={25} fill={tap > 0.5 ? C.green : C.orange} />
                <text x={0} y={117} textAnchor="middle" fill={C.bg} fontSize={22} fontFamily="Space Grotesk" fontWeight={700}>
                  {tap > 0.5 ? 'Ordered ✓' : 'Buy now'}
                </text>
                {/* tap ripple */}
                <circle cx={0} cy={109} r={10 + 60 * tap} fill="none" stroke={C.cream} strokeWidth={3} opacity={(1 - tap) * (tap > 0 ? 1 : 0)} />
                <text x={0} y={170} textAnchor="middle" fill={C.green} fontSize={15} fontFamily="Inter" fontWeight={700}>
                  FREE RETURNS
                </text>
              </Phone>
            </Place>
          </Stage>
        </div>
      )}

      {/* ================= the central question, on screen from 0:00 until the refund toast */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 118, display: 'flex', justifyContent: 'center', opacity: b.ramp(0, -0.6, 0.4) * (1 - b.rampAt(fRefund - 8, 0.3))}}>
        <div style={{background: 'rgba(14,17,20,0.88)', border: `3px solid ${C.orange}`, borderRadius: 18, padding: '8px 30px', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 46, color: C.cream, letterSpacing: 1}}>
          WHO PAYS FOR A <span style={{color: C.orange}}>FREE</span> RETURN?
        </div>
      </div>

      {/* ================= phase D: whip pan into a warehouse + teaser */}
      <div style={{position: 'absolute', inset: 0, opacity: whip * (1 - journey) * (frame < b.at(4) + 15 ? 1 : 0), transform: `translateX(${1900 * (1 - whip)}px)`}}>
        <Stage>
          <WarehouseSet t={frame / fps} />
          <Conveyor y={860} t={frame / fps} speed={420} gap={150} scale={0.38} />
        </Stage>
        <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', opacity: teaser, transform: `scale(${0.85 + 0.15 * teaser})`}}>
          <div style={{display: 'inline-block', background: 'rgba(14,17,20,0.82)', borderRadius: 30, padding: '26px 60px 34px'}}>
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 210, color: C.orange, letterSpacing: -6, lineHeight: 1}}>$849.9B</div>
            <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 46, color: C.cream, marginTop: 10}}>of merchandise returned in the U.S.</div>
            <div style={{fontFamily: FONT_BODY, fontSize: 30, color: C.muted, marginTop: 8}}>2025 projection · NRF & Happy Returns</div>
          </div>
        </div>
      </div>

      {/* ================= phase E: the journey on a conveyor */}
      <div style={{position: 'absolute', inset: 0, opacity: journey}}>
        <Stage>
          <Conveyor y={720} t={jT} speed={240} gap={240} scale={0.5} flag={() => false} />
          {stations.map((s, i) => {
            const f0 = b.word(4, s.re, 0.08 + i * 0.1);
            const on = b.popAt(f0);
            const active = frame >= f0 && (i === stations.length - 1 || frame < b.word(4, stations[i + 1].re, 0.18 + i * 0.1));
            return (
              <g key={s.label}>
                <Place x={s.x} y={400} s={(active ? 1.45 : 1.05) * on} o={on}>
                  {s.el}
                </Place>
                <text x={s.x} y={610} textAnchor="middle" fill={active ? C.orange : C.cream} opacity={on} fontSize={50} fontFamily="Space Grotesk" fontWeight={700}>
                  {s.label}
                </text>
              </g>
            );
          })}
        </Stage>
        <Abs x={460} y={150} w={1000} align="center" o={b.ramp(4, 3.5)}>
          <div style={{fontFamily: FONT_TITLE, fontSize: 40, color: C.red, letterSpacing: 6, fontWeight: 700, marginBottom: 14}}>COST TO SOMEBODY</div>
          <div style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
            {Array.from({length: 10}).map((_, i) => (
              <div key={i} style={{width: 60, height: 40, borderRadius: 8, border: `4px solid ${C.red}`, background: i < Math.floor(costFill * 10.5) ? C.red : 'transparent'}} />
            ))}
          </div>
        </Abs>
      </div>

      {/* ================= phase F: the question, with parcels raining behind */}
      <div style={{position: 'absolute', inset: 0, opacity: b.ramp(5, 0, 0.3)}}>
        <Stage>
          {Array.from({length: 16}).map((_, i) => {
            const t = (frame - fTitle) / fps;
            const y = -150 + ((t * (260 + rnd(i) * 220) + rnd(i + 7) * 900) % 1300);
            return (
              <Place key={i} x={80 + rnd(i + 2) * 1760} y={y} s={0.3 + rnd(i + 4) * 0.25} r={rnd(i + 5) * 60 - 30} o={0.35}>
                <Box />
              </Place>
            );
          })}
        </Stage>
        <Abs x={0} y={300} w={1920} align="center" s={0.92 + 0.08 * b.pop(5)}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 132, color: C.cream, letterSpacing: -2, lineHeight: 1.05}}>Who really pays for</div>
          <div style={{marginTop: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
            <span style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 170, color: C.bg, background: C.orange, padding: '0 40px', borderRadius: 20, transform: `rotate(${-4 * b.pop(5, 0.3)}deg)`, display: 'inline-block'}}>
              FREE
            </span>
            <span style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 132, color: C.cream}}>returns?</span>
          </div>
        </Abs>
      </div>
    </SceneShell>
  );
};
