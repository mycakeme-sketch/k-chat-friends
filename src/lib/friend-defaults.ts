import { FRIENDS } from "@/data/friends";
import { genericFriendHintStyle, genericFriendSystemPrompt } from "@/data/prompts/generic";
import { noahHintStyle, noahSystemPrompt } from "@/data/prompts/noah";
import { yoonHintStyle, yoonSystemPrompt } from "@/data/prompts/yoon";
import { WELCOME_BY_FRIEND } from "@/data/welcome";
import type { FriendProfile } from "@/types/chat";

export type FriendConfigStorage = {
  friends: FriendProfile[];
  welcomeById: Record<string, string>;
  promptsByPromptId: Record<string, { system: string; hintStyle: string }>;
};

export function getDefaultFriendConfig(): FriendConfigStorage {
  return {
    friends: JSON.parse(JSON.stringify(FRIENDS)) as FriendProfile[],
    welcomeById: { ...WELCOME_BY_FRIEND },
    promptsByPromptId: {
      noah: { system: noahSystemPrompt, hintStyle: noahHintStyle },
      yoon: { system: yoonSystemPrompt, hintStyle: yoonHintStyle },
      generic: { system: genericFriendSystemPrompt, hintStyle: genericFriendHintStyle },
    },
  };
}
