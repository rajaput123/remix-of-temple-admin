import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/service-management/ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProfileLanguagesFieldProps {
  languages: string[];
  onChange: (languages: string[]) => void;
}

export function ProfileLanguagesField({ languages, onChange }: ProfileLanguagesFieldProps) {
  const [draft, setDraft] = useState("");

  const addLanguage = () => {
    const value = draft.trim();
    if (!value) return;
    if (languages.some((l) => l.toLowerCase() === value.toLowerCase())) {
      toast.error("This language is already added");
      return;
    }
    onChange([...languages, value]);
    setDraft("");
  };

  const removeLanguage = (lang: string) => onChange(languages.filter((l) => l !== lang));

  return (
    <Field label="Languages" hint="Add each language you use with customers">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
            placeholder="e.g. Kannada, English, Hindi"
            className="h-9 text-sm"
          />
          <Button type="button" size="sm" className="h-9 shrink-0 gap-1.5 px-3" onClick={addLanguage}>
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>

        {languages.length > 0 ? (
          <ul className="space-y-2">
            {languages.map((lang) => (
              <li
                key={lang}
                className="flex items-center justify-between gap-3 rounded-lg border bg-muted/10 px-3 py-2"
              >
                <span className="text-sm font-medium text-foreground">{lang}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 shrink-0 p-0 text-destructive hover:text-destructive"
                  onClick={() => removeLanguage(lang)}
                  aria-label={`Remove ${lang}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={cn("rounded-lg border border-dashed bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground")}>
            No languages added yet. Type a language and click Add.
          </p>
        )}
      </div>
    </Field>
  );
}
