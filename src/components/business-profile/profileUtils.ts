import type { BusinessProfile } from "@/types/businessProfile";

export function formatProfileLocation(profile: BusinessProfile) {
  return [profile.city, profile.state].filter(Boolean).join(", ") || "—";
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
    "Business Name": p.businessName,
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
    return (
      (p.businessName ?? "").toLowerCase().includes(q) ||
      (p.category ?? "").toLowerCase().includes(q) ||
      (p.ownerName ?? "").toLowerCase().includes(q) ||
      (p.mobile ?? "").includes(q) ||
      (p.city ?? "").toLowerCase().includes(q)
    );
  });
}

export function toggleInList(list: string[], item: string) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function businessTypeLabel(typeId: string, types: { id: string; label: string }[]) {
  return types.find((t) => t.id === typeId)?.label ?? (typeId || "—");
}
