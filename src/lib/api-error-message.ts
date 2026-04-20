/** Supabase/PostgREST 오류 객체는 `instanceof Error`가 아닐 수 있어 API 응답용 문자열로 통일합니다. */
export function toApiErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error && e.message) return e.message;
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    const parts: string[] = [];
    if (typeof o.message === "string" && o.message) parts.push(o.message);
    if (typeof o.details === "string" && o.details) parts.push(o.details);
    if (typeof o.hint === "string" && o.hint) parts.push(o.hint);
    if (typeof o.code === "string" && o.code) parts.push(`code ${o.code}`);
    if (parts.length) return parts.join(" — ");
  }
  if (typeof e === "string" && e) return e;
  try {
    const s = JSON.stringify(e);
    if (s && s !== "{}") return s;
  } catch {
    /* ignore */
  }
  return fallback;
}
