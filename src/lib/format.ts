/** Compact display for like counts (Korean app style). */
export function formatLikeCount(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
