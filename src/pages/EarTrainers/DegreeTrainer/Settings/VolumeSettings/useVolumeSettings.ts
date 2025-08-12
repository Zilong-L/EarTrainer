import { useLocalStorage } from '@uidotdev/usehooks';
import { getDroneInstance, getSamplerInstance, getAnswerGainNode } from '@utils/Tone/samplers';
import { useEffect } from 'react';
import * as Tone from 'tone';

const useVolumeSettings = () => {
  const [droneVolume, setDroneVolume] = useLocalStorage<number>('degreeTrainerDroneVolume', 0.5);
  const [pianoVolume, setPianoVolume] = useLocalStorage<number>('degreeTrainerPianoVolume', 0.5);
  const [answerVolume, setAnswerVolume] = useLocalStorage<number>('degreeTrainerAnswerVolume', 0.2);

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

  const answerGainNode: Tone.Gain | null = getAnswerGainNode();
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
