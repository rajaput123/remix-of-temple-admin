import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StepShell } from "@/components/business-connect/StepShell";
import { FileDropzone } from "@/components/business-connect/FileDropzone";
import { PLANS } from "@/data/businessTypes";
import { bcStore, useBCStore } from "@/stores/businessConnectStore";
import type { PlanId } from "@/types/businessConnect";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
      subtitle="Add a logo and pick a plan — you can change either anytime."
      backTo="/business-connect/onboarding/verification"
      onNext={next}
      nextLabel="Finish"
    >
      <div className="space-y-5">
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

        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">Choose your plan</div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => {
              const selected = plan === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={cn(
                    "relative flex flex-col items-start gap-1.5 rounded-xl border bg-card p-3 text-left transition hover:border-primary/40",
                    selected && "border-primary ring-2 ring-primary/20",
                    p.highlight && !selected && "border-primary/30",
                  )}
                >
                  {p.highlight && (
                    <span className="absolute -top-2 right-2 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-foreground">
                      Popular
                    </span>
                  )}
                  <div className="flex w-full items-start justify-between">
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {p.name}
                      </div>
                      <div className="text-base font-bold">{p.price}</div>
                    </div>
                    <span
                      className={cn(
                        "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background",
                      )}
                    >
                      {selected && <Check className="h-2.5 w-2.5" />}
                    </span>
                  </div>
                  <p className="text-[10px] leading-tight text-muted-foreground">{p.tagline}</p>
                  <ul className="mt-1 space-y-0.5 text-[10px] text-foreground/80">
                    {p.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-start gap-1">
                        <Check className="mt-0.5 h-2.5 w-2.5 shrink-0 text-primary" />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepShell>
  );
}
