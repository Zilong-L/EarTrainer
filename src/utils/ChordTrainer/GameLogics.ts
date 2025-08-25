import { Midi, Chord, Note } from 'tonal';
import {
  strangeChords,
  niceChordNames,
  chordCommonnessHash,
} from '@utils/ChordTrainer/Constants';

const isSameNote = (note1?: string | null, note2?: string | null): boolean => {
  if (!note1 || !note2) return false;
  const SimplifiedNote1 = Note.simplify(note1);
  const SimplifiedNote2 = Note.simplify(note2);
  const enharmonicNote1 = Note.enharmonic(SimplifiedNote1);
  return (
    SimplifiedNote1 === SimplifiedNote2 || enharmonicNote1 === SimplifiedNote2
  );
};

const compareChords = (
  detectedChords: string[],
  targetChord: string,
  ignoreTranspose = false
): boolean => {
  let detectedChordsForComparison = detectedChords;
  let targetChordForComparison = targetChord;

  if (ignoreTranspose) {
    detectedChordsForComparison = detectedChordsForComparison.map(
      ch => ch.split('/')[0]
    );
    targetChordForComparison = targetChordForComparison.split('/')[0];
  }

  return detectedChordsForComparison.some(ch => {
    const chordObject = Chord.get(ch);
    const targetChordObject = Chord.get(targetChordForComparison);
    const chordBass = chordObject.bass;
    const targetChordBass = targetChordObject.bass;
    const chordRoot = chordObject.tonic;
    const targetChordRoot = targetChordObject.tonic;
    const chordType = chordObject.type;
    const targetChordType = targetChordObject.type;
    if (targetChordBass) {
      return (
        isSameNote(chordBass, targetChordBass) &&
        isSameNote(chordRoot, targetChordRoot) &&
        chordType === targetChordType
      );
    } else {
      return (
        isSameNote(chordRoot, targetChordRoot) && chordType === targetChordType
      );
    }
  });
};

function getInversion(
  root: string,
  symbol: string,
  position = -1
): string | string[] {
  const chord = Chord.get(`${root}${symbol}`);
  if (!chord.notes || chord.notes.length === 0) return [`${root}${symbol}`];

  const inversions: string[] = [];
  inversions.push(`${root}${symbol}`);

  for (let i = 1; i < chord.notes.length; i++) {
    const bassNote = chord.notes[i]!;
    inversions.push(`${root}${symbol}/${bassNote}`);
  }
  if (position > -1) {
    return inversions[position] ?? inversions[0];
  }
  return inversions[(Math.random() * inversions.length) | 0];
}

const getNiceChordName = (chords: string[]): string[] => {
  return chords.map(chord => {
    const chordObject = Chord.get(chord);
    const bass = chordObject.bass ? Note.simplify(chordObject.bass) : '';
    if (!chordObject.type) {
      return '';
    }
    if (bass) {
      return `${chordObject.tonic}${niceChordNames[chordObject.type] ?? chordObject.type} / ${bass}`;
    } else {
      return `${chordObject.tonic}${niceChordNames[chordObject.type] ?? chordObject.type}`;
    }
  });
};

type ChordObject = ReturnType<typeof Chord.get> & { symbol?: string };

const sortChordsByCommonality = (
  chordResultObjects: ChordObject[]
): string[] => {
  const sortedChordResultObjects = chordResultObjects.sort((a, b) => {
    const aVal =
      chordCommonnessHash[a.type as keyof typeof chordCommonnessHash] ??
      Number.MAX_SAFE_INTEGER;
    const bVal =
      chordCommonnessHash[b.type as keyof typeof chordCommonnessHash] ??
      Number.MAX_SAFE_INTEGER;
    return aVal - bVal;
  });
  return sortedChordResultObjects.map(
    chord => (chord as any).symbol ?? `${chord.tonic}${chord.type}`
  );
};

const getChords = (notes: number[]): string[] | undefined => {
  const notesString = notes.map(note => Midi.midiToNoteName(note));
  let chordResult = Chord.detect(notesString, { assumePerfectFifth: true });
  if (!chordResult) {
    return;
  }
  let chordResultObjects = chordResult.map(chord =>
    Chord.get(chord)
  ) as ChordObject[];
  chordResultObjects = chordResultObjects.filter(
    chord => !strangeChords.includes(chord.type)
  );

  chordResult = sortChordsByCommonality(chordResultObjects);
  return chordResult;
};

export {
  compareChords,
  getInversion,
  getNiceChordName,
  sortChordsByCommonality,
  isSameNote,
  getChords,
};
