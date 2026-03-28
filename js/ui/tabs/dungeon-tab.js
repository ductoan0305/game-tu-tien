// ============================================================
// ui/tabs/dungeon-tab.js — Dungeon tab UI
// ============================================================
import { getDungeonStatus } from '../../dungeon/dungeon-engine.js';
import { DUNGEON_FLOORS, DUNGEON_ENEMIES } from '../../dungeon/dungeon-data.js';

const REALM_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa'];

// Tính max attempts theo Danh Vọng (mirror dungeon-engine.js)
function _maxAttempts(G) {
  const dv = G.danhVong ?? 0;
  return dv >= 500 ? 8 : dv >= 300 ? 6 : dv >= 150 ? 5 : dv >= 50 ? 4 : 3;
}

export function renderDungeonTab(G, actions) {
  const panel = document.getElementById('panel-dungeon');
  if (!panel) return;

  const status = getDungeonStatus(G);
  const { currentFloor, maxFloorReached, nextFloor, nextFloorData } = status;
  const MAX_RUNS_PER_DAY = _maxAttempts(G);
  const runsToday  = G.dungeon?.attemptsToday || 0;
  const runsLeft   = Math.max(0, MAX_RUNS_PER_DAY - runsToday);
  const isActive   = G.dungeon?.active || false;
  const progressPct = Math.round((maxFloorReached / DUNGEON_FLOORS.length) * 100);

  // ---- Floor list ----
  const floorsHtml = DUNGEON_FLOORS.map(f => {
    const cleared = currentFloor >= f.floor;
    const isNext  = f.floor === currentFloor + 1;
    const locked  = f.minRealm > G.realmIdx;
    const isBoss  = f.isBoss;

    let statusIcon = '🔒';
    let rowClass   = 'dungeon-floor-locked';
    if (cleared)             { statusIcon = '✅'; rowClass = 'dungeon-floor-cleared'; }
    else if (isNext && !locked) { statusIcon = '▶'; rowClass = 'dungeon-floor-next'; }

    // Enemies preview cho tầng tiếp theo
    const enemyPreview = (isNext && !locked)
      ? f.enemies.map(eid => {
          const e = DUNGEON_ENEMIES.find(x => x.id === eid);
          return e ? `<span title="${e.name}">${e.emoji}</span>` : '';
        }).join('')
      : '';

    return `
      <div class="dungeon-floor-row ${rowClass} ${isBoss ? 'dungeon-floor-boss' : ''}">
        <span class="df-num">${f.floor}</span>
        <span class="df-emoji">${f.emoji}</span>
        <div class="df-info">
          <span class="df-name">${isBoss ? '👹 BOSS: ' : ''}${f.name}</span>
          <span class="df-desc">${locked ? `🔒 Cần ${REALM_NAMES[f.minRealm]}` : f.desc}</span>
          ${enemyPreview ? `<span class="df-enemies">${enemyPreview}</span>` : ''}
        </div>
        <div class="df-rewards">
          <span>💎 ${f.rewards.stone}</span>
          <span>✨ ${f.rewards.exp}</span>
          ${f.rewards.itemId ? `<span title="Vật phẩm đặc biệt">📦</span>` : ''}
        </div>
        <span class="df-status">${statusIcon}</span>
      </div>`;
  }).join('');

  // ---- Enter panel ----
  let enterHtml = '';
  if (isActive) {
    // Đang trong dungeon — hiện trạng thái chiến đấu
    const activeEnemyId = G.dungeon?.activeEnemyId;
    const activeEnemy = activeEnemyId ? DUNGEON_ENEMIES.find(e => e.id === activeEnemyId) : null;
    enterHtml = `
      <div class="dungeon-active-panel">
        <div class="dap-title">⚔ Đang chiến đấu tại Tầng ${currentFloor}</div>
        ${activeEnemy ? `
          <div class="dap-enemy">
            <span style="font-size:28px">${activeEnemy.emoji}</span>
            <div>
              <div class="dap-enemy-name">${activeEnemy.name}</div>
              <div class="dap-enemy-stats">❤ ${activeEnemy.hpBase} · ⚔ ${activeEnemy.atkBase} · 🛡 ${activeEnemy.defBase}</div>
            </div>
          </div>` : ''}
        <div class="dap-hint">Vào tab <strong>Chiến Đấu</strong> để tiếp tục hoặc rút lui.</div>
        <button class="btn-primary" onclick="document.querySelector('[data-tab=combat]')?.click()">
          ⚔ Đến Tab Chiến Đấu
        </button>
      </div>`;
  } else if (!nextFloorData) {
    enterHtml = `<div class="dungeon-complete">🏆 Đã chinh phục toàn bộ Thiên Ma Địa Phủ!</div>`;
  } else if (nextFloorData.minRealm > G.realmIdx) {
    enterHtml = `
      <div class="dungeon-locked-msg">
        🔒 Tầng ${nextFloorData.floor} yêu cầu <strong>${REALM_NAMES[nextFloorData.minRealm]}</strong>
      </div>`;
  } else if (runsLeft === 0) {
    enterHtml = `
      <div class="dungeon-locked-msg">
        ⏳ Hết lượt vào hôm nay (${runsToday}/${MAX_RUNS_PER_DAY}). Quay lại ngày mai.
      </div>`;
  } else {
    // Room events hint
    const roomEventCount = nextFloorData.roomEvents?.length || 0;
    const roomHint = roomEventCount > 0
      ? `<div class="dungeon-room-hint">✦ Tầng này có thể xuất hiện sự kiện phòng bí ẩn (30% sau mỗi chiến đấu)</div>`
      : '';

    // Enemy preview
    const enemyPreviews = (nextFloorData.enemies || []).map(eid => {
      const e = DUNGEON_ENEMIES.find(x => x.id === eid);
      return e ? `
        <div class="dnep-row">
          <span style="font-size:18px">${e.emoji}</span>
          <div>
            <div class="dnep-name">${e.name}</div>
            <div class="dnep-stats">❤ ${e.hpBase} · ⚔ ${e.atkBase} · 🛡 ${e.defBase}</div>
          </div>
        </div>` : '';
    }).join('');

    enterHtml = `
      <div class="dungeon-enter-panel">
        <div class="dungeon-next-info">
          <span class="dungeon-next-emoji">${nextFloorData.emoji}</span>
          <div>
            <div class="dungeon-next-name">
              ${nextFloorData.isBoss ? '👹 BOSS — ' : ''}Tầng ${nextFloorData.floor}: ${nextFloorData.name}
            </div>
            <div class="dungeon-next-lore">${nextFloorData.lore}</div>
          </div>
        </div>

        <div class="dungeon-next-enemies">
          <div class="dne-title">Kẻ thù có thể gặp (ngẫu nhiên 1):</div>
          <div class="dne-list">${enemyPreviews}</div>
        </div>

        <div class="dungeon-enter-rewards">
          <span>💎 ${nextFloorData.rewards.stone}</span>
          <span>✨ ${nextFloorData.rewards.exp} EXP</span>
          <span>🌀 ${nextFloorData.rewards.qi} linh lực</span>
          ${nextFloorData.rewards.itemId ? `<span>📦 Vật phẩm đặc biệt</span>` : ''}
        </div>

        ${roomHint}

        <div class="dungeon-runs-info">
          Lượt vào còn lại hôm nay: <strong>${runsLeft} / ${MAX_RUNS_PER_DAY}</strong>
          ${(() => {
            const dv = G.danhVong ?? 0;
            if (dv < 50)  return `<span style="font-size:10px;color:var(--text-dim)"> · DV 50+ → 4 lượt</span>`;
            if (dv < 150) return `<span style="font-size:10px;color:var(--text-dim)"> · DV 150+ → 5 lượt</span>`;
            if (dv < 300) return `<span style="font-size:10px;color:#56c46a"> · DV 300+ → 6 lượt</span>`;
            if (dv < 500) return `<span style="font-size:10px;color:#56c46a"> · DV 500+ → 8 lượt</span>`;
            return `<span style="font-size:10px;color:#f0d47a"> · 🌟 Lừng Lẫy — tối đa 8 lượt</span>`;
          })()}
        </div>

        <div class="dungeon-enter-actions">
          <button id="btn-dungeon-enter"
            class="btn-primary btn-dungeon-enter ${nextFloorData.isBoss ? 'btn-boss' : ''}">
            ${nextFloorData.isBoss ? '⚔ Đối Mặt Boss' : '▶ Bước Vào Tầng ' + nextFloorData.floor}
          </button>
          ${currentFloor > 0
            ? `<button id="btn-dungeon-reset" class="btn-secondary btn-sm">🔄 Đặt Lại Từ Đầu</button>`
            : ''}
        </div>
      </div>`;
  }

  // ---- Render ----
  panel.innerHTML = `
    <div class="tab-content">
      <h2 class="tab-title">☠ Thiên Ma Địa Phủ</h2>

      <div class="dungeon-header">
        <div class="dungeon-stats-row">
          <div class="dungeon-stat">
            <span class="ds-label">Tầng Hiện Tại</span>
            <span class="ds-val">${currentFloor} / ${DUNGEON_FLOORS.length}</span>
          </div>
          <div class="dungeon-stat">
            <span class="ds-label">Đỉnh Cao</span>
            <span class="ds-val">${maxFloorReached || '—'}</span>
          </div>
          <div class="dungeon-stat">
            <span class="ds-label">Hôm Nay</span>
            <span class="ds-val ${runsLeft === 0 ? 'ds-val-warn' : ''}">${runsToday}/${MAX_RUNS_PER_DAY}</span>
          </div>
          <div class="dungeon-stat">
            <span class="ds-label">Tiến Độ</span>
            <span class="ds-val">${progressPct}%</span>
          </div>
        </div>
        <div class="dungeon-progress-bar">
          <div class="dungeon-progress-fill" style="width:${progressPct}%"></div>
        </div>
        <p class="dungeon-flavor">
          Thiên Ma Địa Phủ — nơi kẻ mạnh tìm kiếm quyền năng tột đỉnh.
          Mười tầng, mười thử thách, chỉ một kẻ duy nhất đã vượt qua cả mười.
        </p>
      </div>

      ${enterHtml}

      <div class="dungeon-floor-list">
        <h3 class="section-title">📋 Danh Sách Tầng</h3>
        ${floorsHtml}
      </div>
    </div>`;

  // Wire events
  document.getElementById('btn-dungeon-enter')?.addEventListener('click', () => actions.enterDungeon());
  document.getElementById('btn-dungeon-reset')?.addEventListener('click', () => {
    if (confirm('Đặt lại mê cung? Tiến độ sẽ về tầng 1.')) actions.resetDungeon();
  });
}