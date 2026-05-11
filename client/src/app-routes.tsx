import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

const LandingPage = lazy(async () => {
  const m = await import('@pages/landing-page/landing-page')
  return { default: m.LandingPage }
})

const OverlayPage = lazy(async () => {
  const m = await import('@pages/overlay-page/overlay-page')
  return { default: m.OverlayPage }
})

const StatsPage = lazy(async () => {
  const m = await import('@pages/stats-page/stats-page')
  return { default: m.StatsPage }
})

const StatsWidgetPage = lazy(async () => {
  const m = await import('@pages/stats-widget-page/stats-widget-page')
  return { default: m.StatsWidgetPage }
})

const MatchResultWidgetPage = lazy(async () => {
  const m = await import('@pages/match-result-widget-page/match-result-widget-page')
  return { default: m.MatchResultWidgetPage }
})

const AdminPage = lazy(async () => {
  const m = await import('@pages/admin-page/admin-page')
  return { default: m.AdminPage }
})

const AdminErrorsPage = lazy(async () => {
  const m = await import('@pages/admin-errors-page/admin-errors-page')
  return { default: m.AdminErrorsPage }
})

export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/matchResult' element={<OverlayPage/>}/>
        <Route path='/stats' element={<StatsPage/>}/>
        <Route path='/admin' element={<AdminPage/>}/>
        <Route path='/admin/errors' element={<AdminErrorsPage/>}/>
        <Route path='/widgets/stats' element={<StatsWidgetPage/>}/>
        <Route path='/widgets/match-result' element={<MatchResultWidgetPage/>}/>
      </Routes>
    </Suspense>
  )
}
