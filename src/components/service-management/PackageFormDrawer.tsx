import { CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import type { BusinessService, ServicePackage, ServiceStatus } from "@/types/serviceManagement";
import { Field, SectionTitle } from "./ui";
import { formatPrice, packagePriceParts } from "./shared";
import type { PackageFormErrors } from "./validation";
import { FileText } from "lucide-react";

interface PackageFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pkg: ServicePackage | null;
  services: BusinessService[];
  errors?: PackageFormErrors;
  lockPrimaryServiceId?: string;
  onChange: (pkg: ServicePackage) => void;
  onSaveDraft: (pkg: ServicePackage) => void;
  onPublish: (pkg: ServicePackage) => void;
  onDelete?: (id: string) => void;
}

export function PackageFormDrawer({
  open,
  onOpenChange,
  pkg,
  services,
  errors = {},
  lockPrimaryServiceId,
  onChange,
  onSaveDraft,
  onPublish,
  onDelete,
}: PackageFormDrawerProps) {
  if (!pkg) return null;

  const isEdit = !!pkg.id;
  const primaryLocked = !!lockPrimaryServiceId;
  const primaryService = services.find((s) => s.id === pkg.primaryServiceId);
  const pricePreview = primaryService ? packagePriceParts(pkg, primaryService) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>{isEdit ? "Edit Package Tier" : "Add Package Tier"}</SheetTitle>
          <SheetDescription>
            Add an extra package tier for a main service — e.g. Standard, Complete, or Premium.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <Field
            label="Main Service *"
            error={errors.primaryServiceId}
            hint="The base service this package tier belongs to."
          >
            {primaryLocked && primaryService ? (
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2.5 text-sm">
                <Badge variant="secondary" className="shrink-0">Main</Badge>
                <span className="font-medium">{primaryService.name}</span>
              </div>
            ) : (
              <Select
                value={pkg.primaryServiceId || undefined}
                onValueChange={(primaryServiceId) => onChange({ ...pkg, primaryServiceId })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          {primaryService && (
            <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
              Base service: <span className="font-medium text-foreground">{primaryService.name}</span>
              {primaryService.pricingType !== "Quote Based" && primaryService.price && (
                <span> · base {formatPrice(primaryService)}</span>
              )}
            </div>
          )}

          <section className="space-y-3">
            <SectionTitle icon={FileText} title="Package Tier" desc="Name and details for this tier." />
            <Field label="Tier Name *" error={errors.name} hint="Name for this package tier.">
              <Input
                value={pkg.name}
                onChange={(e) => onChange({ ...pkg, name: e.target.value })}
                placeholder="Enter tier name"
                aria-required
              />
            </Field>

            <Field
              label="Description"
              hint="What this tier includes on top of the main service."
              error={errors.description}
            >
              <Textarea
                rows={3}
                value={pkg.description}
                onChange={(e) => onChange({ ...pkg, description: e.target.value })}
                placeholder="Enter tier description"
              />
            </Field>

            <Field
              label="Tier add-on price *"
              hint="Extra amount on top of the main service base price."
              error={errors.price}
            >
              <Input
                inputMode="decimal"
                value={pkg.price}
                onChange={(e) => onChange({ ...pkg, price: e.target.value.replace(/[^\d.]/g, "") })}
                placeholder="Enter tier add-on amount"
                aria-required
              />
            </Field>

            {pricePreview && pricePreview.sub && (
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">
                <span className="text-muted-foreground">Total listing price: </span>
                <span className="font-mono font-medium tabular-nums text-foreground">{pricePreview.main}</span>
                <span className="ml-1 font-mono text-muted-foreground">({pricePreview.sub})</span>
              </div>
            )}

            <Field label="Discount" hint="Optional — percentage or label.">
              <Input
                value={pkg.discount || ""}
                onChange={(e) => onChange({ ...pkg, discount: e.target.value })}
                placeholder="Enter discount"
              />
            </Field>

            <Field label="Validity" hint="How long the package can be redeemed.">
              <Input
                value={pkg.validity || ""}
                onChange={(e) => onChange({ ...pkg, validity: e.target.value })}
                placeholder="Enter validity period"
              />
            </Field>

            <Field label="Status">
              <Select
                value={pkg.status}
                onValueChange={(v: ServiceStatus) => onChange({ ...pkg, status: v })}
              >
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
          </section>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t bg-background/95 px-5 py-3 backdrop-blur">
          {isEdit && onDelete ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(pkg.id)}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => onSaveDraft(pkg)}>
              Save draft
            </Button>
            <Button onClick={() => onPublish(pkg)} className="gap-1.5">
              <CheckCircle2 className="size-4" />
              Publish
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
