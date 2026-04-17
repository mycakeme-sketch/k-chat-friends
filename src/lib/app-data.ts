import type { SupabaseClient } from "@supabase/supabase-js";

export type StoredMessage = { role: "user" | "assistant"; content: string; at: number };

export async function fetchDisplayName(sb: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await sb
    .from("profiles")
    .select("display_name")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.display_name?.trim() ?? "";
}

export async function saveDisplayName(sb: SupabaseClient, userId: string, name: string): Promise<void> {
  const trimmed = name.trim();
  const updatedAt = new Date().toISOString();

  const { data: existing, error: selErr } = await sb
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) {
    const { error } = await sb
      .from("profiles")
      .update({ display_name: trimmed, updated_at: updatedAt })
      .eq("user_id", userId);
    if (error) throw error;
    return;
  }

  const { error: insErr } = await sb.from("profiles").insert({
    user_id: userId,
    display_name: trimmed,
    updated_at: updatedAt,
  });
  if (insErr) {
    if (insErr.code === "23505") {
      const { error: upErr } = await sb
        .from("profiles")
        .update({ display_name: trimmed, updated_at: updatedAt })
        .eq("user_id", userId);
      if (upErr) throw upErr;
      return;
    }
    throw insErr;
  }
}

export async function fetchAddedFriends(sb: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await sb.from("added_friends").select("friend_id").eq("user_id", userId);
  if (error) throw error;
  return data?.map((r) => r.friend_id) ?? [];
}

export async function fetchAddedFriendsWithSub(
  sb: SupabaseClient,
  userId: string,
): Promise<{ friend_id: string; subscribed: boolean }[]> {
  const { data, error } = await sb
    .from("added_friends")
    .select("friend_id, subscribed")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export async function addFriendRow(sb: SupabaseClient, userId: string, friendId: string): Promise<void> {
  const { data: existing, error: selErr } = await sb
    .from("added_friends")
    .select("user_id")
    .eq("user_id", userId)
    .eq("friend_id", friendId)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return;

  const { error: insErr } = await sb.from("added_friends").insert({
    user_id: userId,
    friend_id: friendId,
    subscribed: false,
  });
  if (insErr) {
    if (insErr.code === "23505") return;
    throw insErr;
  }
}

export async function fetchSubscribed(sb: SupabaseClient, userId: string, friendId: string): Promise<boolean> {
  const { data, error } = await sb
    .from("added_friends")
    .select("subscribed")
    .eq("user_id", userId)
    .eq("friend_id", friendId)
    .maybeSingle();
  if (error) throw error;
  return !!data?.subscribed;
}

export async function setSubscribedRow(
  sb: SupabaseClient,
  userId: string,
  friendId: string,
  value: boolean,
): Promise<void> {
  const { error } = await sb
    .from("added_friends")
    .update({ subscribed: value })
    .eq("user_id", userId)
    .eq("friend_id", friendId);
  if (error) throw error;
}

export async function fetchMessages(sb: SupabaseClient, userId: string, friendId: string): Promise<StoredMessage[]> {
  const { data, error } = await sb
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("user_id", userId)
    .eq("friend_id", friendId)
    .order("id", { ascending: true });
  if (error) throw error;
  return (
    data?.map((r) => ({
      role: r.role as "user" | "assistant",
      content: r.content,
      at: Number(r.created_at),
    })) ?? []
  );
}

export async function replaceMessages(
  sb: SupabaseClient,
  userId: string,
  friendId: string,
  messages: StoredMessage[],
): Promise<void> {
  const { error: delErr } = await sb.from("chat_messages").delete().eq("user_id", userId).eq("friend_id", friendId);
  if (delErr) throw delErr;
  if (messages.length === 0) return;
  const { error: insErr } = await sb.from("chat_messages").insert(
    messages.map((m) => ({
      user_id: userId,
      friend_id: friendId,
      role: m.role,
      content: m.content,
      created_at: m.at,
    })),
  );
  if (insErr) throw insErr;
}

export async function fetchLikeState(
  sb: SupabaseClient,
  userId: string,
  friendId: string,
  slideIndex: number,
): Promise<boolean> {
  const { data, error } = await sb
    .from("slide_likes")
    .select("liked")
    .eq("user_id", userId)
    .eq("friend_id", friendId)
    .eq("slide_index", slideIndex)
    .maybeSingle();
  if (error) throw error;
  return !!data?.liked;
}

export async function setLikeRow(
  sb: SupabaseClient,
  userId: string,
  friendId: string,
  slideIndex: number,
  liked: boolean,
): Promise<void> {
  const { error } = await sb.from("slide_likes").upsert(
    {
      user_id: userId,
      friend_id: friendId,
      slide_index: slideIndex,
      liked,
    },
    { onConflict: "user_id,friend_id,slide_index" },
  );
  if (error) throw error;
}

/** 현재 사용자 행만 삭제 후 새 익명 세션으로 바꿀 때 사용 */
export async function deleteAllUserData(sb: SupabaseClient, userId: string): Promise<void> {
  const { error: e1 } = await sb.from("slide_likes").delete().eq("user_id", userId);
  if (e1) throw e1;
  const { error: e2 } = await sb.from("chat_messages").delete().eq("user_id", userId);
  if (e2) throw e2;
  const { error: e3 } = await sb.from("added_friends").delete().eq("user_id", userId);
  if (e3) throw e3;
  const { error: e4 } = await sb.from("profiles").delete().eq("user_id", userId);
  if (e4) throw e4;
}
