import './index.css'
import '@fontsource/bai-jamjuree';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/dm-sans/standard-italic.css';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner';

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="top-center" />
  </StrictMode>,
)
