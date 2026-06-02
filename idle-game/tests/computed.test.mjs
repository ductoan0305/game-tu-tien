// ============================================================
// tests/computed.test.mjs — Pure computed-value invariants
// Guards the formulas in js/core/state/computed.js and the
// HANDOFF "GOTCHA" rules that depend on them.
// ============================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createFreshState } from '../js/core/state/fresh-state.js';
import {
  calcQiRate, calcMaxQi, calcPurityThreshold,
  calcEffectiveCanCot, calcKhauKhauBonus,
  calcKienCoCeiling, calcThuanDoCeiling,
} from '../js/core/state/computed.js';

const G = () => createFreshState();

// ---- calcQiRate: meditating gate (GOTCHA: không bế quan = qi không tăng) ----

test('calcQiRate returns 0 when not meditating', () => {
  const g = G();
  g.meditating = false;
  assert.equal(calcQiRate(g), 0);
});

test('calcQiRate is positive while meditating with default state', () => {
  const g = G();
  g.meditating = true;
  assert.ok(calcQiRate(g) > 0, 'expected positive qi rate while meditating');
});

test('calcQiRate scales up with higher-tier phap dia', () => {
  const base = G(); base.meditating = true;
  const rich = G(); rich.meditating = true; rich.phapDia.currentId = 'phuc_dia';
  assert.ok(calcQiRate(rich) > calcQiRate(base),
    'phuc_dia (×1.8) should out-rate pham_dia (×0.8)');
});

// ---- calcMaxQi: geometric scaling per stage ----

test('calcMaxQi follows qiBase × qiScaling^(stage-1)', () => {
  const g = G(); // realmIdx 0: qiBase 100, qiScaling 1.6
  g.stage = 1;
  assert.equal(calcMaxQi(g), 100);
  g.stage = 2;
  assert.equal(calcMaxQi(g), Math.floor(100 * 1.6));
  g.stage = 3;
  assert.equal(calcMaxQi(g), Math.floor(100 * 1.6 * 1.6));
});

// ---- calcPurityThreshold: matches calibrated LK table ----

test('calcPurityThreshold matches calibrated LK thresholds', () => {
  const g = G();
  const expected = [107, 182, 310, 528, 898, 1527, 2597, 4414, 7505];
  for (let s = 1; s <= 9; s++) {
    g.stage = s;
    assert.equal(calcPurityThreshold(g), expected[s - 1], `LK stage ${s}`);
  }
});

// ---- calcEffectiveCanCot: clamp + base default (GOTCHA: don't read G.canCot directly) ----

test('calcEffectiveCanCot defaults to 50 and clamps to 100', () => {
  const g = G();
  delete g.canCot;
  assert.equal(calcEffectiveCanCot(g), 50, 'missing canCot defaults to 50');
  g.canCot = 1000;
  assert.equal(calcEffectiveCanCot(g), 100, 'clamped to 100');
});

// ---- calcKhauKhauBonus: empty when no master bound ----

test('calcKhauKhauBonus is all-zero with no khau khau master', () => {
  const g = G();
  g._npcKhauKhau = {};
  const b = calcKhauKhauBonus(g);
  assert.deepEqual(b, { danBonus: 0, atkPct: 0, eventRatePct: 0, ratePct: 0 });
});

test('calcKhauKhauBonus ignores inactive entries', () => {
  const g = G();
  g._npcKhauKhau = { lao_duoc_su: false };
  const b = calcKhauKhauBonus(g);
  assert.equal(b.danBonus + b.atkPct + b.eventRatePct + b.ratePct, 0);
});

// ---- Grade-driven ceilings (R3) ----

test('calcKienCoCeiling rises with công pháp grade', () => {
  const g = G();
  g.congPhap.activeIds = ['vo_danh']; // tạp = grade 0
  assert.equal(calcKienCoCeiling(g), 60);
});

test('calcThuanDoCeiling for tạp grade is 0.85× the stage threshold', () => {
  const g = G();
  g.stage = 1; // threshold 107
  g.congPhap.activeIds = ['vo_danh'];
  assert.equal(calcThuanDoCeiling(g), 107 * 0.85);
});
