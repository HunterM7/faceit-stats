import type { TemplatePlaceholderSegment, TemplateSegment } from './parseTemplateSegments';
import { parseTemplateSegments } from './parseTemplateSegments';
import { serializeTemplateSegments } from './serializeTemplateSegments';
import { avoidSplittingPlaceholderTokens } from './avoidSplittingPlaceholderTokens';

/**
 * Вставляет (или переносит) чип плейсхолдера в строковый offset шаблона.
 * Offset считается по сериализованной строке без этого чипа.
 */
export function insertPlaceholderAtOffset(
  segments: readonly TemplateSegment[],
  placeholder: TemplatePlaceholderSegment,
  offset: number,
): TemplateSegment[] {
  const without = segments.filter((segment) => segment.id !== placeholder.id);
  const text = serializeTemplateSegments(without);
  const safeOffset = avoidSplittingPlaceholderTokens(text, offset);
  const nextText = `${text.slice(0, safeOffset)}{${placeholder.name}}${text.slice(safeOffset)}`;
  const parsed = parseTemplateSegments(nextText);

  return parsed.map((segment) => (
    segment.type === 'placeholder' && segment.name === placeholder.name
      ? { ...segment, id: placeholder.id }
      : segment
  ));
}
