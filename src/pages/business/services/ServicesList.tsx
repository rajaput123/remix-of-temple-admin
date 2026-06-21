import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Download, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { WorkspacePage, WorkspaceStatusBar } from "@/components/workspace";
import { ServiceFormDrawer } from "@/components/service-management/ServiceFormDrawer";
import { ServicesEmptyState } from "@/components/service-management/ServicesEmptyState";
import { ServiceTable } from "@/components/service-management/ServiceTable";
import { BulkImportDialog } from "@/components/service-management/BulkImportDialog";
import { exportServicesCsv } from "@/components/service-management/csvUtils";
import {
  hasFormErrors,
  validateService,
  type ServiceFormErrors,
} from "@/components/service-management/validation";
import type { BusinessService } from "@/types/serviceManagement";
import {
  emptyService,
  serviceManagementStore,
  useServices,
} from "@/stores/serviceManagementStore";

const DRAFT_KEY = "digidevalaya-service-draft";

type QueueTab = "pending" | "in_review" | "all";

export default function ServicesListPage() {
  const navigate = useNavigate();
  const services = useServices();
  const [listTab, setListTab] = useState<QueueTab>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessService | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<ServiceFormErrors>({});
  const [importOpen, setImportOpen] = useState(false);

  const pendingCount = services.filter((s) => s.status === "Draft").length;
  const inReviewCount = services.filter((s) => s.status === "Inactive").length;

  const tabFiltered = useMemo(() => {
    if (listTab === "pending") return services.filter((s) => s.status === "Draft");
    if (listTab === "in_review") return services.filter((s) => s.status === "Inactive");
    return services;
  }, [services, listTab]);

  const draftServices = services.filter((s) => s.status === "Draft");
  const bottleneckLabel =
    draftServices[0]?.category || draftServices[0]?.name?.split(" ")[0] || "Draft services";

  const handleExport = () => {
    exportServicesCsv(services);
    toast.success("Services exported");
  };

  const handleBatchPublish = () => {
    const drafts = services.filter((s) => s.status === "Draft");
    if (drafts.length === 0) {
      toast.info("No pending services to publish");
      return;
    }
    drafts.forEach((s) => serviceManagementStore.setServiceStatus(s.id, "Active"));
    toast.success(`${drafts.length} service(s) published`);
  };

  const openAdd = () => {
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
    setDrawerOpen(true);
  };

  const openEdit = (service: BusinessService) => {
    setFormErrors({});
    setEditing({ ...service });
    setDrawerOpen(true);
  };

  const save = (service: BusinessService, status: BusinessService["status"]) => {
    const mode = status === "Active" ? "publish" : "draft";
    const errors = validateService(service, mode);
    if (hasFormErrors(errors)) {
      setFormErrors(errors);
      toast.error("Fix the highlighted fields to continue");
      return;
    }
    setFormErrors({});
    serviceManagementStore.upsertService({ ...service, status });
    localStorage.removeItem(DRAFT_KEY);
    setDrawerOpen(false);
    setEditing(null);
    toast.success(status === "Active" ? "Service published" : "Service saved as draft");
  };

  const hasAny = services.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Business Connect · Service Queue"
        title="Service Queue"
        description="Operational service listings awaiting decision"
        actions={
          hasAny ? (
            <>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={() => setImportOpen(true)}>
                <Upload className="size-3.5" /> Import
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={handleExport}>
                <Download className="size-3.5" /> Export
              </Button>
              <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={handleBatchPublish}>
                <CheckCheck className="size-3.5" /> Batch publish
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={openAdd}>
                <Plus className="size-3.5" /> Add
              </Button>
            </>
          ) : undefined
        }
        tabs={
          hasAny
            ? [
                { id: "pending", label: "Pending", count: pendingCount },
                { id: "in_review", label: "In review", count: inReviewCount },
                { id: "all", label: "All", count: services.length },
              ]
            : undefined
        }
        activeTab={listTab}
        onTabChange={(id) => setListTab(id as QueueTab)}
        statusBar={hasAny ? <WorkspaceStatusBar /> : undefined}
      >
        {!hasAny && (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <ServicesEmptyState onAdd={openAdd} onImport={() => setImportOpen(true)} />
          </div>
        )}

        {hasAny && (
          <ServiceTable
            services={tabFiltered}
            draftHighlight={
              pendingCount > 0 ? { count: pendingCount, label: bottleneckLabel } : undefined
            }
            onView={(s) => navigate(`/business-connect/services/${s.id}`)}
            onEdit={openEdit}
            onBulkDelete={setBulkDeleteIds}
            onBulkActivate={(ids) => {
              ids.forEach((id) => serviceManagementStore.setServiceStatus(id, "Active"));
              toast.success(`${ids.length} service(s) published`);
            }}
            onFilterDrafts={() => setListTab("pending")}
            emptyAction={
              <Button size="sm" className="h-9" onClick={openAdd}>
                Add service
              </Button>
            }
          />
        )}
      </WorkspacePage>

      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        kind="services"
        services={services}
        onImported={() => toast.success("Services imported")}
      />

      <ServiceFormDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) {
            setEditing(null);
            setFormErrors({});
          }
        }}
        service={editing}
        errors={formErrors}
        onChange={(s) => {
          setEditing(s);
          if (Object.keys(formErrors).length > 0) setFormErrors({});
          if (!s.id) {
            try {
              localStorage.setItem(DRAFT_KEY, JSON.stringify(s));
            } catch {
              /* ignore */
            }
          }
        }}
        onSaveDraft={(s) => save(s, "Draft")}
        onPublish={(s) => save(s, "Active")}
      />

      <AlertDialog open={bulkDeleteIds.length > 0} onOpenChange={(open) => !open && setBulkDeleteIds([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {bulkDeleteIds.length} service{bulkDeleteIds.length > 1 ? "s" : ""}?
            </AlertDialogTitle>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
    </div>
  );
}
