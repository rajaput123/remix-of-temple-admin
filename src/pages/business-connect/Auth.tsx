import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BCHeader } from "@/components/business-connect/BCHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { bcStore } from "@/stores/businessConnectStore";
import { toast } from "sonner";
import { ArrowRight, Mail, Phone } from "lucide-react";

export default function BCAuth() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");

  function sendOtp() {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setOtpSent(true);
    toast.success("OTP sent (demo: enter any 6 digits)");
  }

  function verifyMobile() {
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    bcStore.set({ account: { mobile, verified: true } });
    navigate("/business-connect/onboarding/business");
  }

  function continueEmail() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    bcStore.set({ account: { email, verified: true } });
    navigate("/business-connect/onboarding/business");
  }

  function googleMock() {
    bcStore.set({ account: { email: "owner@example.com", verified: true } });
    navigate("/business-connect/onboarding/business");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <BCHeader showCta={false} />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-5 p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Create your business account</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                One account to manage your profile and listings.
              </p>
            </div>

            <Tabs defaultValue="mobile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mobile">
                  <Phone className="mr-1 h-3.5 w-3.5" /> Mobile
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="mr-1 h-3.5 w-3.5" /> Email
                </TabsTrigger>
                <TabsTrigger value="google">Google</TabsTrigger>
              </TabsList>

              <TabsContent value="mobile" className="space-y-3 pt-4">
                <div className="space-y-1.5">
                  <Label>Mobile number</Label>
                  <Input
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                {otpSent && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>OTP</Label>
                      <button
                        type="button"
                        onClick={sendOtp}
                        className="text-xs text-primary hover:underline"
                      >
                        Resend
                      </button>
                    </div>
                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                )}
                {otpSent ? (
                  <Button className="w-full" onClick={verifyMobile}>
                    Verify & continue <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="w-full" onClick={sendOtp}>
                    Send OTP
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="email" className="space-y-3 pt-4">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={continueEmail}>
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </TabsContent>

              <TabsContent value="google" className="space-y-3 pt-4">
                <p className="text-sm text-muted-foreground">
                  Continue with your Google account (demo flow — instantly signs in).
                </p>
                <Button variant="outline" className="w-full" onClick={googleMock}>
                  Continue with Google
                </Button>
              </TabsContent>
            </Tabs>

            <p className="text-center text-xs text-muted-foreground">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
