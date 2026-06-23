import { Calendar } from "lucide-react";
import { WorkspacePage } from "@/components/workspace";
import { useCounterBookings } from "@/stores/serviceBookingStore";
import { formatBookingDate, formatBookingId } from "../bookingFormat";

export default function BookingCalendarPage() {
  const bookings = useCounterBookings();

  const byDate = [...bookings].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(),
  );

  return (
    <WorkspacePage
      eyebrow="Booking Management"
      title="Calendar"
      description="Upcoming counter bookings by scheduled date."
    >
      <div className="p-6">
        {byDate.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <Calendar className="mb-3 size-10 opacity-40" />
            <p className="text-sm">No scheduled counter bookings yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {byDate.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{formatBookingDate(b.scheduledDate)} · {b.scheduledTime}</p>
                  <p className="text-muted-foreground">
                    {b.serviceName} — {b.customerName}
                  </p>
                </div>
                <span className="font-mono text-xs text-primary">{formatBookingId(b.id)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </WorkspacePage>
  );
}
