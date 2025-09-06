import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useI18nStore from '@stores/i18nStore';
import { freeModePresets, getPresetById } from './presets';
import { ScaleDegree } from '@EarTrainers/DegreeTrainer/utils/presets';
import { DEFAULT_ENABLED_DEGREES } from '@EarTrainers/DegreeTrainer/Constants';
import useDegreeFreeTrainerStore from './stores/degreeFreeTrainerStore';
import CustomListbox from '@components/Listbox';

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
  const { customPresets, setCustomPresets } = useDegreeFreeTrainerStore();
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState('');

  const options = useMemo(() => {
    return [
      ...Object.keys(freeModePresets),
      ...Object.keys(customPresets),
      'custom',
    ];
  }, [customPresets]);

  const handleModeSelect = (modeId: string) => {
    if (modeId === 'custom') {
      // Create a new custom preset with a unique name
      let base = t('settings.custom') || 'Custom';
      if (typeof base !== 'string') base = 'Custom';
      let candidate = `${base}1`;
      let idx = 1;
      while (customPresets[candidate]) {
        idx += 1;
        candidate = `${base}${idx}`;
      }
      const initial = DEFAULT_ENABLED_DEGREES as ScaleDegree[];
      const updated = { ...customPresets, [candidate]: initial };
      setCustomPresets(updated);
      setSelectedMode(candidate);
      setEnabledDegrees(initial);
      return;
    }

    setSelectedMode(modeId);
    const preset = getPresetById(modeId);
    if (preset) {
      setEnabledDegrees(preset.enabledDegrees as ScaleDegree[]);
    } else if (customPresets[modeId]) {
      setEnabledDegrees(customPresets[modeId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {editingPreset === selectedMode ? (
          <div className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-text-primary">
              {t('settings.SelectMode')}
            </label>
            <input
              type="text"
              value={newPresetName}
              onChange={e => setNewPresetName(e.target.value)}
              className="w-full px-2 py-1 border border-bg-accent rounded-md bg-bg-main text-text-primary focus:ring-2 focus:ring-accent focus:border-accent"
            />
            <button
              onClick={() => {
                if (
                  newPresetName &&
                  editingPreset &&
                  newPresetName !== editingPreset
                ) {
                  const updated = { ...customPresets } as Record<
                    string,
                    ScaleDegree[]
                  >;
                  updated[newPresetName] = updated[editingPreset];
                  delete updated[editingPreset];
                  setCustomPresets(updated);
                  setSelectedMode(newPresetName);
                }
                setEditingPreset(null);
              }}
              className="px-2 py-1 rounded-md bg-bg-accent text-text-primary"
            >
              Save
            </button>
          </div>
        ) : (
          <CustomListbox
            value={selectedMode}
            onChange={handleModeSelect}
            options={options}
            label={t('settings.SelectMode')}
            getLabel={(opt: string) => {
              if (opt === 'custom') return t('settings.custom');
              if (freeModePresets[opt as keyof typeof freeModePresets]) {
                return freeModePresets[opt as keyof typeof freeModePresets].name;
              }
              return opt; // custom preset name
            }}
          />
        )}
        <div className="flex items-center space-x-2 right-0 top-8">
          <button
            onClick={() => {
              setEditingPreset(selectedMode);
              setNewPresetName(selectedMode);
            }}
            disabled={!Object.keys(customPresets).includes(selectedMode)}
            className="px-2 py-1 rounded-md bg-bg-accent text-text-primary disabled:opacity-50"
            title="Rename"
          >
            ✏️
          </button>
          <button
            onClick={() => {
              const updated = { ...customPresets } as Record<
                string,
                ScaleDegree[]
              >;
              delete updated[selectedMode];
              setCustomPresets(updated);
              const fallback = Object.keys(updated)[0] || '';
              setSelectedMode(fallback);
              if (fallback) {
                if (updated[fallback]) setEnabledDegrees(updated[fallback]);
              }
            }}
            disabled={!Object.keys(customPresets).includes(selectedMode)}
            className="px-2 py-1 rounded-md bg-bg-accent text-text-primary disabled:opacity-50"
            title="Delete"
          >
            🗑️
          </button>
          <button
            onClick={() => {
              let name = `Copy of ${selectedMode}`;
              let i = 1;
              while (customPresets[name]) {
                i += 1;
                name = `Copy of ${selectedMode} (${i})`;
              }
              const updated = {
                ...customPresets,
                [name]: customNotes
                  .filter(n => n.enable)
                  .map(n => n.degree) as ScaleDegree[],
              } as Record<string, ScaleDegree[]>;
              setCustomPresets(updated);
              setSelectedMode(name);
            }}
            disabled={Object.keys(freeModePresets).includes(selectedMode)}
            className="px-2 py-1 rounded-md bg-bg-accent text-text-primary disabled:opacity-50"
            title="Copy"
          >
            📋
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-primary">
          {t('settings.SelectDegrees')}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {customNotes.map(note => (
            <div
              key={note.symbol}
              onClick={() => {
                if (Object.keys(freeModePresets).includes(selectedMode)) return;
                handleDegreeToggle(note.degree);
              }}
              className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-bg-main rounded"
            >
              <input
                type="checkbox"
                checked={note.enable}
                onChange={() => {}}
                disabled={Object.keys(freeModePresets).includes(selectedMode)}
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
