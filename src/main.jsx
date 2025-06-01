import React from 'react'
import WebRoutes from './pages/WebRoutes';
import ReactDOM from 'react-dom/client'
import './i18n'; // 确保 i18n 被引入到项目中
import './styles/themes.css';
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.Fragment>
        <WebRoutes />
    </React.Fragment>
)





