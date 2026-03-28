// ============================================================
// ui/tabs/thuong-hoi-tab.js — Thương Hội UI
// Currency: Linh Thạch + Danh Vọng (không có Thương Phiếu)
// ============================================================
import {
  FREELANCE_QUESTS, EXCHANGE_ITEMS, INTEL_ITEMS,
  isThuongHoiUnlocked, getAvailableFreelanceQuests,
  getQuestCooldownInfo, acceptFreelanceQuest,
  exchangeItem, buyIntel, getThuongHoiRank,
} from '../../core/thuong-hoi-engine.js';
import { getDanhVongTier } from '../../core/danh-vong.js';
import { fmtNum } from '../../utils/helpers.js';

const TIER_COLORS = { 1:'#888', 2:'#56c46a', 3:'#c8a84b', 4:'#a855f7' };
const TIER_NAMES  = { 1:'Bình Thường', 2:'Khó', 3:'Nguy Hiểm', 4:'Cực Hiểm' };

// --- Main render ---
export function renderThuongHoiTab(G, actions, containerId = 'thuong-hoi-content') {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!isThuongHoiUnlocked(G)) {
    const dv = G.danhVong ?? 0;
    el.innerHTML = `
      <div class="empty-state-box">
        <div style="font-size:36px;margin-bottom:10px">🔒</div>
        <h3 style="color:var(--gold)">Hội Thương Nhân Chưa Mở</h3>
        <p style="color:var(--text-dim);font-size:12px;line-height:1.8">
          Cần Danh Vọng <strong>50</strong> để vào (hiện có ${dv}, còn thiếu ${50-dv}).<br>
          Tăng DV bằng: hoàn thành nhiệm vụ, đánh boss Địa Phủ, luyện đan phẩm cao.
        </p>
      </div>`;
    return;
  }

  const th     = G.thuongHoi || {};
  const dv     = G.danhVong ?? 0;
  const stone  = Math.floor(G.stone ?? 0);
  const dvTier = getDanhVongTier(dv);
  const rank   = getThuongHoiRank(th.totalQuestsDone ?? 0);
  const now    = G.gameTime?.currentYear ?? 0;
  const hasWard    = th.ambushWardExpires  && now < th.ambushWardExpires;
  const hasPurity  = th.purityBoostExpires && now < th.purityBoostExpires;

  el.innerHTML = `
    <div class="th-layout">
      <div class="th-header">
        <div class="th-rank-badge" style="color:${rank.color}">${rank.emoji} ${rank.name}</div>
        <div class="th-stats-row">
          <span>💎 ${fmtNum(stone)}</span>
          <span style="color:${dvTier.color}">⭐ ${dv} DV · ${dvTier.label}</span>
          <span style="color:var(--text-dim);font-size:11px">${th.totalQuestsDone??0} nhiệm vụ hoàn thành</span>
        </div>
        ${hasWard || hasPurity ? `<div class="th-active-buffs">
          ${hasWard   ? '<span class="th-buff-pill">🛡 Giảm phục kích đang hoạt động</span>' : ''}
          ${hasPurity ? '<span class="th-buff-pill">🌙 Tăng Thuần Độ đang hoạt động</span>' : ''}
        </div>` : ''}
      </div>
      <div class="th-tabs">
        <button class="th-tab-btn th-tab-active" data-th-tab="quests">📋 Du Hiệp</button>
        <button class="th-tab-btn" data-th-tab="exchange">🔄 Giao Dịch</button>
        <button class="th-tab-btn" data-th-tab="intel">🔮 Bí Kíp</button>
      </div>
      <div id="th-content-area">${_renderQuests(G)}</div>
    </div>`;

  _wire(G, actions, el, containerId);
}

// --- Du Hiệp ---
function _renderQuests(G) {
  const available = getAvailableFreelanceQuests(G);
  const dv = G.danhVong ?? 0;

  const groups = {};
  FREELANCE_QUESTS.forEach(q => { (groups[q.tier] = groups[q.tier]||[]).push(q); });

  return Object.entries(groups).map(([tier, quests]) => `
    <div class="th-quest-group">
      <div class="th-group-title" style="color:${TIER_COLORS[tier]}">
        Tier ${tier} — ${TIER_NAMES[tier]}
      </div>
      ${quests.map(q => {
        const cd     = getQuestCooldownInfo(G, q.id);
        const locked = dv < q.requireDV || (G.realmIdx??0) < q.requireRealm;
        const ready  = !locked && !cd;

        const costTxt = _fmtCost(q.cost);
        const rewParts = [];
        if (q.reward.stone)     rewParts.push(`+${q.reward.stone}💎`);
        if (q.reward.danhVong)  rewParts.push(`+${q.reward.danhVong}⭐DV`);
        if (q.reward.exp)       rewParts.push(`+${q.reward.exp}✨`);
        if (q.reward.ingredient) rewParts.push(`+${q.reward.ingredient.qty}× ${q.reward.ingredient.id}`);

        return `
          <div class="th-quest-card ${locked?'th-card-locked':''}" style="border-color:${TIER_COLORS[tier]}44">
            <div class="th-quest-header">
              <span class="th-quest-emoji">${q.emoji}</span>
              <span class="th-quest-name">${q.name}</span>
              ${locked ? `<span class="th-status th-locked">🔒 DV${q.requireDV}+</span>`
              : cd     ? `<span class="th-status th-cd">⏳ ${cd}</span>`
                       : `<span class="th-status th-ready">✅ Sẵn sàng</span>`}
            </div>
            <p class="th-quest-desc">${q.desc}</p>
            <div class="th-quest-meta">
              <span>💰 Điều kiện: ${costTxt}</span>
              <span>🎁 ${rewParts.join(' · ')}</span>
            </div>
            <button class="btn-sm ${ready?'btn-primary':'btn-secondary'} th-accept-btn"
                    data-quest-id="${q.id}" ${!ready?'disabled':''}>
              ${locked?'🔒 Chưa mở' : cd?`⏳ ${cd}` : '✅ Nhận nhiệm vụ'}
            </button>
          </div>`;
      }).join('')}
    </div>`).join('');
}

// --- Giao Dịch ---
function _renderExchange(G) {
  const dv    = G.danhVong ?? 0;
  const stone = Math.floor(G.stone ?? 0);

  return `
    <div class="th-exchange-info">
      Mua nguyên liệu hiếm bằng 💎 Linh Thạch — một số item sẽ tiêu hao thêm ⭐ Danh Vọng.<br>
      <span style="color:var(--text-dim);font-size:11px">DV tiêu hao = tiêu dùng uy tín xã hội, cân nhắc trước khi mua.</span>
    </div>
    <div class="th-exchange-grid">
      ${EXCHANGE_ITEMS.map(item => {
        const locked  = dv < item.requireDV;
        const canBuy  = !locked && stone >= item.stoneCost;
        const hasEnoughDv = dv >= item.requireDV + (item.dvCost??0);
        const dvNote  = item.dvCost > 0 ? ` -${item.dvCost}⭐DV` : '';
        const rarColor = item.requireDV >= 300 ? '#c084fc'
                        : item.requireDV >= 150 ? '#3a9fd5' : '#56c46a';

        return `
          <div class="th-exchange-card ${locked?'th-card-locked':''}" style="border-color:${rarColor}44">
            <div class="th-ex-emoji">${item.emoji}</div>
            <div class="th-ex-name">${item.name}</div>
            <div class="th-ex-cost">
              <span style="color:${stone>=item.stoneCost&&!locked?'#56c46a':'#e05c4a'}">${item.stoneCost}💎</span>
              ${item.dvCost>0 ? `<span style="color:${dv>=item.requireDV+item.dvCost?'#f0d47a':'#e05c4a'};font-size:10px"> ${dvNote}</span>` : ''}
            </div>
            ${locked ? `<div style="font-size:10px;color:#888">DV ${item.requireDV}+ cần</div>` : ''}
            <button class="btn-sm ${canBuy&&hasEnoughDv?'btn-primary':'btn-secondary'} th-exchange-btn"
                    data-exchange-id="${item.id}" ${!canBuy||!hasEnoughDv?'disabled':''}>
              ${locked?'🔒':canBuy&&hasEnoughDv?'🔄 Mua':'💎 Không đủ'}
            </button>
          </div>`;
      }).join('')}
    </div>`;
}

// --- Bí Kíp ---
function _renderIntel(G) {
  const dv    = G.danhVong ?? 0;
  const stone = Math.floor(G.stone ?? 0);

  return `
    <div class="th-exchange-info">
      Mua bí kíp và buff bằng 💎 Linh Thạch thuần — không tốn Danh Vọng.
    </div>
    <div class="th-intel-list">
      ${INTEL_ITEMS.map(intel => {
        const locked = dv < intel.requireDV;
        const canBuy = !locked && stone >= intel.stoneCost;
        return `
          <div class="th-intel-card ${locked?'th-card-locked':''}">
            <div class="th-intel-header">
              <span class="th-intel-emoji">${intel.emoji}</span>
              <span class="th-intel-name">${intel.name}</span>
              <span style="color:${canBuy?'#56c46a':'#e05c4a'};font-size:12px">${intel.stoneCost}💎</span>
            </div>
            <p class="th-intel-desc">${intel.desc}</p>
            ${locked?`<p style="font-size:10px;color:#888">Cần DV ${intel.requireDV}+</p>`:''}
            <button class="btn-sm ${canBuy?'btn-primary':'btn-secondary'} th-intel-btn"
                    data-intel-id="${intel.id}" ${!canBuy?'disabled':''}>
              ${locked?'🔒 Chưa mở':canBuy?'🔮 Mua':'💎 Không đủ'}
            </button>
          </div>`;
      }).join('')}
    </div>`;
}

// --- Format cost ---
function _fmtCost(c) {
  if (!c) return 'Miễn phí';
  if (c.type==='ingredient') return `${c.qty}× ${c.id}`;
  if (c.type==='stamina')    return `${c.qty} thể năng`;
  if (c.type==='dungeon_run') return 'Đã qua Địa Phủ tầng 3+';
  if (c.type==='special' && c.id==='nghiepLuc_low') return 'Nghiệp Lực < 30';
  return '?';
}

// --- Wire events ---
function _wire(G, actions, panelEl, containerId) {
  // Tab switch
  panelEl.querySelectorAll('.th-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      panelEl.querySelectorAll('.th-tab-btn').forEach(b => b.classList.remove('th-tab-active'));
      btn.classList.add('th-tab-active');
      const area = document.getElementById('th-content-area');
      if (!area) return;
      const tab = btn.dataset.thTab;
      if (tab==='quests')   area.innerHTML = _renderQuests(G);
      if (tab==='exchange') area.innerHTML = _renderExchange(G);
      if (tab==='intel')    area.innerHTML = _renderIntel(G);
      _wireContent(G, actions, area, containerId);
    });
  });
  _wireContent(G, actions, panelEl, containerId);
}

function _wireContent(G, actions, el, containerId) {
  el.querySelectorAll('.th-accept-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = acceptFreelanceQuest(G, btn.dataset.questId);
      actions.toast?.(r.msg, r.ok?'gold':'danger');
      if (r.ok) { actions.appendLog?.(r.msg,'gold'); actions.saveGame?.(); renderThuongHoiTab(G, actions, containerId); }
    });
  });
  el.querySelectorAll('.th-exchange-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = exchangeItem(G, btn.dataset.exchangeId);
      actions.toast?.(r.msg, r.ok?'spirit':'danger');
      if (r.ok) { actions.saveGame?.(); renderThuongHoiTab(G, actions, containerId); }
    });
  });
  el.querySelectorAll('.th-intel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = buyIntel(G, btn.dataset.intelId);
      actions.toast?.(r.msg, r.ok?'epic':'danger');
      if (r.ok) { actions.saveGame?.(); renderThuongHoiTab(G, actions, containerId); }
    });
  });
}