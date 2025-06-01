import { motion } from 'motion/react';
import { AudioBars } from './AudioWave';
import { ArrowPathIcon, ForwardIcon } from '@heroicons/react/24/solid';
import Button from '@components/Button';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// 桌面端按钮组件
const DesktopStartButton = ({ gameState, isAdvance, onClick, isPlayingSound, isLoadingInstrument }) => { // Add isLoadingInstrument prop
  const { t } = useTranslation('degreeTrainer'); // Get translation function
  let content;

  if (isLoadingInstrument) { // Check sampler loading state first
    content = <span className="text-xl">{t('buttons.loading')}...</span>; // Display loading text
  } else if (gameState === 'end') {
    content = <ForwardIcon className="w-12 h-12" />;
  } else if (isPlayingSound) {
    content = <AudioBars />;
  } else if (isAdvance === 'Ready') {
    content = <ForwardIcon className="w-12 h-12" />;
  } else {
    content = <ArrowPathIcon className="w-12 h-12" />;
  }

  return (
    <motion.button
      key="start-button"
      initial={{ scale: 0 }}
      animate={{ x: 0, scale: 1, transition: { duration: 0.5, bounce: 0.3, type: 'spring' } }}
      exit={{ scale: 0 }}
      whileHover={{ scale: isLoadingInstrument ? 1 : 1.05, duration: 0.5 }}
      whileTap={{ scale: isLoadingInstrument ? 1 : 0.95 }}
      drag={!isLoadingInstrument}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // 限制拖拽
      onClick={isLoadingInstrument ? undefined : onClick} // Disable click if loading
      className={`w-32 h-32 rounded-full shadow-md flex items-center justify-center bg-bg-accent text-text-primary text-3xl transition-colors ${isLoadingInstrument ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} // Add loading styles
    >
      {content}
    </motion.button>
  );
};

// 移动端按钮组件
const PhoneStartButton = ({ gameState, isAdvance, onClick, isPlayingSound, isLoadingInstrument }) => { // Add isLoadingInstrument prop
  const { t } = useTranslation('degreeTrainer'); // Get translation function
  console.log('is loading', isLoadingInstrument)
  return (
    <Button
      onClick={isLoadingInstrument ? undefined : onClick} // Disable click if loading
      className={`lg:hidden w-full p-4 md:p-6 flex justify-center items-center ${isLoadingInstrument ? 'opacity-50 cursor-not-allowed' : ''}`} // Add loading styles
    >
      {isLoadingInstrument ? ( // Check sampler loading state first
        <span className="text-xl">{t('buttons.loading')}...</span> // Display loading text
      ) : gameState === 'end' ? (
        <ForwardIcon className="w-12 h-12 md:w-16 md:h-16" />
      ) : isPlayingSound ? (
        <AudioBars className="w-12 h-12 md:w-16 md:h-16" />
      ) : isAdvance === 'Ready' ? (
        <ForwardIcon className="w-12 h-12 md:w-16 md:h-16" />
      ) : (
        <ArrowPathIcon className="w-12 h-12 md:w-16 md:h-16" />
      )}
    </Button>
  );
};

export { DesktopStartButton, PhoneStartButton };
