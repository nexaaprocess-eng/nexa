import React from 'react';
import {S01ColdOpen} from './S01ColdOpen';
import {S02Scale} from './S02Scale';
import {S03ReverseLogistics} from './S03ReverseLogistics';
import {S04Costs} from './S04Costs';
import {S05WhoPays} from './S05WhoPays';
import {S06Destinations} from './S06Destinations';
import {S07WhyFree} from './S07WhyFree';
import {S08Payoff} from './S08Payoff';
import {S01ColdOpen as E2S01} from './ep002/S01ColdOpen';
import {S02Scale as E2S02} from './ep002/S02Scale';
import {S03Margins as E2S03} from './ep002/S03Margins';
import {S04Basket as E2S04} from './ep002/S04Basket';
import {S05Speed as E2S05} from './ep002/S05Speed';
import {S06Suppliers as E2S06} from './ep002/S06Suppliers';
import {S07PrivateLabel as E2S07} from './ep002/S07PrivateLabel';
import {S08Shrink as E2S08} from './ep002/S08Shrink';
import {S09Models as E2S09} from './ep002/S09Models';
import {S10Payoff as E2S10} from './ep002/S10Payoff';

// Scene registry per episode: scene id (content/episode-XXX/episode.json) -> component.
// Scenes without an entry render with GenericScene, so a new episode works from data alone.
export const EPISODE_SCENES: Record<string, Record<string, React.FC>> = {
  '001': {
    s01: S01ColdOpen,
    s02: S02Scale,
    s03: S03ReverseLogistics,
    s04: S04Costs,
    s05: S05WhoPays,
    s06: S06Destinations,
    s07: S07WhyFree,
    s08: S08Payoff,
  },
  '002': {
    s01: E2S01,
    s02: E2S02,
    s03: E2S03,
    s04: E2S04,
    s05: E2S05,
    s06: E2S06,
    s07: E2S07,
    s08: E2S08,
    s09: E2S09,
    s10: E2S10,
  },
};
