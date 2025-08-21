import { useTranslation } from 'react-i18next';
import HorizontalSlider from '@components/slider/HorizontalSlider';
import { useSoundSettingsStore } from '@stores/soundSettingsStore';

const instrumentsList = [
    'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute',
    'french-horn', 'guitar-acoustic', 'guitar-electric', 'guitar-nylon',
    'harmonium', 'harp', 'organ', 'piano', 'saxophone', 'trombone',
    'trumpet', 'tuba', 'violin', 'xylophone', 'triangle', 'square', 'sawtooth', 'pad'
] as const;

type Quality = 'low' | 'medium' | 'high' | 'full' | string;

type Instrument = typeof instrumentsList[number];

function SoundSettings() {
    const { t } = useTranslation('degreeTrainer');
    const {
        selectedInstrument,
        isLoadingInstrument,
        selectedQuality,
        dronePan,
        setDronePan,
        droneFilter,
        setDroneFilter,
        changeInstrument,
    } = useSoundSettingsStore();

    const clamps = {
        dronePan: { min: -1, max: 1 },
        droneFilter: { min: 20, max: 2000 },
    } as const;

    const handleQualityChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
        const nextQuality = event.target.value as Quality;
        changeInstrument(selectedInstrument as Instrument, nextQuality);
    };

    return (
        <div className="p-6 space-y-12 max-w-[800px] mx-auto">
            <div className="space-y-3">
                <label className="block text-sm font-medium text-text-primary mb-2">
                    {t('settings.qualityLabel')}
                </label>
                <select
                    value={selectedQuality}
                    onChange={handleQualityChange}
                    disabled={isLoadingInstrument}
                    className="w-full px-4 py-2 border border-bg-accent rounded-lg bg-bg-main text-text-primary focus:ring-2 focus:ring-accent focus:border-accent disabled:opacity-50"
                >
                    <option value="low">{t('settings.quality.low')}</option>
                    <option value="medium">{t('settings.quality.medium')}</option>
                    <option value="high">{t('settings.quality.high')}</option>
                    <option value="full">{t('settings.quality.full')}</option>
                </select>
            </div>

            <div className="flex flex-col">
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        {t('settings.dronePan')}
                    </label>
                    <div className="grid items-center gap-4">
                        <HorizontalSlider
                            min={clamps.dronePan.min}
                            max={clamps.dronePan.max}
                            step={0.01}
                            setState={setDronePan}
                            value={dronePan}
                            mapFunction={(value: number) => value.toFixed(2)}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        {t('settings.droneFilter')}
                    </label>
                    <div className="flex items-center gap-4">
                        <HorizontalSlider
                            min={clamps.droneFilter.min}
                            max={clamps.droneFilter.max}
                            step={1}
                            setState={setDroneFilter}
                            value={droneFilter}
                            mapFunction={(value: number) => Math.round(value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {instrumentsList.map((instrument) => (
                    <button
                        key={instrument}
                        onClick={() => changeInstrument(instrument, selectedQuality as Quality)}
                        disabled={isLoadingInstrument}
                        className={`px-4 py-2 rounded-lg transition-all capitalize ${selectedInstrument === instrument
                                ? 'bg-notification-bg text-notification-text'
                                : 'bg-bg-main text-text-primary'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {t(`settings.instruments.${instrument}`)}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SoundSettings;
