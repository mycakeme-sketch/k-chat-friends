import type { FriendProfile } from "@/types/chat";

const img = (seed: string, w = 720, h = 1280) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

export const FRIENDS: FriendProfile[] = [
  {
    id: "noah",
    name: "Noah Park",
    tagline: "Fun-loving Korean",
    avatar: "/noah/avatar.png",
    promptId: "noah",
    slides: [
      {
        src: "/noah/avatar.png",
        alt: "Noah outdoors",
        caption: "How do I look today? In shape?",
        baseLikes: 11000,
      },
      {
        src: img("noah-slide-2"),
        alt: "Noah at the gym",
        caption: "Leg day… but we move.",
        baseLikes: 8420,
      },
      {
        src: img("noah-slide-3"),
        alt: "Noah cafe",
        caption: "아아 한 잔? (Iced americano counts as water, right?)",
        baseLikes: 12033,
      },
      {
        src: img("noah-slide-4"),
        alt: "Noah night city",
        caption: "Seoul night hits different.",
        baseLikes: 9876,
      },
    ],
  },
  {
    id: "yoon",
    name: "Yoon",
    tagline: "Your best Korean friend & teacher.",
    avatar: img("yoon-avatar", 400, 400),
    promptId: "yoon",
    slides: [
      {
        src: img("yoon-slide-1"),
        alt: "Yoon reading",
        caption: "오늘 표현 하나 배울까? Want a useful phrase for today?",
        baseLikes: 15420,
      },
      {
        src: img("yoon-slide-2"),
        alt: "Yoon cafe",
        caption: "조용한 카페 = best study spot.",
        baseLikes: 11200,
      },
      {
        src: img("yoon-slide-3"),
        alt: "Yoon city walk",
        caption: "느린 산책도 공부야 — slow walks count as practice.",
        baseLikes: 9801,
      },
      {
        src: img("yoon-slide-4"),
        alt: "Yoon music",
        caption: "Playlist on, 한국어 가사 찾아보기.",
        baseLikes: 7650,
      },
    ],
  },
];

export function getFriend(id: string): FriendProfile | undefined {
  return FRIENDS.find((f) => f.id === id);
}
