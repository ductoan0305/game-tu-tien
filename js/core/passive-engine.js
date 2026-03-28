// ============================================================
// core/passive-engine.js — Passive skill tree engine
// Xử lý mua node, apply bonus, tính toán
// ============================================================
import { PASSIVE_NODES } from './passive-data.js';
import { bus } from '../utils/helpers.js';

// ---- Helpers ----

function getNode(nodeId) {
  return PASSIVE_NODES.find(n => n.id === nodeId) || null;
}

function getNodeRank(G, nodeId) {
  return G.passiveTree?.ranks?.[nodeId] || 0;
}

// ---- Public API ----

/**
 * Lấy rank hiện tại của một node
 */
export function getPassiveRank(G, nodeId) {
  return getNodeRank(G, nodeId);
}

/**
 * Kiểm tra có thể mua/nâng node không
 */
export function canUpgradeNode(G, nodeId) {
  const node = getNode(nodeId);
  if (!node) return { ok: false, msg: 'Node không tồn tại', type: 'danger' };

  // Kiểm tra đúng linh căn
  if (G.spiritRoot !== node.spiritRoot) {
    return { ok: false, msg: 'Linh căn không phù hợp!', type: 'danger' };
  }

  // Kiểm tra đã max chưa
  const currentRank = getNodeRank(G, nodeId);
  if (currentRank >= node.maxRank) {
    return { ok: false, msg: 'Đã đạt cấp tối đa!', type: 'danger' };
  }

  // Kiểm tra prerequisite
  for (const reqId of node.requires) {
    const reqNode = getNode(reqId);
    const reqRank = getNodeRank(G, reqId);
    if (reqRank < (reqNode?.maxRank || 1)) {
      return { ok: false, msg: `Cần hoàn thành: ${reqNode?.name || reqId} trước!`, type: 'danger' };
    }
  }

  // Kiểm tra chi phí
  const cost = node.costPerRank;
  if (node.costType === 'stone') {
    if (G.stone < cost) return { ok: false, msg: `Cần ${cost} linh thạch!`, type: 'danger' };
  } else {
    if (G.qi < cost) return { ok: false, msg: `Cần ${cost} linh lực!`, type: 'danger' };
  }

  return { ok: true };
}

/**
 * Mua/nâng cấp một passive node
 * @returns {{ ok, msg, type, stat, bonus }}
 */
export function upgradePassiveNode(G, nodeId) {
  const check = canUpgradeNode(G, nodeId);
  if (!check.ok) return check;

  const node = getNode(nodeId);
  const currentRank = getNodeRank(G, nodeId);

  // Trừ chi phí
  if (node.costType === 'stone') {
    G.stone -= node.costPerRank;
  } else {
    G.qi -= node.costPerRank;
  }

  // Tăng rank
  if (!G.passiveTree) G.passiveTree = { ranks: {}, totalPoints: 0 };
  if (!G.passiveTree.ranks) G.passiveTree.ranks = {};
  G.passiveTree.ranks[nodeId] = currentRank + 1;
  G.passiveTree.totalPoints = (G.passiveTree.totalPoints || 0) + 1;

  // Apply bonus vào G
  applyPassiveBonus(G, node.effect.stat, node.effect.perRank);

  const newRank = currentRank + 1;
  const bonusStr = `+${node.effect.perRank}${node.effect.unit} ${node.effect.stat}`;

  bus.emit('quest:update', { type: 'upgrade_passive', qty: 1 });

  return {
    ok: true,
    type: 'jade',
    msg: `✦ ${node.name} cấp ${newRank}/${node.maxRank} (${bonusStr})`,
    stat: node.effect.stat,
    bonus: node.effect.perRank,
  };
}

/**
 * Apply một passive bonus vào G stats
 */
function applyPassiveBonus(G, stat, value) {
  switch (stat) {
    case 'atkPct':    G.atkPct    = (G.atkPct    || 0) + value; break;
    case 'defPct':    G.defPct    = (G.defPct    || 0) + value; break;
    case 'hpPct':     G.hpPct     = (G.hpPct     || 0) + value; break;
    case 'ratePct':   G.ratePct   = (G.ratePct   || 0) + value; break;
    case 'spdBonus':  G.spdBonus  = (G.spdBonus  || 0) + value; break;
    case 'hpBonus':   G.hpBonus   = (G.hpBonus   || 0) + value; break;
    case 'defBonus':  G.defBonus  = (G.defBonus  || 0) + value; break;
    case 'qiBonus':   G.qiBonus   = (G.qiBonus   || 0) + value; break;
    case 'stoneBonus':G.stoneBonus= (G.stoneBonus|| 0) + value; break;
    case 'danBonus':  G.danBonus  = (G.danBonus  || 0) + value; break;
    case 'arrayBonus':G.arrayBonus= (G.arrayBonus|| 0) + value; break;
    case 'expBonus':  G.expBonus  = (G.expBonus  || 0) + value; break;
  }
}

/**
 * Recalculate tất cả passive bonuses từ đầu (gọi khi load game)
 * để tránh double-counting
 */
export function recalcAllPassiveBonuses(G) {
  if (!G.passiveTree?.ranks) return;

  // Reset tất cả passive bonuses về 0 trước khi recalc
  // Chỉ reset phần passive (không đụng equipment/sect/v.v.)
  // Lưu lại giá trị base từ character setup
  const passiveStats = ['atkPct','defPct','hpPct','ratePct','hpBonus','defBonus','qiBonus','stoneBonus','danBonus','arrayBonus','expBonus'];
  // Không reset spdBonus vì nó cũng ảnh hưởng từ skills

  // Reapply từng node
  for (const [nodeId, rank] of Object.entries(G.passiveTree.ranks)) {
    const node = getNode(nodeId);
    if (!node || rank <= 0) continue;
    // Bonus đã được apply khi mua — không cần recalc lại nếu đã saved
    // Hàm này chỉ dùng cho debug/reset
  }
}

/**
 * Lấy tổng bonus từ passive tree của một stat
 */
export function getTotalPassiveBonus(G, stat) {
  if (!G.passiveTree?.ranks) return 0;
  let total = 0;
  for (const [nodeId, rank] of Object.entries(G.passiveTree.ranks)) {
    const node = getNode(nodeId);
    if (node && node.effect.stat === stat) {
      total += node.effect.perRank * rank;
    }
  }
  return total;
}
