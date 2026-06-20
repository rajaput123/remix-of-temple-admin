import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  User,
  MapPin,
  Clock,
  Languages,
  Image as ImageIcon,
  ShieldCheck,
  Upload,
  Save,
  Eye,
  Send,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// ---- Types & constants ----
type ProfileState = {
  businessName: string;
  businessType: string;
  businessCategory: string;
  about: string;
  yearsExp: string;
  ownerName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  addr1: string;
  addr2: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  workingDays: string[];
  openTime: string;
  closeTime: string;
  languages: string[];
  logo: string | null;
  cover: string | null;
  gallery: string[];
  aadhaar: string;
  pan: string;
  gst: string;
  aadhaarDoc: string | null;
  panDoc: string | null;
  gstDoc: string | null;
};

const empty: ProfileState = {
  businessName: "", businessType: "", businessCategory: "", about: "", yearsExp: "",
  ownerName: "", mobile: "", whatsapp: "", email: "",
  addr1: "", addr2: "", city: "", district: "", state: "", pincode: "",
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], openTime: "06:00", closeTime: "20:00",
  languages: [],
  logo: null, cover: null, gallery: [],
  aadhaar: "", pan: "", gst: "", aadhaarDoc: null, panDoc: null, gstDoc: null,
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LANGUAGES = ["Kannada", "English", "Hindi", "Telugu", "Tamil", "Malayalam"];

const REQUIRED: { key: keyof ProfileState; label: string }[] = [
  { key: "businessName", label: "Business Name" },
  { key: "businessType", label: "Business Type" },
  { key: "ownerName", label: "Owner Name" },
  { key: "mobile", label: "Mobile Number" },
  { key: "email", label: "Email Address" },
  { key: "addr1", label: "Address" },
  { key: "about", label: "About Business" },
  { key: "logo", label: "Business Logo" },
];

// ---- Field primitives ----
function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, complete }: { icon: any; title: string; subtitle: string; complete?: boolean }) {
  return (
    <div className="flex w-full items-center gap-3 text-left">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      {complete !== undefined && (
        complete ? (
          <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <CheckCircle2 className="h-3 w-3" /> Done
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100">
            <AlertCircle className="h-3 w-3" /> Incomplete
          </Badge>
        )
      )}
    </div>
  );
}

// ---- Empty State ----
function EmptyState({ onCreate, onBack }: { onCreate: () => void; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
              <Building2 className="h-12 w-12" />
            </div>
            <div className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
          </motion.div>
          <h2 className="mt-6 text-xl font-bold text-foreground">Create Your Business Profile</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Complete your profile to become visible on Digidevalaya.
          </p>
          <Button onClick={onCreate} className="mt-7 gap-2 px-6">
            <Plus className="h-4 w-4" /> Create Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Preview Modal ----
function PreviewScreen({ data, onClose }: { data: ProfileState; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 backdrop-blur-sm">
      <div className="min-h-full px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-background">Public Profile Preview</p>
            <Button size="sm" variant="secondary" onClick={onClose}>Close</Button>
          </div>
          <Card className="overflow-hidden">
            <div className="h-40 w-full bg-gradient-to-r from-primary/30 via-primary/15 to-primary/5" />
            <CardContent className="relative p-6">
              <div className="-mt-16 flex items-end gap-4">
                <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl border-4 border-background bg-card shadow">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{data.businessName || "Your Business Name"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {data.businessType || "Business Type"} · {data.yearsExp ? `${data.yearsExp}+ yrs experience` : "Experience"}
                  </p>
                </div>
              </div>
              <section className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
                <p className="mt-2 text-sm text-foreground">{data.about || "—"}</p>
              </section>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>📞 {data.mobile || "—"}</li>
                    <li>✉️ {data.email || "—"}</li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</h3>
                  <p className="mt-2 text-sm">
                    {[data.addr1, data.addr2, data.city, data.state, data.pincode].filter(Boolean).join(", ") || "—"}
                  </p>
                </section>
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hours</h3>
                  <p className="mt-2 text-sm">{data.workingDays.join(", ")} · {data.openTime} – {data.closeTime}</p>
                </section>
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Languages</h3>
                  <p className="mt-2 text-sm">{data.languages.join(", ") || "—"}</p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function BusinessProfilePage() {
  const navigate = useNavigate();
  const [exists, setExists] = useState(false);
  const [data, setData] = useState<ProfileState>(empty);
  const [previewOpen, setPreviewOpen] = useState(false);

  const update = <K extends keyof ProfileState>(k: K, v: ProfileState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const toggleDay = (d: string) =>
    setData((p) => ({ ...p, workingDays: p.workingDays.includes(d) ? p.workingDays.filter(x => x !== d) : [...p.workingDays, d] }));

  const toggleLang = (l: string) =>
    setData((p) => ({ ...p, languages: p.languages.includes(l) ? p.languages.filter(x => x !== l) : [...p.languages, l] }));

  // Completion calc — based on all filled non-array fields + required arrays
  const completion = useMemo(() => {
    const keys = Object.keys(data) as (keyof ProfileState)[];
    let filled = 0;
    keys.forEach((k) => {
      const v = data[k];
      if (Array.isArray(v) ? v.length > 0 : !!v) filled += 1;
    });
    return Math.round((filled / keys.length) * 100);
  }, [data]);

  const missing = useMemo(
    () => REQUIRED.filter(({ key }) => {
      const v = data[key];
      return Array.isArray(v) ? v.length === 0 : !v;
    }),
    [data]
  );
  const canPublish = missing.length === 0;

  // Section completeness
  const sec = {
    basic: !!(data.businessName && data.businessType && data.businessCategory && data.about),
    owner: !!(data.ownerName && data.mobile && data.email),
    address: !!(data.addr1 && data.city && data.district && data.state && data.pincode),
    hours: !!(data.workingDays.length && data.openTime && data.closeTime),
    languages: data.languages.length > 0,
    media: !!data.logo,
    verification: !!(data.aadhaar && data.pan),
  };

  if (!exists) {
    return <EmptyState onCreate={() => setExists(true)} onBack={() => navigate("/temple-hub")} />;
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-32">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/temple-hub")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-foreground sm:text-lg">Business Profile</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">Create, edit and publish your public profile</p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">{completion}% complete</Badge>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-3">
          <Progress value={completion} className="h-1.5" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Missing fields banner */}
        {!canPublish && (
          <Card className="mb-5 border-amber-200 bg-amber-50/60">
            <CardContent className="flex flex-wrap items-start gap-3 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900">Complete required fields to publish</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {missing.map((m) => (
                    <Badge key={m.key} variant="outline" className="border-amber-300 bg-background text-xs text-amber-800">
                      {m.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <Accordion type="multiple" defaultValue={["basic"]} className="divide-y">
              {/* 1. Basic Information */}
              <AccordionItem value="basic" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
                  <SectionHeader icon={Building2} title="Basic Information" subtitle="Name, type, category & description" complete={sec.basic} />
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-1 sm:px-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Business Name" required><Input value={data.businessName} onChange={e => update("businessName", e.target.value)} placeholder="e.g. Shree Krishna Pooja Services" maxLength={120} /></Field>
                    <Field label="Business Type" required>
                      <Select value={data.businessType} onValueChange={(v) => update("businessType", v)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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
                      <Select value={data.businessCategory} onValueChange={(v) => update("businessCategory", v)}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="products">Products</SelectItem>
                          <SelectItem value="both">Services & Products</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Years of Experience"><Input type="number" min={0} value={data.yearsExp} onChange={e => update("yearsExp", e.target.value)} placeholder="e.g. 15" /></Field>
                    <div className="md:col-span-2">
                      <Field label="About Business" required>
                        <Textarea rows={4} maxLength={1000} value={data.about} onChange={e => update("about", e.target.value)} placeholder="Describe your business, specialties and offerings…" />
                      </Field>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. Owner Information */}
              <AccordionItem value="owner" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
                  <SectionHeader icon={User} title="Owner Information" subtitle="Contact person details" complete={sec.owner} />
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-1 sm:px-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Owner Name" required><Input value={data.ownerName} onChange={e => update("ownerName", e.target.value)} placeholder="Full name" maxLength={100} /></Field>
                    <Field label="Mobile Number" required><Input value={data.mobile} onChange={e => update("mobile", e.target.value)} placeholder="+91 98765 43210" maxLength={15} /></Field>
                    <Field label="WhatsApp Number"><Input value={data.whatsapp} onChange={e => update("whatsapp", e.target.value)} placeholder="+91 98765 43210" maxLength={15} /></Field>
                    <Field label="Email Address" required><Input type="email" value={data.email} onChange={e => update("email", e.target.value)} placeholder="name@example.com" maxLength={255} /></Field>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 3. Business Address */}
              <AccordionItem value="address" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
                  <SectionHeader icon={MapPin} title="Business Address" subtitle="Where customers can find you" complete={sec.address} />
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-1 sm:px-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2"><Field label="Address Line 1" required><Input value={data.addr1} onChange={e => update("addr1", e.target.value)} placeholder="House / Building / Street" /></Field></div>
                    <div className="md:col-span-2"><Field label="Address Line 2"><Input value={data.addr2} onChange={e => update("addr2", e.target.value)} placeholder="Area / Locality" /></Field></div>
                    <Field label="City" required><Input value={data.city} onChange={e => update("city", e.target.value)} /></Field>
                    <Field label="District" required><Input value={data.district} onChange={e => update("district", e.target.value)} /></Field>
                    <Field label="State" required><Input value={data.state} onChange={e => update("state", e.target.value)} /></Field>
                    <Field label="Pincode" required><Input value={data.pincode} onChange={e => update("pincode", e.target.value)} maxLength={6} /></Field>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 4. Business Hours */}
              <AccordionItem value="hours" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
                  <SectionHeader icon={Clock} title="Business Hours" subtitle="Working days & timings" complete={sec.hours} />
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-1 sm:px-5">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Working Days</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {DAYS.map((d) => {
                          const on = data.workingDays.includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => toggleDay(d)}
                              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                                on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Opening Time"><Input type="time" value={data.openTime} onChange={e => update("openTime", e.target.value)} /></Field>
                      <Field label="Closing Time"><Input type="time" value={data.closeTime} onChange={e => update("closeTime", e.target.value)} /></Field>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 5. Languages Supported */}
              <AccordionItem value="languages" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
                  <SectionHeader icon={Languages} title="Languages Supported" subtitle="Languages you can serve customers in" complete={sec.languages} />
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-1 sm:px-5">
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((l) => {
                      const on = data.languages.includes(l);
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => toggleLang(l)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <Checkbox checked={on} className="h-3 w-3 pointer-events-none" />
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 6. Media */}
              <AccordionItem value="media" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
                  <SectionHeader icon={ImageIcon} title="Media" subtitle="Logo, cover image & photo gallery" complete={sec.media} />
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-1 sm:px-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <UploadTile label="Business Logo *" hint="PNG / JPG, square, min 512×512" aspect="aspect-square" onUpload={() => update("logo", "/placeholder.svg")} value={data.logo} />
                    <UploadTile label="Cover Image" hint="JPG / PNG, 1600×600 recommended" onUpload={() => update("cover", "/placeholder.svg")} value={data.cover} />
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Photo Gallery</Label>
                      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {data.gallery.map((g, i) => (
                          <div key={i} className="aspect-square overflow-hidden rounded-md border bg-muted/40">
                            <img src={g} alt="" className="h-full w-full object-cover" />
                          </div>
                        ))}
                        <button
                          onClick={() => update("gallery", [...data.gallery, "/placeholder.svg"])}
                          className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 7. Verification */}
              <AccordionItem value="verification" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
                  <SectionHeader icon={ShieldCheck} title="Verification" subtitle="KYC documents to build trust" complete={sec.verification} />
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-1 sm:px-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Field label="Aadhaar Number"><Input value={data.aadhaar} onChange={e => update("aadhaar", e.target.value)} placeholder="XXXX XXXX XXXX" maxLength={14} /></Field>
                    <Field label="PAN Number"><Input value={data.pan} onChange={e => update("pan", e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} /></Field>
                    <Field label="GST Number"><Input value={data.gst} onChange={e => update("gst", e.target.value.toUpperCase())} placeholder="22ABCDE1234F1Z5" maxLength={15} /></Field>
                  </div>
                  <div className="mt-4 space-y-2">
                    <DocRow label="Aadhaar Copy" uploaded={!!data.aadhaarDoc} onUpload={() => update("aadhaarDoc", "doc.pdf")} />
                    <DocRow label="PAN Copy" uploaded={!!data.panDoc} onUpload={() => update("panDoc", "doc.pdf")} />
                    <DocRow label="GST Certificate" uploaded={!!data.gstDoc} onUpload={() => update("gstDoc", "doc.pdf")} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Auto-saved as draft
          </div>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => toast.success("Draft saved")} className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Save Draft</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="gap-1.5">
              <Eye className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button
              size="sm"
              disabled={!canPublish}
              onClick={() => toast.success("Profile submitted for review")}
              className="gap-1.5"
            >
              <Send className="h-3.5 w-3.5" /> Publish
            </Button>
          </div>
        </div>
      </div>

      {previewOpen && <PreviewScreen data={data} onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}

// ---- Helpers ----
function UploadTile({ label, hint, aspect = "aspect-video", value, onUpload }: { label: string; hint: string; aspect?: string; value: string | null; onUpload: () => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className={`group relative ${aspect} w-full overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/30 transition hover:border-primary/60 hover:bg-primary/5`}>
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button onClick={onUpload} className="absolute bottom-2 right-2 rounded-md bg-background/90 px-2 py-1 text-xs font-medium shadow">Replace</button>
          </>
        ) : (
          <button onClick={onUpload} className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{hint}</p>
            <span className="mt-1 rounded-md border bg-background px-2.5 py-1 text-xs font-medium">Upload</span>
          </button>
        )}
      </div>
    </div>
  );
}

function DocRow({ label, uploaded, onUpload }: { label: string; uploaded: boolean; onUpload: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-2.5">
        {uploaded ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        ) : (
          <Upload className="h-4 w-4 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{uploaded ? "Uploaded · doc.pdf" : "PDF / JPG, max 5 MB"}</p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={onUpload}>{uploaded ? "Replace" : "Upload"}</Button>
    </div>
  );
}
