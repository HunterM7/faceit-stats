import type { TemplateSegment } from './parseTemplateSegments';

/**
 * Абсолютный offset каретки в сериализованном шаблоне по текстовому сегменту.
 */
export function getTextCaretOffset(
  segments: readonly TemplateSegment[],
  segmentId: string,
  localOffset: number,
): number {
  let offset = 0;
  for (const segment of segments) {
    if (segment.id === segmentId && segment.type === 'text') {
      const clamped = Math.max(0, Math.min(localOffset, segment.value.length));
      return offset + clamped;
    }
    offset += segment.type === 'text'
      ? segment.value.length
      : `{${segment.name}}`.length;
  }
  return offset;
}
