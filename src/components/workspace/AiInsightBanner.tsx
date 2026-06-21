import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AiInsightBannerProps {
  label: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function AiInsightBanner({
  label,
  children,
  actionLabel,
  onAction,
  className,
}: AiInsightBannerProps) {
  return (
    <div
      className={cn(
        "mx-4 mt-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-primary/20 bg-sidebar-accent px-4 py-2.5",
        className,
      )}
      role="status"
    >
      <div className="flex min-w-0 items-start gap-3">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p className="text-xs text-foreground/80">
          <span className="font-semibold text-primary">{label}</span> {children}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button variant="ghost" size="sm" className="h-7 shrink-0 px-2 text-xs" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
