import { Globe, Languages, MapPin, Mail, Phone, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BusinessProfile } from "@/types/businessProfile";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { businessTypeLabel, profileDisplayName, profileEntityLabel } from "@/components/business-profile/profileUtils";
import { VerificationStatusBadge } from "@/components/business-profile/ProfileBadges";
import { ProfileAvatar, ProfileCover, ProfileGallery } from "@/components/business-profile/ProfileMedia";
import { profileCardClass } from "@/components/business-profile/profileStyles";

interface PublicProfilePreviewProps {
  profile: BusinessProfile;
  onEdit?: () => void;
  onPublish?: () => void;
  showActions?: boolean;
}

export function PublicProfilePreview({ profile }: PublicProfilePreviewProps) {
  const displayName = profileDisplayName(profile);
  const entityLabel = profileEntityLabel(profile.entityType);

  return (
    <Card className={`overflow-hidden ${profileCardClass}`}>
      <ProfileCover src={profile.coverImage} height="lg">
        {profile.verificationStatus === "verified" && (
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-lg backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified Business
          </div>
        )}
      </ProfileCover>

      <CardContent className="relative px-6 pb-8 pt-0 sm:px-8">
        <div className="-mt-12 flex flex-wrap items-end gap-4">
          <ProfileAvatar
            src={profile.logo}
            alt={displayName}
            fallbackName={profile.ownerName || displayName}
            size="md"
          />
          <div className="pb-2 min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{entityLabel}</p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{displayName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {businessTypeLabel(profile.businessType, BUSINESS_TYPES)} · {profile.category}
              {profile.experience ? ` · ${profile.experience}+ years` : ""}
            </p>
            <div className="mt-2">
              <VerificationStatusBadge status={profile.verificationStatus} />
            </div>
          </div>
        </div>

        {profile.about && (
          <section className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
            <p className="mt-2 text-sm leading-relaxed">{profile.about}</p>
          </section>
        )}

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted/40 p-5 ring-1 ring-black/[0.04]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</h3>
            <div className="mt-3 space-y-2.5 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <Phone className="h-4 w-4 text-primary" /> {profile.mobile}
              </p>
              {profile.whatsapp && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> WhatsApp: {profile.whatsapp}
                </p>
              )}
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> {profile.email.trim() || "Not provided"}
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-muted/40 p-5 ring-1 ring-black/[0.04]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</h3>
            <p className="mt-3 flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                {profile.address}
                <br />
                {[profile.city, profile.district, profile.state, profile.pincode].filter(Boolean).join(", ")}
              </span>
            </p>
          </div>
        </section>

        {profile.gallery.length > 0 && (
          <section className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gallery</h3>
            <div className="mt-3">
              <ProfileGallery images={profile.gallery} />
            </div>
          </section>
        )}

        {profile.languages.length > 0 && (
          <section className="mt-8 rounded-2xl bg-muted/40 p-5 ring-1 ring-black/[0.04]">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Globe className="h-4 w-4" /> Languages
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.languages.map((l) => (
                <Badge key={l} variant="outline" className="rounded-full">
                  {l}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
