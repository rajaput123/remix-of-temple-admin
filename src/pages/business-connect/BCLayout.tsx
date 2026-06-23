import { LayoutDashboard, ListChecks, PackagePlus, Sparkles } from "lucide-react";
import TempleLayout from "@/components/TempleLayout";

const SERVICE_RESERVED = new Set(["packages", "availability", "pricing", "list", "addons"]);

const navItems = [
  {
    label: "Dashboard",
    path: "/business-connect/services",
    icon: LayoutDashboard,
    description: "KPIs, trends & service overview",
    isActive: (pathname: string) => pathname === "/business-connect/services",
  },
  {
    label: "Service listing",
    path: "/business-connect/services/list",
    icon: ListChecks,
    description: "Manage your services",
    isActive: (pathname: string) => {
      if (pathname === "/business-connect/services/list") return true;
      const match = pathname.match(/^\/business-connect\/services\/([^/]+)$/);
      return !!match && !SERVICE_RESERVED.has(match[1]);
    },
  },
  {
    label: "Add-ons",
    path: "/business-connect/services/addons",
    icon: PackagePlus,
    description: "Optional extras or customizable options",
    isActive: (pathname: string) => pathname.startsWith("/business-connect/services/addons"),
  },
];

const BCLayout = () => {
  return (
    <TempleLayout
      title="Service Listings"
      icon={Sparkles}
      navItems={navItems}
      profileName="Alex Sterling"
      profileRole="Finance Lead · Admin"
      profileInitials="AS"
    />
  );
};

export default BCLayout;
