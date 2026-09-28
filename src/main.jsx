import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import PwaControls from './components/PwaControls.jsx';
import { AppStateProvider } from './context/AppStateContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppStateProvider>
      <App />
      <PwaControls />
    </AppStateProvider>
  </React.StrictMode>
);
