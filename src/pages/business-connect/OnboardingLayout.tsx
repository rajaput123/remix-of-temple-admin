import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BCHeader } from "@/components/business-connect/BCHeader";
import { ONBOARDING_STEPS, WizardStepper } from "@/components/business-connect/WizardStepper";
import { useBCStore } from "@/stores/businessConnectStore";
import { useEffect, useMemo } from "react";

export default function BCOnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const completed = useBCStore((s) => s.completedSteps);
  const account = useBCStore((s) => s.account);

  const current = useMemo(() => {
    const parts = location.pathname.split("/");
    return parts[parts.length - 1] || "business";
  }, [location.pathname]);


  useEffect(() => {
    if (!account.verified) navigate("/business-connect/auth", { replace: true });
  }, [account.verified, navigate]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/30">
      <BCHeader showCta={false} />
      <div className="border-b bg-background">
        <div className="container mx-auto px-4">
          <WizardStepper currentId={current} completed={completed} />
        </div>
      </div>
      <main className="container mx-auto w-full max-w-3xl flex-1 overflow-hidden px-4 py-3 md:py-4">
        <Outlet />
      </main>
    </div>
  );
}

export { ONBOARDING_STEPS };
