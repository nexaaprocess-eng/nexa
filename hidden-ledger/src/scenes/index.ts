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
import {S01ColdOpen as E3S01} from './ep003/S01ColdOpen';
import {S02Ownership as E3S02} from './ep003/S02Ownership';
import {S03Switch as E3S03} from './ep003/S03Switch';
import {S04TwoCompanies as E3S04} from './ep003/S04TwoCompanies';
import {S05Math as E3S05} from './ep003/S05Math';
import {S06Data as E3S06} from './ep003/S06Data';
import {S07Wallet as E3S07} from './ep003/S07Wallet';
import {S08Breaks as E3S08} from './ep003/S08Breaks';
import {S09Reason as E3S09} from './ep003/S09Reason';
import {E4S01, E4S02, E4S03, E4S04, E4S05, E4S06, E4S07, E4S08} from './ep004/scenes';
import {E5S01, E5S02, E5S03, E5S04, E5S05, E5S06, E5S07} from './ep005/scenes';

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
  '003': {
    s01: E3S01,
    s02: E3S02,
    s03: E3S03,
    s04: E3S04,
    s05: E3S05,
    s06: E3S06,
    s07: E3S07,
    s08: E3S08,
    s09: E3S09,
  },
  '004': {s01: E4S01, s02: E4S02, s03: E4S03, s04: E4S04, s05: E4S05, s06: E4S06, s07: E4S07, s08: E4S08},
  '005': {s01: E5S01, s02: E5S02, s03: E5S03, s04: E5S04, s05: E5S05, s06: E5S06, s07: E5S07},
};
