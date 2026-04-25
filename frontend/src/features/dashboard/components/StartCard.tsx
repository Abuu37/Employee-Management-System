type StartCardProps = {
  title: string;
  value: string;
  extra: string;
};

function StartCard({ title, value, extra }: StartCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2>
      <p className="mt-2 text-xs text-blue-600">{extra}</p>
    </article>
  );
}

export default StartCard;
