import React from 'react';
import {interpolate} from 'remotion';
import {MemberCard, Product, StoreFront} from '../../components/grocery';
import {Place} from '../../components/icons';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Chip, Kicker, Source, Stage, Title} from '../../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';

// Three models side by side; then the camera "visits" each storefront in turn (Walmart, Costco, Kroger)
// with its own figures; ends on why 24% and 11% gross margins are not comparable.

const FRONTS = [
  {type: 'supermarket' as const, l: 'Supermarket', x: 360},
  {type: 'supercenter' as const, l: 'Supercenter', x: 960},
  {type: 'club' as const, l: 'Warehouse club', x: 1560},
];

const Pie: React.FC<{pct: number; t: number; r?: number; color: string}> = ({pct, t, r = 170, color}) => {
  const a = (pct / 100) * 360 * t;
  const pt = (deg: number) => `${Math.cos(((deg - 90) * Math.PI) / 180) * r} ${Math.sin(((deg - 90) * Math.PI) / 180) * r}`;
  return (
    <g>
      <circle r={r} fill={C.panel} stroke={C.line} strokeWidth={4} />
      {a > 0.5 && <path d={`M0 0 L${pt(0)} A${r} ${r} 0 ${a > 180 ? 1 : 0} 1 ${pt(a)} Z`} fill={color} stroke={C.cream} strokeWidth={4} />}
    </g>
  );
};

export const S09Models: React.FC = () => {
  const b = useBeats();
  const t = b.frame / b.fps;
  return (
    <SceneShell drift={[0, 0]} zoom={0.01} beatCamera={false}>
      {/* beat 0: three fronts */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <Stage>
          <rect x={0} y={700} width={1920} height={30} fill="#2A3038" />
          {FRONTS.map((f, i) => (
            <Place key={f.type} x={f.x} y={interpolate(b.pop(0, 0.2 + i * 0.35), [0, 1], [900, 560])} s={0.95} o={b.ramp(0, 0.2 + i * 0.35, 0.3)}>
              <StoreFront type={f.type} glow={0.5 + 0.5 * Math.sin(t * 2 + i)} />
            </Place>
          ))}
        </Stage>
        {FRONTS.map((f, i) => (
          <Abs key={f.l} x={f.x - 300} y={760} w={600} align="center" o={b.ramp(0, 0.5 + i * 0.35)}>
            <Title size={50}>{f.l}</Title>
          </Abs>
        ))}
        <Abs x={0} y={160} w={1920} align="center" o={b.ramp(0, 0)}>
          <Title size={64}>Not everyone who sells groceries plays the same game</Title>
        </Abs>
      </div>

      {/* beat 1: Walmart */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
        <Source>Walmart 10-K fiscal 2026 · Walmart U.S. grocery $285.5B of $483.0B net sales · consolidated figures</Source>
        <Stage>
          <Place x={330} y={330} s={0.85}>
            <StoreFront type="supercenter" glow={1} />
          </Place>
          <g transform="translate(330 700)">
            <Pie pct={59.11} t={b.rampAt(b.word(1, /grocery|59/i, 0.3), 1.0)} color={C.green} />
          </g>
        </Stage>
        <Abs x={640} y={250} w={1200}>
          <Kicker>Walmart · general merchandise giant</Kicker>
          <div style={{display: 'flex', gap: 60, marginTop: 24}}>
            {[
              {v: '59%', l: 'of Walmart U.S. sales were grocery', c: C.green, w: /grocery|59/i},
              {v: '24.2%', l: 'gross profit rate (consolidated)', c: C.orange, w: /gross/i},
              {v: '4.2%', l: 'operating income', c: C.green, w: /operating/i},
            ].map((d) => {
              const o = b.rampAt(b.word(1, d.w, 0.5), 0.4);
              return (
                <div key={d.v} style={{width: 340, opacity: o, transform: `translateY(${20 * (1 - o)}px)`}}>
                  <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 110, color: d.c}}>{d.v}</div>
                  <Body size={32}>{d.l}</Body>
                </div>
              );
            })}
          </div>
        </Abs>
        <Abs x={640} y={640} w={1200} o={b.ramp(1, 1)}>
          <Body size={30} color={C.muted}>
            Groceries share the store with electronics, clothing, home goods and more
          </Body>
        </Abs>
      </div>

      {/* beats 2-3: Costco */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 3)}}>
        <Source>Costco 10-K fiscal 2026 (52 weeks ended Aug 30, 2026) · net sales $297,247M · membership fees $5,907M · operating income $11,685M</Source>
        <Stage>
          <Place x={330} y={380} s={0.8}>
            <StoreFront type="club" glow={1} />
          </Place>
          <g transform={`translate(${interpolate(b.rampAt(b.word(2, /membership/i, 0.7), 0.9), [0, 1], [330, 1180])} ${interpolate(b.rampAt(b.word(2, /membership/i, 0.7), 0.9), [0, 1], [700, 640])}) rotate(${-8 + 8 * b.rampAt(b.word(2, /membership/i, 0.7), 0.9)}) scale(1.1)`} opacity={b.rampAt(b.word(2, /membership|fees/i, 0.6), 0.3) * (1 - b.during(3, 3))}>
            <MemberCard />
          </g>
        </Stage>
        <Abs x={640} y={250} w={1200} o={b.during(2, 2)}>
          <Kicker>Costco · membership warehouse club</Kicker>
          <div style={{display: 'flex', gap: 80, marginTop: 24}}>
            <div style={{opacity: b.rampAt(b.word(2, /gross|11/i, 0.4), 0.4)}}>
              <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 120, color: C.orange}}>11.09%</div>
              <Body size={32}>gross margin on net sales</Body>
            </div>
            <div style={{opacity: b.rampAt(b.word(2, /5\.9|billion|membership/i, 0.75), 0.4)}}>
              <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 120, color: C.green}}>$5.9B</div>
              <Body size={32}>membership fees</Body>
            </div>
          </div>
        </Abs>
        {/* beat 3: fees vs operating income */}
        <Abs x={640} y={250} w={1200} o={b.during(3, 3)}>
          <Kicker>Membership fees vs operating income</Kicker>
          <div style={{marginTop: 30}}>
            <Body size={34} color={C.cream} weight={700}>
              Operating income $11.7B
            </Body>
            <div style={{height: 80, width: 1100, background: C.bg2, border: `2px solid ${C.line}`, borderRadius: 10, marginTop: 10, position: 'relative', overflow: 'hidden'}}>
              <div style={{position: 'absolute', inset: 0, width: `${100 * b.ramp(3, 0, 0.8)}%`, background: 'rgba(245,158,11,0.45)'}} />
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${50.55 * b.ramp(3, 0.8, 1.0)}%`, background: C.green, display: 'flex', alignItems: 'center', paddingLeft: 18, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 32, color: C.bg, whiteSpace: 'nowrap'}}>
                fees $5.9B
              </div>
            </div>
            <Title size={86} style={{marginTop: 26, opacity: b.ramp(3, 1.4)}}>
              ≈ <span style={{color: C.green}}>half</span> <span style={{fontSize: 44, color: C.muted}}>(50.6%)</span>
            </Title>
            <Body size={32} color={C.muted} style={{marginTop: 12, opacity: b.ramp(3, 2.6)}}>
              Very thin margins on goods + a fee members pay to shop
            </Body>
          </div>
        </Abs>
      </div>

      {/* beat 4: Kroger */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        <Source>Kroger 10-K fiscal 2025 · 2,250 pharmacies, 1,731 fuel centers · alternative profit businesses incl. third-party media revenue</Source>
        <Stage>
          <Place x={330} y={420} s={0.95}>
            <StoreFront type="supermarket" glow={1} />
          </Place>
        </Stage>
        <Abs x={640} y={250} w={1200}>
          <Kicker>Traditional supermarket chain · Kroger</Kicker>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 22, marginTop: 30}}>
            {[
              {l: 'Fresh food', w: /fresh/i, k: 'salad' as const},
              {l: 'Own brands', w: /brands/i, k: 'storecereal' as const},
              {l: 'Pharmacy', w: /pharmacy/i, k: null},
              {l: 'Fuel', w: /fuel/i, k: null},
              {l: 'Advertising & other side businesses', w: /side|advertising/i, k: null},
            ].map((d) => {
              const o = b.rampAt(b.word(4, d.w, 0.5), 0.35);
              return (
                <div key={d.l} style={{opacity: o, transform: `scale(${0.85 + 0.15 * o})`, transformOrigin: 'left center'}}>
                  <Chip bg={C.panel} color={C.cream} size={44}>
                    {d.l}
                  </Chip>
                </div>
              );
            })}
          </div>
        </Abs>
        <Stage>
          <Place x={1500} y={760} s={0.6 * b.rampAt(b.word(4, /fresh/i, 0.5), 0.3)}>
            <Product kind="salad" />
          </Place>
          <Place x={1650} y={760} s={0.6 * b.rampAt(b.word(4, /brands/i, 0.5), 0.3)}>
            <Product kind="storecereal" />
          </Place>
        </Stage>
      </div>

      {/* beat 5: different businesses */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(5, 5)}}>
        <Stage>
          {[
            {x: 560, pct: 24.2, c: C.orange, l: 'Walmart'},
            {x: 1360, pct: 11.09, c: C.orange, l: 'Costco'},
          ].map((d, i) => (
            <g key={d.l}>
              <g transform={`translate(${d.x} 520)`}>
                <Pie pct={d.pct} t={b.ramp(5, 0.3 + i * 0.6, 1)} color={d.c} r={200} />
              </g>
            </g>
          ))}
          <text x={960} y={540} textAnchor="middle" fontSize={90} fontWeight={700} fill={C.muted} fontFamily="Space Grotesk">
            ≠
          </text>
        </Stage>
        <Abs x={160} y={160} w={800} align="center" o={b.ramp(5, 0.3)}>
          <Title size={80}>24%</Title>
          <Body size={30} color={C.muted}>
            Walmart gross margin
          </Body>
        </Abs>
        <Abs x={960} y={160} w={800} align="center" o={b.ramp(5, 0.9)}>
          <Title size={80}>11%</Title>
          <Body size={30} color={C.muted}>
            Costco gross margin
          </Body>
        </Abs>
        <Abs x={0} y={750} w={1920} align="center" o={b.rampAt(b.word(5, /different/i, 0.7), 0.4)}>
          <div style={{display: 'inline-block', background: 'rgba(17,20,24,0.85)', padding: '8px 24px', borderRadius: 12}}>
            <Body size={42} weight={700} style={{fontFamily: FONT_TITLE}}>
              Different businesses, <span style={{color: C.orange}}>not better or worse ones</span>
            </Body>
          </div>
        </Abs>
      </div>
    </SceneShell>
  );
};
