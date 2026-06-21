import { Building2, ChevronRight, Plus, Shield, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-xl ring-1 ring-black/5">
        <div className="grid lg:grid-cols-2">
          {/* Visual panel */}
          <div className="relative flex flex-col justify-between bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 p-8 text-white min-h-[320px] lg:min-h-[420px]">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-400 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-stone-500 blur-3xl" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                One profile per account
              </div>
              <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Build your
                <br />
                <span className="text-amber-300">marketplace presence</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-300">
                Showcase your temple services, reach devotees across Karnataka, and earn a verified trust badge.
              </p>
            </div>
            <div className="relative mt-8 grid h-20 w-20 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
              <Building2 className="h-10 w-10 text-amber-200" />
            </div>
          </div>

          {/* CTA panel */}
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-stone-500">Get started</p>
            <h3 className="mt-2 text-xl font-bold text-stone-900">Create your business profile</h3>
            <p className="mt-2 text-sm text-stone-500">
              Takes about 5 minutes. You can save as draft and publish when ready.
            </p>

            <ul className="mt-8 space-y-4">
              {STEPS.map(({ icon: Icon, title, desc }, i) => (
                <li key={title} className="flex items-center gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-stone-100 text-stone-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900">
                      <span className="mr-2 text-stone-400">{i + 1}.</span>
                      {title}
                    </p>
                    <p className="text-xs text-stone-500">{desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-stone-300" />
                </li>
              ))}
            </ul>

            <Button onClick={onCreate} size="lg" className="mt-10 w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" /> Create profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
