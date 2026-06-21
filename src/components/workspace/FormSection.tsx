import { cn } from "@/lib/utils";

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("form-section", className)}>
      <div className="space-y-1 pb-1">
        <h3 className="form-section-title">{title}</h3>
        {description && <p className="form-section-desc">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
