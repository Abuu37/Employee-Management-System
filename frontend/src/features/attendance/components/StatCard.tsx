const NAVY = "#1e3a5f";

export default function StatCard({
  label,
  value,
  icon,
  color,
  featured = false,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  extra?: string;
  extraClassName?: string;
  featured?: boolean;
}) {
  const iconFrameTone = color.includes("green")
    ? "border-green-200 ring-green-200/70"
    : color.includes("amber")
      ? "border-amber-200 ring-amber-200/70"
      : color.includes("red")
        ? "border-red-200 ring-red-200/70"
        : color.includes("slate")
          ? "border-slate-200 ring-slate-200/70"
          : "border-blue-200 ring-blue-200/70";

  if (featured) {
    return (
      <article
        className="rounded-2xl px-5 py-4 shadow-sm border border-slate-100"
        style={{ background: NAVY }}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/30 p-2.5 bg-white/20 text-white shadow-sm [&>svg]:h-5 [&>svg]:w-5 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-white leading-none">
              {value}
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
    <article className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-2xl border ring-1 ring-inset p-2.5 shrink-0 shadow-sm flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5 ${iconFrameTone} ${color}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 leading-none">
            {value}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-0.5">
            {label}
          </p>
        </div>
      </div>
    </article>
  );
}
