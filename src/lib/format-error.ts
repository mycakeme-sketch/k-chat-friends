/** Supabase PostgrestError 등 Error가 아닌 객체를 사람이 읽을 수 있는 문자열로 만듭니다. */
export function formatUnknownError(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.trim()) return o.message;
    const bits: string[] = [];
    if (typeof o.code === "string" && o.code) bits.push(o.code);
    if (typeof o.details === "string" && o.details) bits.push(o.details);
    if (typeof o.hint === "string" && o.hint) bits.push(o.hint);
    if (bits.length) return bits.join(" — ");
    try {
      return JSON.stringify(e);
    } catch {
      return "알 수 없는 오류";
    }
  }
  return String(e);
}
