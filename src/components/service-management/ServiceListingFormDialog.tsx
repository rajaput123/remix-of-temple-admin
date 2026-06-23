import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BusinessService } from "@/types/serviceManagement";
import { ServiceListingForm } from "./ServiceListingForm";
import type { ServiceListingFormErrors } from "./serviceListingValidation";

interface ServiceListingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: BusinessService | null;
  errors?: ServiceListingFormErrors;
  onChange: (service: BusinessService) => void;
  onErrorsChange?: (errors: ServiceListingFormErrors) => void;
  onSaveDraft: (service: BusinessService) => void;
  onPublish: (service: BusinessService) => void;
}

export function ServiceListingFormDialog({
  open,
  onOpenChange,
  service,
  errors,
  onChange,
  onErrorsChange,
  onSaveDraft,
  onPublish,
}: ServiceListingFormDialogProps) {
  if (!service) return null;

  const isEdit = !!service.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl [&>button]:right-4 [&>button]:top-4">
        <DialogHeader className="shrink-0 border-b px-5 py-4 text-left">
          <DialogTitle className="text-base">{isEdit ? "Edit Service" : "Create Service"}</DialogTitle>
          <DialogDescription className="text-xs">
            Required fields are marked with *. Switch tabs to complete all sections.
          </DialogDescription>
        </DialogHeader>

        <ServiceListingForm
          service={service}
          errors={errors}
          onChange={onChange}
          onErrorsChange={onErrorsChange}
          onCancel={() => onOpenChange(false)}
          onSaveDraft={onSaveDraft}
          onPublish={onPublish}
        />
      </DialogContent>
    </Dialog>
  );
}
