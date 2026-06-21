export type ServiceStatus = "Draft" | "Active" | "Inactive";
export type ServiceAvailability = "Available" | "Limited Availability" | "Not Available";
export type PricingType = "Fixed Price" | "Starting From" | "Quote Based";
export type CoverageType = "Local" | "District" | "Statewide" | "Nationwide";
export type ServiceType = "at_customer" | "at_temple" | "online" | "hybrid";
export type DurationUnit = "Minutes" | "Hours" | "Half Day" | "Full Day" | "Days";

export interface BookingSettings {
  allowEnquiries: boolean;
  allowConsultation: boolean;
  allowDirectBooking: boolean;
  requireApproval: boolean;
}

export interface BusinessService {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  serviceType: ServiceType;
  durationValue: string;
  durationUnit: DurationUnit;
  languages: string[];
  state?: string;
  district?: string;
  city?: string;
  coverage: CoverageType;
  image?: string;
  gallery: string[];
  videoLinks: string[];
  pricingType: PricingType;
  price?: string;
  /** Optional — e.g. 10% or ₹500 off */
  discount?: string;
  currency: string;
  requirements: string;
  booking: BookingSettings;
  availability: ServiceAvailability;
  days: string[];
  startTime: string;
  endTime: string;
  /** Optional offer / listing window (YYYY-MM-DD) */
  startDate?: string;
  endDate?: string;
  /** Optional max booking slots per period */
  slots?: string;
  status: ServiceStatus;
  updatedAt: string;
  views: number;
  enquiries: number;
}

export interface ServicePackage {
  id: string;
  /** The main service this package extends */
  primaryServiceId: string;
  name: string;
  description: string;
  price: string;
  discount?: string;
  validity?: string;
  status: ServiceStatus;
  updatedAt: string;
}

export interface AvailabilitySettings {
  workingDays: string[];
  startTime: string;
  endTime: string;
  festivalAvailability: boolean;
  holidayAvailability: boolean;
  advanceBookingDays: string;
  notes?: string;
}

export interface PricingRule {
  id: string;
  name: string;
  serviceId?: string;
  basePrice: string;
  discountType?: "percent" | "flat";
  discountValue?: string;
  seasonalPricing?: string;
  festivalPricing?: string;
  effectiveDate?: string;
  expiryDate?: string;
  updatedAt: string;
}

export const SERVICE_CATEGORIES = [
  "Priest Services",
  "Catering",
  "Hotel",
  "Travel",
  "Astrology",
  "Vastu",
  "Decoration",
  "Photography",
  "Music",
  "Flower Vendor",
] as const;

export const WORKING_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const SERVICE_LANGUAGES = [
  "Kannada",
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Malayalam",
] as const;

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  at_customer: "At Customer Location",
  at_temple: "At Temple",
  online: "Online",
  hybrid: "Hybrid",
};
