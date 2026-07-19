import type { TemplateSegment } from './parseTemplateSegments';

/**
 * Собирает сегменты шаблона обратно в строку с `{elo}` / `{level}`.
 */
export function serializeTemplateSegments(segments: readonly TemplateSegment[]): string {
  return segments
    .map((segment) => (
      segment.type === 'placeholder'
        ? `{${segment.name}}`
        : segment.value
    ))
    .join('');
}
