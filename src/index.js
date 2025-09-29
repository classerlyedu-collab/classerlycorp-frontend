import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ContextProvider } from './context/ContextProvider';
import { App as AntApp } from 'antd';
import MasterContainer from './config';

// Ensure localStorage 'user' is a valid JSON object to avoid runtime errors in legacy code paths
(function ensureUserInStorage() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) {
      localStorage.setItem('user', '{}');
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object') {
      localStorage.setItem('user', '{}');
    }
  } catch {
    localStorage.setItem('user', '{}');
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AntApp>
      <MasterContainer>
        <ContextProvider>
          <App />
        </ContextProvider>
      </MasterContainer>
    </AntApp>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
