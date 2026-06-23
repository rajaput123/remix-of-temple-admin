import type { BusinessProfileFormData } from "@/types/businessProfile";
import { EMPTY_PROFILE_FORM } from "@/types/businessProfile";

/** Minimal account data from `/temple-register` (mobile only). Legacy keys kept for older saves. */
export interface RegistrationData {
  mobile?: string;
  mpin?: string;
  registeredAt?: string;
  businessName?: string;
  templeName?: string;
  businessType?: string;
  category?: string;
  about?: string;
  experience?: string;
  legalCompanyName?: string;
  companyRegNumber?: string;
  incorporationDate?: string;
  contactPerson?: string;
  contactDesignation?: string;
  email?: string;
  aadhaarNumber?: string;
  contactPan?: string;
  alternatePhone?: string;
  landline?: string;
  whatsapp?: string;
  fullAddress?: string;
  pincode?: string;
  mapLink?: string;
  entityType?: string;
  gstNumber?: string;
  gstPan?: string;
  hasGST?: string;
  city?: string;
  state?: string;
  country?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
}

const LEGACY_TYPE_MAP: Record<string, string> = {
  priest: "professional",
  astrologer: "wellness",
  caterer: "catering",
  decorator: "decoration",
  musician: "music",
};

export const LEGACY_BUSINESS_TYPE_IDS = Object.keys(LEGACY_TYPE_MAP);

function formatMobile(num?: string): string {
  if (!num?.trim()) return "";
  const digits = num.replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits}`;
  if (num.startsWith("+")) return num;
  return num;
}

export function readRegistrationData(): RegistrationData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("registrationData");
    if (!raw) return null;
    return JSON.parse(raw) as RegistrationData;
  } catch {
    return null;
  }
}

export function hasRegistrationData(): boolean {
  const reg = readRegistrationData();
  return !!reg?.mobile;
}

export function saveMinimalRegistration(mobile: string, mpin?: string): void {
  const clean = mobile.replace(/\D/g, "");
  localStorage.setItem(
    "registrationData",
    JSON.stringify({
      mobile: clean,
      mpin: mpin?.replace(/\D/g, "").slice(0, 4) || undefined,
      registeredAt: new Date().toISOString(),
    }),
  );
}

export function normalizeBusinessTypeId(typeId?: string): string {
  if (!typeId) return "";
  return LEGACY_TYPE_MAP[typeId] ?? typeId;
}

/** Map saved registration → business profile form (mobile + any legacy full-registration fields). */
export function registrationToProfileFormData(
  reg?: RegistrationData | null,
): Partial<BusinessProfileFormData> {
  if (!reg) return {};

  const businessName =
    reg.businessName || reg.legalCompanyName || reg.templeName || "";
  const pan = (reg.contactPan || reg.gstPan || "").toUpperCase();
  const gst =
    reg.hasGST === "yes" || reg.gstNumber
      ? (reg.gstNumber || "").toUpperCase()
      : "";

  return {
    entityType: (reg.entityType as BusinessProfileFormData["entityType"]) || "",
    businessName,
    businessType: normalizeBusinessTypeId(reg.businessType),
    category: reg.category || "",
    about: reg.about || "",
    experience: reg.experience || "",
    legalCompanyName: reg.legalCompanyName || "",
    companyRegNumber: reg.companyRegNumber || "",
    incorporationDate: reg.incorporationDate || "",
    ownerName: reg.contactPerson || "",
    contactDesignation: reg.contactDesignation || "",
    mobile: formatMobile(reg.mobile),
    whatsapp: formatMobile(reg.whatsapp),
    alternatePhone: formatMobile(reg.alternatePhone),
    landline: reg.landline || "",
    email: reg.email || "",
    address: reg.fullAddress || "",
    city: reg.city || "",
    state: reg.state || "",
    pincode: reg.pincode || "",
    mapLink: reg.mapLink || "",
    instagram: reg.instagram || "",
    youtube: reg.youtube || "",
    facebook: reg.facebook || "",
    aadhaar: reg.aadhaarNumber || "",
    pan,
    gst,
  };
}

export function mergeRegistrationIntoProfileForm(
  base: BusinessProfileFormData = EMPTY_PROFILE_FORM,
): BusinessProfileFormData {
  const patch = registrationToProfileFormData(readRegistrationData());
  const merged = { ...base };
  (Object.keys(patch) as (keyof BusinessProfileFormData)[]).forEach((key) => {
    const value = patch[key];
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    if (Array.isArray(value) && value.length === 0) return;
    merged[key] = value as never;
  });
  return merged;
}
