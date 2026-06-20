import { Link } from "react-router-dom";
import { BCHeader } from "@/components/business-connect/BCHeader";
import { BCFooter } from "@/components/business-connect/BCFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileCompletion } from "@/components/business-connect/ProfileCompletion";
import { VerificationBadge } from "@/components/business-connect/VerificationBadge";
import { bcStore, computeCompletion, useBCStore } from "@/stores/businessConnectStore";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Circle,
  Edit3,
  Upload,
  Image as ImageIcon,
  Globe2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function BCDashboard() {
  const state = useBCStore();
  const completion = computeCompletion(state);

  const checklist = [
    { id: "info", label: "Complete business information", done: !!state.info?.name },
    { id: "logo", label: "Upload logo", done: !!state.media?.logo },
    { id: "gallery", label: "Upload gallery", done: (state.media?.gallery?.length ?? 0) > 0 },
    {
      id: "desc",
      label: "Add business description",
      done: !!state.info?.description,
    },
    {
      id: "docs",
      label: "Verify documents",
      done:
        state.verification?.status === "verified" ||
        state.verification?.status === "review" ||
        (state.verification?.docs?.length ?? 0) > 0,
    },
    { id: "hours", label: "Configure business hours", done: false },
    { id: "publish", label: "Publish profile", done: state.profileStatus === "published" },
  ];

  function publish() {
    bcStore.set({ profileStatus: "pending" });
    toast.success("Profile submitted for review");
    setTimeout(() => {
      bcStore.set({ profileStatus: "published" });
      toast.success("Profile published!");
    }, 1800);
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <BCHeader showCta={false} />
      <main className="container mx-auto flex-1 px-4 py-6 md:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Welcome back{state.info?.ownerName ? `, ${state.info.ownerName.split(" ")[0]}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              Finish setting up your profile to maximise visibility.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/business-connect/profile">View profile</Link>
            </Button>
            <Button size="sm" onClick={publish} disabled={state.profileStatus === "published"}>
              {state.profileStatus === "published" ? "Published" : "Publish profile"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <ProfileCompletion value={completion} />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Profile completion
                </div>
                <div className="text-lg font-semibold">{completion}%</div>
                <div className="text-xs text-muted-foreground">
                  {completion < 100 ? "Keep going" : "All set"}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Verification
              </div>
              <VerificationBadge status={state.verification?.status ?? "pending"} />
              <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                <Link to="/business-connect/onboarding/verification">Manage documents</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Subscription
              </div>
              <div className="text-lg font-semibold capitalize">
                {state.subscription?.plan ?? "trial"}
              </div>
              <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                <Link to="/business-connect/onboarding/subscription">Change plan</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Globe2 className="h-3.5 w-3.5" /> Visibility
              </div>
              <Badge
                variant={state.profileStatus === "published" ? "default" : "secondary"}
                className="capitalize"
              >
                {state.profileStatus}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {state.profileStatus === "published"
                  ? "Visible in search"
                  : "Not yet visible to devotees"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Setup checklist</h2>
                <span className="text-xs text-muted-foreground">
                  {checklist.filter((c) => c.done).length}/{checklist.length} complete
                </span>
              </div>
              <ul className="divide-y">
                {checklist.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-2.5">
                    {item.done ? (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={item.done ? "text-muted-foreground line-through" : ""}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-5">
              <h2 className="font-semibold">Quick actions</h2>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/business-connect/profile">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit profile
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/business-connect/onboarding/verification">
                  <Upload className="mr-2 h-4 w-4" /> Upload documents
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/business-connect/onboarding/gallery">
                  <ImageIcon className="mr-2 h-4 w-4" /> Manage gallery
                </Link>
              </Button>
              <Button className="w-full" onClick={publish}>
                <Globe2 className="mr-2 h-4 w-4" /> Publish profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <BCFooter />
    </div>
  );
}
