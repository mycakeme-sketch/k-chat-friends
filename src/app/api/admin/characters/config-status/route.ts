import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** 비밀 값은 노출하지 않고, 서버에 필요한 env가 있는지만 알려 캐릭터 편집 화면에서 진단용으로 사용합니다. */
export async function GET() {
  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    hasAdminSecret: !!process.env.CHARACTER_ADMIN_SECRET?.trim(),
  });
}
