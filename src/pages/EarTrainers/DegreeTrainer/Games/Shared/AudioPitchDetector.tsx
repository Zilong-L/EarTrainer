import { useState, useEffect, useRef } from 'react';
import { Note } from 'tonal';
import { calculateDegree } from '@utils/GameLogics';
import { SolfegeMapping } from '@EarTrainers/DegreeTrainer/Constants';
import { DegreeToDistance } from '@utils/Constants';
import ThresholdSlider from './ThresholdSlider';
import { isSameNote } from '@utils/ChordTrainer/GameLogics';

interface AudioPitchDetectorProps {
  rootNote: string;
  setActiveNote: (note: string) => void;
  useSolfege: boolean;
  currentNote: string;
  disabledNotes?: string[];
}

const AudioPitchDetector = ({
  rootNote,
  setActiveNote,
  useSolfege,
  currentNote,
}: AudioPitchDetectorProps) => {
  const [isListening, setIsListening] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string>('?');
  const [threshold, setThreshold] = useState<number>(0.02);
  const [currentRMS, setCurrentRMS] = useState<number>(0);
  const thresholdRef = useRef(threshold);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  const handleGame = (pitchHz: number, currentNote: string) => {
    const noteName = Note.fromFreq(pitchHz) as string | null;
    if (!noteName) return;
    const degree = calculateDegree(noteName, rootNote) as
      | keyof typeof DegreeToDistance
      | keyof typeof SolfegeMapping
      | string;
    const distance = DegreeToDistance[degree as keyof typeof DegreeToDistance];
    if (typeof distance !== 'number') return;
    const midi = Note.midi(rootNote);
    if (typeof midi !== 'number') return;
    const note = Note.fromMidi(midi + distance) as string;

    setDetectedNote(prev => (prev !== noteName ? noteName : prev));
    if (!isSameNote(note.slice(0, -1), currentNote.slice(0, -1))) return;
    if (!isSameNote(note.slice(0, -1), detectedNoteRef.current.slice(0, -1))) {
      setActiveNote(note);
    }
  };

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const currentNoteRef = useRef(currentNote);
  const detectedNoteRef = useRef(detectedNote);

  useEffect(() => {
    detectedNoteRef.current = detectedNote;
  }, [detectedNote]);

  useEffect(() => {
    currentNoteRef.current = currentNote;
  }, [currentNote]);

  useEffect(() => {
    const Ctor: typeof AudioContext | undefined =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    audioContextRef.current = new Ctor({ sampleRate: 44100 });
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 4096;

    const fetchDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        console.error('Failed to get microphone permission:', error);
      }
    };

    fetchDevices();

    workerRef.current = new Worker('/workers/pitchWorker.js');
    workerRef.current.onmessage = (event: MessageEvent<any>) => {
      const pitchHz = event.data as number;
      if (pitchHz > 4000 || pitchHz < 50) return;
      handleGame(pitchHz, currentNoteRef.current);
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ac = audioContextRef.current;
      const an = analyserRef.current;
      if (!ac || !an) return;

      const source = ac.createMediaStreamSource(stream);
      const lowPassFilter = ac.createBiquadFilter();
      lowPassFilter.type = 'lowpass';
      lowPassFilter.frequency.value = 3000;

      source.connect(lowPassFilter);
      lowPassFilter.connect(an);

      intervalRef.current = window.setInterval(() => {
        if (!an) return;
        const array32 = new Float32Array(an.fftSize);
        an.getFloatTimeDomainData(array32);

        const rms = Math.sqrt(
          array32.reduce((sum, val) => sum + val * val, 0) / array32.length
        );
        setCurrentRMS(rms);

        if (
          thresholdRef.current &&
          rms > thresholdRef.current &&
          workerRef.current
        ) {
          const audioData = new Float32Array(array32);
          workerRef.current.postMessage({ audioData, currentNote });
        }
      }, 50);

      setIsListening(true);
    } catch (error) {
      console.error('Failed to start microphone:', error);
    }
  };

  const stopListening = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    setIsListening(false);
  };

  const toggleListening = () => {
    isListening ? stopListening() : startListening();
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="text-2xl font-bold text-text-primary">
        {detectedNote === '?'
          ? '?'
          : useSolfege
            ? (SolfegeMapping[
                calculateDegree(
                  detectedNote,
                  rootNote
                ) as keyof typeof SolfegeMapping
              ] ?? '?')
            : calculateDegree(detectedNote, rootNote)}
      </div>

      <ThresholdSlider
        threshold={threshold}
        setThreshold={setThreshold}
        currentRMS={currentRMS}
      />

      <button
        onClick={toggleListening}
        className="flex items-center justify-center w-16 h-16 bg-bg-accent text-text-primary rounded-full"
      >
        {isListening ? '🛑 停止' : '🎤 开始'}
      </button>
    </div>
  );
};

export default AudioPitchDetector;
