import { Chord, Note } from 'tonal';

const compareChords = (detectedChords, targetChord, ignoreTranspose = true) => {
  let detectedChordsForComparison = detectedChords;
  let targetChordForComparison = targetChord;
  
  if (ignoreTranspose) {
    detectedChordsForComparison = detectedChordsForComparison.map(ch => ch.split('/')[0]);
    targetChordForComparison = targetChord.split('/')[0];
  }

  // Get all detected chords with their properties
  const detectedChordObjects = detectedChordsForComparison.map(ch => Chord.get(ch));
  
  // Generate all enharmonics while preserving the original chord type
  const enharmonicsChords = detectedChordObjects.map(chord => {
    const enharmonicTonic = Note.enharmonic(chord.tonic);
    // Use the original chord type instead of current chordType
    return Chord.getChord(chord.type, enharmonicTonic).symbol;
  });

  const augmentedChords = [...detectedChordsForComparison, ...enharmonicsChords];

  // Get target chord properties
  const targetChordObj = Chord.get(targetChordForComparison);
  
  // Generate target chord enharmonic
  const targetEnharmonicTonic = Note.enharmonic(targetChordObj.tonic);
  const targetEnharmonicChord = Chord.getChord(targetChordObj.type, targetEnharmonicTonic).symbol;

  // Check if any chord in the augmented list matches the target chord or its enharmonic
  return augmentedChords.some(ch => {
    const detectedChord = Chord.get(ch);
    return detectedChord?.name === targetChordObj?.name || 
           detectedChord?.name === Chord.get(targetEnharmonicChord)?.name;
  });
};

export { compareChords };