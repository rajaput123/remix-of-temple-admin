import { useRef, useState } from "react";
import { ImageIcon, Link2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readImageFilesAsDataUrls } from "./serviceFormConstants";
import { isValidImageSource } from "./imageUrlUtils";
import { SERVICE_LISTING_PLACEHOLDERS } from "./serviceListingPlaceholders";
import { Field } from "./ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CoverImageFieldProps {
  value?: string;
  error?: string;
  onChange: (value: string) => void;
}

export function CoverImageField({ value, error, onChange }: CoverImageFieldProps) {
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
      toast.success("Image added");
    } catch {
      toast.error("Could not read image file");
    }
  };

  return (
    <Field label="Service image" error={error} hint="Optional cover photo for your listing">
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
          placeholder={value ? "Image added — remove to replace" : SERVICE_LISTING_PLACEHOLDERS.coverImageUrl}
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
            onClick={() => onChange("")}
            aria-label="Remove image"
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
      </div>
    </Field>
  );
}

interface GalleryImagesFieldProps {
  links: string[];
  error?: string;
  onChange: (links: string[]) => void;
}

export function GalleryImagesField({ links, error, onChange }: GalleryImagesFieldProps) {
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
      onChange(merged);
      toast.success(`${urls.length} image(s) added`);
    } catch {
      toast.error("Could not read image files");
    }
  };

  const remove = (index: number) => onChange(links.filter((_, i) => i !== index));

  const displayError = error || localError;

  return (
    <Field
      label="Gallery images"
      error={displayError}
      hint="Optional — add multiple photos via link or upload"
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
            placeholder={SERVICE_LISTING_PLACEHOLDERS.galleryImageUrl}
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

        {links.length > 0 && (
          <div className="flex flex-wrap gap-1.5 rounded-md border bg-muted/10 p-2">
            {links.map((url, index) => (
              <div key={`${url.slice(0, 24)}-${index}`} className="group relative size-11 shrink-0">
                <img src={url} alt="" className="size-full rounded-md border object-cover" />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full border bg-background text-destructive shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <Trash2 className="size-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Field>
  );
}
