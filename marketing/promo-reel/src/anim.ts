import {useCurrentFrame, useVideoConfig, random} from 'remotion';
import TL from './timeline.json';

export const tl = TL;
export const ev = TL.ev;

/** Tiempo actual en segundos. */
export const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

export const E = {
  linear: (x: number) => x,
  outCubic: (x: number) => 1 - Math.pow(1 - x, 3),
  outQuart: (x: number) => 1 - Math.pow(1 - x, 4),
  outQuint: (x: number) => 1 - Math.pow(1 - x, 5),
  outExpo: (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inCubic: (x: number) => x * x * x,
  inQuart: (x: number) => x * x * x * x,
  inOutCubic: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inOutQuart: (x: number) => (x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2),
  inOutSine: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x: number) => {
    const c1 = 1.5, c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  },
};

/** Progreso 0→1 entre los segundos `a` y `a + d`, con curva. */
export const p = (t: number, a: number, d: number, e: (x: number) => number = E.outCubic) =>
  e(clamp((t - a) / d));

/** Entrada y salida: sube en [a, a+din], baja en [b-dout, b]. */
export const inOut = (t: number, a: number, b: number, din = 0.4, dout = 0.4) =>
  Math.min(p(t, a, din, E.outCubic), 1 - p(t, b - dout, dout, E.inCubic));

export const rnd = (seed: string | number) => random(seed);
export const rr = (seed: string | number, a: number, b: number) => a + random(seed) * (b - a);

/** Número con formato español: 1.248 */
export const fmt = (n: number, dec = 0) =>
  n.toLocaleString('es-ES', {minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: 'always' as never});
