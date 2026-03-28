// ============================================================
// alchemy/alchemy-engine.js — Luyện đan logic v3
// Session 5: Rank Đan Sư, Đan Phẩm, Nổ Lò, Durability lò,
//            Unlock công thức theo rank, Đan Phương Tệ
// ============================================================
import { rollCoDuyen } from '../core/co-duyen.js';
import {
  RECIPES, PILLS, GATHER_ZONES, INGREDIENTS,
  DAN_SU_RANKS, getDanSuRank, getNextDanSuRank,
  DAN_PHAM, rollDanPham,
  FURNACE_EXPLOSION, FURNACE_DURABILITY,
  RECIPE_AUTO_UNLOCK, RECIPE_LEARN_SOURCES,
} from './alchemy-data.js';
import { calcMaxHp, calcMaxQi } from '../core/state.js';
import { randInt, bus } from '../utils/helpers.js';

// ============================================================
// HELPERS
// ============================================================

function getRecipe(recipeId) { return RECIPES.find(r => r.id === recipeId); }
function getPill(pillId)     { return PILLS.find(p => p.id === pillId); }

function hasIngredients(G, recipe, qty = 1) {
  return recipe.ingredients.every(({ id, qty: q }) =>
    (G.alchemy.ingredients[id] || 0) >= q * qty
  );
}

function consumeIngredients(G, recipe) {
  for (const { id, qty } of recipe.ingredients) {
    G.alchemy.ingredients[id] = Math.max(0, (G.alchemy.ingredients[id] || 0) - qty);
  }
}

function calcSuccessChance(G, recipe) {
  const rank = getDanSuRank(G.alchemySuccess || 0);
  let chance = recipe.successChance;
  chance += (rank.bonus || 0) / 100;
  chance += Math.max(0, (G.alchemy?.furnaceLevel || 0) - 1) * 0.05;
  chance += (G.danBonus || 0) / 100 * 0.3;
  chance += Math.min((G.alchemy?.successStreak || 0) * 0.02, 0.10);
  if (recipe.element && G.spiritData?.mainElement === recipe.element) chance += 0.08;

  // Ngộ Tính — thiên phú luyện đan, hiểu sâu bí quyết phối liệu
  const ngoTinh = G.ngoTinh ?? 50;
  const ngoTinhBonus = ngoTinh < 20 ? -0.10
    : ngoTinh < 40  ? -0.05
    : ngoTinh < 60  ?  0.00
    : ngoTinh < 75  ?  0.05
    : ngoTinh < 90  ?  0.10
    :                  0.18;
  chance += ngoTinhBonus;

  // Linh căn hệ Hỏa — thiên phú luyện đan
  const mainElem = G.spiritData?.mainElement;
  if (mainElem === 'huo') chance += 0.10;
  else if (['kim','tu'].includes(mainElem)) chance += 0.03; // hệ khác có thiên phú nhỏ

  return Math.min(0.95, Math.max(0.02, chance));
}

function calcExplosionChance(G) {
  const lv = G.alchemy?.furnaceLevel || 0;
  return Math.max(0, FURNACE_EXPLOSION.baseRate - lv * FURNACE_EXPLOSION.furnaceLevelReduction);
}

function checkFurnace(G) {
  const lv = G.alchemy?.furnaceLevel || 0;
  if (lv === 0) return { ok: false, msg: '🔥 Chưa có lò đan — mua tại Cửa Hàng.', broken: false };
  const dur = G.alchemy?.furnaceDurability || 0;
  if (dur <= 0) return { ok: false, msg: '🔥 Lò đan bị hỏng — cần sửa trước khi dùng.', broken: true };
  return { ok: true };
}

function checkRankForTier(G, recipe) {
  const rank = getDanSuRank(G.alchemySuccess || 0);
  if (!rank.canCraft) return { ok: false, msg: '📜 Cần có lò đan trước khi luyện đan.' };
  if (recipe.tier > (rank.maxTier || 1)) {
    const needed = DAN_SU_RANKS.find(r => (r.maxTier || 0) >= recipe.tier);
    return { ok: false, msg: `📜 Cần đạt ${needed?.name || 'rank cao hơn'} để luyện tier ${recipe.tier}.` };
  }
  return { ok: true };
}

function getLifespanBonusCap(G) {
  const base = [120, 200, 500, 1000, 2000][G.realmIdx] || 120;
  return Math.floor(base * 0.20);
}

function maxCraftQty(G) {
  const rank = getDanSuRank(G.alchemySuccess || 0);
  if (rank.rank >= 5) return 5;
  if (rank.rank >= 3) return 2;
  return 1;
}

// ============================================================
// APPLY PILL EFFECT
// ============================================================
function applyPillEffect(G, pill, qualityMult = 1.0) {
  const { type, value, duration } = pill.effect;
  const v = value * qualityMult;
  const maxQi = calcMaxQi(G);
  const maxHp = calcMaxHp(G);

  switch (type) {
    case 'qi':
      G.qi = Math.min(G.qi + Math.floor(maxQi * v), maxQi);
      return `+${Math.floor(maxQi * v)} linh lực`;
    case 'hp':
      G.hp = Math.min(G.hp + Math.floor(maxHp * v), maxHp);
      return `+${Math.floor(maxHp * v)} HP`;
    case 'permanent_stamina':
      G.maxStamina += Math.round(v); G.stamina = Math.min(G.stamina + Math.round(v), G.maxStamina);
      return `+${Math.round(v)} thể năng tối đa`;
    case 'permanent_rate':
      G.qiBonus += v;
      return `+${v.toFixed(1)} linh lực/s vĩnh viễn`;
    case 'permanent_atk':
      G.atk += Math.round(v);
      return `+${Math.round(v)} công kích vĩnh viễn`;
    case 'permanent_def':
      G.def += Math.round(v);
      return `+${Math.round(v)} phòng thủ vĩnh viễn`;
    case 'permanent_maxhp':
      G.maxHp += Math.round(v); G.hp = Math.min(G.hp + Math.round(v), calcMaxHp(G));
      return `+${Math.round(v)} HP tối đa vĩnh viễn`;
    case 'reduce_breakthrough':
      G.breakthroughCostReduction = (G.breakthroughCostReduction || 0) + v;
      return `Giảm ${Math.floor(v * 100)}% linh lực đột phá tiếp theo`;
    case 'all_stats':
      G.atk = Math.floor(G.atk * (1+v)); G.def = Math.floor(G.def * (1+v));
      G.maxHp = Math.floor(G.maxHp * (1+v)); G.hp = calcMaxHp(G);
      G.qiBonus += Math.floor(G.qiBonus * v + 0.5);
      return `Tất cả chỉ số +${Math.floor(v*100)}% vĩnh viễn`;
    case 'timed_qi_rate':
      G.eventRateBonus = (G.eventRateBonus||0) + Math.round(v);
      G.eventRateTimer = (G.eventRateTimer||0) + (duration||300);
      return `+${Math.round(v)}% tu tốc ${Math.floor((duration||300)/60)}p`;
    case 'timed_atk':
      G.atkBuff = (G.atkBuff||0) + Math.round(v); G.atkBuffTimer = (G.atkBuffTimer||0) + (duration||300);
      return `+${Math.round(v)}% ATK ${Math.floor((duration||300)/60)}p`;
    case 'timed_def':
      G.defBuff = (G.defBuff||0) + Math.round(v); G.defBuffTimer = (G.defBuffTimer||0) + (duration||300);
      return `+${Math.round(v)}% DEF ${Math.floor((duration||300)/60)}p`;
    case 'timed_exp':
      G.eventExpBonus = (G.eventExpBonus||0) + Math.round(v); G.eventExpTimer = (G.eventExpTimer||0) + (duration||300);
      return `+${Math.round(v)}% EXP ${Math.floor((duration||300)/60)}p`;
    case 'timed_stone':
      G.stoneBuffPct = (G.stoneBuffPct||0) + Math.round(v); G.stoneBuffTimer = (G.stoneBuffTimer||0) + (duration||300);
      return `+${Math.round(v)}% linh thạch ${Math.floor((duration||300)/60)}p`;
    case 'stamina_restore':
      G.stamina = Math.min(G.stamina + Math.round(v), G.maxStamina);
      return `+${Math.round(v)} thể năng`;
    case 'lifespan_bonus': {
      const cap = getLifespanBonusCap(G);
      const cur = G.gameTime?.lifespanBonus || 0;
      const gain = Math.min(Math.round(v), cap - cur);
      if (gain <= 0) return 'Thọ mệnh đã đạt giới hạn cảnh giới';
      if (G.gameTime) { G.gameTime.lifespanBonus = cur + gain; G.gameTime.lifespanMax = (G.gameTime.lifespanMax||0) + gain; }
      return `+${gain} năm thọ mệnh`;
    }
    case 'danBonus': G.danBonus = (G.danBonus||0) + v; return `+${v} kỹ thuật luyện đan`;
    case 'stoneBonus': G.stoneBonus = (G.stoneBonus||0) + v; return `+${v} linh thạch/s`;
    case 'clear_debuff':
      G.hp = Math.min(G.hp + Math.floor(maxHp*0.5), maxHp);
      if (G.combat?.active) G.combat.playerDebuffs = [];
      return 'Giải trừ debuff + hồi 50% HP';
    case 'clear_debuff_full':
      G.hp = maxHp;
      if (G.combat?.active) G.combat.playerDebuffs = [];
      return 'Giải trừ toàn bộ debuff + hồi đầy HP';
    case 'all_stats_lifespan': {
      G.atk = Math.floor(G.atk*(1+v)); G.def = Math.floor(G.def*(1+v));
      G.maxHp = Math.floor(G.maxHp*(1+v)); G.hp = calcMaxHp(G);
      G.qiBonus += Math.floor(G.qiBonus*v+0.5);
      const ls = Math.round((pill.effect.lifespan||0) * qualityMult);
      if (ls > 0 && G.gameTime) { G.gameTime.lifespanBonus=(G.gameTime.lifespanBonus||0)+ls; G.gameTime.lifespanMax=(G.gameTime.lifespanMax||0)+ls; }
      return `Tất cả chỉ số +${Math.floor(v*100)}% và +${ls} năm thọ`;
    }
    case 'hp_regen': G.hpRegenBonus = (G.hpRegenBonus||0) + v; return `+${v} HP hồi/giây`;
    default: return 'Hiệu ứng không xác định';
  }
}

// ============================================================
// CRAFT PILL
// ============================================================
export function craftPill(G, recipeId, quantity = 1) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return { ok: false, msg: 'Công thức không tồn tại', type: 'danger' };

  const furnaceCheck = checkFurnace(G);
  if (!furnaceCheck.ok) return { ok: false, msg: furnaceCheck.msg, type: 'danger', broken: furnaceCheck.broken };

  const rankCheck = checkRankForTier(G, recipe);
  if (!rankCheck.ok) return { ok: false, msg: rankCheck.msg, type: 'danger' };

  if (G.realmIdx < (recipe.unlockRealm || 0))
    return { ok: false, msg: 'Cần đạt cảnh giới cao hơn', type: 'danger' };
  if (!G.alchemy.knownRecipes.includes(recipeId))
    return { ok: false, msg: 'Chưa biết công thức — học từ NPC hoặc loot', type: 'danger' };

  const qty = Math.max(1, Math.min(quantity, maxCraftQty(G)));
  if (!hasIngredients(G, recipe, qty))
    return { ok: false, msg: `Thiếu nguyên liệu${qty > 1 ? ' (×' + qty + ')' : ''}`, type: 'danger' };
  if ((G.stone||0) < recipe.stoneCost * qty)
    return { ok: false, msg: `Cần ${recipe.stoneCost * qty} 💎`, type: 'danger' };
  if ((G.stamina||0) < 20 * qty)
    return { ok: false, msg: `Thể năng không đủ (cần ${20*qty})`, type: 'danger' };

  G.stone   -= recipe.stoneCost * qty;
  G.stamina  = Math.max(0, G.stamina - 20 * qty);

  const results = [];

  for (let i = 0; i < qty; i++) {
    consumeIngredients(G, recipe);

    const successChance = calcSuccessChance(G, recipe);
    const isSuccess     = Math.random() < successChance;

    if (isSuccess) {
      const rank = getDanSuRank(G.alchemySuccess || 0);
      const pham = rollDanPham(rank.bonus || 0, G.alchemy.furnaceLevel || 0);
      const pill = getPill(recipe.pillId);
      if (!pill) continue;

      const effectDesc = applyPillEffect(G, pill, pham.mult);
      if (pham.id === 'than') applyPillEffect(G, pill, pham.mult * 0.5);

      G.alchemySuccess  = (G.alchemySuccess || 0) + 1;
      G.alchemy.totalCrafted++;
      G.alchemy.successStreak++;
      G.exp = (G.exp||0) + recipe.tier * 30;
      while (G.exp >= G.maxExp) { G.exp -= G.maxExp; G.maxExp = Math.floor(G.maxExp * 1.4); }

      G.alchemy.furnaceDurability = Math.max(0, (G.alchemy.furnaceDurability||0) - 0.5);
      if (G.alchemySuccess % 10 === 0) G.alchemy.danPhuongTe = (G.alchemy.danPhuongTe||0) + 1;

      bus.emit('quest:update', { type: 'alchemy', qty: 1 });
      rollCoDuyen(G, 'alchemy');
      results.push({ success: true, pham, pill, effectDesc, critical: pham.id === 'than' });
    } else {
      G.alchemy.successStreak = 0;

      if (Math.random() < calcExplosionChance(G)) {
        const dmg = Math.floor((G.maxHp||100) * FURNACE_EXPLOSION.hpLoss);
        G.hp = Math.max(1, (G.hp||0) - dmg);
        G.alchemy.furnaceDurability = Math.max(0, (G.alchemy.furnaceDurability||0) - FURNACE_EXPLOSION.furnaceDurabilityLoss);
        results.push({ success: false, explosion: true, dmg });
        break;
      } else {
        // hoàn lại nếu lose_half
        if (recipe.failEffect === 'lose_half') {
          for (const { id, qty: q } of recipe.ingredients) {
            G.alchemy.ingredients[id] = (G.alchemy.ingredients[id]||0) + Math.floor(q/2);
          }
        }
        G.alchemy.furnaceDurability = Math.max(0, (G.alchemy.furnaceDurability||0) - 1);
        results.push({ success: false, explosion: false });
      }
    }
  }

  const newUnlocks    = _checkRankUnlocks(G);
  const successCount  = results.filter(r => r.success).length;
  const explosions    = results.filter(r => r.explosion).length;
  const thanPham      = results.filter(r => r.critical).length;
  const failCount     = results.filter(r => !r.success && !r.explosion).length;

  let msg = '', type = 'jade';
  if (explosions > 0) {
    const e = results.find(r => r.explosion);
    msg = `💥 NỔ LÒ! -${e.dmg} HP! Lò đan bị hỏng nặng!`;
    type = 'danger';
    if (successCount > 0) msg = `⚗ ${successCount} đan thành công, rồi... ${msg}`;
  } else if (successCount === 0) {
    msg = `⚗ Luyện đan thất bại${failCount > 1 ? ` (${failCount} lần)` : ''} — mất nguyên liệu`;
    type = 'danger';
  } else {
    const last = results.filter(r => r.success).pop();
    if (thanPham > 0) {
      msg = `🌟 THẦN PHẨM! ${last.pill.name} — hiệu quả tối thượng! (${last.effectDesc})`;
      type = 'legendary';
    } else {
      const phamName = last.pham?.name || '';
      msg = qty > 1
        ? `⚗ Luyện thành ×${successCount} ${last.pill.name} [${phamName}]! ${last.effectDesc}`
        : `⚗ ${last.pill.name} [${phamName}] — ${last.effectDesc}`;
      type = last.pham?.id === 'thuong' ? 'epic' : last.pham?.id === 'linh' ? 'jade' : '';
    }
    if (failCount > 0) msg += ` (thất bại ${failCount} lần)`;
  }
  if (newUnlocks.length > 0) msg += ` | 📜 Mở công thức: ${newUnlocks.join(', ')}`;

  return {
    ok: successCount > 0,
    msg, type, results, successCount, explosions, newUnlocks,
    critical: thanPham > 0,
    pill:       results.find(r => r.success)?.pill,
    pham:       results.find(r => r.success)?.pham,
    effectDesc: results.find(r => r.success)?.effectDesc,
  };
}

// ============================================================
// SỬA LÒ
// ============================================================
export function repairFurnace(G) {
  const lv = G.alchemy?.furnaceLevel || 0;
  if (lv === 0) return { ok: false, msg: 'Chưa có lò đan', type: 'danger' };
  const cfg = FURNACE_DURABILITY[lv];
  const dur = G.alchemy?.furnaceDurability || 0;
  if (dur >= cfg.max) return { ok: false, msg: 'Lò vẫn tốt, không cần sửa', type: 'danger' };
  if ((G.stone||0) < cfg.repairCost) return { ok: false, msg: `Cần ${cfg.repairCost} 💎 để sửa lò`, type: 'danger' };
  for (const { id, qty } of cfg.repairItems) {
    if ((G.alchemy?.ingredients?.[id]||0) < qty) {
      return { ok: false, msg: `Thiếu nguyên liệu sửa lò: ${INGREDIENTS[id]?.name||id} ×${qty}`, type: 'danger' };
    }
  }
  G.stone -= cfg.repairCost;
  for (const { id, qty } of cfg.repairItems) {
    G.alchemy.ingredients[id] = Math.max(0, (G.alchemy.ingredients[id]||0) - qty);
  }
  G.alchemy.furnaceDurability = cfg.max;
  return { ok: true, msg: `🔧 Sửa lò cấp ${lv} xong! Durability phục hồi đầy.`, type: 'jade' };
}

// ============================================================
// THU THẢO
// ============================================================
export function gatherIngredient(G, zoneId) {
  const zone = GATHER_ZONES.find(z => z.id === zoneId);
  if (!zone) return { ok: false, msg: 'Khu vực không tồn tại', type: 'danger' };
  if (zoneId === 'dungeon') return { ok: false, msg: '⚠ Nguyên liệu Địa Phủ chỉ thu khi chinh phục dungeon!', type: 'danger' };
  if (G.realmIdx < zone.unlockRealm) return { ok: false, msg: 'Cần đạt cảnh giới cao hơn', type: 'danger' };
  if ((G.stamina||0) < zone.staminaCost) return { ok: false, msg: `Thể năng không đủ (cần ${zone.staminaCost})`, type: 'danger' };
  G.stamina = Math.max(0, G.stamina - zone.staminaCost);
  const gathered = [];
  for (const { id, chance, qty } of zone.items) {
    if (INGREDIENTS[id]?.zone === 'dungeon') continue;
    if (Math.random() < chance) {
      const amount = randInt(...qty);
      G.alchemy.ingredients[id] = (G.alchemy.ingredients[id]||0) + amount;
      gathered.push({ id, qty: amount, name: INGREDIENTS[id]?.name||id, emoji: INGREDIENTS[id]?.emoji||'🌿' });
      bus.emit('gather:item', { itemId: id, qty: amount });
    }
  }
  bus.emit('quest:update', { type: 'gather', qty: gathered.length });
  rollCoDuyen(G, 'gather');
  if (!gathered.length) return { ok: true, msg: `🌿 ${zone.name} — không tìm được gì` };
  return { ok: true, msg: `🌿 ${zone.name}: ${gathered.map(g=>`${g.emoji}${g.name}×${g.qty}`).join(', ')}`, items: gathered };
}

// ============================================================
// UNLOCK CÔNG THỨC
// ============================================================
export function unlockRecipe(G, recipeId) {
  if (!G.alchemy.knownRecipes) G.alchemy.knownRecipes = [];
  if (G.alchemy.knownRecipes.includes(recipeId)) return { ok: false, msg: 'Đã biết công thức này', type: 'danger' };
  const recipe = getRecipe(recipeId);
  if (!recipe) return { ok: false, msg: 'Công thức không tồn tại', type: 'danger' };
  G.alchemy.knownRecipes.push(recipeId);
  return { ok: true, msg: `📜 Học được: ${recipe.name}!`, type: 'jade' };
}

function _checkRankUnlocks(G) {
  const rank = getDanSuRank(G.alchemySuccess || 0);
  const unlocked = [];
  for (let r = 1; r <= rank.rank; r++) {
    for (const id of (RECIPE_AUTO_UNLOCK[r] || [])) {
      if (!G.alchemy.knownRecipes.includes(id) && getRecipe(id)) {
        G.alchemy.knownRecipes.push(id);
        unlocked.push(getRecipe(id)?.name || id);
      }
    }
  }
  return unlocked;
}

export function onBuyFirstFurnace(G) {
  const newOnes = [];
  for (const id of (RECIPE_AUTO_UNLOCK[1] || [])) {
    if (!G.alchemy.knownRecipes.includes(id) && getRecipe(id)) {
      G.alchemy.knownRecipes.push(id);
      newOnes.push(getRecipe(id)?.name || id);
    }
  }
  G.alchemy.furnaceDurability = FURNACE_DURABILITY[1]?.max || 10;
  return newOnes;
}

export function buyRecipeWithDanPhuong(G, recipeId) {
  const src = RECIPE_LEARN_SOURCES.find(s => s.id === recipeId && s.source === 'npc_dan_su');
  if (!src) return { ok: false, msg: 'NPC không bán công thức này', type: 'danger' };
  if (G.realmIdx < (src.minRealm||0)) return { ok: false, msg: 'Cảnh giới chưa đủ', type: 'danger' };
  if ((G.alchemy?.danPhuongTe||0) < src.cost) return { ok: false, msg: `Cần ${src.cost} 📜 Đan Phương Tệ`, type: 'danger' };
  if (G.alchemy.knownRecipes.includes(recipeId)) return { ok: false, msg: 'Đã biết công thức này', type: 'danger' };
  G.alchemy.danPhuongTe -= src.cost;
  G.alchemy.knownRecipes.push(recipeId);
  return { ok: true, msg: `📜 Mua được: ${getRecipe(recipeId)?.name}! (-${src.cost} Đan Phương Tệ)`, type: 'gold' };
}

export function upgradeFurnace(G) {
  return { ok: false, msg: '🔥 Mua lò đan tại Cửa Hàng.', type: 'danger' };
}

export function getAvailableRecipes(G) {
  return RECIPES.filter(r =>
    G.alchemy.knownRecipes.includes(r.id) && G.realmIdx >= (r.unlockRealm||0)
  ).map(r => ({
    ...r, canCraft: hasIngredients(G, r) && (G.stone||0) >= r.stoneCost,
    successChance: calcSuccessChance(G, r), pill: getPill(r.pillId),
  }));
}

export function tickAlchemyBuffs(G, dtSec) {
  if ((G.atkBuffTimer ||0)>0){G.atkBuffTimer -=dtSec;if(G.atkBuffTimer <=0){G.atkBuff=0;G.atkBuffTimer=0;}}
  if ((G.defBuffTimer ||0)>0){G.defBuffTimer -=dtSec;if(G.defBuffTimer <=0){G.defBuff=0;G.defBuffTimer=0;}}
  if ((G.eventRateTimer||0)>0){G.eventRateTimer-=dtSec;if(G.eventRateTimer<=0){G.eventRateBonus=0;G.eventRateTimer=0;}}
  if ((G.eventExpTimer ||0)>0){G.eventExpTimer -=dtSec;if(G.eventExpTimer <=0){G.eventExpBonus=0;G.eventExpTimer=0;}}
  if ((G.stoneBuffTimer||0)>0){G.stoneBuffTimer-=dtSec;if(G.stoneBuffTimer<=0){G.stoneBuffPct=0;G.stoneBuffTimer=0;}}

  // Tick Linh Thực buffs
  if (Array.isArray(G.linhThuc?.activeBuffs)) {
    G.linhThuc.activeBuffs = G.linhThuc.activeBuffs
      .map(b => ({ ...b, timer: b.timer - dtSec }))
      .filter(b => b.timer > 0);
    for (const b of G.linhThuc.activeBuffs) {
      if (b.type === 'hp_regen') G.hp = Math.min(G.maxHp || G.hp, (G.hp||0) + b.value * dtSec);
    }
  }

  // Tick Trận Pháp — active arrays (trừ timer), passive (trừ stone/phút)
  if (Array.isArray(G.tranPhap?.activeArrays)) {
    // Tick timers cho active/defense arrays
    G.tranPhap.activeArrays = G.tranPhap.activeArrays
      .map(a => a.timer !== undefined ? { ...a, timer: a.timer - dtSec } : a)
      .filter(a => a.timer === undefined || a.timer > 0);

    // Trừ stone cho passive arrays (mỗi phút game = 2s thực)
    G.tranPhap.stoneDrainTimer = (G.tranPhap.stoneDrainTimer || 0) + dtSec;
    if (G.tranPhap.stoneDrainTimer >= 60) { // 60 giây game = 1 phút
      G.tranPhap.stoneDrainTimer -= 60;
      const passiveArrays = G.tranPhap.activeArrays.filter(a => a.category === 'passive');
      for (const arr of passiveArrays) {
        const cost = arr.stoneCostPerMin || 0;
        if ((G.stone || 0) >= cost) {
          G.stone -= cost;
        } else {
          // Không đủ stone → tắt trận
          G.tranPhap.activeArrays = G.tranPhap.activeArrays.filter(a => a.id !== arr.id);
        }
      }
    }

    // hp_regen từ trận passive
    for (const arr of G.tranPhap.activeArrays) {
      for (const ef of (arr.effects || [])) {
        if (ef.type === 'hp_regen') G.hp = Math.min(G.maxHp || G.hp, (G.hp||0) + ef.value * dtSec);
      }
    }
  }

  // Tick Phù Chú timed buffs
  if (Array.isArray(G.phuChu?.activeBuffs)) {
    G.phuChu.activeBuffs = G.phuChu.activeBuffs
      .map(b => ({ ...b, timer: b.timer - dtSec }))
      .filter(b => b.timer > 0);
    for (const b of G.phuChu.activeBuffs) {
      if (b.type === 'hp_regen') G.hp = Math.min(G.maxHp || G.hp, (G.hp||0) + b.value * dtSec);
    }
  }
}