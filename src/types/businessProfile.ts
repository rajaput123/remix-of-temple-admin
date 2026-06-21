export type ProfileStatus = "draft" | "published" | "pending";

export type ProfileVerificationStatus =
  | "not_submitted"
  | "pending"
  | "verified"
  | "rejected"
  | "reupload_requested";

export interface BusinessProfile {
  id: string;
  businessName: string;
  businessType: string;
  category: string;
  about: string;
  experience: string;
  ownerName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  languages: string[];
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  logo: string | null;
  coverImage: string | null;
  gallery: string[];
  aadhaar: string;
  pan: string;
  gst: string;
  aadhaarDoc: string | null;
  panDoc: string | null;
  gstDoc: string | null;
  status: ProfileStatus;
  verificationStatus: ProfileVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export type BusinessProfileFormData = Omit<
  BusinessProfile,
  "id" | "status" | "verificationStatus" | "createdAt" | "updatedAt"
>;

export const EMPTY_PROFILE_FORM: BusinessProfileFormData = {
  businessName: "",
  businessType: "",
  category: "",
  about: "",
  experience: "",
  ownerName: "",
  mobile: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  languages: [],
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  openingTime: "06:00",
  closingTime: "20:00",
  logo: null,
  coverImage: null,
  gallery: [],
  aadhaar: "",
  pan: "",
  gst: "",
  aadhaarDoc: null,
  panDoc: null,
  gstDoc: null,
};

export const WORKING_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const PROFILE_LANGUAGES = [
  "Kannada",
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
] as const;
