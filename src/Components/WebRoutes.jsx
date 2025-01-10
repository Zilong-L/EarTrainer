import React from 'react';
import { CssBaseline, Box,  ThemeProvider, createTheme,Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ChordTrainer from './ChordTrainer';
import MusicTrainer from './EarTrainers/MusicTrainer';
import DegreeTrainer from '@EarTrainers/DegreeTrainer/DegreeTrainer'
import SequenceTrainer from'@EarTrainers/SequenceTrainer/SequenceTrainer' // 新增的 Sequence Trainer
import ChordColorTrainer from'@EarTrainers/ChordColorTrainer/ChordColorTrainer'
import {DegreeTrainerSettingsProvider,} from '@EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings'
import themes from '@themes/palette.js'
// Import additional trainers here
import { useTranslation } from 'react-i18next'; // 引入 useTranslation 钩子
// Define themes for each trainer

const WebRoutes = () => {
  return (
    <Router>
      <ThemedContent />
    </Router>
  );
};
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    console.log("切换前的当前语言:", i18n.language); // 打印切换前的语言
    i18n.changeLanguage(lng).then(() => {
      console.log("切换后的当前语言:", i18n.language); // 打印切换后的语言
    }).catch((err) => {
      console.error("语言切换失败:", err); // 捕获切换语言时的错误
    });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2}} >
      <Button sx={{ backgroundColor: 'transparent'}} variant="contained" onClick={() => changeLanguage('zh')}>
        中文
      </Button>
      <Button sx={{ backgroundColor: 'transparent'}}    variant="contained" onClick={() => changeLanguage('en')}>
        English
      </Button>
    </Box>
  );

};

const ThemedContent = () => {
  const location = useLocation();
  const {t} = useTranslation('musicTrainer')
  const currentTheme = themes[location.pathname] || themes['/'];
  console.log(location.pathname)
  return (
    <ThemeProvider theme={currentTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}class="font-jazz">
        <CssBaseline />
        
          <Routes>
            <Route path="/" element={<MusicTrainer />} />
            <Route path="/chord-trainer" element={<ChordTrainer />} />
            <Route path="/ear-trainer" element={<MusicTrainer />} />
            <Route path="/ear-trainer/degree-trainer" element={
            <DegreeTrainerSettingsProvider>
              <DegreeTrainer />
              </DegreeTrainerSettingsProvider>} />
            
            <Route path="/ear-trainer/chord-color-trainer" element={<ChordColorTrainer />} />
            <Route path="/ear-trainer/sequence-trainer" element={<SequenceTrainer />} /> {/* 新增的 Sequence Trainer 路由 */}
          </Routes>
        
        <Box sx={{ textAlign: 'center', padding: 2 }}>
          <p><a href="https://github.com/Zilong-L/EarTrainer/issues" target="_blank" rel="noopener noreferrer" style={{ color: 'lightblue' }}>{t('Open Source Message')}</a> </p>
          <LanguageSwitcher/>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default WebRoutes;
