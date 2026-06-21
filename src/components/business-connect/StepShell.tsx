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
    <div className="flex h-full flex-col">
      <header className="shrink-0 px-5 py-4 md:px-7 md:py-5">
        <h1 className="text-lg font-semibold tracking-tight md:text-xl">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground md:text-[13px]">{subtitle}</p>
        )}
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-4 md:px-7 md:py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-5 py-3 md:px-7">
        {backTo ? (
          <Button asChild variant="ghost" size="sm">
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
            <Button size="sm" onClick={onNext} className="min-w-[110px]">
              {nextLabel} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
