import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  HelpCircle,
  User,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { resolveHubModule } from "@/lib/hubModules";

interface NavItemType {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
  children?: NavItemType[];
  locked?: boolean;
  lockedHint?: string;
  external?: boolean;
  isActive?: (pathname: string) => boolean;
}

interface QuickLinkType {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TempleLayoutProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  navItems: NavItemType[];
  quickLinks?: QuickLinkType[];
  profileName?: string;
  profileRole?: string;
  profileInitials?: string;
}

function isNavItemActive(
  item: NavItemType,
  pathname: string,
  search: string,
  firstNavPath?: string,
): boolean {
  const fullPath = pathname + search;
  if (item.isActive) return item.isActive(pathname);
  return (
    fullPath === item.path ||
    pathname === item.path ||
    (firstNavPath != null &&
      item.path === firstNavPath &&
      pathname === firstNavPath.replace(/\/[^/]+$/, ""))
  );
}

const TempleLayout = ({
  title,
  icon: Icon,
  navItems,
  quickLinks,
  profileName = "Temple Admin",
  profileRole = "Operations Lead · Admin",
  profileInitials = "RK",
}: TempleLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // Auto-expand group containing current path
    const set = new Set<string>();
    for (const item of navItems) {
      if (item.children?.some(c => location.pathname === c.path)) {
        set.add(item.label);
      }
    }
    return set;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const hubModule = resolveHubModule(location.pathname);
  const headerLabel = hubModule?.title ?? title;
  const HeaderIcon = hubModule?.icon ?? Icon;

  return (
    <div
      className="min-h-screen bg-background"
      style={
        {
          "--shell-sidebar-width": collapsed ? "64px" : "240px",
        } as React.CSSProperties
      }
    >
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="shell-sidebar fixed left-0 top-0 z-30 flex flex-col border-r border-border bg-sidebar"
      >
        {/* Hub module title */}
        <div className="h-14 flex items-center justify-center border-b border-border px-4">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => navigate("/temple-hub")}
                className="sidebar-brand min-w-0 w-full"
              >
                <HeaderIcon className="size-4 shrink-0" />
                <span className="truncate">{headerLabel}</span>
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => navigate("/temple-hub")}
                className="text-primary"
                title={headerLabel}
              >
                <HeaderIcon className="size-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Global Search */}
        <div className={cn("p-3 pb-2", collapsed && "px-2")}>
          {!collapsed ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="sidebar-search"
              />
            </div>
          ) : (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button className="w-full p-2 rounded-lg hover:bg-muted transition-colors flex items-center justify-center">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Search
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-auto">
          {navItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isGroupExpanded = expandedGroups.has(item.label);
            const fullPath = location.pathname + location.search;
            const active = isNavItemActive(item, location.pathname, location.search, navItems[0]?.path);
            const childActive = hasChildren && item.children!.some(c => fullPath === c.path || location.pathname === c.path);

            if (hasChildren) {
              const groupButton = (
                <button
                  key={item.path}
                  onClick={() => collapsed ? navigate(item.children![0].path) : toggleGroup(item.label)}
                  className={cn(
                    "sidebar-nav-item",
                    childActive
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isGroupExpanded && "rotate-180")} />
                    </>
                  )}
                </button>
              );

              return (
                <div key={item.path}>
                  <Tooltip delayDuration={collapsed ? 0 : 500}>
                    <TooltipTrigger asChild>{groupButton}</TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[200px]">
                      <p className="font-medium text-xs">{item.label}</p>
                      {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                    </TooltipContent>
                  </Tooltip>
                  <AnimatePresence>
                    {isGroupExpanded && !collapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 pl-3 border-l border-border/50 space-y-0.5 py-1">
                          {item.children!.map(child => {
                            const childIsActive = (location.pathname + location.search) === child.path || location.pathname === child.path;
                            return (
                              <Tooltip key={child.path} delayDuration={500}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => navigate(child.path)}
                                    className={cn(
                                      "sidebar-nav-nested",
                                      childIsActive
                                        ? "rounded-none rounded-r-md border-l-2 border-l-primary bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                  >
                                    <child.icon className="h-3.5 w-3.5 shrink-0" />
                                    <span className="flex-1 text-left truncate">{child.label}</span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p className="text-xs">{child.description || child.label}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Flat item (no children)
            const isLocked = item.locked;
            const button = (
              <button
                key={item.path}
                onClick={() => !isLocked && (item.external ? navigate(item.path) : navigate(item.path))}
                className={cn(
                  "sidebar-nav-item",
                  isLocked
                    ? "cursor-not-allowed text-muted-foreground/50 opacity-60"
                    : active
                      ? "rounded-none rounded-r-lg border-l-2 border-l-primary bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isLocked && (
                      <span className="sidebar-badge bg-muted text-muted-foreground">🔒</span>
                    )}
                    {!isLocked && item.badge && (
                      <span
                        className={cn(
                          "sidebar-badge",
                          active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );

            return (
              <Tooltip key={item.path} delayDuration={collapsed ? 0 : 500}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right" className="max-w-[200px]">
                  <p className="font-medium text-xs">{item.label}</p>
                  {isLocked && <p className="text-xs text-muted-foreground">Upgrade plan to unlock</p>}
                  {!isLocked && item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
          
          {/* Quick Links Section */}
          {quickLinks && quickLinks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/50">
              {!collapsed && <p className="sidebar-section-label">Quick Links</p>}
              <div className={cn("space-y-1", collapsed ? "px-0" : "px-1")}>
                {quickLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  const btn = (
                    <button
                      key={link.path}
                      onClick={() => navigate(link.path)}
                      className={cn(
                        "sidebar-quick-link",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-primary/20 bg-primary/5 text-primary hover:border-primary/40 hover:bg-primary/10",
                      )}
                    >
                      <link.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{link.label}</span>}
                    </button>
                  );
                  return (
                    <Tooltip key={link.path} delayDuration={collapsed ? 0 : 500}>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-xs">{link.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom - Profile + Notification */}
        <div className="shrink-0 border-t border-border p-2">
          <div className={cn("flex items-center gap-2", collapsed ? "flex-col" : "flex-row")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-primary text-[10px] font-semibold text-primary-foreground">
                      {profileInitials}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">{profileName}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{profileRole}</p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={collapsed ? "center" : "end"} side="top" className="w-52 bg-white border shadow-lg mb-1">
                <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
                  <User className="h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/temple/settings")} className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/login")} className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification Bell - Right side */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
                </button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"}>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </motion.aside>

      {/* Collapse Toggle on Divider */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-40 p-1.5 bg-white border border-border rounded-full shadow-md hover:bg-muted transition-all duration-300",
          collapsed ? "left-[52px]" : "left-[228px]",
        )}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4 text-muted-foreground" />
        ) : (
          <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Main Content */}
      <main
        className={cn(
          "relative flex min-h-screen flex-1 flex-col transition-all duration-300",
          collapsed ? "ml-16" : "ml-60",
        )}
      >
        <div className="shell-main-content flex min-h-0 flex-1 flex-col px-8 pb-6 pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TempleLayout;
