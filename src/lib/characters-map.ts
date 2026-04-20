import type { FriendConfigStorage } from "@/lib/friend-defaults";
import type { FriendProfile, FriendSlide } from "@/types/chat";

/** Supabase `characters` 테이블 행 (snake_case) */
export type CharacterRow = {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  prompt_id: string;
  slides: FriendSlide[] | unknown;
  welcome_message: string;
  system_prompt: string;
  hint_style: string;
  sort_order: number;
  updated_at?: string;
};

export function parseSlides(raw: unknown): FriendSlide[] {
  if (!Array.isArray(raw)) return [];
  return raw as FriendSlide[];
}

export function dbRowsToConfig(rows: CharacterRow[]): FriendConfigStorage {
  const sorted = [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const friends: FriendProfile[] = sorted.map((r) => ({
    id: r.id,
    name: r.name,
    tagline: r.tagline ?? "",
    avatar: r.avatar ?? "",
    promptId: r.prompt_id,
    slides: parseSlides(r.slides),
  }));
  const welcomeById: Record<string, string> = {};
  const promptsByPromptId: Record<string, { system: string; hintStyle: string }> = {};
  for (const r of sorted) {
    welcomeById[r.id] = r.welcome_message ?? "";
    promptsByPromptId[r.prompt_id] = {
      system: r.system_prompt ?? "",
      hintStyle: r.hint_style ?? "",
    };
  }
  return { friends, welcomeById, promptsByPromptId };
}

export function configToDbRows(config: FriendConfigStorage): Omit<CharacterRow, "updated_at">[] {
  return config.friends.map((f, index) => ({
    id: f.id,
    name: f.name,
    tagline: f.tagline,
    avatar: f.avatar,
    prompt_id: f.promptId,
    slides: f.slides,
    welcome_message: config.welcomeById[f.id] ?? "",
    system_prompt: config.promptsByPromptId[f.promptId]?.system ?? "",
    hint_style: config.promptsByPromptId[f.promptId]?.hintStyle ?? "",
    sort_order: index,
  }));
}
