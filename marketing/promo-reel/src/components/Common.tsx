import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {clamp, E, useT} from '../anim';

/** Fondo negro verdoso con rejilla en perspectiva y resplandores suaves. */
export const Background: React.FC<{grid?: number; glow?: number; glowY?: number; drift?: number}> = ({
  grid = 0.5, glow = 0.5, glowY = 45, drift = 0,
}) => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 90% 55% at 50% ${glowY}%, rgba(0,168,107,${0.16 * glow}) 0%, rgba(0,60,38,${0.12 * glow}) 35%, transparent 70%)`,
      }} />
      {/* suelo en perspectiva */}
      <div style={{position: 'absolute', left: -1200, right: -1200, top: 1180, height: 1800, perspective: 900, opacity: grid}}>
        <div style={{
          position: 'absolute', inset: 0, transform: 'rotateX(74deg)', transformOrigin: '50% 0%',
          backgroundImage: `linear-gradient(rgba(61,220,151,.22) 2px, transparent 2px), linear-gradient(90deg, rgba(61,220,151,.22) 2px, transparent 2px)`,
          backgroundSize: '120px 120px',
          backgroundPosition: `0px ${(t * 40 + drift) % 120}px`,
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 25%, #000 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 22%, #000 45%, transparent 90%)',
        }} />
      </div>
      {/* techo espejo, más tenue */}
      <div style={{position: 'absolute', left: -1200, right: -1200, bottom: 1180, height: 1800, perspective: 900, opacity: grid * 0.35}}>
        <div style={{
          position: 'absolute', inset: 0, transform: 'rotateX(-74deg)', transformOrigin: '50% 100%',
          backgroundImage: `linear-gradient(rgba(61,220,151,.18) 2px, transparent 2px), linear-gradient(90deg, rgba(61,220,151,.18) 2px, transparent 2px)`,
          backgroundSize: '120px 120px',
          backgroundPosition: `0px ${-(t * 40 + drift) % 120}px`,
          WebkitMaskImage: 'linear-gradient(0deg, transparent 0%, #000 22%, #000 40%, transparent 85%)',
        }} />
      </div>
    </AbsoluteFill>
  );
};

/** Grano de película + viñeta, encima de todo. */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 48%, transparent 55%, rgba(0,0,0,.65) 100%)'}} />
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1080" height="1920" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Halo de luz verde. */
export const Glow: React.FC<{x: number; y: number; r: number; o?: number; color?: string}> = ({x, y, r, o = 1, color = '0,168,107'}) => (
  <div style={{
    position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%',
    background: `radial-gradient(circle, rgba(${color},${0.55 * o}) 0%, rgba(${color},${0.18 * o}) 35%, rgba(${color},0) 70%)`,
    pointerEvents: 'none',
  }} />
);

/**
 * Texto que aparece palabra a palabra desde una máscara, con desenfoque.
 * `at` = segundo de inicio; `out` = segundo en que empieza a desaparecer.
 */
export const Reveal: React.FC<{
  text: string; at: number; out?: number; size: number; weight?: number; color?: string;
  accent?: string[]; accentColor?: string; stagger?: number; dur?: number; align?: 'center' | 'left';
  tracking?: string; lineHeight?: number; font?: string; style?: React.CSSProperties; upper?: boolean;
}> = ({text, at, out, size, weight = 800, color = C.white, accent = [], accentColor = C.green300, stagger = 0.07,
  dur = 0.75, align = 'center', tracking = '-0.025em', lineHeight = 1.08, font = F.head, style, upper = true}) => {
  const t = useT();
  const lines = text.split('\n');
  let k = 0;
  const o = out === undefined ? 0 : E.inCubic(clamp((t - out) / 0.45));
  return (
    <div style={{fontFamily: font, fontSize: size, fontWeight: weight, color, textAlign: align, lineHeight,
      letterSpacing: tracking, textTransform: upper ? 'uppercase' : 'none', opacity: 1 - o,
      transform: `translateY(${-o * 30}px)`, filter: o > 0 ? `blur(${o * 10}px)` : undefined, ...style}}>
      {lines.map((ln, li) => (
        <div key={li} style={{display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', flexWrap: 'wrap', columnGap: '0.26em'}}>
          {ln.split(' ').map((w, wi) => {
            const v = E.outQuart(clamp((t - at - k++ * stagger) / dur));
            const isAcc = accent.includes(w.replace(/[¿?.,!¡]/g, ''));
            return (
              <span key={wi} style={{display: 'inline-block', clipPath: 'inset(-1em -1em -0.22em -1em)'}}>
                <span style={{
                  display: 'inline-block', transform: `translateY(${(1 - v) * 125}%)`, opacity: v,
                  filter: v < 1 ? `blur(${(1 - v) * 8}px)` : undefined,
                  color: isAcc ? accentColor : undefined,
                  textShadow: isAcc ? `0 0 ${size * 0.45}px rgba(0,168,107,.55)` : undefined,
                }}>{w}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Visibilidad de una escena según la línea de tiempo (fundido de entrada/salida). */
export const sceneAlpha = (t: number, [a, b]: number[], fin = 0.3, fout = 0.3) =>
  Math.min(clamp((t - a) / fin), clamp((b - t) / fout));
