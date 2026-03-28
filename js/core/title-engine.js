// ============================================================
// core/title-engine.js — Kiểm tra và unlock danh hiệu
// ============================================================
import { TITLES, RARITY_ORDER } from './title-data.js';
import { bus } from '../utils/helpers.js';

/**
 * Kiểm tra tất cả titles, unlock những cái chưa có và đủ điều kiện.
 * Gọi từ gameTick hoặc sau mỗi action quan trọng.
 * @returns {Array} mảng title mới được unlock (để show toast)
 */
export function checkTitles(G) {
  if (!G.titles) G.titles = { unlocked: [], active: null };

  const newlyUnlocked = [];
  for (const title of TITLES) {
    if (G.titles.unlocked.includes(title.id)) continue;
    try {
      if (title.condition(G)) {
        G.titles.unlocked.push(title.id);
        newlyUnlocked.push(title);
        // Auto-equip nếu rarity cao hơn title hiện tại
        if (!G.titles.active) {
          G.titles.active = title.id;
        } else {
          const curTitle = TITLES.find(t => t.id === G.titles.active);
          const curRank  = RARITY_ORDER.indexOf(curTitle?.rarity || 'common');
          const newRank  = RARITY_ORDER.indexOf(title.rarity);
          if (newRank > curRank) G.titles.active = title.id;
        }
        bus.emit('title:unlocked', { title });
      }
    } catch (e) { /* condition lỗi — bỏ qua */ }
  }
  return newlyUnlocked;
}

/**
 * Đặt danh hiệu active
 */
export function setActiveTitle(G, titleId) {
  if (!G.titles?.unlocked?.includes(titleId)) {
    return { ok: false, msg: 'Chưa mở khóa danh hiệu này', type: 'danger' };
  }
  G.titles.active = titleId;
  const t = TITLES.find(t => t.id === titleId);
  return { ok: true, msg: `Danh hiệu: ${t?.name || titleId}`, type: 'jade' };
}

/**
 * Lấy title object đang active
 */
export function getActiveTitle(G) {
  if (!G.titles?.active) return null;
  return TITLES.find(t => t.id === G.titles.active) || null;
}

/**
 * Lấy tất cả titles đã unlock, sort theo rarity desc
 */
export function getUnlockedTitles(G) {
  const ids = G.titles?.unlocked || [];
  return TITLES
    .filter(t => ids.includes(t.id))
    .sort((a, b) => RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity));
}
