// ============================================================
// ui/tabs/professions/tran-phap-tab.js
// P9 Redesign: vật liệu mới (Trận Kỳ / Trận Bàn / Trận Nhãn)
//   + section chế tạo vật liệu trận
//   + stock bar hiển thị tồn kho 3 vật liệu
// ============================================================
import { ARRAY_RECIPES, ARRAY_MASTER_RANKS, getArrayMasterRank, getNextArrayMasterRank,
  fmtArrayDuration, getArrayEffects } from '../../../alchemy/tran-phap-data.js';
import { TRAN_MAT_RECIPES } from '../../../alchemy/crafting-data.js';
import { fmtNum } from '../../../utils/helpers.js';
import { INGREDIENTS } from '../../../alchemy/alchemy-data.js';
import { REALM_NAMES } from '../../../core/constants.js';
const ALL_INGS = Object.entries(INGREDIENTS).map(([id,v]) => ({ id,...v }));

// ── Màu sắc và metadata vật liệu trận ──
const MAT_INFO = {
  tran_ky:   { name:'Trận Kỳ',  emoji:'🚩', color:'#56c46a',  desc:'Cơ sở bố trận sơ cấp' },
  tran_ban:  { name:'Trận Bàn', emoji:'🎴', color:'#c8a84b',  desc:'Điều phối trận thức trung cấp' },
  tran_nhan: { name:'Trận Nhãn',emoji:'🔵', color:'#9b70d0',  desc:'Linh hồn đại trận — cực hiếm' },
};

export function renderTranPhap(G, _arrayTier = 0, _arrayCat = 'all') {
  const tp           = G.tranPhap || {};
  const arrayCount   = tp.arrayCount || 0;
  const rank         = getArrayMasterRank(arrayCount);
  const nextRank     = getNextArrayMasterRank(arrayCount);
  const activeArrays = Array.isArray(tp.activeArrays) ? tp.activeArrays : [];
  const ings         = G.alchemy?.ingredients || {};
  const rankPct      = nextRank
    ? Math.min(100, Math.round((arrayCount - rank.minArrays) / (nextRank.minArrays - rank.minArrays) * 100))
    : 100;

  // ── Rank bar ──
  const rankHtml = `
    <div class="forge-rank-bar" style="border-color:rgba(86,196,106,0.25);background:rgba(86,196,106,0.05)">
      <div class="frb-top">
        <span class="frb-rank" style="color:#56c46a">${rank.emoji} ${rank.name}</span>
        <span class="frb-count">${arrayCount} lần bố trận</span>
      </div>
      <div class="frb-progress"><div class="frb-fill" style="width:${rankPct}%;background:linear-gradient(90deg,#56c46a,#4db8a0)"></div></div>
      ${nextRank
        ? `<div class="frb-next">→ ${nextRank.emoji} ${nextRank.name} (còn ${nextRank.minArrays - arrayCount} lần)</div>`
        : '<div class="frb-next" style="color:var(--gold)">✦ Đã đạt cấp tối cao</div>'}
      <div class="frb-desc">${rank.desc}</div>
    </div>`;

  // ── Stock bar — hiển thị kho Trận Kỳ / Trận Bàn / Trận Nhãn ──
  const stockHtml = `
    <div style="
      border:1px solid rgba(155,112,208,0.3);
      background:rgba(155,112,208,0.06);
      border-radius:8px;padding:10px 12px;margin-bottom:10px;
    ">
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px;letter-spacing:0.5px">
        📦 KHO VẬT LIỆU TRẬN
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${Object.entries(MAT_INFO).map(([id, m]) => {
          const have = ings[id] || 0;
          return `
            <div style="
              display:flex;align-items:center;gap:6px;
              background:rgba(0,0,0,0.2);
              border:1px solid ${m.color}44;
              border-radius:6px;padding:5px 10px;flex:1;min-width:90px;
              ${have===0?'opacity:0.55':''}
            ">
              <span style="font-size:16px">${m.emoji}</span>
              <div>
                <div style="font-size:10px;color:${m.color}">${m.name}</div>
                <div style="font-size:14px;font-weight:700;color:${have===0?'#555':m.color}">${have}</div>
              </div>
            </div>`;
        }).join('')}
      </div>
      <div style="font-size:10px;color:var(--text-dim);margin-top:7px">
        💡 Chế tạo ở phần dưới · Mua từ Cửa Hàng · Hoặc từ Cơ Duyên
      </div>
    </div>`;

  // ── Section chế tạo vật liệu trận ──
  const craftMatCards = TRAN_MAT_RECIPES.map(r => {
    const rankLocked  = rank.rank < (r.requireRank || 0);
    const realmLocked = (G.realmIdx || 0) < (r.requireRealm || 0);
    const locked      = rankLocked || realmLocked;
    const matColor    = MAT_INFO[r.resultIngredient]?.color || '#888';
    const matInfo     = MAT_INFO[r.resultIngredient];
    const haveResult  = ings[r.resultIngredient] || 0;

    const matRows = r.materials.map(({id, qty}) => {
      const have   = ings[id] || 0;
      const enough = have >= qty;
      const mi     = MAT_INFO[id];
      if (mi) {
        return `<span class="ingredient ${enough?'have':'missing'}" style="border-color:${mi.color}55">
          ${mi.emoji} ${mi.name} <span class="${enough?'':'ing-short'}">${have}/${qty}</span>
        </span>`;
      }
      const ing = ALL_INGS.find(i => i.id === id);
      return `<span class="ingredient ${enough?'have':'missing'}">${ing?.emoji||'?'} ${ing?.name||id} <span class="${enough?'':'ing-short'}">${have}/${qty}</span></span>`;
    }).join('');

    const canCraft = !locked
      && r.materials.every(({id,qty}) => (ings[id]||0) >= qty)
      && (G.stone||0) >= (r.stoneCost||0);

    const failLabel = { nothing:'⚪ hoàn nguyên liệu', lose_half:'🟡 mất ½', lose_all:'🔴 mất tất cả' }[r.failEffect] || '';

    return `
      <div class="recipe-card nn-recipe-card ${canCraft?'can-craft':'no-craft'} ${locked?'recipe-locked':''}"
           style="border-color:${matColor}44;background:${matColor}08">
        <div class="recipe-header">
          <h3 style="margin:0;font-size:13px">${r.emoji} ${r.name}</h3>
          <div style="text-align:right">
            <span style="font-size:11px;color:${matColor}">→ ${r.resultQty}× ${matInfo?.name||r.resultIngredient}</span>
            <span style="font-size:10px;color:var(--text-dim);display:block">Kho: ${haveResult}</span>
          </div>
        </div>
        <div class="recipe-ingredients">${matRows}</div>
        <div class="nn-recipe-meta">
          <div class="nn-meta-row">
            <span>💎 ${r.stoneCost}</span>
            <span style="font-size:10px;color:${matColor}">✦ ${Math.round(r.successChance*100)}% · ${failLabel}</span>
          </div>
        </div>
        ${locked
          ? `<div style="text-align:center;font-size:11px;color:#666;padding:6px">🔒 ${realmLocked?`Cần ${REALM_NAMES?.[r.requireRealm]||'cao hơn'}`:`Cần ${ARRAY_MASTER_RANKS[r.requireRank]?.name||'rank cao hơn'}`}</div>`
          : `<button class="btn-cook btn-primary tp-craft-mat-btn" data-mat-recipe-id="${r.id}"
                     ${canCraft?'':'disabled'} style="border-color:${matColor};background:${matColor}22">
               ${canCraft ? `🔧 Chế Tạo` : '❌ Thiếu điều kiện'}
             </button>`}
      </div>`;
  }).join('');

  const craftMatHtml = `
    <div style="
      border:1px solid rgba(155,112,208,0.25);
      background:rgba(155,112,208,0.04);
      border-radius:8px;padding:10px 12px;margin-bottom:12px;
    ">
      <div style="font-size:12px;color:#9b70d0;font-weight:600;margin-bottom:8px">
        🔧 CHẾ TẠO VẬT LIỆU TRẬN
      </div>
      <div class="nn-recipes">${craftMatCards}</div>
    </div>`;

  // ── Active arrays display ──
  const EF_LABELS = { rate_pct:'⚡+%', atk_pct:'⚔+%', def_pct:'🛡+%', hp_max_pct:'❤+%', stone_pct:'💎+%', exp_pct:'📚+%', hp_regen:'💚/s', dmg_reduce:'🔰-%' };
  const CAT_COLORS = { passive:'#56c46a', active:'#c8a84b', defense:'#3a9fd5' };
  const CAT_LABELS_MAP = { passive:'⚙ Thường Trực', active:'⚡ Kích Hoạt', defense:'🛡 Phòng Ngự' };

  const activeHtml = activeArrays.length > 0 ? `
    <div class="lt-active-buffs" style="border-color:rgba(86,196,106,0.2);background:rgba(86,196,106,0.06)">
      <div class="lt-buffs-title" style="color:#56c46a">🔯 Trận Pháp Đang Hoạt Động</div>
      <div class="lt-buffs-grid">
        ${activeArrays.map(arr => {
          const cat    = arr.category || 'active';
          const color  = CAT_COLORS[cat] || '#888';
          const timeStr = arr.timer !== undefined ? fmtArrayDuration(Math.ceil(arr.timer)) : '∞';
          const costStr = arr.stoneCostPerMin ? `${arr.stoneCostPerMin}💎/phút` : '';
          const effStr  = (arr.effects||[]).map(e => `${EF_LABELS[e.type]||e.type}${e.value}`).join(' ');
          return `
            <div class="tp-active-card" style="border-color:${color}44">
              <div class="tp-ac-top">
                <span style="color:${color}">${arr.emoji} ${arr.name}</span>
                <span class="lt-buff-timer">${timeStr} ${costStr}</span>
              </div>
              <div style="font-size:10px;color:${color};margin:3px 0">${effStr}</div>
              ${cat==='passive' ? `<button class="btn-sm tp-cancel-array" data-array-id="${arr.id}" style="color:#e05c4a;font-size:10px">✕ Huỷ</button>` : ''}
            </div>`;
        }).join('')}
      </div>
    </div>` : '';

  // ── Filter tabs ──
  const TIER_COLORS_MAP = { 0:'#888', 1:'#aaa', 2:'#56c46a', 3:'#3a9fd5', 4:'#c8a84b', 5:'#e05c4a' };
  const TIER_LABELS_MAP = { 0:'Tất cả', 1:'Sơ Cấp', 2:'Trung Cấp', 3:'Cao Cấp', 4:'Thượng Cấp', 5:'Tiên Cấp' };

  const tierTabsHtml = Object.entries(TIER_LABELS_MAP).map(([t, label]) => {
    const tNum = parseInt(t);
    const rankNeeded = { 1:0, 2:1, 3:2, 4:3, 5:4 }[tNum] || 0;
    const locked = tNum > 0 && rank.rank < rankNeeded;
    return `<button class="forge-tier-btn ${_arrayTier===tNum?'forge-tier-active':''} ${locked?'forge-tier-locked':''}"
      data-array-tier="${t}" style="--tier-color:${TIER_COLORS_MAP[tNum]}" ${locked?'disabled':''}>
      ${label}${locked?' 🔒':''}
    </button>`;
  }).join('');

  const catTabsHtml = Object.entries({ all:'🔯 Tất cả', passive:'⚙ Thường Trực', active:'⚡ Kích Hoạt', defense:'🛡 Phòng Ngự' })
    .map(([cat, label]) =>
      `<button class="lt-cat-btn ${_arrayCat===cat?'lt-cat-active':''}" data-array-cat="${cat}" style="--cat-color:#56c46a">${label}</button>`
    ).join('');

  // ── Recipe cards ──
  let filtered = ARRAY_RECIPES;
  if (_arrayTier > 0) filtered = filtered.filter(r => (r.tier||1) === _arrayTier);
  if (_arrayCat !== 'all') filtered = filtered.filter(r => r.category === _arrayCat);

  const recipesHtml = filtered.map(r => {
    const realmLocked = (G.realmIdx||0) < (r.requireRealm||0);
    const rankLocked  = rank.rank < (r.requireRank||0);
    const locked      = realmLocked || rankLocked;
    const tierColor   = TIER_COLORS_MAP[r.tier||1] || '#888';
    const catColor    = CAT_COLORS[r.category] || '#888';
    const isActive    = activeArrays.some(a => a.id === r.id);

    // Hiển thị vật liệu trận với màu riêng biệt
    const mats = r.materials.map(({id, qty}) => {
      const have   = ings[id] || 0;
      const enough = have >= qty;
      const mi     = MAT_INFO[id];
      if (mi) {
        return `<span class="ingredient ${enough?'have':'missing'}" style="border-color:${mi.color}55">
          ${mi.emoji} ${mi.name}
          <span class="${enough?'':'ing-short'}" style="color:${enough?mi.color:'#e05c4a'}">${have}/${qty}</span>
        </span>`;
      }
      const ing = ALL_INGS.find(i => i.id === id);
      return `<span class="ingredient ${enough?'have':'missing'}">${ing?.emoji||'?'} ${ing?.name||id} <span class="${enough?'':'ing-short'}">${have}/${qty}</span></span>`;
    }).join('');

    const effects   = getArrayEffects(r);
    const rankMult  = 1 + (rank.bonus||0) / 100;
    const effHtml   = effects.map(ef => {
      const boostedVal = Math.round(ef.value * rankMult);
      const bonus = boostedVal > ef.value ? ` <span style="color:#56c46a;font-size:9px">(+${Math.round((rankMult-1)*100)}%)</span>` : '';
      if (ef.type==='rate_pct')  return `<span class="lt-buff-tag" style="color:${tierColor}">⚡+${boostedVal}% tốc tu${bonus}</span>`;
      if (ef.type==='atk_pct')   return `<span class="lt-buff-tag" style="color:${tierColor}">⚔+${boostedVal}% ATK${bonus}</span>`;
      if (ef.type==='def_pct')   return `<span class="lt-buff-tag" style="color:${tierColor}">🛡+${boostedVal}% DEF${bonus}</span>`;
      if (ef.type==='dmg_reduce')return `<span class="lt-buff-tag" style="color:${tierColor}">🔰-${boostedVal}% sát thương${bonus}</span>`;
      if (ef.type==='stone_pct') return `<span class="lt-buff-tag" style="color:${tierColor}">💎+${boostedVal}%${bonus}</span>`;
      if (ef.type==='exp_pct')   return `<span class="lt-buff-tag" style="color:${tierColor}">📚+${boostedVal}%${bonus}</span>`;
      if (ef.type==='hp_max_pct')return `<span class="lt-buff-tag" style="color:${tierColor}">❤+${boostedVal}% HP${bonus}</span>`;
      if (ef.type==='hp_regen')  return `<span class="lt-buff-tag" style="color:${tierColor}">💚+${boostedVal}/s${bonus}</span>`;
      return `<span class="lt-buff-tag">${ef.type}</span>`;
    }).join('');

    const costHtml = r.category === 'passive'
      ? `<span>💎 ${r.stoneCostOnce} kích hoạt + ${r.stoneCostPerMin}/phút</span>`
      : `<span>💎 ${r.stoneCostOnce} (${r.category==='active'?fmtArrayDuration(r.duration):'phòng thủ '+fmtArrayDuration(r.duration)})</span>`;

    const hasEnoughMats  = r.materials.every(({id,qty}) => (ings[id]||0) >= qty);
    const hasEnoughStone = (G.stone||0) >= (r.stoneCostOnce||0);
    const canActivate    = !locked && !isActive && hasEnoughMats && hasEnoughStone;

    // Hint chỉ về section chế tạo khi thiếu vật liệu trận
    let matHintHtml = '';
    if (!locked && !isActive && !hasEnoughMats) {
      const needsCraft = r.materials.some(({id}) => MAT_INFO[id]);
      if (needsCraft) {
        matHintHtml = `<div style="font-size:10px;color:#9b70d0;margin-top:3px;padding:3px 6px;background:rgba(155,112,208,0.08);border-radius:4px">
          🔧 Cần chế tạo vật liệu trận — xem phần trên
        </div>`;
      }
    }

    return `
      <div class="recipe-card nn-recipe-card ${canActivate?'can-craft':'no-craft'} ${locked?'recipe-locked':''} ${isActive?'tp-active-recipe':''}"
           style="border-color:${tierColor}44">
        <div class="recipe-header">
          <span class="recipe-tier" style="color:${catColor}">${CAT_LABELS_MAP[r.category]||''}</span>
          <h3 style="margin:0">${r.emoji} ${r.name}</h3>
          ${isActive ? '<span style="color:#56c46a;font-size:10px">✦ Đang hoạt động</span>' : ''}
        </div>
        <p class="recipe-effect" style="font-size:11px;color:var(--text-dim);margin:3px 0">${r.desc}</p>
        <div class="recipe-ingredients">${mats}</div>
        ${matHintHtml}
        <div class="lt-buff-row">${effHtml}</div>
        <div class="nn-recipe-meta"><div class="nn-meta-row">${costHtml}</div></div>
        ${locked
          ? `<div style="text-align:center;font-size:11px;color:#666;padding:6px">🔒 ${realmLocked?`Cần ${REALM_NAMES?.[r.requireRealm]||'cao hơn'}`:`Cần rank ${r.requireRank}`}</div>`
          : `<button class="btn-cook btn-primary tp-activate-btn" data-recipe-id="${r.id}"
                     ${canActivate?'':'disabled'} style="border-color:${catColor};background:${catColor}22">
               ${isActive?'✦ Đang Hoạt Động':canActivate?`🔯 Bố Trận`:'❌ Thiếu điều kiện'}
             </button>`}
      </div>`;
  }).join('');

  return rankHtml
    + stockHtml
    + craftMatHtml
    + activeHtml
    + `<div class="forge-tier-tabs">${tierTabsHtml}</div>`
    + `<div class="lt-cat-tabs">${catTabsHtml}</div>`
    + `<div class="nn-recipes">${recipesHtml || '<div class="empty-state-box"><p style="color:var(--text-dim)">Không có trận pháp phù hợp.</p></div>'}</div>`;
}
