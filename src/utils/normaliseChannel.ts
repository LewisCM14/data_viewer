/**
 * normaliseChannel
 *
 * Return the canonical channel id for a given item that may contain `channel`
 * or the misspelt `chanel`. Falls back to `unknown` when none present.
 */
export default function normaliseChannel(item: unknown): string {
  if (!item || typeof item !== "object") return "unknown";
  const obj = item as Record<string, unknown>;
  if (typeof obj.channel === "string") return obj.channel;
  if (typeof obj.chanel === "string") return obj.chanel;
  return "unknown";
}
