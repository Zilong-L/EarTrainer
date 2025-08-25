import React, { useState, useEffect } from 'react';
import FreeMode from '@EarTrainers/DegreeTrainer/Games/Free';
import ChallengeMode from '@EarTrainers/DegreeTrainer/Games/Challenge';
import { Link } from 'react-router-dom';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import Header from '@components/Header';
import HeaderTitle from '@components/HeaderTitle';
import HeaderButtons from '@components/HeaderButtons';
import HeaderButton from '@components/HeaderButton';
import { RadioIcon, BookOpenIcon } from '@heroicons/react/24/solid'


import SettingsPanel from '@components/Settings/SettingsPanel';
import LanguageSwitcher from '@components/LanguageSwitcher';
import { useDegreeTrainerSettings } from '@EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { keyMap, degrees } from '@EarTrainers/DegreeTrainer/Constants';
import { Note } from 'tonal';
import { Frequency } from 'tone';
import useI18nStore from "@stores/i18nStore";
let midi: MIDIAccess | null = null;
import useFreeTrainer from '@EarTrainers/DegreeTrainer/Games/Free/useFreeTrainer';
import useChallengeTrainer from '@EarTrainers/DegreeTrainer/Games/Challenge/useChallengeTrainer';

import PracticeSettings from './Settings/PracticeSettings';
import VolumeSettings from './Settings/VolumeSettings';
import Statistics from './Settings/Statistics';
import SoundSettings from '@components/Settings/SoundSettings';
import GameSettings from './Settings/GameSettings';


const EarTrainer: React.FC = () => {
  const globalSettings = useDegreeTrainerSettings();
  const setNamespace = useI18nStore(state => state.setNamespace);
  const { namespace } = useI18nStore();
  const FreeTrainerSettings = useFreeTrainer();
  const ChallengeTrainerSettings = useChallengeTrainer();
  const { t, i18n } = useTranslation(namespace);

  const {
    isHandfree,
    setIsHandfree,
    mode,

  } = globalSettings;


  const currentGameSettings = mode === 'free' ? FreeTrainerSettings : ChallengeTrainerSettings;
  const {
    playNote,
    rootNote,
    setActiveNote,
    filteredNotes,
    setGameState,
    currentNote,
    gameState
  } = currentGameSettings;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = () => {
    setIsSettingsOpen(true);
    setGameState((prev) => prev === 'playing' ? 'paused' : prev);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setGameState((prev) => prev === 'paused' ? 'playing' : prev);
  };

  useEffect(() => {
    setNamespace('degreeTrainer')
  }, [setNamespace])
  // Start game based on mode when component mounts

  const components = [
    { id: 'game', label: 'settings.GameSettings', component: GameSettings, props: { currentGameSettings: currentGameSettings } },
    { id: 'practice', label: 'settings.PracticeSettings', component: PracticeSettings },
    { id: 'statistics', label: 'settings.Statistics', component: Statistics },
    { id: 'volume', label: 'settings.VolumeSettings', component: VolumeSettings },
    { id: 'sound', label: 'settings.SoundSettings', component: SoundSettings }
  ];
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === 'r') {
        playNote(currentNote);
        return;
      }

      let degreeIndex: number | undefined;
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
          (div1 as HTMLElement).click();
        }
        if (div2) {
          (div2 as HTMLElement).click();
        }
        if (button1) {
          (button1 as HTMLElement).click();
        }
        if (button2) {
          (button2 as HTMLElement).click();
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
    const midiMessageHandler = (message: MIDIMessageEvent) => {
      const [command, note, velocity] = message.data ? Array.from(message.data) : [0, 0, 0];
      if (command === 144 && velocity > 0) {
        const noteName = Frequency(note, 'midi').toNote(); // 获取当前音符名称
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
        <HeaderButtons title="pocket mode!">
          {gameState != 'end' && <HeaderButton
            onClick={() => setIsHandfree(!isHandfree)}
            title={isHandfree ? t('buttons.handfreeOff') : t('buttons.handfreeOn')}
            className={isHandfree ? 'bg-bg-common' : 'bg-text-main text-text-main'}
          >
            <span ><RadioIcon className='h-6 w-6' /></span>
          </HeaderButton>}
          <LanguageSwitcher />

          <HeaderButton onClick={() => openSettings()}>
            <Cog6ToothIcon className="h-6 w-6" />
          </HeaderButton>
          <HeaderButton>
            <a
              href={`https://docs.musictrainer.barnman.cc/#/${i18n.language}/${i18n.language === 'zh' ? '音级训练/主要功能' : 'scale-degree-training/main-features'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit no-underline block "
            >
              <BookOpenIcon className='h-6 w-6' />
            </a>
          </HeaderButton>
        </HeaderButtons>
      </Header>
      <div className="h-[calc(100svh-64px)] bg-bg-main">
        <div className="max-w-2xl mx-auto h-full flex flex-col justify-between py-4 px-6">
          <div className="pr-4"> {/* Add right padding for scrollbar placeholder */}
            <SettingsPanel
              isOpen={isSettingsOpen}
              onClose={closeSettings}
              components={components}
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
