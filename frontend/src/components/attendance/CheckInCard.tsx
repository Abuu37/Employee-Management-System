import { FiLogIn, FiLogOut } from "react-icons/fi";
import { AttendanceRecord } from "./types";

type Props = {
  userName: string;
  todayRecord: AttendanceRecord | undefined;
  actionLoading: boolean;
  actionMsg: string;
  onCheckIn: () => void;
  onCheckOut: () => void;
};

export default function CheckInCard({
  userName,
  todayRecord,
  actionLoading,
  actionMsg,
  onCheckIn,
  onCheckOut,
}: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Today
          </p>
          <p className="mt-0.5 text-lg font-bold text-slate-800">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back,{" "}
            <span className="font-semibold text-slate-700">{userName}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={actionLoading || !!todayRecord?.check_in}
              onClick={onCheckIn}
              className="inline-flex items-center gap-2 rounded-xl
              bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition
              hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiLogIn className="h-4 w-4" />
              Check In
            </button>
            <button
              type="button"
              disabled={
                actionLoading ||
                !todayRecord?.check_in ||
                !!todayRecord?.check_out
              }
              onClick={onCheckOut}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiLogOut className="h-4 w-4" />
              Check Out
            </button>
          </div>
          {actionMsg && (
            <p className="text-xs font-medium text-blue-600">{actionMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
