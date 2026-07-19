/** Имена плейсхолдеров шаблона !elo. */
export type EloPlaceholderName = 'elo' | 'level';

/** Все распознаваемые плейсхолдеры в тексте. */
export const ELO_PLACEHOLDER_NAMES: readonly EloPlaceholderName[] = [ 'elo', 'level' ];

/** Обязательный плейсхолдер — всегда есть в шаблоне. */
export const REQUIRED_ELO_PLACEHOLDER_NAME: EloPlaceholderName = 'elo';

/** Шаблон ответа `!elo` по умолчанию. */
export const DEFAULT_ELO_TEXT = 'Текущее эло: {elo}';
