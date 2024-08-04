import React, { useState } from 'react';
import { Toolbar,Drawer, List, ListItemButton, ListItemText, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const chordTypes = {
  Triads: ['Major', 'Minor', 'Diminished'],
  Sevenths: ['Major 7th', 'Minor 7th', 'Dominant 7th', 'Half Diminished 7th', 'Diminished 7th']
};

const ChordTrainerSidebar = ({ chordType, setChordType, isOpen }) => {
  const [open, setOpen] = useState({
    Triads: true,
    Sevenths: true
  });

  const handleClick = (category) => {
    setOpen(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  console.log(chordType)
  return (
    <Drawer
    variant="permanent"
    anchor="left"

    sx={{
      width: isOpen ? 240 : 0,
      flexShrink: 0,
      transition: 'width 300ms ease',
      '& .MuiDrawer-paper': {
        width: isOpen ? 240 : 0,
        overflowX: 'overflow',
        bgcolor: '#f2ecee',
        transition: 'width 300ms ease'
      }
    }}
  >
      <List sx={{marginTop:'30px'}}>
        <Toolbar/>
        {Object.entries(chordTypes).map(([category, chords]) => (
          <React.Fragment key={category}>
            <ListItemButton onClick={() => handleClick(category)}>
              <ListItemText primary={category} />
              {isOpen?open[category] ? <ExpandLess /> : <ExpandMore />:<></>}
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
                      bgcolor: chordType === chord ? '#d3d3d3' : 'transparent',
                      '&.Mui-selected': {
                        bgcolor: '#dddddd', // Darker grey for selected item
                        '& .MuiListItemText-primary': {
                          fontWeight: 'bold',
                          color: '#000000'
                        }
                      }
                    }} 
                    
                    onClick={() => setChordType(chord)}
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
    </Drawer>
  );
};

export default ChordTrainerSidebar;
