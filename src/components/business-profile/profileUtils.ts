import type { BusinessProfile, ProfileStatus, ProfileVerificationStatus } from "@/types/businessProfile";

export function formatProfileLocation(profile: BusinessProfile) {
  const parts = [profile.city, profile.district, profile.state, profile.pincode].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export function formatUpdatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function exportProfilesCsv(profiles: BusinessProfile[]) {
  const rows = profiles.map((p) => ({
    "Business Name": profileDisplayName(p),
    Category: p.category,
    Owner: p.ownerName,
    Mobile: p.mobile,
    Location: formatProfileLocation(p),
    Status: p.status,
    Verification: p.verificationStatus,
    "Last Updated": formatUpdatedAt(p.updatedAt),
  }));
  return rows;
}

export function filterProfiles(
  profiles: BusinessProfile[],
  search: string,
  statusFilter: string,
  verificationFilter: string,
) {
  const q = search.trim().toLowerCase();
  return profiles.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (verificationFilter !== "all" && p.verificationStatus !== verificationFilter) return false;
    if (!q) return true;
    return profileSearchText(p).includes(q);
  });
}

export function toggleInList(list: string[], item: string) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function businessTypeLabel(typeId: string, types: { id: string; label: string }[]) {
  return types.find((t) => t.id === typeId)?.label ?? (typeId || "—");
}

export function formatOptionalText(value?: string | null, fallback = "Not provided"): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/** Primary name shown on profile — individual may omit business name. */
export function profileDisplayName(
  profile: Pick<BusinessProfile, "entityType" | "businessName" | "ownerName" | "legalCompanyName">,
): string {
  if (profile.entityType === "company") {
    return (
      profile.businessName.trim() ||
      profile.legalCompanyName.trim() ||
      profile.ownerName.trim() ||
      "Registered business"
    );
  }
  return profile.businessName.trim() || profile.ownerName.trim() || "Service provider";
}

/** Secondary line under the profile title, when it adds context. */
export function profileSubtitle(profile: BusinessProfile): string | null {
  if (profile.entityType === "individual") {
    const name = profile.ownerName.trim();
    const trade = profile.businessName.trim();
    const display = profileDisplayName(profile);
    if (trade && name && display === trade && name !== trade) return name;
    return null;
  }
  if (profile.entityType === "company") {
    const display = profileDisplayName(profile);
    const legal = profile.legalCompanyName.trim();
    if (legal && legal !== display) return legal;
    return null;
  }
  return null;
}

export function profileAboutTitle(entityType: BusinessProfile["entityType"]): string {
  if (entityType === "individual") return "About you & your services";
  if (entityType === "company") return "About the company";
  return "About the business";
}

export function shouldShowGst(profile: Pick<BusinessProfile, "entityType" | "gst" | "gstDoc">): boolean {
  return profile.entityType === "company" || !!(profile.gst?.trim() || profile.gstDoc);
}

export function profileSearchText(profile: BusinessProfile): string {
  return [
    profile.businessName,
    profile.ownerName,
    profile.legalCompanyName,
    profile.category,
    profile.mobile,
    profile.city,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function profileEntityLabel(entityType: BusinessProfile["entityType"]): string {
  if (entityType === "company") return "Registered company";
  if (entityType === "individual") return "Individual";
  return "—";
}

export function profileStatusLabel(status: ProfileStatus): string {
  const labels: Record<ProfileStatus, string> = {
    draft: "Draft",
    published: "Published",
    pending: "Pending",
  };
  return labels[status] ?? status;
}

export function verificationStatusLabel(status: ProfileVerificationStatus): string {
  const labels: Record<ProfileVerificationStatus, string> = {
    not_submitted: "Not submitted",
    pending: "Pending review",
    verified: "Verified",
    rejected: "Rejected",
    reupload_requested: "Reupload requested",
  };
  return labels[status] ?? status;
}
