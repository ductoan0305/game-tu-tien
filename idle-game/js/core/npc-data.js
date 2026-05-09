// ============================================================
// core/npc-data.js — NPC Rewards per Reputation Tier
// L7 — H3 NPC Reputation Rewards
// ============================================================

/**
 * Rewards mỗi NPC có reputation system.
 * Ba NPC starter village có rewards đầy đủ:
 *   lao_duoc_su, lao_ngu_ong, dao_khach_gia
 *
 * tier2_secret (rep ≥ 50, Tin Cậy):
 *   Mở khóa secret gather zone trên world map — có cooldown 30 ngày thực.
 *
 * tier3_gift (rep ≥ 80, Tâm Giao):
 *   Trao vật phẩm hiếm — chỉ 1 lần / run (track qua G._npcGiftClaimed[npcId]).
 *
 * tier4_buff (rep = 100, Khẩu Khẩu):
 *   Buff vĩnh viễn — chỉ 1 NPC / run, không đổi được.
 *   Track qua G._npcKhauKhau = { [npcId]: true }.
 *
 * Manifesto §7: PASS — xem HANDOFF.md §L7.
 */
export const NPC_REWARDS = {

  // ── Lão Dược Sư — Thanh Phong Thôn / Thanh Vân Sơn ──────────────────────
  lao_duoc_su: {
    tier2_secret: {
      zoneId:    'duoc_thao_bi_canh_thanh_phong',
      label:     'Dược Thảo Bí Cảnh Thanh Phong',
      hint:      'Vùng dược thảo hiếm ẩn sau Thanh Vân Sơn — Lão Dược Sư mới biết đường vào.',
    },
    tier3_gift: {
      type:      'inventory',   // addToInventory(G, ITEMS.find...)
      itemId:    'peilingdan',  // Bồi Linh Đan — Realm 1, hiếm
      qty:       1,
      label:     'Bồi Linh Đan',
      emoji:     '💊',
      once:      true,
    },
    tier4_buff: {
      statKey:   'danBonus',    // pipeline: calcKhauKhauBonus → alchemy-engine
      value:     5,
      label:     'Đệ tử khẩu khẩu Lão Dược Sư',
      desc:      '+5 kỹ thuật luyện đan vĩnh viễn',
    },
  },

  // ── Lão Ngư Ông — Lâm Hải Thôn / Linh Dược Cốc ──────────────────────────
  lao_ngu_ong: {
    tier2_secret: {
      zoneId:    'linh_ngu_dam_lam_hai',
      label:     'Linh Ngư Đầm Lâm Hải',
      hint:      'Đầm linh ngư ẩn sâu gần Linh Dược Cốc — chỉ ngư ông mới biết đường vào.',
    },
    tier3_gift: {
      type:      'special',     // addToInventory với item custom
      itemId:    'linh_mach_do',
      qty:       1,
      label:     'Linh Mạch Đồ',
      emoji:     '🗺',
      once:      true,
    },
    tier4_buff: {
      statKey:   'eventRatePct', // pipeline: calcKhauKhauBonus → calcQiRate
      value:     3,
      label:     'Đệ tử khẩu khẩu Lão Ngư Ông',
      desc:      '+3% tốc độ tu luyện luôn (duyên khởi bờ sông)',
    },
  },

  // ── Đao Khách Già — Hỏa Diệm Thôn / Thiên Kiếp Địa ──────────────────────
  dao_khach_gia: {
    tier2_secret: {
      zoneId:    'co_lo_phe_tich_hoa_diem',
      label:     'Cổ Lò Phế Tích Hỏa Diệm',
      hint:      'Phế tích lò rèn cổ đại gần Thiên Kiếp Địa — Đao Khách Già giấu ở đó.',
    },
    tier3_gift: {
      type:      'ingredient',  // G.alchemy.ingredients[ingredientId] += qty
      itemId:    'tran_nhan',
      qty:       1,
      label:     'Trận Nhãn',
      emoji:     '🔵',
      once:      true,
    },
    tier4_buff: {
      statKey:   'atkPct',      // pipeline: calcKhauKhauBonus → calcAtk
      value:     5,
      label:     'Đệ tử khẩu khẩu Đao Khách Già',
      desc:      '+5% công kích vĩnh viễn (tinh thần chiến binh khẩu truyền)',
    },
  },
};

// ── Secret Zone Cooldown ──────────────────────────────────────────────────────
// Mỗi 30 ngày thực (ms) mới refresh stock secret zone.
// Track qua G._secretZoneCooldown[zoneId] = { lastRefresh: timestamp_ms }
export const SECRET_ZONE_REFRESH_MS = 30 * 24 * 60 * 60 * 1000; // 30 ngày thực

/**
 * Kiểm tra secret zone có thể gather không (cooldown chưa hết → false).
 * @param {object} G
 * @param {string} zoneId
 * @returns {{ canGather: boolean, msLeft: number, nextRefresh: string }}
 */
export function checkSecretZoneCooldown(G, zoneId) {
  if (!G._secretZoneCooldown) G._secretZoneCooldown = {};
  const entry = G._secretZoneCooldown[zoneId];
  if (!entry) return { canGather: true, msLeft: 0, nextRefresh: null };

  const now    = Date.now();
  const elapsed = now - (entry.lastRefresh || 0);
  const msLeft  = Math.max(0, SECRET_ZONE_REFRESH_MS - elapsed);
  if (msLeft === 0) return { canGather: true, msLeft: 0, nextRefresh: null };

  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
  return { canGather: false, msLeft, nextRefresh: `~${daysLeft} ngày nữa` };
}

/**
 * Ghi nhận lần gather secret zone — reset cooldown timer.
 * @param {object} G
 * @param {string} zoneId
 */
export function markSecretZoneGathered(G, zoneId) {
  if (!G._secretZoneCooldown) G._secretZoneCooldown = {};
  G._secretZoneCooldown[zoneId] = { lastRefresh: Date.now() };
}

/**
 * Gate khẩu khẩu — player chỉ được bái sư 1 NPC / run.
 * Trả về { ok: true } nếu được phép, { ok: false, msg } nếu bị chặn.
 * @param {object} G
 * @param {string} npcId
 */
export function checkKhauKhauGate(G, npcId) {
  if (!G._npcKhauKhau) return { ok: true };
  const existing = Object.keys(G._npcKhauKhau).filter(k => G._npcKhauKhau[k]);
  if (existing.length === 0) return { ok: true };
  if (existing.includes(npcId)) return { ok: true }; // đã bái rồi, không hiện nút nữa
  return {
    ok:   false,
    msg:  'Đã bái sư khẩu khẩu với NPC khác — không thể đổi.',
    type: 'danger',
  };
}

/**
 * Áp dụng buff khẩu khẩu lên G. Ghi nhận cả flag.
 * Buff được tính qua pipeline (calcKhauKhauBonus) — không mutate stat trực tiếp.
 * @param {object} G
 * @param {string} npcId
 */
export function applyKhauKhauBuff(G, npcId) {
  if (!G._npcKhauKhau) G._npcKhauKhau = {};
  G._npcKhauKhau[npcId] = true;
}
