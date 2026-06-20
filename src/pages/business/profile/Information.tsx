import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Building2, User, MapPin, Globe, Clock } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 pt-5 md:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

export default function Information() {
  const [days, setDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);

  const toggleDay = (d: string) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Business Information</h1>
        <p className="text-sm text-muted-foreground">Capture complete business details. Saved automatically as draft.</p>
      </div>

      <SectionCard icon={Building2} title="Basic Information">
        <Field label="Business Name" required><Input placeholder="e.g. Shree Krishna Pooja Services" /></Field>
        <Field label="Business Type" required>
          <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="priest">Priest Services</SelectItem>
              <SelectItem value="flowers">Flowers & Garlands</SelectItem>
              <SelectItem value="catering">Catering / Prasadam</SelectItem>
              <SelectItem value="decor">Decoration</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Business Category" required>
          <Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="both">Services & Products</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Years of Experience"><Input type="number" placeholder="e.g. 15" /></Field>
        <Field label="Established Year"><Input type="number" placeholder="e.g. 2010" /></Field>
        <div className="md:col-span-2">
          <Field label="About Business" required>
            <Textarea rows={4} placeholder="Describe your business, specialties and offerings…" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard icon={User} title="Owner Information">
        <Field label="Owner Name" required><Input placeholder="Full name" /></Field>
        <Field label="Mobile Number" required><Input placeholder="+91" /></Field>
        <Field label="WhatsApp Number"><Input placeholder="+91" /></Field>
        <Field label="Email Address" required><Input type="email" placeholder="name@example.com" /></Field>
      </SectionCard>

      <SectionCard icon={MapPin} title="Location">
        <div className="md:col-span-2"><Field label="Address Line 1" required><Input placeholder="House / Building / Street" /></Field></div>
        <div className="md:col-span-2"><Field label="Address Line 2"><Input placeholder="Area / Locality" /></Field></div>
        <Field label="Landmark"><Input placeholder="Near…" /></Field>
        <Field label="City" required><Input /></Field>
        <Field label="District" required><Input /></Field>
        <Field label="State" required><Input /></Field>
        <Field label="Pincode" required><Input /></Field>
      </SectionCard>

      <SectionCard icon={Globe} title="Business Details">
        <Field label="Languages Supported"><Input placeholder="e.g. Telugu, Hindi, English" /></Field>
        <Field label="Website URL"><Input placeholder="https://" /></Field>
        <Field label="Facebook URL"><Input placeholder="https://facebook.com/…" /></Field>
        <Field label="Instagram URL"><Input placeholder="https://instagram.com/…" /></Field>
        <Field label="YouTube URL"><Input placeholder="https://youtube.com/…" /></Field>
      </SectionCard>

      <SectionCard icon={Clock} title="Availability">
        <div className="md:col-span-2">
          <Label className="text-sm font-medium">Working Days</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const on = days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Checkbox checked={on} className="h-3.5 w-3.5" />
                  {d}
                </button>
              );
            })}
          </div>
        </div>
        <Field label="Opening Time"><Input type="time" defaultValue="06:00" /></Field>
        <Field label="Closing Time"><Input type="time" defaultValue="20:00" /></Field>
      </SectionCard>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-60 right-0 z-20 flex items-center justify-end gap-2 border-t bg-background/95 px-6 py-3 backdrop-blur">
        <Button variant="outline" onClick={() => toast.success("Draft saved")}>Save Draft</Button>
        <Button onClick={() => toast.success("Profile submitted for review")}>Publish Profile</Button>
      </div>
    </div>
  );
}
