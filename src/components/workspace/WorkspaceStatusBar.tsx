import { cn } from "@/lib/utils";

interface WorkspaceStatusBarProps {
  className?: string;
  /** Pin to viewport bottom (default) */
  fixed?: boolean;
}

function StatusDot() {
  return <span className="size-2 shrink-0 rounded-full bg-success" aria-hidden />;
}

export function WorkspaceStatusBar({ className, fixed = true }: WorkspaceStatusBarProps) {
  return (
    <div
      role="status"
      className={cn(
        "shell-status-bar flex items-center justify-between gap-4 border-t border-border bg-muted/40 px-4 text-[10px] text-muted-foreground",
        fixed && "fixed inset-x-0 bottom-0 z-40",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <StatusDot />
        <span className="font-semibold uppercase tracking-wider text-foreground">Workflow engine active</span>
        <span className="hidden sm:inline text-border">·</span>
        <span className="hidden sm:inline">12 jobs</span>
        <span className="hidden md:inline text-border">·</span>
        <span className="hidden md:inline">0 stalled</span>
        <span className="hidden lg:inline text-border">·</span>
        <span className="hidden lg:inline font-mono">AI runtime v1.4.2-stable</span>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
        <span className="hidden font-mono sm:inline">orch-eu-west · 38ms</span>
        <span className="hidden text-border sm:inline">·</span>
        <span className="hidden sm:inline">synced 400ms ago</span>
        <button
          type="button"
          className="font-semibold uppercase tracking-wider text-primary transition-colors duration-[120ms] hover:text-primary/80"
        >
          Orchestrator logs
        </button>
      </div>
    </div>
  );
}

export const WORKSPACE_STATUS_BAR_HEIGHT = "2.25rem";
