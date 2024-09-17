import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, Slider, Container,Checkbox, Typography, Grid ,Switch } from '@mui/material';
import { getPianoInstance, getDroneInstance } from '@utils/ToneInstance';
import HomeIcon from '@mui/icons-material/Home';
import * as Tone from 'tone';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DegreeTrainerSettings({
  isSettingsOpen,
  setIsSettingsOpen,
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
  playNote,
  isStatOpen,
  setIsStatOpen,
  practiceRecords,
  setPracticeRecords
}) {
  const [showDegreeSettings, setShowDegreeSettings] = useState(false);
  const [showVolumeSettings, setShowVolumeSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const drone = getDroneInstance();
  const piano = getPianoInstance();
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

  function saveSettingsToLocalStorage() {
    const settings = {
      bpm,
      droneVolume,
      pianoVolume,
      rootNote,
      range,
      currentNotes,
    };
    localStorage.setItem('degreeTrainerSettings', JSON.stringify(settings));
  }



  return (
    <Modal open={isSettingsOpen} onClose={closeSettings} sx={{color:(theme)=>theme.palette.text.primary}}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 500,
          bgcolor: (theme)=>theme.palette.background.modal,
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          height: '80vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant='h4' sx={{textAlign:'center'}}>设置</Typography>

        {!showDegreeSettings && !showVolumeSettings && !showStatistics ? (
          <>
            <Container sx={{marginTop:'3rem'}}>
              <Button  sx={{  color:'text.primary' , display: 'block', fontSize: '1.5rem', width: '100%', textAlign: 'left', marginBottom: '1rem' }}  onClick={() => setShowDegreeSettings(true)}>
                练习设置
              </Button>
              <Button   sx={{ color:'text.primary' ,  display: 'block', fontSize: '1.5rem', width: '100%', textAlign: 'left', marginBottom: '1rem' }}  onClick={() => setShowStatistics(true)}>
                统计
              </Button>
              <Button   sx={{ color:'text.primary' ,  display: 'block', fontSize: '1.5rem', width: '100%', textAlign: 'left' }}  onClick={() => setShowVolumeSettings(true)}>
                音量设置
              </Button>
            </Container>
          </>
        ) : showDegreeSettings ? (
          <>
            
           

            
            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label id="note-range-slider" style={{ fontSize: '1.1rem' }}>
                Note Range
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
              <label style={{ fontSize: '1.1rem' }}>Root Note</label>
              <Slider color='secondary' valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()} value={rootNote} onChange={(e, value) => setRootNote(value)} min={midiMin} max={midiMax} valueLabelDisplay="auto" sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }} />
            </div>
            <div style={{ padding: '6px 8px', }}>
              <label style={{ fontSize: '1.1rem' }}>BPM: </label>
              <Slider color='secondary' value={bpm} onChange={(e, value) => setBpm(value)} min={40} max={200} valueLabelDisplay="auto" sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }} />
            </div>
            <div style={{ padding: '6px 8px',fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>选择练习级数</label>
              <Grid container spacing={1}sx={{marginTop:'4px',paddingLeft:0}}>
                {currentNotes.map((note, index) => (
                  <Grid item xs={4} key={note.name} sx={{padding:0}}>
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
            </div>
            <Button
              color='secondary'
              onClick={() => setShowDegreeSettings(false)}
              sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto' }}
            >
              <HomeIcon/>
            </Button>
          </>
        ) : showStatistics ? (
          <>
            <h3 >音程正确率统计</h3>
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
                统计
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
              删除本地统计数据
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
                <Typography id="delete-confirmation-title" variant="h6" component="h2">
                  确认删除
                </Typography>
                <Typography id="delete-confirmation-description" sx={{ mt: 2 }}>
                  确定要删除所有本地统计数据吗？此操作不可恢复。
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handleDeleteConfirm} color="secondary" variant="contained">
                    删除
                  </Button>
                  <Button onClick={() => setIsDeleteConfirmOpen(false)} color="primary" variant="outlined">
                    取消
                  </Button>
                </Box>
              </Box>
            </Modal>
            <Button
              color='secondary'
              onClick={() => setShowStatistics(false)}
              sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto',marginTop:'1rem' }}
            >
              <HomeIcon/>
            </Button>
          </>
        ) : (
          <>

            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>Drone Volume</label>
              <Slider color='secondary' value={droneVolume} valueLabelFormat={(value) => Math.round(value * 100)} onChange={(e, value) => setDroneVolume(value)} min={0} max={1} step={0.01} valueLabelDisplay="auto" sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }} />
            </div>
            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>Piano Volume </label>
              <Slider color='secondary' valueLabelFormat={(value) => Math.round(value * 100)} value={pianoVolume} onChange={(e, value) => setPianoVolume(value)} min={0} max={1} step={0.01} valueLabelDisplay="auto" sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }} />
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

export default DegreeTrainerSettings;
