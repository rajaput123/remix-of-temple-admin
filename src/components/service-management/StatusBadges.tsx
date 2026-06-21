import type { ServiceAvailability, ServiceStatus } from "@/types/serviceManagement";
import { StatusPill, type StatusTone } from "@/components/ui/status-pill";

const statusTones: Record<ServiceStatus, StatusTone> = {
  Active: "success",
  Draft: "warning",
  Inactive: "neutral",
};

const availabilityTones: Record<ServiceAvailability, StatusTone> = {
  Available: "success",
  "Limited Availability": "warning",
  "Not Available": "destructive",
};

export function StatusDotBadge({ status, label }: { status: ServiceStatus; label?: string }) {
  return <StatusPill label={label ?? status} tone={statusTones[status]} />;
}

export function AvailabilityDotBadge({ availability }: { availability: ServiceAvailability }) {
  const short =
    availability === "Limited Availability" ? "Limited" : availability === "Not Available" ? "Unavailable" : "Available";
  return <StatusPill label={short} tone={availabilityTones[availability]} />;
}

/** AI risk level mapped from availability — matches ERP approval queue */
export function RiskDotBadge({ availability }: { availability: ServiceAvailability }) {
  const map: Record<ServiceAvailability, { label: string; tone: StatusTone }> = {
    Available: { label: "low", tone: "success" },
    "Limited Availability": { label: "medium", tone: "warning" },
    "Not Available": { label: "high", tone: "destructive" },
  };
  const { label, tone } = map[availability];
  return <StatusPill label={label} tone={tone} />;
}
