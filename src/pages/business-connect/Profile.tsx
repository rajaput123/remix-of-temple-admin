import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/business-connect/VerificationBadge";
import { bcStore, useBCStore } from "@/stores/businessConnectStore";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { Edit3, Globe2, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { WorkspacePage } from "@/components/workspace";
import { profileTypography as t } from "@/components/business-profile/profileStyles";
import { cn } from "@/lib/utils";

export default function BCProfile() {
  const s = useBCStore();
  const type = BUSINESS_TYPES.find((t) => t.id === s.businessType?.category);

  function publish() {
    bcStore.set({ profileStatus: "pending" });
    toast.success("Profile submitted for review");
    setTimeout(() => {
      bcStore.set({ profileStatus: "published" });
      toast.success("Profile published!");
    }, 1800);
  }

  return (
    <WorkspacePage
      eyebrow="Business Connect · Profile"
      title={s.info?.name ?? "Your business"}
      description="Manage your public marketplace profile"
      bleed={false}
      className="max-w-5xl"
      actions={
        <>
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
            <Link to="/business-connect/onboarding/business">
              <Edit3 className="size-3.5" /> Edit
            </Link>
          </Button>
          <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={publish}>
            <Globe2 className="size-3.5" /> Publish
          </Button>
        </>
      }
    >
    <div className="space-y-6 px-4 pb-6 sm:px-6">
      <Card className="overflow-hidden">
        <div
          className="h-32 w-full bg-gradient-to-r from-primary/40 to-primary/10"
          style={
            s.media?.cover
              ? { backgroundImage: `url(${s.media.cover})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        />
        <CardContent className="relative p-5">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl border-4 border-background bg-card">
                {s.media?.logo ? (
                  <img src={s.media.logo} alt="" className="h-full w-full object-cover" />
                ) : type ? (
                  <type.icon className="h-8 w-8 text-primary" />
                ) : null}
              </div>
              <div>
                <p className={t.muted}>Business type & status</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {type && <Badge variant="secondary">{type.label}</Badge>}
                  {s.businessType?.subcategory && (
                    <Badge variant="outline">{s.businessType.subcategory}</Badge>
                  )}
                  <VerificationBadge status={s.verification?.status ?? "pending"} />
                  <Badge variant={s.profileStatus === "published" ? "default" : "secondary"} className="capitalize">
                    {s.profileStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="about">
        <TabsList className="flex h-9 w-full flex-wrap justify-start gap-6 rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent px-0 text-[12px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary">About</TabsTrigger>
          <TabsTrigger value="contact" className="rounded-none border-b-2 border-transparent px-0 text-[12px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary">Contact</TabsTrigger>
          <TabsTrigger value="location" className="rounded-none border-b-2 border-transparent px-0 text-[12px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary">Location</TabsTrigger>
          <TabsTrigger value="languages" className="rounded-none border-b-2 border-transparent px-0 text-[12px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary">Languages</TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-none border-b-2 border-transparent px-0 text-[12px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary">Gallery</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent px-0 text-[12px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary">Documents</TabsTrigger>
          <TabsTrigger value="subscription" className="rounded-none border-b-2 border-transparent px-0 text-[12px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <Card>
            <CardContent className="space-y-2 p-5">
              <h2 className={t.section}>About</h2>
              <p className="text-sm text-muted-foreground">
                {s.info?.description ?? "No description added yet."}
              </p>
              {s.info?.experience && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Experience: </span>
                  {s.info.experience} years
                </div>
              )}
              <EditLink to="/business-connect/onboarding/business" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardContent className="space-y-2 p-5">
              <h2 className={t.section}>Contact</h2>
              <Row icon={Phone} label="Phone" value={s.info?.phone} />
              <Row icon={Phone} label="WhatsApp" value={s.info?.whatsapp} />
              <Row icon={Mail} label="Email" value={s.info?.email} />
              <EditLink to="/business-connect/onboarding/business" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardContent className="space-y-2 p-5">
              <h2 className={t.section}>Location & service reach</h2>
              <Row
                icon={MapPin}
                label="Address"
                value={[s.location?.line1, s.location?.city, s.location?.state, s.location?.pincode]
                  .filter(Boolean)
                  .join(", ")}
              />
              <Row icon={Globe2} label="Service reach" value={s.location?.reach} />
              <EditLink to="/business-connect/onboarding/location" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages">
          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className={t.section}>Languages</h2>
              <div className="flex flex-wrap gap-1.5">
                {(s.comms?.languages ?? []).map((l) => (
                  <Badge key={l} variant="secondary">
                    {l}
                  </Badge>
                ))}
                {(!s.comms || s.comms.languages.length === 0) && (
                  <span className="text-sm text-muted-foreground">No languages added.</span>
                )}
              </div>
              <h3 className={cn(t.section, "pt-2")}>Communication channels</h3>
              <div className="flex flex-wrap gap-1.5">
                {(s.comms?.channels ?? []).map((c) => (
                  <Badge key={c} variant="outline">
                    {c}
                  </Badge>
                ))}
              </div>
              <EditLink to="/business-connect/onboarding/location" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className={t.section}>Gallery</h2>
              {(s.media?.gallery?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No photos uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {s.media!.gallery.map((url, i) => (
                    <img key={i} src={url} alt="" className="h-28 w-full rounded-md border object-cover" />
                  ))}
                </div>
              )}
              <EditLink to="/business-connect/onboarding/plan" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <h2 className={t.section}>Verification documents</h2>
                <VerificationBadge status={s.verification?.status ?? "pending"} />
              </div>
              {(s.verification?.docs?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {s.verification!.docs.map((d, i) => (
                    <li key={i} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span className="capitalize">{d.type.replace("_", " ")}</span>
                      <span className="text-xs text-muted-foreground">{d.name}</span>
                    </li>
                  ))}
                </ul>
              )}
              <EditLink to="/business-connect/onboarding/verification" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className={t.section}>Subscription</h2>
              <div className="text-sm">
                <span className="text-muted-foreground">Current plan: </span>
                <span className="font-semibold capitalize">
                  {s.subscription?.plan ?? "trial"}
                </span>
              </div>
              <EditLink to="/business-connect/onboarding/plan" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </WorkspacePage>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}

function EditLink({ to }: { to: string }) {
  return (
    <Button asChild variant="link" size="sm" className="h-auto p-0">
      <Link to={to}>
        <Edit3 className="mr-1 h-3 w-3" /> Edit
      </Link>
    </Button>
  );
}
