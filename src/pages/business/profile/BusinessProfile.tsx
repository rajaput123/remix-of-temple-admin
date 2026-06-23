import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ProfileEmptyState } from "@/components/business-profile/ProfileEmptyState";
import { BusinessProfileView } from "@/components/business-profile/BusinessProfileView";
import { CreateProfileDrawer } from "@/components/business-profile/CreateProfileDrawer";
import { useProfileFormActions } from "@/components/business-profile/useProfileActions";
import {
  isBusinessProfileComplete,
  needsBusinessProfileOnboarding,
} from "@/lib/businessProfileOnboarding";
import { getMissingRequiredFields } from "@/components/business-profile/singleProfileUtils";
import { profileCardClass, profileTypography as t } from "@/components/business-profile/profileStyles";
import { cn } from "@/lib/utils";

export default function BusinessProfile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
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
  } = useProfileFormActions();

  const mandatorySetup = needsBusinessProfileOnboarding(profile);
  const missingCount = profile ? getMissingRequiredFields(profile).length : 0;

  const goBackToHub = () => {
    setDrawerOpen(false);
    navigate("/temple-hub");
    toast.info("Profile setup paused", {
      description: "Return anytime from Business Profile on the hub to finish.",
      duration: 5000,
    });
  };

  const handleLoadSampleAndSave = () => {
    loadSampleAndSave();
    navigate("/temple-hub");
  };

  useEffect(() => {
    const isSetup = searchParams.get("setup") === "1";
    if (!isSetup && !mandatorySetup) return;
    if (profile && isBusinessProfileComplete(profile)) return;

    if (!profile) {
      openCreate();
    } else if (isSetup) {
      openEdit(profile);
    }

    if (isSetup) {
      toast.info("Set up your business profile", {
        description: "Required before plans and other modules. Cancel anytime to return to the hub.",
        duration: 6000,
      });
      const next = new URLSearchParams(searchParams);
      next.delete("setup");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, profile, mandatorySetup, openCreate, openEdit, setSearchParams]);

  const drawerProps = {
    open: drawerOpen,
    onOpenChange: setDrawerOpen,
    initialData,
    onSaveDraft: handleSaveDraft,
    onPublish: handlePublish,
    onLoadSample: loadSampleIntoForm,
    ...(mandatorySetup
      ? {
          onCancel: goBackToHub,
          cancelLabel: "Back to hub",
        }
      : {}),
  };

  const mandatoryBanner = mandatorySetup && !isBusinessProfileComplete(profile) && (
    <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
          profileCardClass,
          "border border-warning/30 bg-warning/5 p-4",
        )}
      >
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
          </div>
          <div>
            <p className={cn(t.section, "text-warning")}>Business profile required</p>
            <p className={cn("mt-0.5", t.desc)}>
              {profile
                ? `${missingCount} required field${missingCount > 1 ? "s" : ""} remaining — finish your profile to continue.`
                : "Create your business profile to continue. Your login mobile is pre-filled."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!profile) {
    return (
      <>
        {mandatoryBanner}
        <ProfileEmptyState
          onCreate={openCreate}
          onLoadSample={mandatorySetup ? handleLoadSampleAndSave : undefined}
          mandatory={mandatorySetup}
        />
        <CreateProfileDrawer {...drawerProps} title="Set up Business Profile" />
      </>
    );
  }

  return (
    <>
      {mandatoryBanner}
      <BusinessProfileView
        profile={profile}
        onEdit={() => openEdit(profile)}
        onPublish={() => handlePublishProfile(profile)}
        lockNavigation={false}
      />
      <CreateProfileDrawer {...drawerProps} title="Edit Business Profile" />
    </>
  );
}
