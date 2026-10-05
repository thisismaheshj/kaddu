import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Admin } from './Admin';
import '../styles.css';
import './admin.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Admin />
  </StrictMode>,
);
