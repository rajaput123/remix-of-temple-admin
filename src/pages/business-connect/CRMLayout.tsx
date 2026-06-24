import { BarChart3, Tags, Users } from "lucide-react";
import TempleLayout from "@/components/TempleLayout";

const navItems = [
  {
    label: "Customers",
    path: "/business-connect/crm",
    icon: Users,
    badge: "CRM",
    description: "Customer records & relationship history",
  },
  {
    label: "Segments",
    path: "/business-connect/crm/segments",
    icon: Tags,
    description: "Customer groups for campaigns",
  },
  {
    label: "Insights",
    path: "/business-connect/crm/insights",
    icon: BarChart3,
    description: "CRM analytics & trends",
  },
];

export default function CRMLayout() {
  return (
    <TempleLayout
      title="CRM"
      icon={Users}
      navItems={navItems}
      profileName="Alex Sterling"
      profileRole="Operations Lead · Admin"
      profileInitials="AS"
      contentClassName="px-4 pb-4 pt-3"
    />
  );
}
