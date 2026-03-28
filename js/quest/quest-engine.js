// ============================================================
// quest/quest-engine.js — Quest state machine
// v2 — Thêm: bounty cooldown, sect quests, kill_tier,
//      gather_specific, sectExp reward, meditate_time tracking
// ============================================================
import { QUESTS, DAILY_QUEST_IDS, BOUNTY_QUEST_IDS, SECT_QUEST_IDS } from './quest-data.js';
import { bus } from '../utils/helpers.js';
import { unlockRecipe } from '../alchemy/alchemy-engine.js';

// ---- Helpers ----

function getQuest(questId) {
  return QUESTS.find(q => q.id === questId);
}

function findActiveQuest(G, questId) {
  return G.quests.active.find(q => q.questId === questId);
}

function isCompleted(G, questId) {
  return G.quests.completed.includes(questId);
}

function isAvailable(G, quest) {
  if (!quest) return false;
  // Không lặp lại nếu không repeatable
  if (isCompleted(G, quest.id) && !quest.repeatable) return false;
  // Realm requirement
  if (G.realmIdx < (quest.unlockRealm || 0)) return false;
  // Prereq chain
  if (quest.prereq && !isCompleted(G, quest.prereq)) return false;
  // Sect requirement
  if (quest.requireSect && !G.sectId) return false;
  // Bounty cooldown
  if (quest.type === 'bounty' && quest.repeatable) {
    const cdKey = `_bountycd_${quest.id}`;
    const cd = G[cdKey] || 0;
    if (Date.now() < cd) return false;
  }
  // Sect quest cooldown
  if (quest.type === 'sect' && quest.repeatable) {
    const cdKey = `_sectqcd_${quest.id}`;
    const cd = G[cdKey] || 0;
    if (Date.now() < cd) return false;
  }
  return true;
}

// ---- Sect rank lookup ----
function getSectRank(G) {
  return G.sect?.rank || 0;
}

// ---- Daily reset (mỗi 24h thực) ----

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

// ---- Accept / Start quest ----

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

// ---- Update quest progress ----

export function updateQuests(G, eventType, data = {}) {
  let anyUpdated = false;

  const updateList = (list) => {
    for (const entry of list) {
      const quest = getQuest(entry.questId);
      if (!quest || entry.completed) continue;

      for (const obj of quest.objectives) {
        if (obj.key !== eventType) continue;

        // kill_specific: cần đúng enemyId
        if (obj.key === 'kill_specific') {
          const targetMatch = data.target === obj.target || data.enemyId === obj.target;
          if (!targetMatch) continue;
        }

        // kill_tier: enemy phải có tier >= minTier
        if (obj.key === 'kill_tier') {
          if (!data.enemyTier || data.enemyTier < (obj.minTier || 0)) continue;
        }

        // gather_specific: cần đúng itemId
        if (obj.key === 'gather_specific') {
          if (data.itemId !== obj.target) continue;
        }

        // reach_realm: chỉ tính khi đạt đúng realm target
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

  if (anyUpdated) {
    checkCompletions(G);
    bus.emit('quest:progress', { eventType, data });
  }

  return anyUpdated;
}

// ---- Check completions ----

function checkCompletions(G) {
  // Non-daily active quests
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

  // Daily quests
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

// ---- Complete quest + claim rewards ----

export function completeQuest(G, questId) {
  const quest = getQuest(questId);
  if (!quest) return { ok: false, msg: 'Quest không tồn tại' };

  G.quests.active = G.quests.active.filter(e => e.questId !== questId);

  // Mark completed (non-repeatable)
  if (!quest.repeatable && !G.quests.completed.includes(questId)) {
    G.quests.completed.push(questId);
    G.totalQuestsCompleted = (G.totalQuestsCompleted || 0) + 1;
  }

  // Bounty/Sect cooldown sau khi hoàn thành
  if (quest.repeatable && quest.cooldownHours) {
    const prefix = quest.type === 'bounty' ? '_bountycd_' : '_sectqcd_';
    G[prefix + questId] = Date.now() + quest.cooldownHours * 3600 * 1000;
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

  // sectExp — tăng công lao tông môn
  if (rewards.sectExp && G.sectId) {
    if (!G.sect) G.sect = { rank: 0, exp: 0, totalContributions: 0 };
    G.sect.exp = (G.sect.exp || 0) + rewards.sectExp;
    _checkSectRankUp(G);
  }

  // Danh Vọng — bounty/sect quest tăng danh tiếng
  if (quest.type === 'bounty' || quest.type === 'sect') {
    const dvGain = quest.type === 'bounty' ? 8 : 5;
    G.danhVong = (G.danhVong ?? 0) + dvGain;
    bus.emit('danhvong:gained', { amount: dvGain, source: quest.name });
  } else if (quest.type === 'story') {
    // Story quest quan trọng hơn
    G.danhVong = (G.danhVong ?? 0) + 15;
    bus.emit('danhvong:gained', { amount: 15, source: quest.name });
  }

  // Unlock chain quest
  if (rewards.unlockQuest) {
    const nextQuest = getQuest(rewards.unlockQuest);
    if (nextQuest && isAvailable(G, nextQuest)) {
      acceptQuest(G, rewards.unlockQuest);
    }
  }

  bus.emit('quest:update', { type: 'quest_complete', qty: 1 });

  return { ok: true, msg: `✅ Hoàn thành: ${quest.name}!`, rewards };
}

// ---- Sect rank up check ----
function _checkSectRankUp(G) {
  if (!G.sect) return;
  // Import SECT_RANKS lazily để tránh circular
  const RANK_THRESHOLDS = [0, 500, 2000, 5000, 12000, 30000, 80000, 200000];
  const currentRank = G.sect.rank || 0;
  const nextRank = currentRank + 1;
  if (nextRank < RANK_THRESHOLDS.length && (G.sect.exp || 0) >= RANK_THRESHOLDS[nextRank]) {
    G.sect.rank = nextRank;
    bus.emit('sect:rank_up', { rank: nextRank });
  }
}

// ---- Claim daily reward ----

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

// ---- Bounty: list available bounties ----

export function getAvailableBounties(G) {
  return QUESTS.filter(q => {
    if (q.type !== 'bounty') return false;
    if (G.realmIdx < (q.unlockRealm || 0)) return false;
    const cdKey = `_bountycd_${q.id}`;
    if (Date.now() < (G[cdKey] || 0)) return false;
    return true;
  }).map(q => {
    const cdKey = `_bountycd_${q.id}`;
    const active = findActiveQuest(G, q.id);
    return { ...q, isActive: !!active, progress: active?.progress || {} };
  });
}

// ---- Sect quests: list available ----

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

// ---- Init quest system ----

export function initQuestSystem(G) {
  checkDailyReset(G);

  // Auto-accept quest đầu tiên phù hợp
  if (G.quests.active.length === 0 && G.quests.completed.length === 0) {
    if (G.sectId) {
      // Gia nhập tông môn ngay — quest đầu là giới thiệu tông môn
      const sectIntroId = `sq_sect_intro_${G.sectId}`;
      const sectIntro = getQuest(sectIntroId);
      if (sectIntro) {
        acceptQuest(G, sectIntroId);
      } else {
        // Fallback: nhiệm vụ đóng góp lần đầu
        acceptQuest(G, 'sq_01_first_kill');
      }
    } else {
      // Tán tu — auto-accept các quest có flag autoAccept
      const autoQuests = QUESTS
        .filter(q => q.autoAccept && !findActiveQuest(G, q.id) && !G.quests.completed.includes(q.id))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      for (const q of autoQuests) acceptQuest(G, q.id);
      if (G.quests.active.length === 0) acceptQuest(G, 'sq_00_meet_elder');
    }
  }

  // Auto-accept available side quests
  const sideQuests = QUESTS.filter(q => q.type === 'side' && isAvailable(G, q));
  for (const quest of sideQuests) {
    if (!findActiveQuest(G, quest.id)) {
      acceptQuest(G, quest.id);
    }
  }

  // Lắng nghe bus events
  bus.on('quest:update', ({ type, ...data }) => {
    updateQuests(G, type, data);
  });

  // Meditate time tracking
  bus.on('tick:meditate', ({ dt }) => {
    updateQuests(G, 'meditate_time', { qty: dt });
  });

  // Dungeon floor completion
  bus.on('dungeon:floor_complete', ({ floor }) => {
    updateQuests(G, 'dungeon_floor', { qty: 1 });
  });

  // Kill with tier info (combat-engine cần emit enemyTier)
  bus.on('combat:enemy_killed', ({ enemyId, enemyTier }) => {
    updateQuests(G, 'kill', { qty: 1 });
    updateQuests(G, 'kill_specific', { target: enemyId, qty: 1 });
    if (enemyTier) {
      updateQuests(G, 'kill_tier', { enemyTier, qty: 1 });
    }
  });

  // Gather with itemId info
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