import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Calendar,
  Megaphone,
  Settings,
  Sparkles,
  UserCheck,
  Video,
  Boxes,
  IndianRupee,
} from "lucide-react";

export interface HubModule {
  id: string;
  title: string;
  icon: LucideIcon;
  path: string;
}

/** Module names shown on Temple Hub — sidebar header uses these when path matches. */
export const HUB_MODULES: HubModule[] = [
  { id: "business-profile", title: "Business Profile", icon: Building2, path: "/business/profile" },
  {
    id: "service-listings",
    title: "Service Listings",
    icon: Sparkles,
    path: "/business-connect/services",
  },
  {
    id: "marketing",
    title: "Marketing Services",
    icon: Megaphone,
    path: "/business-connect/marketing",
  },
  { id: "bookings", title: "Booking Management", icon: Calendar, path: "/temple/bookings" },
  { id: "crm", title: "CRM", icon: UserCheck, path: "/temple/devotees" },
  { id: "communication", title: "Communication", icon: Megaphone, path: "/temple/communication" },
  { id: "live-services", title: "Live Services", icon: Video, path: "/business-connect/live" },
  { id: "inventory", title: "Inventory & Assets", icon: Boxes, path: "/temple/inventory" },
  { id: "finance", title: "Finance & Accounts", icon: IndianRupee, path: "/temple/finance" },
  { id: "reports", title: "Reports & Analytics", icon: BarChart3, path: "/temple/reports" },
  { id: "settings", title: "Settings", icon: Settings, path: "/temple/settings" },
];

const MODULES_BY_PATH_LENGTH = [...HUB_MODULES].sort((a, b) => b.path.length - a.path.length);

export function resolveHubModule(pathname: string): HubModule | null {
  return (
    MODULES_BY_PATH_LENGTH.find(
      (module) => pathname === module.path || pathname.startsWith(`${module.path}/`),
    ) ?? null
  );
}
