import { useState } from "react";
import { IndianRupee, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { PricingRule } from "@/types/serviceManagement";
import { serviceManagementStore, useServiceManagementStore } from "@/stores/serviceManagementStore";
import { Field, SectionTitle } from "@/components/service-management/ui";

function emptyRule(): PricingRule {
  return {
    id: "",
    name: "",
    basePrice: "",
    discountType: "percent",
    discountValue: "",
    seasonalPricing: "",
    festivalPricing: "",
    effectiveDate: "",
    expiryDate: "",
    updatedAt: "",
  };
}

export default function PricingPage() {
  const { pricingRules, services } = useServiceManagementStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PricingRule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setEditing(emptyRule());
    setDrawerOpen(true);
  };

  const openEdit = (rule: PricingRule) => {
    setEditing({ ...rule });
    setDrawerOpen(true);
  };

  const save = (rule: PricingRule) => {
    if (!rule.name.trim()) return toast.error("Rule name is required");
    if (!rule.basePrice.trim()) return toast.error("Base price is required");
    serviceManagementStore.upsertPricingRule(rule);
    setDrawerOpen(false);
    setEditing(null);
    toast.success("Pricing rule saved");
  };

  const serviceName = (id?: string) => services.find((s) => s.id === id)?.name || "All services";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pricing</h1>
          <p className="text-sm text-muted-foreground">
            Centralized pricing rules with seasonal and festival adjustments.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Pricing Rule
        </Button>
      </div>

      {pricingRules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="grid place-items-center py-16 text-center">
            <IndianRupee className="h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No Pricing Rules</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Define base prices, discounts, and seasonal pricing for your services.
            </p>
            <Button onClick={openAdd} className="mt-4 gap-1.5">
              <Plus className="h-4 w-4" /> Add Pricing Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead className="hidden sm:table-cell">Service</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead className="hidden md:table-cell">Discount</TableHead>
                <TableHead className="hidden lg:table-cell">Effective</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {serviceName(rule.serviceId)}
                  </TableCell>
                  <TableCell>₹{rule.basePrice}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {rule.discountValue
                      ? rule.discountType === "percent"
                        ? `${rule.discountValue}%`
                        : `₹${rule.discountValue}`
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {rule.effectiveDate || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(rule)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => setDeleteId(rule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={drawerOpen} onOpenChange={(o) => { setDrawerOpen(o); if (!o) setEditing(null); }}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle>{editing?.id ? "Edit Pricing Rule" : "Add Pricing Rule"}</SheetTitle>
            <SheetDescription>Configure base price, discounts, and seasonal pricing.</SheetDescription>
          </SheetHeader>
          {editing && (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <Field label="Rule Name *">
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </Field>
                <Field label="Service">
                  <Select
                    value={editing.serviceId || "all"}
                    onValueChange={(v) => setEditing({ ...editing, serviceId: v === "all" ? undefined : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All services</SelectItem>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Base Price *">
                  <Input value={editing.basePrice} onChange={(e) => setEditing({ ...editing, basePrice: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Discount Type">
                    <Select
                      value={editing.discountType || "percent"}
                      onValueChange={(v: "percent" | "flat") => setEditing({ ...editing, discountType: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percent</SelectItem>
                        <SelectItem value="flat">Flat Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Discount Value">
                    <Input
                      value={editing.discountValue || ""}
                      onChange={(e) => setEditing({ ...editing, discountValue: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Seasonal Pricing">
                  <Input
                    value={editing.seasonalPricing || ""}
                    onChange={(e) => setEditing({ ...editing, seasonalPricing: e.target.value })}
                    placeholder="e.g. 5500"
                  />
                </Field>
                <Field label="Festival Pricing">
                  <Input
                    value={editing.festivalPricing || ""}
                    onChange={(e) => setEditing({ ...editing, festivalPricing: e.target.value })}
                    placeholder="e.g. 6500"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Effective Date">
                    <Input type="date" value={editing.effectiveDate || ""} onChange={(e) => setEditing({ ...editing, effectiveDate: e.target.value })} />
                  </Field>
                  <Field label="Expiry Date">
                    <Input type="date" value={editing.expiryDate || ""} onChange={(e) => setEditing({ ...editing, expiryDate: e.target.value })} />
                  </Field>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t px-5 py-3">
                <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
                <Button onClick={() => save(editing)}>Save Rule</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this pricing rule?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                if (deleteId) {
                  serviceManagementStore.deletePricingRule(deleteId);
                  toast.success("Pricing rule deleted");
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
