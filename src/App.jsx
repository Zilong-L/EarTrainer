import React, { useState } from 'react';
import { CssBaseline } from '@mui/material';
import WebRoutes from '@components/WebRoutes';
import './i18n'; // 确保 i18n 被引入到项目中
import './styles/themes.css';

function App() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    document.body.classList.toggle('dark', !isDark); // Toggle dark mode on the body
  };

  return (
      <React.Fragment>
      <CssBaseline /> {/* Normalize the stylesheet */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </button>
      <WebRoutes />
      </React.Fragment>
  );
}

export default App;
