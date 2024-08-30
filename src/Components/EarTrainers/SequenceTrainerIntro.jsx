import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const IntroModal = ({ isOpen, handleClose }) => {
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
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
          欢迎使用音程序列训练器
        </Typography>
        <Typography id="intro-modal-description" sx={{ mt: 2, color: (theme) => theme.palette.text.paper }}>
          您将会听到一个低音作为主音，随后会播放一系列音符。您需要根据听到的音符选择相应的音程级数。
          在右上角的设置中，您可以调节音量和练习内容。
        </Typography>
        <Button onClick={handleClose} variant="contained" color="primary" sx={{ mt: 3 }}>
          开始练习
        </Button>
      </Box>
    </Modal>
  );
};

export default IntroModal;