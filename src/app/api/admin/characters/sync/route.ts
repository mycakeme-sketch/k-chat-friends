import { toApiErrorMessage } from "@/lib/api-error-message";
import { verifyCharacterAdmin } from "@/lib/admin-auth";
import { configToDbRows } from "@/lib/characters-map";
import type { FriendConfigStorage } from "@/lib/friend-defaults";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  adminSecret?: string;
  config?: FriendConfigStorage;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const unauthorized = verifyCharacterAdmin(req, body.adminSecret);
  if (unauthorized) return unauthorized;

  if (!body.config?.friends || !Array.isArray(body.config.friends)) {
    return NextResponse.json({ error: "config.friends required" }, { status: 400 });
  }

  try {
    const sb = createServiceClient();
    const rows = configToDbRows(body.config);
    const incomingIds = new Set(rows.map((r) => r.id));

    const { data: existingRows, error: listErr } = await sb.from("characters").select("id");
    if (listErr) throw listErr;

    for (const r of existingRows ?? []) {
      if (!incomingIds.has(r.id)) {
        const { error: delErr } = await sb.from("characters").delete().eq("id", r.id);
        if (delErr) throw delErr;
      }
    }

    const { error: upErr } = await sb.from("characters").upsert(rows, { onConflict: "id" });
    if (upErr) throw upErr;

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = toApiErrorMessage(e, "Sync failed");
    console.error("[api/admin/characters/sync]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
