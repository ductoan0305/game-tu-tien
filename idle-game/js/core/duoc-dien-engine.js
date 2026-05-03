// ============================================================
// js/core/duoc-dien-engine.js
// Hệ thống Dược Điền, Linh Mễ, Đói Khát, Ám Thương
// Session 6 — v12
//
// Lore:
//   - LK tu sĩ vẫn cần ăn — linh khí chưa đủ nuôi thân
//   - Linh Mễ (gạo linh khí) là lương thực cơ bản
//   - TC trở lên: linh lực tự nuôi thân, không cần ăn
//   - Chiến đấu bị thương nặng → Ám Thương → Căn Cốt giảm
// ============================================================

import { bus } from '../utils/helpers.js';
import { addChronicle } from './time-engine.js';

// ============================================================
// CONSTANTS
// ============================================================

// Dược Điền — giá mở rộng (Linh Thạch)
export const DUOC_DIEN_EXPAND_COST = {
  1:  200,    // ô đầu tiên
  2:  400,    // ô thứ 2
  3:  800,    // ô thứ 3
  4:  1500,   // ô thứ 4
  5:  2800,   // ô thứ 5
  6:  5000,   // ô thứ 6 — cần TC để có đủ LT
  7:  8000,
  8:  12000,
  9:  18000,
  10: 25000,
};

// Cây trồng trong Dược Điền
export const DUOC_DIEN_CROPS = {
  linh_me: {
    id:          'linh_me',
    name:        'Linh Mễ',
    emoji:       '🌾',
    desc:        'Gạo chứa linh khí, lương thực cơ bản của tu sĩ LK.',
    growDays:    5,          // số ngày game để trưởng thành
    seedCost:    1,          // hạt giống cần để gieo (từ kho)
    seedReturn:  2,          // hạt giống trả lại khi thu hoạch
    yieldMin:    8,          // phần Linh Mễ tối thiểu khi thu hoạch
    yieldMax:    12,         // phần Linh Mễ tối đa
    seedItemId:  'linh_me_seed', // id item hạt giống trong shop
    requireRealm: 0,         // chỉ cần LK
  },
  // Có thể mở rộng thêm cây trồng khác sau (linh thảo, linh căn...)
};

// Hunger constants
export const HUNGER = {
  EAT_INTERVAL_DAYS:  2,      // cần ăn mỗi 2 ngày game
  HP_LOSS_MILD_PCT:   0.01,   // mất 1% HP/ngày khi đói 1-4 ngày
  HP_LOSS_SEVERE_PCT: 0.03,   // mất 3% HP/ngày khi đói 5+ ngày
  SEVERE_THRESHOLD:   5,      // ngày đói → severe
  LINH_ME_BUFF_DAYS:  2,      // buff qi rate kéo dài 2 ngày game
  LINH_ME_BUFF_PCT:   8,      // +8% qi rate khi no bằng Linh Mễ
  ICH_COC_DAN_DAYS:   30,     // Ích Cốc Đan no 30 ngày game
};

// Ám Thương thresholds
export const AM_THUONG = {
  // Tích lũy khi chiến đấu
  DAMAGE_MILD_THRESHOLD:   0.30,  // HP mất 30-60% → +1 điểm
  DAMAGE_HEAVY_THRESHOLD:  0.60,  // HP mất >60% → +3 điểm
  DAMAGE_KNOCKOUT:         5,     // HP về 0 → +5 điểm

  // Ngưỡng ảnh hưởng Căn Cốt
  THRESHOLDS: [
    { points: 10,  canCotLoss: 1, hpPenalty: 0  },
    { points: 25,  canCotLoss: 2, hpPenalty: 5  },
    { points: 50,  canCotLoss: 3, hpPenalty: 10 },
    { points: 100, canCotLoss: 5, hpPenalty: 20 },
  ],

  // Tự hồi phục tự nhiên — cực chậm, không chiến đấu
  NATURAL_HEAL_PER_DAY: 0.33,   // ~1 điểm / 3 ngày game không đánh
  TAI_SINH_DAN_HEAL:    15,     // Tái Sinh Đan -15 điểm
};

// ============================================================
// DƯỢC ĐIỀN — Mua ô & Trồng cây
// ============================================================

/**
 * Mua thêm 1 ô Dược Điền bằng Linh Thạch.
 */
export function expandDuocDien(G) {
  const dd = G.duocDien;
  const nextSlot = dd.maxSlots + 1;
  const cost = DUOC_DIEN_EXPAND_COST[nextSlot];

  if (!cost) {
    return { ok: false, msg: 'Đã đạt số ô tối đa.', type: 'warning' };
  }
  if ((G.stone ?? 0) < cost) {
    return { ok: false, msg: `Cần ${cost} 💎 Linh Thạch để mở thêm ô.`, type: 'danger' };
  }

  G.stone -= cost;
  dd.maxSlots = nextSlot;
  dd.slots.push({ id: nextSlot, cropId: null, plantedAt: null, harvestAt: null, state: 'empty' });

  bus.emit('duoc_dien:expanded', { maxSlots: dd.maxSlots });
  return {
    ok: true,
    msg: `Mở ô Dược Điền thứ ${nextSlot}. Còn ${dd.maxSlots < 10 ? DUOC_DIEN_EXPAND_COST[nextSlot+1] + ' 💎 cho ô tiếp' : 'đã tối đa'}.`,
    type: 'jade',
  };
}

/**
 * Gieo hạt vào ô trống.
 * @param {number} slotIdx — chỉ số ô (0-based)
 * @param {string} cropId — id cây trồng trong DUOC_DIEN_CROPS
 */
export function plantCrop(G, slotIdx, cropId) {
  const dd = G.duocDien;
  const slot = dd.slots[slotIdx];
  if (!slot) return { ok: false, msg: 'Ô không tồn tại.', type: 'danger' };
  if (slot.state !== 'empty') return { ok: false, msg: 'Ô đang có cây rồi.', type: 'warning' };

  const crop = DUOC_DIEN_CROPS[cropId];
  if (!crop) return { ok: false, msg: 'Loại cây không hợp lệ.', type: 'danger' };
  if (G.realmIdx < crop.requireRealm) {
    return { ok: false, msg: 'Cảnh giới chưa đủ để trồng loại này.', type: 'warning' };
  }

  // Kiểm tra hạt giống trong inventory
  const seedCount = getSeedCount(G, crop.seedItemId);
  if (seedCount < crop.seedCost) {
    return {
      ok: false,
      msg: `Cần ${crop.seedCost} hạt giống ${crop.name}. Mua tại Cửa Hàng.`,
      type: 'danger',
    };
  }

  // Trừ hạt giống
  removeSeed(G, crop.seedItemId, crop.seedCost);

  const now = G.gameTime?.currentYear ?? 0;
  slot.cropId    = cropId;
  slot.plantedAt = now;
  slot.harvestAt = now + crop.growDays / 365; // growDays là ngày game, now là năm game
  slot.state     = 'growing';

  return {
    ok: true,
    msg: `Đã gieo ${crop.name}. Thu hoạch sau ${crop.growDays} ngày.`,
    type: 'jade',
  };
}

/**
 * Thu hoạch ô đã trưởng thành.
 */
export function harvestCrop(G, slotIdx) {
  const dd = G.duocDien;
  const slot = dd.slots[slotIdx];
  if (!slot) return { ok: false, msg: 'Ô không tồn tại.', type: 'danger' };
  if (slot.state !== 'ready') {
    return { ok: false, msg: 'Cây chưa trưởng thành.', type: 'warning' };
  }

  const crop = DUOC_DIEN_CROPS[slot.cropId];
  if (!crop) return { ok: false, msg: 'Lỗi dữ liệu cây trồng.', type: 'danger' };

  const yield_ = crop.yieldMin + Math.floor(Math.random() * (crop.yieldMax - crop.yieldMin + 1));

  // Linh Mễ vào hunger.linhMeCount
  if (slot.cropId === 'linh_me') {
    G.hunger.linhMeCount = (G.hunger.linhMeCount ?? 0) + yield_;
  }

  // Trả lại hạt giống vào inventory
  addSeed(G, crop.seedItemId, crop.seedReturn);

  dd.totalHarvests++;

  // Reset ô
  slot.cropId    = null;
  slot.plantedAt = null;
  slot.harvestAt = null;
  slot.state     = 'empty';

  bus.emit('duoc_dien:harvested', { cropId: crop.id, yield: yield_ });
  return {
    ok: true,
    msg: `Thu hoạch ${yield_} ${crop.name}! +${crop.seedReturn} hạt giống.`,
    type: 'jade',
    yield: yield_,
  };
}

/**
 * Tick Dược Điền — kiểm tra cây đến hạn thu hoạch.
 * Gọi từ gameTick.
 */
export function tickDuocDien(G) {
  const dd = G.duocDien;
  if (!dd?.slots?.length) return;

  const now = G.gameTime?.currentYear ?? 0;
  let anyReady = false;

  for (const slot of dd.slots) {
    if (slot.state === 'growing' && now >= slot.harvestAt) {
      slot.state = 'ready';
      anyReady = true;
    }
  }

  if (anyReady) {
    bus.emit('duoc_dien:ready');
  }
}

// ============================================================
// HUNGER — Đói Khát (chỉ ảnh hưởng LK)
// ============================================================

/**
 * Ăn 1 phần Linh Mễ thủ công.
 */
export function eatLinhMe(G) {
  if (G.realmIdx >= 1) {
    return { ok: false, msg: 'Trúc Cơ trở lên không cần ăn — linh lực tự nuôi thân.' };
  }

  const h = G.hunger;
  if ((h.linhMeCount ?? 0) <= 0) {
    return { ok: false, msg: 'Không có Linh Mễ. Trồng tại Dược Điền hoặc mua tại Cửa Hàng.', type: 'danger' };
  }

  h.linhMeCount--;
  h.lastEatYear   = G.gameTime?.currentYear ?? 0;
  h.hungerDays    = 0;
  h.isStarving    = false;
  h.eatingBuff    = HUNGER.LINH_ME_BUFF_DAYS; // ngày game còn buff

  bus.emit('hunger:fed', { source: 'linh_me' });
  return {
    ok: true,
    msg: `Ăn Linh Mễ — no ${HUNGER.EAT_INTERVAL_DAYS} ngày, +${HUNGER.LINH_ME_BUFF_PCT}% tốc tu luyện ${HUNGER.LINH_ME_BUFF_DAYS} ngày.`,
    type: 'jade',
  };
}

/**
 * Dùng Ích Cốc Đan (gọi từ useItem khi dùng đan loại 'ich_coc_dan').
 */
export function useIchCocDan(G) {
  if (G.realmIdx >= 1) {
    return { ok: false, msg: 'Trúc Cơ trở lên không cần dùng Ích Cốc Đan.' };
  }

  const h = G.hunger;
  h.ichCocDanDays = (h.ichCocDanDays ?? 0) + HUNGER.ICH_COC_DAN_DAYS;
  h.hungerDays    = 0;
  h.isStarving    = false;
  h.lastEatYear   = G.gameTime?.currentYear ?? 0;

  bus.emit('hunger:fed', { source: 'ich_coc_dan' });
  return {
    ok: true,
    msg: `Ích Cốc Đan — no ${HUNGER.ICH_COC_DAN_DAYS} ngày game. Không cần lo lương thực.`,
    type: 'jade',
  };
}

/**
 * Tick Hunger — gọi từ gameTick mỗi tick.
 * Xử lý đói, buff Linh Mễ, trừ HP.
 */
export function tickHunger(G, dt) {
  // Hunger system đã bị tắt — không làm gì
  return;
}

/**
 * Hunger modifier — luôn 1.0 (hunger system đã tắt).
 * Linh Mễ vẫn cho buff qi khi ăn qua eatLinhMe().
 */
export function getHungerQiModifier(G) {
  // Hunger system tắt — chỉ còn buff từ Linh Mễ khi vừa ăn
  const h = G.hunger;
  if (h && (h.eatingBuff ?? 0) > 0) {
    return 1 + (HUNGER.LINH_ME_BUFF_PCT ?? 20) / 100;
  }
  return 1.0;
}

// ============================================================
// ÁM THƯƠNG — Tích lũy từ chiến đấu
// ============================================================

/**
 * Tính và cộng Ám Thương sau một trận chiến.
 * @param {number} hpBefore — HP trước trận
 * @param {number} hpAfter  — HP sau trận
 * @param {boolean} wasKnockedOut — HP về 0 trong trận không?
 */
export function accumulateAmThuong(G, hpBefore, hpAfter, wasKnockedOut = false) {
  const at = G.amThuong;
  let gained = 0;

  if (wasKnockedOut) {
    gained = AM_THUONG.DAMAGE_KNOCKOUT;
  } else {
    const hpLostPct = (hpBefore - hpAfter) / (hpBefore || 1);
    if (hpLostPct >= AM_THUONG.DAMAGE_HEAVY_THRESHOLD) {
      gained = 3;
    } else if (hpLostPct >= AM_THUONG.DAMAGE_MILD_THRESHOLD) {
      gained = 1;
    }
  }

  if (gained <= 0) return { gained: 0 };

  const before = at.points;
  at.points += gained;

  // Kiểm tra ngưỡng ảnh hưởng Căn Cốt
  _applyAmThuongPenalties(G);

  if (gained >= 3) {
    addChronicle(G,
      `Tuổi ${Math.floor(G.gameTime?.currentYear ?? 0)}: Bị thương nặng trong chiến đấu. Ám Thương +${gained} (tổng: ${at.points}).`
    );
  }

  bus.emit('am_thuong:gained', { gained, total: at.points });
  return { gained, total: at.points };
}

/**
 * Áp dụng penalty Căn Cốt và HP max theo ngưỡng Ám Thương.
 * Chỉ tăng penalty — không giảm (giảm xử lý qua healAmThuong).
 */
function _applyAmThuongPenalties(G) {
  const at    = G.amThuong;
  const pts   = at.points;

  let newCanCotPenalty = 0;
  let newHpPenalty     = 0;

  for (const tier of AM_THUONG.THRESHOLDS) {
    if (pts >= tier.points) {
      newCanCotPenalty += tier.canCotLoss;
      newHpPenalty      = tier.hpPenalty; // cộng dồn tại ngưỡng cao nhất
    }
  }

  // Chỉ áp dụng nếu penalty tăng (không rollback khi chưa heal)
  if (newCanCotPenalty > at.canCotPenalty) {
    const delta = newCanCotPenalty - at.canCotPenalty;
    at.canCotPenalty = newCanCotPenalty;
    G.canCot = Math.max(0, (G.canCot ?? 50) - delta);
    bus.emit('am_thuong:cancot_lost', { delta, total: at.canCotPenalty });
  }

  at.hpMaxPenalty = newHpPenalty;
}

/**
 * Hồi phục Ám Thương — từ đan dược hoặc nghỉ ngơi.
 * @param {number} healPoints — số điểm Ám Thương hồi
 * @param {string} source     — 'tai_sinh_dan' | 'linh_thuc' | 'rest'
 */
export function healAmThuong(G, healPoints, source = 'rest') {
  const at = G.amThuong;
  if (at.points <= 0) return { ok: false, msg: 'Không có Ám Thương cần hồi.' };

  const before  = at.points;
  at.points     = Math.max(0, at.points - healPoints);
  const healed  = before - at.points;

  // Tính lại penalty SAU khi heal
  const oldCanCotPenalty = at.canCotPenalty;
  const oldHpPenalty     = at.hpMaxPenalty;

  let newCanCotPenalty = 0;
  let newHpPenalty     = 0;
  for (const tier of AM_THUONG.THRESHOLDS) {
    if (at.points >= tier.points) {
      newCanCotPenalty += tier.canCotLoss;
      newHpPenalty      = tier.hpPenalty;
    }
  }

  // Hồi Căn Cốt nếu penalty giảm
  if (newCanCotPenalty < oldCanCotPenalty) {
    const recovered = oldCanCotPenalty - newCanCotPenalty;
    at.canCotPenalty = newCanCotPenalty;
    G.canCot = Math.min(100, (G.canCot ?? 50) + recovered);
  }

  at.hpMaxPenalty = newHpPenalty;

  if (healed > 0) {
    addChronicle(G,
      `Tuổi ${Math.floor(G.gameTime?.currentYear ?? 0)}: Hồi Ám Thương -${healed} (${source}). Còn lại: ${at.points}.`
    );
  }

  return {
    ok: true,
    healed,
    remaining: at.points,
    msg: `Hồi ${healed} điểm Ám Thương. Còn lại ${at.points}.`,
  };
}

/**
 * Tick Ám Thương — tự hồi chậm khi không chiến đấu.
 * Gọi từ gameTick.
 */
export function tickAmThuong(G, dt) {
  const at = G.amThuong;
  if (!at || at.points <= 0) return;

  // Chỉ tự hồi nếu không đang trong combat
  if (G.combat?.active) return;

  const nowYears = G.gameTime?.currentYear ?? 0;
  const lastHealYears = at.lastHealYear ?? 0;
  // Convert sang ngày để so sánh
  const daysSinceLastHeal = (nowYears - lastHealYears) * 365;
  const healThresholdDays = 1 / AM_THUONG.NATURAL_HEAL_PER_DAY; // = 3 ngày

  if (daysSinceLastHeal >= healThresholdDays) {
    at.points = Math.max(0, at.points - 1);
    at.lastHealYear = nowYears;
    _applyAmThuongPenalties(G);
  }
}

/**
 * Lấy trạng thái Ám Thương để hiển thị UI.
 */
export function getAmThuongStatus(G) {
  const at = G.amThuong;
  if (!at) return null;

  const pts = at.points;
  let severity = 'none';
  if (pts >= 100)     severity = 'critical';
  else if (pts >= 50) severity = 'heavy';
  else if (pts >= 25) severity = 'moderate';
  else if (pts >= 10) severity = 'mild';

  return {
    points:        pts,
    canCotPenalty: at.canCotPenalty,
    hpMaxPenalty:  at.hpMaxPenalty,
    severity,
    nextThreshold: AM_THUONG.THRESHOLDS.find(t => t.points > pts)?.points ?? null,
  };
}

// ============================================================
// HELPERS — Inventory hạt giống
// ============================================================

function getSeedCount(G, itemId) {
  if (!Array.isArray(G.inventory)) return 0;
  return G.inventory.filter(s => s?.id === itemId).length;
}

function removeSeed(G, itemId, qty) {
  let removed = 0;
  for (let i = 0; i < G.inventory.length && removed < qty; i++) {
    if (G.inventory[i]?.id === itemId) {
      G.inventory[i] = null;
      removed++;
    }
  }
}

function addSeed(G, itemId, qty) {
  for (let i = 0; i < qty; i++) {
    const emptySlot = G.inventory.indexOf(null);
    if (emptySlot !== -1) {
      G.inventory[emptySlot] = { id: itemId, name: 'Hạt Linh Mễ', qty: 1, type: 'seed' };
    }
    // Nếu túi đầy thì bỏ qua — người chơi tự quản lý
  }
}