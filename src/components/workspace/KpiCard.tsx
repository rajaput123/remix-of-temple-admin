import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiAccent = "primary" | "success" | "warning" | "destructive" | "muted";

const accentBar: Record<KpiAccent, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground/40",
};

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: KpiAccent;
  className?: string;
}

export function KpiCard({ label, value, sub, accent = "primary", className }: KpiCardProps) {
  return (
    <Card className={cn("relative overflow-hidden border-border shadow-none", className)}>
      <div className={cn("absolute bottom-0 left-0 top-0 w-1", accentBar[accent])} aria-hidden />
      <CardContent className="p-4 pl-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-[22px] font-semibold tabular-nums leading-tight text-foreground">{value}</p>
        {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
