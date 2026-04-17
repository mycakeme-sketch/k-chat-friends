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

  const submit = async () => {
    const n = name.trim();
    if (!n || !user) return;
    setSaving(true);
    try {
      await saveDisplayName(supabase, user.id, n);
      router.replace("/friends");
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
