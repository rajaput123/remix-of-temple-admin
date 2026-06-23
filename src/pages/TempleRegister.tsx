import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { resetTempleOnboarding } from "@/lib/onboardingFlow";
import { markBusinessProfileSetupRequired } from "@/lib/businessProfileOnboarding";
import { prepareBusinessRegistrationOnboarding } from "@/lib/businessOnboardingFlow";
import { saveMinimalRegistration } from "@/lib/registrationProfileBridge";
import { businessProfileStore } from "@/stores/businessProfileStore";

const TempleRegister = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [mpin, setMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  const mpinReady = mpin.length === 4 && confirmMpin.length === 4 && mpin === confirmMpin;
  const canCreate =
    otpVerified && mpinReady && termsAccepted && mobile.replace(/\D/g, "").length === 10;

  const handleCreateAccount = () => {
    if (!canCreate) return;
    setSaving(true);
    const cleanMobile = mobile.replace(/\D/g, "");
    saveMinimalRegistration(cleanMobile, mpin);
    businessProfileStore.clearForNewRegistration();
    resetTempleOnboarding();
    prepareBusinessRegistrationOnboarding();
    markBusinessProfileSetupRequired();
    toast.success("Account created successfully", {
      description: "Sign in with your mobile and MPIN. You'll set up your business profile next.",
      duration: 6000,
    });
    setTimeout(() => {
      setSaving(false);
      navigate("/login", { state: { mobile: cleanMobile, newAccount: true } });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-sm font-semibold text-foreground">Create account</h1>
          <div className="w-14" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Quick signup</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verify your mobile and set an MPIN. Business details, documents, and GST go in your
              business profile — no approval wait.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Mobile number *</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-muted-foreground text-sm font-medium">
                  +91
                </span>
                <Input
                  placeholder="98765 43210"
                  className="rounded-l-none h-10"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  disabled={otpVerified}
                />
              </div>
            </div>

            {!otpVerified && !otpSent && (
              <Button
                onClick={() => setOtpSent(true)}
                disabled={mobile.length < 10}
                className="w-full h-10"
              >
                Send OTP
              </Button>
            )}

            {otpSent && !otpVerified && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/40 border border-border">
                <Label className="text-sm font-medium">Enter 6-digit OTP</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="••••••"
                    className="text-center tracking-[0.3em] font-mono h-10"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                  <Button
                    onClick={() => {
                      if (otp.length === 6) setOtpVerified(true);
                    }}
                    disabled={otp.length < 6}
                    className="h-10 px-5 shrink-0"
                  >
                    Verify
                  </Button>
                </div>
              </div>
            )}

            {otpVerified && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground font-medium">Mobile verified</span>
              </div>
            )}

            {otpVerified && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Set MPIN *</Label>
                  <p className="text-xs text-muted-foreground">4-digit PIN for quick login</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="password"
                    placeholder="••••"
                    className="h-10 text-center tracking-[0.4em] font-mono"
                    maxLength={4}
                    value={mpin}
                    onChange={(e) => setMpin(e.target.value.replace(/\D/g, ""))}
                  />
                  <Input
                    type="password"
                    placeholder="••••"
                    className="h-10 text-center tracking-[0.4em] font-mono"
                    maxLength={4}
                    value={confirmMpin}
                    onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                {mpin.length === 4 && confirmMpin.length === 4 && mpin !== confirmMpin && (
                  <p className="text-xs text-destructive font-medium">MPINs do not match</p>
                )}
              </>
            )}
          </div>

          <div className="rounded-lg border border-dashed bg-muted/30 p-4 flex gap-3">
            <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              After signup you&apos;ll set up your business name, location, KYC, GST, and photos in
              <span className="font-medium text-foreground"> Business Profile</span>.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={termsAccepted}
              onCheckedChange={(c) => setTermsAccepted(Boolean(c))}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground leading-relaxed">
              I agree to the{" "}
              <span className="underline text-primary font-medium">Terms of Service</span> and{" "}
              <span className="underline text-primary font-medium">Privacy Policy</span>.
            </span>
          </label>

          <Button
            onClick={handleCreateAccount}
            disabled={!canCreate || saving}
            className="w-full h-11 gap-2"
            size="lg"
          >
            {saving ? "Creating account…" : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default TempleRegister;
