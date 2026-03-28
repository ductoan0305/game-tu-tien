// ============================================================
// ui/tabs/professions/khoi-loi-tab.js
// ============================================================
import { PUPPET_RECIPES, PUPPET_ITEMS, PUPPET_MASTER_RANKS,
  getPuppetRank, getNextPuppetRank } from '../../../alchemy/khoi-loi-data.js';
import { getSpiritCraftBonus } from '../../../core/spirit-root.js';
import { fmtNum } from '../../../utils/helpers.js';
import { INGREDIENTS } from '../../../alchemy/alchemy-data.js';
const ALL_INGS = Object.entries(INGREDIENTS).map(([id,v]) => ({ id,...v }));

export function renderKhoiLoi(G, _kloiTier = 0) {
  const kl         = G.khoiLoi || {};
  const craftCount = kl.craftCount || 0;
  const rank       = getPuppetRank(craftCount);
  const nextRank   = getNextPuppetRank(craftCount);
  const rankPct    = nextRank
    ? Math.min(100, Math.round((craftCount - rank.minCrafted) / (nextRank.minCrafted - rank.minCrafted) * 100))
    : 100;

  const COLOR = '#e05c4a';

  // Khối lỗi đang hoạt động
  const active = kl.activePuppet;
  const activeDef = active ? PUPPET_ITEMS.find(p => p.id === active.id) : null;
  const bonusPct = rank.bonusPct || 0;
  const applyBonus = v => Math.round(v * (1 + bonusPct / 100));

  const activeHtml = activeDef ? `
    <div class="lt-active-buffs" style="border-color:${COLOR}33;background:${COLOR}0a">
      <div class="lt-buffs-title" style="color:${COLOR}">🤖 Khôi Lỗi Đang Hoạt Động</div>
      <div style="display:flex;align-items:center;gap:12px;padding:8px 0">
        <span style="font-size:36px">${activeDef.emoji}</span>
        <div>
          <div style="font-weight:700;color:${COLOR};font-size:14px">${activeDef.name}</div>
          <div style="font-size:11px;color:var(--text-dim);margin:2px 0">
            ⚔ ATK: <b style="color:${COLOR}">${applyBonus(activeDef.atk)}</b> &nbsp;
            🛡 DEF: <b style="color:${COLOR}">${applyBonus(activeDef.def)}</b> &nbsp;
            ❤ HP: <b style="color:${COLOR}">${applyBonus(activeDef.hp)}</b>
            ${bonusPct > 0 ? `<span style="color:#56c46a;font-size:10px"> (+${bonusPct}%)</span>` : ''}
          </div>
          ${activeDef.special ? `<div style="font-size:10px;color:#f0d47a">✦ ${activeDef.special.desc}</div>` : ''}
        </div>
        <button class="btn-primary kl-dismiss-btn"
          style="margin-left:auto;background:rgba(224,92,74,0.15);border-color:${COLOR};font-size:11px;padding:4px 10px">
          ✕ Thu Hồi
        </button>
      </div>
    </div>` : `
    <div class="lt-active-buffs" style="border-color:${COLOR}22;background:${COLOR}06;text-align:center;padding:12px">
      <div style="font-size:28px;margin-bottom:4px">🤖</div>
      <div style="color:var(--text-dim);font-size:12px">Chưa có khối lỗi nào được triệu hồi.<br>Chế tạo và bấm <b>Triệu Hồi</b> để kích hoạt.</div>
    </div>`;

  // Khối lỗi trong túi đồ
  const inInventory = {};
  (G.inventory||[]).forEach(s => {
    if (s?.id && PUPPET_ITEMS.find(p => p.id === s.id)) {
      inInventory[s.id] = (inInventory[s.id] || 0) + (s.qty || 1);
    }
  });
  const invHtml = Object.keys(inInventory).length > 0 ? `
    <div class="lt-active-buffs" style="border-color:${COLOR}22;background:${COLOR}06">
      <div class="lt-buffs-title" style="color:${COLOR}">🎒 Khôi Lỗi Trong Túi Đồ</div>
      <div class="lt-buffs-grid">
        ${Object.entries(inInventory).map(([id, qty]) => {
          const p = PUPPET_ITEMS.find(pi => pi.id === id);
          const isActive = active?.id === id;
          return `<div class="lt-buff-pill" style="border-color:${COLOR}44;background:${isActive ? COLOR+'22' : ''}">
            <span>${p?.emoji || '🤖'}</span>
            <span style="color:${COLOR}">${p?.name || id}</span>
            <span class="lt-buff-timer">×${qty}</span>
            ${!isActive ? `<button class="kl-summon-btn btn-primary"
              data-puppet-id="${id}"
              style="margin-left:4px;font-size:10px;padding:2px 7px;background:rgba(224,92,74,0.2);border-color:${COLOR}">
              ▶ Triệu
            </button>` : '<span style="font-size:10px;color:#56c46a">✓ Đang dùng</span>'}
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  // Rank bar
  const rankHtml = `
    <div class="forge-rank-bar" style="border-color:${COLOR}33;background:${COLOR}08">
      <div class="frb-top">
        <span class="frb-rank" style="color:${COLOR}">${rank.emoji} ${rank.name}</span>
        <span class="frb-count">${craftCount} khối lỗi đã chế</span>
      </div>
      <div class="frb-progress"><div class="frb-fill" style="width:${rankPct}%;background:linear-gradient(90deg,${COLOR},#f0a070)"></div></div>
      ${nextRank
        ? `<div class="frb-next">→ ${nextRank.emoji} ${nextRank.name} (còn ${nextRank.minCrafted - craftCount} lần)</div>`
        : `<div class="frb-next" style="color:var(--gold)">✦ Đã đạt cấp tối cao</div>`}
      <div class="frb-desc">${rank.desc}</div>
    </div>`;

  // Tier filter
  const TIER_COLORS_KL = { 0:'#888', 1:'#aaa', 2:'#56c46a', 3:'#3a9fd5', 4:'#c8a84b', 5:'#e05c4a' };
  const TIER_LABELS_KL = { 0:'Tất cả', 1:'Đồng', 2:'Bạc', 3:'Vàng', 4:'Tinh Thần', 5:'Thần Phẩm' };
  const REALM_NAMES_KL = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];

  const tierTabsHtml = Object.entries(TIER_LABELS_KL).map(([t, label]) => {
    const tNum = parseInt(t);
    const rankNeeded = { 1:0, 2:1, 3:2, 4:3, 5:4 }[tNum] || 0;
    const locked = tNum > 0 && rank.rank < rankNeeded;
    return `<button class="forge-tier-btn ${_kloiTier===tNum ? 'forge-tier-active' : ''} ${locked ? 'forge-tier-locked' : ''}"
      data-kloi-tier="${t}" style="--tier-color:${TIER_COLORS_KL[tNum]}" ${locked ? 'disabled' : ''}>
      ${label}${locked ? ' 🔒' : ''}
    </button>`;
  }).join('');

  // Recipe cards
  const filtered = _kloiTier > 0 ? PUPPET_RECIPES.filter(r => r.tier === _kloiTier) : PUPPET_RECIPES;
  const spiritEl = G.spiritData?.mainElement;
  const spiritBonus = (spiritEl === 'kim' || spiritEl === 'tho') ? 0.10 : 0;

  const recipesHtml = filtered.map(r => {
    const realmLocked = (G.realmIdx || 0) < (r.requireRealm || 0);
    const rankLocked  = rank.rank < (r.requireRank || 0);
    const locked      = realmLocked || rankLocked;
    const tierColor   = TIER_COLORS_KL[r.tier || 1] || '#888';
    const resultDef   = PUPPET_ITEMS.find(p => p.id === r.resultItem);

    const mats = r.materials.map(({ id, qty }) => {
      const have   = G.alchemy?.ingredients?.[id] || 0;
      const enough = have >= qty;
      const ing    = ALL_INGS.find(i => i.id === id);
      return `<span class="ingredient ${enough ? 'have' : 'missing'}">${ing?.emoji || '?'} ${ing?.name || id} <span class="${enough ? '' : 'ing-short'}">${have}/${qty}</span></span>`;
    }).join('');

    const statHtml = resultDef ? `
      <div style="font-size:11px;color:var(--text-dim);margin:4px 0;display:flex;gap:8px;flex-wrap:wrap">
        <span>⚔ <b style="color:${tierColor}">${applyBonus(resultDef.atk)}</b></span>
        <span>🛡 <b style="color:${tierColor}">${applyBonus(resultDef.def)}</b></span>
        <span>❤ <b style="color:${tierColor}">${applyBonus(resultDef.hp)}</b></span>
        ${bonusPct > 0 ? `<span style="color:#56c46a;font-size:10px">(+${bonusPct}%)</span>` : ''}
        ${resultDef.special ? `<span style="color:#f0d47a;font-size:10px">✦ ${resultDef.special.desc}</span>` : ''}
      </div>` : '';

    const finalChance = Math.min(0.97, (r.successChance || 0.8) + (rank.bonusPct || 0) / 100 * 0.3 + spiritBonus);
    const chanceColor = finalChance > 0.75 ? '#56c46a' : finalChance > 0.55 ? '#f0d47a' : '#e05c4a';

    const canCraft = !locked
      && r.materials.every(({ id, qty }) => (G.alchemy?.ingredients?.[id] || 0) >= qty)
      && (G.stone || 0) >= (r.stoneCost || 0);

    return `
      <div class="recipe-card nn-recipe-card ${canCraft ? 'can-craft' : 'no-craft'} ${locked ? 'recipe-locked' : ''}"
           style="border-color:${tierColor}44">
        <div class="recipe-header">
          <span class="recipe-tier" style="color:${COLOR}">T${r.tier} Khôi Lỗi</span>
          <h3 style="margin:0">${r.emoji} ${r.name}</h3>
        </div>
        <p class="recipe-effect" style="font-size:11px;color:var(--text-dim);margin:3px 0">${r.desc}</p>
        ${statHtml}
        <div class="recipe-ingredients">${mats}</div>
        <div class="nn-recipe-meta">
          <div class="nn-meta-row">
            <span>💎 ${r.stoneCost || 0}</span>
            <span style="color:${chanceColor}">✓ ${Math.floor(finalChance * 100)}%</span>
            ${spiritBonus > 0 ? '<span style="color:#c8a84b;font-size:10px">⚔/🌍 Linh Căn +10%</span>' : ''}
          </div>
        </div>
        ${locked
          ? `<div style="text-align:center;font-size:11px;color:#666;padding:6px">🔒 ${realmLocked ? `Cần ${REALM_NAMES_KL[r.requireRealm]}` : `Cần rank ${r.requireRank}`}</div>`
          : `<button class="btn-cook btn-primary kl-craft-btn" data-recipe-id="${r.id}"
                     ${canCraft ? '' : 'disabled'} style="border-color:${COLOR};background:rgba(224,92,74,0.15)">
               ${canCraft ? `🤖 Chế Tạo` : '❌ Thiếu điều kiện'}
             </button>`}
      </div>`;
  }).join('');

  return rankHtml + activeHtml + invHtml + `
    <div class="forge-tier-tabs">${tierTabsHtml}</div>
    <div class="nn-recipes">${recipesHtml || '<div class="empty-state-box"><p style="color:var(--text-dim)">Không có công thức phù hợp.</p></div>'}</div>`;
}

// ---- Skeleton cho nghề chưa phát triển ----
const SKELETON_INFO = {
  tran_phap: {
    color:'#56c46a', nameCN:'陣法師',
    desc:'Bố trí trận pháp phòng thủ và tấn công, gia tăng linh lực khu vực.',
    features:[
      { icon:'🛡', name:'Hộ Thể Trận', desc:'Giảm sát thương nhận vào.' },
      { icon:'⚡', name:'Linh Khí Trận', desc:'Tăng tốc độ tu luyện khu vực.' },
      { icon:'🗡', name:'Sát Thương Trận', desc:'Tự động gây sát thương kẻ địch.' },
      { icon:'🔯', name:'Phong Ấn Trận', desc:'Trói buộc và làm suy yếu mục tiêu.' },
    ],
  },
  phu_chu: {
    color:'#a855f7', nameCN:'符籙師',
    desc:'Vẽ bùa linh tăng cường chiến đấu, bảo hộ và trói buộc kẻ địch.',
    features:[
      { icon:'🔥', name:'Hỏa Hệ Phù', desc:'Bùa hỏa thuật, gây sát thương lửa.' },
      { icon:'🛡', name:'Hộ Thân Phù', desc:'Tạo lá chắn linh khí tạm thời.' },
      { icon:'💊', name:'Trị Thương Phù', desc:'Hồi máu khi sử dụng.' },
      { icon:'👁', name:'Tàng Hình Phù', desc:'Thoát khỏi sự chú ý của kẻ địch.' },
    ],
  },
  khoi_loi: {
    color:'#e05c4a', nameCN:'傀儡師',
    desc:'Chế tạo và điều khiển khối lỗi chiến đấu thay tu sĩ.',
    features:[
      { icon:'⚙', name:'Khôi Lỗi Sơ Cấp', desc:'Khối lỗi đồng, chiến đấu cơ bản.' },
      { icon:'🗡', name:'Khôi Lỗi Chiến Đấu', desc:'Trang bị vũ khí linh, ATK cao.' },
      { icon:'🛡', name:'Khôi Lỗi Hộ Vệ', desc:'Chịu đòn thay chủ nhân.' },
      { icon:'🐉', name:'Khôi Lỗi Linh Thú', desc:'Tích hợp sức mạnh linh vật.' },
    ],
  },
  linh_thuc: {
    color:'#4db8a0', nameCN:'靈食師',
    desc:'Nấu linh thực từ dược thảo và linh vật, tăng tuổi thọ và sinh lực.',
    features:[
      { icon:'🍵', name:'Linh Trà', desc:'Tăng tốc hồi phục và tu luyện.' },
      { icon:'🥘', name:'Linh Thang', desc:'Tăng tuổi thọ và hồi phục linh lực.' },
      { icon:'🍱', name:'Linh Phạn', desc:'Buff dài hạn cho chỉ số chiến đấu.' },
      { icon:'🍰', name:'Linh Điểm', desc:'Buff mạnh, hiếm gặp.' },
    ],
  },
};