// ============================================================
// core/state/computed.js — Pure computed values từ G
// Không có side effects. Không mutate G.
// ============================================================
import { REALMS } from '../data.js';
import { calcCongPhapMasteryBonus, calcCongPhapBaseMult } from '../phap-dia.js';
import { calcSpiritRateMulti } from '../spirit-root.js';
import { getLinhThuBuff } from '../linh-thu-engine.js';
import { getPurityBoostMult } from '../thuong-hoi-engine.js';

export function calcQiRate(G) {
  const r = REALMS[G.realmIdx];
  let base = r.rate + G.qiBonus;
  base *= (1 + G.spdBonus);
  base *= (1 + (G.ratePct || 0) / 100);

  // Linh Căn multiplier
  if (G.spiritData) {
    base *= calcSpiritRateMulti(G.spiritData);
  } else if (G.spiritRoot) {
    const legacy = { jin:1.2, mu:1.1, shui:1.25, huo:1.15, tu:1.0, yin_yang:1.1, hun:1.25 };
    base *= (legacy[G.spiritRoot] || 1.0);
  }

  // Pháp Địa multiplier
  const PHAP_DIA_MULT = { pham_dia:0.8, linh_dia:1.2, phuc_dia:1.8, dong_phu:3.0, bao_dia:5.0 };
  base *= (PHAP_DIA_MULT[G.phapDia?.currentId || 'pham_dia'] || 0.8);

  // Công Pháp — multiplier nền (grade) + bonus thuần thục
  // Base mult: tạp phẩm ×0.7, hạ phẩm+ ×1.0 (giữ đúng thiết kế gốc)
  base *= calcCongPhapBaseMult(G);
  // Bonus thuần thục cộng thêm khi đã tu luyện
  const cpBonus = calcCongPhapMasteryBonus(G);
  if (cpBonus.ratePct > 0) base *= (1 + cpBonus.ratePct / 100);

  // Không bế quan = không tu luyện = qi không tăng
  if (!G.meditating) return 0;

  if (G.eventRateBonus > 0)          base *= (1 + G.eventRateBonus / 100);
  if (G.prestige?.bonuses?.ratePct)  base *= (1 + G.prestige.bonuses.ratePct / 100);

  // Linh Thực buff
  if (Array.isArray(G.linhThuc?.activeBuffs)) {
    const rateBuff = G.linhThuc.activeBuffs
      .filter(b => b.type === 'rate_pct' && b.timer > 0)
      .reduce((s, b) => s + b.value, 0);
    if (rateBuff > 0) base *= (1 + rateBuff / 100);
  }

  // Trận Pháp buff
  if (Array.isArray(G.tranPhap?.activeArrays)) {
    for (const arr of G.tranPhap.activeArrays) {
      for (const ef of (arr.effects || [])) {
        if (ef.type === 'rate_pct') base *= (1 + ef.value / 100);
      }
    }
  }

  // Phù Chú buff
  if (Array.isArray(G.phuChu?.activeBuffs)) {
    const talRate = G.phuChu.activeBuffs
      .filter(b => b.type === 'rate_pct' && b.timer > 0)
      .reduce((s, b) => s + b.value, 0);
    if (talRate > 0) base *= (1 + talRate / 100);
  }

  // Linh Thú buff
  const beastRate = getLinhThuBuff(G, 'rate_pct');
  if (beastRate > 0) base *= (1 + beastRate / 100);

  return Math.max(0.01, Math.round(base * 100) / 100);
}

export function calcMaxQi(G) {
  const r = REALMS[G.realmIdx];
  let q = r.qiBase;
  for (let s = 1; s < G.stage; s++) q *= r.qiScaling;
  return Math.floor(q);
}

export function calcPurityThreshold(G) {
  const realm = REALMS[G.realmIdx];
  if (!realm?.purityThresholds) return 999999;
  return realm.purityThresholds[(G.stage ?? 1) - 1] ?? 999999;
}

export function calcPurityRate(G) {
  const factor = REALMS[G.realmIdx]?.purityRateFactor ?? 0.5;
  return Math.max(0.0001, calcQiRate(G) * factor * getPurityBoostMult(G));
}

export function calcAtk(G) {
  const presBonus = G.prestige.bonuses.atkPct || 0;
  const eqAtk     = G.equipment?.slots?.weapon?.stats?.atk    || 0;
  const eqAtkPct  = G.equipment?.slots?.weapon?.stats?.atkPct || 0;

  const ltAtkPct  = _sumBuff(G.linhThuc?.activeBuffs, 'atk_pct');
  const ltAtkFlat = _sumBuff(G.linhThuc?.activeBuffs, 'atk_flat');
  const tpAtkPct  = _sumArrayBuff(G.tranPhap?.activeArrays, 'atk_pct');
  const bcAtkPct  = _sumBuff(G.phuChu?.activeBuffs, 'atk_pct');
  const beastAtk  = getLinhThuBuff(G, 'atk_pct');
  const cpAtkPct  = calcCongPhapMasteryBonus(G).atkPct;

  const base = (G.atk + eqAtk + ltAtkFlat)
    * (1 + (G.atkPct + presBonus + eqAtkPct + ltAtkPct + tpAtkPct + bcAtkPct + cpAtkPct) / 100);
  const buff = G.atkBuff > 0 ? (1 + G.atkBuff / 100) : 1;

  return Math.floor(base * buff * (1 + beastAtk / 100));
}

export function calcDef(G) {
  const eqDef     = G.equipment?.slots?.armor?.stats?.def    || 0;
  const eqDefPct  = G.equipment?.slots?.armor?.stats?.defPct || 0;
  const defBuffMult = G.defBuff > 0 ? (1 + G.defBuff / 100) : 1;

  const ltDefPct  = _sumBuff(G.linhThuc?.activeBuffs, 'def_pct');
  const tpDefPct  = _sumArrayBuff(G.tranPhap?.activeArrays, 'def_pct');
  const bcDefPct  = _sumBuff(G.phuChu?.activeBuffs, 'def_pct');
  const beastDef  = getLinhThuBuff(G, 'def_pct');
  const cpDefPct  = calcCongPhapMasteryBonus(G).defPct;

  return Math.floor(
    ((G.def + eqDef)
      * (1 + ((G.defPct||0) + eqDefPct + ltDefPct + tpDefPct + bcDefPct + beastDef + cpDefPct) / 100)
      + (G.defBonus||0))
    * defBuffMult
  );
}

export function calcMaxHp(G) {
  const eqHp    = G.equipment?.slots?.armor?.stats?.hp    || 0;
  const eqHpPct = G.equipment?.slots?.armor?.stats?.hpPct || 0;

  const ltHpPct  = _sumBuff(G.linhThuc?.activeBuffs, 'hp_max_pct');
  const tpHpPct  = _sumArrayBuff(G.tranPhap?.activeArrays, 'hp_max_pct');
  const bcHpPct  = _sumBuff(G.phuChu?.activeBuffs, 'hp_max_pct');
  const beastHp  = getLinhThuBuff(G, 'hp_max_pct');
  const cpHpPct  = calcCongPhapMasteryBonus(G).hpPct;

  return Math.floor(
    (G.maxHp + eqHp)
    * (1 + ((G.hpPct||0) + eqHpPct + ltHpPct + tpHpPct + bcHpPct + beastHp + cpHpPct) / 100)
    + (G.hpBonus||0)
  );
}

export function calcDmgReduce(G) {
  let reduce = 0;
  if (Array.isArray(G.tranPhap?.activeArrays))
    reduce += _sumArrayBuff(G.tranPhap.activeArrays, 'dmg_reduce');
  if (Array.isArray(G.phuChu?.activeBuffs))
    reduce += _sumBuff(G.phuChu.activeBuffs, 'dmg_reduce');
  return Math.min(0.85, reduce / 100);
}

export function calcSpeed(G) {
  return 10 + Math.floor(G.spdBonus * 20) + G.realmIdx * 5;
}

// ---- Internal helpers ----

function _sumBuff(buffs, type) {
  if (!Array.isArray(buffs)) return 0;
  return buffs.filter(b => b.type === type && b.timer > 0).reduce((s, b) => s + b.value, 0);
}

function _sumArrayBuff(arrays, type) {
  if (!Array.isArray(arrays)) return 0;
  return arrays.flatMap(a => a.effects || []).filter(e => e.type === type).reduce((s, e) => s + e.value, 0);
}