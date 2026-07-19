import type { TemplateSegment, TemplateTextSegment } from './parseTemplateSegments';

/**
 * Ближайший текстовый сегмент слева (`-1`) или справа (`1`) от `fromIndex`.
 */
export function findAdjacentTextSegment(
  segments: readonly TemplateSegment[],
  fromIndex: number,
  direction: -1 | 1,
): TemplateTextSegment | null {
  for (
    let index = fromIndex + direction;
    index >= 0 && index < segments.length;
    index += direction
  ) {
    const segment = segments[index];
    if (segment?.type === 'text') {
      return segment;
    }
  }
  return null;
}
