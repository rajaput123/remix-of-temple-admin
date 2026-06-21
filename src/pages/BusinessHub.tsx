import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Tag,
  CalendarCheck,
  Users,
  IndianRupee,
  MessageSquare,
  Boxes,
  BarChart3,
  Megaphone,
  Video,
  Settings,
  Bell,
  Search,
  ChevronRight,
  Shield,
  Sparkles,
  LogOut,
  HelpCircle,
  User,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Star,
  Clock,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ────────────────────────────────────────────────────────────────────────────
// Role-based navigation
// ────────────────────────────────────────────────────────────────────────────
type Role = "owner" | "admin" | "ops" | "staff";
const ROLES: { id: Role; label: string }[] = [
  { id: "owner", label: "Business Owner" },
  { id: "admin", label: "Administrator" },
  { id: "ops", label: "Operations" },
  { id: "staff", label: "Staff" },
];

// ────────────────────────────────────────────────────────────────────────────
// Module catalog (11 modules, sub-modules, dashboard widgets, role access)
// ────────────────────────────────────────────────────────────────────────────
type ModuleDef = {
  id: string;
  title: string;
  shortTitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  path: string;
  group: "setup" | "operations" | "insights";
  status?: "core" | "new";
  roles: Role[];
  subModules: { title: string; path?: string }[];
  widgets: { label: string; value: string; delta?: string; trend?: "up" | "down" }[];
};

const MODULES: ModuleDef[] = [
  // ── SETUP & VISIBILITY ────────────────────────────────────────────────
  {
    id: "business-profile",
    title: "Business Profile & Operations",
    shortTitle: "Business Profile",
    icon: Building2,
    description: "Onboarding, verification, hours, service areas & marketplace visibility.",
    path: "/business-connect/profile",
    group: "setup",
    status: "new",
    roles: ["owner", "admin"],
    subModules: [
      { title: "Profile & Branding" },
      { title: "Verification & KYC" },
      { title: "Business Hours" },
      { title: "Service Areas" },
      { title: "Subscription & Plan" },
      { title: "Marketplace Visibility" },
    ],
    widgets: [
      { label: "Profile completeness", value: "82%", delta: "+6%", trend: "up" },
      { label: "Verification", value: "Verified" },
      { label: "Marketplace rank", value: "#14", delta: "+3", trend: "up" },
    ],
  },
  {
    id: "service-listings",
    title: "Service Listings",
    icon: Tag,
    description: "Services, packages, pricing, availability and categories.",
    path: "/business-connect/services",
    group: "setup",
    status: "new",
    roles: ["owner", "admin", "ops"],
    subModules: [
      { title: "All Services" },
      { title: "Packages & Combos" },
      { title: "Pricing Rules" },
      { title: "Availability & Slots" },
      { title: "Categories" },
      { title: "Media Gallery" },
    ],
    widgets: [
      { label: "Active listings", value: "24" },
      { label: "Top viewed", value: "Griha Pravesh" },
      { label: "Out of stock", value: "2", trend: "down" },
    ],
  },
  {
    id: "marketing",
    title: "Marketing Services",
    icon: Megaphone,
    description: "Content requests, social media, promotions & campaigns.",
    path: "/business-connect/marketing",
    group: "setup",
    status: "new",
    roles: ["owner", "admin"],
    subModules: [
      { title: "Campaigns" },
      { title: "Promotions & Coupons" },
      { title: "Social Media" },
      { title: "Content Requests" },
      { title: "Reviews & Ratings" },
      { title: "SEO & Listings" },
    ],
    widgets: [
      { label: "Active campaigns", value: "3" },
      { label: "Avg. rating", value: "4.7★" },
      { label: "Engagement", value: "+18%", trend: "up" },
    ],
  },

  // ── OPERATIONS ────────────────────────────────────────────────────────
  {
    id: "bookings",
    title: "Booking Management",
    icon: CalendarCheck,
    description: "Appointments, consultations, reservations & service bookings.",
    path: "/temple/bookings",
    group: "operations",
    status: "core",
    roles: ["owner", "admin", "ops", "staff"],
    subModules: [
      { title: "Today's Bookings" },
      { title: "Appointments" },
      { title: "Consultations" },
      { title: "Reservations" },
      { title: "Calendar View" },
      { title: "Cancellations & Refunds" },
    ],
    widgets: [
      { label: "Today", value: "37" },
      { label: "Pending", value: "8", trend: "down" },
      { label: "This week", value: "214", delta: "+12%", trend: "up" },
    ],
  },
  {
    id: "crm",
    title: "CRM",
    icon: Users,
    description: "Customers, leads, enquiries & relationship management.",
    path: "/temple/devotees",
    group: "operations",
    status: "core",
    roles: ["owner", "admin", "ops"],
    subModules: [
      { title: "Customers" },
      { title: "Leads Pipeline" },
      { title: "Enquiries" },
      { title: "Segments & Tags" },
      { title: "Relationship Notes" },
      { title: "Loyalty" },
    ],
    widgets: [
      { label: "New leads", value: "42", delta: "+9", trend: "up" },
      { label: "Conversion", value: "23%" },
      { label: "Top customer", value: "Sharma Family" },
    ],
  },
  {
    id: "communication",
    title: "Communication Center",
    icon: MessageSquare,
    description: "Inbox, templates, SMS, email & WhatsApp messaging.",
    path: "/temple/communication",
    group: "operations",
    status: "core",
    roles: ["owner", "admin", "ops", "staff"],
    subModules: [
      { title: "Unified Inbox" },
      { title: "WhatsApp" },
      { title: "SMS & Email" },
      { title: "Templates" },
      { title: "Announcements" },
      { title: "Notification Center" },
    ],
    widgets: [
      { label: "Unread", value: "11" },
      { label: "Sent today", value: "284" },
      { label: "Delivery rate", value: "98.4%" },
    ],
  },
  {
    id: "live-services",
    title: "Live Services",
    icon: Video,
    description: "Live streaming, video consultations & recordings.",
    path: "/business-connect/live",
    group: "operations",
    status: "new",
    roles: ["owner", "admin", "ops", "staff"],
    subModules: [
      { title: "Live Streams" },
      { title: "Video Consultations" },
      { title: "Scheduled Sessions" },
      { title: "Recordings" },
      { title: "Stream Settings" },
    ],
    widgets: [
      { label: "Live now", value: "1" },
      { label: "Scheduled", value: "6" },
      { label: "Recordings", value: "128" },
    ],
  },
  {
    id: "inventory",
    title: "Inventory & Assets",
    icon: Boxes,
    description: "Stock, items, suppliers and asset maintenance.",
    path: "/temple/inventory/items",
    group: "operations",
    status: "core",
    roles: ["admin", "ops", "staff"],
    subModules: [
      { title: "Items & Stock" },
      { title: "Transactions" },
      { title: "Purchase Orders" },
      { title: "Suppliers" },
      { title: "Assets" },
      { title: "Maintenance" },
    ],
    widgets: [
      { label: "SKUs", value: "412" },
      { label: "Low stock", value: "9", trend: "down" },
      { label: "Asset value", value: "₹18.4L" },
    ],
  },

  // ── FINANCE & INSIGHTS ────────────────────────────────────────────────
  {
    id: "finance",
    title: "Finance & Accounts",
    icon: IndianRupee,
    description: "Income, expenses, invoices, payouts, GST & ledger.",
    path: "/temple/finance",
    group: "insights",
    status: "core",
    roles: ["owner", "admin"],
    subModules: [
      { title: "Dashboard" },
      { title: "Invoices" },
      { title: "Payments & Payouts" },
      { title: "Expenses" },
      { title: "Tax (GST/TDS)" },
      { title: "Ledger & Reconciliation" },
    ],
    widgets: [
      { label: "MTD revenue", value: "₹4.82L", delta: "+14%", trend: "up" },
      { label: "Pending invoices", value: "₹62K" },
      { label: "Net margin", value: "31%" },
    ],
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    icon: BarChart3,
    description: "Business, booking, customer and revenue insights.",
    path: "/temple/reports",
    group: "insights",
    status: "core",
    roles: ["owner", "admin"],
    subModules: [
      { title: "Business Overview" },
      { title: "Booking Analytics" },
      { title: "Customer Insights" },
      { title: "Revenue & P&L" },
      { title: "Marketing ROI" },
      { title: "Custom Reports" },
    ],
    widgets: [
      { label: "Active users", value: "1,284" },
      { label: "Repeat rate", value: "44%" },
      { label: "Churn", value: "2.1%", trend: "down" },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    description: "Profile, users, roles, billing & integrations.",
    path: "/temple/settings",
    group: "insights",
    status: "core",
    roles: ["owner", "admin"],
    subModules: [
      { title: "Business Profile" },
      { title: "Users & Roles" },
      { title: "Permissions" },
      { title: "Billing & Subscription" },
      { title: "Integrations" },
      { title: "Notifications" },
    ],
    widgets: [
      { label: "Seats used", value: "6/10" },
      { label: "Integrations", value: "4 active" },
      { label: "Plan", value: "Seva · T1" },
    ],
  },
];

const GROUPS: { id: ModuleDef["group"]; label: string; description: string }[] = [
  { id: "setup", label: "Setup & Visibility", description: "Get discovered and shape your offering" },
  { id: "operations", label: "Daily Operations", description: "Run bookings, customers and service delivery" },
  { id: "insights", label: "Finance & Insights", description: "Money, performance and configuration" },
];

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────
const BusinessHub = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("owner");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeId, setActiveId] = useState<string>("overview");
  const [query, setQuery] = useState("");

  const visibleModules = useMemo(
    () => MODULES.filter((m) => m.roles.includes(role)),
    [role]
  );

  const filteredModules = useMemo(() => {
    if (!query.trim()) return visibleModules;
    const q = query.toLowerCase();
    return visibleModules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.subModules.some((s) => s.title.toLowerCase().includes(q))
    );
  }, [visibleModules, query]);

  const handleOpen = (m: ModuleDef) => {
    setActiveId(m.id);
    navigate(m.path);
  };

  const roleLabel = ROLES.find((r) => r.id === role)?.label ?? "";

  return (
    <div className="min-h-screen bg-[hsl(220,20%,98%)] text-slate-900 flex">
      {/* ──────────── Sidebar ──────────── */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-16"
        } shrink-0 border-r border-slate-200 bg-white flex flex-col sticky top-0 h-screen transition-all duration-200`}
      >
        {/* Brand */}
        <div className="h-14 px-3 flex items-center gap-2 border-b border-slate-200">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-tight truncate">Digi Devalaya</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Business Hub</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {/* Overview */}
          <button
            onClick={() => setActiveId("overview")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors ${
              activeId === "overview"
                ? "bg-primary/10 text-primary"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Overview</span>}
          </button>

          {GROUPS.map((g) => {
            const groupModules = visibleModules.filter((m) => m.group === g.id);
            if (groupModules.length === 0) return null;
            return (
              <div key={g.id}>
                {sidebarOpen && (
                  <p className="px-2.5 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    {g.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {groupModules.map((m) => {
                    const Icon = m.icon;
                    const active = activeId === m.id;
                    const item = (
                      <button
                        key={m.id}
                        onClick={() => setActiveId(m.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors ${
                          active
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {sidebarOpen && (
                          <>
                            <span className="truncate flex-1 text-left">
                              {m.shortTitle ?? m.title}
                            </span>
                            {m.status === "new" && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                NEW
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                    return sidebarOpen ? (
                      item
                    ) : (
                      <Tooltip key={m.id} delayDuration={0}>
                        <TooltipTrigger asChild>{item}</TooltipTrigger>
                        <TooltipContent side="right">{m.shortTitle ?? m.title}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Collapse */}
        <div className="border-t border-slate-200 p-2">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-md text-[12px] text-slate-600 hover:bg-slate-100"
          >
            {sidebarOpen ? (
              <>
                <PanelLeftClose className="h-4 w-4" /> Collapse
              </>
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* ──────────── Main ──────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-center gap-3 px-5">
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            <span>Workspace</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-900 font-medium">Hub</span>
          </div>

          <div className="flex-1 max-w-md mx-auto relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search modules, customers, bookings…"
              className="h-9 pl-9 pr-3 bg-slate-50 border-slate-200 text-[13px] focus-visible:ring-primary/20"
            />
          </div>

          {/* Role switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 px-3 rounded-md border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 text-[12px] font-medium text-slate-700">
                <Shield className="h-3.5 w-3.5 text-slate-500" />
                {roleLabel}
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-[11px] text-slate-500 font-normal">
                View hub as
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ROLES.map((r) => (
                <DropdownMenuItem key={r.id} onClick={() => setRole(r.id)}>
                  <Shield className="h-3.5 w-3.5 mr-2 text-slate-400" />
                  {r.label}
                  {role === r.id && (
                    <span className="ml-auto text-[10px] text-primary font-semibold">ACTIVE</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="h-9 w-9 rounded-md border border-slate-200 hover:bg-slate-50 flex items-center justify-center relative">
            <Bell className="h-4 w-4 text-slate-600" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-[11px] font-semibold bg-primary text-primary-foreground">
                    RK
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[13px] font-medium">Ramesh Kumar</p>
                <p className="text-[11px] text-slate-500">Sharma Catering Services</p>
              </div>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-2" /> My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/temple/settings")}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/temple/help")}>
                <HelpCircle className="h-4 w-4 mr-2" /> Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/login")} className="text-rose-600 focus:text-rose-600">
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
            {/* Welcome + KPIs */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Saturday · 20 Jun 2026
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mt-0.5">
                    Welcome back, Ramesh
                  </h1>
                  <p className="text-[13px] text-slate-500 mt-1">
                    Here's how Sharma Catering Services is performing today.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-9 text-[12px] gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Preview profile
                  </Button>
                  <Button size="sm" className="h-9 text-[12px] gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Add Service
                  </Button>
                </div>
              </div>

              {/* KPI Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Revenue (MTD)", value: "₹4,82,400", delta: "+14.2%", trend: "up", icon: IndianRupee },
                  { label: "Bookings today", value: "37", delta: "+6", trend: "up", icon: CalendarCheck },
                  { label: "New leads", value: "42", delta: "+9", trend: "up", icon: Users },
                  { label: "Avg. rating", value: "4.7 / 5", delta: "232 reviews", icon: Star },
                ].map((k) => {
                  const Icon = k.icon;
                  const Trend = k.trend === "up" ? TrendingUp : TrendingDown;
                  return (
                    <div
                      key={k.label}
                      className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        {k.trend && (
                          <span
                            className={`text-[11px] font-medium flex items-center gap-0.5 ${
                              k.trend === "up" ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            <Trend className="h-3 w-3" />
                            {k.delta}
                          </span>
                        )}
                        {!k.trend && (
                          <span className="text-[11px] text-slate-500">{k.delta}</span>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-500">{k.label}</p>
                      <p className="text-xl font-semibold tracking-tight mt-0.5">{k.value}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Module Groups */}
            {GROUPS.map((g) => {
              const items = filteredModules.filter((m) => m.group === g.id);
              if (items.length === 0) return null;
              return (
                <section key={g.id}>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <h2 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider">
                        {g.label}
                      </h2>
                      <p className="text-[12px] text-slate-500 mt-0.5">{g.description}</p>
                    </div>
                    <span className="text-[11px] text-slate-400">{items.length} modules</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map((m) => {
                      const Icon = m.icon;
                      return (
                        <div
                          key={m.id}
                          className="group rounded-xl border border-slate-200 bg-white hover:border-primary/40 hover:shadow-md transition-all overflow-hidden flex flex-col"
                        >
                          {/* Header */}
                          <button
                            onClick={() => handleOpen(m)}
                            className="text-left p-4 flex items-start gap-3 border-b border-slate-100"
                          >
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                              <Icon className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-[14px] font-semibold text-slate-900 truncate">
                                  {m.title}
                                </h3>
                                {m.status === "new" && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                    NEW
                                  </span>
                                )}
                                {m.status === "core" && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                    CORE
                                  </span>
                                )}
                              </div>
                              <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">
                                {m.description}
                              </p>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                          </button>

                          {/* Widgets */}
                          <div className="px-4 py-3 grid grid-cols-3 gap-2 bg-slate-50/60">
                            {m.widgets.map((w) => (
                              <div key={w.label} className="min-w-0">
                                <p className="text-[10px] text-slate-500 truncate uppercase tracking-wide">
                                  {w.label}
                                </p>
                                <p className="text-[13px] font-semibold text-slate-900 truncate">
                                  {w.value}
                                </p>
                                {w.delta && (
                                  <p
                                    className={`text-[10px] truncate ${
                                      w.trend === "up"
                                        ? "text-emerald-600"
                                        : w.trend === "down"
                                          ? "text-rose-600"
                                          : "text-slate-500"
                                    }`}
                                  >
                                    {w.delta}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Sub-modules */}
                          <div className="px-4 py-3 border-t border-slate-100">
                            <div className="flex flex-wrap gap-1.5">
                              {m.subModules.slice(0, 4).map((s) => (
                                <span
                                  key={s.title}
                                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                                >
                                  {s.title}
                                </span>
                              ))}
                              {m.subModules.length > 4 && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-400">
                                  +{m.subModules.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between mt-auto">
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Updated 2m ago
                            </span>
                            <button
                              onClick={() => handleOpen(m)}
                              className="text-[12px] font-medium text-primary hover:underline flex items-center gap-1"
                            >
                              Open <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {filteredModules.length === 0 && (
              <div className="text-center py-16 text-slate-500 text-sm">
                No modules match "{query}".
              </div>
            )}

            <footer className="pt-4 pb-8 text-center text-[11px] text-slate-400">
              © Keehoo Industries · Digi Devalaya Business · v2.4.1
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BusinessHub;
