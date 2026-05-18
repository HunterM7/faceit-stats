import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import type { StatsRatingQuery } from '@requests/stats';

export type StatsWidgetSearchParams = {
  nickname: string | undefined;
  backgroundOpacity: number | undefined;
  borderRadius: number | undefined;
  rating: StatsRatingQuery | undefined;
};

export function useStatsWidgetSearchParams(): StatsWidgetSearchParams {
  const location = useLocation();
  const [ searchParams, setSearchParams ] = useSearchParams();

  const rawNickname = searchParams.get('nickname');
  const rawBg = searchParams.get('bg');
  const rawRadius = searchParams.get('radius');
  const rawRating = searchParams.get('rating');

  const nickname = rawNickname?.trim() || undefined;

  const backgroundOpacity = (() => {
    if (!rawBg || !/^\d+$/.test(rawBg)) {
      return undefined;
    }
    const parsed = Number(rawBg);
    if (parsed < 0 || parsed > 100) {
      return undefined;
    }
    return parsed;
  })();

  const borderRadius = (() => {
    if (!rawRadius || !/^\d+$/.test(rawRadius)) {
      return undefined;
    }
    const parsed = Number(rawRadius);
    if (parsed < 0 || parsed > 18) {
      return undefined;
    }
    return parsed;
  })();

  const rating = rawRating === 'country' || rawRating === 'region' || rawRating === 'both' ? rawRating : undefined;

  useEffect(() => {
    const nextParams = new URLSearchParams();
    nextParams.set('nickname', rawNickname ?? '');
    if (backgroundOpacity !== undefined) {
      nextParams.set('bg', String(backgroundOpacity));
    }
    if (borderRadius !== undefined) {
      nextParams.set('radius', String(borderRadius));
    }
    if (rating) {
      nextParams.set('rating', rating);
    }

    const hasNicknameWithoutEquals = /(?:\?|&)nickname(?:&|$)/.test(location.search);
    if (hasNicknameWithoutEquals || nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [ backgroundOpacity, borderRadius, location.search, rating, rawNickname, searchParams, setSearchParams ]);

  return { nickname, backgroundOpacity, borderRadius, rating };
}
