import type { BusinessService, ServiceAddOn, ServiceAvailability, ServicePackage, ServiceStatus } from "@/types/serviceManagement";

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
  if (service.pricingType === "Contact For Pricing") return "Contact for pricing";

  const raw = service.price?.trim();
  if (!raw) return "—";

  const amount = /^(?:₹|Rs\.?|INR\s*)/i.test(raw) ? raw : `₹${raw}`;
  return service.pricingType === "Starting From" ? `From ${amount}` : amount;
}

export function parseServicePriceValue(price?: string): number {
  // Lazy import pattern avoided — duplicate minimal parse to keep shared free of rupeeFormat cycle
  const v = price?.trim();
  if (!v) return 0;
  const cleaned = v.replace(/,/g, "");
  const match = cleaned.match(/(?:₹|Rs\.?|INR\s*)?(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : 0;
}

export function formatPriceSub(service: Pick<BusinessService, "pricingType" | "discount">) {
  const parts: string[] = [];
  if (
    service.pricingType !== "Quote Based" &&
    service.pricingType !== "Contact For Pricing"
  ) {
    parts.push(service.pricingType);
  }
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

export function packagePriceParts(
  pkg: Pick<ServicePackage, "price">,
  service?: Pick<BusinessService, "pricingType" | "price">,
) {
  if (service?.pricingType === "Quote Based") {
    return { main: "Quote Based" as const, sub: undefined };
  }

  const base = Number(service?.price || 0);
  const addOn = Number(pkg.price || 0);

  if (!base && !addOn) return { main: "—" as const, sub: undefined };
  if (base > 0 && addOn > 0) {
    return { main: `₹${base + addOn}`, sub: `₹${base} + ₹${addOn}` };
  }
  if (addOn > 0) return { main: `₹${addOn}`, sub: base > 0 ? `incl. base ₹${base}` : undefined };
  if (base > 0) return { main: `₹${base}`, sub: "Service base only" };
  return { main: "—" as const, sub: undefined };
}

export function packageCombinedPriceValue(
  pkg: Pick<ServicePackage, "price">,
  service?: Pick<BusinessService, "pricingType" | "price">,
) {
  if (service?.pricingType === "Quote Based") return 0;
  return Number(service?.price || 0) + Number(pkg.price || 0);
}

export function formatAddOnPrice(addOn: Pick<ServiceAddOn, "pricingType" | "price">) {
  if (addOn.pricingType === "Contact For Pricing") return "Contact for pricing";
  const raw = addOn.price?.trim();
  if (!raw) return "—";
  const amount = /^(?:₹|Rs\.?|INR\s*)/i.test(raw) ? raw : `₹${raw}`;
  return addOn.pricingType === "Starting From" ? `From ${amount}` : amount;
}

export function displayPriceAmount(price?: string, currency = "INR") {
  const raw = price?.trim();
  if (!raw) return "—";
  if (/^(?:₹|Rs\.?|INR\s*|\$)/i.test(raw)) return raw;
  return currency === "USD" ? `$${raw}` : `₹${raw}`;
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
