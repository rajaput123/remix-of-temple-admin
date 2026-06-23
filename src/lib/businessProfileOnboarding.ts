import type { BusinessProfile } from "@/types/businessProfile";
import { getMissingRequiredFields } from "@/components/business-profile/singleProfileUtils";
import { hasRegistrationData } from "@/lib/registrationProfileBridge";

export const BUSINESS_PROFILE_SETUP_KEY = "businessProfileSetupRequired";
const HUB_PROFILE_TOAST_KEY = "businessProfileHubToast";

export function queueBusinessProfileHubToast(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(HUB_PROFILE_TOAST_KEY, "1");
}

export function consumeBusinessProfileHubToast(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(HUB_PROFILE_TOAST_KEY) !== "1") return false;
  sessionStorage.removeItem(HUB_PROFILE_TOAST_KEY);
  return true;
}

const ALLOWED_PREFIXES = [
  "/login",
  "/temple-register",
  "/temple-hub",
  "/business/profile",
  "/forgot-mpin",
  "/business-connect/explore",
];

export function markBusinessProfileSetupRequired(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BUSINESS_PROFILE_SETUP_KEY, "1");
}

export function clearBusinessProfileSetupRequired(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BUSINESS_PROFILE_SETUP_KEY);
}

export function isBusinessProfileSetupRequired(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(BUSINESS_PROFILE_SETUP_KEY) === "1";
}

export function isBusinessProfileComplete(profile: BusinessProfile | null): boolean {
  if (!profile) return false;
  return getMissingRequiredFields(profile).length === 0;
}

/** Registered business user who still needs to finish their profile. */
export function needsBusinessProfileOnboarding(profile: BusinessProfile | null): boolean {
  if (!hasRegistrationData()) return false;
  if (isBusinessProfileComplete(profile)) {
    clearBusinessProfileSetupRequired();
    return false;
  }
  return true;
}

export function isPathAllowedDuringProfileSetup(pathname: string): boolean {
  if (pathname === "/" || pathname === "/login") return true;
  return ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Business users land on the hub first; profile setup is prompted from there. */
export function getBusinessPostLoginRoute(_profile: BusinessProfile | null): "/temple-hub" {
  return "/temple-hub";
}
