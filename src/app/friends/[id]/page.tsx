"use client";

import { useFriendConfig } from "@/contexts/friend-config-context";
import { notFound } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { FriendDetailClient } from "./FriendDetailClient";

function FriendDetailInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { getFriend, ready } = useFriendConfig();
  const friend = ready ? getFriend(id) : undefined;
  const hideAdd = searchParams.get("from") === "chat";

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 text-zinc-500">Loading…</div>
    );
  }
  if (!friend) notFound();

  return <FriendDetailClient friend={friend} hideAdd={hideAdd} />;
}

export default function FriendDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-zinc-50 text-zinc-500">Loading…</div>
      }
    >
      <FriendDetailInner />
    </Suspense>
  );
}
