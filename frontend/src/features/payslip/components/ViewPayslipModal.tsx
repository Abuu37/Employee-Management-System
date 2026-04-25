import PayslipCard from "./PayslipCard";

interface ViewPayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export default function ViewPayslipModal({
  isOpen,
  onClose,
  data,
}: ViewPayslipModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-50 p-4 shadow-xl">
        <PayslipCard data={data} onBack={onClose} />
      </div>
    </div>
  );
}
