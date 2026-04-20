import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** 서버 전용. SUPABASE_SERVICE_ROLE_KEY — 클라이언트에 절대 노출하지 마세요. */
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 가 없습니다.");
  }
  return createClient(url, key);
}
