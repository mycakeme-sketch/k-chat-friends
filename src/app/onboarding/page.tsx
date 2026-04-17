"use client";

import { MobileShell, PaddedAppFrame } from "@/components/MobileShell";
import { useAuth } from "@/contexts/auth-context";
import { saveDisplayName } from "@/lib/app-data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const { supabase, user } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    const n = name.trim();
    if (!n || !user) {
      // #region agent log
      fetch("http://127.0.0.1:7758/ingest/41f67bdf-05a4-4700-866e-55deeaf28bf6", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "6ffeb9" },
        body: JSON.stringify({
          sessionId: "6ffeb9",
          location: "onboarding/page.tsx:submit",
          message: "submit early exit",
          data: { hypothesisId: "H2", hasUser: !!user, nameLen: n.length },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (!user) setErr("로그인 세션이 없습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.");
      return;
    }
    setErr(null);
    setSaving(true);
    try {
      // #region agent log
      fetch("http://127.0.0.1:7758/ingest/41f67bdf-05a4-4700-866e-55deeaf28bf6", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "6ffeb9" },
        body: JSON.stringify({
          sessionId: "6ffeb9",
          location: "onboarding/page.tsx:beforeSave",
          message: "saveDisplayName start",
          data: { hypothesisId: "H1", userIdPrefix: user.id.slice(0, 8) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      await saveDisplayName(supabase, user.id, n);
      // #region agent log
      fetch("http://127.0.0.1:7758/ingest/41f67bdf-05a4-4700-866e-55deeaf28bf6", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "6ffeb9" },
        body: JSON.stringify({
          sessionId: "6ffeb9",
          location: "onboarding/page.tsx:afterSave",
          message: "saveDisplayName ok",
          data: { hypothesisId: "H1" },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      router.replace("/friends");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // #region agent log
      fetch("http://127.0.0.1:7758/ingest/41f67bdf-05a4-4700-866e-55deeaf28bf6", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "6ffeb9" },
        body: JSON.stringify({
          sessionId: "6ffeb9",
          location: "onboarding/page.tsx:catch",
          message: "saveDisplayName failed",
          data: { hypothesisId: "H1", error: msg },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PaddedAppFrame>
      <MobileShell>
        <div className="flex flex-1 flex-col px-5 pt-16">
          <h1 className="text-2xl font-bold text-zinc-900">Welcome</h1>
          <p className="mt-2 text-sm text-zinc-500">What should your friends call you?</p>
          <input
            className="mt-8 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base outline-none ring-zinc-400 focus:ring-2"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            aria-label="Display name"
          />
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!name.trim() || saving}
            className="mt-6 rounded-2xl bg-zinc-900 py-3 text-center text-base font-semibold text-white disabled:opacity-40"
          >
            Continue
          </button>
          {err ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
              {err}
            </p>
          ) : null}
          <p className="mt-6 text-center text-xs text-zinc-400">
            Already set?{" "}
            <Link href="/friends" className="font-medium text-zinc-700 underline">
              Skip to friends
            </Link>
          </p>
        </div>
      </MobileShell>
    </PaddedAppFrame>
  );
}
