import { CalendarCheck, Globe, Store } from "lucide-react";
import TempleLayout from "@/components/TempleLayout";

const navItems = [
  {
    label: "Online Booking",
    path: "/business-connect/bookings/online",
    icon: Globe,
    description: "Bookings from website and app",
    isActive: (pathname: string) =>
      pathname === "/business-connect/bookings/online" ||
      pathname === "/business-connect/bookings",
  },
  {
    label: "Counter Booking",
    path: "/business-connect/bookings/counter",
    icon: Store,
    description: "Walk-in bookings at your counter",
  },
];

export default function BookingLayout() {
  return (
    <TempleLayout title="Booking Management" icon={CalendarCheck} navItems={navItems} />
  );
}
