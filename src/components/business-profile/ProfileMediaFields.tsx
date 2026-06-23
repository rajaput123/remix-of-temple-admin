import { useRef, useState } from "react";
import { Building2, ImageIcon, Link2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/service-management/ui";
import { isValidImageSource } from "@/components/service-management/imageUrlUtils";
import { readImageFilesAsDataUrls } from "@/components/service-management/serviceFormConstants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LogoFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  hint?: string;
}

export function LogoField({
  value,
  onChange,
  label = "Business logo",
  hint = "Square PNG or JPG — shown on your profile card",
}: LogoFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState("");

  const applyUrl = () => {
    const v = urlDraft.trim();
    if (!v) return;
    if (!isValidImageSource(v)) {
      toast.error("Enter a valid image link");
      return;
    }
    onChange(v);
    setUrlDraft("");
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.[0]) return;
    try {
      const [url] = await readImageFilesAsDataUrls([files[0]]);
      onChange(url);
      setUrlDraft("");
      toast.success("Logo added");
    } catch {
      toast.error("Could not read image file");
    }
  };

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2 rounded-lg border bg-muted/10 p-2">
        <div
          className={cn(
            "grid size-14 shrink-0 overflow-hidden rounded-lg border bg-muted/40",
            value ? "" : "place-items-center text-muted-foreground",
          )}
        >
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <Building2 className="size-5" />
          )}
        </div>
        <Input
          value={value ? "" : urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
          placeholder={value ? "Logo added — remove to replace" : "Paste image URL"}
          className="h-9 min-w-0 flex-1 text-xs"
          disabled={Boolean(value)}
        />
        {!value && (
          <>
            <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-2.5 text-xs" onClick={applyUrl}>
              <Link2 className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 gap-1 px-2.5 text-xs"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-3.5" />
              Upload
            </Button>
          </>
        )}
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 shrink-0 p-0 text-destructive hover:text-destructive"
            onClick={() => onChange(null)}
            aria-label="Remove logo"
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
      </div>
    </Field>
  );
}

interface CoverFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function CoverField({ value, onChange }: CoverFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState("");

  const applyUrl = () => {
    const v = urlDraft.trim();
    if (!v) return;
    if (!isValidImageSource(v)) {
      toast.error("Enter a valid image link");
      return;
    }
    onChange(v);
    setUrlDraft("");
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.[0]) return;
    try {
      const [url] = await readImageFilesAsDataUrls([files[0]]);
      onChange(url);
      setUrlDraft("");
      toast.success("Cover image added");
    } catch {
      toast.error("Could not read image file");
    }
  };

  return (
    <Field label="Cover image" hint="Wide banner — 1600×600 recommended">
      <div className="space-y-2">
        {value && (
          <div className="overflow-hidden rounded-lg border bg-muted/20">
            <img src={value} alt="" className="aspect-[21/9] w-full object-cover" />
          </div>
        )}
        <div className="flex items-center gap-2 rounded-lg border bg-muted/10 p-2">
          <div
            className={cn(
              "grid size-11 shrink-0 overflow-hidden rounded-md border bg-muted/40",
              value ? "" : "place-items-center text-muted-foreground",
            )}
          >
            {value ? (
              <img src={value} alt="" className="size-full object-cover" />
            ) : (
              <ImageIcon className="size-4" />
            )}
          </div>
          <Input
            value={value ? "" : urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
            placeholder={value ? "Cover added — remove to replace" : "Paste image URL"}
            className="h-9 min-w-0 flex-1 text-xs"
            disabled={Boolean(value)}
          />
          {!value && (
            <>
              <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-2.5 text-xs" onClick={applyUrl}>
                <Link2 className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 gap-1 px-2.5 text-xs"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Upload
              </Button>
            </>
          )}
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 shrink-0 p-0 text-destructive hover:text-destructive"
              onClick={() => onChange(null)}
              aria-label="Remove cover"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
        </div>
      </div>
    </Field>
  );
}

interface GalleryFieldProps {
  links: string[];
  onChange: (links: string[]) => void;
}

export function GalleryField({ links, onChange }: GalleryFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [localError, setLocalError] = useState("");

  const addUrl = () => {
    const v = urlDraft.trim();
    if (!v) return;
    if (!isValidImageSource(v)) {
      setLocalError("Enter a valid image link");
      return;
    }
    if (links.includes(v)) {
      setLocalError("This link is already added");
      return;
    }
    onChange([...links, v]);
    setUrlDraft("");
    setLocalError("");
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const urls = await readImageFilesAsDataUrls(files);
      const merged = [...links];
      for (const url of urls) {
        if (!merged.includes(url)) merged.push(url);
      }
      onChange(merged.slice(0, 8));
      toast.success(`${urls.length} image(s) added`);
    } catch {
      toast.error("Could not read image files");
    }
  };

  const remove = (index: number) => onChange(links.filter((_, i) => i !== index));

  return (
    <Field
      label="Gallery"
      error={localError}
      hint="Optional — up to 8 photos via link or upload"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            value={urlDraft}
            onChange={(e) => {
              setUrlDraft(e.target.value);
              if (localError) setLocalError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
            placeholder="Paste image URL"
            className="h-9 min-w-0 flex-1 text-xs"
          />
          <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-2.5 text-xs" onClick={addUrl}>
            <Link2 className="mr-1 size-3.5" />
            Add
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1 px-2.5 text-xs"
            onClick={() => fileRef.current?.click()}
            disabled={links.length >= 8}
          >
            <Upload className="size-3.5" />
            Upload
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>

        {links.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {links.map((url, index) => (
              <div key={`${url.slice(0, 24)}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/20">
                <img src={url} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute right-1 top-1 grid size-5 place-items-center rounded-full border bg-background text-destructive shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <Trash2 className="size-2.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 px-4 py-8 text-center">
            <ImageIcon className="size-6 text-muted-foreground/50" />
            <p className="mt-2 text-xs text-muted-foreground">No gallery images yet</p>
          </div>
        )}
      </div>
    </Field>
  );
}
