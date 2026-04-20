import type { FriendProfile } from "@/types/chat";

const img = (seed: string, w = 720, h = 900) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

/** Short CC0 sample — MP4 for broad `<video>` support */
const V_FLOWER = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

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
        src: V_FLOWER,
        alt: "Noah clip",
        caption: "오늘 러닝 후 스트레칭 — post-run stretch hits different.",
        baseLikes: 9200,
        media: "video",
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
        src: V_FLOWER,
        alt: "Yoon short clip",
        caption: "창가 자리 남았을 때의 그 기분 ✨",
        baseLikes: 10102,
        media: "video",
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
  {
    id: "minji",
    name: "Minji Kim",
    tagline: "Design nerd · 카페 투어",
    avatar: img("minji-avatar", 400, 400),
    promptId: "generic",
    slides: [
      { src: img("minji-p1"), alt: "Minji desk", caption: "Figma 정리한 날은 기분이 맑음.", baseLikes: 3201 },
      { src: img("minji-p2"), alt: "Minji latte", caption: "라떼 아트는 포기했어요. 맛만 챙김.", baseLikes: 2890 },
      { src: V_FLOWER, alt: "Minji clip", caption: "퇴근 후 10초 브이로그 (진짜 10초)", baseLikes: 4102, media: "video" },
      { src: img("minji-p4"), alt: "Minji exhibit", caption: "전시 보고 온 날 — 색 조합 메모해둠.", baseLikes: 2567 },
      { src: img("minji-p5"), alt: "Minji night", caption: "밤 산책 루트 고정 중.", baseLikes: 1988 },
    ],
  },
  {
    id: "jae",
    name: "Jae Han",
    tagline: "Runner · 한강 애호가",
    avatar: img("jae-avatar", 400, 400),
    promptId: "generic",
    slides: [
      { src: img("jae-p1"), alt: "Jae river", caption: "오늘 페이스 좋았다 — 쿨다운 필수.", baseLikes: 5602 },
      { src: V_FLOWER, alt: "Jae stretch", caption: "스트레칭 안 하면 내일 후회함.", baseLikes: 4301, media: "video" },
      { src: img("jae-p3"), alt: "Jae shoes", caption: "신발 끈 다시 묶는 타입?", baseLikes: 3120 },
      { src: img("jae-p4"), alt: "Jae bridge", caption: "한강 노을은 치트키야.",
        baseLikes: 8901 },
      { src: img("jae-p5"), alt: "Jae snack", caption: "런 후 바나나 = 계약이지.", baseLikes: 2766 },
    ],
  },
  {
    id: "sora",
    name: "Sora Lee",
    tagline: "Film × OST 덕후",
    avatar: img("sora-avatar", 400, 400),
    promptId: "generic",
    slides: [
      { src: img("sora-p1"), alt: "Sora theater", caption: "오늘 상영은 이거만 보고 나옴.", baseLikes: 4455 },
      { src: img("sora-p2"), alt: "Sora album", caption: "OST 플리 공유 받을 사람?", baseLikes: 3321 },
      { src: img("sora-p3"), alt: "Sora popcorn", caption: "팝콘 L은 기본 아닌가요?", baseLikes: 2890 },
      { src: V_FLOWER, alt: "Sora clip", caption: "엔딩 크레딧 올라갈 때 그 감성…", baseLikes: 5120, media: "video" },
      { src: img("sora-p5"), alt: "Sora street", caption: "귀가길에 듣는 한 곡.", baseLikes: 3012 },
    ],
  },
  {
    id: "haneul",
    name: "Haneul Choi",
    tagline: "일러스트 · 맑은 날 산책",
    avatar: img("haneul-avatar", 400, 400),
    promptId: "generic",
    slides: [
      { src: img("haneul-p1"), alt: "Haneul sketch", caption: "스케치북 한 장 채우는 중.", baseLikes: 2788 },
      { src: img("haneul-p2"), alt: "Haneul sky", caption: "하늘 색 코드만 뽑아도 힐링.", baseLikes: 3456 },
      { src: img("haneul-p3"), alt: "Haneul tools", caption: "붓 세척은 귀찮지만 결과는 예쁨.", baseLikes: 2123 },
      { src: V_FLOWER, alt: "Haneul clip", caption: "그림 그리다가 찍은 5초.", baseLikes: 3999, media: "video" },
      { src: img("haneul-p5"), alt: "Haneul exhibit", caption: "작은 갤러리 구경 후 기록.", baseLikes: 2567 },
    ],
  },
  {
    id: "eunwoo",
    name: "Eunwoo Jung",
    tagline: "요리 홈카페",
    avatar: img("eunwoo-avatar", 400, 400),
    promptId: "generic",
    slides: [
      { src: img("eunwoo-p1"), alt: "Eunwoo toast", caption: "브런치는 집이 제일 조용해.", baseLikes: 6234 },
      { src: img("eunwoo-p2"), alt: "Eunwoo soup", caption: "국물 끓일 때만 집중력 만렙.", baseLikes: 4567 },
      { src: img("eunwoo-p3"), alt: "Eunwoo market", caption: "시장 가면 계획이 틀어짐 — 다 사고 싶음.", baseLikes: 3890 },
      { src: img("eunwoo-p4"), alt: "Eunwoo plate", caption: "접시는 예쁜데 음식은 5분 컷.", baseLikes: 5123 },
      { src: V_FLOWER, alt: "Eunwoo pour", caption: "따르는 소리 ASMR (진짜 짧음)", baseLikes: 4788, media: "video" },
    ],
  },
  {
    id: "taeyang",
    name: "Taeyang Moon",
    tagline: "베이스 · 라이브 하우스",
    avatar: img("taeyang-avatar", 400, 400),
    promptId: "generic",
    slides: [
      { src: V_FLOWER, alt: "Taeyang rehearsal", caption: "리허설 전 체크 — 볼륨 주의.", baseLikes: 7123, media: "video" },
      { src: img("taeyang-p2"), alt: "Taeyang bass", caption: "줄 튜닝하는 시간이 제일 길다.", baseLikes: 5432 },
      { src: img("taeyang-p3"), alt: "Taeyang crowd", caption: "오늘 반응 미쳤다 — 고마워요.", baseLikes: 8901 },
      { src: img("taeyang-p4"), alt: "Taeyang night", caption: "공연 끝 후 조용한 골목.", baseLikes: 4566 },
      { src: img("taeyang-p5"), alt: "Taeyang mic", caption: "다음 셋리스트 고민 중.", baseLikes: 3344 },
    ],
  },
  {
    id: "nari",
    name: "Nari Song",
    tagline: "패션 · 빈티지 샵",
    avatar: img("nari-avatar", 400, 400),
    promptId: "generic",
    slides: [
      { src: img("nari-p1"), alt: "Nari mirror", caption: "오늘 포인트는 스카프.", baseLikes: 4567 },
      { src: img("nari-p2"), alt: "Nari rack", caption: "빈티지는 인내심 게임.", baseLikes: 3890 },
      { src: img("nari-p3"), alt: "Nari shoes", caption: "신발은 반칙적으로 편해야 함.", baseLikes: 5123 },
      { src: V_FLOWER, alt: "Nari fit check", caption: "핏 체크 3초 컷.", baseLikes: 6012, media: "video" },
      { src: img("nari-p5"), alt: "Nari cafe", caption: "카페 조명은 항상 칭찬해.", baseLikes: 2987 },
    ],
  },
  {
    id: "kyu",
    name: "Kyu Bae",
    tagline: "개발자 · 커피는 디카페",
    avatar: img("kyu-avatar", 400, 400),
    promptId: "generic",
    slides: [
      { src: img("kyu-p1"), alt: "Kyu desk", caption: "빌드 돌아가는 동안 멍 때리기.", baseLikes: 2345 },
      { src: img("kyu-p2"), alt: "Kyu keyboard", caption: "키캡 바꾸면 타자 속도 +0 (기분만 좋음).", baseLikes: 1987 },
      { src: img("kyu-p3"), alt: "Kyu night", caption: "야근 아님 — 그냥 밤에 집중 잘 됨.", baseLikes: 3120 },
      { src: img("kyu-p4"), alt: "Kyu monitor", caption: "다크모드는 눈이 아니라 멋으로 켬.", baseLikes: 2766 },
      { src: V_FLOWER, alt: "Kyu clip", caption: "커밋 푸시 전 1초 실사.", baseLikes: 3456, media: "video" },
    ],
  },
  {
    id: "rina",
    name: "Rina Oh",
    tagline: "요가 · 차 마시는 시간",
    avatar: img("rina-avatar", 400, 400),
    promptId: "generic",
    slides: [
      { src: img("rina-p1"), alt: "Rina mat", caption: "오늘은 스트레칭만 — 괜찮아.", baseLikes: 4123 },
      { src: img("rina-p2"), alt: "Rina tea", caption: "찻잎 우리는 시간이 루틴.", baseLikes: 3567 },
      { src: img("rina-p3"), alt: "Rina window", caption: "창문 열어둔 날은 공기가 반찬.", baseLikes: 2890 },
      { src: V_FLOWER, alt: "Rina flow", caption: "숨 맞추는 10초.", baseLikes: 5234, media: "video" },
      { src: img("rina-p5"), alt: "Rina book", caption: "책 한 장 읽고 잠들기 루틴.", baseLikes: 2678 },
    ],
  },
  {
    id: "junseo",
    name: "Junseo Kang",
    tagline: "여행 · 기차 창가",
    avatar: img("junseo-avatar", 400, 400),
    promptId: "generic",
    slides: [
      { src: img("junseo-p1"), alt: "Junseo ticket", caption: "표 끊고 나면 이미 반은 출발.", baseLikes: 6789 },
      { src: img("junseo-p2"), alt: "Junseo train", caption: "창가 자리는 소소한 승리.", baseLikes: 5432 },
      { src: img("junseo-p3"), alt: "Junseo town", caption: "역 앞 골목이 제일 생생함.", baseLikes: 4567 },
      { src: V_FLOWER, alt: "Junseo trip", caption: "지나가는 풍경 4초.", baseLikes: 8123, media: "video" },
      { src: img("junseo-p5"), alt: "Junseo food", caption: "현지 맛집은 일단 줄 서볼 가치.", baseLikes: 9012 },
    ],
  },
];

export function getFriend(id: string): FriendProfile | undefined {
  return FRIENDS.find((f) => f.id === id);
}
