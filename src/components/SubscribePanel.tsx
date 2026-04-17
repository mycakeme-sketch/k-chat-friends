"use client";

type Props = {
  friendName: string;
  onSubscribe: () => void;
};

/** PDF-style paywall UI — no real payment; button marks subscribed locally. */
export function SubscribePanel({ friendName, onSubscribe }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-center text-sm font-medium text-zinc-800">
        You have to subscribe to {friendName} to continue chatting.
      </p>
      <p className="mt-1 text-center text-xs text-zinc-500">It costs $7 per month.</p>
      <button
        type="button"
        onClick={onSubscribe}
        className="mt-4 w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white active:bg-zinc-800"
      >
        Start limitless chatting
      </button>
      <p className="mt-2 text-center text-[11px] text-zinc-400">
        Demo: no real charge — this only unlocks chat in this browser.
      </p>
    </div>
  );
}
