import jsPDF from "jspdf";
import type { ServiceBooking } from "@/types/serviceBooking";
import { rupeesInWords } from "./numberToWords";

function formatDateLong(value: string): string {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return value;
  }
}

function drawField(doc: jsPDF, label: string, value: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(label, 18, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  const wrapped = doc.splitTextToSize(value || "—", 115);
  doc.text(wrapped, 18, y + 5);
  return y + 5 + Math.max(5, wrapped.length * 5);
}

export function downloadBookingReceiptPdf(booking: ServiceBooking, receiptNo: string) {
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const w = doc.internal.pageSize.getWidth();

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.6);
  doc.line(16, 14, w - 16, 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text("Service Booking Receipt", w / 2, 22, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Business Connect · Online Booking", w / 2, 28, { align: "center" });

  let y = 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(`Receipt No: ${receiptNo}`, 18, y);
  doc.text(`Date: ${formatDateLong(booking.createdAt)}`, w - 18, y, { align: "right" });
  y += 10;

  y = drawField(doc, "Booking ID", booking.id, y);
  y = drawField(doc, "Customer", booking.customerName, y);
  if (booking.customerPhone) y = drawField(doc, "Phone", booking.customerPhone, y);
  if (booking.customerAlternatePhone) y = drawField(doc, "Alternate Phone", booking.customerAlternatePhone, y);
  if (booking.customerEmail) y = drawField(doc, "Email", booking.customerEmail, y);
  const address = [booking.customerAddress, [booking.customerCity, booking.customerState, booking.customerPincode].filter(Boolean).join(", ")].filter(Boolean).join(", ");
  if (address) y = drawField(doc, "Address", address, y);
  y = drawField(doc, "Service", booking.serviceName, y);
  y = drawField(doc, "Category", booking.category, y);
  y = drawField(doc, "Scheduled", `${booking.scheduledDate} · ${booking.scheduledTime}`, y);
  y = drawField(doc, "Amount", `₹ ${booking.amount.toLocaleString("en-IN")} /-`, y);
  y = drawField(doc, "Amount in Words", rupeesInWords(booking.amount), y);
  y = drawField(doc, "Pay Mode", `${booking.paymentMode} (${booking.paymentMethod})`, y);
  if (booking.referenceNo) y = drawField(doc, "Payment Reference", booking.referenceNo, y);
  if (booking.notes) y = drawField(doc, "Notes", booking.notes, y);

  y += 8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("This is a computer-generated receipt for your online service booking.", w / 2, y, { align: "center" });

  doc.save(`${receiptNo}.pdf`);
}
