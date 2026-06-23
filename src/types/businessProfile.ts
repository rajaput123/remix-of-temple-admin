export type ProfileStatus = "draft" | "published" | "pending";

export type ProfileVerificationStatus =
  | "not_submitted"
  | "pending"
  | "verified"
  | "rejected"
  | "reupload_requested";

export type BusinessEntityType = "individual" | "company" | "";

export interface BusinessProfile {
  id: string;
  entityType: BusinessEntityType;
  businessName: string;
  businessType: string;
  category: string;
  about: string;
  experience: string;
  legalCompanyName: string;
  companyRegNumber: string;
  incorporationDate: string;
  ownerName: string;
  contactDesignation: string;
  mobile: string;
  whatsapp: string;
  alternatePhone: string;
  landline: string;
  email: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  mapLink: string;
  languages: string[];
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  logo: string | null;
  coverImage: string | null;
  gallery: string[];
  instagram: string;
  youtube: string;
  facebook: string;
  aadhaar: string;
  pan: string;
  gst: string;
  aadhaarDoc: string | null;
  panDoc: string | null;
  gstDoc: string | null;
  incorporationDoc: string | null;
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
  entityType: "individual",
  businessName: "",
  businessType: "",
  category: "",
  about: "",
  experience: "",
  legalCompanyName: "",
  companyRegNumber: "",
  incorporationDate: "",
  ownerName: "",
  contactDesignation: "",
  mobile: "",
  whatsapp: "",
  alternatePhone: "",
  landline: "",
  email: "",
  address: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  mapLink: "",
  languages: [],
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  openingTime: "06:00",
  closingTime: "20:00",
  logo: null,
  coverImage: null,
  gallery: [],
  instagram: "",
  youtube: "",
  facebook: "",
  aadhaar: "",
  pan: "",
  gst: "",
  aadhaarDoc: null,
  panDoc: null,
  gstDoc: null,
  incorporationDoc: null,
};

export const WORKING_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const PROFILE_LANGUAGES = [
  "Kannada",
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
] as const;
