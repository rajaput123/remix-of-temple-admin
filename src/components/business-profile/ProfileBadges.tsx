import type { ProfileStatus, ProfileVerificationStatus } from "@/types/businessProfile";
import { StatusBadge } from "@/components/ui/status-badge";

const STATUS_META: Record<
  ProfileStatus,
  { label: string; variant: "neutral" | "success" | "warning" | "primary" }
> = {
  draft: { label: "Draft", variant: "neutral" },
  published: { label: "Published", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
};

const VERIFICATION_META: Record<
  ProfileVerificationStatus,
  { label: string; variant: "neutral" | "success" | "warning" | "destructive" | "primary" }
> = {
  not_submitted: { label: "Not Submitted", variant: "neutral" },
  pending: { label: "Pending", variant: "warning" },
  verified: { label: "Verified", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  reupload_requested: { label: "Reupload Requested", variant: "primary" },
};

export function ProfileStatusBadge({ status }: { status: ProfileStatus }) {
  const m = STATUS_META[status] ?? STATUS_META.draft;
  return <StatusBadge variant={m.variant}>{m.label}</StatusBadge>;
}

export function VerificationStatusBadge({ status }: { status: ProfileVerificationStatus }) {
  const m = VERIFICATION_META[status] ?? VERIFICATION_META.not_submitted;
  return <StatusBadge variant={m.variant}>{m.label}</StatusBadge>;
}
