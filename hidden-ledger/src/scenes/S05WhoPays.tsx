import React from 'react';
import {interpolate} from 'remotion';
import {Box, House, Invoice, Mailbox, Person, Place, Store, Tag, Truck, Warehouse} from '../components/icons';
import {StreetSet} from '../components/sets';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../components/timeline';
import {Abs, HBar, Kicker, Source, Stage} from '../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../themes/theme';

// Scene 5 (final): who absorbs the bill, shown as money physically moving between four actors.
// Coins leave the returned parcel and land with whoever pays in each case; the shopper path is dashed
// (possible, hard to measure). No amounts are implied: coins are a qualitative device.

const BOX = {x: 960, y: 520};
const A = {
  retailer: {x: 380, y: 360, label: 'Retailer'},
  market: {x: 1540, y: 360, label: 'Marketplace'},
  logistics: {x: 380, y: 700, label: 'Logistics partner'},
  shopper: {x: 1540, y: 700, label: 'Shopper'},
};
type Key = keyof typeof A;

const CoinG: React.FC<{color?: string; r?: number}> = ({color = C.red, r = 22}) => (
  <g>
    <circle r={r} fill={color} stroke={C.cream} strokeWidth={3} />
    <text y={r * 0.38} textAnchor="middle" fontSize={r * 1.05} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk">
      $
    </text>
  </g>
);

export const S05WhoPays: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  const segIdx = Math.max(0, b.ctx.segStart.filter((s) => s <= frame).length - 1);

  /** coins travelling from a to b, starting at frame f0, n coins spaced by `gap` frames */
  const stream = (from: {x: number; y: number}, to: {x: number; y: number}, f0: number, n: number, gap = 6, color: string = C.red, dashed = false) =>
    Array.from({length: n}).map((_, i) => {
      const t = interpolate(frame - f0 - i * gap, [0, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      if (t <= 0 || t >= 1) return null;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t - Math.sin(t * Math.PI) * 90;
      return (
        <g key={`${f0}-${i}`} transform={`translate(${x} ${y})`} opacity={dashed ? 0.6 : 1}>
          {dashed ? <circle r={20} fill="none" stroke={color} strokeWidth={4} strokeDasharray="6 6" /> : <CoinG color={color} />}
        </g>
      );
    });

  // which actor is the focus for each segment
  const focus: Record<number, Key[]> = {1: ['retailer'], 2: ['market'], 3: ['market'], 4: ['logistics', 'retailer'], 5: ['shopper']};
  const lit = (k: Key) => (focus[segIdx] ?? []).includes(k);

  // coin piles (count = how many coins an actor is holding)
  const fC1 = b.word(1, /absorbs/, 0.55);
  const fC2 = b.word(2, /split/, 0.6);
  const fFees = b.word(2, /fees/, 0.85);
  const fBill = b.word(4, /billing/, 0.75);
  const fPrices = b.word(5, /prices/, 0.35);
  const fShip = b.word(5, /shipping/, 0.45);
  const fMember = b.word(5, /memberships/, 0.5);
  const piles: Record<Key, number> = {
    retailer: (frame > fC1 + 30 ? 4 : 0) + (frame > fBill + 30 ? -1 : 0),
    market: frame > fFees + 30 ? 1 : 0,
    logistics: frame > fBill + 30 ? 1 : 0,
    shopper: 0,
  };
  const sellerPile = (frame > fC2 + 30 ? 3 : 0) - (frame > fFees + 30 ? 1 : 0);
  const diagramO = b.during(0, 5);

  const caption: Record<number, [string, string]> = {
    1: ['Case 1 · retailer, own products', 'typically absorbs the cost directly, at least at first'],
    2: ['Case 2 · marketplace', 'platform rules split the cost; some charge sellers return-related fees'],
    3: ['Case 2 · example', 'Amazon has charged returns processing fees on some products in its fulfillment service; rules vary and change'],
    4: ['Case 3 · logistics partners', 'carriers and returns companies are paid for their work: they bill for it'],
    5: ['Case 4 · the shopper', 'not always a fee on that return, but possibly via prices, shipping charges or memberships. Hard to measure.'],
  };
  const cap = caption[segIdx];
  const capT = b.ramp(segIdx, 0.1, 0.4);

  return (
    <SceneShell drift={[0, -4]} zoom={0.015}>
      {/* ================= money-flow stage */}
      <div style={{position: 'absolute', inset: 0, opacity: diagramO}}>
        <Stage>
          {/* faint guide lines from the parcel to each actor */}
          {(Object.keys(A) as Key[]).map((k) => (
            <line key={k} x1={BOX.x} y1={BOX.y} x2={A[k].x} y2={A[k].y} stroke={lit(k) ? C.orange : C.line} strokeWidth={lit(k) ? 6 : 3} strokeDasharray={k === 'shopper' ? '14 14' : undefined} opacity={b.ramp(0, -0.2, 0.5)} />
          ))}
          {/* the returned parcel with its cost */}
          <Place x={BOX.x} y={BOX.y} s={1.1 * b.pop(0, 0.1)}>
            <Box label="RETURN" />
          </Place>
          <text x={BOX.x} y={BOX.y + 130} textAnchor="middle" fill={C.red} fontSize={36} fontWeight={700} fontFamily="Space Grotesk" opacity={b.ramp(0, 0.6) * (1 - b.ramp(2, 0, 0.4))}>
            the cost of a free return
          </text>
          {/* actors */}
          {(Object.keys(A) as Key[]).map((k, i) => {
            const a = A[k];
            const on = b.pop(0, -0.4 + i * 0.12);
            const icon = k === 'retailer' ? <Store /> : k === 'market' ? <Warehouse /> : k === 'logistics' ? <Truck wheel={frame * 3} /> : <House />;
            return (
              <g key={k}>
                <circle cx={a.x} cy={a.y} r={128} fill={lit(k) ? 'rgba(245,158,11,0.10)' : 'rgba(29,34,41,0.6)'} stroke={lit(k) ? C.orange : C.line} strokeWidth={lit(k) ? 6 : 3} opacity={on} />
                <Place x={a.x} y={a.y - 20} s={(lit(k) ? 1.0 : 0.85) * on}>
                  {icon}
                </Place>
                {k === 'shopper' && (
                  <Place x={a.x + 95} y={a.y + 20} s={0.55 * on}>
                    <Person />
                  </Place>
                )}
                {k === 'market' && (
                  <g opacity={b.ramp(2, 0.4)}>
                    <Place x={a.x + 200} y={a.y + 40} s={0.45}>
                      <Store fill={C.blue} />
                    </Place>
                    <text x={a.x + 200} y={a.y + 120} textAnchor="middle" fill={C.blue} fontSize={30} fontWeight={700} fontFamily="Space Grotesk">
                      Seller
                    </text>
                    {Array.from({length: Math.max(0, sellerPile)}).map((_, j) => (
                      <g key={j} transform={`translate(${a.x + 170 + j * 30} ${a.y - 40})`}>
                        <CoinG r={16} />
                      </g>
                    ))}
                  </g>
                )}
                <text x={a.x} y={a.y + 172} textAnchor="middle" fill={lit(k) ? C.orange : C.cream} fontSize={42} fontWeight={700} fontFamily="Space Grotesk" opacity={on}>
                  {a.label}
                </text>
                {/* pile of coins this actor is holding */}
                {Array.from({length: Math.max(0, piles[k])}).map((_, j) => (
                  <g key={j} transform={`translate(${a.x - 60 + j * 34} ${a.y + 100})`}>
                    <CoinG r={18} />
                  </g>
                ))}
              </g>
            );
          })}
          {/* case 1: box -> retailer */}
          {stream(BOX, A.retailer, fC1 - 10, 4)}
          {/* case 2: box -> seller, seller -> platform (fees) */}
          {stream(BOX, {x: A.market.x + 200, y: A.market.y + 20}, fC2 - 10, 3)}
          {stream({x: A.market.x + 200, y: A.market.y + 20}, A.market, fFees - 6, 1, 6, C.orange)}
          {segIdx >= 2 && segIdx <= 3 && (
            <text x={A.market.x + 200} y={A.market.y + 170} textAnchor="middle" fill={C.orange} fontSize={34} fontWeight={700} fontFamily="Space Grotesk" opacity={b.rampAt(fFees, 0.4)}>
              ← fees
            </text>
          )}
          {/* case 3: invoice logistics -> retailer, then a coin back */}
          {segIdx === 4 &&
            (() => {
              const t = b.rampAt(fBill - 20, 0.7);
              return (
                <Place x={interpolate(t, [0, 1], [A.logistics.x + 60, A.retailer.x + 60])} y={interpolate(t, [0, 1], [A.logistics.y - 60, A.retailer.y + 60])} s={0.45} r={-8} o={t < 1 ? 1 : 0}>
                  <Invoice />
                </Place>
              );
            })()}
          {stream({x: A.retailer.x, y: A.retailer.y + 60}, A.logistics, fBill, 1)}
          {/* case 4: dashed, possible costs from the shopper */}
          {segIdx === 5 && (
            <>
              {stream(A.shopper, A.retailer, fPrices, 1, 6, C.red, true)}
              {stream(A.shopper, A.retailer, fShip, 1, 6, C.red, true)}
              {stream(A.shopper, A.retailer, fMember, 1, 6, C.red, true)}
              {[
                ['prices', fPrices],
                ['shipping charges', fShip],
                ['memberships', fMember],
              ].map(([l, f], i) => (
                <g key={l as string} opacity={b.rampAt(f as number, 0.3)} transform={`translate(${1060 + i * 40} ${700 + i * 48})`}>
                  <text textAnchor="middle" fill={C.red} fontSize={38} fontWeight={700} fontFamily="Space Grotesk">
                    {l as string}?
                  </text>
                </g>
              ))}
            </>
          )}
        </Stage>
        {/* question / case caption at the top */}
        <Abs x={0} y={140} w={1920} align="center" o={b.during(0, 0)}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64, color: C.cream}}>So, who pays?</div>
          <div style={{fontFamily: FONT_BODY, fontSize: 36, color: C.muted, marginTop: 4}}>It depends on who’s in the chain.</div>
        </Abs>
        {cap && (
          <Abs x={530} y={124} w={860} align="center" o={capT}>
            <div style={{display: 'inline-block', background: 'rgba(14,17,20,0.88)', borderRadius: 20, padding: '14px 30px', border: `2px solid ${C.line}`}}>
              <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, color: C.orange}}>{cap[0]}</div>
              <div style={{fontFamily: FONT_BODY, fontWeight: 500, fontSize: 30, color: C.cream, marginTop: 4, lineHeight: 1.25}}>{cap[1]}</div>
            </div>
          </Abs>
        )}
        {segIdx === 3 && <Source>Amazon Seller Central announcements on FBA returns processing fees (2024–2025); check the current rate card</Source>}
      </div>

      {/* ================= 66% -> 72% (progressive chart) */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(6, 6)}}>
        <Source>NRF & Happy Returns, 2025 Retail Returns Landscape · survey of 358 large U.S. retailers</Source>
        <Abs x={220} y={280} w={1480}>
          <Kicker>Merchants that started charging for at least one return option (past 12 months)</Kicker>
          <div style={{marginTop: 50}}>
            <HBar label="2024 survey" value={66} max={100} t={b.rampAt(b.word(6, /66/, 0.85), 0.7)} valueText="66%" color={C.line} w={1480} h={96} />
            <HBar label="2025 survey" value={72} max={100} t={b.rampAt(b.word(6, /72/, 0.45), 0.7)} valueText="72%" color={C.red} w={1480} h={96} />
          </div>
        </Abs>
      </div>

      {/* ================= routing between return methods, on a street */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(7, 7)}}>
        <Stage>
          <StreetSet scroll={frame * 1.5} />
          <Place x={330} y={700} s={1.4}>
            <Person fill={C.cream} />
          </Place>
          <Place x={1000} y={690} s={1.2 * b.pop(7, 0.3)}>
            <Mailbox />
          </Place>
          <Place x={1560} y={670} s={1.4 * b.pop(7, 1.6)}>
            <Store />
          </Place>
          {/* parcels take the free route to the store; the mail route empties out */}
          <path d="M420 640 Q 700 520 960 600" fill="none" stroke={C.red} strokeWidth={6} strokeDasharray="14 14" opacity={1 - 0.6 * b.ramp(7, 4.2, 1)} />
          <path d="M420 720 Q 1000 880 1460 720" fill="none" stroke={C.green} strokeWidth={10 + 10 * b.ramp(7, 4.2, 1)} strokeLinecap="round" />
          {Array.from({length: 3}).map((_, i) => {
            const u = ((frame / 70 + i / 3) % 1) * b.ramp(7, 4.0, 0.3);
            const x = (1 - u) ** 2 * 420 + 2 * (1 - u) * u * 1000 + u * u * 1460;
            const y = (1 - u) ** 2 * 720 + 2 * (1 - u) * u * 880 + u * u * 720;
            return u > 0 ? (
              <Place key={i} x={x} y={y - 20} s={0.3}>
                <Box />
              </Place>
            ) : null;
          })}
          <Place x={1000} y={470} s={0.75 * b.pop(7, 0.8)} r={-6}>
            <Tag text="FEE" fill={C.red} textColor={C.cream} />
          </Place>
          <Place x={1560} y={420} s={0.75 * b.pop(7, 2.4)} r={-6}>
            <Tag text="FREE" fill={C.green} />
          </Place>
        </Stage>
        <Abs x={0} y={140} w={1920} align="center" o={b.ramp(7, 0)}>
          <div style={{display: 'inline-block', background: 'rgba(14,17,20,0.85)', borderRadius: 18, padding: '10px 28px', fontFamily: FONT_BODY, fontSize: 40, fontWeight: 600, color: C.cream}}>
            A fee on one method, another stays free
          </div>
        </Abs>
        <Abs x={0} y={250} w={1920} align="center" o={b.rampAt(b.word(7, /vanish/, 0.7), 0.6)}>
          <div style={{display: 'inline-block', background: 'rgba(14,17,20,0.85)', borderRadius: 18, padding: '8px 28px', fontFamily: FONT_TITLE, fontSize: 60, fontWeight: 700, color: C.cream}}>
            The cost doesn’t vanish. <span style={{color: C.orange}}>It gets routed.</span>
          </div>
        </Abs>
      </div>
    </SceneShell>
  );
};
