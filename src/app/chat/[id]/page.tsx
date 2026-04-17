"use client";

import { ChatScreen } from "@/components/ChatScreen";
import { getFriend } from "@/data/friends";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";

function ChatInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const friend = useMemo(() => getFriend(id), [id]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      window.history.replaceState(null, "", `/chat/${id}`);
    }
  }, [id, searchParams]);

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
