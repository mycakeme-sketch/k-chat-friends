"use client";

import { MobileShell, PaddedAppFrame } from "@/components/MobileShell";
import { useAuth } from "@/contexts/auth-context";
import { deleteAllUserData, fetchDisplayName, saveDisplayName } from "@/lib/app-data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const { supabase, user } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const n = await fetchDisplayName(supabase, user.id);
      setName(n);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!user) return;
    await saveDisplayName(supabase, user.id, name);
    router.push("/friends");
  };

  const resetApp = async () => {
    if (
      !window.confirm(
        "모든 대화·친구·구독 상태가 삭제되고 이름도 지워집니다. 새 익명 계정으로 처음(온보딩)부터 다시 시작합니다. 계속할까요?",
      )
    ) {
      return;
    }
    if (!user) return;
    await deleteAllUserData(supabase, user.id);
    await supabase.auth.signOut();
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      window.alert(error.message);
      return;
    }
    router.replace("/onboarding");
  };

  return (
    <PaddedAppFrame>
      <MobileShell>
        <header className="flex items-center gap-2 border-b border-zinc-200 bg-white px-3 py-3">
          <Link href="/friends" className="text-lg text-zinc-600" aria-label="Back">
            ‹
          </Link>
          <h1 className="text-lg font-semibold">Settings</h1>
        </header>
        <div className="flex-1 space-y-4 px-4 py-6">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : (
            <>
              <label className="block">
                <span className="text-xs font-medium text-zinc-500">Display name</span>
                <input
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => void save()}
                className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white"
              >
                Save
              </button>

              <div className="border-t border-zinc-200 pt-6">
                <p className="text-xs font-medium text-zinc-500">Data</p>
                <button
                  type="button"
                  onClick={() => void resetApp()}
                  className="mt-2 w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-800 active:bg-red-100"
                >
                  앱 데이터 초기화
                </button>
                <p className="mt-2 text-xs text-zinc-400">
                  대화·추가한 친구·이름이 DB에서 지워지고 새 세션으로 온보딩으로 이동합니다.
                </p>
              </div>
            </>
          )}
        </div>
      </MobileShell>
    </PaddedAppFrame>
  );
}
