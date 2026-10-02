const KEY = 'baozi-blocks-high-score-v2';
export function loadHighScore(storage) {
  try {
    const value = Number(storage.getItem(KEY));
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  } catch { return 0; }
}
export function saveHighScore(storage, score) {
  try { storage.setItem(KEY, String(score)); } catch { /* In-memory high score remains available. */ }
}
