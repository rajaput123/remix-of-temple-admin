import { useMemo } from "react";
import { WorkspacePage, WorkspaceStatusBar } from "@/components/workspace";
import { useServiceBookings } from "@/stores/serviceBookingStore";
import { OnlineBookingTable } from "./OnlineBookingTable";

export default function OnlineServiceBookings() {
  const allBookings = useServiceBookings();
  const onlineBookings = useMemo(
    () => allBookings.filter((b) => b.source === "Online"),
    [allBookings],
  );

  return (
    <WorkspacePage
      eyebrow="Booking Management · Online"
      title="Online Booking"
      description="Paid bookings from your website and marketplace — confirmed when payment reference is received."
      statusBar={<WorkspaceStatusBar />}
    >
      <OnlineBookingTable bookings={onlineBookings} />
    </WorkspacePage>
  );
}
