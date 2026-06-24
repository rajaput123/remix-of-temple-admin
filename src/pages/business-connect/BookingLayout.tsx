import { BookOpen, Calendar, CalendarDays, Clock, Store } from "lucide-react";
import TempleLayout from "@/components/TempleLayout";

const navItems = [
  { label: "Today", path: "/business-connect/bookings", icon: Clock, badge: "Live" },
  { label: "All Bookings", path: "/business-connect/bookings/all", icon: BookOpen },
  { label: "Counter Booking", path: "/business-connect/bookings/counter", icon: Store },
  { label: "Calendar", path: "/business-connect/bookings/calendar", icon: CalendarDays },
];

export default function BookingLayout() {
  return (
    <TempleLayout
      title="Booking Management"
      icon={Calendar}
      navItems={navItems}
      contentClassName="px-4 pb-4 pt-3"
    />
  );
}
