import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StepShell } from "@/components/business-connect/StepShell";
import { BusinessTypeCard } from "@/components/business-connect/BusinessTypeCard";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { bcStore, useBCStore } from "@/stores/businessConnectStore";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function StepBusinessType() {
  const navigate = useNavigate();
  const stored = useBCStore((s) => s.businessType);
  const [category, setCategory] = useState(stored?.category ?? "");
  const [subcategory, setSubcategory] = useState(stored?.subcategory ?? "");

  const selected = BUSINESS_TYPES.find((t) => t.id === category);

  function next() {
    if (!category) {
      toast.error("Choose a business type to continue");
      return;
    }
    bcStore.set({ businessType: { category, subcategory: subcategory || undefined } });
    bcStore.markStep("type");
    navigate("/business-connect/onboarding/info");
  }

  return (
    <StepShell
      title="Choose your business type"
      subtitle="We use this to tailor your profile and search visibility."
      onNext={next}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {BUSINESS_TYPES.map((t) => (
          <BusinessTypeCard
            key={t.id}
            icon={t.icon}
            label={t.label}
            selected={category === t.id}
            onClick={() => {
              setCategory(t.id);
              setSubcategory("");
            }}
          />
        ))}
      </div>
      {selected && (
        <div className="mt-6 max-w-sm space-y-1.5">
          <Label>Subcategory</Label>
          <Select value={subcategory} onValueChange={setSubcategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a subcategory" />
            </SelectTrigger>
            <SelectContent>
              {selected.subcategories.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </StepShell>
  );
}
