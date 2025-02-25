import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState, useCallback } from 'react';
import { getSamplerInstance, getDroneInstance } from '@utils/ToneInstance';
import { debounce } from 'lodash';

const useSoundSettings = () => {
  const [selectedInstrument, setSelectedInstrument] = useLocalStorage('degreeTrainerInstrument', 'bass-electric');
  const [selectedQuality, setSelectedQuality] = useLocalStorage('degreeTrainerQuality', 'medium');
  const [dronePan, setDronePan] = useLocalStorage('dronePan', 0);
  const [droneFilter, setDroneFilter] = useLocalStorage('droneFilter', 1200);
  const [isLoadingInstrument, setIsLoadingInstrument] = useState(false);

  // Debounced effect updates
  const updateDroneEffects = useCallback(debounce(() => {
    const drone = getDroneInstance();
    drone.sampler.setPan(dronePan);
    drone.sampler.setFilterFrequency(droneFilter);
  }, 300), [dronePan, droneFilter]);

  useEffect(() => {
    updateDroneEffects();
  }, [dronePan, droneFilter, updateDroneEffects]);

  useEffect(()=>{
    async function changeInstrument() {
      const sampler = getSamplerInstance()
      if(!sampler) return;
      setIsLoadingInstrument(true);
      setTimeout(async () => {
        await sampler.changeSampler(selectedInstrument, selectedQuality);
        console.log("changed");
        setIsLoadingInstrument(false);
      }, 10);
    }
    changeInstrument();
  },[selectedInstrument, selectedQuality])
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
    setIsLoadingInstrument
  };
};

export default useSoundSettings;
