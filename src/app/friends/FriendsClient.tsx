"use client";

import { MobileShell, PaddedAppFrame } from "@/components/MobileShell";
import { useAuth } from "@/contexts/auth-context";
import { useFriendConfig } from "@/contexts/friend-config-context";
import {
  fetchAddedFriendsWithSub,
  fetchDisplayName,
  setSubscribedRow,
} from "@/lib/app-data";
import type { FriendProfile } from "@/types/chat";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type MouseEvent } from "react";

const CARD_IMG_SIZES = "(max-width: 448px) 100vw, 448px";
const ROW_AVATAR_SIZES = "56px";

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

function FriendPhotoCard({ friend }: { friend: FriendProfile }) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-200 ring-1 ring-black/5">
      <Image
        src={friend.avatar}
        alt=""
        fill
        className="object-cover"
        sizes={CARD_IMG_SIZES}
        priority={friend.id === "noah"}
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-black/5" />
      <div className="absolute bottom-0 left-0 right-0 p-4 pt-16">
        <p className="text-xl font-bold tracking-tight text-white drop-shadow-md">{friend.name}</p>
        <p className="mt-1 text-sm leading-snug text-white/95 drop-shadow">{friend.tagline}</p>
      </div>
    </div>
  );
}

export function FriendsClient() {
  const { friends: FRIENDS } = useFriendConfig();
  const { supabase, user } = useAuth();
  const [name, setName] = useState("");
  const [addedRows, setAddedRows] = useState<{ friend_id: string; subscribed: boolean }[]>([]);
  const [listReady, setListReady] = useState(false);

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

  const mockSubscribe = async (friendId: string, e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    await setSubscribedRow(supabase, user.id, friendId, true);
    await refresh();
  };

  const addedSet = new Set(addedRows.map((r) => r.friend_id));
  const subMap = Object.fromEntries(addedRows.map((r) => [r.friend_id, r.subscribed]));
  const discoverFriends = FRIENDS.filter((f) => !addedSet.has(f.id));

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
            <p className="text-xs text-zinc-500">Choose your friends</p>
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

        <div className="flex-1 space-y-8 overflow-y-auto px-4 py-4">
          {addedRows.length > 0 && (
            <section className="rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-zinc-100">
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

          {discoverFriends.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-zinc-400">
                Choose your friends
              </h2>
              <ul className="mt-4 space-y-5">
                {discoverFriends.map((f) => (
                  <li key={f.id}>
                    <Link href={`/friends/${f.id}`} className="block active:opacity-95">
                      <FriendPhotoCard friend={f} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </MobileShell>
    </PaddedAppFrame>
  );
}
