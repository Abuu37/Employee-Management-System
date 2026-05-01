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
  if (featured) {
    return (
      <article
        className="rounded-2xl px-5 py-4 shadow-sm border border-slate-100"
        style={{ background: NAVY }}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2.5 bg-white/20 text-white [&>svg]:h-5 [&>svg]:w-5 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-white leading-none">
              {value}
            </p>
            <p className="text-xs text-blue-200 mt-0.5">{label}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-xl p-2.5 shrink-0 flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5 ${color}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 leading-none">
            {value}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        </div>
      </div>
    </article>
  );
}
