import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiBarChart2,
  FiCheckCircle,
  FiInbox,
  FiPieChart,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import type {
  PayrollSummaryRecord,
  PayrollTrendRecord,
} from "@/features/Report/types/payrollReport.types";

// UTILS
const currency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v || 0);

  // Compact number formatting for Y-axis labels
const compactCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

  // Format month labels like "Jan 2024"
const fmtMonth = (year: number, month: number) =>
  new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  // Format month labels like "Jan"
const fmtMonthShort = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    month: "short",
  });

  // Generate a consistent key for month grouping like "2024-01"
const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

// COMPONENTS
function SkeletonChart({ height = 220 }: { height?: number }) {
  return (
    <div className="animate-pulse rounded-xl bg-slate-100" style={{ height }} />
  );
}

// Used when there is no data to show in a chart, or when loading has completed but the result is empty
function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12">
      <FiInbox className="h-8 w-8 text-slate-300" />
      <p className="text-xs text-slate-400">No trend data available</p>
    </div>
  );
}

function EmptyAnalytics({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-55 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
      <FiInbox className="h-8 w-8 text-slate-300" />
      <p className="mt-3 text-sm font-semibold text-slate-600">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{message}</p>
    </div>
  );
}

// Custom tooltip for charts to display formatted values and labels
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    color: string;
    payload?: { fullLabel?: string };
  }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const displayLabel = payload[0]?.payload?.fullLabel || label;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-lg text-xs">
      <p className="mb-2 font-semibold text-slate-700">{displayLabel}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="capitalize text-slate-600">
            {p.name}:{" "}
            <strong>
              {p.name.toLowerCase().includes("salary")
                ? currency(p.value)
                : p.value}
            </strong>
          </span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  data: PayrollTrendRecord[];
  summaryRows: PayrollSummaryRecord[];
  loadingTrends: boolean;
  loadingSummary: boolean;
}

// Main component to display payroll report charts based on provided data and loading states
export default function PayrollReportCharts({
  data,
  summaryRows,
  loadingTrends,
  loadingSummary,
}: Props) {
  const normalizedRows = data
    .map((d) => {
      const year = Number(d.year);
      const month = Number(d.month);
      if ( !Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
        return null;
      }

      const date = new Date(year, month - 1, 1);
      return {
        key: monthKey(date),
        date,
        totalNetSalary: Number(d.total_net_salary) || 0,
        totalGrossSalary:
          (Number(d.total_base_salary) || 0) +
          (Number(d.total_bonus) || 0) +
          (Number(d.total_allowance) || 0),
        totalBaseSalary: Number(d.total_base_salary) || 0,
        employeeCount: Number(d.employee_count) || 0,
        payrollCount: Number(d.payroll_count) || 0,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  const byMonth = normalizedRows.reduce<
    Record<string, (typeof normalizedRows)[number]>
  >((acc, row) => {
    if (!acc[row.key]) {
      acc[row.key] = { ...row };
    } else {
      acc[row.key].totalNetSalary += row.totalNetSalary;
        acc[row.key].totalGrossSalary += row.totalGrossSalary;
      acc[row.key].totalBaseSalary += row.totalBaseSalary;
      acc[row.key].employeeCount += row.employeeCount;
      acc[row.key].payrollCount += row.payrollCount;
    }
    return acc;
  }, {});

  const anchorDate =
    normalizedRows.length > 0
      ? normalizedRows
          .map((row) => row.date)
          .reduce(
            (max, curr) => (curr > max ? curr : max),
            normalizedRows[0].date,
          )
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(
      anchorDate.getFullYear(),
      anchorDate.getMonth() - (5 - i),
      1,
    );
    const key = monthKey(d);
    const row = byMonth[key];

    return {
      label: fmtMonthShort(d),
      fullLabel: fmtMonth(d.getFullYear(), d.getMonth() + 1),
      totalGrossSalary: row?.totalGrossSalary ?? 0,
      totalNetSalary: row?.totalNetSalary ?? 0,
      totalBaseSalary: row?.totalBaseSalary ?? 0,
      employeeCount: row?.employeeCount ?? 0,
      payrollCount: row?.payrollCount ?? 0,
    };
  });

  const hasTrendData = chartData.some(
    (row) => row.totalGrossSalary > 0 || row.totalNetSalary > 0,
  );

  const statusTotals = summaryRows.reduce(
    (acc, row) => {
      acc.processed +=
        (Number(row.total_paid) || 0) + (Number(row.total_approved) || 0);
      acc.pending += Number(row.total_pending) || 0;
      return acc;
    },
    { processed: 0, pending: 0, failed: 0 },
  );

  const statusTotalCount =
    statusTotals.processed + statusTotals.pending + statusTotals.failed;

  const statusData = [
    {
      key: "processed",
      name: "Processed Payrolls",
      value: statusTotals.processed,
      color: "#10b981",
    },
    {
      key: "pending",
      name: "Pending Payrolls",
      value: statusTotals.pending,
      color: "#f59e0b",
    },
    {
      key: "failed",
      name: "Failed Payrolls",
      value: statusTotals.failed,
      color: "#ef4444",
    },
  ];

  const hasStatusData = statusTotalCount > 0;

  const departmentData = Object.values(
    summaryRows.reduce<Record<string, { department: string; totalSalary: number }>>(
      (acc, row) => {
        const dept = row.user?.dept?.name || "Unassigned";
        if (!acc[dept]) {
          acc[dept] = { department: dept, totalSalary: 0 };
        }
        acc[dept].totalSalary += Number(row.total_net_salary) || 0;
        return acc;
      },
      {},
    ),
  )
    .sort((a, b) => b.totalSalary - a.totalSalary)
    .slice(0, 5);

  const hasDepartmentData = departmentData.some((d) => d.totalSalary > 0);

  const totalEmployees = summaryRows.length;
  const employeesPaid = summaryRows.reduce(
    (count, row) => count + ((Number(row.total_paid) || 0) > 0 ? 1 : 0),
    0,
  );
  const coveragePct =
    totalEmployees > 0 ? (employeesPaid / totalEmployees) * 100 : 0;

  const coverageTone =
    coveragePct >= 85
      ? {
          bar: "bg-emerald-500",
          text: "text-emerald-700",
          chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
        }
      : coveragePct >= 60
        ? {
            bar: "bg-amber-500",
            text: "text-amber-700",
            chip: "border-amber-200 bg-amber-50 text-amber-700",
          }
        : {
            bar: "bg-rose-500",
            text: "text-rose-700",
            chip: "border-rose-200 bg-rose-50 text-rose-700",
          };

  const loading = loadingTrends || loadingSummary;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-7">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <FiTrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Monthly Salary Expense
            </h3>
            <p className="text-xs text-slate-400">
              Gross salary and net salary over time
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonChart />
        ) : !hasTrendData ? (
          <EmptyAnalytics
            title="No payroll data available for the selected period"
            message="Generate payroll records to view analytics."
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="payroll-gross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="payroll-net" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                tickFormatter={(v: number) =>
                  v === 0 ? "0" : compactCurrency(v)
                }
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="totalGrossSalary"
                name="Gross Salary"
                stroke="#6366f1"
                fill="url(#payroll-gross)"
                strokeWidth={2}
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
              <Area
                type="monotone"
                dataKey="totalNetSalary"
                name="Net Salary"
                stroke="#10b981"
                fill="url(#payroll-net)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: "#ffffff",
                  stroke: "#10b981",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: "#ffffff",
                  stroke: "#10b981",
                  strokeWidth: 2,
                }}
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <FiPieChart className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Payroll Status Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Processed, pending, and failed payroll status
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonChart />
        ) : !hasStatusData ? (
          <EmptyAnalytics
            title="No payroll status data available"
            message="Generate payroll records to view status distribution."
          />
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const pct = statusTotalCount > 0 ? (Number(value) / statusTotalCount) * 100 : 0;
                    return [`${value} (${pct.toFixed(1)}%)`, name];
                  }}
                />
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={84}
                  paddingAngle={2}
                  animationDuration={700}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {statusData.map((row) => {
                const pct = statusTotalCount > 0 ? (row.value / statusTotalCount) * 100 : 0;
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
                      {row.name}
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

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-7">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
            <FiBarChart2 className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Department Salary Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Salary spending by department
            </p>
          </div>
        </div>

        {loadingSummary ? (
          <SkeletonChart />
        ) : !hasDepartmentData ? (
          <EmptyAnalytics
            title="No department payroll data available"
            message="Generate payroll records to view department-level distribution."
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={departmentData}
              layout="vertical"
              barSize={16}
              margin={{ top: 4, right: 12, left: 28, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => (v === 0 ? "0" : compactCurrency(v))}
              />
              <YAxis
                type="category"
                dataKey="department"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip
                cursor={false}
                formatter={(value: number) => [currency(Number(value) || 0), "Total Salary"]}
              />
              <Bar
                dataKey="totalSalary"
                fill="#6366f1"
                radius={[0, 8, 8, 0]}
                animationDuration={700}
              >
                <LabelList
                  dataKey="totalSalary"
                  position="right"
                  fill="#475569"
                  fontSize={11}
                  formatter={(v: number) => compactCurrency(v)}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <FiTarget className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Payroll Coverage Progress
            </h3>
            <p className="text-xs text-slate-400">
              Employees paid versus total employees
            </p>
          </div>
        </div>

        {loadingSummary ? (
          <SkeletonChart height={180} />
        ) : totalEmployees === 0 ? (
          <EmptyAnalytics
            title="No employee payroll data available"
            message="Generate payroll records to view coverage progress."
          />
        ) : (
          <div className="space-y-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <p className="text-[11px] text-slate-500">Employees Paid</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">{employeesPaid}</p>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <p className="text-[11px] text-slate-500">Total Employees</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">{totalEmployees}</p>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <p className="text-[11px] text-slate-500">Coverage</p>
                <p className={`mt-1 text-lg font-semibold ${coverageTone.text}`}>
                  {coveragePct.toFixed(1)}%
                </p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Payroll completion</span>
                <span className={`rounded-full border px-2 py-0.5 font-semibold ${coverageTone.chip}`}>
                  {coveragePct.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${coverageTone.bar}`}
                  style={{ width: `${Math.min(100, Math.max(0, coveragePct))}%` }}
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
              <FiCheckCircle className="h-4 w-4 text-emerald-500" />
              Managers can quickly track payroll completion at a glance.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
