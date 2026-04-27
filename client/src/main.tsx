import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LandingPage } from '@pages/landing-page/landing-page';
import { MatchResultPage } from '@pages/match-result-page/match-result-page';
import { StatsPage } from '@pages/stats-page/stats-page';
import { DuoFinderPage } from '@pages/duo-finder-page/duo-finder-page';
import './main.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/matchResult" element={<MatchResultPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/duo" element={<DuoFinderPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
