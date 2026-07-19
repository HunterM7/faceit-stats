import type { TemplateSegment } from './parseTemplateSegments';
import { normalizeTemplateSegments } from './parseTemplateSegments';
import { REQUIRED_ELO_PLACEHOLDER_NAME } from './twitchCommandTemplates';

/**
 * Удаляет чип плейсхолдера по `id`. Обязательный `{elo}` не удаляется.
 */
export function removePlaceholderSegment(
  segments: readonly TemplateSegment[],
  placeholderId: string,
): TemplateSegment[] {
  const target = segments.find((segment) => segment.id === placeholderId);
  if (
    target?.type === 'placeholder'
    && target.name === REQUIRED_ELO_PLACEHOLDER_NAME
  ) {
    return [ ...segments ];
  }

  return normalizeTemplateSegments(
    segments.filter((segment) => segment.id !== placeholderId),
  );
}
