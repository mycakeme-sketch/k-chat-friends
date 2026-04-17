import type { ReactNode } from "react";

/** Narrow column (~448px) centered on large screens — use for all main app surfaces. */
export function MobileShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto flex min-h-dvh w-full max-w-md flex-col bg-zinc-50 text-zinc-900 shadow-2xl shadow-zinc-900/10 ${className}`}
    >
      {children}
    </div>
  );
}

/** Full-viewport side gutters on desktop; inner column matches MobileShell width. */
export function PaddedAppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-zinc-200">
      {children}
    </div>
  );
}
