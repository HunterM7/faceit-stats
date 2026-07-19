import type { EloPlaceholderName } from './twitchCommandTemplates';
import { ELO_PLACEHOLDER_NAMES } from './twitchCommandTemplates';

/** Текстовый фрагмент шаблона (редактируется). */
export interface TemplateTextSegment {
  type: 'text';
  id: string;
  value: string;
}

/** Неизменяемый плейсхолдер-чип. */
export interface TemplatePlaceholderSegment {
  type: 'placeholder';
  id: string;
  name: EloPlaceholderName;
}

export type TemplateSegment = TemplateTextSegment | TemplatePlaceholderSegment;

const PLACEHOLDER_RE = /\{(elo|level)\}/g;
const PLACEHOLDER_SET = new Set<string>(ELO_PLACEHOLDER_NAMES);

function createSegmentId(): string {
  return crypto.randomUUID();
}

function isPlaceholderName(value: string): value is EloPlaceholderName {
  return PLACEHOLDER_SET.has(value);
}

/**
 * Склеивает соседний текст, добавляет пустые текстовые слоты у краёв и между чипами.
 */
export function normalizeTemplateSegments(segments: readonly TemplateSegment[]): TemplateSegment[] {
  const merged: TemplateSegment[] = [];

  for (const segment of segments) {
    if (segment.type === 'text') {
      const last = merged[merged.length - 1];
      if (last?.type === 'text') {
        last.value += segment.value;
        continue;
      }
      merged.push({ type: 'text', id: segment.id, value: segment.value });
      continue;
    }
    merged.push(segment);
  }

  const withGaps: TemplateSegment[] = [];
  for (let index = 0; index < merged.length; index += 1) {
    const segment = merged[index];
    if (!segment) {
      continue;
    }
    if (segment.type === 'placeholder' && withGaps[withGaps.length - 1]?.type !== 'text') {
      withGaps.push({ type: 'text', id: createSegmentId(), value: '' });
    }
    withGaps.push(segment);
    if (
      segment.type === 'placeholder'
      && merged[index + 1]?.type === 'placeholder'
    ) {
      withGaps.push({ type: 'text', id: createSegmentId(), value: '' });
    }
  }

  if (withGaps[0]?.type !== 'text') {
    withGaps.unshift({ type: 'text', id: createSegmentId(), value: '' });
  }
  if (withGaps[withGaps.length - 1]?.type !== 'text') {
    withGaps.push({ type: 'text', id: createSegmentId(), value: '' });
  }

  return withGaps;
}

/**
 * Разбирает строку шаблона на текст и чипы `{elo}` / `{level}`.
 */
export function parseTemplateSegments(text: string): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(PLACEHOLDER_RE)) {
    const name = match[1];
    const matchIndex = match.index ?? 0;
    if (!name || !isPlaceholderName(name)) {
      continue;
    }
    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        id: createSegmentId(),
        value: text.slice(lastIndex, matchIndex),
      });
    }
    segments.push({
      type: 'placeholder',
      id: createSegmentId(),
      name,
    });
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < text.length || segments.length === 0) {
    segments.push({
      type: 'text',
      id: createSegmentId(),
      value: text.slice(lastIndex),
    });
  }

  return normalizeTemplateSegments(segments);
}
