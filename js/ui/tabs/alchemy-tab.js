// ============================================================
// ui/tabs/alchemy-tab.js — Luyện Đan + Luyện Khí Sư
// 2 subtabs: Luyện Đan | Luyện Khí Sư
// Nguyên liệu hiển thị inline bên dưới Luyện Đan
// Thu Thảo đã chuyển sang Map (location-popup)
// ============================================================
import { GATHER_ZONES, RECIPES, PILLS, INGREDIENTS } from '../../alchemy/alchemy-data.js';
import { CRAFTING_RECIPES, MINERALS, getCraftsmanRank } from '../../alchemy/crafting-data.js';
import { getAvailableRecipes } from '../../alchemy/alchemy-engine.js';
import { fmtNum } from '../../utils/helpers.js';
import { getSpiritCraftBonus } from '../../core/spirit-root.js';

let _activeSubtab = 'craft';

const RARITY_NAMES = { common:'Phổ Thông',uncommon:'Bất Thường',rare:'Hiếm',epic:'Sử Thi',legendary:'Huyền Thoại' };
const RARITY_COLORS = { common:'#888',uncommon:'#56c46a',rare:'#3a9fd5',epic:'#9c27b0',legendary:'#f0d47a' };
const REALM_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa'];

// INGREDIENTS là object {id: {name,emoji,zone}} — chuyển thành array để dễ find
const ALL_INGS   = Object.entries(INGREDIENTS).map(([id, v]) => ({ id, ...v }));
const ALL_PILLS  = PILLS;
const ALL_RECIPES= RECIPES;

export function renderAlchemyTab(G, actions) {
  const panel = document.getElementById('panel-alchemy');
  if (!panel) return;

  const sub = _activeSubtab;
  const craftsmanRank = getCraftsmanRank(G.alchemy?.craftsCount || 0);
  const danBonus  = getSpiritCraftBonus(G.spiritData, 'luyen_dan');

  panel.innerHTML = `
    <div class="tab-content">
      <h2 class="tab-title">⚗ Đan Luyện Các</h2>

      <div class="alchemy-info-bar">
        ${(G.alchemy?.furnaceLevel||0) > 0 ? `
        <div class="aib-item">
          🔥 Lò Đan Cấp <strong>${G.alchemy.furnaceLevel}</strong>
          ${G.alchemy.furnaceLevel < 5
            ? `<button id="btn-goto-shop-furnace" class="btn-sm btn-secondary" style="margin-left:6px">Nâng cấp →</button>`
            : '<span class="maxed">MAX</span>'}
        </div>` : `
        <div class="aib-item aib-warn">🔥 Chưa có lò đan — <button id="btn-goto-shop-furnace" class="btn-sm btn-secondary">Mua tại Cửa Hàng →</button></div>`}
        <div class="aib-item">🔨 ${craftsmanRank.name}</div>
        ${danBonus > 1 ? `<div class="aib-item" style="color:#56c46a">⚗ ×${danBonus.toFixed(2)} linh căn</div>` : ''}
      </div>

      <div class="alchemy-subtabs">
        <button class="subtab-btn ${sub==='craft'?'active':''}" data-subtab="craft">⚗ Luyện Đan</button>
        <button class="subtab-btn ${sub==='forge'?'active':''}" data-subtab="forge">⚒ Luyện Khí Sư</button>
      </div>

      <div id="alchemy-content">
        ${_renderSubtab(sub, G, danBonus)}
      </div>
    </div>`;

  _wireEvents(G, actions, danBonus);
}

function _renderSubtab(sub, G, danBonus) {
  switch(sub) {
    case 'craft': return _renderCraft(G, danBonus) + _renderIngredients(G);
    case 'forge': return _renderForge(G);
    default: return '';
  }
}

// ---- LUYỆN ĐAN ----
function _renderCraft(G, danBonus) {
  const known = G.alchemy?.knownRecipes || [];

  if (known.length === 0) {
    return `
      <div class="empty-state-box">
        <div style="font-size:36px;margin-bottom:10px">📜</div>
        <h3 style="color:var(--gold);margin-bottom:8px">Chưa có công thức</h3>
        <p style="color:var(--text-dim);font-size:12px;line-height:1.6">
          Công thức luyện đan phải được học từ:<br>
          • <strong>NPC Đan Sư</strong> tại các thôn/thành<br>
          • <strong>Nhiệm vụ</strong> từ tông môn hoặc lữ hành<br>
          • <strong>Loot ngẫu nhiên</strong> từ yêu thú<br>
          • <strong>Tàng Kinh Các</strong> tông môn (cần gia nhập)
        </p>
      </div>`;
  }

  const recipes = ALL_RECIPES.filter(r => known.includes(r.id));
  const byTier = {};
  recipes.forEach(r => {
    const t = r.tier||1;
    if (!byTier[t]) byTier[t] = [];
    byTier[t].push(r);
  });

  const TIER_NAMES = { 1:'Phàm Phẩm Đan', 2:'Linh Phẩm Đan', 3:'Tiên Phẩm Đan', 4:'Thần Phẩm Đan' };

  return Object.entries(byTier).map(([tier, rList]) => `
    <div class="recipe-tier-group">
      <div class="rtg-title" style="color:${['','#888','#56c46a','#c8a84b','#7b68ee'][tier]||'#888'}">
        ${TIER_NAMES[tier]||'Tier '+tier}
      </div>
      ${rList.map(r => _renderRecipeCard(G, r, danBonus)).join('')}
    </div>`).join('');
}

function _renderRecipeCard(G, recipe, danBonus) {
  const pill = ALL_PILLS.find(p => p.id === recipe.pillId || p.id === recipe.id);
  const color = ['','#888','#56c46a','#c8a84b','#7b68ee'][recipe.tier]||'#888';

  const ings = (recipe.ingredients||[]).map(({id,qty}) => {
    const have = G.alchemy?.ingredients?.[id] || 0;
    const enough = have >= qty;
    const ing = ALL_INGS.find(i=>i.id===id);
    return `<span class="ingredient ${enough?'have':'missing'}" title="${ing?.desc||id}">
      ${ing?.emoji||'?'} ${ing?.name||id} ${have}/${qty}
    </span>`;
  }).join('');

  const baseChance   = recipe.successChance || 0.7;
  const furnaceBonus = Math.max(0, ((G.alchemy?.furnaceLevel||0)-1)) * 0.05;
  const danBonusMod  = (danBonus-1) * 0.15;
  const finalChance  = Math.min(0.99, baseChance + furnaceBonus + danBonusMod);

  const canCraft = (recipe.ingredients||[]).every(({id,qty}) =>
    (G.alchemy?.ingredients?.[id]||0) >= qty
  ) && (G.stone||0) >= (recipe.stoneCost||0);

  const FAIL_TEXT = {
    nothing:'Mất hết nguyên liệu', lose_half:'Mất nửa nguyên liệu',
    lose_all:'Mất toàn bộ', explosion:'💥 Nổ lò!'
  };

  return `
    <div class="recipe-card ${canCraft?'can-craft':'no-craft'} ${recipe.isDungeonRecipe?'dungeon-recipe':''}" style="border-color:${color}44">
      <div class="recipe-header">
        <span class="recipe-tier" style="color:${color}">Tier ${recipe.tier}</span>
        ${recipe.isDungeonRecipe ? '<span class="recipe-dungeon-badge">🏰 Địa Phủ</span>' : ''}
        <h3>${pill?.emoji||'⚗'} ${recipe.name}</h3>
      </div>
      ${pill?.desc ? `<p class="recipe-effect">${pill.desc}</p>` : ''}
      <div class="recipe-ingredients">${ings}</div>
      <div class="recipe-meta">
        <span>💎 ${recipe.stoneCost||0}</span>
        <span class="success-chance" style="color:${finalChance>0.7?'#56c46a':'#f0d47a'}">
          ✓ ${Math.floor(finalChance*100)}%
        </span>
        <span style="color:#e05c4a;font-size:10px">${FAIL_TEXT[recipe.failEffect]||''}</span>
      </div>
      <button class="btn-craft btn-primary" data-recipe-id="${recipe.id}" ${canCraft?'':'disabled'}>
        ${canCraft ? '⚗ Luyện Đan' : '❌ Thiếu nguyên liệu'}
      </button>
    </div>`;
}

// ---- LUYỆN KHÍ SƯ (đổi tên từ Rèn Bảo) ----
function _renderForge(G) {
  const craftsCount = G.alchemy?.craftsCount || 0;
  const rank = getCraftsmanRank(craftsCount);
  const nextRank = getCraftsmanRank(craftsCount+1);

  const progressHtml = `
    <div class="forge-rank-bar">
      <div class="frb-rank" style="color:#c8a84b">⚒ ${rank.name}</div>
      <div class="frb-progress">
        <div class="frb-fill" style="width:${Math.min(100,(craftsCount/Math.max(1,(nextRank?.minCrafts||craftsCount+1)))*100)}%"></div>
      </div>
      <div class="frb-count">${craftsCount} lần rèn</div>
    </div>`;

  const MINERALS_HTML = `
    <div class="minerals-section">
      <div class="section-divider">⛏ Khoáng Vật Đang Có</div>
      <div class="minerals-grid">
        ${MINERALS.map(m => {
          const have = G.alchemy?.ingredients?.[m.id] || 0;
          if (have === 0) return ''; // ẩn khoáng vật chưa có
          const elemC = _elemColor(m.element);
          return `<div class="mineral-item" title="${m.desc}">
            <span style="font-size:18px">${m.emoji}</span>
            <div style="font-size:10px;color:${elemC}">${m.name}</div>
            <div style="font-size:12px;font-weight:500">×${have}</div>
          </div>`;
        }).join('') || '<p class="empty-msg" style="font-size:11px">Chưa có khoáng vật. Thu thập tại chiến trường.</p>'}
      </div>
    </div>`;

  if (craftsCount === 0 && !MINERALS.some(m => (G.alchemy?.ingredients?.[m.id]||0) > 0)) {
    return progressHtml + `
      <div class="empty-state-box">
        <div style="font-size:36px;margin-bottom:8px">⚒</div>
        <h3 style="color:#c8a84b;margin-bottom:6px">Luyện Khí Sư</h3>
        <p style="color:var(--text-dim);font-size:12px;line-height:1.6">
          Thu thập <strong>khoáng vật</strong> từ chiến trường để bắt đầu rèn pháp bảo.<br>
          Kỹ năng rèn cao hơn → vũ khí/giáp phẩm chất tốt hơn.
        </p>
      </div>`;
  }

  const recipesHtml = CRAFTING_RECIPES.map(r => {
    const locked = (G.realmIdx||0) < (r.requireRealm||0);
    const mats = r.materials.map(({id,qty}) => {
      const have = G.alchemy?.ingredients?.[id] || 0;
      const enough = have >= qty;
      const m = [...ALL_INGS, ...MINERALS].find(x=>x.id===id);
      return `<span class="ingredient ${enough?'have':'missing'}">${m?.emoji||'?'} ${m?.name||id} ${have}/${qty}</span>`;
    }).join('');
    const canForge = !locked && r.materials.every(({id,qty}) =>
      (G.alchemy?.ingredients?.[id]||0) >= qty) &&
      (G.stone||0) >= (r.stoneCost||0);
    return `
      <div class="recipe-card ${canForge?'can-craft':'no-craft'} ${locked?'recipe-locked':''}" style="border-color:#c8a84b44">
        <div class="recipe-header">
          <span class="recipe-tier" style="color:#c8a84b">⚒ Rèn</span>
          <h3>${r.name}</h3>
        </div>
        <p class="recipe-effect">${r.desc||''}</p>
        <div class="recipe-ingredients">${mats}</div>
        <div class="recipe-meta">
          <span>💎 ${r.stoneCost||0}</span>
          <span class="success-chance">✓ ${Math.floor((r.successChance||0.7)*100)}%</span>
          ${locked?`<span style="color:#666">🔒 ${REALM_NAMES[r.requireRealm]}</span>`:''}
        </div>
        <button class="btn-forge btn-primary" data-recipe-id="${r.id}" ${canForge?'':'disabled'}>
          ${locked?`🔒 Cần ${REALM_NAMES[r.requireRealm]}`:canForge?'⚒ Rèn':'❌ Thiếu vật liệu'}
        </button>
      </div>`;
  }).join('');

  return progressHtml + MINERALS_HTML + `<div class="recipe-list">${recipesHtml}</div>`;
}

// ---- NGUYÊN LIỆU — hiển thị inline bên dưới Luyện Đan ----
function _renderIngredients(G) {
  const ings = Object.entries(G.alchemy?.ingredients||{}).filter(([,qty])=>qty>0);
  if (!ings.length) return `
    <div class="section-divider" style="margin-top:16px">📦 Nguyên Liệu Đang Có</div>
    <p style="color:var(--text-dim);font-size:11px;text-align:center;padding:12px 0">
      Kho trống — thu thập thảo dược tại Bản Đồ để tích lũy nguyên liệu.
    </p>`;

  const danIngredients     = ings.filter(([id]) => ALL_INGS.find(i=>i.id===id) && !MINERALS.find(m=>m.id===id));
  const mineralIngredients = ings.filter(([id]) => MINERALS.find(m=>m.id===id));

  const _renderGroup = (list, title) => list.length ? `
    <div class="section-divider">${title}</div>
    <div class="ingredients-grid">
      ${list.map(([id,qty]) => {
        const ing = [...ALL_INGS,...MINERALS].find(i=>i.id===id);
        const color = RARITY_COLORS[ing?.rarity]||'#888';
        const elemC = ing?.element ? _elemColor(ing.element) : null;
        return `<div class="ingredient-item" style="border-color:${color}44" title="${ing?.desc||id}">
          <div class="ing-emoji">${ing?.emoji||'?'}</div>
          <div class="ing-name">${ing?.name||id}</div>
          ${elemC?`<div style="font-size:8px;color:${elemC}">${ing.element}</div>`:''}
          <div class="ing-qty">×${qty}</div>
        </div>`;
      }).join('')}
    </div>` : '';

  return `
    <div class="section-divider" style="margin-top:16px">📦 Nguyên Liệu Đang Có</div>
    ${_renderGroup(danIngredients, '🌿 Thảo Dược & Vật Liệu')}
    ${_renderGroup(mineralIngredients, '⛏ Khoáng Vật')}
    <p class="ingredient-total" style="margin-top:6px;font-size:10px;color:var(--text-dim);text-align:right">
      ${ings.length} loại · ${ings.reduce((a,[,q])=>a+q,0)} vật phẩm tổng
    </p>`;
}

// ---- Wire Events ----
function _wireEvents(G, actions, danBonus) {
  document.querySelectorAll('.subtab-btn[data-subtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeSubtab = btn.dataset.subtab;
      const content = document.getElementById('alchemy-content');
      if (content) {
        content.innerHTML = _renderSubtab(_activeSubtab, G, danBonus);
        _wireContentEvents(G, actions, danBonus);
      }
      document.querySelectorAll('.subtab-btn[data-subtab]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('btn-goto-shop-furnace')?.addEventListener('click', () => {
    actions.switchTab?.('shop');
  });

  _wireContentEvents(G, actions, danBonus);
}

function _wireContentEvents(G, actions, danBonus) {
  document.querySelectorAll('.btn-craft:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      actions.craft?.(btn.dataset.recipeId);
      // Refresh nguyên liệu inline sau khi luyện
      if (_activeSubtab === 'craft') {
        const content = document.getElementById('alchemy-content');
        if (content) {
          content.innerHTML = _renderSubtab('craft', G, danBonus);
          _wireContentEvents(G, actions, danBonus);
        }
      }
    });
  });
  document.querySelectorAll('.btn-forge:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => actions.forge?.(btn.dataset.recipeId));
  });
}

function _elemColor(el) {
  const map = {kim:'#f0d47a',moc:'#56c46a',shui:'#3a9fd5',huo:'#e05c1a',tu:'#a07850',
    phong:'#a8e6cf',loi:'#ffd700',bang:'#87ceeb',am:'#9370db',duong:'#ffa500'};
  return map[el] || '#aaa';
}