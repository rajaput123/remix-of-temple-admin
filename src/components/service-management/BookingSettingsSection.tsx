import { CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SectionTitle } from "./ui";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessService } from "@/types/serviceManagement";
import { BOOKING_SETTING_OPTIONS } from "./serviceFormConstants";

interface BookingSettingsSectionProps {
  booking: BusinessService["booking"];
  onChange: (patch: Partial<BusinessService["booking"]>) => void;
}

export function BookingSettingsSection({ booking, onChange }: BookingSettingsSectionProps) {
  const enabledCount = BOOKING_SETTING_OPTIONS.filter((o) => booking[o.key]).length;

  return (
    <section className="space-y-3">
      <SectionTitle
        icon={Settings2}
        title="Booking settings"
        desc="Control how devotees can reach you. Turn a switch on to enable that option on the live listing."
      />

      {enabledCount > 0 && (
        <div className="rounded-md border border-success/30 bg-success/5 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-success">{enabledCount} enabled</span>
          {" — "}
          {BOOKING_SETTING_OPTIONS.filter((o) => booking[o.key])
            .map((o) => o.label)
            .join(", ")}
          {" will appear for devotees."}
        </div>
      )}

      <div className="space-y-2">
        {BOOKING_SETTING_OPTIONS.map(({ key, label, description, whenEnabled }) => {
          const on = booking[key];
          return (
            <div
              key={key}
              className={cn(
                "rounded-lg border p-3 transition-colors",
                on ? "border-primary/25 bg-primary/[0.03]" : "bg-background",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    {on && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                        <CheckCircle2 className="size-3" /> On
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                  {on && (
                    <p className="mt-1.5 text-xs text-foreground/80">
                      <span className="font-medium">When enabled: </span>
                      {whenEnabled}
                    </p>
                  )}
                </div>
                <Switch checked={on} onCheckedChange={(v) => onChange({ [key]: v })} aria-label={label} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
