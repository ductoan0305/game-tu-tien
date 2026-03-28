// ============================================================
// ui/tabs/shop-tab.js — Linh Bảo Các
// ============================================================
import { ITEMS } from '../../core/data.js';
import { fmtNum } from '../../utils/helpers.js';
import { toHaCount, formatCurrency, migrateCurrency } from '../../core/currency.js';
import { expandDuocDien, DUOC_DIEN_EXPAND_COST } from '../../core/duoc-dien-engine.js';
import { getDanhVongTier } from '../../core/danh-vong.js';

// Tính giá sau discount danh vọng
function _applyDVDiscount(cost, G) {
  const tier = getDanhVongTier(G.danhVong ?? 0);
  if (tier.discountPct <= 0) return { cost, discountPct: 0 };
  return { cost: Math.floor(cost * (1 - tier.discountPct / 100)), discountPct: tier.discountPct };
}

const REALM_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];
const RARITY_COLORS = {
  'thường':'#888', 'hiếm':'#3a9fd5', 'cực hiếm':'#a855f7', 'huyền thoại':'#f0d47a'
};

// Sub-tab state
let _activeRealm = -1;   // -1 = chưa khởi tạo
let _activeCategory = 'items'; // 'items' | 'food' | 'duoc_dien'

export function renderShopTab(G, actions) {
  const panel = document.getElementById('panel-shop');
  if (!panel) return;

  migrateCurrency(G);
  const totalHa = toHaCount(G.currency || { ha: G.stone || 0 });

  if (_activeRealm === -1) _activeRealm = G.realmIdx;

  // ---- Category tabs ----
  const catTabsHtml = [
    { id:'items',      label:'⚗ Vật Phẩm' },
    { id:'food',       label:'🌾 Lương Thực' },
    { id:'duoc_dien',  label:'🪴 Dược Điền' },
  ].map(c => `
    <button class="shop-cat-btn ${_activeCategory === c.id ? 'active' : ''}" data-cat="${c.id}">
      ${c.label}
    </button>`).join('');

  // ---- Content theo category ----
  let contentHtml = '';

  if (_activeCategory === 'items') {
    // Items theo realm (giữ nguyên logic cũ)
    const maxShowRealm = Math.min(G.realmIdx + 1, 4);
    const realmGroups  = [];
    for (let r = 0; r <= maxShowRealm; r++) {
      const items = ITEMS.filter(i => (i.unlockRealm ?? 0) === r && i.shopCategory !== 'food');
      if (items.length) realmGroups.push({ realm: r, items });
    }
    const subTabsHtml = realmGroups.map(({ realm }) => {
      const locked = realm > G.realmIdx;
      return `<button class="shop-realm-btn ${_activeRealm === realm ? 'active' : ''} ${locked ? 'shop-realm-locked' : ''}"
        data-realm="${realm}">${locked ? '🔒 ' : ''}${REALM_NAMES[realm] || `Realm ${realm}`}</button>`;
    }).join('');

    const group      = realmGroups.find(g => g.realm === _activeRealm);
    const items      = group ? group.items : [];
    const realmLock  = _activeRealm > G.realmIdx;
    const itemsHtml  = realmLock
      ? `<div class="shop-realm-lock-msg">🔒 Cần đạt <strong>${REALM_NAMES[_activeRealm]}</strong> để mua các vật phẩm này.</div>`
      : items.map(item => _renderItem(G, item, totalHa)).join('');

    contentHtml = `
      <div class="shop-realm-tabs">${subTabsHtml}</div>
      <div class="shop-grid">${itemsHtml}</div>`;

  } else if (_activeCategory === 'food') {
    // Lương thực — chỉ LK mới cần
    const foodItems  = ITEMS.filter(i => i.shopCategory === 'food');
    const h          = G.hunger;
    const infoHtml   = G.realmIdx === 0
      ? `<div class="shop-food-info">
           <span>🌾 Linh Mễ kho: <strong>${h?.linhMeCount ?? 0}</strong> phần</span>
           <span style="margin-left:12px">💊 Ích Cốc Đan: <strong>${Math.ceil(h?.ichCocDanDays ?? 0)}</strong> ngày còn lại</span>
           <p style="color:var(--color-text-secondary);font-size:12px;margin:4px 0 0">
             Tu sĩ Luyện Khí cần ăn mỗi 2 ngày. Trúc Cơ trở lên không cần ăn.
           </p>
         </div>`
      : `<div class="shop-food-info" style="color:var(--color-text-secondary)">
           Trúc Cơ trở lên — linh lực tự nuôi thân, không cần lương thực.
         </div>`;
    contentHtml = `
      ${infoHtml}
      <div class="shop-grid">${foodItems.map(item => _renderItem(G, item, totalHa)).join('')}</div>`;

  } else if (_activeCategory === 'duoc_dien') {
    // Dược Điền — mở rộng ô
    const dd       = G.duocDien;
    const curSlots = dd?.maxSlots ?? 0;
    const nextSlot = curSlots + 1;
    const nextCost = DUOC_DIEN_EXPAND_COST[nextSlot];
    const canAfford = nextCost && totalHa >= nextCost;

    const slotsDisplay = Array.from({ length: Math.max(curSlots, 3) }, (_, i) => {
      if (i < curSlots) {
        const slot = dd?.slots?.[i];
        const state = slot?.state ?? 'empty';
        const icon  = state === 'empty' ? '◻' : state === 'growing' ? '🌱' : '🌾';
        return `<div class="duoc-dien-slot ${state}">${icon} Ô ${i + 1}</div>`;
      }
      return `<div class="duoc-dien-slot locked">🔒 Chưa mở</div>`;
    }).join('');

    const expandHtml = nextCost
      ? `<button class="btn-buy btn-expand-dd ${canAfford ? '' : 'disabled'}" data-action="expand_duoc_dien"
           ${!canAfford ? 'disabled' : ''}>
           🪴 Mở Ô Thứ ${nextSlot} — ${fmtNum(nextCost)} 💎
         </button>`
      : `<p style="color:var(--color-text-secondary)">Đã đạt số ô tối đa (${curSlots} ô).</p>`;

    contentHtml = `
      <div class="shop-food-info">
        <strong>🪴 Dược Điền</strong> — nơi trồng Linh Mễ và linh thảo.
        <p style="font-size:12px;color:var(--color-text-secondary);margin:4px 0 0">
          Mỗi ô có thể trồng 1 cây. Linh Mễ: gieo 1 hạt → 5 ngày → thu 8-12 phần + 2 hạt giống.
        </p>
        <p style="font-size:12px;color:var(--color-text-secondary);margin:2px 0 0">
          Bế quan vẫn có thể thu hoạch — chỉ cần vào tab Linh Thực khi cây chín.
        </p>
      </div>
      <div class="duoc-dien-slots">${slotsDisplay}</div>
      <div style="margin-top:12px">${expandHtml}</div>
      <p style="font-size:11px;color:var(--color-text-tertiary);margin:8px 0 0">
        Giá mở ô: 1→200💎 | 2→400 | 3→800 | 4→1500 | 5→2800 | 6→5000 | 7→8000 | 8→12000 | 9→18000 | 10→25000
      </p>`;
  }

  panel.innerHTML = `
    <div class="tab-content">
      <h2 class="tab-title">🏮 Linh Bảo Các</h2>
      <div class="shop-wallet">
        <span class="sw-label">💰 Linh Thạch:</span>
        <span class="sw-amount">${formatCurrency(G)}</span>
        <span class="sw-hint">💎 Hạ · 💠 Trung (1💠=100💎) · 🔮 Thượng (1🔮=100💠)</span>
      </div>
      <div class="shop-cat-tabs">${catTabsHtml}</div>
      <div class="shop-content">${contentHtml}</div>
    </div>`;

  // Wire category buttons
  panel.querySelectorAll('.shop-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeCategory = btn.dataset.cat;
      renderShopTab(G, actions);
    });
  });

  // Wire realm tab buttons (chỉ trong items tab)
  panel.querySelectorAll('.shop-realm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeRealm = parseInt(btn.dataset.realm);
      renderShopTab(G, actions);
    });
  });

  // Wire buy buttons
  panel.querySelectorAll('.btn-buy').forEach(btn => {
    if (btn.dataset.itemId) {
      btn.addEventListener('click', () => {
        const costOverride = btn.dataset.costOverride ? parseInt(btn.dataset.costOverride) : undefined;
        actions.buy(btn.dataset.itemId, costOverride);
      });
    }
  });

  // Wire expand dược điền
  panel.querySelectorAll('[data-action="expand_duoc_dien"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const result = expandDuocDien(G);
      if (result.ok) renderShopTab(G, actions);
      else alert(result.msg);
    });
  });
}

function _renderItem(G, item, totalHa) {
  const color = RARITY_COLORS[item.rarity] || '#888';
  // Áp dụng discount danh vọng (không áp dụng cho furnace/forge/kitchen — đó là đồ nghề)
  const isEquipment = ['furnace','forge_furnace','kitchen'].includes(item.type);
  const { cost: effectiveCost, discountPct } = isEquipment
    ? { cost: item.cost, discountPct: 0 }
    : _applyDVDiscount(item.cost, G);
  const canAfford = totalHa >= effectiveCost;
  const discountBadge = discountPct > 0
    ? `<span style="color:#56c46a;font-size:10px;margin-left:4px">-${discountPct}%🌟</span>`
    : '';

  // Lò đan: kiểm tra đã mua chưa
  if (item.type === 'furnace') {
    const currentLv = G.alchemy?.furnaceLevel || 0;
    const alreadyOwned = currentLv >= item.val;
    const missingPrev = item.val > 1 && currentLv < item.val - 1;
    const furnaceLabel = alreadyOwned ? '✅ Đã Có' : missingPrev ? '🔒 Cần Lò Trước' : '🔥 Lò Đan';
    return `
      <div class="shop-item ${alreadyOwned ? 'shop-item-owned' : ''} ${missingPrev ? 'shop-item-locked' : ''}" style="--item-color:${color}; border-color:${color}33">
        <div class="shop-item-top">
          <span class="item-rarity-badge" style="color:${color};background:${color}18">${item.rarity.toUpperCase()}</span>
          <span class="item-type-badge">${furnaceLabel}</span>
        </div>
        <div class="item-emoji">${item.emoji}</div>
        <h4 class="item-name">${item.name}</h4>
        <p class="item-namecn">${item.nameCN}</p>
        <p class="item-desc">${item.desc}</p>
        <p class="item-effect" style="color:${color}">✦ ${item.effect}</p>
        <div class="shop-price ${canAfford ? '' : 'shop-price-broke'}">
          <span>${item.costTier}: <strong>${fmtNum(item.cost)}</strong></span>
          ${alreadyOwned ? '' : !canAfford ? '<span class="shop-cant">— Không đủ</span>' : ''}
        </div>
        ${alreadyOwned
          ? '<div class="shop-owned-badge">✅ Đã sở hữu</div>'
          : `<button class="btn-buy btn-primary ${(canAfford && !missingPrev) ? '' : 'disabled'}"
                    data-item-id="${item.id}" ${(canAfford && !missingPrev) ? '' : 'disabled'}>
              ${missingPrev ? '🔒 Cần mua lò trước' : canAfford ? '🛒 Mua' : '🔒 Chưa đủ'}
            </button>`}
      </div>`;
  }

  // Bễ Rèn: tương tự lò đan
  if (item.type === 'forge_furnace') {
    const currentLv = G.alchemy?.forge?.level || 0;
    const alreadyOwned = currentLv >= item.val;
    const missingPrev = item.val > 1 && currentLv < item.val - 1;
    const forgeLabel = alreadyOwned ? '✅ Đã Có' : missingPrev ? '🔒 Cần Bễ Trước' : '⚒ Bễ Rèn';
    return `
      <div class="shop-item ${alreadyOwned ? 'shop-item-owned' : ''} ${missingPrev ? 'shop-item-locked' : ''}" style="--item-color:${color}; border-color:${color}33">
        <div class="shop-item-top">
          <span class="item-rarity-badge" style="color:${color};background:${color}18">${item.rarity.toUpperCase()}</span>
          <span class="item-type-badge">${forgeLabel}</span>
        </div>
        <div class="item-emoji">${item.emoji}</div>
        <h4 class="item-name">${item.name}</h4>
        <p class="item-namecn">${item.nameCN}</p>
        <p class="item-desc">${item.desc}</p>
        <p class="item-effect" style="color:${color}">✦ ${item.effect}</p>
        <div class="shop-price ${canAfford ? '' : 'shop-price-broke'}">
          <span>${item.costTier}: <strong>${fmtNum(item.cost)}</strong></span>
          ${alreadyOwned ? '' : !canAfford ? '<span class="shop-cant">— Không đủ</span>' : ''}
        </div>
        ${alreadyOwned
          ? '<div class="shop-owned-badge">✅ Đã sở hữu</div>'
          : `<button class="btn-buy btn-primary ${(canAfford && !missingPrev) ? '' : 'disabled'}"
                    data-item-id="${item.id}" ${(canAfford && !missingPrev) ? '' : 'disabled'}>
              ${missingPrev ? '🔒 Cần Bễ Rèn trước' : canAfford ? '🛒 Mua' : '🔒 Chưa đủ'}
            </button>`}
      </div>`;
  }

  // Bếp Linh Thực: tương tự Bễ Rèn
  if (item.type === 'kitchen') {
    const currentLv = G.linhThuc?.kitchen?.level || 0;
    const alreadyOwned = currentLv >= item.val;
    const missingPrev = item.val > 1 && currentLv < item.val - 1;
    const kitLabel = alreadyOwned ? '✅ Đã Có' : missingPrev ? '🔒 Cần Bếp Trước' : '🍳 Bếp Linh Thực';
    return `
      <div class="shop-item ${alreadyOwned ? 'shop-item-owned' : ''} ${missingPrev ? 'shop-item-locked' : ''}" style="--item-color:${color}; border-color:${color}33">
        <div class="shop-item-top">
          <span class="item-rarity-badge" style="color:${color};background:${color}18">${item.rarity.toUpperCase()}</span>
          <span class="item-type-badge">${kitLabel}</span>
        </div>
        <div class="item-emoji">${item.emoji}</div>
        <h4 class="item-name">${item.name}</h4>
        <p class="item-namecn">${item.nameCN}</p>
        <p class="item-desc">${item.desc}</p>
        <p class="item-effect" style="color:${color}">✦ ${item.effect}</p>
        <div class="shop-price ${canAfford ? '' : 'shop-price-broke'}">
          <span>${item.costTier}: <strong>${fmtNum(item.cost)}</strong></span>
          ${alreadyOwned ? '' : !canAfford ? '<span class="shop-cant">— Không đủ</span>' : ''}
        </div>
        ${alreadyOwned
          ? '<div class="shop-owned-badge">✅ Đã sở hữu</div>'
          : `<button class="btn-buy btn-primary ${(canAfford && !missingPrev) ? '' : 'disabled'}"
                    data-item-id="${item.id}" ${(canAfford && !missingPrev) ? '' : 'disabled'}>
              ${missingPrev ? '🔒 Cần Bếp trước' : canAfford ? '🛒 Mua' : '🔒 Chưa đủ'}
            </button>`}
      </div>`;
  }

  const typeLabels = {
    consume: '🧪 Tiêu Dùng', passive: '✦ Vĩnh Viễn',
    timed: '⏱ Có Thời Hạn', buff: '⚡ Buff'
  };
  const typeLabel = typeLabels[item.type] || item.type;

  return `
    <div class="shop-item" style="--item-color:${color}; border-color:${color}33">
      <div class="shop-item-top">
        <span class="item-rarity-badge" style="color:${color};background:${color}18">
          ${item.rarity.toUpperCase()}
        </span>
        <span class="item-type-badge">${typeLabel}</span>
      </div>
      <div class="item-emoji">${item.emoji}</div>
      <h4 class="item-name">${item.name}</h4>
      <p class="item-namecn">${item.nameCN}</p>
      <p class="item-desc">${item.desc}</p>
      <p class="item-effect" style="color:${color}">✦ ${item.effect}</p>
      <div class="shop-price ${canAfford ? '' : 'shop-price-broke'}">
        ${discountPct > 0
          ? `<span><s style="color:#666;font-size:11px">${fmtNum(item.cost)}</s> → <strong>${fmtNum(effectiveCost)}</strong>${discountBadge}</span>`
          : `<span>${item.costTier}: <strong>${fmtNum(effectiveCost)}</strong></span>`
        }
        ${!canAfford ? '<span class="shop-cant">— Không đủ</span>' : ''}
      </div>
      <button class="btn-buy btn-primary ${canAfford ? '' : 'disabled'}"
              data-item-id="${item.id}" data-cost-override="${effectiveCost}" ${canAfford ? '' : 'disabled'}>
        ${canAfford ? '🛒 Mua' : '🔒 Chưa đủ'}
      </button>
    </div>`;
}