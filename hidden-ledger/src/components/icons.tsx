import React from 'react';
import {C} from '../themes/theme';

// Original flat vector illustrations. Every icon is drawn in a ~200x200 box centred on (0,0)
// and placed with <Place x y s>. Stroke weights are scaled with the icon.

type P = {color?: string; accent?: string; fill?: string};
const SW = 6;

export const Place: React.FC<{x: number; y: number; s?: number; r?: number; o?: number; children: React.ReactNode}> = ({
  x,
  y,
  s = 1,
  r = 0,
  o = 1,
  children,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}>
    {children}
  </g>
);

export const Box: React.FC<P & {label?: string; labelColor?: string; open?: number}> = ({
  color = C.cream,
  fill = '#C8A675',
  label,
  labelColor = C.orange,
  open = 0,
}) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {/* back flaps when opening */}
    {open > 0 && (
      <>
        <path d={`M-80 -40 L${-80 - 30 * open} ${-40 - 50 * open} L${-10} ${-40 - 55 * open} L0 -40 Z`} fill="#B48F5E" stroke={color} strokeWidth={SW} />
        <path d={`M80 -40 L${80 + 30 * open} ${-40 - 50 * open} L${10} ${-40 - 55 * open} L0 -40 Z`} fill="#B48F5E" stroke={color} strokeWidth={SW} />
      </>
    )}
    <rect x={-80} y={-40} width={160} height={110} rx={6} fill={fill} stroke={color} strokeWidth={SW} />
    {open === 0 && <rect x={-80} y={-62} width={160} height={26} rx={5} fill="#D7B786" stroke={color} strokeWidth={SW} />}
    {open === 0 && <rect x={-12} y={-62} width={24} height={132} fill="#E9D3A9" opacity={0.9} />}
    {label && (
      <g>
        <rect x={-58} y={-8} width={92} height={56} rx={4} fill={C.cream} stroke={color} strokeWidth={3} />
        <rect x={-58} y={-8} width={92} height={16} rx={3} fill={labelColor} />
        <text x={-12} y={34} textAnchor="middle" fontSize={20} fontWeight={700} fill={C.bg} fontFamily="Space Grotesk">
          {label}
        </text>
      </g>
    )}
  </g>
);

export const Jacket: React.FC<P & {sleeve?: number}> = ({color = C.cream, fill = C.blue, accent = C.orange, sleeve = 1}) => (
  <g strokeLinejoin="round" strokeLinecap="round" stroke={color} strokeWidth={SW}>
    {/* sleeves */}
    <path d={`M-58 -70 L-100 -40 L${-112} ${40 + 30 * sleeve} L${-80} ${44 + 30 * sleeve} L-62 -10 Z`} fill={fill} />
    <path d={`M58 -70 L100 -40 L${112} ${40 + 30 * sleeve} L${80} ${44 + 30 * sleeve} L62 -10 Z`} fill={fill} />
    {/* body */}
    <path d="M-60 -78 L-22 -90 L0 -60 L22 -90 L60 -78 L64 92 L-64 92 Z" fill={fill} />
    <path d="M-22 -90 L0 -40 L22 -90" fill="none" />
    <line x1={0} y1={-40} x2={0} y2={92} />
    <circle cx={-10} cy={-10} r={4} fill={color} stroke="none" />
    <circle cx={-10} cy={22} r={4} fill={color} stroke="none" />
    <circle cx={-10} cy={54} r={4} fill={color} stroke="none" />
    <path d="M-48 30 L-24 30" stroke={accent} />
    <path d="M24 30 L48 30" stroke={accent} />
  </g>
);

export const Tag: React.FC<P & {text?: string; textColor?: string}> = ({color = C.cream, fill = C.orange, text, textColor = C.bg}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round">
    <path d="M-90 -40 L60 -40 L100 0 L60 40 L-90 40 Z" fill={fill} />
    <circle cx={62} cy={0} r={9} fill={C.bg} />
    {text && (
      <text x={-18} y={13} textAnchor="middle" fontSize={36} fontWeight={700} fill={textColor} stroke="none" fontFamily="Space Grotesk">
        {text}
      </text>
    )}
  </g>
);

export const House: React.FC<P> = ({color = C.cream, fill = C.panel, accent = C.orange}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round">
    <path d="M-90 -10 L0 -90 L90 -10" fill="none" />
    <rect x={-70} y={-24} width={140} height={110} fill={fill} />
    <rect x={-20} y={22} width={40} height={64} fill={accent} />
    <rect x={30} y={0} width={28} height={28} fill={C.bg} />
  </g>
);

export const Truck: React.FC<P & {wheel?: number}> = ({color = C.cream, fill = C.panel, accent = C.orange, wheel = 0}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round">
    <rect x={-110} y={-70} width={150} height={100} rx={6} fill={fill} />
    <path d="M40 -40 L84 -40 L108 -6 L108 30 L40 30 Z" fill={accent} />
    <rect x={56} y={-30} width={26} height={22} fill={C.bg} />
    {[-70, 70].map((cx) => (
      <g key={cx} transform={`translate(${cx} 38) rotate(${wheel})`}>
        <circle r={18} fill={C.bg} />
        <line x1={-10} y1={0} x2={10} y2={0} />
      </g>
    ))}
    <path d="M-90 -40 L-40 -40" stroke={accent} />
  </g>
);

export const Store: React.FC<P> = ({color = C.cream, fill = C.panel, accent = C.orange}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round">
    <rect x={-90} y={-40} width={180} height={120} fill={fill} />
    <path d="M-100 -40 L-80 -90 L80 -90 L100 -40 Z" fill={accent} />
    {[-60, -20, 20, 60].map((x) => (
      <path key={x} d={`M${x - 20} -40 Q${x} -10 ${x + 20} -40`} fill={C.cream} strokeWidth={4} />
    ))}
    <rect x={-60} y={10} width={120} height={18} fill={C.bg} />
    <rect x={-60} y={28} width={120} height={52} fill={C.line} />
  </g>
);

export const Warehouse: React.FC<P> = ({color = C.cream, fill = C.panel, accent = C.orange}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round">
    <path d="M-110 -20 L0 -90 L110 -20 L110 90 L-110 90 Z" fill={fill} />
    <rect x={-60} y={10} width={120} height={80} fill={C.bg} />
    {[26, 46, 66].map((y) => (
      <line key={y} x1={-60} y1={y} x2={60} y2={y} strokeWidth={4} />
    ))}
    <rect x={-24} y={-50} width={48} height={20} fill={accent} />
  </g>
);

export const Scanner: React.FC<P & {beam?: number}> = ({color = C.cream, fill = C.panel, accent = C.red, beam = 0}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round">
    <path d={`M-20 -10 L-70 ${60} L70 ${60} L20 -10 Z`} fill={accent} opacity={0.18 + 0.4 * beam} stroke="none" />
    <path d="M-50 -80 L50 -80 L60 -30 L20 -10 L-20 -10 L-60 -30 Z" fill={fill} />
    <path d="M-10 -10 L-16 40 L16 40 L10 -10" fill={C.line} />
    <line x1={-70} y1={60} x2={70} y2={60} stroke={accent} strokeWidth={4} opacity={beam} />
  </g>
);

export const Magnifier: React.FC<P> = ({color = C.cream, accent = C.orange}) => (
  <g stroke={color} strokeWidth={SW + 2} strokeLinecap="round">
    <circle cx={-14} cy={-14} r={56} fill="rgba(243,235,221,0.08)" />
    <line x1={26} y1={26} x2={84} y2={84} stroke={accent} strokeWidth={18} />
  </g>
);

export const Calendar: React.FC<P & {day: string}> = ({color = C.cream, fill = C.cream, accent = C.red, day}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round">
    <rect x={-70} y={-70} width={140} height={150} rx={10} fill={fill} />
    <rect x={-70} y={-70} width={140} height={44} rx={10} fill={accent} />
    <line x1={-36} y1={-86} x2={-36} y2={-58} />
    <line x1={36} y1={-86} x2={36} y2={-58} />
    <text y={42} textAnchor="middle" fontSize={50} fontWeight={700} fill={C.bg} stroke="none" fontFamily="Space Grotesk">
      {day}
    </text>
  </g>
);

export const Phone: React.FC<P & {children?: React.ReactNode}> = ({color = C.cream, fill = C.bg2, children}) => (
  <g>
    <rect x={-110} y={-200} width={220} height={400} rx={30} fill={fill} stroke={color} strokeWidth={SW} />
    <rect x={-30} y={-186} width={60} height={10} rx={5} fill={C.line} />
    {children}
  </g>
);

export const Mailbox: React.FC<P> = ({color = C.cream, fill = C.blue, accent = C.red}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round">
    <line x1={0} y1={20} x2={0} y2={100} strokeWidth={12} />
    <path d="M-70 30 L-70 -30 Q-70 -70 -30 -70 L40 -70 Q70 -70 70 -30 L70 30 Z" fill={fill} />
    <path d="M30 -60 L30 -110 L66 -96 L30 -84" fill={accent} />
  </g>
);

export const Pallet: React.FC<P & {n?: number}> = ({color = C.cream, n = 6}) => (
  <g>
    <g stroke={color} strokeWidth={SW}>
      <rect x={-120} y={60} width={240} height={16} fill={C.line} />
      {[-110, -10, 90].map((x) => (
        <rect key={x} x={x} y={76} width={20} height={18} fill={C.line} />
      ))}
    </g>
    {Array.from({length: Math.min(n, 6)}).map((_, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      return (
        <g key={i} transform={`translate(${-78 + col * 78} ${18 - row * 70}) scale(0.46)`}>
          <Box color={color} />
        </g>
      );
    })}
  </g>
);

export const Wrench: React.FC<P> = ({color = C.cream, fill = C.blue}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round" transform="rotate(-45)">
    <rect x={-14} y={-20} width={28} height={110} rx={10} fill={fill} />
    <path d="M-34 -70 A40 40 0 1 0 34 -70 L14 -70 L14 -40 L-14 -40 L-14 -70 Z" fill={fill} />
  </g>
);

export const Recycle: React.FC<P> = ({color = C.green}) => (
  <g stroke={color} strokeWidth={SW + 4} fill="none" strokeLinecap="round" strokeLinejoin="round">
    {[0, 120, 240].map((r) => (
      <g key={r} transform={`rotate(${r})`}>
        <path d="M-40 -50 A64 64 0 0 1 40 -50" />
        <path d="M24 -66 L42 -50 L20 -34" />
      </g>
    ))}
  </g>
);

export const Heart: React.FC<P> = ({color = C.cream, fill = C.green}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round">
    <path d="M0 70 C-90 10 -80 -70 -30 -70 C-10 -70 0 -50 0 -40 C0 -50 10 -70 30 -70 C80 -70 90 10 0 70 Z" fill={fill} />
  </g>
);

export const Bin: React.FC<P> = ({color = C.cream, fill = C.red}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round">
    <rect x={-70} y={-70} width={140} height={20} rx={4} fill={fill} />
    <rect x={-20} y={-88} width={40} height={18} rx={4} fill={fill} />
    <path d="M-58 -50 L-46 80 L46 80 L58 -50 Z" fill={fill} />
    {[-20, 0, 20].map((x) => (
      <line key={x} x1={x} y1={-30} x2={x} y2={60} strokeWidth={4} />
    ))}
  </g>
);

export const Person: React.FC<P> = ({fill = C.cream}) => (
  <g fill={fill}>
    <circle cx={0} cy={-40} r={26} />
    <path d="M-44 60 Q-44 -6 0 -6 Q44 -6 44 60 Z" />
  </g>
);

export const Invoice: React.FC<P & {lines?: number}> = ({color = C.cream, fill = C.cream, accent = C.orange, lines = 4}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round">
    <path d="M-70 -90 L70 -90 L70 90 L50 76 L30 90 L10 76 L-10 90 L-30 76 L-50 90 L-70 76 Z" fill={fill} />
    {Array.from({length: lines}).map((_, i) => (
      <line key={i} x1={-46} y1={-56 + i * 30} x2={i === lines - 1 ? 0 : 46} y2={-56 + i * 30} stroke={i === lines - 1 ? accent : C.bg} strokeWidth={8} />
    ))}
  </g>
);

export const Hanger: React.FC<P> = ({color = C.cream}) => (
  <g stroke={color} strokeWidth={SW} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M0 -40 Q0 -70 20 -70 Q36 -70 36 -54" />
    <path d="M0 -40 L-90 20 L90 20 Z" />
  </g>
);

export const Doc: React.FC<P & {title?: string}> = ({color = C.cream, fill = C.cream, accent = C.orange}) => (
  <g stroke={color} strokeWidth={SW} strokeLinejoin="round">
    <path d="M-80 -110 L40 -110 L80 -70 L80 110 L-80 110 Z" fill={fill} />
    <path d="M40 -110 L40 -70 L80 -70" fill="none" />
    <rect x={-56} y={-80} width={80} height={14} fill={accent} stroke="none" />
    {[-40, -14, 12, 38, 64].map((y) => (
      <line key={y} x1={-56} y1={y} x2={56} y2={y} stroke={C.line} strokeWidth={8} />
    ))}
  </g>
);

export const Coin: React.FC<P & {sign?: string}> = ({color = C.cream, fill = C.orange, sign = '$'}) => (
  <g stroke={color} strokeWidth={SW}>
    <circle r={46} fill={fill} />
    <circle r={32} fill="none" strokeWidth={3} opacity={0.6} />
    <text y={18} textAnchor="middle" fontSize={50} fontWeight={700} fill={C.bg} stroke="none" fontFamily="Space Grotesk">
      {sign}
    </text>
  </g>
);

export const Gear: React.FC<P & {rot?: number}> = ({color = C.cream, fill = C.panel, rot = 0}) => (
  <g stroke={color} strokeWidth={SW} transform={`rotate(${rot})`}>
    {Array.from({length: 8}).map((_, i) => (
      <rect key={i} x={-12} y={-74} width={24} height={30} fill={fill} transform={`rotate(${i * 45})`} />
    ))}
    <circle r={52} fill={fill} />
    <circle r={18} fill={C.bg} />
  </g>
);
