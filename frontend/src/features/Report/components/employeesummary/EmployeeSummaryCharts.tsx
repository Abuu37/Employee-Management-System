import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FiBarChart2,
  FiClock,
  FiInbox,
  FiPieChart,
  FiTrendingUp,
} from "react-icons/fi";
import type { EmployeeSummaryData } from "@/features/Report/types/employeeSummaryReport.types";

const BAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
const STATUS_COLORS = {
  active: "#10b981",
  inactive: "#ef4444",
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
      <p className="text-xs text-slate-400">No chart data available</p>
    </div>
  );
}

function fmtMonthShort(date: Date) {
  return date.toLocaleDateString("en-GB", { month: "short" });
}

function fmtMonthYear(date: Date) {
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toTitleLabel(raw: string) {
  return raw
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const mapRows = (
  rows: Array<Record<string, string | number | null | undefined>>,
  labelKey: string,
) =>
  rows
    .map((row) => ({
      label: toTitleLabel(String(row[labelKey] ?? "Unknown")),
      count: Number(row.count) || 0,
    }))
    .filter((row) => row.count > 0);

const mapDepartmentRows = (rows: EmployeeSummaryData["byDepartment"]) =>
  rows
    .map((row) => ({
      label: row.dept?.name ?? "Unassigned",
      count: Number(row.count) || 0,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

const mapStatusRows = (data: EmployeeSummaryData) => {
  const byStatus = data.byStatus
    .map((row) => ({
      key: String(row.status ?? "").toLowerCase(),
      label: toTitleLabel(String(row.status ?? "Unknown")),
      count: Number(row.count) || 0,
    }))
    .filter((row) => row.count > 0);

  if (byStatus.length > 0) {
    return byStatus.map((row) => ({
      ...row,
      color:
        row.key === "active"
          ? STATUS_COLORS.active
          : row.key === "inactive"
            ? STATUS_COLORS.inactive
            : "#6366f1",
    }));
  }

  return [
    {
      key: "active",
      label: "Active",
      count: Number(data.activeCount) || 0,
      color: STATUS_COLORS.active,
    },
    {
      key: "inactive",
      label: "Inactive",
      count: Number(data.inactiveCount) || 0,
      color: STATUS_COLORS.inactive,
    },
  ].filter((row) => row.count > 0);
};

const mapRecentJoinersTrend = (rows: EmployeeSummaryData["recentJoined"]) => {
  const parsed = rows
    .map((row) => {
      if (!row.join_date) return null;
      const d = new Date(row.join_date);
      if (Number.isNaN(d.getTime())) return null;
      return new Date(d.getFullYear(), d.getMonth(), 1);
    })
    .filter((d): d is Date => Boolean(d));

  if (parsed.length === 0) return [];

  const counts = parsed.reduce<Record<string, number>>((acc, date) => {
    const key = monthKey(date);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const anchorDate = parsed.reduce(
    (max, curr) => (curr > max ? curr : max),
    parsed[0],
  );

  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(
      anchorDate.getFullYear(),
      anchorDate.getMonth() - (5 - i),
      1,
    );
    const key = monthKey(d);
    return {
      label: fmtMonthShort(d),
      fullLabel: fmtMonthYear(d),
      count: counts[key] || 0,
    };
  });
};

function SummaryTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: {
    name?: string;
    value?: number;
    color?: string;
    payload?: Record<string, unknown>;
  }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const displayLabel = String(payload[0]?.payload?.fullLabel ?? label ?? "");

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-lg text-xs">
      <p className="mb-2 font-semibold text-slate-700">{displayLabel}</p>
      {payload.map((p, idx) => (
        <div
          key={`${p.name ?? "val"}-${idx}`}
          className="flex items-center gap-1.5"
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color || "#94a3b8" }}
          />
          <span className="capitalize text-slate-600">
            {p.name}: <strong>{Number(p.value) || 0}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function EmployeeSummaryCharts({
  data,
  loading,
}: {
  data: EmployeeSummaryData;
  loading: boolean;
}) {
  const departmentData = mapDepartmentRows(data.byDepartment);
  const employmentTypeData = mapRows(
    data.byEmploymentType as Array<
      Record<string, string | number | null | undefined>
    >,
    "employment_type",
  );
  const statusData = mapStatusRows(data);
  const totalStatus = statusData.reduce((sum, row) => sum + row.count, 0);
  const recentJoinersData = mapRecentJoinersTrend(data.recentJoined);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <FiTrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Department Headcount
            </h3>
            <p className="text-xs text-slate-400">
              Top departments by employee count
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonChart />
        ) : departmentData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={departmentData}
              layout="vertical"
              barSize={12}
              margin={{ top: 4, right: 18, left: 16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip content={<SummaryTooltip />} cursor={false} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Bar
                dataKey="count"
                name="Employees"
                fill="#10b981"
                radius={[0, 8, 8, 0]}
              >
                <LabelList
                  dataKey="count"
                  position="right"
                  fill="#475569"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <FiBarChart2 className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Employment Types
            </h3>
            <p className="text-xs text-slate-400">
              Distribution across contract types
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonChart />
        ) : employmentTypeData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={employmentTypeData}
              barSize={32}
              margin={{ top: 4, right: 16, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="label"
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
              <Tooltip content={<SummaryTooltip />} cursor={false} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Bar dataKey="count" name="Employees" radius={[6, 6, 0, 0]}>
                {employmentTypeData.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  fill="#475569"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <FiPieChart className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Employee Status Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Active versus inactive employee split
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonChart />
        ) : statusData.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const pct =
                      totalStatus > 0 ? (Number(value) / totalStatus) * 100 : 0;
                    return [`${value} (${pct.toFixed(1)}%)`, name];
                  }}
                />
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={84}
                  paddingAngle={2}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {statusData.map((row) => {
                const pct =
                  totalStatus > 0 ? (row.count / totalStatus) * 100 : 0;
                return (
                  <div
                    key={row.key}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      {row.label}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <FiClock className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              New Joiners Trend
            </h3>
            <p className="text-xs text-slate-400">
              Employee onboarding trend by month
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonChart />
        ) : recentJoinersData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={recentJoinersData}
              margin={{ top: 4, right: 16, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="new-joiners-fill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
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
              <Tooltip content={<SummaryTooltip />} cursor={false} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="New Joiners"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#new-joiners-fill)"
                dot={{
                  r: 3,
                  fill: "#ffffff",
                  stroke: "#6366f1",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: "#ffffff",
                  stroke: "#6366f1",
                  strokeWidth: 2,
                }}
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
