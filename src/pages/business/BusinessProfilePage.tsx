import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Edit3,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

// ---- Types ----
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

function SectionHeader({ icon: Icon, title, subtitle, complete }: { icon: any; title: string; subtitle: string; complete?: boolean }) {
  return (
    <div className="flex w-full items-center gap-3 text-left">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
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
            <AlertCircle className="h-3 w-3" /> Pending
          </Badge>
        )
      )}
    </div>
  );
}

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
    <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        {uploaded ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Upload className="h-4 w-4 text-muted-foreground" />}
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{uploaded ? "Uploaded · doc.pdf" : "PDF / JPG, max 5 MB"}</p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={onUpload}>{uploaded ? "Replace" : "Upload"}</Button>
    </div>
  );
}

// ---- Profile Details Dialog ----
function ProfileFormDialog({
  open, onOpenChange, data, setData,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: ProfileState;
  setData: (d: ProfileState) => void;
}) {
  const [draft, setDraft] = useState<ProfileState>(data);

  const update = <K extends keyof ProfileState>(k: K, v: ProfileState[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));
  const toggleDay = (d: string) =>
    setDraft((p) => ({ ...p, workingDays: p.workingDays.includes(d) ? p.workingDays.filter(x => x !== d) : [...p.workingDays, d] }));
  const toggleLang = (l: string) =>
    setDraft((p) => ({ ...p, languages: p.languages.includes(l) ? p.languages.filter(x => x !== l) : [...p.languages, l] }));

  const sec = {
    basic: !!(draft.businessName && draft.businessType && draft.businessCategory && draft.about),
    owner: !!(draft.ownerName && draft.mobile && draft.email),
    address: !!(draft.addr1 && draft.city && draft.district && draft.state && draft.pincode),
    hours: !!(draft.workingDays.length && draft.openTime && draft.closeTime),
    languages: draft.languages.length > 0,
    media: !!draft.logo,
    verification: !!(draft.aadhaar && draft.pan),
  };

  const completion = (() => {
    const keys = Object.keys(draft) as (keyof ProfileState)[];
    let filled = 0;
    keys.forEach((k) => { const v = draft[k]; if (Array.isArray(v) ? v.length > 0 : !!v) filled += 1; });
    return Math.round((filled / keys.length) * 100);
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-lg">Business Profile Details</DialogTitle>
              <DialogDescription className="text-xs">Add or edit your business information.</DialogDescription>
            </div>
            <Badge variant="secondary">{completion}% complete</Badge>
          </div>
          <Progress value={completion} className="mt-3 h-1.5" />
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex flex-1 flex-col overflow-hidden sm:flex-row">
          {/* Tab rail */}
          <TabsList className="flex h-auto w-full shrink-0 flex-row gap-1 overflow-x-auto rounded-none border-b bg-muted/30 p-2 sm:w-56 sm:flex-col sm:border-b-0 sm:border-r sm:overflow-y-auto">
            {[
              { v: "basic", icon: Building2, label: "Basic Info", done: sec.basic },
              { v: "owner", icon: User, label: "Owner", done: sec.owner },
              { v: "address", icon: MapPin, label: "Address", done: sec.address },
              { v: "hours", icon: Clock, label: "Hours", done: sec.hours },
              { v: "languages", icon: Languages, label: "Languages", done: sec.languages },
              { v: "media", icon: ImageIcon, label: "Media", done: sec.media },
              { v: "verification", icon: ShieldCheck, label: "Verification", done: sec.verification },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="group relative flex shrink-0 items-center justify-start gap-2 rounded-md px-3 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm sm:w-full"
              >
                <t.icon className="h-3.5 w-3.5" />
                <span className="truncate">{t.label}</span>
                <span className={`ml-auto h-1.5 w-1.5 shrink-0 rounded-full ${t.done ? "bg-emerald-500" : "bg-amber-400"}`} />
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <TabsContent value="basic" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Business Name" required><Input value={draft.businessName} onChange={e => update("businessName", e.target.value)} maxLength={120} placeholder="e.g. Shree Krishna Pooja Services" /></Field>
                <Field label="Business Type" required>
                  <Select value={draft.businessType} onValueChange={v => update("businessType", v)}>
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
                  <Select value={draft.businessCategory} onValueChange={v => update("businessCategory", v)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="products">Products</SelectItem>
                      <SelectItem value="both">Services & Products</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Years of Experience"><Input type="number" min={0} value={draft.yearsExp} onChange={e => update("yearsExp", e.target.value)} placeholder="e.g. 15" /></Field>
                <div className="md:col-span-2"><Field label="About Business" required><Textarea rows={4} maxLength={1000} value={draft.about} onChange={e => update("about", e.target.value)} placeholder="Describe your business…" /></Field></div>
              </div>
            </TabsContent>

            <TabsContent value="owner" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Owner Name" required><Input value={draft.ownerName} onChange={e => update("ownerName", e.target.value)} maxLength={100} /></Field>
                <Field label="Mobile Number" required><Input value={draft.mobile} onChange={e => update("mobile", e.target.value)} maxLength={15} placeholder="+91 98765 43210" /></Field>
                <Field label="WhatsApp Number"><Input value={draft.whatsapp} onChange={e => update("whatsapp", e.target.value)} maxLength={15} placeholder="+91 98765 43210" /></Field>
                <Field label="Email Address" required><Input type="email" value={draft.email} onChange={e => update("email", e.target.value)} maxLength={255} placeholder="name@example.com" /></Field>
              </div>
            </TabsContent>

            <TabsContent value="address" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2"><Field label="Address Line 1" required><Input value={draft.addr1} onChange={e => update("addr1", e.target.value)} /></Field></div>
                <div className="md:col-span-2"><Field label="Address Line 2"><Input value={draft.addr2} onChange={e => update("addr2", e.target.value)} /></Field></div>
                <Field label="City" required><Input value={draft.city} onChange={e => update("city", e.target.value)} /></Field>
                <Field label="District" required><Input value={draft.district} onChange={e => update("district", e.target.value)} /></Field>
                <Field label="State" required><Input value={draft.state} onChange={e => update("state", e.target.value)} /></Field>
                <Field label="Pincode" required><Input value={draft.pincode} onChange={e => update("pincode", e.target.value)} maxLength={6} /></Field>
              </div>
            </TabsContent>

            <TabsContent value="hours" className="mt-0 space-y-4">
              <div>
                <Label className="text-sm font-medium">Working Days</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DAYS.map(d => {
                    const on = draft.workingDays.includes(d);
                    return (
                      <button key={d} type="button" onClick={() => toggleDay(d)} className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>{d}</button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Opening Time"><Input type="time" value={draft.openTime} onChange={e => update("openTime", e.target.value)} /></Field>
                <Field label="Closing Time"><Input type="time" value={draft.closeTime} onChange={e => update("closeTime", e.target.value)} /></Field>
              </div>
            </TabsContent>

            <TabsContent value="languages" className="mt-0 space-y-4">
              <p className="text-sm text-muted-foreground">Select all languages you can serve customers in.</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(l => {
                  const on = draft.languages.includes(l);
                  return (
                    <button key={l} type="button" onClick={() => toggleLang(l)} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                      <Checkbox checked={on} className="pointer-events-none h-3 w-3" />
                      {l}
                    </button>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <UploadTile label="Business Logo *" hint="PNG / JPG, min 512×512" aspect="aspect-square" value={draft.logo} onUpload={() => update("logo", "/placeholder.svg")} />
                <UploadTile label="Cover Image" hint="JPG / PNG, 1600×600" value={draft.cover} onUpload={() => update("cover", "/placeholder.svg")} />
              </div>
              <div>
                <Label className="text-sm font-medium">Photo Gallery</Label>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {draft.gallery.map((g, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-md border bg-muted/40"><img src={g} alt="" className="h-full w-full object-cover" /></div>
                  ))}
                  <button onClick={() => update("gallery", [...draft.gallery, "/placeholder.svg"])} className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary"><Plus className="h-5 w-5" /></button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="verification" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Aadhaar Number"><Input value={draft.aadhaar} onChange={e => update("aadhaar", e.target.value)} maxLength={14} /></Field>
                <Field label="PAN Number"><Input value={draft.pan} onChange={e => update("pan", e.target.value.toUpperCase())} maxLength={10} /></Field>
                <Field label="GST Number"><Input value={draft.gst} onChange={e => update("gst", e.target.value.toUpperCase())} maxLength={15} /></Field>
              </div>
              <div className="space-y-2">
                <DocRow label="Aadhaar Copy" uploaded={!!draft.aadhaarDoc} onUpload={() => update("aadhaarDoc", "doc.pdf")} />
                <DocRow label="PAN Copy" uploaded={!!draft.panDoc} onUpload={() => update("panDoc", "doc.pdf")} />
                <DocRow label="GST Certificate" uploaded={!!draft.gstDoc} onUpload={() => update("gstDoc", "doc.pdf")} />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t bg-muted/30 px-6 py-3">
          <Button variant="outline" onClick={() => { setData(draft); toast.success("Draft saved"); onOpenChange(false); }} className="gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save Draft
          </Button>
          <Button onClick={() => { setData(draft); toast.success("Profile saved"); onOpenChange(false); }} className="gap-1.5">
            <Send className="h-3.5 w-3.5" /> Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Profile Summary Card ----
function ProfileSummary({ data, onEdit }: { data: ProfileState; onEdit: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-32 w-full bg-gradient-to-r from-primary/30 via-primary/15 to-primary/5" />
      <CardContent className="relative p-5">
        <div className="-mt-14 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-end gap-4">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl border-4 border-background bg-card shadow">
              {data.logo ? <img src={data.logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-9 w-9 text-primary" />}
            </div>
            <div className="pb-1">
              <h2 className="text-lg font-bold text-foreground">{data.businessName}</h2>
              <p className="text-xs text-muted-foreground">{data.businessType || "Business Type"} · {data.yearsExp ? `${data.yearsExp}+ yrs` : "Experience"}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onEdit}><Edit3 className="h-3.5 w-3.5" /> Edit</Button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Mobile</p><p>{data.mobile || "—"}</p></div></div>
          <div className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Email</p><p className="truncate">{data.email || "—"}</p></div></div>
          <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Address</p><p className="line-clamp-2">{[data.addr1, data.city, data.state].filter(Boolean).join(", ") || "—"}</p></div></div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Empty State ----
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }} className="relative">
          <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
            <Building2 className="h-12 w-12" />
          </div>
          <div className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Sparkles className="h-4 w-4" />
          </div>
        </motion.div>
        <h2 className="mt-6 text-xl font-bold text-foreground">Create Your Business Profile</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">Complete your profile to become visible on Digidevalaya.</p>
        <Button onClick={onCreate} className="mt-6 gap-2 px-6"><Plus className="h-4 w-4" /> Create Profile</Button>
      </CardContent>
    </Card>
  );
}

// ---- Main Page ----
export default function BusinessProfilePage() {
  const [data, setData] = useState<ProfileState>(empty);
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasProfile = !!(data.businessName || data.ownerName);

  const missing = REQUIRED.filter(({ key }) => {
    const v = data[key];
    return Array.isArray(v) ? v.length === 0 : !v;
  });
  const completion = (() => {
    const keys = Object.keys(data) as (keyof ProfileState)[];
    let filled = 0;
    keys.forEach((k) => { const v = data[k]; if (Array.isArray(v) ? v.length > 0 : !!v) filled += 1; });
    return Math.round((filled / keys.length) * 100);
  })();
  const canPublish = missing.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Create, edit and publish your public business profile.</p>
        </div>
        {hasProfile && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{completion}% complete</Badge>
            <Button variant="outline" size="sm" className="gap-1.5"><Eye className="h-3.5 w-3.5" /> Preview</Button>
            <Button size="sm" disabled={!canPublish} className="gap-1.5"><Send className="h-3.5 w-3.5" /> Publish</Button>
          </div>
        )}
      </div>

      {hasProfile && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Profile completion</span>
            <span className="text-foreground">{completion}%</span>
          </div>
          <Progress value={completion} className="h-1.5" />
        </div>
      )}

      {hasProfile ? <ProfileSummary data={data} onEdit={() => setDialogOpen(true)} /> : <EmptyState onCreate={() => setDialogOpen(true)} />}

      {hasProfile && !canPublish && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="flex flex-wrap items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">Complete required fields to publish</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {missing.map(m => (
                  <Badge key={m.key} variant="outline" className="border-amber-300 bg-background text-xs text-amber-800">{m.label}</Badge>
                ))}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>Complete now</Button>
          </CardContent>
        </Card>
      )}

      <ProfileFormDialog open={dialogOpen} onOpenChange={setDialogOpen} data={data} setData={setData} />
    </div>
  );
}
