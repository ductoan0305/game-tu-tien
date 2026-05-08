// ============================================================
// ui/nav-progression.js — DEPRECATED SHIM
//
// Logic đã chuyển hoàn toàn sang core/visibility.js (S-Phase1).
// File này chỉ giữ lại để các import cũ không bị vỡ.
// Xóa file này sau khi đã dọn hết caller.
// ============================================================
import { getVisibleTabs } from '../core/visibility.js';

/** @deprecated Dùng isTabVisible() từ core/visibility.js */
export function isTabUnlocked(tabId, G) {
  return getVisibleTabs(G).includes(tabId);
}

/** @deprecated Không còn khái niệm "locked info" — tab ẩn hoàn toàn nếu chưa mở */
export function getTabLockInfo(tabId, G) {
  return null;
}

/** @deprecated */
export const TAB_UNLOCK_CONFIG = {};

/** @deprecated Dùng getUnlockMessages() từ core/visibility.js */
export function checkNewlyUnlocked(G, prevG) {
  return [];
}
