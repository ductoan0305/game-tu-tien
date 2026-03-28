// ============================================================
// ui/tabs/equipment-tab.js — Equipment Tab UI (9 Slots)
// ============================================================
import { getRarityLabel, formatItemStats } from '../../equipment/equipment-engine.js';
import { EQUIPMENT_SLOTS } from '../../equipment/equipment-data.js';

const RARITY_COLORS = {
  common:'#aaa', uncommon:'#4caf50', rare:'#2196f3',
  epic:'#9c27b0', legendary:'#ff9800',
};

let _activeEqTab = 'equipped'; // 'equipped' | 'bag'

export function renderEquipmentTab(G, actions) {
  const panel = document.getElementById('panel-equipment');
  if (!panel) return;

  const equip = G.equipment || { slots:{}, bag:[] };
  const slots  = equip.slots || {};
  const bag    = equip.bag   || [];

  const equipped = Object.entries(slots).filter(([,v]) => v !== null);
  const tab = _activeEqTab;

  panel.innerHTML = `
    <div class="tab-content">
      <h2 class="tab-title">⚔ Trang Bị</h2>

      <!-- Stats tổng hợp -->
      <div class="eq-stat-bar">
        ${_calcTotalStats(slots)}
      </div>

      <!-- Sub tabs -->
      <div class="alchemy-subtabs" style="margin-bottom:12px">
        <button class="subtab-btn ${tab==='equipped'?'active':''}" data-eqtab="equipped">
          🪖 Đang Mặc (${equipped.length}/10)
        </button>
        <button class="subtab-btn ${tab==='bag'?'active':''}" data-eqtab="bag">
          🎒 Túi (${bag.length}/20)
        </button>
      </div>

      <!-- Content -->
      <div id="eq-content">
        ${tab === 'equipped' ? _renderEquipped(slots) : _renderBag(bag)}
      </div>

      <div class="eq-note">
        <small>💡 Trang bị rơi khi đánh quái. Kim linh căn tăng loot chất lượng hơn.</small>
      </div>
    </div>`;

  // Wire subtabs
  panel.querySelectorAll('[data-eqtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeEqTab = btn.dataset.eqtab;
      renderEquipmentTab(G, actions);
    });
  });

  // Wire unequip
  panel.querySelectorAll('.btn-unequip').forEach(btn => {
    btn.addEventListener('click', () => {
      actions.unequipSlot(btn.dataset.slot);
      renderEquipmentTab(G, actions);
    });
  });

  // Wire equip from bag
  panel.querySelectorAll('.btn-equip').forEach(btn => {
    btn.addEventListener('click', () => {
      actions.equipFromBag(parseInt(btn.dataset.idx));
      renderEquipmentTab(G, actions);
    });
  });

  // Wire discard
  panel.querySelectorAll('.btn-discard').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = bag[parseInt(btn.dataset.idx)];
      if (!item) return;
      if (confirm(`Bán ${item.name}?`)) {
        actions.discardFromBag(parseInt(btn.dataset.idx));
        renderEquipmentTab(G, actions);
      }
    });
  });
}

// ---- Render 9 slots ----
function _renderEquipped(slots) {
  const ALL_SLOTS = Object.entries(EQUIPMENT_SLOTS);
  return `<div class="eq-slots-grid">
    ${ALL_SLOTS.map(([slotId, slotInfo]) => {
      const item = slots[slotId] || slots[_legacySlot(slotId)] || null;
      const color = item ? (RARITY_COLORS[item.rarity] || '#aaa') : 'rgba(255,255,255,0.1)';
      return `
        <div class="eq-slot-card ${item?'eq-filled':'eq-empty'}"
             style="border-color:${item?color+'44':'rgba(255,255,255,0.08)'}">
          <div class="eq-slot-header">
            <span class="eq-slot-emoji">${slotInfo.emoji}</span>
            <span class="eq-slot-label">${slotInfo.label}</span>
            ${item?`<span class="eq-slot-rarity" style="color:${color}">${getRarityLabel(item.rarity).label}</span>`:''}
          </div>
          ${item ? `
            <div class="eq-slot-item">
              <span class="eq-item-icon">${item.emoji}</span>
              <div class="eq-item-body">
                <div class="eq-item-name" style="color:${color}">${item.name}</div>
                <div class="eq-item-stats">${formatItemStats(item.stats)}</div>
              </div>
            </div>
            <button class="btn-unequip btn-sm btn-secondary" data-slot="${slotId}">Tháo</button>
          ` : `
            <div class="eq-slot-empty-hint">${slotInfo.desc}</div>
          `}
        </div>`;
    }).join('')}
  </div>`;
}

// ---- Render túi trang bị ----
function _renderBag(bag) {
  if (!bag.length) return `
    <div class="eq-bag-empty">
      <div style="font-size:40px;margin-bottom:12px">🎒</div>
      <div>Túi trang bị trống</div>
      <div style="font-size:12px;color:var(--text-dim);margin-top:6px">
        Đi đánh quái để nhận trang bị rơi
      </div>
    </div>`;

  // Group by slot
  const bySlot = {};
  bag.forEach((item, i) => {
    const s = item.slot || 'other';
    if (!bySlot[s]) bySlot[s] = [];
    bySlot[s].push({ item, i });
  });

  return `<div class="eq-bag-list">
    ${bag.map((item, i) => {
      const color = RARITY_COLORS[item.rarity] || '#aaa';
      const rar   = getRarityLabel(item.rarity);
      const slotInfo = EQUIPMENT_SLOTS[item.slot] || {};
      return `
        <div class="eq-bag-item" style="border-color:${color}44">
          <span class="eq-bag-emoji">${item.emoji}</span>
          <div class="eq-bag-body">
            <div class="eq-bag-name" style="color:${color}">${item.name}</div>
            <div class="eq-bag-meta">
              <span style="color:${color}">[${rar.label}]</span>
              <span style="color:var(--text-dim)">${slotInfo.emoji||''} ${slotInfo.label||item.slot}</span>
            </div>
            <div class="eq-bag-stats">${formatItemStats(item.stats)}</div>
          </div>
          <div class="eq-bag-actions">
            <button class="btn-equip btn-sm btn-primary" data-idx="${i}">Mặc</button>
            <button class="btn-discard btn-sm btn-danger" data-idx="${i}">Bán</button>
          </div>
        </div>`;
    }).join('')}
  </div>`;
}

// ---- Stats tổng hợp ----
function _calcTotalStats(slots) {
  let atk=0, def=0, hp=0, ratePct=0;
  Object.values(slots).forEach(item => {
    if (!item?.stats) return;
    atk     += item.stats.atk     || 0;
    def     += item.stats.def     || 0;
    hp      += item.stats.hp      || 0;
    ratePct += item.stats.ratePct || 0;
  });
  const parts = [];
  if (atk)     parts.push(`<span>⚔ +${atk}</span>`);
  if (def)     parts.push(`<span>🛡 +${def}</span>`);
  if (hp)      parts.push(`<span>❤ +${hp}</span>`);
  if (ratePct) parts.push(`<span>⚡ +${ratePct}%</span>`);
  if (!parts.length) return `<span style="color:var(--text-dim);font-size:11px">Chưa có trang bị</span>`;
  return `<div class="eq-stat-total">${parts.join('')}</div>`;
}

// Legacy slot mapping
function _legacySlot(slotId) {
  const map = { tay_phai:'weapon', than:'armor', co:'accessory' };
  return map[slotId] || slotId;
}
