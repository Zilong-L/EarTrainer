import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, Slider, Checkbox, Typography, Grid, Switch } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import * as Tone from 'tone';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
function SequenceTrainerSettings({settings,
  isSettingsOpen,
  setIsSettingsOpen,
  playSequence,
}) {
  const {
    bpm,
    currentNotes,
    practiceRecords,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    sequenceLength,
    isStatOpen, 
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    setCurrentNotes,
    setPracticeRecords,
    setSequenceLength,
    saveSettings,
    setIsStatOpen
  } = settings;
  const { t } = useTranslation('sequenceTrainer');
  const [showSequenceSettings, setShowSequenceSettings] = useState(false);
  const [showVolumeSettings, setShowVolumeSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleNoteToggle = (index) => {
    const newNotes = [...currentNotes];
    newNotes[index].enable = !newNotes[index].enable;
    setCurrentNotes(newNotes);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setShowSequenceSettings(false);
    setShowVolumeSettings(false);
    setShowStatistics(false);
    setIsDeleteConfirmOpen(false);
    saveSettings();
    playSequence();
  };

  const calculateAccuracy = (record) => {
    return record.total > 0 ? (record.correct / record.total) * 100 : 0;
  };

  const generateChartData = () => {
    const labels = Object.keys(practiceRecords);
    const data = labels.map((degree) => calculateAccuracy(practiceRecords[degree]));
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
    localStorage.removeItem('sequenceTrainerRecords');
    setPracticeRecords({});
    setIsDeleteConfirmOpen(false);
  };


  return (
    <Modal open={isSettingsOpen} onClose={closeSettings}>
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
        <h2 style={{ fontSize: '2rem', textAlign: 'center' }}>{t('settings.Settings')}</h2>

        {!showSequenceSettings && !showVolumeSettings && !showStatistics ? (
          <>
            <Button 
              sx={{ color: (theme) => theme.palette.text.primary, display: 'block', fontSize: '1.5rem', width: '100%', textAlign: 'left', marginBottom: '1rem' }} 
              color='secondary' 
              onClick={() => setShowSequenceSettings(true)}
            >
              {t('settings.PracticeSettings')}
            </Button>
            <Button 
              sx={{ color: (theme) => theme.palette.text.primary, display: 'block', fontSize: '1.5rem', width: '100%', textAlign: 'left', marginBottom: '1rem' }} 
              color='secondary' 
              onClick={() => setShowStatistics(true)}
            >
              {t('settings.Statistics')}
            </Button>
            <Button 
              sx={{ color: (theme) => theme.palette.text.primary, display: 'block', fontSize: '1.5rem', width: '100%', textAlign: 'left' }} 
              color='secondary' 
              onClick={() => setShowVolumeSettings(true)}
            >
              {t('settings.VolumeSettings')}
            </Button>
          </>
        ) : showSequenceSettings ? (
          <>
            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label id="note-range-slider" style={{ fontSize: '1.1rem' }}>
                {t('labels.noteRange')}
              </label>
              <Slider
                color='secondary'
                value={range}
                valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()}
                onChange={(_, newValue) => {
                  if (Math.abs(newValue[1] - newValue[0]) >= 11) {
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
              <label style={{ fontSize: '1.1rem' }}>{t('labels.rootNote')}</label>
              <Slider 
                color='secondary' 
                valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()} 
                value={rootNote} 
                onChange={(e, value) => setRootNote(value)} 
                min={Tone.Frequency('C2').toMidi()} 
                max={Tone.Frequency('C6').toMidi()} 
                valueLabelDisplay="auto" 
                sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }} 
              />
            </div>
            <div style={{ padding: '6px 8px' }}>
              <label style={{ fontSize: '1.1rem' }}>{t('labels.bpm')}: </label>
              <Slider 
                color='secondary' 
                value={bpm} 
                onChange={(e, value) => setBpm(value)} 
                min={40} 
                max={200} 
                valueLabelDisplay="auto" 
                sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }} 
              />
            </div>
            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>{t('labels.sequenceLength')}</label>
              <Slider
                color='secondary'
                value={sequenceLength}
                onChange={(e, value) => setSequenceLength(value)}
                min={1}
                max={10}
                valueLabelDisplay="auto"
                sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
              />
              <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
                <label style={{ fontSize: '1.1rem' }}>{t('labels.selectDegrees')}</label>
                <Grid container spacing={1} sx={{ marginTop:'4px', paddingLeft:0 }}>
                  {currentNotes.map((note, index) => (
                    <Grid item xs={4} key={note.name} sx={{ padding:0 }}>
                      <Box
                        onClick={() => handleNoteToggle(index)}
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
              </div>
            </div>
            <Button
              color='secondary'
              onClick={() => setShowSequenceSettings(false)}
              sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto' }}
            >
              <HomeIcon/>
            </Button>
          </>
        ) : showStatistics ? (
          <>
            <h3>{t('sequenceTrainer.accuracyStatistics')}</h3>
            <Bar data={generateChartData()} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 2,
                cursor: 'pointer',
                padding: '6px 8px',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => setIsStatOpen(!isStatOpen)}
            >
              <Typography variant="body1" sx={{ textAlign: 'left' }}>
                {t('sequenceTrainer.toggleStatistics')}
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
              {t('sequenceTrainer.deleteStatistics')}
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
                <Typography id="delete-confirmation-title" variant="h6" component="h2" sx={{color:(theme)=>theme.palette.text.paper}}>
                  {t('sequenceTrainer.confirmDeleteTitle')}
                </Typography>
                <Typography id="delete-confirmation-description" sx={{ mt: 2 ,color:(theme)=>theme.palette.text.paper}}>
                  {t('sequenceTrainer.confirmDeleteDescription')}
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handleDeleteConfirm} color="secondary" variant="contained">
                    {t('sequenceTrainer.confirmDelete')}
                  </Button>
                  <Button onClick={() => setIsDeleteConfirmOpen(false)} color="primary" variant="outlined">
                    {t('sequenceTrainer.cancelDelete')}
                  </Button>
                </Box>
              </Box>
            </Modal>
            <Button
              color='secondary'
              onClick={() => setShowStatistics(false)}
              sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto', marginTop:'1rem' }}
            >
              <HomeIcon/>
            </Button>
          </>
        ) : (
          <>
            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>{t('labels.droneVolume')}</label>
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
              <label style={{ fontSize: '1.1rem' }}>{t('labels.pianoVolume')}</label>
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
              <HomeIcon/>
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
}
export default SequenceTrainerSettings;