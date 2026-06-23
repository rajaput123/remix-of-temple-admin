import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, Plus, Search, SlidersHorizontal } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FilterStrip, WorkspacePage, WorkspaceStatusBar } from "@/components/workspace";
import { ServiceListingFormDialog } from "@/components/service-management/ServiceListingFormDialog";
import { ServicesEmptyState } from "@/components/service-management/ServicesEmptyState";
import { ServiceTable } from "@/components/service-management/ServiceTable";
import { ServiceCard } from "@/components/service-management/ServiceCard";
import {
  hasListingErrors,
  validateServiceListing,
  type ServiceListingFormErrors,
} from "@/components/service-management/serviceListingValidation";
import type { BusinessService } from "@/types/serviceManagement";
import { SERVICE_LISTING_CATEGORIES } from "@/types/serviceManagement";
import {
  emptyService,
  serviceManagementStore,
  useServices,
} from "@/stores/serviceManagementStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "digidevalaya-service-listing-draft";

type ViewMode = "card" | "table";

export default function ServicesListPage() {
  const navigate = useNavigate();
  const services = useServices();
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessService | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<ServiceListingFormErrors>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchCategory = categoryFilter === "all" || s.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [services, search, statusFilter, categoryFilter]);

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setFormErrors({});
  };

  const openCreate = () => {
    setFormErrors({});
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        setEditing(JSON.parse(raw) as BusinessService);
        toast.info("Draft restored");
      } else {
        setEditing(emptyService());
      }
    } catch {
      setEditing(emptyService());
    }
    setFormOpen(true);
  };

  const openEdit = (service: BusinessService) => {
    setFormErrors({});
    setEditing({ ...service, customFields: service.customFields ?? [], addOns: service.addOns ?? [] });
    setFormOpen(true);
  };

  const saveDraft = (service: BusinessService) => {
    const errors = validateServiceListing(service, "draft");
    if (hasListingErrors(errors)) {
      setFormErrors(errors);
      toast.error("Enter a service name to save draft");
      return;
    }
    setFormErrors({});
    serviceManagementStore.upsertService({ ...service, status: "Draft" });
    localStorage.removeItem(DRAFT_KEY);
    closeForm();
    toast.success("Draft saved");
  };

  const publish = (service: BusinessService) => {
    const errors = validateServiceListing(service, "publish");
    if (hasListingErrors(errors)) {
      setFormErrors(errors);
      if (errors.price) {
        toast.error(errors.price);
      } else if (errors.discount) {
        toast.error(errors.discount);
      } else {
        toast.error("Fix the highlighted fields to publish");
      }
      return;
    }
    setFormErrors({});
    serviceManagementStore.upsertService({ ...service, status: "Active" });
    localStorage.removeItem(DRAFT_KEY);
    closeForm();
    toast.success("Service published");
  };

  const hasAny = services.length > 0;
  const draftServices = services.filter((s) => s.status === "Draft");
  const draftHighlight =
    draftServices.length > 0
      ? { count: draftServices.length, label: draftServices[0]?.name || "Draft services" }
      : undefined;

  const viewToggle = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("h-7 px-2", view === "table" && "bg-muted")}
        onClick={() => setView("table")}
        aria-label="Table view"
      >
        <List className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("h-7 px-2", view === "card" && "bg-muted")}
        onClick={() => setView("card")}
        aria-label="Card view"
      >
        <LayoutGrid className="size-4" />
      </Button>
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Business Connect · Service Listings"
        title="Service Listings"
        description="Add what you sell, set pricing, and start receiving enquiries and bookings."
        statusBar={hasAny ? <WorkspaceStatusBar /> : undefined}
        actions={
          hasAny ? (
            <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={openCreate}>
              <Plus className="size-3.5" /> Create Service
            </Button>
          ) : undefined
        }
      >
        {!hasAny && (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <ServicesEmptyState onAdd={openCreate} />
          </div>
        )}

        {hasAny && view === "table" ? (
          <ServiceTable
            services={services}
            draftHighlight={draftHighlight}
            filterActions={viewToggle}
            onView={(s) => navigate(`/business-connect/services/${s.id}`)}
            onEdit={openEdit}
            onBulkDelete={setBulkDeleteIds}
            onBulkActivate={(ids) => {
              ids.forEach((id) => serviceManagementStore.setServiceStatus(id, "Active"));
              toast.success(`${ids.length} service(s) published`);
            }}
            emptyAction={
              <Button size="sm" className="h-9" onClick={openCreate}>
                Create Service
              </Button>
            }
          />
        ) : hasAny ? (
          <>
            <FilterStrip>
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services…"
                  className="h-7 pl-8 text-xs"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-7 w-[130px] text-xs">
                  <SlidersHorizontal className="mr-1.5 size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-7 w-[160px] text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {SERVICE_LISTING_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto flex shrink-0 items-center gap-1 border-l border-border pl-2">
                {viewToggle}
              </div>
            </FilterStrip>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
                <p className="text-sm font-medium text-foreground">No services match your filters</p>
                <p className="text-xs text-muted-foreground">Try adjusting search or filters.</p>
              </div>
            ) : (
              <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onView={() => navigate(`/business-connect/services/${service.id}`)}
                    onEdit={() => openEdit(service)}
                    onDelete={() => setDeleteTarget(service)}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </WorkspacePage>

      <ServiceListingFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
        service={editing}
        errors={formErrors}
        onChange={(s) => {
          setEditing(s);
          if (!s.id) {
            try {
              localStorage.setItem(DRAFT_KEY, JSON.stringify(s));
            } catch {
              /* ignore */
            }
          }
        }}
        onErrorsChange={setFormErrors}
        onSaveDraft={saveDraft}
        onPublish={publish}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name ? `"${deleteTarget.name}" will be removed permanently.` : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  serviceManagementStore.deleteService(deleteTarget.id);
                  toast.success("Service deleted");
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteIds.length > 0} onOpenChange={(open) => !open && setBulkDeleteIds([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {bulkDeleteIds.length} service(s)?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                bulkDeleteIds.forEach((id) => serviceManagementStore.deleteService(id));
                toast.success(`${bulkDeleteIds.length} service(s) deleted`);
                setBulkDeleteIds([]);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
