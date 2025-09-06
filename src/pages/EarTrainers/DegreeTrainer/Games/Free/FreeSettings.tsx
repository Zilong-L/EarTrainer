import { useTranslation } from 'react-i18next';
import useI18nStore from '@stores/i18nStore';
import { freeModePresets, getPresetById } from './presets';
import { ScaleDegree } from '@EarTrainers/DegreeTrainer/utils/presets';

type DegreeNote = {
  degree: ScaleDegree;
  symbol: string;
  distance: number;
  enable: boolean;
};
type FreeTrainerSettingsShape = {
  customNotes: DegreeNote[];
  handleDegreeToggle: (degree: ScaleDegree) => void;
  setEnabledDegrees: (enabled: ScaleDegree[]) => void;
  selectedMode: string;
  setSelectedMode: (v: string) => void;
};

function FreeSettings({
  FreeTrainerSettings,
}: {
  FreeTrainerSettings: FreeTrainerSettingsShape;
}) {
  const {
    customNotes,
    handleDegreeToggle,
    setEnabledDegrees,
    selectedMode,
    setSelectedMode,
  } = FreeTrainerSettings;
  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    const preset = getPresetById(modeId);
    if (preset) {
      setEnabledDegrees(preset.enabledDegrees as ScaleDegree[]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-primary">
          {t('settings.SelectMode')}
        </label>
        <select
          value={selectedMode}
          onChange={e => handleModeSelect(e.target.value)}
          className="w-full px-4 py-2 border border-bg-accent rounded-lg bg-bg-main text-text-primary focus:ring-2 focus:ring-accent focus:border-accent"
        >
          <option value="">{t('settings.selectMode')}</option>
          {Object.entries(freeModePresets).map(([key, mode]) => (
            <option key={key} value={key}>
              {mode.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-primary">
          {t('settings.SelectDegrees')}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {customNotes.map((note) => (
            <div
              key={note.symbol}
              onClick={() => handleDegreeToggle(note.degree)}
              className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-bg-main rounded"
            >
              <input
                type="checkbox"
                checked={note.enable}
                onChange={() => {}}
                className="rounded"
              />
              <span className="text-text-secondary">{note.symbol}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FreeSettings;
