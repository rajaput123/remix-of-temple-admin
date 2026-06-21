import { ProfileEmptyState } from "@/components/business-profile/ProfileEmptyState";
import { BusinessProfileView } from "@/components/business-profile/BusinessProfileView";
import { CreateProfileDrawer } from "@/components/business-profile/CreateProfileDrawer";
import { useProfileFormActions } from "@/components/business-profile/useProfileActions";

export default function BusinessProfile() {
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
  } = useProfileFormActions();

  if (!profile) {
    return (
      <>
        <ProfileEmptyState onCreate={openCreate} />
        <CreateProfileDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          initialData={initialData}
          title="Create Business Profile"
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      </>
    );
  }

  return (
    <>
      <BusinessProfileView
        profile={profile}
        onEdit={() => openEdit(profile)}
        onPublish={() => handlePublishProfile(profile)}
      />
      <CreateProfileDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialData={initialData}
        title="Edit Business Profile"
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
    </>
  );
}
