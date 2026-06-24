import type { BusinessProfile } from "@/types/businessProfile";
import {
  dismissFinanceSetupPrompt,
  dismissSubscriptionPrompt,
  FINANCE_SETUP_PROMPT_DISMISSED,
  preparePostLoginOnboarding,
  SUBSCRIPTION_PROMPT_DISMISSED,
} from "@/lib/onboardingFlow";
import { isFinanceSetupComplete, isSubscriptionComplete } from "@/lib/templeConfig";
import {
  isBusinessProfileComplete,
  isPathAllowedDuringProfileSetup,
  needsBusinessProfileOnboarding,
  queueBusinessProfileHubToast,
} from "@/lib/businessProfileOnboarding";
import { hasRegistrationData } from "@/lib/registrationProfileBridge";

export type BusinessOnboardingStep = "profile" | "subscription" | "finance" | "done";

const PROFILE_DIALOG_DISMISSED = "businessProfileDialogDismissed";
const SUBSCRIPTION_HUB_TOAST_KEY = "businessSubscriptionHubToast";
const FINANCE_HUB_TOAST_KEY = "businessFinanceHubToast";
const SUBSCRIPTION_DIALOG_SNOOZED = "businessSubscriptionDialogSnoozed";
const FINANCE_DIALOG_SNOOZED = "businessFinanceDialogSnoozed";

/** Unlocked on hub after profile is complete, even before a plan is purchased. */
export const BUSINESS_MODULES_UNLOCKED_BEFORE_PLAN = new Set([
  "business-profile",
  "settings",
  "finance",
  "service-listings",
  "bookings",
  "crm",
  "communication",
]);

export function isBusinessUser(): boolean {
  return hasRegistrationData();
}

/** Current step in the business SMB / freelancer onboarding sequence. */
export function getBusinessOnboardingStep(profile: BusinessProfile | null): BusinessOnboardingStep {
  if (!isBusinessUser()) return "done";
  if (!isBusinessProfileComplete(profile)) return "profile";
  if (!isSubscriptionComplete()) return "subscription";
  if (!isFinanceSetupComplete()) return "finance";
  return "done";
}

export function shouldShowBusinessSubscriptionDialog(profile: BusinessProfile | null): boolean {
  if (getBusinessOnboardingStep(profile) !== "subscription") return false;
  return sessionStorage.getItem(SUBSCRIPTION_DIALOG_SNOOZED) !== "1";
}

export function shouldShowBusinessFinanceDialog(profile: BusinessProfile | null): boolean {
  if (getBusinessOnboardingStep(profile) !== "finance") return false;
  return sessionStorage.getItem(FINANCE_DIALOG_SNOOZED) !== "1";
}

export function snoozeBusinessSubscriptionDialog(): void {
  sessionStorage.setItem(SUBSCRIPTION_DIALOG_SNOOZED, "1");
}

export function snoozeBusinessFinanceDialog(): void {
  sessionStorage.setItem(FINANCE_DIALOG_SNOOZED, "1");
}

export function clearBusinessOnboardingDialogSnoozes(): void {
  sessionStorage.removeItem(SUBSCRIPTION_DIALOG_SNOOZED);
  sessionStorage.removeItem(FINANCE_DIALOG_SNOOZED);
}

/** Profile done but no plan purchased — most hub modules stay locked. */
export function needsBusinessPlanForModules(profile: BusinessProfile | null): boolean {
  return isBusinessUser() && isBusinessProfileComplete(profile) && !isSubscriptionComplete();
}

export function isBusinessHubModuleEnabled(moduleId: string, profile: BusinessProfile | null): boolean {
  if (!isBusinessUser()) return true;
  if (!isBusinessProfileComplete(profile)) return moduleId === "business-profile";
  if (!isSubscriptionComplete()) return BUSINESS_MODULES_UNLOCKED_BEFORE_PLAN.has(moduleId);
  return true;
}

const BUSINESS_CONNECT_OPERATIONAL_PREFIXES = [
  "/business-connect/services",
  "/business-connect/bookings",
  "/business-connect/crm",
  "/business-connect/communication",
];

function isBusinessConnectOperationalPath(pathname: string): boolean {
  return BUSINESS_CONNECT_OPERATIONAL_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isPathAllowedForBusinessAccess(pathname: string, profile: BusinessProfile | null): boolean {
  if (!isBusinessUser()) return true;
  if (needsBusinessProfileOnboarding(profile)) {
    return isPathAllowedDuringProfileSetup(pathname);
  }
  // Core SMB modules (services, bookings, CRM) after profile is complete
  if (isBusinessProfileComplete(profile) && isBusinessConnectOperationalPath(pathname)) {
    return true;
  }
  if (needsBusinessPlanForModules(profile)) {
    if (pathname === "/" || pathname === "/login") return true;
    const allowed = [
      "/temple-hub",
      "/business/profile",
      "/temple-register",
      "/forgot-mpin",
      "/temple/settings",
      "/temple/finance",
      "/business-connect/explore",
    ];
    return allowed.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  }
  if (getBusinessOnboardingStep(profile) === "finance") {
    if (pathname === "/" || pathname === "/login") return true;
    if (isBusinessConnectOperationalPath(pathname)) return true;
    const allowed = [
      "/temple-hub",
      "/business/profile",
      "/temple/settings",
      "/temple/finance",
    ];
    return allowed.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  }
  return true;
}

export function shouldShowBusinessProfileDialog(profile: BusinessProfile | null): boolean {
  if (getBusinessOnboardingStep(profile) !== "profile") return false;
  return localStorage.getItem(PROFILE_DIALOG_DISMISSED) !== "1";
}

export function dismissBusinessProfileDialog(): void {
  localStorage.setItem(PROFILE_DIALOG_DISMISSED, "1");
}

/** After registration — reset plan/finance flags; profile is step 1. */
export function prepareBusinessRegistrationOnboarding(): void {
  preparePostLoginOnboarding();
  localStorage.removeItem(PROFILE_DIALOG_DISMISSED);
  localStorage.removeItem(SUBSCRIPTION_HUB_TOAST_KEY);
  localStorage.removeItem(FINANCE_HUB_TOAST_KEY);
  clearBusinessOnboardingDialogSnoozes();
}

/** After login — profile reminder on hub. */
export function prepareBusinessPostLoginOnboarding(profile: BusinessProfile | null): void {
  if (needsBusinessProfileOnboarding(profile)) {
    queueBusinessProfileHubToast();
    localStorage.removeItem(PROFILE_DIALOG_DISMISSED);
  }
}

/** After profile is saved — unlock subscription / planning step only when complete. */
export function prepareBusinessPostProfileOnboarding(profile: BusinessProfile | null): void {
  if (!isBusinessProfileComplete(profile)) return;
  localStorage.removeItem(SUBSCRIPTION_PROMPT_DISMISSED);
  localStorage.setItem(PROFILE_DIALOG_DISMISSED, "1");
  clearBusinessOnboardingDialogSnoozes();
  queueBusinessSubscriptionHubToast();
}

/** After plan purchase — move to finance setup step. */
export function prepareBusinessPostSubscriptionOnboarding(): void {
  clearBusinessOnboardingDialogSnoozes();
  localStorage.removeItem(FINANCE_SETUP_PROMPT_DISMISSED);
  queueBusinessFinanceHubToast();
}

export function queueBusinessSubscriptionHubToast(): void {
  sessionStorage.setItem(SUBSCRIPTION_HUB_TOAST_KEY, "1");
}

export function consumeBusinessSubscriptionHubToast(): boolean {
  if (sessionStorage.getItem(SUBSCRIPTION_HUB_TOAST_KEY) !== "1") return false;
  sessionStorage.removeItem(SUBSCRIPTION_HUB_TOAST_KEY);
  return true;
}

export function queueBusinessFinanceHubToast(): void {
  sessionStorage.setItem(FINANCE_HUB_TOAST_KEY, "1");
}

export function consumeBusinessFinanceHubToast(): boolean {
  if (sessionStorage.getItem(FINANCE_HUB_TOAST_KEY) !== "1") return false;
  sessionStorage.removeItem(FINANCE_HUB_TOAST_KEY);
  return true;
}

export function handleBusinessSubscriptionSnooze(): void {
  snoozeBusinessSubscriptionDialog();
}

export function handleBusinessFinanceSnooze(): void {
  snoozeBusinessFinanceDialog();
}

/** Temple admin flow — keep legacy dismiss. */
export function handleBusinessSubscriptionDismiss(): void {
  dismissSubscriptionPrompt();
}

export function handleBusinessFinanceDismiss(): void {
  dismissFinanceSetupPrompt();
}
