import React from 'react';
import { CssBaseline, Container,Box } from '@mui/material';
import { MIDIProvider } from '@react-midi/hooks';
import LayoutWrapper from './LayoutWrapper';
function App() {

  return (
    <MIDIProvider> {/* Add MIDIProvider to manage MIDI contexts */}
      <React.Fragment>
        <CssBaseline />  {/* Normalize the stylesheet */}
            <LayoutWrapper/>
      </React.Fragment>
    </MIDIProvider>
  );
}

export default App;
