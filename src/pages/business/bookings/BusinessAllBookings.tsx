import { useNavigate } from "react-router-dom";
import { Inbox, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspacePage, WorkspaceStatusBar } from "@/components/workspace";
import { useServiceBookings } from "@/stores/serviceBookingStore";
import type { ServiceBooking } from "@/types/serviceBooking";
import { useState } from "react";
import { BookingsWorkspaceTable } from "./BookingsWorkspaceTable";
import { CounterBookingDetailSheet } from "./counter/CounterBookingDetailSheet";

export default function BusinessAllBookings() {
  const navigate = useNavigate();
  const bookings = useServiceBookings();
  const [selected, setSelected] = useState<ServiceBooking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const hasAny = bookings.length > 0;

  const openDetail = (booking: ServiceBooking) => {
    setSelected(booking);
    setDetailOpen(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Booking Management"
        title="All Bookings"
        description="Counter and online bookings — filter by source, category, status, or reference ID."
        statusBar={hasAny ? <WorkspaceStatusBar /> : undefined}
        actions={
          hasAny ? (
            <Button
              size="sm"
              className="h-9 gap-1.5 text-xs"
              onClick={() => navigate("/business-connect/bookings/counter")}
            >
              <Plus className="size-3.5" />
              New Booking
            </Button>
          ) : undefined
        }
      >
        {!hasAny && (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <div className="max-w-sm py-16 text-center">
              <Inbox className="mx-auto size-10 text-muted-foreground/40" />
              <p className="mt-4 text-sm font-medium text-foreground">No bookings yet</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Create a counter booking or wait for online orders to appear here.
              </p>
              <div className="mt-6">
                <Button
                  size="sm"
                  className="h-9 gap-1.5 text-xs"
                  onClick={() => navigate("/business-connect/bookings/counter")}
                >
                  <Plus className="size-3.5" />
                  New Booking
                </Button>
              </div>
            </div>
          </div>
        )}

        {hasAny && (
          <BookingsWorkspaceTable
            bookings={bookings}
            showSourceFilter
            onRowClick={openDetail}
            ariaLabel="All bookings table"
          />
        )}
      </WorkspacePage>

      <CounterBookingDetailSheet booking={selected} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
