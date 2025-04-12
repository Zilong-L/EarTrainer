import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState, useCallback } from 'react';
import { getSamplerInstance, getDroneInstance } from '@utils/ToneInstance';
import { debounce } from 'lodash-es';

const useSoundSettings = () => {
  const [selectedInstrument, setSelectedInstrument] = useLocalStorage('degreeTrainerInstrument', 'bass-electric');
  const [selectedQuality, setSelectedQuality] = useLocalStorage('degreeTrainerQuality', 'medium');
  const [dronePan, setDronePan] = useLocalStorage('degreeTrainerDronePan', 0);
  const [droneFilter, setDroneFilter] = useLocalStorage('degreeTrainerDroneFilter', 1200);
  const [isLoadingInstrument, setIsLoadingInstrument] = useState(false);

  const clamps = {
    dronePan: {
      min: -1,
      max: 1
    },
    droneFilter: {
      min: 20,
      max: 2000
    }
  };

  // Debounced effect updates
  const updateDroneEffects = useCallback(debounce(() => {
    const drone = getDroneInstance();
    if (drone) {
      drone.sampler.setPan(dronePan);
      drone.sampler.setFilterFrequency(droneFilter);
    }
  }, 300), [dronePan, droneFilter]);

  useEffect(() => {
    updateDroneEffects();
  }, [dronePan, droneFilter, updateDroneEffects]);

  useEffect(() => {
    async function changeInstrument() {
      const sampler = getSamplerInstance();
      if (!sampler) return;
      setIsLoadingInstrument(true);
      setTimeout(async () => {
        await sampler.changeSampler(selectedInstrument, selectedQuality);
        console.log("changed");
        setIsLoadingInstrument(false);
      }, 10);
    }
    changeInstrument();
  }, [selectedInstrument, selectedQuality]);

  return {
    selectedInstrument,
    setSelectedInstrument,
    selectedQuality,
    setSelectedQuality,
    dronePan,
    setDronePan,
    droneFilter,
    setDroneFilter,
    isLoadingInstrument,
    setIsLoadingInstrument,
    clamps
  };
};

export default useSoundSettings;
