import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // 분리된 CSS 파일을 import 합니다.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);