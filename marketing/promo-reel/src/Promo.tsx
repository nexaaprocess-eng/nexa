import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Background, Finish} from './components/Common';
import {mix, p, tl, useT} from './anim';
import {S1Hook} from './scenes/S1Hook';
import {S2Brand} from './scenes/S2Brand';
import {S3Docs} from './scenes/S3Docs';
import {S4Stock} from './scenes/S4Stock';
import {S5AI} from './scenes/S5AI';
import {S6Outro} from './scenes/S6Outro';

const SC = tl.scenes;
const on = (t: number, [a, b]: number[]) => t >= a - 0.02 && t <= b + 0.02;

export const Promo: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
  const t = useT();
  // la rejilla del fondo solo se ve en las escenas de producto
  const grid = Math.min(p(t, SC.s2[0] + 1.5, 1.2), 1 - p(t, SC.s5[0] - 0.3, 0.6)) * 0.55;
  const glowY = t < SC.s3[0] ? 47 : t < SC.s5[0] ? mix(40, 55, p(t, SC.s3[0], 11)) : 44;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Background grid={grid} glow={t < SC.s2[0] ? 0.4 : 1 - p(t, SC.s6[0] - 0.2, 0.6) * 0.6} glowY={glowY} />
      {on(t, SC.s1) && <S1Hook />}
      {on(t, SC.s2) && <S2Brand />}
      {on(t, SC.s3) && <S3Docs />}
      {on(t, SC.s4) && <S4Stock />}
      {on(t, SC.s5) && <S5AI />}
      {on(t, SC.s6) && <S6Outro />}
      <Finish />
      {withAudio && <Audio src={staticFile('audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
