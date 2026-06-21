import type { ReactNode } from "react";

interface BusinessProfileShellProps {
  children: ReactNode;
}

/** Minimal canvas — profile view owns layout, cover, and navigation. */
export default function BusinessProfileShell({ children }: BusinessProfileShellProps) {
  return (
    <div className="min-h-screen bg-stone-100">
      {children}
    </div>
  );
}
