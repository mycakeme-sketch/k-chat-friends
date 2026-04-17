import { noahHintStyle, noahSystemPrompt } from "./noah";
import { yoonHintStyle, yoonSystemPrompt } from "./yoon";

export type PromptBundle = {
  system: string;
  hintStyle: string;
};

const map: Record<string, PromptBundle> = {
  noah: { system: noahSystemPrompt, hintStyle: noahHintStyle },
  yoon: { system: yoonSystemPrompt, hintStyle: yoonHintStyle },
};

export function getPrompts(promptId: string): PromptBundle {
  const b = map[promptId];
  if (!b) throw new Error(`Unknown promptId: ${promptId}`);
  return b;
}
