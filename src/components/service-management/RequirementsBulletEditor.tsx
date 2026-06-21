import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "./ui";
import { ClipboardList } from "lucide-react";
import { parseRequirementBullets, serializeRequirementBullets } from "./serviceFormConstants";

interface RequirementsBulletEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RequirementsBulletEditor({ value, onChange }: RequirementsBulletEditorProps) {
  const items = parseRequirementBullets(value);
  const rows = items.length === 0 ? [""] : items;

  const updateRow = (index: number, text: string) => {
    const next = [...rows];
    next[index] = text;
    onChange(serializeRequirementBullets(next));
  };

  const addRow = () => onChange(serializeRequirementBullets([...rows, ""]));

  const removeRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(serializeRequirementBullets(next.length ? next : [""]));
  };

  return (
    <section className="space-y-3">
      <SectionTitle
        icon={ClipboardList}
        title="What devotees must provide"
        desc="Each line becomes a bullet on the listing — e.g. address, preferred date, guest count."
      />
      <ul className="space-y-2">
        {rows.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="w-4 shrink-0 text-center text-sm text-muted-foreground" aria-hidden>
              •
            </span>
            <Input
              value={item}
              onChange={(e) => updateRow(index, e.target.value)}
              placeholder="Enter requirement"
              className="flex-1"
            />
            {rows.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeRow(index)}
                aria-label="Remove requirement"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={addRow}>
        <Plus className="size-3.5" /> Add requirement
      </Button>
    </section>
  );
}
