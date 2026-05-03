// ============================================================
// ui/tabs/ranking-tab.js — Bảng Xếp Hạng + Thành Tựu
// ============================================================
import { NPC_RIVALS, REALMS, ACHIEVEMENTS } from '../../core/data.js';
import { fmtNum } from '../../utils/helpers.js';
import { getDanhVongTier } from '../../core/danh-vong.js';

// NPC state — persist trong session
let _npcState = null;
let _activeSubTab = 'ranking'; // 'ranking' | 'achievements'

// ============================================================
// NPC AI
// ============================================================
function initNpcState(G) {
  if (_npcState) return;
  _npcState = NPC_RIVALS.map(npc => ({
    ...npc,
    score: calcScore(npc.realmIdx, npc.stage),
    lastUpdate: Date.now() - Math.random() * 60000,
  }));
  tickNpcs(G);
}

function calcScore(realmIdx, stage) {
  return realmIdx * 10000 + stage * 1000 + Math.floor(Math.random() * 999);
}

export function tickNpcs(G) {
  if (!_npcState) return;
  const now = Date.now();
  for (const npc of _npcState) {
    const elapsed = (now - npc.lastUpdate) / 1000;
    if (elapsed < 30) continue;
    npc.lastUpdate = now;
    if (Math.random() < 0.15) {
      const realm = REALMS[npc.realmIdx];
      if (npc.stage < realm.stages) {
        npc.stage++;
      } else if (npc.realmIdx < REALMS.length - 1) {
        npc.realmIdx++;
        npc.stage = 1;
      }
      npc.score = calcScore(npc.realmIdx, npc.stage);
    }
  }
}

// ============================================================
// RENDER CHÍNH
// ============================================================
export function renderRankingTab(G) {
  const panel = document.getElementById('panel-ranking');
  if (!panel) return;

  initNpcState(G);
  tickNpcs(G);

  const unlockedCount = ACHIEVEMENTS.filter(a => G.achievements?.[a.id]).length;
  const totalCount = ACHIEVEMENTS.length;

  panel.innerHTML = `
    <div class="tab-content">
      <h2 class="tab-title">🏆 Xếp Hạng & Thành Tựu</h2>

      <div class="ranking-subtabs">
        <button class="rst-btn ${_activeSubTab === 'ranking' ? 'active' : ''}" data-sub="ranking">
          🏆 Thiên Bảng
        </button>
        <button class="rst-btn ${_activeSubTab === 'achievements' ? 'active' : ''}" data-sub="achievements">
          🎖 Thành Tựu
          <span class="ach-counter">${unlockedCount}/${totalCount}</span>
        </button>
      </div>

      <div id="ranking-sub-content">
        ${_activeSubTab === 'ranking' ? _renderRanking(G) : _renderAchievements(G)}
      </div>
    </div>`;

  // Sub-tab switching
  panel.querySelectorAll('.rst-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeSubTab = btn.dataset.sub;
      renderRankingTab(G);
    });
  });

  // Achievement filter buttons
  panel.querySelectorAll('.ach-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _achFilter = btn.dataset.achFilter;
      renderRankingTab(G);
    });
  });
}

// ============================================================
// THIÊN BẢNG
// ============================================================
function _renderRanking(G) {
  const playerScore = calcScore(G.realmIdx, G.stage) + Math.floor((G.totalKills || 0) * 10);
  const playerEntry = {
    name: G.name,
    title: '(Ngươi)',
    realmIdx: G.realmIdx,
    stage: G.stage,
    score: playerScore,
    danhVong: G.danhVong ?? 0,
    isPlayer: true,
  };

  const allEntries = [..._npcState, playerEntry]
    .sort((a, b) => b.score - a.score)
    .map((entry, rank) => ({ ...entry, rank: rank + 1 }));

  return `
    <div class="ranking-list">
      ${allEntries.map(entry => _renderRankEntry(entry)).join('')}
    </div>
    <p class="ranking-note">Bảng xếp hạng cập nhật theo thời gian thực. NPC tu luyện không ngừng!</p>`;
}

function _renderRankEntry(entry) {
  const realm = REALMS[entry.realmIdx];
  const rankEmojis = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const rankDisplay = rankEmojis[entry.rank] || `#${entry.rank}`;

  // Danh vọng — chỉ hiện cho player và NPC có danhVong > 0
  const dv = entry.danhVong ?? 0;
  const dvTier = getDanhVongTier(dv);
  const dvHtml = dv > 0
    ? `<span style="font-size:10px;color:${dvTier.color};margin-left:6px">🌟${dv}</span>`
    : '';

  return `
    <div class="rank-entry ${entry.isPlayer ? 'player-entry' : ''}">
      <div class="rank-num">${rankDisplay}</div>
      <div class="rank-info">
        <div class="rank-name">${entry.name} <span class="rank-title">${entry.title || ''}</span>${dvHtml}</div>
        <div class="rank-realm" style="color:${realm.color}">
          ${realm.emoji} ${realm.name} · Tầng ${entry.stage}
        </div>
        ${entry.desc ? `<div class="rank-desc">${entry.desc}</div>` : ''}
      </div>
      <div class="rank-score">${fmtNum(entry.score)}</div>
    </div>`;
}

// ============================================================
// THÀNH TỰU — grouped, filterable
// ============================================================
const ACH_GROUPS = [
  { key: 'bt',      label: '⚡ Đột Phá',     ids: ['first_bt','bt5','bt15','bt36'] },
  { key: 'realm',   label: '🌀 Cảnh Giới',   ids: ['truc_co','kim_dan','nguyen_anh','hoa_than'] },
  { key: 'combat',  label: '⚔ Chiến Đấu',   ids: ['hunt10','hunt50','hunt200','kills500'] },
  { key: 'alchemy', label: '⚗ Luyện Đan',   ids: ['alchemy10','alchemy50','alchemy100','recipes5'] },
  { key: 'dungeon', label: '☠ Địa Phủ',     ids: ['dungeon1','dungeon5','dungeon10'] },
  { key: 'sect',    label: '🏯 Tông Môn',   ids: ['join_sect','sect_rank3','sect_rank6','contrib50'] },
  { key: 'wealth',  label: '💎 Tài Sản',    ids: ['rich500','rich5000','rich50000'] },
  { key: 'time',    label: '⏳ Thời Gian',  ids: ['playtime1h','playtime5h','age100','survive_near'] },
  { key: 'special', label: '✨ Đặc Biệt',  ids: ['skill3','quest20','hun_root','all_elements'] },
];

let _achFilter = 'all'; // 'all' | 'unlocked' | 'locked'

function _renderAchievements(G) {
  const done  = ACHIEVEMENTS.filter(a => G.achievements?.[a.id]).length;
  const total = ACHIEVEMENTS.length;
  const pct   = Math.round(done / total * 100);

  // Progress ring (SVG)
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const ringColor = pct >= 80 ? '#f0d47a' : pct >= 50 ? '#56c46a' : '#3a9fd5';

  return `
    <div class="ach-header">
      <div class="ach-ring-wrap">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
          <circle cx="36" cy="36" r="${r}" fill="none" stroke="${ringColor}" stroke-width="6"
                  stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
                  stroke-dashoffset="${(circ/4).toFixed(1)}"
                  stroke-linecap="round" style="transition:stroke-dasharray 0.6s ease"/>
          <text x="36" y="40" text-anchor="middle" fill="${ringColor}" font-size="13" font-weight="700">${pct}%</text>
        </svg>
      </div>
      <div class="ach-header-info">
        <div class="ach-count">${done} / ${total} thành tựu</div>
        <div class="ach-sub" style="color:var(--text-dim);font-size:11px;margin-top:4px">
          ${pct >= 80 ? '🌟 Gần đạt bộ sưu tập hoàn chỉnh!' :
            pct >= 50 ? '✨ Đã qua nửa hành trình' :
            pct >= 20 ? '📈 Đang tiến bộ tốt' : '🌱 Mới bắt đầu — còn nhiều điều để khám phá'}
        </div>
      </div>
      <div class="ach-filter-btns">
        <button class="ach-filter-btn ${_achFilter==='all'?'active':''}" data-ach-filter="all">Tất cả</button>
        <button class="ach-filter-btn ${_achFilter==='unlocked'?'active':''}" data-ach-filter="unlocked">✅ Đã đạt</button>
        <button class="ach-filter-btn ${_achFilter==='locked'?'active':''}" data-ach-filter="locked">🔒 Chưa mở</button>
      </div>
    </div>

    ${ACH_GROUPS.map(group => {
      const items = ACHIEVEMENTS.filter(a => group.ids.includes(a.id));
      const filtered = items.filter(a => {
        const isUnlocked = !!G.achievements?.[a.id];
        if (_achFilter === 'unlocked') return isUnlocked;
        if (_achFilter === 'locked')   return !isUnlocked;
        return true;
      });
      if (filtered.length === 0) return '';

      const groupDone = items.filter(a => G.achievements?.[a.id]).length;
      return `
        <div class="ach-group">
          <div class="ach-group-header">
            <span class="ach-group-label">${group.label}</span>
            <span class="ach-group-count" style="color:${groupDone===items.length?'#56c46a':'var(--text-dim)'}">
              ${groupDone}/${items.length}
            </span>
          </div>
          <div class="ach-grid">
            ${filtered.map(a => _renderAchCard(a, !!G.achievements?.[a.id])).join('')}
          </div>
        </div>`;
    }).join('')}`;
}

function _renderAchCard(a, unlocked) {
  return `
    <div class="ach-card ${unlocked ? 'ach-unlocked' : 'ach-locked'}">
      <div class="ach-emoji">${unlocked ? a.emoji : '❓'}</div>
      <div class="ach-info">
        <div class="ach-name">${unlocked ? a.name : '???'}</div>
        <div class="ach-desc">${unlocked ? a.desc : 'Chưa khám phá'}</div>
      </div>
      ${unlocked ? '<div class="ach-badge">✓</div>' : ''}
    </div>`;
}