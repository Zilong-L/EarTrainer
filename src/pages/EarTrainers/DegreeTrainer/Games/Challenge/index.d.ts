import React from 'react';
import { DegreeDef } from '@EarTrainers/DegreeTrainer/Constants';
import { Dispatch, SetStateAction } from 'react';

export interface ChallengeTrainerSettings {
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
  currentPracticeRecords: {
    total: number;
    correct: number;
  };
  currentLevel: number;
  userProgress: Array<{
    minTests: number;
  }>;
  isHandfree: boolean;
  useSolfege: boolean;
  isPlayingSound: boolean;
}

declare const ChallengeMode: React.FC<{ ChallengeTrainerSettings: ChallengeTrainerSettings }>;

export default ChallengeMode;
