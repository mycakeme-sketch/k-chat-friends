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

  const friend = getFriend(friendId);
  if (!friend) {
    return NextResponse.json({ error: "Unknown friend" }, { status: 404 });
  }

  const { system } = getPrompts(friend.promptId);

  try {
    const text = await chatCompletion(system, messages);
    return NextResponse.json({ reply: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
