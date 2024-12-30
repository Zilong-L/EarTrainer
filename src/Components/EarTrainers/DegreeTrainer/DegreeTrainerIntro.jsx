import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const IntroModal = ({ isOpen, handleClose ,mode,setMode}) => {
  const { t } = useTranslation('degreeTrainer');

  const handleModeChange = (selectedMode) => {
    setMode(selectedMode);
  };

  return (
    <Modal
      open={isOpen}

      aria-labelledby="intro-modal-title"
      aria-describedby="intro-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        borderRadius: 2 // 添加圆角
      }}>
        <Typography id="intro-modal-title" variant="h6" component="h2" sx={{ color: (theme) => theme.palette.text.paper }}>
          {t('intro.welcomeMessage')}
        </Typography>
        <Typography id="intro-modal-description" sx={{ mt: 2, color: (theme) => theme.palette.text.paper }}>
          {mode=='free'?t('intro.introDescription'):t('intro.challengeIntroDescription')}
        </Typography>

        {/* 模式选择按钮 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
          <Button
            onClick={() => handleModeChange('free')}
            variant={mode === 'free' ? "contained" : "outlined"}
            sx={{ mr: 2 }} // 右边添加间距
          >
            {t('intro.freeMode')}
          </Button>
          <Button
            onClick={() => handleModeChange('challenge')}
            variant={mode === 'challenge' ? "contained" : "outlined"}
          >
            {t('intro.challengeMode')}
          </Button>
        </Box>

        {/* 开始练习按钮 */}
        <Button
          onClick={() => handleClose(mode)} // 传递所选模式并关闭弹窗
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
        >
          {t('intro.startPractice')}
        </Button>
      </Box>
    </Modal>
  );
};

export default IntroModal;
