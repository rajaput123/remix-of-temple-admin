import { useEffect, useState } from "react";
import {
  Building2,
  Globe,
  ImageIcon,
  MapPin,
  Phone,
  Save,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoverField, GalleryField, LogoField } from "@/components/business-profile/ProfileMediaFields";
import { ProfileLanguagesField } from "@/components/business-profile/ProfileLanguagesField";
import { FileDropzone } from "@/components/business-connect/FileDropzone";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import type { BusinessProfileFormData } from "@/types/businessProfile";
import { EMPTY_PROFILE_FORM } from "@/types/businessProfile";
import { cn } from "@/lib/utils";

type ProfileTab = "basic" | "contact" | "location" | "languages" | "media" | "verification";

const TABS: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
  { id: "basic", label: "Basic", icon: Building2 },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "location", label: "Location", icon: MapPin },
  { id: "languages", label: "Languages", icon: Globe },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "verification", label: "Verification", icon: ShieldCheck },
];

interface CreateProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: BusinessProfileFormData;
  title?: string;
  onSaveDraft: (data: BusinessProfileFormData) => void;
  onPublish: (data: BusinessProfileFormData) => void;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function CreateProfileDrawer({
  open,
  onOpenChange,
  initialData,
  title = "Create Business Profile",
  onSaveDraft,
  onPublish,
}: CreateProfileDrawerProps) {
  const [form, setForm] = useState<BusinessProfileFormData>(EMPTY_PROFILE_FORM);
  const [activeTab, setActiveTab] = useState<ProfileTab>("basic");

  useEffect(() => {
    if (!open) return;
    setForm(initialData ? { ...initialData } : { ...EMPTY_PROFILE_FORM });
    setActiveTab("basic");
  }, [open, initialData]);

  const update = <K extends keyof BusinessProfileFormData>(key: K, value: BusinessProfileFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const selectedType = BUSINESS_TYPES.find((t) => t.id === form.businessType);
  const tabIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-3xl">
        <SheetHeader className="shrink-0 border-b px-6 py-4 text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Complete all sections. Use Save Draft to continue later or Publish when ready.
          </SheetDescription>
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ProfileTab)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="shrink-0 border-b border-border bg-muted/30 px-4">
            <div className="flex items-center justify-center gap-1.5 py-2">
              {TABS.map((tab, i) => (
                <div
                  key={tab.id}
                  className={cn(
                    "h-1.5 flex-1 max-w-8 rounded-full transition-colors",
                    i <= tabIndex ? "bg-primary" : "bg-border",
                  )}
                />
              ))}
            </div>
            <p className="pb-2 text-center text-[11px] text-muted-foreground">
              Step {tabIndex + 1} of {TABS.length} · {TABS[tabIndex].label}
            </p>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-0 bg-transparent pb-0 sm:flex-nowrap">
              {TABS.map(({ id, label, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="gap-1.5 px-2.5 py-2 text-xs sm:px-3 sm:text-sm">
                  <Icon className="size-3.5 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="basic" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Business Name" required>
                  <Input
                    value={form.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    placeholder="e.g. Shree Krishna Pooja Services"
                  />
                </Field>
                <Field label="Business Type" required>
                  <Select value={form.businessType} onValueChange={(v) => update("businessType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Category" required>
                  <Select
                    value={form.category}
                    onValueChange={(v) => update("category", v)}
                    disabled={!form.businessType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedType?.subcategories ?? []).map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Experience">
                  <Input
                    type="number"
                    min={0}
                    value={form.experience}
                    onChange={(e) => update("experience", e.target.value)}
                    placeholder="Years of experience"
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="About Business">
                    <Textarea
                      rows={4}
                      value={form.about}
                      onChange={(e) => update("about", e.target.value)}
                      placeholder="Describe your business and services"
                    />
                  </Field>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Owner Name" required>
                  <Input value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} />
                </Field>
                <Field label="Mobile Number" required>
                  <Input
                    value={form.mobile}
                    onChange={(e) => update("mobile", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </Field>
                <Field label="WhatsApp Number">
                  <Input
                    value={form.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </Field>
                <Field label="Email" required>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="location" className="mt-0 focus-visible:outline-none">
              <div className="space-y-4">
                <Field label="Address" required>
                  <Textarea rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} />
                </Field>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="City" required>
                    <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
                  </Field>
                  <Field label="District" required>
                    <Input value={form.district} onChange={(e) => update("district", e.target.value)} />
                  </Field>
                  <Field label="State" required>
                    <Input value={form.state} onChange={(e) => update("state", e.target.value)} />
                  </Field>
                  <Field label="Pincode" required>
                    <Input
                      value={form.pincode}
                      maxLength={6}
                      onChange={(e) => update("pincode", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="languages" className="mt-0 focus-visible:outline-none">
              <ProfileLanguagesField
                languages={form.languages}
                onChange={(languages) => update("languages", languages)}
              />
            </TabsContent>

            <TabsContent value="media" className="mt-0 focus-visible:outline-none">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <LogoField value={form.logo} onChange={(logo) => update("logo", logo)} />
                  <CoverField value={form.coverImage} onChange={(coverImage) => update("coverImage", coverImage)} />
                </div>
                <GalleryField links={form.gallery} onChange={(gallery) => update("gallery", gallery)} />
              </div>
            </TabsContent>

            <TabsContent value="verification" className="mt-0 focus-visible:outline-none">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="Aadhaar">
                    <Input value={form.aadhaar} onChange={(e) => update("aadhaar", e.target.value)} />
                  </Field>
                  <Field label="PAN">
                    <Input value={form.pan} onChange={(e) => update("pan", e.target.value.toUpperCase())} />
                  </Field>
                  <Field label="GST">
                    <Input value={form.gst} onChange={(e) => update("gst", e.target.value.toUpperCase())} />
                  </Field>
                </div>
                <FileDropzone
                  label="Aadhaar Document"
                  accept="image/*,application/pdf"
                  values={form.aadhaarDoc ? [form.aadhaarDoc] : []}
                  onChange={(v) => update("aadhaarDoc", v[0] ?? null)}
                  max={1}
                />
                <FileDropzone
                  label="PAN Document"
                  accept="image/*,application/pdf"
                  values={form.panDoc ? [form.panDoc] : []}
                  onChange={(v) => update("panDoc", v[0] ?? null)}
                  max={1}
                />
                <FileDropzone
                  label="GST Certificate"
                  accept="image/*,application/pdf"
                  values={form.gstDoc ? [form.gstDoc] : []}
                  onChange={(v) => update("gstDoc", v[0] ?? null)}
                  max={1}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <SheetFooter className="sticky bottom-0 shrink-0 border-t bg-background px-6 py-4 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="gap-1.5">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => onSaveDraft(form)} className="gap-1.5">
              <Save className="h-4 w-4" /> Save Draft
            </Button>
            <Button type="button" onClick={() => onPublish(form)} className="gap-1.5">
              <Send className="h-4 w-4" /> Publish
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
