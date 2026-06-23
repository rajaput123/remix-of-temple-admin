import { businessProfilesSeedData } from "@/data/businessProfileData";
import type { BusinessProfileFormData } from "@/types/businessProfile";
import { readRegistrationData } from "@/lib/registrationProfileBridge";

function formatRegMobile(mobile?: string): string {
  if (!mobile?.trim()) return "";
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits}`;
  return mobile;
}

/** Demo freelancer/SMB profile — merges registered mobile when available. */
export function getBusinessProfileSampleFormData(): BusinessProfileFormData {
  const seed = businessProfilesSeedData[0];
  const {
    id: _id,
    status: _s,
    verificationStatus: _v,
    createdAt: _c,
    updatedAt: _u,
    ...form
  } = seed;

  const regMobile = formatRegMobile(readRegistrationData()?.mobile);
  if (regMobile) {
    return { ...form, mobile: regMobile, whatsapp: regMobile };
  }
  return form;
}
