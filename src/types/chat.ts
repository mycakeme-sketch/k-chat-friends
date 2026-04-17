export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type FriendSlide = {
  src: string;
  alt: string;
  caption: string;
  /** Base like count shown before user toggles */
  baseLikes: number;
  /** Omit to infer from src (.mp4 / .webm / .ogg = video) */
  media?: "image" | "video";
};

export type FriendProfile = {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  slides: FriendSlide[];
  promptId: string;
};
