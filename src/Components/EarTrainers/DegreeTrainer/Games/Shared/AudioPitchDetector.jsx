import { useState, useEffect, useRef } from "react";
import { Note } from "tonal";
import { calculateDegree } from "@utils/GameLogics";
import { SolfegeMapping, DegreeToDistance } from "@components/EarTrainers/DegreeTrainer/Constants";
import ThresholdSlider from "./ThresholdSlider";
import { isSameNote } from "@utils/ChordTrainer/GameLogics";

const AudioPitchDetector = ({ rootNote, setActiveNote, useSolfege, currentNote, disabledNotes }) => {
  const [isListening, setIsListening] = useState(false);
  const [detectedNote, setDetectedNote] = useState("?");
  const [threshold, setThreshold] = useState(0.02); // 默认阈值
  const [currentRMS, setCurrentRMS] = useState(0); // 当前响度
  const thresholdRef = useRef(threshold);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  const handleGame = (pitchHz, currentNote) => {
    const noteName = Note.fromFreq(pitchHz);
    const degree = calculateDegree(noteName, rootNote);
    const distance = DegreeToDistance[degree];
    const note = Note.fromMidi(Note.midi(rootNote) + distance);

    setDetectedNote((prev) => (prev !== noteName ? noteName : prev));
    if (!isSameNote(note.slice(0, -1), currentNote.slice(0, -1))) return;
    if (!isSameNote(note.slice(0, -1), detectedNoteRef.current.slice(0, -1))) {
      setActiveNote(note);
    }
  };

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const intervalRef = useRef(null);
  const workerRef = useRef(null);
  const currentNoteRef = useRef(currentNote);
  const detectedNoteRef = useRef(detectedNote);

  useEffect(() => {
    detectedNoteRef.current = detectedNote;
  }, [detectedNote]);

  useEffect(() => {
    currentNoteRef.current = currentNote;
  }, [currentNote]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 4096;

    const fetchDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true }); // 确保用户允许麦克风权限
      } catch (error) {
        console.error("获取麦克风权限失败:", error);
      }
    };

    fetchDevices();

    workerRef.current = new Worker("/workers/pitchWorker.js");
    workerRef.current.onmessage = (event) => {
      const pitchHz = event.data;
      if (pitchHz > 4000 || pitchHz < 50) return;
      handleGame(pitchHz, currentNoteRef.current);
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // 直接获取默认设备
      mediaStreamRef.current = stream;

      const source = audioContextRef.current.createMediaStreamSource(stream);

      const lowPassFilter = audioContextRef.current.createBiquadFilter();
      lowPassFilter.type = "lowpass";
      lowPassFilter.frequency.value = 3000;

      source.connect(lowPassFilter);
      lowPassFilter.connect(analyserRef.current);

      intervalRef.current = setInterval(() => {
        const array32 = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(array32);

        const rms = Math.sqrt(array32.reduce((sum, val) => sum + val * val, 0) / array32.length);
        setCurrentRMS(rms);

        if (thresholdRef.current && rms > thresholdRef.current && workerRef.current) {
          const audioData = new Float32Array(array32);
          workerRef.current.postMessage({ audioData, currentNote });
        }
      }, 50);

      setIsListening(true);
    } catch (error) {
      console.error("麦克风启动失败:", error);
    }
  };

  const stopListening = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setIsListening(false);
  };

  const toggleListening = () => {
    isListening ? stopListening() : startListening();
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* 检测到的音高 */}
      <div className="text-2xl font-bold text-text-primary">
        {detectedNote === "?" ? "?" : useSolfege ? SolfegeMapping[calculateDegree(detectedNote, rootNote)] : calculateDegree(detectedNote, rootNote)}
      </div>

      {/* 阈值滑动条 + 当前响度显示 */}
      <ThresholdSlider threshold={threshold} setThreshold={setThreshold} currentRMS={currentRMS} />

      {/* 启动/停止按钮 */}
      <button
        onClick={toggleListening}
        className="flex items-center justify-center w-16 h-16 bg-bg-accent text-text-primary rounded-full"
      >
        {isListening ? "🛑 停止" : "🎤 开始"}
      </button>
    </div>
  );
};

export default AudioPitchDetector;
