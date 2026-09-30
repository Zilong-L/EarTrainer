import { useTranslation } from 'react-i18next';

interface Chord {
  degree: string;
  chordType: string;
}
interface CardStackProps {
  currentChord: Chord | null;
  disabledChords: string[];
  filteredChords: Chord[];
  setActiveChord: (chordName: string) => void;
  isAdvance: string;
  gameStarted: boolean;
}

export default function CardStack({
  currentChord,
  disabledChords,
  filteredChords,
  setActiveChord,
  isAdvance,
  gameStarted,
}: CardStackProps) {
  const { t } = useTranslation('chordColorTrainer');
  if (!gameStarted) return null;
  return (
    <div
      className="chord-lab-answers"
      role="group"
      aria-label={t('training.chooseAnswer')}
    >
      {filteredChords.map(chord => {
        const name = `${chord.degree}${chord.chordType}`;
        const correct =
          isAdvance !== 'No' &&
          currentChord &&
          name === `${currentChord.degree}${currentChord.chordType}`;
        const disabled = disabledChords.includes(name);
        return (
          <button
            key={name}
            type="button"
            onClick={() => setActiveChord(name)}
            disabled={disabled}
            className={`chord-lab-answer ${correct ? 'is-correct' : ''} ${disabled ? 'is-missed' : ''}`}
            aria-label={`${name}: ${t(`training.qualities.${chord.chordType}`, { defaultValue: chord.chordType })}`}
          >
            <strong>{name}</strong>
            <span>
              {t(`training.qualities.${chord.chordType}`, {
                defaultValue: chord.chordType,
              })}
            </span>
            {correct && (
              <span className="chord-lab-answer-mark" aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
