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
        "relative flex flex-col gap-2 rounded-lg border bg-card p-3 transition",
        plan.highlight && "border-primary/40 shadow-sm",
        selected && "ring-2 ring-primary",
      )}
    >
      {plan.highlight && (
        <span className="absolute -top-2 right-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          Popular
        </span>
      )}
      <div>
        <div className="text-xs font-semibold text-muted-foreground">{plan.name}</div>
        <div className="text-lg font-bold">{plan.price}</div>
        <div className="text-[10px] text-muted-foreground">{plan.tagline}</div>
      </div>
      <ul className="space-y-0.5 text-xs">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-1.5">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant={selected ? "default" : "outline"}
        size="sm"
        className="mt-auto"
        onClick={onSelect}
      >
        {selected ? "Selected" : plan.id === "trial" ? "Start Free Trial" : "Choose Plan"}
      </Button>
    </div>
  );
}
