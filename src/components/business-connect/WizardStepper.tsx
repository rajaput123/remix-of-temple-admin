import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface WizardStep {
  id: string;
  label: string;
  path: string;
}

export const ONBOARDING_STEPS: WizardStep[] = [
  { id: "type", label: "Type", path: "/business-connect/onboarding/type" },
  { id: "info", label: "Information", path: "/business-connect/onboarding/info" },
  { id: "location", label: "Location", path: "/business-connect/onboarding/location" },
  { id: "languages", label: "Languages", path: "/business-connect/onboarding/languages" },
  { id: "verification", label: "Verification", path: "/business-connect/onboarding/verification" },
  { id: "gallery", label: "Media", path: "/business-connect/onboarding/gallery" },
  { id: "subscription", label: "Plan", path: "/business-connect/onboarding/subscription" },
  { id: "complete", label: "Done", path: "/business-connect/onboarding/complete" },
];

export function WizardStepper({
  currentId,
  completed,
}: {
  currentId: string;
  completed: string[];
}) {
  const currentIdx = ONBOARDING_STEPS.findIndex((s) => s.id === currentId);
  return (
    <div className="w-full overflow-x-auto">
      <ol className="flex min-w-max items-center gap-2 px-1 py-3">
        {ONBOARDING_STEPS.map((step, i) => {
          const isDone = completed.includes(step.id) || i < currentIdx;
          const isCurrent = step.id === currentId;
          return (
            <li key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full border text-xs font-semibold",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  !isCurrent && isDone && "border-primary bg-primary/10 text-primary",
                  !isCurrent && !isDone && "border-muted text-muted-foreground",
                )}
              >
                {isDone && !isCurrent ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs",
                  isCurrent ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              {i < ONBOARDING_STEPS.length - 1 && (
                <span className="mx-1 h-px w-6 bg-border md:w-10" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
