import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Inbox, Pencil, Plus, Search, Layers, Trash2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FilterStrip, WorkspacePage, WorkspaceStatusBar, WorkspaceTable, type WorkspaceColumnDef } from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import { AddOnDialog } from "@/components/service-management/AddOnDialog";
import type { BusinessService, ServiceAddOn } from "@/types/serviceManagement";
import { serviceManagementStore, useServices } from "@/stores/serviceManagementStore";

function parsePrice(val?: string | null): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function formatPrice(val: number): string {
  if (val <= 0) return "—";
  return `₹${val.toLocaleString("en-IN")}`;
}

export default function AddOnsPage() {
  const [searchParams] = useSearchParams();
  const presetServiceId = searchParams.get("serviceId") ?? "";
  
  const services = useServices();
  const addOns = useMemo(() => {
    return services.flatMap((s) => (s.addOns ?? []).map((a) => ({ ...a, serviceId: s.id })));
  }, [services]);

  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<(ServiceAddOn & { serviceId?: string }) | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<(ServiceAddOn & { serviceId?: string }) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ serviceId: string; addOnId: string } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const serviceNameById = useMemo(
    () => new Map(services.map((s) => [s.id, s.name])),
    [services]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return addOns.filter((a) => {
      const matchSearch =
        !q ||
        (a.name || "").toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q));
      const matchService = serviceFilter === "all" || a.serviceId === serviceFilter;
      return matchSearch && matchService;
    });
  }, [addOns, search, serviceFilter]);

  const columns: WorkspaceColumnDef<ServiceAddOn & { serviceId: string }>[] = [
    {
      id: "name",
      header: "Add-on",
      colStyle: { width: "40%" },
      className: "text-left max-w-0 overflow-hidden",
      cell: (addOn) => {
        return (
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <p className="cell-primary font-medium">{addOn.name}</p>
              {addOn.linkedServiceIds && addOn.linkedServiceIds.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-medium bg-primary/10 text-primary hover:bg-primary/15 border-transparent gap-0.5 shrink-0">
                  <Link2 className="size-2" /> Linked Service ({addOn.linkedServiceIds.length})
                </Badge>
              )}
            </div>
            {addOn.description && (
              <p className="cell-secondary truncate">{addOn.description}</p>
            )}
          </div>
        );
      }
    },
    {
      id: "mainService",
      header: "Main Service",
      colStyle: { width: "40%" },
      className: "text-left max-w-0 overflow-hidden",
      cell: (addOn) => {
        const serviceName = serviceNameById.get(addOn.serviceId) ?? "—";
        return (
          <span className="truncate text-sm text-muted-foreground" title={serviceName}>
            {serviceName}
          </span>
        );
      }
    },
    {
      id: "pricingType",
      header: "Pricing Type",
      colStyle: { width: "10%" },
      className: "text-left text-sm text-muted-foreground",
      cell: (addOn) => addOn.pricingType
    },
    {
      id: "totalPrice",
      header: "Total Price",
      colStyle: { width: "10%" },
      headerClassName: "text-right",
      className: "text-right",
      cell: (addOn) => {
        const mainService = services.find((s) => s.id === addOn.serviceId);
        const basePriceVal = parsePrice(mainService?.price);
        const addOnPriceVal = parsePrice(addOn.price);
        const totalSumVal = basePriceVal + addOnPriceVal;
        const totalPriceStr = formatPrice(totalSumVal);
        return (
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-xs font-semibold text-foreground">
              {totalPriceStr}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Add-on: {addOn.price || "—"}
            </span>
          </div>
        );
      }
    }
  ];

  const hasAny = addOns.length > 0;

  const openAdd = () => {
    setEditing(presetServiceId ? { id: "", name: "", pricingType: "Fixed Price", price: "", serviceId: presetServiceId } : null);
    setDialogOpen(true);
  };

  const openEdit = (addOn: ServiceAddOn & { serviceId?: string }) => {
    setEditing({ ...addOn });
    setDialogOpen(true);
  };

  const openView = (addOn: ServiceAddOn & { serviceId?: string }) => {
    setViewing({ ...addOn });
    setViewOpen(true);
  };

  const handleSave = (serviceId: string, addOn: ServiceAddOn) => {
    // If the serviceId changed from editing.serviceId, delete it from the old one first
    if (editing?.serviceId && editing.serviceId !== serviceId) {
      serviceManagementStore.deleteAddOn(editing.serviceId, addOn.id);
    }
    
    serviceManagementStore.upsertAddOn(serviceId, addOn);
    toast.success(editing?.id ? "Add-on updated" : "Add-on created");
    setDialogOpen(false);
    setEditing(null);
  };

  const handleBulkDelete = () => {
    selected.forEach((key) => {
      const [serviceId, addOnId] = key.split(":");
      serviceManagementStore.deleteAddOn(serviceId, addOnId);
    });
    toast.success(`${selected.size} add-on(s) deleted`);
    setSelected(new Set());
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Business Connect · Add-ons"
        title="Add-ons"
        description="Optional extras or customizable options that customers can add to their bookings."
        statusBar={hasAny ? <WorkspaceStatusBar /> : undefined}
        actions={
          hasAny ? (
            <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={openAdd}>
              <Plus className="size-3.5" /> Add Add-on
            </Button>
          ) : undefined
        }
      >
        {!hasAny && (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <div className="py-16 text-center max-w-sm">
              <Inbox className="mx-auto size-10 text-muted-foreground/40" />
              <p className="mt-4 text-sm font-medium text-foreground">No add-ons yet</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Create add-ons like premium seating, pooja materials, flower garlands, or custom packages.
              </p>
              <div className="mt-6">
                <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={openAdd}>
                  <Plus className="size-3.5" /> Add Add-on
                </Button>
              </div>
            </div>
          </div>
        )}

        {hasAny && (
          <>
            <FilterStrip>
              <div className="relative w-64 shrink-0">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search add-ons…"
                  className="h-7 pl-8 text-xs"
                />
              </div>

              <Select
                value={serviceFilter}
                onValueChange={(val) => {
                  setServiceFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-7 w-auto min-w-[150px] text-xs">
                  <Layers className="mr-1.5 size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selected.size === 1 && (() => {
                const selectedList = Array.from(selected);
                const [selServiceId, selAddOnId] = selectedList[0].split(":");
                const targetAddOn = addOns.find((a) => a.id === selAddOnId && a.serviceId === selServiceId);
                if (!targetAddOn) return null;
                return (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs text-foreground"
                      onClick={() => openEdit(targetAddOn)}
                    >
                      <Pencil className="size-3.5" />
                      Edit Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/5"
                      onClick={() => setDeleteTarget({ serviceId: selServiceId, addOnId: selAddOnId })}
                    >
                      <Trash2 className="size-3.5" />
                      Delete Selected
                    </Button>
                  </div>
                );
              })()}

              {selected.size > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/5"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="size-3.5" />
                  Delete selected ({selected.size})
                </Button>
              )}
            </FilterStrip>

            <WorkspaceTable
              data={filtered}
              columns={columns}
              rowIdKey={(a) => `${a.serviceId}:${a.id}`}
              selectedIds={selected}
              onSelectionChange={setSelected}
              page={page}
              onPageChange={setPage}
              pageSize={WORKSPACE_PAGE_SIZE}
              onRowClick={openView}
              emptyTitle="No add-ons match your filters"
              emptyDescription="Try adjusting search or service filter."
              minWidth="min-w-[800px]"
              ariaLabel="Add-ons table"
            />
          </>
        )}
      </WorkspacePage>

      <AddOnDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        addOn={editing}
        services={services}
        onSave={handleSave}
      />

      <ViewAddOnDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        addOn={viewing}
        serviceName={viewing ? (serviceNameById.get(viewing.serviceId ?? "") ?? "—") : "—"}
        allServices={services}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this add-on?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This add-on will be removed from its main service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  serviceManagementStore.deleteAddOn(deleteTarget.serviceId, deleteTarget.addOnId);
                  toast.success("Add-on deleted");
                  setDeleteTarget(null);
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

interface ViewAddOnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addOn: (ServiceAddOn & { serviceId?: string }) | null;
  serviceName: string;
  allServices: BusinessService[];
}

export function ViewAddOnDialog({ open, onOpenChange, addOn, serviceName, allServices }: ViewAddOnDialogProps) {
  if (!addOn) return null;

  const linkedServices = allServices.filter((s) => addOn.linkedServiceIds?.includes(s.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader className="border-b px-5 py-4 text-left shrink-0">
          <DialogTitle className="text-base font-semibold text-foreground">Add-on Details</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Review the configuration and details for this add-on.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5 overflow-y-auto flex-1 text-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Main Service</span>
            <p className="font-medium text-foreground">{serviceName}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Add-on Name</span>
            <p className="font-medium text-foreground break-words">{addOn.name}</p>
          </div>

          {addOn.description && (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Description</span>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed break-words">{addOn.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Pricing Type</span>
              <p className="font-medium text-foreground">{addOn.pricingType}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Price</span>
              <p className="font-mono font-medium text-foreground">{addOn.price || "—"}</p>
            </div>
          </div>

          {linkedServices.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Pricing Breakdown</span>
              <div className="border rounded-md divide-y bg-muted/10 overflow-hidden">
                {linkedServices.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link2 className="size-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground truncate" title={s.name}>{s.name}</span>
                    </div>
                    <span className="font-mono text-muted-foreground shrink-0">{s.price ? `₹${s.price}` : "Contact For Pricing"}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-2.5 bg-muted/20 text-xs font-semibold">
                  <span>Total Sum Price</span>
                  <span className="font-mono text-primary">{addOn.price || "—"}</span>
                </div>
              </div>
            </div>
          )}

          {(() => {
            const mainService = allServices.find((s) => s.id === addOn.serviceId);
            const basePriceVal = parsePrice(mainService?.price);
            const addOnPriceVal = parsePrice(addOn.price);
            const totalSumVal = basePriceVal + addOnPriceVal;
            const totalPriceStr = formatPrice(totalSumVal);
            
            return (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Booking Total Details</span>
                <div className="border rounded-md divide-y bg-primary/5 border-primary/20 overflow-hidden">
                  <div className="flex items-center justify-between p-2.5 text-xs">
                    <span className="font-medium text-muted-foreground">Base Service Price ({serviceName})</span>
                    <span className="font-mono font-medium text-foreground">{mainService?.price ? formatPrice(parsePrice(mainService.price)) : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 text-xs">
                    <span className="font-medium text-muted-foreground">Add-on Price ({addOn.name})</span>
                    <span className="font-mono font-medium text-foreground">{addOn.price || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-primary/10 text-xs font-semibold">
                    <span className="text-primary font-semibold">Total Price</span>
                    <span className="font-mono text-primary text-sm font-bold">{totalPriceStr}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        <DialogFooter className="border-t px-5 py-3 sm:justify-end shrink-0 bg-background">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
