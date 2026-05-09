// ============================================================
// quest/quest-engine.js — Quest state machine
// v3 — S-D: NPC-gated quest system
//      - giveQuestFromNPC(G, npcId): NPC giao quest cho player
//      - getNpcPendingQuest(G, npcId): lấy quest NPC muốn giao (chưa giao)
//      - initQuestSystem: KHÔNG auto-accept side quests nữa
//      - getActiveNpcQuests(G): query cho tab Nhiệm Vụ
// ============================================================
import { QUESTS, NPC_QUESTS, NPC_QUEST_MAP,
         DAILY_QUEST_IDS, BOUNTY_QUEST_IDS, SECT_QUEST_IDS } from './quest-data.js';
import { bus } from '../utils/helpers.js';
import { unlockRecipe } from '../alchemy/alchemy-engine.js';
import { gainKienCo } from '../core/systems/helpers-internal.js';
import { gainNpcRep } from '../core/npc-reputation-engine.js';

// ---- Helpers ----

function getQuest(questId) {
  return QUESTS.find(q => q.id === questId);
}

function getNpcQuest(questId) {
  return NPC_QUESTS.find(q => q.id === questId);
}

function findActiveQuest(G, questId) {
  return G.quests.active.find(q => q.questId === questId);
}

function findActiveNpcQuest(G, questId) {
  return (G.quests.npcActive || []).find(q => q.questId === questId);
}

function isCompleted(G, questId) {
  return G.quests.completed.includes(questId);
}

function isAvailable(G, quest) {
  if (!quest) return false;
  if (isCompleted(G, quest.id) && !quest.repeatable) return false;
  if (G.realmIdx < (quest.unlockRealm || 0)) return false;
  if (quest.prereq && !isCompleted(G, quest.prereq)) return false;
  if (quest.requireSect && !G.sectId) return false;
  if (quest.type === 'bounty' && quest.repeatable) {
    const cdKey = `_bountycd_${quest.id}`;
    const cd = G[cdKey] || 0;
    if (Date.now() < cd) return false;
  }
  if (quest.type === 'sect' && quest.repeatable) {
    const cdKey = `_sectqcd_${quest.id}`;
    const cd = G[cdKey] || 0;
    if (Date.now() < cd) return false;
  }
  return true;
}

// ============================================================
// NPC QUEST SYSTEM — S-D core
// ============================================================

/**
 * Lấy quest mà NPC này muốn giao cho player hiện tại.
 * Trả về quest object hoặc null nếu không có.
 * Dùng để hiển thị indicator "!" trên bản đồ.
 */
export function getNpcPendingQuest(G, npcId) {
  const questsForNpc = NPC_QUEST_MAP[npcId] || [];
  for (const q of questsForNpc) {
    // Đã hoàn thành rồi → bỏ qua
    if (isCompleted(G, q.id)) continue;
    // Đang active rồi → bỏ qua (đã giao rồi)
    if (findActiveNpcQuest(G, q.id)) continue;
    // Kiểm tra điều kiện giao
    if (typeof q.giveCondition === 'function' && !q.giveCondition(G)) continue;
    // Quest này NPC muốn giao
    return q;
  }
  return null;
}

/**
 * NPC giao quest cho player.
 * Gọi khi player bấm "Nhận Nhiệm Vụ" trong NPC dialog.
 * Trả về { ok, msg, quest }
 */
export function giveQuestFromNPC(G, npcId) {
  const quest = getNpcPendingQuest(G, npcId);
  if (!quest) {
    return { ok: false, msg: 'Hiện ta không có việc gì nhờ ngươi.' };
  }

  // Đảm bảo npcActive tồn tại
  if (!G.quests.npcActive) G.quests.npcActive = [];

  const progress = {};
  for (const obj of quest.objectives) {
    progress[obj.key] = 0;
  }

  G.quests.npcActive.push({
    questId: quest.id,
    npcId,
    progress,
    acceptedAt: G.gameTime?.currentYear || 0,
  });

  bus.emit('quest:update', { type: 'npc_quest_accepted', questId: quest.id });
  return { ok: true, msg: `📜 Nhận nhiệm vụ: ${quest.name}`, quest };
}

/**
 * Lấy danh sách NPC quest đang active (hiển thị trong tab Nhiệm Vụ).
 */
export function getActiveNpcQuests(G) {
  if (!G.quests.npcActive) return [];
  return G.quests.npcActive.map(entry => ({
    ...entry,
    quest: getNpcQuest(entry.questId),
  })).filter(e => e.quest);
}

/**
 * Cập nhật progress của NPC quests khi có event.
 * Tương tự updateQuests nhưng cho npcActive list.
 */
function updateNpcQuests(G, eventType, data = {}) {
  if (!G.quests.npcActive) return false;
  let anyUpdated = false;

  for (const entry of G.quests.npcActive) {
    const quest = getNpcQuest(entry.questId);
    if (!quest || entry.completed) continue;

    for (const obj of quest.objectives) {
      if (obj.key !== eventType) continue;

      if (obj.key === 'kill_specific') {
        const targetMatch = data.target === obj.target || data.enemyId === obj.target;
        if (!targetMatch) continue;
      }
      if (obj.key === 'kill_tier') {
        if (!data.enemyTier || data.enemyTier < (obj.minTier || 0)) continue;
      }
      if (obj.key === 'gather_specific') {
        if (data.itemId !== obj.target) continue;
      }
      if (obj.key === 'reach_realm') {
        if (data.realmIdx === undefined || data.realmIdx < obj.target) continue;
      }

      const prev = entry.progress[obj.key] || 0;
      entry.progress[obj.key] = prev + (data.qty || 1);
      anyUpdated = true;
    }
  }

  if (anyUpdated) checkNpcQuestCompletions(G);
  return anyUpdated;
}

function checkNpcQuestCompletions(G) {
  if (!G.quests.npcActive) return;

  const toComplete = G.quests.npcActive.filter(e => {
    if (e.completed) return false;
    const quest = getNpcQuest(e.questId);
    if (!quest) return false;
    return quest.objectives.every(obj => (e.progress[obj.key] || 0) >= obj.required);
  });

  for (const entry of toComplete) {
    const quest = getNpcQuest(entry.questId);
    entry.completed = true;
    completeNpcQuest(G, entry.questId);
    bus.emit('quest:completed', { questId: entry.questId, quest, isNpcQuest: true });
  }
}

function completeNpcQuest(G, questId) {
  const quest = getNpcQuest(questId);
  if (!quest) return;

  // Xóa khỏi npcActive
  G.quests.npcActive = G.quests.npcActive.filter(e => e.questId !== questId);

  // Mark completed
  if (!G.quests.completed.includes(questId)) {
    G.quests.completed.push(questId);
    G.totalQuestsCompleted = (G.totalQuestsCompleted || 0) + 1;
  }

  // Apply rewards
  const rewards = quest.rewards || {};
  if (rewards.stone)   G.stone = (G.stone || 0) + rewards.stone;
  if (rewards.exp) {
    G.exp = (G.exp || 0) + rewards.exp;
    while (G.exp >= G.maxExp) {
      G.exp -= G.maxExp;
      G.maxExp = Math.floor(G.maxExp * 1.4);
    }
  }
  if (rewards.recipe) unlockRecipe(G, rewards.recipe);

  // Thưởng items (nếu có — reward có lore, không phải mưa linh thạch)
  if (rewards.items && Array.isArray(rewards.items)) {
    if (!G.inventory) G.inventory = {};
    for (const item of rewards.items) {
      G.inventory[item.id] = (G.inventory[item.id] || 0) + (item.qty || 1);
    }
  }

  // R2: Kiên Cố — hoàn thành nhiệm vụ rèn linh lực
  // Quest có combat objective → nguy hiểm hơn → +15, còn lại +5
  const hasCombatObj = quest.objectives.some(obj =>
    obj.key === 'kill_specific' || obj.key === 'kill' || obj.key === 'kill_tier'
  );
  gainKienCo(G, hasCombatObj ? 15 : 5);

  // Danh Vọng nhỏ từ giải quyết nhu cầu NPC
  const dvGain = 5;
  G.danhVong = (G.danhVong ?? 0) + dvGain;
  bus.emit('danhvong:gained', { amount: dvGain, source: quest.name });

  // L6 — H3: Tăng thiện cảm NPC +10 khi hoàn thành quest họ giao
  if (quest.givenBy) {
    gainNpcRep(G, quest.givenBy, 10);
  }

  bus.emit('quest:update', { type: 'npc_quest_complete', questId });
}

// ============================================================
// LEGACY QUEST SYSTEM — giữ nguyên cho daily/bounty/sect/story
// ============================================================

export function checkDailyReset(G) {
  const now = Date.now();
  const lastReset = G.quests.lastDailyReset || 0;
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (now - lastReset < oneDayMs) return false;

  G.quests.lastDailyReset = now;
  G.quests.daily = [];

  for (const qid of DAILY_QUEST_IDS) {
    const quest = getQuest(qid);
    if (quest && G.realmIdx >= (quest.unlockRealm || 0)) {
      G.quests.daily.push({
        questId: qid,
        progress: {},
        completed: false,
        claimed: false,
        resetAt: now + oneDayMs,
      });
    }
  }

  bus.emit('quest:daily_reset', {});
  return true;
}

export function acceptQuest(G, questId) {
  const quest = getQuest(questId);
  if (!quest) return { ok: false, msg: 'Quest không tồn tại' };
  if (!isAvailable(G, quest)) {
    return { ok: false, msg: 'Quest chưa mở hoặc đã hoàn thành' };
  }
  if (findActiveQuest(G, questId)) {
    return { ok: false, msg: 'Quest đang thực hiện rồi' };
  }

  const progress = {};
  for (const obj of quest.objectives) {
    progress[obj.key] = 0;
  }

  if (quest.type === 'daily') {
    return { ok: true, msg: `Đã nhận nhiệm vụ: ${quest.name}` };
  }

  G.quests.active.push({ questId, progress });
  return { ok: true, msg: `📜 Nhận nhiệm vụ: ${quest.name}` };
}

export function updateQuests(G, eventType, data = {}) {
  let anyUpdated = false;

  const updateList = (list) => {
    for (const entry of list) {
      const quest = getQuest(entry.questId);
      if (!quest || entry.completed) continue;

      for (const obj of quest.objectives) {
        if (obj.key !== eventType) continue;

        if (obj.key === 'kill_specific') {
          const targetMatch = data.target === obj.target || data.enemyId === obj.target;
          if (!targetMatch) continue;
        }
        if (obj.key === 'kill_tier') {
          if (!data.enemyTier || data.enemyTier < (obj.minTier || 0)) continue;
        }
        if (obj.key === 'gather_specific') {
          if (data.itemId !== obj.target) continue;
        }
        if (obj.key === 'reach_realm') {
          if (data.realmIdx === undefined || data.realmIdx < obj.target) continue;
        }

        const prev = entry.progress[obj.key] || 0;
        entry.progress[obj.key] = prev + (data.qty || 1);
        anyUpdated = true;
      }
    }
  };

  updateList(G.quests.active);
  updateList(G.quests.daily);

  // Cập nhật NPC quests cùng lúc
  const npcUpdated = updateNpcQuests(G, eventType, data);

  if (anyUpdated || npcUpdated) {
    checkCompletions(G);
    bus.emit('quest:progress', { eventType, data });
  }

  return anyUpdated || npcUpdated;
}

function checkCompletions(G) {
  const toComplete = G.quests.active.filter(e => {
    const quest = getQuest(e.questId);
    if (!quest || e.completed) return false;
    return quest.objectives.every(obj => (e.progress[obj.key] || 0) >= obj.required);
  });

  for (const entry of toComplete) {
    const quest = getQuest(entry.questId);
    entry.completed = true;
    const result = completeQuest(G, entry.questId);
    bus.emit('quest:completed', { questId: entry.questId, quest, rewards: result.rewards });
  }

  for (const entry of G.quests.daily) {
    if (entry.completed) continue;
    const quest = getQuest(entry.questId);
    if (!quest) continue;
    const done = quest.objectives.every(obj => (entry.progress[obj.key] || 0) >= obj.required);
    if (done) {
      entry.completed = true;
      bus.emit('quest:daily_completed', { questId: entry.questId });
    }
  }
}

export function completeQuest(G, questId) {
  const quest = getQuest(questId);
  if (!quest) return { ok: false, msg: 'Quest không tồn tại' };

  G.quests.active = G.quests.active.filter(e => e.questId !== questId);

  if (!quest.repeatable && !G.quests.completed.includes(questId)) {
    G.quests.completed.push(questId);
    G.totalQuestsCompleted = (G.totalQuestsCompleted || 0) + 1;
  }

  if (quest.repeatable && quest.cooldownHours) {
    const prefix = quest.type === 'bounty' ? '_bountycd_' : '_sectqcd_';
    G[prefix + questId] = Date.now() + quest.cooldownHours * 3600 * 1000;
  }

  const rewards = quest.rewards || {};
  if (rewards.stone)   G.stone = (G.stone || 0) + rewards.stone;
  if (rewards.exp) {
    G.exp = (G.exp || 0) + rewards.exp;
    while (G.exp >= G.maxExp) {
      G.exp -= G.maxExp;
      G.maxExp = Math.floor(G.maxExp * 1.4);
    }
  }
  if (rewards.recipe) unlockRecipe(G, rewards.recipe);

  if (rewards.sectExp && G.sectId) {
    if (!G.sect) G.sect = { rank: 0, exp: 0, totalContributions: 0 };
    G.sect.exp = (G.sect.exp || 0) + rewards.sectExp;
    _checkSectRankUp(G);
  }

  // R2: Kiên Cố — bounty quest thường có combat, các loại khác nhẹ hơn
  gainKienCo(G, quest.type === 'bounty' ? 15 : 5);

  if (quest.type === 'bounty' || quest.type === 'sect') {
    const dvGain = quest.type === 'bounty' ? 8 : 5;
    G.danhVong = (G.danhVong ?? 0) + dvGain;
    bus.emit('danhvong:gained', { amount: dvGain, source: quest.name });
  } else if (quest.type === 'story') {
    G.danhVong = (G.danhVong ?? 0) + 15;
    bus.emit('danhvong:gained', { amount: 15, source: quest.name });
  }

  if (rewards.unlockQuest) {
    const nextQuest = getQuest(rewards.unlockQuest);
    if (nextQuest && isAvailable(G, nextQuest)) {
      acceptQuest(G, rewards.unlockQuest);
    }
  }

  bus.emit('quest:update', { type: 'quest_complete', qty: 1 });
  return { ok: true, msg: `✅ Hoàn thành: ${quest.name}!`, rewards };
}

function _checkSectRankUp(G) {
  if (!G.sect) return;
  const RANK_THRESHOLDS = [0, 500, 2000, 5000, 12000, 30000, 80000, 200000];
  const currentRank = G.sect.rank || 0;
  const nextRank = currentRank + 1;
  if (nextRank < RANK_THRESHOLDS.length && (G.sect.exp || 0) >= RANK_THRESHOLDS[nextRank]) {
    G.sect.rank = nextRank;
    bus.emit('sect:rank_up', { rank: nextRank });
  }
}

export function claimDailyReward(G, questId) {
  const entry = G.quests.daily.find(e => e.questId === questId && e.completed);
  if (!entry) return { ok: false, msg: 'Quest chưa hoàn thành' };
  if (entry.claimed) return { ok: false, msg: 'Đã nhận thưởng rồi' };

  const quest = getQuest(questId);
  const rewards = quest?.rewards || {};
  if (rewards.stone) G.stone = (G.stone || 0) + rewards.stone;
  if (rewards.exp) {
    G.exp = (G.exp || 0) + rewards.exp;
    while (G.exp >= G.maxExp) {
      G.exp -= G.maxExp;
      G.maxExp = Math.floor(G.maxExp * 1.4);
    }
  }
  if (rewards.sectExp && G.sectId) {
    if (!G.sect) G.sect = { rank: 0, exp: 0, totalContributions: 0 };
    G.sect.exp = (G.sect.exp || 0) + rewards.sectExp;
    _checkSectRankUp(G);
  }
  entry.claimed = true;

  const rewardStr = [
    rewards.stone ? `+${rewards.stone}💎` : '',
    rewards.exp   ? `+${rewards.exp}EXP` : '',
    rewards.sectExp ? `+${rewards.sectExp}công lao` : '',
  ].filter(Boolean).join(' ');

  return { ok: true, msg: `🎁 Nhận thưởng: ${rewardStr}`, rewards };
}

export function getAvailableBounties(G) {
  return QUESTS.filter(q => {
    if (q.type !== 'bounty') return false;
    if (G.realmIdx < (q.unlockRealm || 0)) return false;
    const cdKey = `_bountycd_${q.id}`;
    if (Date.now() < (G[cdKey] || 0)) return false;
    return true;
  }).map(q => {
    const active = findActiveQuest(G, q.id);
    return { ...q, isActive: !!active, progress: active?.progress || {} };
  });
}

export function getAvailableSectQuests(G) {
  if (!G.sectId) return [];
  return QUESTS.filter(q => {
    if (q.type !== 'sect') return false;
    return isAvailable(G, q);
  }).map(q => {
    const cdKey = `_sectqcd_${q.id}`;
    const active = findActiveQuest(G, q.id);
    const cdLeft = Math.max(0, ((G[cdKey] || 0) - Date.now()) / 3600000);
    return { ...q, isActive: !!active, progress: active?.progress || {}, cooldownHoursLeft: cdLeft };
  });
}

export function initQuestSystem(G) {
  // Đảm bảo npcActive tồn tại trong state
  if (!G.quests.npcActive) G.quests.npcActive = [];

  checkDailyReset(G);

  // Story quest cho tông môn viên (vẫn giữ logic cũ)
  if (G.quests.active.length === 0 && G.quests.completed.length === 0) {
    if (G.sectId) {
      const sectIntroId = `sq_sect_intro_${G.sectId}`;
      const sectIntro = getQuest(sectIntroId);
      if (sectIntro) {
        acceptQuest(G, sectIntroId);
      } else {
        acceptQuest(G, 'sq_01_first_kill');
      }
    }
    // Tán tu: KHÔNG auto-accept gì cả.
    // Họ phải đi nói chuyện với NPC để nhận quest.
  }

  // KHÔNG auto-accept side quests (S-D: triết lý Manifesto §6)

  // Lắng nghe bus events
  bus.on('quest:update', ({ type, ...data }) => {
    updateQuests(G, type, data);
  });

  bus.on('tick:meditate', ({ dt }) => {
    updateQuests(G, 'meditate_time', { qty: dt });
  });

  bus.on('dungeon:floor_complete', ({ floor }) => {
    updateQuests(G, 'dungeon_floor', { qty: 1 });
  });

  bus.on('combat:enemy_killed', ({ enemyId, enemyTier }) => {
    updateQuests(G, 'kill', { qty: 1 });
    updateQuests(G, 'kill_specific', { target: enemyId, qty: 1 });
    if (enemyTier) {
      updateQuests(G, 'kill_tier', { enemyTier, qty: 1 });
    }
  });

  bus.on('gather:item', ({ itemId, qty }) => {
    updateQuests(G, 'gather', { qty: qty || 1 });
    if (itemId) {
      updateQuests(G, 'gather_specific', { itemId, target: itemId, qty: qty || 1 });
    }
  });
}

// ---- Query helpers ----

export function getActiveQuests(G) {
  return G.quests.active
    .map(entry => ({ ...entry, quest: getQuest(entry.questId) }))
    .filter(e => e.quest);
}

export function getDailyQuests(G) {
  return G.quests.daily
    .map(entry => ({ ...entry, quest: getQuest(entry.questId) }))
    .filter(e => e.quest);
}

export function getAvailableQuests(G) {
  return QUESTS.filter(q =>
    q.type !== 'daily' &&
    q.type !== 'bounty' &&
    q.type !== 'sect' &&
    isAvailable(G, q) &&
    !findActiveQuest(G, q.id) &&
    !isCompleted(G, q.id)
  );
}
