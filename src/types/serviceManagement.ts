export type ServiceStatus = "Draft" | "Active" | "Inactive";
export type ServiceAvailability = "Available" | "Limited Availability" | "Not Available";
export type PricingType = "Fixed Price" | "Starting From" | "Contact For Pricing" | "Quote Based";

export type AddOnPricingType = "Fixed Price" | "Starting From" | "Contact For Pricing";

export type CustomFieldType =
  | "Text"
  | "Number"
  | "Date"
  | "Dropdown"
  | "Multi Select"
  | "Checkbox"
  | "Text Area";

export interface ServiceCustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  required: boolean;
  /** Comma-separated or structured options for Dropdown / Multi Select */
  options?: string[];
}

export interface ServiceAddOn {
  id: string;
  name: string;
  description?: string;
  pricingType: AddOnPricingType;
  price?: string;
  linkedServiceIds?: string[];
}

/** Listing status shown in create form (Draft is set via Save Draft action) */
export type ListingVisibilityStatus = "Active" | "Inactive";
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
  /** Label for capacity unit — e.g. Slots, Rooms, Tables */
  capacityLabel?: string;
  status: ServiceStatus;
  updatedAt: string;
  views: number;
  enquiries: number;
  customFields?: ServiceCustomField[];
  addOns?: ServiceAddOn[];
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

/** Business-owner friendly categories for service listing */
export const SERVICE_LISTING_CATEGORIES = [
  "Priest Service",
  "Catering",
  "Hotel & Accommodation",
  "Travel & Transport",
  "Astrology",
  "Vastu",
  "Decoration",
  "Photography",
  "Music Services",
  "Other",
] as const;

/** @deprecated Use SERVICE_LISTING_CATEGORIES — kept for seed data compatibility */
export const SERVICE_CATEGORIES = [
  "Priest Services",
  "Priest Service",
  "Catering",
  "Hotel",
  "Hotel & Accommodation",
  "Travel",
  "Travel & Transport",
  "Astrology",
  "Vastu",
  "Decoration",
  "Photography",
  "Music",
  "Music Services",
  "Flower Vendor",
  "Other",
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

export const CAPACITY_LABELS = [
  "Slots",
  "Rooms",
  "Tables",
  "Seats",
  "Appointments",
  "Bookings",
  "Passes",
] as const;

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  at_customer: "At Customer Location",
  at_temple: "At Temple",
  online: "Online",
  hybrid: "Hybrid",
};
