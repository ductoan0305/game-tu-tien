// ============================================================
// core/thuong-hoi-engine.js — Thương Hội (Merchant Guild)
// Currency: Linh Thạch + Danh Vọng (không dùng tiền tệ riêng)
// 3 cơ chế: Du Hiệp | Giao Dịch | Bí Kíp
// ============================================================
import { bus } from '../utils/helpers.js';

export const FREELANCE_QUESTS = [
  // Tier 1 — DV 0+
  { id:'fq_herb_run',   name:'Vận Chuyển Linh Thảo', emoji:'🌿', tier:1, requireDV:0,   requireRealm:0,
    desc:'Thương hội cần 5 Linh Nhung vận chuyển đến điểm hẹn.',
    cost:{ type:'ingredient', id:'lingrong', qty:5 },
    reward:{ stone:80,   danhVong:4,  exp:80  }, cooldownHours:4 },
  { id:'fq_patrol',     name:'Tuần Tra Chợ Đêm',     emoji:'🛡', tier:1, requireDV:0,   requireRealm:0,
    desc:'Canh gác khu chợ qua đêm, xua đuổi kẻ trộm và yêu thú nhỏ.',
    cost:{ type:'stamina', qty:30 },
    reward:{ stone:120,  danhVong:5,  exp:100 }, cooldownHours:6 },
  { id:'fq_appraise',   name:'Định Giá Đan Dược',     emoji:'⚗', tier:1, requireDV:0,   requireRealm:0,
    desc:'Hỗ trợ thẩm định 3 viên linh đan cho khách hàng của hội.',
    cost:{ type:'ingredient', id:'linghidan', qty:3 },
    reward:{ stone:150,  danhVong:6,  exp:120 }, cooldownHours:6 },

  // Tier 2 — DV 150+
  { id:'fq_escort',     name:'Hộ Tống Thương Đoàn',  emoji:'⚔', tier:2, requireDV:150, requireRealm:0,
    desc:'Hộ tống đoàn thương nhân từ Thanh Vân Sơn đến Vạn Linh Thị. Cảnh giác Kiếp Tu.',
    cost:{ type:'stamina', qty:50 },
    reward:{ stone:350,  danhVong:10, exp:300 }, cooldownHours:8 },
  { id:'fq_rare_ore',   name:'Thu Thập Khoáng Hiếm', emoji:'⛏', tier:2, requireDV:150, requireRealm:0,
    desc:'Hội cần 5 Thiết Thần Quặng từ mỏ trong Hắc Phong Lâm.',
    cost:{ type:'ingredient', id:'iron_ore', qty:5 },
    reward:{ stone:280,  danhVong:8,  exp:250 }, cooldownHours:8 },
  { id:'fq_bounty_info',name:'Điều Tra Kiếp Tu',      emoji:'🕵', tier:2, requireDV:150, requireRealm:1,
    desc:'Theo dõi và báo cáo hoạt động của băng Kiếp Tu. Cần lý lịch sạch (Nghiệp Lực < 30).',
    cost:{ type:'special', id:'nghiepLuc_low' },
    reward:{ stone:500,  danhVong:15, exp:400 }, cooldownHours:12 },

  // Tier 3 — DV 300+
  { id:'fq_dungeon_salvage', name:'Trục Xuất Yêu Ma Địa Phủ', emoji:'☠', tier:3, requireDV:300, requireRealm:2,
    desc:'Hội có hợp đồng với Địa Phủ Môn — diệt Ma Tướng và thu hồi nguyên liệu.',
    cost:{ type:'dungeon_run' },
    reward:{ stone:1200, danhVong:20, exp:1000, ingredient:{ id:'dark_crystal', qty:2 } }, cooldownHours:24 },
  { id:'fq_auction_guard',   name:'Bảo Vệ Đấu Giá Trường',   emoji:'💰', tier:3, requireDV:300, requireRealm:1,
    desc:'Hộ tống trang bị quý đến Đấu Giá Trường, ngăn chặn kẻ cướp.',
    cost:{ type:'stamina', qty:80 },
    reward:{ stone:900,  danhVong:12, exp:700  }, cooldownHours:16 },

  // Tier 4 — DV 500+
  { id:'fq_vip_escort',      name:'Hộ Tống Tu Sĩ VIP',        emoji:'🌟', tier:4, requireDV:500, requireRealm:2,
    desc:'Hộ tống một tu sĩ Trúc Cơ danh tiếng xuyên qua Thiên Kiếp Địa.',
    cost:{ type:'stamina', qty:100 },
    reward:{ stone:2500, danhVong:25, exp:2000 }, cooldownHours:24 },
  { id:'fq_secret_delivery', name:'Vận Chuyển Cơ Mật',         emoji:'📦', tier:4, requireDV:500, requireRealm:2,
    desc:'Nhiệm vụ tuyệt mật — nội dung không tiết lộ. Phần thưởng rất cao.',
    cost:{ type:'ingredient', id:'void_essence', qty:1 },
    reward:{ stone:3000, danhVong:30, exp:2500, ingredient:{ id:'soul_shard', qty:3 } }, cooldownHours:48 },
];

// Đổi stone + DV lấy nguyên liệu hiếm
export const EXCHANGE_ITEMS = [
  { id:'ex_dark_crystal',   name:'Ám Tinh Thạch',      emoji:'🔮', ingredientId:'dark_crystal',       qty:1, stoneCost:600,  dvCost:5,  requireDV:150 },
  { id:'ex_soul_shard',     name:'Hồn Phách Mảnh',     emoji:'💠', ingredientId:'soul_shard',         qty:1, stoneCost:700,  dvCost:5,  requireDV:150 },
  { id:'ex_void_essence',   name:'Hư Không Tinh Tủy',  emoji:'🌌', ingredientId:'void_essence',       qty:1, stoneCost:1200, dvCost:8,  requireDV:300 },
  { id:'ex_hell_flame',     name:'Địa Ngục Hỏa Tinh',  emoji:'🔥', ingredientId:'hell_flame_essence', qty:1, stoneCost:1400, dvCost:10, requireDV:300 },
  { id:'ex_demon_soul',     name:'Thiên Ma Hồn Tinh',  emoji:'🌑', ingredientId:'demon_soul_crystal', qty:1, stoneCost:2000, dvCost:15, requireDV:500 },
  { id:'ex_lingrong_bulk',  name:'Linh Nhung ×10',     emoji:'🌿', ingredientId:'lingrong',           qty:10,stoneCost:200,  dvCost:0,  requireDV:0   },
  { id:'ex_linghidan_bulk', name:'Linh Đan ×5',        emoji:'💊', ingredientId:'linghidan',          qty:5, stoneCost:250,  dvCost:0,  requireDV:0   },
  { id:'ex_iron_ore_bulk',  name:'Thiết Thần Quặng ×8',emoji:'⛏', ingredientId:'iron_ore',           qty:8, stoneCost:300,  dvCost:0,  requireDV:50  },
];

// Bí kíp / buff — mua bằng stone
export const INTEL_ITEMS = [
  { id:'intel_stone_boost',       name:'Bí Kíp Kinh Doanh', emoji:'📈', stoneCost:300,  requireDV:0,
    desc:'+20% stone từ mọi nguồn trong 30 phút thực.',
    effect:{ type:'stoneBuffPct', value:20, duration:1800 } },
  { id:'intel_exp_boost',         name:'Cẩm Nang Tu Tiên',  emoji:'📖', stoneCost:350,  requireDV:0,
    desc:'+30% EXP trong 20 phút thực.',
    effect:{ type:'expBuff', value:30, duration:1200 } },
  { id:'intel_ambush_ward',       name:'Bùa Trừ Kiếp Tu',   emoji:'🛡', stoneCost:600,  requireDV:50,
    desc:'Xác suất bị phục kích giảm 80% trong 2 giờ thực.',
    effect:{ type:'ambushWard', value:0.8, duration:7200 } },
  { id:'intel_purity_boost',      name:'Tĩnh Tâm Thư',      emoji:'🌙', stoneCost:800,  requireDV:150,
    desc:'Tốc độ tích Thuần Độ +50% trong 30 phút thực.',
    effect:{ type:'purityBoost', value:50, duration:1800 } },
  { id:'intel_breakthrough_hint', name:'Đột Phá Tâm Pháp',  emoji:'⚡', stoneCost:1500, requireDV:300,
    desc:'+10% xác suất đột phá lần tiếp theo (dùng 1 lần).',
    effect:{ type:'breakthroughBonus', value:0.10, duration:-1 } },
  { id:'intel_nghiep_cleanse',    name:'Lễ Sám Hối',         emoji:'🙏', stoneCost:1000, requireDV:150,
    desc:'Giảm Nghiệp Lực xuống còn 50% hiện tại.',
    effect:{ type:'nghiepCleanse', value:0.5, duration:-1 } },
];

// ---- State helper ----
function _th(G) {
  if (!G.thuongHoi) G.thuongHoi = { totalQuestsDone:0, questCooldowns:{}, ambushWardExpires:null, ambushWardValue:0, purityBoostExpires:null, purityBoostValue:0 };
  return G.thuongHoi;
}

export function isThuongHoiUnlocked(G) { return (G.danhVong ?? 0) >= 50; }

export function getAvailableFreelanceQuests(G) {
  const dv = G.danhVong ?? 0, th = _th(G), now = G.gameTime?.currentYear ?? 0;
  return FREELANCE_QUESTS.filter(q => {
    if (dv < q.requireDV || (G.realmIdx??0) < q.requireRealm) return false;
    const cdYrs = q.cooldownHours / 8760;
    if (now - (th.questCooldowns[q.id]??0) < cdYrs) return false;
    return true;
  });
}

export function getQuestCooldownInfo(G, questId) {
  const q = FREELANCE_QUESTS.find(q => q.id === questId); if (!q) return null;
  const th = _th(G), now = G.gameTime?.currentYear ?? 0;
  const rem = (q.cooldownHours/8760) - (now - (th.questCooldowns[q.id]??0));
  if (rem <= 0) return null;
  const h = rem * 8760; return h >= 1 ? `${h.toFixed(1)}h` : `${(h*60).toFixed(0)}p`;
}

function _checkCost(G, q) {
  const c = q.cost; if (!c) return { ok:true };
  if (c.type==='ingredient') {
    const have = G.alchemy?.ingredients?.[c.id]??0;
    if (have < c.qty) return { ok:false, msg:`Cần ${c.qty}× ${c.id} (có ${have})` };
  }
  if (c.type==='stamina' && (G.stamina??0) < c.qty) return { ok:false, msg:`Cần ${c.qty} thể năng` };
  if (c.type==='dungeon_run' && (G.dungeon?.highestFloor??0) < 3) return { ok:false, msg:'Cần chinh phục Địa Phủ tầng 3+' };
  if (c.type==='special' && c.id==='nghiepLuc_low' && (G.nghiepLuc??0) >= 30) return { ok:false, msg:`Nghiệp Lực quá cao (${Math.floor(G.nghiepLuc??0)}/30)` };
  return { ok:true };
}

export function acceptFreelanceQuest(G, questId) {
  if (!isThuongHoiUnlocked(G)) return { ok:false, msg:'🔒 Cần Danh Vọng ≥ 50!', type:'danger' };
  const q = FREELANCE_QUESTS.find(q=>q.id===questId);
  if (!q) return { ok:false, msg:'Không tồn tại', type:'danger' };
  if ((G.danhVong??0) < q.requireDV) return { ok:false, msg:`Cần DV ${q.requireDV}+`, type:'danger' };
  if ((G.realmIdx??0) < q.requireRealm) return { ok:false, msg:'Cần cảnh giới cao hơn', type:'danger' };
  const cd = getQuestCooldownInfo(G, questId);
  if (cd) return { ok:false, msg:`⏳ Cooldown còn ${cd}`, type:'danger' };
  const cc = _checkCost(G, q); if (!cc.ok) return { ok:false, msg:cc.msg, type:'danger' };

  const c = q.cost;
  if (c?.type==='ingredient') G.alchemy.ingredients[c.id] = (G.alchemy.ingredients[c.id]??0) - c.qty;
  if (c?.type==='stamina')    G.stamina = Math.max(0, (G.stamina??0) - c.qty);

  const r = q.reward;
  G.stone    = (G.stone??0)    + (r.stone??0);
  G.danhVong = (G.danhVong??0) + (r.danhVong??0);
  G.exp      = (G.exp??0)      + (r.exp??0);
  if (r.ingredient) {
    if (!G.alchemy) G.alchemy = { ingredients:{} };
    G.alchemy.ingredients[r.ingredient.id] = (G.alchemy.ingredients[r.ingredient.id]??0) + r.ingredient.qty;
  }

  const th = _th(G);
  th.questCooldowns[questId] = G.gameTime?.currentYear ?? 0;
  th.totalQuestsDone         = (th.totalQuestsDone??0) + 1;

  bus.emit('danhvong:gained', { amount:r.danhVong??0, source:`Du hiệp: ${q.name}` });
  bus.emit('thuonghoi:quest_done', { quest:q, reward:r });

  const parts = [];
  if (r.stone)     parts.push(`+${r.stone}💎`);
  if (r.danhVong)  parts.push(`+${r.danhVong}⭐DV`);
  if (r.exp)       parts.push(`+${r.exp}✨`);
  if (r.ingredient)parts.push(`+${r.ingredient.qty}× ${r.ingredient.id}`);
  return { ok:true, msg:`${q.emoji} Hoàn thành "${q.name}"! ${parts.join(' ')}`, type:'gold', reward:r };
}

export function exchangeItem(G, exchangeId) {
  if (!isThuongHoiUnlocked(G)) return { ok:false, msg:'🔒 Cần DV ≥ 50', type:'danger' };
  const item = EXCHANGE_ITEMS.find(e=>e.id===exchangeId);
  if (!item) return { ok:false, msg:'Không tìm thấy', type:'danger' };
  if ((G.danhVong??0) < item.requireDV) return { ok:false, msg:`Cần DV ${item.requireDV}+`, type:'danger' };
  if ((G.stone??0) < item.stoneCost) return { ok:false, msg:`Cần ${item.stoneCost}💎`, type:'danger' };

  G.stone    = (G.stone??0)    - item.stoneCost;
  G.danhVong = (G.danhVong??0) - (item.dvCost??0);
  if (!G.alchemy) G.alchemy = { ingredients:{} };
  G.alchemy.ingredients[item.ingredientId] = (G.alchemy.ingredients[item.ingredientId]??0) + item.qty;

  const dvNote = item.dvCost > 0 ? ` -${item.dvCost}⭐DV` : '';
  return { ok:true, msg:`🏪 Mua ${item.emoji} ${item.name} ×${item.qty} (${item.stoneCost}💎${dvNote})`, type:'spirit' };
}

export function buyIntel(G, intelId) {
  if (!isThuongHoiUnlocked(G)) return { ok:false, msg:'🔒 Cần DV ≥ 50', type:'danger' };
  const intel = INTEL_ITEMS.find(i=>i.id===intelId);
  if (!intel) return { ok:false, msg:'Không tìm thấy', type:'danger' };
  if ((G.danhVong??0) < intel.requireDV) return { ok:false, msg:`Cần DV ${intel.requireDV}+`, type:'danger' };
  if ((G.stone??0) < intel.stoneCost) return { ok:false, msg:`Cần ${intel.stoneCost}💎`, type:'danger' };

  G.stone = (G.stone??0) - intel.stoneCost;
  const ef = intel.effect, now = G.gameTime?.currentYear??0, th = _th(G);

  if      (ef.type==='stoneBuffPct')      { G.stoneBuffPct=(G.stoneBuffPct??0)+ef.value; G.stoneBuffTimer=ef.duration; }
  else if (ef.type==='expBuff')           { G.eventExpBonus=ef.value; G.eventExpTimer=ef.duration; }
  else if (ef.type==='ambushWard')        { th.ambushWardExpires=now+ef.duration/31536000; th.ambushWardValue=ef.value; }
  else if (ef.type==='purityBoost')       { th.purityBoostExpires=now+ef.duration/31536000; th.purityBoostValue=ef.value; }
  else if (ef.type==='breakthroughBonus') { G._breakthroughCoDuyenBonus=(G._breakthroughCoDuyenBonus??0)+ef.value; }
  else if (ef.type==='nghiepCleanse')     { G.nghiepLuc=Math.max(0,(G.nghiepLuc??0)*ef.value); }

  return { ok:true, msg:`${intel.emoji} ${intel.name}! ${intel.desc}`, type:'epic' };
}

export function tickThuongHoiBuffs(G) {
  const th = G.thuongHoi; if (!th) return;
  const now = G.gameTime?.currentYear ?? 0;
  if (th.ambushWardExpires  && now >= th.ambushWardExpires)  { th.ambushWardExpires=null;  th.ambushWardValue=0; }
  if (th.purityBoostExpires && now >= th.purityBoostExpires) { th.purityBoostExpires=null; th.purityBoostValue=0; }
}

export function getAmbushWardFactor(G) {
  const th=G.thuongHoi, now=G.gameTime?.currentYear??0;
  if (!th?.ambushWardExpires || now>=th.ambushWardExpires) return 1.0;
  return 1.0 - (th.ambushWardValue??0);
}

export function getPurityBoostMult(G) {
  const th=G.thuongHoi, now=G.gameTime?.currentYear??0;
  if (!th?.purityBoostExpires || now>=th.purityBoostExpires) return 1.0;
  return 1.0 + (th.purityBoostValue??0)/100;
}

export function getThuongHoiRank(totalQuestsDone) {
  if (totalQuestsDone >= 50) return { rank:4, name:'Bạch Kim Thương Nhân', emoji:'🌟', color:'#f0d47a' };
  if (totalQuestsDone >= 20) return { rank:3, name:'Kim Bài Thương Nhân',  emoji:'🏅', color:'#e8a020' };
  if (totalQuestsDone >= 8)  return { rank:2, name:'Bạc Bài Thương Nhân',  emoji:'🥈', color:'#aaa'    };
  if (totalQuestsDone >= 2)  return { rank:1, name:'Đồng Bài Thương Nhân', emoji:'🥉', color:'#c87533' };
  return                            { rank:0, name:'Tập Sự Du Hiệp',       emoji:'📋', color:'#888'    };
}