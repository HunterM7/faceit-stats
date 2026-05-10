import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@components/toast-provider/toast-provider';
import { AppRoutes } from './app-routes';
import './main.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>
    <ToastProvider/>
  </StrictMode>,
);
