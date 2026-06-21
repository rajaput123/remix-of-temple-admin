import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types/businessConnect";

const META: Record<VerificationStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  review: { label: "Under Review", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  verified: { label: "Verified", cls: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-800 border-red-200" },
  skipped: { label: "Not Started", cls: "bg-muted text-muted-foreground border-border" },
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const m = META[status];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", m.cls)}>
      {m.label}
    </span>
  );
}
