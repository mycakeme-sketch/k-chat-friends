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
  const slideRaw = searchParams.get("slide");
  const parsed = slideRaw != null ? Number.parseInt(slideRaw, 10) : 0;
  const initialSlide =
    Number.isFinite(parsed) && parsed >= 0 ? Math.min(parsed, (friend?.slides.length ?? 1) - 1) : 0;

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 text-zinc-500">Loading…</div>
    );
  }
  if (!friend) notFound();

  return <FriendDetailClient friend={friend} hideAdd={hideAdd} initialSlide={initialSlide} />;
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
