import React from 'react';
import {interpolate} from 'remotion';
import {Bill, CheckoutSet, MemberCard, Product, ProductKind} from '../../components/grocery';
import {Invoice, Place} from '../../components/icons';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Kicker, LedgerMark, Source, Stage, Title} from '../../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';

// Payoff: back at the checkout; six levers tick into a ledger on the spoken words; the $100 bill splits
// into where it goes; end card.

const LEVERS: {l: string; w: RegExp; draw: React.ReactNode}[] = [
  {l: 'Enormous volume', w: /volume/i, draw: <Product kind="can" />},
  {l: 'Fast inventory turns', w: /turning|inventory/i, draw: <circle r={70} fill="none" stroke={C.cream} strokeWidth={14} strokeDasharray="300 140" />},
  {l: 'Supplier credit', w: /supplier|credit/i, draw: <Invoice lines={3} />},
  {l: 'Own brands', w: /brands/i, draw: <Product kind="storecereal" />},
  {l: 'Fighting shrink', w: /shrink/i, draw: <Product kind="salad" />},
  {l: 'Membership & advertising', w: /membership|advertising/i, draw: <MemberCard />},
];

export const S10Payoff: React.FC = () => {
  const b = useBeats();
  const {frame, fps} = b;
  const t = frame / fps;
  const items: {kind: ProductKind; at: number}[] = Array.from({length: 12}).map((_, i) => ({kind: (['milk', 'bread', 'coffee', 'eggs', 'bananas', 'pasta'] as ProductKind[])[i % 6], at: -2 + i * 1.1}));
  const split = b.ramp(2, 1.0, 1.4);
  return (
    <SceneShell drift={[0, 0]} zoom={0.015} beatCamera={false}>
      {/* beat 0: the question again, at the checkout */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <Stage>
          <CheckoutSet t={t} items={items} total="$100.00" receipt={0.6} y={700} />
        </Stage>
        <Abs x={0} y={170} w={1920} align="center" o={b.ramp(0, 0)}>
          <Title size={80}>
            So how do supermarkets make money
            <br />
            on <span style={{color: C.orange}}>tiny margins</span>?
          </Title>
        </Abs>
      </div>

      {/* beat 1: six levers */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
        <Stage>
          {LEVERS.map((lv, i) => {
            const f0 = b.word(1, lv.w, (i + 0.5) / 6);
            const o = b.rampAt(f0, 0.35);
            const x = 330 + (i % 3) * 630;
            const y = 330 + Math.floor(i / 3) * 290;
            return (
              <g key={lv.l} opacity={0.15 + 0.85 * o}>
                <rect x={x - 280} y={y - 120} width={560} height={240} rx={22} fill={C.panel} stroke={o > 0.5 ? C.green : C.line} strokeWidth={5} />
                <g transform={`translate(${x - 170} ${y}) scale(${0.6 * (0.8 + 0.2 * b.popAt(f0))})`}>{lv.draw}</g>
                <g transform={`translate(${x + 220} ${y - 70})`} opacity={o}>
                  <circle r={30} fill={C.green} />
                  <path d="M-14 0 L-4 12 L16 -12" fill="none" stroke={C.bg} strokeWidth={7} strokeLinecap="round" />
                </g>
              </g>
            );
          })}
        </Stage>
        {LEVERS.map((lv, i) => {
          const o = b.rampAt(b.word(1, lv.w, (i + 0.5) / 6), 0.35);
          return (
            <div key={lv.l} style={{position: 'absolute', left: 330 + (i % 3) * 630 - 80, top: 330 + Math.floor(i / 3) * 290 - 40, width: 320, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, lineHeight: 1.1, color: C.cream, opacity: 0.25 + 0.75 * o}}>
              {lv.l}
            </div>
          );
        })}
        <Abs x={0} y={150} w={1920} align="center">
          <Kicker>Six levers</Kicker>
        </Abs>
      </div>

      {/* beat 2: where the $100 goes */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 2)}}>
        <Source>Kroger 10-K · operating profit per $100 of sales: $1.28 (fiscal 2025, incl. $2.5B charge), $2.62 (fiscal 2024)</Source>
        <Stage>
          <Place x={960} y={interpolate(split, [0, 1], [480, 330])} s={interpolate(split, [0, 1], [1.4, 0.7])} o={1 - split * 0.6}>
            <Bill />
          </Place>
        </Stage>
        <Abs x={160} y={470} w={1600} o={split}>
          <div style={{display: 'flex', height: 120, borderRadius: 14, overflow: 'hidden', border: `3px solid ${C.cream}`}}>
            {[
              {l: 'the food', v: 77.1, c: C.red, w: /food/i},
              {l: 'people · stores · trucks', v: 21.6, c: '#B5523B', w: /people|buildings/i},
              {l: '', v: 1.3, c: C.green, w: /operating/i},
            ].map((p) => (
              <div key={p.l || 'kept'} style={{width: `${p.v}%`, background: p.c, display: 'flex', alignItems: 'center', paddingLeft: p.l ? 20 : 0, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 26, color: C.cream, whiteSpace: 'nowrap', overflow: 'hidden', opacity: 0.4 + 0.6 * b.rampAt(b.word(2, p.w, 0.6), 0.4)}}>
                {p.l}
              </div>
            ))}
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 20, opacity: b.rampAt(b.word(2, /operating|three/i, 0.45), 0.4)}}>
            <div style={{textAlign: 'right'}}>
              <Title size={84} color={C.green}>
                $1–3 kept
              </Title>
              <Body size={32} color={C.muted}>
                as operating profit at a chain like Kroger
              </Body>
            </div>
          </div>
        </Abs>
      </div>

      {/* beat 3: end card */}
      <div style={{position: 'absolute', inset: 0, opacity: b.ramp(3, -0.2, 0.6)}}>
        <Abs x={0} y={330} w={1920} align="center">
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
            <LedgerMark size={120} />
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 110, letterSpacing: 10, color: C.cream}}>HIDDEN LEDGER</div>
          </div>
          <Body size={40} color={C.muted} style={{marginTop: 40}}>
            Every number in this video is sourced in the description
          </Body>
          <Body size={34} color={C.orange} style={{marginTop: 24, fontWeight: 700}}>
            Episode 002 · How Supermarkets Make Money on Tiny Margins
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
