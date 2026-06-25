import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  IndianRupee,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BusinessService, PricingType } from "@/types/serviceManagement";
import { SERVICE_LISTING_CATEGORIES } from "@/types/serviceManagement";
import { Field } from "./ui";
import { CustomFieldsBuilder } from "./CustomFieldsBuilder";
import { AddOnsBuilder } from "./AddOnsBuilder";
import { CoverImageField, GalleryImagesField } from "./ServiceListingMediaFields";
import { SERVICE_LISTING_PLACEHOLDERS } from "./serviceListingPlaceholders";
import { formatRupeeDiscountInput, formatRupeePriceInput } from "./rupeeFormat";
import {
  hasListingErrors,
  pricePlaceholder,
  pricingNeedsAmount,
  validatePricingFields,
  validateServiceListingTab,
  type ServiceListingFormErrors,
  type ServiceListingTab,
} from "./serviceListingValidation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRICING_TYPES: PricingType[] = [
  "Fixed Price",
  "Starting From",
  "Contact For Pricing",
  "Quote Based",
];

const TABS: { id: ServiceListingTab; label: string; icon: React.ElementType }[] = [
  { id: "information", label: "Information", icon: FileText },
  { id: "pricing", label: "Pricing", icon: IndianRupee },
  { id: "custom-fields", label: "Custom Fields", icon: Settings2 },
];

interface ServiceListingFormProps {
  service: BusinessService;
  errors?: ServiceListingFormErrors;
  onChange: (service: BusinessService) => void;
  onErrorsChange?: (errors: ServiceListingFormErrors) => void;
  onCancel: () => void;
  onSaveDraft: (service: BusinessService) => void;
  onPublish: (service: BusinessService) => void;
}

export function ServiceListingForm({
  service,
  errors = {},
  onChange,
  onErrorsChange,
  onCancel,
  onSaveDraft,
  onPublish,
}: ServiceListingFormProps) {
  const [activeTab, setActiveTab] = useState<ServiceListingTab>("information");
  const serviceRef = useRef(service);
  serviceRef.current = service;

  const set = useCallback(
    (patch: Partial<BusinessService>) => {
      const next = { ...serviceRef.current, ...patch };
      serviceRef.current = next;
      onChange(next);
      if (!onErrorsChange || !hasListingErrors(errors)) return;
      const nextErrors = { ...errors };
      if (patch.price !== undefined) delete nextErrors.price;
      if (patch.discount !== undefined) delete nextErrors.discount;
      if (patch.pricingType !== undefined) {
        delete nextErrors.price;
        delete nextErrors.discount;
      }
      if (Object.keys(nextErrors).length !== Object.keys(errors).length) {
        onErrorsChange(nextErrors);
      }
    },
    [onChange, onErrorsChange, errors],
  );

  const tabIndex = TABS.findIndex((t) => t.id === activeTab);
  const isFirstTab = tabIndex === 0;
  const isLastTab = tabIndex === TABS.length - 1;

  useEffect(() => {
    setActiveTab("information");
  }, [service.id]);

  useEffect(() => {
    if (!hasListingErrors(errors)) return;
    if (errors.name || errors.category || errors.description || errors.image || errors.gallery) {
      setActiveTab("information");
    } else if (errors.price || errors.discount) {
      setActiveTab("pricing");
    }
  }, [errors]);

  const showPrice = pricingNeedsAmount(service.pricingType);

  const handlePricingTypeChange = (pricingType: PricingType) => {
    if (!pricingNeedsAmount(pricingType)) {
      set({ pricingType, price: "", discount: "" });
      onErrorsChange?.({});
      return;
    }
    set({ pricingType });
  };

  const tabHasError = (tab: ServiceListingTab) => {
    if (tab === "information") {
      return Boolean(errors.name || errors.category || errors.description || errors.image || errors.gallery);
    }
    if (tab === "pricing") return Boolean(errors.price || errors.discount);
    return false;
  };

  const goBack = () => {
    if (!isFirstTab) setActiveTab(TABS[tabIndex - 1].id);
  };

  const goNext = () => {
    const stepErrors = validateServiceListingTab(service, activeTab);
    onErrorsChange?.(stepErrors);
    if (hasListingErrors(stepErrors)) {
      const first = stepErrors.price ?? stepErrors.discount ?? stepErrors.name ?? stepErrors.category;
      toast.error(first ?? "Complete the required fields on this step");
      return;
    }
    onErrorsChange?.({});
    if (!isLastTab) setActiveTab(TABS[tabIndex + 1].id);
  };

  const validatePriceField = (field: "price" | "discount") => {
    let nextService = service;

    if (field === "price" && showPrice && service.price?.trim()) {
      const formatted = formatRupeePriceInput(service.price);
      if (formatted !== service.price) {
        nextService = { ...service, price: formatted };
        onChange(nextService);
      }
    }

    if (field === "discount" && showPrice && service.discount?.trim()) {
      const formatted = formatRupeeDiscountInput(service.discount);
      if (formatted !== service.discount) {
        nextService = { ...nextService, discount: formatted };
        onChange(nextService);
      }
    }

    if (!onErrorsChange) return;
    const pricingErrors = validatePricingFields(nextService);
    const nextErrors = { ...errors };
    if (pricingErrors.price) nextErrors.price = pricingErrors.price;
    else delete nextErrors.price;
    if (pricingErrors.discount) nextErrors.discount = pricingErrors.discount;
    else delete nextErrors.discount;
    onErrorsChange(nextErrors);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ServiceListingTab)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="shrink-0 border-b border-border bg-muted/30 px-4">
          <div className="flex items-center justify-center gap-1.5 py-2">
            {TABS.map((tab, i) => (
              <div
                key={tab.id}
                className={cn(
                  "h-1.5 flex-1 max-w-12 rounded-full transition-colors",
                  i <= tabIndex ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </div>
          <p className="pb-2 text-center text-[11px] text-muted-foreground">
            Step {tabIndex + 1} of {TABS.length} · {TABS[tabIndex].label}
          </p>
          <TabsList className="flex h-auto w-full flex-wrap justify-center gap-0 bg-transparent sm:flex-nowrap">
            {TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className={cn(
                  "gap-1.5 px-3 py-2 text-xs sm:px-4 sm:text-sm",
                  tabHasError(id) && "text-destructive data-[state=active]:border-destructive",
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <TabsContent value="information" className="mt-0 focus-visible:outline-none">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Service name *" error={errors.name} htmlFor="svc-name">
                <Input
                  id="svc-name"
                  value={service.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder={SERVICE_LISTING_PLACEHOLDERS.name}
                />
              </Field>

              <Field label="Category *" error={errors.category}>
                <Select value={service.category || undefined} onValueChange={(v) => set({ category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={SERVICE_LISTING_PLACEHOLDERS.category} />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_LISTING_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Short description *" error={errors.description} htmlFor="svc-desc">
                  <Textarea
                    id="svc-desc"
                    className="min-h-[4.5rem] resize-y"
                    value={service.description}
                    onChange={(e) => set({ description: e.target.value })}
                    rows={2}
                    placeholder={SERVICE_LISTING_PLACEHOLDERS.description}
                  />
                </Field>
              </div>

              <CoverImageField
                value={service.image}
                error={errors.image}
                onChange={(image) => set({ image })}
              />

              <GalleryImagesField
                links={service.gallery ?? []}
                error={errors.gallery}
                onChange={(gallery) => set({ gallery })}
              />

              <div className="sm:col-span-2 space-y-3 rounded-md border border-border bg-muted/20 p-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">Schedule & slots</p>
                  <p className="text-[11px] text-muted-foreground">
                    Set daily timings and max bookings (slots) for this service.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Start time" htmlFor="svc-start">
                    <Input
                      id="svc-start"
                      type="time"
                      value={service.startTime || ""}
                      onChange={(e) => set({ startTime: e.target.value })}
                    />
                  </Field>
                  <Field label="End time" htmlFor="svc-end">
                    <Input
                      id="svc-end"
                      type="time"
                      value={service.endTime || ""}
                      onChange={(e) => set({ endTime: e.target.value })}
                    />
                  </Field>
                  <Field
                    label="Available slots"
                    hint="Max bookings allowed in this window"
                    htmlFor="svc-slots"
                  >
                    <Input
                      id="svc-slots"
                      type="text"
                      inputMode="numeric"
                      value={service.slots || ""}
                      onChange={(e) => set({ slots: e.target.value.replace(/\D/g, "") })}
                      placeholder="e.g. 12"
                    />
                  </Field>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="mt-0 focus-visible:outline-none">
            {(errors.price || errors.discount) && (
              <div
                role="alert"
                className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {errors.price && <p>{errors.price}</p>}
                {errors.discount && <p className={errors.price ? "mt-1" : ""}>{errors.discount}</p>}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Pricing type *">
                <Select value={service.pricingType} onValueChange={(v) => handlePricingTypeChange(v as PricingType)}>
                  <SelectTrigger>
                    <SelectValue placeholder={SERVICE_LISTING_PLACEHOLDERS.pricingType} />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_TYPES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label={showPrice ? "Price *" : "Price"}
                error={errors.price}
                hint={showPrice && !errors.price ? "Use ₹ with commas (e.g. ₹5,000 or ₹250 per plate)" : undefined}
                htmlFor="svc-price"
              >
                <Input
                  id="svc-price"
                  aria-invalid={Boolean(errors.price)}
                  value={service.price ?? ""}
                  onChange={(e) => set({ price: e.target.value })}
                  onBlur={() => validatePriceField("price")}
                  placeholder={pricePlaceholder(service.pricingType)}
                  disabled={!showPrice}
                  className={cn(errors.price && "border-destructive focus-visible:ring-destructive")}
                />
              </Field>

              <Field
                label="Discount"
                error={errors.discount}
                hint={showPrice && !errors.discount ? "Optional — e.g. 10% or ₹500" : undefined}
                htmlFor="svc-discount"
              >
                <Input
                  id="svc-discount"
                  aria-invalid={Boolean(errors.discount)}
                  value={service.discount ?? ""}
                  onChange={(e) => set({ discount: e.target.value })}
                  onBlur={() => validatePriceField("discount")}
                  placeholder={showPrice ? SERVICE_LISTING_PLACEHOLDERS.discount : "Not applicable"}
                  disabled={!showPrice}
                  className={cn(errors.discount && "border-destructive focus-visible:ring-destructive")}
                />
              </Field>
            </div>
          </TabsContent>

          <TabsContent value="custom-fields" className="mt-0 focus-visible:outline-none">
            <CustomFieldsBuilder
              fields={service.customFields ?? []}
              onChange={(customFields) => set({ customFields })}
            />
          </TabsContent>


        </div>
      </Tabs>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-card px-5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            {!isFirstTab && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={goBack}>
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onSaveDraft({ ...service, status: "Draft" })}>
              Save Draft
            </Button>
            {!isLastTab ? (
              <Button size="sm" className="gap-1.5" onClick={goNext}>
                Next
                <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button size="sm" className="gap-1.5" onClick={() => onPublish(service)}>
                <CheckCircle2 className="size-3.5" />
                Publish Service
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
