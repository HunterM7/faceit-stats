import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { classNames } from '@/utils/classNames';
import './header.scss';

type Props = {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
};

export function Header(props: Props) {
  const { className } = props;

  const [ isScrolled, setIsScrolled ] = useState(false);

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

  return (
    <header className={classNames('header', isScrolled && 'header--scrolled', className)}>
      <div className='header__inner'>
        <NavLink to='/' end className='header__brand'>
          FACEIT WIDGETS
        </NavLink>
        <nav className='header__nav'>
          <NavLink
            to='/widgets/stats'
            className={({ isActive }) => classNames('header__nav-link', isActive && 'header__nav-link--active')}
          >
            Виджет статистики
          </NavLink>
          <NavLink
            to='/widgets/match-result'
            className={({ isActive }) => classNames('header__nav-link', isActive && 'header__nav-link--active')}
          >
            Виджет-оверлей
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
