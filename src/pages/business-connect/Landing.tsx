import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BCHeader } from "@/components/business-connect/BCHeader";
import { BCFooter } from "@/components/business-connect/BCFooter";
import { BusinessTypeCard } from "@/components/business-connect/BusinessTypeCard";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Search,
  ArrowRight,
  UserPlus,
  FileText,
  Globe2,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Search,
    title: "Be discoverable",
    desc: "Surface in AI-powered temple ecosystem search, the moment devotees need you.",
  },
  {
    icon: ShieldCheck,
    title: "Build trust",
    desc: "Verified badge, documents, and reviews — show devotees you're the real deal.",
  },
  {
    icon: TrendingUp,
    title: "Grow bookings",
    desc: "Reach temples, devotees, and event organisers across India.",
  },
];

const STEPS = [
  { icon: UserPlus, label: "Register" },
  { icon: FileText, label: "Add details" },
  { icon: ShieldCheck, label: "Get verified" },
  { icon: Globe2, label: "Go live" },
];

export default function BCLanding() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BCHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container relative mx-auto grid items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Now welcoming temple-ecosystem businesses
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Grow your temple-ecosystem business with{" "}
              <span className="text-primary">Digidevalaya</span>.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              Priests, caterers, decorators, photographers, lodges and more — create a verified
              business profile and get discovered by devotees and temples across India.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/business-connect/auth?mode=register">
                  Register Business <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/business-connect/auth">Login</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/business-connect/explore">Explore Businesses</Link>
              </Button>
            </div>
            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
              <span>Trusted by businesses across 12 categories</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {BUSINESS_TYPES.slice(0, 8).map((t) => (
              <div
                key={t.id}
                className="flex flex-col items-center gap-2 rounded-lg border bg-card p-3 text-center"
              >
                <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <t.icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-medium leading-tight">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Why Business Connect</h2>
          <p className="mt-2 text-muted-foreground">
            Everything you need to be visible, credible, and bookable.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-xl border bg-card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <b.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Categories we support</h2>
            <p className="mt-2 text-muted-foreground">
              Built for every business that serves the temple economy.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {BUSINESS_TYPES.filter((t) => t.id !== "other").map((t) => (
              <BusinessTypeCard key={t.id} icon={t.icon} label={t.label} />
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Live in 4 steps</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.label} className="rounded-xl border bg-card p-5">
              <div className="text-xs font-semibold text-muted-foreground">Step {i + 1}</div>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
                  <s.icon className="h-4 w-4" />
                </span>
                <span className="font-semibold">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild size="lg">
            <Link to="/business-connect/auth?mode=register">
              Get started — it&apos;s free <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <BCFooter />
    </div>
  );
}
