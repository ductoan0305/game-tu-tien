// ============================================================
// core/systems/tick.js
// gameTick, checkAchievements, learnSkill, canPrestige, doPrestige
// ============================================================
import { REALMS, SKILLS, ACHIEVEMENTS } from '../data.js';
import { calcQiRate, calcMaxQi, calcPurityRate, calcMaxHp, calcThuanDoCeiling } from '../state/computed.js';
import { calcMasteryGainPerTick } from '../phap-dia.js';
import { fmtNum, bus }                   from '../../utils/helpers.js';
import { tickTime }                      from '../time-engine.js';
import { checkPhapDiaExpiry,
         checkLinhDiaFee }              from '../phap-dia.js';
import { tickAlchemyBuffs }              from '../../alchemy/alchemy-engine.js';
import { tickHunger, tickDuocDien, tickAmThuong, getHungerQiModifier } from '../duoc-dien-engine.js';
import { tickNghiepLuc, getNghiepLucPenalty } from '../kiep-tu-engine.js';
import { tickLinhThu }                   from '../linh-thu-engine.js';
import { tickThuongHoiBuffs }            from '../thuong-hoi-engine.js';

export function gameTick(G, dt = 0.1) {
  const YEARS_PER_TICK = 3 / 525600;
  const dtYears = YEARS_PER_TICK * dt * 10;

  const rate  = calcQiRate(G);
  const maxQ  = calcMaxQi(G);
  const maxH  = calcMaxHp(G);

  const hungerMod  = getHungerQiModifier(G);
  const nghiepMod  = 1 - (getNghiepLucPenalty(G).qiPenalty ?? 0);

  if (G.meditating) {
    // R1 — Resource Gate: tiêu hao linh thạch khi bế quan
    // stoneCostPerYear = 2 (2 linh thạch/năm game — tán tu không tông môn)
    const stoneCostPerYear = 2;
    const stoneCostPerTick = stoneCostPerYear * YEARS_PER_TICK * dt * 10;
    G.stone = Math.max(0, (G.stone ?? 0) - stoneCostPerTick);
    G.stoneStarved = (G.stone <= 0);

    const stoneMod = G.stone > 50 ? 1.0
                   : G.stone > 10 ? 0.3
                   : 0.05;

    const effRate = rate * hungerMod * nghiepMod * stoneMod;
    if ((G.qi ?? 0) < maxQ) {
      G.qi = Math.min(G.qi + effRate * dt, maxQ);
    } else {
      const pRate = calcPurityRate(G) * hungerMod * nghiepMod * stoneMod;
      // R5: Ceiling override khi dùng đan dược tăng purity (bỏ qua trần công pháp tạm thời)
      const thuanDoCeiling = G._purityCeilingOverride ? Infinity : calcThuanDoCeiling(G);
      if ((G.purity ?? 0) < thuanDoCeiling) {
        G.purity = (G.purity ?? 0) + pRate * dt * 10;
        if (!G._purityCeilingOverride) G.purity = Math.min(G.purity, thuanDoCeiling);
      }
    }
  }

  // R5: Purity decay khi không tu luyện — linh lực để lâu bị tạp chất xâm nhập
  // 0.001/tick × 10 × dt → ~0.01/s realtime; 1 năm game ≈ 17,520s → mất ~175 units/năm
  if (!G.meditating && (G.purity ?? 0) > 0) {
    const purityDecayRate = 0.001;
    G.purity = Math.max(0, G.purity - purityDecayRate * dt * 10);
  }

  // R5: Ceiling override timer — tự hết sau X giây real
  if ((G._purityCeilingOverrideTimer ?? 0) > 0) {
    G._purityCeilingOverrideTimer = Math.max(0, G._purityCeilingOverrideTimer - dt);
    if (G._purityCeilingOverrideTimer <= 0) G._purityCeilingOverride = false;
  }

  if ((G.danDoc ?? 0) > 0) G.danDoc = Math.max(0, G.danDoc - dtYears / 5);
  G.totalTime += dt;

  const isStarving = G.hunger?.isStarving ?? false;
  if (!isStarving && G.hp < maxH) G.hp = Math.min(G.hp + 0.03 * dt * 10, maxH);

  if (!G.meditating && G.stamina < G.maxStamina)
    G.stamina = Math.min(G.stamina + 0.08 * dt * 10, G.maxStamina);
  if (G.meditating) {
    G.stamina = Math.max(0, G.stamina - 0.008 * dt * 10);
    bus.emit('tick:meditate', { dt });
    // Tăng thuần thục công pháp đang tu — rất chậm, phụ thuộc ngộ tính
    if (G.congPhap?.activeIds && G.congPhap?.mastery) {
      for (const cpId of G.congPhap.activeIds) {
        const current = G.congPhap.mastery[cpId] ?? 0;
        if (current < 100) {
          const gain = calcMasteryGainPerTick(G, cpId) * dt;
          G.congPhap.mastery[cpId] = Math.min(100, current + gain);
        }
      }
    }
  }

  if (G.eventRateTimer > 0) { G.eventRateTimer = Math.max(0, G.eventRateTimer - dt); if (G.eventRateTimer === 0) G.eventRateBonus = 0; }
  if (G.eventExpTimer  > 0) { G.eventExpTimer  = Math.max(0, G.eventExpTimer  - dt); if (G.eventExpTimer  === 0) G.eventExpBonus  = 0; }

  tickAlchemyBuffs(G, dt);
  tickDuocDien(G);
  tickHunger(G, dtYears);
  tickAmThuong(G, dtYears);
  tickNghiepLuc(G, dtYears);
  tickLinhThu(G, dtYears);
  tickThuongHoiBuffs(G);

  const timeResult = tickTime(G, dt);
  if (timeResult?.gameOver) bus.emit('game:over', { chronicle: G.chronicle });

  checkPhapDiaExpiry(G);
  checkLinhDiaFee(G);
}

export function checkAchievements(G) {
  const newOnes = [];
  ACHIEVEMENTS.forEach(a => {
    if (!G.achievements[a.id] && a.check(G)) {
      G.achievements[a.id] = true;
      newOnes.push(a);
    }
  });
  return newOnes;
}

export function learnSkill(G, skillId) {
  const sk = SKILLS.find(s => s.id === skillId);
  if (!sk) return { ok:false, msg:'Kỹ năng không tồn tại', type:'danger' };
  if (G.realmIdx < sk.unlockRealm) return { ok:false, msg:`Cần ${REALMS[sk.unlockRealm].name}`, type:'danger' };
  const lv   = G.skills[skillId] || 0;
  if (lv >= sk.maxLv) return { ok:false, msg:'Đã đạt cấp tối đa!', type:'danger' };
  const cost = Math.floor(sk.costBase * Math.pow(sk.costScale, lv));
  if (G.stone < cost) return { ok:false, msg:`💎 Cần ${fmtNum(cost)} linh thạch!`, type:'danger' };
  G.stone -= cost;
  G.skills[skillId] = lv + 1;
  G[sk.stat] = (G[sk.stat] || 0) + sk.perLv;
  G.skillsLearned++;
  bus.emit('quest:update', { type:'learn_skill', qty:1 });
  return { ok:true, msg:`✦ ${sk.name} lên Lv${lv+1}`, type:'spirit' };
}

export function canPrestige(G) { return G.realmIdx >= 7; }

export function doPrestige(G) {
  if (!canPrestige(G)) return { ok:false, msg:'Chưa đủ điều kiện Luân Hồi!' };
  const count  = G.prestige.count + 1;
  const bonus  = {
    ratePct:  Math.min(count * 10, 100),
    atkPct:   Math.min(count * 5,  50),
    stonePct: Math.min(count * 8,  80),
  };
  const fresh = {
    ..._freshMini(),
    prestige: { count, totalAscensions:(G.prestige.totalAscensions||0)+1, bonuses:bonus },
    name: G.name, spiritRoot:G.spiritRoot, sectId:G.sectId,
    setupDone: true, achievements: G.achievements,
  };
  Object.assign(G, fresh);
  return { ok:true, msg:`🔄 Luân Hồi lần ${count}! Nhận bonus vĩnh viễn.`, bonuses:bonus };
}

function _freshMini() {
  return {
    realmIdx:0, stage:1, qi:0, stone:100,
    hp:100, maxHp:100, atk:10, def:5,
    stamina:100, maxStamina:100, exp:0, maxExp:200,
    qiBonus:0, stoneBonus:0, hpBonus:0, defBonus:0,
    spdBonus:0, atkPct:0, defPct:0, hpPct:0,
    ratePct:0, danBonus:0, arrayBonus:0, expBonus:0,
    atkBuff:0, atkBuffTimer:0, eventRateBonus:0,
    eventRateTimer:0, eventExpBonus:0, eventExpTimer:0,
    meditating:false, skills:{},
    inventory: new Array(24).fill(null),
    combat:{ active:false, enemy:null, playerHp:0, playerMaxHp:0, playerMp:100, playerMaxMp:100, turn:0, phase:'idle', log:[], selectedSkill:null, comboCount:0 },
    quests:{ active:[], completed:[], daily:[], lastDailyReset:0 },
    alchemy:{ knownRecipes:['basic_qi_pill'], ingredients:{}, furnaceLevel:0, totalCrafted:0, successStreak:0 },
    breakthroughs:0, hunts:0, alchemySuccess:0, skillsLearned:0,
    totalTime:0, totalKills:0, totalQuestsCompleted:0,
    lastSave:Date.now(), activeTab:'cultivate',
  };
}