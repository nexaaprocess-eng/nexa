import React from 'react';
import {AisleSet, Product, ShelfUnit} from '../../components/grocery';
import {Place} from '../../components/icons';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Chip, Counter, Kicker, Source, Stage, Title} from '../../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';

// Private label. Dolly down an aisle; store-brand facings light up on a shelf; Our Brands as a share of
// Kroger sales (26.4%); Costco's own words about Kirkland Signature; and a conceptual (not data) split
// of who keeps what on a national brand vs a store brand.

export const S07PrivateLabel: React.FC = () => {
  const b = useBeats();
  const {frame, fps} = b;
  const t = frame / fps;
  const share = 26.42;
  const pieT = b.ramp(2, 0.1, 1.2);
  const ang = (share / 100) * 360 * pieT;
  const arc = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return `${Math.cos(a) * r} ${Math.sin(a) * r}`;
  };
  return (
    <SceneShell drift={[0, 0]} zoom={0.012} beatCamera={false}>
      {/* beat 0: down the aisle */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <Stage>
          <AisleSet dolly={0.6 * b.ramp(0, -0.3, 3)} t={t} />
        </Stage>
        <Abs x={0} y={780} w={1920} align="center" o={b.ramp(0, 0.3)}>
          <Chip size={52}>The store’s own brand</Chip>
        </Abs>
      </div>

      {/* beat 1: Our Brands at Kroger */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
        <Source>Kroger 10-K fiscal 2025 · “Our Brands … represented over $39 billion of our sales in 2025” · “on average, stock over 13,000 private label items”</Source>
        <Stage>
          <ShelfUnit
            x={100}
            y={330}
            w={1000}
            levels={3}
            pitch={120}
            scale={0.42}
            seed={7}
            kinds={['storecereal', 'cereal', 'pasta', 'coffee', 'can', 'detergent']}
            stock={(i) => 0.55 + 0.45 * b.ramp(1, 0.2 + (i % 8) * 0.05, 0.3)}
          />
          {/* spotlight sweeping over the store-brand facings */}
          <rect x={100 + ((t * 240) % 1000)} y={300} width={120} height={600} fill="rgba(245,158,11,0.10)" />
        </Stage>
        <Abs x={1180} y={250} w={680}>
          <Kicker>Kroger “Our Brands”</Kicker>
          <Counter value={39} t={b.rampAt(b.word(1, /39|billion/i, 0.4), 1.2)} prefix="$" suffix="B+" size={170} color={C.orange} />
          <Body size={34}>of sales in fiscal 2025</Body>
          <div style={{marginTop: 34, opacity: b.rampAt(b.word(1, /13,000|thousand|private/i, 0.8), 0.5)}}>
            <Counter value={13000} t={b.rampAt(b.word(1, /13,000|thousand|private/i, 0.8), 1.2)} suffix="+" size={110} />
            <Body size={32}>private-label items in an average Kroger supermarket</Body>
          </div>
        </Abs>
      </div>

      {/* beat 2: roughly a quarter of sales */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 2)}}>
        <Stage>
          <g transform="translate(620 560)">
            <circle r={300} fill={C.panel} stroke={C.line} strokeWidth={4} />
            {ang > 0.5 && <path d={`M0 0 L${arc(0, 300)} A300 300 0 ${ang > 180 ? 1 : 0} 1 ${arc(ang, 300)} Z`} fill={C.orange} stroke={C.cream} strokeWidth={4} />}
          </g>
        </Stage>
        <Abs x={1040} y={330} w={800}>
          <Title size={160} color={C.orange}>
            ≈ 1/4
          </Title>
          <Body size={38} style={{marginTop: 10}}>
            $39B of $147.6B in sales = <b style={{color: C.orange}}>26.4%</b>
          </Body>
          <Body size={28} color={C.muted} style={{marginTop: 10}}>
            Hidden Ledger calculation from the 10-K (“over $39 billion”, so a lower bound)
          </Body>
        </Abs>
      </div>

      {/* beat 3: Costco's own words about Kirkland Signature */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <Source>Costco 10-K fiscal 2026 (Item 1, Business)</Source>
        <Stage>
          <Place x={360} y={560} s={2.2}>
            <Product kind="storecereal" />
          </Place>
        </Stage>
        <Abs x={760} y={250} w={1060}>
          <Kicker>Costco on its Kirkland Signature products</Kicker>
          <div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 30}}>
            {[
              {q: '“prices that are generally lower than national brands”', c: C.green, w: /lower|priced/i, arrow: '↓'},
              {q: '“generally earn higher margins”', c: C.orange, w: /margins|higher/i, arrow: '↑'},
            ].map((d) => {
              const o = b.rampAt(b.word(3, d.w, 0.5), 0.5);
              return (
                <div key={d.q} style={{display: 'flex', gap: 26, alignItems: 'center', opacity: o, transform: `translateX(${40 * (1 - o)}px)`}}>
                  <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 110, color: d.c, width: 90}}>{d.arrow}</div>
                  <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: C.cream, lineHeight: 1.25}}>{d.q}</div>
                </div>
              );
            })}
          </div>
        </Abs>
      </div>

      {/* beat 4: how both can be true (conceptual) */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <Abs x={0} y={150} w={1920} align="center">
          <Title size={60}>How both can be true</Title>
          <Body size={30} color={C.muted} style={{marginTop: 8}}>
            Conceptual diagram: bar lengths are not data
          </Body>
        </Abs>
        <Abs x={240} y={330} w={1440}>
          {[
            {n: 'National brand', parts: [{l: 'making the product', v: 52, c: '#5B7FA6'}, {l: 'brand owner', v: 22, c: C.blue}, {l: 'store', v: 14, c: C.green}], at: 0.4},
            {n: 'Store brand', parts: [{l: 'making the product', v: 46, c: '#5B7FA6'}, {l: 'store', v: 22, c: C.green}], at: 1.6},
          ].map((row) => {
            const o = b.ramp(4, row.at, 0.6);
            return (
              <div key={row.n} style={{marginBottom: 56, opacity: o}}>
                <Body size={38} weight={700} color={row.n === 'Store brand' ? C.orange : C.cream}>
                  {row.n}: <span style={{color: C.muted, fontWeight: 500}}>what the shopper pays</span>
                </Body>
                <div style={{display: 'flex', marginTop: 12, height: 86}}>
                  {row.parts.map((p) => (
                    <div key={p.l} style={{width: `${p.v * o}%`, background: p.c, borderRight: `4px solid ${C.bg}`, display: 'flex', alignItems: 'center', paddingLeft: 16, overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: FONT_BODY, fontWeight: 700, fontSize: 28, color: C.bg}}>
                      {p.l}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </Abs>
        <Abs x={0} y={720} w={1920} align="center" o={b.rampAt(b.word(4, /less|charge/i, 0.6), 0.5)}>
          <Body size={40} weight={600}>
            Retailer controls product, label and price → <b style={{color: C.green}}>lower price</b>, <b style={{color: C.orange}}>larger share</b>
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
