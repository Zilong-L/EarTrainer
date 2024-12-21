import React, { useState, useEffect } from 'react';
import { Box, Button, Slider, Grid, Checkbox, Typography, Switch } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import * as Tone from 'tone';
import { useTranslation } from 'react-i18next';
import { getDroneInstance } from '@utils/ToneInstance';
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

function PracticeSettings({ settings, setCurrentPage }) {
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
    saveSettingsToLocalStorage,
    repeatWhenAdvance,
    setRepeatWhenAdvance,
  } = settings;

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const drone = getDroneInstance();
  let midiMin = drone.rootMin;
  let midiMax = drone.rootMax;

  const handleDegreeToggle = (index) => {
    const newNotes = [...currentNotes];
    newNotes[index].enable = !newNotes[index].enable;
    setCurrentNotes(newNotes);
  };

  const handleDeleteConfirm = () => {
    localStorage.removeItem('degreeTrainerRecords');
    setPracticeRecords({});
    setIsDeleteConfirmOpen(false);
  };

  const updateLevel = (index) => {
    setCurrentLevel(userProgress[index]);
    setCurrentPracticeRecords({ total: 0, correct: 0 });
  };

  const closeSettings = () => {
    setCurrentPage('home'); // Return to home page
    saveSettingsToLocalStorage(); // Save settings before closing
  };

  return (
    <>
      {/* Toggle Repeat Setting */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 2,
          cursor: 'pointer',
          padding: '6px 8px',
        }}
        onClick={() => setRepeatWhenAdvance(!repeatWhenAdvance)}
      >
        <Typography variant="body1" sx={{ textAlign: 'left' }}>
          {t('settings.repeatWhenAdvance')}
        </Typography>
        <Switch
          checked={repeatWhenAdvance}
          onChange={() => setRepeatWhenAdvance(!repeatWhenAdvance)}
          name="repeatWhenAdvance"
          color="secondary"
        />
      </Box>

      {/* Note Range Slider */}
      <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
        <label id="note-range-slider" style={{ fontSize: '1.1rem' }}>
          {t('settings.NoteRange')}
        </label>
        <Slider
          color="secondary"
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

      {/* Root Note Slider */}
      <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
        <label style={{ fontSize: '1.1rem' }}>{t('settings.RootNote')}</label>
        <Slider
          color="secondary"
          valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()}
          value={rootNote}
          onChange={(e, value) => setRootNote(value)}
          min={midiMin}
          max={midiMax}
          valueLabelDisplay="auto"
          sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
        />
      </div>

      {/* BPM Slider */}
      <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
        <label style={{ fontSize: '1.1rem' }}>{t('settings.BPM')}</label>
        <Slider
          color="secondary"
          value={bpm}
          onChange={(e, value) => setBpm(value)}
          min={10}
          max={200}
          valueLabelDisplay="auto"
          sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
        />
      </div>

      {/* Degree Selection (Free Mode Only) */}
      {mode === 'free' && (
        <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
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
                    color="secondary"
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
      )}

      {/* Challenge Mode Level Selection */}
      {mode === 'challenge' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {userProgress.map((levelData, index) => (
            <Button
              key={levelData.level}
              onClick={() => updateLevel(index)}
              disabled={!levelData.unlocked}
              variant="contained"
              sx={{
                justifyContent: 'space-between',
                backgroundColor: levelData.unlocked ? 'primary.main' : 'grey.500',
                color: levelData.unlocked ? 'text.primary' : 'text.disabled',
                textTransform: 'none',
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>
                {`Level ${levelData.level}: ${levelData.notes}`}
              </Typography>
              {levelData.unlocked ? (
                <Typography>{`${levelData.best}%`}</Typography>
              ) : (
                <LockIcon sx={{ color: 'text.disabled' }} />
              )}
            </Button>
          ))}
        </Box>
      )}

      {/* Return to Home */}
      <Button
        color="secondary"
        onClick={closeSettings}
        sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto' }}
      >
        <HomeIcon />
      </Button>
    </>
  );
}

export default PracticeSettings;
