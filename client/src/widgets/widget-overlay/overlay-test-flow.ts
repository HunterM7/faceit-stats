/** Итог матча для состояния оверлея / поллинга (после обновления профиля). */
export interface OverlayMatchResult {
  /** Текущий ELO после матча. */
  elo: number;
  /** Уровень скилла; `null`, если в данных игрока уровень не пришёл. */
  skillLevel: number | null;
  /** Исход последнего матча для оформления оверлея. */
  result: 'WIN' | 'LOSS';
}

/** Снимок ELO и уровня без поля исхода (например «до» смены или промежуточное состояние). */
export interface OverlayMatchSnapshot {
  elo: number;
  skillLevel: number | null;
}

/** Одна пара «до / после» в демо-потоке тестового режима оверлея. */
export interface OverlayTestFlowStep {
  /** Состояние до матча; без поля — нет истории (первая игра или калибровка). */
  before?: {
    /** Уровень скилла. */
    skillLevel: number;
    /** ELO. */
    elo: number;
  };
  /** Состояние после матча; без поля — калибровка, оверлей не показываем. */
  after?: {
    /** Уровень скилла. */
    skillLevel: number;
    /** ELO. */
    elo: number;
  };
  /** Исход шага для визуала. */
  result: OverlayMatchResult['result'];
}

/** Заранее заданная последовательность шагов для тестового цикла `useOverlayTestMatchCycle`. */
export const OVERLAY_TEST_FLOW: OverlayTestFlowStep[] = [
  { before: { skillLevel: 9, elo: 1984 }, after: { skillLevel: 10, elo: 2007 }, result: 'WIN' },
  { before: { skillLevel: 10, elo: 2010 }, after: { skillLevel: 9, elo: 1985 }, result: 'LOSS' },
  { before: { skillLevel: 8, elo: 1722 }, after: { skillLevel: 9, elo: 1751 }, result: 'WIN' },
  { before: { skillLevel: 9, elo: 1760 }, after: { skillLevel: 8, elo: 1735 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1502 }, after: { skillLevel: 8, elo: 1531 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1540 }, after: { skillLevel: 7, elo: 1512 }, result: 'LOSS' },
  { before: { skillLevel: 6, elo: 1322 }, after: { skillLevel: 7, elo: 1351 }, result: 'WIN' },
  { before: { skillLevel: 7, elo: 1355 }, after: { skillLevel: 6, elo: 1332 }, result: 'LOSS' },
  { before: { skillLevel: 5, elo: 1171 }, after: { skillLevel: 6, elo: 1201 }, result: 'WIN' },
  { before: { skillLevel: 6, elo: 1210 }, after: { skillLevel: 5, elo: 1183 }, result: 'LOSS' },
  { before: { skillLevel: 4, elo: 1021 }, after: { skillLevel: 5, elo: 1051 }, result: 'WIN' },
  { before: { skillLevel: 5, elo: 1054 }, after: { skillLevel: 4, elo: 1028 }, result: 'LOSS' },
  { before: { skillLevel: 3, elo: 874 }, after: { skillLevel: 4, elo: 901 }, result: 'WIN' },
  { before: { skillLevel: 4, elo: 907 }, after: { skillLevel: 3, elo: 882 }, result: 'LOSS' },
  { before: { skillLevel: 2, elo: 722 }, after: { skillLevel: 3, elo: 751 }, result: 'WIN' },
  { before: { skillLevel: 3, elo: 756 }, after: { skillLevel: 2, elo: 728 }, result: 'LOSS' },
  { before: { skillLevel: 1, elo: 478 }, after: { skillLevel: 2, elo: 503 }, result: 'WIN' },
  { before: { skillLevel: 2, elo: 512 }, after: { skillLevel: 1, elo: 487 }, result: 'LOSS' },
  { after: { skillLevel: 1, elo: 100 }, result: 'WIN' },
  { after: { skillLevel: 1, elo: 100 }, result: 'LOSS' },
  { result: 'WIN' },
  { result: 'LOSS' },
];
