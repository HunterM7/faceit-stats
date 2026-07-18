import { useState } from 'react';
import { classNames } from '@/utils/classNames';
import { Section } from '@/components/section/section';
import { Input } from '@/ui/input/input';
import { Button, ButtonVariant } from '@/ui/button/button';
import { StorageLocal } from '@utils/app-local-storage';
import { buildApiUrl } from '@config/api';
import { useToast } from '@components/toast-provider/use-toast';
import './twitch-commands-page-content.scss';

export interface TwitchCommandsPageContentProps {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

interface TwitchCommandRowProps {
  /** Название команды в чате, например `!elo`. */
  command: string;
  /** Краткое описание ответа бота. */
  description: string;
  /** Готовый код для вставки в ответ команды чатбота. */
  code: string;
  /** Можно ли копировать (есть ник). */
  canCopy: boolean;
  /** Копирует `code` в буфер. */
  onCopy: () => void;
}

function TwitchCommandRow(props: TwitchCommandRowProps) {
  const { command, description, code, canCopy, onCopy } = props;

  return (
    <div className='twitch-commands-page-content__command'>
      <div className='twitch-commands-page-content__command-head'>
        <p className='twitch-commands-page-content__command-name'>{command}</p>
        <p className='twitch-commands-page-content__command-desc'>{description}</p>
      </div>
      <div className='twitch-commands-page-content__command-row'>
        <input
          className='twitch-commands-page-content__command-code'
          type='text'
          readOnly
          value={code}
          placeholder='Укажи FACEIT ник, чтобы сгенерировать код'
        />
        <Button variant={ButtonVariant.Primary} onClick={onCopy} disabled={!canCopy}>
          Копировать
        </Button>
      </div>
    </div>
  );
}

/**
 * Собирает код Nightbot `$(urlfetch …)` для GET-эндпоинта Twitch-команд.
 * @param path Путь API, например `/api/twitch/elo`.
 * @param nickname Ник FACEIT.
 */
function buildNightbotCode(path: string, nickname: string): string {
  const trimmed = nickname.trim();
  if (!trimmed) {
    return '';
  }
  const url = buildApiUrl(`${path}?nickname=${encodeURIComponent(trimmed)}`);
  return `$(urlfetch ${url})`;
}

export function TwitchCommandsPageContent(props: TwitchCommandsPageContentProps) {
  const { className } = props;
  const { showToast } = useToast();

  const nicknameStorage = StorageLocal().path('widgets.twitch.nickname');
  const [ nickname, setNickname ] = useState(() => nicknameStorage.get(''));

  const canBuild = nickname.trim().length > 0;
  const eloCode = buildNightbotCode('/api/twitch/elo', nickname);
  const statsCode = buildNightbotCode('/api/twitch/stats', nickname);

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    if (!value.trim().length) {
      nicknameStorage.delete();
      return;
    }
    nicknameStorage.set(value);
  };

  const copyCode = async (code: string) => {
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
  };

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
            <TwitchCommandRow
              command='!elo'
              description='Ответ: «Текущее эло: N»'
              code={eloCode}
              canCopy={canBuild}
              onCopy={() => {
                void copyCode(eloCode);
              }}
            />
            <TwitchCommandRow
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
