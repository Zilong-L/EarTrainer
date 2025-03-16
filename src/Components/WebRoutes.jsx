
import { CssBaseline, Box, ThemeProvider, createTheme, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ChordTrainer from './ChordTrainer';
import { useEffect } from 'react';
import Intro from './EarTrainers/Intro';
import DegreeTrainer from '@EarTrainers/DegreeTrainer/DegreeTrainer'
import ChordColorTrainer from '@EarTrainers/ChordColorTrainer/ChordColorTrainer'
import { DegreeTrainerSettingsProvider, } from '@EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings'
import themes from '@themes/palette.js'
// Import additional trainers here
import { useTranslation } from 'react-i18next'; // 引入 useTranslation 钩子
import { AnimatePresence, motion } from 'motion/react';
// Define themes for each trainer
import { useLocalStorage } from '@uidotdev/usehooks';
const WebRoutes = () => {
  return (
    <Router>
      <ThemedContent />
    </Router>
  );
};
const LanguageSwitcher = () => {
  const [language, setLanguage] = useLocalStorage('language','zh');
  const { i18n } = useTranslation();
  useEffect(()=>{
    i18n.changeLanguage(language);
  },[language])
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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }} >
      <Button sx={{ backgroundColor: 'transparent' }} variant="contained" onClick={() => changeLanguage('zh')}>
        中文
      </Button>
      <Button sx={{ backgroundColor: 'transparent' }} variant="contained" onClick={() => changeLanguage('en')}>
        English
      </Button>
    </Box>
  );

};


const ThemedContent = () => {
  const location = useLocation();
  const { t } = useTranslation('musicTrainer');
  const currentTheme = themes[location.pathname] || themes['/'];
  const [isDark, setIsDark] = useLocalStorage('isdark',false);
  const { i18n } = useTranslation();
  useEffect(()=>{
    if(!isDark){
      document.body.classList.add('light');
    }else{
      document.body.classList.remove('light');
    }
  },[isDark]) 

  const toggleTheme = () => {
    setIsDark((prev) => !prev);

  };

  return (
    <ThemeProvider theme={currentTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }} className={`${i18n.language === 'zh' ? 'font-chinese' : 'font-chewy'}`}>
        <CssBaseline />

        <AnimatePresence mode="wait">
          <Routes location={location}>

            <Route path="/" element={<Intro />} />

            <Route path="/chord-trainer" element={
              <DegreeTrainerSettingsProvider>
              <ChordTrainer />
              </DegreeTrainerSettingsProvider>} />
            <Route path="/ear-trainer" element={

              <motion.div
                key={location.pathname} // 关键点：motion.div 负责整个页面切换动画
                initial={location.pathname === '/' ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={location.pathname === '/' ? {} : { opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Intro />
              </motion.div>
            } />
            <Route
              path="/ear-trainer/degree-trainer"
              element={

                <motion.div
                  key={location.pathname} // 关键点：motion.div 负责整个页面切换动画
                  initial={location.pathname === '/' ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={location.pathname === '/' ? {} : { opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <DegreeTrainerSettingsProvider>
                    <DegreeTrainer />
                  </DegreeTrainerSettingsProvider>
                </motion.div>

              }
            />
            <Route path="/ear-trainer/chord-color-trainer" element={
              <motion.div
                  key={location.pathname} // 关键点：motion.div 负责整个页面切换动画
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
        </AnimatePresence>

        <Box sx={{ textAlign: 'center', padding: 2 }}>
          <p>
            <a href="https://github.com/Zilong-L/EarTrainer/issues" target="_blank" rel="noopener noreferrer" style={{ color: 'lightblue' }}>
              {t('Open Source Message')}
            </a>
          </p>
          <LanguageSwitcher />
        </Box>
      </Box>

      {location.pathname !== '/' && location.pathname !== '/ear-trainer' && (
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
      )}
    </ThemeProvider>
  );
};

export default WebRoutes;
