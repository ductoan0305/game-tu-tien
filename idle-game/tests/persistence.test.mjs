// ============================================================
// tests/persistence.test.mjs
// Save/load round-trip, version gate, and migration field-patching.
// Also encodes HANDOFF "GOTCHA" structural invariants so a future
// refactor that moves these fields fails loudly.
// ============================================================
import './_setup.js'; // installs in-memory localStorage BEFORE persistence runs
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { createFreshState } from '../js/core/state/fresh-state.js';
import { saveGame, loadGame, SAVE_KEY, SAVE_VERSION } from '../js/core/state/persistence.js';

beforeEach(() => globalThis.localStorage.clear());

// ---- Round-trip ----

test('saveGame -> loadGame round-trips a fresh state', () => {
  const g = createFreshState();
  g.setupDone = true;
  g.name = 'Test Dao Nhan';
  saveGame(g);
  const loaded = loadGame();
  assert.ok(loaded, 'expected a loaded state');
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.setupDone, true);
  assert.equal(loaded.name, 'Test Dao Nhan');
});

// ---- Version gate: stale-version saves are discarded, not crash ----

test('loadGame discards a save with mismatched version', () => {
  globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 99, name: 'old' }));
  const loaded = loadGame();
  assert.equal(loaded, null);
  assert.equal(globalThis.localStorage.getItem(SAVE_KEY), null, 'corrupt save cleared');
});

test('loadGame discards an unparseable save', () => {
  globalThis.localStorage.setItem(SAVE_KEY, '{not valid json');
  assert.equal(loadGame(), null);
});

// ---- Migration: profession inference from usage history ----

test('loadGame infers unlocked professions from alchemy usage', () => {
  const saved = { version: SAVE_VERSION, setupDone: true, alchemy: { craftsCount: 3 } };
  globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
  const loaded = loadGame();
  assert.ok(loaded.flags.unlockedProfessions.includes('luyen_dan'),
    'alchemy crafts should unlock luyen_dan');
  assert.ok(loaded.flags.unlockedProfessions.includes('nghe_nghiep'),
    'any profession unlocks the parent nghe_nghiep tab');
});

// ---- Migration: breakthrough cooldown defaults backfilled ----

test('loadGame backfills L2 breakthrough cooldown fields', () => {
  const saved = { version: SAVE_VERSION, setupDone: true };
  globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
  const loaded = loadGame();
  assert.equal(loaded._btFailStreak, 0);
  assert.equal(loaded._btFailCooldownUntil, 0);
});

// ---- Migration: legacy congPhap structural integrity ----

test('loadGame keeps congPhap structurally valid and preserves currentId', () => {
  const saved = {
    version: SAVE_VERSION, setupDone: true,
    congPhap: { currentId: 'truong_xuan_cong', unlockedIds: ['vo_danh', 'truong_xuan_cong'] },
  };
  globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
  const loaded = loadGame();
  // NOTE: deepMerge supplies the fresh default activeIds (['vo_danh']), so the
  // legacy `if (!activeIds)` branch never fires -- currentId is preserved but is
  // NOT auto-promoted into activeIds. Test the real post-load contract.
  assert.ok(Array.isArray(loaded.congPhap.activeIds), 'activeIds is a valid array');
  assert.equal(loaded.congPhap.currentId, 'truong_xuan_cong', 'currentId preserved');
  assert.ok(loaded.congPhap.mastery && typeof loaded.congPhap.mastery === 'object',
    'mastery object present');
});

// ============================================================
// HANDOFF GOTCHA invariants -- easy to break by refactor
// ============================================================

test('GOTCHA: furnaceLevel defaults to 0, never 1', () => {
  const g = createFreshState();
  assert.equal(g.alchemy.furnaceLevel, 0);
});

test('GOTCHA: nghiepLuc lives in kiepTu, not at top level', () => {
  const g = createFreshState();
  assert.equal(g.nghiepLuc, undefined, 'no top-level G.nghiepLuc');
  assert.equal(typeof g.kiepTu.nghiepLuc, 'number', 'kiepTu.nghiepLuc exists');
});

test('GOTCHA: dungeonQuestDone lives in flags, not at top level', () => {
  const g = createFreshState();
  assert.equal(g.dungeonQuestDone, undefined, 'no top-level G.dungeonQuestDone');
  assert.equal(typeof g.flags.dungeonQuestDone, 'boolean');
});
