import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
import { FileDropzone } from "@/components/business-connect/FileDropzone";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import type { BusinessProfileFormData } from "@/types/businessProfile";
import { EMPTY_PROFILE_FORM, PROFILE_LANGUAGES, WORKING_DAYS } from "@/types/businessProfile";
import { toggleInList } from "@/components/business-profile/profileUtils";
import { Save, Send, X } from "lucide-react";

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

  useEffect(() => {
    if (!open) return;
    setForm(initialData ? { ...initialData } : { ...EMPTY_PROFILE_FORM });
  }, [open, initialData]);

  const update = <K extends keyof BusinessProfileFormData>(key: K, value: BusinessProfileFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const selectedType = BUSINESS_TYPES.find((t) => t.id === form.businessType);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-3xl">
        <SheetHeader className="border-b px-6 py-4 text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Complete all sections. Use Save Draft to continue later or Publish when ready.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Accordion type="single" collapsible defaultValue="basic" className="w-full">
            <AccordionItem value="basic">
              <AccordionTrigger className="text-sm font-semibold">Basic Information</AccordionTrigger>
              <AccordionContent className="space-y-4">
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact">
              <AccordionTrigger className="text-sm font-semibold">Contact Information</AccordionTrigger>
              <AccordionContent className="space-y-4">
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
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </Field>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="location">
              <AccordionTrigger className="text-sm font-semibold">Location</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <Field label="Address" required>
                  <Textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="languages">
              <AccordionTrigger className="text-sm font-semibold">Languages</AccordionTrigger>
              <AccordionContent>
                <p className="mb-3 text-sm text-muted-foreground">Select languages you serve customers in.</p>
                <div className="flex flex-wrap gap-2">
                  {PROFILE_LANGUAGES.map((lang) => {
                    const selected = form.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => update("languages", toggleInList(form.languages, lang))}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <Checkbox checked={selected} className="pointer-events-none h-3 w-3" />
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="hours">
              <AccordionTrigger className="text-sm font-semibold">Business Hours</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Working Days</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {WORKING_DAYS.map((day) => {
                      const on = form.workingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => update("workingDays", toggleInList(form.workingDays, day))}
                          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                            on
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Opening Time">
                    <Input
                      type="time"
                      value={form.openingTime}
                      onChange={(e) => update("openingTime", e.target.value)}
                    />
                  </Field>
                  <Field label="Closing Time">
                    <Input
                      type="time"
                      value={form.closingTime}
                      onChange={(e) => update("closingTime", e.target.value)}
                    />
                  </Field>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="media">
              <AccordionTrigger className="text-sm font-semibold">Media</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <FileDropzone
                  label="Logo"
                  hint="PNG / JPG"
                  values={form.logo ? [form.logo] : []}
                  onChange={(v) => update("logo", v[0] ?? null)}
                  max={1}
                />
                <FileDropzone
                  label="Cover Image"
                  hint="1600×600 recommended"
                  values={form.coverImage ? [form.coverImage] : []}
                  onChange={(v) => update("coverImage", v[0] ?? null)}
                  max={1}
                />
                <FileDropzone
                  label="Gallery"
                  hint="Multiple images"
                  multiple
                  values={form.gallery}
                  onChange={(v) => update("gallery", v)}
                  max={8}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="verification">
              <AccordionTrigger className="text-sm font-semibold">Verification</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="Aadhaar">
                    <Input value={form.aadhaar} onChange={(e) => update("aadhaar", e.target.value)} />
                  </Field>
                  <Field label="PAN">
                    <Input
                      value={form.pan}
                      onChange={(e) => update("pan", e.target.value.toUpperCase())}
                    />
                  </Field>
                  <Field label="GST">
                    <Input
                      value={form.gst}
                      onChange={(e) => update("gst", e.target.value.toUpperCase())}
                    />
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <SheetFooter className="sticky bottom-0 border-t bg-background px-6 py-4 sm:flex-row sm:justify-between">
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
