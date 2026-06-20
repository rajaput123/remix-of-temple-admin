import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, ShieldCheck, Clock, Crown, CheckCircle2, AlertCircle, Plus } from "lucide-react";

// Mock profile state — replace with store
const profile = {
  exists: true,
  completion: 72,
  verification: "pending" as "verified" | "pending" | "not_submitted" | "rejected",
  status: "draft" as "draft" | "pending" | "published",
  plan: "Prarambh",
  updatedAt: "18 Jun 2026, 14:32",
};

const statusMap = {
  draft: { label: "Draft", className: "bg-muted text-foreground" },
  pending: { label: "Pending Review", className: "bg-amber-100 text-amber-800" },
  published: { label: "Published", className: "bg-emerald-100 text-emerald-800" },
};

const verifMap = {
  not_submitted: { label: "Not Submitted", icon: AlertCircle, className: "text-muted-foreground" },
  pending: { label: "Pending Review", icon: Clock, className: "text-amber-600" },
  verified: { label: "Verified", icon: CheckCircle2, className: "text-emerald-600" },
  rejected: { label: "Rejected", icon: AlertCircle, className: "text-destructive" },
};

const checklist = [
  { label: "Business Name", done: true },
  { label: "Business Type", done: true },
  { label: "Owner Name", done: true },
  { label: "Mobile Number", done: true },
  { label: "Email", done: true },
  { label: "Address", done: true },
  { label: "About Business", done: false },
  { label: "Business Logo", done: false },
];

export default function Overview() {
  const navigate = useNavigate();

  if (!profile.exists) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
              <Building2 className="h-10 w-10" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-foreground">Create Your Business Profile</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Set up your business profile to become visible on Digidevalaya and connect with devotees.
            </p>
            <Button onClick={() => navigate("/business/profile/information")} className="mt-6 gap-2">
              <Plus className="h-4 w-4" /> Create Business Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusMap[profile.status];
  const Verif = verifMap[profile.verification];
  const VIcon = Verif.icon;
  const publishReady = checklist.every((c) => c.done);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground">Track your profile status and completeness.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/business/profile/preview")}>Preview</Button>
          <Button disabled={!publishReady} onClick={() => navigate("/business/profile/information")}>
            {publishReady ? "Publish Profile" : "Complete to Publish"}
          </Button>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{profile.completion}%</div>
            <Progress value={profile.completion} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-2 text-base font-semibold ${Verif.className}`}>
              <VIcon className="h-5 w-5" />
              {Verif.label}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Aadhaar & PAN required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Profile Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`text-sm ${status.className}`} variant="secondary">{status.label}</Badge>
            <p className="mt-3 text-xs text-muted-foreground">Last updated {profile.updatedAt}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Crown className="h-5 w-5 text-amber-500" />
              {profile.plan}
            </div>
            <Button variant="link" className="mt-2 h-auto p-0 text-xs" onClick={() => navigate("/pricing")}>
              Upgrade plan →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Publish checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publish Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {checklist.map((c) => (
              <div key={c.label} className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm">
                {c.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={c.done ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
              </div>
            ))}
          </div>
          {!publishReady && (
            <p className="mt-4 text-xs text-muted-foreground">
              Complete all required fields to enable the <span className="font-medium">Publish</span> button.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
