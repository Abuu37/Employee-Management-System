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
  return (
    <div
      className="fixed inset-0 z-50"
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
        onClick={onClose}
      />

      {/* Slide panel */}
      <div
        className={`absolute inset-y-0 right-0 w-full max-w-2xl bg-slate-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen && data ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {data && (
          <div className="p-4">
            <PayslipCard data={data} onBack={onClose} />
          </div>
        )}
      </div>
    </div>
  );
}
