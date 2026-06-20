import { Link } from "react-router-dom";
import { BCHeader } from "@/components/business-connect/BCHeader";
import { BCFooter } from "@/components/business-connect/BCFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/business-connect/VerificationBadge";
import { bcStore, useBCStore } from "@/stores/businessConnectStore";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { Edit3, Globe2, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

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
    <div className="flex min-h-screen flex-col bg-muted/30">
      <BCHeader showCta={false} />
      <main className="container mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:py-10">
        {/* Preview header */}
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
                  <h1 className="text-xl font-bold md:text-2xl">{s.info?.name ?? "Your business"}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/business-connect/onboarding/info">
                    <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit
                  </Link>
                </Button>
                <Button size="sm" onClick={publish}>
                  <Globe2 className="mr-1 h-3.5 w-3.5" /> Publish
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="about" className="mt-6">
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card>
              <CardContent className="space-y-2 p-5">
                <h2 className="font-semibold">About</h2>
                <p className="text-sm text-muted-foreground">
                  {s.info?.description ?? "No description added yet."}
                </p>
                {s.info?.experience && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Experience: </span>
                    {s.info.experience} years
                  </div>
                )}
                <EditLink to="/business-connect/onboarding/info" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardContent className="space-y-2 p-5">
                <h2 className="font-semibold">Contact</h2>
                <Row icon={Phone} label="Phone" value={s.info?.phone} />
                <Row icon={Phone} label="WhatsApp" value={s.info?.whatsapp} />
                <Row icon={Mail} label="Email" value={s.info?.email} />
                <EditLink to="/business-connect/onboarding/info" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardContent className="space-y-2 p-5">
                <h2 className="font-semibold">Location & service reach</h2>
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
                <h2 className="font-semibold">Languages</h2>
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
                <h3 className="pt-2 font-semibold">Communication channels</h3>
                <div className="flex flex-wrap gap-1.5">
                  {(s.comms?.channels ?? []).map((c) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))}
                </div>
                <EditLink to="/business-connect/onboarding/languages" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardContent className="space-y-3 p-5">
                <h2 className="font-semibold">Gallery</h2>
                {(s.media?.gallery?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">No photos uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {s.media!.gallery.map((url, i) => (
                      <img key={i} src={url} alt="" className="h-28 w-full rounded-md border object-cover" />
                    ))}
                  </div>
                )}
                <EditLink to="/business-connect/onboarding/gallery" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Verification documents</h2>
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
                <h2 className="font-semibold">Subscription</h2>
                <div className="text-sm">
                  <span className="text-muted-foreground">Current plan: </span>
                  <span className="font-semibold capitalize">
                    {s.subscription?.plan ?? "trial"}
                  </span>
                </div>
                <EditLink to="/business-connect/onboarding/subscription" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <BCFooter />
    </div>
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
