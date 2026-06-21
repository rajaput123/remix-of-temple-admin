import { cn } from "@/lib/utils";

interface FilterStripProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterStrip({ children, className }: FilterStripProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-b border-border px-4 py-3", className)}>
      {children}
    </div>
  );
}

interface FilterSelectionActionsProps {
  count: number;
  children: React.ReactNode;
}

export function FilterSelectionActions({ count, children }: FilterSelectionActionsProps) {
  if (count <= 0) return null;

  return (
    <div className="ml-2 flex items-center gap-2 border-l border-border pl-2">
      <span className="text-xs text-muted-foreground">{count} selected</span>
      {children}
    </div>
  );
}
