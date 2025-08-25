import useSafeLocalStorage from '../../hooks/useSafeLocalStorage';
import {
  getDroneInstance,
  getSamplerInstance,
  getAnswerGainNode,
} from '@utils/Tone/samplers';
import { useEffect } from 'react';
import { Gain } from 'tone';

const useVolumeSettings = () => {
  const [droneVolume, setDroneVolume] = useSafeLocalStorage<number>(
    'degreeTrainerDroneVolume',
    0.5
  );
  const [pianoVolume, setPianoVolume] = useSafeLocalStorage<number>(
    'degreeTrainerPianoVolume',
    0.5
  );
  const [answerVolume, setAnswerVolume] = useSafeLocalStorage<number>(
    'degreeTrainerAnswerVolume',
    0.2
  );

  const drone = getDroneInstance();
  const sampler = getSamplerInstance();

  useEffect(() => {
    if (drone) {
      drone.setVolume(droneVolume);
    }
  }, [droneVolume, drone]);

  useEffect(() => {
    if (sampler) {
      sampler.setVolume(pianoVolume);
    }
  }, [pianoVolume, sampler]);

  const answerGainNode: Gain | null = getAnswerGainNode();
  useEffect(() => {
    if (answerGainNode) {
      answerGainNode.gain.value = answerVolume;
    }
  }, [answerVolume, answerGainNode]);

  return {
    droneVolume,
    setDroneVolume,
    pianoVolume,
    setPianoVolume,
    answerVolume,
    setAnswerVolume,
  } as const;
};

export default useVolumeSettings;
