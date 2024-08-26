import React from 'react';
import { Modal, Box, Button, Slider } from '@mui/material';
import { getPianoInstance, getDroneInstance } from '@components/ToneInstance';
import * as Tone from 'tone';
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
  setRange
}) {
  const drone = getDroneInstance();
  const piano = getPianoInstance();
  let midiMin = drone.rootMin
  let midiMax = drone.rootMax
  return (
    <Modal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
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
        <h2>Settings</h2>
        <div>
          <label>BPM: </label>
          <Slider color='secondary' value={bpm} onChange={(e, value) => setBpm(value)} min={40} max={200} valueLabelDisplay="auto" />
        </div>
        <div>
          <label id="note-range-slider" >
            Note Range
          </label>
          <Slider
            color='secondary'
            value={range}
            onChange={(_, newValue) => {
              console.log(newValue)
              setRange(newValue);
            }}
            valueLabelDisplay="auto"
          />
        </div>
        <div>
          <label>Drone Volume</label>
          <Slider color='secondary' value={droneVolume} valueLabelFormat={(value) => Math.round(value * 100)} onChange={(e, value) => setDroneVolume(value)} min={0} max={1} step={0.01} valueLabelDisplay="auto" />
        </div>
        <div>
          <label>Piano Volume </label>
          <Slider color='secondary' valueLabelFormat={(value) => Math.round(value * 100)} value={pianoVolume} onChange={(e, value) => setPianoVolume(value)} min={0} max={1} step={0.01} valueLabelDisplay="auto" />
        </div>
        <div>
          <label>Root Note</label>
          <Slider color='secondary' valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()} value={rootNote} onChange={(e, value) => setRootNote(value)} min={midiMin} max={midiMax} valueLabelDisplay="auto" />
        </div>
        <Button onClick={() => setIsSettingsOpen(false)}>Close</Button>
      </Box>
    </Modal>
  );
}

export default DegreeTrainerSettings;
