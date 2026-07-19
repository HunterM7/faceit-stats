/**
 * Смещает offset наружу, если он попал внутрь токена `{elo}` / `{level}`.
 */
export function avoidSplittingPlaceholderTokens(text: string, offset: number): number {
  const clamped = Math.max(0, Math.min(offset, text.length));
  const re = /\{(elo|level)\}/g;

  for (const match of text.matchAll(re)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (clamped > start && clamped < end) {
      return clamped - start < end - clamped ? start : end;
    }
  }

  return clamped;
}
