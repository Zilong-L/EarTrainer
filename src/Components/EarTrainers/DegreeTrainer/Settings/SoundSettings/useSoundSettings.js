import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';
import {getSamplerInstance} from '@utils/ToneInstance'

const useSoundSettings = () => {
  const [selectedInstrument, setSelectedInstrument] = useLocalStorage('degreeTrainerInstrument', 'bass-electric');
  const [selectedQuality, setSelectedQuality] = useLocalStorage('degreeTrainerQuality', 'medium');
  const [isLoadingInstrument, setIsLoadingInstrument] = useState(false);

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
    isLoadingInstrument,
    setIsLoadingInstrument
  };
};

export default useSoundSettings;
