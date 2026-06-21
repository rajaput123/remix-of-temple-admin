import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ShellSidebarProfileProps {
  name: string;
  role: string;
  initials: string;
  collapsed?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ShellSidebarProfile({
  name,
  role,
  initials,
  collapsed = false,
  className,
  children,
}: ShellSidebarProfileProps) {
  return (
    <div className={cn("shrink-0 border-t border-border p-2", className)}>
      <div className={cn("flex items-center gap-2", collapsed && "flex-col")}>
        <button
          type="button"
          className={cn(
            "flex flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted",
            collapsed && "justify-center px-0",
          )}
        >
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-primary text-[10px] font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{role}</p>
            </div>
          )}
        </button>
        {children}
      </div>
    </div>
  );
}
