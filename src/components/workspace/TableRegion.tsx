import { cn } from "@/lib/utils";

interface TableRegionProps {
  children: React.ReactNode;
  className?: string;
  /** When false, no inner scroll — use with pagination so the page layout handles overflow. */
  scrollable?: boolean;
}

export function TableRegion({ children, className, scrollable = true }: TableRegionProps) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1",
        scrollable ? "overflow-auto scrollbar-thin" : "overflow-visible",
        className,
      )}
      role="region"
      aria-label="Data table"
    >
      {children}
    </div>
  );
}
