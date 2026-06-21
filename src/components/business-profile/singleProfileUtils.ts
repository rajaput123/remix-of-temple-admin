import type { BusinessProfile, BusinessProfileFormData } from "@/types/businessProfile";

const REQUIRED_FIELDS: (keyof BusinessProfileFormData)[] = [
  "businessName",
  "businessType",
  "category",
  "ownerName",
  "mobile",
  "email",
  "address",
  "city",
  "about",
];

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
  const labels: Record<string, string> = {
    businessName: "Business Name",
    businessType: "Business Type",
    category: "Category",
    ownerName: "Owner Name",
    mobile: "Mobile Number",
    email: "Email",
    address: "Address",
    city: "City",
    about: "About Business",
  };
  return REQUIRED_FIELDS.filter((key) => {
    const v = profile[key];
    return Array.isArray(v) ? v.length === 0 : !v;
  }).map((k) => labels[k] ?? k);
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
