import { useEffect, useRef, useState } from "react";
import { Check, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/service-management/ui";
import { lookupPincode } from "@/lib/pincodeLookup";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ProfileLocationValue {
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  mapLink?: string;
}

interface ProfileLocationFieldProps {
  value: ProfileLocationValue;
  onChange: (patch: Partial<ProfileLocationValue>) => void;
}

export function ProfileLocationField({ value, onChange }: ProfileLocationFieldProps) {
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [pinHint, setPinHint] = useState<string | null>(null);
  const lastLookup = useRef("");

  const runLookup = async (pin: string) => {
    const clean = pin.replace(/\D/g, "");
    if (clean.length !== 6) return;

    setLoading(true);
    setLookupError("");
    setPinHint(null);

    const result = await lookupPincode(clean);
    setLoading(false);

    if (!result) {
      setLookupError("Pincode not found — check the number and try again");
      toast.error("No location found for this pincode");
      return;
    }

    onChange({
      city: result.city,
      district: result.district,
      state: result.state,
    });
    setPinHint([result.city, result.district, result.state].filter(Boolean).join(", "));
  };

  useEffect(() => {
    const clean = value.pincode.replace(/\D/g, "");
    if (clean.length !== 6 || clean === lastLookup.current) return;

    const timer = setTimeout(() => {
      lastLookup.current = clean;
      void runLookup(clean);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lookup when pincode changes
  }, [value.pincode]);

  const handlePincodeChange = (raw: string) => {
    const clean = raw.replace(/\D/g, "").slice(0, 6);
    if (clean !== value.pincode.replace(/\D/g, "")) {
      lastLookup.current = "";
      if (clean.length < 6) {
        onChange({ pincode: clean, city: "", district: "", state: "" });
        setPinHint(null);
        setLookupError("");
        return;
      }
    }
    onChange({ pincode: clean });
  };

  const locationResolved = Boolean(value.city && value.state);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">Business location</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Office, shop, or base of operations — shown on your marketplace profile.
        </p>
      </div>

      <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4">
        <Field label="Business pincode *" hint="Enter 6-digit pincode — city, district & state fill automatically">
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Input
                inputMode="numeric"
                maxLength={6}
                value={value.pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="6-digit pincode"
                className="h-10 font-mono tracking-wider"
              />
              {loading && (
                <Loader2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-10 shrink-0 gap-1.5 px-3"
              disabled={loading || value.pincode.replace(/\D/g, "").length !== 6}
              onClick={() => {
                lastLookup.current = "";
                void runLookup(value.pincode);
              }}
            >
              <MapPin className="size-3.5" />
              Lookup
            </Button>
          </div>
        </Field>
        {lookupError && <p className="mt-2 text-[11px] text-destructive">{lookupError}</p>}
        {pinHint && !lookupError && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-primary">
            <Check className="size-3 shrink-0" />
            <span>
              Found: <span className="font-medium">{pinHint}</span>
            </span>
          </p>
        )}
      </div>

      {locationResolved && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="City / locality">
            <Input value={value.city} readOnly className="h-9 bg-muted/40 text-sm" />
          </Field>
          <Field label="District">
            <Input value={value.district} readOnly className="h-9 bg-muted/40 text-sm" />
          </Field>
          <Field label="State">
            <Input value={value.state} readOnly className="h-9 bg-muted/40 text-sm" />
          </Field>
        </div>
      )}

      <Field label="Business street address *" hint="Shop, office, or workplace — building, street, landmark">
        <Textarea
          rows={2}
          value={value.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="e.g. 42, Industrial Layout, Jayanagar 4th Block"
          className={cn(!locationResolved && "opacity-80")}
        />
      </Field>

      <Field label="Google Maps link (optional)" hint="Link to your business on Google Maps">
        <Input
          value={value.mapLink ?? ""}
          onChange={(e) => onChange({ mapLink: e.target.value })}
          placeholder="https://maps.google.com/..."
          className="h-10"
        />
      </Field>
    </div>
  );
}
