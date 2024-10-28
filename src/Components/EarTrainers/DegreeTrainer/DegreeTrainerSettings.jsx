import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, Slider, Container, Checkbox, Typography, Grid, Switch } from '@mui/material';
import { getDroneInstance } from '@utils/ToneInstance';
import HomeIcon from '@mui/icons-material/Home';
import * as Tone from 'tone';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DegreeTrainerSettings({ settings, isSettingsOpen, setIsSettingsOpen, playNote }) {
  const { t } = useTranslation('degreeTrainer');
  const {
    isStatOpen,
    mode,
    setIsStatOpen,
    bpm,
    setBpm,
    droneVolume,
    setDroneVolume,
    pianoVolume,
    setPianoVolume,
    rootNote,
    setRootNote,
    range,
    setRange,
    currentNotes,
    setCurrentNotes,
    practiceRecords,
    setPracticeRecords,
    setCurrentPracticeRecords,
    setCurrentLevel,
    userProgress,
    saveSettingsToLocalStorage
  } = settings;
  const [showDegreeSettings, setShowDegreeSettings] = useState(false);
  const [showVolumeSettings, setShowVolumeSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const drone = getDroneInstance();
  let midiMin = drone.rootMin;
  let midiMax = drone.rootMax;

  const handleDegreeToggle = (index) => {
    const newNotes = [...currentNotes];
    newNotes[index].enable = !newNotes[index].enable;
    setCurrentNotes(newNotes);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setShowDegreeSettings(false);
    setShowVolumeSettings(false);
    setShowStatistics(false);
    setIsDeleteConfirmOpen(false);
    playNote();

    saveSettingsToLocalStorage(); // 在组件卸载时保存设置
  };

  const calculateAccuracy = (record) => {
    return record.total > 0 ? (record.correct / record.total) * 100 : 0;
  };

  const generateChartData = () => {
    const labels = Object.keys(practiceRecords);
    const data = labels.map((degree) => calculateAccuracy(practiceRecords[degree]));
    console.log(data)
    return {
      labels,
      datasets: [
        {
          label: '正确率 (%)',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
  };

  const handleDeleteConfirm = () => {
    localStorage.removeItem('degreeTrainerRecords');
    setPracticeRecords({});
    setIsDeleteConfirmOpen(false);
  };

  const updateLevel = (index) => {
    setCurrentLevel(userProgress[index]);
    setCurrentPracticeRecords({ total: 0, correct: 0 });
  }


  return (
    <Modal open={isSettingsOpen} onClose={closeSettings} sx={{ color: (theme) => theme.palette.text.primary }}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 500,
          bgcolor: (theme) => theme.palette.background.modal,
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          height: '80vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant='h4' sx={{ textAlign: 'center' }}>{t('settings.Settings')}</Typography>

        {!showDegreeSettings && !showVolumeSettings && !showStatistics ? (
          <>
            <Container sx={{ marginTop: '3rem' }}>
              <Button
                sx={{ color: 'text.primary', display: 'block', fontSize: '1.5rem', width: '100%', textAlign: 'left', marginBottom: '1rem' }}
                onClick={() => setShowDegreeSettings(true)}
              >
                {t('settings.PracticeSettings')}
              </Button>
              <Button
                sx={{ color: 'text.primary', display: 'block', fontSize: '1.5rem', width: '100%', textAlign: 'left', marginBottom: '1rem' }}
                onClick={() => setShowStatistics(true)}
              >
                {t('settings.Statistics')}
              </Button>
              <Button
                sx={{ color: 'text.primary', display: 'block', fontSize: '1.5rem', width: '100%', textAlign: 'left' }}
                onClick={() => setShowVolumeSettings(true)}
              >
                {t('settings.VolumeSettings')}
              </Button>
            </Container>
          </>
        ) : showDegreeSettings ? (
          <>
            {/* 练习设置内容 */}
            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label id="note-range-slider" style={{ fontSize: '1.1rem' }}>
                {t('settings.NoteRange')}
              </label>
              <Slider
                color='secondary'
                value={range}
                valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()}
                onChange={(_, newValue) => {
                  if (Math.abs(newValue[1] - newValue[0]) >= 11) {
                    console.log(newValue);
                    setRange(newValue);
                  }
                }}
                disableSwap
                min={Tone.Frequency('C2').toMidi()}
                max={Tone.Frequency('C6').toMidi()}
                valueLabelDisplay="auto"
                sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
              />
            </div>
            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>{t('settings.RootNote')}</label>
              <Slider
                color='secondary'
                valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()}
                value={rootNote}
                onChange={(e, value) => setRootNote(value)}
                min={midiMin}
                max={midiMax}
                valueLabelDisplay="auto"
                sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
              />
            </div>
            <div style={{ padding: '6px 8px' }}>
              <label style={{ fontSize: '1.1rem' }}>{t('settings.BPM')}: </label>
              <Slider
                color='secondary'
                value={bpm}
                onChange={(e, value) => setBpm(value)}
                min={10}
                max={200}
                valueLabelDisplay="auto"
                sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
              />
            </div>
            {mode == 'free' && <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>{t('settings.SelectDegrees')}</label>
              <Grid container spacing={1} sx={{ marginTop: '4px', paddingLeft: 0 }}>
                {currentNotes.map((note, index) => (
                  <Grid item xs={4} key={note.name} sx={{ padding: 0 }}>
                    <Box
                      onClick={() => handleDegreeToggle(index)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '4px',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Checkbox
                        color='secondary'
                        checked={note.enable}
                        tabIndex={-1}
                        size="small"
                        sx={{ padding: '2px' }}
                      />
                      <Typography variant="body2" sx={{ marginLeft: '4px', fontSize: '1.1rem' }}>
                        {note.name}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </div>}
            {mode == 'challenge' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {userProgress.map((levelData, index) => (
                  <Button
                    key={levelData.level}
                    onClick={() => updateLevel(index)}
                    disabled={!levelData.unlocked}
                    variant="contained"
                    sx={{
                      justifyContent: 'space-between',
                      backgroundColor: levelData.unlocked ? 'primary.main' : 'grey.500', // 解锁为主色，未解锁为灰色
                      color: levelData.unlocked ? 'text.primary' : 'text.disabled',
                      textTransform: 'none', // 保持按钮文本原样，不自动变大写
                    }}
                  >
                    {/* 关卡编号和音符 */}
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {`Level ${levelData.level}: ${levelData.notes}`}
                    </Typography>

                    {/* 根据解锁状态显示不同的内容 */}
                    {levelData.unlocked ? (
                      // 仅展示百分比，不再展示LockOpenIcon
                      <Typography>{`${levelData.best}%`}</Typography>
                    ) : (
                      // 未解锁的关卡，展示锁图标代替百分比
                      <LockIcon sx={{ color: 'text.disabled' }} />
                    )}
                  </Button>
                ))}
              </Box>
            )}

            <Button
              color='secondary'
              onClick={() => setShowDegreeSettings(false)}
              sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto' }}
            >
              <HomeIcon />
            </Button>
          </>
        ) : showStatistics ? (
          <>
            <h3>{t('settings.Statistics')}</h3>
            <Bar data={generateChartData()} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 2,
                cursor: 'pointer',
                padding: '6px 8px',
              }}
              onClick={() => setIsStatOpen(!isStatOpen)}
            >
              <Typography variant="body1" sx={{ textAlign: 'left' }}>
                {t('settings.Statistics')}
              </Typography>
              <Switch
                checked={isStatOpen}
                onChange={() => setIsStatOpen(!isStatOpen)}
                name="toggleStatistics"
                color="secondary"
              />
            </Box>
            <Button
              color="secondary"
              variant="contained"
              onClick={() => setIsDeleteConfirmOpen(true)}
              sx={{ marginTop: 2, marginLeft: 'auto', display: 'block' }}
            >
              {t('settings.DeleteData')}
            </Button>
            <Modal
              open={isDeleteConfirmOpen}
              onClose={() => setIsDeleteConfirmOpen(false)}
              aria-labelledby="delete-confirmation-title"
              aria-describedby="delete-confirmation-description"
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 300,
                  bgcolor: 'background.paper',
                  border: '2px solid #000',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                }}
              >
                <Typography id="delete-confirmation-title" variant="h6" component="h2" sx={{ color: (theme) => theme.palette.text.paper }}>
                  {t('settings.ConfirmDelete')}
                </Typography>
                <Typography id="delete-confirmation-description" sx={{ mt: 2, color: (theme) => theme.palette.text.paper }}>
                  {t('settings.DeleteConfirmation')}
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handleDeleteConfirm} color="secondary" variant="contained">
                    {t('settings.Delete')}
                  </Button>
                  <Button onClick={() => setIsDeleteConfirmOpen(false)} color="primary" variant="outlined">
                    {t('settings.Cancel')}
                  </Button>
                </Box>
              </Box>
            </Modal>
            <Button
              color='secondary'
              onClick={() => setShowStatistics(false)}
              sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto', marginTop: '1rem' }}
            >
              <HomeIcon />
            </Button>
          </>
        ) : (
          <>
            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>{t('settings.DroneVolume')}</label>
              <Slider
                color='secondary'
                value={droneVolume}
                valueLabelFormat={(value) => Math.round(value * 100)}
                onChange={(e, value) => setDroneVolume(value)}
                min={0}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
              />
            </div>
            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>{t('settings.PianoVolume')}</label>
              <Slider
                color='secondary'
                valueLabelFormat={(value) => Math.round(value * 100)}
                value={pianoVolume}
                onChange={(e, value) => setPianoVolume(value)}
                min={0}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
              />
            </div>

            <Button
              color='secondary'
              onClick={() => setShowVolumeSettings(false)}
              sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto' }}
            >
              <HomeIcon />
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
}

export default DegreeTrainerSettings;
