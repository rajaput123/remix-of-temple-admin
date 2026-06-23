import type { ServiceBooking } from "@/types/serviceBooking";

export function formatBookingId(id: string): string {
  const match = id.match(/^bkg-(\d+)$/i);
  if (match) return `BKG-${match[1].padStart(3, "0")}`;
  return id.toUpperCase();
}

export function formatBookingDate(iso: string): string {
  try {
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function formatBookingAmount(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Gateway or channel used for payment (Razorpay, UPI, PhonePe, etc.) */
export function formatPaymentMode(booking: Pick<ServiceBooking, "paymentMode">): string {
  return booking.paymentMode?.trim() || "—";
}

/** Transaction / UPI / gateway reference from the payment provider */
export function formatPaymentRef(booking: Pick<ServiceBooking, "referenceNo">): string | null {
  return booking.referenceNo?.trim() || null;
}

export function formatCustomerLocation(
  booking: Pick<ServiceBooking, "customerCity" | "customerState" | "customerPincode">,
): string | null {
  const parts = [booking.customerCity, booking.customerState, booking.customerPincode].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

export function formatCustomerAddressBlock(
  booking: Pick<
    ServiceBooking,
    "customerAddress" | "customerCity" | "customerState" | "customerPincode"
  >,
): string | null {
  const lines = [
    booking.customerAddress,
    formatCustomerLocation(booking),
  ].filter(Boolean);
  return lines.length > 0 ? lines.join("\n") : null;
}
