import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { LeaveTrendRecord } from "@/features/Report/types/leaveReport.types";
import { FiTrendingUp, FiBarChart2, FiInbox } from "react-icons/fi";

const toNumber = (v: string | number) => Number(v) || 0;

const fmtMonthShort = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    month: "short",
  });

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const parseMonthDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

function SkeletonChart({ height = 220 }: { height?: number }) {
  return (
    <div className="animate-pulse rounded-xl bg-slate-100" style={{ height }} />
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12">
      <FiInbox className="h-8 w-8 text-slate-300" />
      <p className="text-xs text-slate-400">No trend data available</p>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-lg text-xs">
      <p className="mb-2 font-semibold text-slate-700">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="capitalize text-slate-600">
            {p.name}: <strong>{p.value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

const COLORS = {
  approved: "#10b981",
  pending: "#f59e0b",
  rejected: "#ef4444",
  annual: "#3b82f6",
  sick: "#06b6d4",
  casual: "#8b5cf6",
  emergency: "#fb7185",
  unpaid: "#94a3b8",
};

interface Props {
  data: LeaveTrendRecord[];
  loading: boolean;
}

export default function LeaveReportCharts({ data, loading }: Props) {
  const parsedRows = data
    .map((d) => {
      const date = parseMonthDate(d.month);
      if (!date) return null;

      return {
        date,
        key: monthKey(date),
        approved: toNumber(d.approved),
        pending: toNumber(d.pending),
        rejected: toNumber(d.rejected),
        annual: toNumber(d.annual),
        sick: toNumber(d.sick),
        casual: toNumber(d.casual),
        emergency: toNumber(d.emergency),
        unpaid: toNumber(d.unpaid),
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  const rowsByMonth = parsedRows.reduce<
    Record<string, (typeof parsedRows)[number]>
  >((acc, row) => {
    if (!acc[row.key]) {
      acc[row.key] = { ...row };
    } else {
      acc[row.key].approved += row.approved;
      acc[row.key].pending += row.pending;
      acc[row.key].rejected += row.rejected;
      acc[row.key].annual += row.annual;
      acc[row.key].sick += row.sick;
      acc[row.key].casual += row.casual;
      acc[row.key].emergency += row.emergency;
      acc[row.key].unpaid += row.unpaid;
    }
    return acc;
  }, {});

  const anchorDate =
    parsedRows.length > 0
      ? parsedRows
          .map((row) => row.date)
          .reduce((max, curr) => (curr > max ? curr : max), parsedRows[0].date)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const sixMonthTrendData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(
      anchorDate.getFullYear(),
      anchorDate.getMonth() - (5 - i),
      1,
    );
    const key = monthKey(d);
    const row = rowsByMonth[key];
    return {
      month: fmtMonthShort(d),
      approved: row?.approved ?? 0,
      pending: row?.pending ?? 0,
      rejected: row?.rejected ?? 0,
    };
  });

  const leaveTypeMixData = [
    {
      type: "Annual",
      value: parsedRows.reduce((sum, row) => sum + row.annual, 0),
      color: COLORS.annual,
    },
    {
      type: "Casual",
      value: parsedRows.reduce((sum, row) => sum + row.casual, 0),
      color: COLORS.casual,
    },
    {
      type: "Sick",
      value: parsedRows.reduce((sum, row) => sum + row.sick, 0),
      color: COLORS.sick,
    },
    {
      type: "Emergency",
      value: parsedRows.reduce((sum, row) => sum + row.emergency, 0),
      color: COLORS.emergency,
    },
    {
      type: "Unpaid",
      value: parsedRows.reduce((sum, row) => sum + row.unpaid, 0),
      color: COLORS.unpaid,
    },
  ].filter((row) => row.value > 0);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <FiTrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Monthly Leave Status
            </h3>
            <p className="text-xs text-slate-400">
              Approved, pending, and rejected trends
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonChart />
        ) : parsedRows.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={sixMonthTrendData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                {(["approved", "pending", "rejected"] as const).map((k) => (
                  <linearGradient
                    key={k}
                    id={`leave-grad-${k}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS[k]}
                      stopOpacity={0.24}
                    />
                    <stop offset="95%" stopColor={COLORS[k]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="approved"
                stroke={COLORS.approved}
                fill="url(#leave-grad-approved)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: "#ffffff",
                  stroke: COLORS.approved,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 4,
                  fill: "#ffffff",
                  stroke: COLORS.approved,
                  strokeWidth: 2,
                }}
              />
              <Area
                type="monotone"
                dataKey="pending"
                stroke={COLORS.pending}
                fill="url(#leave-grad-pending)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: "#ffffff",
                  stroke: COLORS.pending,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 4,
                  fill: "#ffffff",
                  stroke: COLORS.pending,
                  strokeWidth: 2,
                }}
              />
              <Area
                type="monotone"
                dataKey="rejected"
                stroke={COLORS.rejected}
                fill="url(#leave-grad-rejected)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: "#ffffff",
                  stroke: COLORS.rejected,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 4,
                  fill: "#ffffff",
                  stroke: COLORS.rejected,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <FiBarChart2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Leave Type Mix
            </h3>
            <p className="text-xs text-slate-400">Distribution by leave type</p>
          </div>
        </div>

        {loading ? (
          <SkeletonChart />
        ) : leaveTypeMixData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={leaveTypeMixData}
              layout="vertical"
              barSize={16}
              margin={{ top: 4, right: 28, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="leave-bar-track"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#e2e8f0" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0.25} />
                </linearGradient>
                <filter
                  id="leave-bar-shadow"
                  x="-20%"
                  y="-100%"
                  width="160%"
                  height="260%"
                >
                  <feDropShadow
                    dx="0"
                    dy="-1"
                    stdDeviation="1.2"
                    floodColor="#94a3b8"
                    floodOpacity="0.25"
                  />
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[
                  0,
                  (dataMax: number) =>
                    Math.max(4, Math.ceil(Number(dataMax) || 0)),
                ]}
                tickCount={5}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="type"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={84}
              />
              <Tooltip content={<ChartTooltip />} cursor={false} />
              <Bar
                dataKey="value"
                radius={0}
                activeBar={{ stroke: "#ffffff", strokeWidth: 2 }}
                background={{ fill: "url(#leave-bar-track)", radius: 0 }}
              >
                {leaveTypeMixData.map((row) => (
                  <Cell
                    key={row.type}
                    fill={row.color}
                    filter="url(#leave-bar-shadow)"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
