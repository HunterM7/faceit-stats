import type { TemplateSegment } from './parseTemplateSegments';

/**
 * Строковый offset начала сегмента с `placeholderId` в сериализованном шаблоне.
 */
export function getPlaceholderOffset(
  segments: readonly TemplateSegment[],
  placeholderId: string,
): number {
  let offset = 0;
  for (const segment of segments) {
    if (segment.id === placeholderId) {
      return offset;
    }
    offset += segment.type === 'text'
      ? segment.value.length
      : `{${segment.name}}`.length;
  }
  return offset;
}
