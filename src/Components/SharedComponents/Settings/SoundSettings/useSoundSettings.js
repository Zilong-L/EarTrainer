import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState, useCallback } from 'react';
import { getSamplerInstance, getDroneInstance, playNotes } from '@utils/ToneInstance';
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
  // const updateDroneEffects = useCallback(debounce(() => {
  //   const drone = getDroneInstance();
  //   if (drone) {
  //     drone.sampler.setPan(dronePan);
  //     drone.sampler.setFilterFrequency(droneFilter);
  //   }
  // }, 300), [dronePan, droneFilter]);

  // useEffect(() => {
  //   updateDroneEffects();
  // }, [dronePan, droneFilter, updateDroneEffects]);

  const changeInstrumentCallback = useCallback(async (newInstrument, newQuality) => {
    console.log("Changing instrument to:", newInstrument, "Quality:", newQuality);
    const sampler = getSamplerInstance();
    if (!sampler) return;
    setIsLoadingInstrument(true);
    try {
      // Using setTimeout to ensure state update happens before heavy load
      await sampler.changeSampler(newInstrument, newQuality);
      // Update state only after successful change
      setSelectedInstrument(newInstrument);
      setSelectedQuality(newQuality);
    } catch (error) {
      console.error("Failed to change instrument:", error);
      // Optionally revert state or show error to user
    } finally {
      console.log("finalizing")
      setIsLoadingInstrument(false);
      playNotes(['C3']);
    }
  }, [setIsLoadingInstrument, setSelectedInstrument, setSelectedQuality]);


  return {
    selectedInstrument,
    // Keep setSelectedInstrument/Quality for direct state updates if needed elsewhere,
    // but primary change mechanism is now the callback.
    setSelectedInstrument,
    selectedQuality,
    setSelectedQuality,
    dronePan,
    setDronePan,
    droneFilter,
    setDroneFilter,
    isLoadingInstrument,
    setIsLoadingInstrument,
    clamps,
    changeInstrumentCallback // Expose the new callback
  };
};

export default useSoundSettings;
