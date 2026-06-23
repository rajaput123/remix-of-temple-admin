import { toast } from "sonner";
import { downloadBookingReceiptPdf } from "@/lib/bookingReceipt";
import type { ServiceBooking } from "@/types/serviceBooking";

export function formatBookingReceiptNo(booking: ServiceBooking): string {
  if (booking.receiptNo) return booking.receiptNo;
  const num = booking.id.match(/^bkg-(\d+)$/i)?.[1];
  const year = new Date(booking.createdAt).getFullYear();
  return `BR-${year}-${String(num ?? "0").padStart(4, "0")}`;
}

export function downloadBookingReceipt(booking: ServiceBooking) {
  try {
    const receiptNo = formatBookingReceiptNo(booking);
    downloadBookingReceiptPdf(booking, receiptNo);
    toast.success("Receipt downloaded", { description: `${receiptNo}.pdf saved` });
  } catch {
    toast.error("Failed to download receipt");
  }
}
