import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { PackageFormDrawer } from "@/components/service-management/PackageFormDrawer";
import { PackageTable } from "@/components/service-management/PackageTable";
import { PackagesEmptyState } from "@/components/service-management/PackagesEmptyState";
import { BulkImportDialog } from "@/components/service-management/BulkImportDialog";
import { exportPackagesCsv } from "@/components/service-management/csvUtils";
import {
  emptyPackage,
  hasFormErrors,
  validatePackage,
  type PackageFormErrors,
} from "@/components/service-management/validation";
import type { ServicePackage, ServiceStatus } from "@/types/serviceManagement";
import {
  serviceManagementStore,
  usePackages,
  useServices,
} from "@/stores/serviceManagementStore";

type QueueTab = "pending" | "in_review" | "all";

export default function PackagesPage() {
  const [searchParams] = useSearchParams();
  const presetServiceId = searchParams.get("serviceId") ?? "";
  const packages = usePackages();
  const services = useServices();
  const [listTab, setListTab] = useState<QueueTab>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ServicePackage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<PackageFormErrors>({});
  const [importOpen, setImportOpen] = useState(false);
  const [lockPrimaryId, setLockPrimaryId] = useState<string | undefined>();

  const pendingCount = packages.filter((p) => p.status === "Draft").length;
  const inReviewCount = packages.filter((p) => p.status === "Inactive").length;

  const tabFiltered = useMemo(() => {
    if (listTab === "pending") return packages.filter((p) => p.status === "Draft");
    if (listTab === "in_review") return packages.filter((p) => p.status === "Inactive");
    return packages;
  }, [packages, listTab]);

  const draftPackages = packages.filter((p) => p.status === "Draft");
  const bottleneckLabel = draftPackages[0]?.name?.split(" ")[0] || "Draft packages";

  const openAdd = (primaryServiceId = presetServiceId) => {
    setFormErrors({});
    setLockPrimaryId(primaryServiceId || undefined);
    setEditing(emptyPackage(primaryServiceId));
    setDrawerOpen(true);
  };

  const openEdit = (pkg: ServicePackage) => {
    setFormErrors({});
    setLockPrimaryId(undefined);
    setEditing({ ...pkg });
    setDrawerOpen(true);
  };

  const save = (pkg: ServicePackage, status: ServiceStatus) => {
    const mode = status === "Active" ? "publish" : "draft";
    const errors = validatePackage(pkg, mode);
    if (hasFormErrors(errors)) {
      setFormErrors(errors);
      toast.error("Fix the highlighted fields to continue");
      return;
    }
    setFormErrors({});
    serviceManagementStore.upsertPackage({ ...pkg, status });
    setDrawerOpen(false);
    setEditing(null);
    toast.success(status === "Active" ? "Package published" : "Package saved");
  };

  const handleExport = () => {
    exportPackagesCsv(packages, services);
    toast.success("Packages exported");
  };

  const handleBatchPublish = () => {
    const drafts = packages.filter((p) => p.status === "Draft");
    if (drafts.length === 0) {
      toast.info("No pending packages to publish");
      return;
    }
    drafts.forEach((p) => serviceManagementStore.setPackageStatus(p.id, "Active"));
    toast.success(`${drafts.length} package(s) published`);
  };

  const hasAny = packages.length > 0;

  useEffect(() => {
    if (!presetServiceId || !services.some((s) => s.id === presetServiceId)) return;
    openAdd(presetServiceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once when deep-linking from service detail
  }, [presetServiceId, services.length]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Business Connect · Package Queue"
        title="Package Queue"
        description="Extra tiers for main services — add Complete, Premium, or bundled options."
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
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={() => openAdd()}>
                <Plus className="size-3.5" /> Add tier
              </Button>
            </>
          ) : undefined
        }
        tabs={
          hasAny
            ? [
                { id: "pending", label: "Pending", count: pendingCount },
                { id: "in_review", label: "In review", count: inReviewCount },
                { id: "all", label: "All", count: packages.length },
              ]
            : undefined
        }
        activeTab={listTab}
        onTabChange={(id) => setListTab(id as QueueTab)}
        statusBar={hasAny ? <WorkspaceStatusBar /> : undefined}
      >
        {!hasAny && (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <PackagesEmptyState onAdd={() => openAdd()} onImport={() => setImportOpen(true)} />
          </div>
        )}

        {hasAny && (
          <PackageTable
            packages={tabFiltered}
            services={services}
            draftHighlight={
              pendingCount > 0 ? { count: pendingCount, label: bottleneckLabel } : undefined
            }
            onEdit={openEdit}
            onBulkDelete={setBulkDeleteIds}
            onBulkActivate={(ids) => {
              ids.forEach((id) => serviceManagementStore.setPackageStatus(id, "Active"));
              toast.success(`${ids.length} package(s) published`);
            }}
            onFilterDrafts={() => setListTab("pending")}
            emptyAction={
              <Button size="sm" className="h-9" onClick={() => openAdd()}>
                Add package tier
              </Button>
            }
          />
        )}
      </WorkspacePage>

      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        kind="packages"
        services={services}
        onImported={() => toast.success("Packages imported")}
      />

      <PackageFormDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) {
            setEditing(null);
            setFormErrors({});
            setLockPrimaryId(undefined);
          }
        }}
        pkg={editing}
        services={services}
        errors={formErrors}
        lockPrimaryServiceId={lockPrimaryId}
        onChange={(pkg) => {
          setEditing(pkg);
          if (Object.keys(formErrors).length > 0) setFormErrors({});
        }}
        onSaveDraft={(pkg) => save(pkg, "Draft")}
        onPublish={(pkg) => save(pkg, "Active")}
        onDelete={(id) => setDeleteId(id)}
      />

      <AlertDialog open={bulkDeleteIds.length > 0} onOpenChange={(o) => !o && setBulkDeleteIds([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {bulkDeleteIds.length} package{bulkDeleteIds.length > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                bulkDeleteIds.forEach((id) => serviceManagementStore.deletePackage(id));
                toast.success(`${bulkDeleteIds.length} package(s) deleted`);
                setBulkDeleteIds([]);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this package?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  serviceManagementStore.deletePackage(deleteId);
                  toast.success("Package deleted");
                  setDeleteId(null);
                  setDrawerOpen(false);
                  setEditing(null);
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
