import React from 'react';
import {Destinations} from './ep001/Destinations';
import {JacketMath} from './ep001/JacketMath';
import {ReturnJourney} from './ep001/ReturnJourney';

// Native 9:16 scenes, referenced by `layout` in an episode's `shorts` list. A short without a
// layout falls back to the letterboxed episode band in compositions/Short.tsx.
export const SHORT_SCENES: Record<string, React.FC> = {
  'ep001-return-journey': ReturnJourney,
  'ep001-jacket-math': JacketMath,
  'ep001-destinations': Destinations,
};
