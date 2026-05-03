// ============================================================
// ui/tabs/professions/luyen-dan-tab.js
// ============================================================
import { RECIPES, PILLS, INGREDIENTS, getDanSuRank, getNextDanSuRank,
  DAN_PHAM, FURNACE_DURABILITY } from '../../../alchemy/alchemy-data.js';
import { getSpiritCraftBonus } from '../../../core/spirit-root.js';

const ALL_INGS    = Object.entries(INGREDIENTS).map(([id,v]) => ({ id,...v }));
const ALL_PILLS   = PILLS;
const ALL_RECIPES = RECIPES;

export function renderLuyenDan(G) {
  const danBonus  = getSpiritCraftBonus(G.spiritData, 'luyen_dan');
  const furnaceLv = G.alchemy?.furnaceLevel || 0;
  const known     = G.alchemy?.knownRecipes || [];
  const success   = G.alchemySuccess || 0;
  const rank      = getDanSuRank(success);
  const nextRank  = getNextDanSuRank(success);
  const durability   = G.alchemy?.furnaceDurability || 0;
  const durMax       = furnaceLv > 0 ? (FURNACE_DURABILITY[furnaceLv]?.max || 10) : 0;
  const durPct       = durMax > 0 ? Math.round((durability / durMax) * 100) : 0;
  const durColor     = durPct > 60 ? '#56c46a' : durPct > 25 ? '#f0d47a' : '#e05c4a';
  const isBroken     = furnaceLv > 0 && durability <= 0;
  const danPhuongTe  = G.alchemy?.danPhuongTe || 0;
  const rankPct      = nextRank ? Math.round((success - rank.minSuccess) / (nextRank.minSuccess - rank.minSuccess) * 100) : 100;

  // Furnace status
  let furnaceHtml;
  if (furnaceLv === 0) {
    furnaceHtml = `<div class="nn-info-row nn-warn">
      🔥 Chưa có lò đan —
      <button class="btn-sm btn-secondary nn-goto-shop" style="margin-left:6px">Mua tại Cửa Hàng →</button>
    </div>`;
  } else if (isBroken) {
    furnaceHtml = `<div class="nn-info-row" style="border-color:#e05c4a44;background:#e05c4a0a">
      💥 Lò Đan Cấp ${furnaceLv} — <strong style="color:#e05c4a">BỊ HỎNG</strong>
      <button class="btn-sm btn-danger nn-repair-furnace" style="margin-left:8px">🔧 Sửa Lò</button>
    </div>`;
  } else {
    furnaceHtml = `<div class="nn-info-row">
      🔥 Lò Đan Cấp <strong>${furnaceLv}</strong>
      <div class="nn-durability-bar" style="margin:0 8px">
        <div class="nn-dur-fill" style="width:${durPct}%;background:${durColor}"></div>
      </div>
      <span style="font-size:10px;color:${durColor}">${Math.floor(durability)}/${durMax}</span>
      ${furnaceLv < 5
        ? `<button class="btn-sm btn-secondary nn-goto-shop" style="margin-left:6px;font-size:10px">Nâng →</button>`
        : '<span style="color:var(--jade);margin-left:6px;font-size:10px">MAX</span>'}
      ${danBonus > 1 ? `<span style="color:#56c46a;margin-left:8px;font-size:10px">⚗×${danBonus.toFixed(1)}</span>` : ''}
    </div>`;
  }

  // Rank Đan Sư
  const rankHtml = `<div class="nn-rank-bar">
    <div class="nn-rank-info">
      <span class="nn-rank-name" style="color:#e8a020">${rank.emoji || '⚗'} ${rank.name}</span>
      <span class="nn-rank-count">${success} lần thành công</span>
      ${danPhuongTe > 0 ? `<span class="nn-danphuong">📜 ${danPhuongTe} Đan Phương Tệ</span>` : ''}
    </div>
    ${nextRank ? `
    <div class="nn-rank-progress">
      <div class="nn-rank-fill" style="width:${rankPct}%"></div>
    </div>
    <div class="nn-rank-next">→ ${nextRank.name} (còn ${nextRank.minSuccess - success} lần)</div>
    ` : '<div class="nn-rank-next" style="color:var(--gold)">✦ Đã đạt cấp tối cao</div>'}
    <div class="nn-rank-desc">${rank.desc}</div>
  </div>`;

  // Nếu chưa có lò thì hiện hướng dẫn mua lò trước
  if (furnaceLv === 0) {
    return furnaceHtml + `
      <div class="empty-state-box" style="margin-top:12px">
        <div style="font-size:36px;margin-bottom:10px">🔥</div>
        <h3 style="color:var(--gold);margin-bottom:8px">Cần Lò Đan</h3>
        <p style="color:var(--text-dim);font-size:12px;line-height:1.8">
          Mua Lò Đan Thô tại <strong>Cửa Hàng</strong> để bắt đầu luyện đan.<br>
          Khi có lò, 3 công thức cơ bản sẽ tự động mở khóa.
        </p>
      </div>`;
  }

  const knownValid = known.filter(id => ALL_RECIPES.find(r => r.id === id));
  const emptyState = knownValid.length === 0 ? `
    <div class="empty-state-box" style="margin-top:8px">
      <div style="font-size:32px;margin-bottom:8px">📜</div>
      <h3 style="color:var(--gold);margin-bottom:6px">Chưa có công thức</h3>
      <p style="color:var(--text-dim);font-size:11px;line-height:1.8">
        Học công thức từ:<br>
        • <strong>NPC Đan Sư</strong> trong bản đồ (dùng Đan Phương Tệ 📜)<br>
        • <strong>Loot ngẫu nhiên</strong> từ yêu thú<br>
        • <strong>Nhiệm vụ</strong> tông môn<br>
        • <strong>Cơ Duyên</strong> khi thám hiểm
      </p>
    </div>` : '';

  const recipes = ALL_RECIPES.filter(r => knownValid.includes(r.id));
  const byTier  = {};
  recipes.forEach(r => { const t = r.tier||1; if (!byTier[t]) byTier[t]=[]; byTier[t].push(r); });
  const TIER_NAMES  = { 1:'Phàm Phẩm Đan', 2:'Linh Phẩm Đan', 3:'Tiên Phẩm Đan', 4:'Thần Phẩm Đan' };
  const TIER_COLORS = { 1:'#888', 2:'#56c46a', 3:'#c8a84b', 4:'#7b68ee' };

  const recipesHtml = Object.entries(byTier).map(([tier, rList]) => `
    <div class="recipe-tier-group">
      <div class="rtg-title" style="color:${TIER_COLORS[tier]||'#888'}">${TIER_NAMES[tier]||'Tier '+tier}</div>
      ${rList.map(r => _renderRecipeCard(r, G, danBonus)).join('')}
    </div>`).join('');

  // Craft quantity options (theo rank)
  const canMulti = rank.rank >= 3;
  const multiHtml = canMulti ? `
    <div class="nn-craft-qty">
      <span style="font-size:11px;color:var(--text-dim)">Số lần luyện:</span>
      ${[1, rank.rank >= 5 ? 5 : 2].map(q =>
        `<button class="nn-qty-btn ${(G.alchemy?._craftQty||1) === q ? 'active' : ''}" data-qty="${q}">×${q}</button>`
      ).join('')}
    </div>` : '';

  return furnaceHtml + rankHtml + multiHtml + (emptyState || `<div class="nn-recipes">${recipesHtml}</div>`);
}

export function renderRecipeCard(recipe, G, danBonus) {
  const pill     = ALL_PILLS.find(p => p.id === recipe.pillId || p.id === recipe.id);
  const color    = { 1:'#888', 2:'#56c46a', 3:'#c8a84b', 4:'#7b68ee' }[recipe.tier] || '#888';
  const rank     = getDanSuRank(G.alchemySuccess || 0);
  const craftQty = G.alchemy?._craftQty || 1;

  const ings = (recipe.ingredients||[]).map(({id,qty}) => {
    const need   = qty * craftQty;
    const have   = G.alchemy?.ingredients?.[id] || 0;
    const enough = have >= need;
    const ing    = ALL_INGS.find(i=>i.id===id);
    return `<span class="ingredient ${enough?'have':'missing'}" title="${ing?.desc||id}">
      ${ing?.emoji||'?'} ${ing?.name||id} ${have}/${need}
    </span>`;
  }).join('');

  // Tính success chance
  const rankBonus    = (rank.bonus||0) / 100;
  const furnaceBonus = Math.max(0, ((G.alchemy?.furnaceLevel||0)-1)) * 0.05;
  const danMod       = (danBonus-1) * 0.15;
  const streakBonus  = Math.min((G.alchemy?.successStreak||0) * 0.02, 0.10);
  const finalChance  = Math.min(0.95, (recipe.successChance||0.7) + rankBonus + furnaceBonus + danMod + streakBonus);
  const explodeChance = Math.max(0, 0.15 - (G.alchemy?.furnaceLevel||0) * 0.03) * (1 - finalChance);

  const canCraft = (recipe.ingredients||[]).every(({id,qty}) =>
    (G.alchemy?.ingredients?.[id]||0) >= qty * craftQty)
    && (G.stone||0) >= (recipe.stoneCost||0) * craftQty
    && (G.alchemy?.furnaceDurability||0) > 0
    && (G.alchemy?.furnaceLevel||0) > 0;

  // Đan phẩm preview
  const phamPreview = DAN_PHAM.map(p => `
    <span class="nn-pham-preview" style="color:${p.color}" title="${p.name}: ×${p.mult} hiệu quả">
      ${p.emoji}
    </span>`).join('');

  const failMsg = {
    nothing: 'Thất bại: mất NL',
    lose_half: 'Thất bại: mất ½ NL',
    lose_all: 'Thất bại: mất hết',
    explosion: '💥 Nguy cơ nổ lò!',
  }[recipe.failEffect] || '';

  return `
    <div class="recipe-card nn-recipe-card ${canCraft?'can-craft':'no-craft'} ${recipe.isDungeonRecipe?'dungeon-recipe':''}"
         style="border-color:${color}44">
      <div class="recipe-header">
        <span class="recipe-tier" style="color:${color}">Tier ${recipe.tier}</span>
        ${recipe.isDungeonRecipe ? '<span class="recipe-dungeon-badge">🏰 Địa Phủ</span>' : ''}
        <h3>${pill?.emoji||'⚗'} ${recipe.name}</h3>
      </div>
      ${pill?.desc ? `<p class="recipe-effect">${pill.desc}</p>` : ''}
      <div class="recipe-ingredients">${ings}</div>
      <div class="nn-recipe-meta">
        <div class="nn-meta-row">
          <span>💎 ${(recipe.stoneCost||0) * craftQty}</span>
          <span class="success-chance" style="color:${finalChance>0.7?'#56c46a':finalChance>0.5?'#f0d47a':'#e05c4a'}">
            ✓ ${Math.floor(finalChance*100)}%
          </span>
          ${explodeChance > 0.01 ? `<span style="color:#e05c4a;font-size:10px">💥 ${Math.floor(explodeChance*100)}%</span>` : ''}
          <span style="color:var(--text-dim);font-size:10px">${failMsg}</span>
        </div>
        <div class="nn-meta-row">${phamPreview}</div>
      </div>
      <button class="btn-craft btn-primary" data-recipe-id="${recipe.id}"
              data-qty="${craftQty}" ${canCraft?'':'disabled'}>
        ${canCraft ? `⚗ Luyện${craftQty>1?' ×'+craftQty:''}` : '❌ Thiếu nguyên liệu'}
      </button>
    </div>`;
}

// ---- Luyện Khí ----
