import type { EloPlaceholderName } from './twitchCommandTemplates';
import type { TemplateSegment } from './parseTemplateSegments';
import { insertPlaceholderAtOffset } from './insertPlaceholderAtOffset';
import { serializeTemplateSegments } from './serializeTemplateSegments';

/**
 * Вставляет чип плейсхолдера в `offset` (или в конец, если offset не передан).
 */
export function insertPlaceholderSegment(
  segments: readonly TemplateSegment[],
  name: EloPlaceholderName,
  offset?: number | undefined,
): TemplateSegment[] {
  const chip = {
    type: 'placeholder' as const,
    id: crypto.randomUUID(),
    name,
  };
  const insertAt = offset ?? serializeTemplateSegments(segments).length;
  return insertPlaceholderAtOffset(segments, chip, insertAt);
}
