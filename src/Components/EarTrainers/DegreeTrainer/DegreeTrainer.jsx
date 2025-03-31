import React, { useState, useEffect } from 'react';
import FreeMode from '@components/EarTrainers/DegreeTrainer/Games/Free';
import ChallengeMode from '@components/EarTrainers/DegreeTrainer/Games/Challenge';
import { Link } from 'react-router-dom';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import Header from '@components/SharedComponents/Header';
import HeaderTitle from '@components/SharedComponents/HeaderTitle';
import HeaderButtons from '@components/SharedComponents/HeaderButtons';
import HeaderButton from '@components/SharedComponents/HeaderButton';
import { FireIcon } from '@heroicons/react/24/outline'

import DegreeTrainerSettings from '@components/EarTrainers/DegreeTrainer/Settings';
import useFreeTrainer from '@components/EarTrainers/DegreeTrainer/Games/Free/useFreeTrainer';
import useChallengeTrainer from '@components/EarTrainers/DegreeTrainer/Games/Challenge/useChallengeTrainer';
import LanguageSwitcher from '@components/SharedComponents/LanguageSwitcher';
import { useDegreeTrainerSettings } from '@components/EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { keyMap, degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import { Note } from 'tonal';
import * as Tone from 'tone';
let midi = null;
const EarTrainer = () => {
  const globalSettings = useDegreeTrainerSettings();
  const { t, i18n } = useTranslation('degreeTrainer');

  const {
    isHandfree,
    setIsHandfree,
    mode,
  } = globalSettings;

  const FreeTrainerSettings = useFreeTrainer();
  const ChallengeTrainerSettings = useChallengeTrainer();

  const settings = { ...globalSettings, FreeTrainerSettings, ChallengeTrainerSettings };
  const currentGameSettings = mode === 'free' ? FreeTrainerSettings : ChallengeTrainerSettings;
  const {
    playNote,
    rootNote,
    setActiveNote,
    filteredNotes,
    setGameState,
    currentNote,
  } = currentGameSettings;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = () => {
    setIsSettingsOpen(true);
    setGameState((prev) => prev === 'playing' ? 'paused' : prev);
    document.body.classList.add('modal-open');
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setGameState((prev) => prev === 'paused' ? 'playing' : prev);
    document.body.classList.remove('modal-open');
  };

  // Start game based on mode when component mounts


  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
      if (key === 'r') {
        playNote(currentNote);
        return;
      }

      let degreeIndex;
      if (keyMap[key] !== undefined) {
        degreeIndex = keyMap[key];
      }
      if (degreeIndex !== undefined) {
        const noteName = Note.pitchClass(Note.transpose(rootNote, degrees[degreeIndex].interval)); // 获取对应的音符名称
        const enharmonicNote = Note.enharmonic(noteName); // 获取对应的音符名称


        // 模拟点击对应的按钮
        const div1 = document.querySelector(`div[data-note="${noteName}"]`);
        const div2 = document.querySelector(`div[data-note="${enharmonicNote}"]`);

        const button1 = document.querySelector(`button[data-note="${noteName}"]`);
        const button2 = document.querySelector(`button[data-note="${enharmonicNote}"]`);
        if (div1) {
          div1.click();
        }
        if (div2) {
          div2.click();
        }
        if (button1) {
          button1.click();
        }
        if (button2) {
          button2.click();
        }
      }
      console.log('key', key);
      // Hit the replay button if R or space is pressed

    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [filteredNotes, rootNote, currentNote]);

  useEffect(() => {
    const midiMessageHandler = (message) => {
      const [command, note, velocity] = message.data;
      if (command === 144 && velocity > 0) {
        const noteName = Tone.Frequency(note, 'midi').toNote(); // 获取当前音符名称
        setActiveNote(noteName)
      }
      console.log('message', message);

    };
    (async () => {
      if (navigator.requestMIDIAccess == null) {
        return;
      }
      if (midi == null) {
        midi = await navigator.requestMIDIAccess();

      }
      if (midi) {

        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          input.value.onmidimessage = midiMessageHandler
        }
      }
    })();
    return () => {

      if (midi) {
        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          input.value.onmidimessage = null
        }
      }
    }
  }, []);


  return (
    <div className='relative'>
      <Header>
        <HeaderTitle>
          <Link to="/ear-trainer" className="text-inherit no-underline">
            {t('home.title')}
          </Link>
        </HeaderTitle>
        <HeaderButtons>
          <LanguageSwitcher />
          <HeaderButton
            onClick={() => setIsHandfree(!isHandfree)}
            title={isHandfree ? t('buttons.handfreeOff') : t('buttons.handfreeOn')}
            className={isHandfree ? 'bg-bg-common' : 'bg-text-main text-text-main'}
          >
            <span ><FireIcon className='h-6 w-6' /></span>
          </HeaderButton>
          <HeaderButton onClick={() => openSettings()}>
            <Cog6ToothIcon className="h-6 w-6" />
          </HeaderButton>
          <HeaderButton>
            <a
              href={`https://docs.musictrainer.barnman.cc/#/${i18n.language}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit no-underline block "
            >
              {t('buttons.help')}
            </a>
          </HeaderButton>
        </HeaderButtons>
      </Header>
      <div className="h-[calc(100svh-64px)] bg-bg-main">
        <div className="max-w-2xl mx-auto h-full flex flex-col justify-between py-4 px-6">
          <div className="pr-4"> {/* Add right padding for scrollbar placeholder */}
            <DegreeTrainerSettings
              settings={settings}
              isSettingsOpen={isSettingsOpen}
              setIsSettingsOpen={closeSettings}
              playNote={playNote}
              currentGameSettings={currentGameSettings}
              setGameState={setGameState}
            />
          </div>
          {mode === 'free' ? (
            <FreeMode
              FreeTrainerSettings={FreeTrainerSettings}
            />
          ) : (
            <ChallengeMode
              ChallengeTrainerSettings={ChallengeTrainerSettings}
            />
          )}

        </div>
      </div>
      <Toaster />
    </div>
  );
};


export default EarTrainer;
