import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const IntroModal = ({ isOpen, handleClose }) => {
  const { t } = useTranslation('chordTrainer');

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="intro-modal-title"
      aria-describedby="intro-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: 2, // 添加圆角
        }}
      >
        <Typography
          id="intro-modal-title"
          variant="h6"
          component="h2"
          sx={{ color: (theme) => theme.palette.text.paper }}
        >
          {t('introModal.welcomeTitle')}
        </Typography>
        <Typography
          id="intro-modal-description"
          sx={{ mt: 2, color: (theme) => theme.palette.text.paper }}
        >
          {t('introModal.description')}
        </Typography>
        <Button onClick={handleClose} variant="contained" color="primary" sx={{ mt: 3 }}>
          {t('introModal.startPractice')}
        </Button>
      </Box>
    </Modal>
  );
};

export default IntroModal;
