import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {SceneContext, Timeline} from '../components/timeline';
import {Background, Hud, SceneWipe, Subtitles} from '../components/ui';
import {EPISODE_SCENES} from '../scenes';
import {GenericScene} from '../scenes/GenericScene';
import {loadFonts} from '../themes/fonts';

loadFonts();

export type EpisodeProps = {timeline: Timeline; subtitles: boolean};

export const Episode: React.FC<EpisodeProps> = ({timeline, subtitles}) => {
  const fps = timeline.fps;
  const registry = EPISODE_SCENES[timeline.episode] ?? {};
  return (
    <AbsoluteFill>
      <Background />
      {timeline.scenes.map((sc, i) => {
        const from = Math.round(sc.start * fps);
        const to = Math.round(sc.end * fps);
        const Comp = registry[sc.id] ?? GenericScene;
        const ctx = {
          scene: sc,
          index: i,
          total: timeline.scenes.length,
          durationInFrames: to - from,
          segStart: sc.segments.map((s) => Math.round(s.start * fps) - from),
          segEnd: sc.segments.map((s) => Math.round(s.end * fps) - from),
        };
        return (
          <Sequence key={sc.id} from={from} durationInFrames={to - from} name={`${sc.id} ${sc.title}`}>
            <SceneContext.Provider value={ctx}>
              <Comp />
            </SceneContext.Provider>
          </Sequence>
        );
      })}
      {/* wipe transitions centred on each scene change (timed with the whoosh SFX in mix.py) */}
      {timeline.scenes.slice(1).map((sc) => (
        <Sequence key={`w${sc.id}`} from={Math.round(sc.start * fps) - 11} durationInFrames={22} name={`wipe ${sc.id}`}>
          <SceneWipe dur={22} />
        </Sequence>
      ))}
      <Hud timeline={timeline} />
      {subtitles && <Subtitles cues={timeline.subtitles} />}
    </AbsoluteFill>
  );
};
