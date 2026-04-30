import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LandingPage } from '@pages/landing-page/landing-page';
import { MatchResultPage } from '@pages/match-result-page/match-result-page';
import { StatsPage } from '@pages/stats-page/stats-page';
import { DuoFinderPage } from '@pages/duo-finder-page/duo-finder-page';
import { StatsWidgetPage } from '@pages/stats-widget-page/stats-widget-page';
import { MatchResultWidgetPage } from '@pages/match-result-widget-page/match-result-widget-page';
import { AdminPage } from '@pages/admin-page/admin-page';
import { ToastProvider } from '@components/toast-provider/toast-provider';
import './main.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/matchResult' element={<MatchResultPage />} />
        <Route path='/stats' element={<StatsPage />} />
        <Route path='/duo' element={<DuoFinderPage />} />
        <Route path='/admin' element={<AdminPage />} />
        <Route path='/widgets/stats' element={<StatsWidgetPage />} />
        <Route path='/widgets/match-result' element={<MatchResultWidgetPage />} />
      </Routes>
    </BrowserRouter>
    <ToastProvider />
  </StrictMode>,
);
