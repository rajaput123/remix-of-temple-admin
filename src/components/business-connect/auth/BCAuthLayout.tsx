import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BCAuthLayoutProps {
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
  backLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function BCAuthLayout({
  title,
  subtitle,
  step,
  totalSteps,
  onBack,
  backLabel = "Back",
  children,
  footer,
}: BCAuthLayoutProps) {
  const showProgress = step != null && totalSteps != null && totalSteps > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fb] text-slate-900 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-[#f7f8fb] to-[#eef2ff]"
      />

      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4">
        <div className="flex items-center gap-3">
          {onBack ? (
            <Button type="button" variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          ) : (
            <Link to="/login" className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#2563eb] shadow-sm">
                <span className="block h-3.5 w-3.5 rounded-sm bg-white/90" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight hidden sm:inline">
                Digi Devalaya <span className="font-normal text-slate-500">Business</span>
              </span>
            </Link>
          )}
        </div>
        {showProgress && (
          <span className="text-xs font-medium text-slate-500">
            Step {step} of {totalSteps}
          </span>
        )}
      </header>

      {showProgress && (
        <div className="relative z-10 px-4 sm:px-8 pb-2">
          <div className="mx-auto max-w-md h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#2563eb] transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.12)] p-6 sm:p-8">
            <div className="mb-6 text-center sm:text-left">
              <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-slate-900">{title}</h1>
              {subtitle && <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{subtitle}</p>}
            </div>
            {children}
          </div>
          {footer && <div className="mt-5">{footer}</div>}
        </div>
      </main>

      <footer className="relative z-10 px-4 sm:px-8 py-4 text-center text-[11px] text-slate-400">
        © Keehoo Industries · Digidevalaya Business Connect
      </footer>
    </div>
  );
}

export function AuthFieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-[11px] font-semibold tracking-wider text-slate-500 mb-1.5")}
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export function AuthPrimaryButton({
  children,
  disabled,
  loading,
  type = "submit",
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <Button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full h-12 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium shadow-sm"
    >
      {loading ? "Please wait…" : children}
    </Button>
  );
}

export function AuthError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
      {message}
    </p>
  );
}
