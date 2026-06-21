import { type ReactNode } from "react";

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
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
