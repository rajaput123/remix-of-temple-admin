import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginRole = "super-admin" | "temple-admin";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") as LoginRole | null;
  const role: LoginRole = roleParam === "temple-admin" ? "temple-admin" : "super-admin";
  const prefilledMobile = (location.state as { mobile?: string } | null)?.mobile ?? "";

  const [phone, setPhone] = useState(prefilledMobile);
  const [mpin, setMpin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/temple-hub");
  };

  const handleBypass = () => {
    navigate("/temple-hub");
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
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary shadow-sm">
            <span className="block h-3.5 w-3.5 rounded-sm bg-primary-foreground/90" />
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
                  className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-[#2b62ef]/20 focus-visible:border-[#2b62ef] text-[15px]"
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
                    className="text-[12px] font-medium text-[#2b62ef] hover:underline"
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
                  className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-[#2b62ef]/20 focus-visible:border-[#2b62ef] text-[15px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-lg bg-[#2b62ef] hover:bg-[#2656d2] text-white text-sm font-medium shadow-sm gap-2"
              >
                Sign in <ArrowRight className="h-4 w-4" />
              </Button>

              <button
                type="button"
                onClick={handleBypass}
                className="w-full text-center text-[12px] font-medium text-slate-500 hover:text-[#2b62ef] hover:underline"
              >
                Bypass → Go to Temple Hub
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{" "}
              <Link to="/business-connect/auth" className="text-[#2b62ef] font-medium hover:underline">
                Create one
              </Link>
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
