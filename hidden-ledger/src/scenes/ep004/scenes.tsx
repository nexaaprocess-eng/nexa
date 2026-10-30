import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BigQuestion, Callout, Figure, IllustrativeTag, K, OnScreen, PriceTag, Shot, SourceNote, Stamp, useCine} from '../../components/cine';
import {useBeats} from '../../components/timeline';
import {FONT_BODY, FONT_TITLE} from '../../themes/theme';
import {Board, BookingSearch, Checkout, Chips, clampLerp, Comparison, Quote, ramp, SeatFill} from './ui';

// Episode 004 scenes: each scene is a run of composited Blender shots (blender/shots/ep004.py) with overlays
// timed to the narration's words (b.word(segment index, /regex/)). Numbers: content/episode-004/claims.json.

const SRC_RYA = 'Ryanair Holdings, Form 20-F, fiscal year to March 2026';
const SRC_FRONTIER = 'Frontier Group Holdings, Form 10-K, 2025';
const SRC_SPIRIT = 'Spirit Aviation Holdings, Forms 10-K (2025) and 8-K (Aug 2025, May 2026)';

const Missing: React.FC = () => {
  const {shots} = useCine();
  const b = useBeats();
  const any = Object.values(shots).some((m) => m.scene === b.ctx.scene.id);
  if (any) return null;
  return (
    <AbsoluteFill style={{background: '#14110F', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT_TITLE, fontSize: 60, color: K.taupe}}>{b.ctx.scene.title} — shots not rendered</div>
    </AbsoluteFill>
  );
};

// ================================================================== S01
export const E4S01: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  const t20 = b.word(0, /twenty/i, 0.7);
  const adds = [b.word(2, /cabin/i, 0.3), b.word(2, /window/i, 0.55), b.word(2, /suitcase|checked/i, 0.8)];
  return (
    <AbsoluteFill>
      <Missing />
      <Shot id="sh01" move={{from: [960, 540, 1.0], to: [1010, 520, 1.08]}} hud={() => <Figure x={1180} y={300} kicker="One way" value="$20" size={190} at={t20 + 4} frame={f} w={600} />}>
        {(s) => <OnScreen quad={s.quad('laptop')}><BookingSearch frame={f} hit={t20} /></OnScreen>}
      </Shot>
      <Shot id="sh02" move={{from: [960, 560, 1.04], to: [960, 540, 1.0]}} />
      <Shot
        id="sh03"
        move={{from: [1000, 540, 1.05], to: [1040, 520, 1.12]}}
        hud={() => (
          <Chips x={1180} y={250} frame={f} size={46} items={[{t: '+ $25  cabin bag', at: adds[0]}, {t: '+ $12  window seat', at: adds[1]}, {t: '+ $35  checked suitcase', at: adds[2]}]} />
        )}
      >
        {(s) => <OnScreen quad={s.quad('laptop')}><Checkout frame={f} adds={adds} /></OnScreen>}
      </Shot>
      <Shot
        id="sh04"
        move={{from: [960, 540, 1.0], to: [960, 520, 1.07]}}
        hud={() => (
          <>
            <Figure x={1220} y={250} kicker="New total" value="$92" size={200} at={b.word(3, /ninety|92/i, 0.3)} frame={f} w={560} />
            <Stamp x={1480} y={620} text="MADE-UP EXAMPLE" at={b.word(3, /made/i, 0.55)} frame={f} />
          </>
        )}
      />
      <Shot
        id="sh05"
        move={{from: [960, 520, 1.0], to: [960, 500, 1.05]}}
        hud={() => (
          <>
            <SourceNote at={b.at(4)} frame={f}>{SRC_FRONTIER}</SourceNote>
            <div style={{position: 'absolute', left: 70, top: 150, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 36, letterSpacing: 4, color: K.orange, opacity: ramp(f, b.at(4), 12), textShadow: '0 2px 12px rgba(0,0,0,0.7)'}}>FRONTIER · AVERAGE PER PASSENGER, 2025</div>
          </>
        )}
      >
        {(s) => (
          <>
            <PriceTag p={s.a('fare_top')} text="$44.60" sub="fares" at={b.word(4, /fares/i, 0.55)} frame={f} />
            <PriceTag p={s.a('extra_top')} text="$63.79" sub="other charges" at={b.word(4, /another|other/i, 0.8)} frame={f} color="#FFE3CC" />
          </>
        )}
      </Shot>
      <Shot id="sh06" move={{from: [900, 560, 1.0], to: [980, 520, 1.1]}} hud={() => <BigQuestion lines={['How can a flight cost $20?', 'And who is really paying for it?']} at={b.at(5)} frame={f} y={190} />} />
    </AbsoluteFill>
  );
};

// ================================================================== S02
export const E4S02: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  const w = (re: RegExp, fb = 0.5) => b.word(3, re, fb);
  return (
    <AbsoluteFill>
      <Missing />
      <Shot id="sh07" move={{from: [900, 560, 1.0], to: [1100, 520, 1.12]}} />
      <Shot
        id="sh08"
        move={{from: [960, 540, 1.0], to: [1000, 520, 1.06]}}
        hud={() => (
          <>
            <SourceNote at={b.at(1)} frame={f}>{SRC_RYA}</SourceNote>
            <Figure x={80} y={170} kicker="Ryanair · 12 months to March 2026" value="208 million" note="passengers" size={120} at={b.word(1, /two hundred|208|million/i, 0.75)} frame={f} w={900} until={b.at(2) - 6} />
            <Figure x={80} y={170} kicker="Average cost to fly one passenger" value="€63.21" size={170} at={b.word(2, /sixty|63/i, 0.6)} frame={f} w={900} />
          </>
        )}
      />
      <Shot
        id="sh09"
        move={{from: [960, 560, 1.0], to: [940, 540, 1.04]}}
        hud={() => (
          <>
            <SourceNote at={b.at(3)} frame={f}>{SRC_RYA} · cost per passenger</SourceNote>
            <Figure x={1340} y={760} kicker="+ sales, maintenance, other" value="€6.91" size={70} at={w(/sales|everything/i, 0.9)} frame={f} w={520} align="right" until={b.at(4) - 4} />
            <Figure x={1220} y={720} kicker="Fuel" value="≈ 41%" note="of all Ryanair's operating costs" size={110} at={b.at(4)} frame={f} w={640} align="right" accent={K.orange} />
          </>
        )}
      >
        {(s) => (
          <>
            <Callout p={s.a('truck')} dx={-150} dy={-210} title="Fuel · 41% of costs" value="€26.01" at={w(/fuel/i, 0.1)} frame={f} />
            <Callout p={s.a('Plane_cockpit')} dx={120} dy={-200} title="Staff" value="€8.91" at={w(/staff/i, 0.3)} frame={f} w={260} />
            <Callout p={s.a('terminal')} dx={60} dy={-120} title="Airport & handling" value="€8.46" at={w(/[Aa]irport/i, 0.45)} frame={f} w={330} />
            <Callout p={s.a('Plane_body')} dx={-80} dy={-260} title="The aircraft (depreciation)" value="€6.59" at={w(/aircraft/i, 0.6)} frame={f} w={420} accent={K.slate} />
            <Callout p={s.a('tower')} dx={-60} dy={140} title="Air traffic control" value="€6.33" at={w(/traffic/i, 0.75)} frame={f} w={330} accent={K.slate} />
          </>
        )}
      </Shot>
      <Shot
        id="sh10"
        move={{from: [960, 540, 1.0], to: [960, 520, 1.06]}}
        hud={() => (
          <>
            <SourceNote at={b.at(5)} frame={f}>{SRC_RYA}</SourceNote>
            <Figure x={1160} y={720} kicker="On the fare alone" value="−€12.55" note="per passenger" size={110} at={b.at(6)} frame={f} w={700} accent={K.red} until={b.word(6, /secrets|three/i, 0.85) - 4} />
            <Figure x={1160} y={760} kicker="" value="Three secrets." size={96} at={b.word(6, /secrets|three/i, 0.85)} frame={f} w={700} />
          </>
        )}
      >
        {(s) => (
          <>
            <PriceTag p={s.a('fare_pan')} text="Fare €50.66" sub="incl. bag & change fees" at={b.word(5, /fifty|50|ticket/i, 0.35)} frame={f} size={42} />
            <PriceTag p={s.a('cost_pan')} text="Cost €63.21" at={b.word(5, /fifty|50|ticket/i, 0.35) + 10} frame={f} size={42} color="#DCE6EC" />
          </>
        )}
      </Shot>
    </AbsoluteFill>
  );
};

// ================================================================== S03
const LETTERS = 'ABCDEF';
const SEAT_ORDER = (() => {
  // a deterministic but irregular fill order over 33 rows x 6 (one seat left out: 197 seats)
  const all: string[] = [];
  for (let r = 1; r <= 33; r++) for (const l of LETTERS) all.push(`${r}${l}`);
  all.pop();
  let x = 12345;
  const rnd = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
  return all.map((k) => [k, rnd()] as [string, number]).sort((a, z) => a[1] - z[1]).map((p) => p[0]);
})();

export const E4S03: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  return (
    <AbsoluteFill>
      <Missing />
      <Shot
        id="sh11"
        move={{from: [960, 540, 1.0], to: [980, 540, 1.05]}}
        hud={() => (
          <>
            <Chips x={70} y={170} frame={f} items={[{t: 'Crew: paid', at: b.word(1, /crew/i, 0.1)}, {t: 'Fuel: burned', at: b.word(1, /fuel/i, 0.25)}, {t: 'Airport: billed', at: b.word(1, /airport/i, 0.4)}]} />
            <Quote x={70} y={640} w={1180} size={40} text="The operating costs of each flight do not vary significantly with the number of passengers flown." who={SRC_RYA} at={b.word(1, /annual|report/i, 0.55)} frame={f} />
          </>
        )}
      />
      <Shot
        id="sh12"
        move={{from: [960, 560, 1.0], to: [1000, 540, 1.14]}}
        hud={() => (
          <>
            <SourceNote at={b.at(2)} frame={f}>{SRC_RYA} · total operating costs ÷ 1.15 million flights</SourceNote>
            <Figure x={80} y={170} kicker="One average Ryanair flight" value="≈ €11,400" note="to operate · ≈ 181 passengers on board" size={140} at={b.word(2, /eleven|11/i, 0.4)} frame={f} w={1100} />
          </>
        )}
      />
      <Shot id="sh13" move={{from: [960, 540, 1.0], to: [960, 540, 1.07]}} hud={() => <Figure x={1160} y={180} kicker="An empty seat, once the door closes" value="€0" note="it can never be sold again" size={170} at={b.word(3, /gone|good/i, 0.35)} frame={f} w={700} align="right" />} />
      <Shot
        id="sh14"
        move={{from: [960, 540, 1.0], to: [940, 540, 1.06]}}
        hud={() => (
          <>
            <Chips x={1180} y={200} frame={f} items={[{t: '+ per-passenger fees & taxes', at: b.word(4, /fees/i, 0.3)}, {t: '+ a bit of extra fuel', at: b.word(4, /fuel/i, 0.45)}]} size={38} />
            <BigQuestion lines={['How full does the plane', 'need to be?']} at={b.word(5, /full/i, 0.7)} frame={f} y={620} size={80} />
          </>
        )}
      />
      <Shot
        id="sh15"
        move={{from: [960, 540, 1.0], to: [960, 540, 1.0]}}
        hud={() => {
          const n = Math.round(clampLerp(f, b.at(6), b.word(6, /eighty|80/i, 0.5), 0, 158) + clampLerp(f, b.word(6, /ninety|94/i, 0.85), b.word(6, /ninety|94/i, 0.85) + 40, 0, 27));
          return (
            <>
              <SourceNote at={b.at(6)} frame={f}>{SRC_RYA} · break-even load factor 80%, load factor 94%</SourceNote>
              <IllustrativeTag at={b.at(7)} frame={f} text="ILLUSTRATIVE · ONE 197-SEAT AIRCRAFT" />
              <div style={{position: 'absolute', left: 70, bottom: 170, fontFamily: FONT_TITLE, fontWeight: 700, color: K.ivory, textShadow: '0 4px 20px rgba(0,0,0,0.7)'}}>
                <div style={{fontSize: 120, lineHeight: 1}}>{n} <span style={{fontSize: 54, color: K.taupe}}>/ 197 seats</span></div>
                <div style={{fontSize: 40, color: n > 158 ? K.orange : K.ivory, marginTop: 6}}>{n <= 158 ? 'covering the cost of the flight' : `break-even at 158 · ${n - 158} seats of profit`}</div>
              </div>
            </>
          );
        }}
      >
        {(s) => {
          const n = Math.round(clampLerp(f, b.at(6), b.word(6, /eighty|80/i, 0.5), 0, 158) + clampLerp(f, b.word(6, /ninety|94/i, 0.85), b.word(6, /ninety|94/i, 0.85) + 40, 0, 27));
          return <SeatFill anchors={s.m.anchors} order={SEAT_ORDER} n={n} orangeFrom={158} hero="6F" />;
        }}
      </Shot>
    </AbsoluteFill>
  );
};

// ================================================================== S04
export const E4S04: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  const prices = ['$20', '$29', '$39', '$55', '$69', '$89', '$119', '$149', '$189'];
  return (
    <AbsoluteFill>
      <Missing />
      <Shot
        id="sh16"
        move={{from: [960, 560, 1.0], to: [1020, 500, 1.1]}}
        hud={() => (
          <>
            <Quote x={70} y={170} w={1000} size={40} text="Prices generally varying on the basis of advance booking, seat availability and demand." who={SRC_RYA} at={b.word(1, /vary|fares/i, 0.4)} frame={f} />
            <Chips x={70} y={480} frame={f} size={42} items={[{t: 'sold one way: every seat, its own price', at: b.word(2, /one|way/i, 0.3)}]} />
          </>
        )}
      >
        {(s) => <OnScreen quad={s.quad('board')} w={1280} h={700}><Board frame={f} mode="fares" at={b.at(0)} /></OnScreen>}
      </Shot>
      <Shot id="sh17" move={{from: [900, 600, 1.0], to: [1100, 420, 1.06]}} hud={() => <IllustrativeTag at={b.at(3)} frame={f} text="ILLUSTRATIVE FARES" />}>
        {(s) => (
          <>
            {prices.map((p, i) => (
              <PriceTag key={i} p={s.a(`step${i}`)} text={p} at={b.at(3) + 10 + i * 9} frame={f} size={40} dy={-30} color={i === 0 ? '#FFE3CC' : K.ivory} />
            ))}
          </>
        )}
      </Shot>
      <Shot id="sh18" move={{from: [960, 540, 1.0], to: [960, 540, 1.06]}} hud={() => <IllustrativeTag at={b.at(4)} frame={f} text="ILLUSTRATIVE FARES" />}>
        {(s) => (
          <>
            <PriceTag p={s.a('hero_tag')} text="$20" sub="booked weeks ahead" at={b.at(4) + 6} frame={f} size={44} color="#FFE3CC" />
            <PriceTag p={s.a('neighbour_tag')} text="$160" sub="booked yesterday" at={b.word(4, /yesterday|paid/i, 0.5)} frame={f} size={44} />
          </>
        )}
      </Shot>
      <Shot
        id="sh18b"
        move={{from: [980, 540, 1.04], to: [1040, 520, 1.1]}}
        hud={() => (
          <Chips x={1180} y={240} frame={f} size={40} items={[{t: 'fills the plane early', at: b.word(5, /fill/i, 0.3)}, {t: 'tops every price comparison', at: b.word(5, /top|comparison/i, 0.55)}, {t: 'brings you to its website', at: b.word(5, /website|bring/i, 0.8)}]} />
        )}
      >
        {(s) => <OnScreen quad={s.quad('laptop')}><Comparison frame={f} at={b.at(5)} /></OnScreen>}
      </Shot>
      <Shot
        id="sh19"
        move={{from: [960, 540, 1.0], to: [1000, 560, 1.08]}}
        hud={() => (
          <>
            <Quote x={70} y={170} w={940} size={52} text="load factor active – yield passive" who={SRC_RYA} at={b.word(6, /load|factor/i, 0.35)} frame={f} />
            <Figure x={80} y={440} kicker="In plain words" value="Fill the plane first." note="Worry about the price of each seat second." size={80} at={b.word(6, /plain/i, 0.6)} frame={f} w={1000} until={b.at(7) - 4} />
            <Figure x={80} y={440} kicker="Promotional fares" value="Lower revenue, fuller planes" note="Ryanair says it keeps running them to fill quiet periods." size={70} at={b.at(7)} frame={f} w={1000} />
          </>
        )}
      />
    </AbsoluteFill>
  );
};

// ================================================================== S05
export const E4S05: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  const w2 = (re: RegExp, fb: number) => b.word(1, re, fb);
  return (
    <AbsoluteFill>
      <Missing />
      <Shot
        id="sh20"
        move={{from: [960, 540, 1.0], to: [980, 560, 1.08]}}
        hud={() => (
          <Chips
            x={1260}
            y={170}
            frame={f}
            size={38}
            items={[
              {t: 'bigger bag', at: w2(/bigger/i, 0.45)},
              {t: 'suitcase', at: w2(/suitcase/i, 0.55)},
              {t: 'choosing your seat', at: w2(/choosing|seat/i, 0.62)},
              {t: 'boarding early', at: w2(/boarding/i, 0.72)},
              {t: 'changing your ticket', at: w2(/changing/i, 0.82)},
              {t: 'a drink on board', at: w2(/drink/i, 0.92)},
            ]}
          />
        )}
      >
        {(s) => <PriceTag p={s.a('sizer')} text="Included" sub="one small bag" at={w2(/small|bag/i, 0.25)} frame={f} size={38} dy={-40} color="#DDEFE3" />}
      </Shot>
      <Shot
        id="sh21"
        move={{from: [960, 520, 1.0], to: [960, 480, 1.05]}}
        hud={() => (
          <>
            <SourceNote at={b.at(2)} frame={f}>{SRC_RYA} · per booked passenger</SourceNote>
            <Figure x={70} y={160} kicker="Ryanair extras, year to March 2026" value="€4.99 billion" note="≈ €24 per passenger · about a third of revenue" size={96} at={b.word(2, /billion|four/i, 0.3)} frame={f} w={1000} until={b.at(3) - 4} />
          </>
        )}
      >
        {(s) => (
          <>
            <Callout p={s.a('fare_mid')} dx={-170} dy={0} title="Fare" value="€50.66" at={b.at(3) + 4} frame={f} w={260} />
            <Callout p={s.a('extra_mid')} dx={-170} dy={-30} title="Extras" value="€23.94" at={b.at(3) + 14} frame={f} w={260} />
            <Callout p={s.a('cost_mid')} dx={170} dy={0} title="Cost" value="€63.21" at={b.word(3, /cost|against/i, 0.5)} frame={f} w={260} accent={K.slate} />
            <PriceTag p={s.a('top_rev')} text="€74.60" sub="revenue" at={b.word(3, /seventy|74/i, 0.4)} frame={f} size={40} dy={-24} />
            <Callout p={s.a('gap')} dx={170} dy={-120} title="The gap: profit" value="≈ €11" at={b.word(3, /gap|profit/i, 0.8)} frame={f} w={300} accent={K.green} />
          </>
        )}
      </Shot>
      <Shot id="sh22" move={{from: [960, 540, 1.0], to: [960, 500, 1.06]}} hud={() => (
        <>
          <SourceNote at={b.at(4)} frame={f}>{SRC_FRONTIER}</SourceNote>
          <Figure x={70} y={160} kicker="Frontier · ancillary revenue per passenger" value="$60.55 → $67.57" note="2021 → 2025" size={80} at={b.at(5)} frame={f} w={1100} />
        </>
      )}>
        {(s) => (
          <>
            <PriceTag p={s.a('ticket_top')} text="$44.60" sub="fares" at={b.word(4, /fares|tickets/i, 0.85)} frame={f} />
            <PriceTag p={s.a('nonfare_top')} text="$63.79" sub="non-fare charges" at={b.word(4, /non|charges/i, 0.6)} frame={f} color="#FFE3CC" />
          </>
        )}
      </Shot>
      <Shot id="sh23" move={{from: [940, 540, 1.0], to: [1000, 540, 1.06]}} hud={() => (
        <>
          <Figure x={70} y={170} kicker="The headline" value="The fare" note="the one number you compare across websites" size={90} at={b.word(6, /compete|fare/i, 0.3)} frame={f} w={900} until={b.at(7) - 4} />
          <Chips x={70} y={190} frame={f} size={42} items={[{t: 'One small backpack: a genuine bargain', at: b.word(7, /backpack/i, 0.3)}, {t: 'A family with suitcases: maybe not', at: b.word(7, /family/i, 0.7)}]} />
        </>
      )} />
    </AbsoluteFill>
  );
};

// ================================================================== S06
export const E4S06: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  const vals: [string, string, number][] = [
    ['RYA', 'Ryanair', 36],
    ['WIZ', 'Wizz Air', 62],
    ['EZJ', 'easyJet', 90],
    ['IAG', 'IAG', 178],
    ['LUF', 'Lufthansa', 178],
    ['AFKLM', 'Air France-KLM', 253],
  ];
  return (
    <AbsoluteFill>
      <Missing />
      <Shot id="sh24" move={{from: [960, 540, 1.0], to: [960, 540, 1.04]}} hud={() => <SourceNote at={b.at(1)} frame={f}>Ryanair, Annual Report 2025 & Form 20-F FY2026 · seat counts</SourceNote>}>
        {(s) => {
          const lg = s.a('legacy');
          const dn = s.a('dense');
          return (
            <>
              <div style={{position: 'absolute', left: lg[0] + 40, top: lg[1] - 150, opacity: ramp(f, b.word(1, /Traditional|162/i, 0.6), 12), fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 46, color: K.ivory, textShadow: '0 3px 14px rgba(0,0,0,0.8)'}}>
                Traditional airline · Boeing 737-800 · <span style={{color: K.taupe}}>~162 seats, two classes</span>
              </div>
              <div style={{position: 'absolute', left: dn[0] + 40, top: dn[1] + 120, opacity: ramp(f, b.word(1, /197|newest/i, 0.2), 12), fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 46, color: K.ivory, textShadow: '0 3px 14px rgba(0,0,0,0.8)'}}>
                Ryanair · Boeing 737-8200 · <span style={{color: K.orange}}>197 seats</span> <span style={{fontSize: 34, color: K.taupe}}>(189 on older 737-800s)</span>
              </div>
            </>
          );
        }}
      </Shot>
      <Shot id="sh25" move={{from: [960, 540, 1.0], to: [940, 540, 1.06]}} hud={() => (
        <>
          <SourceNote at={b.at(3)} frame={f}>{SRC_RYA} · average daily flight hours per aircraft</SourceNote>
          <Figure x={70} y={160} kicker="Each aircraft, every day" value="≈ 9.5 hours" note="in the air, on average" size={110} at={b.word(3, /nine|half/i, 0.4)} frame={f} w={900} until={b.at(4) - 4} />
          <Chips x={70} y={170} frame={f} vertical={false} size={40} items={[{t: 'passengers off', at: b.word(4, /off/i, 0.35)}, {t: 'quick clean', at: b.word(4, /clean/i, 0.5)}, {t: 'next ones on', at: b.word(4, /next/i, 0.65)}, {t: 'back in the air', at: b.word(4, /air/i, 0.85)}]} />
        </>
      )} />
      <Shot id="sh26" move={{from: [960, 540, 1.0], to: [1000, 520, 1.08]}} hud={() => (
        <>
          <SourceNote at={b.at(5)} frame={f}>Ryanair FY26 results · fleet at 31 March 2026: 621 Boeing 737s, 26 Airbus A320s</SourceNote>
          <Figure x={70} y={160} kicker="One aircraft family" value="621 of 647" note="aircraft are Boeing 737s" size={110} at={b.word(5, /family|whole/i, 0.4)} frame={f} w={900} until={b.at(6) - 4} />
          <Chips x={70} y={170} frame={f} size={42} items={[{t: 'airports that charge less', at: b.word(6, /charge/i, 0.3)}, {t: 'outdoor stairs, no jet bridges', at: b.word(6, /stairs/i, 0.55)}, {t: 'online check-in for everyone', at: b.word(6, /online/i, 0.85)}]} />
        </>
      )} />
      <Shot id="sh27" move={{from: [960, 560, 1.0], to: [960, 500, 1.05]}} hud={() => (
        <>
          <SourceNote at={b.at(7)} frame={f}>Ryanair FY26 results presentation · its own comparison, latest fiscal years</SourceNote>
          <div style={{position: 'absolute', left: 70, top: 150, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, color: K.orange, letterSpacing: 3, opacity: ramp(f, b.at(7), 12), textShadow: '0 2px 12px rgba(0,0,0,0.7)'}}>
            COST PER PASSENGER, EXCLUDING FUEL
          </div>
        </>
      )}>
        {(s) => (
          <>
            {vals.map(([k, nm, v], i) => (
              <React.Fragment key={k}>
                <PriceTag p={s.a(`p_${k}`)} text={`€${v}`} at={b.word(7, i === 0 ? /thirty|36/i : i === 1 ? /Wiz|sixty/i : i === 2 ? /easy|ninety/i : /network|hundred/i, 0.5) + (i > 2 ? (i - 3) * 6 : 0)} frame={f} size={40} dy={-20} color={i === 0 ? '#FFE3CC' : K.ivory} tilt={0} />
                <div style={{position: 'absolute', left: s.a(`b_${k}`)[0], top: s.a(`b_${k}`)[1] + 18, transform: 'translateX(-50%)', fontFamily: FONT_BODY, fontWeight: 700, fontSize: 28, color: K.ivory, opacity: ramp(f, b.at(7) + 6, 10), whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.9)'}}>{nm}</div>
              </React.Fragment>
            ))}
          </>
        )}
      </Shot>
    </AbsoluteFill>
  );
};

// ================================================================== S07
export const E4S07: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  const events: [string, string, number][] = [
    ['Nov 2024', 'Chapter 11 bankruptcy', b.word(3, /November/i, 0.55)],
    ['Mar 2025', 'emerges', b.word(3, /November/i, 0.6) + 12],
    ['Aug 2025', 'Chapter 11 again', b.word(3, /August/i, 0.85)],
    ['2 May 2026', 'all flights cancelled · wind-down', b.word(4, /May/i, 0.1)],
  ];
  return (
    <AbsoluteFill>
      <Missing />
      <Shot id="sh28" move={{from: [960, 540, 1.0], to: [960, 540, 1.08]}} hud={() => <SourceNote at={b.at(1)} frame={f}>{SRC_RYA}; {SRC_FRONTIER} (load factors are defined slightly differently)</SourceNote>}>
        {(s) => (
          <>
            <Callout p={s.a('beam')} dx={-260} dy={-260} title="Ryanair break-even" value="80% full" at={b.word(1, /eighty|80/i, 0.3)} frame={f} w={340} />
            <Callout p={s.a('below')} dx={180} dy={160} title="Frontier, 2025" value="78.4% full" at={b.word(1, /seventy|78/i, 0.8)} frame={f} w={330} accent={K.red} />
          </>
        )}
      </Shot>
      <Shot id="sh29" move={{from: [960, 520, 1.0], to: [960, 500, 1.05]}} hud={() => (
        <>
          <SourceNote at={b.at(2)} frame={f}>{SRC_FRONTIER} · cost = operating expenses ÷ passengers</SourceNote>
          <Figure x={1180} y={740} kicker="Frontier, 2025" value="−$137 million" size={96} at={b.word(2, /lost|137/i, 0.75)} frame={f} w={700} align="right" accent={K.red} />
        </>
      )}>
        {(s) => (
          <>
            <PriceTag p={s.a('rev_top')} text="$112.17" sub="revenue / passenger" at={b.word(2, /hundred and twelve|112|took/i, 0.5)} frame={f} size={40} dy={-24} />
            <PriceTag p={s.a('cost_top')} text="$116.66" sub="cost / passenger" at={b.word(2, /costs|sixteen|116/i, 0.25)} frame={f} size={40} dy={-24} color="#F6D3CC" />
          </>
        )}
      </Shot>
      <Shot id="sh30" move={{from: [960, 560, 1.0], to: [1000, 520, 1.08]}} hud={() => (
        <>
          <SourceNote at={b.at(3)} frame={f}>{SRC_SPIRIT}</SourceNote>
          <div style={{position: 'absolute', left: 70, top: 160, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, color: '#F5D27A', letterSpacing: 3, opacity: ramp(f, b.at(3), 10), textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>SPIRIT AIRLINES</div>
            {events.map(([d, t, at], i) => (
              <div key={i} style={{display: 'flex', gap: 20, alignItems: 'baseline', opacity: ramp(f, at, 10), transform: `translateX(${(1 - ramp(f, at, 10)) * -20}px)`}}>
                <div style={{width: 240, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, color: i === 3 ? K.red : K.ivory, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>{d}</div>
                <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 36, color: K.ivory, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>{t}</div>
              </div>
            ))}
          </div>
        </>
      )}>
        {(s) => <OnScreen quad={s.quad('board')} w={1280} h={700}><Board frame={f} mode="cancelled" at={b.word(4, /cancelled/i, 0.6)} /></OnScreen>}
      </Shot>
      <Shot
        id="sh31"
        move={{from: [960, 540, 1.0], to: [940, 560, 1.07]}}
        hud={() => (
          <>
            <SourceNote at={b.at(6)} frame={f}>{SRC_RYA} · jet fuel swaps for FY27</SourceNote>
            <Figure x={70} y={170} kicker="Ryanair, year to March 2027" value="≈ 80%" note="of its fuel already hedged" size={120} at={b.word(6, /eighty|80|percent/i, 0.4)} frame={f} w={900} />
          </>
        )}
      />
    </AbsoluteFill>
  );
};

// ================================================================== S08
export const E4S08: React.FC = () => {
  const b = useBeats();
  const f = b.frame;
  const answers = ['An empty seat earns nothing.', 'Cheap seats: a handful, at the bottom of the ladder.', 'Bags, seats and extras close the gap.', 'A machine built to cost less per seat.'];
  return (
    <AbsoluteFill>
      <Missing />
      <Shot id="sh32" move={{from: [960, 540, 1.0], to: [1000, 540, 1.06]}} hud={() => (
        <div style={{position: 'absolute', left: 70, top: 170, display: 'flex', flexDirection: 'column', gap: 18}}>
          {answers.map((a, i) => {
            const k = ramp(f, b.at(i + 1) + 4, 12);
            return (
              <div key={i} style={{display: 'flex', gap: 22, alignItems: 'center', opacity: k, transform: `translateX(${(1 - k) * -24}px)`}}>
                <div style={{width: 64, height: 64, borderRadius: 32, background: K.orange, color: K.ink, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
                <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 46, color: K.ivory, background: K.warmBlack, padding: '10px 22px', borderRadius: 14}}>{a}</div>
              </div>
            );
          })}
        </div>
      )} />
      <Shot id="sh33" move={{from: [960, 560, 1.0], to: [1000, 520, 1.1]}} hud={() => (
        <>
          <BigQuestion lines={['Who pays for the $20 seat?']} at={b.at(5)} frame={f} y={150} size={84} />
          <Chips x={70} y={330} frame={f} size={42} items={[{t: 'people who book late', at: b.word(5, /late/i, 0.25)}, {t: 'people who add a suitcase', at: b.word(5, /suitcase/i, 0.4)}, {t: "the airline's obsession with cost", at: b.word(5, /obsession/i, 0.55)}]} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 200, textAlign: 'center', opacity: ramp(f, b.at(6), 14)}}>
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 70, letterSpacing: 10, color: K.ivory, textShadow: '0 4px 24px rgba(0,0,0,0.7)'}}>HIDDEN LEDGER</div>
            <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 32, color: K.ivory, marginTop: 8}}>Every number in this video is sourced in the description.</div>
          </div>
        </>
      )} />
    </AbsoluteFill>
  );
};
