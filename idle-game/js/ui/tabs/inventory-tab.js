// ============================================================
// ui/tabs/inventory-tab.js — Túi Đồ + Trang Bị tích hợp
// Layout: Trái = items túi, Phải = hình nhân vật + 10 slot trang bị
// ============================================================
import { ITEMS } from '../../core/data.js';
import { EQUIPMENT_SLOTS } from '../../equipment/equipment-data.js';
import { buildPortraitSVG } from '../portrait.js';

const RARITY_COLORS = {
  common:'#aaa', uncommon:'#4caf50', rare:'#2196f3',
  epic:'#9c27b0', legendary:'#ff9800',
  // inventory item rarities
  'thường':'#888','hiếm':'#3a9fd5','cực hiếm':'#7b68ee','huyền thoại':'#f0d47a'
};

let _selectedBagIdx = null;

export function renderInventoryTab(G, actions) {
  const panel = document.getElementById('panel-inventory');
  if (!panel) return;

  const equip     = G.equipment || { slots:{}, bag:[] };
  const slots     = equip.slots || {};
  const bag       = equip.bag   || [];
  const inventory = G.inventory || [];

  panel.innerHTML = `
    <div class="inv-layout">
      <!-- LEFT: Vật phẩm túi -->
      <div class="inv-left">
        <div class="inv-section-title">🎒 Túi Vật Phẩm</div>
        <div class="inv-item-grid">
          ${inventory.map((slot, idx) => _renderItemSlot(slot, idx)).join('')}
        </div>

        ${bag.length > 0 ? `
          <div class="inv-section-title" style="margin-top:12px">
            ⚔ Trang Bị Trong Túi
            <span style="color:var(--text-dim);font-weight:normal;font-size:10px"> (${bag.length}/20) — Click để trang bị</span>
          </div>
          <div class="inv-bag-grid">
            ${bag.map((item, idx) => _renderBagItem(item, idx, _selectedBagIdx)).join('')}
          </div>` : ''}
      </div>

      <!-- RIGHT: Hình nhân vật + slots trang bị -->
      <div class="inv-right">
        <div class="inv-section-title">🪡 Trang Bị Đang Mặc</div>

        <div class="inv-char-wrap">
          <!-- Portrait ở giữa -->
          <div class="inv-portrait">${buildPortraitSVG(G)}</div>

          <!-- Slot layout vây quanh -->
          <div class="inv-slots-layout">
            <div class="isl-top">
              ${_renderEqSlot('dau',     slots, '🪖', 'Đầu')}
            </div>
            <div class="isl-middle">
              <div class="isl-left-col">
                ${_renderEqSlot('tay_trai', slots, '🛡', 'Tay Trái')}
                ${_renderEqSlot('nhan_trai',slots, '💍', 'Nhẫn T')}
              </div>
              <div class="isl-center-col">
                ${_renderEqSlot('than',      slots, '👘', 'Thân')}
                ${_renderEqSlot('that_lung', slots, '🔑', 'Thắt Lưng')}
                ${_renderEqSlot('chan',       slots, '👟', 'Chân')}
              </div>
              <div class="isl-right-col">
                ${_renderEqSlot('tay_phai', slots, '⚔', 'Tay Phải')}
                ${_renderEqSlot('nhan_phai',slots, '💍', 'Nhẫn P')}
              </div>
            </div>
            <div class="isl-bottom">
              ${_renderEqSlot('phap_bao', slots, '✨', 'Pháp Bảo')}
            </div>
          </div>
        </div>

        <!-- Thống kê trang bị -->
        <div class="inv-eq-stats">
          ${_calcTotalStats(slots)}
        </div>
      </div>
    </div>`;

  // Wire: dùng item từ inventory
  panel.querySelectorAll('.inv-item-slot.has-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx);
      const slot = inventory[idx];
      if (!slot) return;
      const item = ITEMS.find(i => i.id === slot.id);
      if (!item) return;
      if (confirm(`Sử dụng ${item.emoji} ${item.name}?\n${item.effect}`)) {
        actions.use(idx);
      }
    });
  });

  // Wire: click bag item để trang bị (click thẳng = equip luôn)
  panel.querySelectorAll('.inv-bag-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.bagIdx);
      const item = bag[idx];
      if (!item) return;
      // Equip thẳng — không cần click slot thêm bước nữa
      actions.equipFromBag(idx);
      _selectedBagIdx = null;
    });
  });

  // Wire: click trang bị slot để unequip
  panel.querySelectorAll('.inv-eq-slot').forEach(el => {
    el.addEventListener('click', () => {
      const slotId  = el.dataset.slot;
      const hasItem = el.dataset.hasItem === 'true';
      if (hasItem) {
        if (confirm(`Tháo trang bị?`)) {
          actions.unequipSlot(slotId);
        }
      }
    });
  });
}

function _renderItemSlot(slot, idx) {
  if (!slot) return `<div class="inv-item-slot empty" data-idx="${idx}"></div>`;
  const item  = ITEMS.find(i => i.id === slot.id);
  if (!item) return `<div class="inv-item-slot empty" data-idx="${idx}"></div>`;
  const color = RARITY_COLORS[item.rarity] || '#888';
  return `
    <div class="inv-item-slot has-item" data-idx="${idx}"
         style="border-color:${color}" title="${item.name}\n${item.effect}">
      <div class="inv-item-emoji">${item.emoji}</div>
      <div class="inv-item-qty">×${slot.qty}</div>
      <div class="inv-item-name">${item.name}</div>
    </div>`;
}

function _renderBagItem(item, idx, selectedIdx) {
  if (!item) return '';
  const color = RARITY_COLORS[item.rarity] || '#aaa';
  const stats = Object.entries(item.stats||{}).map(([k,v]) => `${k}+${v}`).join(' ');
  const slotLabel = EQUIPMENT_SLOTS[item.slot]?.label || item.slot;
  return `
    <div class="inv-bag-item" data-bag-idx="${idx}"
         style="border-color:${color}" title="${item.name}\n${stats}\nClick để trang bị vào slot ${slotLabel}">
      <div class="inv-item-emoji" style="color:${color}">${item.emoji||'⚔'}</div>
      <div class="inv-item-name">${item.name}</div>
      <div class="inv-item-stats">${stats || '(không có buff)'}</div>
      <div class="inv-item-hint" style="font-size:9px;color:var(--text-dim);margin-top:2px">▶ Click để mặc vào</div>
    </div>`;
}

function _renderEqSlot(slotId, slots, emoji, label) {
  const item     = slots[slotId];
  const slotCfg  = EQUIPMENT_SLOTS[slotId];
  const hasItem  = !!item;
  const color    = hasItem ? (RARITY_COLORS[item.rarity] || '#aaa') : 'var(--border)';
  const stats    = hasItem ? Object.entries(item.stats||{}).map(([k,v]) => `${k}+${v}`).join('\n') : '';

  return `
    <div class="inv-eq-slot ${hasItem?'has-item':''}"
         data-slot="${slotId}" data-has-item="${hasItem}"
         style="border-color:${color}"
         title="${slotCfg?.label||label}${hasItem ? '\n'+item.name+'\n'+stats : '\n(Trống)'}">
      ${hasItem
        ? `<div class="ies-emoji">${item.emoji||slotCfg?.emoji||emoji}</div>
           <div class="ies-name">${item.name.length>8?item.name.slice(0,7)+'…':item.name}</div>`
        : `<div class="ies-empty-emoji">${slotCfg?.emoji||emoji}</div>
           <div class="ies-label">${slotCfg?.label||label}</div>`}
    </div>`;
}

function _calcTotalStats(slots) {
  const totals = {};
  Object.values(slots).forEach(item => {
    if (!item) return;
    Object.entries(item.stats||{}).forEach(([k,v]) => {
      totals[k] = (totals[k]||0) + v;
    });
  });
  if (!Object.keys(totals).length) return '<span style="color:var(--text-dim);font-size:11px">Chưa có trang bị</span>';
  const STAT_LABELS = { atk:'⚔ATK', def:'🛡DEF', hp:'❤HP', atkPct:'⚔%', defPct:'🛡%', hpPct:'❤%', ratePct:'⚡%' };
  return Object.entries(totals).map(([k,v]) =>
    `<span class="eq-stat-chip">+${v} ${STAT_LABELS[k]||k}</span>`
  ).join('');
}