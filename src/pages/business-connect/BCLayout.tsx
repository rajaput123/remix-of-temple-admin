import { LayoutDashboard, ListChecks, User, Sparkles } from "lucide-react";
import TempleLayout from "@/components/TempleLayout";

const navItems = [
  { label: "Dashboard", path: "/business-connect/dashboard", icon: LayoutDashboard, description: "Overview and setup" },
  { label: "Services", path: "/business-connect/services", icon: ListChecks, description: "Services you offer" },
  { label: "Profile", path: "/business-connect/profile", icon: User, description: "Your public profile" },
];

const BCLayout = () => {
  return <TempleLayout title="Business Connect" icon={Sparkles} navItems={navItems} />;
};

export default BCLayout;
