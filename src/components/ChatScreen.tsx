"use client";

import { WELCOME_BY_FRIEND } from "@/data/welcome";
import { useAuth } from "@/contexts/auth-context";
import {
  addFriendRow,
  fetchMessages,
  fetchSubscribed,
  replaceMessages,
  setSubscribedRow,
  type StoredMessage,
} from "@/lib/app-data";
import { debugIngest } from "@/lib/debug-ingest";
import { formatUnknownError } from "@/lib/format-error";
import type { ChatMessage, FriendProfile } from "@/types/chat";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MobileShell, PaddedAppFrame } from "./MobileShell";
import { SubscribePanel } from "./SubscribePanel";

function toApiMessages(rows: StoredMessage[]): ChatMessage[] {
  return rows.map(({ role, content }) => ({ role, content }));
}

type Props = {
  friend: FriendProfile;
};

const USER_MSG_GATE = 3;

export function ChatScreen({ friend }: Props) {
  const { supabase, user } = useAuth();
  const [rows, setRows] = useState<StoredMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [subscribed, setSubscribedState] = useState(false);
  const [threadReady, setThreadReady] = useState(false);
  const [threadErr, setThreadErr] = useState<string | null>(null);
  const [sendErr, setSendErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setThreadErr(null);
      try {
        await addFriendRow(supabase, user.id, friend.id);
        const sub = await fetchSubscribed(supabase, user.id, friend.id);
        if (cancelled) return;
        setSubscribedState(sub);

        const existing = await fetchMessages(supabase, user.id, friend.id);
        if (cancelled) return;
        if (existing.length > 0) {
          setRows(existing);
        } else {
          const welcome = WELCOME_BY_FRIEND[friend.id] ?? "안녕하세요!";
          const seed: StoredMessage[] = [
            { role: "assistant", content: welcome, at: Date.now() },
          ];
          await replaceMessages(supabase, user.id, friend.id, seed);
          if (!cancelled) setRows(seed);
        }
      } catch (e) {
        const msg = formatUnknownError(e);
        // #region agent log
        debugIngest({
          location: "ChatScreen.tsx:threadInit",
          message: "thread init failed",
          data: { hypothesisId: "H3", error: msg, friendId: friend.id },
        });
        // #endregion
        if (!cancelled) setThreadErr(msg);
      } finally {
        if (!cancelled) setThreadReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [friend.id, user, supabase]);

  const userMsgCount = useMemo(() => rows.filter((m) => m.role === "user").length, [rows]);

  const showPaywall = userMsgCount >= USER_MSG_GATE && !subscribed;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rows, hintOpen, showPaywall]);

  const persist = useCallback(
    async (next: StoredMessage[]) => {
      setRows(next);
      if (!user) return;
      await replaceMessages(supabase, user.id, friend.id, next);
    },
    [friend.id, user, supabase],
  );

  const sendAssistant = useCallback(
    async (history: StoredMessage[]) => {
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            friendId: friend.id,
            messages: toApiMessages(history),
          }),
        });
        const data = (await res.json()) as { reply?: string; error?: string };
        // #region agent log
        debugIngest({
          location: "ChatScreen.tsx:sendAssistant",
          message: "/api/chat response",
          data: {
            hypothesisId: "H5",
            status: res.status,
            ok: res.ok,
            hasReply: !!data.reply,
            err: data.error ?? null,
          },
        });
        // #endregion
        if (!res.ok) throw new Error(data.error || "Chat failed");
        const reply = data.reply ?? "";
        const withBot: StoredMessage[] = [
          ...history,
          { role: "assistant", content: reply, at: Date.now() },
        ];
        await persist(withBot);
      } catch (e) {
        const msg = formatUnknownError(e);
        await persist([
          ...history,
          { role: "assistant", content: `Sorry — ${msg}`, at: Date.now() },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [friend.id, persist],
  );

  const sendUser = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || showPaywall) return;
    setInput("");
    setSendErr(null);
    const userRow: StoredMessage = { role: "user", content: text, at: Date.now() };
    const prevRows = rows;
    const next = [...prevRows, userRow];
    try {
      await persist(next);
    } catch (e) {
      const msg = formatUnknownError(e);
      // #region agent log
      debugIngest({
        location: "ChatScreen.tsx:sendUser",
        message: "persist failed",
        data: { hypothesisId: "H4", error: msg },
      });
      // #endregion
      setRows(prevRows);
      setSendErr(`메시지 저장 실패: ${msg}`);
      return;
    }
    await sendAssistant(next);
  }, [input, loading, showPaywall, rows, persist, sendAssistant]);

  const openHints = useCallback(async () => {
    if (showPaywall) return;
    setHintOpen(true);
    setHintLoading(true);
    setHints([]);
    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendId: friend.id,
          messages: toApiMessages(rows),
        }),
      });
      const data = (await res.json()) as { suggestions?: string[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Hint failed");
      setHints(data.suggestions ?? []);
    } catch (e) {
      setHints([
        e instanceof Error ? e.message : "Could not load hints.",
        "Tell me more about your day.",
      ]);
    } finally {
      setHintLoading(false);
    }
  }, [friend.id, rows, showPaywall]);

  const applyHint = (line: string) => {
    setHintOpen(false);
    setInput(line);
  };

  const handleSubscribe = async () => {
    if (!user) return;
    await setSubscribedRow(supabase, user.id, friend.id, true);
    setSubscribedState(true);
  };

  if (!threadReady) {
    return (
      <PaddedAppFrame>
        <MobileShell className="min-h-dvh bg-zinc-100">
          <div className="flex min-h-dvh items-center justify-center text-sm text-zinc-500">
            Loading chat…
          </div>
        </MobileShell>
      </PaddedAppFrame>
    );
  }

  return (
    <PaddedAppFrame>
      <MobileShell className="min-h-dvh bg-zinc-100">
        <div className="flex min-h-dvh flex-col">
          {threadErr ? (
            <div className="shrink-0 border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
              대화를 불러오지 못했습니다: {threadErr}
            </div>
          ) : null}
          {sendErr ? (
            <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="alert">
              {sendErr}
            </div>
          ) : null}
          <header className="flex shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-3 py-2">
            <Link
              href="/friends"
              className="rounded-full px-2 py-1 text-lg text-zinc-600"
              aria-label="Back to friends"
            >
              ‹
            </Link>
            <Link
              href={`/friends/${friend.id}?from=chat`}
              className="flex min-w-0 flex-1 items-center gap-2 text-left active:opacity-90"
            >
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={friend.avatar}
                  alt=""
                  width={36}
                  height={36}
                  className="object-cover"
                  unoptimized
                />
              </span>
              <span className="truncate font-semibold text-zinc-900">{friend.name}</span>
            </Link>
            <Link href="/settings" className="text-xs font-medium text-zinc-500">
              Settings
            </Link>
          </header>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {rows.map((m, i) => (
              <div
                key={`${m.at}-${i}`}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-zinc-900 text-white"
                      : "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-100"
                  }`}
                >
                  {m.content.split("\n").map((line, j) => (
                    <p key={j} className={j ? "mt-1" : ""}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <p className="text-xs text-zinc-400" aria-live="polite">
                {friend.name} is typing…
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {showPaywall && (
            <div className="shrink-0 border-t border-zinc-200 bg-zinc-50 px-3 pb-4 pt-2">
              <SubscribePanel friendName={friend.name} onSubscribe={() => void handleSubscribe()} />
            </div>
          )}

          {!showPaywall && (
            <div className="shrink-0 border-t border-zinc-200 bg-white px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void openHints()}
                  disabled={hintLoading}
                  className="shrink-0 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700"
                >
                  Hint
                </button>
                <input
                  className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
                  placeholder="Message…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendUser();
                    }
                  }}
                  aria-label="Message input"
                />
                <button
                  type="button"
                  onClick={() => void sendUser()}
                  disabled={loading || !input.trim()}
                  className="shrink-0 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {hintOpen && (
            <div
              className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-3 pb-6 pt-12"
              role="dialog"
              aria-modal
              aria-label="Hint suggestions"
              onClick={() => setHintOpen(false)}
            >
              <div
                className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">Hint</span>
                  <button
                    type="button"
                    className="text-zinc-500"
                    onClick={() => setHintOpen(false)}
                    aria-label="Close hints"
                  >
                    ✕
                  </button>
                </div>
                {hintLoading ? (
                  <p className="text-sm text-zinc-500">Generating…</p>
                ) : (
                  <div className="space-y-2">
                    {hints.slice(0, 2).map((h, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-left text-sm text-zinc-800"
                        onClick={() => applyHint(h)}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </MobileShell>
    </PaddedAppFrame>
  );
}
