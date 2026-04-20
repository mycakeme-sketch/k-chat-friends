import { toApiErrorMessage } from "@/lib/api-error-message";
import { verifyCharacterAdmin } from "@/lib/admin-auth";
import { configToDbRows } from "@/lib/characters-map";
import { getDefaultFriendConfig } from "@/lib/friend-defaults";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = { adminSecret?: string };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {};
  }

  const unauthorized = verifyCharacterAdmin(req, body.adminSecret);
  if (unauthorized) return unauthorized;

  try {
    const sb = createServiceClient();
    const config = getDefaultFriendConfig();
    const rows = configToDbRows(config);
    const { error } = await sb.from("characters").upsert(rows, { onConflict: "id" });
    if (error) throw error;
    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e) {
    const msg = toApiErrorMessage(e, "Seed failed");
    console.error("[api/admin/characters/seed]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
