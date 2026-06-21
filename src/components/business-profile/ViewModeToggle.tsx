import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "card" | "table";

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className={cn("h-8 gap-1.5 px-3", value === "card" && "bg-background shadow-sm")}
        onClick={() => onChange("card")}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Card
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className={cn("h-8 gap-1.5 px-3", value === "table" && "bg-background shadow-sm")}
        onClick={() => onChange("table")}
      >
        <List className="h-3.5 w-3.5" />
        Table
      </Button>
    </div>
  );
}
