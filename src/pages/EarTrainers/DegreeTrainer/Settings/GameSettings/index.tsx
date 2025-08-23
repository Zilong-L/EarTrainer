import { useTranslation } from 'react-i18next';
import FreeSettings from '@EarTrainers/DegreeTrainer/Games/Free/FreeSettings';
import ChallengeSettings from '@EarTrainers/DegreeTrainer/Games/Challenge/ChallengeSettings';
import { useDegreeTrainerSettings } from '@EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';

type DegreeNote = { name: string; distance: number; enable: boolean };
type FreeTrainerSettingsShape = {
    customNotes: DegreeNote[];
    handleDegreeToggle: (index: number) => void;
    setCustomNotes: (notes: DegreeNote[]) => void;
    selectedMode: string;
    setSelectedMode: (v: string) => void;
};

type LevelProgress = {
    level: number;
    unlocked: boolean;
    stars: number;
    best: number;
    minTests: number;
};

type ChallengeTrainerSettingsShape = {
    userProgress: LevelProgress[];
    currentLevel: number;
    updateLevel: (index: number) => void;
    resetUserProgress: () => void;
};

type GameSettingsProps = {
    currentGameSettings: FreeTrainerSettingsShape | ChallengeTrainerSettingsShape;
};

function GameSettings({ currentGameSettings }: GameSettingsProps) {
    const {
        mode,
        setMode,
        stats: {
            setCurrentPracticeRecords,
        }
    } = useDegreeTrainerSettings();

    const { t } = useTranslation('degreeTrainer');

    return (
        <div className="p-6 space-y-12">
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        setMode('free');
                        setCurrentPracticeRecords({ total: 0, correct: 0 });
                    }}
                    className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'free'
                        ? 'bg-notification-bg text-notification-text'
                        : 'bg-bg-main text-text-primary hover:bg-bg-hover'
                        }`}
                >
                    {t('intro.freeMode')}
                </button>
                <button
                    onClick={() => {
                        setMode('challenge');
                        setCurrentPracticeRecords({ total: 0, correct: 0 });

                    }}
                    className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'challenge'
                        ? 'bg-notification-bg text-notification-text'
                        : 'bg-bg-main text-text-primary hover:bg-bg-hover'
                        }`}
                >
                    {t('intro.challengeMode')}
                </button>
            </div>

            {mode === 'free' && (
                <FreeSettings
                    FreeTrainerSettings={currentGameSettings as FreeTrainerSettingsShape}
                />
            )}

            {mode === 'challenge' && (
                <ChallengeSettings
                    ChallengeTrainerSettings={currentGameSettings as ChallengeTrainerSettingsShape}
                />
            )}
        </div>
    );
}

export default GameSettings;
