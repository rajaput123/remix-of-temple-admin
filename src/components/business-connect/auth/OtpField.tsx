import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthFieldLabel } from "@/components/business-connect/auth/BCAuthLayout";

interface OtpFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function OtpField({ value, onChange, error }: OtpFieldProps) {
  return (
    <div className="space-y-2">
      <AuthFieldLabel required>OTP</AuthFieldLabel>
      <div className="flex justify-center sm:justify-start">
        <InputOTP maxLength={6} value={value} onChange={onChange}>
          <InputOTPGroup className="gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="h-12 w-11 sm:h-14 sm:w-12 rounded-xl border-slate-200 text-lg font-semibold"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      {error && <p className="text-xs text-red-600 text-center sm:text-left">{error}</p>}
    </div>
  );
}
