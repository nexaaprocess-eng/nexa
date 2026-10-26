import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useScene} from './timeline';

/**
 * Fades a scene in/out and moves a virtual camera:
 *  - a slow drift/zoom across the whole scene, and
 *  - a gentle "beat camera": at each narration segment the frame eases to a new framing
 *    (≈2% push + alternating small pan). Springs are overdamped, so it reads as editing rhythm, not shake.
 */
export const SceneShell: React.FC<{children: React.ReactNode; drift?: [number, number]; zoom?: number; beatCamera?: boolean}> = ({
  children,
  drift = [0, 0],
  zoom = 0.035,
  beatCamera = true,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {durationInFrames, segStart} = useScene();
  const o = interpolate(frame, [0, 12, durationInFrames - 12, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const p = frame / Math.max(1, durationInFrames);
  let s = 1 + zoom * p;
  let tx = drift[0] * p;
  let ty = drift[1] * p;
  if (beatCamera) {
    // accumulate per-segment camera targets with critically damped springs
    const targets = [
      [0, 0, 0],
      [-24, 6, 0.022],
      [18, -8, 0.012],
      [-10, 10, 0.028],
      [26, 0, 0.016],
    ];
    let cx = 0;
    let cy = 0;
    let cz = 0;
    segStart.forEach((st, i) => {
      if (i === 0) return;
      const k = spring({frame: frame - st, fps, config: {damping: 30, stiffness: 60, mass: 1}});
      const prev = targets[(i - 1) % targets.length];
      const next = targets[i % targets.length];
      cx += (next[0] - prev[0]) * k;
      cy += (next[1] - prev[1]) * k;
      cz += (next[2] - prev[2]) * k;
    });
    s += cz;
    tx += cx;
    ty += cy;
  }
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: '50% 50%'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
