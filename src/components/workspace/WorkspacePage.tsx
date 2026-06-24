import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface WorkspaceTab {
  id: string;
  label: string;
  count?: number;
}

interface WorkspacePageProps {
  /** Eyebrow breadcrumb, e.g. "Finance · Workflow queue" */
  eyebrow?: string;
  /** @deprecated Use eyebrow */
  breadcrumb?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  tabs?: WorkspaceTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  /** Counteract parent layout padding for edge-to-edge table pages */
  bleed?: boolean;
  /** Optional workflow / system status strip below table content */
  statusBar?: React.ReactNode;
}

export function WorkspacePage({
  eyebrow,
  breadcrumb,
  title,
  description,
  actions,
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
  bleed = true,
  statusBar,
}: WorkspacePageProps) {
  const trail = eyebrow ?? breadcrumb;

  useEffect(() => {
    if (!statusBar) return;
    document.documentElement.setAttribute("data-status-bar", "true");
    return () => document.documentElement.removeAttribute("data-status-bar");
  }, [statusBar]);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-1 flex-col bg-card",
        bleed && "-mx-4 min-h-[calc(100vh-var(--shell-statusbar-height))]",
        className,
      )}
    >
      <header className="relative z-10 shrink-0 border-b border-border bg-card">
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 pb-3 pt-4">
          <div className="min-w-0">
            {trail && (
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{trail}</p>
            )}
            <h1 className={cn("text-lg font-semibold tracking-tight text-foreground", trail && "mt-1")}>{title}</h1>
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>

        {tabs && tabs.length > 0 && (
          <nav className="flex items-center gap-6 px-6 pb-0" aria-label="Page sections">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
                    "relative -mb-px inline-flex h-9 items-center gap-1.5 border-b-2 px-0 text-xs font-medium transition-colors duration-[120ms]",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={cn(
                        "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 font-mono text-[10px] font-medium tabular-nums leading-none",
                        isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </header>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto pt-3",
          statusBar && "pb-[var(--shell-statusbar-height)]",
        )}
      >
        {children}
      </div>

      {/* Fixed — rendered for mount only; no document-flow height */}
      {statusBar}
    </div>
  );
}
