import { fetchCharacterForApi } from "@/lib/characters-server";
import { getFriend } from "@/data/friends";
import { getPrompts } from "@/data/prompts";
import { chatCompletion } from "@/lib/llm";
import type { ChatMessage } from "@/types/chat";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

  const row = await fetchCharacterForApi(friendId);
  let system: string;

  if (row?.system_prompt?.trim()) {
    system = row.system_prompt;
  } else {
    const pid = row?.prompt_id;
    const staticFriend = getFriend(friendId);
    const promptId = staticFriend?.promptId ?? pid;
    if (!promptId) {
      return NextResponse.json({ error: "Unknown friend" }, { status: 404 });
    }
    try {
      system = getPrompts(promptId).system;
    } catch {
      return NextResponse.json({ error: "Unknown friend" }, { status: 404 });
    }
  }

  try {
    const text = await chatCompletion(system, messages);
    return NextResponse.json({ reply: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
