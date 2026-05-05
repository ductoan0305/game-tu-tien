// ============================================================
// core/tutorial-engine.js — Tutorial Step Engine
// Quản lý tutorial onboarding 10 phút đầu (LK only)
// Không ảnh hưởng balance. Không thêm reward.
// ============================================================

// ── Default state shape ─────────────────────────────────────
const FRESH_TUTORIAL = () => ({
  enabled: true,
  step: 0,        // 0..6
  completed: false,
  startedAt: 0,
  seenHints: {},
  panelDismissed: false,  // true khi người chơi bấm X đóng panel; reset khi step mới
  progress: {
    meditateSec: 0,
    usedStaminaAction: false,
    attemptedBreakthrough: false,
    openedPhapdiaTab: false,
    openedQuestTab: false,
  },
});

// ── Public: ensure G.tutorial exists ─────────────────────────
export function ensureTutorialState(G) {
  if (!G.tutorial || typeof G.tutorial !== 'object') {
    G.tutorial = FRESH_TUTORIAL();
    return;
  }
  const t = G.tutorial;
  if (t.enabled    === undefined) t.enabled    = true;
  if (t.step       === undefined) t.step       = 0;
  if (t.completed  === undefined) t.completed  = false;
  if (t.startedAt  === undefined) t.startedAt  = 0;
  if (!t.seenHints || typeof t.seenHints !== 'object') t.seenHints = {};
  if (t.panelDismissed === undefined) t.panelDismissed = false;
  if (!t.progress  || typeof t.progress  !== 'object') t.progress  = {};
  const p = t.progress;
  if (p.meditateSec             === undefined) p.meditateSec             = 0;
  if (p.usedStaminaAction       === undefined) p.usedStaminaAction       = false;
  if (p.attemptedBreakthrough   === undefined) p.attemptedBreakthrough   = false;
  if (p.openedPhapdiaTab        === undefined) p.openedPhapdiaTab        = false;
  if (p.openedQuestTab          === undefined) p.openedQuestTab          = false;
}

// ── Progress trackers (gọi từ action handlers ở main.js) ─────

/** Gọi mỗi tick khi đang bế quan, dt = 0.1s */
export function trackMeditateSeconds(G, dt) {
  const t = G?.tutorial;
  if (!t || !t.enabled || t.completed) return;
  if (t.step === 0) {
    t.progress.meditateSec = (t.progress.meditateSec ?? 0) + dt;
  }
}

/** Gọi sau khi action tiêu hao stamina thành công (explore/fish/array/spar/meditation) */
export function trackStaminaAction(G) {
  const t = G?.tutorial;
  if (!t || !t.enabled || t.completed) return;
  t.progress.usedStaminaAction = true;
}

/** Gọi khi người chơi bấm nút đột phá (dù thành hay bại) */
export function trackBreakthroughAttempt(G) {
  const t = G?.tutorial;
  if (!t || !t.enabled || t.completed) return;
  t.progress.attemptedBreakthrough = true;
}

/** Gọi khi mở tab — kiểm tra phapdia và quests */
export function trackTabOpen(G, tabId) {
  const t = G?.tutorial;
  if (!t || !t.enabled || t.completed) return;
  if (tabId === 'phapdia')  t.progress.openedPhapdiaTab = true;
  if (tabId === 'quests')   t.progress.openedQuestTab   = true;
}

/** Gọi khi người chơi bấm "Đã hiểu" ở modal cảnh báo tuổi (Step 5) */
export function acknowledgeAgeWarning(G) {
  const t = G?.tutorial;
  if (!t) return;
  if (!t.seenHints) t.seenHints = {};
  t.seenHints.age_warning_acknowledged = true;
}

// ── Core step evaluator ───────────────────────────────────────
/**
 * Gọi mỗi tick và sau mỗi action quan trọng.
 * Chỉ advance step khi pass condition được thoả mãn.
 * Không side-effect ngoài thay đổi G.tutorial.
 */
export function updateTutorialStep(G) {
  const t = G?.tutorial;
  if (!t || !t.enabled || t.completed || !G.setupDone) return;

  const p = t.progress;

  switch (t.step) {
    // ── Step 0: Bế quan 10 giây ──────────────────────────────
    case 0:
      if ((p.meditateSec ?? 0) >= 10) {
        _advance(G, 1);
      }
      break;

    // ── Step 1: Dùng 1 hành động tiêu stamina ────────────────
    case 1:
      if (p.usedStaminaAction) {
        _advance(G, 2);
      }
      break;

    // ── Step 2: Thử đột phá ít nhất 1 lần ───────────────────
    case 2:
      if (p.attemptedBreakthrough) {
        _advance(G, 3);
      }
      break;

    // ── Step 3: Mở tab Pháp Địa ──────────────────────────────
    case 3:
      if (p.openedPhapdiaTab) {
        _advance(G, 4);
      }
      break;

    // ── Step 4: Mở tab Nhiệm Vụ ──────────────────────────────
    case 4:
      if (p.openedQuestTab) {
        _advance(G, 5);
      }
      break;

    // ── Step 5: Age warning modal — chờ user acknowledge ─────
    // Advance được trigger qua acknowledgeAgeWarning() + gọi lại updateTutorialStep
    case 5:
      if (t.seenHints?.age_warning_acknowledged) {
        _advance(G, 6);
      }
      break;

    // ── Step 6: Hoàn tất ─────────────────────────────────────
    case 6:
      t.completed = true;
      t.enabled   = false;
      break;

    default:
      break;
  }
}

// ── Internal helpers ──────────────────────────────────────────

function _advance(G, nextStep) {
  const t = G.tutorial;
  if (t.step >= nextStep) return; // không giật lùi
  if (nextStep === 1 && !t.startedAt) {
    t.startedAt = Date.now();
  }
  t.panelDismissed = false; // Step mới → reset để panel auto-show lại
  t.step = nextStep;
}
