export type ProfileStatus = "draft" | "pending" | "published" | "rejected";
export type VerificationStatus =
  | "pending"
  | "review"
  | "verified"
  | "rejected"
  | "skipped";
export type PlanId = "trial" | "basic" | "pro" | "premium";
export type ServiceReach = "local" | "district" | "statewide" | "nationwide";

export interface BCAccount {
  mobile?: string;
  email?: string;
  verified: boolean;
}

export interface BCBusinessType {
  category: string;
  subcategory?: string;
}

export interface BCInfo {
  name: string;
  legalName?: string;
  description?: string;
  ownerName: string;
  phone: string;
  whatsapp?: string;
  email: string;
  experience?: string;
  website?: string;
  gst?: string;
}

export interface BCLocation {
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  lat?: string;
  lng?: string;
  reach: ServiceReach;
}

export interface BCComms {
  languages: string[];
  channels: string[];
}

export interface BCDoc {
  type: string;
  name: string;
  dataUrl: string;
}

export interface BCVerification {
  aadhaar?: string;
  pan?: string;
  docs: BCDoc[];
  status: VerificationStatus;
}

export interface BCMedia {
  logo?: string;
  cover?: string;
  gallery: string[];
  videos: string[];
}

export interface BCSubscription {
  plan: PlanId;
}

export interface BCState {
  account: BCAccount;
  businessType?: BCBusinessType;
  info?: BCInfo;
  location?: BCLocation;
  comms?: BCComms;
  verification?: BCVerification;
  media?: BCMedia;
  subscription?: BCSubscription;
  profileStatus: ProfileStatus;
  completedSteps: string[];
}
