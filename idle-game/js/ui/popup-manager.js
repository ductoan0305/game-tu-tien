// ============================================================
// popup-manager.js — PopupManager singleton
// Session 13: Layout Collapse + Popup System Foundation
// Session 15: Drag + onClose + extraClass
// Session 16: Resize (8-direction handles)
//
// API:
//   PopupManager.open(id, { title, content, width, height, x, y, extraClass, onClose })
//   PopupManager.close(id)
//   PopupManager.toggle(id, opts)
//   PopupManager.isOpen(id) → bool
//   PopupManager.setContent(id, content)
//   PopupManager.closeAll()
//
// Behavior:
//   - Drag: kéo header để di chuyển
//   - Resize: 8 handle (cạnh + góc), clamp trong viewport
//   - Click outside → KHÔNG đóng (game context)
//   - ESC → đóng popup mở sau cùng
// ============================================================

/** Map<id, { el: HTMLElement, opts: object }> */
const _popups = new Map();

/** Stack để track thứ tự mở (LIFO cho ESC) */
const _order = [];

/** Map<id, Function> — callbacks gọi khi popup đóng */
const _cleanups = new Map();

// ---- Layer ----

function _getLayer() {
  let layer = document.getElementById('popup-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'popup-layer';
    document.body.appendChild(layer);
  }
  return layer;
}

// ---- Drag helper ----

function _makeDraggable(popupEl, handleEl) {
  if (!handleEl || !popupEl) return;
  let drag = false, sx = 0, sy = 0, ox = 0, oy = 0;

  handleEl.addEventListener('mousedown', (e) => {
    // Bỏ qua nếu click vào button trong header (e.g. close button)
    if (e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    const r = popupEl.getBoundingClientRect();
    ox = r.left; oy = r.top; sx = e.clientX; sy = e.clientY;
    drag = true;
    handleEl.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  });

  const onMove = (e) => {
    if (!drag) return;
    const W  = popupEl.offsetWidth;
    const H  = popupEl.offsetHeight;
    const nx = Math.max(0, Math.min(window.innerWidth  - W, ox + (e.clientX - sx)));
    const ny = Math.max(0, Math.min(window.innerHeight - H, oy + (e.clientY - sy)));
    popupEl.style.left      = nx + 'px';
    popupEl.style.top       = ny + 'px';
    popupEl.style.transform = 'none';
  };

  const onUp = () => {
    if (!drag) return;
    drag = false;
    handleEl.style.cursor = 'move';
    document.body.style.userSelect = '';
  };

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup',   onUp);
}

// ---- Resize helper ----

const _MIN_W = 240; // px — chiều rộng tối thiểu
const _MIN_H = 160; // px — chiều cao tối thiểu

function _makeResizable(popupEl) {
  if (!popupEl) return;

  let resizing = false;
  let dir = '';
  let sx = 0, sy = 0;       // mouse start
  let ox = 0, oy = 0;       // popup origin (left, top)
  let ow = 0, oh = 0;       // popup origin (width, height)

  // Wire mỗi handle
  popupEl.querySelectorAll('.pm-resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation(); // không trigger drag header
      const r = popupEl.getBoundingClientRect();
      ox = r.left; oy = r.top;
      ow = r.width; oh = r.height;
      sx = e.clientX; sy = e.clientY;
      dir = handle.dataset.dir;
      resizing = true;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = handle.style.cursor || 'se-resize';
    });
  });

  const onMove = (e) => {
    if (!resizing) return;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let newX = ox, newY = oy, newW = ow, newH = oh;

    // --- Horizontal ---
    if (dir.includes('e')) {
      // Kéo phải: chỉ thay đổi width, clamp để không vượt viewport
      newW = Math.max(_MIN_W, Math.min(vw - ox, ow + dx));
    }
    if (dir.includes('w')) {
      // Kéo trái: width giảm, left tăng (giữ cạnh phải cố định)
      const maxShrink = ow - _MIN_W;    // tối đa shrink
      const clampedDx = Math.max(-ox, Math.min(maxShrink, dx));
      newW = ow - clampedDx;
      newX = ox + clampedDx;
    }

    // --- Vertical ---
    // effectiveMinH: nếu popup đang nhỏ hơn _MIN_H (vd char-compact fit-content),
    // không để resize nhảy lên _MIN_H — dùng oh làm floor thay thế.
    const effectiveMinH = Math.min(_MIN_H, oh);
    if (dir.includes('s')) {
      // Kéo xuống: chỉ thay đổi height
      newH = Math.max(effectiveMinH, Math.min(vh - oy, oh + dy));
    }
    if (dir.includes('n')) {
      // Kéo lên: height giảm, top tăng (giữ cạnh dưới cố định)
      const maxShrink = Math.max(0, oh - effectiveMinH); // luôn >= 0
      const clampedDy = Math.max(-oy, Math.min(maxShrink, dy));
      newH = oh - clampedDy;
      newY = oy + clampedDy;
    }

    popupEl.style.left      = newX + 'px';
    popupEl.style.top       = newY + 'px';
    popupEl.style.width     = newW + 'px';
    popupEl.style.height    = newH + 'px';
    popupEl.style.transform = 'none';
    // Override CSS max-height khi user resize thủ công
    popupEl.style.maxHeight = 'none';
  };

  const onUp = () => {
    if (!resizing) return;
    resizing = false;
    dir = '';
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup',   onUp);
}

// ---- Build DOM ----

function _buildEl(id, opts = {}) {
  const { title = '', content = '', width, height, x, y, extraClass } = opts;

  const el = document.createElement('div');
  el.className = extraClass ? `pm-popup ${extraClass}` : 'pm-popup';
  el.dataset.popupId = id;

  // Kích thước tùy chọn
  if (width)  el.style.width  = typeof width  === 'number' ? width  + 'px' : width;
  if (height) el.style.height = typeof height === 'number' ? height + 'px' : height;

  // Vị trí: x/y override, mặc định center màn hình
  if (x !== undefined && y !== undefined) {
    el.style.left      = typeof x === 'number' ? x + 'px' : x;
    el.style.top       = typeof y === 'number' ? y + 'px' : y;
    el.style.transform = 'none';
  } else {
    el.style.left      = '50%';
    el.style.top       = '50%';
    el.style.transform = 'translate(-50%, -50%)';
  }

  // HTML cơ bản + 8 resize handles
  el.innerHTML = `
    <div class="pm-header">
      <span class="pm-title"></span>
      <button class="pm-close" aria-label="Đóng">✕</button>
    </div>
    <div class="pm-body"></div>
    <div class="pm-resize-handle pm-rh-n"  data-dir="n"></div>
    <div class="pm-resize-handle pm-rh-s"  data-dir="s"></div>
    <div class="pm-resize-handle pm-rh-e"  data-dir="e"></div>
    <div class="pm-resize-handle pm-rh-w"  data-dir="w"></div>
    <div class="pm-resize-handle pm-rh-ne" data-dir="ne"></div>
    <div class="pm-resize-handle pm-rh-nw" data-dir="nw"></div>
    <div class="pm-resize-handle pm-rh-se" data-dir="se"></div>
    <div class="pm-resize-handle pm-rh-sw" data-dir="sw"></div>
  `;

  // Set title text (safe, tránh XSS)
  el.querySelector('.pm-title').textContent = title;

  // Set body content
  const body = el.querySelector('.pm-body');
  if (content && typeof content === 'object' && content.nodeType) {
    body.appendChild(content);
  } else if (typeof content === 'string') {
    body.innerHTML = content;
  }

  // Close button (optional — popup có thể không có nút đóng)
  el.querySelector('.pm-close')?.addEventListener('click', (e) => {
    e.stopPropagation();
    PopupManager.close(id);
  });

  return el;
}

// ---- ESC handler (module-level, một lần) ----

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (_order.length === 0) return;
  const lastId = _order[_order.length - 1];
  PopupManager.close(lastId);
});

// ---- Singleton ----

const PopupManager = {

  /**
   * Mở popup với id cho trước.
   * Nếu id đã mở → bỏ qua (không mở lại).
   * @param {string} id
   * @param {{ title?, content?, width?, height?, x?, y?, extraClass?, onClose? }} opts
   */
  open(id, opts = {}) {
    if (_popups.has(id)) return; // đã mở rồi

    const layer = _getLayer();
    const el    = _buildEl(id, opts);
    layer.appendChild(el);

    // Đăng ký onClose callback nếu có
    if (typeof opts.onClose === 'function') {
      _cleanups.set(id, opts.onClose);
    }

    // Kích hoạt drag (header) + resize (8 handles)
    _makeDraggable(el, el.querySelector('.pm-header'));
    _makeResizable(el);

    _popups.set(id, { el, opts });
    _order.push(id);
  },

  /**
   * Đóng popup với id cho trước.
   * @param {string} id
   */
  close(id) {
    if (!_popups.has(id)) return;

    // Gọi onClose callback trước khi remove element
    const cleanup = _cleanups.get(id);
    if (cleanup) {
      try { cleanup(); } catch (e) { console.warn('[popup-manager] onClose error:', e); }
      _cleanups.delete(id);
    }

    const { el } = _popups.get(id);
    el.remove();
    _popups.delete(id);

    const idx = _order.indexOf(id);
    if (idx !== -1) _order.splice(idx, 1);
  },

  /**
   * Toggle popup: nếu đang mở → đóng; nếu đang đóng → mở.
   * @param {string} id
   * @param {object} opts — dùng khi mở mới
   */
  toggle(id, opts = {}) {
    if (_popups.has(id)) {
      this.close(id);
    } else {
      this.open(id, opts);
    }
  },

  /**
   * Kiểm tra popup có đang mở không.
   * @param {string} id
   * @returns {boolean}
   */
  isOpen(id) {
    return _popups.has(id);
  },

  /**
   * Đóng tất cả popup đang mở.
   */
  closeAll() {
    for (const id of [..._popups.keys()]) {
      this.close(id);
    }
  },

  /**
   * Cập nhật nội dung body của popup đang mở.
   * @param {string} id
   * @param {string|Node} content
   */
  setContent(id, content) {
    if (!_popups.has(id)) return;
    const { el } = _popups.get(id);
    const body = el.querySelector('.pm-body');
    if (!body) return;

    if (content && typeof content === 'object' && content.nodeType) {
      body.innerHTML = '';
      body.appendChild(content);
    } else {
      body.innerHTML = content;
    }
  },
};

export default PopupManager;
