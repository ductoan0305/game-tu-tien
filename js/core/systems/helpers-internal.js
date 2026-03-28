// ============================================================
// core/systems/helpers-internal.js
// Các helper dùng nội bộ trong systems/ — không export ra ngoài
// ============================================================
import { getLinhThuBuff } from '../linh-thu-engine.js';

export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export function spendStamina(G, amt) {
  if (G.stamina < amt) return false;
  if (G.meditating) { G.meditating = false; }
  G.stamina = Math.max(0, G.stamina - amt);
  return true;
}

export function gainExp(G, base) {
  const ltExpPct  = _sumBuff(G.linhThuc?.activeBuffs,  'exp_pct');
  const tpExpPct  = _sumArrayBuff(G.tranPhap?.activeArrays, 'exp_pct');
  const bcExpPct  = _sumBuff(G.phuChu?.activeBuffs,    'exp_pct');
  const beastExp  = getLinhThuBuff(G, 'exp_pct');
  const mult = 1
    + (G.expBonus || 0) / 100
    + (G.eventExpBonus > 0 ? G.eventExpBonus / 100 : 0)
    + ltExpPct / 100 + tpExpPct / 100 + bcExpPct / 100 + beastExp / 100;
  G.exp = (G.exp || 0) + Math.floor(base * mult);
  while (G.exp >= G.maxExp) {
    G.exp  -= G.maxExp;
    G.maxExp = Math.floor(G.maxExp * 1.4);
  }
}

export function gainStone(G, base) {
  const ltStonePct  = _sumBuff(G.linhThuc?.activeBuffs,     'stone_pct');
  const tpStonePct  = _sumArrayBuff(G.tranPhap?.activeArrays,'stone_pct');
  const bcStonePct  = _sumBuff(G.phuChu?.activeBuffs,        'stone_pct');
  const beastStone  = getLinhThuBuff(G, 'stone_pct');
  const mult = 1
    + ltStonePct / 100 + tpStonePct / 100
    + bcStonePct / 100 + (G.stoneBuffPct || 0) / 100
    + beastStone / 100;
  return Math.floor(base * mult);
}

// ---- buff sum helpers ----
function _sumBuff(buffs, type) {
  if (!Array.isArray(buffs)) return 0;
  return buffs.filter(b => b.type === type && b.timer > 0).reduce((s, b) => s + b.value, 0);
}
function _sumArrayBuff(arrays, type) {
  if (!Array.isArray(arrays)) return 0;
  return arrays.flatMap(a => a.effects || []).filter(e => e.type === type).reduce((s, e) => s + e.value, 0);
}
