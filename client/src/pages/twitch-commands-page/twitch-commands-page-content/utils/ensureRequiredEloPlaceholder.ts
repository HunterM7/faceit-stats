import type { TemplateSegment } from './parseTemplateSegments';
import { REQUIRED_ELO_PLACEHOLDER_NAME } from './twitchCommandTemplates';
import { insertPlaceholderSegment } from './insertPlaceholderSegment';

/**
 * Гарантирует наличие обязательного `{elo}` в сегментах шаблона.
 */
export function ensureRequiredEloPlaceholder(
  segments: readonly TemplateSegment[],
): TemplateSegment[] {
  const hasElo = segments.some(
    (segment) => segment.type === 'placeholder' && segment.name === REQUIRED_ELO_PLACEHOLDER_NAME,
  );
  if (hasElo) {
    return [ ...segments ];
  }
  return insertPlaceholderSegment(segments, REQUIRED_ELO_PLACEHOLDER_NAME);
}
