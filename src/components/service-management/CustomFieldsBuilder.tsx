import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ServiceCustomField } from "@/types/serviceManagement";
import { normalizeCustomField } from "./customFieldUtils";
import { CustomFieldDialog } from "./CustomFieldDialog";

interface CustomFieldsBuilderProps {
  fields: ServiceCustomField[];
  onChange: (fields: ServiceCustomField[]) => void;
}

export function CustomFieldsBuilder({ fields, onChange }: CustomFieldsBuilderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceCustomField | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (field: ServiceCustomField) => {
    setEditing(field);
    setDialogOpen(true);
  };

  const remove = (id: string) => onChange(fields.filter((f) => f.id !== id));

  const saveField = (field: ServiceCustomField) => {
    const normalized = normalizeCustomField(field);
    const exists = fields.some((f) => f.id === normalized.id);
    if (exists) {
      onChange(fields.map((f) => (f.id === normalized.id ? normalized : f)));
    } else {
      onChange([...fields, normalized]);
    }
  };

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
          No custom fields yet. Add fields like room capacity, guest count, or pickup location.
        </p>
      ) : (
        <ul className="space-y-2">
          {fields.map((field) => (
            <li
              key={field.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-muted/10 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{field.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    {field.type}
                  </Badge>
                  {field.required && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      Required
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(field)}>
                  <Pencil className="size-3.5" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => remove(field.id)}
                >
                  <Trash2 className="size-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button type="button" variant="outline" className="gap-2" onClick={openAdd}>
        <Plus className="size-4" />
        Add Custom Field
      </Button>

      <CustomFieldDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        field={editing}
        onSave={saveField}
      />
    </div>
  );
}
