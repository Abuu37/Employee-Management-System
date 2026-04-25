const NAVY = "#1e3a5f";
const BLUE = "#2563eb";

export default function StatCard({
  label,
  value,
  icon,
  color,
  subtitle,
  extra,
  extraClassName,
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
  if (featured) {
    return (
      <article
        className="rounded-2xl p-5 shadow-md"
        style={{ background: NAVY }}
      >
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
            {label}
          </p>
          <span
            className="rounded-full w-8 h-8 flex items-center justify-center shadow shrink-0"
            style={{ background: BLUE }}
          >
            <span className="text-white [&>svg]:h-3.5 [&>svg]:w-3.5">
              {icon}
            </span>
          </span>
        </div>
        <p className="text-4xl font-black leading-none text-white">{value}</p>
        {subtitle && <p className="text-xs text-blue-300 mt-2">{subtitle}</p>}
        {extra && (
          <p
            className={`text-xs font-semibold mt-1.5 ${extraClassName ?? "text-emerald-300"}`}
          >
            {extra}
          </p>
        )}
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${color}`}
        >
          <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        </div>
      </div>
      <p className="text-4xl font-black leading-none text-slate-800">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
      {extra && (
        <p
          className={`text-xs font-semibold mt-1.5 ${extraClassName ?? "text-blue-600"}`}
        >
          {extra}
        </p>
      )}
    </article>
  );
}
