"use client";

import { formatLikeCount } from "@/lib/format";
import type { FriendProfile, FriendSlide } from "@/types/chat";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

function getSlideMediaKind(slide: FriendSlide): "image" | "video" {
  if (slide.media) return slide.media;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(slide.src) ? "video" : "image";
}

type Props = {
  friend: FriendProfile;
  initialSlide?: number;
  /** false면 하단 Add 버튼 숨김(이미 추가된 친구 등) */
  showAddButton?: boolean;
  onClose: () => void;
  onAddAndChat: () => void;
  getLike: (slideIndex: number) => { liked: boolean; count: number };
  toggleLike: (slideIndex: number, currentlyLiked: boolean) => void;
};

const SWIPE_PX = 50;

export function ReelCarousel({
  friend,
  initialSlide = 0,
  showAddButton = true,
  onClose,
  onAddAndChat,
  getLike,
  toggleLike,
}: Props) {
  const [index, setIndex] = useState(initialSlide);
  const drag = useRef<{ x: number; pointerId: number } | null>(null);

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => {
        const n = i + dir;
        if (n < 0) return friend.slides.length - 1;
        if (n >= friend.slides.length) return 0;
        return n;
      });
    },
    [friend.slides.length],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, pointerId: e.pointerId };
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || e.pointerId !== drag.current.pointerId) return;
    const startX = drag.current.x;
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const dx = e.clientX - startX;
    if (dx > SWIPE_PX) go(-1);
    else if (dx < -SWIPE_PX) go(1);
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current && e.pointerId === drag.current.pointerId) {
      drag.current = null;
    }
  };

  const slide = friend.slides[index];
  const like = getLike(index);
  const mediaKind = getSlideMediaKind(slide);

  useEffect(() => {
    if (mediaKind !== "image") return;
    const t = window.setTimeout(() => go(1), 3000);
    return () => clearTimeout(t);
  }, [index, mediaKind, slide.src, go]);

  return (
    <div className="relative flex min-h-dvh flex-col bg-black text-white">
      <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 px-2 pt-3">
        {friend.slides.map((s, i) => {
          const past = i < index;
          const future = i > index;
          const current = i === index;
          const kind = getSlideMediaKind(s);
          return (
            <div
              key={i}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25"
              aria-hidden
            >
              {past && <div className="h-full w-full bg-white" />}
              {future && <div className="h-full w-0 bg-white" />}
              {current && kind === "image" && (
                <div
                  key={`${index}-${i}-img`}
                  className="reel-segment-image-fill h-full bg-white"
                />
              )}
              {current && kind === "video" && (
                <div className="h-full w-full bg-white/90" />
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute left-2 top-8 z-30 rounded-full bg-black/40 px-3 py-1.5 text-sm font-medium backdrop-blur"
        aria-label="Close"
      >
        ✕
      </button>

      <div
        className="relative min-h-[65dvh] w-full flex-1 touch-none pt-10"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerUp={endDrag}
        onPointerCancel={onPointerCancel}
        role="presentation"
      >
        {mediaKind === "video" ? (
          <video
            key={slide.src}
            src={slide.src}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            muted
            autoPlay
            onEnded={() => go(1)}
          />
        ) : (
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
            priority={index === 0}
            draggable={false}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 space-y-3 p-4 pb-8">
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/30">
                <Image
                  src={friend.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="font-semibold">{friend.name}</p>
                <p className="text-xs text-white/80">{friend.tagline}</p>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{slide.caption}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => toggleLike(index, like.liked)}
              className="flex flex-col items-center gap-0.5"
              aria-pressed={like.liked}
              aria-label={like.liked ? "Unlike" : "Like"}
            >
              <span className="text-2xl" style={{ filter: like.liked ? "none" : "grayscale(1)" }}>
                {like.liked ? "❤️" : "🤍"}
              </span>
              <span className="text-xs text-white/90">{formatLikeCount(like.count)}</span>
            </button>
          </div>
        </div>

        {showAddButton && (
          <button
            type="button"
            onClick={onAddAndChat}
            className="w-full rounded-2xl bg-white py-3 text-center text-base font-semibold text-black active:scale-[0.99]"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
