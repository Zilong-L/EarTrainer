import { useSoundSettingsStore } from '@stores/soundSettingsStore';

const useSoundSettings = () => {
  const {
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
    changeInstrument,
  } = useSoundSettingsStore();



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
    clamps,
    changeInstrument
  };
};

export default useSoundSettings;
