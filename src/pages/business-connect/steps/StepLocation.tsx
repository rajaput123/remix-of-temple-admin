import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import { Controller } from "react-hook-form";

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
  const {
    register,
    handleSubmit,
    control,
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

  function onSubmit(v: FormValues) {
    bcStore.set({ location: v as unknown as import("@/types/businessConnect").BCLocation });
    bcStore.markStep("location");
    navigate("/business-connect/onboarding/languages");
  }

  const err = (name: keyof FormValues) =>
    errors[name] ? (
      <p className="text-xs text-destructive">{errors[name]?.message as string}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StepShell
        title="Business address"
        subtitle="Help devotees find you and choose how far you serve."
        backTo="/business-connect/onboarding/info"
        onNext={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Address</h2>
            <div className="space-y-1.5">
              <Label>
                Address line 1 <span className="text-destructive">*</span>
              </Label>
              <Input {...register("line1")} />
              {err("line1")}
            </div>
            <div className="space-y-1.5">
              <Label>Address line 2</Label>
              <Input {...register("line2")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Landmark</Label>
                <Input {...register("landmark")} />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Pincode <span className="text-destructive">*</span>
                </Label>
                <Input inputMode="numeric" maxLength={6} {...register("pincode")} />
                {err("pincode")}
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
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Map location</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Latitude</Label>
                <Input placeholder="Optional" {...register("lat")} />
              </div>
              <div className="space-y-1.5">
                <Label>Longitude</Label>
                <Input placeholder="Optional" {...register("lng")} />
              </div>
            </div>
            <div className="grid h-32 place-items-center rounded-md border border-dashed text-xs text-muted-foreground">
              Google Map pin (placeholder)
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Service reach</h2>
            <Controller
              name="reach"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="max-w-sm">
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
          </section>
        </div>
      </StepShell>
    </form>
  );
}
