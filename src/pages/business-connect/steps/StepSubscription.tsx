import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StepShell } from "@/components/business-connect/StepShell";
import { PlanCard } from "@/components/business-connect/PlanCard";
import { FileDropzone } from "@/components/business-connect/FileDropzone";
import { PLANS } from "@/data/businessTypes";
import { bcStore, useBCStore } from "@/stores/businessConnectStore";
import type { PlanId } from "@/types/businessConnect";

export default function StepSubscription() {
  const navigate = useNavigate();
  const storedSub = useBCStore((s) => s.subscription);
  const storedMedia = useBCStore((s) => s.media);
  const [plan, setPlan] = useState<PlanId>(storedSub?.plan ?? "trial");
  const [logo, setLogo] = useState<string[]>(storedMedia?.logo ? [storedMedia.logo] : []);
  const [gallery, setGallery] = useState<string[]>(storedMedia?.gallery ?? []);

  function next() {
    bcStore.set({
      media: {
        logo: logo[0],
        cover: storedMedia?.cover,
        gallery,
        videos: storedMedia?.videos ?? [],
      },
      subscription: { plan },
      profileStatus: "draft",
    });
    bcStore.markStep("plan");
    navigate("/business-connect/onboarding/complete");
  }

  return (
    <StepShell
      title="Media & subscription"
      subtitle="Add a logo and a few photos, then pick a plan. You can update these anytime."
      backTo="/business-connect/onboarding/verification"
      onNext={next}
      nextLabel="Continue"
    >
      <div className="space-y-4">
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground">Profile media</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <FileDropzone
              label="Business logo"
              hint="Recommended"
              accept="image/*"
              values={logo}
              onChange={setLogo}
              max={1}
            />
            <FileDropzone
              label="Gallery photos"
              hint="Optional · up to 8"
              accept="image/*"
              multiple
              values={gallery}
              onChange={setGallery}
              max={8}
            />
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground">Choose your plan</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((p) => (
              <PlanCard key={p.id} plan={p} selected={plan === p.id} onSelect={() => setPlan(p.id)} />
            ))}
          </div>
        </section>
      </div>
    </StepShell>
  );
}
