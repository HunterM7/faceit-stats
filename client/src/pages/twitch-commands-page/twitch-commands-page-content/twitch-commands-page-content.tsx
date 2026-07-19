import { useCallback, useState } from 'react';
import { classNames } from '@/utils/classNames';
import { Section } from '@/components/section/section';
import { Input } from '@/ui/input/input';
import { Select, type SelectOption } from '@/ui/select/select';
import { StorageLocal } from '@utils/app-local-storage';
import { TwitchChatbot } from '@utils/twitchChatbot';
import { useToast } from '@components/toast-provider/use-toast';
import { TwitchCommandsPageContentCommandRow } from './twitch-commands-page-content-command-row/twitch-commands-page-content-command-row';
import { buildChatbotCode } from './utils/buildChatbotCode';
import './twitch-commands-page-content.scss';

const CHATBOT_OPTIONS: readonly SelectOption<TwitchChatbot>[] = [
  { value: TwitchChatbot.Nightbot, label: 'Nightbot' },
  { value: TwitchChatbot.StreamElements, label: 'StreamElements' },
  { value: TwitchChatbot.Fossabot, label: 'Fossabot' },
  { value: TwitchChatbot.StreamlabsChatbot, label: 'Streamlabs Chatbot' },
  { value: TwitchChatbot.StreamlabsCloudBot, label: 'Streamlabs CloudBot' },
  { value: TwitchChatbot.Moobot, label: 'Moobot' },
];

export interface TwitchCommandsPageContentProps {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

export function TwitchCommandsPageContent(props: TwitchCommandsPageContentProps) {
  const { className } = props;
  const { showToast } = useToast();

  const nicknameStorage = StorageLocal().path('widgets.twitch.nickname');
  const chatbotStorage = StorageLocal().path('widgets.twitch.chatbot');
  const [ nickname, setNickname ] = useState(() => nicknameStorage.get(''));
  const [ chatbot, setChatbot ] = useState<TwitchChatbot>(() => {
    const stored = chatbotStorage.get(TwitchChatbot.Nightbot);
    return CHATBOT_OPTIONS.some((option) => option.value === stored)
      ? stored
      : TwitchChatbot.Nightbot;
  });

  const canBuild = nickname.trim().length > 0;
  const eloCode = buildChatbotCode('/api/twitch/elo', nickname, chatbot);
  const statsCode = buildChatbotCode('/api/twitch/stats', nickname, chatbot);
  const commandsHint = chatbot === TwitchChatbot.Moobot
    ? 'Включи «Show advanced options», в Response выбери «URL fetch – Full (plain) response» и вставь ссылку в URL to fetch.'
    : 'Скопируй код и вставь в ответ команд !elo и !stats.';

  const handleNicknameChange = useCallback((value: string) => {
    setNickname(value);
    const storage = StorageLocal().path('widgets.twitch.nickname');
    if (!value.trim().length) {
      storage.delete();
      return;
    }
    storage.set(value);
  }, []);

  const handleChatbotChange = useCallback((value: TwitchChatbot) => {
    setChatbot(value);
    StorageLocal().path('widgets.twitch.chatbot').set(value);
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
          <h1 className='twitch-commands-page-content__hero-title'>Статистика в чат стрима</h1>
          <p className='twitch-commands-page-content__hero-lead'>
            Укажи FACEIT ник, выбери чатбота и скопируй код в команды !elo и !stats.
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
            <div className='twitch-commands-page-content__field'>
              <p className='twitch-commands-page-content__input-label'>Чатбот</p>
              <Select<TwitchChatbot>
                className='twitch-commands-page-content__chatbot-select'
                value={chatbot}
                options={CHATBOT_OPTIONS}
                onChange={handleChatbotChange}
              />
            </div>
          </div>
        </Section>

        <Section title='Команды для чатбота' className='twitch-commands-page-content__commands'>
          <p className='twitch-commands-page-content__hint'>{commandsHint}</p>
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
