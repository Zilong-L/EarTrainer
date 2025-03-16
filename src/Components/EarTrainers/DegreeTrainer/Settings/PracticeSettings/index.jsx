import React from 'react';
import { useTranslation } from 'react-i18next';
import { Midi, Note } from "tonal";
import { getDroneInstance } from '@utils/ToneInstance';
import { useDegreeTrainerSettings } from '@components/EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';
import ValueAdjuster from '@components/SharedComponents/ValueAdjuster';

function PracticeSettings() {
  const { t } = useTranslation('degreeTrainer');
  const {
    practice: {
      bpm,
      setBpm,
      rootNote,
      setRootNote,
      autoAdvance,
      setAutoAdvance,
      range,
      setRange,
      useSolfege,
      setUseSolfege,
      autoChangeRoot,
      setAutoChangeRoot,
      changeInterval,
      setChangeInterval,
    }
  } = useDegreeTrainerSettings();

  const drone = getDroneInstance();
  const midiMin = drone.rootMin;
  const midiMax = drone.rootMax;

  return (
    <div className="p-6 space-y-8">
      {/* Toggle Switches */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <span className="text-text-primary">
            {t('settings.autoAdvance')}
          </span>
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoAdvance ? 'bg-notification-bg' : 'bg-bg-accent'
          }`} onClick={() => setAutoAdvance(!autoAdvance)}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-common transition-transform ${
              autoAdvance ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-primary">
            {t('settings.useSolfege')}
          </span>
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            useSolfege ? 'bg-notification-bg' : 'bg-bg-accent'
          }`} onClick={() => setUseSolfege(!useSolfege)}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-common transition-transform ${
              useSolfege ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-primary">
            {t('settings.autoChangeRoot')}
          </span>
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoChangeRoot ? 'bg-notification-bg' : 'bg-bg-accent'
          }`} onClick={() => setAutoChangeRoot(!autoChangeRoot)}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-common transition-transform ${
              autoChangeRoot ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </div>
        </div>
      </div>

      {/* BPM and Root Note */}
      <div className="grid grid-cols-2 gap-6">
        <ValueAdjuster
          title={t('settings.BPM')}
          value={bpm}
          setValue={setBpm}
          min={10}
          max={200}
          step={1}
          displayFunction={(value) => `${value} BPM`}
        />

        <ValueAdjuster
          title={t('settings.RootNote')}
          value={Midi.toMidi(rootNote)}
          setValue={(value) => setRootNote(Note.fromMidi(value))}
          min={midiMin}
          max={midiMax}
          step={1}
          displayFunction={(value) => Note.fromMidi(value)}
        />
      </div>

      {autoChangeRoot && (
        <ValueAdjuster
          title={t('settings.changeInterval')}
          value={changeInterval}
          setValue={setChangeInterval}
          min={120}
          max={600}
          step={60}
          displayFunction={(value) => `${Math.floor(value/60)} ${t('settings.minutes')}`}
        />
      )}

      {/* Note Range */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-text-primary">
            {t('settings.NoteRange')}
          </span>
          <span className="text-sm text-text-secondary">
            {Midi.midiToNoteName(range[0])} - {Midi.midiToNoteName(range[1])}
          </span>
        </div>

        <div className="range-container">
          <div className="slider" style={{ position: 'relative', height: '4px', width: '100%' }}>
            <div className="slider__track bg-bg-accent" style={{ position: 'absolute', width: '100%', height: '100%' }} />
            <div className="slider__range bg-notification-bg" style={{ 
              position: 'absolute',
              height: '100%',
              width: `${((range[1] - range[0]) / 60) * 100}%`, 
              left: `${((range[0] - Midi.toMidi('C1')) / 60) * 100}%` 
            }} />
            <input
              type="range"
              min={0}
              max={60}
              value={range[0] - Midi.toMidi('C1')}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                const newValue = value + Midi.toMidi('C1');
                const maxAllowed = range[1] - 11;
                setRange([Math.min(newValue, maxAllowed), range[1]]);
              }}
              className="thumb thumb--left"
              style={{ 
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                zIndex: (range[0] - Midi.toMidi('C1')) > 45 ? "5" : "3"
              }}
            />
            <input
              type="range"
              min={0}
              max={60}
              value={range[1] - Midi.toMidi('C1')}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                const newValue = value + Midi.toMidi('C1');
                const minAllowed = range[0] + 11;
                setRange([range[0], Math.max(newValue, minAllowed)]);
              }}
              className="thumb thumb--right "
              style={{ 
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PracticeSettings;
