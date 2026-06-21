import {
  CalendarRange,
  CheckCircle2,
  Clock,
  FileText,
  IndianRupee,
  Languages,
  MapPin,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type {
  BusinessService,
  DurationUnit,
  PricingType,
  ServiceAvailability,
  ServiceStatus,
  ServiceType,
} from "@/types/serviceManagement";
import {
  SERVICE_CATEGORIES,
  SERVICE_LANGUAGES,
  SERVICE_TYPE_LABELS,
  WORKING_DAYS,
} from "@/types/serviceManagement";
import { Field, FieldGroupError, SectionTitle } from "./ui";
import type { ServiceFormErrors } from "./validation";
import { ServiceMediaSection } from "./ServiceMediaSection";
import { RequirementsBulletEditor } from "./RequirementsBulletEditor";
import { BookingSettingsSection } from "./BookingSettingsSection";
import { COVERAGE_OPTIONS } from "./serviceFormConstants";

interface ServiceFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: BusinessService | null;
  errors?: ServiceFormErrors;
  onChange: (service: BusinessService) => void;
  onSaveDraft: (service: BusinessService) => void;
  onPublish: (service: BusinessService) => void;
}

const DURATION_UNITS: DurationUnit[] = ["Minutes", "Hours", "Half Day", "Full Day", "Days"];

export function ServiceFormDrawer({
  open,
  onOpenChange,
  service,
  errors = {},
  onChange,
  onSaveDraft,
  onPublish,
}: ServiceFormDrawerProps) {
  if (!service) return null;

  const set = (patch: Partial<BusinessService>) => onChange({ ...service, ...patch });
  const setBooking = (patch: Partial<BusinessService["booking"]>) =>
    onChange({ ...service, booking: { ...service.booking, ...patch } });

  const toggleDay = (d: string) =>
    set({
      days: service.days.includes(d) ? service.days.filter((x) => x !== d) : [...service.days, d],
    });

  const toggleLang = (l: string) =>
    set({
      languages: service.languages.includes(l)
        ? service.languages.filter((x) => x !== l)
        : [...service.languages, l],
    });

  const isEdit = !!service.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>{isEdit ? "Edit Service" : "Add Service"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update service details and publish when ready. Required fields are marked with *."
              : "Fill in details to create a new service. Required fields are marked with *."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <section className="space-y-3">
            <SectionTitle icon={FileText} title="Basic Information" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Service Name *" error={errors.name}>
                <Input
                  value={service.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="Enter service name"
                  aria-required
                />
              </Field>
              <Field label="Service Category *" error={errors.category}>
                <Select value={service.category} onValueChange={(v) => set({ category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Service Subcategory" hint="Optional — narrows search and filtering.">
                <Input
                  value={service.subcategory || ""}
                  onChange={(e) => set({ subcategory: e.target.value })}
                  placeholder="Enter subcategory"
                />
              </Field>
              <Field label="Status">
                <Select value={service.status} onValueChange={(v: ServiceStatus) => set({ status: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Service Description *" error={errors.description} hint="Visible to devotees on listings.">
              <Textarea
                rows={3}
                value={service.description}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="Enter service description"
                aria-required
              />
            </Field>
          </section>

          <section className="space-y-3">
            <SectionTitle icon={Settings2} title="Service Type" />
            <Select
              value={service.serviceType}
              onValueChange={(v: ServiceType) => set({ serviceType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(SERVICE_TYPE_LABELS) as [ServiceType, string][]).map(([k, label]) => (
                  <SelectItem key={k} value={k}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-3">
            <SectionTitle icon={Clock} title="Duration" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Duration Value">
                <Input
                  value={service.durationValue}
                  onChange={(e) => set({ durationValue: e.target.value })}
                  placeholder="Enter duration"
                />
              </Field>
              <Field label="Duration Unit">
                <Select
                  value={service.durationUnit}
                  onValueChange={(v: DurationUnit) => set({ durationUnit: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle icon={Languages} title="Languages Supported *" />
            <div
              className={cn(
                "grid grid-cols-2 gap-2 sm:grid-cols-3",
                errors.languages && "rounded-md border border-destructive/50 p-2",
              )}
            >
              {SERVICE_LANGUAGES.map((l) => (
                <label
                  key={l}
                  className="flex cursor-pointer items-center gap-2 rounded-md border bg-background p-2.5 text-sm hover:bg-muted/50"
                >
                  <Checkbox checked={service.languages.includes(l)} onCheckedChange={() => toggleLang(l)} aria-label={l} />
                  <span>{l}</span>
                </label>
              ))}
            </div>
            <FieldGroupError error={errors.languages} />
          </section>

          <section className="space-y-3">
            <SectionTitle
              icon={MapPin}
              title="Location & coverage"
              desc="Where you deliver this service — not photos. Devotees use this to see if you serve their area."
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="City / Town" hint="Primary location you operate from.">
                <Input value={service.city || ""} onChange={(e) => set({ city: e.target.value })} placeholder="Enter city" />
              </Field>
              <Field label="District" hint="Optional — broader region.">
                <Input value={service.district || ""} onChange={(e) => set({ district: e.target.value })} placeholder="Enter district" />
              </Field>
              <Field label="State">
                <Input value={service.state || ""} onChange={(e) => set({ state: e.target.value })} placeholder="Enter state" />
              </Field>
              <Field label="How far you travel" hint="Maximum area you will serve for this listing.">
                <Select value={service.coverage} onValueChange={(v) => set({ coverage: v as BusinessService["coverage"] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select coverage" />
                  </SelectTrigger>
                  <SelectContent>
                    {COVERAGE_OPTIONS.map(({ value, label, hint }) => (
                      <SelectItem key={value} value={value}>
                        {label} — {hint}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          <ServiceMediaSection
            image={service.image}
            gallery={service.gallery}
            videoLinks={service.videoLinks}
            onChange={(patch) => set(patch)}
          />

          <section className="space-y-3">
            <SectionTitle icon={IndianRupee} title="Pricing Information" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Pricing Type">
                <Select value={service.pricingType} onValueChange={(v: PricingType) => set({ pricingType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                    <SelectItem value="Starting From">Starting From</SelectItem>
                    <SelectItem value="Quote Based">Quote Based</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Currency">
                <Select value={service.currency} onValueChange={(v) => set({ currency: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR ₹</SelectItem>
                    <SelectItem value="USD">USD $</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="Base Price"
                error={errors.price}
                hint={service.pricingType === "Quote Based" ? "Not required for quote-based pricing." : "Amount in INR."}
              >
                <Input
                  type="text"
                  inputMode="decimal"
                  disabled={service.pricingType === "Quote Based"}
                  value={service.price || ""}
                  onChange={(e) => set({ price: e.target.value.replace(/[^\d.]/g, "") })}
                  placeholder={service.pricingType === "Quote Based" ? "Not applicable" : "Enter amount"}
                />
              </Field>
              <Field label="Discount" hint="Optional — e.g. 10% or ₹500 off.">
                <Input
                  value={service.discount || ""}
                  onChange={(e) => set({ discount: e.target.value })}
                  placeholder="Enter discount"
                />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle
              icon={CalendarRange}
              title="Offer Period & Slots"
              desc="Optional — limit when the service is bookable and how many slots are available."
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Start Date" hint="Optional listing start." error={errors.startDate}>
                <Input
                  type="date"
                  value={service.startDate || ""}
                  onChange={(e) => set({ startDate: e.target.value })}
                />
              </Field>
              <Field label="End Date" hint="Optional listing end." error={errors.endDate}>
                <Input
                  type="date"
                  value={service.endDate || ""}
                  onChange={(e) => set({ endDate: e.target.value })}
                  min={service.startDate || undefined}
                />
              </Field>
              <Field
                label="Available Slots"
                hint="Optional — max bookings in this period."
                error={errors.slots}
              >
                <Input
                  type="text"
                  inputMode="numeric"
                  value={service.slots || ""}
                  onChange={(e) => set({ slots: e.target.value.replace(/\D/g, "") })}
                  placeholder="Enter slot count"
                />
              </Field>
            </div>
          </section>

          <RequirementsBulletEditor
            value={service.requirements}
            onChange={(requirements) => set({ requirements })}
          />

          <BookingSettingsSection booking={service.booking} onChange={setBooking} />

          <section className="space-y-3">
            <SectionTitle icon={Clock} title="Availability" />
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Available Days *</label>
              <div
                className={cn(
                  "flex flex-wrap gap-1.5",
                  errors.days && "rounded-md border border-destructive/50 p-2",
                )}
              >
                {WORKING_DAYS.map((d) => {
                  const on = service.days.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-xs font-medium transition",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background text-foreground hover:bg-muted",
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              <FieldGroupError error={errors.days} />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Start Time">
                <Input type="time" value={service.startTime} onChange={(e) => set({ startTime: e.target.value })} />
              </Field>
              <Field label="End Time">
                <Input type="time" value={service.endTime} onChange={(e) => set({ endTime: e.target.value })} />
              </Field>
              <Field label="Availability Status">
                <Select
                  value={service.availability}
                  onValueChange={(v: ServiceAvailability) => set({ availability: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Limited Availability">Limited Availability</SelectItem>
                    <SelectItem value="Not Available">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t bg-background/95 px-5 py-3 backdrop-blur">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onSaveDraft({ ...service, status: "Draft" })}>
              Save Draft
            </Button>
            <Button onClick={() => onPublish(service)} className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              {isEdit ? "Save & Publish" : "Publish Service"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
