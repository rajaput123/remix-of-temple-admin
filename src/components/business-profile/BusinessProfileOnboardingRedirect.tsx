import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useBusinessProfile } from "@/stores/businessProfileStore";
import { needsBusinessProfileOnboarding } from "@/lib/businessProfileOnboarding";
import {
  getBusinessOnboardingStep,
  isPathAllowedForBusinessAccess,
  needsBusinessPlanForModules,
} from "@/lib/businessOnboardingFlow";

/** Keeps business users on allowed routes until profile + plan requirements are met. */
export function BusinessProfileOnboardingRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useBusinessProfile();
  const toastShown = useRef<string | null>(null);

  useEffect(() => {
    if (isPathAllowedForBusinessAccess(location.pathname, profile)) {
      toastShown.current = null;
      return;
    }

    if (needsBusinessProfileOnboarding(profile)) {
      if (toastShown.current !== "profile") {
        toastShown.current = "profile";
        toast.info("Complete your business profile first", {
          description: "You can return to the hub anytime — other modules unlock after profile setup.",
          duration: 5000,
        });
      }
      navigate("/business/profile?setup=1", { replace: true });
      return;
    }

    if (needsBusinessPlanForModules(profile)) {
      if (toastShown.current !== "plan") {
        toastShown.current = "plan";
        toast.info("Choose a plan to unlock this module", {
          description: "Settings, Finance, and Plans are open — buy a plan to unlock the rest.",
          duration: 5000,
        });
      }
      navigate("/temple-hub", { replace: true });
      return;
    }

    if (getBusinessOnboardingStep(profile) === "finance") {
      if (toastShown.current !== "finance") {
        toastShown.current = "finance";
        toast.info("Complete finance setup", {
          description: "Add payout details in Finance settings to unlock all modules.",
          duration: 5000,
        });
      }
      navigate("/temple-hub", { replace: true });
    }
  }, [location.pathname, profile, navigate]);

  return null;
}
