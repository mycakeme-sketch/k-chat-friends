import { getFriend } from "@/data/friends";
import { getPrompts } from "@/data/prompts";
import { chatCompletion } from "@/lib/llm";
import type { ChatMessage } from "@/types/chat";
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// #region agent log
function agentLogApi(location: string, message: string, data: Record<string, unknown>) {
  try {
    appendFileSync(
      join(process.cwd(), "debug-6ffeb9.log"),
      `${JSON.stringify({
        sessionId: "6ffeb9",
        location,
        message,
        data,
        timestamp: Date.now(),
      })}\n`,
    );
  } catch {
    /* ignore (e.g. read-only FS on serverless) */
  }
}
// #endregion

type Body = {
  friendId?: string;
  messages?: ChatMessage[];
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const friendId = body.friendId;
  const messages = body.messages;
  if (!friendId || !Array.isArray(messages)) {
    return NextResponse.json({ error: "friendId and messages required" }, { status: 400 });
  }

  const friend = getFriend(friendId);
  if (!friend) {
    return NextResponse.json({ error: "Unknown friend" }, { status: 404 });
  }

  const { system } = getPrompts(friend.promptId);

  try {
    const text = await chatCompletion(system, messages);
    // #region agent log
    agentLogApi("api/chat/route.ts:POST", "chatCompletion ok", {
      hypothesisId: "H5",
      friendId,
      replyLen: text.length,
    });
    // #endregion
    return NextResponse.json({ reply: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    // #region agent log
    agentLogApi("api/chat/route.ts:POST", "chatCompletion error", {
      hypothesisId: "H5",
      friendId,
      error: msg,
    });
    // #endregion
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
