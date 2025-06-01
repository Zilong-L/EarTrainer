import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { useLocalStorage } from '@uidotdev/usehooks';
import Button from '@components/Button';
import RangeSlider from '@components/slider/RangeSlider';

// Lazy load components
const ChordTrainer = lazy(() => import('./ChordTrainer'));
const Intro = lazy(() => import('./Intro'));
const DegreeTrainer = lazy(() => import('@EarTrainers/DegreeTrainer/DegreeTrainer'));
const ChordColorTrainer = lazy(() => import('@EarTrainers/ChordColorTrainer/ChordColorTrainer'));
const DegreeTrainerSettingsProvider = lazy(() => import('@EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings').then(module => ({ default: module.DegreeTrainerSettingsProvider })));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const WebRoutes = () => {
  return (
    <Router>
      <ThemedContent />
    </Router>
  );
};
const LanguageSwitcher = () => {
  const [language, setLanguage] = useLocalStorage('language', 'en');
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language])
  const changeLanguage = (lng) => {
    setLanguage(lng);
    console.log("切换前的当前语言:", i18n.language); // 打印切换前的语言
    i18n.changeLanguage(lng).then(() => {
      console.log("切换后的当前语言:", i18n.language); // 打印切换后的语言
    }).catch((err) => {
      console.error("语言切换失败:", err); // 捕获切换语言时的错误
    });
  };

  return (
    <div className='flex justify-center items-center gap-2'>
      <Button className='bg-transparent text-white text-2xl' onClick={() => changeLanguage('zh')}>
        中文
      </Button>
      <Button className='bg-transparent text-white text-2xl' onClick={() => changeLanguage('en')}>
        English
      </Button>
    </div>
  );

};


const ThemedContent = () => {
  const location = useLocation();
  const { t } = useTranslation('musicTrainer');
  const [isDark, setIsDark] = useLocalStorage('isdark', false);
  const { i18n } = useTranslation();
  useEffect(() => {
    if (!isDark) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark((prev) => !prev);

  };

  return (
    <div className={`${i18n.language === 'zh' ? 'font-chinese' : 'font-chewy'}`}>

      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes location={location}>
            <Route path="/" element={<Intro />} />

            <Route path="/chord-trainer" element={
              <Suspense fallback={<LoadingSpinner />}>
                <DegreeTrainerSettingsProvider>
                  <ChordTrainer />
                </DegreeTrainerSettingsProvider>
              </Suspense>
            } />

            <Route path="/ear-trainer" element={
              <motion.div
                key={location.pathname}
                initial={location.pathname === '/' ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={location.pathname === '/' ? {} : { opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Intro />
              </motion.div>
            } />

            <Route path="/ear-trainer/degree-trainer" element={
              <motion.div
                key={location.pathname}
                initial={location.pathname === '/' ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={location.pathname === '/' ? {} : { opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <DegreeTrainerSettingsProvider>
                    <DegreeTrainer />
                  </DegreeTrainerSettingsProvider>
                </Suspense>
              </motion.div>
            } />

            <Route path="/ear-trainer/chord-color-trainer" element={
              <motion.div
                key={location.pathname}
                initial={location.pathname === '/' ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={location.pathname === '/' ? {} : { opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <ChordColorTrainer />
              </motion.div>
            } />
          </Routes>
        </Suspense>
      </AnimatePresence>

      <div className='text-center p-2 bg-black'>
        <p>
          <a href="https://github.com/Zilong-L/EarTrainer/issues" target="_blank" rel="noopener noreferrer" style={{ color: 'lightblue' }}>
            {t('Open Source Message')}
          </a>
        </p>
        <LanguageSwitcher />
      </div>

      {
        location.pathname !== '/' && location.pathname !== '/ear-trainer' && (
          <button
            onClick={toggleTheme}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
            }}
          >
            {isDark ? '🌙' : '☀️'}
          </button>
        )
      }
    </div>
  )
}

export default WebRoutes;
