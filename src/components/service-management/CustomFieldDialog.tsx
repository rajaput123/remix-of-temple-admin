import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { CustomFieldType, ServiceCustomField } from "@/types/serviceManagement";
import {
  CUSTOM_FIELD_TYPES,
  customFieldNeedsOptions,
  validateCustomFieldDraft,
} from "./customFieldUtils";
import { SERVICE_LISTING_PLACEHOLDERS } from "./serviceListingPlaceholders";
import { Field } from "./ui";

function emptyField(): ServiceCustomField {
  return {
    id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    type: "Text",
    required: false,
    options: [],
  };
}

interface CustomFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field?: ServiceCustomField | null;
  onSave: (field: ServiceCustomField) => void;
}

export function CustomFieldDialog({ open, onOpenChange, field, onSave }: CustomFieldDialogProps) {
  const [draft, setDraft] = useState<ServiceCustomField>(emptyField());
  const [nameError, setNameError] = useState("");
  const [optionsError, setOptionsError] = useState("");

  const isEdit = Boolean(field);
  const showOptions = customFieldNeedsOptions(draft.type);

  useEffect(() => {
    if (!open) return;
    setDraft(field ? { ...field, options: field.options ?? [] } : emptyField());
    setNameError("");
    setOptionsError("");
  }, [open, field]);

  const set = (patch: Partial<ServiceCustomField>) => setDraft((d) => ({ ...d, ...patch }));

  const handleTypeChange = (type: CustomFieldType) => {
    if (customFieldNeedsOptions(type)) {
      set({ type, options: draft.options ?? [] });
    } else {
      set({ type, options: undefined });
      setOptionsError("");
    }
  };

  const handleSave = () => {
    const normalized = {
      ...draft,
      name: draft.name.trim(),
      options: showOptions ? (draft.options ?? []).map((o) => o.trim()).filter(Boolean) : undefined,
    };
    const errors = validateCustomFieldDraft(normalized);

    setNameError(errors.name ?? "");
    setOptionsError(errors.options ?? "");
    if (errors.name || errors.options) return;

    onSave(normalized);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle className="text-base">{isEdit ? "Edit custom field" : "Add custom field"}</DialogTitle>
          <DialogDescription className="text-xs">
            e.g. Guest count, room capacity, or pickup location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <Field label="Field name *" error={nameError}>
            <Input
              value={draft.name}
              onChange={(e) => {
                set({ name: e.target.value });
                if (nameError) setNameError("");
              }}
              placeholder={SERVICE_LISTING_PLACEHOLDERS.customFieldName}
            />
          </Field>

          <Field label="Field type">
            <Select value={draft.type} onValueChange={(v) => handleTypeChange(v as CustomFieldType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUSTOM_FIELD_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {showOptions && (
            <Field label="Options (comma separated) *" error={optionsError}>
              <Input
                value={(draft.options ?? []).join(", ")}
                onChange={(e) => {
                  set({
                    options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  });
                  if (optionsError) setOptionsError("");
                }}
                placeholder={SERVICE_LISTING_PLACEHOLDERS.customFieldOptions}
              />
            </Field>
          )}

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={draft.required}
              onCheckedChange={(c) => set({ required: c === true })}
            />
            Required field
          </label>
        </div>

        <DialogFooter className="border-t px-5 py-3 sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {isEdit ? "Save field" : "Add field"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
