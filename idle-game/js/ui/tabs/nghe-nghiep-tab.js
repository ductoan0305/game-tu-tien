// ============================================================
// ui/tabs/nghe-nghiep-tab.js — Layout + Wire Events
// Render logic từng nghề → ui/tabs/professions/
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

const PROFESSIONS = [
  { id:'luyen_dan', icon:'⚗',  name:'Luyện Đan', color:'#e8a020', unlockRealm:0, unlockStage:1 },
  { id:'luyen_khi', icon:'⚒',  name:'Luyện Khí', color:'#7b9fd4', unlockRealm:0, unlockStage:1 },
  { id:'tran_phap', icon:'🔮', name:'Trận Pháp', color:'#56c46a', unlockRealm:0, unlockStage:1 },
  { id:'phu_chu',   icon:'📿', name:'Phù Chú',   color:'#a855f7', unlockRealm:0, unlockStage:1 },
  { id:'khoi_loi',  icon:'🤖', name:'Khôi Lỗi',  color:'#e05c4a', unlockRealm:0, unlockStage:1 },
  { id:'linh_thuc', icon:'🍲', name:'Linh Thực', color:'#4db8a0', unlockRealm:0, unlockStage:1 },
];

let _activeProf  = 'luyen_dan';
let _arrayTier   = 0;
let _arrayCat    = 'all';
let _buaTier     = 0;
let _buaCat      = 'all';
let _kloiTier    = 0;
let _foodTier    = 0;
let _foodCat     = 'all';

export function renderNgheNghiepTab(G, actions) {
  const panel = document.getElementById('panel-nghe_nghiep');
  if (!panel) return;

  const cur = PROFESSIONS.find(p => p.id === _activeProf);
  if (cur && !_isUnlocked(cur, G)) {
    const first = PROFESSIONS.find(p => _isUnlocked(p, G));
    if (first) _activeProf = first.id;
  }

  panel.innerHTML = `
    <div class="nn-layout">
      <div class="nn-sidebar">
        <div class="nn-sidebar-title">🛠 Nghề Nghiệp</div>
        ${PROFESSIONS.map(p => {
          const locked = !_isUnlocked(p, G);
          const active = p.id === _activeProf;
          return `<button class="nn-prof-btn ${active?'nn-prof-active':''} ${locked?'nn-prof-locked':''}"
                    data-prof="${p.id}" style="--prof-color:${p.color}" ${locked?'disabled':''}>
            <span class="nn-prof-icon">${p.icon}</span>
            <span class="nn-prof-name">${p.name}</span>
            ${locked?'<span class="nn-prof-lock">🔒</span>':''} 
            ${_getProfBadge(p.id,G)?`<span class="nn-prof-badge" style="color:${p.color}">${_getProfBadge(p.id,G)}</span>`:''}
          </button>`;
        }).join('')}
      </div>
      <div class="nn-main">
        <div class="nn-content" id="nn-content">
          ${_renderProfContent(_activeProf, G, actions)}
        </div>
        <div class="nn-storage">
          <div class="nn-storage-title">📦 Kho Nguyên Liệu</div>
          ${_renderStorage(G)}
        </div>
      </div>
    </div>`;

  _wireEvents(G, actions);
}

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

function _renderSkeleton(profId, G) {
  const info = SKELETON_INFO[profId];
  if (!info) return '<p>Đang phát triển...</p>';
  const lv = G.crafts?.[profId]?.level || 0;

  return `
    <div class="nn-skeleton">
      <div class="nn-sk-desc" style="border-color:${info.color}33;background:${info.color}08">
        ${info.desc}
      </div>
      <div class="nn-sk-coming">
        <span style="font-size:32px">🚧</span>
        <h3 style="color:var(--gold);margin:8px 0 4px">Đang Phát Triển</h3>
        <p style="color:var(--text-dim);font-size:12px">Tính năng sắp ra mắt:</p>
      </div>
      <div class="nn-sk-features">
        ${info.features.map(f => `
          <div class="nn-sk-feat" style="border-color:${info.color}33">
            <span style="font-size:20px">${f.icon}</span>
            <div>
              <div style="color:${info.color};font-size:12px;font-weight:700">${f.name}</div>
              <div style="color:var(--text-dim);font-size:11px">${f.desc}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

// ---- Kho Nguyên Liệu ----
function _renderStorage(G) {
  const alchIngs = Object.entries(G.alchemy?.ingredients||{}).filter(([,qty])=>qty>0);
  const foodIngs = Object.entries(G.linhThuc?.ingredients||{}).filter(([,qty])=>qty>0);

  if (!alchIngs.length && !foodIngs.length) {
    return `<p class="nn-storage-empty">Kho trống — thu thập nguyên liệu từ chiến trường và bản đồ.</p>`;
  }

  const danIngs     = alchIngs.filter(([id]) =>  ALL_INGS.find(i=>i.id===id) && !MINERALS.find(m=>m.id===id));
  const mineralIngs = alchIngs.filter(([id]) => MINERALS.find(m=>m.id===id));

  const renderGroup = (list, title, extraLookup=[]) => {
    if (!list.length) return '';
    return `
      <div class="nn-storage-group">
        <div class="nn-storage-group-title">${title}</div>
        <div class="nn-storage-grid">
          ${list.map(([id,qty]) => {
            const ing   = [...ALL_INGS, ...MINERALS, ...(FOOD_INGREDIENTS||[]), ...extraLookup].find(i=>i.id===id);
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

// ---- Helpers ----
function _isUnlocked(prof, G) {
  if (G.realmIdx > prof.unlockRealm) return true;
  if (G.realmIdx === prof.unlockRealm && (G.stage||1) >= prof.unlockStage) return true;
  return false;
}

function _getProfBadge(profId, G) {
  if (profId === 'luyen_dan') {
    const c = G.alchemy?.craftsCount || 0;
    return c >= 10 ? `Lv${Math.floor(c/10)}` : null;
  }
  if (profId === 'luyen_khi') {
    const r = getCraftsmanRank(G.alchemy?.craftsCount||0);
    return r?.rank > 0 ? r?.name : null; // rank 0 = nhập môn, không hiện badge
  }
  const lv = G.crafts?.[profId]?.level || 0;
  return lv > 0 ? `Lv${lv}` : null;
}

// ---- Wire Events ----
function _wireEvents(G, actions) {
  const panel = document.getElementById('panel-nghe_nghiep');
  if (!panel) return;

  // Chuyển nghề
  panel.querySelectorAll('.nn-prof-btn:not([disabled])').forEach(btn => {
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
    btn.addEventListener('click', () => {
      actions.repairFurnace?.();
    });
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
    btn.addEventListener('click', () => {
      actions.repairForge?.();
    });
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
    btn.addEventListener('click', () => {
      actions.forge?.(btn.dataset.recipeId);
    });
  });

  // Đến cửa hàng
  panel.querySelectorAll('.nn-goto-shop').forEach(btn => {
    btn.addEventListener('click', () => {
      actions.switchTab?.('shop');
    });
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