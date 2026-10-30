import React from 'react';
import {Box, Hanger, Jacket, Magnifier, Place, Tag, Truck, Warehouse} from '../../components/icons';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';
import {IllustrativeStamp, lerp, useClock, VStage, VText} from '../kit';

// Short 2 (s04-06..s04-09): the episode's illustrative $100 jacket, told as a receipt that builds
// line by line: $8 + $6 spent, $100 -> $70 resale, so $14 + $30 = $44 in this example. The
// "illustrative" stamp stays on screen from the moment the narration says so until the end.

const Icon: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 92}) => (
  <svg width={size} height={size} viewBox="-120 -120 240 240" style={{flex: 'none'}}>
    {children}
  </svg>
);

const Row: React.FC<{icon: React.ReactNode; label: string; value: string; color: string; o: number; vk: number; note?: string}> = ({icon, label, value, color, o, vk, note}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 24, height: 135, opacity: o, transform: `translateX(${(1 - o) * 60}px)`, borderBottom: `3px solid ${C.line}`}}>
    <Icon size={110}>{icon}</Icon>
    <div style={{flex: 1, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 54, color: C.cream}}>
      {label}
      {note && <div style={{fontSize: 34, color: C.muted, fontWeight: 600}}>{note}</div>}
    </div>
    <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 96, color, opacity: Math.min(1, vk * 2), transform: `scale(${lerp(1.5, 1, Math.min(1, vk))})`, transformOrigin: 'right center'}}>{value}</div>
  </div>
);

const Slider: React.FC<{label: string; value: number; min: number; max: number; prefix: string}> = ({label, value, min, max, prefix}) => {
  const k = (value - min) / (max - min);
  return (
    <div style={{height: 120}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: C.cream}}>
        <span>{label}</span>
        <span style={{fontFamily: FONT_TITLE, fontWeight: 700, color: C.orange, fontVariantNumeric: 'tabular-nums'}}>
          {prefix}${value}
        </span>
      </div>
      <div style={{position: 'relative', height: 14, borderRadius: 7, background: C.line, marginTop: 14}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${k * 100}%`, borderRadius: 7, background: C.orange}} />
        <div style={{position: 'absolute', left: `calc(${k * 100}% - 20px)`, top: -13, width: 40, height: 40, borderRadius: 20, background: C.cream, border: `5px solid ${C.orange}`}} />
      </div>
    </div>
  );
};

// dim slot from the moment the list is introduced, lit when its item is named
const Tile: React.FC<{x: number; y: number; k: number; o: number; label: string; children: React.ReactNode}> = ({x, y, k, o, label, children}) => (
  <div
    style={{
      position: 'absolute',
      left: x - 195,
      top: y,
      width: 390,
      height: 360,
      borderRadius: 28,
      background: C.panel,
      border: `4px solid ${Math.min(1, k) > 0.5 ? C.orange : C.line}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      opacity: o * (0.25 + 0.75 * Math.min(1, k)),
      transform: `scale(${lerp(0.92, 1, Math.min(1.05, k))})`,
    }}
  >
    <Icon size={210}>{children}</Icon>
    <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 44, color: C.cream, textAlign: 'center', lineHeight: 1.05}}>{label}</div>
  </div>
);

export const JacketMath: React.FC = () => {
  const {t, word, ramp, pop} = useClock();

  const tHere = word('s04-06', /^Here's/);
  const tIllustrative = word('s04-06', /^illustrative/);
  const tData = word('s04-06', /^data/);
  const t100 = word('s04-07', /^\$100/);
  const tShipping = word('s04-07', /^shipping/);
  const t8 = word('s04-07', /^\$8/);
  const tHandling = word('s04-07', /^handling/);
  const t6 = word('s04-07', /^\$6/);
  const tSeason = word('s04-07', /^season/);
  const t70 = word('s04-07', /^\$70/);
  const tRefund = word('s04-08', /^refund/);
  const tSpent = word('s04-08', /^spent/);
  const t14 = word('s04-08', /^\$14/);
  const t30 = word('s04-08', /^\$30/);
  const tExample = word('s04-08', /^example/);
  const t44 = word('s04-08', /^\$44/);
  const tChange = word('s04-09', /^Change/);
  const tReal = word('s04-09', /^Real/);
  const tProduct = word('s04-09', /^product/);
  const tCarrier = word('s04-09', /^carrier/);
  const tWarehouse = word('s04-09', /^warehouse/);
  const tCondition = word('s04-09', /^condition/);

  // ---- illustrative stamp: big when said, then parked at the top for the rest of the short
  const stampIn = pop(tIllustrative - 0.1);
  const park = ramp(tData + 0.5, 0.5);

  // ---- jacket + price tag
  const jacketIn = pop(tHere - 0.6);
  const toResult = ramp(t44 - 0.45, 0.4);
  // the jacket stays the hero until the receipt starts, then makes room for it
  const shrink = ramp(tShipping - 0.6, 0.5);
  const jacketY = lerp(lerp(680, 700, park), 520, shrink);
  const jacketS = lerp(lerp(2.6, 2.4, park), 1.75, shrink);
  const jacketO = Math.min(1, jacketIn * 2) * (1 - toResult);
  const tagIn = pop(t100 - 0.1);
  const resale = t >= t70 + 0.3;
  const swing = Math.sin((t - t100) * 5) * 8 * Math.exp(-Math.max(0, t - t100) * 1.2) + (resale ? Math.sin((t - t70) * 6) * 6 * Math.exp(-Math.max(0, t - t70) * 1.4) : 0);
  const seasonChip = pop(tSeason) * (1 - toResult);

  // ---- receipt rows, then the sums, then the result
  const ledger = ramp(tShipping - 0.2, 0.4) * (1 - ramp(tSpent - 0.25, 0.35));
  const sums = ramp(tSpent - 0.15, 0.4) * (1 - ramp(t44 - 0.45, 0.35));
  const result = pop(t44 - 0.15) * (1 - ramp(tReal - 0.3, 0.4));
  const refundChip = pop(tRefund) * (1 - ramp(tSpent - 0.25, 0.35));

  // ---- "change any assumption": inputs wobble and the result follows (always $8/$6/$70 -> $44 at rest)
  const amp = ramp(tChange + 0.2, 0.6) * (1 - ramp(tReal - 0.5, 0.4));
  const ph = Math.max(0, t - tChange);
  const ship = Math.round(8 + 5 * amp * Math.sin(ph * 3.1));
  const handle = Math.round(6 + 3 * amp * Math.sin(ph * 2.3 + 1));
  const resaleV = Math.round(70 + 16 * amp * Math.sin(ph * 2.7 + 2));
  const loss = ship + handle + (100 - resaleV);
  const sliders = ramp(tChange, 0.4) * (1 - ramp(tReal - 0.3, 0.4));

  const grid = ramp(tReal - 0.1, 0.4);

  return (
    <>
      <VStage>
        {jacketO > 0.01 && (
          <g opacity={jacketO}>
            <Place x={540} y={jacketY} s={jacketS} r={Math.sin((t - tHere) * 1.4) * 3.5}>
              <g transform="translate(0 -128)" opacity={1 - park}>
                <Hanger />
              </g>
              <Jacket />
              {tagIn > 0.01 && (
                <g transform={`translate(118 -40) rotate(${28 + swing}) scale(${0.62 * Math.min(1.1, tagIn)})`}>
                  <g transform="translate(90 0)">
                    <Tag text={resale ? '$70' : '$100'} fill={resale ? C.orange : C.cream} />
                  </g>
                </g>
              )}
            </Place>
          </g>
        )}
      </VStage>

      {/* out of season */}
      {seasonChip > 0.01 && (
        <div style={{position: 'absolute', left: 90, top: 310, opacity: Math.min(1, seasonChip * 2), transform: `scale(${Math.min(1.05, seasonChip)})`, transformOrigin: 'left center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, color: C.bg, background: C.orange, borderRadius: 14, padding: '8px 20px'}}>
          OUT OF SEASON
        </div>
      )}

      {/* receipt */}
      {ledger > 0.01 && (
        <div style={{position: 'absolute', left: 70, width: 880, top: 760, opacity: ledger}}>
          <Row
            o={ramp(tShipping - 0.2, 0.4)}
            vk={pop(t8 + 0.35)}
            icon={<Truck />}
            label="Return shipping"
            value="−$8"
            color={C.red}
          />
          <Row
            o={ramp(tHandling - 0.2, 0.4)}
            vk={pop(t6 + 0.35)}
            icon={<Box />}
            label="Handling"
            value="−$6"
            color={C.red}
          />
          <Row
            o={ramp(tSeason - 0.3, 0.4)}
            vk={pop(t70 + 0.35)}
            icon={<Tag />}
            label="Resells for"
            note="sold new for $100"
            value="$70"
            color={C.orange}
          />
        </div>
      )}
      {refundChip > 0.01 && (
        <div style={{position: 'absolute', left: 70, width: 880, top: 1185, display: 'flex', justifyContent: 'center', opacity: Math.min(1, refundChip * 2)}}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 46, color: C.cream, background: C.green, borderRadius: 16, padding: '10px 26px'}}>✓ Customer refunded in full</div>
        </div>
      )}

      {/* the two sums */}
      {sums > 0.01 && (
        <div style={{position: 'absolute', left: 70, width: 880, top: 740, opacity: sums, fontFamily: FONT_TITLE, fontWeight: 700}}>
          {[
            {k: pop(t14 - 0.1), label: 'SPENT TO GET IT BACK', math: '$8 + $6 =', value: '$14'},
            {k: pop(t30 - 0.1), label: 'VALUE LOST', math: '$100 − $70 =', value: '$30'},
          ].map((r) => (
            <div key={r.label} style={{marginBottom: 34, opacity: Math.min(1, r.k * 2), transform: `translateY(${(1 - Math.min(1, r.k)) * 40}px)`}}>
              <div style={{fontSize: 38, letterSpacing: 2, color: C.muted}}>{r.label}</div>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 22}}>
                <span style={{fontSize: 76, color: C.cream}}>{r.math}</span>
                <span style={{fontSize: 120, color: C.red}}>{r.value}</span>
              </div>
            </div>
          ))}
          <div style={{fontSize: 46, color: C.orange, opacity: ramp(tExample - 0.1, 0.4)}}>IN THIS EXAMPLE, THE SELLER IS DOWN…</div>
        </div>
      )}

      {/* result, then the inputs it depends on */}
      {result > 0.01 && (
        <>
          <VText y={520} size={72} color={C.muted} o={Math.min(1, result * 2) * (1 - sliders)}>
            $14 + $30
          </VText>
          <VText y={lerp(610, 400, sliders)} size={290} color={C.red} s={lerp(0.7, 1, Math.min(1, result))} o={Math.min(1, result * 2)} style={{fontVariantNumeric: 'tabular-nums', letterSpacing: -8}}>
            −${loss}
          </VText>
          <VText y={lerp(930, 720, sliders)} size={50} o={Math.min(1, result * 2)}>
            on <span style={{color: C.orange}}>one</span> return, <span style={{color: C.orange}}>in this example</span>
          </VText>
        </>
      )}
      {sliders > 0.01 && (
        <div style={{position: 'absolute', left: 90, width: 840, top: 840, opacity: sliders}}>
          <Slider label="Return shipping" value={ship} min={2} max={14} prefix="−" />
          <Slider label="Handling" value={handle} min={2} max={10} prefix="−" />
          <Slider label="Resells for" value={resaleV} min={50} max={90} prefix="" />
        </div>
      )}

      {grid > 0.01 && (
        <>
          <VText y={330} size={60} color={C.orange} o={grid}>
            REAL COSTS DEPEND ON
          </VText>
          <Tile x={295} y={460} k={pop(tProduct - 0.1)} o={grid} label="THE PRODUCT">
            <Jacket />
          </Tile>
          <Tile x={750} y={460} k={pop(tCarrier - 0.1)} o={grid} label="CARRIER CONTRACT">
            <Truck />
          </Tile>
          <Tile x={295} y={860} k={pop(tWarehouse - 0.1)} o={grid} label="THE WAREHOUSE">
            <Warehouse />
          </Tile>
          <Tile x={750} y={860} k={pop(tCondition - 0.1)} o={grid} label="ITEM CONDITION">
            <Magnifier />
          </Tile>
        </>
      )}

      {/* illustrative stamp (always on top) */}
      {stampIn > 0.01 && <IllustrativeStamp y={lerp(860, 186, park)} s={lerp(Math.min(1.05, lerp(1.4, 1, stampIn)), 0.66, park)} o={Math.min(1, stampIn * 2)} />}
    </>
  );
};
