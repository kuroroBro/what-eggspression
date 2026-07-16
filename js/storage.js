// localStorage persistence for last-used setup choices (categories, hints
// toggle, team names). No custom categories in this version — see spec.md
// Non-goals.

import { CATEGORIES } from './categories.js';

const SETTINGS_KEY = 'eggspression.settings.v1';
const USED_PUZZLES_KEY = 'eggspression.usedPuzzleKeys.v1';

export const DEFAULT_SETTINGS = {
  language: 'tagalog',
  categoryIds: CATEGORIES.filter((c) => c.language === 'tagalog').map((c) => c.id),
  hintsEnabled: true,
  timerSeconds: 30, // 0/null = no timer
  targetScore: 0, // 0/null = no target — play through the whole deck
  teamNames: { a: 'Team A', b: 'Team B' },
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full/blocked — the game still works for this session
  }
}

export function loadSettings() {
  const saved = read(SETTINGS_KEY, null);
  if (!saved) return structuredClone(DEFAULT_SETTINGS);
  return {
    ...structuredClone(DEFAULT_SETTINGS),
    ...saved,
    teamNames: { ...DEFAULT_SETTINGS.teamNames, ...(saved.teamNames || {}) },
  };
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, settings);
}

export function puzzleKey(categoryId, puzzle) {
  return `${categoryId}::${puzzle.answer}`;
}

export function loadUsedPuzzleKeys() {
  const saved = read(USED_PUZZLES_KEY, []);
  if (!Array.isArray(saved)) return [];
  return saved.filter((key) => typeof key === 'string');
}

export function saveUsedPuzzleKeys(keys) {
  write(USED_PUZZLES_KEY, [...new Set(keys)]);
}

export function markPuzzleUsed(categoryId, puzzle) {
  if (!categoryId || !puzzle) return;
  const key = puzzleKey(categoryId, puzzle);
  const used = loadUsedPuzzleKeys();
  if (used.includes(key)) return;
  saveUsedPuzzleKeys([...used, key]);
}

export function resetUsedPuzzleKeys() {
  saveUsedPuzzleKeys([]);
}

export function filterUnusedCategories(categoryPool, categoryIds, usedKeys = loadUsedPuzzleKeys()) {
  const selected = new Set(categoryIds);
  const used = new Set(usedKeys);
  return categoryPool.map((category) => {
    if (!selected.has(category.id)) return category;
    return {
      ...category,
      puzzles: category.puzzles.filter((puzzle) => !used.has(puzzleKey(category.id, puzzle))),
    };
  });
}

export function countPuzzles(categoryPool, categoryIds) {
  const selected = new Set(categoryIds);
  return categoryPool
    .filter((category) => selected.has(category.id))
    .reduce((total, category) => total + category.puzzles.length, 0);
}
