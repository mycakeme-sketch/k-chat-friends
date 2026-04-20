import { createBrowserClient } from "@supabase/ssr";

/**
 * PostgREST GET이 브라우저 HTTP 캐시에 걸리면 characters 갱신이 화면에 안 보일 수 있어
 * 항상 최신 데이터를 가져오도록 한다.
 */
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    cache: "no-store",
  });

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되지 않았습니다.");
  }
  return createBrowserClient(url, key, {
    global: {
      fetch: noStoreFetch,
    },
  });
}
