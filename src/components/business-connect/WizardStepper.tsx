import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface WizardStep {
  id: string;
  label: string;
  description: string;
  path: string;
}

export const ONBOARDING_STEPS: WizardStep[] = [
  {
    id: "business",
    label: "Business basics",
    description: "Name, category & contact",
    path: "/business-connect/onboarding/business",
  },
  {
    id: "location",
    label: "Address",
    description: "Where you operate",
    path: "/business-connect/onboarding/location",
  },
  {
    id: "verification",
    label: "Verification",
    description: "Build trust with documents",
    path: "/business-connect/onboarding/verification",
  },
  {
    id: "plan",
    label: "Media & plan",
    description: "Logo, photos & subscription",
    path: "/business-connect/onboarding/plan",
  },
  {
    id: "complete",
    label: "All set",
    description: "Review & go live",
    path: "/business-connect/onboarding/complete",
  },
];

interface Props {
  currentId: string;
  completed: string[];
  orientation?: "vertical" | "horizontal";
}

export function WizardStepper({ currentId, completed, orientation = "vertical" }: Props) {
  const currentIdx = ONBOARDING_STEPS.findIndex((s) => s.id === currentId);

  if (orientation === "horizontal") {
    return (
      <div className="w-full">
        <ol className="flex items-center gap-1.5">
          {ONBOARDING_STEPS.map((step, i) => {
            const isDone = completed.includes(step.id) || i < currentIdx;
            const isCurrent = step.id === currentId;
            return (
              <li key={step.id} className="flex flex-1 items-center gap-1.5">
                <div
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-semibold transition",
                    isCurrent && "border-primary bg-primary text-primary-foreground",
                    !isCurrent && isDone && "border-primary bg-primary text-primary-foreground",
                    !isCurrent && !isDone && "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isDone && !isCurrent ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                {isCurrent && (
                  <span className="hidden text-xs font-medium text-foreground sm:inline">
                    {step.label}
                  </span>
                )}
                {i < ONBOARDING_STEPS.length - 1 && (
                  <span
                    className={cn(
                      "h-px flex-1 transition",
                      isDone ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <ol className="relative space-y-4">
      {ONBOARDING_STEPS.map((step, i) => {
        const isDone = completed.includes(step.id) || i < currentIdx;
        const isCurrent = step.id === currentId;
        const isLast = i === ONBOARDING_STEPS.length - 1;
        return (
          <li key={step.id} className="relative flex gap-3">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-8px)] w-px transition",
                  isDone ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <div
              className={cn(
                "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition",
                isCurrent && "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px] shadow-primary/15",
                !isCurrent && isDone && "border-primary bg-primary text-primary-foreground",
                !isCurrent && !isDone && "border-border bg-background text-muted-foreground",
              )}
            >
              {isDone && !isCurrent ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <div className="pt-0.5">
              <div
                className={cn(
                  "text-sm font-medium leading-tight",
                  isCurrent ? "text-foreground" : isDone ? "text-foreground/80" : "text-muted-foreground",
                )}
              >
                {step.label}
              </div>
              <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                {step.description}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
