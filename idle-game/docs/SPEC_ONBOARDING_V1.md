# SPEC ONBOARDING V1 (LK ONLY)

## Scope
- Only onboarding for first 10 minutes.
- Only applies to Luyen Khi progression.
- No balance overhaul in this version.

## Goals
- New player always knows what to do next.
- Player understands game purpose early:
  - failure is normal,
  - age matters,
  - spirit root + cultivation method matter.
- No free power spike.

## State Contract
Add into `G`:

```js
tutorial: {
  enabled: true,
  step: 0, // 0..6
  completed: false,
  startedAt: 0,
  seenHints: {},
  progress: {
    meditateSec: 0,
    usedStaminaAction: false,
    attemptedBreakthrough: false,
    openedPhapdiaTab: false,
    openedQuestTab: false
  }
}
```

## Step Definition

### Step 0 - Enter world
- Trigger: `setupDone=true && tutorial.step===0`
- UI: "Bat dau be quan 10 giay de cam nhan linh luc."
- Pass: `meditateSec >= 10`
- On pass: `step=1`

### Step 1 - Learn cost
- UI: "Thu 1 hanh dong ton the nang."
- Pass: one successful stamina action (`explore/fish/array/spar/meditation`)
- On pass: `step=2`

### Step 2 - Touch breakthrough risk
- UI: "Thu dot pha 1 lan (thanh/cong deu hop le)."
- Pass: attempted breakthrough at least once
- On pass: `step=3`

### Step 3 - Understand cultivation method
- UI: "Mo tab Phap Dia de xem cong phap dang tu."
- Pass: open `phapdia` tab
- On pass: `step=4`

### Step 4 - Understand objective
- UI: "Mo tab Nhiem Vu de xem huong di tiep."
- Pass: open `quests` tab
- On pass: `step=5`

### Step 5 - Age warning
- Blocking popup text:
  - "Truoc 70 tuoi la cua so vang Luyen Khi."
  - "Qua moc nay, ty le dot pha giam manh."
- Pass: user clicks "Da hieu"
- On pass: `step=6`

### Step 6 - Complete onboarding
- UI: "Con duong tu tien da mo. That bai la binh thuong."
- Set:
  - `completed=true`
  - `enabled=false`

## Event Mapping
- `tick:meditate` -> increase `tutorial.progress.meditateSec`
- successful stamina action -> `usedStaminaAction=true`
- breakthrough action clicked -> `attemptedBreakthrough=true`
- tab switch `phapdia` -> `openedPhapdiaTab=true`
- tab switch `quests` -> `openedQuestTab=true`
- call `updateTutorialStep(G)` after each update

## UI Rules
- Show exactly one "Next Objective" panel at a time.
- Only Step 5 uses blocking modal.
- Other steps use non-blocking objective panel.
- Every hint auto-shown once (controlled by `seenHints`).

## Non-Goals V1
- No free stone reward.
- No combat redesign.
- No economy redesign.
- No realm balance changes.

## Acceptance Criteria
1. New save always has visible next objective.
2. First 10 minutes has no "I don't know what to do" dead state.
3. No easy exploit introduced.
4. Player understands:
   - breakthrough can fail,
   - age window is real,
   - cultivation path matters.
