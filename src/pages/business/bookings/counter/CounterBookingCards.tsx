import type { ServiceBooking } from "@/types/serviceBooking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { formatBookingAmount, formatBookingDate, formatBookingId } from "../bookingFormat";
import { bookingStatusTone, paymentStatusTone } from "./counterBookingConstants";

interface CounterBookingCardsProps {
  bookings: ServiceBooking[];
  onSelect: (booking: ServiceBooking) => void;
}

export function CounterBookingCards({ bookings, onSelect }: CounterBookingCardsProps) {
  if (bookings.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No counter bookings yet. Create one with New Booking.
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {bookings.map((b) => (
        <Card
          key={b.id}
          className="cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/20"
          onClick={() => onSelect(b)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-sm font-medium leading-snug">{b.serviceName}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {b.listingType === "package" ? "Package · " : ""}
                  {b.category}
                </p>
              </div>
              <StatusPill label={b.status} tone={bookingStatusTone[b.status]} />
            </div>
            <p className="font-mono text-[11px] text-primary">{formatBookingId(b.id)}</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="font-medium">{b.customerName}</p>
              <p className="text-xs text-muted-foreground">{b.customerPhone}</p>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">
                {formatBookingDate(b.scheduledDate)} · {b.scheduledTime}
              </span>
              <span className="font-mono font-semibold tabular-nums">{formatBookingAmount(b.amount)}</span>
            </div>
            {b.paymentStatus && (
              <StatusPill label={b.paymentStatus} tone={paymentStatusTone[b.paymentStatus]} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
