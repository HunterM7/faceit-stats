import { useCallback, useState } from 'react';
import { classNames } from '@/utils/classNames';
import { Section } from '@/components/section/section';
import { Input } from '@/ui/input/input';
import { StorageLocal } from '@utils/app-local-storage';
import { buildNightbotCode } from './utils/buildNightbotCode';
import { useToast } from '@components/toast-provider/use-toast';
import { TwitchCommandsPageContentCommandRow } from './twitch-commands-page-content-command-row/twitch-commands-page-content-command-row';
import './twitch-commands-page-content.scss';

export interface TwitchCommandsPageContentProps {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

export function TwitchCommandsPageContent(props: TwitchCommandsPageContentProps) {
  const { className } = props;
  const { showToast } = useToast();

  const nicknameStorage = StorageLocal().path('widgets.twitch.nickname');
  const [ nickname, setNickname ] = useState(() => nicknameStorage.get(''));

  const canBuild = nickname.trim().length > 0;
  const eloCode = buildNightbotCode('/api/twitch/elo', nickname);
  const statsCode = buildNightbotCode('/api/twitch/stats', nickname);

  const handleNicknameChange = useCallback((value: string) => {
    setNickname(value);
    const storage = StorageLocal().path('widgets.twitch.nickname');
    if (!value.trim().length) {
      storage.delete();
      return;
    }
    storage.set(value);
  }, []);

  const copyCode = useCallback(async (code: string) => {
    if (!code) {
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      showToast({
        title: 'Скопировано',
        variant: 'success',
        durationMs: 2200,
      });
    } catch {
      showToast({
        title: 'Не удалось скопировать',
        message: 'Разреши доступ к буферу обмена или скопируй код вручную.',
        variant: 'error',
      });
    }
  }, [ showToast ]);

  return (
    <div className={classNames('twitch-commands-page-content', className)}>
      <header className='twitch-commands-page-content__hero'>
        <div className='twitch-commands-page-content__hero-copy'>
          <h1 className='twitch-commands-page-content__hero-title'>Статистика для Twitch команд</h1>
          <p className='twitch-commands-page-content__hero-lead'>
            Укажи FACEIT ник и скопируй код в ответ команды чатбота (Nightbot).
            Бот запросит статистику с сервера и отправит её в чат.
          </p>
          <p className='twitch-commands-page-content__hero-lead'>
            Для StreamElements вместо{' '}
            <code className='twitch-commands-page-content__inline-code'>$(urlfetch URL)</code>
            {' '}используй{' '}
            <code className='twitch-commands-page-content__inline-code'>{'${customapi.URL}'}</code>.
          </p>
        </div>
      </header>

      <div className='twitch-commands-page-content__layout'>
        <Section title='Параметры' className='twitch-commands-page-content__params'>
          <div className='twitch-commands-page-content__fields'>
            <div className='twitch-commands-page-content__field'>
              <p className='twitch-commands-page-content__input-label'>FACEIT ник</p>
              <Input
                className='twitch-commands-page-content__text-input'
                isClearable
                name='nickname'
                type='text'
                value={nickname}
                onChange={handleNicknameChange}
                placeholder='например: s1mple'
                autoComplete='nickname'
              />
            </div>
          </div>
        </Section>

        <Section title='Команды для чатбота' className='twitch-commands-page-content__commands'>
          <p className='twitch-commands-page-content__hint'>
            Создай команды !elo и !stats в чатботе и вставь скопированный код в поле ответа.
          </p>
          <div className='twitch-commands-page-content__commands-list'>
            <TwitchCommandsPageContentCommandRow
              command='!elo'
              description='Ответ: «Текущее эло: N»'
              code={eloCode}
              canCopy={canBuild}
              onCopy={() => {
                void copyCode(eloCode);
              }}
            />
            <TwitchCommandsPageContentCommandRow
              command='!stats'
              description='Ответ: краткая статистика игрока (ELO, K/D, сегодня, 30 матчей)'
              code={statsCode}
              canCopy={canBuild}
              onCopy={() => {
                void copyCode(statsCode);
              }}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
