// ============================================================
// core/currency.js — Hệ thống Tiền Tệ 4 Cấp
// Hạ Phẩm → Trung Phẩm → Thượng Phẩm → Cực Phẩm Linh Thạch
// ============================================================

export const CURRENCY_TIERS = {
  ha:     { name: 'Hạ Phẩm',   emoji: '💎', color: '#aaa',    rate: 1       },
  trung:  { name: 'Trung Phẩm',emoji: '💠', color: '#56c46a', rate: 100     },
  thuong: { name: 'Thượng Phẩm',emoji: '🔮', color: '#7b9ef0', rate: 10000  },
  cucpham:{ name: 'Cực Phẩm',   emoji: '⭐', color: '#f0d47a', rate: 1000000 },
};

// Quy đổi sang Hạ Phẩm
export function toHaCount(currency) {
  return (currency.ha || 0)
    + (currency.trung  || 0) * 100
    + (currency.thuong || 0) * 10000
    + (currency.cucpham|| 0) * 1000000;
}

// Tạo currency object từ số Hạ Phẩm
export function fromHaCount(total) {
  const cucpham = Math.floor(total / 1000000);
  total %= 1000000;
  const thuong  = Math.floor(total / 10000);
  total %= 10000;
  const trung   = Math.floor(total / 100);
  const ha      = total % 100;
  return { ha, trung, thuong, cucpham };
}

// Thêm tiền
export function addCurrency(G, haAmount) {
  if (!G.currency) G.currency = { ha:0, trung:0, thuong:0, cucpham:0 };
  const total = toHaCount(G.currency) + Math.floor(haAmount);
  G.currency = fromHaCount(total);
  // Backward compat
  G.stone = toHaCount(G.currency);
}

// Trừ tiền — return false nếu không đủ
export function spendCurrency(G, haAmount) {
  if (!G.currency) G.currency = { ha:0, trung:0, thuong:0, cucpham:0 };
  const total = toHaCount(G.currency);
  if (total < haAmount) return false;
  G.currency = fromHaCount(total - haAmount);
  G.stone = toHaCount(G.currency);
  return true;
}

// Hiển thị đẹp
export function formatCurrency(G) {
  if (!G.currency) return '0 Hạ';
  const c = G.currency;
  const parts = [];
  if (c.cucpham > 0) parts.push(`${c.cucpham}⭐`);
  if (c.thuong  > 0) parts.push(`${c.thuong}🔮`);
  if (c.trung   > 0) parts.push(`${c.trung}💠`);
  if (c.ha      > 0 || parts.length === 0) parts.push(`${c.ha}💎`);
  return parts.join(' ');
}

// Hiển thị ngắn gọn (dùng trong header)
export function formatCurrencyShort(G) {
  const total = toHaCount(G.currency || { ha: G.stone || 0 });
  if (total >= 1000000) return `${(total/1000000).toFixed(1)}🔮`;
  if (total >= 10000)   return `${(total/10000).toFixed(1)}💠`;
  if (total >= 1000)    return `${(total/1000).toFixed(1)}K💎`;
  return `${total}💎`;
}

// Migrate từ G.stone cũ sang G.currency
export function migrateCurrency(G) {
  if (G.currency) return; // đã có rồi
  const stone = G.stone || 0;
  G.currency = fromHaCount(Math.floor(stone));
}
