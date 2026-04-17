import { getFriend } from "@/data/friends";
import { notFound } from "next/navigation";
import { FriendDetailClient } from "./FriendDetailClient";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function FriendDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const friend = getFriend(id);
  if (!friend) notFound();

  const hideAdd = sp.from === "chat";

  return <FriendDetailClient friend={friend} hideAdd={hideAdd} />;
}
