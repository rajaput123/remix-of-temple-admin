import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, ShieldCheck, Clock, AlertCircle, FileCheck2 } from "lucide-react";

const status = "pending" as "not_submitted" | "pending" | "verified" | "rejected";

const statusMeta = {
  not_submitted: { label: "Not Submitted", icon: AlertCircle, className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending Review", icon: Clock, className: "bg-amber-100 text-amber-800" },
  verified: { label: "Verified", icon: ShieldCheck, className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejected", icon: AlertCircle, className: "bg-red-100 text-red-800" },
};

function DocUpload({ label, hint, optional }: { label: string; hint: string; optional?: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {label} {optional && <span className="text-xs text-muted-foreground">(optional)</span>}
          </p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
          <Upload className="h-3.5 w-3.5" /> Upload
        </Button>
      </div>
    </div>
  );
}

export default function Verification() {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Verification</h1>
          <p className="text-sm text-muted-foreground">Build trust with devotees by verifying your identity.</p>
        </div>
        <Badge className={`gap-1.5 px-3 py-1.5 text-sm ${meta.className}`} variant="secondary">
          <Icon className="h-4 w-4" /> {meta.label}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Identity Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Aadhaar Number</Label>
            <Input placeholder="XXXX XXXX XXXX" />
          </div>
          <div className="space-y-1.5">
            <Label>PAN Number</Label>
            <Input placeholder="ABCDE1234F" />
          </div>
          <div className="space-y-1.5">
            <Label>GST Number <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input placeholder="22ABCDE1234F1Z5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileCheck2 className="h-4 w-4 text-primary" /> Document Uploads</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <DocUpload label="Aadhaar Copy" hint="PDF / JPG, max 5 MB" />
          <DocUpload label="PAN Copy" hint="PDF / JPG, max 5 MB" />
          <DocUpload label="GST Certificate" hint="PDF, max 5 MB" optional />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="gap-2"><ShieldCheck className="h-4 w-4" /> Submit for Verification</Button>
      </div>
    </div>
  );
}
