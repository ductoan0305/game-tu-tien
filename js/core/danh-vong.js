// ============================================================
// core/danh-vong.js — Danh Vọng system helpers
// ============================================================

export const DANH_VONG_TIERS = [
  { min: 500, label: '🔥 Lừng Lẫy',  color: '#f0d47a', discountPct: 15 },
  { min: 300, label: '⭐ Nổi Danh',   color: '#a855f7', discountPct: 10 },
  { min: 150, label: '✦ Có Tiếng',    color: '#3a9fd5', discountPct:  6 },
  { min:  50, label: '· Tân Tiến',    color: '#56c46a', discountPct:  3 },
  { min:   0, label: '— Vô Danh',     color: '#666',    discountPct:  0 },
];

export function getDanhVongTier(dv) {
  return DANH_VONG_TIERS.find(t => dv >= t.min) || DANH_VONG_TIERS[DANH_VONG_TIERS.length - 1];
}

// Tính giá sau discount danh vọng
export function applyDanhVongDiscount(cost, G) {
  const tier = getDanhVongTier(G.danhVong ?? 0);
  if (tier.discountPct <= 0) return { cost, discountPct: 0 };
  return {
    cost: Math.floor(cost * (1 - tier.discountPct / 100)),
    discountPct: tier.discountPct,
  };
}