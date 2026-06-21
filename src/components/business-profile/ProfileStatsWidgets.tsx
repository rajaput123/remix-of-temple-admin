import { Building2, FileCheck, FileEdit, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileStatsWidgetsProps {
  total: number;
  published: number;
  draft: number;
  pendingVerification: number;
}

const widgets = [
  { key: "total" as const, label: "Total Profiles", icon: Layers, tint: "bg-blue-50 text-blue-600" },
  { key: "published" as const, label: "Published Profiles", icon: Building2, tint: "bg-emerald-50 text-emerald-600" },
  { key: "draft" as const, label: "Draft Profiles", icon: FileEdit, tint: "bg-slate-50 text-slate-600" },
  { key: "pendingVerification" as const, label: "Pending Verification", icon: FileCheck, tint: "bg-amber-50 text-amber-600" },
];

export function ProfileStatsWidgets({ total, published, draft, pendingVerification }: ProfileStatsWidgetsProps) {
  const values = { total, published, draft, pendingVerification };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {widgets.map(({ key, label, icon: Icon, tint }) => (
        <Card key={key} className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${tint}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold tracking-tight">{values[key]}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
