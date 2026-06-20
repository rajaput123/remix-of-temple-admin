import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StepShell } from "@/components/business-connect/StepShell";
import { PlanCard } from "@/components/business-connect/PlanCard";
import { PLANS } from "@/data/businessTypes";
import { bcStore, useBCStore } from "@/stores/businessConnectStore";
import type { PlanId } from "@/types/businessConnect";

export default function StepSubscription() {
  const navigate = useNavigate();
  const stored = useBCStore((s) => s.subscription);
  const [plan, setPlan] = useState<PlanId>(stored?.plan ?? "trial");

  function next() {
    bcStore.set({ subscription: { plan }, profileStatus: "draft" });
    bcStore.markStep("subscription");
    navigate("/business-connect/onboarding/complete");
  }

  return (
    <StepShell
      title="Choose your plan"
      subtitle="Start free, upgrade anytime. No card required for the trial."
      backTo="/business-connect/onboarding/gallery"
      onNext={next}
      nextLabel="Continue"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p) => (
          <PlanCard key={p.id} plan={p} selected={plan === p.id} onSelect={() => setPlan(p.id)} />
        ))}
      </div>
    </StepShell>
  );
}
