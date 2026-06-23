import { CalendarCheck, CalendarDays, CheckCircle2, FileText, Globe, Store } from "lucide-react";
import TempleLayout from "@/components/TempleLayout";

const navItems = [
  {
    label: "Counter Booking",
    path: "/business-connect/bookings/counter",
    icon: Store,
    description: "Walk-in, phone and counter service bookings",
    isActive: (pathname: string) =>
      pathname === "/business-connect/bookings/counter" ||
      pathname.startsWith("/business-connect/bookings/counter/") ||
      pathname === "/business-connect/bookings/all" ||
      pathname === "/business-connect/bookings/new" ||
      pathname === "/business-connect/bookings",
  },
  {
    label: "Online Booking",
    path: "/business-connect/bookings/online",
    icon: Globe,
    description: "Paid bookings from website and marketplace",
  },
  {
    label: "Calendar",
    path: "/business-connect/bookings/calendar",
    icon: CalendarDays,
    description: "Scheduled bookings calendar",
  },
  {
    label: "Quotations",
    path: "/business-connect/bookings/quotations",
    icon: FileText,
    description: "Quotations sent to customers",
  },
  {
    label: "Completed",
    path: "/business-connect/bookings/completed",
    icon: CheckCircle2,
    description: "Completed service bookings",
  },
];

export default function BookingLayout() {
  return (
    <TempleLayout title="Booking Management" icon={CalendarCheck} navItems={navItems} />
  );
}
