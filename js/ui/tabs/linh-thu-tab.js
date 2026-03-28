// ============================================================
// ui/tabs/linh-thu-tab.js — Tab Linh Thú
// ============================================================
import { LINH_THU_DATA, SHOP_EGGS, RARITY_COLORS } from '../../core/linh-thu-engine.js';
import { fmtNum } from '../../utils/helpers.js';

const REALM_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];

let _activeSection = 'my_beasts'; // 'my_beasts' | 'eggs' | 'shop'

export function renderLinhThuTab(G, actions) {
  const panel = document.getElementById('panel-linh_thu');
  if (!panel) return;

  const lt = G.linhThu || { slots: [null, null], eggs: [] };

  panel.innerHTML = `
    <div class="tab-content">
      <h2 class="tab-title" style="color:#a89df5">🐾 Linh Thú <span style="font-size:12px;opacity:0.5">靈獸</span></h2>

      <!-- Section tabs -->
      <div class="lt-sec-tabs" style="display:flex;gap:6px;margin-bottom:14px">
        ${[
          { id:'my_beasts', label:'🐾 Của Ta' },
          { id:'eggs',      label:'🥚 Trứng' },
          { id:'shop',      label:'🛒 Mua' },
        ].map(s => `
          <button class="lt-sec-btn ${_activeSection===s.id?'active':''}" data-sec="${s.id}"
            style="flex:1;padding:7px 4px;font-size:12px;border-radius:7px;border:1px solid ${_activeSection===s.id?'#a89df5':'#333'};background:${_activeSection===s.id?'#a89df522':'transparent'};color:${_activeSection===s.id?'#a89df5':'#888'};cursor:pointer">
            ${s.label}
          </button>`).join('')}
      </div>

      ${_activeSection === 'my_beasts' ? _renderMyBeasts(lt, G) : ''}
      ${_activeSection === 'eggs'      ? _renderEggs(lt, G) : ''}
      ${_activeSection === 'shop'      ? _renderShop(G) : ''}
    </div>`;

  // Wire section tabs
  panel.querySelectorAll('.lt-sec-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeSection = btn.dataset.sec;
      renderLinhThuTab(G, actions);
    });
  });

  // Wire feed buttons
  panel.querySelectorAll('.btn-lt-feed').forEach(btn => {
    btn.addEventListener('click', () => {
      const result = actions.feedBeast(parseInt(btn.dataset.slot));
      if (result) renderLinhThuTab(G, actions);
    });
  });

  // Wire release buttons
  panel.querySelectorAll('.btn-lt-release').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Thả linh thú về tự nhiên?')) return;
      const result = actions.releaseBeast(parseInt(btn.dataset.slot));
      if (result) renderLinhThuTab(G, actions);
    });
  });

  // Wire shop buy buttons
  panel.querySelectorAll('.btn-lt-buy').forEach(btn => {
    btn.addEventListener('click', () => {
      const result = actions.buyLinhThuEgg(btn.dataset.beastId);
      if (result) renderLinhThuTab(G, actions);
    });
  });
}

// ============================================================
function _renderMyBeasts(lt, G) {
  const slots = lt.slots || [null, null];
  const now = G.gameTime?.currentYear || 0;

  return `
    <div class="lt-slots">
      ${slots.map((beast, idx) => beast
        ? _renderBeastSlot(beast, idx, now)
        : _renderEmptySlot(idx)
      ).join('')}
    </div>
    <div style="font-size:11px;color:var(--text-dim);margin-top:10px;text-align:center">
      Linh thú cần được cho ăn mỗi 5 ngày game. Đói → buff giảm 50%.
    </div>`;
}

function _renderBeastSlot(beast, idx, now) {
  const data = LINH_THU_DATA[beast.beastId];
  if (!data) return '';
  const rarColor = RARITY_COLORS[data.rarity] || '#888';
  const hungry = beast.hungry;
  const intimacy = Math.floor(beast.intimacy || 0);
  const intimacyPct = intimacy;
  const daysSinceFed = Math.floor((now - (beast.lastFedYear || 0)) * 365);

  const buffsHtml = data.buffs.map(b => {
    const active = !hungry;
    return `<span style="font-size:10px;color:${active?'#56c46a':'#888'};${active?'':'text-decoration:line-through'}">✦ ${b.label}</span>`;
  }).join('<br>');

  const skillHtml = [
    beast.skill50Unlocked  ? `<div style="font-size:10px;color:#f0d47a">⚡ ${data.skill50?.name}</div>`  : '',
    beast.skill100Unlocked ? `<div style="font-size:10px;color:#a855f7">👑 ${data.skill100?.name}</div>` : '',
  ].join('');

  const foodName = data.foodId === 'linh_thu_nhuc' ? 'Linh Thú Nhục' : 'Linh Thú Cốt';
  const foodQty = G.alchemy?.ingredients?.[data.foodId] || 0;

  return `
    <div class="lt-beast-card" style="border:1px solid ${rarColor}44;background:${rarColor}0a;border-radius:10px;padding:12px;margin-bottom:10px">
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="font-size:36px;flex-shrink:0">${data.emoji}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:13px;font-weight:700;color:${rarColor}">${data.name}</span>
            <span style="font-size:10px;color:#666">${data.nameCN}</span>
            ${hungry ? '<span style="font-size:10px;background:#e05c4a22;color:#e05c4a;padding:1px 5px;border-radius:4px">😫 Đói</span>' : ''}
          </div>
          <div style="font-size:10px;color:var(--text-dim);margin-bottom:6px">${data.desc}</div>
          <div style="margin-bottom:6px">${buffsHtml}</div>
          ${skillHtml}
        </div>
      </div>

      <!-- Thân thiết bar -->
      <div style="margin-top:8px">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-dim);margin-bottom:3px">
          <span>💜 Thân Thiết</span>
          <span>${intimacy}/100${beast.skill100Unlocked ? ' 👑' : beast.skill50Unlocked ? ' ⚡' : ''}</span>
        </div>
        <div style="height:4px;background:#1a2030;border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${intimacyPct}%;background:${rarColor};transition:width 0.3s"></div>
        </div>
        ${!beast.skill50Unlocked ? `<div style="font-size:9px;color:#666;margin-top:2px">Thân thiết 50 → mở kỹ năng: ${data.skill50?.name}</div>` : ''}
      </div>

      <!-- Cho ăn -->
      <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
        <div style="font-size:11px;color:${daysSinceFed>4?'#e05c4a':'#888'}">
          🍖 ${foodName}: ${foodQty} (cho ăn lần cuối: ${daysSinceFed} ngày trước)
        </div>
        <button class="btn-lt-feed" data-slot="${idx}"
          style="margin-left:auto;padding:5px 12px;font-size:11px;background:${foodQty>0?'#56c46a22':'#333'};border:1px solid ${foodQty>0?'#56c46a':'#444'};color:${foodQty>0?'#56c46a':'#666'};border-radius:6px;cursor:${foodQty>0?'pointer':'not-allowed'}">
          Cho Ăn
        </button>
        <button class="btn-lt-release" data-slot="${idx}"
          style="padding:5px 8px;font-size:11px;background:transparent;border:1px solid #444;color:#666;border-radius:6px;cursor:pointer">
          Thả
        </button>
      </div>
    </div>`;
}

function _renderEmptySlot(idx) {
  return `
    <div style="border:1px dashed #333;border-radius:10px;padding:20px;text-align:center;margin-bottom:10px;color:#444">
      <div style="font-size:24px;margin-bottom:6px">🐾</div>
      <div style="font-size:12px">Slot ${idx+1} — Trống</div>
      <div style="font-size:10px;margin-top:4px;color:#333">Thuần hóa hoặc mua trứng để có linh thú</div>
    </div>`;
}

// ============================================================
function _renderEggs(lt, G) {
  const eggs = lt.eggs || [];
  const now  = G.gameTime?.currentYear || 0;
  if (eggs.length === 0) {
    return `<div style="text-align:center;padding:30px;color:#444">
      <div style="font-size:32px;margin-bottom:8px">🥚</div>
      <div>Chưa có trứng nào. Khám phá map để tìm trứng linh thú!</div>
    </div>`;
  }
  return `<div class="lt-eggs">
    ${eggs.map(egg => {
      const data = LINH_THU_DATA[egg.beastId];
      if (!data) return '';
      const rarColor = RARITY_COLORS[data.rarity] || '#888';
      const daysLeft = Math.max(0, (egg.hatchAt - now) * 365);
      const progress = Math.min(100, 100 - (daysLeft / data.eggDays * 100));
      return `
        <div style="border:1px solid ${rarColor}44;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:10px">
          <div style="font-size:32px">🥚</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:600;color:${rarColor}">${data.name} <span style="color:#666;font-size:10px">${data.nameCN}</span></div>
            <div style="font-size:10px;color:var(--text-dim);margin:3px 0">Còn ${daysLeft.toFixed(1)} ngày game</div>
            <div style="height:4px;background:#1a2030;border-radius:2px;overflow:hidden">
              <div style="height:100%;width:${progress}%;background:${rarColor}"></div>
            </div>
          </div>
          <div style="font-size:22px">${data.emoji}</div>
        </div>`;
    }).join('')}
  </div>`;
}

// ============================================================
function _renderShop(G) {
  const totalHa = G.stone || 0;
  return `
    <div style="font-size:11px;color:var(--text-dim);margin-bottom:10px">
      Chỉ bán trứng — linh thú trưởng thành không thể mua. Ấp trứng để có linh thú.
    </div>
    <div class="lt-shop-grid">
      ${SHOP_EGGS.map(egg => {
        const data = LINH_THU_DATA[egg.beastId];
        if (!data) return '';
        const rarColor = RARITY_COLORS[data.rarity] || '#888';
        const locked   = (G.realmIdx || 0) < egg.unlockRealm;
        const canAfford = totalHa >= egg.cost && !locked;

        const buffsHtml = data.buffs.map(b =>
          `<div style="font-size:10px;color:#56c46a">✦ ${b.label}</div>`
        ).join('');

        return `
          <div class="lt-shop-card" style="border:1px solid ${rarColor}${locked?'22':'44'};border-radius:10px;padding:12px;opacity:${locked?0.5:1}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="font-size:28px">${locked ? '🥚' : data.emoji}</span>
              <div>
                <div style="font-size:12px;font-weight:600;color:${rarColor}">${egg.name}</div>
                <div style="font-size:10px;color:#666">${data.nameCN} · Ấp ${data.eggDays} ngày</div>
              </div>
            </div>
            <div style="font-size:10px;color:var(--text-dim);margin-bottom:6px">${data.desc}</div>
            ${buffsHtml}
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
              <span style="font-size:12px;color:${canAfford?'#f0d47a':'#e05c4a'}">💎 ${fmtNum(egg.cost)}</span>
              ${locked
                ? `<span style="font-size:10px;color:#666">🔒 ${REALM_NAMES[egg.unlockRealm]}</span>`
                : `<button class="btn-lt-buy" data-beast-id="${egg.beastId}"
                    style="padding:5px 12px;font-size:11px;background:${canAfford?rarColor+'22':'#333'};border:1px solid ${canAfford?rarColor:'#444'};color:${canAfford?rarColor:'#666'};border-radius:6px;cursor:${canAfford?'pointer':'not-allowed'}">
                    🛒 Mua
                  </button>`}
            </div>
          </div>`;
      }).join('')}
    </div>`;
}