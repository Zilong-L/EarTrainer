import React, { useState } from 'react';
import { List, ListItemButton, ListItemText, Typography, Switch, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChordType } from 'tonal';

const chordTypes = {
  Triads: ['Major', 'Minor', 'Diminished', 'Augmented'],
  Sevenths: ['Major 7th', 'Minor 7th', 'Dominant 7th', 'Half Diminished 7th', 'Diminished 7th'],
};

const ChordPracticeSettings = ({ chordPracticeSettings }) => {
  const chordTypesAll = ChordType.names();
  const { t } = useTranslation('chordGame'); // Use chordGame namespace for translations
  const { chordType, setChordType,proMode,setProMode } = chordPracticeSettings;

  const handleChordSelect = (chord) => () => {
    setChordType(chord);
  };

  const handleModeToggle = () => {
    setProMode(!proMode);
  };

  const listItemStyles = {
    pl: 4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <>
      <FormControlLabel
        control={<Switch checked={proMode} onChange={handleModeToggle} />}
        label={proMode ? t('settings.proMode') : t('settings.easyMode')}
        sx={{ pl: 2, mt: 2 }}
      />
      <List sx={{ color: (theme) => theme.palette.text.secondary }}>
        {proMode
          ? chordTypesAll.map((chord) => (
              <ListItemButton
                key={chord}
                sx={listItemStyles}
                onClick={handleChordSelect(chord)}
                selected={chordType === chord}
              >
                <ListItemText primary={chord} />
              </ListItemButton>
            ))
          : Object.entries(chordTypes).map(([category, chords]) => (
              <React.Fragment key={category}>
                {/* Category Title with Translation */}
                <Typography variant="subtitle1" sx={{ pl: 2, mt: 2 }}>
                  {t(`settings.chordCategories.${category}`)}
                </Typography>
                {chords.map((chord) => (
                  <ListItemButton
                    key={chord}
                    sx={listItemStyles}
                    onClick={handleChordSelect(chord)}
                    selected={chordType === chord}
                  >
                    <ListItemText primary={t(`settings.chords.${chord}`)} />
                  </ListItemButton>
                ))}
              </React.Fragment>
            ))}
      </List>
    </>
  );
};

export default ChordPracticeSettings;
