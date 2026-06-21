import { useId } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tint,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  tint: string;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", tint)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={cn("text-lg font-semibold text-foreground", valueClass)}>{value}</p>
          {sub && <p className="truncate text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionTitle({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  htmlFor?: string;
}

export function Field({ label, children, error, hint, htmlFor }: FieldProps) {
  const autoId = useId();
  const fieldId = htmlFor ?? autoId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div
        className={cn(
          error &&
            "[&_input]:border-destructive [&_input]:focus-visible:ring-destructive [&_textarea]:border-destructive [&_[role=combobox]]:border-destructive [&_[role=combobox]]:focus-visible:ring-destructive",
        )}
      >
        {children}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-[11px] text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function FieldGroupError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="text-[11px] text-destructive">
      {error}
    </p>
  );
}

export function InfoRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border bg-background p-3">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
