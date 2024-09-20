import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, Button, Typography, Switch, Modal } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';

function Statistics({ settings, setShowStatistics }) {
  const { t } = useTranslation('chordTrainer');
  const { practiceRecords, isStatOpen, setPracticeRecords, setIsStatOpen } = settings;
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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
          label: t('statistics.chartLabel'), // Add 'chartLabel' to your JSON files
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
  };

  const handleDeleteConfirm = () => {
    localStorage.removeItem('ChordColorTrainerRecords');
    setPracticeRecords({});
    setIsDeleteConfirmOpen(false);
  };

  return (
    <>
      <Typography variant="h5">{t('statistics.chordAccuracy')}</Typography>
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
          {t('statistics.statistics')}
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
        {t('statistics.deleteLocalData')}
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
            {t('statistics.confirmDeleteTitle')}
          </Typography>
          <Typography id="delete-confirmation-description" sx={{ mt: 2 ,color:(theme)=>theme.palette.text.paper}}>
            {t('statistics.confirmDeleteDescription')}
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleDeleteConfirm} color="secondary" variant="contained">
              {t('statistics.delete')}
            </Button>
            <Button
              onClick={() => setIsDeleteConfirmOpen(false)}
              color="primary"
              variant="outlined"
            >
              {t('statistics.cancel')}
            </Button>
          </Box>
        </Box>
      </Modal>
      <Button
        color="secondary"
        onClick={() => setShowStatistics(false)}
        sx={{
          display: 'flex',
          justifyContent: 'flex-center',
          fontSize: '1.2rem',
          marginLeft: 'auto',
          marginTop: '1rem',
        }}
        aria-label={t('buttons.home')}
      >
        <HomeIcon />
      </Button>
    </>
  );
}

export default Statistics;
