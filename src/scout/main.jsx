import React from 'react';
import ReactDOM from 'react-dom/client';
import ScoutRouter from './router/ScoutRouter';
import './assets/css/scout-tokens.css';

ReactDOM.createRoot(document.getElementById('scout-root')).render(
  <React.StrictMode>
    <ScoutRouter />
  </React.StrictMode>
);
