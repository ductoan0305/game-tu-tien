// ============================================================
// ui/tu-luyen-popup.js — Popup Tu Luyện (S-H4)
//
// Floating popup thay thế cơ chế "Tu Luyện = close all popups".
// Cho phép người chơi xem stats + thực hiện cultivation actions
// mà không cần vào từng location popup.
//
// API:
//   openTuLuyenPopup(G, cultivateActions)  — mở / focus popup
//   updateTuLuyenPopup(G)                  — cập nhật values (gọi mỗi tick)
//   isTuLuyenPopupOpen()                   — bool
//   closeTuLuyenPopup()                    — đóng popup
// ============================================================

import PopupManager          from './popup-manager.js';
import { REALMS }             from '../core/data.js';
import {
  calcQiRate, calcMaxQi, calcAtk, calcDef, calcMaxHp,
  calcPurityThreshold,
} from '../core/state.js';
import { calcBreakthroughChance } from '../core/actions.js';
import { getAmThuongStatus }      from '../core/duoc-dien-engine.js';

const POPUP_ID = 'tu-luyen';

// ---- Helpers ----

function _el(id) { return document.getElementById(id); }

// Guard textContent update theo ID
function _set(id, val) {
  const el = _el(id);
  if (el && el.textContent !== String(val)) el.textContent = String(val);
}

// Guard textContent trực tiếp trên element ref
function _setText(el, val) {
  const s = String(val);
  if (el && el.textContent !== s) el.textContent = s;
}

// Guard style property — tránh trigger repaint khi giá trị không đổi
function _setStyle(el, prop, val) {
  if (el && el.style[prop] !== val) el.style[prop] = val;
}

function _setBar(prefix, value, max) {
  const fill = _el(`${prefix}-fill`);
  if (!fill) return;
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)).toFixed(1) : '0';
  if (fill.style.width !== pct + '%') fill.style.width = pct + '%';
}

function _stageName(G) {
  const realm = REALMS[G.realmIdx];
  return realm?.stageNames?.[G.stage - 1] ?? `Tầng ${G.stage}`;
}

function _fmtShort(n) {
  n = Math.floor(n ?? 0);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

// ---- Build DOM ----

function _buildBody() {
  const div = document.createElement('div');
  div.className = 'tl-popup-content';
  div.innerHTML = `
    <!-- Realm + Tuổi -->
    <div class="tl-header-row">
      <span class="tl-realm" id="tlp-realm">Luyện Khí · Tầng 1</span>
      <span class="tl-age"   id="tlp-age">10 tuổi</span>
    </div>

    <!-- Bars: Linh Lực / HP / Thể Năng -->
    <div class="tl-bars">
      <div class="tl-bar-row">
        <span class="tl-bar-lbl" style="color:var(--spirit,#7b9ef0)">气</span>
        <div class="tl-bar-wrap">
          <div class="tl-bar-fill" id="tlp-qi-fill" style="background:var(--spirit,#7b9ef0);width:0%"></div>
        </div>
        <span class="tl-bar-val" id="tlp-qi-val">--</span>
      </div>
      <div class="tl-bar-row">
        <span class="tl-bar-lbl" style="color:#e05c4a">HP</span>
        <div class="tl-bar-wrap">
          <div class="tl-bar-fill" id="tlp-hp-fill" style="background:#e05c4a;width:100%"></div>
        </div>
        <span class="tl-bar-val" id="tlp-hp-val">--</span>
      </div>
      <div class="tl-bar-row">
        <span class="tl-bar-lbl" style="color:#56c46a" title="Thể Năng">⚡</span>
        <div class="tl-bar-wrap">
          <div class="tl-bar-fill" id="tlp-st-fill" style="background:#56c46a;width:100%"></div>
        </div>
        <span class="tl-bar-val" id="tlp-st-val">--</span>
      </div>
    </div>

    <!-- Stats Grid 2×2 -->
    <div class="tl-stats-grid">
      <div class="tl-stat-item">
        <span class="tl-stat-lbl">⚡ Tu tốc</span>
        <span class="tl-stat-val" id="tlp-rate">--</span>
      </div>
      <div class="tl-stat-item">
        <span class="tl-stat-lbl">✨ Thuần Độ</span>
        <span class="tl-stat-val" id="tlp-purity">--</span>
      </div>
      <div class="tl-stat-item">
        <span class="tl-stat-lbl">⚔ Công kích</span>
        <span class="tl-stat-val" id="tlp-atk">--</span>
      </div>
      <div class="tl-stat-item">
        <span class="tl-stat-lbl">🛡 Phòng thủ</span>
        <span class="tl-stat-val" id="tlp-def">--</span>
      </div>
    </div>

    <!-- Pháp Địa + Công Pháp -->
    <div class="tl-method-row" id="tlp-phapdia">🏚 Phàm Địa · 0 Công Pháp</div>

    <!-- Status indicators (ẩn khi không cần) -->
    <div class="tl-status-row" id="tlp-hunger"    style="display:none"></div>
    <div class="tl-status-row" id="tlp-am-thuong" style="display:none"></div>

    <!-- Action Buttons — chỉ idle actions (không phụ thuộc địa điểm) -->
    <div class="tl-actions">
      <button class="tl-btn-meditate" id="tlp-btn-meditate">🧘 Nhập Định</button>
      <button class="tl-btn-action"   id="tlp-btn-rest">😴 Nghỉ Ngơi</button>
    </div>

    <!-- Đột Phá — nổi bật riêng -->
    <div class="tl-breakthrough-wrap">
      <button class="tl-btn-breakthrough" id="tlp-btn-breakthrough" disabled>
        ⚡ Đột Phá
      </button>
    </div>
  `;
  return div;
}

// ---- Wire event listeners ----

function _wireButtons(G, actions) {
  const on = (id, fn) => _el(id)?.addEventListener('click', fn);

  on('tlp-btn-meditate',    () => { actions.meditate();    updateTuLuyenPopup(G); });
  on('tlp-btn-rest',        () => { actions.rest();        updateTuLuyenPopup(G); });
  on('tlp-btn-breakthrough',() => { actions.breakthrough(); updateTuLuyenPopup(G); });
}

// ---- Breakthrough button state ----

// Guard tất cả 3 property của một button trong 1 lần
function _applyBtn(btn, text, cls, disabled) {
  _setText(btn, text);
  if (btn.className  !== cls)      btn.className  = cls;
  if (btn.disabled   !== disabled) btn.disabled   = disabled;
}

function _updateBreakthroughBtn(G) {
  const btBtn = _el('tlp-btn-breakthrough');
  if (!btBtn) return;

  const maxQi  = calcMaxQi(G);
  const qi     = G.qi ?? 0;
  const qiFull = qi >= maxQi;

  if (!qiFull) {
    const pct = Math.floor(Math.min(100, (qi / Math.max(1, maxQi)) * 100));
    _applyBtn(btBtn, `⚡ Đột Phá (${pct}% Linh Lực)`, 'tl-btn-breakthrough', true);
    return;
  }

  const threshold  = calcPurityThreshold(G);
  const purRatio   = (G.purity ?? 0) / Math.max(1, threshold);
  const canAttempt = purRatio >= 0.5;

  if (canAttempt) {
    const { chance } = calcBreakthroughChance(G);
    const cls = 'tl-btn-breakthrough ready' + (purRatio >= 1.0 ? ' purity-ready' : '');
    _applyBtn(btBtn, `⚡ ĐỘT PHÁ! (${chance.toFixed(1)}%)`, cls, false);
  } else {
    const purPct = Math.floor(purRatio * 100);
    _applyBtn(btBtn, `✨ Tinh Luyện Thuần Độ (${purPct}%)`, 'tl-btn-breakthrough', true);
  }
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Mở (hoặc focus) popup Tu Luyện.
 * @param {object} G               — game state
 * @param {object} cultivateActions — object với meditate/rest/breakthrough
 */
export function openTuLuyenPopup(G, cultivateActions) {
  if (PopupManager.isOpen(POPUP_ID)) {
    // Popup đã mở — chỉ refresh values
    updateTuLuyenPopup(G);
    return;
  }

  const bodyEl = _buildBody();

  // Vị trí: góc phải trên (tránh char-compact ở góc trái)
  const vw = window.innerWidth;
  const x  = Math.max(10, vw - 310 - 10);

  PopupManager.open(POPUP_ID, {
    title:      '🧘 Tu Luyện',
    content:    bodyEl,
    width:      300,
    x,
    y:          60,
    extraClass: 'pm-tu-luyen',
  });

  // Wire buttons SAU khi DOM đã append vào popup
  _wireButtons(G, cultivateActions);
  // Render lần đầu
  updateTuLuyenPopup(G);
}

/**
 * Cập nhật tất cả stat/bar trong popup.
 * Gọi mỗi game tick (safe nếu popup chưa mở).
 */
export function updateTuLuyenPopup(G) {
  if (!PopupManager.isOpen(POPUP_ID)) return;
  if (!G) return;

  // ── Realm + Stage ──
  const realmName = REALMS[G.realmIdx]?.name ?? 'Luyện Khí';
  _set('tlp-realm', `${realmName} · ${_stageName(G)}`);

  // ── Tuổi ──
  const age      = G.gameTime?.currentYear ?? 10;
  const ageColor = age < 70 ? '#56c46a' : age < 75 ? '#f0d47a' : '#e05c4a';
  const ageEl    = _el('tlp-age');
  if (ageEl) {
    _setText(ageEl, `${Math.floor(age)} tuổi`);
    _setStyle(ageEl, 'color', ageColor);
  }

  // ── Bars ──
  const maxQi = calcMaxQi(G);
  const qi    = G.qi ?? 0;
  _setBar('tlp-qi', qi, maxQi);
  _set('tlp-qi-val', `${_fmtShort(qi)}/${_fmtShort(maxQi)}`);

  const maxHp = calcMaxHp(G);
  const hp    = G.hp ?? 0;
  _setBar('tlp-hp', hp, maxHp);
  _set('tlp-hp-val', `${_fmtShort(hp)}/${_fmtShort(maxHp)}`);

  const maxSt = G.maxStamina ?? 100;
  const st    = G.stamina ?? 0;
  _setBar('tlp-st', st, maxSt);
  _set('tlp-st-val', `${Math.floor(st)}/${maxSt}`);

  // ── Stats Grid ──
  const rate = calcQiRate(G);
  _set('tlp-rate', `${rate}/s`);
  _set('tlp-atk', calcAtk(G));
  _set('tlp-def', calcDef(G));

  const threshold = calcPurityThreshold(G);
  const purity    = G.purity ?? 0;
  const purPct    = threshold > 0 ? Math.min(100, (purity / threshold * 100)).toFixed(0) : '0';
  _set('tlp-purity', `${Math.floor(purity)} (${purPct}%)`);

  // ── Pháp Địa + Công Pháp ──
  const pdId   = G.phapDia?.currentId || 'pham_dia';
  const cpCount = (G.congPhap?.activeIds ?? []).length;
  const pdMap  = {
    pham_dia: '🏚 Phàm Địa', linh_dia: '🌿 Linh Địa',
    phuc_dia: '🏔 Phúc Địa', dong_phu: '🕳 Động Phủ', bao_dia: '💎 Bảo Địa',
  };
  _set('tlp-phapdia', `${pdMap[pdId] || pdId} · ${cpCount} Công Pháp`);

  // ── Hunger (chỉ LK) ──
  const hungerEl = _el('tlp-hunger');
  if (hungerEl) {
    if (G.realmIdx === 0) {
      const h      = G.hunger;
      const days   = h?.hungerDays ?? 0;
      const lingme = h?.linhMeCount ?? 0;
      const ich    = h?.ichCocDanDays ?? 0;
      let hText, hColor;
      if (ich > 0) {
        hText  = `💊 Ích Cốc Đan (còn ${Math.ceil(ich)} ngày)`;
        hColor = '#56c46a';
      } else if (days === 0) {
        hText  = `🌾 No đủ — còn ${lingme} phần Linh Mễ`;
        hColor = lingme <= 2 ? '#f0d47a' : '#56c46a';
      } else if (days < 5) {
        hText  = `⚠ Đói ${days} ngày — mất HP dần`;
        hColor = '#f0d47a';
      } else {
        hText  = `💀 Đói nặng ${days} ngày — nguy hiểm!`;
        hColor = '#e05c4a';
      }
      _setText(hungerEl, hText);
      _setStyle(hungerEl, 'color',   hColor);
      _setStyle(hungerEl, 'display', '');
    } else {
      _setStyle(hungerEl, 'display', 'none');
    }
  }

  // ── Ám Thương ──
  const atEl   = _el('tlp-am-thuong');
  const status = getAmThuongStatus(G);
  if (atEl) {
    if (status?.points > 0) {
      const sev    = status.severity;
      const color  = (sev === 'critical' || sev === 'heavy') ? '#e05c4a' : '#f0d47a';
      const atText = `🩸 Ám Thương ${status.points} điểm (Căn Cốt -${status.canCotPenalty})`;
      _setText(atEl, atText);
      _setStyle(atEl, 'color',   color);
      _setStyle(atEl, 'display', '');
    } else {
      _setStyle(atEl, 'display', 'none');
    }
  }

  // ── Nút Nhập Định ──
  const medBtn = _el('tlp-btn-meditate');
  if (medBtn) {
    const med     = !!G.meditating;
    const medText = med ? '🧘 Xuất Định' : '🧘 Nhập Định';
    _setText(medBtn, medText);
    // classList.toggle chỉ fire khi state thực sự thay đổi
    if (medBtn.classList.contains('active') !== med) medBtn.classList.toggle('active', med);
  }

  // ── Nút Đột Phá ──
  _updateBreakthroughBtn(G);
}

/** Kiểm tra popup có đang mở không */
export function isTuLuyenPopupOpen() {
  return PopupManager.isOpen(POPUP_ID);
}

/** Đóng popup */
export function closeTuLuyenPopup() {
  PopupManager.close(POPUP_ID);
}
