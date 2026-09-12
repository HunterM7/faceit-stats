import { useMemo } from 'react';
import type { BoolSetting } from '@utils/widget-url';
import { useToast } from '@components/toast-provider/use-toast';
import { buildUrl } from '@utils/widget-url';

export type OverlayWidgetPageLinkInput = {
  nickname: string;
  testMode: BoolSetting;
  particles: boolean;
};

export function useOverlayWidgetPageLink(input: OverlayWidgetPageLinkInput) {
  const { showToast } = useToast();

  const canBuild = input.nickname.trim().length > 0;

  const widgetUrl = useMemo(() => {
    if (!canBuild) {
      return '';
    }
    return buildUrl('/matchResult', {
      nickname: input.nickname.trim(),
      test: input.testMode === 'true' ? 'true' : undefined,
      particles: input.particles ? undefined : 'false',
    });
  }, [ canBuild, input.nickname, input.testMode, input.particles ]);

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
