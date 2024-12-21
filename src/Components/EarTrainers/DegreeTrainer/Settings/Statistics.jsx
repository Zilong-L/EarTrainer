import React, { useState } from 'react';
import { Box, Button, Typography, Modal } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import HomeIcon from '@mui/icons-material/Home';

function Statistics({ settings, setCurrentPage }) {
  const { t } = useTranslation('degreeTrainer');
  const { practiceRecords, setPracticeRecords } = settings;
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
          label: t('settings.Statistics'),
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

  return (
    <>
      <Typography variant="h6">{t('settings.Statistics')}</Typography>
      <Bar data={generateChartData()} />
      <Button
        color="secondary"
        variant="contained"
        onClick={() => setIsDeleteConfirmOpen(true)}
        sx={{ marginTop: 2 }}
      >
        {t('settings.DeleteData')}
      </Button>
      <Modal
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6">{t('settings.ConfirmDelete')}</Typography>
          <Typography sx={{ mt: 2 }}>{t('settings.DeleteConfirmation')}</Typography>
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
        color="secondary"
        onClick={() => setCurrentPage('home')}
        sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto', marginTop: '1rem' }}
      >
        <HomeIcon />
      </Button>
    </>
  );
}

export default Statistics;
