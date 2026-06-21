import {
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  ImageIcon,
  IndianRupee,
  Languages,
  MapPin,
  Settings2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvailabilityDotBadge, StatusDotBadge } from "./StatusBadges";
import {
  BOOKING_SETTING_OPTIONS,
  COVERAGE_OPTIONS,
  parseRequirementBullets,
} from "./serviceFormConstants";
import {
  formatAge,
  formatDuration,
  formatOfferPeriod,
  formatPrice,
  formatServiceId,
  formatSlots,
  statusStyles,
} from "./shared";
import { InfoRow } from "./ui";
import type { BusinessService } from "@/types/serviceManagement";
import { SERVICE_TYPE_LABELS, WORKING_DAYS } from "@/types/serviceManagement";
import { cn } from "@/lib/utils";

function queueStatusLabel(status: BusinessService["status"]) {
  if (status === "Draft") return "Pending";
  if (status === "Inactive") return "In review";
  return status;
}

function coverageLabel(coverage: BusinessService["coverage"]) {
  const match = COVERAGE_OPTIONS.find((o) => o.value === coverage);
  return match ? `${match.label} — ${match.hint}` : coverage;
}

function locationLine(service: BusinessService) {
  const parts = [service.city, service.district, service.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

function displayOrEmpty(value?: string | null) {
  return value?.trim() ? value.trim() : null;
}

function formatTimeLabel(value?: string) {
  if (!value?.trim()) return null;
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/50 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <dt className="shrink-0 text-xs font-medium text-muted-foreground sm:w-36">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden shadow-none", className)}>
      <CardHeader className="border-b bg-muted/20 px-5 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          {Icon && (
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </span>
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-1">{children}</CardContent>
    </Card>
  );
}

interface ServiceDetailViewProps {
  service: BusinessService;
}

export function ServiceDetailView({ service }: ServiceDetailViewProps) {
  const requirements = parseRequirementBullets(service.requirements).filter(Boolean);
  const currencySymbol = service.currency === "USD" ? "$" : "₹";
  const startTime = formatTimeLabel(service.startTime);
  const endTime = formatTimeLabel(service.endTime);
  const hoursLabel =
    startTime && endTime ? `${startTime} – ${endTime}` : startTime || endTime || "—";

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden shadow-none">
        {service.image ? (
          <div className="relative aspect-[21/9] max-h-56 w-full bg-muted">
            <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <p className="font-mono text-xs text-white/80">{formatServiceId(service.id)}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">{service.name}</h1>
              <p className="mt-1 text-sm text-white/85">
                {service.category}
                {service.subcategory ? ` · ${service.subcategory}` : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="border-b bg-muted/30 px-5 py-6 sm:px-6">
            <p className="font-mono text-xs text-primary">{formatServiceId(service.id)}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{service.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {service.category}
              {service.subcategory ? ` · ${service.subcategory}` : ""}
            </p>
          </div>
        )}

        <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusDotBadge status={service.status} label={queueStatusLabel(service.status)} />
            <AvailabilityDotBadge availability={service.availability} />
            <Badge variant="outline" className="rounded-full text-xs font-normal">
              Updated {formatAge(service.updatedAt)}
            </Badge>
          </div>
          <p className="text-lg font-semibold tabular-nums text-foreground">{formatPrice(service)}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoRow
          icon={Settings2}
          label="Service type"
          value={SERVICE_TYPE_LABELS[service.serviceType]}
          sub={formatDuration(service)}
        />
        <InfoRow icon={MapPin} label="Location" value={locationLine(service)} sub={coverageLabel(service.coverage)} />
        <InfoRow
          icon={Languages}
          label="Languages"
          value={service.languages.length > 0 ? service.languages.join(", ") : "—"}
        />
        <InfoRow icon={Clock} label="Hours" value={hoursLabel} sub={service.days.length ? service.days.join(", ") : "No days set"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="About">
          <p className="py-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {displayOrEmpty(service.description) ?? "No description provided."}
          </p>
        </SectionCard>

        <SectionCard title="Pricing" icon={IndianRupee}>
          <dl>
            <DetailRow label="Pricing type">{service.pricingType}</DetailRow>
            <DetailRow label="Currency">{service.currency}</DetailRow>
            <DetailRow label="Base price">
              {service.pricingType === "Quote Based"
                ? "Not applicable"
                : service.price
                  ? `${currencySymbol}${service.price}`
                  : "—"}
            </DetailRow>
            <DetailRow label="Discount">{displayOrEmpty(service.discount) ?? "—"}</DetailRow>
            <DetailRow label="Listed as">
              <span className="font-medium">{formatPrice(service)}</span>
            </DetailRow>
          </dl>
        </SectionCard>

        <SectionCard title="Location & coverage" icon={MapPin}>
          <dl>
            <DetailRow label="City / town">{displayOrEmpty(service.city) ?? "—"}</DetailRow>
            <DetailRow label="District">{displayOrEmpty(service.district) ?? "—"}</DetailRow>
            <DetailRow label="State">{displayOrEmpty(service.state) ?? "—"}</DetailRow>
            <DetailRow label="Travel range">{coverageLabel(service.coverage)}</DetailRow>
          </dl>
        </SectionCard>

        <SectionCard title="Offer period & slots" icon={CalendarRange}>
          <dl>
            <DetailRow label="Start date">{displayOrEmpty(service.startDate) ?? "—"}</DetailRow>
            <DetailRow label="End date">{displayOrEmpty(service.endDate) ?? "—"}</DetailRow>
            <DetailRow label="Offer period">{formatOfferPeriod(service)}</DetailRow>
            <DetailRow label="Available slots">{formatSlots(service)}</DetailRow>
          </dl>
        </SectionCard>

        <SectionCard title="Service details" icon={Settings2}>
          <dl>
            <DetailRow label="Service type">{SERVICE_TYPE_LABELS[service.serviceType]}</DetailRow>
            <DetailRow label="Duration">{formatDuration(service)}</DetailRow>
            <DetailRow label="Languages">
              {service.languages.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {service.languages.map((lang) => (
                    <Badge key={lang} variant="secondary" className="rounded-full">
                      {lang}
                    </Badge>
                  ))}
                </div>
              ) : (
                "—"
              )}
            </DetailRow>
          </dl>
        </SectionCard>

        <SectionCard title="Availability" icon={Clock} className="lg:col-span-2">
          <div className="space-y-4 py-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Available days</p>
              <div className="flex flex-wrap gap-1.5">
                {WORKING_DAYS.map((d) => {
                  const on = service.days.includes(d);
                  return (
                    <span
                      key={d}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs font-medium",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted/30 text-muted-foreground",
                      )}
                    >
                      {d}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
              <dl>
                <DetailRow label="Start time">{startTime ?? "—"}</DetailRow>
                <DetailRow label="End time">{endTime ?? "—"}</DetailRow>
              </dl>
              <dl>
                <DetailRow label="Availability">
                  <AvailabilityDotBadge availability={service.availability} />
                </DetailRow>
                <DetailRow label="Publish status">
                  <Badge variant="secondary" className={statusStyles[service.status]}>
                    {queueStatusLabel(service.status)}
                  </Badge>
                </DetailRow>
              </dl>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Photos & videos" icon={ImageIcon}>
        <div className="space-y-5 py-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Cover photo</p>
            {service.image ? (
              <div className="overflow-hidden rounded-lg border">
                <img src={service.image} alt={service.name} className="aspect-video w-full max-w-xl object-cover" />
              </div>
            ) : (
              <div className="flex aspect-video max-w-xl items-center justify-center rounded-lg border border-dashed bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">No cover photo</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Gallery ({service.gallery.length})</p>
            {service.gallery.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {service.gallery.map((src, i) => (
                  <div key={`${src.slice(0, 24)}-${i}`} className="aspect-square overflow-hidden rounded-lg border">
                    <img src={src} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No gallery images.</p>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Video links</p>
            {service.videoLinks.length > 0 ? (
              <ul className="space-y-2">
                {service.videoLinks.map((link) => (
                  <li key={link}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1.5 truncate rounded-md border bg-muted/20 px-3 py-2 text-sm text-primary hover:bg-muted/40 hover:underline"
                    >
                      <span className="truncate">{link}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No video links.</p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="What devotees must provide" icon={ClipboardList}>
        {requirements.length > 0 ? (
          <ul className="space-y-2 py-4">
            {requirements.map((item, i) => (
              <li
                key={`${item}-${i}`}
                className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-foreground"
              >
                <span className="mt-0.5 text-primary" aria-hidden>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">No requirements listed.</p>
        )}
      </SectionCard>

      <SectionCard title="Booking settings" icon={Settings2}>
        <div className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-2">
          {BOOKING_SETTING_OPTIONS.map(({ key, label, description }) => {
            const on = service.booking[key];
            return (
              <div
                key={key}
                className={cn(
                  "rounded-lg border p-3",
                  on ? "border-primary/30 bg-primary/[0.04]" : "bg-muted/10",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      on ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {on ? (
                      <>
                        <CheckCircle2 className="size-3" /> On
                      </>
                    ) : (
                      <>
                        <XCircle className="size-3" /> Off
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
