import { NextResponse } from "next/server";

/** 관리자 API: 환경 변수 CHARACTER_ADMIN_SECRET 과 일치해야 함 */
export function verifyCharacterAdmin(req: Request, bodySecret?: string): NextResponse | null {
  const expected = process.env.CHARACTER_ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CHARACTER_ADMIN_SECRET is not set on the server." },
      { status: 503 },
    );
  }
  const header = req.headers.get("x-admin-secret");
  const s = (header ?? bodySecret)?.trim();
  if (!s || s !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
