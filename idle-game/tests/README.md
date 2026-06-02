# Tests — Phase 0 Safety Net

Zero-dependency test suite using Node's built-in runner (`node:test` + `node:assert`).
No `npm install`, no framework, no `node_modules` bloat. Requires Node 18+.

## Run

```
cd idle-game
npm test
# or directly:
node --test "tests/*.test.mjs"
```

All source is loaded as ES modules (`package.json` has `"type": "module"`).
The browser ignores that field, so this does NOT change in-game behavior.

## What's covered

These tests lock down the formulas + invariants that the HANDOFF "GOTCHA"
section warns are easy to break by refactor. They are unit tests of pure
core logic only — no DOM, no rendering.

- **computed.test.mjs** — qi-rate meditating gate, phap-dia scaling, calcMaxQi
  geometric scaling, the calibrated LK purityThreshold table, calcEffectiveCanCot
  clamp/default, calcKhauKhauBonus zero-state, grade-driven Kiên Cố / Thuần Độ ceilings.
- **breakthrough.test.mjs** — the BALANCE design anchor (Ngũ LC LK1 ≈ 32.4%),
  the F_purity hard floor (<50% ratio → 0%), linh-căn ordering, the L2 fail-cooldown
  gate (must NOT consume qi/purity), the R4 LK3 bottleneck hard gate, and fail-streak
  reset on success.
- **persistence.test.mjs** — save/load round-trip, version-mismatch discard,
  unparseable-save discard, profession inference migration, L2 cooldown backfill,
  legacy congPhap structural integrity, plus structural GOTCHA invariants
  (furnaceLevel defaults to 0; nghiepLuc lives in kiepTu; dungeonQuestDone lives in flags).

## Test environment notes

- `tests/_setup.js` installs an in-memory `localStorage` on `globalThis` so
  `persistence.js` works under Node. Import it FIRST in any file that calls
  saveGame/loadGame.
- Files use the `.test.mjs` extension and are discovered by the `tests/*.test.mjs` glob.

## How to extend

Add a new `*.test.mjs` file. Import the module under test from `../js/...`,
use `test()` from `node:test` and `assert` from `node:assert/strict`.
Keep tests to PURE core logic (state/computed/systems) — anything importing
`js/ui/*` will pull in DOM globals that don't exist under Node.

## One finding from writing these tests

The legacy `_migrateCongPhap` `if (!activeIds)` promotion branch is effectively
dead: `deepMerge` always supplies the fresh-state default `activeIds: ['vo_danh']`,
so a legacy save's `currentId` is preserved but never promoted into `activeIds`.
Not fixed here (out of Phase 0 scope) — documented in the test as the real contract.
