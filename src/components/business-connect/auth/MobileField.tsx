import { Input } from "@/components/ui/input";
import { AuthFieldLabel } from "@/components/business-connect/auth/BCAuthLayout";

interface MobileFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  error?: string;
  autoFocus?: boolean;
}

export function MobileField({ value, onChange, id = "mobile", error, autoFocus }: MobileFieldProps) {
  return (
    <div className="space-y-1">
      <AuthFieldLabel htmlFor={id} required>
        Mobile Number
      </AuthFieldLabel>
      <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#2563eb]/20 focus-within:border-[#2563eb]">
        <span className="inline-flex items-center px-3.5 bg-slate-50 text-sm font-medium text-slate-600 border-r border-slate-200">
          +91
        </span>
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          autoFocus={autoFocus}
          maxLength={10}
          placeholder="98765 43210"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
          className="h-12 border-0 rounded-none focus-visible:ring-0 text-[16px] sm:text-[15px]"
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
