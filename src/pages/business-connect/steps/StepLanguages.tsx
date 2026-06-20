import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StepShell } from "@/components/business-connect/StepShell";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LANGUAGES, COMM_CHANNELS } from "@/data/businessTypes";
import { bcStore, useBCStore } from "@/stores/businessConnectStore";
import { toast } from "sonner";

export default function StepLanguages() {
  const navigate = useNavigate();
  const stored = useBCStore((s) => s.comms);
  const [languages, setLanguages] = useState<string[]>(stored?.languages ?? ["English"]);
  const [channels, setChannels] = useState<string[]>(stored?.channels ?? ["Phone Calls"]);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function next() {
    if (languages.length === 0) return toast.error("Select at least one language");
    if (channels.length === 0) return toast.error("Select at least one channel");
    bcStore.set({ comms: { languages, channels } });
    bcStore.markStep("languages");
    navigate("/business-connect/onboarding/verification");
  }

  return (
    <StepShell
      title="Languages & communication"
      subtitle="Where will devotees reach you, and in which languages?"
      backTo="/business-connect/onboarding/location"
      onNext={next}
    >
      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Languages supported</h2>
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
  );
}
