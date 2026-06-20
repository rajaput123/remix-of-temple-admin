import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StepShell } from "@/components/business-connect/StepShell";
import { FileDropzone } from "@/components/business-connect/FileDropzone";
import { bcStore, useBCStore } from "@/stores/businessConnectStore";

export default function StepGallery() {
  const navigate = useNavigate();
  const stored = useBCStore((s) => s.media);
  const [logo, setLogo] = useState<string[]>(stored?.logo ? [stored.logo] : []);
  const [cover, setCover] = useState<string[]>(stored?.cover ? [stored.cover] : []);
  const [gallery, setGallery] = useState<string[]>(stored?.gallery ?? []);
  const [videos, setVideos] = useState<string[]>(stored?.videos ?? []);

  function next() {
    bcStore.set({
      media: {
        logo: logo[0],
        cover: cover[0],
        gallery,
        videos,
      },
    });
    bcStore.markStep("gallery");
    navigate("/business-connect/onboarding/subscription");
  }

  return (
    <StepShell
      title="Business profile media"
      subtitle="Add visuals that bring your profile to life. Everything except logo is optional."
      backTo="/business-connect/onboarding/verification"
      onNext={next}
    >
      <div className="space-y-6">
        <FileDropzone
          label="Business logo"
          hint="Recommended"
          accept="image/*"
          values={logo}
          onChange={setLogo}
          max={1}
        />
        <FileDropzone
          label="Cover image"
          hint="Wide banner shown on your profile"
          accept="image/*"
          values={cover}
          onChange={setCover}
          max={1}
        />
        <FileDropzone
          label="Gallery photos"
          hint="Up to 12"
          accept="image/*"
          multiple
          values={gallery}
          onChange={setGallery}
          max={12}
        />
        <FileDropzone
          label="Promotional videos"
          hint="Up to 4"
          accept="video/*"
          multiple
          values={videos}
          onChange={setVideos}
          max={4}
        />
      </div>
    </StepShell>
  );
}
