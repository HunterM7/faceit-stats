export interface LandingHowToStep {
  /** Короткий заголовок шага. */
  name: string;
  /** Описание действия. */
  text: string;
}

export const LANDING_HOWTO_NAME = 'Как добавить виджет Faceit в OBS';

export const LANDING_HOWTO_DESCRIPTION =
  'Три шага в FACEIT Widgets: выбрать фейсит виджет, скопировать ссылку и добавить её в OBS или Streamlabs.';

export const LANDING_HOWTO_STEPS: LandingHowToStep[] = [
  {
    name: 'Выбери виджет и укажи FACEIT-ник',
    text: 'Открой виджет статистики Faceit, виджет с результатами матча или команды для Twitch и введи свой ник на FACEIT.',
  },
  {
    name: 'Скопируй ссылку для OBS',
    text: 'Нажми копирование ссылки на странице виджета — это URL для источника «Браузер» в OBS.',
  },
  {
    name: 'Добавь источник в OBS',
    text: 'В OBS Studio или Streamlabs: Источники → Браузер → вставь URL, подгони размер и положение на сцене стрима.',
  },
];
