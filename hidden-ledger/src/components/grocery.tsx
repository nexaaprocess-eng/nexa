import React from 'react';
import {C, FONT_TITLE} from '../themes/theme';
import {rnd} from './sets';

// Grocery illustration kit (episode 002 and later). Original flat vectors, no real brands or logos:
// every package carries a generic word ("MILK", "STORE BRAND"), never a company name.
// Like icons.tsx, each item is drawn in a ~200x200 box centred on (0,0) and placed with <Place>.

const SW = 6;
const label = (txt: string, y: number, size = 22, fill: string = C.bg) => (
  <text x={0} y={y} textAnchor="middle" fontSize={size} fontWeight={700} fill={fill} fontFamily="Space Grotesk" stroke="none" letterSpacing={1}>
    {txt}
  </text>
);

export type ProductKind = 'milk' | 'eggs' | 'bananas' | 'bread' | 'cereal' | 'storecereal' | 'coffee' | 'deli' | 'pasta' | 'detergent' | 'salad' | 'can';

export const PRODUCT_COLORS: Record<ProductKind, string> = {
  milk: C.cream,
  eggs: '#D9C3A0',
  bananas: '#F2C94C',
  bread: '#C8925A',
  cereal: '#5B7FA6',
  storecereal: C.orange,
  coffee: '#7A5236',
  deli: C.green,
  pasta: '#E6C27A',
  detergent: '#4FA3A5',
  salad: '#6DBE6A',
  can: '#B5523B',
};

/** One generic grocery item. `spoil` 0..1 browns produce; `crush` 0..1 dents a package. */
export const Product: React.FC<{kind: ProductKind; spoil?: number; crush?: number; tag?: string}> = ({kind, spoil = 0, crush = 0, tag}) => {
  const st = {stroke: C.cream, strokeWidth: SW, strokeLinejoin: 'round' as const};
  const sq = 1 - 0.35 * crush;
  let body: React.ReactNode;
  switch (kind) {
    case 'milk':
      body = (
        <g {...st}>
          <path d="M-45 -50 L-30 -80 L20 -80 L45 -50 L45 80 L-45 80 Z" fill={C.cream} />
          <path d="M20 -70 Q60 -60 50 -20" fill="none" />
          <rect x={-22} y={-100} width={36} height={22} rx={6} fill={C.blue} />
          <rect x={-45} y={0} width={90} height={44} fill={C.blue} />
          {label('MILK', 31, 26, C.cream)}
        </g>
      );
      break;
    case 'eggs':
      body = (
        <g {...st}>
          <path d="M-90 -10 L90 -10 L78 50 L-78 50 Z" fill="#D9C3A0" />
          {[-60, -20, 20, 60].map((x) => (
            <ellipse key={x} cx={x} cy={-22} rx={20} ry={24} fill={C.cream} strokeWidth={4} />
          ))}
          {label('EGGS', 33, 26)}
        </g>
      );
      break;
    case 'bananas': {
      const col = spoil > 0.5 ? '#7A5A2A' : '#F2C94C';
      body = (
        <g {...st}>
          {[-24, 0, 24].map((dx, i) => (
            <path key={i} d={`M${-70 + dx * 0.3} ${-40 + dx} Q${dx} ${70 + dx * 0.4} ${80 + dx * 0.2} ${-30 + dx}`} fill="none" stroke={col} strokeWidth={34} strokeLinecap="round" />
          ))}
          {spoil > 0 &&
            [0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={-40 + i * 22} cy={10 + (i % 2) * 14} r={7 * spoil} fill="#4A3418" stroke="none" />)}
          <path d="M-78 -42 L-86 -58" stroke={C.cream} strokeWidth={10} strokeLinecap="round" />
        </g>
      );
      break;
    }
    case 'bread':
      body = (
        <g {...st}>
          <path d="M-90 60 L-90 -10 Q-90 -60 -40 -60 L40 -60 Q90 -60 90 -10 L90 60 Z" fill="#C8925A" />
          {[-40, 0, 40].map((x) => (
            <path key={x} d={`M${x - 14} -40 L${x + 14} -20`} strokeWidth={5} />
          ))}
          <rect x={-60} y={8} width={120} height={36} rx={8} fill={C.cream} strokeWidth={4} />
          {label('BREAD', 35, 24)}
        </g>
      );
      break;
    case 'cereal':
    case 'storecereal': {
      const store = kind === 'storecereal';
      body = (
        <g {...st} transform={`translate(0 ${80 * (1 - sq)}) scale(1 ${sq})`}>
          <rect x={-58} y={-90} width={116} height={170} rx={6} fill={store ? C.orange : '#5B7FA6'} />
          <ellipse cx={0} cy={22} rx={40} ry={16} fill={C.cream} strokeWidth={4} />
          <path d="M-40 22 Q0 70 40 22" fill={C.cream} strokeWidth={4} />
          {[-18, 0, 16].map((x) => (
            <circle key={x} cx={x} cy={14} r={7} fill={store ? '#8A5A12' : '#C8925A'} strokeWidth={2} />
          ))}
          {label('CEREAL', -48, 24, store ? C.bg : C.cream)}
          {store && (
            <g>
              <rect x={-58} y={-86} width={116} height={0} />
              <rect x={-56} y={-30} width={112} height={26} fill={C.bg} strokeWidth={0} />
              {label('STORE BRAND', -10, 17, C.orange)}
            </g>
          )}
        </g>
      );
      break;
    }
    case 'coffee':
      body = (
        <g {...st}>
          <path d="M-50 -80 L50 -80 L60 80 L-60 80 Z" fill="#7A5236" />
          <path d="M-50 -80 L-40 -96 L40 -96 L50 -80" fill="#5E3E28" />
          <ellipse cx={0} cy={-6} rx={18} ry={26} fill="#3A2416" strokeWidth={4} />
          <path d="M0 -30 Q-8 -6 0 18" fill="none" strokeWidth={3} />
          {label('COFFEE', 54, 24, C.cream)}
        </g>
      );
      break;
    case 'deli':
      body = (
        <g {...st}>
          <rect x={-90} y={-30} width={180} height={90} rx={14} fill="rgba(243,235,221,0.14)" />
          <circle cx={-40} cy={10} r={28} fill="#C8925A" strokeWidth={4} />
          <path d="M0 -6 Q30 -30 60 -6 Q30 30 0 -6 Z" fill="#6DBE6A" strokeWidth={4} />
          <rect x={10} y={20} width={56} height={24} rx={8} fill="#E45757" strokeWidth={4} />
          <path d="M-96 -30 Q0 -80 96 -30" fill="rgba(243,235,221,0.1)" />
          {label('DELI', 92, 26, C.cream)}
        </g>
      );
      break;
    case 'pasta':
      body = (
        <g {...st}>
          <rect x={-80} y={-40} width={100} height={110} rx={4} fill="#E6C27A" />
          {[-60, -45, -30, -15].map((x) => (
            <line key={x} x1={x} y1={-30} x2={x + 6} y2={10} strokeWidth={4} />
          ))}
          {label('PASTA', 52, 22)}
          <path d="M30 -10 L30 -30 L80 -30 L80 -10 Q92 0 92 20 L92 70 L18 70 L18 20 Q18 0 30 -10 Z" fill="#B5523B" />
          <rect x={26} y={-44} width={58} height={16} rx={4} fill={C.cream} strokeWidth={3} />
          {label('SAUCE', 40, 15, C.cream)}
        </g>
      );
      break;
    case 'detergent':
      body = (
        <g {...st}>
          <path d="M-60 -50 L-30 -80 L40 -80 L60 -50 L60 80 L-60 80 Z" fill="#4FA3A5" />
          <path d="M10 -70 Q50 -66 44 -30 L20 -30" fill="none" />
          <rect x={-30} y={-104} width={36} height={26} rx={6} fill={C.orange} />
          <rect x={-50} y={0} width={100} height={46} rx={6} fill={C.cream} strokeWidth={4} />
          {label('SOAP', 32, 24)}
        </g>
      );
      break;
    case 'salad':
      body = (
        <g {...st}>
          <path d="M-60 -80 L60 -80 L70 80 L-70 80 Z" fill={spoil > 0.5 ? '#6E7D3A' : 'rgba(109,190,106,0.85)'} />
          {[-30, 0, 30].map((x, i) => (
            <path key={x} d={`M${x - 26} ${-10 + i * 10} Q${x} ${-50 + i * 6} ${x + 26} ${-10 + i * 10} Q${x} ${20} ${x - 26} ${-10 + i * 10} Z`} fill={spoil > 0.5 ? '#55612C' : '#3E8F4A'} strokeWidth={3} />
          ))}
          <path d="M-60 -80 L-50 -96 L50 -96 L60 -80" fill={C.cream} />
          {label('SALAD', 56, 24, C.bg)}
        </g>
      );
      break;
    case 'can':
    default:
      body = (
        <g {...st}>
          <rect x={-45} y={-60} width={90} height={130} rx={10} fill="#B5523B" />
          <ellipse cx={0} cy={-60} rx={45} ry={10} fill="#D8D2C6" />
          <rect x={-45} y={-20} width={90} height={48} fill={C.cream} strokeWidth={4} />
          {label('SOUP', 12, 22)}
        </g>
      );
  }
  return (
    <g>
      {body}
      {tag && (
        <g transform="translate(58 -80) rotate(12)">
          <circle r={38} fill={C.red} stroke={C.cream} strokeWidth={5} />
          {label(tag, 9, 26, C.cream)}
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ money
/** A generic banknote (not a reproduction of real currency). */
export const Bill: React.FC<{value?: string; w?: number}> = ({value = '100', w = 360}) => {
  const h = w * 0.45;
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="#4E7E5F" stroke={C.cream} strokeWidth={6} />
      <rect x={-w / 2 + 18} y={-h / 2 + 18} width={w - 36} height={h - 36} rx={10} fill="none" stroke="rgba(243,235,221,0.5)" strokeWidth={3} />
      <circle r={h * 0.28} fill="#3C6A4E" stroke={C.cream} strokeWidth={4} />
      <text x={0} y={h * 0.11} textAnchor="middle" fontSize={h * 0.3} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
        $
      </text>
      <text x={-w / 2 + 30} y={-h / 2 + 52} fontSize={h * 0.24} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
        {value}
      </text>
      <text x={w / 2 - 30} y={h / 2 - 26} textAnchor="end" fontSize={h * 0.24} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
        {value}
      </text>
    </g>
  );
};

export const CoinDot: React.FC<{r?: number; color?: string; sign?: string}> = ({r = 22, color = C.orange, sign = '¢'}) => (
  <g>
    <circle r={r} fill={color} stroke={C.cream} strokeWidth={Math.max(2, r * 0.12)} />
    {r >= 16 && (
      <text y={r * 0.36} textAnchor="middle" fontSize={r * 1.0} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk">
        {sign}
      </text>
    )}
  </g>
);

// ------------------------------------------------------------------ shelving
const FACING: ProductKind[] = ['cereal', 'pasta', 'coffee', 'can', 'detergent', 'bread', 'storecereal', 'eggs', 'milk'];

/**
 * Front-on shelving unit. `stock(i)` returns 0..1 for facing i (0 = empty slot, 1 = full); default full.
 * Facings are spaced `pitch` px apart on `levels` shelves; `kinds` cycles through products.
 */
export const ShelfUnit: React.FC<{
  x: number;
  y: number;
  w: number;
  levels?: number;
  pitch?: number;
  scale?: number;
  kinds?: ProductKind[];
  stock?: (i: number) => number;
  tags?: boolean;
  seed?: number;
}> = ({x, y, w, levels = 4, pitch = 120, scale = 0.42, kinds = FACING, stock, tags = true, seed = 0}) => {
  const per = Math.floor((w - 40) / pitch);
  const levelH = 190;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-14} y={-30} width={w + 28} height={levels * levelH + 50} fill="#1A1F26" stroke={C.line} strokeWidth={4} rx={6} />
      {Array.from({length: levels}).map((_, l) => (
        <g key={l} transform={`translate(0 ${l * levelH})`}>
          {Array.from({length: per}).map((__, k) => {
            const i = l * per + k;
            const s = stock ? Math.max(0, Math.min(1, stock(i))) : 1;
            const kind = kinds[Math.floor(rnd(i + seed * 97) * kinds.length)];
            return s > 0.01 ? (
              <g key={k} transform={`translate(${40 + k * pitch + pitch / 2 - 20} ${levelH - 64 - 40 * (1 - s)}) scale(${scale})`} opacity={s}>
                <Product kind={kind} />
              </g>
            ) : null;
          })}
          <rect x={0} y={levelH - 26} width={w} height={20} fill={C.panel} stroke={C.cream} strokeWidth={3} />
          {tags &&
            Array.from({length: per}).map((__, k) => (
              <rect key={`t${k}`} x={40 + k * pitch + pitch / 2 - 42} y={levelH - 24} width={40} height={16} rx={3} fill={C.cream} opacity={0.85} />
            ))}
        </g>
      ))}
    </g>
  );
};

/** One-point-perspective aisle (establishing shot). `dolly` 0..1 pushes the camera down the aisle. */
export const AisleSet: React.FC<{dolly?: number; t?: number; empty?: (side: number, i: number) => boolean}> = ({dolly = 0, t = 0, empty}) => {
  const vp = {x: 960, y: 470};
  const s = 1 + dolly * 0.6;
  const bays = 7;
  const colors = Object.values(PRODUCT_COLORS);
  return (
    <g transform={`translate(${vp.x} ${vp.y}) scale(${s}) translate(${-vp.x} ${-vp.y})`}>
      <rect x={0} y={0} width={1920} height={1080} fill="#15191E" />
      {/* ceiling lights */}
      {Array.from({length: 6}).map((_, i) => {
        const k = Math.pow(0.72, i);
        return <rect key={i} x={vp.x - 260 * k} y={vp.y - 420 * k - 10} width={520 * k} height={18 * k} rx={6 * k} fill="rgba(243,235,221,0.75)" opacity={0.85 + 0.15 * Math.sin(t * 3 + i)} />;
      })}
      {/* floor with tile lines */}
      <path d={`M0 1080 L${vp.x - 60} ${vp.y + 60} L${vp.x + 60} ${vp.y + 60} L1920 1080 Z`} fill="#1E242B" />
      {Array.from({length: 9}).map((_, i) => {
        const k = Math.pow(0.7, i);
        return <line key={i} x1={vp.x - 960 * k} y1={vp.y + 610 * k} x2={vp.x + 960 * k} y2={vp.y + 610 * k} stroke="#262D35" strokeWidth={3} />;
      })}
      {/* two shelving walls */}
      {[-1, 1].map((side) => (
        <g key={side}>
          {Array.from({length: bays}).map((_, b) => {
            const k0 = Math.pow(0.74, b);
            const k1 = Math.pow(0.74, b + 1);
            const xa = vp.x + side * 900 * k0;
            const xb = vp.x + side * 900 * k1;
            return (
              <g key={b}>
                {Array.from({length: 5}).map((__, l) => {
                  const ya0 = vp.y - 380 * k0 + l * 150 * k0;
                  const yb0 = vp.y - 380 * k1 + l * 150 * k1;
                  const gone = empty?.(side, b * 5 + l);
                  const col = colors[Math.floor(rnd(b * 11 + l * 3 + (side + 1) * 50) * colors.length)];
                  return (
                    <g key={l}>
                      {!gone && (
                        <path
                          d={`M${xa} ${ya0 + 18 * k0} L${xb} ${yb0 + 18 * k1} L${xb} ${yb0 + 120 * k1} L${xa} ${ya0 + 120 * k0} Z`}
                          fill={col}
                          opacity={0.85}
                        />
                      )}
                      <path d={`M${xa} ${ya0 + 120 * k0} L${xb} ${yb0 + 120 * k1} L${xb} ${yb0 + 134 * k1} L${xa} ${ya0 + 134 * k0} Z`} fill="#2B323B" />
                    </g>
                  );
                })}
                <line x1={xa} y1={vp.y - 400 * k0} x2={xa} y2={vp.y + 380 * k0} stroke="#2B323B" strokeWidth={10 * k0} />
              </g>
            );
          })}
        </g>
      ))}
      {/* aisle sign */}
      <g transform={`translate(${vp.x} ${vp.y - 200})`}>
        <line x1={0} y1={-260} x2={0} y2={-40} stroke="#2B323B" strokeWidth={6} />
        <rect x={-130} y={-40} width={260} height={70} rx={10} fill={C.orange} />
        <text y={10} textAnchor="middle" fontSize={40} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk">
          AISLE 7
        </text>
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ checkout
/** Checkout lane seen from the side: belt, scanner window, register display, receipt printer. */
export const CheckoutSet: React.FC<{
  t: number;
  items: {kind: ProductKind; at: number}[]; // `at` = time (s) the item crosses the scanner
  total?: string;
  receipt?: number; // 0..1 printed length
  beamAt?: number; // seconds since last scan (for the flash)
  y?: number;
}> = ({t, items, total = '', receipt = 0, y = 700}) => {
  const scanX = 1180;
  const speed = 300;
  const lastScan = Math.max(-99, ...items.filter((i) => i.at <= t).map((i) => i.at));
  const flash = Math.max(0, 1 - (t - lastScan) * 4);
  return (
    <g>
      {/* counter */}
      <rect x={-20} y={y} width={1560} height={60} rx={10} fill="#2A3038" stroke={C.cream} strokeWidth={4} />
      <rect x={-20} y={y + 60} width={1560} height={1080 - y} fill="#1A1F26" />
      {/* belt texture */}
      {Array.from({length: 24}).map((_, i) => (
        <rect key={i} x={((i * 70 + t * speed) % 1680) - 70} y={y + 10} width={36} height={8} rx={4} fill="#3A424C" />
      ))}
      {/* items */}
      {items.map((it, i) => {
        const x = scanX + (t - it.at) * speed;
        if (x < -200 || x > 1700) return null;
        const bagged = x > 1460;
        return (
          <g key={i} transform={`translate(${Math.min(x, 1500)} ${y - 72 + (bagged ? Math.min(140, (x - 1460) * 2) : 0)}) scale(0.62)`} opacity={bagged ? Math.max(0, 1 - (x - 1460) / 80) : 1}>
            <Product kind={it.kind} />
          </g>
        );
      })}
      {/* scanner glass + beam */}
      <rect x={scanX - 70} y={y - 6} width={140} height={14} rx={6} fill={C.red} opacity={0.4 + 0.6 * flash} />
      <path d={`M${scanX - 60} ${y} L${scanX} ${y - 220} L${scanX + 60} ${y}`} fill={`rgba(228,87,87,${0.08 + 0.25 * flash})`} />
      {/* register tower */}
      <g transform={`translate(1640 ${y - 230})`}>
        <rect x={-10} y={160} width={20} height={80} fill="#2A3038" />
        <rect x={-150} y={0} width={300} height={170} rx={14} fill={C.panel} stroke={C.cream} strokeWidth={5} />
        <rect x={-126} y={22} width={252} height={88} rx={8} fill="#0B0E11" />
        <text x={110} y={86} textAnchor="end" fontSize={56} fontWeight={700} fill={C.green} fontFamily="Space Grotesk" style={{fontVariantNumeric: 'tabular-nums'}}>
          {total}
        </text>
        {/* receipt */}
        <g transform="translate(60 120)">
          <rect x={-40} y={0} width={80} height={10} fill="#0B0E11" />
          <path d={`M-34 8 L34 8 L34 ${8 + 260 * receipt} L-34 ${8 + 260 * receipt} Z`} fill={C.cream} />
          {Array.from({length: Math.floor(receipt * 12)}).map((_, k) => (
            <line key={k} x1={-24} y1={26 + k * 20} x2={k % 3 === 2 ? 4 : 24} y2={26 + k * 20} stroke={C.muted} strokeWidth={4} />
          ))}
        </g>
      </g>
    </g>
  );
};

/** Paper receipt with lines revealed progressively (`n` lines visible). */
export const Receipt: React.FC<{lines: [string, string][]; n: number; total?: [string, string]; w?: number; size?: number}> = ({lines, n, total, w = 520, size = 34}) => {
  const lh = size * 1.45;
  const h = (lines.length + (total ? 2 : 0)) * lh + 70;
  return (
    <div style={{width: w, background: C.cream, color: C.bg, padding: '28px 30px', borderRadius: 6, fontFamily: FONT_TITLE, fontSize: size, fontWeight: 600, minHeight: h, boxShadow: '0 30px 60px rgba(0,0,0,0.4)'}}>
      {lines.map(([a, b], i) => (
        <div key={a + i} style={{display: 'flex', justifyContent: 'space-between', height: lh, opacity: Math.max(0, Math.min(1, n - i))}}>
          <span>{a}</span>
          <span style={{fontVariantNumeric: 'tabular-nums'}}>{b}</span>
        </div>
      ))}
      {total && (
        <div style={{display: 'flex', justifyContent: 'space-between', borderTop: `4px dashed ${C.bg}`, marginTop: 10, paddingTop: 12, fontWeight: 700, opacity: n >= lines.length ? 1 : 0}}>
          <span>{total[0]}</span>
          <span>{total[1]}</span>
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------ carts, storefronts, cards
export const Cart: React.FC<{fill?: number; wheel?: number}> = ({fill = 0, wheel = 0}) => (
  <g stroke={C.cream} strokeWidth={SW} strokeLinejoin="round" fill="none">
    {fill > 0 &&
      (['bread', 'milk', 'cereal', 'bananas'] as ProductKind[]).slice(0, Math.ceil(fill * 4)).map((k, i) => (
        <g key={k} transform={`translate(${-50 + i * 34} ${-70 - (i % 2) * 14}) scale(0.38)`}>
          <Product kind={k} />
        </g>
      ))}
    <path d="M-120 -100 L-96 -100 L-70 30 L80 30 L100 -60 L-84 -60" />
    {[-60, 0, 60].map((x) => (
      <line key={x} x1={x - 4} y1={-58} x2={x - 10} y2={28} strokeWidth={4} />
    ))}
    {[-50, 60].map((x) => (
      <g key={x} transform={`translate(${x} 58) rotate(${wheel})`}>
        <circle r={14} fill={C.bg} />
        <line x1={-8} y1={0} x2={8} y2={0} strokeWidth={4} />
      </g>
    ))}
  </g>
);

export type StoreType = 'supermarket' | 'supercenter' | 'club';
/** Generic storefronts for the three business models; signs say what they are, not who they are. */
export const StoreFront: React.FC<{type: StoreType; glow?: number}> = ({type, glow = 0}) => {
  const st = {stroke: C.cream, strokeWidth: SW, strokeLinejoin: 'round' as const};
  if (type === 'supermarket')
    return (
      <g {...st}>
        <rect x={-230} y={-120} width={460} height={240} fill={C.panel} />
        <path d="M-250 -120 L-230 -170 L230 -170 L250 -120 Z" fill={C.green} />
        {Array.from({length: 9}).map((_, i) => (
          <path key={i} d={`M${-230 + i * 51} -120 Q${-204 + i * 51} -88 ${-179 + i * 51} -120`} fill={i % 2 ? C.cream : C.green} strokeWidth={4} />
        ))}
        <rect x={-200} y={-60} width={160} height={110} fill={`rgba(245,158,11,${0.25 + 0.35 * glow})`} strokeWidth={4} />
        <rect x={40} y={-60} width={160} height={110} fill={`rgba(245,158,11,${0.25 + 0.35 * glow})`} strokeWidth={4} />
        <rect x={-30} y={0} width={60} height={120} fill={C.bg} strokeWidth={4} />
        <g transform="translate(-120 -10) scale(0.3)">
          <Product kind="bananas" />
        </g>
        <g transform="translate(120 -10) scale(0.3)">
          <Product kind="bread" />
        </g>
      </g>
    );
  if (type === 'supercenter')
    return (
      <g {...st}>
        <rect x={-300} y={-110} width={600} height={230} fill="#1F2630" />
        <rect x={-120} y={-150} width={240} height={50} fill={C.blue} />
        {Array.from({length: 6}).map((_, i) => (
          <rect key={i} x={-280 + i * 96} y={-70} width={70} height={60} fill={`rgba(127,167,201,${0.2 + 0.3 * glow})`} strokeWidth={3} />
        ))}
        <rect x={-50} y={10} width={100} height={110} fill={C.bg} strokeWidth={4} />
        <g transform="translate(-200 60) scale(0.3)">
          <Product kind="detergent" />
        </g>
        <g transform="translate(200 60) scale(0.3)">
          <Product kind="milk" />
        </g>
      </g>
    );
  return (
    <g {...st}>
      <path d="M-300 -60 L0 -150 L300 -60 L300 120 L-300 120 Z" fill="#232A33" />
      {Array.from({length: 5}).map((_, i) => (
        <line key={i} x1={-300 + i * 150} y1={-60 + (i < 3 ? -i * 45 : -(4 - i) * 45)} x2={-300 + i * 150} y2={120} strokeWidth={3} stroke={C.line} />
      ))}
      <rect x={-90} y={0} width={180} height={120} fill={C.bg} strokeWidth={4} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={-90} y1={20 + i * 30} x2={90} y2={20 + i * 30} stroke={C.line} strokeWidth={6} />
      ))}
      <g transform={`translate(200 40) scale(0.55)`}>
        <MemberCard />
      </g>
      <rect x={-230} y={-40} width={110} height={50} fill={`rgba(245,158,11,${0.3 + 0.4 * glow})`} strokeWidth={3} />
    </g>
  );
};

/** Generic membership card. */
export const MemberCard: React.FC<{name?: string}> = ({name = 'MEMBER'}) => (
  <g stroke={C.cream} strokeWidth={5}>
    <rect x={-150} y={-95} width={300} height={190} rx={18} fill={C.orange} />
    <rect x={-150} y={-55} width={300} height={36} fill={C.bg} strokeWidth={0} />
    <circle cx={-90} cy={40} r={30} fill={C.cream} strokeWidth={0} />
    <rect x={-40} y={20} width={150} height={14} rx={7} fill={C.bg} strokeWidth={0} />
    <rect x={-40} y={46} width={100} height={14} rx={7} fill={C.bg} strokeWidth={0} />
    <text x={0} y={-28} textAnchor="middle" fontSize={26} fontWeight={700} fill={C.orange} fontFamily="Space Grotesk" stroke="none" letterSpacing={4}>
      {name}
    </text>
  </g>
);

/** Back room: racks of cases, a pallet jack lane and swing doors to the sales floor. `restock` 0..1 empties racks. */
export const StockroomSet: React.FC<{t: number; restock?: number}> = ({t, restock = 0}) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#14181D" />
    {[0, 1, 2].map((r) => (
      <g key={r} transform={`translate(${100 + r * 400} 220)`}>
        {[0, 1, 2].map((lvl) => (
          <g key={lvl}>
            <rect x={0} y={lvl * 170 + 150} width={340} height={12} fill={C.orange} opacity={0.8} />
            {Array.from({length: 3}).map((_, k) => {
              const idx = r * 9 + lvl * 3 + k;
              const gone = rnd(idx + 3) < restock;
              return gone ? null : (
                <g key={k} transform={`translate(${60 + k * 110} ${lvl * 170 + 104})`}>
                  <rect x={-48} y={-44} width={96} height={88} rx={4} fill="#C8A675" stroke={C.cream} strokeWidth={4} />
                  <line x1={-48} y1={-10} x2={48} y2={-10} stroke="#8A6E45" strokeWidth={4} />
                </g>
              );
            })}
          </g>
        ))}
        <rect x={-8} y={0} width={16} height={520} fill="#2A3038" />
        <rect x={332} y={0} width={16} height={520} fill="#2A3038" />
      </g>
    ))}
    {/* swing doors */}
    <g transform="translate(1560 300)">
      <rect x={-170} y={0} width={340} height={460} fill="#0E1114" stroke={C.cream} strokeWidth={6} />
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * 85} 0) scale(${1 - 0.25 * Math.abs(Math.sin(t * 1.4))} 1)`}>
          <rect x={-80} y={10} width={160} height={440} fill="#2A3038" stroke={C.cream} strokeWidth={4} />
          <circle cx={0} cy={140} r={34} fill="rgba(245,158,11,0.45)" stroke={C.cream} strokeWidth={4} />
        </g>
      ))}
      <rect x={-120} y={-60} width={240} height={50} rx={8} fill={C.panel} stroke={C.cream} strokeWidth={4} />
      <text y={-24} textAnchor="middle" fontSize={30} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
        SALES FLOOR
      </text>
    </g>
    <rect x={0} y={760} width={1920} height={320} fill="#101317" />
    {Array.from({length: 13}).map((_, i) => (
      <line key={i} x1={960 + (i - 6) * 60} y1={760} x2={960 + (i - 6) * 340} y2={1080} stroke="#1B2027" strokeWidth={3} />
    ))}
  </g>
);

/** Semi truck seen from the side (bigger and more detailed than icons/Truck). `wheel` in degrees. */
export const Semi: React.FC<{wheel?: number; doorOpen?: number}> = ({wheel = 0, doorOpen = 0}) => (
  <g stroke={C.cream} strokeWidth={SW} strokeLinejoin="round">
    <rect x={-420} y={-230} width={560} height={240} rx={8} fill="#232A33" />
    <rect x={-400} y={-200} width={200} height={36} fill={C.green} strokeWidth={0} />
    <text x={-300} y={-172} textAnchor="middle" fontSize={26} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk" stroke="none">
      FRESH FOOD
    </text>
    {doorOpen > 0 && <rect x={-430} y={-226} width={30 * doorOpen + 4} height={232} fill={C.bg} />}
    <path d="M150 -150 L250 -150 L300 -80 L300 10 L150 10 Z" fill={C.orange} />
    <rect x={180} y={-130} width={70} height={50} fill={C.bg} strokeWidth={4} />
    {[-340, -260, 80, 240].map((cx) => (
      <g key={cx} transform={`translate(${cx} 30) rotate(${wheel})`}>
        <circle r={34} fill={C.bg} />
        <line x1={-20} y1={0} x2={20} y2={0} />
      </g>
    ))}
  </g>
);
