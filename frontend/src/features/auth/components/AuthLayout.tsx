import type { ReactNode } from "react";
import "@/features/auth/styles/auth.css";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen flex">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-full lg:w-1/2 login_img_section justify-around items-center">
        <div className="bg-black opacity-20 inset-0 z-0" />
        <div className="w-full max-w-xl mx-auto px-20 flex-col items-center space-y-6">
          <span className="inline-block rounded-full border border-white/40 bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
            Staff Operations Suite
          </span>
          <h1 className="text-white font-extrabold text-4xl xl:text-3xl leading-tight tracking-tight">
            EMS - Employee Management System <br />
            Login
          </h1>
          <p className="max-w-md text-white/90 text-base leading-relaxed">
            One secure place to manage teams, attendance, and daily workforce
            operations.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-white">
        <div className="w-full px-8 md:px-32 lg:px-24">{children}</div>
      </div>
    </div>
  );
}
