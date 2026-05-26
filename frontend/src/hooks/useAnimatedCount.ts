import { useEffect, useRef, useState } from "react";

interface UseAnimatedCountOptions {
  durationMs?: number;
  decimals?: number;
  enabled?: boolean;
}

const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export function useAnimatedCount(
  value: number,
  options: UseAnimatedCountOptions = {},
) {
  const { durationMs = 500, decimals = 0, enabled = true } = options;
  const safeValue = Number.isFinite(value) ? value : 0;

  // Always start from 0 so the count-up animation is always visible on mount
  const [displayValue, setDisplayValue] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    currentRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    const target = roundTo(safeValue, decimals);

    if (!enabled) {
      currentRef.current = target;
      setDisplayValue(target);
      return;
    }

    const from = currentRef.current;
    if (from === target) return;

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const interpolated = from + (target - from) * eased;
      const next = progress >= 1 ? target : roundTo(interpolated, decimals);

      currentRef.current = next;
      setDisplayValue(next);

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [decimals, durationMs, enabled, safeValue]);

  return displayValue;
}
