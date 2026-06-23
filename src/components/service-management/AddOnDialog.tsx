import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link2, Sparkles } from "lucide-react";
import type { AddOnPricingType, BusinessService, ServiceAddOn } from "@/types/serviceManagement";
import { useServices } from "@/stores/serviceManagementStore";
import { formatRupeePriceInput, validateRupeePrice } from "./rupeeFormat";
import { SERVICE_LISTING_PLACEHOLDERS } from "./serviceListingPlaceholders";
import { Field } from "./ui";

const ADDON_PRICING: AddOnPricingType[] = ["Fixed Price", "Starting From", "Contact For Pricing"];

function emptyAddOn(): ServiceAddOn {
  return {
    id: `addon-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    description: "",
    pricingType: "Fixed Price",
    price: "",
  };
}

function addOnNeedsPrice(pricingType: AddOnPricingType): boolean {
  return pricingType !== "Contact For Pricing";
}

interface AddOnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addOn?: (ServiceAddOn & { serviceId?: string }) | null;
  services?: BusinessService[];
  onSave: (serviceId: string, addOn: ServiceAddOn) => void;
}

export function AddOnDialog({ open, onOpenChange, addOn, services, onSave }: AddOnDialogProps) {
  const [draft, setDraft] = useState<ServiceAddOn>(emptyAddOn());
  const [serviceId, setServiceId] = useState("");
  const [mode, setMode] = useState<"existing" | "custom">("custom");
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [serviceError, setServiceError] = useState("");

  const isEdit = Boolean(addOn);
  const showPrice = addOnNeedsPrice(draft.pricingType);

  const allServices = useServices();
  const linkableServices = allServices.filter((s) => s.id !== serviceId);

  useEffect(() => {
    if (!open) return;
    setDraft(addOn ? { ...addOn } : emptyAddOn());
    setServiceId(addOn?.serviceId ?? (services?.[0]?.id ?? ""));
    setMode(addOn?.linkedServiceIds && addOn.linkedServiceIds.length > 0 ? "existing" : "custom");
    setNameError("");
    setPriceError("");
    setServiceError("");
  }, [open, addOn, services]);

  const set = (patch: Partial<ServiceAddOn>) => setDraft((d) => ({ ...d, ...patch }));

  const selectedLinkedServices = allServices.filter((s) =>
    (draft.linkedServiceIds ?? []).includes(s.id)
  );

  const linkedPriceTotal = selectedLinkedServices.reduce((sum, s) => {
    const num = parseInt((s.price || "").replace(/[^\d]/g, ""), 10);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const handleModeChange = (next: string) => {
    const m = next as "existing" | "custom";
    setMode(m);
    if (m === "custom") {
      set({ linkedServiceIds: [] });
    }
    setNameError("");
    setPriceError("");
  };

  const handleLinkServicesChange = (linkedIds: string[]) => {
    const selectedSvcs = allServices.filter((s) => linkedIds.includes(s.id));
    const total = selectedSvcs.reduce((sum, s) => {
      const num = parseInt((s.price || "").replace(/[^\d]/g, ""), 10);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
    const hasQuote = selectedSvcs.some((s) => s.pricingType === "Contact For Pricing");
    set({
      linkedServiceIds: linkedIds,
      name: selectedSvcs.map((s) => s.name).join(" + "),
      description: selectedSvcs.length
        ? `Includes: ${selectedSvcs.map((s) => s.name).join(", ")}`
        : "",
      price: hasQuote ? "" : total > 0 ? `₹${total.toLocaleString("en-IN")}` : "",
      pricingType: hasQuote ? "Contact For Pricing" : "Fixed Price",
    });
    setNameError("");
    setPriceError("");
  };

  const mainServiceName = services?.find((s) => s.id === serviceId)?.name ?? "—";
  const previewName = draft.name?.trim() || "Untitled add-on";
  const previewPriceLabel = (() => {
    if (draft.pricingType === "Contact For Pricing") return "Contact for pricing";
    if (!draft.price?.trim()) return "—";
    return draft.pricingType === "Starting From" ? `From ${draft.price}` : draft.price;
  })();



  const handlePricingTypeChange = (pricingType: AddOnPricingType) => {
    if (!addOnNeedsPrice(pricingType)) {
      set({ pricingType, price: "" });
      setPriceError("");
      return;
    }
    set({ pricingType });
  };

  const handlePriceBlur = () => {
    if (isLinked) return;
    if (!showPrice || !draft.price?.trim()) return;
    const formatted = formatRupeePriceInput(draft.price);
    if (formatted !== draft.price) set({ price: formatted });
    const err = validateRupeePrice(formatted);
    setPriceError(err ?? "");
  };

  const handleSave = () => {
    if (services && !serviceId) {
      setServiceError("Service is required");
      return;
    }

    let hasError = false;
    if (!draft.name.trim()) {
      setNameError("Add-on name is required");
      hasError = true;
    }

    let price = draft.price?.trim() ?? "";
    if (showPrice) {
      if (!price) {
        setPriceError("Enter price in rupees (e.g. ₹500)");
        hasError = true;
      } else {
        price = formatRupeePriceInput(price);
        const err = validateRupeePrice(price);
        if (err) {
          setPriceError(err);
          hasError = true;
        }
      }
    }

    if (hasError) return;

    onSave(
      serviceId,
      {
        ...draft,
        name: draft.name.trim(),
        description: draft.description?.trim() || undefined,
        price: showPrice ? price : "",
      }
    );
    onOpenChange(false);
  };

  const handleSaveAndAddAnother = () => {
    if (services && !serviceId) {
      setServiceError("Service is required");
      return;
    }

    let hasError = false;
    if (!draft.name.trim()) {
      setNameError("Add-on name is required");
      hasError = true;
    }

    let price = draft.price?.trim() ?? "";
    if (showPrice) {
      if (!price) {
        setPriceError("Enter price in rupees (e.g. ₹500)");
        hasError = true;
      } else {
        price = formatRupeePriceInput(price);
        const err = validateRupeePrice(price);
        if (err) {
          setPriceError(err);
          hasError = true;
        }
      }
    }

    if (hasError) return;

    onSave(
      serviceId,
      {
        ...draft,
        name: draft.name.trim(),
        description: draft.description?.trim() || undefined,
        price: showPrice ? price : "",
      }
    );

    setDraft(emptyAddOn());
    setIsLinked(false);
    setNameError("");
    setPriceError("");
    toast.success("Add-on added successfully. Continue adding next.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b px-5 py-4 text-left shrink-0">
          <DialogTitle className="text-base">{isEdit ? "Edit add-on" : "Add add-on"}</DialogTitle>
          <DialogDescription className="text-xs">
            e.g. Extra bed, breakfast, pooja materials, or airport pickup.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4 overflow-y-auto flex-1">
          {services && (
            <Field label="Service *" error={serviceError}>
              <Select value={serviceId} onValueChange={(val) => { setServiceId(val); setServiceError(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          <div className="flex items-center gap-2 rounded-md border border-dashed p-2.5 bg-muted/20">
            <Checkbox
              id="link-service"
              checked={isLinked}
              onCheckedChange={(checked) => handleLinkToggle(Boolean(checked))}
            />
            <label
              htmlFor="link-service"
              className="text-xs font-medium cursor-pointer select-none text-foreground py-0.5"
            >
              Also link existing service(s) to this add-on <span className="text-muted-foreground font-normal">(optional)</span>
            </label>

          </div>

          {isLinked && (
            <Field label="Link Services *">
              <div className="border rounded-md p-3.5 bg-background grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {linkableServices.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No other services available to link.</p>
                ) : (
                  linkableServices.map((s) => {
                    const checked = (draft.linkedServiceIds ?? []).includes(s.id);
                    return (
                      <div key={s.id} className="flex items-center gap-2.5 py-0.5">
                        <Checkbox
                          id={`link-svc-${s.id}`}
                          checked={checked}
                          onCheckedChange={(val) => {
                            const currentIds = draft.linkedServiceIds ?? [];
                            const nextIds = val
                              ? [...currentIds, s.id]
                              : currentIds.filter((id) => id !== s.id);
                            handleLinkServicesChange(nextIds);
                          }}
                        />
                        <label
                          htmlFor={`link-svc-${s.id}`}
                          className="text-xs cursor-pointer select-none font-medium text-foreground py-0.5"
                        >
                          {s.name}
                        </label>
                      </div>
                    );
                  })
                )}
              </div>
              {linkedPriceTotal > 0 && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Linked services total: <span className="font-mono text-foreground">₹{linkedPriceTotal.toLocaleString("en-IN")}</span> · You can use this as the add-on price or set your own.
                </p>
              )}
            </Field>
          )}

          <Field label="Add-on name *" error={nameError}>
            <Input
              value={draft.name}
              onChange={(e) => {
                set({ name: e.target.value });
                if (nameError) setNameError("");
              }}
              placeholder={SERVICE_LISTING_PLACEHOLDERS.addOnName}
            />
          </Field>

          <Field label="Description">
            <Textarea
              value={draft.description ?? ""}
              onChange={(e) => set({ description: e.target.value })}
              rows={2}
              className="resize-none"
              placeholder={SERVICE_LISTING_PLACEHOLDERS.addOnDescription}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pricing type">
              <Select
                value={draft.pricingType}
                onValueChange={(v) => handlePricingTypeChange(v as AddOnPricingType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADDON_PRICING.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label={showPrice ? "Price *" : "Price"}
              error={priceError}
              hint={showPrice && !priceError ? "e.g. ₹500" : undefined}
            >
              <Input
                value={draft.price ?? ""}
                onChange={(e) => {
                  set({ price: e.target.value });
                  if (priceError) setPriceError("");
                }}
                onBlur={handlePriceBlur}
                placeholder={showPrice ? SERVICE_LISTING_PLACEHOLDERS.addOnPrice : "Not required"}
                disabled={!showPrice}
              />
            </Field>
          </div>
        </div>

        <DialogFooter className="border-t px-5 py-3 sm:justify-between shrink-0 bg-background">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {!isEdit && (
              <Button type="button" variant="outline" onClick={handleSaveAndAddAnother}>
                Save & Add Another
              </Button>
            )}
            <Button type="button" onClick={handleSave}>
              {isEdit ? "Save add-on" : "Add add-on"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
