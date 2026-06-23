import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  businessProfileStore,
  formDataFromEmpty,
  profileToFormData,
  useBusinessProfile,
} from "@/stores/businessProfileStore";
import type { BusinessProfile, BusinessProfileFormData } from "@/types/businessProfile";
import {
  clearBusinessProfileSetupRequired,
  isBusinessProfileComplete,
} from "@/lib/businessProfileOnboarding";
import { prepareBusinessPostProfileOnboarding } from "@/lib/businessOnboardingFlow";
import { getBusinessProfileSampleFormData } from "@/lib/businessProfileSample";
import { getMissingRequiredFields } from "@/components/business-profile/singleProfileUtils";

export function useProfileFormActions() {
  const profile = useBusinessProfile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [initialData, setInitialData] = useState<BusinessProfileFormData | undefined>();

  const openCreate = useCallback(() => {
    if (profile) {
      toast.info("You already have a business profile. Edit your existing profile instead.");
      return;
    }
    setInitialData(formDataFromEmpty());
    setDrawerOpen(true);
  }, [profile]);

  const openEdit = useCallback((p: BusinessProfile) => {
    setInitialData(profileToFormData(p));
    setDrawerOpen(true);
  }, []);

  const applyProfileSave = useCallback((saved: BusinessProfile | null) => {
    if (saved && isBusinessProfileComplete(saved)) {
      clearBusinessProfileSetupRequired();
      prepareBusinessPostProfileOnboarding(saved);
      toast.success("Business profile complete", {
        description: "Next: choose your plan on the hub to unlock full features.",
        duration: 7000,
      });
    } else if (saved) {
      const missing = getMissingRequiredFields(saved);
      if (missing.length > 0) {
        toast.info(`${missing.length} required field${missing.length > 1 ? "s" : ""} still needed`);
      }
    }
  }, []);

  const handleSaveDraft = useCallback(
    (data: BusinessProfileFormData) => {
      if (profile) {
        businessProfileStore.saveDraft(profile.id, data);
        toast.success("Profile saved");
      } else {
        businessProfileStore.create(data, false);
        toast.success("Profile created");
      }
      const saved = businessProfileStore.getProfile();
      applyProfileSave(saved);
      setDrawerOpen(false);
    },
    [profile, applyProfileSave],
  );

  const handlePublish = useCallback(
    (data: BusinessProfileFormData) => {
      if (profile) {
        businessProfileStore.update(profile.id, data);
        businessProfileStore.publish(profile.id);
      } else {
        const created = businessProfileStore.create(data, true);
        businessProfileStore.publish(created.id);
      }
      const saved = businessProfileStore.getProfile();
      if (saved && isBusinessProfileComplete(saved)) {
        clearBusinessProfileSetupRequired();
        prepareBusinessPostProfileOnboarding(saved);
      }
      toast.success("Profile published");
      setDrawerOpen(false);
    },
    [profile],
  );

  const handlePublishProfile = useCallback((p: BusinessProfile) => {
    businessProfileStore.publish(p.id);
    toast.success("Profile published");
  }, []);

  const loadSampleIntoForm = useCallback(() => {
    setInitialData(getBusinessProfileSampleFormData());
    setDrawerOpen(true);
    toast.info("Sample data loaded — review and save when ready");
  }, []);

  const loadSampleAndSave = useCallback(() => {
    const sample = getBusinessProfileSampleFormData();
    if (profile) {
      businessProfileStore.saveDraft(profile.id, sample);
    } else {
      businessProfileStore.create(sample, false);
    }
    const saved = businessProfileStore.getProfile();
    applyProfileSave(saved);
    setDrawerOpen(false);
  }, [profile, applyProfileSave]);

  return {
    profile,
    drawerOpen,
    setDrawerOpen,
    initialData,
    openCreate,
    openEdit,
    handleSaveDraft,
    handlePublish,
    handlePublishProfile,
    loadSampleIntoForm,
    loadSampleAndSave,
  };
}

export function useVerificationActions() {
  const approve = useCallback((p: BusinessProfile) => {
    businessProfileStore.approve(p.id);
    toast.success("Profile verified");
  }, []);

  const reject = useCallback((p: BusinessProfile) => {
    businessProfileStore.reject(p.id);
    toast.success("Verification rejected");
  }, []);

  const requestReupload = useCallback((p: BusinessProfile) => {
    businessProfileStore.requestReupload(p.id);
    toast.success("Reupload requested");
  }, []);

  return { approve, reject, requestReupload };
}
