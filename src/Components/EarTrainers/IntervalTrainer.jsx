import React, { useState } from 'react';
import { CssBaseline, Grid, Container, Paper, Box, Button, Typography, AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import Sidebar from '@components/Sidebar';
import MenuIcon from '@mui/icons-material/Menu';
const apps = [{name: 'Ear Trainer', path: '/ear-trainer'}, {name: 'Chord Trainer', path: '/chord-trainer'}]
const trainers = [{name:'Degree Trainer',path:'/ear-trainer/degree-trainer'},{name:'Interval Trainer',path:'/ear-trainer/interval-trainer'},{name:'Scale Trainer',path:'/ear-trainer/scale-trainer'},{name:'Progression Trainer',path:'/progression-trainer'}]
const EarTrainer = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar is visible by default

  return (
    <>
      <AppBar position="static" sx={{boxShadow: 0,
      }}>
        <Toolbar sx={{ color: (theme) => theme.palette.text.primary, }}>

          <Typography variant="h6" sx={{ marginLeft: '15px', flexGrow: 1 }} component={Link} to='/ear-trainer'>
            Ear Trainer
          </Typography>

          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            variant="contained"
            color="primary"  // Make the button stand out with a primary color
            sx={{ boxShadow: 'none', '@media (min-width:600px)': { display: 'none' } }}
          >
            <MenuIcon />
          </Button>

          {apps.map((item)=>(<Button variant="contained" key={item.name}component={Link} to={item.path} sx={{
            display: 'none',
            '@media (min-width:600px)': { display: 'block', boxShadow: 'none', textTransform: 'none' }
          }}>{item.name}</Button>))
          }
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CssBaseline />
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <Container maxWidth="lg" sx={{paddingTop:'20px',
          '@media (min-width:600px)': {paddingTop:'4rem'}
        }}>
            <Grid container spacing={2}>
              {trainers.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.name}>
                  <Button variant="contained" fullWidth LinkComponent={Link} sx={{ height:'100px',textTransform: 'none' }} to={item.path}>{item.name}</Button>
                </Grid>
              ))}
            </Grid>
        </Container>
      </Box>
    </>
  );
};

export default EarTrainer;
