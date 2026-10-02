export const MAX_LEADERBOARD_ENTRIES = 3;
export const MAX_PLAYER_NAME_LENGTH = 10;

export function normalizePlayerName(value) {
  return Array.from(String(value ?? '').trim()).slice(0, MAX_PLAYER_NAME_LENGTH).join('');
}

export function submitScore(entries, value, score) {
  const name = normalizePlayerName(value);
  if (!name || !Number.isSafeInteger(score) || score < 0) {
    return { entries, rank: 0, recorded: false };
  }

  const previous = entries.find(entry => entry.name === name);
  if (previous && previous.score >= score) {
    return { entries, rank: entries.indexOf(previous) + 1, recorded: false };
  }

  const next = entries.filter(entry => entry.name !== name);
  next.push({ name, score });
  next.sort((a, b) => b.score - a.score);
  const rank = next.findIndex(entry => entry.name === name) + 1;
  if (rank > MAX_LEADERBOARD_ENTRIES) return { entries, rank: 0, recorded: false };
  return { entries: next.slice(0, MAX_LEADERBOARD_ENTRIES), rank, recorded: true };
}
