export type CustomerStatus = "Active" | "Inactive" | "Lead";

export type CustomerType = "Individual" | "Corporate";

export type CustomerSource = "Counter" | "Online" | "Referral" | "Marketplace" | "WhatsApp";

export type PremiumTier = "Platinum" | "Gold" | "Silver";

export interface CustomerCommLog {
  date: string;
  channel: "WhatsApp" | "SMS" | "Email" | "Call";
  subject: string;
  status: "Sent" | "Delivered" | "Read" | "Failed";
}

export interface CustomerReview {
  date: string;
  rating: number;
  content: string;
  serviceName: string;
}

export interface BusinessCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  companyName?: string;
  customerType: CustomerType;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  pan?: string;
  gstin?: string;
  preferredLanguage?: string;
  tags: string[];
  source: CustomerSource | string;
  status: CustomerStatus;
  notes?: string;
  totalBookings: number;
  lifetimeSpend: number;
  lastBookingDate?: string;
  createdAt: string;
  isPremium?: boolean;
  premiumTier?: PremiumTier;
  commLogs?: CustomerCommLog[];
  reviews?: CustomerReview[];
}
