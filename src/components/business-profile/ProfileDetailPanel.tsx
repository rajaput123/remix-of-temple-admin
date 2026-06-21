import { Clock, Eye, Mail, MapPin, Pencil, Phone, Send, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BusinessProfile } from "@/types/businessProfile";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { businessTypeLabel, formatUpdatedAt } from "@/components/business-profile/profileUtils";
import { ProfileStatusBadge, VerificationStatusBadge } from "@/components/business-profile/ProfileBadges";
import { ProfileAvatar, ProfileCover, ProfileGallery } from "@/components/business-profile/ProfileMedia";
import { profileCardClass, profileTypography as t } from "@/components/business-profile/profileStyles";
import { cn } from "@/lib/utils";

interface ProfileDetailPanelProps {
  profile: BusinessProfile;
  onEdit: () => void;
  onPreview: () => void;
  onPublish: () => void;
}

export function ProfileDetailPanel({ profile, onEdit, onPreview, onPublish }: ProfileDetailPanelProps) {
  return (
    <div className="space-y-5">
      <Card className={`overflow-hidden ${profileCardClass}`}>
        <ProfileCover src={profile.coverImage} height="md" />
        <CardContent className="relative p-6 sm:p-8">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <ProfileAvatar src={profile.logo} alt={profile.businessName} size="md" />
              <div className="min-w-0 pb-1">
                <p className={t.eyebrow}>Business Connect · Profile</p>
                <h2 className={t.title}>{profile.businessName}</h2>
                <p className={t.muted}>
                  {businessTypeLabel(profile.businessType, BUSINESS_TYPES)} · {profile.category}
                  {profile.experience ? ` · ${profile.experience} yrs` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ProfileStatusBadge status={profile.status} />
                  <VerificationStatusBadge status={profile.verificationStatus} />
                  <Badge variant="outline" className="rounded-full text-xs">
                    Updated {formatUpdatedAt(profile.updatedAt)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={onPreview}>
                <Eye className="h-3.5 w-3.5" /> Preview
              </Button>
              {profile.status !== "published" && (
                <Button size="sm" className="rounded-full gap-1.5" onClick={onPublish}>
                  <Send className="h-3.5 w-3.5" /> Publish
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className={profileCardClass}>
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className={t.section}>About</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className={cn(t.body, "text-muted-foreground whitespace-pre-wrap")}>
              {profile.about || "No description provided."}
            </p>
          </CardContent>
        </Card>

        <Card className={profileCardClass}>
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> {profile.mobile}
            </p>
            {profile.whatsapp && (
              <p className="text-muted-foreground pl-6">WhatsApp: {profile.whatsapp}</p>
            )}
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> {profile.email}
            </p>
            <p className="text-muted-foreground">Owner: {profile.ownerName}</p>
          </CardContent>
        </Card>

        <Card className={profileCardClass}>
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 flex gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p>{profile.address}</p>
              <p className="text-muted-foreground mt-1">
                {[profile.city, profile.district, profile.state, profile.pincode].filter(Boolean).join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={profileCardClass}>
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2 text-sm">
            <div className="flex flex-wrap gap-1.5">
              {profile.workingDays.map((d) => (
                <Badge key={d} variant="secondary" className="rounded-full">
                  {d}
                </Badge>
              ))}
            </div>
            <p className="font-medium tabular-nums">
              {profile.openingTime} – {profile.closingTime}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.languages.map((l) => (
                <Badge key={l} variant="outline" className="rounded-full">
                  {l}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {profile.gallery.length > 0 && (
          <Card className={`lg:col-span-2 ${profileCardClass}`}>
            <CardHeader className="pb-2 px-5 pt-5">
              <CardTitle className="text-base">Gallery</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <ProfileGallery images={profile.gallery} />
            </CardContent>
          </Card>
        )}

        <Card className={`lg:col-span-2 ${profileCardClass}`}>
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
            <div className="rounded-xl bg-muted/40 p-3 ring-1 ring-black/[0.04]">
              <p className="text-xs font-medium text-muted-foreground uppercase">Aadhaar</p>
              <p className="mt-1 font-medium">
                {profile.aadhaar ? `•••• ${profile.aadhaar.slice(-4)}` : "Not provided"}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 ring-1 ring-black/[0.04]">
              <p className="text-xs font-medium text-muted-foreground uppercase">PAN</p>
              <p className="mt-1 font-medium">{profile.pan || "Not provided"}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 ring-1 ring-black/[0.04]">
              <p className="text-xs font-medium text-muted-foreground uppercase">GST</p>
              <p className="mt-1 font-medium">{profile.gst || "Not provided"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
