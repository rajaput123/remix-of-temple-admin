import type { ReactNode } from "react";

interface BusinessProfileShellProps {
  children: ReactNode;
}

/** Minimal canvas — profile view owns layout; uses workspace shell tokens. */
export default function BusinessProfileShell({ children }: BusinessProfileShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
