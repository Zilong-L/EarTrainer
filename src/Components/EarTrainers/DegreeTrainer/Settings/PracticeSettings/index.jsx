import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Slider from '@components/SharedComponents/Slider';
import { Midi } from "tonal";
import { getDroneInstance } from '@utils/ToneInstance';
import { useDegreeTrainerSettings } from '@components/EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';

function PracticeSettings({ settings }) {

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
  let midiMin = drone.rootMin;
  let midiMax = drone.rootMax;

  return (
    <div className="p-6 space-y-12">
      {/* Toggle Settings */}
      <div className="space-y-4">
        {/* Auto Advance Setting */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setAutoAdvance(!autoAdvance)}
        >
          <span className="text-text-primary">
            {t('settings.autoAdvance')}
          </span>
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoAdvance ? 'bg-notification-bg' : 'bg-bg-accent'
          }`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-common transition-transform ${
              autoAdvance ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </div>
        </div>

        {/* Solfege/Degree Toggle */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setUseSolfege(!useSolfege)}
        >
          <span className="text-text-primary">
            {t('settings.useSolfege')}
          </span>
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            useSolfege ? 'bg-notification-bg' : 'bg-bg-accent'
          }`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-common transition-transform ${
              useSolfege ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </div>
        </div>
        </div>



        {/* Note Range Dual Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium text-text-primary">
              {t('settings.NoteRange')}
            </label>
            <div className="text-sm text-text-secondary">
              {Midi.midiToNoteName(range[0])} - {Midi.midiToNoteName(range[1])}
            </div>
          </div>
          <div className="range-container">
            <div className="slider">
              <div className="slider__track bg-bg-common" />
              <div className="slider__range bg-bg-accent" style={{ width: `${((range[0] - Midi.toMidi('C1')) / 60) * 100}%` }} />
              <div className="slider__range bg-notification-bg" style={{ width: `${((range[1] - range[0]) / 60) * 100}%`, left: `${((range[0] - Midi.toMidi('C1')) / 60) * 100}%` }} />
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
                style={{ zIndex: (range[0] - Midi.toMidi('C1')) > 45 ? "5" : "3" }}
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
                className="thumb thumb--right"
              />
            </div>
          </div>
        </div>

        {/* Root Note Slider */}
        <Slider
          label={t('settings.RootNote')}
          value={Midi.toMidi(rootNote)}
          onChange={(e) => setRootNote(Midi.midiToNoteName(parseInt(e.target.value)))}
          min={midiMin}
          max={midiMax}
          step={1}
          displayValue={rootNote}
        />

        <Slider
          label={t('settings.BPM')}
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value))}
          min={10}
          max={200}
          step={1}
          displayValue={`${bpm} BPM`}
        />

        {/* Auto Change Root Settings */}
        <div className="space-y-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setAutoChangeRoot(!autoChangeRoot)}
          >
            <span className="text-text-primary">
              {t('settings.autoChangeRoot')}
            </span>
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoChangeRoot ? 'bg-notification-bg' : 'bg-bg-accent'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-common transition-transform ${
                autoChangeRoot ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </div>

          {autoChangeRoot && (
            <Slider
              label={t('settings.changeInterval')}
              value={changeInterval}
              onChange={(e) => setChangeInterval(parseInt(e.target.value))}
              min={120} // 2 minutes
              max={600} // 10 minutes
              step={60} // 1 minute increments
              displayValue={`${Math.floor(changeInterval/60)} ${t('settings.minutes')}`}
            />
          )}
        </div>





      </div>

  );

}

export default PracticeSettings;
