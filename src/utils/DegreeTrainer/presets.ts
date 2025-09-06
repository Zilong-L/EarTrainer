import { degrees, ORDERED_DEGREES } from '@EarTrainers/DegreeTrainer/Constants';

export enum ScaleDegree {
  First = 'First',
  FlatTwo = 'FlatTwo',
  Two = 'Two',
  FlatThree = 'FlatThree',
  Three = 'Three',
  Fourth = 'Fourth',
  FlatFifth = 'FlatFifth',
  Fifth = 'Fifth',
  FlatSix = 'FlatSix',
  Six = 'Six',
  FlatSeven = 'FlatSeven',
  Seven = 'Seven',
}

export type DegreePreset = {
  id: string;
  name: string;
  enabledDegrees: ScaleDegree[];
  source?: 'free' | 'challenge';
};

export type DegreeMaskPreset = {
  id: string;
  name: string;
  mask: boolean[]; // length 12
  source?: 'free' | 'challenge';
};

export const degreeToDistance: Record<ScaleDegree, number> = {
  [ScaleDegree.First]: 0,
  [ScaleDegree.FlatTwo]: 1,
  [ScaleDegree.Two]: 2,
  [ScaleDegree.FlatThree]: 3,
  [ScaleDegree.Three]: 4,
  [ScaleDegree.Fourth]: 5,
  [ScaleDegree.FlatFifth]: 6,
  [ScaleDegree.Fifth]: 7,
  [ScaleDegree.FlatSix]: 8,
  [ScaleDegree.Six]: 9,
  [ScaleDegree.FlatSeven]: 10,
  [ScaleDegree.Seven]: 11,
};

export const distanceToDegree = (d: number): ScaleDegree => {
  const norm = ((d % 12) + 12) % 12;
  const entry = (Object.keys(degreeToDistance) as ScaleDegree[]).find(
    k => degreeToDistance[k] === norm
  );
  if (!entry) throw new Error(`Unknown degree distance: ${d}`);
  return entry;
};

export const degreesToMask = (enabled: ScaleDegree[]): boolean[] => {
  const set = new Set(enabled);
  return ORDERED_DEGREES.map(d => set.has(d));
};

export const maskToDegrees = (mask: boolean[]): ScaleDegree[] =>
  ORDERED_DEGREES.filter((_, i) => !!mask[i]);

export const applyPresetToDegrees = (preset: DegreePreset) => {
  const enabledSet = new Set(preset.enabledDegrees);
  return ORDERED_DEGREES.map(deg => {
    const info = degrees[deg];
    return {
      degree: deg,
      symbol: info.symbol,
      distance: info.distance,
      interval: info.interval,
      enable: enabledSet.has(deg),
    } as any;
  });
};
