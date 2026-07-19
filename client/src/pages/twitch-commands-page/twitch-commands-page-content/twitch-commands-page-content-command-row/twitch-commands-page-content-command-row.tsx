import { Button, ButtonVariant } from '@/ui/button/button';
import './twitch-commands-page-content-command-row.scss';

export interface TwitchCommandsPageContentCommandRowProps {
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

export function TwitchCommandsPageContentCommandRow(props: TwitchCommandsPageContentCommandRowProps) {
  const { command, description, code, canCopy, onCopy } = props;

  return (
    <div className='twitch-commands-page-content-command-row'>
      <div className='twitch-commands-page-content-command-row__head'>
        <p className='twitch-commands-page-content-command-row__name'>{command}</p>
        <p className='twitch-commands-page-content-command-row__desc'>{description}</p>
      </div>
      <div className='twitch-commands-page-content-command-row__controls'>
        <input
          className='twitch-commands-page-content-command-row__code'
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
