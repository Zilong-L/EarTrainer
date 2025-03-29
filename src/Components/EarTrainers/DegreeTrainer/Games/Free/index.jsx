import React from 'react';
import { useTranslation } from 'react-i18next';
import CardStack from '../Shared/CardStack';
import { DesktopStartButton, PhoneStartButton } from '../Shared/StartButtons';
import AudioPitchDetector from '../Shared/AudioPitchDetector';
const FreeMode = ({ FreeTrainerSettings }) => {
  const {
    currentNote,
    disabledNotes,
    filteredNotes,
    isAdvance,
    setIsAdvance,
    setActiveNote,
    playNote,
    bpm,
    gameState,
    setGameState,
    rootNote,
    isHandfree,
    useSolfege,
    isPlayingSound
  } = FreeTrainerSettings;
  const { t } = useTranslation('degreeTrainer');
  const handleButton = () => {
    if (gameState === 'end') {
      setGameState('start');
    } else {
      if (isAdvance === 'Ready') {
        setIsAdvance('Now');
      } else {
        playNote(currentNote);
      }
    }
  }
  return (
    <div className="flex flex-col justify-end h-full mb-8">
      {/* <AudioPitchDetector
        currentNote={currentNote}
        disabledNotes={disabledNotes}
        filteredNotes={filteredNotes}
        isAdvance={isAdvance}
        setActiveNote={setActiveNote}
        rootNote={rootNote}
        isHandfree={isHandfree}
        useSolfege={useSolfege}
        bpm={bpm}
        gameState={gameState}
      /> */}
      <div className="flex-grow" />
      <CardStack
        currentNote={currentNote}
        disabledNotes={disabledNotes}
        filteredNotes={filteredNotes}
        isAdvance={isAdvance}
        setActiveNote={setActiveNote}
        rootNote={rootNote}
        isHandfree={isHandfree}
        useSolfege={useSolfege}
        bpm={bpm}
        gameState={gameState}
      >
      </CardStack>
      {/* 新增：桌面端大圆形按钮（lg 以上显示） */}
      {isHandfree ? <></> : (<div
        className="
          hidden
          lg:flex
          items-center
          justify-center
          absolute
          top-1/2
          left-1/2
          transform
          -translate-x-1/2
          -translate-y-1/2
        "
      >
        <DesktopStartButton
          gameState={gameState}
          isAdvance={isAdvance}
          isPlayingSound={isPlayingSound}
          onClick={handleButton}
        />
      </div>)}
      <PhoneStartButton gameState={gameState} isAdvance={isAdvance} onClick={handleButton} isPlayingSound={isPlayingSound} />
    </div>
  );
};

export default FreeMode;
