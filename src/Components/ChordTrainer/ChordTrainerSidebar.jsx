import React, { useState } from 'react';
import { Toolbar,SwipeableDrawer, List, ListItemButton, ListItemText, Collapse, } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const chordTypes = {
  Triads: ['Major', 'Minor', 'Diminished'],
  Sevenths: ['Major 7th', 'Minor 7th', 'Dominant 7th', 'Half Diminished 7th', 'Diminished 7th']
};

const ChordTrainerSidebar = ({ chordType, setChordType,isOpen,setIsOpen }) => {
  const [open, setOpen] = useState({
    Triads: true,
    Sevenths: true
  });
  const toggleDrawer = (chordtype,open) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    console.log(open)
    if(chordtype){
      setChordType(chordtype)
    }
    setIsOpen(open);
  };
  const handleClick = (category) => {
    setOpen(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  console.log(chordType)
  return (
    <SwipeableDrawer
      anchor="left"
      open={isOpen}
      onClose={toggleDrawer(null,false)}
      onOpen={toggleDrawer(null,true)}
    >
   <Toolbar/>
      <List sx={{color: (theme)=>theme.palette.text.secondary}} >
        {Object.entries(chordTypes).map(([category, chords]) => (
          <React.Fragment key={category}>
            <ListItemButton onClick={() => handleClick(category)}>
              <ListItemText primary={category} sx={{width:'200px'}} />
              {open[category] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open[category]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {chords.map(chord => (
                  <ListItemButton 
                    key={chord} 
                    sx={{ 
                      pl: 4, 
                      whiteSpace: 'nowrap', // Prevents wrapping
                      overflow: 'hidden',  // Hides overflow
                      textOverflow: 'ellipsis',// Adds an ellipsis if the text overflows
                      '&.Mui-selected': {
                         bgcolor: (theme)=>theme.palette.action.selected , // Darker grey for selected item
                        '& .MuiListItemText-primary': {
                          fontWeight: 'bold',
                        },
                        '&.Mui-selected:hover':{
                          bgcolor: (theme)=>theme.palette.action.selectedHover ,
                        }
                      }
                    }} 
                    
                    onClick={toggleDrawer(chord, false)}
                    selected={chordType === chord}
                  >
                    <ListItemText primary={chord} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>

    </SwipeableDrawer>
  );
};

export default ChordTrainerSidebar;
