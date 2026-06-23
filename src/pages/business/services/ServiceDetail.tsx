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
import { ServiceListingFormDialog } from "@/components/service-management/ServiceListingFormDialog";
import { ServiceDetailView } from "@/components/service-management/ServiceDetailView";
import {
  hasListingErrors,
  validateServiceListing,
  type ServiceListingFormErrors,
} from "@/components/service-management/serviceListingValidation";
import type { BusinessService } from "@/types/serviceManagement";
import { serviceManagementStore, useServiceManagementStore } from "@/stores/serviceManagementStore";

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { services } = useServiceManagementStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessService | null>(null);
  const [formErrors, setFormErrors] = useState<ServiceListingFormErrors>({});

  const service = services.find((s) => s.id === serviceId);

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setFormErrors({});
  };

  const openEdit = () => {
    if (!service) return;
    setFormErrors({});
    setEditing({
      ...service,
      customFields: service.customFields ?? [],
      addOns: service.addOns ?? [],
    });
    setFormOpen(true);
  };

  const saveDraft = (next: BusinessService) => {
    const errors = validateServiceListing(next, "draft");
    if (hasListingErrors(errors)) {
      setFormErrors(errors);
      toast.error("Enter a service name to save draft");
      return;
    }
    setFormErrors({});
    serviceManagementStore.upsertService({ ...next, status: "Draft" });
    closeForm();
    toast.success("Draft saved");
  };

  const publish = (next: BusinessService) => {
    const errors = validateServiceListing(next, "publish");
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
    serviceManagementStore.upsertService({ ...next, status: "Active" });
    closeForm();
    toast.success("Service updated");
  };

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
          <Button size="sm" className="gap-1.5" onClick={openEdit}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      <ServiceDetailView service={service} />

      <ServiceListingFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
          else setFormOpen(true);
        }}
        service={editing}
        errors={formErrors}
        onChange={setEditing}
        onErrorsChange={setFormErrors}
        onSaveDraft={saveDraft}
        onPublish={publish}
      />
    </div>
  );
}
