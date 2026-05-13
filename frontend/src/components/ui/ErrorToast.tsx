import { useEffect, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import toast, { useToaster } from "react-hot-toast";
import errorIcon from "@/assets/icons/error.json";

/* ── Single animated error card ── */
function ErrorCard({ message, toastId }: { message: string; toastId: string }) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    lottieRef.current?.goToAndPlay(0, true);
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3 shadow-xl min-w-70 max-w-sm">
      <Lottie
        lottieRef={lottieRef}
        animationData={errorIcon}
        loop={false}
        autoplay={false}
        style={{ width: 40, height: 40, flexShrink: 0 }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-700">Error</p>
        <p className="text-xs text-slate-500 leading-snug mt-0.5 truncate">
          {message}
        </p>
      </div>
      <button
        onClick={() => toast.dismiss(toastId)}
        className="text-slate-400 hover:text-slate-600 transition text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

/* ── Drop-in replacement for the default Toaster error style ── */
export function AnimatedErrorToaster() {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause } = handlers;

  const errorToasts = toasts.filter((t) => t.type === "error" && t.visible);

  if (errorToasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-9999 flex flex-col gap-2"
      onMouseEnter={startPause}
      onMouseLeave={endPause}
    >
      {errorToasts.map((t) => (
        <ErrorCard
          key={t.id}
          toastId={t.id}
          message={
            typeof t.message === "string"
              ? t.message
              : "An unexpected error occurred."
          }
        />
      ))}
    </div>
  );
}
