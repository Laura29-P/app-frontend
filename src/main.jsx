import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { initializeNative, isNative } from './native.js';
import PwaControls from './components/PwaControls.jsx';
import { AppStateProvider } from './context/AppStateContext.jsx';
import './index.css';

initializeNative().catch((error) => console.warn('No se pudo iniciar Android:', error));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppStateProvider>
      <App />
      {!isNative && <PwaControls />}
    </AppStateProvider>
  </React.StrictMode>
);
