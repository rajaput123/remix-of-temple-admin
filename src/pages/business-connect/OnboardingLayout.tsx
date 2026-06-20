import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { ONBOARDING_STEPS, WizardStepper } from "@/components/business-connect/WizardStepper";
import { useBCStore, computeCompletion } from "@/stores/businessConnectStore";
import { useEffect, useMemo } from "react";
import { Sparkles, LifeBuoy, ShieldCheck } from "lucide-react";

export default function BCOnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = useBCStore((s) => s);
  const completed = state.completedSteps;
  const account = state.account;

  const current = useMemo(() => {
    const parts = location.pathname.split("/");
    return parts[parts.length - 1] || "business";
  }, [location.pathname]);

  const currentStep = ONBOARDING_STEPS.find((s) => s.id === current) ?? ONBOARDING_STEPS[0];
  const currentIdx = ONBOARDING_STEPS.findIndex((s) => s.id === current);
  const progress = computeCompletion(state);

  useEffect(() => {
    if (!account.verified) navigate("/business-connect/auth", { replace: true });
  }, [account.verified, navigate]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[hsl(210_20%_98%)]">
      {/* Mobile top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Link to="/business-connect" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold">Business Connect</span>
        </Link>
        <span className="text-[11px] text-muted-foreground">
          Step {currentIdx + 1} of {ONBOARDING_STEPS.length}
        </span>
      </header>
      <div className="border-b bg-background px-4 py-2 lg:hidden">
        <WizardStepper currentId={current} completed={completed} orientation="horizontal" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop side panel */}
        <aside className="hidden w-[300px] shrink-0 flex-col justify-between border-r bg-background px-6 py-6 lg:flex">
          <div className="space-y-6">
            <Link to="/business-connect" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Digidevalaya</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Business Connect
                </div>
              </div>
            </Link>

            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Profile completion</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <WizardStepper currentId={current} completed={completed} />
          </div>

          <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Your data is safe
            </div>
            <p className="text-[11px] leading-snug text-muted-foreground">
              We never share your details without consent. You can edit or remove your listing anytime.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              <LifeBuoy className="h-3 w-3" /> Need help?
            </a>
          </div>
        </aside>

        {/* Form area */}
        <main className="flex flex-1 items-stretch overflow-hidden p-4 md:p-6 lg:p-8">
          <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
            <div className="mb-3 hidden text-[11px] uppercase tracking-wider text-muted-foreground lg:block">
              Step {currentIdx + 1} of {ONBOARDING_STEPS.length} · {currentStep.label}
            </div>
            <div className="flex h-full flex-1 flex-col overflow-hidden rounded-2xl border bg-background shadow-sm">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export { ONBOARDING_STEPS };
