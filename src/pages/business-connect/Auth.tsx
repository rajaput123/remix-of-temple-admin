import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BCAuthLayout, AuthFieldLabel, AuthPrimaryButton } from "@/components/business-connect/auth/BCAuthLayout";
import { MobileField } from "@/components/business-connect/auth/MobileField";
import { OtpField } from "@/components/business-connect/auth/OtpField";
import { BC_REGISTRATION_TYPES } from "@/data/bcRegistrationTypes";
import {
  accountExists,
  demoSendOtp,
  demoVerifyOtp,
  isValidMobile,
  registerAccount,
} from "@/lib/bcAuthService";
import { toast } from "sonner";

type Step = "mobile" | "otp" | "business" | "done";

export default function BCAuth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  function startCooldown() {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  function handleMobile(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidMobile(mobile)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (accountExists(mobile)) {
      setError("Already registered. Please sign in.");
      return;
    }
    setError("");
    demoSendOtp(mobile);
    toast.success("OTP sent");
    setStep("otp");
    startCooldown();
  }

  function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!demoVerifyOtp(otp)) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setError("");
    setStep("business");
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) {
      setError("Business name is required");
      return;
    }
    if (!businessType) {
      setError("Select your business type");
      return;
    }
    registerAccount({
      mobile,
      mpin: "0000",
      businessName: businessName.trim(),
      businessType,
    });
    setStep("done");
    toast.success("Account created!");
  }

  if (step === "done") {
    return (
      <BCAuthLayout title="You're all set!" subtitle="Your business account is ready.">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <p className="text-sm text-slate-600">
            Welcome, <strong>{businessName}</strong>. Sign in with your mobile number to continue.
          </p>
          <AuthPrimaryButton type="button" onClick={() => navigate("/login", { state: { mobile } })}>
            Go to Login
          </AuthPrimaryButton>
        </div>
      </BCAuthLayout>
    );
  }

  const config = {
    mobile: { title: "Create Account", subtitle: "Enter your mobile number to register.", n: 1 },
    otp: { title: "Verify OTP", subtitle: "Enter the 6-digit code we sent you.", n: 2 },
    business: { title: "Your Business", subtitle: "Just name and type — add more details later.", n: 3 },
    done: { title: "", subtitle: "", n: 3 },
  }[step];

  return (
    <BCAuthLayout
      title={config.title}
      subtitle={config.subtitle}
      step={config.n}
      totalSteps={3}
      onBack={
        step === "mobile"
          ? () => navigate("/login")
          : step === "otp"
            ? () => setStep("mobile")
            : () => setStep("otp")
      }
      backLabel={step === "mobile" ? "Login" : "Back"}
    >
      {step === "mobile" && (
        <form onSubmit={handleMobile} className="space-y-5">
          <MobileField value={mobile} onChange={setMobile} error={error} autoFocus />
          <AuthPrimaryButton>Continue</AuthPrimaryButton>
          <p className="text-center text-sm text-slate-500">
            Have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleOtp} className="space-y-5">
          <OtpField value={otp} onChange={setOtp} error={error} />
          <AuthPrimaryButton>Verify</AuthPrimaryButton>
          <div className="text-center">
            <button
              type="button"
              disabled={resendCooldown > 0}
              onClick={() => {
                demoSendOtp(mobile);
                toast.success("OTP resent");
                startCooldown();
              }}
              className={cn(
                "text-sm font-medium",
                resendCooldown > 0 ? "text-slate-400" : "text-primary hover:underline",
              )}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      {step === "business" && (
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <AuthFieldLabel htmlFor="name" required>
              Business Name
            </AuthFieldLabel>
            <Input
              id="name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business name"
              className="h-12 rounded-xl"
              autoFocus
            />
          </div>
          <div>
            <AuthFieldLabel required>Business Type</AuthFieldLabel>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {BC_REGISTRATION_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setBusinessType(id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-medium transition",
                    businessType === id
                      ? "border-[#2b62ef] bg-[#2b62ef]/5 text-[#2b62ef]"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          </div>
          <AuthPrimaryButton>Create Account</AuthPrimaryButton>
        </form>
      )}
    </BCAuthLayout>
  );
}
