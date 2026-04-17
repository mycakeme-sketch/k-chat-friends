import type { ChatMessage } from "@/types/chat";

/**
 * OpenAI-compatible Chat Completions (server-only).
 *
 * API 키는 이 파일에 적지 않습니다. 프로젝트 루트에 `.env.local` 파일을 만들고:
 *   OPENAI_API_KEY=sk-...실제키...
 * 변수 이름은 루트의 `.env.example` 참고. Next.js가 서버(API 라우트)에서만 읽습니다.
 * `.env.local`은 git에 올리지 마세요.
 */

const DEFAULT_MODEL = "gpt-4o-mini";

function getConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl =
    process.env.OPENAI_BASE_URL?.replace(/\/$/, "") || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  return { apiKey, baseUrl, model };
}

type ApiMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chatCompletion(
  system: string,
  messages: ChatMessage[],
  temperature = 0.85,
): Promise<string> {
  const { apiKey, baseUrl, model } = getConfig();
  const apiMessages: ApiMessage[] = [
    { role: "system", content: system },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  if (!apiKey) {
    return (
      "[Demo] API key missing. Set OPENAI_API_KEY in .env.local.\n\n" +
      "You said: " +
      (messages.filter((m) => m.role === "user").pop()?.content ?? "")
    );
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM error ${res.status}: ${err.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty LLM response");
  return text;
}
