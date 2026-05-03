// ============================================================
// core/systems/inventory.js
// addToInventory, buyItem, useItem, claimWorldEvent
// ============================================================
import { ITEMS }                          from '../data.js';
import { calcMaxQi, calcMaxHp }           from '../state/computed.js';
import { fmtNum }                         from '../../utils/helpers.js';
import { tickAlchemyBuffs, onBuyFirstFurnace } from '../../alchemy/alchemy-engine.js';
import { eatLinhMe, useIchCocDan, healAmThuong } from '../duoc-dien-engine.js';

export function addToInventory(G, item, qty = 1) {
  const existing = G.inventory.find(s => s && s.id === item.id);
  if (existing) { existing.qty += qty; return true; }
  const emptyIdx = G.inventory.findIndex(s => !s);
  if (emptyIdx === -1) return false;
  G.inventory[emptyIdx] = { id: item.id, qty };
  return true;
}

export function buyItem(G, itemId, costOverride) {
  const item = ITEMS.find(i => i.id === itemId);
  if (!item) return { ok:false, msg:'Không tìm thấy vật phẩm', type:'danger' };

  const finalCost = (costOverride !== undefined && !['furnace','forge_furnace','kitchen'].includes(item.type))
    ? costOverride : item.cost;
  if (Math.floor(G.stone) < finalCost)
    return { ok:false, msg:`💎 Cần ${finalCost} linh thạch!`, type:'danger' };

  // Lò Đan
  if (item.type === 'furnace') {
    const cur = G.alchemy?.furnaceLevel || 0;
    const req = item.val - 1;
    if (cur >= item.val)  return { ok:false, msg:`🔥 Ngươi đã có lò đan cấp ${cur} rồi!`, type:'danger' };
    if (cur < req)        return { ok:false, msg:`🔥 Cần có lò đan cấp ${req} trước!`, type:'danger' };
    G.stone -= item.cost;
    if (!G.alchemy) G.alchemy = { furnaceLevel:0, knownRecipes:[], ingredients:{}, craftsCount:0 };
    const isFirst = G.alchemy.furnaceLevel === 0;
    G.alchemy.furnaceLevel = item.val;
    const newRecipes = isFirst ? onBuyFirstFurnace(G) : [];
    const unlockMsg  = newRecipes.length > 0 ? ` | 📜 Mở: ${newRecipes.join(', ')}` : '';
    return { ok:true, msg:`🔥 Mua ${item.name}!${unlockMsg}`, type:'gold' };
  }

  // Bễ Rèn
  if (item.type === 'forge_furnace') {
    if (!G.alchemy) G.alchemy = {};
    if (!G.alchemy.forge) G.alchemy.forge = { level:0, durability:0 };
    const cur = G.alchemy.forge.level || 0;
    const req = item.val - 1;
    if (cur >= item.val) return { ok:false, msg:`⚒ Ngươi đã có Bễ Rèn cấp ${cur} rồi!`, type:'danger' };
    if (cur < req)       return { ok:false, msg:`⚒ Cần có Bễ Rèn cấp ${req} trước!`, type:'danger' };
    G.stone -= item.cost;
    G.alchemy.forge.level = item.val;
    const FORGE_DUR = { 1:8, 2:15, 3:25, 4:40, 5:60 };
    G.alchemy.forge.durability = FORGE_DUR[item.val] || 8;
    return { ok:true, msg:`⚒ Mua ${item.name}! Bễ rèn sẵn sàng.`, type:'gold' };
  }

  // Bếp Linh Thực
  if (item.type === 'kitchen') {
    if (!G.linhThuc) G.linhThuc = { cooksCount:0, kitchen:{level:0,durability:0}, activeBuffs:[], ingredients:{} };
    if (!G.linhThuc.kitchen) G.linhThuc.kitchen = { level:0, durability:0 };
    const cur = G.linhThuc.kitchen.level || 0;
    const req = item.val - 1;
    if (cur >= item.val) return { ok:false, msg:`🍳 Đã có Bếp Linh Thực cấp ${cur}!`, type:'danger' };
    if (cur < req)       return { ok:false, msg:`🍳 Cần có Bếp cấp ${req} trước!`, type:'danger' };
    G.stone -= item.cost;
    G.linhThuc.kitchen.level = item.val;
    const KIT_DUR = { 1:10, 2:18, 3:30, 4:45, 5:70 };
    G.linhThuc.kitchen.durability = KIT_DUR[item.val] || 10;
    return { ok:true, msg:`🍳 Mua ${item.name}! Bếp sẵn sàng.`, type:'gold' };
  }

  // Linh Mễ
  if (item.type === 'food' && item.id === 'linh_me') {
    G.stone -= finalCost;
    if (!G.hunger) G.hunger = { linhMeCount:0, lastEatYear:0, hungerDays:0, isStarving:false, eatingBuff:0, ichCocDanDays:0 };
    G.hunger.linhMeCount = (G.hunger.linhMeCount ?? 0) + 1;
    return { ok:true, msg:`🌾 Mua Linh Mễ! Kho: ${G.hunger.linhMeCount} phần.`, type:'jade' };
  }

  // Hạt giống
  if (item.type === 'seed') {
    const emptySlot = (G.inventory ?? []).indexOf(null);
    if (emptySlot === -1) return { ok:false, msg:'🎒 Túi đồ đầy! Cần dọn chỗ trước.', type:'danger' };
    G.stone -= finalCost;
    G.inventory[emptySlot] = { id:item.id, name:item.name, emoji:item.emoji, qty:1, type:'seed' };
    return { ok:true, msg:`🫘 Mua ${item.name}!`, type:'jade' };
  }

  // Ích Cốc Đan
  if (item.id === 'ich_coc_dan') {
    const emptySlot = (G.inventory ?? []).indexOf(null);
    if (emptySlot === -1) return { ok:false, msg:'🎒 Túi đồ đầy!', type:'danger' };
    G.stone -= finalCost;
    G.inventory[emptySlot] = { id:item.id, name:item.name, emoji:item.emoji, qty:1, type:'consume' };
    return { ok:true, msg:`💊 Mua ${item.name}!`, type:'jade' };
  }

  G.stone -= finalCost;
  return { ok:true, msg:`🏮 Mua ${item.name}`, type:'gold' };
}

export function useItem(G, slotIdx) {
  const slot = G.inventory[slotIdx];
  if (!slot) return { ok:false, msg:'', type:'' };

  let item = ITEMS.find(i => i.id === slot.id);
  if (!item) {
    if (slot.id.endsWith('_talisman')) {
      item = { id:slot.id, name:slot.id, emoji:'📜', action:'talisman' };
    } else {
      return { ok:false, msg:'Vật phẩm lỗi', type:'danger' };
    }
  }

  let result = { ok:true, msg:'', type:'jade', float:'' };
  const maxQ = calcMaxQi(G);
  const maxH = calcMaxHp(G);

  switch (item.action) {
    case 'qi':
      G.qi = Math.min(G.qi + item.val, maxQ);
      result = { ok:true, msg:`${item.emoji} ${item.name} — +${fmtNum(item.val)} linh lực`, type:'gold', float:`+${fmtNum(item.val)}⚡` };
      break;
    case 'hp':
      G.hp = Math.min(G.hp + item.val, maxH);
      result = { ok:true, msg:`${item.emoji} ${item.name} — +${item.val} HP`, type:'jade', float:`+${item.val}❤` };
      break;
    case 'rate':
      G.qiBonus += item.val;
      result = { ok:true, msg:`${item.emoji} ${item.name} — +${item.val} linh lực/s vĩnh viễn`, type:'spirit', float:'' };
      break;
    case 'atkPct':
      G.atkPct += item.val;
      result = { ok:true, msg:`${item.emoji} ${item.name} — +${item.val}% ATK vĩnh viễn`, type:'gold', float:'' };
      break;
    case 'hpPct':
      G.hpPct += item.val;
      G.maxHp  = Math.floor(G.maxHp * 1.5);
      G.hp     = G.maxHp;
      result = { ok:true, msg:`${item.emoji} ${item.name} — +${item.val}% HP vĩnh viễn`, type:'jade', float:'' };
      break;
    case 'atkBuff':
      G.atkBuff = item.val; G.atkBuffTimer = 60;
      result = { ok:true, msg:`${item.emoji} ${item.name} bộc phát! +${item.val}% ATK 60s`, type:'epic', float:'' };
      break;
    case 'stamina':
      G.stamina = Math.min((G.stamina||0) + item.val, G.maxStamina||100);
      result = { ok:true, msg:`${item.emoji} ${item.name} — +${item.val} thể năng`, type:'jade', float:`+${item.val}⚡` };
      break;
    case 'ratePct':
      G.ratePct = (G.ratePct||0) + item.val;
      result = { ok:true, msg:`${item.emoji} ${item.name} — +${item.val}% tu tốc vĩnh viễn`, type:'spirit', float:'' };
      break;
    case 'defPct':
      G.defPct = (G.defPct||0) + item.val;
      result = { ok:true, msg:`${item.emoji} ${item.name} — +${item.val}% phòng ngự vĩnh viễn`, type:'jade', float:'' };
      break;
    case 'exp':
      G.exp = (G.exp||0) + item.val;
      while (G.exp >= G.maxExp) { G.exp -= G.maxExp; G.maxExp = Math.floor(G.maxExp * 1.4); }
      result = { ok:true, msg:`${item.emoji} ${item.name} — +${fmtNum(item.val)} EXP`, type:'jade', float:`+${fmtNum(item.val)}✨` };
      break;
    case 'lifespan':
      if (G.gameTime) {
        G.gameTime.lifespanBonus = (G.gameTime.lifespanBonus||0) + item.val;
        result = { ok:true, msg:`${item.emoji} ${item.name} — tuổi thọ +${item.val} năm`, type:'legendary', float:'' };
      }
      break;
    case 'talisman': {
      import('../../alchemy/phu-chu-data.js').then(({ TALISMAN_ITEMS }) => {
        const talDef = TALISMAN_ITEMS.find(t => t.id === item.id);
        if (!talDef) return;
        if (!G.phuChu) G.phuChu = { drawCount:0, activeBuffs:[] };
        if (!Array.isArray(G.phuChu.activeBuffs)) G.phuChu.activeBuffs = [];
        for (const buff of (talDef.buffs||[])) {
          if (buff.type === 'hp_instant') {
            G.hp = Math.min(calcMaxHp(G), (G.hp||0) + buff.value);
          } else if (buff.duration) {
            const ex = G.phuChu.activeBuffs.find(b => b.type === buff.type);
            if (ex) { ex.timer = Math.max(ex.timer, buff.duration); ex.value = Math.max(ex.value, buff.value); }
            else G.phuChu.activeBuffs.push({ type:buff.type, value:buff.value, timer:buff.duration, source:item.id });
          }
        }
      });
      result = { ok:true, msg:`${item.emoji} ${item.name} — bùa phát động!`, type:'gold', float:'' };
      break;
    }
    case 'eat_linh_me': {
      const r = eatLinhMe(G);
      if (!r.ok) return r;
      return { ok:true, msg:r.msg, type:'jade', float:'+🌾 no' };
    }
    case 'ich_coc_dan': {
      const r = useIchCocDan(G);
      if (!r.ok) return r;
      return { ok:true, msg:r.msg, type:'jade', float:'+💊 no 30 ngày' };
    }
    case 'heal_am_thuong': {
      const r = healAmThuong(G, item.val ?? 15, item.name);
      if (!r.ok) return { ok:false, msg:r.msg, type:'warning' };
      return { ok:true, msg:r.msg, type:'jade', float:`🩹 -${r.healed} Ám Thương` };
    }
    default:
      result = { ok:true, msg:`Dùng ${item.name}`, type:'jade', float:'' };
  }

  slot.qty--;
  if (slot.qty <= 0) G.inventory[slotIdx] = null;
  return result;
}

export function claimWorldEvent(G, event) {
  const r = event.reward;
  const maxQ = calcMaxQi(G);
  if (r === 'rate300')   { G.eventRateBonus = 300; G.eventRateTimer = 45; return { msg:'⚡ +300% tu luyện 45s!', type:'epic' }; }
  if (r === 'stone800')  { G.stone += 800; return { msg:'💎 +800 linh thạch!', type:'gold' }; }
  if (r === 'qi400')     { G.qi = Math.min(G.qi + 400, maxQ); return { msg:'⚡ +400 linh lực!', type:'gold' }; }
  if (r === 'exp500')    { G.eventExpBonus = 500; G.eventExpTimer = 30; return { msg:'📈 +500% EXP 30s!', type:'spirit' }; }
  if (r === 'maxhp200')  { G.maxHp += 200; G.hp = Math.min(G.hp + 200, calcMaxHp(G)); return { msg:'❤ HP tối đa +200!', type:'jade' }; }
  if (r === 'all15')     { G.eventRateBonus = 15; G.eventRateTimer = 60; G.atkPct += 15; G.defPct += 15; return { msg:'🌟 Tất cả +15% trong 60s!', type:'epic' }; }
  return { msg:'Nhận phần thưởng', type:'jade' };
}
