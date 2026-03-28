// ============================================================
// ui/tabs/professions/luyen-khi-tab.js
// ============================================================
import { CRAFTING_RECIPES, MINERALS, CRAFTABLE_EQUIPMENT, FORGE_DURABILITY,
  FORGE_SUCCESS_BONUS, getCraftsmanRank, getNextCraftsmanRank } from '../../../alchemy/crafting-data.js';
import { getSpiritCraftBonus } from '../../../core/spirit-root.js';

export function renderLuyenKhi(G) {
  const craftsCount = G.alchemy?.craftsCount || 0;
  const rank        = getCraftsmanRank(craftsCount);
  const nextRank    = getNextCraftsmanRank(craftsCount);
  const rankPct     = nextRank
    ? Math.round((craftsCount - rank.minCrafts) / (nextRank.minCrafts - rank.minCrafts) * 100)
    : 100;

  const forgeLv     = G.alchemy?.forge?.level || 0;
  const forgeDur    = G.alchemy?.forge?.durability || 0;
  const forgeDurMax = forgeLv > 0 ? (FORGE_DURABILITY[forgeLv]?.max || 8) : 0;
  const forgeDurPct = forgeDurMax > 0 ? Math.round((forgeDur / forgeDurMax) * 100) : 0;
  const forgeColor  = forgeDurPct > 60 ? '#56c46a' : forgeDurPct > 25 ? '#f0d47a' : '#e05c4a';
  const isForgeBroken = forgeLv > 0 && forgeDur <= 0;
  const repairCost  = forgeLv > 0 ? (FORGE_DURABILITY[forgeLv]?.repairCost || 0) : 0;

  // ---- Rank bar ----
  const rankHtml = `
    <div class="forge-rank-bar">
      <div class="frb-header">
        <span class="frb-rank" style="color:#c8a84b">${rank.emoji} ${rank.name}</span>
        <span class="frb-count">${craftsCount} lần rèn</span>
      </div>
      <div class="frb-progress"><div class="frb-fill" style="width:${rankPct}%"></div></div>
      ${nextRank
        ? `<div class="frb-next">→ ${nextRank.emoji} ${nextRank.name} (còn ${nextRank.minCrafts - craftsCount} lần)</div>`
        : `<div class="frb-next" style="color:var(--gold)">✦ Đã đạt cấp tối cao</div>`}
      <div class="frb-desc">${rank.desc}</div>
    </div>`;

  // ---- Bễ Rèn status ----
  let forgeHtml;
  if (forgeLv === 0) {
    forgeHtml = `<div class="nn-info-row nn-warn">
      ⚒ Chưa có Bễ Rèn —
      <button class="btn-sm btn-secondary nn-goto-shop" style="margin-left:6px">Mua tại Cửa Hàng →</button>
    </div>`;
  } else if (isForgeBroken) {
    forgeHtml = `<div class="nn-info-row" style="border-color:#e05c4a44;background:#e05c4a0a">
      💥 Bễ Rèn Cấp ${forgeLv} — <strong style="color:#e05c4a">BỊ HỎNG</strong>
      <button class="btn-sm btn-danger nn-repair-forge" data-cost="${repairCost}" style="margin-left:8px">
        🔧 Sửa (${repairCost}💎)
      </button>
    </div>`;
  } else {
    forgeHtml = `<div class="nn-info-row">
      ⚒ Bễ Rèn Cấp <strong>${forgeLv}</strong>
      <div class="nn-durability-bar" style="margin:0 8px">
        <div class="nn-dur-fill" style="width:${forgeDurPct}%;background:${forgeColor}"></div>
      </div>
      <span style="font-size:10px;color:${forgeColor}">${Math.floor(forgeDur)}/${forgeDurMax}</span>
      ${forgeLv < 5
        ? `<button class="btn-sm btn-secondary nn-goto-shop" style="margin-left:6px;font-size:10px">Nâng →</button>`
        : '<span style="color:var(--jade);margin-left:6px;font-size:10px">MAX</span>'}
      <button class="btn-sm nn-repair-forge" data-cost="${repairCost}"
              style="margin-left:6px;font-size:10px;opacity:0.7">🔧 Sửa</button>
    </div>`;
  }

  // ---- Nếu chưa có Bễ Rèn ----
  if (forgeLv === 0) {
    return rankHtml + forgeHtml + `
      <div class="empty-state-box" style="margin-top:12px">
        <div style="font-size:36px;margin-bottom:10px">⚒</div>
        <h3 style="color:#c8a84b;margin-bottom:8px">Cần Bễ Rèn</h3>
        <p style="color:var(--text-dim);font-size:12px;line-height:1.8">
          Mua <strong>Bễ Rèn Đất</strong> tại <strong>Cửa Hàng</strong> để bắt đầu rèn pháp bảo.<br>
          Thu thập <strong>khoáng vật</strong> từ chiến trường để có nguyên liệu.
        </p>
      </div>`;
  }

  // ---- Tier filter ----
  const activeTier = G.alchemy?._forgeTier || 0;
  const TIER_LABELS = { 0:'Tất cả', 1:'Phàm', 2:'Linh', 3:'Cao', 4:'Thượng', 5:'Tiên' };
  const TIER_COLORS = { 0:'#888', 1:'#888', 2:'#56c46a', 3:'#3a9fd5', 4:'#9c27b0', 5:'#f0d47a' };
  const TIER_NAMES  = { 1:'⚒ Phàm Phẩm', 2:'⚒ Linh Phẩm', 3:'⚒ Cao Phẩm', 4:'⚒ Thượng Phẩm', 5:'⚒ Tiên Phẩm' };

  const tierFilterHtml = `
    <div class="nn-tier-filter">
      <span style="font-size:11px;color:var(--text-dim)">Bộ lọc:</span>
      ${[0,1,2,3,4,5].map(t =>
        `<button class="nn-tier-btn ${activeTier===t?'active':''}" data-tier="${t}"
                 style="--tier-color:${TIER_COLORS[t]}">${TIER_LABELS[t]}</button>`
      ).join('')}
    </div>`;

  // ---- Render recipe cards nhóm theo tier ----
  const visibleRecipes = CRAFTING_RECIPES.filter(r => activeTier === 0 || r.tier === activeTier);
  const byTier = {};
  visibleRecipes.forEach(r => { if (!byTier[r.tier]) byTier[r.tier]=[]; byTier[r.tier].push(r); });

  const recipesHtml = Object.entries(byTier).map(([tier, rList]) => {
    const color = TIER_COLORS[tier] || '#888';
    return `
      <div class="recipe-tier-group">
        <div class="rtg-title" style="color:${color}">${TIER_NAMES[tier]||'Tier '+tier}</div>
        ${rList.map(r => _renderForgeCard(r, G, rank, forgeLv, forgeDur)).join('')}
      </div>`;
  }).join('');

  const emptyHtml = Object.keys(byTier).length === 0
    ? `<div class="empty-state-box"><p style="color:var(--text-dim);font-size:12px">Không có công thức ở tier này.</p></div>`
    : '';

  return rankHtml + forgeHtml + tierFilterHtml +
    `<div class="nn-recipes">${recipesHtml || emptyHtml}</div>`;
}

export function renderForgeCard(r, G, rank, forgeLv, forgeDur) {
  const TIER_COLORS = { 1:'#888', 2:'#56c46a', 3:'#3a9fd5', 4:'#9c27b0', 5:'#f0d47a' };
  const REALM_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];
  const color = TIER_COLORS[r.tier] || '#888';

  const realmLocked = (G.realmIdx||0) < (r.requireRealm||0);
  const rankLocked  = rank.rank < (r.requireRank||0);
  const isLocked    = realmLocked || rankLocked;
  const isBroken    = forgeDur <= 0;

  const mats = r.materials.map(({id,qty}) => {
    const have   = G.alchemy?.ingredients?.[id] || 0;
    const enough = have >= qty;
    const m = [...ALL_INGS, ...MINERALS].find(x => x.id === id);
    return `<span class="ingredient ${enough?'have':'missing'}" title="${m?.desc||id}">
      ${m?.emoji||'?'} ${m?.name||id} ${have}/${qty}
    </span>`;
  }).join('');

  const rankBonus   = (rank.bonus||0) / 100;
  const forgeBonus  = FORGE_SUCCESS_BONUS[forgeLv] || 0;
  const spiritEl    = G.spiritData?.element;
  const spiritBonus = (r.requireSpiritElement && spiritEl === r.requireSpiritElement) ? 0.15 : 0;
  const finalChance = Math.min(0.97, (r.successChance||0.7) + rankBonus + forgeBonus + spiritBonus);
  const explodeDmg  = r.forgeDamage || 0;

  const canForge = !isLocked && !isBroken
    && r.materials.every(({id,qty}) => (G.alchemy?.ingredients?.[id]||0) >= qty)
    && (G.stone||0) >= (r.stoneCost||0);

  const lockMsg = realmLocked
    ? `🔒 Cần ${REALM_NAMES[r.requireRealm]||''}`
    : rankLocked ? `🔒 Cần rank cao hơn`
    : isBroken  ? '💥 Sửa Bễ Rèn trước' : '';

  const spiritBadge = r.requireSpiritElement
    ? `<span class="nn-spirit-badge" style="color:${spiritBonus>0?'#56c46a':'#555'}" title="Linh căn phù hợp">
        ${spiritBonus>0 ? '✦ Linh Căn Phù Hợp' : `⚑ ${r.requireSpiritElement}`}
       </span>` : '';

  const FAIL_LABELS = { nothing:'✓ Không mất NL', lose_half:'⚠ Mất ½ NL', lose_all:'✗ Mất hết NL' };
  const failBadge = `<span class="nn-fail-badge">${FAIL_LABELS[r.failEffect]||''}</span>`;
  const forgeDmgHtml = explodeDmg > 0
    ? `<span style="color:#e05c4a;font-size:10px" title="Thất bại hao Bễ Rèn ${explodeDmg+1}đ">💥 -${explodeDmg+1} Bễ</span>`
    : '';

  return `
    <div class="recipe-card nn-recipe-card ${canForge?'can-craft':'no-craft'} ${isLocked?'recipe-locked':''}"
         style="border-color:${color}44">
      <div class="recipe-header">
        <span class="recipe-tier" style="color:${color}">Tier ${r.tier}</span>
        <h3>${r.name}</h3>
        ${spiritBadge}
      </div>
      <p class="recipe-effect">${r.desc||''}</p>
      <div class="recipe-ingredients">${mats}</div>
      <div class="nn-recipe-meta">
        <div class="nn-meta-row">
          <span>💎 ${r.stoneCost||0}</span>
          <span class="success-chance" style="color:${finalChance>0.65?'#56c46a':finalChance>0.45?'#f0d47a':'#e05c4a'}">
            ✓ ${Math.floor(finalChance*100)}%
          </span>
          ${forgeDmgHtml}
          ${failBadge}
        </div>
      </div>
      <button class="btn-forge btn-primary" data-recipe-id="${r.id}" ${canForge?'':'disabled'}>
        ${isLocked||isBroken ? lockMsg||'💥 Sửa Bễ Rèn trước' : canForge ? '⚒ Rèn' : '❌ Thiếu vật liệu'}
      </button>
    </div>`;
}
// ---- Linh Thực Sư ----
