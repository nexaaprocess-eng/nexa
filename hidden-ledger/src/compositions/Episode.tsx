import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {CineContext, CineData, CineHud, CineSubtitles, Grade} from '../components/cine';
import {SceneContext, Timeline} from '../components/timeline';
import {Background, Hud, SceneWipe, Subtitles} from '../components/ui';
import {EPISODE_SCENES} from '../scenes';
import {GenericScene} from '../scenes/GenericScene';
import {loadFonts} from '../themes/fonts';

loadFonts();

// `cine` (episode 004+): composited Blender shots, cuts instead of wipes, lighter chrome.
export type EpisodeProps = {timeline: Timeline; subtitles: boolean; cine?: CineData};

export const Episode: React.FC<EpisodeProps> = ({timeline, subtitles, cine}) => {
  const fps = timeline.fps;
  const registry = EPISODE_SCENES[timeline.episode] ?? {};
  if (cine) {
    return (
      <CineContext.Provider value={cine}>
        <AbsoluteFill style={{background: '#0E0C0B'}}>
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
          <Grade />
          <CineHud timeline={timeline} />
          {subtitles && <CineSubtitles cues={timeline.subtitles} />}
        </AbsoluteFill>
      </CineContext.Provider>
    );
  }
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
