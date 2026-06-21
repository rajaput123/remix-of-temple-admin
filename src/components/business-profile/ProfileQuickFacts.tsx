import { Clock, Globe, Languages, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BusinessProfile } from "@/types/businessProfile";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { businessTypeLabel } from "@/components/business-profile/profileUtils";
import { ProfileGallery } from "@/components/business-profile/ProfileMedia";
import { profileCardClass } from "@/components/business-profile/profileStyles";

interface ProfileQuickFactsProps {
  profile: BusinessProfile;
}

export function ProfileQuickFacts({ profile }: ProfileQuickFactsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className={profileCardClass}>
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-primary" /> Business Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {profile.workingDays.map((d) => (
              <Badge key={d} variant="secondary" className="rounded-full text-xs">
                {d}
              </Badge>
            ))}
          </div>
          <p className="text-sm font-medium tabular-nums">
            {profile.openingTime} – {profile.closingTime}
          </p>
        </CardContent>
      </Card>

      <Card className={profileCardClass}>
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Languages className="h-4 w-4 text-primary" /> Languages
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex flex-wrap gap-1.5">
            {profile.languages.map((l) => (
              <Badge key={l} variant="outline" className="rounded-full">
                {l}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className={profileCardClass}>
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Service Info
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Type · </span>
            {businessTypeLabel(profile.businessType, BUSINESS_TYPES)}
          </p>
          <p>
            <span className="text-muted-foreground">Category · </span>
            {profile.category}
          </p>
          <p>
            <span className="text-muted-foreground">Experience · </span>
            {profile.experience} years
          </p>
          <p className="flex items-center gap-1.5 pt-1 text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Serving {profile.city} & nearby
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface ProfileGallerySectionProps {
  profile: BusinessProfile;
  title?: string;
}

export function ProfileGallerySection({ profile, title = "Gallery" }: ProfileGallerySectionProps) {
  if (profile.gallery.length === 0) return null;

  return (
    <Card className={profileCardClass}>
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <ProfileGallery images={profile.gallery} />
      </CardContent>
    </Card>
  );
}
