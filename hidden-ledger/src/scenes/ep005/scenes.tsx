import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BigQuestion, Figure, IllustrativeTag, K, OnScreen, Shot, SourceNote, Stamp, useCine} from '../../components/cine';
import {useBeats} from '../../components/timeline';
import {FONT_BODY, FONT_TITLE} from '../../themes/theme';
import {Chips, Quote, ramp} from '../ep004/ui';
import {HotelSystem, Label, LegalCard, Marks, Stars} from './ui';

// Episode 005 scenes: composited Blender shots (blender/shots/ep005.py) + overlays timed to the narration
// (b.word(segment index within the scene, /regex/, fraction)). Numbers and quotes: content/episode-005/claims.json.

const SRC_DATA = 'Antonio, de Almeida & Nunes, “Hotel booking demand datasets”, Data in Brief (2019) · our count';
const SRC_YANG = 'Yang, Miao & Nguyen, PeerJ Computer Science (2024)';
const SRC_DSCA = 'Spain, Ministry of Consumer Affairs (DSCA), consumer FAQ';
const SRC_VLC = 'Comunitat Valenciana, Ley 15/2018 de turismo, art. 20 (BOE)';

const Missing: React.FC = () => {
  const {shots} = useCine();
  const b = useBeats();
  if (Object.values(shots).some((m) => m.scene === b.ctx.scene.id)) return null;
  return (
    <AbsoluteFill style={{background: '#14110F', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT_TITLE, fontSize: 60, color: K.taupe}}>{b.ctx.scene.title} — shots not rendered</div>
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{text: string; at: number; frame: number; until?: number; x?: number; y?: number}> = ({text, at, frame, until, x = 70, y = 140}) => {
  let k = ramp(frame, at, 12);
  if (until !== undefined) k *= 1 - ramp(frame, until, 10);
  if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, opacity: k, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 36, letterSpacing: 4, color: K.orange, textShadow: '0 2px 12px rgba(0,0,0,0.7)'}}>{text}</div>;
};

const win = (ids: number[]) => ids.map((i) => `win_${i}`);
const room = (ids: number[], p = 'Room') => ids.map((i) => `${p}_${i}`);
const range = (n: number, every = 1, off = 0) => Array.from({length: n}, (_, i) => off + i * every);

// ================================================================== S01 — the room that isn't there
export const E5S01: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  return (
    <AbsoluteFill>
      <Missing />
      <Shot id="sh01" move={{from: [960, 560, 1.0], to: [900, 540, 1.06]}} hud={() => <Kicker text="11:48 PM" at={6} frame={f} until={b.at(1) - 20} />} />
      <Shot id="sh02" move={{from: [960, 540, 1.0], to: [930, 560, 1.05]}} />
      <Shot id="sh03" move={{from: [960, 540, 1.0], to: [1000, 520, 1.06]}}>
        {(s) => <OnScreen quad={s.quad('desk')}><HotelSystem frame={f} mode="search" failAt={b.word(2, /again/i, 0.9) + 8} /></OnScreen>}
      </Shot>
      <Shot id="sh04" move={{from: [960, 540, 1.0], to: [960, 530, 1.04]}} />
      <Shot id="sh05" move={{from: [960, 540, 1.02], to: [960, 540, 1.08]}} />
      <Shot id="sh06" move={{from: [960, 540, 1.0], to: [980, 520, 1.06]}} hud={() => <BigQuestion lines={['More bookings than rooms?', 'Why would a hotel do that on purpose?']} at={b.at(5)} frame={f} y={130} size={76} />} />
    </AbsoluteFill>
  );
};

// ================================================================== S02 — a product that expires every night
export const E5S02: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  const lost = range(36, 1).map((i) => (i * 37) % 100);
  return (
    <AbsoluteFill>
      <Missing />
      <Shot id="sh07" move={{from: [960, 600, 1.0], to: [960, 480, 1.06]}} hud={() => (
        <Figure x={70} y={150} kicker="How managers see it" value="100 rooms = 100 nights" note="for sale, every single day" size={86} at={b.word(0, /nights/i, 0.6)} frame={f} w={900} />
      )}>
        {(s) => <Marks a={s.a} names={win(range(100))} kind="lit" at={b.word(0, /one per room|room/i, 0.75)} frame={f} size={22} stagger={0.25} />}
      </Shot>
      <Shot id="sh08" move={{from: [960, 540, 1.0], to: [980, 540, 1.07]}} hud={() => (
        <>
          <Figure x={1200} y={150} kicker="Room 216, tonight" value="Unsold" note="at the end of the night, it's gone" size={86} at={b.word(1, /nobody/i, 0.4)} frame={f} w={650} until={b.at(2) - 6} />
          <Chips x={1180} y={170} frame={f} size={42} items={[{t: 'perishable inventory', at: b.word(2, /perishable/i, 0.3)}, {t: 'like airline seats', at: b.word(2, /Airline/i, 0.6)}, {t: 'like concert tickets', at: b.word(2, /concert/i, 0.85)}]} />
        </>
      )} />
      <Shot id="sh09" move={{from: [960, 540, 1.0], to: [1000, 540, 1.06]}} hud={() => (
        <Chips x={70} y={150} frame={f} size={42} items={[
          {t: 'cancels', at: b.word(3, /cancel/i, 0.4)}, {t: 'changes plans', at: b.word(3, /change/i, 0.55)}, {t: 'never shows up', at: b.word(3, /show/i, 0.8)},
          {t: 'leaves a day early', at: b.word(4, /early/i, 0.45)}, {t: 'stays an extra night', at: b.word(4, /extra/i, 0.7)},
        ]} />
      )} />
      <Shot id="sh10" move={{from: [960, 540, 1.0], to: [980, 520, 1.06]}} hud={() => (
        <>
          <SourceNote at={b.at(5)} frame={f}>{SRC_DATA}</SourceNote>
          <Figure x={70} y={150} kicker="Two real hotels in Portugal, 2015–2017" value="119,390 bookings" size={80} at={b.word(5, /hundred|120/i, 0.5)} frame={f} w={1000} until={b.at(6) - 4} />
          <Figure x={70} y={150} kicker="Of those bookings" value="36% cancelled" note="about 1% were no-shows" size={92} at={b.word(6, /cancel/i, 0.3)} frame={f} w={900} />
        </>
      )}>
        {(s) => (
          <>
            <Marks a={s.a} names={room(lost)} kind="cancel" at={b.word(6, /cancel/i, 0.3)} frame={f} size={30} stagger={0.6} />
            <Marks a={s.a} names={room([58])} kind="noshow" at={b.word(6, /no-show|one percent/i, 0.6)} frame={f} size={30} />
          </>
        )}
      </Shot>
      <Shot id="sh11" move={{from: [960, 540, 1.0], to: [1000, 560, 1.08]}} hud={() => <Figure x={1180} y={180} kicker="This room, tonight" value="$0" note="the building, staff and bills are there anyway" size={150} at={b.word(8, /nothing/i, 0.4)} frame={f} w={680} />} />
    </AbsoluteFill>
  );
};

// ================================================================== S03 — the overbooking bet
export const E5S03: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  const dark8 = [7, 18, 26, 39, 44, 61, 73, 92];
  const dark3 = [18, 61, 92];
  return (
    <AbsoluteFill>
      <Missing />
      <Shot id="sh12" move={{from: [960, 540, 1.0], to: [980, 520, 1.06]}} hud={() => (
        <Quote x={70} y={150} w={1040} size={40} text="In an effort to mitigate their losses, hotels adopt overbooking techniques and stringent cancellation policies" who={SRC_YANG} at={b.at(1)} frame={f} />
      )}>
        {(s) => <OnScreen quad={s.quad('desk')}><HotelSystem frame={f} mode="bookings" from={6} to={b.at(1) - 10} /></OnScreen>}
      </Shot>
      <Shot id="sh13" move={{from: [960, 540, 1.0], to: [960, 520, 1.05]}} hud={() => (
        <>
          <IllustrativeTag at={b.at(2)} frame={f} text="MADE-UP HOTEL" />
          <Figure x={70} y={150} kicker="Made-up hotel" value="100 rooms · $150" note="8% of bookings don't arrive" size={80} at={b.word(2, /hundred|100/i, 0.4)} frame={f} w={900} until={b.at(4) - 4} />
          <Figure x={70} y={150} kicker="Accept 100 bookings" value="≈ 92 guests" note="8 empty rooms · $1,200 never earned" size={86} at={b.word(4, /ninety|92/i, 0.4)} frame={f} w={900} until={b.at(5) - 4} />
          <Figure x={70} y={150} kicker="Accept 106 bookings" value="≈ 97 guests" note="only about 3 rooms empty, on average" size={86} at={b.word(5, /ninety|97/i, 0.5)} frame={f} w={900} />
        </>
      )}>
        {(s) => (
          <>
            <Marks a={s.a} names={room(dark8)} kind="dark" at={b.word(4, /dark/i, 0.3)} frame={f} size={26} stagger={2} />
            <Marks a={s.a} names={room(dark8.filter((i) => !dark3.includes(i)))} kind="lit" at={b.word(5, /instead/i, 0.6)} frame={f} size={26} stagger={2} />
          </>
        )}
      </Shot>
      <Shot id="sh14" move={{from: [960, 540, 1.0], to: [960, 530, 1.04]}} hud={() => (
        <Chips x={70} y={150} frame={f} size={40} items={[{t: 'the hotel controls these two', at: b.word(7, /controls/i, 0.3)}, {t: 'can only forecast this one', at: b.word(7, /forecast/i, 0.55)}, {t: 'known only late at night', at: b.word(7, /late/i, 0.85)}]} />
      )}>
        {(s) => (
          <>
            <Label p={s.a('col_0')} text="100" sub="rooms" at={b.word(6, /physically/i, 0.35)} frame={f} />
            <Label p={s.a('col_1')} text="106" sub="confirmed bookings" at={b.word(6, /confirmed/i, 0.55)} frame={f} color={K.orange} />
            <Label p={s.a('col_2')} text="≈ 97" sub="expected arrivals" at={b.word(6, /expects/i, 0.72)} frame={f} />
            <Label p={s.a('col_3')} text="?" sub="actual guests" at={b.word(6, /actually/i, 0.9)} frame={f} />
          </>
        )}
      </Shot>
      <Shot id="sh15" move={{from: [960, 540, 1.0], to: [960, 540, 1.05]}} hud={() => (
        <BigQuestion lines={['One guest: unpredictable.', 'A hundred guests: surprisingly predictable.']} at={b.word(9, /hundred/i, 0.3)} frame={f} y={130} size={64} />
      )}>
        {(s) => (
          <>
            <Label p={s.a('empty_room')} text="Mistake 1" sub="an empty room that could have sold" at={b.word(8, /empty/i, 0.3)} frame={f} until={b.at(9) - 6} size={36} />
            <Label p={s.a('walked_guest')} text="Mistake 2" sub="a booking, but no room" at={b.word(8, /guest/i, 0.6)} frame={f} until={b.at(9) - 6} size={36} color={K.orange} />
          </>
        )}
      </Shot>
    </AbsoluteFill>
  );
};

// ================================================================== S04 — when too many guests show up
export const E5S04: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  return (
    <AbsoluteFill>
      <Missing />
      <Shot id="sh16" move={{from: [960, 540, 1.0], to: [940, 540, 1.05]}} hud={() => (
        <>
          <Kicker text="EARLIER TONIGHT" at={4} frame={f} />
          <Figure x={1300} y={150} kicker="Rooms taken" value={f < b.at(2) ? '98 / 100' : f < b.at(2) + 50 ? '99 / 100' : '100 / 100'} size={90} at={b.at(1)} frame={f} w={560} />
        </>
      )} />
      <Shot id="sh17" move={{from: [960, 600, 1.0], to: [960, 500, 1.06]}} hud={() => (
        <>
          <IllustrativeTag at={b.at(3)} frame={f} text="MADE-UP HOTEL" />
          <Figure x={70} y={150} kicker="106 bookings, 100 rooms" value="≈ 1 night in 7" note="at least one guest with a booking has no room" size={92} at={b.word(3, /seven/i, 0.3)} frame={f} w={1000} />
        </>
      )} />
      <Shot id="sh18" move={{from: [960, 540, 1.0], to: [980, 540, 1.05]}} hud={() => (
        <>
          <Chips x={1190} y={150} frame={f} size={40} items={[{t: 'find a room nearby', at: b.word(4, /room/i, 0.6)}, {t: 'cover the cost', at: b.word(4, /cost/i, 0.85)}]} />
          <Quote x={70} y={150} w={1040} size={36} text="Overbooking may lead a hotel to reject service to a client, which negatively affects the business's relationship with the guest and incurs fees for relocating the guest" who={SRC_YANG} at={b.at(5)} frame={f} />
        </>
      )} />
      <Shot id="sh19" move={{from: [960, 540, 1.0], to: [960, 540, 1.06]}} hud={() => <Stars x={1180} y={220} at={b.word(6, /review/i, 0.4)} frame={f} />} />
    </AbsoluteFill>
  );
};

// ================================================================== S05 — overbooking is a bet, not free money
export const E5S05: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  return (
    <AbsoluteFill>
      <Missing />
      <Shot id="sh20" move={{from: [960, 540, 1.0], to: [960, 530, 1.04]}} hud={() => (
        <>
          <IllustrativeTag at={b.at(3)} frame={f} text="MADE-UP HOTEL" />
          <Figure x={70} y={150} kicker="Moving one guest costs $250" value="Option B: +$730" note="a night, on average, vs option A" size={84} at={b.word(3, /seven|730/i, 0.5)} frame={f} w={900} />
        </>
      )}>
        {(s) => (
          <>
            <Label p={s.a('pan_A')} text="Option A" sub="never overbook: 8 rooms empty" at={b.word(1, /Option/i, 0.2)} frame={f} dy={-90} size={36} />
            <Label p={s.a('pan_B')} text="Option B" sub="sell a few extra" at={b.word(2, /Option/i, 0.2)} frame={f} dy={-90} size={36} color={K.orange} />
          </>
        )}
      </Shot>
      <Shot id="sh21" move={{from: [960, 540, 1.0], to: [960, 540, 1.05]}} hud={() => (
        <>
          <IllustrativeTag at={b.at(4)} frame={f} text="MADE-UP HOTEL" />
          <Figure x={70} y={150} kicker="If only 3% fail to show" value="≈ 3 guests moved" note="a night, with the same 106 bookings" size={84} at={b.word(4, /three guests/i, 0.6)} frame={f} w={900} until={b.at(6) - 4} />
          <Stamp x={1500} y={300} text="+ angry reviews" at={b.word(5, /reviews/i, 0.4)} frame={f} size={42} />
          <Figure x={70} y={150} kicker="Careful" value="Revenue ≠ profit" note="cleaning, laundry, breakfast…" size={84} at={b.word(6, /revenue/i, 0.3)} frame={f} w={900} />
        </>
      )} />
      <Shot id="sh22" move={{from: [960, 540, 1.0], to: [960, 520, 1.05]}} hud={() => (
        <>
          <SourceNote at={b.at(7)} frame={f}>{SRC_DATA}</SourceNote>
          <Kicker text="SHARE OF BOOKINGS CANCELLED, BY HOW FAR AHEAD THEY WERE MADE" at={b.at(7)} frame={f} />
        </>
      )}>
        {(s) => (
          <>
            <Label p={s.a('lead_0')} text="8%" sub="under a week" at={b.word(7, /week/i, 0.4)} frame={f} size={40} />
            <Label p={s.a('lead_1')} text="25%" sub="1–4 weeks" at={b.word(7, /week/i, 0.5) + 8} frame={f} size={32} />
            <Label p={s.a('lead_2')} text="37%" sub="1–3 months" at={b.word(7, /week/i, 0.5) + 16} frame={f} size={32} />
            <Label p={s.a('lead_3')} text="44%" sub="3–6 months" at={b.word(7, /week/i, 0.5) + 24} frame={f} size={32} />
            <Label p={s.a('lead_4')} text="56%" sub="6 months +" at={b.word(7, /six months/i, 0.5)} frame={f} size={40} color={K.orange} />
          </>
        )}
      </Shot>
    </AbsoluteFill>
  );
};

// ================================================================== S06 — what you're owed
export const E5S06: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  return (
    <AbsoluteFill>
      <Missing />
      <Shot id="sh23" move={{from: [960, 540, 1.0], to: [940, 540, 1.05]}} hud={() => (
        <>
          <SourceNote at={b.at(1)} frame={f}>{SRC_DSCA}</SourceNote>
          <Kicker text="IN SPAIN" at={b.at(1)} frame={f} />
          <LegalCard x={70} y={200} w={980} english="Demand an immediate solution, and make sure the incident is recorded." original="reclama una solución inmediata y deja constancia de la incidencia" who="Spain's consumer authority" at={b.word(1, /demand/i, 0.4)} frame={f} until={b.at(2) - 4} />
          <LegalCard x={70} y={200} w={980} english="Each region's tourism rules can set specific obligations to rehouse you." original="la normativa turística de la comunidad autónoma puede establecer obligaciones específicas de realojamiento" who="Spain's consumer authority" at={b.at(2) + 4} frame={f} />
        </>
      )} />
      <Shot id="sh24" move={{from: [960, 540, 1.0], to: [980, 530, 1.05]}} hud={() => (
        <>
          <SourceNote at={b.at(3)} frame={f}>{SRC_VLC}</SourceNote>
          <Kicker text="VALENCIA REGION, SPAIN" at={b.at(3)} frame={f} />
          <LegalCard x={70} y={200} w={1000} english="Hotels may not sell more places than they can serve." original="no podrán vender efectivamente mayor número de plazas de las que puedan atender" who="Ley 15/2018, art. 20.1" at={b.word(3, /sell/i, 0.4)} frame={f} until={b.at(4) - 4} />
          <Chips x={70} y={200} frame={f} size={40} items={[
            {t: 'another hotel in the area', at: b.word(4, /another/i, 0.3)}, {t: 'same or higher category', at: b.word(4, /category/i, 0.5)},
            {t: 'same or better terms', at: b.word(4, /terms/i, 0.65)}, {t: 'hotel pays transfer + price difference', at: b.word(4, /transfer/i, 0.85)},
          ]} />
        </>
      )} />
      <Shot id="sh25" move={{from: [960, 540, 1.0], to: [960, 520, 1.05]}} hud={() => (
        <>
          <SourceNote at={b.at(5)} frame={f}>{SRC_DSCA}</SourceNote>
          <LegalCard x={70} y={170} w={1000} english="Claim back what you paid, plus costs you can prove — like finding somewhere else to stay." original="puedes reclamar la devolución de las cantidades que correspondan y, en su caso, los gastos y daños que puedas acreditar" who="Spain's consumer authority" at={b.word(5, /claim/i, 0.4)} frame={f} until={b.at(6) - 4} />
          <Chips x={70} y={170} frame={f} size={40} items={[{t: '“oversold”', at: b.word(6, /oversold/i, 0.3)}, {t: '“or another cause the hotel is responsible for”', at: b.word(6, /responsible/i, 0.4)}]} />
          <Chips x={1260} y={170} frame={f} size={42} items={[{t: '✓ confirmation', at: b.word(7, /confirmation/i, 0.5)}, {t: '✓ receipts', at: b.word(7, /receipts/i, 0.6)}, {t: '✓ names', at: b.word(7, /names/i, 0.7)}, {t: '✓ local rules', at: b.word(7, /rules/i, 0.85)}]} />
        </>
      )} />
    </AbsoluteFill>
  );
};

// ================================================================== S07 — the inventory that disappears every night
export const E5S07: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  return (
    <AbsoluteFill>
      <Missing />
      <Shot id="sh26" move={{from: [960, 540, 1.0], to: [960, 540, 1.05]}} hud={() => <Kicker text="AN HOUR LATER · ANOTHER HOTEL" at={4} frame={f} />} />
      <Shot id="sh27" move={{from: [960, 540, 1.0], to: [960, 520, 1.06]}} hud={() => (
        <BigQuestion lines={['Not rooms.', 'Nights.']} at={b.word(2, /nights/i, 0.4)} frame={f} y={150} size={96} />
      )} />
      <Shot id="sh28" move={{from: [960, 540, 1.0], to: [940, 560, 1.08]}} hud={() => (
        <>
          <BigQuestion lines={['For the hotel: a percentage.', 'For the guest: the whole night.']} at={b.at(4)} frame={f} y={140} size={64} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 200, textAlign: 'center', opacity: ramp(f, b.at(6), 14)}}>
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 70, letterSpacing: 10, color: K.ivory, textShadow: '0 4px 24px rgba(0,0,0,0.7)'}}>HIDDEN LEDGER</div>
            <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 32, color: K.ivory, marginTop: 8}}>Every number in this video is sourced in the description.</div>
          </div>
        </>
      )} />
    </AbsoluteFill>
  );
};
