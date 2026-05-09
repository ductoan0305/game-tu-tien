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
import { calcBreakthroughChance }                      from '../core/actions.js';
import { getAmThuongStatus }                           from '../core/duoc-dien-engine.js';
import { showChroniclePanel }                          from '../app/popups/misc-popups.js';
import { calcQiRateBreakdown }                         from '../core/state.js';

const POPUP_ID = 'tu-luyen';

// Đếm số lần update để throttle slow path.
// Dùng modulo 10 — tránh overflow sau nhiều giờ chơi (tu tiên có thể 100h+)
let _slowTick = 0;

// ---- Helpers ----

function _el(id) { return document.getElementById(id); }

function _set(id, val) {
  const el = _el(id);
  if (el && el.textContent !== String(val)) el.textContent = String(val);
}

function _setText(el, val) {
  const s = String(val);
  if (el && el.textContent !== s) el.textContent = s;
}

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

function _fmtRealTime(sec) {
  sec = Math.floor(sec || 0);
  if (sec < 60)     return `${sec}s`;
  if (sec < 3600)   return `${Math.floor(sec / 60)} phút`;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h < 24)       return m > 0 ? `${h}g ${m}p` : `${h}g`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d} ngày ${rh}g` : `${d} ngày`;
}

function _fmtGameYears(years) {
  if (!years || years <= 0) return '< 1 tháng';
  if (years < 1)  return `${Math.floor(years * 12)} tháng`;
  if (years < 10) return `${years.toFixed(1)} năm`;
  return `${Math.floor(years)} năm`;
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

    <!-- Tu Tốc Chi Tiết -->
    <div class="tl-breakdown">
      <div class="tl-bd-title">⚡ Tu Tốc Chi Tiết</div>
      <div class="tl-bd-row">
        <span class="tl-bd-lbl" title="Tốc độ linh lực cơ bản theo cảnh giới — Luyện Khí thấp hơn Trúc Cơ, Kim Đan...">Cơ sở (cảnh giới)</span>
        <span class="tl-bd-val" id="tlp-bd-base">--</span>
      </div>
      <div class="tl-bd-row">
        <span class="tl-bd-lbl" title="Nhân hệ theo loại linh căn: Thiên ×1.5, Song ×1.25, Tam ×1.1, Tứ ×0.9, Ngũ ×0.7">× Linh Căn</span>
        <span class="tl-bd-val" id="tlp-bd-spirit">--</span>
      </div>
      <div class="tl-bd-row">
        <span class="tl-bd-lbl" title="Nhân hệ theo vùng tu luyện: Phàm Địa ×0.8 → Linh Địa ×1.2 → Phúc Địa ×1.8 → Động Phủ ×3 → Bảo Địa ×5">× Pháp Địa</span>
        <span class="tl-bd-val" id="tlp-bd-phapdia">--</span>
      </div>
      <div class="tl-bd-row">
        <span class="tl-bd-lbl" title="Nhân hệ theo công pháp đang tu — Vô Danh (tạp) ×0.7, công pháp tông môn cao hơn">× Công Pháp</span>
        <span class="tl-bd-val" id="tlp-bd-congphap">--</span>
      </div>
      <div class="tl-bd-row" id="tlp-bd-mastery-row" style="display:none">
        <span class="tl-bd-lbl" title="Bonus % từ thuần thục công pháp — càng nhập định lâu với 1 công pháp, bonus càng tăng">+ Thuần Thục C.Pháp</span>
        <span class="tl-bd-val" id="tlp-bd-mastery" style="color:#56c46a">--</span>
      </div>
      <div class="tl-bd-row" id="tlp-bd-other-row" style="display:none">
        <span class="tl-bd-lbl" title="Tổng bonus % từ passive skill, trận pháp hỗ trợ, trang bị linh thú">+ Bonus khác</span>
        <span class="tl-bd-val" id="tlp-bd-other" style="color:#56c46a">--</span>
      </div>
      <div class="tl-bd-total-row">
        <span class="tl-bd-lbl">= Tổng thực tế</span>
        <span id="tlp-bd-total" style="color:#7fb2ff;font-weight:700">--</span>
      </div>
    </div>

    <!-- Thời Gian — 3 chỉ số -->
    <div class="tl-time-strip">
      <div class="tl-ti">
        <span class="tl-ti-lbl">⏳ Tuổi</span>
        <span class="tl-ti-val" id="tlp-age2">--</span>
      </div>
      <div class="tl-ti">
        <span class="tl-ti-lbl" title="Thời gian tu luyện trong game (tổng cộng qua các cảnh giới)">🎮 Trong game</span>
        <span class="tl-ti-val" id="tlp-gametime">--</span>
      </div>
      <div class="tl-ti">
        <span class="tl-ti-lbl" title="Thời gian thực bạn đã ngồi chơi game này">🕐 Thực tế</span>
        <span class="tl-ti-val" id="tlp-realtime">--</span>
      </div>
    </div>

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

    <!-- Ngộ Đạo Ký -->
    <div style="padding:4px 0 2px">
      <button class="tl-btn-action" id="tlp-btn-chronicle" style="width:100%;font-size:11px;padding:5px 8px;opacity:0.75">
        📜 Ngộ Đạo Ký
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
  on('tlp-btn-chronicle',   () => { showChroniclePanel(G); });
}

// ---- Breakthrough button state ----

function _applyBtn(btn, text, cls, disabled) {
  _setText(btn, text);
  if (btn.className  !== cls)      btn.className  = cls;
  if (btn.disabled   !== disabled) btn.disabled   = disabled;
}

function _updateBreakthroughBtn(G) {
  const btBtn = _el('tlp-btn-breakthrough');
  if (!btBtn) return;

  // L2: Cooldown đột phá fail liên tiếp — đè lên mọi state khác
  const cdUntil = G._btFailCooldownUntil || 0;
  if (Date.now() < cdUntil) {
    const wait = Math.ceil((cdUntil - Date.now()) / 1000);
    _applyBtn(btBtn, `🧘 Tịnh Tâm (${wait}s)`, 'tl-btn-breakthrough', true);
    return;
  }

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

// ---- Hunger / Ám Thương status ----

function _updateHunger(G) {
  const hungerEl = _el('tlp-hunger');
  if (!hungerEl) return;
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

function _updateAmThuong(G) {
  const atEl   = _el('tlp-am-thuong');
  const status = getAmThuongStatus(G);
  if (!atEl) return;
  if (status?.points > 0) {
    const sev   = status.severity;
    const color = (sev === 'critical' || sev === 'heavy') ? '#e05c4a' : '#f0d47a';
    _setText(atEl, `🩸 Ám Thương ${status.points} điểm (Căn Cốt -${status.canCotPenalty})`);
    _setStyle(atEl, 'color',   color);
    _setStyle(atEl, 'display', '');
  } else {
    _setStyle(atEl, 'display', 'none');
  }
}

// ---- Meditate button ----

function _updateMedBtn(G) {
  const medBtn = _el('tlp-btn-meditate');
  if (!medBtn) return;
  const med     = !!G.meditating;
  const medText = med ? '🧘 Xuất Định' : '🧘 Nhập Định';
  _setText(medBtn, medText);
  if (medBtn.classList.contains('active') !== med) medBtn.classList.toggle('active', med);
}

// ============================================================
// PUBLIC API
// ============================================================

export function openTuLuyenPopup(G, cultivateActions) {
  if (PopupManager.isOpen(POPUP_ID)) {
    updateTuLuyenPopup(G);
    return;
  }

  const bodyEl = _buildBody();
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

  _wireButtons(G, cultivateActions);
  updateTuLuyenPopup(G);
}

export function updateTuLuyenPopup(G) {
  if (!PopupManager.isOpen(POPUP_ID)) return;
  if (!G) return;

  // Modulo 10 thay vì increment thuần — an toàn sau 100h+ chơi tu tiên
  _slowTick = (_slowTick + 1) % 10;

  // ══ FAST PATH (~0.2s) ══
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

  const threshold = calcPurityThreshold(G);
  const purity    = G.purity ?? 0;
  const purPct    = threshold > 0 ? Math.min(100, (purity / threshold * 100)).toFixed(0) : '0';
  _set('tlp-purity', `${Math.floor(purity)} (${purPct}%)`);

  _updateMedBtn(G);
  _updateBreakthroughBtn(G);
  _updateHunger(G);
  _updateAmThuong(G);

  // ══ SLOW PATH (~2s) ══
  if (_slowTick !== 0) return;

  const realmName = REALMS[G.realmIdx]?.name ?? 'Luyện Khí';
  _set('tlp-realm', `${realmName} · ${_stageName(G)}`);

  const age      = G.gameTime?.currentYear ?? 16;
  const ageColor = age < 70 ? '#56c46a' : age < 75 ? '#f0d47a' : '#e05c4a';
  const ageEl    = _el('tlp-age');
  if (ageEl) {
    _setText(ageEl, `${Math.floor(age)} tuổi`);
    _setStyle(ageEl, 'color', ageColor);
  }

  // calcQiRateBreakdown gọi 1 lần duy nhất cho cả rate + breakdown
  const bd = calcQiRateBreakdown(G);
  _set('tlp-rate', `${bd.totalQiRate}/s`);
  _set('tlp-atk', calcAtk(G));
  _set('tlp-def', calcDef(G));

  _set('tlp-bd-base',    bd.base.toFixed(3));
  _set('tlp-bd-spirit',  `×${bd.spiritMult.toFixed(2)}`);
  _set('tlp-bd-phapdia', `×${bd.phapDiaMult.toFixed(1)}`);
  _set('tlp-bd-congphap',`×${bd.congPhapMult.toFixed(2)}`);

  const mastRow = _el('tlp-bd-mastery-row');
  if (mastRow) _setStyle(mastRow, 'display', bd.masteryBonusPct > 0 ? '' : 'none');
  if (bd.masteryBonusPct > 0) _set('tlp-bd-mastery', `+${bd.masteryBonusPct.toFixed(0)}%`);

  const otherRow = _el('tlp-bd-other-row');
  if (otherRow) _setStyle(otherRow, 'display', bd.otherPct > 0 ? '' : 'none');
  if (bd.otherPct > 0) _set('tlp-bd-other', `+${bd.otherPct}%`);

  const totalEl = _el('tlp-bd-total');
  if (totalEl) {
    const totalStr = G.meditating
      ? `${bd.totalQiRate}/s (nhập định)`
      : `${bd.totalQiRate}/s ⚠ chưa nhập định`;
    _setText(totalEl, totalStr);
    _setStyle(totalEl, 'color', G.meditating ? '#7fb2ff' : '#888');
  }

  const ageVal    = Math.floor(G.gameTime?.currentYear ?? 16);
  const gameYears = G.gameTime?.totalYears ?? 0;
  const realSec   = G.totalTime ?? 0;
  _set('tlp-age2',     `${ageVal} tuổi`);
  _set('tlp-gametime', _fmtGameYears(gameYears));
  _set('tlp-realtime', _fmtRealTime(realSec));

  const pdId    = G.phapDia?.currentId || 'pham_dia';
  const cpCount = (G.congPhap?.activeIds ?? []).length;
  const pdMap   = {
    pham_dia: '🏚 Phàm Địa', linh_dia: '🌿 Linh Địa',
    phuc_dia: '🏔 Phúc Địa', dong_phu: '🕳 Động Phủ', bao_dia: '💎 Bảo Địa',
  };
  _set('tlp-phapdia', `${pdMap[pdId] || pdId} · ${cpCount} Công Pháp`);
}

export function isTuLuyenPopupOpen() {
  return PopupManager.isOpen(POPUP_ID);
}

export function closeTuLuyenPopup() {
  PopupManager.close(POPUP_ID);
}
