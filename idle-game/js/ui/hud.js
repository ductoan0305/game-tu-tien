// ============================================================
// ui/hud.js — Minimal HUD System (Session 14 rev2)
//
// API:
//   initHUD()   — tạo DOM, append to body, start 2s interval
//   updateHUD() — sync values từ window._G
//
// Constraints:
//   - Chỉ đọc gameState (window._G), không write
//   - Nếu _G undefined → render placeholder, không throw
//   - Không đụng .panel-left DOM
// ============================================================

import { SPIRIT_ELEMENTS } from '../core/spirit-root.js';
import { WORLD_NODES }     from './map-data.js';
import { calcMaxQi }       from '../core/state.js';

// Tên viết tắt cảnh giới (realmIdx 0-4)
const REALM_SHORT = ['LK', 'TC', 'KĐ', 'NA', 'HT'];

// Tên tân thủ thôn (hardcode tránh import thêm)
const STARTER_VILLAGE_NAMES = {
  thanh_phong_thon: 'Thanh Phong Thôn',
  hoa_diem_thon:    'Hỏa Diệm Thôn',
  han_bang_thon:    'Hàn Băng Thôn',
  lam_hai_thon:     'Lam Hải Thôn',
};

// ============================================================
// PUBLIC API
// ============================================================

export function initHUD() {
  _buildLeftHUD();
  _buildRightHUD();
  // 2s interval — right pill + nav badges (ít quan trọng, chậm được)
  setInterval(updateHUD, 2000);
}

export function updateHUD() {
  const G = window._G;
  if (!G || !G.setupDone) return;
  try {
    _updateLeftHUD(G);
    _updateRightPill(G);
    _updateNavBadges(G);
  } catch (e) {
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
    <div id="hud-left-header" class="hud-panel-header">
      <span class="hud-drag-hint">⠿</span>
    </div>
    <div class="hud-panel-body">
      <div id="hud-avatar" title="Xem thông tin nhân vật">
        <span id="hud-avatar-icon">🧘</span>
      </div>
      <div class="hud-info-col">
        <div id="hud-name">—</div>
        <div id="hud-realm-text">LK1</div>
      </div>
      <div class="hud-bars-col">
        <div class="hud-bar-row">
          <span class="hud-bar-lbl" style="color:#e05c4a">HP</span>
          <span class="hud-bar-val" id="hud-val-hp">—</span>
          <div class="hud-bar-h">
            <div class="hud-bar-h-fill" id="hud-bar-hp-fill" style="background:#e05c4a"></div>
          </div>
        </div>
        <div class="hud-bar-row">
          <span class="hud-bar-lbl" style="color:var(--spirit,#7b9ef0)">气</span>
          <span class="hud-bar-val" id="hud-val-mp">—</span>
          <div class="hud-bar-h">
            <div class="hud-bar-h-fill" id="hud-bar-mp-fill" style="background:var(--spirit,#7b9ef0)"></div>
          </div>
        </div>
        <div class="hud-bar-row">
          <span class="hud-bar-lbl" style="color:var(--jade,#56c46a)">EXP</span>
          <span class="hud-bar-val" id="hud-val-exp">—</span>
          <div class="hud-bar-h">
            <div class="hud-bar-h-fill" id="hud-bar-exp-fill" style="background:var(--jade,#56c46a)"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  // Avatar click → mở char popup
  document.getElementById('hud-avatar')?.addEventListener('click', () => {
    document.getElementById('btn-char-popup')?.click();
  });

  // Drag theo header
  _makeDraggable(el, document.getElementById('hud-left-header'));
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

function _updateLeftHUD(G) {
  // ── Avatar: border color theo hệ ngũ hành ──
  const mainEl   = G.spiritData?.mainElement;
  const elColor  = (mainEl && SPIRIT_ELEMENTS[mainEl]?.color) || 'var(--border)';
  const avatarEl = document.getElementById('hud-avatar');
  if (avatarEl) avatarEl.style.borderColor = elColor;

  // ── Tên nhân vật ──
  const nameEl = document.getElementById('hud-name');
  if (nameEl) nameEl.textContent = G.name || '—';

  // ── Cảnh giới ──
  const realmEl = document.getElementById('hud-realm-text');
  if (realmEl) {
    const ri    = G.realmIdx ?? 0;
    const stage = G.stage    ?? 1;
    realmEl.textContent = (REALM_SHORT[ri] || 'LK') + stage;
  }

  // ── HP bar ──
  const hp    = G.hp    ?? 0;
  const maxHp = G.maxHp ?? 1;
  _setHBarFill('hud-bar-hp-fill', hp, maxHp);
  _setText('hud-val-hp', `${_fmtShort(hp)}/${_fmtShort(maxHp)}`);

  // ── MP / Linh lực bar ──
  const qi    = G.qi ?? 0;
  const maxQi = _safeMaxQi(G);
  _setHBarFill('hud-bar-mp-fill', qi, maxQi);
  _setText('hud-val-mp', `${_fmtShort(qi)}/${_fmtShort(maxQi)}`);

  // ── EXP bar ──
  const exp    = G.exp    ?? 0;
  const maxExp = G.maxExp ?? 1;
  _setHBarFill('hud-bar-exp-fill', exp, maxExp);
  _setText('hud-val-exp', `${_fmtShort(exp)}/${_fmtShort(maxExp)}`);
}

function _updateRightPill(G) {
  // ── Linh thạch ──
  const stoneEl = document.getElementById('hud-stone');
  if (stoneEl) stoneEl.textContent = `💰 ${_fmtShort(G.stone ?? 0)}`;

  // ── Tu luyện ──
  const cultEl = document.getElementById('hud-cultivate');
  if (cultEl) cultEl.textContent = G.meditating ? '⚗️ 🟢' : '⚗️ ⚫';

  // ── Vị trí: ưu tiên tân thủ thôn nếu chưa rời ──
  const locEl = document.getElementById('hud-location');
  if (locEl) {
    let locName;
    if (!G.worldMap?.leftStarter) {
      // Còn trong tân thủ thôn → dùng tên thôn thật
      const svId = G.worldMap?.starterVillageId || '';
      locName = STARTER_VILLAGE_NAMES[svId] || 'Tân Thủ Thôn';
    } else {
      const nodeId = G.worldMap?.currentNodeId || '';
      const node   = WORLD_NODES.find(n => n.id === nodeId);
      locName = node?.name || '—';
    }
    locEl.textContent = `🗺️ ${locName}`;
  }
}

function _updateNavBadges(G) {
  const hasQuestBadge = _hasClaimableQuest(G);
  _applyBadge('quests', hasQuestBadge);
}

// ============================================================
// DRAG HELPER
// ============================================================

function _makeDraggable(panelEl, handleEl) {
  if (!handleEl || !panelEl) return;
  let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;

  function startDrag(cx, cy) {
    const rect  = panelEl.getBoundingClientRect();
    // Đóng băng vị trí hiện tại theo left/top tuyệt đối
    panelEl.style.right  = 'auto';
    panelEl.style.bottom = 'auto';
    panelEl.style.left   = rect.left + 'px';
    panelEl.style.top    = rect.top  + 'px';
    ox = rect.left; oy = rect.top;
    sx = cx; sy = cy;
    dragging = true;
  }

  function moveDrag(cx, cy) {
    if (!dragging) return;
    const W  = panelEl.offsetWidth;
    const H  = panelEl.offsetHeight;
    const nx = Math.max(0, Math.min(window.innerWidth  - W, ox + (cx - sx)));
    const ny = Math.max(0, Math.min(window.innerHeight - H, oy + (cy - sy)));
    panelEl.style.left = nx + 'px';
    panelEl.style.top  = ny + 'px';
  }

  handleEl.style.cursor = 'grab';

  handleEl.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
    handleEl.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup',   ()  => {
    dragging = false;
    handleEl.style.cursor = 'grab';
  });

  handleEl.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; });
}

// ============================================================
// HELPERS
// ============================================================

function _setHBarFill(fillId, value, max) {
  const el = document.getElementById(fillId);
  if (!el) return;
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  el.style.width = pct.toFixed(1) + '%';
}

function _setText(id, text) {
  const el = document.getElementById(id);
  if (el && el.textContent !== text) el.textContent = text;
}

function _safeMaxQi(G) {
  try { return calcMaxQi(G) || 1; }
  catch (_) { return G.qi || 1; }
}

function _hasClaimableQuest(G) {
  const q = G.quests;
  if (!q) return false;
  const daily  = Array.isArray(q.daily)  ? q.daily  : [];
  const active = Array.isArray(q.active) ? q.active : [];
  return daily.some(d => d.completed && !d.claimed)
      || active.some(a => a.status === 'completed');
}

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

function _fmt(n) {
  return Math.floor(n ?? 0).toLocaleString('vi-VN');
}

function _fmtShort(n) {
  n = Math.floor(n ?? 0);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}
