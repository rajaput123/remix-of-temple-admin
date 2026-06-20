import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StepShell } from "@/components/business-connect/StepShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bcStore, useBCStore } from "@/stores/businessConnectStore";
import { infoSchema } from "@/lib/bc-schemas";

type FormValues = z.infer<typeof infoSchema>;

export default function StepBusinessInfo() {
  const navigate = useNavigate();
  const stored = useBCStore((s) => s.info);
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
    bcStore.set({ info: values });
    bcStore.markStep("info");
    navigate("/business-connect/onboarding/location");
  }

  const F = ({
    name,
    label,
    required,
    children,
  }: {
    name: keyof FormValues;
    label: string;
    required?: boolean;
    children: React.ReactNode;
  }) => (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {errors[name] && (
        <p className="text-xs text-destructive">{errors[name]?.message as string}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StepShell
        title="Business information"
        subtitle="Tell us about your business and how to reach you."
        backTo="/business-connect/onboarding/type"
        nextLabel="Continue"
        onNext={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Business details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <F name="name" label="Business name" required>
                <Input placeholder="e.g. Sri Ganesh Pooja Services" {...register("name")} />
              </F>
              <F name="legalName" label="Legal business name">
                <Input placeholder="Registered name (optional)" {...register("legalName")} />
              </F>
            </div>
            <F name="description" label="Business description">
              <Textarea
                rows={3}
                placeholder="A short introduction devotees will see on your profile."
                {...register("description")}
              />
            </F>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Owner details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <F name="ownerName" label="Owner name" required>
                <Input {...register("ownerName")} />
              </F>
              <F name="phone" label="Contact number" required>
                <Input inputMode="numeric" maxLength={10} {...register("phone")} />
              </F>
              <F name="whatsapp" label="WhatsApp number">
                <Input inputMode="numeric" maxLength={10} {...register("whatsapp")} />
              </F>
              <F name="email" label="Email address" required>
                <Input type="email" {...register("email")} />
              </F>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Business info</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <F name="experience" label="Years of experience">
                <Input placeholder="e.g. 8" {...register("experience")} />
              </F>
              <F name="website" label="Website URL">
                <Input placeholder="https://" {...register("website")} />
              </F>
              <F name="gst" label="GST number">
                <Input placeholder="Optional" {...register("gst")} />
              </F>
            </div>
          </section>
        </div>
      </StepShell>
    </form>
  );
}
