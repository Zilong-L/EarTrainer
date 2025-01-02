import { Chord, Note } from 'tonal';
import {niceChordNames,chordCommonnessHash} from '@utils/ChordTrainer/Constants'
const compareChords = (detectedChords, targetChord, ignoreTranspose = false) => {
  let detectedChordsForComparison = detectedChords;
  let targetChordForComparison = targetChord;

  if (ignoreTranspose) {
    detectedChordsForComparison = detectedChordsForComparison.map(ch => ch.split('/')[0]);
    targetChordForComparison = targetChordForComparison.split('/')[0];
  }

  return detectedChordsForComparison.some(ch => {
    const chordObject = Chord.get(ch);
    const targetChordObject = Chord.get(targetChordForComparison);
    const chordBass = chordObject.bass
    const targetChordBass = targetChordObject.bass
    const chordRoot = chordObject.tonic
    const targetChordRoot = targetChordObject.tonic
    const chordType = chordObject.type
    const targetChordType = targetChordObject.type
    if (targetChordBass) {
      return isSameNote(chordBass, targetChordBass) && isSameNote(chordRoot, targetChordRoot) && chordType === targetChordType;
    }
    else {
      return isSameNote(chordRoot, targetChordRoot) && chordType === targetChordType;
    }
  });
};

// function to get a inversion of a chord
// it is possible to return a chord in root position.
function getInversion(root, symbol, position = -1) {
  const chord = Chord.get(`${root}${symbol}`);
  if (!chord.notes || chord.notes.length === 0) return [`${root}${symbol}`];

  const inversions = [];
  // Add root position
  inversions.push(`${root}${symbol}`);

  // Generate inversions
  for (let i = 1; i < chord.notes.length; i++) {
    const bassNote = chord.notes[i];
    inversions.push(`${root}${symbol}/${bassNote}`);
  }
  if (position > -1) {
    return inversions[position];
  }
  return inversions[Math.random() * inversions.length | 0];
}

const isSameNote = (note1, note2) => {
  if (!note1 || !note2) return false;
  const SimplifiedNote1 = Note.simplify(note1);
  const SimplifiedNote2 = Note.simplify(note2);

  const enharmonicNote1 = Note.enharmonic(SimplifiedNote1);
  return SimplifiedNote1 === SimplifiedNote2 || enharmonicNote1 === SimplifiedNote2;
};

const getNiceChordName = (chords) => {
  return chords.map((chord) => {
    const chordObject = Chord.get(chord)
    const bass = Note.simplify(chordObject.bass)
    if(!chordObject.type){
      return '';
    }
    if (bass) {
      return `${chordObject.tonic}${niceChordNames[chordObject.type]} / ${bass}`
    } else {
      return `${chordObject.tonic}${niceChordNames[chordObject.type]}`
    }
  })
}

const sortChordsByCommonality = (chordResultObjects) => {
  const sortedChordResultObjects =  chordResultObjects.sort((a, b) => {
    return chordCommonnessHash[a.type] - chordCommonnessHash[b.type]
  })
  return sortedChordResultObjects.map(chord => chord.symbol)
}
export { compareChords, getInversion, getNiceChordName,sortChordsByCommonality};