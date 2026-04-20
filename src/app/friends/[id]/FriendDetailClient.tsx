"use client";

import { ReelCarousel } from "@/components/ReelCarousel";
import { MobileShell, PaddedAppFrame } from "@/components/MobileShell";
import { useAuth } from "@/contexts/auth-context";
import { setLikeRow } from "@/lib/app-data";
import type { FriendProfile } from "@/types/chat";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function FriendDetailClient({
  friend,
  hideAdd = false,
  initialSlide = 0,
}: {
  friend: FriendProfile;
  hideAdd?: boolean;
  /** Which slide to open first (e.g. from feed deep link `?slide=`) */
  initialSlide?: number;
}) {
  const router = useRouter();
  const { supabase, user } = useAuth();
  const [likeMap, setLikeMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("slide_likes")
        .select("slide_index, liked")
        .eq("user_id", user.id)
        .eq("friend_id", friend.id);
      if (error || cancelled) return;
      const m: Record<number, boolean> = {};
      data?.forEach((r) => {
        m[r.slide_index] = r.liked;
      });
      setLikeMap(m);
    })();
    return () => {
      cancelled = true;
    };
  }, [friend.id, user, supabase]);

  const getLike = useCallback(
    (slideIndex: number) => {
      const base = friend.slides[slideIndex]?.baseLikes ?? 0;
      const liked = !!likeMap[slideIndex];
      return { liked, count: base + (liked ? 1 : 0) };
    },
    [friend.slides, likeMap],
  );

  const toggleLike = useCallback(
    async (slideIndex: number, currentlyLiked: boolean) => {
      if (!user) return;
      const next = !currentlyLiked;
      await setLikeRow(supabase, user.id, friend.id, slideIndex, next);
      setLikeMap((prev) => ({ ...prev, [slideIndex]: next }));
    },
    [friend.id, user, supabase],
  );

  return (
    <PaddedAppFrame>
      <MobileShell className="min-h-dvh bg-black text-white">
        <ReelCarousel
          friend={friend}
          initialSlide={initialSlide}
          showAddButton={!hideAdd}
          onClose={() => router.push("/friends")}
          onAddAndChat={() => {
            router.push(`/chat/${friend.id}?new=1`);
          }}
          getLike={getLike}
          toggleLike={(i, liked) => void toggleLike(i, liked)}
        />
      </MobileShell>
    </PaddedAppFrame>
  );
}
