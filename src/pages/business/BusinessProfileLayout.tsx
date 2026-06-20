import { LayoutDashboard, FileText, Image, ShieldCheck, Eye, Building2 } from "lucide-react";
import TempleLayout from "@/components/TempleLayout";

const navItems = [
  { label: "Overview", path: "/business/profile", icon: LayoutDashboard, description: "Profile completion & status" },
  { label: "Business Information", path: "/business/profile/information", icon: FileText, description: "Basic, owner, location & hours" },
  { label: "Gallery & Media", path: "/business/profile/gallery", icon: Image, description: "Logo, cover, photos & videos" },
  { label: "Verification", path: "/business/profile/verification", icon: ShieldCheck, description: "KYC documents & trust" },
  { label: "Profile Preview", path: "/business/profile/preview", icon: Eye, description: "How devotees see you" },
];

const BusinessProfileLayout = () => {
  return <TempleLayout title="Business Profile" icon={Building2} navItems={navItems} />;
};

export default BusinessProfileLayout;
