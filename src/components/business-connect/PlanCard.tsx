import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanDef } from "@/data/businessTypes";

export function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: PlanDef;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-xl border bg-card p-5 transition",
        plan.highlight && "border-primary/40 shadow-sm",
        selected && "ring-2 ring-primary",
      )}
    >
      {plan.highlight && (
        <span className="absolute -top-2 right-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          Popular
        </span>
      )}
      <div>
        <div className="text-sm font-semibold text-muted-foreground">{plan.name}</div>
        <div className="mt-1 text-2xl font-bold">{plan.price}</div>
        <div className="text-xs text-muted-foreground">{plan.tagline}</div>
      </div>
      <ul className="space-y-1.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant={selected ? "default" : "outline"}
        className="mt-auto"
        onClick={onSelect}
      >
        {selected ? "Selected" : plan.id === "trial" ? "Start Free Trial" : "Choose Plan"}
      </Button>
    </div>
  );
}
