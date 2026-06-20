import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { computeCompletion, useBCStore } from "@/stores/businessConnectStore";
import { CheckCircle2 } from "lucide-react";

export default function StepComplete() {
  const state = useBCStore();
  const completion = computeCompletion(state);

  return (
    <Card className="h-full border-primary/30">
      <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Congratulations!</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your business profile has been created successfully.
          </p>
        </div>

        <div className="mx-auto w-full max-w-sm rounded-lg border bg-muted/30 p-3 text-left">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Business</div>
          <div className="mt-0.5 text-sm font-semibold">{state.info?.name ?? "Your business"}</div>
          <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            Profile completion
          </div>
          <div className="mt-1 flex items-center gap-3">
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
          <Button size="sm" asChild>
            <Link to="/business-connect/dashboard">Go to dashboard</Link>
          </Button>
          <Button size="sm" asChild variant="outline">
            <Link to="/business-connect/profile">View profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
