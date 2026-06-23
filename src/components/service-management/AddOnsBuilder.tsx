import { useCallback, useRef, useState, type SyntheticEvent } from "react";
import { Inbox, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ServiceAddOn } from "@/types/serviceManagement";
import { AddOnDialog } from "./AddOnDialog";

function stopRowActivation(e: SyntheticEvent) {
  e.stopPropagation();
}

function addOnSecondary(addOn: ServiceAddOn) {
  const desc = addOn.description?.trim();
  if (!desc) return addOn.pricingType;
  const short = desc.slice(0, 56);
  return `${short}${desc.length > 56 ? "…" : ""}`;
}

function priceLabel(addOn: ServiceAddOn) {
  if (addOn.pricingType === "Contact For Pricing") return "—";
  return addOn.price?.trim() || "—";
}

interface AddOnsBuilderProps {
  addOns: ServiceAddOn[];
  onChange: (addOns: ServiceAddOn[]) => void;
}

export function AddOnsBuilder({ addOns, onChange }: AddOnsBuilderProps) {
  const addOnsRef = useRef(addOns);
  addOnsRef.current = addOns;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceAddOn | null>(null);

  const commit = useCallback(
    (next: ServiceAddOn[]) => {
      addOnsRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (addOn: ServiceAddOn) => {
    setEditing(addOn);
    setDialogOpen(true);
  };

  const remove = (id: string) => commit(addOnsRef.current.filter((a) => a.id !== id));

  const saveAddOn = (_serviceId: string, addOn: ServiceAddOn) => {
    const exists = addOnsRef.current.some((a) => a.id === addOn.id);
    if (exists) {
      commit(addOnsRef.current.map((a) => (a.id === addOn.id ? addOn : a)));
    } else {
      commit([...addOnsRef.current, addOn]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col overflow-x-auto" role="region" aria-label="Add-ons table">
        <Table variant="workspace" container={false} className="table-workspace min-w-[640px]">
          <colgroup>
            <col style={{ width: "42%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "5.5rem" }} />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-left">Add-on</TableHead>
              <TableHead className="text-left">Pricing</TableHead>
              <TableHead className="text-right">
                <div className="flex justify-end">Price</div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex justify-end">Actions</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addOns.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="p-0">
                  <div className="py-12 text-center">
                    <Inbox className="mx-auto size-8 text-muted-foreground/40" aria-hidden />
                    <p className="mt-3 text-sm font-medium text-foreground">No add-ons yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Offer extras like breakfast, pooja materials, or airport pickup.
                    </p>
                    <div className="mt-4">
                      <Button type="button" size="sm" className="h-8 gap-1.5 text-xs" onClick={openAdd}>
                        <Plus className="size-3.5" />
                        Add Add-On
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              addOns.map((addOn) => (
                <TableRow
                  key={addOn.id}
                  tabIndex={0}
                  className="group cursor-pointer"
                  onClick={() => openEdit(addOn)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      openEdit(addOn);
                    }
                  }}
                >
                  <TableCell className="max-w-0 overflow-hidden text-left">
                    <div className="min-w-0 space-y-0.5" title={`${addOn.name || "Untitled add-on"} · ${addOnSecondary(addOn)}`}>
                      <p className="cell-primary">{addOn.name || "Untitled add-on"}</p>
                      <p className="cell-secondary">{addOnSecondary(addOn)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-left text-muted-foreground">
                    {addOn.pricingType}
                  </TableCell>
                  <TableCell className="overflow-hidden text-right">
                    <p className="font-mono text-xs tabular-nums text-foreground">{priceLabel(addOn)}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={stopRowActivation}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => openEdit(addOn)}
                      >
                        <Pencil className="size-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        onClick={() => remove(addOn.id)}
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {addOns.length > 0 && (
        <Button type="button" variant="outline" size="sm" className="h-8 w-fit gap-1.5 text-xs" onClick={openAdd}>
          <Plus className="size-3.5" />
          Add Add-On
        </Button>
      )}

      <AddOnDialog open={dialogOpen} onOpenChange={setDialogOpen} addOn={editing} onSave={saveAddOn} />
    </div>
  );
}
