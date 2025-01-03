import React from 'react';
import { CssBaseline,GlobalStyles   } from '@mui/material';
import WebRoutes from '@components/WebRoutes'
import './i18n'; // 确保 i18n 被引入到项目中
function App() {

  return (
      <React.Fragment>
        
        <CssBaseline />  {/* Normalize the stylesheet */}
            <WebRoutes/>
      </React.Fragment>
  );
}

export default App;
