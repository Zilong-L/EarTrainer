import { useState, useRef, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Transport } from 'tone';
import { degrees } from '@EarTrainers/DegreeTrainer/Constants';
import { getDroneInstance } from '@utils/Tone/samplers';
import { playNotes } from '@utils/Tone/playbacks';
import {
  getNextNote,
  getPossibleNotesInRange,
  handleNoteGuess,
  handleGameLogic,
} from '@utils/GameLogics';
import { useDegreeTrainerSettings } from '@EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';

const useFreeTrainer = () => {
  const {
    isHandfree,
    practice: { bpm, rootNote, range, autoAdvance, useSolfege },
    stats: { updatePracticeRecords },
  } = useDegreeTrainerSettings();

  const [currentNote, setCurrentNote] = useState<string>('');
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [disabledNotes, setDisabledNotes] = useState<string[]>([]);
  const [gameState, setGameState] = useState<
    'end' | 'start' | 'playing' | 'paused'
  >('end');
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isAdvance, setIsAdvance] = useState<'No' | 'Ready' | 'Next' | 'Now'>(
    'No'
  );
  const [customNotes, _setCustomNotes] = useState(degrees);
  const [selectedMode, setSelectedMode] = useState('');

  const playNoteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setCustomNotes = (notes: typeof degrees) => {
    _setCustomNotes(notes as any);
    localStorage.setItem('degreeTrainerCustomNotes', JSON.stringify(notes));
  };
  const handleDegreeToggle = (index: number) => {
    const newCustomNotes = [...(customNotes as any)];
    const isCurrentlyEnabled = !!newCustomNotes[index].enable;
    if (isCurrentlyEnabled) {
      const enabledCount = newCustomNotes.filter(n => n.enable).length;
      if (enabledCount <= 1) {
        toast.error('至少保留一个音级', { id: 'settings-error' });
        return; // disallow disabling the last one
      }
    }
    newCustomNotes[index].enable = !newCustomNotes[index].enable;
    setCustomNotes(newCustomNotes);
  };

  useEffect(() => {
    const cached = localStorage.getItem('degreeTrainerCustomNotes');
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached);
      setCustomNotes(parsed);
    } catch {}
  }, []);

  const drone = getDroneInstance();
  const currentNotes = customNotes;
  const filteredNotes = currentNotes.filter(note => note.enable);

  const possibleNotesInRange = useMemo(
    () => getPossibleNotesInRange(rootNote, range, currentNotes),
    [rootNote, range, currentNotes]
  );

  useEffect(() => {
    if (!activeNote) return;
    handleNoteGuess(
      activeNote,
      currentNote,
      rootNote,
      disabledNotes,
      setDisabledNotes as any,
      isAdvance as any,
      setIsAdvance as any,
      updatePracticeRecords as any,
      ((n: string) => playNote(n)) as any,
      setActiveNote as any,
      autoAdvance
    );
  }, [activeNote]);

  useEffect(() => {
    handleGameLogic({
      isAdvance,
      isHandfree,
      gameState: gameState === 'playing' ? 'playing' : 'stopped',
      bpm,
      currentNote,
      rootNote,
      possibleNotesInRange,
      setCurrentNote,
      playNote: ((n: string) => playNote(n)) as any,
      setDisabledNotes: (v: string[]) => setDisabledNotes(v),
      setIsAdvance,
    } as any);
  }, [isAdvance, gameState, isHandfree]);

  useEffect(() => {
    const newNote = getNextNote(possibleNotesInRange, currentNote);
    setCurrentNote(newNote || '');
    if (gameState === 'playing') playNote();
  }, [possibleNotesInRange]);

  useEffect(() => {
    if (gameState === 'playing') {
      playNote();
    } else if (gameState === 'end') {
      setDisabledNotes([]);
    }
  }, [gameState]);

  const startGame = () => setGameState('start');

  const playNote = (note: string | null = null, delay = 0.05, time = 1) => {
    const noteToPlay = note ?? currentNote;
    if (playNoteTimeoutRef.current) clearTimeout(playNoteTimeoutRef.current);
    playNotes(noteToPlay, delay, bpm / time);
    setIsPlayingSound(true);
    playNoteTimeoutRef.current = setTimeout(
      () => {
        setIsPlayingSound(false);
        playNoteTimeoutRef.current = null;
      },
      (60 / (bpm / time)) * 1000
    );
  };

  useEffect(() => {
    if (gameState == 'start') {
      Transport.stop();
      Transport.position = 0 as any;
      Transport.cancel();
      setDisabledNotes([]);
      const droneInst = drone;
      droneInst.start();
      Transport.start();
      setGameState('playing');
    }
  }, [gameState, currentNote]);

  useEffect(() => {
    const newNote = getNextNote(possibleNotesInRange, currentNote);
    setCurrentNote(newNote || '');
    return () => {
      endGame();
    };
  }, []);

  const endGame = () => {
    Transport.stop();
    Transport.position = 0 as any;
    Transport.cancel();
    setGameState('end');
    setDisabledNotes([]);
    drone.stop();
  };

  return {
    rootNote,
    currentNote,
    filteredNotes,
    disabledNotes,
    gameState,
    activeNote,
    handleDegreeToggle,
    customNotes,
    isAdvance,
    isHandfree,
    setIsAdvance,
    bpm,
    setActiveNote,
    startGame,
    playNote,
    endGame,
    setGameState,
    useSolfege,
    isPlayingSound,
    setCustomNotes,
    selectedMode,
    setSelectedMode,
  } as const;
};

export default useFreeTrainer;
