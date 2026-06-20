import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Globe, ExternalLink, Palette, Layout, Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";

export default function BusinessWebsitePage() {
  const [subdomain, setSubdomain] = useState("shree-krishna");
  const [published, setPublished] = useState(true);
  const url = `${subdomain || "your-business"}.digidevalaya.com`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Website</h1>
          <p className="text-sm text-muted-foreground">Your auto-generated Digidevalaya website.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={published ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}>
            {published ? "Live" : "Offline"}
          </Badge>
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <a href={`https://${url}`} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Visit Site</a>
          </Button>
        </div>
      </div>

      {/* URL + visibility */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Website URL</Label>
            <div className="flex items-stretch overflow-hidden rounded-md border">
              <Input value={subdomain} onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="rounded-none border-0 focus-visible:ring-0" maxLength={40} />
              <span className="grid place-items-center bg-muted px-3 text-xs text-muted-foreground">.digidevalaya.com</span>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`https://${url}`); toast.success("Link copied"); }} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <Copy className="h-3 w-3" /> https://{url}
            </button>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Site Visibility</Label>
            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{published ? "Published" : "Draft"}</p>
                <p className="text-xs text-muted-foreground">{published ? "Visible to devotees & search engines" : "Only you can see this"}</p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customisation tiles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { icon: Layout, title: "Theme & Layout", desc: "Pick from 6 ready-made temple themes." },
          { icon: Palette, title: "Colors & Branding", desc: "Match your logo and brand colors." },
          { icon: Sparkles, title: "AI Content", desc: "Auto-generate sections from your profile." },
        ].map((t) => (
          <Card key={t.title} className="transition hover:border-primary/40 hover:shadow-sm">
            <CardContent className="p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><t.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{t.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
              <Button size="sm" variant="outline" className="mt-4">Customize</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live preview */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>
            <span className="ml-3 text-xs text-muted-foreground">{url}</span>
          </div>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardContent className="grid place-items-center bg-gradient-to-br from-primary/5 to-transparent p-12 text-center">
          <Globe className="mb-3 h-10 w-10 text-primary/60" />
          <h3 className="text-base font-semibold text-foreground">Live website preview</h3>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">Your public site is generated from your profile. Edit profile details to update content here automatically.</p>
        </CardContent>
      </Card>
    </div>
  );
}
