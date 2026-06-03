import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AttendanceTrendRecord } from "@/features/Report/types/attendanceReport.types";
import { FiTrendingUp, FiBarChart2, FiInbox } from "react-icons/fi";

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

function SkeletonChart({ height = 200 }: { height?: number }) {
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

// ── Custom tooltip ─────────────────────────────────────────────────────────────
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

// ── Chart config ───────────────────────────────────────────────────────────────
const COLORS = {
  present: "#10b981",
  late: "#f59e0b",
  absent: "#ef4444",
  half_day: "#3b82f6",
};

interface Props {
  data: AttendanceTrendRecord[];
  loading: boolean;
}

export default function AttendanceReportCharts({ data, loading }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    date: fmtDate(d.date),
  }));

  // Aggregate Present vs Absent for bar chart
  const pvaData = data.reduce(
    (acc, d) => {
      const key = fmtDate(d.date);
      const existing = acc.find((a) => a.date === key);
      if (existing) {
        existing.present += d.present + d.late + d.half_day;
        existing.notPresent += d.absent;
      } else {
        acc.push({
          date: key,
          present: d.present + d.late + d.half_day,
          notPresent: d.absent,
        });
      }
      return acc;
    },
    [] as { date: string; present: number; notPresent: number }[],
  );

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {/* Daily Attendance Trends */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <FiTrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Daily Attendance Trends
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown by status over time
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonChart height={220} />
        ) : chartData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                {(["present", "late", "absent", "half_day"] as const).map(
                  (k) => (
                    <linearGradient
                      key={k}
                      id={`grad-${k}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS[k]}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS[k]}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ),
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
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
              {(["present", "late", "absent", "half_day"] as const).map((k) => (
                <Area
                  key={k}
                  type="monotone"
                  dataKey={k}
                  name={
                    k === "half_day"
                      ? "Half Day"
                      : k.charAt(0).toUpperCase() + k.slice(1)
                  }
                  stroke={COLORS[k]}
                  fill={`url(#grad-${k})`}
                  strokeWidth={2}
                  dot={{
                    r: 2.8,
                    strokeWidth: 1.5,
                    stroke: COLORS[k],
                    fill: "#ffffff",
                  }}
                  activeDot={{ r: 4.5, strokeWidth: 1.5, stroke: COLORS[k] }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Present vs Absent Bar Chart */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <FiBarChart2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Present vs Absent
            </h3>
            <p className="text-xs text-slate-400">Daily comparison</p>
          </div>
        </div>

        {loading ? (
          <SkeletonChart height={220} />
        ) : pvaData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={pvaData}
              barSize={14}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="date"
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
              <Bar
                dataKey="present"
                name="Present / Late / Half Day"
                fill={COLORS.present}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="notPresent"
                name="Absent"
                fill={COLORS.absent}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
