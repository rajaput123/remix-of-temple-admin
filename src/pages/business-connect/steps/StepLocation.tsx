import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { StepShell } from "@/components/business-connect/StepShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bcStore, useBCStore } from "@/stores/businessConnectStore";
import { locationSchema } from "@/lib/bc-schemas";
import { LANGUAGES, COMM_CHANNELS } from "@/data/businessTypes";
import { Loader2, MapPin, Check } from "lucide-react";
import { toast } from "sonner";

type FormValues = z.infer<typeof locationSchema>;

const REACH = [
  { value: "local", label: "Local (within city)" },
  { value: "district", label: "District-wide" },
  { value: "statewide", label: "Statewide" },
  { value: "nationwide", label: "Nationwide" },
] as const;

export default function StepLocation() {
  const navigate = useNavigate();
  const stored = useBCStore((s) => s.location);
  const storedComms = useBCStore((s) => s.comms);

  const [languages, setLanguages] = useState<string[]>(storedComms?.languages ?? ["English"]);
  const [channels, setChannels] = useState<string[]>(storedComms?.channels ?? ["Phone Calls"]);
  const [looking, setLooking] = useState(false);
  const [pinHint, setPinHint] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: stored ?? {
      line1: "",
      city: "",
      district: "",
      state: "",
      country: "India",
      pincode: "",
      reach: "local",
    },
  });

  const pincode = watch("pincode");
  const city = watch("city");

  async function lookupPincode(pin: string) {
    if (!/^\d{6}$/.test(pin)) return;
    setLooking(true);
    setPinHint(null);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      const entry = Array.isArray(data) ? data[0] : null;
      if (!entry || entry.Status !== "Success" || !entry.PostOffice?.length) {
        toast.error("No address found for this pincode");
        return;
      }
      const po = entry.PostOffice[0];
      setValue("city", po.Block && po.Block !== "NA" ? po.Block : po.Name, { shouldValidate: true });
      setValue("district", po.District ?? "", { shouldValidate: true });
      setValue("state", po.State ?? "", { shouldValidate: true });
      setValue("country", po.Country ?? "India", { shouldValidate: true });
      setPinHint(`${po.Name}, ${po.District}, ${po.State}`);
    } catch {
      toast.error("Couldn't fetch pincode. Please fill manually.");
    } finally {
      setLooking(false);
    }
  }

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function onSubmit(v: FormValues) {
    if (languages.length === 0) return toast.error("Select at least one language");
    if (channels.length === 0) return toast.error("Select at least one channel");
    bcStore.set({
      location: v as unknown as import("@/types/businessConnect").BCLocation,
      comms: { languages, channels },
    });
    bcStore.markStep("location");
    navigate("/business-connect/onboarding/verification");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="contents">
      <StepShell
        title="Where do you operate?"
        subtitle="Enter your pincode — we'll fill in the rest."
        backTo="/business-connect/onboarding/business"
        onNext={handleSubmit(onSubmit)}
      >
        <div className="rounded-lg border bg-background p-4 space-y-5">
          {/* Pincode hero */}
          <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
            <Label className="text-xs font-medium">
              Pincode <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                className="h-10 text-sm tracking-wider"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit pincode"
                {...register("pincode")}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setValue("pincode", v, { shouldValidate: true });
                  if (v.length === 6) lookupPincode(v);
                }}
              />
              <button
                type="button"
                onClick={() => lookupPincode(pincode || "")}
                disabled={looking || (pincode?.length ?? 0) !== 6}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                {looking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
                Lookup
              </button>
            </div>
            {errors.pincode && (
              <p className="mt-1 text-[11px] text-destructive">{errors.pincode.message as string}</p>
            )}
            {pinHint && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary">
                <Check className="h-3 w-3" />
                <span>
                  Found: <span className="font-medium">{pinHint}</span>
                </span>
              </div>
            )}
          </div>

          {/* Address details */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Address line 1 <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-10 text-sm"
                {...register("line1")}
                placeholder="Building, street"
              />
              {errors.line1 && (
                <p className="text-[11px] text-destructive">{errors.line1.message as string}</p>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Address line 2 / landmark</Label>
                <Input className="h-10 text-sm" {...register("line2")} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Service reach</Label>
                <Controller
                  name="reach"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REACH.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {(city || pinHint) && (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">City</Label>
                  <Input className="h-10 text-sm" {...register("city")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">District</Label>
                  <Input className="h-10 text-sm" {...register("district")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">State</Label>
                  <Input className="h-10 text-sm" {...register("state")} />
                </div>
              </div>
            )}
          </div>

          {/* Communication preferences */}
          <div className="space-y-3 border-t pt-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">
                Languages spoken
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((l) => {
                  const on = languages.includes(l);
                  return (
                    <button
                      type="button"
                      key={l}
                      onClick={() => toggle(languages, setLanguages, l)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/40"
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">
                Preferred channels
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {COMM_CHANNELS.map((c) => {
                  const on = channels.includes(c);
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => toggle(channels, setChannels, c)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/40"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </StepShell>
    </form>
  );
}
