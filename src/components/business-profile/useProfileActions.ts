import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  businessProfileStore,
  profileToFormData,
  useBusinessProfile,
} from "@/stores/businessProfileStore";
import type { BusinessProfile, BusinessProfileFormData } from "@/types/businessProfile";

export function useProfileFormActions() {
  const profile = useBusinessProfile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [initialData, setInitialData] = useState<BusinessProfileFormData | undefined>();

  const openCreate = useCallback(() => {
    if (profile) {
      toast.info("You already have a business profile. Edit your existing profile instead.");
      return;
    }
    setInitialData(undefined);
    setDrawerOpen(true);
  }, [profile]);

  const openEdit = useCallback((p: BusinessProfile) => {
    setInitialData(profileToFormData(p));
    setDrawerOpen(true);
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
      setDrawerOpen(false);
    },
    [profile],
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
      toast.success("Profile published");
      setDrawerOpen(false);
    },
    [profile],
  );

  const handlePublishProfile = useCallback((p: BusinessProfile) => {
    businessProfileStore.publish(p.id);
    toast.success("Profile published");
  }, []);

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
