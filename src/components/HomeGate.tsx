"use client";

import { useAuth } from "@/contexts/auth-context";
import { fetchDisplayName } from "@/lib/app-data";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function HomeGate() {
  const router = useRouter();
  const { supabase, user, ready } = useAuth();

  useEffect(() => {
    if (!ready || !user) return;

    let cancelled = false;
    (async () => {
      try {
        const name = await fetchDisplayName(supabase, user.id);
        if (cancelled) return;
        if (!name) router.replace("/onboarding");
        else router.replace("/friends");
      } catch {
        if (!cancelled) router.replace("/onboarding");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, user, supabase, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 text-zinc-500">
      Loading…
    </div>
  );
}
