import { Building2, ChevronRight, MapPin, Plus, Shield, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profileCardClass, profileTypography as t } from "@/components/business-profile/profileStyles";
import { hasRegistrationData } from "@/lib/registrationProfileBridge";
import { cn } from "@/lib/utils";

interface ProfileEmptyStateProps {
  onCreate: () => void;
  onLoadSample?: () => void;
  mandatory?: boolean;
}

const STEPS = [
  { icon: Building2, title: "Business info", desc: "Name, category & about" },
  { icon: Users, title: "Contact", desc: "Owner phone & email" },
  { icon: MapPin, title: "Business location", desc: "Office, shop or service base" },
  { icon: Shield, title: "Verification", desc: "KYC documents for identity check" },
];

export function ProfileEmptyState({ onCreate, onLoadSample, mandatory }: ProfileEmptyStateProps) {
  const fromRegistration = hasRegistrationData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {mandatory && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          Required: complete your business profile before accessing other modules.
        </div>
      )}
      <div className={cn("overflow-hidden", profileCardClass)}>
        <div className="grid lg:grid-cols-2">
          <div className="relative flex min-h-[320px] flex-col justify-between bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60 p-8 text-primary-foreground lg:min-h-[420px]">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                One profile per account
              </div>
              <h2 className={cn(t.title, "mt-6 text-primary-foreground sm:text-xl")}>
                Build your marketplace presence
              </h2>
              <p className={cn("mt-4 max-w-sm leading-relaxed text-primary-foreground/85", t.desc)}>
                List your services and reach customers on the Digidevalaya marketplace.
              </p>
            </div>
            <div className="relative mt-8 grid h-16 w-16 place-items-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-md">
              <Building2 className="h-8 w-8" />
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-10">
            <p className={t.eyebrow}>Get started</p>
            <h3 className={cn("mt-2", t.title)}>Create your business profile</h3>
            <p className={cn("mt-2", t.muted)}>
              Takes about 5 minutes. You can save as draft and publish when ready.
              {fromRegistration && (
                <span className="mt-1 block text-primary">
                  Your login mobile is pre-filled — add business details below.
                </span>
              )}
            </p>

            <ul className="mt-8 space-y-4">
              {STEPS.map(({ icon: Icon, title, desc }, i) => (
                <li key={title} className="flex items-center gap-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(t.section, "text-sm")}>
                      <span className="mr-2 font-mono text-xs text-muted-foreground">{i + 1}.</span>
                      {title}
                    </p>
                    <p className={t.desc}>{desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button onClick={onCreate} size="sm" className="h-9 gap-2 text-xs">
                <Plus className="h-4 w-4" /> {mandatory ? "Start required setup" : "Create profile"}
              </Button>
              {onLoadSample && (
                <Button onClick={onLoadSample} size="sm" variant="outline" className="h-9 gap-2 text-xs">
                  Load sample data
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
