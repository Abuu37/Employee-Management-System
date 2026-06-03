import { isValidElement, type ReactNode } from "react";
import type { IconType } from "react-icons";

export interface ActionMenuItemConfig {
  label: string;
  icon?: IconType | ReactNode;
  onClick: () => void;
  danger?: boolean;
  variant?: "default" | "danger";
  hidden?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
}

interface ActionMenuItemProps {
  item: ActionMenuItemConfig;
  onSelect: () => void;
}

export default function ActionMenuItem({
  item,
  onSelect,
}: ActionMenuItemProps) {
  const isDanger = item.danger || item.variant === "danger";
  const shouldShowDivider = item.dividerBefore ?? isDanger;

  const renderIcon = () => {
    if (!item.icon) return null;

    if (isValidElement(item.icon)) {
      return <span className="shrink-0">{item.icon}</span>;
    }

    const Icon = item.icon as IconType;
    return (
      <span className="shrink-0">
        <Icon className={`h-4 w-4 ${isDanger ? "" : "text-blue-500"}`} />
      </span>
    );
  };

  return (
    <>
      {shouldShowDivider ? (
        <div className="my-1 border-t border-slate-100" />
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        disabled={item.disabled}
        className={`flex w-full items-center gap-2.5 px-4 py-2 text-sm transition ${
          isDanger
            ? "text-red-600 hover:bg-red-50 hover:text-red-700"
            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {renderIcon()}
        <span>{item.label}</span>
      </button>
    </>
  );
}
