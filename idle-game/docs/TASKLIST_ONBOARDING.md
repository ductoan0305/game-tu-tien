# TASKLIST ONBOARDING V1

## 1) State and persistence
- [ ] Add `G.tutorial` default state in `js/core/state/fresh-state.js`
- [ ] Ensure load/migration keeps backward compatibility in `js/core/state/persistence.js`

## 2) Step engine
- [ ] Create tutorial step updater (example file: `js/core/tutorial-engine.js`)
- [ ] Add function `updateTutorialStep(G, ctx)`:
  - [ ] update progress fields
  - [ ] evaluate pass conditions
  - [ ] advance step

## 3) Wire events and actions
- [ ] Hook `tick:meditate` to accumulate meditate seconds
  - likely in `js/core/systems/tick.js` or event handler layer
- [ ] On successful stamina actions, set progress flag
  - actions in `js/core/systems/cultivation.js`
- [ ] On breakthrough attempt, set progress flag
  - `js/core/systems/breakthrough.js` and/or action wrapper in `js/main.js`
- [ ] On tab open, update tutorial tab flags
  - tab routing in `js/main.js` / `js/ui/render-core.js`

## 4) UI components
- [ ] Add objective panel renderer (non-blocking)
  - suggested: `js/ui/render-core.js`
- [ ] Add Step 5 blocking modal with "Da hieu" button
  - suggested: `js/app/popups/misc-popups.js`
- [ ] Add "Cam nang tan dao huu" reopen entry point
  - suggested: header/menu area in `js/main.js` or `render-core`

## 5) Content copy (V1)
- [ ] Add per-step short text (0..6)
- [ ] Add age warning popup text for Step 5
- [ ] Keep tone consistent with hardcore cultivation theme

## 6) QA checklist
- [ ] New save enters Step 0 immediately after setup
- [ ] Step progression works in order 0 -> 6
- [ ] Closing panel does not break progression
- [ ] Step 5 modal appears once and can be acknowledged
- [ ] After completion, onboarding does not re-trigger
- [ ] Old saves without `tutorial` load normally

## 7) Guardrails
- [ ] No reward that gives free stone just for tutorial progression
- [ ] No permanent stat buff from tutorial steps
- [ ] No change to realm balance formulas in V1
