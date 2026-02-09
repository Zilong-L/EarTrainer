import { Chord, Interval, Note } from 'tonal';

export function transposeChordSymbol(
  symbol: string,
  fromTonic: string,
  toTonic: string
): string {
  const trimmed = (symbol ?? '').trim();
  if (!trimmed) return '';

  const interval = Interval.distance(fromTonic, toTonic);
  const [tonic, type, bass] = Chord.tokenize(trimmed);

  if (!tonic) return trimmed;

  const nextTonic = Note.transpose(tonic, interval);
  const nextBass = bass ? Note.transpose(bass, interval) : '';

  return nextBass ? `${nextTonic}${type}/${nextBass}` : `${nextTonic}${type}`;
}
