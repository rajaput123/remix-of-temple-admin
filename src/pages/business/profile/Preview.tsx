import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Mail, Globe, Clock, ShieldCheck, Image as ImageIcon, Edit3, Share2 } from "lucide-react";

export default function Preview() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile Preview</h1>
          <p className="text-sm text-muted-foreground">See exactly what devotees & customers will see.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/business/profile/information")}>
            <Edit3 className="h-4 w-4" /> Edit Profile
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button className="gap-2">Publish</Button>
        </div>
      </div>

      {/* Public profile preview */}
      <Card className="overflow-hidden">
        {/* Header / cover */}
        <div className="relative h-40 w-full bg-gradient-to-r from-primary/30 via-primary/15 to-primary/5" />
        <CardContent className="relative p-6">
          <div className="-mt-16 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl border-4 border-background bg-card shadow">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">Shree Krishna Pooja Services</h2>
                  <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Priest Services · 15+ years experience</p>
              </div>
            </div>
          </div>

          {/* About */}
          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              We offer authentic Vedic pooja services for homes, businesses and temples. Specialising in Satyanarayana Vratam, Griha Pravesh, and seasonal festivals across the region.
            </p>
          </section>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Contact */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +91 98765 43210</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> contact@krishnapooja.in</li>
                <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> krishnapooja.in</li>
              </ul>
            </section>

            {/* Address */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Address</h3>
              <p className="mt-3 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>5-12 Temple Street, Sri Nagar Colony,<br/>Hyderabad, Telangana — 500082</span>
              </p>
            </section>

            {/* Hours */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Business Hours</h3>
              <p className="mt-3 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" /> Mon – Sat · 06:00 AM to 08:00 PM
              </p>
            </section>

            {/* Gallery */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gallery</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex aspect-square items-center justify-center rounded-md border bg-muted/40">
                    <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
