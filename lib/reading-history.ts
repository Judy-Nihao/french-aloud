export type Reading = { text: string; playedAt: number };
export const HISTORY_KEY = "french-aloud:readings:v1";

export function parseReadings(value: string | null): Reading[] {
  try {
    const entries: unknown = JSON.parse(value ?? "[]");
    if (!Array.isArray(entries)) return [];
    const valid = entries.filter(
      (entry): entry is Reading =>
        typeof entry?.text === "string" &&
        Boolean(entry.text.trim()) &&
        entry.text.length <= 5000 &&
        typeof entry.playedAt === "number" &&
        Number.isFinite(entry.playedAt) &&
        entry.playedAt >= 0 &&
        entry.playedAt <= 8640000000000000,
    );
    return valid
      .sort((a, b) => b.playedAt - a.playedAt)
      .filter(
        (entry, index, all) =>
          all.findIndex((other) => other.text.trim() === entry.text.trim()) ===
          index,
      )
      .slice(0, 10)
      .map((entry) => ({ text: entry.text.trim(), playedAt: entry.playedAt }));
  } catch {
    return [];
  }
}

export function addReading(
  entries: Reading[],
  text: string,
  playedAt = Date.now(),
): Reading[] {
  const clean = text.trim();
  if (!clean || clean.length > 5000) return entries;
  return [
    { text: clean, playedAt },
    ...entries.filter((entry) => entry.text !== clean),
  ].slice(0, 10);
}
