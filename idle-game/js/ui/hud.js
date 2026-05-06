// ============================================================
// ui/hud.js — Minimal HUD System (Session 14 rev2)
// Session 17: char-compact-popup dùng PopupManager (drag+resize)
//             Xóa _makeDraggable riêng, đổi id hud-left → char-compact
//
// API:
//   initHUD()   — tạo popup compact, start 2s interval
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
import PopupManager        from './popup-manager.js';

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
  _buildCharCompactPopup();
  // 2s interval — nav badges (ít quan trọng, chậm được)
  setInterval(updateHUD, 2000);
}

export function updateHUD() {
  const G = window._G;
  if (!G || !G.setupDone) return;
  try {
    _updateCharCompact(G);
    _updateNavBadges(G);
  } catch (e) {
    console.warn('[hud] updateHUD error:', e);
  }
}

// ============================================================
// BUILD DOM — char-compact-popup (trước đây là hud-left)
// Dùng PopupManager để có drag + resize thống nhất
// ============================================================

function _buildCharCompactPopup() {
  if (PopupManager.isOpen('char-compact')) return; // idempotent

  const bodyEl = document.createElement('div');
  bodyEl.className = 'char-compact-body';
  bodyEl.innerHTML = `
    <div id="hud-avatar" title="Xem thông tin nhân vật" class="cc-avatar">
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
    </div>
  `;

  PopupManager.open('char-compact', {
    title:      '⚕ Nhân Vật',
    content:    bodyEl,
    width:      260,
    x:          10,
    y:          60,
    extraClass: 'pm-char-compact',
  });

  // Avatar click → mở char popup đầy đủ
  document.getElementById('hud-avatar')?.addEventListener('click', () => {
    document.getElementById('btn-char-popup')?.click();
  });
}

// ============================================================
// UPDATE FUNCTIONS
// ============================================================

function _updateCharCompact(G) {
  // Chỉ update nếu popup đang mở
  if (!PopupManager.isOpen('char-compact')) return;

  // ── Avatar: border color theo hệ ngũ hành ──
  const mainEl   = G.spiritData?.mainElement;
  const elColor  = (mainEl && SPIRIT_ELEMENTS[mainEl]?.color) || 'var(--border)';
  const avatarEl = document.getElementById('hud-avatar');
  if (avatarEl) avatarEl.style.borderColor = elColor;

  // ── Tên nhân vật ──
  _setText('hud-name', G.name || '—');

  // ── Cảnh giới ──
  const ri    = G.realmIdx ?? 0;
  const stage = G.stage    ?? 1;
  _setText('hud-realm-text', (REALM_SHORT[ri] || 'LK') + stage);

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

}

function _updateNavBadges(G) {
  const hasQuestBadge = _hasClaimableQuest(G);
  _applyBadge('quests', hasQuestBadge);
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

function _fmtShort(n) {
  n = Math.floor(n ?? 0);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}
