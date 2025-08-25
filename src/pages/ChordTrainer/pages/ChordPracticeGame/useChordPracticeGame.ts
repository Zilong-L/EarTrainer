import { useState, useEffect, useCallback, useMemo } from 'react';
import { detect } from '@tonaljs/chord-detect';
import { Chord, Midi, Note } from 'tonal';
import {
  compareChords,
  getInversion,
  sortChordsByCommonality,
} from '@utils/ChordTrainer/GameLogics';
import { strangeChords } from '@utils/ChordTrainer/Constants';
import { useChordPracticeStore } from '../../stores/chordPracticeStore';

const useChordPracticeGame = () => {
  const [targetChord, setTargetChord] = useState<string>('');
  const [detectedChords, setDetectedChords] = useState<string[]>([]);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [sustainedNotes, setSustainedNotes] = useState<number[]>([]);

  const { selectedInversions, selectedChordTypes, drillMode } =
    useChordPracticeStore();

  const notes = useMemo(
    () =>
      Array(12)
        .fill(0)
        .map((_, i) => Note.transposeFifths('C', i - Math.floor(6))),
    []
  );

  const getNextChord = useCallback(() => {
    setTargetChord(prevTargetChord => {
      const chordType =
        selectedChordTypes[
          Math.floor(Math.random() * selectedChordTypes.length)
        ];
      const currentRoot = prevTargetChord
        ? Chord.get(prevTargetChord).tonic
        : 'C';
      let newRoot: string;

      switch (drillMode) {
        case 'circle_fifths':
          newRoot = Note.simplify(Note.transpose(currentRoot || 'C', 'P5'));
          break;
        case 'circle_fourths':
          newRoot = Note.simplify(Note.transpose(currentRoot || 'C', 'P4'));
          break;
        case 'semitone_up':
          newRoot = Note.simplify(Note.transpose(currentRoot || 'C', 'm2'));
          break;
        case 'semitone_down':
          newRoot = Note.simplify(Note.transpose(currentRoot || 'C', '-m2'));
          break;
        case 'random':
        default:
          do {
            newRoot = notes[Math.floor(Math.random() * notes.length)];
          } while (currentRoot === newRoot);
          break;
      }

      const maxInversion = chordType.includes('7') ? 3 : 2;
      const selectedInversion =
        selectedInversions[
          Math.floor(Math.random() * selectedInversions.length)
        ];
      let position: number;
      switch (selectedInversion) {
        case 'root':
          position = 0;
          break;
        case 'first':
          position = 1;
          break;
        case 'second':
          position = 2;
          break;
        case 'third':
          position = 3;
          break;
        case 'random':
          position = Math.floor(Math.random() * (maxInversion + 1));
          break;
        default:
          position = 0;
      }

      return getInversion(newRoot, chordType, position) as string;
    });
  }, [
    drillMode,
    JSON.stringify(selectedChordTypes),
    JSON.stringify(selectedInversions),
    notes,
  ]);

  useEffect(() => {
    if (!activeNotes || activeNotes.length === 0) {
      setDetectedChords([]);
      return;
    }
    const notesString = activeNotes.map(
      note => Midi.midiToNoteName(note) || ''
    );
    let chordResult = detect(notesString, { assumePerfectFifth: true });
    if (!chordResult) {
      setDetectedChords([]);
      return;
    }
    let chordResultObjects = chordResult.map(chord => Chord.get(chord));
    chordResultObjects = chordResultObjects.filter(
      chord => !strangeChords.includes(chord.type)
    );
    chordResult = sortChordsByCommonality(chordResultObjects);
    setDetectedChords(chordResult);
  }, [activeNotes]);

  useEffect(() => {
    if (!targetChord || activeNotes.length === 0) return;
    const isMatch = compareChords(
      detectedChords,
      targetChord,
      selectedInversions.length === 1 && selectedInversions[0] === 'root'
    );
    if (isMatch) {
      getNextChord();
    }
  }, [
    detectedChords,
    targetChord,
    activeNotes.length,
    getNextChord,
    selectedInversions,
  ]);

  useEffect(() => {
    getNextChord();
  }, [getNextChord]);

  return {
    targetChord,
    detectedChords,
    activeNotes,
    setActiveNotes,
    sustainedNotes,
    setSustainedNotes,
  };
};

export default useChordPracticeGame;
