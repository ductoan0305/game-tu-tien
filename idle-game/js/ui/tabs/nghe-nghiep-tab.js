// ============================================================
// ui/tabs/nghe-nghiep-tab.js — Layout + Wire Events
// Render logic từng nghề → ui/tabs/professions/
// S-E: Profession gate system — dùng G.flags.unlockedProfessions
// ============================================================
import { INGREDIENTS }       from '../../alchemy/alchemy-data.js';
import { MINERALS }          from '../../alchemy/crafting-data.js';
import { FOOD_INGREDIENTS }  from '../../alchemy/linh-thuc-data.js';
import { getCraftsmanRank }  from '../../alchemy/crafting-data.js';
import { plantCrop, harvestCrop } from '../../core/duoc-dien-engine.js';

import { renderLuyenDan }   from './professions/luyen-dan-tab.js';
import { renderLuyenKhi }   from './professions/luyen-khi-tab.js';
import { renderLinhThuc }   from './professions/linh-thuc-tab.js';
import { renderTranPhap }   from './professions/tran-phap-tab.js';
import { renderBuaChu }     from './professions/phu-chu-tab.js';
import { renderKhoiLoi }    from './professions/khoi-loi-tab.js';

const RARITY_COLORS = { common:'#888', uncommon:'#56c46a', rare:'#3a9fd5', epic:'#9c27b0', legendary:'#f0d47a' };

const ALL_INGS = Object.entries(INGREDIENTS).map(([id,v]) => ({ id,...v }));

// ---- Định nghĩa 6 nghề phụ + điều kiện mở khoá ----
const PROFESSIONS = [
  {
    id: 'luyen_dan',
    icon: '⚗',
    name: 'Luyện Đan',
    color: '#e8a020',
    desc: 'Chưng cất linh dược thành đan hoàn, tăng cường tu vi và chữa lành thương tích.',
    unlockHint: 'Cần Ngộ Tính ≥ 40 và linh căn Hỏa, hoặc cơ duyên đặc biệt.',
    // Auto-unlock: ngoTinh >= 40 + có điểm Hỏa trong spiritData
  },
  {
    id: 'luyen_khi',
    icon: '⚒',
    name: 'Luyện Khí',
    color: '#7b9fd4',
    desc: 'Rèn giũa khí cụ và trang bị từ khoáng vật, gia cố khả năng chiến đấu.',
    unlockHint: 'Học từ thợ rèn NPC hoặc tìm được bí quyết rèn luyện qua cơ duyên.',
    // Unlock qua NPC hoặc flags
  },
  {
    id: 'tran_phap',
    icon: '🔮',
    name: 'Trận Pháp',
    color: '#56c46a',
    desc: 'Bố trận phòng ngự và tấn công, vận dụng linh lực theo cấu hình trận đồ.',
    unlockHint: 'Học từ NPC hoặc tông môn, hoặc tìm được Trận Kinh qua cơ duyên.',
    // Unlock qua NPC/tông môn hoặc flags
  },
  {
    id: 'phu_chu',
    icon: '📿',
    name: 'Phù Chú',
    color: '#a855f7',
    desc: 'Vẽ bùa lên vật phẩm để tạo hiệu ứng đặc biệt trong chiến đấu và tu luyện.',
    unlockHint: 'Học từ NPC hoặc tông môn, hoặc nhận cơ duyên Phù Chú.',
    // Unlock qua NPC/tông môn hoặc flags
  },
  {
    id: 'khoi_loi',
    icon: '🤖',
    name: 'Khôi Lỗi',
    color: '#e05c4a',
    desc: 'Chế tạo và điều khiển bù nhìn chiến đấu bằng linh lực và vật liệu đặc biệt.',
    unlockHint: 'Học từ NPC hoặc tông môn, hoặc nhận cơ duyên Khôi Lỗi.',
    // Unlock qua NPC/tông môn hoặc flags
  },
  {
    id: 'linh_thuc',
    icon: '🍲',
    name: 'Linh Thực',
    color: '#4db8a0',
    desc: 'Nấu nướng thức ăn linh từ nguyên liệu đặc biệt, bổ sung thể lực và linh khí.',
    unlockHint: 'Xây Bếp Linh Thực hoặc vào được vùng Linh Địa.',
    // Auto-unlock: linhThuc.kitchen.level >= 1
  },
];

// Màn hình chưa unlock nào hợp lệ để hiện
const _LOCK_SENTINEL = '__locked__';

let _activeProf  = 'luyen_dan';
let _arrayTier   = 0;
let _arrayCat    = 'all';
let _buaTier     = 0;
let _buaCat      = 'all';
let _kloiTier    = 0;
let _foodTier    = 0;
let _foodCat     = 'all';

// ============================================================
// Auto-unlock: kiểm tra điều kiện live, cập nhật G.flags ngay
// ============================================================
function _tryAutoUnlock(G) {
  if (!G.flags) G.flags = {};
  if (!Array.isArray(G.flags.unlockedProfessions)) G.flags.unlockedProfessions = [];
  const profs = G.flags.unlockedProfessions;

  const addIfNew = (id) => { if (!profs.includes(id)) profs.push(id); };

  // Luyện Đan: ngoTinh >= 40 + có linh căn Hỏa
  if (!profs.includes('luyen_dan')) {
    const hasFireRoot = (G.spiritData?.points?.huo ?? 0) > 0;
    if ((G.ngoTinh ?? 0) >= 40 && hasFireRoot) {
      addIfNew('luyen_dan');
    }
  }

  // Linh Thực: có bếp (kitchen level >= 1)
  if (!profs.includes('linh_thuc')) {
    if ((G.linhThuc?.kitchen?.level ?? 0) >= 1) {
      addIfNew('linh_thuc');
    }
  }
}

// ============================================================
// Kiểm tra unlock
// ============================================================
function _isUnlocked(profId, G) {
  return (G.flags?.unlockedProfessions ?? []).includes(profId);
}

// ============================================================
// Main render
// ============================================================
export function renderNgheNghiepTab(G, actions) {
  const panel = document.getElementById('panel-nghe_nghiep');
  if (!panel) return;

  // Chạy auto-unlock trước khi render
  _tryAutoUnlock(G);

  // Nếu activeProf đang là sentinel hoặc không hợp lệ, giữ nguyên
  // (user có thể click vào nghề locked để xem điều kiện)
  // Nhưng nếu profession không tồn tại trong PROFESSIONS → reset
  if (!PROFESSIONS.find(p => p.id === _activeProf) && _activeProf !== _LOCK_SENTINEL) {
    const first = PROFESSIONS.find(p => _isUnlocked(p.id, G));
    _activeProf = first ? first.id : _LOCK_SENTINEL;
  }

  const unlockedCount = PROFESSIONS.filter(p => _isUnlocked(p.id, G)).length;

  panel.innerHTML = `
    <div class="nn-layout">
      <div class="nn-sidebar">
        <div class="nn-sidebar-title">🛠 Nghề Nghiệp</div>
        ${PROFESSIONS.map(p => {
          const locked = !_isUnlocked(p.id, G);
          const active = p.id === _activeProf;
          return `<button class="nn-prof-btn ${active ? 'nn-prof-active' : ''} ${locked ? 'nn-prof-locked' : ''}"
                    data-prof="${p.id}" style="--prof-color:${p.color}">
            <span class="nn-prof-icon">${p.icon}</span>
            <span class="nn-prof-name">${p.name}</span>
            ${locked ? '<span class="nn-prof-lock">🔒</span>' : ''}
            ${!locked && _getProfBadge(p.id, G) ? `<span class="nn-prof-badge" style="color:${p.color}">${_getProfBadge(p.id, G)}</span>` : ''}
          </button>`;
        }).join('')}
        ${unlockedCount === 0 ? `<div class="nn-sidebar-hint">Gặp NPC hoặc nhận cơ duyên để mở nghề phụ.</div>` : ''}
      </div>
      <div class="nn-main">
        <div class="nn-content" id="nn-content">
          ${_renderActiveContent(_activeProf, G, actions)}
        </div>
        ${_isUnlocked(_activeProf, G) ? `
        <div class="nn-storage">
          <div class="nn-storage-title">📦 Kho Nguyên Liệu</div>
          ${_renderStorage(G)}
        </div>` : ''}
      </div>
    </div>`;

  _wireEvents(G, actions);
}

// ============================================================
// Render nội dung chính — unlocked hiện content, locked hiện card
// ============================================================
function _renderActiveContent(profId, G, actions) {
  const prof = PROFESSIONS.find(p => p.id === profId);

  // Chưa chọn nghề nào (tất cả locked)
  if (!prof || profId === _LOCK_SENTINEL) {
    return _renderAllLockedOverview(G);
  }

  // Nghề đã unlock → render content thật
  if (_isUnlocked(profId, G)) {
    return _renderProfContent(profId, G, actions);
  }

  // Nghề chưa unlock → render lock card
  return _renderLockedCard(prof, G);
}

// Khi tất cả nghề đều chưa mở
function _renderAllLockedOverview(G) {
  return `
    <div class="nn-locked-overview">
      <div style="font-size:40px;margin-bottom:12px">🔒</div>
      <h3 style="color:var(--gold);margin:0 0 8px">Nghề Phụ Chưa Mở</h3>
      <p style="color:var(--text-dim);font-size:13px;max-width:320px;text-align:center">
        Không phải ai cũng có thể theo mọi con đường. Gặp NPC trong bản đồ,
        gia nhập tông môn, hoặc chờ cơ duyên để mở nghề phụ.
      </p>
      <div class="nn-lock-grid" style="margin-top:16px">
        ${PROFESSIONS.map(p => `
          <div class="nn-lock-card nn-lock-card--mini" style="border-color:${p.color}33">
            <span style="font-size:22px">${p.icon}</span>
            <span style="color:${p.color};font-size:11px;font-weight:700">${p.name}</span>
            <span style="font-size:14px">🔒</span>
          </div>`).join('')}
      </div>
    </div>`;
}

// Card chi tiết cho nghề chưa unlock
function _renderLockedCard(prof, G) {
  const progressHtml = _renderLuyenDanProgress(prof.id, G);

  return `
    <div class="nn-locked-card" style="--prof-color:${prof.color}">
      <div class="nn-lc-header">
        <span class="nn-lc-icon">${prof.icon}</span>
        <div>
          <h3 class="nn-lc-name" style="color:${prof.color}">${prof.name}</h3>
          <span class="nn-lc-badge">🔒 Chưa mở</span>
        </div>
      </div>
      <div class="nn-lc-desc">${prof.desc}</div>
      <div class="nn-lc-condition">
        <div class="nn-lc-cond-title">⚠ Điều kiện mở khoá:</div>
        <div class="nn-lc-cond-text">${prof.unlockHint}</div>
        ${progressHtml}
      </div>
      <div class="nn-lc-footer">
        Con đường tu tiên có sự lựa chọn — không phải ai cũng đủ duyên phận
        để bước vào nghề này.
      </div>
    </div>`;
}

// Hiện progress bar nếu gần đạt điều kiện (chỉ cho luyen_dan)
function _renderLuyenDanProgress(profId, G) {
  if (profId !== 'luyen_dan') return '';

  const ngoTinh = G.ngoTinh ?? 0;
  const hasFireRoot = (G.spiritData?.points?.huo ?? 0) > 0;
  const ngoTinhPct = Math.min(100, Math.round(ngoTinh / 40 * 100));

  const fireStatus = hasFireRoot
    ? `<span style="color:#56c46a">✓ Có linh căn Hỏa</span>`
    : `<span style="color:#e05c4a">✗ Thiếu linh căn Hỏa</span>`;

  return `
    <div class="nn-lc-progress" style="margin-top:10px">
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
        <span style="color:var(--text-dim)">Ngộ Tính</span>
        <span style="color:${ngoTinh >= 40 ? '#56c46a' : '#f0d47a'}">${ngoTinh.toFixed(1)} / 40</span>
      </div>
      <div style="background:rgba(255,255,255,0.08);border-radius:4px;height:6px;overflow:hidden">
        <div style="width:${ngoTinhPct}%;height:100%;background:${ngoTinh >= 40 ? '#56c46a' : '#e8a020'};border-radius:4px;transition:width 0.3s"></div>
      </div>
      <div style="margin-top:6px;font-size:11px">${fireStatus}</div>
    </div>`;
}

// ============================================================
// Render nội dung nghề đã unlock
// ============================================================
function _renderProfContent(profId, G, actions) {
  switch (profId) {
    case 'luyen_dan':  return renderLuyenDan(G);
    case 'luyen_khi':  return renderLuyenKhi(G);
    case 'linh_thuc':  return renderLinhThuc(G, _foodTier, _foodCat);
    case 'tran_phap':  return renderTranPhap(G, _arrayTier, _arrayCat);
    case 'phu_chu':    return renderBuaChu(G, _buaTier, _buaCat);
    case 'khoi_loi':   return renderKhoiLoi(G, _kloiTier);
    default: return '';
  }
}

// ============================================================
// Kho Nguyên Liệu
// ============================================================
function _renderStorage(G) {
  const alchIngs = Object.entries(G.alchemy?.ingredients||{}).filter(([,qty])=>qty>0);
  const foodIngs = Object.entries(G.linhThuc?.ingredients||{}).filter(([,qty])=>qty>0);

  if (!alchIngs.length && !foodIngs.length) {
    return `<p class="nn-storage-empty">Kho trống — thu thập nguyên liệu từ chiến trường và bản đồ.</p>`;
  }

  const danIngs     = alchIngs.filter(([id]) =>  ALL_INGS.find(i=>i.id===id) && !MINERALS.find(m=>m.id===id));
  const mineralIngs = alchIngs.filter(([id]) => MINERALS.find(m=>m.id===id));

  const renderGroup = (list, title) => {
    if (!list.length) return '';
    return `
      <div class="nn-storage-group">
        <div class="nn-storage-group-title">${title}</div>
        <div class="nn-storage-grid">
          ${list.map(([id,qty]) => {
            const ing   = [...ALL_INGS, ...MINERALS, ...(FOOD_INGREDIENTS||[])].find(i=>i.id===id);
            const color = RARITY_COLORS[ing?.rarity] || '#888';
            return `<div class="nn-storage-item" style="border-color:${color}44" title="${ing?.desc||id}">
              <div class="nsi-emoji">${ing?.emoji||'?'}</div>
              <div class="nsi-name">${ing?.name||id}</div>
              <div class="nsi-qty" style="color:${color}">×${qty}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  };

  const totalCount = alchIngs.length + foodIngs.length;
  const totalQty   = [...alchIngs,...foodIngs].reduce((a,[,q])=>a+q,0);

  return renderGroup(danIngs,     '🌿 Thảo Dược & Vật Liệu') +
         renderGroup(mineralIngs, '⛏ Khoáng Vật') +
         renderGroup(foodIngs,    '🍲 Nguyên Liệu Linh Thực') +
         `<div class="nn-storage-total">Tổng: ${totalCount} loại · ${totalQty} vật phẩm</div>`;
}

// ============================================================
// Helpers
// ============================================================
function _getProfBadge(profId, G) {
  if (profId === 'luyen_dan') {
    const s = G.alchemySuccess || 0;
    return s >= 10 ? `Lv${Math.floor(s/10)}` : null;
  }
  if (profId === 'luyen_khi') {
    const r = getCraftsmanRank(G.alchemy?.craftsCount||0);
    return r?.rank > 0 ? r?.name : null;
  }
  const lv = G.crafts?.[profId]?.level || 0;
  return lv > 0 ? `Lv${lv}` : null;
}

// ============================================================
// Wire Events
// ============================================================
function _wireEvents(G, actions) {
  const panel = document.getElementById('panel-nghe_nghiep');
  if (!panel) return;

  // Chuyển nghề (kể cả locked — để xem điều kiện)
  panel.querySelectorAll('.nn-prof-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeProf = btn.dataset.prof;
      renderNgheNghiepTab(G, actions);
    });
  });

  // Luyện đan — truyền quantity
  panel.querySelectorAll('.btn-craft:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const qty = parseInt(btn.dataset.qty) || 1;
      actions.craft?.(btn.dataset.recipeId, qty);
    });
  });

  // Chọn số lần luyện
  panel.querySelectorAll('.nn-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!G.alchemy) G.alchemy = {};
      G.alchemy._craftQty = parseInt(btn.dataset.qty) || 1;
      renderNgheNghiepTab(G, actions);
    });
  });

  // Sửa lò
  panel.querySelectorAll('.nn-repair-furnace').forEach(btn => {
    btn.addEventListener('click', () => actions.repairFurnace?.());
  });

  // Sửa Bếp Linh Thực
  panel.querySelectorAll('.nn-repair-kitchen').forEach(btn => {
    btn.addEventListener('click', () => actions.repairKitchen?.());
  });

  // Nấu ăn
  panel.querySelectorAll('.btn-cook:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => actions.cook?.(btn.dataset.recipeId));
  });

  // Food tier filter
  panel.querySelectorAll('[data-food-tier]').forEach(btn => {
    btn.addEventListener('click', () => { _foodTier = parseInt(btn.dataset.foodTier)||0; renderNgheNghiepTab(G, actions); });
  });

  // Food category filter
  panel.querySelectorAll('[data-food-cat]').forEach(btn => {
    btn.addEventListener('click', () => { _foodCat = btn.dataset.foodCat||'all'; renderNgheNghiepTab(G, actions); });
  });

  // Trận Pháp — bố trận
  panel.querySelectorAll('.tp-activate-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => actions.activateArray?.(btn.dataset.recipeId));
  });

  // Trận Pháp — huỷ trận passive
  panel.querySelectorAll('.tp-cancel-array').forEach(btn => {
    btn.addEventListener('click', () => actions.cancelArray?.(btn.dataset.arrayId));
  });

  // Trận Pháp tier filter
  panel.querySelectorAll('[data-array-tier]').forEach(btn => {
    btn.addEventListener('click', () => { _arrayTier = parseInt(btn.dataset.arrayTier)||0; renderNgheNghiepTab(G, actions); });
  });

  // Trận Pháp category filter
  panel.querySelectorAll('[data-array-cat]').forEach(btn => {
    btn.addEventListener('click', () => { _arrayCat = btn.dataset.arrayCat||'all'; renderNgheNghiepTab(G, actions); });
  });

  // Phù Chú — vẽ bùa
  panel.querySelectorAll('.bc-draw-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => actions.drawTalisman?.(btn.dataset.recipeId));
  });

  // Phù Chú tier filter
  panel.querySelectorAll('[data-bua-tier]').forEach(btn => {
    btn.addEventListener('click', () => { _buaTier = parseInt(btn.dataset.buaTier)||0; renderNgheNghiepTab(G, actions); });
  });

  // Phù Chú category filter (bua-cat không có trong wireEvents cũ nhưng thêm để hoàn chỉnh)
  panel.querySelectorAll('[data-bua-cat]').forEach(btn => {
    btn.addEventListener('click', () => { _buaCat = btn.dataset.buaCat||'all'; renderNgheNghiepTab(G, actions); });
  });

  // Khôi Lỗi — chế tạo
  panel.querySelectorAll('.kl-craft-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => actions.craftPuppet?.(btn.dataset.recipeId));
  });

  // Khôi Lỗi — triệu hồi
  panel.querySelectorAll('.kl-summon-btn').forEach(btn => {
    btn.addEventListener('click', () => actions.summonPuppet?.(btn.dataset.puppetId));
  });

  // Khôi Lỗi — thu hồi
  panel.querySelectorAll('.kl-dismiss-btn').forEach(btn => {
    btn.addEventListener('click', () => actions.dismissPuppet?.());
  });

  // Khôi Lỗi tier filter
  panel.querySelectorAll('[data-kloi-tier]').forEach(btn => {
    btn.addEventListener('click', () => { _kloiTier = parseInt(btn.dataset.kloiTier)||0; renderNgheNghiepTab(G, actions); });
  });

  // Sửa Bễ Rèn
  panel.querySelectorAll('.nn-repair-forge').forEach(btn => {
    btn.addEventListener('click', () => actions.repairForge?.());
  });

  // Tier filter Luyện Khí
  panel.querySelectorAll('.nn-tier-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!G.alchemy) G.alchemy = {};
      G.alchemy._forgeTier = parseInt(btn.dataset.tier) || 0;
      renderNgheNghiepTab(G, actions);
    });
  });

  // Rèn khí
  panel.querySelectorAll('.btn-forge:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => actions.forge?.(btn.dataset.recipeId));
  });

  // Đến cửa hàng
  panel.querySelectorAll('.nn-goto-shop').forEach(btn => {
    btn.addEventListener('click', () => actions.switchTab?.('shop'));
  });

  // ---- Dược Điền ----
  panel.querySelectorAll('.lt-dd-slot[data-action="harvest"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const slotIdx = parseInt(btn.dataset.slot);
      const result  = harvestCrop(G, slotIdx);
      if (result.ok) renderNgheNghiepTab(G, actions);
    });
  });

  panel.querySelectorAll('.lt-dd-slot[data-action="plant"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const slotIdx = parseInt(btn.dataset.slot);
      const result  = plantCrop(G, slotIdx, 'linh_me');
      if (result.ok) renderNgheNghiepTab(G, actions);
      else alert(result.msg);
    });
  });
}
