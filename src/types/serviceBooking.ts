export type ServiceBookingSource = "Online" | "Counter";

export type ServiceBookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface ServiceBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  scheduledDate: string;
  scheduledTime: string;
  amount: number;
  source: ServiceBookingSource;
  paymentMethod: "Cash" | "UPI" | "Bank" | "Online";
  paymentMode: string;
  referenceNo?: string;
  status: ServiceBookingStatus;
  notes?: string;
  createdAt: string;
}
