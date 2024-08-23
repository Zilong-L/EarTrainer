import React from 'react';
import { CssBaseline,  } from '@mui/material';
import LayoutWrapper from '@components/LayoutWrapper'
function App() {

  return (
      <React.Fragment>
        <CssBaseline />  {/* Normalize the stylesheet */}
            <LayoutWrapper/>
      </React.Fragment>
  );
}

export default App;
