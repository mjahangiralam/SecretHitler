import { SpecialPower } from '../types/game';

type PowerConfig = {
  [key in 5 | 7 | 9]: {
    [key: number]: SpecialPower;
  };
};

export const FASCIST_POWERS: PowerConfig = {
  5: {
    3: 'policy-peek',
    4: 'execution',
    5: 'execution'
  },
  7: {
    2: 'investigate-loyalty',
    3: 'special-election',
    4: 'execution',
    5: 'execution'
  },
  9: {
    1: 'investigate-loyalty',
    2: 'investigate-loyalty',
    3: 'special-election',
    4: 'execution',
    5: 'execution'
  }
}; 