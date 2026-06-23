import { useState } from "react";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";
import { profileImageUrl } from "@/data/businessProfileMedia";

interface ProfileAvatarProps {
  src: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Shown when there is no image — typically owner or display name. */
  fallbackName?: string;
}

function initialsFromName(name?: string): string {
  if (!name?.trim()) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

const sizes = {
  sm: "h-20 w-20 rounded-xl border-4",
  md: "h-24 w-24 rounded-2xl border-4",
  lg: "h-28 w-28 rounded-2xl border-4",
};

export function ProfileAvatar({ src, alt, size = "md", className, fallbackName }: ProfileAvatarProps) {
  const [failed, setFailed] = useState(false);
  const url = profileImageUrl(failed ? null : src, profileImageUrl(null));
  const initials = initialsFromName(fallbackName || alt);

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden border-background bg-card shadow-lg",
        sizes[size],
        className,
      )}
    >
      {src && !failed ? (
        <img
          src={url}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : initials ? (
        <span
          className={cn(
            "font-semibold text-primary",
            size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl",
          )}
        >
          {initials}
        </span>
      ) : (
        <Building2 className={cn("text-primary", size === "sm" ? "h-9 w-9" : "h-10 w-10")} />
      )}
    </div>
  );
}

interface ProfileCoverProps {
  src: string | null;
  height?: "sm" | "md" | "lg" | "xl";
  children?: React.ReactNode;
  className?: string;
}

const heights = {
  sm: "h-32",
  md: "h-36",
  lg: "h-44",
  xl: "h-48 sm:h-56",
};

export function ProfileCover({ src, height = "md", children, className }: ProfileCoverProps) {
  const [failed, setFailed] = useState(false);
  const url = profileImageUrl(failed ? null : src);

  return (
    <div className={cn("relative w-full overflow-hidden bg-gradient-to-r from-primary/30 via-primary/15 to-primary/5", heights[height], className)}>
      {src && !failed && (
        <img
          src={url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      {children}
    </div>
  );
}

interface ProfileGalleryProps {
  images: string[];
  columns?: 2 | 3;
}

export function ProfileGallery({ images, columns = 3 }: ProfileGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className={cn("grid gap-3", columns === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2")}>
      {images.map((img, i) => (
        <GalleryImage key={`${img}-${i}`} src={img} featured={i === 0 && images.length > 1} />
      ))}
    </div>
  );
}

function GalleryImage({ src, featured }: { src: string; featured?: boolean }) {
  const [failed, setFailed] = useState(false);
  const url = profileImageUrl(failed ? null : src);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-muted/30 shadow-sm transition hover:shadow-md",
        featured ? "sm:col-span-1 sm:row-span-1 aspect-[4/3]" : "aspect-[4/3]",
      )}
    >
      <img
        src={url}
        alt=""
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        onError={() => setFailed(true)}
      />
      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl pointer-events-none" />
    </div>
  );
}
