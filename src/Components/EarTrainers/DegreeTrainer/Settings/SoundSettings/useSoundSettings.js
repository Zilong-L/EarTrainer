import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';
import {getSamplerInstance} from '@utils/ToneInstance'
const useSoundSettings = () => {
  const [selectedInstrument, setSelectedInstrument] = useLocalStorage('degreeTrainerInstrument', 'bass-electric');
  const [selectedQuality, setSelectedQuality] = useLocalStorage('degreeTrainerQuality', 'medium');
  const [isLoadingInstrument, setIsLoadingInstrument] = useState(false);

  useEffect(()=>{
    async function changeInstrument() {
      setIsLoadingInstrument(true);
      await getSamplerInstance().changeSampler(selectedInstrument, selectedQuality);
      setIsLoadingInstrument(false);
    }
    changeInstrument();
  },[selectedInstrument, selectedQuality])
  return {
    selectedInstrument,
    setSelectedInstrument,
    selectedQuality, 
    setSelectedQuality,
    isLoadingInstrument,
    setIsLoadingInstrument
  };
};

export default useSoundSettings;
