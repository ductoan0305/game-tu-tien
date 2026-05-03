// ============================================================
// popup-manager.js — PopupManager singleton
// Session 13: Layout Collapse + Popup System Foundation
//
// API:
//   PopupManager.open(id, { title, content, width, height, x, y })
//   PopupManager.close(id)
//   PopupManager.toggle(id, opts)
//   PopupManager.isOpen(id) → bool
//
// Constraints (session 13):
//   - Không drag/resize (session sau)
//   - Click outside → KHÔNG đóng (game context)
//   - ESC → close last opened popup
// ============================================================

/** Map<id, { el: HTMLElement, opts: object }> */
const _popups = new Map();

/** Stack để track thứ tự mở (LIFO cho ESC) */
const _order = [];

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

// ---- Build DOM ----

function _buildEl(id, opts = {}) {
  const { title = '', content = '', width, height, x, y } = opts;

  const el = document.createElement('div');
  el.className = 'pm-popup';
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

  // HTML cơ bản
  el.innerHTML = `
    <div class="pm-header">
      <span class="pm-title"></span>
      <button class="pm-close" aria-label="Đóng">✕</button>
    </div>
    <div class="pm-body"></div>
  `;

  // Set title text (safe)
  el.querySelector('.pm-title').textContent = title;

  // Set body content
  const body = el.querySelector('.pm-body');
  if (content && typeof content === 'object' && content.nodeType) {
    // DOM node
    body.appendChild(content);
  } else if (typeof content === 'string') {
    body.innerHTML = content;
  }

  // Close button
  el.querySelector('.pm-close').addEventListener('click', (e) => {
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
   * @param {{ title?: string, content?: string|Node, width?: number|string, height?: number|string, x?: number|string, y?: number|string }} opts
   */
  open(id, opts = {}) {
    if (_popups.has(id)) return; // đã mở rồi

    const layer = _getLayer();
    const el    = _buildEl(id, opts);
    layer.appendChild(el);

    _popups.set(id, { el, opts });
    _order.push(id);
  },

  /**
   * Đóng popup với id cho trước.
   * @param {string} id
   */
  close(id) {
    if (!_popups.has(id)) return;

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
   * Dùng khi cần reset UI (e.g., game over, tab switch).
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
