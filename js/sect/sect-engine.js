// ============================================================
// sect/sect-engine.js — Hoạt động tông môn logic
// ============================================================
import { SECT_CONTRIBUTIONS, SECT_RANKS, SECT_MISSIONS } from './sect-data.js';
import { SECTS } from '../core/data.js';
import { bus } from '../utils/helpers.js';

function getSectRank(exp) {
  let rank = SECT_RANKS[0];
  for (const r of SECT_RANKS) {
    if (exp >= r.expRequired) rank = r;
  }
  return rank;
}

function getNextSectRank(exp) {
  for (const r of SECT_RANKS) {
    if (exp < r.expRequired) return r;
  }
  return null; // Max rank
}

/**
 * Lấy thông tin tông môn hiện tại của nhân vật
 */
export function getSectInfo(G) {
  const sectDef = SECTS.find(s => s.id === G.sectId) || SECTS[0];
  const exp = G.sect?.exp || 0;
  const rankData = getSectRank(exp);
  const nextRank = getNextSectRank(exp);
  const contributions = G.sect?.contributions || {};
  return {
    sectDef,
    exp,
    rankData,
    nextRank,
    contributions,
    totalContributions: G.sect?.totalContributions || 0,
  };
}

/**
 * Thực hiện đóng góp cho tông môn
 */
export function doSectContribution(G, contribId) {
  const contrib = SECT_CONTRIBUTIONS.find(c => c.id === contribId);
  if (!contrib) return { ok: false, msg: 'Hoạt động không tồn tại', type: 'danger' };

  if (G.realmIdx < contrib.minRealm) {
    const realmNames = ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa'];
    return { ok: false, msg: `Cần ${realmNames[contrib.minRealm]}!`, type: 'danger' };
  }

  // Kiểm tra cooldown
  const now = Date.now();
  const lastUsed = G.sect?.cooldowns?.[contribId] || 0;
  const elapsed = (now - lastUsed) / 1000;
  if (contrib.cooldown > 0 && elapsed < contrib.cooldown) {
    const remaining = Math.ceil(contrib.cooldown - elapsed);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return { ok: false, msg: `Hồi chiêu: ${mins > 0 ? mins + 'p ' : ''}${secs}s`, type: 'danger' };
  }

  // Kiểm tra chi phí
  if (contrib.cost.stone && G.stone < contrib.cost.stone) {
    return { ok: false, msg: `Cần ${contrib.cost.stone} linh thạch!`, type: 'danger' };
  }
  if (contrib.cost.qi && G.qi < contrib.cost.qi) {
    return { ok: false, msg: `Cần ${contrib.cost.qi} linh lực!`, type: 'danger' };
  }
  if (contrib.cost.stamina && G.stamina < contrib.cost.stamina) {
    return { ok: false, msg: `Cần ${contrib.cost.stamina} thể lực!`, type: 'danger' };
  }

  // Trừ chi phí
  if (contrib.cost.stone)   G.stone   -= contrib.cost.stone;
  if (contrib.cost.qi)      G.qi      -= contrib.cost.qi;
  if (contrib.cost.stamina) G.stamina -= contrib.cost.stamina;

  // Đảm bảo G.sect tồn tại
  if (!G.sect) G.sect = { exp: 0, cooldowns: {}, totalContributions: 0 };
  if (!G.sect.cooldowns) G.sect.cooldowns = {};

  // Apply rewards
  const r = contrib.reward;
  if (r.sectExp) {
    // Danh Vọng bonus: Có Tiếng+6%, Nổi Danh+12%, Lừng Lẫy+20%
    const dv = G.danhVong ?? 0;
    const dvBonus = dv >= 500 ? 0.20 : dv >= 300 ? 0.12 : dv >= 150 ? 0.06 : 0;
    const sectExpGain = Math.floor(r.sectExp * (1 + dvBonus));
    G.sect.exp = (G.sect.exp || 0) + sectExpGain;
    if (dvBonus > 0) {
      bus.emit('sect:dv_bonus', { bonus: Math.floor(dvBonus * 100), extra: sectExpGain - r.sectExp });
    }
  }
  if (r.stone)        G.stone                 += r.stone;
  if (r.qi)           G.qi                    += r.qi;
  if (r.stoneBonus)   G.stoneBonus            = (G.stoneBonus || 0) + r.stoneBonus;
  if (r.expBonus)     { G.eventExpBonus = (G.eventExpBonus || 0) + r.expBonus; G.eventExpTimer = 1800; }

  // Cooldown
  if (contrib.cooldown > 0) {
    G.sect.cooldowns[contribId] = now;
  }

  // Track contributions
  G.sect.totalContributions = (G.sect.totalContributions || 0) + 1;

  // Check rank up
  const oldRank = getSectRank((G.sect.exp || 0) - r.sectExp);
  const newRank = getSectRank(G.sect.exp || 0);
  let rankUpMsg = '';
  if (newRank.rank > oldRank.rank) {
    _applyRankBonus(G, newRank);
    rankUpMsg = ` 🎉 Thăng cấp: ${newRank.name}!`;
    bus.emit('quest:update', { type: 'sect_rank', qty: 1 });
  }

  bus.emit('quest:update', { type: 'sect_contribution', qty: 1 });
  if (contribId === 'defend_sect') bus.emit('quest:update', { type: 'sect_defend', qty: 1 });

  return {
    ok: true,
    type: 'jade',
    msg: `${contrib.emoji} ${contrib.name}: ${r.desc}${rankUpMsg}`,
    rankUp: newRank.rank > oldRank.rank ? newRank : null,
  };
}

function _applyRankBonus(G, rankData) {
  if (!rankData.bonus) return;
  const b = rankData.bonus;
  if (b.stoneBonus) G.stoneBonus = (G.stoneBonus || 0) + b.stoneBonus;
  if (b.ratePct)    G.ratePct    = (G.ratePct    || 0) + b.ratePct;
  if (b.atkPct)     G.atkPct     = (G.atkPct     || 0) + b.atkPct;
  if (b.defPct)     G.defPct     = (G.defPct     || 0) + b.defPct;
  if (b.hpPct)      G.hpPct      = (G.hpPct      || 0) + b.hpPct;
}

export { getSectRank, getNextSectRank, SECT_CONTRIBUTIONS, SECT_RANKS };