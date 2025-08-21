import React from 'react';
import { DegreeDef } from '@EarTrainers/DegreeTrainer/Constants';
import { Dispatch, SetStateAction } from 'react';

export interface FreeTrainerSettings {
  currentNote: string;
  disabledNotes: string[];
  filteredNotes: DegreeDef[];
  isAdvance: 'No' | 'Ready' | 'Next' | 'Now';
  setIsAdvance: Dispatch<SetStateAction<'No' | 'Ready' | 'Next' | 'Now'>>;
  setActiveNote: (note: string) => void;
  playNote: (note: string) => void;
  bpm: number;
  gameState: 'end' | 'start' | 'playing' | 'paused';
  setGameState: (state: 'end' | 'start' | 'playing' | 'paused') => void;
  rootNote: string;
  isHandfree: boolean;
  useSolfege: boolean;
  isPlayingSound: boolean;
}

declare const FreeMode: React.FC<{ FreeTrainerSettings: FreeTrainerSettings }>;

export default FreeMode;
