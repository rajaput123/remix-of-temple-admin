export type ServiceBookingSource = "Online" | "Counter";

export type ServiceBookingStatus =
  | "Enquiry"
  | "Quotation Sent"
  | "Confirmed"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export type PaymentStatus = "Pending" | "Partial" | "Paid";

export type CounterPricingMode = "Fixed Price" | "Custom Price" | "Quote Based";

export interface ServiceBookingDetails {
  location?: string;
  guestCount?: number;
  eventType?: string;
  participants?: number;
  roomCount?: number;
  vehicleType?: string;
  checkIn?: string;
  checkOut?: string;
}

export type ServiceBookingListingType = "service" | "package";

export interface ServiceBooking {
  id: string;
  customerId?: string;
  listingType?: ServiceBookingListingType;
  serviceId: string;
  packageId?: string;
  serviceName: string;
  category: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAlternatePhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerPincode?: string;
  customerPan?: string;
  bookingPurpose?: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceDetails?: ServiceBookingDetails;
  basePrice?: number;
  additionalCharges?: number;
  discount?: number;
  pricingMode?: CounterPricingMode;
  amount: number;
  source: ServiceBookingSource;
  paymentMethod: "Cash" | "UPI" | "Bank" | "Online";
  paymentMode: string;
  paymentStatus?: PaymentStatus;
  paidAmount?: number;
  referenceNo?: string;
  receiptNo?: string;
  status: ServiceBookingStatus;
  notes?: string;
  createdAt: string;
}
