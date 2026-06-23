import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BusinessProfile } from "@/types/businessProfile";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import {
  businessTypeLabel,
  formatProfileLocation,
  profileDisplayName,
} from "@/components/business-profile/profileUtils";
import { ProfileStatusBadge, VerificationStatusBadge } from "@/components/business-profile/ProfileBadges";
import { ProfileAvatar } from "@/components/business-profile/ProfileMedia";
import { Eye, Pencil, Send, Trash2 } from "lucide-react";

interface ProfileCardGridProps {
  profiles: BusinessProfile[];
  onView: (profile: BusinessProfile) => void;
  onEdit: (profile: BusinessProfile) => void;
  onPublish: (profile: BusinessProfile) => void;
  onDelete: (profile: BusinessProfile) => void;
  showVerificationActions?: boolean;
  onApprove?: (profile: BusinessProfile) => void;
  onReject?: (profile: BusinessProfile) => void;
  onReupload?: (profile: BusinessProfile) => void;
}

export function ProfileCardGrid({
  profiles,
  onView,
  onEdit,
  onPublish,
  onDelete,
  showVerificationActions,
  onApprove,
  onReject,
  onReupload,
}: ProfileCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {profiles.map((profile) => (
        <Card key={profile.id} className="overflow-hidden transition-shadow hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <ProfileAvatar
                src={profile.logo}
                alt={profileDisplayName(profile)}
                fallbackName={profile.ownerName || profileDisplayName(profile)}
                size="sm"
                className="h-12 w-12 rounded-lg border-2 shadow-none"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-foreground">
                  {profileDisplayName(profile)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {businessTypeLabel(profile.businessType, BUSINESS_TYPES)}
                  {profile.category ? ` · ${profile.category}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{formatProfileLocation(profile)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <ProfileStatusBadge status={profile.status} />
              <VerificationStatusBadge status={profile.verificationStatus} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => onView(profile)}>
                <Eye className="h-3.5 w-3.5" /> View
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => onEdit(profile)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              {profile.status !== "published" && (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => onPublish(profile)}>
                  <Send className="h-3.5 w-3.5" /> Publish
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 text-destructive hover:text-destructive"
                onClick={() => onDelete(profile)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
            {showVerificationActions && (
              <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                <Button size="sm" onClick={() => onApprove?.(profile)}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => onReject?.(profile)}>
                  Reject
                </Button>
                <Button size="sm" variant="secondary" onClick={() => onReupload?.(profile)}>
                  Request Reupload
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
