import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { StepShell } from "@/components/business-connect/StepShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Loader2, MapPin } from "lucide-react";
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

  const [languages, setLanguages] = useState<string[]>(
    storedComms?.languages ?? ["English"],
  );
  const [channels, setChannels] = useState<string[]>(
    storedComms?.channels ?? ["Phone Calls"],
  );
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

  async function lookupPincode(pin: string) {
    if (!/^\d{6}$/.test(pin)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
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
      setValue("city", po.Block && po.Block !== "NA" ? po.Block : po.Name, {
        shouldValidate: true,
      });
      setValue("district", po.District ?? "", { shouldValidate: true });
      setValue("state", po.State ?? "", { shouldValidate: true });
      setValue("country", po.Country ?? "India", { shouldValidate: true });
      setPinHint(`${po.Name}, ${po.District}, ${po.State}`);
      toast.success("Address auto-filled from pincode");
    } catch {
      toast.error("Couldn't fetch pincode details. Please fill manually.");
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

  const err = (name: keyof FormValues) =>
    errors[name] ? (
      <p className="text-xs text-destructive">{errors[name]?.message as string}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StepShell
        title="Address & communication"
        subtitle="Enter your pincode first — we'll auto-fill the rest."
        backTo="/business-connect/onboarding/business"
        onNext={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Business address</h2>

            <div className="rounded-lg border bg-primary/5 p-3">
              <Label className="text-sm font-medium">
                Pincode <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit pincode"
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
                  disabled={looking}
                  className="inline-flex items-center gap-1.5 rounded-md border border-primary bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {looking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  Lookup
                </button>
              </div>
              {err("pincode")}
              {pinHint && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Found: <span className="font-medium text-foreground">{pinHint}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>
                Address line 1 <span className="text-destructive">*</span>
              </Label>
              <Input {...register("line1")} placeholder="Building / street" />
              {err("line1")}
            </div>
            <div className="space-y-1.5">
              <Label>Address line 2</Label>
              <Input {...register("line2")} placeholder="Area / locality (optional)" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Landmark</Label>
                <Input {...register("landmark")} />
              </div>
              <div className="space-y-1.5">
                <Label>
                  City <span className="text-destructive">*</span>
                </Label>
                <Input {...register("city")} />
                {err("city")}
              </div>
              <div className="space-y-1.5">
                <Label>
                  District <span className="text-destructive">*</span>
                </Label>
                <Input {...register("district")} />
                {err("district")}
              </div>
              <div className="space-y-1.5">
                <Label>
                  State <span className="text-destructive">*</span>
                </Label>
                <Input {...register("state")} />
                {err("state")}
              </div>
              <div className="space-y-1.5">
                <Label>
                  Country <span className="text-destructive">*</span>
                </Label>
                <Input {...register("country")} />
                {err("country")}
              </div>
              <div className="space-y-1.5">
                <Label>Service reach</Label>
                <Controller
                  name="reach"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
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
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              Languages supported
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {LANGUAGES.map((l) => (
                <Label
                  key={l}
                  className="flex cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 hover:border-primary"
                >
                  <Checkbox
                    checked={languages.includes(l)}
                    onCheckedChange={() => toggle(languages, setLanguages, l)}
                  />
                  <span className="text-sm">{l}</span>
                </Label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              Communication preferences
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COMM_CHANNELS.map((c) => (
                <Label
                  key={c}
                  className="flex cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 hover:border-primary"
                >
                  <Checkbox
                    checked={channels.includes(c)}
                    onCheckedChange={() => toggle(channels, setChannels, c)}
                  />
                  <span className="text-sm">{c}</span>
                </Label>
              ))}
            </div>
          </section>
        </div>
      </StepShell>
    </form>
  );
}
