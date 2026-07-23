import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyPageSeo } from './applyPageSeo';

/** Синхронизирует title / meta / JSON-LD с текущим маршрутом. */
export function usePageSeo(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    applyPageSeo(pathname);
  }, [ pathname ]);
}
