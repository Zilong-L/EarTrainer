import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, Button, Typography, Switch, Modal } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

function Statistics({ settings,setShowStatistics }) {
  const { practiceRecords, isStatOpen,  setPracticeRecords,setIsStatOpen } = settings;
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
          label: '正确率 (%)',
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
      <h3>音程正确率统计</h3>
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
        sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto', marginTop: '1rem' }}
      >
        <HomeIcon/>
      </Button>
    </>
  );
}

export default Statistics;