import { Bell, FileText, Inbox, Megaphone, MessageSquare, ScrollText, Send, Zap } from "lucide-react";
import TempleLayout from "@/components/TempleLayout";

const navItems = [
  {
    label: "Inbox",
    path: "/business-connect/communication",
    icon: Inbox,
    badge: "Live",
    description: "Customer conversations across channels",
  },
  {
    label: "Announcements",
    path: "/business-connect/communication/announcements",
    icon: Megaphone,
    description: "Customer & staff notices",
  },
  {
    label: "Notifications",
    path: "/business-connect/communication/notifications",
    icon: Bell,
    description: "Delivery alerts & system updates",
  },
  {
    label: "Campaigns",
    path: "/business-connect/communication/campaigns",
    icon: Send,
    description: "Target CRM segments",
  },
  {
    label: "Automations",
    path: "/business-connect/communication/automations",
    icon: Zap,
    description: "Booking and payment triggers",
  },
  {
    label: "Templates",
    path: "/business-connect/communication/templates",
    icon: FileText,
    description: "Reusable business messages",
  },
  {
    label: "Logs",
    path: "/business-connect/communication/logs",
    icon: ScrollText,
    description: "Delivery audit trail",
  },
];

export default function BusinessCommunicationLayout() {
  return (
    <TempleLayout
      title="Communication Center"
      icon={MessageSquare}
      navItems={navItems}
      profileName="Alex Sterling"
      profileRole="Operations Lead · Admin"
      profileInitials="AS"
      contentClassName="px-4 pb-4 pt-3"
    />
  );
}
