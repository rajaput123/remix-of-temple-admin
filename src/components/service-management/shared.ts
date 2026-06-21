import type { BusinessService, ServiceAvailability, ServicePackage, ServiceStatus } from "@/types/serviceManagement";

/** Semantic status tints — use tokens, never raw Tailwind palette names */
export const statusStyles: Record<ServiceStatus, string> = {
  Active: "bg-success/10 text-success",
  Draft: "bg-warning/10 text-warning",
  Inactive: "bg-muted text-muted-foreground",
};

export const availabilityStyles: Record<ServiceAvailability, string> = {
  Available: "bg-success/10 text-success",
  "Limited Availability": "bg-warning/10 text-warning",
  "Not Available": "bg-destructive/10 text-destructive",
};

export function formatPrice(service: Pick<BusinessService, "pricingType" | "price" | "discount">) {
  if (service.pricingType === "Quote Based") return "Quote Based";
  const base =
    service.pricingType === "Starting From" ? `From ₹${service.price || "—"}` : `₹${service.price || "—"}`;
  return base;
}

export function formatPriceSub(service: Pick<BusinessService, "pricingType" | "discount">) {
  const parts = [service.pricingType];
  if (service.discount?.trim()) parts.push(`Discount: ${service.discount.trim()}`);
  return parts.join(" · ");
}

export function formatOfferPeriod(service: Pick<BusinessService, "startDate" | "endDate">) {
  if (!service.startDate && !service.endDate) return "—";
  if (service.startDate && service.endDate) return `${service.startDate} → ${service.endDate}`;
  return service.startDate || service.endDate || "—";
}

export function formatSlots(service: Pick<BusinessService, "slots">) {
  if (!service.slots?.trim()) return "—";
  const n = Number(service.slots);
  return `${n} slot${n === 1 ? "" : "s"}`;
}

export function formatDuration(service: Pick<BusinessService, "durationValue" | "durationUnit">) {
  if (!service.durationValue) return "—";
  return `${service.durationValue} ${service.durationUnit}`;
}

export function formatServiceId(id: string) {
  const match = id.match(/^svc-?(\d+)$/i);
  if (match) return `svc-${match[1].padStart(3, "0")}`;
  return id;
}

export function formatPackageId(id: string) {
  const match = id.match(/^pkg-?(\d+)$/i);
  if (match) return `pkg-${match[1].padStart(3, "0")}`;
  return id;
}

export function formatPackagePrice(pkg: Pick<ServicePackage, "price">) {
  return pkg.price ? `₹${pkg.price}` : "—";
}

export function formatAge(updatedAt: string) {
  const d = new Date(updatedAt);
  if (Number.isNaN(d.getTime())) return updatedAt;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}
