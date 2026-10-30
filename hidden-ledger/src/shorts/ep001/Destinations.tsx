import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Box, Doc, Heart, Jacket, Magnifier, Pallet, Place, Recycle, Store, Tag, Truck, Wrench} from '../../components/icons';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';
import {lerp, useClock, VStage, VText} from '../kit';

// Short 3 (s06-01..s06-06): where an inspected return goes. One full-screen panel per destination,
// stacked vertically and pushed up as the narration moves on, each with one large animated subject.
// The $800B panel shows the figure as stated (no count-up through made-up intermediate values)
// and quotes the study's abstract with both caveats (includes never-sold excess stock; a
// background figure the study cites, not one it measured).

const Panel: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => {
  const {ramp} = useClock();
  const enter = ramp(a, 0.45);
  const leave = ramp(b - 0.25, 0.45);
  if (enter <= 0 || leave >= 1) return null;
  return <AbsoluteFill style={{transform: `translateY(${(1 - enter) * 1000 - leave * 1000}px)`, opacity: Math.min(enter * 1.5, 1 - leave)}}>{children}</AbsoluteFill>;
};

const Heading: React.FC<{n?: string; children: React.ReactNode}> = ({n, children}) => (
  <div style={{position: 'absolute', top: 200, left: 60, right: 60, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22}}>
    {n && (
      <div style={{width: 84, height: 84, borderRadius: 42, background: C.orange, color: C.bg, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</div>
    )}
    <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 78, color: C.cream, letterSpacing: -1}}>{children}</div>
  </div>
);

const Chip: React.FC<{x: number; y: number; k: number; bg?: string; color?: string; size?: number; children: React.ReactNode}> = ({x, y, k, bg = C.orange, color = C.bg, size = 46, children}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: x, top: y, transform: `translateX(-50%) scale(${Math.min(1.08, k)})`, opacity: Math.min(1, k * 2), fontFamily: FONT_TITLE, fontWeight: 700, fontSize: size, color, background: bg, borderRadius: 16, padding: '10px 26px', whiteSpace: 'nowrap'}}>
      {children}
    </div>
  ) : null;

export const Destinations: React.FC = () => {
  const {t, word, ramp, pop} = useClock();

  const tBack = word('s06-01', /^Back/);
  const tInspected = word('s06-01', /^inspected/);
  const tWhere = word('s06-01', /^where/);
  const tSellable = word('s06-02', /^sellable/);
  const tCondition = word('s06-02', /^condition/);
  const tStock = word('s06-02', /^stock/);
  const tNew = word('s06-02', /^new/);
  const tIf3 = word('s06-03', /^If/);
  const tOpened = word('s06-03', /^opened/);
  const tPerfect = word('s06-03', /^perfect/);
  const tUsed = word('s06-03', /^used/);
  const tBox = word('s06-03', /^box/);
  const tDiscount = word('s06-03', /^discount/);
  const tSome = word('s06-04', /^Some/);
  const tRepaired = word('s06-04', /^repaired/);
  const tOthers = word('s06-04', /^others/);
  const tBulk = word('s06-04', /^bulk/);
  const tLiquidators = word('s06-04', /^liquidators/);
  const tStores = word('s06-04', /^discount/);
  const tSecondary = word('s06-04', /^secondary/);
  const tA = word('s06-05', /^A$/);
  const tStudy = word('s06-05', /^study/);
  const tJournal = word('s06-05', /^Journal/);
  const t800 = word('s06-05', /^\$800/);
  const tReturned = word('s06-05', /^returned/);
  const tExcess = word('s06-05', /^excess/);
  const tPasses = word('s06-05', /^passes/);
  const tYear = word('s06-05', /^year/);
  const tItems = word('s06-06', /^Items/);
  const tSeller = word('s06-06', /^seller/);
  const tDonated = word('s06-06', /^donated/);
  const tRecycled = word('s06-06', /^recycled/);
  const END = 1e9;

  // intro: inspection
  const sweep = ramp(tInspected - 0.5, 0.9);
  const passed = pop(tInspected + 0.45);
  const where = pop(tWhere);

  // 1 back in stock
  const slideIn = ramp(tCondition - 0.2, 0.7);
  const ok = pop(tCondition);
  const isNew = pop(tNew + 0.08);

  // 2 open box
  const opened = ramp(tOpened - 0.1, 0.4);
  const flaw = pop(tPerfect);
  const used = pop(tUsed + 0.08);
  const openBox = pop(tBox);
  const disc = pop(tDiscount - 0.05);
  const priceDrop = ramp(tDiscount, 0.6);

  // 3 repaired
  const stitch = ramp(tRepaired - 0.2, 1.4);
  const wrenchRot = Math.sin((t - tSome) * 9) * 22;

  // 4 bulk
  const boxes = Math.max(0, Math.min(6, Math.floor((t - (tOthers + 0.1)) / 0.2) + 1));
  const palletUp = ramp(tLiquidators + 0.4, 0.6);
  const stores = pop(tStores - 0.1);
  const secondary = pop(tSecondary - 0.1);

  // 5 $800B
  const big = pop(t800 - 0.1);
  const paper = pop(tStudy - 0.45) * (1 - ramp(t800 - 0.6, 0.45));
  const sourceLine = ramp(t800 - 0.45, 0.4);
  const towerRows = Math.max(0, Math.min(4, (t - tReturned) / 1.1 + 1));

  return (
    <>
      {/* intro: the jacket comes out of inspection */}
      <Panel a={tBack - 0.6} b={tSellable - 0.35}>
        <VStage>
          <Place x={540} y={920} s={2.3}>
            <g transform="translate(0 -150)">
              <Jacket />
            </g>
            <Box open={1} />
          </Place>
          <g transform={`translate(${lerp(330, 860, sweep)} ${lerp(620, 560, Math.sin(sweep * Math.PI))}) scale(1.8)`} opacity={ramp(tInspected - 0.7, 0.2) * (1 - passed)}>
            <Magnifier />
          </g>
        </VStage>
        <Chip x={540} y={1110} k={passed} bg={C.green} color={C.cream} size={56}>
          ✓ INSPECTED
        </Chip>
        <VText y={200} size={84} s={lerp(0.6, 1, Math.min(1, where))} o={Math.min(1, where * 2)}>
          WHERE DOES IT <span style={{color: C.orange}}>GO?</span>
        </VText>
      </Panel>

      {/* 1: back into stock */}
      <Panel a={tSellable - 0.35} b={tIf3}>
        <Heading n="1">BACK IN STOCK</Heading>
        <VStage>
          <line x1={90} x2={990} y1={480} y2={480} stroke={C.muted} strokeWidth={14} strokeLinecap="round" />
          {[210, 870].map((x) => (
            <g key={x} opacity={0.35}>
              <Place x={x} y={480 + 198 * 1.25} s={1.25}>
                <g transform="translate(0 -128)">
                  <path d="M0 -40 L-90 20 L90 20 Z M0 -40 Q0 -70 20 -70" fill="none" stroke={C.cream} strokeWidth={6} />
                </g>
                <Jacket fill={C.panel} />
              </Place>
            </g>
          ))}
          <g transform={`translate(${lerp(1400, 540, slideIn)} 0)`}>
            <Place x={0} y={480 + 198 * 1.75} s={1.75} r={Math.sin((t - tCondition) * 1.8) * 4 * (1 - slideIn * 0.4)}>
              <g transform="translate(0 -128)">
                <path d="M0 -40 L-90 20 L90 20 Z M0 -40 Q0 -70 20 -70" fill="none" stroke={C.cream} strokeWidth={6} />
              </g>
              <Jacket />
              {isNew > 0.01 && (
                <g transform={`translate(70 70) rotate(${20 + Math.sin((t - tNew) * 6) * 8 * Math.exp(-(t - tNew) * 1.5)}) scale(${0.7 * Math.min(1.1, isNew)})`}>
                  <g transform="translate(90 0)">
                    <Tag text="NEW" />
                  </g>
                </g>
              )}
            </Place>
          </g>
        </VStage>
        <Chip x={540} y={330} k={ok} bg={C.green} color={C.cream}>
          ✓ SELLABLE CONDITION
        </Chip>
        <Chip x={540} y={1110} k={isNew} size={56}>
          SOLD AS NEW
        </Chip>
      </Panel>

      {/* 2: used / open-box */}
      <Panel a={tIf3 - 0.35} b={tSome}>
        <Heading n="2">USED · OPEN-BOX</Heading>
        <VStage>
          <Place x={540} y={880} s={2.5}>
            <g transform={`translate(0 ${lerp(-40, -150, opened) + Math.sin((t - tOpened) * 2.2) * 6}) rotate(${Math.sin((t - tOpened) * 1.3) * 2})`} opacity={opened}>
              <Jacket />
              {flaw > 0.01 && <circle cx={-40} cy={50} r={20 * Math.min(1.1, flaw) * (1 + 0.15 * Math.sin((t - tPerfect) * 6))} fill="none" stroke={C.red} strokeWidth={6} />}
            </g>
            <Box open={opened} />
          </Place>
        </VStage>
        <Chip x={330} y={1100} k={used} bg={C.cream}>
          USED
        </Chip>
        <Chip x={720} y={1100} k={openBox} bg={C.cream}>
          OPEN-BOX
        </Chip>
        {disc > 0.01 && (
          <div style={{position: 'absolute', left: 540, top: 820, transform: `translateX(-50%) scale(${Math.min(1.08, disc)})`, opacity: Math.min(1, disc * 2), display: 'flex', alignItems: 'center', gap: 20, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64, color: C.orange, background: C.bg2, border: `5px solid ${C.orange}`, borderRadius: 22, padding: '8px 30px', whiteSpace: 'nowrap'}}>
            <svg width={70} height={110} viewBox="0 0 70 110">
              <path d={`M35 ${8 + 20 * priceDrop} L35 ${70 + 20 * priceDrop} M12 ${50 + 20 * priceDrop} L35 ${76 + 20 * priceDrop} L58 ${50 + 20 * priceDrop}`} fill="none" stroke={C.orange} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            AT A DISCOUNT
          </div>
        )}
      </Panel>

      {/* 3: repaired */}
      <Panel a={tSome - 0.35} b={tOthers}>
        <Heading n="3">REPAIRED FIRST</Heading>
        <VStage>
          <Place x={480} y={760} s={2.9}>
            <Jacket />
            {Array.from({length: 8}).map((_, i) =>
              i < stitch * 8 ? (
                <line key={i} x1={lerp(79, 96, i / 7) - 9} y1={lerp(-55, 72, i / 7) - 3} x2={lerp(79, 96, i / 7) + 9} y2={lerp(-55, 72, i / 7) + 3} stroke={C.orange} strokeWidth={5} strokeLinecap="round" />
              ) : null,
            )}
          </Place>
          <g transform={`translate(${480 + 2.9 * lerp(79, 96, stitch) + 110} ${760 + 2.9 * lerp(-55, 72, stitch)}) rotate(${wrenchRot}) scale(1.4)`}>
            <Wrench />
          </g>
        </VStage>
      </Panel>

      {/* 4: sold in bulk to liquidators */}
      <Panel a={tOthers - 0.35} b={tA}>
        <Heading n="4">SOLD IN BULK</Heading>
        <VStage>
          <Place x={540} y={lerp(720, 580, palletUp)} s={lerp(2.6, 1.6, palletUp)}>
            <Pallet n={boxes} />
          </Place>
          {[
            {k: stores, x: 300},
            {k: secondary, x: 780},
          ].map((d) =>
            d.k > 0.01 ? <path key={d.x} d={`M540 ${lerp(900, 720, palletUp)} L${d.x} 870`} stroke={C.orange} strokeWidth={10} strokeDasharray="22 14" opacity={Math.min(1, d.k)} fill="none" /> : null,
          )}
          {stores > 0.01 && (
            <Place x={300} y={980} s={1.25 * Math.min(1.08, stores)}>
              <Store />
            </Place>
          )}
          {secondary > 0.01 && (
            <g transform={`translate(780 980) scale(${1.15 * Math.min(1.08, secondary)})`}>
              {[-70, 0, 70].map((x, i) => (
                <g key={x} transform={`translate(${x} ${i === 1 ? -40 : 20}) scale(0.5)`}>
                  <Box />
                </g>
              ))}
              <path d="M-110 70 L110 70" stroke={C.cream} strokeWidth={6} />
            </g>
          )}
        </VStage>
        <Chip x={540} y={lerp(1110, 330, palletUp)} k={pop(tLiquidators - 0.1)} bg={C.cream}>
          → LIQUIDATORS
        </Chip>
        {stores > 0.01 && (
          <VText x={300} w={420} y={1110} size={44} o={Math.min(1, stores * 2)}>
            DISCOUNT STORES
          </VText>
        )}
        {secondary > 0.01 && (
          <VText x={780} w={420} y={1110} size={44} o={Math.min(1, secondary * 2)}>
            SECONDARY MARKETS
          </VText>
        )}
      </Panel>

      {/* 5: the $800B figure */}
      <Panel a={tA - 0.35} b={tItems}>
        {paper > 0.01 && (
          <>
            <VStage>
              <g transform={`translate(540 ${lerp(760, 640, Math.min(1, paper)) + Math.sin((t - tStudy) * 1.6) * 10}) scale(${2.6 * Math.min(1.05, paper)}) rotate(${-4 + 4 * Math.min(1, paper) + Math.sin((t - tStudy) * 1.1) * 1.5})`}>
                <Doc />
                {/* highlighter running down the page while the narration reads the sentence */}
                {[-40, -14, 12, 38, 64].map((y, i) => {
                  const k = Math.max(0, Math.min(1, ramp(tJournal - 0.2, 4) * 5 - i));
                  return k > 0 ? <rect key={y} x={-60} y={y - 8} width={120 * k} height={16} fill={C.orange} opacity={0.55} /> : null;
                })}
              </g>
            </VStage>
            <VText y={250} size={84} o={Math.min(1, paper * 2)}>
              A <span style={{color: C.orange}}>2025</span> STUDY
            </VText>
            <VText y={990} size={60} o={Math.min(1, ramp(tJournal - 0.2, 0.4) * paper * 2)}>
              <i>Journal of Business Logistics</i>
            </VText>
            <VText y={1075} size={40} color={C.muted} weight={600} font="body" o={Math.min(1, ramp(tJournal + 0.6, 0.4) * paper * 2)}>
              Rogers et al.
            </VText>
          </>
        )}
        <div style={{position: 'absolute', top: 196, left: 70, right: 70, display: 'flex', alignItems: 'center', gap: 22, opacity: sourceLine}}>
          <svg width={74} height={92} viewBox="-90 -115 180 230">
            <Doc />
          </svg>
          <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 34, color: C.cream, lineHeight: 1.2}}>
            <span style={{color: C.orange, fontWeight: 700, letterSpacing: 2}}>SOURCE </span>
            Rogers et al. (2025),
            <br />
            <i>Journal of Business Logistics</i>
          </div>
        </div>
        <VText y={330} size={250} color={C.orange} s={lerp(0.7, 1, Math.min(1, big))} o={Math.min(1, big * 2)} style={{letterSpacing: -8, fontVariantNumeric: 'tabular-nums'}}>
          $800B+
        </VText>
        <VText y={612} size={58} o={ramp(tReturned - 0.2, 0.4)}>
          of returned <span style={{color: C.orange, opacity: 0.15 + 0.85 * ramp(tExcess - 0.1, 0.3)}}>+ excess</span> inventory
        </VText>
        <VText y={692} size={44} color={C.muted} weight={600} font="body" o={ramp(tPasses - 0.2, 0.4)}>
          through secondary markets, each year
        </VText>
        <VStage>
          {Array.from({length: 4}).map((_, row) =>
            [0, 1, 2, 3].map((col) => {
              const k = Math.max(0, Math.min(1, towerRows - row));
              if (k <= 0) return null;
              const excess = (row + col) % 3 === 0;
              return (
                <g key={`${row}-${col}`} transform={`translate(${255 + col * 190} ${1110 - row * 100 - (1 - k) * 60}) scale(0.95)`} opacity={k}>
                  <Box fill={excess ? '#8E7A5A' : '#C8A675'} />
                </g>
              );
            }),
          )}
        </VStage>
        <div style={{position: 'absolute', left: 70, right: 70, top: 1192, textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 600, fontSize: 36, color: '#C9C2B6', lineHeight: 1.2, opacity: ramp(tYear - 0.4, 0.4)}}>
          Includes never-sold excess stock, not only returns.
          <br />A background figure cited in the study's abstract.
        </div>
      </Panel>

      {/* 6: or back to the seller / donated / recycled */}
      <Panel a={tItems - 0.35} b={END}>
        <Heading>OR IT GOES…</Heading>
        {[
          {k: pop(tSeller), y: 340, label: 'BACK TO THE SELLER', icon: (
            <g transform={`translate(${-30 * Math.sin(Math.min(1, ramp(tSeller, 1.2)) * Math.PI)} 0) scale(-1 1)`}>
              <Truck wheel={-(t - tSeller) * 300} />
            </g>
          )},
          {k: pop(tDonated), y: 640, label: 'DONATED', icon: <g transform={`scale(${1 + 0.08 * Math.max(0, Math.sin((t - tDonated) * 8))})`}><Heart /></g>},
          {k: pop(tRecycled), y: 940, label: 'RECYCLED', icon: <g transform={`rotate(${(t - tRecycled) * 70})`}><Recycle /></g>},
        ].map((r) => (
            <div key={r.label} style={{position: 'absolute', left: 70, width: 870, top: r.y, height: 270, display: 'flex', alignItems: 'center', gap: 34, background: C.panel, borderRadius: 28, border: `4px solid ${Math.min(1, r.k) > 0.5 ? C.orange : C.line}`, padding: '0 34px', opacity: 0.3 + 0.7 * Math.min(1, r.k), transform: `scale(${lerp(0.94, 1, Math.min(1, r.k))})`}}>
              <svg width={230} height={230} viewBox="-120 -120 240 240" style={{flex: 'none'}}>
                {r.icon}
              </svg>
              <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64, color: C.cream, lineHeight: 1.02}}>{r.label}</div>
            </div>
        ))}
      </Panel>
    </>
  );
};
