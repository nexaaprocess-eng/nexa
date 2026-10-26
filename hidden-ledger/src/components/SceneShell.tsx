import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {useScene} from './timeline';

/** Fades a scene in/out and applies a slow "camera" drift so vector layouts never sit perfectly still. */
export const SceneShell: React.FC<{children: React.ReactNode; drift?: [number, number]; zoom?: number}> = ({children, drift = [0, 0], zoom = 0.035}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useScene();
  const o = interpolate(frame, [0, 12, durationInFrames - 12, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const p = frame / Math.max(1, durationInFrames);
  const s = 1 + zoom * p;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{transform: `translate(${drift[0] * p}px, ${drift[1] * p}px) scale(${s})`, transformOrigin: '50% 50%'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
