import { useMemo } from "react";

type CountInput = number | null | undefined;

interface UseTableCountBadgeOptions {
  total?: CountInput;
  fallbackTotal?: CountInput;
  hideWhenZero?: boolean;
}

// Utility hook to calculate count and visibility for table count badges
export const TABLE_COUNT_BADGE_CLASS =
  "inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-linear-to-r from-blue-50 to-sky-100 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm";

// Example usage: <span className={TABLE_COUNT_BADGE_CLASS}>{count}</span>
export const TABLE_HEADER_CELL_CLASS =
  "border-r border-white/30 px-5 py-3 font-medium last:border-r-0";

// Usage in a component:
export function useTableCountBadge({
  total,
  fallbackTotal,
  hideWhenZero = false,
}: UseTableCountBadgeOptions) {
  return useMemo(() => {
    const primary = Number(total);
    const fallback = Number(fallbackTotal);

    const normalized = Number.isFinite(primary)
      ? primary
      : Number.isFinite(fallback)
        ? fallback
        : 0;

    const count = Math.max(0, Math.trunc(normalized));
    const visible = hideWhenZero ? count > 0 : true;

    return {
      count,
      visible,
    };
  }, [total, fallbackTotal, hideWhenZero]);
}
