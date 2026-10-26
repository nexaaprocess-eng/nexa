import React from 'react';
import {S01ColdOpen} from './S01ColdOpen';
import {S02Scale} from './S02Scale';
import {S03ReverseLogistics} from './S03ReverseLogistics';
import {S04Costs} from './S04Costs';
import {S05WhoPays} from './S05WhoPays';
import {S06Destinations} from './S06Destinations';
import {S07WhyFree} from './S07WhyFree';
import {S08Payoff} from './S08Payoff';

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
};
