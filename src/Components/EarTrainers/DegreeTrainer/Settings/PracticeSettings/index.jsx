import React, { useRef, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { Midi } from "tonal";
import { getDroneInstance } from '@utils/ToneInstance';

function PracticeSettings({ settings }) {

  const { t } = useTranslation('degreeTrainer');
  const {
    practice: {
      bpm,
      setBpm,
      rootNote,
      setRootNote,
      range,
      setRange,
      repeatWhenAdvance,
      setRepeatWhenAdvance
    }
  } = settings;

  const drone = getDroneInstance();
  let midiMin = drone.rootMin;
  let midiMax = drone.rootMax;

  return (
    <div className="p-6 space-y-12">
      {/* Toggle Repeat Setting */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setRepeatWhenAdvance(!repeatWhenAdvance)}
      >
        <span className="text-slate-700 dark:text-slate-300">
          {t('settings.repeatWhenAdvance')}
        </span>
        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          repeatWhenAdvance ? 'bg-cyan-600' : 'bg-slate-200 dark:bg-slate-700'
        }`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            repeatWhenAdvance ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </div>
      </div>

        {/* Note Range Dual Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('settings.NoteRange')}
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {Midi.midiToNoteName(range[0])} - {Midi.midiToNoteName(range[1])}
            </div>
          </div>
          <div className="range-container">
            <div className="slider">
              <div className="slider__track dark:bg-slate-700" />
              <div className="slider__range slider__range--left" style={{ width: `${((range[0] - Midi.toMidi('C1')) / 60) * 100}%` }} />
              <div className="slider__range slider__range--right" style={{ width: `${((range[1] - range[0]) / 60) * 100}%`, left: `${((range[0] - Midi.toMidi('C1')) / 60) * 100}%` }} />
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
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('settings.RootNote')}
            </label>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {rootNote}
            </span>
          </div>
          <div className="slider">
            <div className="slider__track dark:bg-slate-700" />
            <div className="slider__range" style={{ width: `${((Midi.toMidi(rootNote) - midiMin) / (midiMax - midiMin)) * 100}%` }} />
            <input
              type="range"
              min={midiMin}
              max={midiMax}
              value={Midi.toMidi(rootNote)}
              onChange={(e) => setRootNote(Midi.midiToNoteName(parseInt(e.target.value)))}
              className="thumb"
            />
          </div>
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('settings.BPM')}
            </label>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {bpm} BPM
            </span>
          </div>
          <div className="slider">
            <div className="slider__track dark:bg-slate-700" />
            <div className="slider__range" style={{ width: `${((bpm - 10) / (200 - 10)) * 100}%` }} />
            <input
              type="range"
              min={10}
              max={200}
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="thumb"
            />
          </div>
        </div>





      </div>

  );

}

export default PracticeSettings;
