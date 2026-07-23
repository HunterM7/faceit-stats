import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { classNames } from '@/utils/classNames';
import './header.scss';

type Props = {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
};

export function Header(props: Props) {
  const { className } = props;
  const { pathname } = useLocation();

  const [ isScrolled, setIsScrolled ] = useState(false);
  const [ openMenuPath, setOpenMenuPath ] = useState<string | null>(null);
  const isMenuOpen = openMenuPath === pathname;

  useEffect(() => {
    const scrollElement = document.getElementById('root');
    if (!scrollElement) {
      return;
    }
    const onScroll = () => setIsScrolled(scrollElement.scrollTop > 12);
    onScroll();
    scrollElement.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollElement.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = useCallback(() => {
    setOpenMenuPath((current) => (current === pathname ? null : pathname));
  }, [ pathname ]);

  const closeMenu = useCallback(() => {
    setOpenMenuPath(null);
  }, []);

  return (
    <header
      className={classNames(
        'header',
        (isScrolled || isMenuOpen) && 'header--scrolled',
        className,
      )}
    >
      <NavLink to='/' end className='header__brand' onClick={closeMenu}>
        FACEIT WIDGETS
      </NavLink>
      <button
        type='button'
        className={classNames('header__menu-toggle', isMenuOpen && 'header__menu-toggle--open')}
        onClick={toggleMenu}
      >
        <span className='header__menu-toggle-icon'>
          <span className='header__menu-toggle-line'/>
          <span className='header__menu-toggle-line'/>
          <span className='header__menu-toggle-line'/>
        </span>
        {isMenuOpen ? 'Закрыть' : 'Меню'}
      </button>
      <nav className={classNames('header__nav', isMenuOpen && 'header__nav--open')}>
        <NavLink
          to='/widgets/stats'
          className={({ isActive }) => classNames('header__nav-link', isActive && 'header__nav-link--active')}
          onClick={closeMenu}
        >
          Виджет статистики
        </NavLink>
        <NavLink
          to='/widgets/match-result'
          className={({ isActive }) => classNames('header__nav-link', isActive && 'header__nav-link--active')}
          onClick={closeMenu}
        >
          Виджет-оверлей
        </NavLink>
        <NavLink
          to='/widgets/twitch-commands'
          className={({ isActive }) => classNames('header__nav-link', isActive && 'header__nav-link--active')}
          onClick={closeMenu}
        >
          Twitch команды
        </NavLink>
      </nav>
    </header>
  );
}
