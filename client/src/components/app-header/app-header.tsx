import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { classNames } from '@/utils/classNames'
import './app-header.scss'

export function AppHeader() {
  const [ isScrolled, setIsScrolled ] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`app-header ${isScrolled ? 'app-header--scrolled' : ''}`}>
      <div className='app-header__inner'>
        <NavLink to='/' end className='app-header__brand'>
          FACEIT WIDGETS
        </NavLink>
        <nav className='app-header__nav'>
          <NavLink
            to='/widgets/stats'
            className={({ isActive }) => classNames('app-header__nav-link', isActive && 'app-header__nav-link--active')}
          >
            Stats Widget
          </NavLink>
          <NavLink
            to='/widgets/match-result'
            className={({ isActive }) => classNames('app-header__nav-link', isActive && 'app-header__nav-link--active')}
          >
            Match Result
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
