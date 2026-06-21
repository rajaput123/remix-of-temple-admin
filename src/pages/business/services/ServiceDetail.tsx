import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ServiceFormDrawer } from "@/components/service-management/ServiceFormDrawer";
import { ServiceDetailView } from "@/components/service-management/ServiceDetailView";
import type { BusinessService } from "@/types/serviceManagement";
import { serviceManagementStore, useServiceManagementStore } from "@/stores/serviceManagementStore";

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { services } = useServiceManagementStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessService | null>(null);

  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-4 sm:px-6">
        <Button variant="ghost" className="gap-1.5" onClick={() => navigate("/business-connect/services/list")}>
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Button>
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">Service not found.</CardContent>
        </Card>
      </div>
    );
  }

  const save = (next: BusinessService, status: BusinessService["status"]) => {
    if (!next.name.trim() || !next.category || !next.description.trim()) {
      toast.error("Please fill required fields");
      return;
    }
    serviceManagementStore.upsertService({ ...next, status });
    setDrawerOpen(false);
    setEditing(null);
    toast.success("Service updated");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" className="gap-1.5" onClick={() => navigate("/business-connect/services/list")}>
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Button>
        <div className="flex flex-wrap gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this service?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => {
                    serviceManagementStore.deleteService(service.id);
                    toast.success("Service deleted");
                    navigate("/business-connect/services/list");
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditing({ ...service });
              setDrawerOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      <ServiceDetailView service={service} />

      <ServiceFormDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setEditing(null);
        }}
        service={editing}
        onChange={setEditing}
        onSaveDraft={(s) => save(s, "Draft")}
        onPublish={(s) => save(s, "Active")}
      />
    </div>
  );
}
