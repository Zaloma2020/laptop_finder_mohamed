// storage.js - everything saved in localStorage (favorites, comparison list, theme).

const KEYS = {
  favorites: "lf_favorites",
  compare: "lf_compare",
  theme: "lf_theme",
};

export const MAX_COMPARE = 4;

// Reads and parses a value; returns the fallback if it is missing or broken.
const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked (private mode); the app keeps working without saving.
  }
};

// Tells the header badge and the pages that favorites changed.
const notify = () => window.dispatchEvent(new CustomEvent("favorites-changed"));

/* ---------- Favorites ---------- */
export const getFavorites = () => read(KEYS.favorites, []);

export const isFavorite = (id) => getFavorites().includes(Number(id));

// Adds the laptop if missing, removes it if saved. Returns true when it is now saved.
export function toggleFavorite(id) {
  const numericId = Number(id);
  const favorites = getFavorites();
  const saved = favorites.includes(numericId);

  if (saved) {
    write(KEYS.favorites, favorites.filter((fav) => fav !== numericId));
    write(KEYS.compare, getCompareIds().filter((c) => c !== numericId));
  } else {
    write(KEYS.favorites, [...favorites, numericId]);
  }
  notify();
  return !saved;
}

export function clearFavorites() {
  write(KEYS.favorites, []);
  write(KEYS.compare, []);
  notify();
}

/* ---------- Comparison list (always a subset of favorites) ---------- */
export const getCompareIds = () => {
  const favorites = getFavorites();
  return read(KEYS.compare, []).filter((id) => favorites.includes(id));
};

export const isInCompare = (id) => getCompareIds().includes(Number(id));

// Adds or removes a laptop from the comparison.
// Returns { ok, inCompare }. ok is false when a fifth laptop is blocked.
export function toggleCompare(id) {
  const numericId = Number(id);
  const current = getCompareIds();

  if (current.includes(numericId)) {
    write(KEYS.compare, current.filter((c) => c !== numericId));
    notify();
    return { ok: true, inCompare: false };
  }

  if (current.length >= MAX_COMPARE) {
    return { ok: false, inCompare: false };
  }

  // A compared laptop must also be a favorite.
  if (!isFavorite(numericId)) {
    write(KEYS.favorites, [...getFavorites(), numericId]);
  }
  write(KEYS.compare, [...current, numericId]);
  notify();
  return { ok: true, inCompare: true };
}

/* ---------- Theme ---------- */
export const getSavedTheme = () => read(KEYS.theme, "performance");
export const saveTheme = (name) => write(KEYS.theme, name);
