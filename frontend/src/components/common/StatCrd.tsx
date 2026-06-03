import type { ReactNode } from "react";
import CountUp from "react-countup";

const NAVY = "#1e3a5f";

type StatCrdProps = {
  label: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  subtitle?: string;
  extra?: string;
  extraClassName?: string;
  featured?: boolean;
  onClick?: () => void;
};

export default function StatCrd({
  label,
  value,
  icon,
  color,
  featured = false,
  onClick,
}: StatCrdProps) {
  const iconFrameTone = color.includes("green")
    ? "border-green-200 ring-green-200/70"
    : color.includes("amber")
      ? "border-amber-200 ring-amber-200/70"
      : color.includes("red")
        ? "border-red-200 ring-red-200/70"
        : color.includes("slate")
          ? "border-slate-200 ring-slate-200/70"
          : "border-blue-200 ring-blue-200/70";

  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  const shouldAnimate = Number.isFinite(numericValue);

  if (featured) {
    return (
      <article
        className={`rounded-2xl px-5 py-4 shadow-sm border border-slate-100
        ${onClick ? " cursor-pointer hover:opacity-90 transition-opacity" : ""}`}
        style={{ background: NAVY }}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div
            className="rounded-2xl border border-white/30 p-2.5 bg-white/20
               text-white shadow-sm [&>svg]:h-5 [&>svg]:w-5 flex items-center justify-center"
          >
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-white leading-none">
              {shouldAnimate ? (
                <CountUp
                  end={numericValue}
                  duration={1.2}
                  separator=","
                  preserveValue
                />
              ) : (
                value
              )}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-200 mt-0.5">
              {label}
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm
      ${onClick ? " cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-2xl border ring-1 ring-inset p-2.5 shrink-0 shadow-sm flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5 
          ${iconFrameTone} ${color}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 leading-none">
            {shouldAnimate ? (
              <CountUp
                end={numericValue}
                duration={1.2}
                separator=","
                preserveValue
              />
            ) : (
              value
            )}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-0.5">
            {label}
          </p>
        </div>
      </div>
    </article>
  );
}
