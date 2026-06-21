import { useEffect, useMemo, useState } from "react";
import {
  ListChecks,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  ImageIcon,
  MapPin,
  Clock,
  Tags,
  Package as PackageIcon,
  IndianRupee,
  Languages,
  Sparkles,
  TrendingUp,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Status = "Draft" | "Active" | "Inactive";
type Availability = "Available" | "Limited Availability" | "Not Available";
type PricingType = "Fixed Price" | "Starting From" | "Quote Based";
type Coverage = "Local" | "District" | "Statewide" | "Nationwide";

const CATEGORIES = [
  "Priest Services",
  "Catering",
  "Hotel",
  "Travel",
  "Astrology",
  "Vastu",
  "Decoration",
  "Photography",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LANGUAGES = ["Kannada", "English", "Hindi", "Telugu", "Tamil", "Malayalam"];

type Service = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  pricingType: PricingType;
  price?: string;
  currency: string;
  availability: Availability;
  days: string[];
  startTime: string;
  endTime: string;
  state?: string;
  district?: string;
  city?: string;
  coverage: Coverage;
  languages: string[];
  image?: string;
  gallery: string[];
  packageName?: string;
  packageDesc?: string;
  packagePrice?: string;
  keywords?: string;
  tags?: string;
  status: Status;
  updatedAt: string;
  views: number;
  enquiries: number;
};

const SAMPLE: Service[] = [
  {
    id: "s1",
    name: "Gruhapravesha Pooja",
    category: "Priest Services",
    subcategory: "Housewarming",
    description: "Traditional housewarming ceremony performed by experienced priests with all rituals.",
    pricingType: "Starting From",
    price: "5100",
    currency: "INR",
    availability: "Available",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    startTime: "06:00",
    endTime: "20:00",
    state: "Karnataka",
    district: "Bengaluru Urban",
    city: "Bengaluru",
    coverage: "Statewide",
    languages: ["Kannada", "English", "Hindi"],
    gallery: [],
    keywords: "gruhapravesha, housewarming, purohit",
    tags: "Pooja, Vedic",
    status: "Active",
    updatedAt: "2 days ago",
    views: 1240,
    enquiries: 32,
  },
  {
    id: "s2",
    name: "Annadanam Catering",
    category: "Catering",
    subcategory: "Bulk Catering",
    description: "Pure-veg sattvic meals for 100–2000 guests with traditional South Indian menu.",
    pricingType: "Quote Based",
    currency: "INR",
    availability: "Limited Availability",
    days: ["Fri", "Sat", "Sun"],
    startTime: "08:00",
    endTime: "22:00",
    state: "Karnataka",
    district: "Mysuru",
    city: "Mysuru",
    coverage: "District",
    languages: ["Kannada", "English"],
    gallery: [],
    tags: "Annadanam, Catering",
    status: "Active",
    updatedAt: "5 days ago",
    views: 860,
    enquiries: 18,
  },
  {
    id: "s3",
    name: "Rudrabhisheka",
    category: "Priest Services",
    description: "Sacred abhisheka ritual for Lord Shiva with full procedural arrangements.",
    pricingType: "Fixed Price",
    price: "3100",
    currency: "INR",
    availability: "Available",
    days: ["Mon", "Wed", "Sat"],
    startTime: "05:30",
    endTime: "11:00",
    coverage: "Local",
    languages: ["Kannada", "Sanskrit" as any],
    gallery: [],
    status: "Draft",
    updatedAt: "1 hour ago",
    views: 120,
    enquiries: 2,
  },
];

const emptyService = (): Service => ({
  id: "",
  name: "",
  category: "",
  subcategory: "",
  description: "",
  pricingType: "Fixed Price",
  price: "",
  currency: "INR",
  availability: "Available",
  days: [],
  startTime: "09:00",
  endTime: "18:00",
  state: "",
  district: "",
  city: "",
  coverage: "Local",
  languages: [],
  gallery: [],
  status: "Draft",
  updatedAt: "just now",
  views: 0,
  enquiries: 0,
});

const STORAGE_KEY = "dd:business:services";
const DRAFT_KEY = "dd:business:services:draft";

const statusStyles: Record<Status, string> = {
  Active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Draft: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Inactive: "bg-muted text-muted-foreground hover:bg-muted",
};

const availabilityStyles: Record<Availability, string> = {
  Available: "bg-emerald-50 text-emerald-700",
  "Limited Availability": "bg-amber-50 text-amber-700",
  "Not Available": "bg-rose-50 text-rose-700",
};

export default function BusinessServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [viewing, setViewing] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setServices(JSON.parse(raw));
      else setServices(SAMPLE);
    } catch {
      setServices(SAMPLE);
    }
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  }, [services, hydrated]);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase()) ||
        (s.tags || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "all" || s.status === filterStatus;
      const matchesCategory = filterCategory === "all" || s.category === filterCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [services, search, filterStatus, filterCategory]);

  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.status === "Active").length;
    const draft = services.filter((s) => s.status === "Draft").length;
    const mostViewed = [...services].sort((a, b) => b.views - a.views)[0];
    const enquiries = services.reduce((sum, s) => sum + s.enquiries, 0);
    return { total, active, draft, mostViewed, enquiries };
  }, [services]);

  const openAdd = () => {
    // Restore draft if present
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Service;
        setEditing(draft);
        toast.info("Draft restored", { description: "We saved your unfinished service." });
      } else {
        setEditing(emptyService());
      }
    } catch {
      setEditing(emptyService());
    }
    setDrawerOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing({ ...s });
    setDrawerOpen(true);
  };

  const toggleStatus = (id: string, next: Status) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: next, updatedAt: "just now" } : s))
    );
    toast.success(`Service ${next.toLowerCase()}`);
  };

  const removeService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setDeleteId(null);
    toast.success("Service deleted");
  };

  const saveService = (next: Service, status?: Status) => {
    if (!next.name.trim()) return toast.error("Service name is required");
    if (!next.category) return toast.error("Category is required");
    if (!next.description.trim()) return toast.error("Description is required");
    if (!next.pricingType) return toast.error("Pricing type is required");

    const finalStatus = status || next.status || "Draft";
    const payload: Service = {
      ...next,
      id: next.id || `s${Date.now()}`,
      status: finalStatus,
      updatedAt: "just now",
    };

    setServices((prev) => {
      const exists = prev.some((s) => s.id === payload.id);
      return exists ? prev.map((s) => (s.id === payload.id ? payload : s)) : [payload, ...prev];
    });
    localStorage.removeItem(DRAFT_KEY);
    setDrawerOpen(false);
    setEditing(null);
    toast.success(finalStatus === "Active" ? "Service published" : "Service saved");
  };

  const hasAny = services.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Service Listings</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage the services you offer to devotees.
          </p>
        </div>
        {hasAny && (
          <Button onClick={openAdd} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Service
          </Button>
        )}
      </div>

      {hasAny && (
        <>
          {/* Dashboard widgets */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard icon={ListChecks} label="Total Services" value={stats.total} tint="bg-primary/10 text-primary" />
            <StatCard icon={CheckCircle2} label="Active" value={stats.active} tint="bg-emerald-100 text-emerald-700" />
            <StatCard icon={FileText} label="Drafts" value={stats.draft} tint="bg-amber-100 text-amber-700" />
            <StatCard
              icon={Sparkles}
              label="Most Viewed"
              value={stats.mostViewed?.name || "—"}
              sub={stats.mostViewed ? `${stats.mostViewed.views} views` : ""}
              tint="bg-blue-100 text-blue-700"
              valueClass="text-sm font-semibold truncate"
            />
            <StatCard icon={TrendingUp} label="Enquiries" value={stats.enquiries} tint="bg-rose-100 text-rose-700" />
          </div>

          {/* Toolbar */}
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, category, tag..."
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground md:hidden" />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty state */}
      {hydrated && !hasAny && (
        <Card className="border-dashed">
          <CardContent className="grid place-items-center px-6 py-16 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ListChecks className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-foreground">No Services Added Yet</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Add your first service to start receiving enquiries and bookings.
            </p>
            <Button onClick={openAdd} className="mt-5 gap-1.5">
              <Plus className="h-4 w-4" /> Add Service
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Service cards */}
      {hasAny && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className="group overflow-hidden transition hover:border-primary/40 hover:shadow-sm">
              <div className="flex items-start gap-3 p-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-muted/60 text-muted-foreground">
                  {s.image ? (
                    <img src={s.image} alt={s.name} className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">{s.name}</h3>
                      <p className="truncate text-xs text-muted-foreground">{s.category}{s.subcategory ? ` · ${s.subcategory}` : ""}</p>
                    </div>
                    <Badge variant="secondary" className={cn("shrink-0", statusStyles[s.status])}>{s.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {s.pricingType === "Quote Based" ? "On request" : `${s.pricingType === "Starting From" ? "From " : ""}₹${s.price || "—"}`}
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", availabilityStyles[s.availability])}>
                      {s.availability}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />{s.updatedAt}
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-2 px-4 py-2">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>{s.views} views</span>
                  <span>·</span>
                  <span>{s.enquiries} enquiries</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setViewing(s)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 px-2">⋯</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {s.status !== "Active" && (
                        <DropdownMenuItem onClick={() => toggleStatus(s.id, "Active")}>
                          <Power className="mr-2 h-4 w-4" /> Activate
                        </DropdownMenuItem>
                      )}
                      {s.status === "Active" && (
                        <DropdownMenuItem onClick={() => toggleStatus(s.id, "Inactive")}>
                          <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteId(s.id)} className="text-rose-600 focus:text-rose-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No services match your filters.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add / Edit drawer */}
      <ServiceFormDrawer
        open={drawerOpen}
        onOpenChange={(o) => {
          setDrawerOpen(o);
          if (!o) setEditing(null);
        }}
        service={editing}
        onChange={(s) => {
          setEditing(s);
          // auto-save draft
          try {
            if (!s.id) localStorage.setItem(DRAFT_KEY, JSON.stringify(s));
          } catch {}
        }}
        onSave={(s) => saveService(s, s.status)}
        onPublish={(s) => saveService(s, "Active")}
      />

      {/* Detail view */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {viewing && <ServiceDetail s={viewing} onEdit={() => { openEdit(viewing); setViewing(null); }} onToggle={(st) => { toggleStatus(viewing.id, st); setViewing(null); }} />}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && removeService(deleteId)} className="bg-rose-600 hover:bg-rose-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ----------------------------- Sub components ----------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tint,
  valueClass,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  tint: string;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", tint)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={cn("text-lg font-semibold text-foreground", valueClass)}>{value}</p>
          {sub && <p className="truncate text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ icon: Icon, title, desc }: { icon: any; title: string; desc?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
    </div>
  );
}

function ServiceFormDrawer({
  open,
  onOpenChange,
  service,
  onChange,
  onSave,
  onPublish,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  service: Service | null;
  onChange: (s: Service) => void;
  onSave: (s: Service) => void;
  onPublish: (s: Service) => void;
}) {
  if (!service) return null;
  const set = (patch: Partial<Service>) => onChange({ ...service, ...patch });
  const toggleDay = (d: string) =>
    set({ days: service.days.includes(d) ? service.days.filter((x) => x !== d) : [...service.days, d] });
  const toggleLang = (l: string) =>
    set({ languages: service.languages.includes(l) ? service.languages.filter((x) => x !== l) : [...service.languages, l] });

  const isEdit = !!service.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>{isEdit ? "Edit Service" : "Add Service"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update details of this service." : "Fill in the details. Drafts auto-save."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {/* Basic */}
          <section className="space-y-3">
            <SectionTitle icon={FileText} title="Basic Information" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Service Name *">
                <Input value={service.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Gruhapravesha Pooja" />
              </Field>
              <Field label="Category *">
                <Select value={service.category} onValueChange={(v) => set({ category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Subcategory">
                <Input value={service.subcategory || ""} onChange={(e) => set({ subcategory: e.target.value })} placeholder="e.g. Housewarming" />
              </Field>
              <Field label="Status">
                <Select value={service.status} onValueChange={(v: Status) => set({ status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Description *">
              <Textarea rows={3} value={service.description} onChange={(e) => set({ description: e.target.value })} placeholder="Describe what this service includes..." />
            </Field>
          </section>

          {/* Pricing */}
          <section className="space-y-3">
            <SectionTitle icon={IndianRupee} title="Pricing" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Pricing Type *">
                <Select value={service.pricingType} onValueChange={(v: PricingType) => set({ pricingType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                    <SelectItem value="Starting From">Starting From</SelectItem>
                    <SelectItem value="Quote Based">Quote Based</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Price">
                <Input
                  type="number"
                  disabled={service.pricingType === "Quote Based"}
                  value={service.price || ""}
                  onChange={(e) => set({ price: e.target.value })}
                  placeholder="e.g. 5100"
                />
              </Field>
              <Field label="Currency">
                <Select value={service.currency} onValueChange={(v) => set({ currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR ₹</SelectItem>
                    <SelectItem value="USD">USD $</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          {/* Availability */}
          <section className="space-y-3">
            <SectionTitle icon={Clock} title="Availability" />
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Available Days</Label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((d) => {
                  const on = service.days.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-xs font-medium transition",
                        on ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background text-foreground hover:bg-muted"
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Start Time">
                <Input type="time" value={service.startTime} onChange={(e) => set({ startTime: e.target.value })} />
              </Field>
              <Field label="End Time">
                <Input type="time" value={service.endTime} onChange={(e) => set({ endTime: e.target.value })} />
              </Field>
              <Field label="Status">
                <Select value={service.availability} onValueChange={(v: Availability) => set({ availability: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Limited Availability">Limited Availability</SelectItem>
                    <SelectItem value="Not Available">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          {/* Service Area */}
          <section className="space-y-3">
            <SectionTitle icon={MapPin} title="Service Area" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="State"><Input value={service.state || ""} onChange={(e) => set({ state: e.target.value })} placeholder="Karnataka" /></Field>
              <Field label="District"><Input value={service.district || ""} onChange={(e) => set({ district: e.target.value })} placeholder="Bengaluru Urban" /></Field>
              <Field label="City"><Input value={service.city || ""} onChange={(e) => set({ city: e.target.value })} placeholder="Bengaluru" /></Field>
              <Field label="Coverage Type">
                <Select value={service.coverage} onValueChange={(v: Coverage) => set({ coverage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Local">Local</SelectItem>
                    <SelectItem value="District">District</SelectItem>
                    <SelectItem value="Statewide">Statewide</SelectItem>
                    <SelectItem value="Nationwide">Nationwide</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          {/* Languages */}
          <section className="space-y-3">
            <SectionTitle icon={Languages} title="Languages Supported" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {LANGUAGES.map((l) => (
                <label key={l} className="flex cursor-pointer items-center gap-2 rounded-md border bg-background p-2.5 text-sm hover:bg-muted">
                  <Checkbox checked={service.languages.includes(l)} onCheckedChange={() => toggleLang(l)} />
                  <span>{l}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Media */}
          <section className="space-y-3">
            <SectionTitle icon={ImageIcon} title="Media" desc="Add a cover image and gallery (optional)" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Cover Image URL">
                <Input value={service.image || ""} onChange={(e) => set({ image: e.target.value })} placeholder="https://..." />
              </Field>
              <Field label="Gallery (comma-separated URLs)">
                <Input
                  value={service.gallery.join(", ")}
                  onChange={(e) => set({ gallery: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  placeholder="https://img1, https://img2"
                />
              </Field>
            </div>
          </section>

          {/* Package */}
          <section className="space-y-3">
            <SectionTitle icon={PackageIcon} title="Package (optional)" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Package Name"><Input value={service.packageName || ""} onChange={(e) => set({ packageName: e.target.value })} placeholder="e.g. Wedding Package" /></Field>
              <Field label="Package Price"><Input type="number" value={service.packagePrice || ""} onChange={(e) => set({ packagePrice: e.target.value })} placeholder="e.g. 25000" /></Field>
              <Field label="Description"><Input value={service.packageDesc || ""} onChange={(e) => set({ packageDesc: e.target.value })} placeholder="What's included" /></Field>
            </div>
          </section>

          {/* SEO */}
          <section className="space-y-3">
            <SectionTitle icon={Tags} title="SEO & Search" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Search Keywords"><Input value={service.keywords || ""} onChange={(e) => set({ keywords: e.target.value })} placeholder="gruhapravesha, purohit" /></Field>
              <Field label="Tags"><Input value={service.tags || ""} onChange={(e) => set({ tags: e.target.value })} placeholder="Pooja, Vedic" /></Field>
            </div>
          </section>
        </div>

        {/* Sticky save bar */}
        <div className="flex items-center justify-between gap-2 border-t bg-background/95 px-5 py-3 backdrop-blur">
          <p className="text-xs text-muted-foreground">Draft auto-saved</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onSave({ ...service, status: "Draft" })}>Save Draft</Button>
            <Button onClick={() => onPublish(service)} className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> {isEdit ? "Save & Publish" : "Publish"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ServiceDetail({ s, onEdit, onToggle }: { s: Service; onEdit: () => void; onToggle: (st: Status) => void }) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <DialogTitle className="text-lg">{s.name}</DialogTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.category}{s.subcategory ? ` · ${s.subcategory}` : ""}</p>
          </div>
          <Badge variant="secondary" className={statusStyles[s.status]}>{s.status}</Badge>
        </div>
      </DialogHeader>

      <div className="space-y-5">
        {s.image && <img src={s.image} alt={s.name} className="h-44 w-full rounded-lg object-cover" />}

        <p className="text-sm text-foreground/90">{s.description}</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow icon={IndianRupee} label="Pricing" value={s.pricingType === "Quote Based" ? "Quote based" : `${s.pricingType === "Starting From" ? "From " : ""}₹${s.price || "—"}`} />
          <InfoRow icon={Clock} label="Hours" value={`${s.startTime} – ${s.endTime}`} sub={s.days.join(", ") || "All days"} />
          <InfoRow icon={MapPin} label="Service Area" value={[s.city, s.district, s.state].filter(Boolean).join(", ") || "—"} sub={s.coverage} />
          <InfoRow icon={Languages} label="Languages" value={s.languages.join(", ") || "—"} />
        </div>

        {s.gallery.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Gallery</p>
            <div className="grid grid-cols-3 gap-2">
              {s.gallery.map((g, i) => (
                <img key={i} src={g} alt={`gallery-${i}`} className="aspect-square w-full rounded-md object-cover" />
              ))}
            </div>
          </div>
        )}

        {s.packageName && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PackageIcon className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">{s.packageName}</p>
                </div>
                {s.packagePrice && <span className="text-sm font-semibold">₹{s.packagePrice}</span>}
              </div>
              {s.packageDesc && <p className="mt-1 text-xs text-muted-foreground">{s.packageDesc}</p>}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
          {s.status === "Active" ? (
            <Button variant="outline" onClick={() => onToggle("Inactive")} className="gap-1.5">
              <PowerOff className="h-4 w-4" /> Deactivate
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onToggle("Active")} className="gap-1.5">
              <Power className="h-4 w-4" /> Activate
            </Button>
          )}
          <Button onClick={onEdit} className="gap-1.5"><Pencil className="h-4 w-4" /> Edit</Button>
        </div>
      </div>
    </>
  );
}

function InfoRow({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border bg-background p-3">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
