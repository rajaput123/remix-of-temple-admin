import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { BusinessProfile } from "@/types/businessProfile";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import {
  businessTypeLabel,
  formatProfileLocation,
  formatUpdatedAt,
  profileDisplayName,
} from "@/components/business-profile/profileUtils";
import { ProfileStatusBadge, VerificationStatusBadge } from "@/components/business-profile/ProfileBadges";
import { Eye, Pencil, Send, Trash2 } from "lucide-react";

interface ProfileTableViewProps {
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

export function ProfileTableView({
  profiles,
  onView,
  onEdit,
  onPublish,
  onDelete,
  showVerificationActions,
  onApprove,
  onReject,
  onReupload,
}: ProfileTableViewProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id} className="hover:bg-muted/40">
              <TableCell className="font-medium">{profileDisplayName(profile)}</TableCell>
              <TableCell>{profile.category || businessTypeLabel(profile.businessType, BUSINESS_TYPES)}</TableCell>
              <TableCell>{profile.ownerName || "—"}</TableCell>
              <TableCell>{profile.mobile || "—"}</TableCell>
              <TableCell>{formatProfileLocation(profile)}</TableCell>
              <TableCell>
                <ProfileStatusBadge status={profile.status} />
              </TableCell>
              <TableCell>
                <VerificationStatusBadge status={profile.verificationStatus} />
              </TableCell>
              <TableCell className="text-muted-foreground">{formatUpdatedAt(profile.updatedAt)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-end gap-1">
                  <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => onView(profile)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => onEdit(profile)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {profile.status !== "published" && (
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => onPublish(profile)}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-destructive"
                    onClick={() => onDelete(profile)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {showVerificationActions && (
                    <>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => onApprove?.(profile)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => onReject?.(profile)}>
                        Reject
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8 px-2 text-xs" onClick={() => onReupload?.(profile)}>
                        Reupload
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
