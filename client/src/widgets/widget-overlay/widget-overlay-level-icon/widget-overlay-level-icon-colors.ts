/** Акцентные цвета из `client/src/images/skill-levels/skill-level-N.svg`. */
export const WIDGET_OVERLAY_SKILL_LEVEL_COLORS: Record<number, string> = {
  1: '#eeeeee',
  2: '#1ce400',
  3: '#1ce400',
  4: '#ffc800',
  5: '#ffc800',
  6: '#ffc800',
  7: '#ffc800',
  8: '#ff6309',
  9: '#ff6309',
  10: '#fe1f00',
  11: '#fe0123',
  12: '#fd0346',
  13: '#fe0379',
  14: '#ff019b',
  15: '#cc29c8',
  16: '#4693ec',
  17: '#1fb2f7',
  18: '#00cbff',
  19: '#4cdbff',
  20: '#ffffff',
};

export function widgetOverlaySkillLevelColor(skillLevel: number | null): string {
  if (skillLevel == null) {
    return '#eeeeee';
  }

  const level = Math.min(20, Math.max(1, Math.round(skillLevel)));
  return WIDGET_OVERLAY_SKILL_LEVEL_COLORS[level] ?? '#eeeeee';
}
