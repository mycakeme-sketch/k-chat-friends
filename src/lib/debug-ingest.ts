/** Cursor debug 세션: 로컬에서만 ingest 서버로 전송 (프로덕션 HTTPS→127.0.0.1는 브라우저 로컬 네트워크 권한 팝업 유발). */
export function debugIngest(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const h = window.location.hostname;
  if (h !== "localhost" && h !== "127.0.0.1") return;
  fetch("http://127.0.0.1:7758/ingest/41f67bdf-05a4-4700-866e-55deeaf28bf6", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "6ffeb9" },
    body: JSON.stringify({ sessionId: "6ffeb9", ...payload, timestamp: Date.now() }),
  }).catch(() => {});
}
