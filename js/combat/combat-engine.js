// ============================================================
// combat/combat-engine.js — Turn-based combat logic
// Không có DOM manipulation — chỉ mutate G.combat + trả về result
// UI sẽ đọc G.combat và render
// ============================================================
import { ENEMIES, ENEMY_SKILLS, COMBAT_SKILLS } from './combat-data.js';
import { DUNGEON_ENEMY_SKILLS } from '../dungeon/dungeon-data.js';
import { calcAtk, calcDef, calcMaxHp, calcSpeed } from '../core/state.js';
import { calcElementMult, getPlayerElement } from './combat-data.js';
import { randInt, randFloat } from '../utils/helpers.js';
import { bus } from '../utils/helpers.js';
import { rollCoDuyen } from '../core/co-duyen.js';
import { rollEquipmentDrop } from '../equipment/equipment-engine.js';
import { accumulateAmThuong } from '../core/duoc-dien-engine.js';

// ---- Helpers ----

function getEnemy(enemyId) {
  return ENEMIES.find(e => e.id === enemyId) || null;
}

function scaledEnemyStat(base, scale, realmIdx) {
  return Math.floor(base * Math.pow(scale, realmIdx));
}

function buildEnemyInstance(enemyDef, realmIdx) {
  const lvScale = Math.max(0, realmIdx - enemyDef.minRealm);
  return {
    ...enemyDef,
    currentHp: scaledEnemyStat(enemyDef.hpBase, enemyDef.hpScale, lvScale),
    maxHp:     scaledEnemyStat(enemyDef.hpBase, enemyDef.hpScale, lvScale),
    atk:       scaledEnemyStat(enemyDef.atkBase, enemyDef.atkScale, lvScale),
    def:       scaledEnemyStat(enemyDef.defBase, 1.2, lvScale),
    spd:       enemyDef.spdBase + lvScale * 3,
    buffs: [],
    debuffs: [],
    skillCooldowns: {},
  };
}

function calcDamage(atk, def, mult = 1.0, variance = 0.15) {
  const base = Math.max(1, atk - def * 0.5);
  const varied = base * (1 + randFloat(-variance, variance));
  return Math.max(1, Math.floor(varied * mult));
}

function addLog(G, text, type = 'system') {
  G.combat.log.push({ text, type });
  // Giữ tối đa 50 dòng log
  if (G.combat.log.length > 50) G.combat.log.shift();
}

// ---- Public API ----

/**
 * Bắt đầu combat với enemy
 * @param {object} G - game state
 * @param {string} enemyId - enemy id từ ENEMIES
 * @param {object} options - { forced: bool, isTianJie: bool, wave: number }
 * @returns {{ ok: bool, enemy?, msg? }}
 */
export function startCombat(G, enemyId, options = {}) {
  if (G.combat.active) {
    return { ok: false, msg: 'Đang trong chiến đấu!' };
  }
  if (G.meditating) {
    G.meditating = false; // Tự động xuất quan khi vào chiến đấu
  }

  // Support pre-built dungeon enemy injected via G._dungeonPendingEnemy
  let enemy;
  if (enemyId === '__dungeon__' && G._dungeonPendingEnemy) {
    enemy = G._dungeonPendingEnemy;
    G._dungeonPendingEnemy = null;
  } else {
    const enemyDef = getEnemy(enemyId);
    if (!enemyDef) return { ok: false, msg: `Không tìm thấy enemy: ${enemyId}` };
    enemy = buildEnemyInstance(enemyDef, G.realmIdx);
  }
  const playerMaxHp = calcMaxHp(G);

  G.combat = {
    active: true,
    enemy,
    playerHp: Math.min(G.hp, playerMaxHp),
    playerMaxHp,
    playerHpBefore: Math.min(G.hp, playerMaxHp), // ← lưu HP đầu trận cho Ám Thương
    playerMp: G.combat.playerMp || 100,
    playerMaxMp: 100,
    turn: 1,
    phase: 'player',
    log: [],
    selectedSkill: null,
    comboCount: 0,
    lastSkillUsed: null,
    dodgeNextHit: false,
    playerDebuffs: [],
    isTianJie: options.isTianJie || false,
    tianJieWave: options.wave || 0,
    tianJieTotalWaves: G.combat.tianJieTotalWaves || 3,
    tianJieBoss: null,
  };

  addLog(G, `⚔ ${enemy.name} xuất hiện! HP: ${enemy.currentHp}`, 'system');
  addLog(G, `Tu sĩ của ngươi: HP ${G.combat.playerHp}/${playerMaxHp}`, 'system');

  bus.emit('combat:start', { enemy });
  return { ok: true, enemy };
}

/**
 * Người chơi thực hiện hành động
 * @param {object} G
 * @param {string} actionType - 'attack'|'skill'|'item'|'flee'
 * @param {object} data - { skillId?, itemSlot? }
 * @returns {CombatResult}
 */
export function playerAction(G, actionType, data = {}) {
  if (!G.combat.active) return { ok: false, msg: 'Không trong combat' };
  if (G.combat.phase !== 'player') return { ok: false, msg: 'Không phải lượt của bạn' };

  let result = { ok: true, playerDmg: 0, enemyDmg: 0, effects: [], msgs: [], ended: false };

  // --- Xử lý hành động của người chơi ---
  if (actionType === 'attack' || actionType === 'skill') {
    const skillId = data.skillId || 'basic_strike';
    const skillDef = COMBAT_SKILLS.find(s => s.id === skillId);
    if (!skillDef) return { ok: false, msg: 'Skill không tồn tại' };

    // Kiểm tra MP
    if (skillDef.mpCost > G.combat.playerMp) {
      return { ok: false, msg: `Cần ${skillDef.mpCost} MP!` };
    }

    G.combat.playerMp -= skillDef.mpCost;

    // Tính damage
    const playerAtk = calcAtk(G);
    const enemyDef = G.combat.enemy.def;
    let dmg = calcDamage(playerAtk, enemyDef, skillDef.dmgMult);

    // Tương khắc ngũ hành
    const playerEl = getPlayerElement(G);
    const enemyEl  = G.combat.enemy.element || null;
    const elemMult = calcElementMult(playerEl, enemyEl);
    if (elemMult !== 1.0) {
      dmg = Math.floor(dmg * elemMult);
      if (elemMult > 1.0) result.msgs.push(`✦ Ngũ hành tương khắc! ×${elemMult}`);
      else result.msgs.push(`▼ Ngũ hành bị khắc… ×${elemMult}`);
    }

    // Combo bonus
    if (skillDef.combo && G.combat.lastSkillUsed === skillDef.combo.after) {
      G.combat.comboCount++;
      if (skillDef.combo.bonus === 'extra_hit') {
        dmg = Math.floor(dmg * 1.3);
        result.msgs.push('💥 COMBO! Đòn thêm!');
      } else if (skillDef.combo.bonus === 'def_break') {
        G.combat.enemy.def = Math.floor(G.combat.enemy.def * 0.7);
        result.msgs.push('🔓 Phòng thủ địch bị phá vỡ!');
      } else if (skillDef.combo.bonus === 'instant_counter') {
        dmg = Math.floor(dmg * 1.5);
        result.msgs.push('⚡ Phản đòn tức thì!');
      } else if (skillDef.combo.bonus === 'combo_finish') {
        dmg = Math.floor(dmg * 2.0);
        result.msgs.push('🌟 COMBO KẾT THÚC — Sức mạnh gấp đôi!');
      }
    }

    // Áp dụng effect của skill
    if (skillDef.effect) {
      applyPlayerSkillEffect(G, skillDef.effect, result);
    }

    G.combat.enemy.currentHp -= dmg;
    result.playerDmg = dmg;
    result.msgs.push(`${skillDef.emoji} ${skillDef.name}: -${dmg} HP địch`);
    G.combat.lastSkillUsed = skillId;

    addLog(G, `🗡 ${skillDef.name} → ${G.combat.enemy.name} mất ${dmg} HP`, 'player');

    // --- Khôi Lỗi tấn công cùng lượt player ---
    const puppetResult = processPuppetAttack(G);
    if (puppetResult) {
      result.msgs.push(...puppetResult.msgs);
      if (puppetResult.healOwner > 0) {
        G.combat.playerHp = Math.min(G.combat.playerMaxHp || G.maxHp, G.combat.playerHp + puppetResult.healOwner);
      }
    }
  }

  // --- Kiểm tra enemy chết ---
  if (G.combat.enemy.currentHp <= 0) {
    G.combat.enemy.currentHp = 0;
    result.ended = true;
    result.victory = true;
    return endCombat(G, result, true);
  }

  // --- Lượt của enemy ---
  G.combat.phase = 'enemy';
  const enemyResult = processEnemyTurn(G);
  result.enemyDmg = enemyResult.dmg;
  result.msgs.push(...enemyResult.msgs);

  // --- Kiểm tra người chơi chết ---
  if (G.combat.playerHp <= 0) {
    G.combat.playerHp = 0;
    result.ended = true;
    result.victory = false;
    return endCombat(G, result, false);
  }

  // MP regen mỗi lượt
  G.combat.playerMp = Math.min(G.combat.playerMaxMp, G.combat.playerMp + 10);
  G.combat.turn++;
  G.combat.phase = 'player';

  return result;
}

/**
 * Xử lý debuffs mỗi lượt: burn, stun, freeze
 * @param {object} combatant - G.combat (player) hoặc enemy object
 * @param {string[]} msgs - mảng message để push vào
 * @param {string} label - "địch" hoặc "ngươi"
 * @param {boolean} isPlayer - true nếu xử lý debuff của player (dùng playerDebuffs)
 */
function tickDebuffs(combatant, msgs, label = 'mục tiêu', isPlayer = false) {
  const debuffs = isPlayer ? (combatant.playerDebuffs || []) : (combatant.debuffs || []);
  const remaining = [];
  for (const d of debuffs) {
    if (d.type === 'burn') {
      const burnDmg = d.dmgPerTurn || 0;
      if (isPlayer) {
        combatant.playerHp = Math.max(0, combatant.playerHp - burnDmg);
      } else {
        combatant.currentHp = Math.max(0, combatant.currentHp - burnDmg);
      }
      msgs.push(`🔥 Bỏng (${label}): -${burnDmg} HP`);
    }
    if (d.type === 'freeze') {
      msgs.push(`❄ Đóng băng (${label}): tốc độ giảm`);
    }
    // stun chỉ thông báo — logic skip turn ở caller
    d.turns--;
    if (d.turns > 0) remaining.push(d);
  }
  if (isPlayer) {
    combatant.playerDebuffs = remaining;
  } else {
    combatant.debuffs = remaining;
  }
}

// ---- Khôi Lỗi tấn công ----
function processPuppetAttack(G) {
  const active = G.khoiLoi?.activePuppet;
  if (!active) return null;

  // Lấy định nghĩa puppet từ state (stats đã lưu khi triệu hồi)
  const puppetDef = active.def;
  if (!puppetDef) return null;

  // Tính bonusPct từ rank Khôi Lỗi Sư
  const craftCount = G.khoiLoi.craftCount || 0;
  const RANKS = [0, 5, 20, 50, 100, 200];
  const BONUSES = [0, 8, 18, 32, 50, 70];
  let rankIdx = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (craftCount >= RANKS[i]) { rankIdx = i; break; }
  }
  const bonusPct = BONUSES[rankIdx] || 0;
  const mult = 1 + bonusPct / 100;

  const puppetAtk = Math.round((puppetDef.atk || 0) * mult);
  const puppetDef_ = Math.round((puppetDef.def || 0) * mult);
  const puppetHpMax = Math.round((puppetDef.hp || 0) * mult);
  const enemyDef = G.combat.enemy.def || 0;
  const msgs = [];
  let healOwner = 0;

  // Khởi tạo HP khối lỗi trong combat nếu chưa có
  if (active.combatHp === undefined || active.combatHp === null) {
    active.combatHp = puppetHpMax;
  }

  // Tấn công cơ bản
  const turn = G.combat.turn || 0;
  let puppetDmg = Math.max(1, Math.floor(puppetAtk - enemyDef * 0.4));
  const special = puppetDef.special;

  // Xử lý special abilities
  if (special) {
    switch (special.type) {
      case 'double_attack':
        puppetDmg = puppetDmg * 2;
        msgs.push(`🤖 Khôi Lỗi Song Kích: -${puppetDmg} HP địch!`);
        break;
      case 'double_hit_chance':
        if (Math.random() * 100 < (special.value || 30)) {
          puppetDmg = puppetDmg * 2;
          msgs.push(`🤖 Khôi Lỗi Song Kích (may mắn): -${puppetDmg} HP địch!`);
        } else {
          msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        }
        break;
      case 'armor_break':
        G.combat.enemy.def = Math.max(0, Math.floor(G.combat.enemy.def * (1 - (special.value || 15) / 100)));
        msgs.push(`🤖 Khôi Lỗi phá giáp! DEF địch -${special.value}%`);
        msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        break;
      case 'aoe':
        if (turn > 0 && turn % (special.interval || 3) === 0) {
          const aoeDmg = special.value || 100;
          puppetDmg += aoeDmg;
          msgs.push(`🤖 Khôi Lỗi Sét Diện Rộng: -${aoeDmg} HP thêm!`);
        } else {
          msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        }
        break;
      case 'heal_owner':
        if (turn > 0 && turn % (special.interval || 3) === 0) {
          healOwner = special.value || 0;
          msgs.push(`🤖 Khôi Lỗi hồi phục chủ nhân: +${healOwner} HP`);
        } else {
          msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        }
        break;
      case 'regen':
        active.combatHp = Math.min(puppetHpMax, active.combatHp + (special.value || 10));
        msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        break;
      case 'stun':
        if (Math.random() * 100 < (special.value || 30)) {
          if (!G.combat.enemy.debuffs) G.combat.enemy.debuffs = [];
          G.combat.enemy.debuffs.push({ type: 'stun', turns: 1 });
          msgs.push(`🤖 Khôi Lỗi choáng địch 1 lượt!`);
        } else {
          msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        }
        break;
      case 'taunt':
        // Hút sát thương — giảm 25% dmg địch khi vào lượt địch
        if (!G.combat._puppetTaunt) G.combat._puppetTaunt = true;
        msgs.push(`🤖 Khôi Lỗi kéo sự chú ý, bảo vệ chủ nhân!`);
        msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        break;
      case 'reflect': {
        // Phản % sát thương — được xử lý khi enemy đánh
        const reflectPct = special.value || 20;
        G.combat._puppetReflect = reflectPct;
        msgs.push(`🤖 Khôi Lỗi kích hoạt khiên phản chiếu ${reflectPct}%`);
        msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        break;
      }
      case 'immune_once':
        // Miễn nhiễm 1 đòn/lượt — đánh dấu flag
        G.combat._puppetImmuneThisTurn = true;
        msgs.push(`🤖 Khôi Lỗi kích hoạt khiên miễn nhiễm!`);
        msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        break;
      case 'revive':
        // Hồi sinh khi HP thấp — check khi nhận dmg
        if (!G.combat._puppetRevived) G.combat._puppetRevived = false;
        msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        break;
      case 'burn': {
        const burnDmg = special.value || 20;
        if (!G.combat.enemy.debuffs) G.combat.enemy.debuffs = [];
        const existingBurn = G.combat.enemy.debuffs.find(d => d.type === 'burn');
        if (!existingBurn) G.combat.enemy.debuffs.push({ type: 'burn', value: burnDmg, turns: 3 });
        msgs.push(`🤖 Khôi Lỗi châm lửa! Địch chịu ${burnDmg} lửa/lượt`);
        msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        break;
      }
      case 'dragon_claw':
        if (turn > 0 && turn % (special.interval || 4) === 0) {
          const clawDmg = special.value || 400;
          puppetDmg += clawDmg;
          msgs.push(`🤖 LONG TRẢO! +${clawDmg} sát thương!`);
        } else {
          msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        }
        break;
      case 'chaos_burst':
        if (turn > 0 && turn % (special.interval || 5) === 0) {
          const burstDmg = special.value || 600;
          puppetDmg += burstDmg;
          msgs.push(`🤖 HỖN ĐỘN LÔI! +${burstDmg} sát thương!`);
        } else {
          msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
        }
        break;
      case 'twin_strike':
        puppetDmg = Math.floor(puppetDmg * 0.75) * 2; // 2 cú 75% mỗi cú
        msgs.push(`🤖 Song Tinh Liên Hoàn: ×2 cú tấn công -${puppetDmg} HP địch!`);
        break;
    }
  } else {
    msgs.push(`🤖 Khôi Lỗi tấn công: -${puppetDmg} HP địch`);
  }

  G.combat.enemy.currentHp = Math.max(0, G.combat.enemy.currentHp - puppetDmg);
  addLog(G, `🤖 Khôi Lỗi → ${G.combat.enemy.name} mất ${puppetDmg} HP`, 'player');

  // Revive check — phoenix puppet hồi sinh khi HP thấp
  if (special?.type === 'revive' && !G.combat._puppetRevived) {
    const threshold = (special.threshold || 20) / 100;
    if (active.combatHp <= puppetHpMax * threshold && active.combatHp > 0) {
      const healAmount = Math.floor(puppetHpMax * (special.healPct || 50) / 100);
      active.combatHp = Math.min(puppetHpMax, active.combatHp + healAmount);
      G.combat._puppetRevived = true;
      msgs.push(`🔥 Hỏa Phượng TÁI SINH! +${healAmount} HP!`);
    }
  }

  return { msgs, healOwner };
}

function processEnemyTurn(G) {
  const enemy = G.combat.enemy;
  const result = { dmg: 0, msgs: [] };

  // Tick debuffs của enemy trước lượt
  const enemyStunned = enemy.debuffs.some(d => d.type === 'stun');
  tickDebuffs(enemy, result.msgs, 'địch');
  if (enemy.currentHp <= 0) {
    // Burn đã giết địch
    return result;
  }
  if (enemyStunned) {
    addLog(G, '💫 Địch bị choáng, bỏ lượt!', 'system');
    return result;
  }

  // Tick debuffs của player
  tickDebuffs(G.combat, result.msgs, 'ngươi', true);

  // Chọn skill của enemy
  const availableSkills = enemy.skills.filter(skId => {
    const cd = enemy.skillCooldowns[skId] || 0;
    return cd <= 0;
  });

  let chosenSkillId = null;
  let skillDef = null;

  // Thử dùng skill đặc biệt theo xác suất
  for (const skId of availableSkills) {
    const sk = ENEMY_SKILLS[skId] || DUNGEON_ENEMY_SKILLS[skId];
    if (sk && Math.random() < sk.chance) {
      chosenSkillId = skId;
      skillDef = sk;
      break;
    }
  }

  // Fallback: tấn công thường
  if (!skillDef) {
    const dmg = calcDamage(enemy.atk, calcDef(G), 1.0);
    if (G.combat.dodgeNextHit) {
      G.combat.dodgeNextHit = false;
      result.msgs.push(`💨 Ngươi né tránh đòn tấn công!`);
      addLog(G, `💨 Né đòn thường của ${enemy.name}`, 'player');
    } else {
      // Puppet taunt: giảm 25% dmg về player, phần còn lại đánh vào puppet
      if (G.combat._puppetTaunt && G.khoiLoi?.activePuppet?.combatHp > 0) {
        const tauntAbsorb = Math.floor(dmg * 0.25);
        const playerDmg   = dmg - tauntAbsorb;
        G.khoiLoi.activePuppet.combatHp = Math.max(0, G.khoiLoi.activePuppet.combatHp - tauntAbsorb);
        G.combat.playerHp -= playerDmg;
        result.dmg = playerDmg;
        result.msgs.push(`🛡 Khôi Lỗi hút ${tauntAbsorb} sát thương! Ngươi nhận ${playerDmg} HP`);
      } else {
        G.combat.playerHp -= dmg;
        result.dmg = dmg;
        result.msgs.push(`${enemy.emoji} ${enemy.name} tấn công: -${dmg} HP`);
        addLog(G, `💔 ${enemy.name} tấn công, ngươi mất ${dmg} HP`, 'enemy');
      }
      // Puppet reflect: phản % dmg lại địch
      if (G.combat._puppetReflect) {
        const reflectDmg = Math.floor(dmg * G.combat._puppetReflect / 100);
        if (reflectDmg > 0) {
          enemy.currentHp = Math.max(0, enemy.currentHp - reflectDmg);
          result.msgs.push(`🔄 Khôi Lỗi phản chiếu ${reflectDmg} sát thương!`);
        }
      }
      // Reset per-turn flags
      G.combat._puppetImmuneThisTurn = false;
    }
    return result;
  }

  // Áp dụng skill enemy
  enemy.skillCooldowns[chosenSkillId] = chosenSkillId === 'resurrection' ? 999 : 3;

  // Resurrection skill: heal enemy 30% HP (one-time)
  if (chosenSkillId === 'resurrection' && skillDef.dmgMult === 0) {
    const heal = Math.floor(enemy.maxHp * 0.3);
    enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + heal);
    result.msgs.push(`✨ ${enemy.name} HỒI SINH! +${heal} HP!`);
    addLog(G, `✨ ${enemy.name} hồi phục ${heal} HP!`, 'enemy');
    return result;
  }

  if (skillDef.dmgMult > 0) {
    const dmg = calcDamage(enemy.atk, calcDef(G), skillDef.dmgMult);
    if (G.combat.dodgeNextHit && skillDef.dmgMult <= 2) {
      G.combat.dodgeNextHit = false;
      result.msgs.push(`💨 Ngươi né tránh ${skillDef.name}!`);
      addLog(G, `💨 Né ${skillDef.name}`, 'player');
    } else {
      G.combat.playerHp -= dmg;
      result.dmg = dmg;
      result.msgs.push(`${enemy.emoji} ${skillDef.name}: -${dmg} HP`);
      addLog(G, `⚠ ${enemy.name} dùng ${skillDef.name}, ngươi mất ${dmg} HP`, 'enemy');
    }
  }

  // Effect của enemy skill
  if (skillDef.effect) {
    applyEnemySkillEffect(G, skillDef.effect, result);
  }

  // Giảm cooldown
  for (const skId of Object.keys(enemy.skillCooldowns)) {
    if (skId !== chosenSkillId) {
      enemy.skillCooldowns[skId] = Math.max(0, (enemy.skillCooldowns[skId] || 0) - 1);
    }
  }

  return result;
}

function applyPlayerSkillEffect(G, effect, result) {
  switch (effect) {
    case 'pierce_def':
      // Đã xử lý trong damage calc — bỏ qua 30% def
      break;
    case 'burn_3turn':
      G.combat.enemy.debuffs.push({ type: 'burn', turns: 3, dmgPerTurn: Math.floor(calcAtk(G) * 0.2) });
      result.msgs.push('🔥 Địch bị bỏng!');
      addLog(G, '🔥 Địch bị đốt cháy 3 lượt', 'system');
      break;
    case 'dodge_next':
      G.combat.dodgeNextHit = true;
      result.msgs.push('💨 Tốc độ tăng vọt — né đòn tiếp theo!');
      addLog(G, '💨 Sẵn sàng né đòn', 'player');
      break;
    case 'stun_1turn':
      G.combat.enemy.debuffs.push({ type: 'stun', turns: 1 });
      result.msgs.push('💫 Địch bị choáng 1 lượt!');
      addLog(G, '💫 Địch bị choáng!', 'system');
      break;
  }
}

function applyEnemySkillEffect(G, effect, result) {
  // Handle both old string effects and new object effects (dungeon skills)
  if (typeof effect === 'object' && effect !== null) {
    const roll = Math.random();
    if (roll < (effect.chance || 0)) {
      if (!G.combat.playerDebuffs) G.combat.playerDebuffs = [];
      if (effect.type === 'burn') {
        G.combat.playerDebuffs.push({ type: 'burn', turns: effect.turns || 2, dmgPerTurn: effect.dmgPerTurn || 20 });
        result.msgs.push(`🔥 Bị bỏng! Mất ${effect.dmgPerTurn} HP/lượt trong ${effect.turns} lượt!`);
      } else if (effect.type === 'stun') {
        G.combat.playerDebuffs.push({ type: 'stun', turns: effect.turns || 1 });
        result.msgs.push(`💫 Bị choáng ${effect.turns} lượt!`);
      } else if (effect.type === 'freeze') {
        G.combat.playerDebuffs.push({ type: 'freeze', turns: effect.turns || 1 });
        result.msgs.push(`❄ Bị đóng băng ${effect.turns} lượt!`);
      }
    }
    return;
  }
  switch (effect) {
    case 'debuff_def15':
      result.msgs.push('😰 Phòng thủ ngươi giảm 15%!');
      break;
    case 'stun':
      if (!G.combat.playerDebuffs) G.combat.playerDebuffs = [];
      G.combat.playerDebuffs.push({ type: 'stun', turns: 1 });
      result.msgs.push('💫 Ngươi bị choáng!');
      break;
    case 'burn':
      if (!G.combat.playerDebuffs) G.combat.playerDebuffs = [];
      G.combat.playerDebuffs.push({ type: 'burn', turns: 2, dmgPerTurn: Math.floor(G.combat.enemy.atk * 0.15) });
      result.msgs.push('🔥 Ngươi bị bỏng!');
      break;
    case 'freeze':
      result.msgs.push('❄ Ngươi bị đóng băng — tốc độ giảm!');
      break;
    case 'fear':
      result.msgs.push('😱 Yêu hống làm tim ngươi run rẩy!');
      break;
    case 'berserk':
      G.combat.enemy.atk = Math.floor(G.combat.enemy.atk * 1.5);
      G.combat.enemy.def = Math.floor(G.combat.enemy.def * 0.5);
      result.msgs.push('🔴 Địch điên cuồng — công mạnh hơn, thủ yếu đi!');
      addLog(G, '🔴 Địch vào trạng thái bạo nộ!', 'enemy');
      break;
  }
}

function endCombat(G, result, victory) {
  const enemy = G.combat.enemy;
  G.combat.active = false;
  G.combat.phase = 'result';

  // Tính Ám Thương từ HP mất trong trận
  const hpBefore     = G.combat.playerHpBefore ?? G.combat.playerMaxHp;
  const hpAfter      = G.combat.playerHp;
  const wasKnockedOut = hpAfter <= 0;
  accumulateAmThuong(G, hpBefore, Math.max(0, hpAfter), wasKnockedOut);

  if (victory) {
    G.hp = Math.max(1, Math.floor(G.combat.playerHp * 0.9));

    // Tính stone_pct buff từ các nghề phụ
    const ltStonePct = Array.isArray(G.linhThuc?.activeBuffs)
      ? G.linhThuc.activeBuffs.filter(b => b.type === 'stone_pct' && b.timer > 0).reduce((s,b) => s + b.value, 0) : 0;
    const tpStonePct = Array.isArray(G.tranPhap?.activeArrays)
      ? G.tranPhap.activeArrays.flatMap(a => a.effects||[]).filter(e => e.type === 'stone_pct').reduce((s,e) => s + e.value, 0) : 0;
    const bcStonePct = Array.isArray(G.phuChu?.activeBuffs)
      ? G.phuChu.activeBuffs.filter(b => b.type === 'stone_pct' && b.timer > 0).reduce((s,b) => s + b.value, 0) : 0;
    const stoneMult = 1 + (ltStonePct + tpStonePct + bcStonePct + (G.stoneBuffPct || 0)) / 100;

    // Tính exp_pct buff từ các nghề phụ
    const ltExpPct = Array.isArray(G.linhThuc?.activeBuffs)
      ? G.linhThuc.activeBuffs.filter(b => b.type === 'exp_pct' && b.timer > 0).reduce((s,b) => s + b.value, 0) : 0;
    const tpExpPct = Array.isArray(G.tranPhap?.activeArrays)
      ? G.tranPhap.activeArrays.flatMap(a => a.effects||[]).filter(e => e.type === 'exp_pct').reduce((s,e) => s + e.value, 0) : 0;
    const bcExpPct = Array.isArray(G.phuChu?.activeBuffs)
      ? G.phuChu.activeBuffs.filter(b => b.type === 'exp_pct' && b.timer > 0).reduce((s,b) => s + b.value, 0) : 0;
    const expMult = 1 + (G.expBonus || 0) / 100 + (G.eventExpBonus > 0 ? G.eventExpBonus / 100 : 0)
                  + (ltExpPct + tpExpPct + bcExpPct) / 100;

    // Tính rewards
    const expGain   = Math.floor((enemy.expReward + G.realmIdx * 20) * expMult);
    const stoneGain = Math.floor(randInt(...enemy.stoneReward) * stoneMult);
    G.stone += stoneGain;
    G.hunts++;
    G.totalKills++;

    // Exp (đã nhân expMult ở trên)
    G.exp = (G.exp || 0) + expGain;
    while (G.exp >= G.maxExp) {
      G.exp -= G.maxExp;
      G.maxExp = Math.floor(G.maxExp * 1.4);
    }

    // Roll drops (ingredients)
    const drops = [];
    for (const drop of (enemy.drops || [])) {
      if (Math.random() < drop.chance) {
        const qty = randInt(...drop.qty);
        const cur = G.alchemy.ingredients[drop.itemId] || 0;
        G.alchemy.ingredients[drop.itemId] = cur + qty;
        drops.push({ id: drop.itemId, qty });
      }
    }

    // Roll equipment drop
    const eqDrop = rollEquipmentDrop(G, enemy);
    if (eqDrop) {
      result.msgs.push(`⚔ Rơi trang bị: ${eqDrop.emoji} ${eqDrop.name}!`);
      addLog(G, `⚔ Rơi trang bị: ${eqDrop.name}`, 'gold');
    }

    result.victory = true;
    result.rewards = { exp: expGain, stone: stoneGain, drops };
    result.msgs.push(`🏆 Chiến thắng! +${expGain} EXP, +${stoneGain} linh thạch`);
    if (drops.length > 0) {
      result.msgs.push(`📦 Thu được nguyên liệu: ${drops.map(d => `${d.id}x${d.qty}`).join(', ')}`);
    }
    addLog(G, `✅ Chiến thắng! Nhận ${stoneGain} linh thạch`, 'system');

    // Emit event để quest engine theo dõi
    bus.emit('quest:update', { type: 'kill', enemyId: enemy.id, enemyTier: enemy.tier, qty: 1 });
    bus.emit('combat:enemy_killed', { enemyId: enemy.id, enemyTier: enemy.tier });
    bus.emit('combat:end', { victory: true, enemy, rewards: result.rewards });
    rollCoDuyen(G, 'combat');
  } else {
    // Thua — HP về 1, không mất gì khác
    G.hp = Math.max(1, Math.floor(calcMaxHp(G) * 0.1));
    result.victory = false;
    result.msgs.push(`💀 Bại trận! Thoát hiểm, HP còn lại 10%`);
    addLog(G, `💀 Bại trận, rút lui khỏi chiến trường`, 'system');
    bus.emit('combat:end', { victory: false, enemy });
  }

  return result;
}

/**
 * Bỏ chạy khỏi combat
 */
export function flee(G) {
  if (!G.combat.active) return { ok: false, msg: 'Không trong combat' };
  if (G.combat.enemy && G.combat.enemy.canFlee === false) {
    return { ok: false, msg: '⚠ Không thể bỏ chạy khỏi trận này!' };
  }

  // 60% thành công, thất bại bị đánh 1 lần
  if (Math.random() < 0.6) {
    G.hp = Math.max(1, G.combat.playerHp);
    G.combat.active = false;
    G.combat.phase = 'idle';
    return { ok: true, msg: '💨 Thoát thành công!' };
  } else {
    const dmg = calcDamage(G.combat.enemy.atk, calcDef(G), 1.2);
    G.combat.playerHp -= dmg;
    if (G.combat.playerHp <= 0) {
      return endCombat(G, { msgs: [], effects: [] }, false);
    }
    return { ok: true, msg: `💨 Thoát thất bại! Bị thương -${dmg} HP` };
  }
}

/**
 * Bắt đầu Thiên Kiếp — chuỗi boss fights khi đại đột phá
 */
export function startTianJie(G, nextRealmIdx) {
  const waves = 3;
  G.combat.tianJieActive = true;
  G.combat.tianJieTotalWaves = waves;
  G.combat.tianJieWave = 0;

  // Wave 1: Thiên Lôi Thần Long scaled theo realm mới
  return startCombat(G, 'tian_jie_dragon', {
    forced: true,
    isTianJie: true,
    wave: 1,
  });
}

/**
 * Lấy danh sách enemies có thể hunt theo realm hiện tại
 */
export function getAvailableEnemies(realmIdx) {
  return ENEMIES.filter(e => e.minRealm <= realmIdx && !e.isBoss);
}

/**
 * Lấy combat skills đã mở khóa
 */
export function getUnlockedSkills(realmIdx) {
  return COMBAT_SKILLS.filter(s => s.unlockRealm <= realmIdx);
}