import React, { useState } from 'react';
import { Toolbar,SwipeableDrawer, List, ListItemButton, ListItemText, Collapse, Paper, ListItem } from '@mui/material';
import { Link } from 'react-router-dom';

const apps = [{name: 'Ear Trainer', path: '/ear-trainer'}, {name: 'Chord Trainer', path: '/chord-trainer'}]
const Trainers = ['']
const Sidebar = ({ isOpen,setIsOpen }) => {

  const toggleDrawer = (open) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    console.log(open)

    setIsOpen(open);
  };

  return (
    <SwipeableDrawer
      open={isOpen}
      onClose={toggleDrawer(false)}
      onOpen={toggleDrawer(true)}
      anchor="right"
    >
      <List sx={{color: (theme)=>theme.palette.text.secondary}} >
        {apps.map((item)=> <ListItemButton key={item.name} LinkComponent={Link} to={item.path}><ListItemText primary={item.name}></ListItemText></ListItemButton>)}
      </List>

    </SwipeableDrawer>
  );
};

export default Sidebar;
