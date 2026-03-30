import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const LEGACY_THEME_STORAGE_KEY = 'jobportal-theme';

const getEmailFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = token.split('.')[1];
    if (!payload) return null;

    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decodedPayload?.sub || null;
  } catch {
    return null;
  }
};

const themeStorageKey = `jobportal-theme:${getEmailFromToken() || 'guest'}`;
const savedTheme = localStorage.getItem(themeStorageKey)
  || localStorage.getItem(LEGACY_THEME_STORAGE_KEY)
  || 'dark';

document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
