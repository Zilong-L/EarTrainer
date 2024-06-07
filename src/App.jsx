import React from 'react';
import { CssBaseline, Container,Box } from '@mui/material';
import LayoutWrapper from '@components/LayoutWrapper';
function App() {

  return (
      <React.Fragment>
        <CssBaseline />  {/* Normalize the stylesheet */}
            <LayoutWrapper/>
      </React.Fragment>
  );
}

export default App;
