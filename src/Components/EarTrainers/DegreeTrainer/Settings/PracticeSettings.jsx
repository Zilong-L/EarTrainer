import React, { useRef, useCallback, useEffect } from 'react';

import './styles.css';
import { useTranslation } from 'react-i18next';
import { Midi } from "tonal";
import { LockClosedIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { getDroneInstance } from '@utils/ToneInstance';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function PracticeSettings({ settings, setCurrentPage ,setGameState}) {
  const rangeRef = useRef(null);
  
  const getPercent = useCallback(
    (value) => Math.round(((value - 0) / (60 - 0)) * 100),
    []
  );

 
  const { t } = useTranslation('degreeTrainer');
  const {
    mode,
    setMode,
    bpm,
    setBpm,
    rootNote,
    setRootNote,
    range,
    setRange,
    customNotes,
    setCustomNotes,
    setCurrentLevel,
    userProgress,
    repeatWhenAdvance,
    setRepeatWhenAdvance,
    setCurrentPracticeRecords,
    currentLevel,
    resetUserProgress
  } = settings;


  const drone = getDroneInstance();
  let midiMin = drone.rootMin;
  let midiMax = drone.rootMax;

  const handleDegreeToggle = (index) => {
    const newNotes = [...customNotes];
    newNotes[index].enable = !newNotes[index].enable;
    setCustomNotes(newNotes);
  };


  const updateLevel = (index) => {
    setCurrentLevel(userProgress[index]);
    setGameState('end');
  };

  const closeSettings = () => {
    setCurrentPage('home'); // Return to home page
  };

  return (
    <>


      <div className="p-6 space-y-12">
        {/* Mode Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode('free');
              setCurrentPracticeRecords({ total: 0, correct: 0 });
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              mode === 'free'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {t('intro.freeMode')}
          </button>
          <button
            onClick={() => {
              setMode('challenge');
              setCurrentPracticeRecords({ total: 0, correct: 0 });
              setCurrentLevel(userProgress[0]);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              mode === 'challenge'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {t('intro.challengeMode')}
          </button>
        </div>

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

        {/* Degree Selection (Free Mode Only) */}
        {mode === 'free' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('settings.SelectDegrees')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {customNotes.map((note, index) => (
                <div
                  key={note.name}
                  onClick={() => handleDegreeToggle(index)}
                  className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  <input
                    type="checkbox"
                    checked={note.enable}
                    onChange={() => {}}
                    className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300">{note.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Challenge Mode Level Selection */}
        {mode === 'challenge' && (
          <div className="space-y-2">
            {userProgress.map((levelData, index) => (
              <button
                key={levelData.level}
                onClick={() => updateLevel(index)}
                disabled={!levelData.unlocked}
                className={`w-full flex justify-between items-center p-3 rounded-lg ${
                  levelData.unlocked
                    ? levelData.level === currentLevel?.level
                      ? 'bg-cyan-800 text-white' // Selected level
                      : 'bg-cyan-700 text-white hover:bg-cyan-800' // Unlocked but not selected
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed' // Locked
                }`}
              >
                <span className="font-medium">
                  Level {levelData.level}: {levelData.notes}
                </span>
                {levelData.unlocked ? (
                  <span>
                    {levelData.stars >= 1 ? '⭐' : ''}
                    {levelData.stars >= 2 ? '⭐' : ''}
                    {levelData.stars >= 3 ? '⭐' : ''}
                  </span>
                ) : (
                  <LockClosedIcon className="h-5 w-5" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Reset Progress Button */}
        {mode === 'challenge' && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (window.confirm(t('settings.resetConfirmation'))) {
                  resetUserProgress()
                  setCurrentPracticeRecords({ total: 0, correct: 0 });
                  toast.success(t('settings.resetSuccess'));
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('settings.resetProgress')}
            </button>
          </div>
        )}
      </div>
    </>
  );

}

export default PracticeSettings;
