import { useCallback, useState } from 'react';
import { classNames } from '@/utils/classNames';
import { Section } from '@/components/section/section';
import { Input } from '@/ui/input/input';
import { Select, type SelectOption } from '@/ui/select/select';
import { StorageLocal } from '@utils/app-local-storage';
import { TwitchChatbot } from '@utils/twitchChatbot';
import { useToast } from '@components/toast-provider/use-toast';
import { TwitchCommandsPageContentCommandRow } from './twitch-commands-page-content-command-row/twitch-commands-page-content-command-row';
import { TwitchCommandsPageContentTemplateEditor } from './twitch-commands-page-content-template-editor/twitch-commands-page-content-template-editor';
import { buildEloChatbotCode, buildStatsChatbotCode } from './utils/buildChatbotCode';
import { DEFAULT_ELO_TEXT } from './utils/twitchCommandTemplates';
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
  const eloTextStorage = StorageLocal().path('widgets.twitch.eloText');

  const [ nickname, setNickname ] = useState(() => nicknameStorage.get(''));
  const [ chatbot, setChatbot ] = useState<TwitchChatbot>(() => {
    const stored = chatbotStorage.get(TwitchChatbot.Nightbot);
    return CHATBOT_OPTIONS.some((option) => option.value === stored)
      ? stored
      : TwitchChatbot.Nightbot;
  });
  const [ eloText, setEloText ] = useState(() => eloTextStorage.get(DEFAULT_ELO_TEXT));

  const canBuild = nickname.trim().length > 0;
  const eloCode = buildEloChatbotCode({
    nickname,
    chatbot,
    text: eloText.trim() || DEFAULT_ELO_TEXT,
  });
  const statsCode = buildStatsChatbotCode({ nickname, chatbot });
  const commandsHint = chatbot === TwitchChatbot.Moobot
    ? 'Включи «Show advanced options», в Response выбери «URL fetch – Full (plain) response» и вставь ссылку в URL to fetch.'
    : 'Скопируй код и вставь в ответ команды.';

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

  const handleEloTextChange = useCallback((value: string) => {
    setEloText(value);
    const storage = StorageLocal().path('widgets.twitch.eloText');
    if (!value.trim().length || value.trim() === DEFAULT_ELO_TEXT) {
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
          <h1 className='twitch-commands-page-content__hero-title'>Команды Faceit для Twitch-чата</h1>
          <p className='twitch-commands-page-content__hero-lead'>
            ELO и статистика Faceit в чате: готовый код FACEIT Widgets для Nightbot, StreamElements и других ботов.
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
              <p className='twitch-commands-page-content__field-hint'>{commandsHint}</p>
            </div>
          </div>
        </Section>

        <Section title='Эло-рейтинг' className='twitch-commands-page-content__command-block'>
          <div className='twitch-commands-page-content__fields'>
            <div className='twitch-commands-page-content__field'>
              <p className='twitch-commands-page-content__input-label'>Текст ответа</p>
              <TwitchCommandsPageContentTemplateEditor
                className='twitch-commands-page-content__template-input'
                value={eloText}
                onChange={handleEloTextChange}
              />
            </div>
          </div>
          <TwitchCommandsPageContentCommandRow
            code={eloCode}
            canCopy={canBuild}
            onCopy={() => {
              void copyCode(eloCode);
            }}
          />
        </Section>

        <Section title='Подробная статистика' className='twitch-commands-page-content__command-block'>
          <TwitchCommandsPageContentCommandRow
            code={statsCode}
            canCopy={canBuild}
            onCopy={() => {
              void copyCode(statsCode);
            }}
          />
        </Section>
      </div>
    </div>
  );
}
