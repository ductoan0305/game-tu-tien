// ============================================================
// ui/hud.js — Minimal HUD System
// Session 14: Left strip + right status pill + nav badges
//
// API:
//   initHUD()   — tạo DOM, append to body, start 2s update loop
//   updateHUD() — sync tất cả HUD values từ window._G
//
// Constraints:
//   - Chỉ đọc gameState (window._G), không write
//   - Nếu _G undefined → render placeholder, không throw
//   - Không đụng .panel-left DOM
// ============================================================

import { SPIRIT_ELEMENTS } from '../core/spirit-root.js';
import { WORLD_NODES }     from './map-data.js';
import { calcMaxQi }       from '../core/state.js';

// ---- Realm abbreviations (tương ứng realmIdx 0-4) ----
const REALM_SHORT = ['LK', 'TC', 'KĐ', 'NA', 'HT'];

// ---- Khởi tạo HUD ----
export function initHUD() {
  _buildLeftHUD();
  _buildRightHUD();

  // 2s interval cho right pill + nav badges (ít quan trọng hơn, update chậm là được)
  setInterval(updateHUD, 2000);
}

// ---- Update tất cả HUD — gọi từ tick loop lẫn setInterval ----
export function updateHUD() {
  const G = window._G;
  if (!G || !G.setupDone) return;

  try {
    _updateLeftBars(G);
    _updateRightPill(G);
    _updateNavBadges(G);
  } catch (e) {
    // Silent — HUD không được crash game
    console.warn('[hud] updateHUD error:', e);
  }
}

// ============================================================
// BUILD DOM
// ============================================================

function _buildLeftHUD() {
  if (document.getElementById('hud-left')) return; // idempotent

  const el = document.createElement('div');
  el.id = 'hud-left';
  el.innerHTML = `
    <div id="hud-avatar" title="Xem thông tin nhân vật" aria-label="Nhân vật">
      <span id="hud-avatar-icon">🧘</span>
    </div>
    <div id="hud-realm-badge">
      <span id="hud-realm-text">LK1</span>
    </div>
    <div class="hud-bar-v" id="hud-bar-hp" data-tooltip="HP: —">
      <div class="hud-bar-v-fill" id="hud-bar-hp-fill"></div>
    </div>
    <div class="hud-bar-v" id="hud-bar-mp" data-tooltip="Linh lực: —">
      <div class="hud-bar-v-fill" id="hud-bar-mp-fill"></div>
    </div>
    <div class="hud-bar-v hud-bar-exp-v" id="hud-bar-exp" data-tooltip="Kinh nghiệm: —">
      <div class="hud-bar-v-fill" id="hud-bar-exp-fill"></div>
    </div>
  `;
  document.body.appendChild(el);

  // Avatar → toggle char popup
  document.getElementById('hud-avatar')?.addEventListener('click', () => {
    // Trigger existing char-popup button để tái dụng toàn bộ logic
    const btn = document.getElementById('btn-char-popup');
    if (btn) {
      btn.click();
    }
  });
}

function _buildRightHUD() {
  if (document.getElementById('hud-right')) return; // idempotent

  const el = document.createElement('div');
  el.id = 'hud-right';
  el.innerHTML = `
    <span id="hud-stone">💰 0</span>
    <span class="hud-pill-sep">·</span>
    <span id="hud-cultivate" title="Trạng thái tu luyện">⚗️ ⚫</span>
    <span class="hud-pill-sep">·</span>
    <span id="hud-location" title="Vị trí hiện tại">🗺️ —</span>
  `;
  document.body.appendChild(el);
}

// ============================================================
// UPDATE FUNCTIONS
// ============================================================

function _updateLeftBars(G) {
  // ── Avatar border color theo hệ ngũ hành ──
  const mainEl  = G.spiritData?.mainElement;
  const elColor = (mainEl && SPIRIT_ELEMENTS[mainEl]?.color) || 'var(--border)';
  const avatarEl = document.getElementById('hud-avatar');
  if (avatarEl) avatarEl.style.borderColor = elColor;

  // ── Realm badge ──
  const realmTextEl = document.getElementById('hud-realm-text');
  if (realmTextEl) {
    const ri    = G.realmIdx ?? 0;
    const stage = G.stage    ?? 1;
    realmTextEl.textContent = (REALM_SHORT[ri] || 'LK') + stage;
  }

  // ── HP bar ──
  const hp    = G.hp    ?? 0;
  const maxHp = G.maxHp ?? 1;
  _setVBarFill('hud-bar-hp-fill', hp, maxHp);

  const hpBar = document.getElementById('hud-bar-hp');
  if (hpBar) hpBar.dataset.tooltip = `HP: ${_fmt(hp)} / ${_fmt(maxHp)}`;

  // ── MP / Linh lực bar ──
  const qi    = G.qi ?? 0;
  const maxQi = _safeCalcMaxQi(G);
  _setVBarFill('hud-bar-mp-fill', qi, maxQi);

  const mpBar = document.getElementById('hud-bar-mp');
  if (mpBar) mpBar.dataset.tooltip = `Linh lực: ${_fmt(qi)} / ${_fmt(maxQi)}`;

  // ── EXP bar ──
  const exp    = G.exp    ?? 0;
  const maxExp = G.maxExp ?? 1;
  _setVBarFill('hud-bar-exp-fill', exp, maxExp);

  const expBar = document.getElementById('hud-bar-exp');
  if (expBar) expBar.dataset.tooltip = `Kinh nghiệm: ${_fmt(exp)} / ${_fmt(maxExp)}`;
}

function _updateRightPill(G) {
  // ── Linh thạch ──
  const stoneEl = document.getElementById('hud-stone');
  if (stoneEl) stoneEl.textContent = `💰 ${_fmtShort(G.stone ?? 0)}`;

  // ── Trạng thái tu luyện ──
  const cultEl = document.getElementById('hud-cultivate');
  if (cultEl) cultEl.textContent = G.meditating ? '⚗️ 🟢' : '⚗️ ⚫';

  // ── Vị trí ──
  const locEl = document.getElementById('hud-location');
  if (locEl) {
    const nodeId = G.worldMap?.currentNodeId || '';
    const node   = WORLD_NODES.find(n => n.id === nodeId);
    locEl.textContent = `🗺️ ${node?.name || '—'}`;
  }
}

function _updateNavBadges(G) {
  // Quests: có daily quest completed chưa nhận thưởng?
  const hasQuestBadge = _hasClaimableQuest(G);
  _applyBadge('quests', hasQuestBadge);
}

// ============================================================
// HELPERS
// ============================================================

/** Set chiều cao fill của vertical bar theo tỷ lệ value/max */
function _setVBarFill(fillId, value, max) {
  const el = document.getElementById(fillId);
  if (!el) return;
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  el.style.height = pct.toFixed(1) + '%';
}

/** Gọi calcMaxQi an toàn — fallback 1 nếu lỗi */
function _safeCalcMaxQi(G) {
  try {
    return calcMaxQi(G) || 1;
  } catch (_) {
    return G.qi || 1;
  }
}

/** Kiểm tra có quest daily nào completed và chưa claim không */
function _hasClaimableQuest(G) {
  const q = G.quests;
  if (!q) return false;
  // Daily quests: completed = true, chưa claimed
  const daily = Array.isArray(q.daily) ? q.daily : [];
  if (daily.some(d => d.completed && !d.claimed)) return true;
  // Active quests: đã đủ điều kiện nhưng chưa claim
  const active = Array.isArray(q.active) ? q.active : [];
  if (active.some(a => a.status === 'completed')) return true;
  return false;
}

/** Thêm/xóa nav-dot trên tất cả nav buttons có data-tab="tabId" */
function _applyBadge(tabId, show) {
  document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(btn => {
    let dot = btn.querySelector('.hud-nav-badge');
    if (show) {
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'nav-dot nav-dot-red hud-nav-badge';
        dot.setAttribute('aria-hidden', 'true');
        btn.appendChild(dot);
      }
    } else {
      dot?.remove();
    }
  });
}

/** Format số nguyên đẹp (dùng cho tooltip) */
function _fmt(n) {
  return Math.floor(n ?? 0).toLocaleString('vi-VN');
}

/** Format số ngắn gọn cho right pill */
function _fmtShort(n) {
  n = Math.floor(n ?? 0);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}
