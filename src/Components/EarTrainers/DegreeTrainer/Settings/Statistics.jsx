import React, { useState } from 'react';
import { Box, Button, Typography, Modal } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import HomeIcon from '@mui/icons-material/Home';
import {settingsElementStyles} from '@ui/Styles';
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
      <Box
        sx={{
          position: 'sticky', // Keeps the banner fixed at the top during scrolling
          top: 0,
          left: 0,
          width: '100%', // Full width of the screen
          backdropFilter: 'blur(20px)', // Blur effect for the banner
          zIndex: 1000, // Ensure it stays above other content
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Center the text
          padding: '16px 16px',
        }}
      >
        {/* Home Button */}
        <Button
          color="secondary"
          onClick={() => setCurrentPage('home')}
          sx={{
            position: 'absolute', // Position it without affecting layout
            left: '10px', // Offset from the left edge
            top: '50%', // Vertically align center
            transform: 'translateY(-50%)', // Adjust for the button's height
            fontSize: '1.2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <HomeIcon />
        </Button>

        {/* Centered Text */}
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          {t('settings.Statistics')}
        </Typography>
      </Box>
      {/* Quality Selector */}
      <Box sx={{ padding: '22px 32px' }}>
        <Bar data={generateChartData()} />
        <Box sx={{ ...settingsElementStyles, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => setIsDeleteConfirmOpen(true)}
            sx={{ marginTop: 2 }}
          >
            {t('settings.DeleteData')}
          </Button>
        </Box>
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
      </Box>
    </>
  );
}

export default Statistics;
