import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handling for production debugging
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('defaultProps will be removed from function components')) {
        return;
    }
    originalConsoleError(...args);
};

window.addEventListener('error', (event) => {
    // Suppress the same warning if it comes through error event
    if (event.message && event.message.includes('defaultProps will be removed from function components')) {
        return;
    }
    console.error('Global Error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : '';
    console.error('Unhandled Promise Rejection:', message, stack);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
