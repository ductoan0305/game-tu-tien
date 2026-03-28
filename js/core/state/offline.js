// ============================================================
// core/state/offline.js — Entry point tính tiến trình offline
//
// Flow:
//   1. main.js gọi calcOfflineSec(G) để biết offline bao lâu
//   2. Hiện popup hỏi người chơi: Bế Quan / Nghỉ Ngơi
//   3. Người chọn Bế Quan → gọi applyOfflineMeditate(G, offSec)
//      Người chọn Nghỉ Ngơi → gọi applyOfflineSkip(G, offSec)
// ============================================================

import { simulateOfflineMeditate } from './offline-simulate.js';

const OFFLINE_CAP_SEC = 8 * 3600; // tối đa 8 tiếng thực

// ── Tính số giây offline, trả về 0 nếu quá ngắn ─────────────
export function calcOfflineSec(G) {
  const offSec = Math.floor((Date.now() - (G.lastSave || Date.now())) / 1000);
  if (offSec < 5) return 0;
  return Math.min(offSec, OFFLINE_CAP_SEC);
}

// ── Người chọn Bế Quan — simulate đầy đủ ────────────────────
export function applyOfflineMeditate(G, offSec) {
  if (!offSec || offSec < 5) return null;
  return simulateOfflineMeditate(G, offSec);
}

// ── Người chọn Nghỉ Ngơi — bỏ qua hoàn toàn ────────────────
// Tuổi thọ đứng yên, không nhận gì
// Buff timers cũng không trôi — thời gian đóng băng hoàn toàn
export function applyOfflineSkip(G, offSec) {
  if (!offSec || offSec < 5) return null;
  return {
    offSec,
    qiEarned:         0,
    purityEarned:     0,
    masteryGained:    {},
    buffsExpired:     [],
    offlineYears:     0,
    gameOver:         false,
    questsProgressed: 0,
    choseMeditate:    false,
  };
}

// ── Backward-compat: giữ export cũ để không break import nào ─
export function calcOfflineProgress(G) {
  const offSec = calcOfflineSec(G);
  if (!offSec) return null;
  if (G.meditating) return applyOfflineMeditate(G, offSec);
  return applyOfflineSkip(G, offSec);
}