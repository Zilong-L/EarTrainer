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
import useChordColorTrainerSettings from '@components/EarTrainers/ChordColorTrainer/useChordColorTrainerSettings';
import { apps, keyMap, degrees } from '@components/EarTrainers/ChordColorTrainer/Constants';
import CardStack from '@components/EarTrainers/ChordColorTrainer/CardStack';
import { DesktopReplayButtons, PhoneReplayButtons } from '@components/EarTrainers/ChordColorTrainer/ReplayButtons';

import { useTranslation } from 'react-i18next';

let midi = null;
const EarTrainer = () => {
  const { t } = useTranslation('chordTrainer');

  const settings = useChordColorTrainerSettings();

  const {
    currentNote,
    disabledChords,
    gameStarted,
    filteredChords,
    setActiveChord,
    startGame,
    endGame,
    playChord,
    playBrokenChord,
  } = useChordColorTrainer(settings);

  const {
    rootNote,
    practiceRecords,
    muteDrone,
    setMuteDrone,
    isStatOpen
  } = settings;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(true);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  const handleStartGame = () => {
    setIsIntroOpen(false);
    startGame();
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
    return () => {
      endGame();
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
      if (key === 'r') {
        playChord();
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

  useEffect(() => {
    const midiMessageHandler = (message) => {
      const [command, note, velocity] = message.data;
      if (command === 144 && velocity > 0) {
        const noteName = Tone.Frequency(note, 'midi').toNote();
        setActiveChord(noteName);
      }
    };
    (async () => {
      if (navigator.requestMIDIAccess == null) {
        return;
      }
      if (midi == null) {
        midi = await navigator.requestMIDIAccess();
        console.log('MIDI loaded for chord trainer');
      }
      if (midi) {
        console.log('MIDI is already loaded, now register listener');
        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          input.value.onmidimessage = midiMessageHandler;
        }
      }
    })();
    return () => {
      console.log('MIDI is not deleted, but delete listener');
      if (midi) {
        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          input.value.onmidimessage = null;
        }
      }
    };
  }, []);

  const handlePlayChord = async () => {
    setIsPlayingSound(true);
    await playChord();
    setIsPlayingSound(false);
  };

  const handlePlayBrokenChord = async () => {
    setIsPlayingSound(true);
    await playBrokenChord();
    setIsPlayingSound(false);
  };

  const renderRecords = () => {
    const totalResults = Object.values(practiceRecords).reduce(
      (acc, record) => {
        acc.total += record.total;
        acc.correct += record.correct;
        return acc;
      },
      { total: 0, correct: 0 }
    );

    return (
      <div className="text-text-main">
        <div>{t('labels.totalAttempts')}: {totalResults.total}</div>
        <div>{t('labels.correctCount')}: {totalResults.correct}</div>
        <div>
          {t('labels.accuracyRate')}:{' '}
          {totalResults.total > 0
            ? Math.round((totalResults.correct / totalResults.total).toFixed(2) * 100) + '%'
            : '0%'}
        </div>
      </div>
    );
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
          <HeaderButton
            onClick={() => setMuteDrone(!muteDrone)}
            title={muteDrone ? t('buttons.unmuteDrone') : t('buttons.muteDrone')}
            className={muteDrone ? 'bg-bg-common' : 'bg-text-main text-text-main'}
          >
            <span className="">{muteDrone ? 'sensors_off' : 'sensors'}</span>
          </HeaderButton>
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

      <div className="h-[calc(100svh-64px)] bg-bg-main">
        <div className="max-w-2xl mx-auto h-full flex flex-col justify-between py-4 px-6">
          <div className="pr-4">
            <ChordColorTrainerSettings
              isSettingsOpen={isSettingsOpen}
              setIsSettingsOpen={closeSettings}
              playChord={playChord}
              settings={settings}
            />
          </div>


          {/* {gameStarted && isStatOpen && renderRecords()} */}
          <div className="flex flex-col justify-end mb-8">
            <div className="flex-grow" />

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
              onReplay={handlePlayChord}
              onBrokenChord={handlePlayBrokenChord}
              isPlayingSound={isPlayingSound}
              gameStarted={gameStarted}
            />
            <PhoneReplayButtons
              handleStartGame={handleStartGame}
              onReplay={handlePlayChord}
              onBrokenChord={handlePlayBrokenChord}
              isPlayingSound={isPlayingSound}
              gameStarted={gameStarted}
            />
          </div>

        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default EarTrainer;
