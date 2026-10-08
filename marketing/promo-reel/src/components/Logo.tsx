import React from 'react';
import {C} from '../theme';
import {clamp, E} from '../anim';

/**
 * Logo original de NEXA Process (geometría exacta de assets/logo.svg).
 * Sobre fondo oscuro, las letras en azul marino se muestran en blanco (versión en negativo);
 * la barra verde de la X conserva su color #00A86B.
 *
 * Todos los parámetros van de 0 a 1:
 *  line    → dibuja el contorno de la barra verde de la X
 *  green   → rellena la barra verde
 *  bar     → aparece la otra barra de la X
 *  letters → aparecen N, E y A
 *  process → aparece "PROCESS"
 *  glow    → intensidad del resplandor verde
 *  sweep   → posición de un reflejo de luz que cruza el logo (0 = fuera, 1 = recorrido completo)
 */
export const Logo: React.FC<{
  id: string; width: number; line?: number; green?: number; bar?: number; letters?: number;
  process?: number; glow?: number; sweep?: number; ink?: string;
}> = ({id, width, line = 1, green = 1, bar = 1, letters = 1, process = 1, glow = 0.6, sweep = 0, ink = C.white}) => {
  const GREEN = '350,0 405,0 565,190 510,190';
  const letter = (k: number, from: number) => {
    const v = E.outQuart(clamp(letters * 1.6 - k * 0.3));
    return {opacity: v, transform: `translateX(${(1 - v) * from}px)`};
  };
  const pr = E.outCubic(clamp(process));
  const sx = -200 + sweep * 1200;
  return (
    <svg width={width} height={(width * 310) / 785} viewBox="-10 -10 785 310" style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <mask id={`gap-${id}`} maskUnits="userSpaceOnUse">
          <rect x="-20" y="-20" width="820" height="340" fill="#fff" />
          <polygon points={GREEN} fill="#000" stroke="#000" strokeWidth="24" strokeLinejoin="round" />
        </mask>
        <clipPath id={`bar-${id}`}>
          <rect x={355 - 40} y={190 - 230 * E.outQuart(clamp(bar))} width="260" height="240" />
        </clipPath>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <linearGradient id={`sweep-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`shape-${id}`} maskUnits="userSpaceOnUse">
          <g fill="#fff">
            <polygon points="0,190 0,0 48,0 124,104 124,0 170,0 170,190 122,190 46,86 46,190" />
            <path d="M190 0h150v40H236v35h96v40h-96v35h104v40H190z" />
            <polygon points="575,190 648,0 692,0 765,190 715,190 670,72 625,190" />
            <polygon points={GREEN} />
            <polygon points="500,0 555,0 410,190 355,190" />
          </g>
        </mask>
      </defs>

      {/* resplandor de la barra verde */}
      <polygon points={GREEN} fill={C.green} opacity={glow * Math.max(green, line * 0.6)} filter={`url(#glow-${id})`} />

      <g fill={ink}>
        <polygon style={letter(0, -40)} points="0,190 0,0 48,0 124,104 124,0 170,0 170,190 122,190 46,86 46,190" />
        <path style={letter(1, -30)} d="M190 0h150v40H236v35h96v40h-96v35h104v40H190z" />
        <g clipPath={`url(#bar-${id})`}>
          <polygon points="500,0 555,0 410,190 355,190" mask={`url(#gap-${id})`} />
        </g>
        <polygon style={letter(2, 40)} points="575,190 648,0 692,0 765,190 715,190 670,72 625,190" />
        <text x="4" y="282" fontFamily="Montserrat, sans-serif" fontSize="66" fontWeight={500}
          textLength="757" lengthAdjust="spacing"
          style={{opacity: pr, transform: `translateY(${(1 - pr) * 16}px)`}}>PROCESS</text>
      </g>

      {/* barra verde: contorno que se dibuja y relleno */}
      <polygon points={GREEN} fill={C.green} opacity={E.outCubic(clamp(green))} />
      {line > 0 && green < 1 && (
        <polygon points={GREEN} fill="none" stroke={C.green300} strokeWidth="3" pathLength={1}
          strokeDasharray="1 1" strokeDashoffset={1 - line} strokeLinejoin="round"
          opacity={1 - clamp(green)} />
      )}

      {/* reflejo de luz */}
      {sweep > 0 && sweep < 1 && (
        <g mask={`url(#shape-${id})`}>
          <rect x={sx} y="-20" width="160" height="340" fill={`url(#sweep-${id})`} transform={`skewX(-20)`} />
        </g>
      )}
    </svg>
  );
};
