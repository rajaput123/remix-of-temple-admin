import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspacePage, WorkspaceStatusBar } from "@/components/workspace";
import { useCounterBookings } from "@/stores/serviceBookingStore";
import type { ServiceBooking, ServiceBookingStatus } from "@/types/serviceBooking";
import { CounterBookingCards } from "./CounterBookingCards";
import { CounterBookingDetailSheet } from "./CounterBookingDetailSheet";
import { CounterBookingTable } from "./CounterBookingTable";
import { cn } from "@/lib/utils";

type ViewMode = "table" | "card";

interface CounterBookingsPageProps {
  title?: string;
  description?: string;
  fixedStatus?: ServiceBookingStatus;
}

export default function CounterBookingsPage({
  title = "Counter Booking",
  description = "Walk-in, phone, WhatsApp and counter service requests. Use New Booking to create a booking.",
  fixedStatus,
}: CounterBookingsPageProps) {
  const navigate = useNavigate();
  const bookings = useCounterBookings();
  const [view, setView] = useState<ViewMode>("table");
  const [selected, setSelected] = useState<ServiceBooking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!fixedStatus) return bookings;
    return bookings.filter((b) => b.status === fixedStatus);
  }, [bookings, fixedStatus]);

  const openNewBooking = () => navigate("/business-connect/bookings/counter/new");

  const openDetail = (booking: ServiceBooking) => {
    setSelected(booking);
    setDetailOpen(true);
  };

  const counts = useMemo(
    () => ({
      all: bookings.length,
      enquiry: bookings.filter((b) => b.status === "Enquiry").length,
      quotation: bookings.filter((b) => b.status === "Quotation Sent").length,
      completed: bookings.filter((b) => b.status === "Completed").length,
    }),
    [bookings],
  );

  return (
    <WorkspacePage
      eyebrow="Booking Management · Counter"
      title={title}
      description={description}
      statusBar={<WorkspaceStatusBar />}
      actions={
        !fixedStatus ? (
          <Button size="sm" className="h-8 gap-1.5" onClick={openNewBooking}>
            <Plus className="size-4" />
            New Booking
          </Button>
        ) : null
      }
    >
      {!fixedStatus && filtered.length === 0 && (
        <div className="mx-4 mt-4 rounded-lg border border-dashed bg-muted/20 px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">No counter bookings yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Create a walk-in or phone booking to get started.</p>
          <Button className="mt-4 gap-2" onClick={openNewBooking}>
            <Plus className="size-4" />
            New Booking
          </Button>
        </div>
      )}

      {(fixedStatus || filtered.length > 0) && (
        <>
          <div className="flex items-center justify-end gap-1 border-b border-border px-4 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("h-7 px-2", view === "table" && "bg-muted")}
              onClick={() => setView("table")}
              aria-label="Table view"
            >
              <List className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("h-7 px-2", view === "card" && "bg-muted")}
              onClick={() => setView("card")}
              aria-label="Card view"
            >
              <LayoutGrid className="size-4" />
            </Button>
            {!fixedStatus && (
              <span className="ml-2 text-xs text-muted-foreground">
                {counts.all} total · {counts.quotation} quotations · {counts.completed} completed
              </span>
            )}
          </div>

          {view === "table" ? (
            <CounterBookingTable
              bookings={filtered}
              statusFilter={fixedStatus}
              onSelect={openDetail}
            />
          ) : (
            <CounterBookingCards bookings={filtered} onSelect={openDetail} />
          )}
        </>
      )}

      <CounterBookingDetailSheet booking={selected} open={detailOpen} onOpenChange={setDetailOpen} />
    </WorkspacePage>
  );
}
