"use client";

import { MobileShell, PaddedAppFrame } from "@/components/MobileShell";
import { useAuth } from "@/contexts/auth-context";
import { useFriendConfig } from "@/contexts/friend-config-context";
import {
  fetchAddedFriendsWithSub,
  fetchDisplayName,
  setLikeRow,
  setSubscribedRow,
} from "@/lib/app-data";
import { formatLikeCount } from "@/lib/format";
import type { FriendProfile, FriendSlide } from "@/types/chat";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";

const CARD_IMG_SIZES = "(max-width: 448px) 100vw, 448px";
const ROW_AVATAR_SIZES = "56px";
const STORY_AVATAR = "64px";

function getSlideMediaKind(slide: FriendSlide): "image" | "video" {
  if (slide.media) return slide.media;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(slide.src) ? "video" : "image";
}

type FeedItem = { friend: FriendProfile; slide: FriendSlide; slideIndex: number };

/** Round-robin across friends so the feed mixes everyone’s first posts, then seconds, etc. */
function interleaveByFriend(friends: FriendProfile[]): FeedItem[] {
  const buckets = friends.map((friend) =>
    friend.slides.map((slide, slideIndex) => ({ friend, slide, slideIndex })),
  );
  const out: FeedItem[] = [];
  let round = 0;
  let added = true;
  while (added) {
    added = false;
    for (const b of buckets) {
      if (round < b.length) {
        out.push(b[round]);
        added = true;
      }
    }
    round++;
  }
  return out;
}

function fakeRelativeTime(friendId: string, slideIndex: number): string {
  const n = (friendId.charCodeAt(0) + slideIndex * 11) % 56;
  if (n < 18) return `${Math.max(1, n % 12)}시간 전`;
  if (n < 42) return `${(n % 5) + 1}일 전`;
  return "방금 전";
}

function FriendListRow({
  friend,
  chatHref,
  showSubscribe,
  onSubscribe,
}: {
  friend: FriendProfile;
  chatHref: string;
  showSubscribe: boolean;
  onSubscribe: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-2">
      <Link
        href={chatHref}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1.5 pr-1 active:bg-zinc-50"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-200 ring-1 ring-zinc-200/80">
          <Image
            src={friend.avatar}
            alt=""
            fill
            className="object-cover"
            sizes={ROW_AVATAR_SIZES}
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="font-semibold text-zinc-900">{friend.name}</p>
          <p className="truncate text-sm text-zinc-500">{friend.tagline}</p>
        </div>
      </Link>
      {showSubscribe ? (
        <button
          type="button"
          onClick={onSubscribe}
          className="shrink-0 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-amber-950"
        >
          Subscribe
        </button>
      ) : (
        <span className="shrink-0 text-zinc-300" aria-hidden>
          ›
        </span>
      )}
    </div>
  );
}

function StoriesStrip({ friends }: { friends: FriendProfile[] }) {
  if (friends.length === 0) return null;
  return (
    <div className="-mx-4 border-b border-zinc-100 bg-white px-4 py-3">
      <p className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-zinc-400">Stories</p>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {friends.map((f) => {
          const label = f.name.split(/\s+/)[0] ?? f.name;
          return (
            <Link
              key={f.id}
              href={`/friends/${f.id}`}
              className="flex w-[72px] shrink-0 flex-col items-center gap-1 active:opacity-90"
            >
              <div className="rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[2px]">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-white p-[2px]">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-zinc-200">
                    <Image
                      src={f.avatar}
                      alt=""
                      fill
                      className="object-cover"
                      sizes={STORY_AVATAR}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
              <span className="w-full truncate text-center text-[11px] text-zinc-700">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function FeedPostCard({
  item,
  liked,
  onToggleLike,
  canLike,
}: {
  item: FeedItem;
  liked: boolean;
  onToggleLike: () => void;
  canLike: boolean;
}) {
  const { friend, slide, slideIndex } = item;
  const kind = getSlideMediaKind(slide);
  const count = slide.baseLikes + (liked ? 1 : 0);
  const shortName = friend.name.split(/\s+/)[0] ?? friend.name;

  return (
    <article className="border-b border-zinc-200 bg-white pb-4 last:border-b-0">
      <div className="flex items-center gap-3 px-3 py-2">
        <Link
          href={`/friends/${friend.id}`}
          className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-200 ring-1 ring-zinc-200/80"
        >
          <Image src={friend.avatar} alt="" fill className="object-cover" sizes={ROW_AVATAR_SIZES} unoptimized />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/friends/${friend.id}`} className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold text-zinc-900">{friend.name}</span>
            <span className="text-xs text-zinc-400">{fakeRelativeTime(friend.id, slideIndex)}</span>
          </Link>
        </div>
      </div>

      <Link
        href={`/friends/${friend.id}?slide=${slideIndex}`}
        className="relative block aspect-[4/5] w-full bg-zinc-100"
      >
        {kind === "video" ? (
          <video
            src={slide.src}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            autoPlay
            loop
          />
        ) : (
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            sizes={CARD_IMG_SIZES}
            unoptimized
          />
        )}
      </Link>

      <div className="space-y-2 px-3 pt-2">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => canLike && onToggleLike()}
            disabled={!canLike}
            className="flex items-center gap-1.5 text-zinc-900 disabled:opacity-40"
            aria-pressed={liked}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <span className="text-2xl" style={{ filter: liked ? "none" : "grayscale(1)" }}>
              {liked ? "❤️" : "🤍"}
            </span>
            <span className="text-sm font-medium tabular-nums">{formatLikeCount(count)}</span>
          </button>
          <Link href={`/chat/${friend.id}`} className="text-sm font-medium text-zinc-600">
            Message
          </Link>
        </div>
        <p className="text-sm leading-relaxed text-zinc-900">
          <Link href={`/friends/${friend.id}`} className="font-semibold">
            {shortName}
          </Link>{" "}
          <span className="text-zinc-800">{slide.caption}</span>
        </p>
      </div>
    </article>
  );
}

export function FriendsClient() {
  const { friends: FRIENDS } = useFriendConfig();
  const { supabase, user } = useAuth();
  const [name, setName] = useState("");
  const [addedRows, setAddedRows] = useState<{ friend_id: string; subscribed: boolean }[]>([]);
  const [listReady, setListReady] = useState(false);
  const [likeMap, setLikeMap] = useState<Record<string, boolean>>({});

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const [n, rows] = await Promise.all([
        fetchDisplayName(supabase, user.id),
        fetchAddedFriendsWithSub(supabase, user.id),
      ]);
      setName(n);
      setAddedRows(rows);
    } finally {
      setListReady(true);
    }
  }, [user, supabase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addedSet = useMemo(() => new Set(addedRows.map((r) => r.friend_id)), [addedRows]);
  const subMap = useMemo(
    () => Object.fromEntries(addedRows.map((r) => [r.friend_id, r.subscribed])),
    [addedRows],
  );
  const discoverFriends = useMemo(() => {
    return FRIENDS.filter((f) => !addedSet.has(f.id));
  }, [FRIENDS, addedSet]);
  const feedItems = useMemo(() => interleaveByFriend(discoverFriends), [discoverFriends]);

  useEffect(() => {
    if (!user || discoverFriends.length === 0) {
      setLikeMap({});
      return;
    }
    const ids = discoverFriends.map((f) => f.id);
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("slide_likes")
        .select("friend_id, slide_index, liked")
        .eq("user_id", user.id)
        .in("friend_id", ids);
      if (error || cancelled) return;
      const m: Record<string, boolean> = {};
      data?.forEach((r) => {
        if (r.liked) m[`${r.friend_id}:${r.slide_index}`] = true;
      });
      setLikeMap(m);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, supabase, discoverFriends]);

  const toggleFeedLike = useCallback(
    async (friendId: string, slideIndex: number) => {
      if (!user) return;
      const key = `${friendId}:${slideIndex}`;
      let next = false;
      setLikeMap((prev) => {
        next = !prev[key];
        return { ...prev, [key]: next };
      });
      await setLikeRow(supabase, user.id, friendId, slideIndex, next);
    },
    [user, supabase],
  );

  const mockSubscribe = async (friendId: string, e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    await setSubscribedRow(supabase, user.id, friendId, true);
    await refresh();
  };

  if (!listReady) {
    return (
      <PaddedAppFrame>
        <MobileShell>
          <div className="flex flex-1 items-center justify-center py-20 text-sm text-zinc-500">
            Loading…
          </div>
        </MobileShell>
      </PaddedAppFrame>
    );
  }

  return (
    <PaddedAppFrame>
      <MobileShell>
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-zinc-900">{name || "Friend"}</p>
            <p className="text-xs text-zinc-500">Friends feed</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/dev/characters" className="text-xs font-medium text-zinc-400 underline">
              캐릭터 편집
            </Link>
            <Link
              href="/settings"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-600 ring-1 ring-zinc-200"
            >
              Settings
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {addedRows.length > 0 && (
            <section className="mx-4 mt-4 rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-zinc-100">
              <h2 className="px-1 pb-2 pt-1 text-[13px] font-semibold uppercase tracking-wide text-zinc-400">
                Your friends
              </h2>
              <ul className="divide-y divide-zinc-100">
                {FRIENDS.filter((f) => addedSet.has(f.id)).map((f) => {
                  const sub = !!subMap[f.id];
                  return (
                    <li key={f.id}>
                      <FriendListRow
                        friend={f}
                        chatHref={`/chat/${f.id}`}
                        showSubscribe={!sub}
                        onSubscribe={(e) => void mockSubscribe(f.id, e)}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {discoverFriends.length > 0 ? (
            <section className="mt-2">
              <StoriesStrip friends={discoverFriends} />
              <h2 className="px-4 pb-2 pt-4 text-[13px] font-semibold uppercase tracking-wide text-zinc-400">
                Feed
              </h2>
              <div className="pb-8">
                {feedItems.map((item) => {
                  const key = `${item.friend.id}:${item.slideIndex}`;
                  const liked = !!likeMap[key];
                  return (
                    <FeedPostCard
                      key={key}
                      item={item}
                      liked={liked}
                      canLike={!!user}
                      onToggleLike={() => void toggleFeedLike(item.friend.id, item.slideIndex)}
                    />
                  );
                })}
              </div>
            </section>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-zinc-500">
              You&apos;ve added everyone — open chats from &quot;Your friends&quot; above.
            </p>
          )}
        </div>
      </MobileShell>
    </PaddedAppFrame>
  );
}
