"use client";

import { createClient } from "@/lib/supabase/browser-client";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type AuthCtx = {
  supabase: SupabaseClient;
  user: User | null;
  ready: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setBootError("NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 가 없습니다.");
      setReady(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          setBootError(error.message);
          setReady(true);
          return;
        }
        const {
          data: { session: s2 },
        } = await supabase.auth.getSession();
        if (!cancelled) setUser(s2?.user ?? null);
      } else {
        setUser(session.user);
      }
      if (!cancelled) setReady(true);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 text-zinc-500">
        Loading…
      </div>
    );
  }

  if (bootError || !supabase) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6 text-center text-sm">
        <p className="font-semibold text-red-800">Supabase 설정 필요</p>
        <p className="mt-2 text-zinc-700">{bootError}</p>
        <p className="mt-4 text-xs leading-relaxed text-zinc-500">
          프로젝트 루트에 `.env.local`을 만들고 NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY 를 넣은 뒤 서버를 다시 실행하세요.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 text-sm text-zinc-600">
        로그인 정보를 불러오는 중…
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ supabase, user, ready: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
