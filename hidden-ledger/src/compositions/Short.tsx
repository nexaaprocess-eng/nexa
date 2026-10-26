import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Timeline} from '../components/timeline';
import {Background, LedgerMark, Subtitles} from '../components/ui';
import {C, FONT_TITLE} from '../themes/theme';
import {Episode} from './Episode';

export type ShortProps = {timeline: Timeline; subtitles: boolean; from: number; to: number; title: string};

// 9:16 cut-down: reuses the episode render (same scenes, same timing) in a letterboxed band,
// with a title on top and larger subtitles below. Audio is cut from the same mix by the pipeline.
export const Short: React.FC<ShortProps> = ({timeline, from, title, subtitles}) => {
  const offset = Math.round(from * timeline.fps);
  const scale = 1080 / 1920;
  return (
    <AbsoluteFill>
      <Background />
      <div style={{position: 'absolute', top: 150, left: 60, right: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <LedgerMark size={44} />
          <span style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 32, letterSpacing: 4, color: C.cream}}>HIDDEN LEDGER</span>
        </div>
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 84, lineHeight: 1.02, color: C.cream, textAlign: 'center', letterSpacing: -1.5}}>{title}</div>
      </div>
      <div style={{position: 'absolute', top: 640, left: 0, width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', borderTop: `4px solid ${C.orange}`, borderBottom: `4px solid ${C.orange}`}}>
        <Sequence from={-offset}>
          <Episode timeline={timeline} subtitles={false} />
        </Sequence>
      </div>
      {subtitles && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1300, height: 420, transform: 'scale(1.25)', transformOrigin: 'top center'}}>
          <Sequence from={-offset}>
            <Subtitles cues={timeline.subtitles} />
          </Sequence>
        </div>
      )}
    </AbsoluteFill>
  );
};
