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
import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

const SLOTS = [
  { type: "aadhaar", label: "Aadhaar copy" },
  { type: "pan", label: "PAN copy" },
  { type: "registration", label: "Business registration" },
] as const;

export default function StepVerification() {
  const navigate = useNavigate();
  const stored = useBCStore((s) => s.verification);
  const [aadhaar, setAadhaar] = useState(stored?.aadhaar ?? "");
  const [pan, setPan] = useState(stored?.pan ?? "");
  const [docs, setDocs] = useState<BCDoc[]>(stored?.docs ?? []);
  const [status] = useState<VerificationStatus>(stored?.status ?? "pending");
  const [showOther, setShowOther] = useState(false);

  function setDocsFor(type: string, urls: string[]) {
    const others = docs.filter((d) => d.type !== type);
    setDocs([
      ...others,
      ...urls.map((u, i) => ({ type, name: `${type}-${i + 1}`, dataUrl: u })),
    ]);
  }

  function save(nextStatus: VerificationStatus) {
    bcStore.set({ verification: { aadhaar, pan, docs, status: nextStatus } });
    bcStore.markStep("verification");
    navigate("/business-connect/onboarding/plan");
  }

  return (
    <StepShell
      title="Verify your business"
      subtitle="Verified businesses get a trust badge and appear higher in search."
      backTo="/business-connect/onboarding/location"
      rightSlot={
        <Button variant="ghost" size="sm" onClick={() => save("skipped")}>
          Skip for now
        </Button>
      }
      onNext={() => save(docs.length > 0 ? "review" : "pending")}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-lg border bg-gradient-to-br from-primary/5 to-transparent px-3 py-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <div>
              <div className="text-xs font-medium">Verification status</div>
              <div className="text-[10px] text-muted-foreground">Optional but recommended</div>
            </div>
          </div>
          <VerificationBadge status={status} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Aadhaar number</Label>
            <Input
              className="h-10 text-sm tracking-wider"
              placeholder="XXXX XXXX XXXX"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">PAN number</Label>
            <Input
              className="h-10 text-sm tracking-wider uppercase"
              placeholder="ABCDE1234F"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Upload documents</Label>
          <div className="grid gap-2.5 md:grid-cols-3">
            {SLOTS.map((slot) => (
              <FileDropzone
                key={slot.type}
                label={slot.label}
                values={docs.filter((d) => d.type === slot.type).map((d) => d.dataUrl)}
                onChange={(urls) => setDocsFor(slot.type, urls)}
                max={1}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-muted/20">
          <button
            type="button"
            onClick={() => setShowOther((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium"
          >
            <span>Other supporting documents (optional)</span>
            {showOther ? (
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          {showOther && (
            <div className="border-t bg-background p-3">
              <FileDropzone
                label="GST certificate, awards, references, etc."
                multiple
                max={6}
                values={docs.filter((d) => d.type === "other").map((d) => d.dataUrl)}
                onChange={(urls) => setDocsFor("other", urls)}
              />
            </div>
          )}
        </div>
      </div>
    </StepShell>
  );
}
