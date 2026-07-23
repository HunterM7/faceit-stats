import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

const DEFAULT_DOCUMENT_TITLE = 'Faceit Widgets';

const PAGE_DOCUMENT_TITLES: Record<string, string> = {
  '/': DEFAULT_DOCUMENT_TITLE,
  '/matchResult': 'Результат матча',
  '/stats': 'Статистика',
  '/admin': 'Админка',
  '/admin/errors': 'Зарегистрированные ошибки',
  '/widgets/stats': 'Виджет статистики',
  '/widgets/match-result': 'Виджет-оверлей',
  '/widgets/twitch-commands': 'Стрим команды',
};

const LandingPage = lazy(async () => {
  const m = await import('@pages/landing-page/landing-page');
  return { default: m.LandingPage };
});

const OverlayPage = lazy(async () => {
  const m = await import('@pages/overlay-page/overlay-page');
  return { default: m.OverlayPage };
});

const StatsPage = lazy(async () => {
  const m = await import('@pages/stats-page/stats-page');
  return { default: m.StatsPage };
});

const StatsWidgetPage = lazy(async () => {
  const m = await import('@pages/stats-widget-page/stats-widget-page');
  return { default: m.StatsWidgetPage };
});

const OverlayWidgetPage = lazy(async () => {
  const m = await import('@pages/overlay-widget-page/overlay-widget-page');
  return { default: m.OverlayWidgetPage };
});

const TwitchCommandsPage = lazy(async () => {
  const m = await import('@pages/twitch-commands-page/twitch-commands-page');
  return { default: m.TwitchCommandsPage };
});

const AdminPage = lazy(async () => {
  const m = await import('@pages/admin-page/admin-page');
  return { default: m.AdminPage };
});

const AdminErrorsPage = lazy(async () => {
  const m = await import('@pages/admin-errors-page/admin-errors-page');
  return { default: m.AdminErrorsPage };
});

export function AppRoutes() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = PAGE_DOCUMENT_TITLES[pathname] ?? DEFAULT_DOCUMENT_TITLE;
  }, [ pathname ]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/matchResult' element={<OverlayPage/>}/>
        <Route path='/stats' element={<StatsPage/>}/>
        <Route path='/admin' element={<AdminPage/>}/>
        <Route path='/admin/errors' element={<AdminErrorsPage/>}/>
        <Route path='/widgets/stats' element={<StatsWidgetPage/>}/>
        <Route path='/widgets/match-result' element={<OverlayWidgetPage/>}/>
        <Route path='/widgets/twitch-commands' element={<TwitchCommandsPage/>}/>
      </Routes>
    </Suspense>
  );
}
