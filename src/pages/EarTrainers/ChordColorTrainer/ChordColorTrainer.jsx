import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Tone from 'tone';
import { Cog6ToothIcon, BookOpenIcon } from '@heroicons/react/24/solid';
import { useSoundSettingsStore } from '@stores/soundSettingsStore';
import Header from '@components/Header';
import HeaderTitle from '@components/HeaderTitle';
import HeaderButtons from '@components/HeaderButtons';
import HeaderButton from '@components/HeaderButton';
import { Toaster } from 'react-hot-toast';

import ChordColorTrainerSettings from '@EarTrainers/ChordColorTrainer/Settings';
import useChordColorTrainer from '@EarTrainers/ChordColorTrainer/useChordColorTrainer';
import useChordColorTrainerSettingsStore from '@stores/chordColorTrainerSettingsStore';
import { apps, keyMap, degrees } from '@EarTrainers/ChordColorTrainer/Constants';
import CardStack from '@EarTrainers/ChordColorTrainer/CardStack';
import { DesktopReplayButtons, PhoneReplayButtons } from '@EarTrainers/ChordColorTrainer/ReplayButtons';
import LanguageSwitcher from '@components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import useI18nStore from "@stores/i18nStore";
import MIDIInputHandler from './MIDIInputHandler';
import PianoVisualizer from '@components/PianoVisualizer';
import DraggableWindow from '@components/DraggableWindow';

const EarTrainer = () => {
  const { t, i18n } = useTranslation('chordColorTrainer');
  const setNamespace = useI18nStore((state) => state.setNamespace);
  const {
    rootNote,
    chordPlayOption
  } = useChordColorTrainerSettingsStore();
  const {
    currentChord,
    disabledChords,
    gameStarted,
    filteredChords,
    setActiveChord,
    startGame,
    endGame,
    playChordColorPattern,
    playChord,
    playTonic,
    isAdvance,
    setIsAdvance,
    activeNotes,
    setActiveNotes,
  } = useChordColorTrainer(chordPlayOption);


  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);


  const isLoadingInstrument = useSoundSettingsStore(state => state.isLoadingInstrument);

  const handleStartGame = () => {
    if (isLoadingInstrument) return;
    startGame();
  };

  const handlePlayTonic = () => {
    if (isLoadingInstrument) return;
    playTonic();
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    document.body.classList.remove('modal-open');
  };

  useEffect(() => {
    setNamespace('chordColorTrainer');
    return () => {
      endGame();
    };
  }, []);

  // useEffect(() => {
  //   const handleKeyPress = (event) => {
  //     const key = event.key;
  //     if (key === 'r') {
  //       playChordColorPattern();
  //       return;
  //     }

  //     let degreeIndex;
  //     if (keyMap[key] !== undefined) {
  //       degreeIndex = keyMap[key];
  //     }
  //     if (degreeIndex !== undefined) {
  //       const selectedDegree = degrees[degreeIndex];
  //       const noteName = Tone.Frequency(rootNote + selectedDegree.distance, 'midi').toNote().slice(0, -1);
  //       const button = document.querySelector(`button[data-note="${noteName}"]`);
  //       if (button) {
  //         button.click();
  //       }
  //     }
  //   };
  //   window.addEventListener('keydown', handleKeyPress);
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyPress);
  //   };
  // }, [rootNote, currentChord]);

  const handlePlayChordColorPattern = async () => {
    if (isLoadingInstrument) return;
    await playChordColorPattern();
  }
  const handlePlayChord = async () => {
    if (isLoadingInstrument) return;
    await playChord();
  };

  return (
    <div className="relative">
      <Header>
        <HeaderTitle>
          <Link to="/ear-trainer" className="text-inherit no-underline">
            {t('app.title')}
          </Link>
        </HeaderTitle>
        <HeaderButtons>
          <LanguageSwitcher />
          <HeaderButton onClick={openSettings}>
            <Cog6ToothIcon className="h-6 w-6" />
          </HeaderButton>
          <HeaderButton
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden"
          >
            <span className="">menu</span>
          </HeaderButton>
          <HeaderButton>
            <a
              href={`https://docs.musictrainer.barnman.cc/#/${i18n.language}/chord-color-trainer/main-features`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit no-underline block"
              title={t('buttons.help')}
            >
              <BookOpenIcon className="h-6 w-6" />
            </a>
          </HeaderButton>
        </HeaderButtons>
      </Header>

      <div className="h-[calc(100svh-64px)] bg-bg-main ">
        <div className="max-w-2xl mx-auto h-full flex flex-col justify-between py-4 px-6 relative">
          <div className="mb-4">
            <label htmlFor="chordPlayOption" className="block text-sm font-medium text-gray-700">Chord Play Option:</label>
            <select
              id="chordPlayOption"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={chordPlayOption}
              onChange={(e) => useChordColorTrainerSettingsStore.getState().setChordPlayOption(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="block">Block</option>
              <option value="descending">Descending</option>
              <option value="ascending">Ascending</option>
              <option value="random">Random</option>
            </select>
          </div>
          <MIDIInputHandler
            activeNotes={activeNotes}
            setActiveNotes={setActiveNotes}
          />
          <div className="pr-4">
            <ChordColorTrainerSettings
              isSettingsOpen={isSettingsOpen}
              setIsSettingsOpen={closeSettings}
              playChord={playChordColorPattern}
            />
          </div>

          {/* Add the new button as a fixed element on the right */}


          {/* {gameStarted && isStatOpen && renderRecords()} */}
          <div className="flex flex-col justify-end">
            <div className="flex-grow" />
            <CardStack
              currentChord={currentChord}
              disabledChords={disabledChords}
              filteredChords={filteredChords}
              setActiveChord={setActiveChord}
              rootNote={rootNote}
              isAdvance={isAdvance}
              gameStarted={gameStarted}
            />
            <DesktopReplayButtons
              handleStartGame={handleStartGame}
              onReplay={handlePlayChordColorPattern}
              onPlayChordSimple={handlePlayChord}
              onPlayTonic={handlePlayTonic}
              gameStarted={gameStarted}
              isAdvance={isAdvance}
              setIsAdvance={setIsAdvance}
              isLoadingInstrument={isLoadingInstrument}
            />
            <PhoneReplayButtons
              handleStartGame={handleStartGame}
              onReplay={handlePlayChordColorPattern}
              onPlayChordSimple={handlePlayChord}
              onPlayTonic={handlePlayTonic}
              gameStarted={gameStarted}
              isAdvance={isAdvance}
              setIsAdvance={setIsAdvance}
              isLoadingInstrument={isLoadingInstrument}
            />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default EarTrainer;
