import type { ServiceBooking, ServiceBookingStatus } from "@/types/serviceBooking";
import { BookingsWorkspaceTable } from "../BookingsWorkspaceTable";

interface CounterBookingTableProps {
  bookings: ServiceBooking[];
  statusFilter?: ServiceBookingStatus | "all";
  showSourceFilter?: boolean;
  onSelect: (booking: ServiceBooking) => void;
}

export function CounterBookingTable({
  bookings,
  statusFilter: fixedStatus,
  showSourceFilter,
  onSelect,
}: CounterBookingTableProps) {
  return (
    <BookingsWorkspaceTable
      bookings={bookings}
      fixedStatus={fixedStatus === "all" ? undefined : fixedStatus}
      showSourceFilter={showSourceFilter}
      onRowClick={onSelect}
      emptyTitle="No bookings found"
      emptyDescription="Try adjusting search or filters."
      ariaLabel="Counter bookings table"
    />
  );
}
