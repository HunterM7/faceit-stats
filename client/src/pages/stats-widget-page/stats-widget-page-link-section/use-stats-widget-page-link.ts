import { useMemo } from 'react';
import type { StatsRatingQuery } from '@requests/stats';
import { useToast } from '@components/toast-provider/use-toast';
import { buildUrl } from '@utils/widget-url';

export type StatsWidgetPageLinkInput = {
  nickname: string;
  backgroundOpacity?: number | undefined;
  borderRadius?: number | undefined;
  ratingMode: StatsRatingQuery;
};

export function useStatsWidgetPageLink(input: StatsWidgetPageLinkInput) {
  const { showToast } = useToast();

  const canBuild = input.nickname.trim().length > 0;

  const widgetUrl = useMemo(() => {
    if (!canBuild) {
      return '';
    }
    const ratingForUrl = input.ratingMode === 'country' ? undefined : input.ratingMode;

    return buildUrl('/stats', {
      nickname: input.nickname.trim(),
      bg: input.backgroundOpacity,
      radius: input.borderRadius,
      rating: ratingForUrl,
    });
  }, [
    canBuild,
    input.backgroundOpacity,
    input.borderRadius,
    input.nickname,
    input.ratingMode,
  ]);

  const copy = async () => {
    if (!widgetUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(widgetUrl);
      showToast({
        title: 'Скопировано',
        variant: 'success',
        durationMs: 2200,
      });
    } catch {
      showToast({
        title: 'Не удалось скопировать',
        message: 'Разреши доступ к буферу обмена или скопируй ссылку вручную.',
        variant: 'error',
      });
    }
  };

  return { widgetUrl, canBuild, copy };
}
