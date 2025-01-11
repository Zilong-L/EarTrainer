import { useLocalStorage } from '@uidotdev/usehooks';
import { getDroneInstance, getSamplerInstance, getAnswerGainNode } from '@utils/ToneInstance';
import { useEffect } from 'react';


const useVolumeSettings = () => {
  const [droneVolume, setDroneVolume] = useLocalStorage('degreeTrainerDroneVolume', 0.5);
  const [pianoVolume, setPianoVolume] = useLocalStorage('degreeTrainerPianoVolume', 0.5);
  const [answerVolume, setAnswerVolume] = useLocalStorage('degreeTrainerAnswerVolume', 0.2);

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

  const answerGainNode = getAnswerGainNode();
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
    setAnswerVolume
  };
};

export default useVolumeSettings;
