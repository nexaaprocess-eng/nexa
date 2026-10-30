import React from 'react';
import {interpolate} from 'remotion';
import {CheckoutSet, Product} from '../../components/grocery';
import {Place} from '../../components/icons';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Illustrative, Kicker, Stage, Title} from '../../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';
import {BASKET, BASKET_COST, BASKET_GM, BASKET_PRICE, margin} from './basket';

// One HYPOTHETICAL basket (basket.ts). Shots: checkout lane scanning the ten items -> receipt;
// close-ups on milk / cereals / deli with price-vs-cost bars; a basket profit waterfall built item by item.

const money = (v: number) => `$${v.toFixed(2)}`;

/** Price bar with the cost portion inside it: what the store keeps is the green remainder. */
const PriceCost: React.FC<{price: number; cost: number; t: number; w?: number; big?: boolean}> = ({price, cost, t, w = 620, big}) => {
  const scale = w / 10;
  return (
    <div style={{width: w}}>
      <div style={{position: 'relative', height: big ? 70 : 54, width: price * scale, background: C.bg2, borderRadius: 10, border: `2px solid ${C.line}`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: cost * scale * t, background: 'rgba(228,87,87,0.75)'}} />
        <div style={{position: 'absolute', left: cost * scale, top: 0, bottom: 0, width: (price - cost) * scale * Math.max(0, (t - 0.6) / 0.4), background: C.green}} />
      </div>
      <div style={{display: 'flex', gap: 26, marginTop: 10, fontFamily: FONT_BODY, fontSize: 30, color: C.muted, opacity: t}}>
        <span>
          price <b style={{color: C.cream}}>{money(price)}</b>
        </span>
        <span>
          cost <b style={{color: C.red}}>{money(cost)}</b>
        </span>
        <span>
          kept <b style={{color: C.green}}>{money(price - cost)}</b> ({(((price - cost) / price) * 100).toFixed(0)}%)
        </span>
      </div>
    </div>
  );
};

export const S04Basket: React.FC = () => {
  const b = useBeats();
  const {frame, fps} = b;
  const t = frame / fps;
  const scanStart = b.at(0, 0.6) / fps;
  const scanEnd = b.word(1, /register/i, 0.8) / fps;
  const items = BASKET.map((it, i) => ({kind: it.kind, at: scanStart + ((scanEnd - scanStart) * (i + 0.5)) / BASKET.length}));
  const scanned = items.filter((i) => i.at <= t).length;
  const running = BASKET.slice(0, scanned).reduce((a, x) => a + x.price, 0);
  const milk = BASKET[0];
  const nat = BASKET[4];
  const own = BASKET[5];
  const deli = BASKET[7];
  // waterfall geometry
  const wfX = 200;
  const wfW = 1520;
  const wfBase = 760;
  const pxPer$ = 24; // vertical
  let cum = 0;
  return (
    <SceneShell drift={[0, 0]} zoom={0.015}>
      <Illustrative />

      {/* beats 0-1: the lane scans the ten items; a receipt builds */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 1)}}>
        <Stage>
          <g transform="translate(-120 40)">
            <CheckoutSet t={t} items={items} total={money(running)} receipt={Math.min(1, scanned / 10)} y={700} />
          </g>
        </Stage>
        <Abs x={140} y={200} w={760} o={b.ramp(0, 0.3)}>
          <Kicker>A hypothetical basket</Kicker>
          <Title size={64} style={{marginTop: 10}}>
            Prices & costs are invented
          </Title>
          <Body size={32} color={C.muted} style={{marginTop: 10}}>
            not data from any real store
          </Body>
        </Abs>
        <Abs x={1000} y={200} w={760} align="right" o={b.ramp(1, 0)}>
          <Title size={120}>
            10 items · <span style={{color: C.orange}}>{money(BASKET_PRICE)}</span>
          </Title>
        </Abs>
      </div>

      {/* beat 2: milk, the (possible) loss leader */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 2)}}>
        <Stage>
          <Place x={420} y={560} s={2.6 * (0.9 + 0.1 * b.pop(2))}>
            <Product kind="milk" />
          </Place>
        </Stage>
        <Abs x={820} y={250} w={1000}>
          <Kicker>Milk in this example</Kicker>
          <div style={{marginTop: 24}}>
            <PriceCost price={milk.price} cost={milk.cost} t={b.ramp(2, 0.3, 1.4)} big />
          </div>
          <Title size={58} style={{marginTop: 30, opacity: b.rampAt(b.word(2, /loss|leaders/i, 0.55), 0.4)}}>
            Loss leader: <span style={{color: C.orange}}>a thin margin, or even below cost,</span> to bring shoppers in
          </Title>
          <Body size={30} color={C.muted} style={{marginTop: 16, opacity: b.rampAt(b.word(2, /sometimes/i, 0.3), 0.4)}}>
            A tactic stores sometimes use, not a rule for every staple
          </Body>
        </Abs>
      </div>

      {/* beat 3: store brand vs national brand, then the deli */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <Stage>
          {/* shelf lip */}
          <rect x={120} y={790} width={1680} height={22} fill={C.panel} stroke={C.cream} strokeWidth={3} />
          <Place x={300} y={668} s={1.4}>
            <Product kind="cereal" />
          </Place>
          <Place x={620} y={668} s={1.4}>
            <Product kind="storecereal" />
          </Place>
          <Place x={1500} y={690} s={1.5 * b.popAt(b.word(3, /deli|prepared/i, 0.6))}>
            <Product kind="deli" />
          </Place>
        </Stage>
        <Abs x={140} y={210} w={1000}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <div>
              <Body size={32} color={C.cream} weight={700}>
                National brand
              </Body>
              <PriceCost price={nat.price} cost={nat.cost} t={b.ramp(3, 0.1, 1.2)} w={700} />
            </div>
            <div>
              <Body size={32} color={C.orange} weight={700}>
                Store brand
              </Body>
              <PriceCost price={own.price} cost={own.cost} t={b.ramp(3, 0.8, 1.2)} w={700} />
            </div>
          </div>
        </Abs>
        <Abs x={1180} y={220} w={660} o={b.rampAt(b.word(3, /deli|prepared/i, 0.6), 0.5)}>
          <Body size={32} color={C.green} weight={700}>
            Deli meal
          </Body>
          <PriceCost price={deli.price} cost={deli.cost} t={b.rampAt(b.word(3, /deli|prepared/i, 0.6), 1.2)} w={620} />
        </Abs>
        <Abs x={860} y={560} w={470} o={b.ramp(3, 1.6)}>
          <Body size={34} color={C.cream}>
            Cheaper for the shopper, <b style={{color: C.green}}>more profit</b> for the store
          </Body>
        </Abs>
      </div>

      {/* beats 4-5: basket profit waterfall, item by item */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 5)}}>
        <Abs x={wfX} y={205} w={1000}>
          <Kicker>What this basket leaves after product costs</Kicker>
        </Abs>
        <Stage>
          <line x1={wfX} y1={wfBase} x2={wfX + wfW} y2={wfBase} stroke={C.line} strokeWidth={4} />
          {BASKET.map((it, i) => {
            const gp = it.price - it.cost;
            const y0 = cum;
            cum += gp;
            const g = interpolate(frame, [b.at(4, -0.2) + i * 5, b.at(4, -0.2) + i * 5 + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const x = wfX + 20 + i * 128;
            const best = b.during(5, 5) * (margin(it) > 0.3 ? 1 : 0);
            return (
              <g key={it.name} opacity={g}>
                <rect x={x} y={wfBase - (y0 + gp * g) * pxPer$} width={96} height={Math.max(3, gp * pxPer$ * g)} rx={5} fill={margin(it) < 0.08 ? C.red : C.green} stroke={best ? C.cream : 'none'} strokeWidth={4} />
                {i < BASKET.length - 1 && <line x1={x + 96} y1={wfBase - cum * pxPer$} x2={x + 128} y2={wfBase - cum * pxPer$} stroke={C.muted} strokeWidth={3} strokeDasharray="5 5" />}
                <g transform={`translate(${x + 48} ${wfBase + 50}) scale(0.32)`}>
                  <Product kind={it.kind} />
                </g>
                <text x={x + 48} y={wfBase - (y0 + gp) * pxPer$ - 14} textAnchor="middle" fontSize={28} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
                  +{gp.toFixed(2)}
                </text>
              </g>
            );
          })}
          {/* total column */}
          <g opacity={b.ramp(4, 2.2)}>
            <rect x={wfX + 20 + 10 * 128 + 20} y={wfBase - (BASKET_PRICE - BASKET_COST) * pxPer$ * b.ramp(4, 2.2, 0.8)} width={150} height={(BASKET_PRICE - BASKET_COST) * pxPer$ * b.ramp(4, 2.2, 0.8)} rx={6} fill={C.orange} />
          </g>
        </Stage>
        <Abs x={220} y={250} w={760} o={b.ramp(4, 2.4)}>
          <Title size={110} color={C.orange}>
            {(BASKET_GM * 100).toFixed(1)}%
          </Title>
          <Body size={32} color={C.cream}>
            gross margin on {money(BASKET_PRICE)}: {money(BASKET_PRICE - BASKET_COST)} after product costs
          </Body>
          <Body size={28} color={C.muted} style={{marginTop: 8}}>
            Numbers chosen to land near Kroger’s reported 22.9%
          </Body>
        </Abs>
        <Abs x={1140} y={270} w={680} o={b.ramp(5, 0.2)}>
          <div style={{background: C.green, borderRadius: 16, padding: '18px 26px'}}>
            <Title size={46} color={C.bg}>
              The mix has to be profitable, not every item
            </Title>
          </div>
        </Abs>
      </div>
    </SceneShell>
  );
};
