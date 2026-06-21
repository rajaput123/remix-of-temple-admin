import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function BCHeader({ showCta = true }: { showCta?: boolean }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/login" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Digidevalaya</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Business Connect
            </div>
          </div>
        </Link>
        {showCta && (
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/business-connect/explore">Explore</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/business-connect/auth">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/business-connect/auth">Register</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
