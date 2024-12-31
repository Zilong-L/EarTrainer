import React from 'react';
import { Box, Grid, Button, Typography } from '@mui/material';
import * as Tone from 'tone';
import { useTranslation } from 'react-i18next';
import ReplayIcon from '@mui/icons-material/Replay';
import { isCorrect } from '@utils/GameLogics';
const ChallengeMode = ({ChallengeTrainerSettings}) => {
  const { 
    currentNote,
    disabledNotes,
    filteredNotes,
    isAdvance,
    setActiveNote,
    playNote,
    gameState,
    setGameState,
    rootNote,
    currentPracticeRecords,
    currentLevel
  } = ChallengeTrainerSettings;
  const { t } = useTranslation('degreeTrainer');

  const renderRecords = () => {
    const totalResults = currentPracticeRecords

    return (
      <>
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>{t('home.level')}: {currentLevel.level}</Typography>
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>{t('home.totalAttempts')} {totalResults.total} / {currentLevel.minTests}</Typography>
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>{t('home.correctCount')} {totalResults.correct}</Typography>
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>
          {Math.round((totalResults.correct / totalResults.total).toFixed(2) * 100) >= 90 ? '⭐⭐⭐' :
           Math.round((totalResults.correct / totalResults.total).toFixed(2) * 100) >= 80 ? '⭐⭐' :
           Math.round((totalResults.correct / totalResults.total).toFixed(2) * 100) >= 70 ? '⭐' : ''}
        </Typography>
      </>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', marginBottom: '2rem' }}>
      {renderRecords()}
      <Box sx={{ flexGrow: 1 }} />
      <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
        {filteredNotes.map((note) => {
          const noteName = Tone.Frequency(Tone.Frequency(rootNote).toMidi() + note.distance, 'midi').toNote();
          const isCorrectAnswer = isCorrect(noteName,currentNote)
          console.log('noteName',noteName.slice(0, -1))
          return (
            <Grid item xs={4} key={note.name}>
              <Button
                variant="contained"
                onClick={() => setActiveNote(noteName)}
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontSize: '1.5rem',
                  height: '4rem',
                  background: disabledNotes.some(disabledNote => noteName.slice(0, -1) === disabledNote.slice(0, -1)) ?
                    (theme) => theme.palette.action.disabled :
                    isCorrectAnswer && isAdvance ?
                      (theme) => theme.palette.success.main :
                      'default',
                  color: isCorrectAnswer && isAdvance ?
                    (theme) => theme.palette.success.contrastText :
                    'default',
                  '&:hover': {
                    background: disabledNotes.some(
                      (disabledNote) => noteName.slice(0, -1) === disabledNote.slice(0, -1)
                    )
                      ? (theme) => theme.palette.action.disabled
                      : isCorrectAnswer && isAdvance
                        ? (theme) => theme.palette.success.main
                        : 'default',
                  },
                }}
                data-note={noteName.slice(0, -1)}
              >
                {note.name}
              </Button>
            </Grid>
          );
        })}
      </Grid>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          if (gameState === 'end') {
            setGameState('start');
          } else {
            playNote(currentNote);
          }
        }}
        fullWidth
        sx={{
          textTransform: 'none',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 'auto',
        }}
      >
        {gameState === 'end' ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
          </svg>
        ) : (
          <ReplayIcon sx={{ fontSize: '3rem' }} />
        )}
      </Button>
    </Box>
  );
};

export default ChallengeMode;
