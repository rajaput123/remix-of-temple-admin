import { Building2, Globe } from "lucide-react";
import TempleLayout from "@/components/TempleLayout";

const navItems = [
  { label: "Profile", path: "/business/profile", icon: Building2, description: "Your public business profile" },
  { label: "Website", path: "/business/profile/website", icon: Globe, description: "Your Digidevalaya website" },
];

const BusinessProfileLayout = () => {
  return <TempleLayout title="Business" icon={Building2} navItems={navItems} />;
};

export default BusinessProfileLayout;
