import { Edit3, Eye, Mail, MapPin, Phone, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { BusinessProfile } from "@/types/businessProfile";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { ProfileStatusBadge, VerificationStatusBadge } from "@/components/business-profile/ProfileBadges";
import { ProfileAvatar, ProfileCover } from "@/components/business-profile/ProfileMedia";
import { profileCardClass } from "@/components/business-profile/profileStyles";
import { businessTypeLabel, formatProfileLocation } from "@/components/business-profile/profileUtils";
import {
  computeProfileCompletion,
  getMissingRequiredFields,
} from "@/components/business-profile/singleProfileUtils";

interface SingleProfileHeroProps {
  profile: BusinessProfile;
  onEdit: () => void;
  onPreview: () => void;
  onPublish: () => void;
}

export function SingleProfileHero({ profile, onEdit, onPreview, onPublish }: SingleProfileHeroProps) {
  const completion = computeProfileCompletion(profile);
  const missing = getMissingRequiredFields(profile);
  const canPublish = missing.length === 0 && profile.status !== "published";

  return (
    <Card className={`overflow-hidden ${profileCardClass}`}>
      <ProfileCover src={profile.coverImage} height="sm">
        {profile.verificationStatus === "verified" && (
          <div className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">
            ✓ Verified
          </div>
        )}
      </ProfileCover>
      <CardContent className="relative p-6 sm:p-8">
        <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <ProfileAvatar src={profile.logo} alt={profile.businessName} size="sm" />
            <div className="pb-1 min-w-0">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{profile.businessName}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {businessTypeLabel(profile.businessType, BUSINESS_TYPES)}
                {profile.category ? ` · ${profile.category}` : ""}
                {profile.experience ? ` · ${profile.experience} yrs` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <ProfileStatusBadge status={profile.status} />
                <VerificationStatusBadge status={profile.verificationStatus} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={onEdit}>
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={onPreview}>
              <Eye className="h-3.5 w-3.5" /> Preview
            </Button>
            {profile.status !== "published" && (
              <Button size="sm" className="rounded-full gap-1.5" disabled={!canPublish} onClick={onPublish}>
                <Send className="h-3.5 w-3.5" /> Publish
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Profile completion</span>
            <span className="font-semibold tabular-nums">{completion}%</span>
          </div>
          <Progress value={completion} className="h-2 rounded-full" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: Phone, label: "Mobile", value: profile.mobile, sub: profile.whatsapp ? `WA: ${profile.whatsapp}` : undefined },
            { icon: Mail, label: "Email", value: profile.email, sub: profile.ownerName },
            { icon: MapPin, label: "Location", value: formatProfileLocation(profile), sub: profile.address },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="rounded-xl bg-muted/40 p-4 ring-1 ring-black/[0.04]">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-primary" /> {label}
              </div>
              <p className="mt-1.5 text-sm font-medium truncate">{value}</p>
              {sub && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{sub}</p>}
            </div>
          ))}
        </div>

        {profile.about && (
          <p className="mt-5 rounded-xl bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
            {profile.about}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
