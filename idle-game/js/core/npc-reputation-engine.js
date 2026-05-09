// ============================================================
// core/npc-reputation-engine.js — Hệ thống Thiện Cảm NPC
// L6 — H3 NPC Reputation Foundation
// Không có circular imports: chỉ import bus từ helpers.
// ============================================================
import { bus } from '../utils/helpers.js';

// ============================================================
// DATA — NPC_LIST & TIERS
// ============================================================

/**
 * Danh sách NPC có hệ thống reputation (5 NPC LK starter).
 * villageId: id của thôn trong STARTER_VILLAGES
 * zoneId:    nearZone của thôn (dùng để detect visit khi leftStarter=true)
 */
export const NPC_LIST = [
  {
    id: 'lao_duoc_su',
    name: 'Lão Dược Sư',
    emoji: '👴',
    villageId: 'thanh_phong_thon',
    zoneId: 'thanh_van_son',
  },
  {
    id: 'lao_ngu_ong',
    name: 'Lão Ngư Ông',
    emoji: '🎣',
    villageId: 'lam_hai_thon',
    zoneId: 'linh_duoc_coc',
  },
  {
    id: 'dao_khach_gia',
    name: 'Đao Khách Già',
    emoji: '⚔',
    villageId: 'hoa_diem_thon',
    zoneId: 'thien_kiep_dia',
  },
  {
    id: 'an_tu_bang',
    name: 'Ẩn Tu Băng',
    emoji: '🧘',
    villageId: 'han_bang_thon',
    zoneId: 'hac_phong_lam',
  },
];

/**
 * Ngưỡng và tên các tier:
 * | Tier | Tên       | Range  | Mô tả                              |
 * |------|-----------|--------|------------------------------------|
 * |  0   | Lạ Mặt   |  0-24  | Mới gặp                            |
 * |  1   | Quen Mặt | 25-49  | Đã làm vài việc cho NPC            |
 * |  2   | Tin Cậy  | 50-79  | NPC chia sẻ thông tin riêng        |
 * |  3   | Tâm Giao | 80-99  | NPC sẵn sàng tặng vật phẩm hiếm   |
 * |  4   | Khẩu Khẩu| 100    | NPC nhận làm "đệ tử khẩu khẩu"    |
 */
export const NPC_REPUTATION_TIERS = [
  { tier: 0, name: 'Lạ Mặt',    min: 0,   next: 25  },
  { tier: 1, name: 'Quen Mặt',  min: 25,  next: 50  },
  { tier: 2, name: 'Tin Cậy',   min: 50,  next: 80  },
  { tier: 3, name: 'Tâm Giao',  min: 80,  next: 100 },
  { tier: 4, name: 'Khẩu Khẩu', min: 100, next: null },
];

// ============================================================
// CONSTANTS
// ============================================================
const MAX_REP    = 100;
const YEARLY_CAP = 20;  // tổng rep tăng tối đa +20/năm game cho 1 NPC
const VISIT_INTERVAL_YEARS = 5; // cách 5 năm game mới cho +1 visit

// ============================================================
// CORE QUERIES
// ============================================================

/** Lấy rep hiện tại của NPC (0–100). */
export function getNpcRep(G, npcId) {
  return Math.min(MAX_REP, Math.max(0, G.npcReputation?.[npcId] ?? 0));
}

/** Lấy tier (0–4) dựa trên rep hiện tại. */
export function getNpcRepTier(G, npcId) {
  const rep = getNpcRep(G, npcId);
  if (rep >= 100) return 4;
  if (rep >= 80)  return 3;
  if (rep >= 50)  return 2;
  if (rep >= 25)  return 1;
  return 0;
}

/** Lấy tên tier từ index tier (0–4). */
export function getRepTierName(tier) {
  return NPC_REPUTATION_TIERS[tier]?.name ?? 'Lạ Mặt';
}

/**
 * Lấy thông tin tier đầy đủ để hiển thị UI:
 * { tierIdx, tierName, rep, nextThreshold }
 */
export function getNpcRepInfo(G, npcId) {
  const rep  = getNpcRep(G, npcId);
  const tier = getNpcRepTier(G, npcId);
  const td   = NPC_REPUTATION_TIERS[tier];
  return {
    rep,
    tierIdx:       tier,
    tierName:      td.name,
    nextThreshold: td.next,  // null nếu đã max
    tierMin:       td.min,
  };
}

// ============================================================
// GAIN — CÓ RATE-LIMIT
// ============================================================

/**
 * Tăng rep của NPC, áp dụng:
 *  - Cap tuyệt đối: 100
 *  - Rate-limit: tối đa +20/năm game cho 1 NPC
 * Emit bus events 'npc:rep_gained' và 'npc:rep_tier_up'.
 * Trả về số điểm thực tế đã được cộng.
 */
export function gainNpcRep(G, npcId, amount) {
  if (!npcId || amount <= 0) return 0;

  // Khởi tạo lazy
  if (!G.npcReputation)     G.npcReputation     = {};
  if (!G._npcRepYearlyGain) G._npcRepYearlyGain = {};

  const currentYear = Math.floor(G.gameTime?.currentYear ?? 0);

  // Rate-limit check
  let gainEntry = G._npcRepYearlyGain[npcId];
  if (!gainEntry || gainEntry.year !== currentYear) {
    gainEntry = { year: currentYear, amount: 0 };
  }

  const remaining = YEARLY_CAP - gainEntry.amount;
  if (remaining <= 0) return 0; // đã đạt cap năm này

  const actualAmount = Math.min(amount, remaining);

  const prevRep  = G.npcReputation[npcId] ?? 0;
  const prevTier = getNpcRepTier(G, npcId);

  const newRep   = Math.min(MAX_REP, prevRep + actualAmount);
  const gained   = newRep - prevRep;

  if (gained <= 0) return 0;

  G.npcReputation[npcId] = newRep;
  gainEntry.amount       += gained;
  G._npcRepYearlyGain[npcId] = gainEntry;

  bus.emit('npc:rep_gained', { npcId, amount: gained, total: newRep });

  const newTier = getNpcRepTier(G, npcId);
  if (newTier > prevTier) {
    bus.emit('npc:rep_tier_up', {
      npcId,
      tier:     newTier,
      tierName: getRepTierName(newTier),
    });
  }

  return gained;
}

// ============================================================
// TICK — GỌI TỪ gameTick MỖI TICK
// ============================================================

/**
 * Mỗi 5 năm game, nếu player đang ở zone của NPC → +1 rep.
 * Track qua G._npcRepLastVisit[npcId] = năm game lần cuối tặng.
 * Gọi cuối mỗi gameTick (chi phí rất thấp — chỉ loop 4 NPC).
 */
export function tickNpcRepVisit(G) {
  if (!G.npcReputation)     G.npcReputation     = {};
  if (!G._npcRepLastVisit)  G._npcRepLastVisit  = {};

  const currentYear    = G.gameTime?.currentYear ?? 0;
  const currentNode    = G.worldMap?.currentNodeId;
  const starterVillage = G.worldMap?.starterVillageId;
  const leftStarter    = G.worldMap?.leftStarter ?? true;

  for (const npc of NPC_LIST) {
    // Player ở trong zone của NPC khi:
    // 1. leftStarter + currentNode === npc.zoneId (đã ra ngoài, đang ở gần zone đó)
    // 2. !leftStarter + starterVillageId === npc.villageId (còn trong thôn khởi đầu)
    const inZone =
      (currentNode === npc.zoneId) ||
      (!leftStarter && starterVillage === npc.villageId);

    if (!inZone) continue;

    const lastVisit = G._npcRepLastVisit[npc.id] ?? 0;
    if (currentYear - lastVisit >= VISIT_INTERVAL_YEARS) {
      const gained = gainNpcRep(G, npc.id, 1);
      if (gained > 0) {
        G._npcRepLastVisit[npc.id] = currentYear;
      }
    }
  }
}
