import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthFieldLabel } from "@/components/business-connect/auth/BCAuthLayout";

interface MpinFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
}

export function MpinField({ label, value, onChange, error, id }: MpinFieldProps) {
  return (
    <div className="space-y-2">
      <AuthFieldLabel htmlFor={id} required>
        {label}
      </AuthFieldLabel>
      <div className="flex justify-center sm:justify-start">
        <InputOTP
          id={id}
          maxLength={4}
          value={value}
          onChange={onChange}
          inputMode="numeric"
          pattern="[0-9]*"
        >
          <InputOTPGroup className="gap-3">
            {[0, 1, 2, 3].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="h-14 w-14 rounded-2xl border-slate-200 text-xl font-bold"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      {error && <p className="text-xs text-red-600 text-center sm:text-left">{error}</p>}
    </div>
  );
}
