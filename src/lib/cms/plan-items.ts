export type Positioned = { id: string; position: number };

/**
 * Move an item up or down one slot in a run sheet. Returns the position
 * updates to persist (exactly two rows), or [] if the move is out of range.
 */
export function swapPositions(
  items: Positioned[],
  id: string,
  direction: "up" | "down",
): Positioned[] {
  const sorted = [...items].sort((a, b) => a.position - b.position);
  const index = sorted.findIndex((i) => i.id === id);
  if (index === -1) return [];
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= sorted.length) return [];

  return [
    { id: sorted[index].id, position: sorted[target].position },
    { id: sorted[target].id, position: sorted[index].position },
  ];
}

/** Next position for appending an item to the end of the run sheet. */
export function nextPosition(items: Positioned[]): number {
  return items.length ? Math.max(...items.map((i) => i.position)) + 1 : 1;
}
