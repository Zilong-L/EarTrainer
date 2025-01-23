import React, { useState,useRef ,useEffect} from 'react';
import { CssBaseline } from '@mui/material';
import WebRoutes from '@components/WebRoutes';
import './i18n'; // 确保 i18n 被引入到项目中
import './styles/themes.css';

function App() {
  const canvasRef = useRef(null);

  
  


  return (
      <React.Fragment>
      <CssBaseline /> {/* Normalize the stylesheet */}

      
      <WebRoutes />
      </React.Fragment>
  );
}

export default App;
