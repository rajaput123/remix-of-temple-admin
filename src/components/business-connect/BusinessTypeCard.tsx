import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function BusinessTypeCard({ icon: Icon, label, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center transition hover:border-primary hover:shadow-sm",
        selected && "border-primary ring-2 ring-primary/30",
      )}
    >
      {selected && (
        <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
      <span
        className={cn(
          "grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary",
          selected && "bg-primary text-primary-foreground",
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-sm font-medium leading-tight">{label}</span>
    </button>
  );
}
