import { useState } from "react";
import { CalendarClock, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { WORKING_DAYS } from "@/types/serviceManagement";
import type { AvailabilitySettings } from "@/types/serviceManagement";
import { serviceManagementStore, useServiceManagementStore } from "@/stores/serviceManagementStore";
import { Field, SectionTitle } from "@/components/service-management/ui";
import { cn } from "@/lib/utils";

export default function AvailabilityPage() {
  const { availability } = useServiceManagementStore();
  const [form, setForm] = useState<AvailabilitySettings>(availability);

  const toggleDay = (d: string) => {
    setForm({
      ...form,
      workingDays: form.workingDays.includes(d)
        ? form.workingDays.filter((x) => x !== d)
        : [...form.workingDays, d],
    });
  };

  const save = () => {
    serviceManagementStore.setAvailability(form);
    toast.success("Availability settings saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
        <p className="text-sm text-muted-foreground">
          Manage working hours, festival availability, and advance booking requirements.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 p-5 sm:p-6">
          <section className="space-y-3">
            <SectionTitle icon={CalendarClock} title="Working Days" />
            <div className="flex flex-wrap gap-1.5">
              {WORKING_DAYS.map((d) => {
                const on = form.workingDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs font-medium transition",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:bg-muted",
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start Time">
              <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </Field>
            <Field label="End Time">
              <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </Field>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Festival Availability</p>
                <p className="text-xs text-muted-foreground">Available during festival seasons</p>
              </div>
              <Switch
                checked={form.festivalAvailability}
                onCheckedChange={(v) => setForm({ ...form, festivalAvailability: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Holiday Availability</p>
                <p className="text-xs text-muted-foreground">Available on public holidays</p>
              </div>
              <Switch
                checked={form.holidayAvailability}
                onCheckedChange={(v) => setForm({ ...form, holidayAvailability: v })}
              />
            </div>
          </div>

          <Field label="Advance Booking Required (days)">
            <Input
              type="number"
              min={0}
              value={form.advanceBookingDays}
              onChange={(e) => setForm({ ...form, advanceBookingDays: e.target.value })}
              placeholder="e.g. 2"
            />
            <p className="text-xs text-muted-foreground">
              Example: Book at least {form.advanceBookingDays || "2"} days before event.
            </p>
          </Field>

          <Field label="Notes">
            <Textarea
              rows={3}
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional availability notes..."
            />
          </Field>

          <div className="flex justify-end border-t pt-4">
            <Button onClick={save} className="gap-1.5">
              <Save className="h-4 w-4" /> Save Availability
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
