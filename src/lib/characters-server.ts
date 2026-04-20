import { createClient } from "@supabase/supabase-js";

export type CharacterApiRow = {
  id: string;
  name: string;
  prompt_id: string;
  system_prompt: string;
  hint_style: string;
};

/** API 라우트에서 anon으로 공개 캐릭터 한 줄 조회 (RLS: select 허용) */
export async function fetchCharacterForApi(friendId: string): Promise<CharacterApiRow | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const sb = createClient(url, key);
  const { data, error } = await sb
    .from("characters")
    .select("id, name, prompt_id, system_prompt, hint_style")
    .eq("id", friendId)
    .maybeSingle();
  if (error || !data) return null;
  return data as CharacterApiRow;
}
