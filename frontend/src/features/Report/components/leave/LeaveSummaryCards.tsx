import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiTrendingUp,
} from "react-icons/fi";
import type { LeaveCardStats } from "@/features/Report/types/leaveReport.types";
import { useAnimatedCount } from "@/hooks/useAnimatedCount";

interface CardDef {
  key: keyof LeaveCardStats;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  format?: (v: number) => string;
}

const CARDS: CardDef[] = [
  {
    key: "totalRequests",
    label: "Total Requests",
    icon: <FiCalendar className="h-5 w-5" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "totalApproved",
    label: "Approved",
    icon: <FiCheckCircle className="h-5 w-5" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "totalPending",
    label: "Pending",
    icon: <FiClock className="h-5 w-5" />,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    key: "totalRejected",
    label: "Rejected",
    icon: <FiXCircle className="h-5 w-5" />,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    key: "approvedDays",
    label: "Approved Days",
    icon: <FiTrendingUp className="h-5 w-5" />,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    format: (v) => `${Math.round(v)}d`,
  },
];

interface Props {
  stats: LeaveCardStats;
  loading: boolean;
}

function SummaryCard({ card, raw }: { card: CardDef; raw: number }) {
  const animatedValue = useAnimatedCount(raw, { durationMs: 800, decimals: 0 });
  const display = card.format
    ? card.format(animatedValue)
    : String(Math.round(animatedValue));

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
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
            {display}
          </p>
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
          <div className="h-6 w-12 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function LeaveSummaryCards({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {CARDS.map((c) => (
          <SkeletonCard key={c.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      {CARDS.map((card) => {
        const raw = stats[card.key] as number;
        return <SummaryCard key={card.key} card={card} raw={raw} />;
      })}
    </div>
  );
}
