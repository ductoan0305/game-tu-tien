// ============================================================
// tests/breakthrough.test.mjs
// Locks the breakthrough math to the HANDOFF/BALANCE design
// claims and the L2 cooldown + R4 bottleneck gates.
// ============================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createFreshState } from '../js/core/state/fresh-state.js';
import { calcMaxQi, calcPurityThreshold } from '../js/core/state/computed.js';
import { calcBreakthroughChance, doBreakthrough } from '../js/core/systems/breakthrough.js';

// Helper: a clean LK1 candidate with full qi and a chosen purity ratio.
function lk1Candidate({ spiritType = 'NGU', ngoTinh = 50, tamCanh = 50, canCot = 50, purityRatio = 1.0 } = {}) {
  const g = createFreshState();
  g.realmIdx = 0;
  g.stage = 1;
  g.spiritData = { type: spiritType };
  g.ngoTinh = ngoTinh;
  g.tamCanh = tamCanh;
  g.canCot = canCot;
  g.gameTime.currentYear = 12; // well under age penalty window
  const threshold = calcPurityThreshold(g);
  g.purity = Math.round(threshold * purityRatio);
  g.qi = calcMaxQi(g);
  g._btFailCooldownUntil = 0;
  return g;
}

// ---- BALANCE anchor: Ngũ LC LK1 ≈ 32.4% (HANDOFF §BALANCE) ----

test('Ngũ LC LK1 with full purity is ~32.4% (design anchor)', () => {
  const g = lk1Candidate({ spiritType: 'NGU', purityRatio: 1.0 });
  const { chance } = calcBreakthroughChance(g);
  // 0.90 × 0.40 × 1.0(F_tuoi) × 1.0(F_purity) × 1.0(F_ngotinh) × 0.9(F_tamcanh)
  assert.ok(Math.abs(chance - 32.4) < 0.2, `expected ~32.4%, got ${chance}%`);
});

// ---- F_purity hard floor: below 50% ratio → 0% chance ----

test('Below 50% purity ratio gives 0% breakthrough chance', () => {
  const g = lk1Candidate({ purityRatio: 0.3 });
  const { chance, breakdown } = calcBreakthroughChance(g);
  assert.equal(breakdown.F_purity, 0);
  assert.equal(chance, 0);
});

test('Higher linh căn raises chance (Tiên > Ngũ)', () => {
  const ngu = calcBreakthroughChance(lk1Candidate({ spiritType: 'NGU' })).chance;
  const tien = calcBreakthroughChance(lk1Candidate({ spiritType: 'TIEN' })).chance;
  assert.ok(tien > ngu, `Tiên (${tien}) should exceed Ngũ (${ngu})`);
});

// ---- L2 cooldown gate: blocks WITHOUT consuming qi/purity ----

test('Active fail-cooldown blocks doBreakthrough without spending qi/purity', () => {
  const g = lk1Candidate({ purityRatio: 1.5 });
  const qiBefore = g.qi, purityBefore = g.purity;
  g._btFailCooldownUntil = Date.now() + 60_000; // 60s remaining
  const res = doBreakthrough(g);
  assert.equal(res.ok, false);
  assert.equal(g.qi, qiBefore, 'qi must be untouched while gated');
  assert.equal(g.purity, purityBefore, 'purity must be untouched while gated');
});

// ---- R4 bottleneck hard gate at LK3 (needs Kiên Cố ≥ 40) ----

test('LK3 bottleneck blocks breakthrough when Kiên Cố below 40', () => {
  const g = lk1Candidate({ purityRatio: 1.0 });
  g.stage = 3;
  g.purity = calcPurityThreshold(g); // refresh for stage 3 threshold
  g.qi = calcMaxQi(g);
  g.kienCo = 0;
  const res = doBreakthrough(g);
  assert.equal(res.ok, false);
  assert.equal(res.type, 'bottleneck_blocked');
});

// ---- Success path resets the fail streak + cooldown ----

test('Successful breakthrough resets fail streak and advances stage', () => {
  const g = lk1Candidate({ spiritType: 'TIEN', purityRatio: 2.0 });
  g._btFailStreak = 5;
  g._btFailCooldownUntil = 0;
  const realRandom = Math.random;
  Math.random = () => 0; // force success for any positive chance
  try {
    const res = doBreakthrough(g);
    assert.equal(res.ok, true);
    assert.equal(g._btFailStreak, 0, 'streak reset on success');
    assert.equal(g._btFailCooldownUntil, 0, 'cooldown cleared on success');
    assert.equal(g.stage, 2, 'advanced LK1 → LK2');
    assert.equal(g.kienCo, 0, 'Kiên Cố reset after breakthrough (R2)');
  } finally {
    Math.random = realRandom;
  }
});
