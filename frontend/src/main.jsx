import React from 'react';
import { createRoot } from 'react-dom/client';
import ClaimAssessor from './ClaimAssessor';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClaimAssessor />
  </React.StrictMode>,
);
