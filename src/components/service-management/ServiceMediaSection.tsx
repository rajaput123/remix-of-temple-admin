import { useRef, useState } from "react";
import { ImageIcon, Link2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SectionTitle } from "./ui";
import { readImageFilesAsDataUrls } from "./serviceFormConstants";
import { toast } from "sonner";

interface ServiceMediaSectionProps {
  image?: string;
  gallery: string[];
  videoLinks: string[];
  onChange: (patch: { image?: string; gallery?: string[]; videoLinks?: string[] }) => void;
}

export function ServiceMediaSection({ image, gallery, videoLinks, onChange }: ServiceMediaSectionProps) {
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);

  const handleCoverUpload = async (files: FileList | null) => {
    if (!files?.[0]) return;
    try {
      const [url] = await readImageFilesAsDataUrls([files[0]]);
      onChange({ image: url });
      toast.success("Cover image uploaded");
    } catch {
      toast.error("Could not read image file");
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const urls = await readImageFilesAsDataUrls(files);
      onChange({ gallery: [...gallery, ...urls] });
      toast.success(`${urls.length} image(s) added to gallery`);
    } catch {
      toast.error("Could not read image files");
    }
  };

  return (
    <section className="space-y-3">
      <SectionTitle
        icon={ImageIcon}
        title="Photos & Videos"
        desc="Upload photos devotees see on the listing. Video links stay as URLs (YouTube, etc.)."
      />

      <div className="space-y-3 rounded-lg border border-dashed p-4">
        <p className="text-xs font-medium text-foreground">Cover photo</p>
        {image ? (
          <div className="relative overflow-hidden rounded-lg border">
            <img src={image} alt="Cover preview" className="aspect-video w-full object-cover" />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute right-2 top-2 h-8"
              onClick={() => onChange({ image: "" })}
            >
              <Trash2 className="size-3.5" /> Remove
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center transition hover:bg-muted/50"
          >
            <Upload className="size-6 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Upload cover photo</span>
            <span className="text-xs text-muted-foreground">JPG, PNG or WebP · shown as the main listing image</span>
          </button>
        )}
        <input
          ref={coverRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            handleCoverUpload(e.target.files);
            e.target.value = "";
          }}
        />
        {!image && (
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setShowUrlFallback((v) => !v)}>
            <Link2 className="size-3.5" />
            {showUrlFallback ? "Hide URL option" : "Or paste image URL"}
          </Button>
        )}
        {showUrlFallback && !image && (
          <Field label="Image URL" hint="Use only if you already host the image online.">
            <Input
              value={image || ""}
              onChange={(e) => onChange({ image: e.target.value })}
              placeholder="Enter image URL"
            />
          </Field>
        )}
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-foreground">Gallery ({gallery.length})</p>
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => galleryRef.current?.click()}>
            <Upload className="size-3.5" /> Upload images
          </Button>
        </div>
        <input
          ref={galleryRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            handleGalleryUpload(e.target.files);
            e.target.value = "";
          }}
        />
        {gallery.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {gallery.map((src, i) => (
              <div key={`${src.slice(0, 24)}-${i}`} className="group relative aspect-square overflow-hidden rounded-md border">
                <img src={src} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded bg-background/90 p-1 opacity-0 shadow transition group-hover:opacity-100"
                  onClick={() => onChange({ gallery: gallery.filter((_, idx) => idx !== i) })}
                  aria-label="Remove image"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Optional extra photos — upload multiple at once.</p>
        )}
      </div>

      <Field label="Video links" hint="One YouTube or video URL per line. Upload not supported for video.">
        <Textarea
          rows={2}
          value={videoLinks.join("\n")}
          onChange={(e) =>
            onChange({ videoLinks: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })
          }
          placeholder="Enter video URL (one per line)"
        />
      </Field>
    </section>
  );
}
