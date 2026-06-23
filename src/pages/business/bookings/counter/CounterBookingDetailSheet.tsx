import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusPill } from "@/components/ui/status-pill";
import { formatPackageId, formatServiceId } from "@/components/service-management/shared";
import type { ServiceBooking } from "@/types/serviceBooking";
import {
  formatBookingAmount,
  formatBookingDate,
  formatBookingId,
  formatPaymentMode,
  formatPaymentRef,
} from "../bookingFormat";
import { downloadBookingReceipt, formatBookingReceiptNo } from "../bookingReceiptUtils";
import {
  bookingStatusTone,
  paymentStatusTone,
  SERVICE_DETAIL_FIELD_LABELS,
} from "./counterBookingConstants";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/50 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <dt className="shrink-0 text-xs font-medium text-muted-foreground sm:w-36">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <dl className="rounded-lg border border-border bg-muted/20 px-4">{children}</dl>
    </section>
  );
}

interface CounterBookingDetailSheetProps {
  booking: ServiceBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CounterBookingDetailSheet({ booking, open, onOpenChange }: CounterBookingDetailSheetProps) {
  if (!booking) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  const receiptNo = formatBookingReceiptNo(booking);
  const paymentRef = formatPaymentRef(booking);
  const details = booking.serviceDetails ?? {};

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle className="text-base">{booking.serviceName}</SheetTitle>
          <SheetDescription className="font-mono text-xs">{formatBookingId(booking.id)}</SheetDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            <StatusPill label={booking.status} tone={bookingStatusTone[booking.status]} />
            {booking.paymentStatus && (
              <StatusPill label={booking.paymentStatus} tone={paymentStatusTone[booking.paymentStatus]} />
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
          <Section title="Customer Information">
            <DetailRow label="Full Name">{booking.customerName}</DetailRow>
            <DetailRow label="Phone">{booking.customerPhone}</DetailRow>
            {booking.customerAlternatePhone && (
              <DetailRow label="Alternate Phone">{booking.customerAlternatePhone}</DetailRow>
            )}
            <DetailRow label="Email">{booking.customerEmail || "Not provided"}</DetailRow>
            {booking.customerPan && <DetailRow label="PAN">{booking.customerPan}</DetailRow>}
            <DetailRow label="Address">{booking.customerAddress || "Not provided"}</DetailRow>
            {(booking.customerCity || booking.customerState || booking.customerPincode) && (
              <DetailRow label="Location">
                {[booking.customerCity, booking.customerState, booking.customerPincode].filter(Boolean).join(", ")}
              </DetailRow>
            )}
          </Section>

          <Section title="Service & Schedule">
            <DetailRow label={booking.listingType === "package" ? "Package" : "Service"}>
              {booking.serviceName}
              {booking.listingType === "package" && booking.packageId
                ? ` · ${formatPackageId(booking.packageId)}`
                : ` · ${formatServiceId(booking.serviceId)}`}
            </DetailRow>
            {booking.listingType === "package" && (
              <DetailRow label="Primary Service">{formatServiceId(booking.serviceId)}</DetailRow>
            )}
            <DetailRow label="Category">{booking.category}</DetailRow>
            {booking.bookingPurpose && (
              <DetailRow label="Purpose">{booking.bookingPurpose}</DetailRow>
            )}
            <DetailRow label="Scheduled On">
              {formatBookingDate(booking.scheduledDate)} · {booking.scheduledTime}
            </DetailRow>
            {Object.entries(details).map(([key, value]) => (
              <DetailRow
                key={key}
                label={SERVICE_DETAIL_FIELD_LABELS[key as keyof typeof SERVICE_DETAIL_FIELD_LABELS] ?? key}
              >
                {String(value)}
              </DetailRow>
            ))}
            {booking.notes && <DetailRow label="Notes">{booking.notes}</DetailRow>}
          </Section>

          <Section title="Pricing & Payment">
            {booking.basePrice != null && (
              <DetailRow label="Service Price">{formatBookingAmount(booking.basePrice)}</DetailRow>
            )}
            {(booking.additionalCharges ?? 0) > 0 && (
              <DetailRow label="Additional">{formatBookingAmount(booking.additionalCharges!)}</DetailRow>
            )}
            {(booking.discount ?? 0) > 0 && (
              <DetailRow label="Discount">−{formatBookingAmount(booking.discount!)}</DetailRow>
            )}
            <DetailRow label="Total">{formatBookingAmount(booking.amount)}</DetailRow>
            <DetailRow label="Payment Mode">
              {formatPaymentMode(booking)} · {booking.paymentMethod}
            </DetailRow>
            <DetailRow label="Payment Ref">{paymentRef || "—"}</DetailRow>
            {booking.paidAmount != null && booking.paidAmount > 0 && (
              <DetailRow label="Received">{formatBookingAmount(booking.paidAmount)}</DetailRow>
            )}
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
          </Section>
        </div>

        <div className="border-t px-5 py-4">
          <Button className="w-full gap-2" onClick={() => downloadBookingReceipt(booking)}>
            <Receipt className="size-4" />
            Download receipt
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
