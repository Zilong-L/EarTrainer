import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Midi, Note } from "tonal";
import { getDroneInstance } from '@utils/ToneInstance';
import { useDegreeTrainerSettings } from '@components/EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';
import ValueAdjuster from '@components/SharedComponents/ValueAdjuster';
import RangeSlider from '@components/SharedComponents/slider/RangeSlider';

function PracticeSettings() {
  const { t } = useTranslation('degreeTrainer');
  const [isReady, setIsReady] = useState(false);
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

  useEffect(() => {
    // Ensure drone is initialized
    if (drone && midiMin !== undefined && midiMax !== undefined) {
      setIsReady(true);
    }
  }, [drone, midiMin, midiMax]);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Toggle Switches */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <span className="text-text-primary">
            {t('settings.autoAdvance')}
          </span>
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoAdvance ? 'bg-notification-bg' : 'bg-bg-accent'
            }`} onClick={() => setAutoAdvance(!autoAdvance)}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-common transition-transform ${autoAdvance ? 'translate-x-6' : 'translate-x-1'
              }`} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-primary">
            {t('settings.useSolfege')}
          </span>
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useSolfege ? 'bg-notification-bg' : 'bg-bg-accent'
            }`} onClick={() => setUseSolfege(!useSolfege)}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-common transition-transform ${useSolfege ? 'translate-x-6' : 'translate-x-1'
              }`} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-primary">
            {t('settings.autoChangeRoot')}
          </span>
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoChangeRoot ? 'bg-notification-bg' : 'bg-bg-accent'
            }`} onClick={() => setAutoChangeRoot(!autoChangeRoot)}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-common transition-transform ${autoChangeRoot ? 'translate-x-6' : 'translate-x-1'
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
          displayFunction={(value) => `${Math.floor(value / 60)} ${t('settings.minutes')}`}
        />
      )}

      {/* Note Range */}
      <RangeSlider
        value={range}
        onChange={setRange}
        min={midiMin}
        max={midiMax}
        step={12}
        label={t('settings.NoteRange')}
        displayFunction={(value) => Midi.midiToNoteName(value)}
      />
    </div>
  );
}

export default PracticeSettings;
