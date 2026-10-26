import React from 'react';
import {SceneShell} from '../components/SceneShell';
import {useBeats, useScene} from '../components/timeline';
import {Abs, Body, Kicker, Title} from '../components/ui';
import {C} from '../themes/theme';

/**
 * Data-only fallback for scenes without a custom component (new episodes work before any design pass).
 * Shows the chapter title, then the current sentence's first clause as an animated pull-quote.
 */
export const GenericScene: React.FC = () => {
  const {scene} = useScene();
  const b = useBeats();
  return (
    <SceneShell drift={[0, -12]}>
      <Abs x={160} y={220} w={1600} o={b.ramp(0, 0, 0.6)}>
        <Kicker>{scene.chapter}</Kicker>
      </Abs>
      {scene.segments.map((seg, i) => {
        const line = seg.text.split(/(?<=[.?!:])\s/)[0];
        return (
          <Abs key={seg.id} x={160} y={330} w={1500} o={b.during(i, i)} ty={30 * (1 - b.pop(i))}>
            <Title size={72}>{line}</Title>
            <Body size={30} color={C.muted} style={{marginTop: 24}}>
              {seg.claims.length ? `Claims: ${seg.claims.join(', ')}` : ''}
            </Body>
          </Abs>
        );
      })}
    </SceneShell>
  );
};
