// ============================================================
// ui/tab-popup.js — Tab Popup System (Session 15)
//
// Thay thế cơ chế switch-tab truyền thống bằng popup nổi.
// Mỗi tab mở một popup floating, draggable, có thể đồng thời nhiều cái.
// Cultivate (world map) luôn là background canvas — không popup hóa.
//
// API:
//   openTabPopup(tabId, G, renderFn)  — mở popup (focus nếu đã mở)
//   closeTabPopup(tabId)              — đóng popup của tab cụ thể
//   closeAllTabPopups()               — đóng toàn bộ tab popups
//   isTabPopupOpen(tabId) → bool
//
// Cơ chế DOM:
//   #panel-{tabId} được move vào .pm-body khi popup mở,
//   và move trở lại .panel-center khi popup đóng.
//   Event listeners được giữ nguyên (DOM node move, không clone).
// ============================================================

import PopupManager from './popup-manager.js';
import { switchTab } from './render-core.js';

/**
 * Kiểm tra có bất kỳ tab popup nào đang mở không.
 * Dùng trong main.js để toggle cultivate button (home vs Tu Luyện).
 */
export function isAnyTabPopupOpen() {
  return _openTabPopupCount() > 0;
}

// ---- Config per tab: title hiển thị + chiều rộng pixel ----
// Không có 'cultivate' — tab đó là background canvas, không popup.
const TAB_POPUP_CFG = {
  // Main nav tabs
  quests:      { title: '📜 Nhiệm Vụ',     width: 560 },
  inventory:   { title: '🎒 Túi Đồ',       width: 540 },
  nghe_nghiep: { title: '🛠 Nghề Nghiệp',   width: 600 },
  // "Thêm" panel tabs
  combat:      { title: '⚔ Chiến Đấu',      width: 580 },
  dungeon:     { title: '☠ Địa Phủ',       width: 540 },
  sect:        { title: '🏯 Tông Môn',      width: 520 },
  passive:     { title: '✧ Thiên Phú',      width: 560 },
  equipment:   { title: '🗡 Trang Bị',      width: 600 },
  skills:      { title: '✦ Kỹ Năng',        width: 540 },
  phapdia:     { title: '🏔 Pháp Địa',      width: 560 },
  shop:        { title: '🏮 Cửa Hàng',      width: 520 },
  ranking:     { title: '🏆 Xếp Hạng',      width: 500 },
  linh_thu:    { title: '🐾 Linh Thú',      width: 560 },
  // Sub-tabs (accessible qua Nghề Nghiệp hoặc trực tiếp)
  alchemy:     { title: '⚗ Luyện Đan',      width: 560 },
  tran_phap:   { title: '🔮 Trận Pháp',     width: 560 },
  phu_chu:     { title: '📿 Phù Chú',       width: 540 },
  khoi_loi:    { title: '🤖 Khôi Lỗi',      width: 540 },
  linh_thuc:   { title: '🍲 Linh Thực',     width: 540 },
};

// ---- Helpers ----

const _pid = (tabId) => `tab-popup-${tabId}`;

/** Container gốc của các panel khi chưa popup */
let _panelContainer = null;
function _getContainer() {
  if (!_panelContainer) {
    _panelContainer = document.querySelector('.panel-center');
  }
  return _panelContainer;
}

/** Số tab-popup đang mở trong DOM */
function _openTabPopupCount() {
  return document.querySelectorAll('.pm-popup.pm-tab-popup').length;
}

/** Tính vị trí cho popup mới — cascade nhẹ để tránh che nhau */
function _calcPos(width) {
  const n  = _openTabPopupCount();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const estimatedH = Math.min(vh * 0.84, 860);
  const cx = Math.max(10, Math.min(vw - width - 10,  (vw - width)  / 2 + n * 24));
  const cy = Math.max(10, Math.min(vh - estimatedH - 54, (vh - estimatedH) / 2 + n * 24));
  return { x: Math.round(cx), y: Math.round(cy) };
}

// ---- Public API ----

/**
 * Mở tab như floating popup.
 * - Cultivate: đóng tất cả tab popups, refresh map.
 * - Tab khác: nếu popup đã mở → chỉ re-render, không tạo mới.
 *
 * @param {string}   tabId    — id tab (vd 'quests', 'combat')
 * @param {object}   G        — game state
 * @param {Function} renderFn — hàm render nội dung (không nhận arg)
 */
export function openTabPopup(tabId, G, renderFn) {
  // Cultivate là background canvas — không popup hóa
  if (tabId === 'cultivate') {
    closeAllTabPopups();
    switchTab('cultivate', G);
    if (renderFn) renderFn();
    return;
  }

  const cfg = TAB_POPUP_CFG[tabId];
  if (!cfg) {
    // Tab không có config → fallback về switch tab cũ
    switchTab(tabId, G);
    if (renderFn) renderFn();
    return;
  }

  const pid = _pid(tabId);

  // Nếu popup đã mở → chỉ re-render và return (không mở duplicate)
  if (PopupManager.isOpen(pid)) {
    if (renderFn) renderFn();
    return;
  }

  // Cập nhật nav active state — KHÔNG dùng switchTab() vì nó sẽ ẩn panel-cultivate
  // (world map canvas phải luôn là background, không bị hide khi popup mở).
  if (G) G.activeTab = tabId;
  document.querySelectorAll('.nav-btn, .bnav-btn, .bmp-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.getElementById('bnav-more-panel')?.style &&
    (document.getElementById('bnav-more-panel').style.display = 'none');
  document.dispatchEvent(new CustomEvent('tab:switch', { detail: { tabId, G } }));

  const panelEl   = document.getElementById(`panel-${tabId}`);
  const container = _getContainer();
  const { x, y }  = _calcPos(cfg.width);

  // Cleanup khi đóng popup: trả panel về container gốc
  const onClose = () => {
    // Trả panel về panel-center (ẩn)
    if (panelEl && container) {
      panelEl.classList.remove('panel-in-popup');
      panelEl.style.display = 'none';
      container.appendChild(panelEl);
    }
    // Bỏ active khỏi nav buttons của tab này
    document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(btn => {
      btn.classList.remove('active');
    });
    // Nếu đây là popup cuối cùng đang đóng → kích hoạt lại nav cultivate
    // _openTabPopupCount() tính trước khi el.remove() nên = 1 khi là cái cuối
    if (_openTabPopupCount() <= 1) {
      document.querySelectorAll('[data-tab="cultivate"]').forEach(btn => {
        btn.classList.add('active');
      });
      if (G) G.activeTab = 'cultivate';
    }
  };

  // Mở popup qua PopupManager
  PopupManager.open(pid, {
    title:      cfg.title,
    width:      cfg.width,
    x, y,
    onClose,
    extraClass: 'pm-tab-popup',
  });

  // Move panel vào popup body (giữ nguyên event listeners)
  if (panelEl) {
    panelEl.style.display = '';
    panelEl.classList.add('panel-in-popup');
    const body = document.querySelector(`[data-popup-id="${pid}"] .pm-body`);
    if (body) body.appendChild(panelEl);
  }

  // Render nội dung vào panel (đang nằm trong popup body)
  if (renderFn) renderFn();
}

/**
 * Đóng popup của một tab cụ thể.
 * @param {string} tabId
 */
export function closeTabPopup(tabId) {
  PopupManager.close(_pid(tabId));
}

/**
 * Đóng tất cả tab popups đang mở.
 */
export function closeAllTabPopups() {
  Object.keys(TAB_POPUP_CFG).forEach(tabId => {
    PopupManager.close(_pid(tabId));
  });
}

/**
 * Kiểm tra tab popup đang mở hay không.
 * @param {string} tabId
 * @returns {boolean}
 */
export function isTabPopupOpen(tabId) {
  return PopupManager.isOpen(_pid(tabId));
}
