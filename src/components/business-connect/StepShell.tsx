import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  backTo?: string;
  nextLabel?: string;
  onNext?: () => void;
  rightSlot?: React.ReactNode;
}

export function StepShell({
  title,
  subtitle,
  children,
  backTo,
  nextLabel = "Continue",
  onNext,
  rightSlot,
}: Props) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </header>
      <div className="rounded-xl border bg-card p-5 md:p-6">{children}</div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {backTo ? (
          <Button asChild variant="ghost">
            <Link to={backTo}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Link>
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {rightSlot}
          {onNext && (
            <Button onClick={onNext}>
              {nextLabel} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
