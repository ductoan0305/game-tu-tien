// ============================================================
// ui/tabs/professions/phu-chu-tab.js
// ============================================================
import { TALISMAN_RECIPES, TALISMAN_ITEMS, TALISMAN_MASTER_RANKS,
  getTalismanRank, getNextTalismanRank } from '../../../alchemy/phu-chu-data.js';
import { getSpiritCraftBonus } from '../../../core/spirit-root.js';
import { fmtNum, fmtDuration } from '../../../utils/helpers.js';
import { INGREDIENTS } from '../../../alchemy/alchemy-data.js';
const ALL_INGS = Object.entries(INGREDIENTS).map(([id,v]) => ({ id,...v }));

export function renderBuaChu(G, _buaTier = 0, _buaCat = 'all') {
  const bc         = G.phuChu || {};
  const drawCount  = bc.drawCount || 0;
  const rank       = getTalismanRank(drawCount);
  const nextRank   = getNextTalismanRank(drawCount);
  const rankPct    = nextRank
    ? Math.min(100, Math.round((drawCount - rank.minDraws) / (nextRank.minDraws - rank.minDraws) * 100))
    : 100;

  // Active bùa buffs
  const activeBuffs = Array.isArray(bc.activeBuffs) ? bc.activeBuffs.filter(b=>b.timer>0) : [];
  const BL = { rate_pct:'⚡ Tốc Tu', atk_pct:'⚔ ATK', def_pct:'🛡 DEF', hp_max_pct:'❤ HP Max', hp_regen:'💚 Hồi HP', stone_pct:'💎 Stone', exp_pct:'📚 EXP', dmg_reduce:'🔰 Giảm Sát' };

  const rankHtml = `
    <div class="forge-rank-bar" style="border-color:rgba(168,85,247,0.25);background:rgba(168,85,247,0.05)">
      <div class="frb-top">
        <span class="frb-rank" style="color:#a855f7">${rank.emoji} ${rank.name}</span>
        <span class="frb-count">${drawCount} bùa vẽ thành công</span>
      </div>
      <div class="frb-progress"><div class="frb-fill" style="width:${rankPct}%;background:linear-gradient(90deg,#a855f7,#7b68ee)"></div></div>
      ${nextRank
        ? `<div class="frb-next">→ ${nextRank.emoji} ${nextRank.name} (còn ${nextRank.minDraws - drawCount} lần)</div>`
        : '<div class="frb-next" style="color:var(--gold)">✦ Đã đạt cấp tối cao</div>'}
      <div class="frb-desc">${rank.desc}</div>
    </div>`;

  const activeHtml = activeBuffs.length > 0 ? `
    <div class="lt-active-buffs" style="border-color:rgba(168,85,247,0.2);background:rgba(168,85,247,0.06)">
      <div class="lt-buffs-title" style="color:#a855f7">📿 Bùa Đang Hiệu Lực</div>
      <div class="lt-buffs-grid">
        ${activeBuffs.map(b => `
          <div class="lt-buff-pill" style="border-color:rgba(168,85,247,0.3);background:rgba(168,85,247,0.1)">
            <span>📿</span>
            <span style="color:#a855f7">${BL[b.type]||b.type} +${b.value}${b.type.includes('pct')||b.type==='rate_pct'?'%':''}</span>
            <span class="lt-buff-timer">${fmtDuration(Math.ceil(b.timer))}</span>
          </div>`).join('')}
      </div>
    </div>` : '';

  // Bùa trong túi
  const inInventory = {};
  (G.inventory||[]).forEach(s => { if(s?.id?.endsWith('_talisman')) inInventory[s.id]=(inInventory[s.id]||0)+s.qty; });
  const invHtml = Object.keys(inInventory).length > 0 ? `
    <div class="lt-active-buffs" style="border-color:rgba(168,85,247,0.15);background:rgba(168,85,247,0.04)">
      <div class="lt-buffs-title" style="color:#a855f7">🎒 Bùa Trong Túi Đồ</div>
      <div class="lt-buffs-grid">
        ${Object.entries(inInventory).map(([id,qty]) => {
          const t = TALISMAN_ITEMS.find(ti=>ti.id===id);
          return `<div class="lt-buff-pill" style="border-color:rgba(168,85,247,0.3)">
            <span>${t?.emoji||'📜'}</span>
            <span style="color:#a855f7">${t?.name||id}</span>
            <span class="lt-buff-timer">×${qty}</span>
          </div>`;
        }).join('')}
      </div>
      <p style="font-size:10px;color:var(--text-dim);margin-top:6px">Dùng bùa từ tab 🎒 Túi Đồ để kích hoạt buff.</p>
    </div>` : '';

  // Filter tier
  const TIER_COLORS_BC = { 0:'#888', 1:'#aaa', 2:'#56c46a', 3:'#3a9fd5', 4:'#c8a84b', 5:'#e05c4a' };
  const TIER_LABELS_BC = { 0:'Tất cả', 1:'Phàm Phù', 2:'Linh Phù', 3:'Cao Phù', 4:'Thượng Phù', 5:'Tiên Phù' };

  const tierTabsHtml = Object.entries(TIER_LABELS_BC).map(([t, label]) => {
    const tNum = parseInt(t);
    const rankNeeded = { 1:0, 2:1, 3:2, 4:3, 5:4 }[tNum] || 0;
    const locked = tNum > 0 && rank.rank < rankNeeded;
    return `<button class="forge-tier-btn ${_buaTier===tNum?'forge-tier-active':''} ${locked?'forge-tier-locked':''}"
      data-bua-tier="${t}" style="--tier-color:${TIER_COLORS_BC[tNum]}" ${locked?'disabled':''}>
      ${label}${locked?' 🔒':''}
    </button>`;
  }).join('');

  // Recipe cards
  const filtered = _buaTier > 0 ? TALISMAN_RECIPES.filter(r=>r.tier===_buaTier) : TALISMAN_RECIPES;
  const REALM_NAMES_BC = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];
  const spiritEl = G.spiritData?.mainElement;
  const spiritBonus = (spiritEl==='moc'||spiritEl==='am') ? 0.10 : 0;

  const recipesHtml = filtered.map(r => {
    const realmLocked = (G.realmIdx||0) < (r.requireRealm||0);
    const rankLocked  = rank.rank < (r.requireRank||0);
    const locked      = realmLocked || rankLocked;
    const tierColor   = TIER_COLORS_BC[r.tier||1] || '#888';
    const resultDef   = TALISMAN_ITEMS.find(t=>t.id===r.resultItem);

    const mats = r.materials.map(({id,qty}) => {
      const have   = G.alchemy?.ingredients?.[id]||0;
      const enough = have >= qty;
      const ing    = ALL_INGS.find(i=>i.id===id);
      return `<span class="ingredient ${enough?'have':'missing'}">${ing?.emoji||'?'} ${ing?.name||id} <span class="${enough?'':'ing-short'}">${have}/${qty}</span></span>`;
    }).join('');

    const buffPreviews = (resultDef?.buffs||[]).map(b => {
      const BC = { rate_pct:'+%⚡', atk_pct:'+%⚔', def_pct:'+%🛡', hp_max_pct:'+%❤', hp_regen:'+HP/s', stone_pct:'+%💎', exp_pct:'+%📚', dmg_reduce:'-%🔰', hp_instant:'+HP' };
      const durStr = b.duration ? ` <span style="color:var(--text-dim);font-size:9px">${fmtDuration(b.duration)}</span>` : '';
      return `<span class="lt-buff-tag" style="color:${tierColor}">+${b.value}${BC[b.type]||b.type}${durStr}</span>`;
    }).join('');

    const rankBonus   = (rank.bonus||0) / 100;
    const finalChance = Math.min(0.97, (r.successChance||0.8) + rankBonus + spiritBonus);
    const chanceColor = finalChance > 0.75 ? '#56c46a' : finalChance > 0.55 ? '#f0d47a' : '#e05c4a';

    const canDraw = !locked
      && r.materials.every(({id,qty}) => (G.alchemy?.ingredients?.[id]||0) >= qty)
      && (G.stone||0) >= (r.stoneCost||0);

    return `
      <div class="recipe-card nn-recipe-card ${canDraw?'can-craft':'no-craft'} ${locked?'recipe-locked':''}"
           style="border-color:${tierColor}44">
        <div class="recipe-header">
          <span class="recipe-tier" style="color:#a855f7">T${r.tier} Bùa</span>
          <h3 style="margin:0">${r.emoji} ${r.name}</h3>
        </div>
        <p class="recipe-effect" style="font-size:11px;color:var(--text-dim);margin:3px 0">${r.desc}</p>
        <div class="recipe-ingredients">${mats}</div>
        <div class="lt-buff-row">${buffPreviews}</div>
        <div class="nn-recipe-meta">
          <div class="nn-meta-row">
            <span>💎 ${r.stoneCost||0}</span>
            <span style="color:${chanceColor}">✓ ${Math.floor(finalChance*100)}%</span>
            ${spiritBonus > 0 ? '<span style="color:#56c46a;font-size:10px">🌿/🌑 Linh Căn +10%</span>' : ''}
          </div>
        </div>
        ${locked
          ? `<div style="text-align:center;font-size:11px;color:#666;padding:6px">🔒 ${realmLocked?`Cần ${REALM_NAMES_BC[r.requireRealm]}`:`Cần rank ${r.requireRank}`}</div>`
          : `<button class="btn-cook btn-primary bc-draw-btn" data-recipe-id="${r.id}"
                     ${canDraw?'':'disabled'} style="border-color:#a855f7;background:rgba(168,85,247,0.15)">
               ${canDraw?`📜 Vẽ Bùa (×${r.qty||1})`:'❌ Thiếu điều kiện'}
             </button>`}
      </div>`;
  }).join('');

  return rankHtml + activeHtml + invHtml + `
    <div class="forge-tier-tabs">${tierTabsHtml}</div>
    <div class="nn-recipes">${recipesHtml || '<div class="empty-state-box"><p style="color:var(--text-dim)">Không có công thức phù hợp.</p></div>'}</div>`;
}

// ---- Khôi Lỗi Sư ----