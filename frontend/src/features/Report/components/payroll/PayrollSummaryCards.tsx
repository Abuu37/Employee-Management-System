import {
  FiCheckCircle,
  FiDollarSign,
  FiPieChart,
  FiUsers,
} from "react-icons/fi";
import type {
  PayrollCardStats,
  PayrollSummaryRecord,
} from "@/features/Report/types/payrollReport.types";
import { useAnimatedCount } from "@/hooks/useAnimatedCount";

interface MetricCard {
  key:
    | "totalPayrollAmount"
    | "employeesPaid"
    | "averageSalary"
    | "payrollCoverage";
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  isCurrency?: boolean;
  color: string;
  bg: string;
}

const currency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v || 0);

const numberFmt = (v: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(v || 0);

const percentFmt = (v: number) => `${v.toFixed(1)}%`;

function SummaryCard({ card }: { card: MetricCard }) {
  const decimals = card.key === "payrollCoverage" ? 1 : 0;
  const animatedValue = useAnimatedCount(card.value, {
    durationMs: 800,
    decimals,
  });

  const displayValue = card.isCurrency
    ? currency(animatedValue)
    : card.key === "payrollCoverage"
      ? percentFmt(animatedValue)
      : `${numberFmt(animatedValue)}${card.suffix ? ` ${card.suffix}` : ""}`;

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bg} ${card.color}`}
        >
          {card.icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 leading-tight">
            {card.label}
          </p>
          <p className={`mt-1 text-2xl font-bold leading-none ${card.color}`}>
            {displayValue}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">{card.subLabel}</p>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded bg-slate-100" />
          <div className="h-6 w-20 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function PayrollSummaryCards({
  stats,
  summaryRows,
  loading,
}: {
  stats: PayrollCardStats;
  summaryRows: PayrollSummaryRecord[];
  loading: boolean;
}) {
  const totalEmployees = summaryRows.length;
  const employeesPaid = summaryRows.reduce(
    (count, row) => count + ((Number(row.total_paid) || 0) > 0 ? 1 : 0),
    0,
  );
  const averageSalary =
    totalEmployees > 0 ? stats.totalNetSalary / totalEmployees : 0;
  const payrollCoverage =
    totalEmployees > 0 ? (employeesPaid / totalEmployees) * 100 : 0;

  const cards: MetricCard[] = [
    {
      key: "totalPayrollAmount",
      label: "Total Payroll Amount",
      subLabel: "Total salary paid this period",
      icon: <FiDollarSign className="h-5 w-5" />,
      value: stats.totalNetSalary,
      isCurrency: true,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      key: "employeesPaid",
      label: "Employees Paid",
      subLabel: "Successfully paid employees",
      icon: <FiUsers className="h-5 w-5" />,
      value: employeesPaid,
      suffix: "Employees",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      key: "averageSalary",
      label: "Average Salary",
      subLabel: "Average salary per employee",
      icon: <FiCheckCircle className="h-5 w-5" />,
      value: averageSalary,
      isCurrency: true,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      key: "payrollCoverage",
      label: "Payroll Coverage",
      subLabel: "Coverage of payroll completion",
      icon: <FiPieChart className="h-5 w-5" />,
      value: payrollCoverage,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <SkeletonCard key={c.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard key={card.key} card={card} />
      ))}
    </div>
  );
}
