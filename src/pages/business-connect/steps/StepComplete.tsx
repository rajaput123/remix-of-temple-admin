import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { computeCompletion, useBCStore } from "@/stores/businessConnectStore";
import { CheckCircle2 } from "lucide-react";

export default function StepComplete() {
  const state = useBCStore();
  const completion = computeCompletion(state);

  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-5 p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Congratulations!</h1>
          <p className="mt-1 text-muted-foreground">
            Your business profile has been created successfully.
          </p>
        </div>

        <div className="mx-auto max-w-sm rounded-lg border bg-muted/30 p-4 text-left">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Business</div>
          <div className="mt-1 font-semibold">{state.info?.name ?? "Your business"}</div>
          <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
            Profile completion
          </div>
          <div className="mt-1 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-sm font-semibold">{completion}%</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/business-connect/dashboard">Go to dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/business-connect/profile">View profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
