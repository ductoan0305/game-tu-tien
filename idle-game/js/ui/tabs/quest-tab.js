// ============================================================
// ui/tabs/quest-tab.js — Quest tab renderer
// ============================================================
import { getActiveQuests, getDailyQuests, getAvailableQuests,
         getAvailableBounties, getAvailableSectQuests,
         acceptQuest, claimDailyReward } from '../../quest/quest-engine.js';
import { fmtNum } from '../../utils/helpers.js';

export function renderQuestTab(G, actions) {
  const panel = document.getElementById('panel-quests');
  if (!panel) return;

  const active    = getActiveQuests(G);
  const daily     = getDailyQuests(G);
  const available = getAvailableQuests(G);
  const bounties  = getAvailableBounties(G);
  const sectQuests = G.sectId ? getAvailableSectQuests(G) : [];

  // Time until daily reset
  const now = Date.now();
  const resetAt = (G.quests.lastDailyReset || 0) + 24 * 3600 * 1000;
  const resetInSec = Math.max(0, Math.floor((resetAt - now) / 1000));
  const resetStr = formatTime(resetInSec);

  // Banner hướng dẫn cho tân thủ chưa có quest nào
  const isNewbie = active.length === 0 && (G.totalQuestsCompleted || 0) === 0;

  panel.innerHTML = `
    <div class="tab-content">
      <h2 class="tab-title">📜 Nhiệm Vụ</h2>
      <div class="quest-meta">
        <span>Hoàn thành: ${G.totalQuestsCompleted || 0}</span>
        <span>Reset nhật tu: ${resetStr}</span>
      </div>

      ${isNewbie ? `
      <div class="quest-newbie-hint">
        <div style="font-size:20px;margin-bottom:6px">👴</div>
        <div style="font-weight:600;margin-bottom:4px">Bắt đầu từ đâu?</div>
        <div style="font-size:12px;color:var(--text-dim)">Vào 🗺 Bản Đồ → Chọn Làng Khởi Điểm → Vào làng → Tìm <strong>Lão Dược Sư 👴</strong> để nhận nhiệm vụ đầu tiên.</div>
      </div>` : ''}

      <!-- Daily quests -->
      <div class="quest-section">
        <h3>⏰ Nhật Tu Nhiệm Vụ</h3>
        ${daily.length === 0
          ? '<p class="empty-msg">Không có nhật tu hôm nay</p>'
          : daily.map(entry => renderDailyEntry(entry)).join('')
        }
      </div>

      <!-- Bounty board -->
      ${bounties.length > 0 ? `
      <div class="quest-section">
        <h3>🎯 Bảng Truy Nã</h3>
        <div class="bounty-hint">Nhiệm vụ repeatable — tiêu diệt mục tiêu để nhận thưởng. Có cooldown sau khi hoàn thành.</div>
        ${bounties.map(q => renderBountyEntry(G, q)).join('')}
      </div>` : ''}

      <!-- Sect quests -->
      ${sectQuests.length > 0 ? `
      <div class="quest-section">
        <h3>🏯 Nhiệm Vụ Tông Môn</h3>
        ${sectQuests.map(q => renderSectQuestEntry(G, q)).join('')}
      </div>` : ''}

      <!-- Active story/side quests -->
      <div class="quest-section">
        <h3>📖 Nhiệm Vụ Đang Thực Hiện</h3>
        ${active.length === 0
          ? '<p class="empty-msg">Không có nhiệm vụ nào đang thực hiện</p>'
          : active.map(entry => renderActiveEntry(entry)).join('')
        }
      </div>

      <!-- Available quests -->
      ${available.length > 0 ? `
        <div class="quest-section">
          <h3>❓ Có Thể Nhận</h3>
          ${available.map(quest => renderAvailableQuest(quest)).join('')}
        </div>
      ` : ''}

      <div class="quest-footer">
        <span>📜 Đã hoàn thành: ${G.quests.completed.length} nhiệm vụ</span>
      </div>
    </div>
  `;

  wireQuestEvents(G, actions, panel);
}

function renderDailyEntry(entry) {
  const { quest, progress, completed, claimed } = entry;
  if (!quest) return '';

  const obj = quest.objectives[0];
  const current = Math.min(progress[obj.key] || 0, obj.required);
  const pct = Math.min(100, Math.floor(current / obj.required * 100));

  return `
    <div class="quest-card daily-quest ${completed ? 'completed' : ''}">
      <div class="quest-header">
        <span class="quest-name">${quest.name}</span>
        ${completed ? '<span class="quest-badge done">✓ Xong</span>' : ''}
      </div>
      <p class="quest-desc">${quest.desc}</p>
      <div class="quest-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        <span>${current} / ${obj.required} ${obj.label}</span>
      </div>
      <div class="quest-rewards">
        💎 +${quest.rewards.stone} · 📈 +${quest.rewards.exp} EXP
      </div>
      ${completed && !claimed
        ? `<button class="btn-claim btn-primary" data-quest-id="${entry.questId}">🎁 Nhận Thưởng</button>`
        : claimed ? '<span class="claimed-text">✓ Đã nhận</span>' : ''
      }
    </div>
  `;
}

function renderBountyEntry(G, q) {
  const isActive = q.isActive;
  const activeEntry = G.quests.active.find(e => e.questId === q.id);
  const progress = activeEntry?.progress || {};

  // Cooldown display
  const cdKey = `_bountycd_${q.id}`;
  const cdEnd = G[cdKey] || 0;
  const now = Date.now();
  const onCd = cdEnd > now;
  const cdStr = onCd ? `⏳ Hồi chiêu: ${formatTime(Math.ceil((cdEnd - now) / 1000))}` : '';

  // Progress display nếu đang active
  let progressHtml = '';
  if (isActive && q.objectives?.length) {
    const obj = q.objectives[0];
    const cur = Math.min(progress[obj.key] || 0, obj.required);
    const pct = Math.min(100, Math.floor(cur / obj.required * 100));
    progressHtml = `
      <div class="quest-progress">
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span>${cur} / ${obj.required} ${obj.label || ''}</span>
      </div>`;
  }

  const rewardParts = [];
  if (q.rewards?.stone) rewardParts.push(`💎 +${q.rewards.stone}`);
  if (q.rewards?.exp)   rewardParts.push(`📈 +${q.rewards.exp} EXP`);

  return `
    <div class="quest-card bounty-quest ${onCd ? 'quest-on-cooldown' : ''}">
      <div class="quest-header">
        <span class="quest-type-badge bounty-badge">🎯 Truy Nã</span>
        <span class="quest-name">${q.name}</span>
        ${onCd ? `<span class="quest-badge cooldown">${cdStr}</span>` : ''}
      </div>
      <p class="quest-desc">${q.desc}</p>
      ${progressHtml}
      <div class="quest-rewards">${rewardParts.join(' · ')}</div>
      ${!isActive && !onCd
        ? `<button class="btn-accept-quest btn-primary btn-sm" data-quest-id="${q.id}">📋 Nhận Nhiệm Vụ</button>`
        : isActive ? '<span class="quest-badge active">Đang Thực Hiện</span>' : ''
      }
    </div>`;
}

function renderSectQuestEntry(G, q) {
  const isActive = q.isActive;
  const activeEntry = G.quests.active.find(e => e.questId === q.id);
  const progress = activeEntry?.progress || {};

  let progressHtml = '';
  if (isActive && q.objectives?.length) {
    const obj = q.objectives[0];
    const cur = Math.min(progress[obj.key] || 0, obj.required);
    const pct = Math.min(100, Math.floor(cur / obj.required * 100));
    progressHtml = `
      <div class="quest-progress">
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span>${cur} / ${obj.required} ${obj.label || ''}</span>
      </div>`;
  }

  const rewardParts = [];
  if (q.rewards?.stone)   rewardParts.push(`💎 +${q.rewards.stone}`);
  if (q.rewards?.exp)     rewardParts.push(`📈 +${q.rewards.exp} EXP`);
  if (q.rewards?.sectExp) rewardParts.push(`🏯 +${q.rewards.sectExp} công lao`);

  const cdLeft = q.cooldownHoursLeft || 0;
  const onCd = cdLeft > 0;

  return `
    <div class="quest-card sect-quest ${onCd ? 'quest-on-cooldown' : ''}">
      <div class="quest-header">
        <span class="quest-type-badge sect-badge">🏯 Tông Môn</span>
        <span class="quest-name">${q.name}</span>
        ${onCd ? `<span class="quest-badge cooldown">⏳ ${cdLeft.toFixed(1)}h</span>` : ''}
      </div>
      <p class="quest-desc">${q.desc || ''}</p>
      ${progressHtml}
      <div class="quest-rewards">${rewardParts.join(' · ')}</div>
      ${!isActive && !onCd
        ? `<button class="btn-accept-quest btn-primary btn-sm" data-quest-id="${q.id}">📋 Nhận Nhiệm Vụ</button>`
        : isActive ? '<span class="quest-badge active">Đang Thực Hiện</span>' : ''
      }
    </div>`;
}

function renderActiveEntry(entry) {
  const { quest, progress } = entry;
  if (!quest) return '';

  const objectives = quest.objectives.map(obj => {
    const current = Math.min(progress[obj.key] || 0, obj.required);
    const pct = Math.min(100, Math.floor(current / obj.required * 100));
    return `
      <div class="objective">
        <span>${obj.label}: ${current}/${obj.required}</span>
        <div class="progress-bar small">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');

  const rewards = [];
  if (quest.rewards?.stone)  rewards.push(`💎 +${quest.rewards.stone} linh thạch`);
  if (quest.rewards?.exp)    rewards.push(`📈 +${quest.rewards.exp} EXP`);
  if (quest.rewards?.recipe) rewards.push(`📜 Công thức đan`);
  if (quest.rewards?.item)   rewards.push(`🎁 Vật phẩm`);

  const typeLabel = quest.type === 'story' ? '📖 Chính Tuyến' : '📌 Nhiệm Vụ Phụ';
  const npcHint = quest.npcHint ? `<p class="quest-npc-hint">💬 ${quest.npcHint}</p>` : '';
  const loreHtml = quest.lore   ? `<p class="quest-lore">"${quest.lore}"</p>` : '';

  return `
    <div class="quest-card ${quest.type === 'story' ? 'story-quest' : 'side-quest'}">
      <div class="quest-header">
        <span class="quest-type-badge">${typeLabel}</span>
        <span class="quest-name">${quest.name}</span>
      </div>
      <p class="quest-desc">${quest.desc}</p>
      ${npcHint}
      ${loreHtml}
      <div class="quest-objectives">${objectives}</div>
      <div class="quest-rewards">🎁 Phần thưởng: ${rewards.join(' · ') || 'Không có'}</div>
    </div>
  `;
}

function renderAvailableQuest(quest) {
  return `
    <div class="quest-card available-quest">
      <div class="quest-header">
        <span class="quest-name">${quest.name}</span>
        <span class="quest-badge available">Có thể nhận</span>
      </div>
      <p class="quest-desc">${quest.desc}</p>
    </div>
  `;
}

function wireQuestEvents(G, actions, panel) {
  // Claim daily reward
  panel.querySelectorAll('.btn-claim').forEach(btn => {
    btn.addEventListener('click', () => {
      const result = claimDailyReward(G, btn.dataset.questId);
      if (result.ok) {
        const rewardStr = [
          result.rewards?.stone ? `+${result.rewards.stone}💎` : '',
          result.rewards?.exp   ? `+${result.rewards.exp} EXP` : '',
        ].filter(Boolean).join(' ');
        // showToast thông qua actions nếu có, fallback console
        if (actions?.toast) actions.toast(`🎁 Nhận thưởng: ${rewardStr}`, 'jade');
      }
      // Re-render tab
      if (actions?.refresh) actions.refresh();
      else renderQuestTab(G, actions);
    });
  });

  // Accept bounty / sect quest — dùng import trực tiếp, không qua actions
  panel.querySelectorAll('.btn-accept-quest').forEach(btn => {
    btn.addEventListener('click', () => {
      const questId = btn.dataset.questId;
      const result = acceptQuest(G, questId);
      const msg = result.ok
        ? `📋 Đã nhận: ${result.msg}`
        : `⚠ ${result.msg}`;
      if (actions?.toast) actions.toast(msg, result.ok ? 'jade' : 'danger');
      renderQuestTab(G, actions);
    });
  });
}

function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}