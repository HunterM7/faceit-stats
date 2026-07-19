/**
 * Offset вставки по координатам указателя: маркеры `[data-insert-offset]` (между буквами).
 */
export function getInsertOffsetFromPoint(
  surface: HTMLElement,
  clientX: number,
  clientY: number,
): number {
  const marks = [ ...surface.querySelectorAll<HTMLElement>('[data-insert-offset]') ];
  if (!marks.length) {
    return 0;
  }

  const onRow = marks.filter((mark) => {
    const rect = mark.getBoundingClientRect();
    return clientY >= rect.top - 6 && clientY <= rect.bottom + 6;
  });
  const pool = onRow.length > 0 ? onRow : marks;

  let bestOffset = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const mark of pool) {
    const offset = Number(mark.dataset.insertOffset);
    if (Number.isNaN(offset)) {
      continue;
    }
    const rect = mark.getBoundingClientRect();
    const anchorX = rect.left + Math.min(rect.width, 2) / 2;
    const distance = Math.abs(clientX - anchorX);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestOffset = offset;
    }
  }

  return bestOffset;
}
