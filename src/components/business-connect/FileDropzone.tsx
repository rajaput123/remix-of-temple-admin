import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";

interface Props {
  multiple?: boolean;
  accept?: string;
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  max?: number;
}

export function FileDropzone({
  multiple,
  accept = "image/*,application/pdf",
  label,
  hint,
  values,
  onChange,
  max = 10,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).slice(0, max - values.length);
    Promise.all(
      arr.map(
        (f) =>
          new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result));
            r.readAsDataURL(f);
          }),
      ),
    ).then((urls) => onChange(multiple ? [...values, ...urls] : urls.slice(0, 1)));
  }

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium">{label}</span>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-3 py-3 text-center text-[10px] text-muted-foreground transition hover:border-primary hover:bg-primary/5",
          drag && "border-primary bg-primary/10",
        )}
      >
        <Upload className="h-4 w-4" />
        <div>
          <span className="font-medium text-foreground">Click to upload</span> or drag & drop
        </div>
        <div className="text-[10px]">Stored locally in this demo.</div>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
          {values.map((url, i) => (
            <div key={i} className="group relative overflow-hidden rounded-md border bg-muted">
              {url.startsWith("data:image") ? (
                <img src={url} alt="" className="h-14 w-full object-cover" />
              ) : (
                <div className="grid h-14 w-full place-items-center text-[10px] text-muted-foreground">
                  File
                </div>
              )}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-background/90 opacity-0 shadow group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
