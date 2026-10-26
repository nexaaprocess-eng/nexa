import React, {createContext, useContext} from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type TlSegment = {
  id: string;
  key: string;
  text: string;
  start: number;
  end: number;
  duration: number;
  claims: string[];
  duck: boolean;
  words?: [number, string][];
};
export type TlScene = {
  id: string;
  title: string;
  chapter: string;
  music: string;
  start: number;
  end: number;
  segments: TlSegment[];
};
export type Cue = {start: number; end: number; text: string};
export type Timeline = {
  episode: string;
  title: string;
  name: string;
  fps: number;
  duration: number;
  durationInFrames: number;
  scenes: TlScene[];
  subtitles: Cue[];
};

/** Scene-local timing: frames of each narration segment relative to the scene start. */
export type SceneCtx = {
  scene: TlScene;
  index: number;
  total: number;
  durationInFrames: number;
  segStart: number[];
  segEnd: number[];
};

export const SceneContext = createContext<SceneCtx | null>(null);

export const useScene = () => {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene outside SceneContext');
  return ctx;
};

/**
 * Beat helper for a scene. `at(i)` = frame where narration segment i starts (scene-local).
 * Missing segments (e.g. the pilot cuts a scene short) resolve to "never" so later beats stay hidden.
 */
export const useBeats = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ctx = useScene();
  const NEVER = 1e9;
  const at = (i: number, offsetSec = 0) =>
    i < ctx.segStart.length ? ctx.segStart[i] + Math.round(offsetSec * fps) : NEVER;
  const end = (i: number) => (i < ctx.segEnd.length ? ctx.segEnd[i] : NEVER);
  /** 0..1 spring that starts at segment i (+offset seconds). */
  const pop = (i: number, offsetSec = 0, damping = 16) =>
    spring({frame: frame - at(i, offsetSec), fps, config: {damping, mass: 0.7, stiffness: 120}});
  /** linear-eased 0..1 ramp from segment i start (+offset) over `dur` seconds */
  const ramp = (i: number, offsetSec = 0, dur = 0.6) =>
    interpolate(frame - at(i, offsetSec), [0, dur * fps], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.33, 0, 0.2, 1),
    });
  /** progress through segment i (0 at start, 1 at end) */
  const through = (i: number) =>
    interpolate(frame, [at(i), Math.max(at(i) + 1, end(i))], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  /** 1 while the current segment index is in [a, b] (with soft edges), else 0 */
  const during = (a: number, b: number, fadeSec = 0.4) => {
    if (a >= ctx.segStart.length) return 0;
    const s = at(a);
    const e = b + 1 < ctx.segStart.length ? at(b + 1) : ctx.durationInFrames;
    const f = Math.min(fadeSec * fps, (e - s) / 2);
    return interpolate(frame, [s - f, s, e - f, e], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };
  const has = (i: number) => i < ctx.segStart.length;
  /**
   * Scene-local frame where a spoken word matching `re` occurs in segment i (ASR anchor).
   * Falls back to `fallbackFrac` of the segment if the word is not found.
   */
  const word = (i: number, re: RegExp, fallbackFrac = 0.5, nth = 0) => {
    if (!has(i)) return NEVER;
    const seg = ctx.scene.segments[i];
    const hits = (seg.words ?? []).filter(([, w]) => re.test(w.replace(/[^\w$%.,']/g, '')));
    if (hits[nth]) return Math.round(hits[nth][0] * fps) - Math.round(ctx.scene.start * fps);
    return Math.round(at(i) + (end(i) - at(i)) * fallbackFrac);
  };
  /** 0..1 ramp starting at a spoken word */
  const rampAt = (f0: number, dur = 0.5) =>
    interpolate(frame - f0, [0, dur * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 0, 0.2, 1)});
  const popAt = (f0: number) => spring({frame: frame - f0, fps, config: {damping: 16, mass: 0.7, stiffness: 120}});
  return {frame, fps, at, end, pop, ramp, through, during, has, word, rampAt, popAt, ctx};
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const Ctx = SceneContext.Provider;
export const h = React.createElement;
