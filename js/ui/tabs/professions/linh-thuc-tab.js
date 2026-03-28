// ============================================================
// ui/tabs/professions/linh-thuc-tab.js
// ============================================================
import { FOOD_RECIPES, FOOD_INGREDIENTS, KITCHEN_DURABILITY, KITCHEN_SUCCESS_BONUS,
  getChefRank, getNextChefRank, fmtDuration } from '../../../alchemy/linh-thuc-data.js';
import { getSpiritCraftBonus } from '../../../core/spirit-root.js';
import { plantCrop, harvestCrop, DUOC_DIEN_CROPS, DUOC_DIEN_EXPAND_COST } from '../../../core/duoc-dien-engine.js';

export function renderLinhThuc(G, _foodTier = 0, _foodCat = 'all') {
  const lt         = G.linhThuc || {};
  const cooksCount = lt.cooksCount || 0;
  const rank       = getChefRank(cooksCount);
  const nextRank   = getNextChefRank(cooksCount);
  const kitchen    = lt.kitchen || { level:0, durability:0 };
  const kitLv      = kitchen.level || 0;
  const kitDur     = kitchen.durability || 0;
  const kitCfg     = kitLv > 0 ? (KITCHEN_DURABILITY[kitLv] || { max:10, repairCost:60 }) : null;
  const kitMax     = kitCfg?.max || 0;
  const kitPct     = kitMax > 0 ? Math.round((kitDur / kitMax) * 100) : 0;
  const kitColor   = kitPct > 60 ? '#56c46a' : kitPct > 25 ? '#f0d47a' : '#e05c4a';
  const isBroken   = kitLv > 0 && kitDur <= 0;
  const rankPct    = nextRank
    ? Math.min(100, Math.round((cooksCount - rank.minCooks) / (nextRank.minCooks - rank.minCooks) * 100))
    : 100;

  // ── Bếp status ──
  let kitchenHtml;
  if (kitLv === 0) {
    kitchenHtml = `
      <div class="nn-info-row nn-warn">
        🍳 Chưa có Bếp Linh Thực —
        <button class="btn-sm btn-secondary nn-goto-shop" style="margin-left:6px">Mua tại Cửa Hàng →</button>
      </div>`;
  } else if (isBroken) {
    kitchenHtml = `
      <div class="nn-info-row" style="border-color:#e05c4a44;background:#e05c4a0a">
        💥 Bếp Cấp ${kitLv} — <strong style="color:#e05c4a">BỊ HỎNG</strong>
        <span style="font-size:10px;color:var(--text-dim);margin-left:8px">Phí sửa: 💎 ${kitCfg?.repairCost}</span>
        <button class="btn-sm btn-danger nn-repair-kitchen" style="margin-left:8px">🔧 Sửa Bếp</button>
      </div>`;
  } else {
    kitchenHtml = `
      <div class="nn-info-row" style="border-color:#4db8a044;background:#4db8a008">
        🍳 Bếp Linh Thực Cấp <strong>${kitLv}</strong>
        <div class="nn-durability-bar" style="margin:0 8px">
          <div class="nn-dur-fill" style="width:${kitPct}%;background:${kitColor}"></div>
        </div>
        <span style="font-size:10px;color:${kitColor}">${Math.floor(kitDur)}/${kitMax}</span>
        ${kitLv < 5
          ? `<button class="btn-sm btn-secondary nn-goto-shop" style="margin-left:6px;font-size:10px">Nâng →</button>`
          : '<span style="color:var(--jade);margin-left:6px;font-size:10px">MAX</span>'}
        ${kitPct < 40
          ? `<button class="btn-sm btn-danger nn-repair-kitchen" style="margin-left:6px;font-size:10px">🔧 Sửa (💎${kitCfg?.repairCost})</button>`
          : ''}
      </div>`;
  }

  // ── Rank bar ──
  const rankHtml = `
    <div class="forge-rank-bar" style="border-color:rgba(77,184,160,0.25);background:rgba(77,184,160,0.05)">
      <div class="frb-top">
        <span class="frb-rank" style="color:#4db8a0">${rank.emoji} ${rank.name}</span>
        <span class="frb-count">${cooksCount} lần nấu thành công</span>
      </div>
      <div class="frb-progress"><div class="frb-fill" style="width:${rankPct}%;background:linear-gradient(90deg,#4db8a0,#56c46a)"></div></div>
      ${nextRank
        ? `<div class="frb-next">→ ${nextRank.emoji} ${nextRank.name} (còn ${nextRank.minCooks - cooksCount} lần)</div>`
        : '<div class="frb-next" style="color:var(--gold)">✦ Đã đạt cấp tối cao</div>'}
      <div class="frb-desc">${rank.desc}</div>
    </div>`;

  // ── Active buffs ──
  const activeBuffs = Array.isArray(lt.activeBuffs) ? lt.activeBuffs.filter(b => b.timer > 0) : [];
  const buffLabels  = { rate_pct:'⚡ Tốc Tu', atk_pct:'⚔ ATK', def_pct:'🛡 DEF', hp_max_pct:'❤ HP Max', hp_regen:'💚 Hồi HP', stone_pct:'💎 Stone', exp_pct:'📚 EXP', atk_flat:'⚔ ATK+' };
  const activeHtml = activeBuffs.length > 0 ? `
    <div class="lt-active-buffs">
      <div class="lt-buffs-title">⚡ Buff Đang Hiệu Lực</div>
      <div class="lt-buffs-grid">
        ${activeBuffs.map(b => `
          <div class="lt-buff-pill" title="${b.name}">
            <span>${b.emoji || '🍲'}</span>
            <span style="color:#4db8a0">${buffLabels[b.type]||b.type} +${b.value}${b.type.includes('pct')||b.type==='rate_pct'?'%':''}</span>
            <span class="lt-buff-timer">${fmtDuration(Math.ceil(b.timer))}</span>
          </div>`).join('')}
      </div>
    </div>` : '';

  // ── Nếu chưa có Bếp ──
  if (kitLv === 0) {
    return kitchenHtml + rankHtml + `
      <div class="empty-state-box" style="margin-top:12px">
        <div style="font-size:36px;margin-bottom:10px">🍲</div>
        <h3 style="color:#4db8a0;margin-bottom:8px">Cần Bếp Linh Thực</h3>
        <p style="color:var(--text-dim);font-size:12px;line-height:1.8">
          Mua <strong>Bếp Đất Linh</strong> tại <strong>Cửa Hàng</strong> để bắt đầu nấu linh thực.<br>
          Nguyên liệu thu thập từ: chiến trường, thu thập thảo dược, bản đồ.<br>
          Linh thực cung cấp buff <strong>tuổi thọ, HP, ATK, tốc tu luyện</strong>.
        </p>
      </div>`;
  }

  // ── Tier + Category filter ──
  const TIER_COLORS = { 0:'#888', 1:'#aaa', 2:'#56c46a', 3:'#3a9fd5', 4:'#c8a84b', 5:'#e05c4a' };
  const TIER_LABELS = { 0:'Tất cả', 1:'Phàm Thực', 2:'Linh Thực', 3:'Cao Phẩm', 4:'Thượng Phẩm', 5:'Tiên Thực' };
  const CAT_LABELS  = { all:'🍽 Tất cả', tra:'🍵 Trà', canh:'🥣 Canh', com:'🍚 Cơm', banh:'🥮 Bánh', tiec:'🎉 Tiệc' };

  const tierTabsHtml = Object.entries(TIER_LABELS).map(([t, label]) => {
    const tNum = parseInt(t);
    const rankNeeded = { 1:0, 2:1, 3:2, 4:3, 5:4 }[tNum] || 0;
    const locked = tNum > 0 && rank.rank < rankNeeded;
    return `<button class="forge-tier-btn ${_foodTier === tNum ? 'forge-tier-active' : ''} ${locked ? 'forge-tier-locked' : ''}"
      data-food-tier="${t}" style="--tier-color:${TIER_COLORS[tNum]}" ${locked ? 'disabled' : ''}>
      ${label}${locked ? ' 🔒' : ''}
    </button>`;
  }).join('');

  const catTabsHtml = Object.entries(CAT_LABELS).map(([cat, label]) =>
    `<button class="lt-cat-btn ${_foodCat === cat ? 'lt-cat-active' : ''}" data-food-cat="${cat}">${label}</button>`
  ).join('');

  // ── Recipe list ──
  let filtered = FOOD_RECIPES;
  if (_foodTier > 0) filtered = filtered.filter(r => (r.tier||1) === _foodTier);
  if (_foodCat !== 'all') filtered = filtered.filter(r => r.category === _foodCat);

  const ALL_FOOD_ING = FOOD_INGREDIENTS;
  const RARITY_C = { common:'#888', uncommon:'#56c46a', rare:'#3a9fd5', epic:'#9c27b0', legendary:'#f0d47a' };
  const TIER_C   = { 1:'#aaa', 2:'#56c46a', 3:'#3a9fd5', 4:'#c8a84b', 5:'#e05c4a' };

  const recipesHtml = filtered.map(r => {
    const realmLocked = (G.realmIdx||0) < (r.requireRealm||0);
    const rankLocked  = rank.rank < (r.requireRank||0);
    const locked      = realmLocked || rankLocked;
    const tierColor   = TIER_C[r.tier||1] || '#888';

    // Kiểm tra NL — kho linhThuc + kho alchemy
    const mats = r.materials.map(({id,qty}) => {
      const fromFood    = lt.ingredients?.[id]   || 0;
      const fromAlchemy = G.alchemy?.ingredients?.[id] || 0;
      const have = fromFood + fromAlchemy;
      const enough = have >= qty;
      const ing = ALL_FOOD_ING.find(i => i.id === id);
      const mColor = RARITY_C[ing?.rarity] || '#888';
      return `<span class="ingredient ${enough?'have':'missing'}" title="${ing?.desc||id}" style="border-color:${mColor}33">
        ${ing?.emoji||'?'} ${ing?.name||id} <span class="${enough?'':'ing-short'}">${have}/${qty}</span>
      </span>`;
    }).join('');

    const kitBonus    = KITCHEN_SUCCESS_BONUS[kitLv] || 0;
    const rankBonus   = (rank.bonus||0) / 100;
    const spiritEl    = G.spiritData?.mainElement;
    const spiritBonus = (spiritEl === 'moc' || spiritEl === 'tu') ? 0.12 : 0;
    const finalChance = Math.min(0.97, (r.successChance||0.8) + rankBonus + kitBonus + spiritBonus);
    const chanceColor = finalChance > 0.75 ? '#56c46a' : finalChance > 0.55 ? '#f0d47a' : '#e05c4a';

    const canCook = !locked && !isBroken
      && r.materials.every(({id,qty}) => ((lt.ingredients?.[id]||0) + (G.alchemy?.ingredients?.[id]||0)) >= qty)
      && (G.stone||0) >= (r.stoneCost||0);

    // Buff preview
    const buffPreviews = (r.buffs||[]).map(b => {
      const BL = { rate_pct:'+%⚡', atk_pct:'+%⚔', def_pct:'+%🛡', hp_max_pct:'+%❤', hp_regen:'HP/s', stone_pct:'+%💎', exp_pct:'+%📚', atk_flat:'+ATK', hp_instant:'+HP', stamina_regen:'+体', lifespan:'+寿' };
      const label = BL[b.type] || b.type;
      const durLabel = b.duration ? ` <span style="color:var(--text-dim);font-size:9px">${fmtDuration(b.duration)}</span>` : '';
      return `<span class="lt-buff-tag" style="color:${tierColor}">+${b.value} ${label}${durLabel}</span>`;
    }).join('');

    const REALM_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];
    const CAT_MAP = { tra:'Trà', canh:'Canh', com:'Cơm', banh:'Bánh', tiec:'Tiệc' };

    return `
      <div class="recipe-card nn-recipe-card ${canCook?'can-craft':'no-craft'} ${locked?'recipe-locked':''}"
           style="border-color:${tierColor}44">
        <div class="recipe-header">
          <span class="recipe-tier" style="color:${tierColor}">T${r.tier} ${CAT_MAP[r.category]||''}</span>
          <h3 style="margin:0">${r.emoji} ${r.name}</h3>
        </div>
        <p class="recipe-effect" style="font-size:11px;color:var(--text-dim);margin:3px 0">${r.desc}</p>
        <div class="recipe-ingredients">${mats}</div>
        <div class="lt-buff-row">${buffPreviews}</div>
        <div class="nn-recipe-meta">
          <div class="nn-meta-row">
            <span>💎 ${r.stoneCost||0}</span>
            <span style="color:${chanceColor}">✓ ${Math.floor(finalChance*100)}%</span>
            ${spiritBonus > 0 ? '<span style="color:#56c46a;font-size:10px">🌿 Linh Căn +12%</span>' : ''}
          </div>
        </div>
        ${locked
          ? `<div style="text-align:center;font-size:11px;color:#666;padding:6px">
              🔒 ${realmLocked ? `Cần ${REALM_NAMES[r.requireRealm]}` : `Cần nâng Linh Thực Sư rank ${r.requireRank}`}
             </div>`
          : `<button class="btn-cook btn-primary" data-recipe-id="${r.id}"
                     ${canCook?'':'disabled'} style="border-color:${tierColor};background:${tierColor}22">
               ${isBroken ? '💥 Bếp hỏng' : canCook ? `🍳 Nấu` : '❌ Thiếu nguyên liệu'}
             </button>`}
      </div>`;
  }).join('');

  const emptyHtml = filtered.length === 0
    ? `<div class="empty-state-box"><p style="color:var(--text-dim)">Không có công thức phù hợp.</p></div>` : '';

  // ── Dược Điền section ──
  const duocDienHtml = _renderDuocDien(G);

  return kitchenHtml + rankHtml + activeHtml + duocDienHtml + `
    <div class="forge-tier-tabs">${tierTabsHtml}</div>
    <div class="lt-cat-tabs">${catTabsHtml}</div>
    <div class="nn-recipes">${recipesHtml || emptyHtml}</div>`;
}

// ---- Dược Điền ----
export function renderDuocDien(G) {
  const dd   = G.duocDien;
  const now  = G.gameTime?.currentYear ?? 0;

  if (!dd || dd.maxSlots === 0) {
    return `
      <div class="lt-duoc-dien-section">
        <div class="lt-dd-title">🪴 Dược Điền</div>
        <div class="lt-dd-no-slots">
          Chưa có ô trồng. Mua ô đầu tiên tại
          <button class="lt-goto-shop" onclick="window._gameActions?.shopActions && (window._gameActions.shopActions._gotoShop?.() || switchTab('shop'))">
            Cửa Hàng → Dược Điền
          </button>
          (200💎)
        </div>
      </div>`;
  }

  const crop = DUOC_DIEN_CROPS['linh_me'];

  const slotsHtml = dd.slots.map((slot, i) => {
    if (slot.state === 'empty') {
      const seedCount = Array.isArray(G.inventory)
        ? G.inventory.filter(s => s?.id === 'linh_me_seed').length : 0;
      const canPlant = seedCount > 0;
      return `
        <div class="lt-dd-slot empty ${canPlant ? '' : 'no-seed'}"
             data-slot="${i}" data-action="plant"
             title="${canPlant ? 'Gieo Linh Mễ' : 'Cần hạt giống — mua tại Cửa Hàng'}">
          <span class="dd-icon">◻</span>
          <span>${canPlant ? '+ Gieo' : '🫘 Cần hạt'}</span>
        </div>`;
    }
    if (slot.state === 'growing') {
      const daysLeft = Math.max(0, (slot.harvestAt - now) * 365); // convert năm → ngày
      return `
        <div class="lt-dd-slot growing" title="Đang lớn — còn ${daysLeft.toFixed(1)} ngày">
          <span class="dd-icon">🌱</span>
          <span>Linh Mễ</span>
          <span class="dd-days">còn ${daysLeft.toFixed(1)} ngày</span>
        </div>`;
    }
    if (slot.state === 'ready') {
      return `
        <div class="lt-dd-slot ready" data-slot="${i}" data-action="harvest"
             title="Trưởng thành — nhấn để thu hoạch!">
          <span class="dd-icon">🌾</span>
          <span>Thu Hoạch!</span>
        </div>`;
    }
    return '';
  }).join('');

  const linhMeCount  = G.hunger?.linhMeCount ?? 0;
  const ichCocDays   = Math.ceil(G.hunger?.ichCocDanDays ?? 0);
  const hungerStatus = G.realmIdx === 0
    ? `<div style="font-size:11px;color:var(--text-dim);margin-top:4px">
         🌾 Kho: <strong style="color:var(--jade)">${linhMeCount}</strong> phần
         ${ichCocDays > 0 ? ` | 💊 Ích Cốc Đan còn <strong style="color:#f0d47a">${ichCocDays}</strong> ngày` : ''}
       </div>`
    : `<div style="font-size:11px;color:var(--text-dim);margin-top:4px">Trúc Cơ+ không cần ăn.</div>`;

  return `
    <div class="lt-duoc-dien-section">
      <div class="lt-dd-title">🪴 Dược Điền
        <span style="font-size:11px;font-weight:400;color:var(--text-dim);margin-left:6px">
          ${dd.maxSlots} ô
        </span>
      </div>
      ${hungerStatus}
      <div class="lt-dd-grid">${slotsHtml}</div>
    </div>`;
}