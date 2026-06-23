import { useEffect, useState } from "react";
import {
  Building2,
  FileText,
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
import { ProfileLocationField } from "@/components/business-profile/ProfileLocationField";
import { CoverField, GalleryField, LogoField } from "@/components/business-profile/ProfileMediaFields";
import { ProfileLanguagesField } from "@/components/business-profile/ProfileLanguagesField";
import { FileDropzone } from "@/components/business-connect/FileDropzone";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import type { BusinessEntityType, BusinessProfileFormData } from "@/types/businessProfile";
import { EMPTY_PROFILE_FORM } from "@/types/businessProfile";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ProfileTab = "basic" | "contact" | "location" | "languages" | "media" | "verification";

const TABS: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
  { id: "basic", label: "Basic", icon: Building2 },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "location", label: "Business Location", icon: MapPin },
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
  /** When set, Cancel / backdrop close uses this instead of closing silently. */
  onCancel?: () => void;
  cancelLabel?: string;
  onLoadSample?: () => void;
}

const DESIGNATIONS = [
  "Owner",
  "Proprietor",
  "Director",
  "Partner",
  "Manager",
  "Administrator",
  "Operations Head",
];

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
  onCancel,
  cancelLabel = "Cancel",
  onLoadSample,
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
  const isIndividual = form.entityType === "individual";
  const isCompany = form.entityType === "company";

  const setEntityType = (value: BusinessEntityType) => {
    setForm((prev) => ({
      ...prev,
      entityType: value,
      ...(value === "individual"
        ? { legalCompanyName: "", companyRegNumber: "", incorporationDate: "", incorporationDoc: null }
        : {}),
    }));
  };

  const handleCloseRequest = (nextOpen: boolean) => {
    if (!nextOpen && onCancel) {
      onCancel();
      return;
    }
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleCloseRequest}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-3xl">
        <SheetHeader className="shrink-0 border-b px-6 py-4 text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Add your business details, location, KYC, and media. Save draft anytime or publish when ready.
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Profile type *</Label>
                  <RadioGroup
                    value={form.entityType}
                    onValueChange={(v) => setEntityType(v as BusinessEntityType)}
                    className="grid grid-cols-2 gap-3"
                  >
                    <label
                      className={cn(
                        "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 text-sm",
                        isIndividual
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border",
                      )}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <RadioGroupItem value="individual" />
                        Individual
                      </span>
                      <span className="pl-6 text-[11px] text-muted-foreground">
                        Freelancers & home-based — personal name is fine
                      </span>
                    </label>
                    <label
                      className={cn(
                        "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 text-sm",
                        isCompany
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border",
                      )}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <RadioGroupItem value="company" />
                        Registered company
                      </span>
                      <span className="pl-6 text-[11px] text-muted-foreground">
                        LLP, Pvt Ltd, partnership — legal details required
                      </span>
                    </label>
                  </RadioGroup>
                </div>

                {isIndividual && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Your name" required>
                      <Input
                        value={form.ownerName}
                        onChange={(e) => update("ownerName", e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                      />
                    </Field>
                    <Field label="Trade / display name">
                      <Input
                        value={form.businessName}
                        onChange={(e) => update("businessName", e.target.value)}
                        placeholder="Optional — skip if you use your personal name"
                      />
                    </Field>
                    <Field label="Service type" required>
                      <Select value={form.businessType} onValueChange={(v) => update("businessType", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="What do you offer?" />
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
                      <Field label="About you & your services" required>
                        <Textarea
                          rows={4}
                          value={form.about}
                          onChange={(e) => update("about", e.target.value)}
                          placeholder="What you do, areas you serve, what customers can expect"
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {isCompany && (
                  <>
                    <div className="grid grid-cols-1 gap-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 md:grid-cols-2">
                      <Field label="Registered company name" required>
                        <Input
                          value={form.legalCompanyName}
                          onChange={(e) => update("legalCompanyName", e.target.value)}
                          placeholder="As on certificate of incorporation"
                        />
                      </Field>
                      <Field label="CIN / LLPIN / reg. number" required>
                        <Input
                          value={form.companyRegNumber}
                          onChange={(e) => update("companyRegNumber", e.target.value)}
                          placeholder="e.g. U74999KA2020PTC123456"
                        />
                      </Field>
                      <Field label="Incorporation date">
                        <Input
                          type="date"
                          value={form.incorporationDate}
                          onChange={(e) => update("incorporationDate", e.target.value)}
                        />
                      </Field>
                      <Field label="Trading / brand name">
                        <Input
                          value={form.businessName}
                          onChange={(e) => update("businessName", e.target.value)}
                          placeholder="Name customers know you by (optional)"
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field label="Business type" required>
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
                      <div className="md:col-span-2">
                        <Field label="About the business" required>
                          <Textarea
                            rows={4}
                            value={form.about}
                            onChange={(e) => update("about", e.target.value)}
                            placeholder="Describe your company and services"
                          />
                        </Field>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {isCompany && (
                  <>
                    <Field label="Authorized contact name" required>
                      <Input value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} />
                    </Field>
                    <Field label="Designation">
                      <Select
                        value={form.contactDesignation}
                        onValueChange={(v) => update("contactDesignation", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {DESIGNATIONS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </>
                )}
                <Field label="Mobile Number" required>
                  <Input
                    value={form.mobile}
                    onChange={(e) => update("mobile", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </Field>
                <Field label="WhatsApp Number" required>
                  <Input
                    value={form.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </Field>
                <Field label="Alternate mobile">
                  <Input
                    value={form.alternatePhone}
                    onChange={(e) => update("alternatePhone", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </Field>
                <Field label="Landline / office phone">
                  <Input
                    value={form.landline}
                    onChange={(e) => update("landline", e.target.value)}
                    placeholder="e.g. 080-1234567"
                  />
                </Field>
                <Field label="Email">
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Optional" />
                </Field>
              </div>

              <div className="mt-6 space-y-3 border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground">Social media (optional)</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Instagram">
                    <Input
                      value={form.instagram}
                      onChange={(e) => update("instagram", e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </Field>
                  <Field label="YouTube">
                    <Input
                      value={form.youtube}
                      onChange={(e) => update("youtube", e.target.value)}
                      placeholder="https://youtube.com/@..."
                    />
                  </Field>
                  <Field label="Facebook">
                    <Input
                      value={form.facebook}
                      onChange={(e) => update("facebook", e.target.value)}
                      placeholder="https://facebook.com/..."
                    />
                  </Field>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="mt-0 focus-visible:outline-none">
              <p className="mb-4 text-sm text-muted-foreground">
                Where your business operates — office, shop, or service base. Not your personal home address.
              </p>
              <ProfileLocationField
                value={{
                  address: form.address,
                  city: form.city,
                  district: form.district,
                  state: form.state,
                  pincode: form.pincode,
                  mapLink: form.mapLink,
                }}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
              />
            </TabsContent>

            <TabsContent value="languages" className="mt-0 focus-visible:outline-none">
              <ProfileLanguagesField
                languages={form.languages}
                onChange={(languages) => update("languages", languages)}
              />
            </TabsContent>

            <TabsContent value="media" className="mt-0 focus-visible:outline-none">
              <div className="space-y-6">
                {isIndividual && (
                  <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    Logo and cover are optional for individual profiles. If you skip them, your name
                    initials are shown instead.
                  </p>
                )}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <LogoField
                    value={form.logo}
                    onChange={(logo) => update("logo", logo)}
                    label={isIndividual ? "Profile photo (optional)" : "Business logo"}
                    hint={
                      isIndividual
                        ? "Skip if you don't have one — your name will be used"
                        : "Square PNG or JPG — shown on your profile card"
                    }
                  />
                  <CoverField value={form.coverImage} onChange={(coverImage) => update("coverImage", coverImage)} />
                </div>
                <GalleryField links={form.gallery} onChange={(gallery) => update("gallery", gallery)} />
              </div>
            </TabsContent>

            <TabsContent value="verification" className="mt-0 focus-visible:outline-none">
              <div className="space-y-4">
                {isIndividual && (
                  <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    GST is optional for individual profiles — skip if you are not GST registered.
                  </p>
                )}
                <div
                  className={cn(
                    "grid grid-cols-1 gap-4",
                    isCompany ? "md:grid-cols-3" : "md:grid-cols-2",
                  )}
                >
                  <Field label="Aadhaar">
                    <Input value={form.aadhaar} onChange={(e) => update("aadhaar", e.target.value)} />
                  </Field>
                  <Field label="PAN">
                    <Input value={form.pan} onChange={(e) => update("pan", e.target.value.toUpperCase())} />
                  </Field>
                  {isCompany && (
                    <Field label="GSTIN">
                      <Input
                        value={form.gst}
                        onChange={(e) => update("gst", e.target.value.toUpperCase())}
                        placeholder="If registered"
                      />
                    </Field>
                  )}
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
                {isIndividual && (
                  <div className="space-y-4 rounded-lg border border-dashed p-4">
                    <p className="text-xs font-medium text-muted-foreground">GST (optional)</p>
                    <Field label="GSTIN">
                      <Input
                        value={form.gst}
                        onChange={(e) => update("gst", e.target.value.toUpperCase())}
                        placeholder="Leave blank if not registered"
                      />
                    </Field>
                    <FileDropzone
                      label="GST certificate"
                      accept="image/*,application/pdf"
                      values={form.gstDoc ? [form.gstDoc] : []}
                      onChange={(v) => update("gstDoc", v[0] ?? null)}
                      max={1}
                    />
                  </div>
                )}
                {isCompany && (
                  <FileDropzone
                    label="GST Certificate"
                    accept="image/*,application/pdf"
                    values={form.gstDoc ? [form.gstDoc] : []}
                    onChange={(v) => update("gstDoc", v[0] ?? null)}
                    max={1}
                  />
                )}
                {form.entityType === "company" && (
                  <FileDropzone
                    label="Certificate of incorporation"
                    accept="image/*,application/pdf"
                    values={form.incorporationDoc ? [form.incorporationDoc] : []}
                    onChange={(v) => update("incorporationDoc", v[0] ?? null)}
                    max={1}
                  />
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <SheetFooter className="sticky bottom-0 shrink-0 border-t bg-background px-6 py-4 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleCloseRequest(false)}
              className="gap-1.5"
            >
              <X className="h-4 w-4" /> {cancelLabel}
            </Button>
            {onLoadSample && (
              <Button type="button" variant="outline" onClick={onLoadSample} className="gap-1.5 text-xs">
                Load sample data
              </Button>
            )}
          </div>
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
