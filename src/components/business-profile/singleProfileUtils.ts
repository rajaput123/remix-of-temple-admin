import type { BusinessProfile, BusinessProfileFormData } from "@/types/businessProfile";

const FIELD_LABELS: Record<string, string> = {
  entityType: "Profile type (Individual or Company)",
  businessName: "Trading / brand name",
  legalCompanyName: "Registered company name",
  companyRegNumber: "Company registration number",
  businessType: "Business type",
  category: "Category",
  ownerName: "Your name",
  contactPerson: "Authorized contact",
  mobile: "Mobile number",
  whatsapp: "WhatsApp number",
  email: "Email",
  pincode: "Business pincode",
  address: "Business street address",
  city: "City",
  state: "State",
  about: "About",
};

function isEmpty(v: unknown): boolean {
  if (Array.isArray(v)) return v.length === 0;
  return v === null || v === undefined || String(v).trim() === "";
}

function requiredKeysFor(profile: BusinessProfile | BusinessProfileFormData): (keyof BusinessProfileFormData)[] {
  const base: (keyof BusinessProfileFormData)[] = [
    "entityType",
    "businessType",
    "category",
    "mobile",
    "whatsapp",
    "pincode",
    "address",
    "city",
    "state",
    "about",
  ];

  if (profile.entityType === "individual") {
    return [...base, "ownerName"];
  }

  if (profile.entityType === "company") {
    return [...base, "legalCompanyName", "companyRegNumber", "ownerName"];
  }

  return ["entityType"];
}

export function computeProfileCompletion(profile: BusinessProfile): number {
  const keys = Object.keys(profile) as (keyof BusinessProfile)[];
  const formKeys = keys.filter(
    (k) => !["id", "status", "verificationStatus", "createdAt", "updatedAt"].includes(k),
  );
  let filled = 0;
  formKeys.forEach((k) => {
    const v = profile[k];
    if (Array.isArray(v)) {
      if (v.length > 0) filled += 1;
    } else if (v !== null && v !== undefined && String(v).trim() !== "") {
      filled += 1;
    }
  });
  return Math.round((filled / formKeys.length) * 100);
}

export function getMissingRequiredFields(profile: BusinessProfile): string[] {
  return requiredKeysFor(profile)
    .filter((key) => isEmpty(profile[key]))
    .map((k) => FIELD_LABELS[k] ?? k);
}

export function isVerificationPending(profile: BusinessProfile) {
  return (
    profile.verificationStatus === "pending" ||
    profile.verificationStatus === "reupload_requested"
  );
}

export function isVerificationComplete(profile: BusinessProfile) {
  return profile.verificationStatus === "verified";
}
