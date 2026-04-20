import { genericFriendHintStyle, genericFriendSystemPrompt } from "./generic";
import { noahHintStyle, noahSystemPrompt } from "./noah";
import { yoonHintStyle, yoonSystemPrompt } from "./yoon";

export type PromptBundle = {
  system: string;
  hintStyle: string;
};

const map: Record<string, PromptBundle> = {
  noah: { system: noahSystemPrompt, hintStyle: noahHintStyle },
  yoon: { system: yoonSystemPrompt, hintStyle: yoonHintStyle },
  generic: { system: genericFriendSystemPrompt, hintStyle: genericFriendHintStyle },
};

/** 코드에 없는 promptId(예: `/dev/characters`에서 만든 id)는 generic으로 폴백 */
export function getPrompts(promptId: string): PromptBundle {
  const b = map[promptId] ?? map.generic;
  if (!b) throw new Error(`Unknown promptId: ${promptId}`);
  return b;
}
