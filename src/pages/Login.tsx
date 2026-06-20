import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPostLoginRoute, preparePostLoginOnboarding } from "@/lib/onboardingFlow";

type LoginRole = "super-admin" | "temple-admin";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") as LoginRole | null;
  const role: LoginRole = roleParam === "temple-admin" ? "temple-admin" : "super-admin";

  const [phone, setPhone] = useState("");
  const [mpin, setMpin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    preparePostLoginOnboarding();
    navigate(getPostLoginRoute());
  };

  const handleGoogle = () => {
    preparePostLoginOnboarding();
    navigate(getPostLoginRoute());
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fb] text-slate-900 relative overflow-hidden">
      {/* Grid background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      {/* Soft gradient wash */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-[#f7f8fb] to-[#eef2ff]"
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 group"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#2563eb] shadow-sm">
            <span className="block h-3.5 w-3.5 rounded-sm bg-white/90" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Digi Devalaya <span className="font-normal text-slate-500">Business</span>
          </span>
        </button>

        <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
            All Systems Operational
          </span>
          <span className="text-slate-300">·</span>
          <span>v2.4.1</span>
          <span className="text-slate-300">·</span>
          <span>EU-WEST</span>
        </div>
      </header>

      {/* Main card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.12)] p-8 sm:p-10">
            <div className="text-center mb-7">
              <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
                Sign in to your workspace
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Use your mobile number and MPIN to continue.
              </p>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full h-11 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-2.5 text-sm font-medium text-slate-700 shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.99.66-2.26 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-medium tracking-[0.14em] text-slate-400">
                OR WITH MOBILE
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-[11px] font-semibold tracking-wider text-slate-500">
                  PHONE NO
                </label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-[#2563eb]/20 focus-visible:border-[#2563eb] text-[15px]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="mpin" className="block text-[11px] font-semibold tracking-wider text-slate-500">
                    MPIN
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-mpin")}
                    className="text-[12px] font-medium text-[#2563eb] hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <Input
                  id="mpin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="Enter 4-digit MPIN"
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value.replace(/\D/g, ""))}
                  className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-[#2563eb]/20 focus-visible:border-[#2563eb] text-[15px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium shadow-sm gap-2"
              >
                Sign in <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/business-connect/auth?mode=register")}
                className="text-[#2563eb] font-medium hover:underline"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 px-6 sm:px-10 py-5 text-[12px] text-slate-500">
        <span>© Keehoo Industries · Enterprise platform</span>
        <span>Trusted across 84 entities · 23 countries</span>
        <span className="sr-only">{role}</span>
      </footer>
    </div>
  );
};

export default Login;
