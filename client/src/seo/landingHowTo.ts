export interface LandingHowToStep {
  /** Короткий заголовок шага. */
  name: string;
  /** Описание действия. */
  text: string;
}

export const LANDING_HOWTO_NAME = 'Как добавить виджет FACEIT в OBS';

export const LANDING_HOWTO_DESCRIPTION =
  'Три шага: выбрать виджет, скопировать ссылку и вставить Browser Source в OBS или Streamlabs.';

export const LANDING_HOWTO_STEPS: LandingHowToStep[] = [
  {
    name: 'Выбери виджет и укажи FACEIT-ник',
    text: 'Открой виджет статистики, итог матча или Twitch-команды и введи свой ник на FACEIT.',
  },
  {
    name: 'Скопируй ссылку Browser Source',
    text: 'Нажми копирование ссылки на странице виджета — это URL для источника «Браузер».',
  },
  {
    name: 'Добавь источник в OBS',
    text: 'В OBS Studio или Streamlabs: Источники → Браузер → вставь URL, подгони размер и положение на сцене.',
  },
];
