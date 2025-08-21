import React from 'react';
import ReactDOM from 'react-dom/client';
import WebRoutes from './pages/WebRoutes.tsx';
import './i18n'; // 确保 i18n 被引入到项目中
import './styles/themes.css';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
    <React.Fragment>
        <WebRoutes />
    </React.Fragment>
);
