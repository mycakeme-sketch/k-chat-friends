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

function parseSuggestions(raw: string): string[] {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as { suggestions?: unknown };
      if (
        Array.isArray(parsed.suggestions) &&
        parsed.suggestions.every((x) => typeof x === "string")
      ) {
        return parsed.suggestions.slice(0, 2);
      }
    } catch {
      /* fall through */
    }
  }
  const lines = trimmed
    .split(/\n/)
    .map((l) => l.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);
  return lines.slice(0, 2);
}

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

  const { hintStyle } = getPrompts(friend.promptId);

  const transcript = messages
    .slice(-12)
    .map((m) => `${m.role === "user" ? "User" : friend.name}: ${m.content}`)
    .join("\n");

  const system = `${hintStyle}

Friend name for context: ${friend.name}.`;

  const userMsg: ChatMessage = {
    role: "user",
    content: `Recent conversation:\n${transcript}\n\nReturn JSON only: {"suggestions":["...","..."]}`,
  };

  try {
    const raw = await chatCompletion(system, [userMsg], 0.6);
    let suggestions = parseSuggestions(raw);
    if (suggestions.length < 2) {
      suggestions = [
        suggestions[0] ?? "Tell me more about that.",
        suggestions[1] ?? "What would you suggest I say next?",
      ];
    }
    return NextResponse.json({ suggestions: suggestions.slice(0, 2) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
