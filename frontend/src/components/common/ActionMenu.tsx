import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FiMenu } from "react-icons/fi";
import ActionMenuItem, { type ActionMenuItemConfig } from "./ActionMenuItem";

interface ActionMenuProps {
  items: ActionMenuItemConfig[];
  ariaLabel?: string;
  buttonClassName?: string;
  menuClassName?: string;
  triggerIcon?: ReactNode;
  align?: "start" | "center" | "end";
}

export default function ActionMenu({
  items,
  ariaLabel = "Open actions menu",
  buttonClassName,
  menuClassName,
  triggerIcon,
  align = "end",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const visibleItems = useMemo(
    () => items.filter((item) => !item.hidden),
    [items],
  );
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close();
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, close]);

  if (visibleItems.length === 0) {
    return null;
  }

  const alignClass =
    align === "center"
      ? "justify-center"
      : align === "start"
        ? "justify-start"
        : "justify-end";

  return (
    <div ref={rootRef} className={`relative flex w-full ${alignClass}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/40 transition
					focus:outline-none focus:ring-2 focus:ring-blue-300 ${
            open
              ? "bg-[#183757] text-white"
              : "bg-[#1e3a5f] text-blue-100 hover:bg-[#254a77]"
          } ${buttonClassName ?? ""}`}
      >
        {triggerIcon ?? <FiMenu className="h-4 w-4" />}
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-9 z-50 min-w-40 origin-top-right rounded-xl border border-slate-100 bg-white py-1
					shadow-lg shadow-slate-200/80 transition-all duration-150 ${
            open
              ? "pointer-events-auto scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0"
          } ${menuClassName ?? ""}`}
      >
        {visibleItems.map((item, index) => (
          <ActionMenuItem
            key={`${item.label}-${index}`}
            item={item}
            onSelect={() => {
              close();
              item.onClick();
            }}
          />
        ))}
      </div>
    </div>
  );
}

export type { ActionMenuItemConfig };
