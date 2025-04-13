import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Tone from 'tone';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import Header from '@components/SharedComponents/Header';
import HeaderTitle from '@components/SharedComponents/HeaderTitle';
import HeaderButtons from '@components/SharedComponents/HeaderButtons';
import HeaderButton from '@components/SharedComponents/HeaderButton';
import { Toaster } from 'react-hot-toast';

import ChordColorTrainerSettings from '@components/EarTrainers/ChordColorTrainer/Settings';
import useChordColorTrainer from '@components/EarTrainers/ChordColorTrainer/useChordColorTrainer';
import useChordColorTrainerSettingsStore from '@stores/chordColorTrainerSettingsStore';
import { apps, keyMap, degrees } from '@components/EarTrainers/ChordColorTrainer/Constants';
import CardStack from '@components/EarTrainers/ChordColorTrainer/CardStack';
import { DesktopReplayButtons, PhoneReplayButtons } from '@components/EarTrainers/ChordColorTrainer/ReplayButtons';
import LanguageSwitcher from '@components/SharedComponents/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import useI18nStore from "@stores/i18nStore";
import MIDIInputHandler from './MIDIInputHandler';
import PianoVisualizer from '@components/SharedComponents/PianoVisualizer';
import DraggableWindow from '@components/DraggableWindow';

const EarTrainer = () => {
  const { t } = useTranslation('chordColorTrainer');
  const setNamespace = useI18nStore((state) => state.setNamespace);
  const {
    rootNote,
  } = useChordColorTrainerSettingsStore();
  const {
    currentNote,
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
  } = useChordColorTrainer();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleStartGame = () => {
    startGame();
  };

  const handlePlayTonic = () => {
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

  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
      if (key === 'r') {
        playChordColorPattern();
        return;
      }

      let degreeIndex;
      if (keyMap[key] !== undefined) {
        degreeIndex = keyMap[key];
      }
      if (degreeIndex !== undefined) {
        const selectedDegree = degrees[degreeIndex];
        const noteName = Tone.Frequency(rootNote + selectedDegree.distance, 'midi').toNote().slice(0, -1);
        const button = document.querySelector(`button[data-note="${noteName}"]`);
        if (button) {
          button.click();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [rootNote, currentNote]);



  const handlePlayChordColorPattern = async () => {
    await playChordColorPattern();
  }
  const handlePlayChord = async () => {
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
        </HeaderButtons>
      </Header>

      <div className="h-[calc(100svh-64px)] bg-bg-main ">
        <div className="max-w-2xl mx-auto h-full flex flex-col justify-between py-4 px-6 relative">
          <div className="pr-4">
            <ChordColorTrainerSettings
              isSettingsOpen={isSettingsOpen}
              setIsSettingsOpen={closeSettings}
              playChord={playChordColorPattern}
            />
          </div>


          {/* {gameStarted && isStatOpen && renderRecords()} */}
          <div className="flex flex-col justify-end  ">

            <div className="flex-grow" />
            <DraggableWindow>
              <MIDIInputHandler
                activeNotes={activeNotes}
                setActiveNotes={setActiveNotes}
                targetChord={currentNote}
              />
            </DraggableWindow>

            <CardStack
              currentNote={currentNote}
              disabledChords={disabledChords}
              filteredChords={filteredChords}
              setActiveChord={setActiveChord}
              rootNote={rootNote}
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
            />
            <PhoneReplayButtons
              handleStartGame={handleStartGame}
              onReplay={handlePlayChordColorPattern}
              onPlayChordSimple={handlePlayChord}
              onPlayTonic={handlePlayTonic}
              gameStarted={gameStarted}
              isAdvance={isAdvance}
              setIsAdvance={setIsAdvance}
            />
          </div>

        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default EarTrainer;
