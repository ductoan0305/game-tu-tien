// ============================================================
// equipment/equipment-engine.js — Equip/unequip/drop logic
// Quy tắc: mọi mutation G.equipment đi qua đây
// ============================================================
import { EQUIPMENT, RARITY_TIERS } from './equipment-data.js';
import { bus } from '../utils/helpers.js';

/**
 * Lấy định nghĩa equipment theo id
 */
function getEqDef(itemId) {
  return EQUIPMENT.find(e => e.id === itemId) || null;
}

/**
 * Tính stats thực tế của item theo rarity (rolling khi drop)
 */
function calcItemStats(eqDef, rarity) {
  const tierBonus = RARITY_TIERS[rarity]?.bonus || 0;
  const stats = {};
  for (const [stat, base] of Object.entries(eqDef.statsBase)) {
    const perRarity = eqDef.statsPerRarity?.[stat] || 0;
    stats[stat] = base + perRarity * tierBonus;
  }
  return stats;
}

/**
 * Tạo item instance từ định nghĩa + rarity
 */
export function createEquipItem(itemId, rarity = null) {
  const def = getEqDef(itemId);
  if (!def) return null;
  const finalRarity = rarity || def.rarity;
  const stats = calcItemStats(def, finalRarity);
  return {
    itemId,
    name: def.name,
    emoji: def.emoji,
    slot: def.slot,
    rarity: finalRarity,
    stats,
  };
}

/**
 * Trang bị item từ bag vào slot
 * @param {object} G
 * @param {number} bagIndex - index trong G.equipment.bag
 * @returns {{ok, msg, type}}
 */
export function equipFromBag(G, bagIndex) {
  const item = G.equipment.bag[bagIndex];
  if (!item) return { ok: false, msg: 'Vật phẩm không tồn tại', type: 'danger' };

  const slot = item.slot;
  const old = G.equipment.slots[slot];

  // Swap: equip mới, đưa cũ về bag
  G.equipment.slots[slot] = item;
  if (old) {
    G.equipment.bag[bagIndex] = old;
  } else {
    G.equipment.bag.splice(bagIndex, 1);
  }

  return { ok: true, msg: `⚔ Trang bị ${item.name}`, type: 'jade' };
}

/**
 * Tháo item từ slot về bag
 */
export function unequipSlot(G, slot) {
  const item = G.equipment.slots[slot];
  if (!item) return { ok: false, msg: 'Không có trang bị để tháo', type: 'danger' };

  if (G.equipment.bag.length >= 20) {
    return { ok: false, msg: 'Túi trang bị đã đầy (20 slot)!', type: 'danger' };
  }

  G.equipment.bag.push(item);
  G.equipment.slots[slot] = null;
  return { ok: true, msg: `Đã tháo ${item.name}`, type: 'system' };
}

/**
 * Bán / vứt item từ bag
 */
export function discardFromBag(G, bagIndex) {
  const item = G.equipment.bag[bagIndex];
  if (!item) return { ok: false, msg: 'Không tìm thấy vật phẩm', type: 'danger' };

  const tierBonus = RARITY_TIERS[item.rarity]?.bonus || 0;
  const sellPrice = (50 + tierBonus * 200) * (1 + Object.keys(item.stats).length * 0.5);
  G.stone += Math.floor(sellPrice);
  G.equipment.bag.splice(bagIndex, 1);

  return { ok: true, msg: `💰 Bán ${item.name}: +${Math.floor(sellPrice)} linh thạch`, type: 'gold' };
}

/**
 * Roll equipment drop sau combat victory
 * Gọi từ combat-engine khi endCombat(victory=true)
 * Trả về item hoặc null
 */
export function rollEquipmentDrop(G, enemyDef) {
  if (!enemyDef?.id) return null;

  // Tìm equipment có thể drop từ enemy này
  const eligible = EQUIPMENT.filter(eq => {
    if (eq.minRealm > G.realmIdx) return false;
    return eq.dropFrom?.includes(enemyDef.id);
  });

  if (eligible.length === 0) return null;

  // Chọn ngẫu nhiên 1 equipment và roll chance
  const idx = Math.floor(Math.random() * eligible.length);
  const chosen = eligible[idx];
  if (Math.random() > chosen.dropChance) return null;

  // Roll rarity: base rarity có thể upgrade
  const rarityUpgrade = Math.random();
  let finalRarity = chosen.rarity;
  const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const baseIdx = rarityOrder.indexOf(chosen.rarity);
  if (rarityUpgrade > 0.95 && baseIdx < 4) finalRarity = rarityOrder[baseIdx + 1]; // 5% chance upgrade

  const item = createEquipItem(chosen.id, finalRarity);
  if (!item) return null;

  // Thêm vào bag nếu còn chỗ
  if (G.equipment.bag.length < 20) {
    G.equipment.bag.push(item);
    G.equipment.totalDropped++;
    bus.emit('equipment:drop', { item });
    return item;
  }

  return null; // bag full, drop bị bỏ
}

/**
 * Lấy label rarity với màu
 */
export function getRarityLabel(rarity) {
  const t = RARITY_TIERS[rarity];
  return t ? { label: t.label, color: t.color } : { label: rarity, color: '#aaa' };
}

/**
 * Format stats của item thành chuỗi hiển thị
 */
export function formatItemStats(stats) {
  const labels = {
    atk: '⚔ ATK', atkPct: '⚔ ATK%',
    def: '🛡 DEF', defPct: '🛡 DEF%',
    hp:  '❤ HP',  hpPct:  '❤ HP%',
  };
  return Object.entries(stats)
    .map(([k, v]) => `${labels[k] || k}: +${v}${k.endsWith('Pct') ? '%' : ''}`)
    .join('  ');
}
