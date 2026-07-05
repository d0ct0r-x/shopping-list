// ItemRow, GhostItemRow, and the drag-reorder overlay all render at this
// fixed height (min-h-14 = 56px, plus an 8px bottom margin) — shared so
// FlatList's getItemLayout and the reorder math agree on row positions.
export const ROW_TOTAL_HEIGHT = 64;
