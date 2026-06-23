import {
  Calendar,
  CreditCard,
  Hash,
  Mail,
  MapPin,
  Phone,
  Receipt,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatServiceId } from "@/components/service-management/shared";
import type { ServiceBooking } from "@/types/serviceBooking";
import {
  formatBookingAmount,
  formatBookingDate,
  formatBookingId,
  formatPaymentMode,
  formatPaymentRef,
} from "./bookingFormat";
import { downloadBookingReceipt, formatBookingReceiptNo } from "./bookingReceiptUtils";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/50 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <dt className="shrink-0 text-xs font-medium text-muted-foreground sm:w-36">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <dl className="rounded-lg border border-border bg-muted/20 px-4">{children}</dl>
    </section>
  );
}

function MissingValue() {
  return <span className="text-muted-foreground">Not provided</span>;
}

interface OnlineBookingDetailSheetProps {
  booking: ServiceBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnlineBookingDetailSheet({ booking, open, onOpenChange }: OnlineBookingDetailSheetProps) {
  const receiptNo = booking ? formatBookingReceiptNo(booking) : "";
  const paymentRef = booking ? formatPaymentRef(booking) : null;

  return (
    <Sheet open={open && !!booking} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        {booking && (
          <>
            <SheetHeader className="border-b px-5 py-4 text-left">
              <SheetTitle className="text-base">{booking.serviceName}</SheetTitle>
              <SheetDescription className="font-mono text-xs">
                {formatBookingId(booking.id)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
              <DetailSection title="Customer Information">
                <DetailRow label="Full Name">
                  <p className="flex items-center gap-1.5 font-medium">
                    <User className="size-3.5 shrink-0 text-muted-foreground" />
                    {booking.customerName}
                  </p>
                </DetailRow>
                <DetailRow label="Phone">
                  <p className="flex items-center gap-1.5">
                    <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                    {booking.customerPhone}
                  </p>
                </DetailRow>
                <DetailRow label="Alternate Phone">
                  {booking.customerAlternatePhone ? (
                    <p className="flex items-center gap-1.5">
                      <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                      {booking.customerAlternatePhone}
                    </p>
                  ) : (
                    <MissingValue />
                  )}
                </DetailRow>
                <DetailRow label="Email">
                  {booking.customerEmail ? (
                    <p className="flex items-center gap-1.5 break-all">
                      <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                      {booking.customerEmail}
                    </p>
                  ) : (
                    <MissingValue />
                  )}
                </DetailRow>
                <DetailRow label="Address">
                  {booking.customerAddress ? (
                    <p className="flex items-start gap-1.5">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      {booking.customerAddress}
                    </p>
                  ) : (
                    <MissingValue />
                  )}
                </DetailRow>
                <DetailRow label="City">
                  {booking.customerCity || <MissingValue />}
                </DetailRow>
                <DetailRow label="State">
                  {booking.customerState || <MissingValue />}
                </DetailRow>
                <DetailRow label="PIN Code">
                  {booking.customerPincode || <MissingValue />}
                </DetailRow>
              </DetailSection>

              <DetailSection title="Booking Details">
                <DetailRow label="Booking ID">
                  <span className="font-mono text-sm">{formatBookingId(booking.id)}</span>
                </DetailRow>
                <DetailRow label="Receipt No">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 font-mono text-sm text-primary hover:underline"
                    onClick={() => downloadBookingReceipt(booking)}
                  >
                    <Receipt className="size-3.5" />
                    {receiptNo}
                  </button>
                </DetailRow>
                <DetailRow label="Service Name">
                  <div className="space-y-0.5">
                    <p>{booking.serviceName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatServiceId(booking.serviceId)} · {booking.category}
                    </p>
                  </div>
                </DetailRow>
                <DetailRow label="Scheduled On">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                    {formatBookingDate(booking.scheduledDate)} · {booking.scheduledTime}
                  </p>
                </DetailRow>
                <DetailRow label="Booked On">
                  {new Date(booking.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </DetailRow>
                {booking.notes && (
                  <DetailRow label="Notes">
                    <p className="text-muted-foreground">{booking.notes}</p>
                  </DetailRow>
                )}
              </DetailSection>

              <DetailSection title="Payment">
                <DetailRow label="Amount">
                  <p className="font-mono font-semibold tabular-nums">
                    {formatBookingAmount(booking.amount)}
                  </p>
                </DetailRow>
                <DetailRow label="Payment Mode">
                  <p className="flex items-center gap-1.5">
                    <CreditCard className="size-3.5 shrink-0 text-muted-foreground" />
                    {formatPaymentMode(booking)} · {booking.paymentMethod}
                  </p>
                </DetailRow>
                <DetailRow label="Payment Ref">
                  {paymentRef ? (
                    <p className="flex items-center gap-1.5 font-mono text-sm">
                      <Hash className="size-3.5 shrink-0 text-muted-foreground" />
                      {paymentRef}
                    </p>
                  ) : (
                    <MissingValue />
                  )}
                </DetailRow>
              </DetailSection>
            </div>

            <div className="border-t px-5 py-4">
              <Button className="w-full gap-2" onClick={() => downloadBookingReceipt(booking)}>
                <Receipt className="size-4" />
                Download receipt
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
