import { Building2, ChevronRight, Plus, Shield, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profileCardClass, profileTypography as t } from "@/components/business-profile/profileStyles";
import { cn } from "@/lib/utils";

interface ProfileEmptyStateProps {
  onCreate: () => void;
}

const STEPS = [
  { icon: Building2, title: "Business info", desc: "Name, category & about" },
  { icon: Users, title: "Contact & location", desc: "Phone, email & address" },
  { icon: Shield, title: "Verification", desc: "KYC documents for trust badge" },
];

export function ProfileEmptyState({ onCreate }: ProfileEmptyStateProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
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
                Showcase your temple services, reach devotees across Karnataka, and earn a verified trust badge.
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

            <Button onClick={onCreate} size="sm" className="mt-10 h-9 w-full gap-2 text-xs sm:w-auto">
              <Plus className="h-4 w-4" /> Create profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
