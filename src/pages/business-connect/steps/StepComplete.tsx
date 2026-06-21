import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { computeCompletion, useBCStore } from "@/stores/businessConnectStore";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function StepComplete() {
  const state = useBCStore();
  const completion = computeCompletion(state);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">You're all set!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your business profile is ready. You can polish it anytime from your dashboard.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-xl border bg-muted/30 p-4 text-left">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Business</div>
        <div className="mt-0.5 text-sm font-semibold">{state.info?.name ?? "Your business"}</div>
        <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          Profile completion
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          <span className="text-xs font-semibold">{completion}%</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link to="/business-connect/dashboard">
            Go to dashboard <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/business-connect/profile">View profile</Link>
        </Button>
      </div>
    </div>
  );
}
