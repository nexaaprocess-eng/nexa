import React from 'react';
import {Composition, Still} from 'remotion';
import {Episode, EpisodeProps} from './Episode';
import {Thumbnail, ThumbProps} from './Thumbnail';
import {Short, ShortProps} from './Short';
import placeholder from './placeholder-timeline.json';
import {Timeline} from '../components/timeline';

// Timelines are passed with --props (written by scripts/render.mjs from the real audio).
const empty = placeholder as unknown as Timeline;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Episode"
      component={Episode}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={300}
      defaultProps={{timeline: empty, subtitles: true} satisfies EpisodeProps}
      calculateMetadata={({props}) => ({durationInFrames: Math.max(1, props.timeline.durationInFrames), fps: props.timeline.fps})}
    />
    <Composition
      id="Short"
      component={Short}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={300}
      defaultProps={{timeline: empty, subtitles: true, from: 0, to: 10, title: '', layout: ''} satisfies ShortProps}
      calculateMetadata={({props}) => ({durationInFrames: Math.max(1, Math.round((props.to - props.from) * props.timeline.fps))})}
    />
    <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} defaultProps={{variant: 1} satisfies ThumbProps} />
  </>
);
