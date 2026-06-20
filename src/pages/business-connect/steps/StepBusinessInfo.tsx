import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StepShell } from "@/components/business-connect/StepShell";
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
import { bcStore, useBCStore } from "@/stores/businessConnectStore";
import { infoSchema } from "@/lib/bc-schemas";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

type FormValues = z.infer<typeof infoSchema>;

export default function StepBusinessInfo() {
  const navigate = useNavigate();
  const stored = useBCStore((s) => s.info);
  const storedType = useBCStore((s) => s.businessType);
  const [category, setCategory] = useState(storedType?.category ?? "");
  const [subcategory, setSubcategory] = useState(storedType?.subcategory ?? "");
  const [showMore, setShowMore] = useState(
    !!(stored?.legalName || stored?.whatsapp || stored?.website || stored?.gst || stored?.experience),
  );

  const selected = BUSINESS_TYPES.find((t) => t.id === category);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: stored ?? {
      name: "",
      ownerName: "",
      phone: "",
      email: "",
    },
  });

  function onSubmit(values: FormValues) {
    if (!category) {
      toast.error("Please choose a business type");
      return;
    }
    bcStore.set({
      businessType: { category, subcategory: subcategory || undefined },
      info: values as unknown as import("@/types/businessConnect").BCInfo,
    });
    bcStore.markStep("business");
    navigate("/business-connect/onboarding/location");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="contents">
      <StepShell
        title="Tell us about your business"
        subtitle="Just the essentials to get started — you can refine later."
        nextLabel="Continue"
        onNext={handleSubmit(onSubmit)}
      >
        <div className="space-y-5">
          {/* Business type */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Business type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v);
                  setSubcategory("");
                }}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Subcategory</Label>
              <Select value={subcategory} onValueChange={setSubcategory} disabled={!selected}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder={selected ? "Choose subcategory" : "Pick type first"} />
                </SelectTrigger>
                <SelectContent>
                  {selected?.subcategories.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Essentials */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Business name <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-10 text-sm"
                placeholder="e.g. Sri Ganesh Pooja Services"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name.message as string}</p>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Owner name <span className="text-destructive">*</span>
                </Label>
                <Input className="h-10 text-sm" {...register("ownerName")} />
                {errors.ownerName && (
                  <p className="text-[11px] text-destructive">{errors.ownerName.message as string}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Contact number <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="h-10 text-sm"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-[11px] text-destructive">{errors.phone.message as string}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Email address <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-10 text-sm"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[11px] text-destructive">{errors.email.message as string}</p>
              )}
            </div>
          </div>

          {/* Optional, collapsible */}
          <div className="rounded-lg border bg-muted/20">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-foreground"
            >
              <span>Add more details (optional)</span>
              {showMore ? (
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
            {showMore && (
              <div className="space-y-3 border-t bg-background p-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Short description</Label>
                  <Textarea
                    rows={2}
                    className="text-sm"
                    placeholder="A short intro devotees will see on your profile."
                    {...register("description")}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Legal business name</Label>
                    <Input className="h-9 text-sm" {...register("legalName")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">WhatsApp number</Label>
                    <Input
                      className="h-9 text-sm"
                      inputMode="numeric"
                      maxLength={10}
                      {...register("whatsapp")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Years of experience</Label>
                    <Input className="h-9 text-sm" placeholder="e.g. 8" {...register("experience")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Website URL</Label>
                    <Input className="h-9 text-sm" placeholder="https://" {...register("website")} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs">GST number</Label>
                    <Input className="h-9 text-sm" placeholder="Optional" {...register("gst")} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </StepShell>
    </form>
  );
}
