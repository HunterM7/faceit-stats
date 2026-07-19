import type { TemplateSegment } from './parseTemplateSegments';

interface TextPosition {
  segmentId: string;
  localOffset: number;
}

/**
 * Текстовая позиция (сегмент + локальный offset) для абсолютного offset в шаблоне.
 */
export function findTextPositionAtOffset(
  segments: readonly TemplateSegment[],
  absoluteOffset: number,
): TextPosition | null {
  let offset = 0;
  let lastText: TextPosition | null = null;

  for (const segment of segments) {
    if (segment.type === 'text') {
      const end = offset + segment.value.length;
      if (absoluteOffset <= end) {
        return {
          segmentId: segment.id,
          localOffset: Math.max(0, absoluteOffset - offset),
        };
      }
      lastText = {
        segmentId: segment.id,
        localOffset: segment.value.length,
      };
      offset = end;
      continue;
    }
    offset += `{${segment.name}}`.length;
  }

  return lastText;
}
