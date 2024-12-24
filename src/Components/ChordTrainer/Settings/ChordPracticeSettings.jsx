import React from 'react';
import { List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const chordTypes = {
  Triads: ['Major', 'Minor', 'Diminished', 'Augmented'],
  Sevenths: ['Major 7th', 'Minor 7th', 'Dominant 7th', 'Half Diminished 7th', 'Diminished 7th'],
};

const ChordPracticeSettings = ({settings}) => {
  const { t } = useTranslation('chordGame'); // Use chordGame namespace for translations
  const { chordType, setChordType } = settings;
  const handleChordSelect = (chord) => () => {
    setChordType(chord);
  };

  const listItemStyles = {
    pl: 4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <List sx={{ color: (theme) => theme.palette.text.secondary }}>
      {Object.entries(chordTypes).map(([category, chords]) => (
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
  );
};

export default ChordPracticeSettings;
