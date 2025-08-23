import { useTranslation } from 'react-i18next';
import { useDegreeTrainerSettings } from '@EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';
import HorizontalSlider from '@components/slider/HorizontalSlider';

function VolumeSettings(): JSX.Element {
    // Keep Tone.js volumes in sync with settings

    const { t } = useTranslation('degreeTrainer');
    const { volume: { droneVolume, setDroneVolume, pianoVolume, setPianoVolume, answerVolume, setAnswerVolume } } = useDegreeTrainerSettings();
    console.log(pianoVolume);

    return (
        <div className="p-6 space-y-12">
            <div className="text-lg font-semibold text-text-primary">
                {t('settings.DroneVolume')}
                <HorizontalSlider min={0} max={1} step={0.01} setState={setDroneVolume} value={droneVolume} />
            </div>
            <div className="text-lg font-semibold text-text-primary">
                {t('settings.AnswerVolume')}
                <HorizontalSlider min={0} max={1} step={0.01} setState={setAnswerVolume} value={answerVolume} />
            </div>
            <div className="text-lg font-semibold text-text-primary">
                {t('settings.PianoVolume')}
                <HorizontalSlider min={0} max={1} step={0.01} setState={setPianoVolume} value={pianoVolume} />
            </div>
        </div>
    );
}

export default VolumeSettings;
