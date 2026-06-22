import { Calendar, Clock, BookOpen, Store, UserCheck, Cookie } from "lucide-react";
import TempleLayout from "@/components/TempleLayout";

const navItems = [
  {
    label: "Today",
    path: "/business-connect/bookings",
    icon: Clock,
    badge: "Live",
    isActive: (pathname: string) =>
      pathname === "/business-connect/bookings" ||
      pathname === "/business-connect/bookings/",
  },
  { label: "All Bookings", path: "/business-connect/bookings/all", icon: BookOpen, badge: "156" },
  { label: "Counter Booking", path: "/business-connect/bookings/counter", icon: Store },
  { label: "Prasad Counter", path: "/business-connect/bookings/prasad", icon: Cookie },
  { label: "Attendance", path: "/business-connect/bookings/attendance", icon: UserCheck },
];

export default function BookingLayout() {
  return (
    <TempleLayout title="Booking Management" icon={Calendar} navItems={navItems} />
  );
}
