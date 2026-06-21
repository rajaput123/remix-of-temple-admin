import { type ReactNode } from "react";
import { profileTypography as t } from "@/components/business-profile/profileStyles";
import { cn } from "@/lib/utils";

interface BusinessProfilePageProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Consistent page intro below tab navigation. */
export function BusinessProfilePage({ title, description, children }: BusinessProfilePageProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className={t.title}>{title}</h1>
        {description && <p className={cn("mt-1 max-w-2xl", t.desc)}>{description}</p>}
      </div>
      {children}
    </div>
  );
}
