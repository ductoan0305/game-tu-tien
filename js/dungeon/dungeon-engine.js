// ============================================================
// dungeon/dungeon-engine.js — Địa Hạ Mê Cung logic
// Tái sử dụng combat-engine.js cho chiến đấu
// ============================================================
import { DUNGEON_FLOORS, DUNGEON_ENEMIES, DUNGEON_ENEMY_SKILLS, DUNGEON_ITEMS, DUNGEON_ROOM_EVENTS } from './dungeon-data.js';
import { bus } from '../utils/helpers.js';

// ---- Helpers ----

function getDungeonFloor(floor) {
  return DUNGEON_FLOORS.find(f => f.floor === floor) || null;
}

function getDungeonEnemy(id) {
  return DUNGEON_ENEMIES.find(e => e.id === id) || null;
}

// Chọn ngẫu nhiên 1 trong các enemy của tầng
function pickFloorEnemy(floorData) {
  const enemies = floorData.enemies || [];
  if (!enemies.length) return null;
  return enemies[Math.floor(Math.random() * enemies.length)];
}

// Roll xem có room event không (30% sau combat)
function rollRoomEvent(floorData) {
  if (Math.random() > 0.30) return null;
  const eventIds = floorData.roomEvents || [];
  if (!eventIds.length) return null;
  const id = eventIds[Math.floor(Math.random() * eventIds.length)];
  return DUNGEON_ROOM_EVENTS[id] || null;
}

/**
 * Áp dụng effect của room event lên G
 * @returns {{ msg, type, rewards }}
 */
export function applyRoomEvent(G, event, choiceIdx = 0) {
  if (!event) return { ok: false };

  // Lấy effect — nếu là choice event thì dùng choices[choiceIdx].effect
  let effect = event.effect;
  if (event.choices) {
    const choice = event.choices[choiceIdx];
    if (!choice) return { ok: true, msg: 'Bỏ qua.', type: '' };
    effect = choice.effect;
  }
  if (!effect) return { ok: true, msg: 'Bỏ qua.', type: '' };

  return _applyEffect(G, effect);
}

function _applyEffect(G, effect) {
  const maxHp = G.maxHp || 100;
  const maxQi = G.qi !== undefined ? Math.max(G.qi, 100) : 100;

  switch (effect.type) {

    case 'stone': {
      const amt = Math.floor(Math.random() * (effect.max - effect.min + 1)) + effect.min;
      G.stone = (G.stone || 0) + amt;
      return { ok: true, msg: `💎 Nhận ${amt} linh thạch.`, type: 'jade' };
    }

    case 'hp': {
      const heal = Math.floor(maxHp * (effect.pct || 0));
      G.hp = Math.min((G.hp || 0) + heal, maxHp);
      return { ok: true, msg: `❤ Hồi phục ${heal} HP.`, type: 'jade' };
    }

    case 'qi': {
      const qi = Math.floor(maxQi * (effect.pct || 0));
      G.qi = (G.qi || 0) + qi;
      return { ok: true, msg: `🌀 Nhận ${qi} linh lực.`, type: 'jade' };
    }

    case 'qi_hp': {
      const qi = Math.floor(maxQi * (effect.qiPct || 0));
      const hp = Math.floor(maxHp * (effect.hpPct || 0));
      G.qi  = (G.qi || 0) + qi;
      G.hp  = Math.min((G.hp || 0) + hp, maxHp);
      return { ok: true, msg: `🌀 +${qi} linh lực, ❤ +${hp} HP.`, type: 'jade' };
    }

    case 'hp_stamina': {
      const hp = Math.floor(maxHp * (effect.hpPct || 0));
      const stamina = effect.staminaFlat || 0;
      G.hp      = Math.min((G.hp || 0) + hp, maxHp);
      G.stamina = Math.min((G.stamina || 0) + stamina, G.maxStamina || 100);
      return { ok: true, msg: `❤ +${hp} HP, ⚡ +${stamina} thể năng.`, type: 'jade' };
    }

    case 'damage': {
      const dmg = Math.floor(maxHp * Math.abs(effect.hpPct || 0));
      G.hp = Math.max(1, (G.hp || maxHp) - dmg);
      return { ok: true, msg: `💥 Mất ${dmg} HP.`, type: 'danger' };
    }

    case 'qi_damage': {
      const qi = Math.floor(maxQi * Math.abs(effect.qiPct || 0));
      G.qi = Math.max(0, (G.qi || 0) - qi);
      return { ok: true, msg: `🌀 Mất ${qi} linh lực.`, type: 'danger' };
    }

    case 'stamina': {
      const st = effect.flat || 0;
      G.stamina = Math.max(0, Math.min((G.stamina || 0) + st, G.maxStamina || 100));
      const msg = st < 0 ? `⚡ Mất ${Math.abs(st)} thể năng.` : `⚡ +${st} thể năng.`;
      return { ok: true, msg, type: st < 0 ? 'danger' : 'jade' };
    }

    case 'ingredient':
    case 'item': {
      const r = _addDungeonItemToInventory(G, effect.itemId, effect.qty || 1);
      if (r) return { ok: true, msg: `${r.emoji} Nhận ${r.name} ×${r.qty}.`, type: 'jade' };
      return { ok: true, msg: '⚠ Túi đồ đầy, vật phẩm bị rơi.', type: 'danger' };
    }

    case 'exp_burst': {
      const exp = effect.amount || 0;
      G.exp = (G.exp || 0) + exp;
      while (G.exp >= G.maxExp) { G.exp -= G.maxExp; G.maxExp = Math.floor(G.maxExp * 1.4); }
      return { ok: true, msg: `✨ +${exp} EXP.`, type: 'jade' };
    }

    case 'stat': {
      const stat = effect.stat;
      const val  = effect.value || 0;
      if (stat && val) G[stat] = (G[stat] || 0) + val;
      return { ok: true, msg: `✦ +${val}% ${stat} vĩnh viễn.`, type: 'jade' };
    }

    case 'pact': {
      // Thọ đổi ATK
      const yearsLost = effect.lifespanCost || 0;
      const atkGain   = effect.atkPctGain || 0;
      if (G.gameTime) G.gameTime.lifespanMax = Math.max(1, (G.gameTime.lifespanMax || 120) - yearsLost);
      G.atkPct = (G.atkPct || 0) + atkGain;
      bus.emit('chronicle:add', { event: `Ký khế ước thiên ma — đổi ${yearsLost} năm thọ lấy +${atkGain}% tấn công.` });
      return { ok: true, msg: `📜 Khế ước ký! -${yearsLost} năm thọ, +${atkGain}% ATK.`, type: 'jade' };
    }

    case 'sacrifice_stone': {
      const cost = effect.cost || 0;
      if ((G.stone || 0) < cost) return { ok: false, msg: `⚠ Không đủ ${cost} linh thạch.`, type: 'danger' };
      G.stone -= cost;
      if (effect.reward) return _applyEffect(G, effect.reward);
      return { ok: true, msg: `💎 Dâng ${cost} linh thạch.`, type: '' };
    }

    case 'fire_chest': {
      const hpCost = Math.floor(maxHp * (effect.hpCost || 0));
      G.hp = Math.max(1, (G.hp || maxHp) - hpCost);
      const reward = effect.reward ? _applyEffect(G, effect.reward) : { msg: '' };
      return { ok: true, msg: `🔥 Mất ${hpCost} HP — ${reward.msg}`, type: 'jade' };
    }

    case 'destroy_altar': {
      if (effect.reward) return _applyEffect(G, effect.reward);
      return { ok: true, msg: '🕯 Phá hủy tế đàn.', type: '' };
    }

    case 'random': {
      const win = Math.random() < (effect.rewardChance || 0.5);
      return _applyEffect(G, win ? effect.reward : effect.penalty);
    }

    case 'self_heal': {
      const heal = Math.floor(maxHp * (effect.pct || 0.3));
      G.hp = Math.min((G.hp || 0) + heal, maxHp);
      return { ok: true, msg: `❤ Tự hồi phục ${heal} HP.`, type: 'jade' };
    }

    default:
      return { ok: true, msg: `Sự kiện: ${effect.type}.`, type: '' };
  }
}

// ---- Public API ----

/**
 * Vào dungeon — bắt đầu từ tầng hiện tại
 * @returns {{ ok, msg, floor? }}
 */
export function enterDungeon(G) {
  if (G.combat.active) return { ok: false, msg: 'Đang trong chiến đấu!', type: 'danger' };
  if (G.dungeon.active) return { ok: false, msg: 'Đã đang trong mê cung!', type: 'danger' };

  // Daily attempt limit — reset theo ngày game (currentYear đổi ngày)
  const today = Math.floor((G.gameTime?.currentYear ?? 0) * 365);
  if (!G.dungeon.lastAttemptDay || G.dungeon.lastAttemptDay < today) {
    G.dungeon.attemptsToday  = 0;
    G.dungeon.lastAttemptDay = today;
  }
  // Danh Vọng mở thêm lượt: Vô Danh=3, Tân Tiến=4, Có Tiếng=5, Nổi Danh=6, Lừng Lẫy=8
  const dv = G.danhVong ?? 0;
  const maxAttempts = dv >= 500 ? 8 : dv >= 300 ? 6 : dv >= 150 ? 5 : dv >= 50 ? 4 : 3;
  if ((G.dungeon.attemptsToday ?? 0) >= maxAttempts) {
    return { ok: false, msg: `⏳ Đã hết lượt hôm nay (${maxAttempts} lượt)! Danh Vọng cao hơn sẽ mở thêm lượt.`, type: 'danger' };
  }

  const floor = Math.max(1, G.dungeon.currentFloor + 1);
  const floorData = getDungeonFloor(floor);
  if (!floorData) return { ok: false, msg: 'Đã chinh phục toàn bộ mê cung!', type: 'jade' };

  if (G.realmIdx < floorData.minRealm) {
    const realmNames = ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa'];
    return { ok: false, msg: `Cần đạt ${realmNames[floorData.minRealm]} để vào tầng ${floor}!`, type: 'danger' };
  }

  G.dungeon.active = true;
  G.dungeon.currentFloor = floor;
  G.dungeon.attemptsToday = (G.dungeon.attemptsToday ?? 0) + 1;

  const enemyId = pickFloorEnemy(floorData);
  G.dungeon.activeEnemyId = enemyId;

  return { ok: true, msg: `Bước vào tầng ${floor}: ${floorData.name}`, floor, floorData, enemyId, type: 'jade' };
}

/**
 * Roll xem có room event sau khi thắng combat không (30% chance)
 * Gọi từ combat-engine hoặc dungeon-tab sau khi clear room
 * @returns {object|null} event object hoặc null
 */
export function rollDungeonRoomEvent(G) {
  const floorData = getDungeonFloor(G.dungeon.currentFloor);
  if (!floorData) return null;
  return rollRoomEvent(floorData);
}

/**
 * Xây dựng enemy instance cho dungeon từ DUNGEON_ENEMIES
 */
export function buildDungeonEnemyForCombat(enemyId, realmIdx) {
  const def = getDungeonEnemy(enemyId);
  if (!def) return null;
  // Scale nhẹ theo realm
  const scale = Math.max(0, realmIdx - 2);
  const scaledHp  = Math.floor(def.hpBase  * Math.pow(1.3, scale));
  const scaledAtk = Math.floor(def.atkBase * Math.pow(1.25, scale));
  const scaledDef = Math.floor(def.defBase * Math.pow(1.2, scale));
  return {
    ...def,
    minRealm: 0,
    tier: 5,
    hpScale: 1.3, atkScale: 1.25,
    currentHp: scaledHp,
    maxHp: scaledHp,
    atk: scaledAtk,
    def: scaledDef,
    spd: def.spdBase,
    buffs: [],
    debuffs: [],
    skillCooldowns: {},
    drops: [],
    isDungeonEnemy: true,
  };
}

/**
 * Lấy skills của dungeon enemy
 */
export function getDungeonEnemySkills() {
  return DUNGEON_ENEMY_SKILLS;
}

/**
 * Gọi khi thắng tầng dungeon
 * @returns {{ ok, rewards, nextFloor? }}
 */
export function onDungeonFloorClear(G) {
  const floor = G.dungeon.currentFloor;
  const floorData = getDungeonFloor(floor);
  if (!floorData) return { ok: false, msg: 'Không tìm thấy dữ liệu tầng!', type: 'danger' };

  // Cập nhật progress
  G.dungeon.active = false;
  G.dungeon.activeEnemyId = null;
  if (floor > G.dungeon.maxFloorReached) {
    G.dungeon.maxFloorReached = floor;
  }
  G.dungeon.runsToday = (G.dungeon.runsToday || 0) + 1;
  G.dungeon.lastRunAt = Date.now();

  // Tính rewards
  const r = floorData.rewards;
  G.stone += r.stone || 0;
  G.exp   += r.exp   || 0;
  G.qi    += r.qi    || 0;

  // Thêm item đặc biệt nếu có
  let itemGained = null;
  if (r.itemId) {
    itemGained = _addDungeonItemToInventory(G, r.itemId, r.itemQty || 1);
  }
  if (r.itemId2) {
    _addDungeonItemToInventory(G, r.itemId2, r.itemQty2 || 1);
  }

  // Boss reward thêm: emit event
  if (floorData.isBoss) {
    bus.emit('dungeon:boss_cleared', { floor, floorData });
    // Boss quest update
    bus.emit('quest:update', { type: 'dungeon_boss', floor, qty: 1 });
  }

  bus.emit('quest:update', { type: 'dungeon_floor', floor, qty: 1 });

  const nextFloor = getDungeonFloor(floor + 1);
  const isFinal = !nextFloor;

  return {
    ok: true,
    type: floorData.isBoss ? 'legendary' : 'jade',
    msg: floorData.isBoss
      ? `⚔ Boss tầng ${floor} bị đánh bại! Phần thưởng huyền thoại!`
      : `✅ Vượt qua tầng ${floor}: ${floorData.name}`,
    rewards: r,
    itemGained,
    isFinal,
    nextFloor: nextFloor || null,
  };
}

/**
 * Thoát khỏi dungeon — reset về floor trước
 */
export function exitDungeon(G) {
  const wasOnFloor = G.dungeon.currentFloor;
  // Không thắng → về lại tầng trước
  G.dungeon.currentFloor = Math.max(0, wasOnFloor - 1);
  G.dungeon.active = false;
  G.dungeon.activeEnemyId = null;
  return { ok: true, msg: `Rút lui khỏi tầng ${wasOnFloor}. Tiến độ về tầng ${G.dungeon.currentFloor}.`, type: 'info' };
}

/**
 * Reset dungeon (cho phép thử lại từ đầu)
 */
export function resetDungeon(G) {
  G.dungeon.currentFloor = 0;
  G.dungeon.active = false;
  G.dungeon.activeEnemyId = null;
  return { ok: true, msg: 'Đặt lại mê cung — bắt đầu từ tầng 1.', type: 'info' };
}

/**
 * Lấy info tầng hiện tại
 */
export function getDungeonStatus(G) {
  const nextFloor = G.dungeon.currentFloor + 1;
  const floorData = getDungeonFloor(nextFloor);
  return {
    currentFloor: G.dungeon.currentFloor,
    maxFloorReached: G.dungeon.maxFloorReached,
    nextFloor: nextFloor,
    nextFloorData: floorData,
    active: G.dungeon.active,
    allFloors: DUNGEON_FLOORS,
  };
}

// ---- Private ----

function _addDungeonItemToInventory(G, itemId, qty) {
  // Thêm vào inventory như một special item
  const itemDef = DUNGEON_ITEMS[itemId];
  if (!itemDef) return null;

  // Tìm slot trống hoặc stack
  const existing = G.inventory.find(slot => slot && slot.id === itemId);
  if (existing) {
    existing.qty += qty;
    return { itemId, qty, name: itemDef.name, emoji: itemDef.emoji };
  }
  const emptyIdx = G.inventory.findIndex(slot => slot === null);
  if (emptyIdx !== -1) {
    G.inventory[emptyIdx] = { id: itemId, qty, name: itemDef.name, emoji: itemDef.emoji, type: 'dungeon_item' };
    return { itemId, qty, name: itemDef.name, emoji: itemDef.emoji };
  }
  return null; // Túi đồ đầy
}