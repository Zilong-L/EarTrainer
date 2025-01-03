import React, { useState, useEffect } from 'react';
import FreeMode from '@components/EarTrainers/DegreeTrainer/Games/Free';
import ChallengeMode from '@components/EarTrainers/DegreeTrainer/Games/Challenge';
import Button from '@components/SharedComponents/Button';
import { Link } from 'react-router-dom';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import Header from '@components/SharedComponents/Header';
import HeaderTitle from '@components/SharedComponents/HeaderTitle';
import HeaderButtons from '@components/SharedComponents/HeaderButtons';
import HeaderButton from '@components/SharedComponents/HeaderButton';
import Sidebar from '@components/Sidebar';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';


import DegreeTrainerSettings from '@components/EarTrainers/DegreeTrainer/Settings';
import useFreeTrainer from '@components/EarTrainers/DegreeTrainer/Games/Free/useFreeTrainer';
import useChallengeTrainer from '@components/EarTrainers/DegreeTrainer/Games/Challenge/useChallengeTrainer';
import useDegreeTrainerSettings from '@components/EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { keyMap,degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import {Note } from 'tonal';
import * as Tone from 'tone';


let midi = null;
const EarTrainer = () => {
  const globalSettings = useDegreeTrainerSettings();
  const { t,i18n  } = useTranslation('degreeTrainer');
  
  const {
      isHandfree,
    setIsHandfree,
    mode,
  } = globalSettings;

  const FreeTrainerSettings = useFreeTrainer(globalSettings);
  const ChallengeTrainerSettings = useChallengeTrainer(globalSettings);

  const settings = {...globalSettings, FreeTrainerSettings, ChallengeTrainerSettings};
  const currentGameSettings = mode === 'free' ? FreeTrainerSettings : ChallengeTrainerSettings;
  const {
    playNote, 
    rootNote ,
    setActiveNote,
    filteredNotes,  
    setGameState,
    currentNote,
  } = currentGameSettings;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = () => {
    setIsSettingsOpen(true);
    setGameState((pre)=>pre=='playing'?'paused':pre);
    document.body.classList.add('modal-open');
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
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
        const button1 = document.querySelector(`button[data-note="${noteName}"]`);
        const button2 = document.querySelector(`button[data-note="${enharmonicNote}"]`);
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
    <>
      <Header>
        <HeaderTitle>
          <Link to="/ear-trainer" className="text-inherit no-underline">
            {t('home.title')}
          </Link>
        </HeaderTitle>
        <HeaderButtons>
          <HeaderButton 
            onClick={() => setIsHandfree(!isHandfree)}
            title={isHandfree ? t('buttons.handfreeOff') : t('buttons.handfreeOn')}
            className={isHandfree ? 'bg-slate-400 text-white' : ''}
          >
            <span className="material-icons"><AllInclusiveIcon></AllInclusiveIcon></span>
          </HeaderButton>
          <HeaderButton onClick={() => openSettings()}>
            <Cog6ToothIcon className="h-6 w-6" />
          </HeaderButton>
          <HeaderButton>
            <a
              href={`https://barnman.cc/music/degree-trainer-help-${i18n.language}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit no-underline"
            >
              {t('buttons.help')}
            </a>
          </HeaderButton>
        </HeaderButtons>
      </Header>
      <div className="h-[calc(100svh-64px)] bg-slate-50 dark:bg-slate-900">
        <div className="max-w-2xl mx-auto h-full flex flex-col justify-between py-4 px-6">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className="pr-4"> {/* Add right padding for scrollbar placeholder */}
            <DegreeTrainerSettings
              settings={settings}
              isSettingsOpen={isSettingsOpen}
              setIsSettingsOpen={closeSettings}
              playNote={playNote}
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
    </>
  );
};

export default EarTrainer;
