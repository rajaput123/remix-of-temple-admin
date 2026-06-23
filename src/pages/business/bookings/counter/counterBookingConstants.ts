import type { ServiceBookingStatus, PaymentStatus } from "@/types/serviceBooking";
import type { StatusTone } from "@/components/ui/status-pill";

export const BOOKING_STATUSES: ServiceBookingStatus[] = [
  "Enquiry",
  "Quotation Sent",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
];

export const PAYMENT_STATUSES: PaymentStatus[] = ["Pending", "Partial", "Paid"];

export const PAYMENT_MODES = ["Cash", "UPI", "Card", "Bank Transfer"] as const;

export type CounterPaymentMode = (typeof PAYMENT_MODES)[number];

export const WIZARD_STEPS = [
  "Select Service or Package",
  "Customer Details",
  "Service Details",
  "Pricing",
  "Booking Status",
  "Payment",
  "Confirmation",
] as const;

export const bookingStatusTone: Record<ServiceBookingStatus, StatusTone> = {
  Enquiry: "info",
  "Quotation Sent": "warning",
  Confirmed: "success",
  "In Progress": "info",
  Completed: "neutral",
  Cancelled: "destructive",
};

export const paymentStatusTone: Record<PaymentStatus, StatusTone> = {
  Pending: "warning",
  Partial: "info",
  Paid: "success",
};

export type ServiceDetailField =
  | "location"
  | "guestCount"
  | "eventType"
  | "participants"
  | "roomCount"
  | "vehicleType"
  | "checkIn"
  | "checkOut";

export const SERVICE_DETAIL_FIELD_LABELS: Record<ServiceDetailField, string> = {
  location: "Location",
  guestCount: "Guest Count",
  eventType: "Event Type",
  participants: "Number of Participants",
  roomCount: "Number of Rooms",
  vehicleType: "Vehicle Type",
  checkIn: "Check-In Date",
  checkOut: "Check-Out Date",
};

export function getServiceDetailFields(category: string): ServiceDetailField[] {
  switch (category) {
    case "Catering":
      return ["location", "guestCount", "eventType"];
    case "Priest Services":
      return ["location", "participants", "eventType"];
    case "Hotel":
      return ["location", "checkIn", "checkOut", "roomCount"];
    case "Travel":
      return ["location", "vehicleType", "participants"];
    default:
      return ["location"];
  }
}

export function parseServicePrice(price?: string): number {
  const n = Number(price?.replace(/[^\d.]/g, "") || 0);
  return Number.isFinite(n) ? n : 0;
}

export function computeTotalAmount(
  basePrice: number,
  additionalCharges: number,
  discount: number,
  customPrice?: number,
): number {
  const base = customPrice ?? basePrice;
  return Math.max(0, base + additionalCharges - discount);
}

export function paymentMethodFromMode(mode: CounterPaymentMode): "Cash" | "UPI" | "Bank" | "Online" {
  if (mode === "UPI") return "UPI";
  if (mode === "Bank Transfer") return "Bank";
  if (mode === "Card") return "Online";
  return "Cash";
}

export const BOOKING_PURPOSES = [
  "Housewarming / Gruhapravesha",
  "Wedding",
  "Festival / Pooja",
  "Anniversary",
  "Corporate Event",
  "Personal Consultation",
  "Other",
] as const;

export type BookingPurpose = (typeof BOOKING_PURPOSES)[number];

/** Hourly slots from service availability window. */
export function generateServiceSlots(service: { startTime?: string; endTime?: string }): string[] {
  const parse = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const start = parse(service.startTime || "06:00");
  const end = parse(service.endTime || "18:00");
  const slots: string[] = [];
  for (let mins = start; mins < end; mins += 60) {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 || 12;
    slots.push(`${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`);
  }
  return slots.length ? slots : ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];
}
