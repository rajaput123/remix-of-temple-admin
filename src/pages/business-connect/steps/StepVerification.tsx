import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StepShell } from "@/components/business-connect/StepShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/business-connect/FileDropzone";
import { VerificationBadge } from "@/components/business-connect/VerificationBadge";
import { bcStore, useBCStore } from "@/stores/businessConnectStore";
import type { BCDoc, VerificationStatus } from "@/types/businessConnect";

interface DocSlot {
  type: string;
  label: string;
}
const SLOTS: DocSlot[] = [
  { type: "aadhaar", label: "Aadhaar copy" },
  { type: "pan", label: "PAN copy" },
  { type: "registration", label: "Business registration certificate" },
  { type: "gst", label: "GST certificate" },
  { type: "other", label: "Other supporting documents" },
];

export default function StepVerification() {
  const navigate = useNavigate();
  const stored = useBCStore((s) => s.verification);
  const [aadhaar, setAadhaar] = useState(stored?.aadhaar ?? "");
  const [pan, setPan] = useState(stored?.pan ?? "");
  const [docs, setDocs] = useState<BCDoc[]>(stored?.docs ?? []);
  const [status] = useState<VerificationStatus>(stored?.status ?? "pending");

  function setDocsFor(type: string, urls: string[]) {
    const others = docs.filter((d) => d.type !== type);
    const next = [
      ...others,
      ...urls.map((u, i) => ({ type, name: `${type}-${i + 1}`, dataUrl: u })),
    ];
    setDocs(next);
  }

  function save(nextStatus: VerificationStatus) {
    bcStore.set({
      verification: { aadhaar, pan, docs, status: nextStatus },
    });
    bcStore.markStep("verification");
    navigate("/business-connect/onboarding/plan");
  }

  return (
    <StepShell
      title="Verify your business"
      subtitle="Verified businesses get a badge and rank higher in search. You can skip for now."
      backTo="/business-connect/onboarding/location"
      rightSlot={
        <Button variant="ghost" size="sm" onClick={() => save("skipped")}>
          Skip for now
        </Button>
      }
      onNext={() => save(docs.length > 0 ? "review" : "pending")}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
          <span className="text-xs text-muted-foreground">Current status</span>
          <VerificationBadge status={status} />
        </div>

        <section className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Aadhaar number</Label>
            <Input
              className="h-9 text-sm"
              placeholder="XXXX XXXX XXXX"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">PAN number</Label>
            <Input
              className="h-9 text-sm"
              placeholder="ABCDE1234F"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold text-muted-foreground">Document uploads</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {SLOTS.map((slot) => (
              <FileDropzone
                key={slot.type}
                label={slot.label}
                hint={slot.type === "other" ? "Optional" : ""}
                multiple={slot.type === "other"}
                max={slot.type === "other" ? 6 : 1}
                values={docs.filter((d) => d.type === slot.type).map((d) => d.dataUrl)}
                onChange={(urls) => setDocsFor(slot.type, urls)}
              />
            ))}
          </div>
        </section>
      </div>
    </StepShell>
  );
}
