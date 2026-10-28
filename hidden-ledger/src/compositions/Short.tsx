import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cue, Timeline} from '../components/timeline';
import {Background, LedgerMark} from '../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../themes/theme';
import {Episode} from './Episode';

export type ShortProps = {timeline: Timeline; subtitles: boolean; from: number; to: number; title: string};

// Episode cues are line-broken for 16:9; here they reflow to the 9:16 width and hang from the
// bottom of the video band, clear of the bottom ~400 px the Shorts player covers.
const ShortSubtitles: React.FC<{cues: Cue[]}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  return (
    <div style={{position: 'absolute', top: 1290, left: 60, right: 60, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: 'rgba(10,12,15,0.88)', color: C.cream, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 58, lineHeight: 1.25, padding: '14px 30px', borderRadius: 14, textAlign: 'center'}}>
        {cue.text.replace(/\s*\n\s*/g, ' ')}
      </div>
    </div>
  );
};

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
      <div style={{position: 'absolute', top: 640, left: 0, width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden', borderTop: `4px solid ${C.orange}`, borderBottom: `4px solid ${C.orange}`}}>
        <Sequence from={-offset}>
          <Episode timeline={timeline} subtitles={false} />
        </Sequence>
      </div>
      {subtitles && (
        <Sequence from={-offset}>
          <ShortSubtitles cues={timeline.subtitles} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
