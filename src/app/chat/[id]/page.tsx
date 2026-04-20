"use client";

import { ChatScreen } from "@/components/ChatScreen";
import { useFriendConfig } from "@/contexts/friend-config-context";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function ChatInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { getFriend, ready } = useFriendConfig();
  const friend = ready ? getFriend(id) : undefined;

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      window.history.replaceState(null, "", `/chat/${id}`);
    }
  }, [id, searchParams]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-100 text-zinc-500">Loading…</div>
    );
  }

  if (!friend) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-100 text-sm text-zinc-500">
        Friend not found.
      </div>
    );
  }

  return <ChatScreen friend={friend} />;
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-zinc-100 text-zinc-500">
          Loading…
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
