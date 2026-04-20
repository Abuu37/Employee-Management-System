import { useRef } from "react";
import { FiDownload } from "react-icons/fi";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface PayslipRecord {
  id: number;
  user_id: number;
  month: number;
  year: number;
  base_salary: string;
  bonus: string;
  allowance: string;
  deductions: string;
  tax: string;
  net_salary: string;
  status: string;
  approved_at?: string;
  paid_at?: string;
  created_at?: string;
}

const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const fmt = (v: number) =>
  v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function PayslipCard({
  data,
  onBack,
}: {
  data: PayslipRecord;
  onBack: () => void;
}) {
  const userName = localStorage.getItem("user-name") ?? "-";
  const userRole = localStorage.getItem("user-role") ?? "-";
  const userId = localStorage.getItem("user-id") ?? "-";
  const userEmail = localStorage.getItem("user-email") ?? "-";

  const base = Number(data.base_salary);
  const bonus = Number(data.bonus);
  const allowance = Number(data.allowance);
  const deductions = Number(data.deductions);
  const tax = Number(data.tax);
  const net = Number(data.net_salary);
  const gross = base + bonus + allowance;
  // For PDF generation
  const payslipRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!payslipRef.current) return;

    const canvas = await html2canvas(payslipRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Payslip_${monthNames[data.month]}_${data.year}.pdf`);
  };

  const paymentDate = data.paid_at
    ? new Date(data.paid_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div
      className="mx-auto max-w-3xl space-y-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <FiDownload className="h-4 w-4" />
          Download PDF
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Payslip document */}
      <div
        ref={payslipRef}
        className="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        {/* Title */}
        <div className="border-b border-blue-100 bg-blue-600 px-6 py-3.5 rounded-t-xl">
          <h2 className="text-base font-semibold text-white">
            Payslip Details
          </h2>
        </div>
        {/* Period bar + Company header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Payroll Period</p>
              <p className="text-base font-semibold text-slate-900">
                {monthNames[data.month]} {data.year}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg
                  bg-blue-600 text-xs font-bold text-white"
              >
                EMS
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">EMS</h2>
                <p className="text-sm text-slate-500">
                  Employee Management System
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body: Employee Info + Earnings/Deductions */}
        <div className="grid grid-cols-1 gap-5 px-6 py-5 md:grid-cols-3">
          {/* Left column — Employee Info */}
          <div className="md:col-span-1">
            <h3 className="mb-2.5 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
              Employee Information
            </h3>
            <div className="space-y-2.5 text-sm">
              <div>
                <p className="text-slate-400">Employee Name</p>
                <p className="font-medium text-slate-800">{userName}</p>
              </div>
              <div>
                <p className="text-slate-400">Employee ID</p>
                <p className="font-medium text-slate-800">
                  EMP-{String(userId).padStart(3, "0")}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Role</p>
                <p className="font-medium capitalize text-slate-800">
                  {userRole}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Email</p>
                <p className="font-medium text-slate-800">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Right column — Earnings & Deductions */}
          <div className="space-y-4 md:col-span-2">
            {/* Earnings */}
            <div>
              <h3
                className="mb-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold
                  text-emerald-700 uppercase tracking-wide"
              >
                Earnings
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Base Salary</td>
                    <td className="py-2 text-right font-medium text-slate-900">
                      {fmt(base)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Allowance</td>
                    <td className="py-2 text-right font-medium text-slate-900">
                      {fmt(allowance)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Bonus</td>
                    <td className="py-2 text-right font-medium text-slate-900">
                      {fmt(bonus)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-1.5 flex justify-between border-t border-slate-200 pt-1.5 text-sm font-bold">
                <span className="text-slate-900">TOTAL GROSS INCOME</span>
                <span className="text-slate-900">{fmt(gross)}</span>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="mb-1.5 rounded-md bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 uppercase tracking-wide">
                Deductions
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Tax</td>
                    <td className="py-2 text-right font-medium text-red-500">
                      {fmt(tax)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Other Deductions</td>
                    <td className="py-2 text-right font-medium text-red-500">
                      {fmt(deductions - tax > 0 ? deductions - tax : 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-1.5 flex justify-between border-t border-slate-200 pt-1.5 text-sm font-bold">
                <span className="text-slate-900">TOTAL DEDUCTIONS</span>
                <span className="text-red-500">{fmt(deductions)}</span>
              </div>
            </div>

            {/* Net Pay */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-5 py-3.5">
              <p className="mb-0.5 text-sm text-blue-500">Net Pay Summary</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">
                  NET PAY
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {fmt(net)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
