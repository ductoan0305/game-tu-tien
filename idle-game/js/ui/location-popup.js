// ============================================================
// ui/location-popup.js — Location Popup, Hunt, NPC Dialog
// ============================================================
import { bus } from '../utils/helpers.js';
import { getNpcPendingQuest, giveQuestFromNPC } from '../quest/quest-engine.js';
import { addChronicle } from '../core/time-engine.js';
import { moveToPhapDia } from '../core/phap-dia.js';
import { calcMaxQi, calcQiRate } from '../core/state.js';
import { getAvailableEnemies } from '../combat/combat-engine.js';
import { ZONE_DATA } from './map-data.js';
import { getNpcRepInfo, getNpcRepTier } from '../core/npc-reputation-engine.js';
// L7 — H3: NPC Reputation Rewards
import { NPC_REWARDS, checkKhauKhauGate, applyKhauKhauBuff, checkSecretZoneCooldown, markSecretZoneGathered } from '../core/npc-data.js';
import { ITEMS } from '../core/data.js';
import { addToInventory } from '../core/systems/inventory.js';

// Export để world-map.js dùng (fix missing import bug)
export function _isLocLocked(G, loc) {
  if (loc.requireSect && G.sectId !== loc.requireSect) return true;
  if (loc.requireRealm && G.realmIdx < loc.requireRealm) return true;
  if (loc.requireFreelance && G.sectId) return true;
  // L7 — H3: Secret zone — chỉ hiện khi đã unlock từ NPC reputation tier 2
  if (loc.requireSecret && !G.flags?.unlockedSecretZones?.[loc.requireSecret]) return true;
  return false;
}

export function _updateLocInfo(G, loc, actions) {
  const el = document.getElementById('mst2-loc-info');
  if (!el) return;

  const actionBtns = _getLocActionBtns(G, loc);
  el.innerHTML = `
    <div class="mst2-loc-card">
      <div class="mst2-lc-header">
        <span style="font-size:22px">${loc.emoji}</span>
        <div>
          <div style="font-size:13px;font-weight:600;color:#fff">${loc.name}</div>
          <div style="font-size:10px;color:var(--text-dim);margin-top:2px">${loc.desc}</div>
        </div>
      </div>
      <div class="mst2-lc-actions">${actionBtns}</div>
    </div>`;

  // Wire location action buttons
  el.querySelectorAll('.loc-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.act;
      _handleLocAction(G, loc, act, actions);
    });
  });
}

function _getLocActionBtns(G, loc) {
  const btns = [];
  switch(loc.type) {
    case 'sect_gate':
      if (G.sectId === loc.sectId) {
        btns.push(['quest','📜 Nhiệm Vụ Đường'],['skill','📖 Tàng Kinh Các'],
                  ['spar','🏋 Luyện Võ'],['npc','👴 Trưởng Lão']);
      } else if (!G.sectId) {
        btns.push(['join_sect','🚪 Xin Gia Nhập']);
      }
      break;
    case 'market':
      btns.push(['shop','🏪 Mua Bán'],['ingredients','📦 Nguyên Liệu']);
      break;
    case 'hunt_zone':
      btns.push(['combat','⚔ Săn Thú'],['gather','🌿 Thu Thảo']);
      break;
    case 'cultivate_spot':
      btns.push(['cultivate','🧘 Nhập Định Tại Đây']);
      break;
    case 'alchemy':
      btns.push(['alchemy','⚗ Luyện Đan'],['gather','🌿 Thu Thảo']);
      break;
    case 'gather_zone':
      btns.push(['gather','🌿 Thu Thảo Hiếm'],['explore','🗺 Thám Hiểm']);
      break;
    // L7 — H3: Secret gather zone từ NPC reputation
    case 'secret_gather':
      btns.push(['secret_gather','🌺 Thu Thập Nguyên Liệu Hiếm']);
      break;
    case 'freelance_quest':
      btns.push(['freelance','📜 Nhận Nhiệm Vụ Du Hiệp']);
      break;
    case 'dungeon':
      btns.push(['dungeon','☠ Vào Địa Phủ']);
      break;
    case 'auction':
      btns.push(['shop','💰 Xem Đấu Giá']);
      break;
    case 'ranking':
      btns.push(['ranking','🏆 Xem Thiên Bảng']);
      break;
    case 'mystery_cave':
    case 'mystery_zone':
      btns.push(['explore','🗺 Khám Phá'],['cultivate','🧘 Tu Luyện Ẩn Dật']);
      break;
    case 'boss_zone':
      btns.push(['combat','⚔ Thách Đấu Boss']);
      break;
    case 'ghost_market':
      btns.push(['shop','👻 Mua Bán Âm Hồn']);
      break;
    case 'treasure':
      btns.push(['explore','🗝 Mở Kho Báu']);
      break;
  }
  return btns.map(([act,label]) =>
    `<button class="loc-action-btn" data-act="${act}">${label}</button>`
  ).join('');
}

export function _handleLocAction(G, loc, act, actions) {
  // Cultivate spot → cập nhật pháp địa + mở Location Popup bế quan
  if (act === 'cultivate') {
    if (loc.phapDia) {
      moveToPhapDia(G, loc.phapDia);
      if (!G.meditating) G.meditating = true;
    }
    _showLocationPopup(G, loc, 'cultivate', actions);
    return;
  }
  // Join sect
  if (act === 'join_sect') {
    actions.showSectJoin(loc.sectId, loc.name);
    return;
  }
  // NPC dialog
  if (act === 'npc') {
    _showNpcDialog(G, loc, actions);
    return;
  }
  // Săn thú → Location Popup chọn enemy
  if (act === 'combat') {
    _showLocationPopup(G, loc, 'combat', actions);
    return;
  }
  // Thu thảo → Location Popup gather
  if (act === 'gather') {
    _showLocationPopup(G, loc, 'gather', actions);
    return;
  }
  // Dungeon → Location Popup dungeon
  if (act === 'dungeon') {
    _showLocationPopup(G, loc, 'dungeon', actions);
    return;
  }
  // Market / shop → Location Popup shop
  if (act === 'shop' || act === 'ingredients') {
    _showLocationPopup(G, loc, 'shop', actions);
    return;
  }
  // Explore / mystery → Location Popup explore
  if (act === 'explore') {
    _showLocationPopup(G, loc, 'explore', actions);
    return;
  }
  // L7 — H3: Secret gather zone — cooldown check + gather
  if (act === 'secret_gather') {
    const zoneId = loc.id;
    const cd = checkSecretZoneCooldown(G, zoneId);
    if (!cd.canGather) {
      if (actions?.toast) actions.toast(`🌺 Bí Cảnh đang hồi phục — còn ${cd.nextRefresh}`, 'warning');
      return;
    }
    // Gather thành công: thông báo và ghi cooldown
    markSecretZoneGathered(G, zoneId);
    if (actions?.toast) actions.toast(`🌺 Thu thập bí cảnh thành công! Cooldown 30 ngày thực.`, 'legendary');
    _showLocationPopup(G, loc, 'gather', actions);
    return;
  }
  // Các action còn lại → switch tab (fallback)
  const tabMap = {
    quest:'quests', skill:'skills', spar:'skills',
    alchemy:'alchemy', ranking:'ranking',
    freelance:'quests',
  };
  const tab = tabMap[act];
  if (tab) {
    actions.switchTab(tab);
    actions.toast(`Đến ${loc.name}`, 'jade');
  }
}

// ============================================================
// TẦNG 3 — LOCATION POPUP
// ============================================================
export function _showLocationPopup(G, loc, mode, actions) {
  const existing = document.getElementById('modal-location');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-location';
  modal.className = 'modal-overlay';

  const content = _buildLocPopupContent(G, loc, mode, actions);

  modal.innerHTML = `
    <div class="modal-box loc-popup">
      <div class="loc-popup-header">
        <span class="loc-popup-emoji">${loc.emoji}</span>
        <div class="loc-popup-title-wrap">
          <div class="loc-popup-name">${loc.name}</div>
          <div class="loc-popup-desc">${loc.desc}</div>
        </div>
        <button class="loc-popup-close" id="loc-popup-close">✕</button>
      </div>
      <div class="loc-popup-tabs" id="loc-popup-tabs">
        ${_buildLocTabs(loc, mode)}
      </div>
      <div class="loc-popup-body" id="loc-popup-body">
        ${content}
      </div>
    </div>`;

  document.body.appendChild(modal);

  // Close
  document.getElementById('loc-popup-close')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  // Tab switching
  modal.querySelectorAll('.lpt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.lpt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('loc-popup-body').innerHTML =
        _buildLocPopupContent(G, loc, btn.dataset.mode, actions);
      _wireLocPopupActions(G, loc, btn.dataset.mode, actions, modal);
    });
  });

  _wireLocPopupActions(G, loc, mode, actions, modal);
}

function _buildLocTabs(loc, activeMode) {
  const tabDefs = _getLocTabs(loc);
  if (tabDefs.length <= 1) return '';
  return tabDefs.map(([mode, label]) =>
    `<button class="lpt-btn${mode === activeMode ? ' active' : ''}" data-mode="${mode}">${label}</button>`
  ).join('');
}

function _getLocTabs(loc) {
  const map = {
    hunt_zone:    [['combat','⚔ Săn Thú'],['gather','🌿 Thu Thảo']],
    gather_zone:  [['gather','🌿 Thu Thảo']],
    mystery_cave: [['explore','🗺 Khám Phá'],['cultivate','🧘 Tu Luyện']],
    mystery_zone: [['explore','🗺 Khám Phá'],['cultivate','🧘 Tu Luyện']],
    alchemy:      [['gather','🌿 Thu Thảo'],['alchemy','⚗ Luyện Đan']],
    market:       [['shop','🏪 Mua Bán'],['ingredients','📦 Nguyên Liệu']],
    sect_gate:    [['quest','📜 Nhiệm Vụ'],['npc','👴 Trưởng Lão'],['cultivate','🧘 Luyện Võ']],
  };
  return map[loc.type] || [];
}

function _buildLocPopupContent(G, loc, mode, actions) {
  switch (mode) {
    case 'combat':    return _popupCombat(G, loc);
    case 'gather':    return _popupGather(G, loc);
    case 'cultivate': return _popupCultivate(G, loc);
    case 'dungeon':   return _popupDungeon(G, loc);
    case 'shop':      return _popupShop(G, loc);
    case 'explore':   return _popupExplore(G, loc);
    case 'alchemy':   return _popupAlchemy(G, loc);
    case 'freelance': return _popupThuongHoi(G, loc, actions);
    default:          return `<div class="lp-empty">Chưa có nội dung cho khu vực này.</div>`;
  }
}

// Hunt travel days by zone — tượng trưng thời gian di chuyển đến khu săn
const HUNT_TRAVEL_DAYS = {
  sv_forest:     7,
  hd_lava_field: 10,
  hb_ice_lake:   10,
  lh_river:      7,
  // world map zones
  thanh_van_son: 7,  hac_phong_lam: 15, linh_duoc_coc: 20,
  van_linh_coc:  25, hoa_binh_nguyen: 30, vuc_tham: 45,
  long_sao:      60, thien_kiep_dia: 90, an_long_dong: 75,
};

function _popupCombat(G, loc) {
  const enemies = getAvailableEnemies(G.realmIdx);
  const TIER_COLORS = {1:'#888',2:'#56c46a',3:'#c8a84b',4:'#e05c1a',5:'#a855f7'};
  if (!enemies.length) {
    return `<div class="lp-empty">⚠ Không có yêu thú phù hợp với cảnh giới của ngươi.</div>`;
  }

  // Chỉ số nhân vật để preview damage
  const playerAtk = (G.atk || 10) * (1 + (G.atkPct || 0) / 100);
  const huntDays  = HUNT_TRAVEL_DAYS[loc.id] || 7;

  return `
    <div class="lp-combat-notice" data-hunt-days="${huntDays}">
      ⏳ Di chuyển đến khu vực và tìm kiếm yêu thú mất khoảng <strong>${huntDays} ngày</strong> — tuổi thọ sẽ bị tiêu hao.
    </div>
    <div class="lp-player-stats-bar">
      <span>⚔ ATK <strong>${Math.floor(playerAtk)}</strong></span>
      <span>🛡 DEF <strong>${G.def || 5}</strong></span>
      <span>❤ HP <strong>${Math.floor(G.hp || 0)}/${G.maxHp || 100}</strong></span>
    </div>
    <div class="lp-section-title">Yêu thú tại ${loc.name}</div>
    <div class="lp-enemy-list">
      ${enemies.map(e => {
        const col = TIER_COLORS[e.tier] || '#888';
        // Damage preview: ATK - DEF×0.5 (công thức từ combat-engine.js)
        const dmgToEnemy  = Math.max(1, Math.floor(playerAtk - e.defBase * 0.5));
        const dmgToPlayer = Math.max(1, Math.floor(e.atkBase - (G.def || 5) * 0.5));
        return `
          <div class="lp-enemy-row" data-enemy-id="${e.id}" style="border-color:${col}33">
            <span style="font-size:24px;line-height:1">${e.emoji}</span>
            <div class="lp-er-info">
              <div class="lp-er-name" style="color:${col}">${e.name}</div>
              <div class="lp-er-stats">Tier ${e.tier} · ❤${e.hpBase} ⚔${e.atkBase} 🛡${e.defBase}</div>
              <div class="lp-er-dmg">
                <span class="lp-dmg-you" title="Damage ngươi gây ra">🗡 ~${dmgToEnemy}/đòn</span>
                <span class="lp-dmg-enemy" title="Damage ngươi nhận">💢 ~${dmgToPlayer}/đòn</span>
              </div>
            </div>
            <div class="lp-er-reward">
              <div style="color:var(--gold)">+${e.expReward||0} EXP</div>
              <div style="color:#aaa">+${e.stoneReward?.[0]||0}-${e.stoneReward?.[1]||0}💎</div>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

function _popupGather(G, loc) {
  // Map location id → gather zone ids
  const locGatherMap = {
    // Thanh Vân Thôn
    sv_herb_field:  ['spirit_forest'],
    sv_forest:      ['spirit_forest'],
    // Hỏa Diệm Thôn
    hd_ore_mine:    ['demon_wilds'],
    hd_lava_field:  ['demon_wilds'],
    // Hàn Băng Thôn
    hb_cave:        ['ice_mountain'],
    hb_ice_lake:    ['ice_mountain'],
    // Lâm Hải Thôn
    lh_herb_shore:  ['spirit_forest','cloud_valley'],
    lh_river:       ['spirit_forest'],
    // Thế giới lớn
    linh_duoc_coc:  ['spirit_forest','cloud_valley'],
    hac_phong_lam:  ['demon_wilds'],
    thien_kiep_dia: ['thunder_peak'],
    an_long_dong:   ['abyss_cave'],
  };

  // Lấy zones từ map, hoặc từ loc.gatherZones nếu có, fallback spirit_forest
  const zoneIds = loc.gatherZones || locGatherMap[loc.id] || ['spirit_forest'];

  // Import GATHER_ZONES inline để lấy travelDays
  // Dùng window._GATHER_ZONES nếu đã expose, hoặc hardcode labels + days
  const ZONE_INFO = {
    spirit_forest: { label: '🌲 Linh Thảo Rừng',        days: 30  },
    demon_wilds:   { label: '🌑 Yêu Thú Hoang Dã',      days: 45  },
    cloud_valley:  { label: '☁ Vân Linh Cốc',           days: 40  },
    ice_mountain:  { label: '🏔 Băng Sơn Tuyết Đỉnh',   days: 60  },
    thunder_peak:  { label: '⛰ Lôi Đỉnh Thiên Cung',    days: 90  },
    fire_plains:   { label: '🌋 Hỏa Bình Nguyên',        days: 75  },
    abyss_cave:    { label: '🕳 Vực Thẳm Yêu Quật',      days: 120 },
    void_realm:    { label: '🌌 Hư Không Thác Giới',     days: 150 },
    dragon_nest:   { label: '🐲 Long Sào Tiên Địa',      days: 180 },
  };

  return `
    <div class="lp-section-title">🌿 Thu Thập Thảo Dược</div>
    <div class="lp-gather-hint">
      ⏳ Tìm kiếm thảo dược đòi hỏi di chuyển xa và lùng sục kỹ lưỡng — tốn nhiều ngày.<br>
      Thể năng và tuổi thọ sẽ bị tiêu hao. Tỷ lệ tìm được không đảm bảo.
    </div>
    <div class="lp-gather-zones">
      ${zoneIds.map(zid => {
        const info = ZONE_INFO[zid] || { label: '🌿 ' + zid, days: 30 };
        return `
        <button class="lp-gather-btn" data-zone="${zid}" data-travel-days="${info.days}">
            <span class="lgb-label">${info.label}</span>
            <span class="lgb-days">⏳ ~${info.days} ngày</span>
          </button>`;
      }).join('')}
    </div>`;
}

function _popupCultivate(G, loc) {
  const PHAP_DIA_NAMES = {
    pham_dia:'Phàm Địa ×0.8', linh_dia:'Linh Địa ×1.2',
    phuc_dia:'Phúc Địa ×1.8', dong_phu:'Động Phủ ×3.0', bao_dia:'Bảo Địa ×5.0'
  };
  const pdName = loc.phapDia ? PHAP_DIA_NAMES[loc.phapDia] || loc.phapDia : null;
  const isMed = G.meditating;
  const pdCurrent = G.phapDia?.currentId;

  return `
    <div class="lp-section-title">Tu Luyện — Nhập Định</div>
    ${pdName ? `<div class="lp-cultivate-pd">✦ Pháp Địa: <strong>${pdName}</strong></div>` : ''}
    <div class="lp-cultivate-status">
      <span class="${isMed?'lp-med-on':'lp-med-off'}">
        ${isMed ? '🧘 Đang nhập định' : '⚠ Chưa vận công'}
      </span>
      ${pdCurrent === loc.phapDia ? '<span class="lp-pd-active">✓ Pháp Địa đang dùng</span>' : ''}
    </div>
    <div class="lp-cultivate-btns">
      ${loc.phapDia ? `<button class="lp-action-main" id="lp-btn-enter-phapdia">
        🏔 Vào Pháp Địa${isMed ? ' (đang nhập định)' : ''}
      </button>` : ''}
      <button class="lp-action-main${isMed?' lp-action-active':''}" id="lp-btn-toggle-med">
        ${isMed ? '⏹ Xuất Định' : '🧘 Nhập Định'}
      </button>
    </div>
    <div class="lp-cultivate-desc">
      Nhập định tại đây để tận dụng linh khí. Rời bản đồ hoặc hành động sẽ gián đoạn tu luyện.
    </div>`;
}

function _popupDungeon(G, loc) {
  const maxFloor = G.dungeon?.maxFloorReached || 0;
  return `
    <div class="lp-section-title">☠ Địa Phủ Nhập Khẩu</div>
    <div class="lp-dungeon-info">
      <div class="lp-di-row"><span>Tầng tối đa đã đạt</span><strong>${maxFloor > 0 ? maxFloor : 'Chưa vào'}</strong></div>
      <div class="lp-di-row"><span>Số lần vào hôm nay</span><strong>${G.dungeon?.runsToday || 0}/5</strong></div>
    </div>
    <div class="lp-dungeon-warn">
      ⚠ Địa Phủ cực kỳ nguy hiểm. Hãy chuẩn bị đầy đủ trước khi vào.
    </div>
    <button class="lp-action-main lp-action-danger lp-action-switch" data-tab="dungeon">
      ☠ Vào Địa Phủ →
    </button>`;
}

function _popupShop(G, loc) {
  // S-C: NPC chợ có lời chào — mở khóa shop lần đầu qua tương tác này
  const isFirstVisit = !G.flags?.shopUnlocked;
  const npcGreeting = isFirstVisit
    ? `<div class="lp-npc-dialog" style="background:#1a1a26;border-left:3px solid #f0d47a;padding:10px 14px;border-radius:6px;margin-bottom:12px;font-size:12px;color:#e8d5a3;font-style:italic;line-height:1.6">
        "Ngươi muốn xem hàng hóa của ta? Vào đây, vào đây — hàng tốt giá phải chăng, không lừa người tu tiên đâu."
      </div>`
    : `<div class="lp-npc-dialog" style="background:#1a1a26;border-left:3px solid #f0d47a;padding:8px 14px;border-radius:6px;margin-bottom:12px;font-size:11px;color:#b8a07a;font-style:italic">
        "Chào lại ngươi! Hàng tốt hôm nay cũng nhiều — cứ từ từ xem."
      </div>`;
  return `
    <div class="lp-section-title">🏮 Mua Bán</div>
    ${npcGreeting}
    <div class="lp-shop-hint" style="font-size:11px;color:var(--text-dim);margin-bottom:12px">
      Tại ${loc.name} có thể mua bán đan dược, nguyên liệu và trang bị.
    </div>
    <div class="lp-shop-btns">
      <button class="lp-action-main lp-action-switch" data-tab="shop" data-unlock="shop">🏪 Vào Cửa Hàng →</button>
      <button class="lp-action-main lp-action-switch" data-tab="inventory">🎒 Xem Túi Đồ →</button>
    </div>`;
}

function _popupExplore(G, loc) {
  const cdKey = `explore_${loc.id}`;
  const cdEnd = G._coDuyenCooldowns?.[cdKey] || 0;
  const now = Date.now();
  const onCd = cdEnd > now;
  const cdSec = onCd ? Math.ceil((cdEnd - now) / 1000) : 0;

  return `
    <div class="lp-section-title">🗺 Thám Hiểm</div>
    <div class="lp-explore-desc">${loc.desc}</div>
    <div class="lp-explore-hint">
      Thám hiểm khu vực bí ẩn có thể gặp Cơ Duyên. Có cooldown sau mỗi lần.
    </div>
    ${onCd
      ? `<div class="lp-cd-notice">⏳ Hồi chiêu: còn ${cdSec}s</div>`
      : `<button class="lp-action-main" id="lp-btn-explore">🗺 Bắt Đầu Thám Hiểm</button>`}`;
}

function _popupAlchemy(G, loc) {
  return `
    <div class="lp-section-title">⚗ Luyện Đan</div>
    <div class="lp-alchemy-hint">
      Dùng lò đan tại ${loc.name}. Mở tab Luyện Đan để xem công thức và luyện chế.
    </div>
    <button class="lp-action-main lp-action-switch" data-tab="alchemy">⚗ Mở Tab Luyện Đan →</button>`;
}

function _popupThuongHoi(G, loc, actions) {
  // Render inline trong popup, container id duy nhất
  const containerId = 'th-popup-content';
  // Defer render sau khi HTML được inject vào DOM
  setTimeout(() => {
    import('./thuong-hoi-tab.js').then(({ renderThuongHoiTab }) => {
      const popupActions = {
        toast:     (msg, type) => { import('../render-core.js').then(m => m.showToast(msg, type)); },
        appendLog: (msg, type) => { import('../render-core.js').then(m => m.appendLog(msg, type)); },
        saveGame:  () => { if (window._G) import('../../core/state.js').then(m => m.saveGame(window._G)); },
      };
      renderThuongHoiTab(G, popupActions, containerId);
    });
  }, 0);
  return `<div id="${containerId}" style="min-height:200px"><div class="lp-empty" style="padding:20px">⏳ Đang tải...</div></div>`;
}

function _getZoneName(zid) {
  const names = {
    thanh_van_son:'Thanh Vân Sơn', hac_phong_lam:'Hắc Phong Lâm',
    linh_duoc_coc:'Linh Dược Cốc', van_linh_coc:'Vân Linh Cốc',
    hoa_binh_nguyen:'Hỏa Bình Nguyên', vuc_tham:'Vực Thẳm', long_sao:'Long Sào',
    thien_kiep_dia:'Thiên Kiếp Địa', an_long_dong:'Ẩn Long Động',
  };
  return names[zid] || zid;
}

function _wireLocPopupActions(G, loc, mode, actions, modal) {
  // Switch tab buttons (các popup có data-tab)
  modal.querySelectorAll('.lp-action-switch').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      // S-C: Khi người chơi lần đầu vào shop qua NPC → unlock + save + re-render nav
      if (targetTab === 'shop' && btn.dataset.unlock === 'shop') {
        if (!G.flags) G.flags = {};
        G.flags.shopUnlocked = true;
        actions.unlockShop?.();
      }
      modal.remove();
      actions.switchTab(targetTab);
    });
  });

  // Combat: chọn enemy — truyền huntDays từ data-hunt-days
  modal.querySelectorAll('.lp-enemy-row').forEach(row => {
    row.addEventListener('click', () => {
      const huntDays = parseInt(row.closest('.loc-popup-body')?.querySelector('.lp-combat-notice')?.dataset.huntDays || '7');
      modal.remove();
      actions.startHunt(row.dataset.enemyId, huntDays);
    });
  });

  // Gather zone buttons — truyền travelDays từ data-travel-days
  modal.querySelectorAll('.lp-gather-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const travelDays = parseInt(btn.dataset.travelDays || '30');
      modal.remove();
      actions.gather?.(btn.dataset.zone, travelDays);
    });
  });

  // Cultivate: toggle meditating
  document.getElementById('lp-btn-toggle-med')?.addEventListener('click', () => {
    G.meditating = !G.meditating;
    actions.toast(G.meditating ? '🧘 Nhập định — bắt đầu tu luyện' : '⏹ Xuất định', 'jade');
    // Re-render content
    document.getElementById('loc-popup-body').innerHTML =
      _buildLocPopupContent(G, loc, 'cultivate', actions);
    _wireLocPopupActions(G, loc, 'cultivate', actions, modal);
  });

  // Cultivate: enter phap dia
  document.getElementById('lp-btn-enter-phapdia')?.addEventListener('click', () => {
    if (loc.phapDia) {
      moveToPhapDia(G, loc.phapDia);
      if (!G.meditating) G.meditating = true;
      actions.toast(`✦ Vào Pháp Địa ${loc.phapDia} — bắt đầu nhập định`, 'jade');
      document.getElementById('loc-popup-body').innerHTML =
        _buildLocPopupContent(G, loc, 'cultivate', actions);
      _wireLocPopupActions(G, loc, 'cultivate', actions, modal);
    }
  });

  // Explore button
  document.getElementById('lp-btn-explore')?.addEventListener('click', () => {
    modal.remove();
    actions.explore?.();
  });
}

// ---- NPC Dialog popup ----
const NPC_DIALOGS = {
  // ── Lâm Hải Thôn ──────────────────────────────────────────────────────────
  lao_ngu_ong: {
    name: 'Lão Ngư Ông', emoji: '🎣',
    greeting: 'Hà hà, tiểu hữu mới đến Lâm Hải Thôn? Vùng biển này gần đây yêu thú nổi loạn lắm. Ngươi có gan thì ta có việc nhờ!',
    greetingAge: {
      80: 'Ngươi đã đi xa lắm rồi. (dừng tay, nhìn ra sông một lúc rồi nhìn ngươi) Lưới ta đan đến đây là đủ — cuộc đời ngươi cũng vậy. Dù kết quả thế nào, ngươi không bỏ thuyền. Ta trân trọng điều đó.',
      70: '(ngừng gỡ lưới, nhìn ngươi) Bảy mươi rồi... Sáng nào ta cũng ra sông — dòng nước không bao giờ chờ. Ngươi biết điều đó rồi. Chỉ cần không bỏ mái chèo.',
      60: 'Nhìn ngươi lại nhớ lúc mình cũng tuổi đó... Sông không vội mà vẫn đến biển. Ngươi cứ đi — thời gian không phải kẻ thù, chỉ là dòng chảy.',
    },
    greetingDV: {
      50:  'Ồ, tiểu hữu đã có chút danh tiếng rồi đấy! Ngư dân chúng ta nghe tiếng cũng yên tâm hơn. Có việc cần nhờ ngươi đây.',
      150: 'Hà hà! Ngươi bây giờ nổi danh khắp vùng rồi! Lão phu nghe tin nhiều lần. Cá linh hôm nay tươi ngon — mời ngươi nếm thử trước khi nghe việc.',
      300: 'Ôi trời! Đại danh của ngươi ta đã nghe từ lâu! Cả thôn đều biết. Ngươi đến thật là may mắn cho dân chài chúng ta!',
      500: 'Bái kiến... ôi không dám! Danh tiếng lừng lẫy của ngươi vang tới tận biển Đông rồi! Lão phu tự hào khi được nói chuyện với ngươi đây!',
    },
    options: [
      { label: '💬 Hỏi về vùng này', action: 'lore', hint: 'Tìm hiểu Lâm Hải Thôn' },
    ],
    lore: 'Lâm Hải Thôn nằm bên bờ biển linh, ngư dân thường bắt được linh ngư kỳ lạ. Gần đây yêu thú kéo đến hoành hành, làng mạc không yên. Tiểu hữu nếu có tài hãy ra tay tương trợ.',
    questGive: 'sq_01_first_kill',
  },

  // ── Thanh Vân Thôn ────────────────────────────────────────────────────────
  lao_duoc_su: {
    name: 'Lão Dược Sư', emoji: '👴',
    greeting: 'Chào tiểu hữu! Ta là Dược Sư ở đây đã mấy chục năm. Ngươi mới bắt đầu tu tiên à? Để ta chỉ cho ngươi vài điều cơ bản.',
    greetingAge: {
      80: '(nhìn ngươi không nói gì lâu) Tám mươi năm tu tiên... Ít ai đến được đây mà không gục ngã. Dù cảnh giới có đến đâu — ngươi đã sống đúng hơn ta.',
      70: 'Bảy mươi tuổi... (im lặng dài) Ta dừng lại ở LK3 khi còn ba mươi. Ngươi kiên trì đến đây — đừng để ta hối hận thay ngươi ở chặng cuối.',
      60: '(nhìn ngươi kỹ một lúc) Năm nay ngươi khoảng sáu mươi rồi phải không? Còn thời gian. Đừng lãng phí như ta ngày xưa.',
    },
    greetingDV: {
      50:  'Tiểu hữu đã có danh tiếng rồi à? Tốt lắm! Người có danh thì dược liệu cũng dễ tìm hơn — mọi người sẵn sàng chia sẻ thông tin hơn.',
      150: 'Ồ! Ngươi bây giờ có tiếng trong vùng rồi! Lão phu có nhiều công thức hay muốn truyền lại — người có danh tiếng xứng đáng được học.',
      300: 'Tiểu hữu... không — đại nhân! Danh tiếng của ngươi đã vang xa! Lão phu mạn phép đề nghị ngươi thử mấy loại thảo dược hiếm ta vừa tìm được.',
      500: 'Lừng lẫy thiên hạ! Ngươi đến thật là rạng danh cho cả thôn này! Bất kỳ thứ gì ta có, ngươi cứ tự nhiên lấy dùng.',
    },
    options: [
      { label: '💬 Hỏi về thảo dược', action: 'lore', hint: 'Nghe lão nhân kể chuyện thảo dược' },
    ],
    lore: 'Đan dược là nền tảng tu tiên. Không có đan, tu tốc chậm như rùa. Hãy thu thập linh thảo ở vườn phía sau thôn trước đã.',
    questGive: 'sq_01_first_kill',
  },

  // ── Hỏa Diệm Thôn ────────────────────────────────────────────────────────
  dao_khach_gia: {
    name: 'Đao Khách Già', emoji: '⚔',
    greeting: 'Ta từng xông pha chiến trường suốt ba mươi năm. Ngươi muốn trở thành chiến binh? Trước hết phải nếm mùi máu thực chiến đã.',
    greetingAge: {
      80: '(đứng dậy, vỗ vai ngươi mạnh) Tám mươi năm không đầu hàng. Ngươi đã làm được điều ta không dám làm. Kính phục.',
      70: '(giọng trầm, nhìn ngươi lâu) Bảy mươi... Nhìn ngươi, ta thấy bóng hình của mình nếu ngày đó không bỏ cuộc. Tiếp tục đi — dù kết quả thế nào.',
      60: '(nhìn thẳng vào mắt ngươi) Ngươi đã sáu mươi. Ta bỏ cuộc ở LK8 năm ba mươi tuổi — vì sợ. Ngươi đừng lặp lại sai lầm của ta.',
    },
    greetingDV: {
      50:  'Ngươi bắt đầu có tiếng rồi đấy! Chiến binh chân chính phải xây dựng danh tiếng bằng máu và mồ hôi — ngươi đang đi đúng hướng.',
      150: 'Hừ! Lão phu nghe tên ngươi rồi. Không phải ai cũng làm được những gì ngươi đã làm. Ngồi xuống, ta có chuyện muốn nói thẳng.',
      300: 'Ngươi... bây giờ mạnh hơn ta hồi trẻ rồi. Danh tiếng đó không tự nhiên mà có. Lão phu kính phục.',
      500: '(Đao Khách Già đứng dậy, cúi đầu) Đại danh lừng lẫy — ta chưa bao giờ làm vậy với ai, nhưng ngươi xứng đáng. Kiếm này ta muốn tặng ngươi.',
    },
    options: [
      { label: '💬 Hỏi về vùng này', action: 'lore', hint: 'Nghe chuyện Hỏa Diệm Thôn' },
    ],
    lore: 'Hỏa Diệm Thôn rèn giũa người mạnh. Dung nham ngoài kia tuy nguy hiểm nhưng cũng là nơi luyện thép tốt nhất. Kiếm thuật không phải một sớm một chiều — phải luyện tập không ngừng.',
    questGive: 'sq_01_first_kill',
  },

  // ── Thanh Phong Thôn — Bà Nguyên ─────────────────────────────────────────
  ba_nguyen: {
    name: 'Bà Nguyên Trồng Trọt', emoji: '🌾',
    greeting: 'Ồ tiểu hữu, ngươi qua đây à? Ta đang dọn vườn đây. Tuổi già rồi, chậm hơn xưa. Nhưng đất không phụ người — ngươi biết không?',
    greetingAge: {
      80: '(ngồi xuống bờ vườn, im lặng một lúc) Ngươi đã sống đến đây. Dù đường còn bao xa — mỗi ngày là một bông hoa đã nở đúng mùa.',
      70: 'Bảy mươi tuổi — bằng tuổi ta khi bắt đầu vườn này. (nhìn cây cối) Mùa đông không phải thất bại của cây. Chỉ là một mùa khác.',
      60: '(nhìn ngươi từ vườn rau) Ngươi cũng không còn trẻ nữa rồi. Mùa nào cũng có hoa nở hoa tàn — đừng tiếc khi mùa đổi.',
    },
    greetingDV: {
      50:  'À, ngươi đã có chút tiếng tăm rồi à? Nông dân chúng ta không quan tâm nhiều đến danh tiếng — nhưng biết ngươi là người tốt là đủ rồi.',
      150: 'Ngươi có tiếng thật rồi đấy. Nhưng nhìn tay ngươi — đã từng làm vườn chưa? Người mạnh không sợ đất bẩn mới đáng nể.',
      300: 'Ngươi bây giờ nổi danh đến mức ta nghe tận vườn này. Lạ thật. Đất vẫn mọc cỏ như thường — nhưng con người thì thay đổi.',
      500: 'Cháu... (Bà Nguyên cúi đầu nhẹ) Nổi danh đến đâu cũng nhớ trở về đất mà sống. Cây cao gió lớn — giữ lấy rễ mới lâu dài.',
    },
    options: [
      { label: '💬 Hỏi về trồng trọt', action: 'lore',      hint: 'Nghe bà lão kể chuyện đất và cây' },
      { label: '🌿 Hỏi về linh thảo',  action: 'lore_herb', hint: 'Bí quyết trồng linh thảo' },
    ],
    lore: 'Bảy mươi năm trồng trọt, ta thấy nhiều thứ. Đất tốt hay đất xấu không phải tự nhiên — do người ta vun trồng. Linh thảo cũng vậy, phải kiên nhẫn, phải hiểu từng loại đất mới thu hoạch được.',
    lore_herb: 'Linh thảo muốn tốt phải hợp đất, hợp nước, hợp linh khí. Vào mùa xuân gieo hạt gần nguồn nước linh, mùa thu thu hoạch khi sương muối chưa xuống. Ta trồng kiểu đó bảy mươi năm không sai bao giờ.',
  },

  // ── Vạn Linh Thị ─────────────────────────────────────────────────────────
  lao_thuong_nhan: {
    name: 'Lão Thương Nhân', emoji: '🧓',
    greeting: 'Hà hà, tiểu hữu lần đầu đến Vạn Linh Thị? Chợ lớn nhất Phàm Nhân Giới đấy. Mua bán gì cũng có, miễn là có tiền và có duyên.',
    greetingDV: {
      50:  'Ồ! Ta đã nghe tên ngươi rồi. Đến Vạn Linh Thị mà có chút danh tiếng thì được đối xử khác hẳn đấy — ta sẽ chỉ ngươi vài chỗ hàng tốt.',
      150: 'Hà hà hà! Vị tu sĩ nổi danh đã đến chợ ta rồi! Hôm nay nhất định ăn uống no say, thương vụ thuận lợi. Ngươi muốn biết gì ta kể hết.',
      300: 'Đại nhân giá lâm! (vái tay) Tin đồn về ngươi lan khắp Vạn Linh Thị từ lâu. Gian hàng của ta hôm nay nhất định giảm giá đặc biệt cho ngươi.',
      500: '(Lão Thương Nhân đứng dậy, vẻ mặt kính cẩn) Lừng lẫy thiên hạ... ngươi đích thân đến đây, cả chợ sẽ xôn xao hết. Có gì ngươi cần, ta lo hết!',
    },
    options: [
      { label: '💬 Hỏi về Vạn Linh Thị', action: 'lore',      hint: 'Nghe lão nhân kể chuyện chợ lớn' },
      { label: '🏪 Đến Cửa Hàng',         action: 'shop',      hint: 'Mở tab mua bán' },
      { label: '💡 Mách nước tu tiên',     action: 'lore_tip',  hint: 'Nghe bí quyết từ người kinh nghiệm' },
      { label: '⚠ Cạm bẫy chốn thị',      action: 'lore_trap', hint: 'Nghe thương nhân cảnh báo về nguy hiểm ẩn nơi chợ' },
    ],
    lore: 'Vạn Linh Thị là trung tâm thương mại lớn nhất Phàm Nhân Giới. Đây ta nghe tên từ Đấu Giá Trường đến Hội Thương Nhân. Tán tu muốn sinh tồn thì phải biết buôn bán — đan dược, nguyên liệu, thông tin, tất cả đều là hàng hóa.',
    lore_tip: 'Bí quyết lão phu dùng cả đời: Linh Thạch là máu của tu tiên. Đừng bao giờ tiêu hết. Giữ lại ít nhất một phần ba dự trữ phòng khi cần gấp mua đan phá cảnh.',
    lore_trap: 'Vạn Linh Thị hào nhoáng nhưng đầy cạm bẫy. Ta đã thấy tu sĩ mất sạch linh thạch vì tin lầm tên buôn giả. Thứ gì quá rẻ đều có vấn đề. Thứ gì không ai bán đều có lý do. Tán tu thông minh là người biết khi nào không nên mua — và không nên tin.',
  },

  // ── Hắc Phong Lâm ─────────────────────────────────────────────────────────
  san_nhan_gia: {
    name: 'Thợ Săn Già', emoji: '🏹',
    greeting: 'Người ngoài à? Hắc Phong Lâm không phải chỗ dạo chơi. Bước nhẹ đấy — Yêu Vương đang tuần rừng.',
    greetingDV: {
      50:  'Ngươi... nghe quen quen. Đã có chút tiếng tăm rồi à? Tốt. Người yếu bụng không sống được ở rừng này lâu đâu.',
      150: 'Hừ, ta nghe tên ngươi từ mấy tháng trước. Ở rừng lâu ngày thông tin ít nhưng đáng tin. Ngươi quả thật không phải kẻ thường.',
      300: 'Ngươi là... người ta đồn đại à? (nhíu mày) Hiếm khi ta phục ai, nhưng những gì ngươi làm... không tầm thường. Ngồi xuống đây, ta kể ngươi nghe chuyện rừng này.',
      500: 'Cả Hắc Phong Lâm đều biết tên ngươi — kể cả lũ Yêu Vương cũng nghe phong phanh. Ta thợ săn già này... mừng vì ngươi đứng phía bên kia.',
    },
    options: [
      { label: '💬 Hỏi về Hắc Phong Lâm', action: 'lore',        hint: 'Tìm hiểu bí mật khu rừng' },
      { label: '⚔ Săn Yêu Thú',            action: 'combat',      hint: 'Vào khu săn bắn' },
      { label: '⚠ Cảnh báo nguy hiểm',      action: 'lore_warn',   hint: 'Nghe thợ săn cảnh báo' },
      { label: '🐾 Đọc dấu vết yêu thú',    action: 'lore_track',  hint: 'Học cách nhận biết yêu thú từ dấu vết' },
    ],
    lore: 'Hắc Phong Lâm ẩn chứa nhiều bí mật hơn người ta nghĩ. Cây cổ thụ ngàn năm tích tụ linh khí âm — tốt để tu luyện âm thuộc tính, nhưng nguy hiểm với người tu dương. Hang Động Bí Ẩn sâu trong rừng — ta chưa bao giờ dám vào một mình.',
    lore_warn: 'Sào Huyệt Yêu Vương ở phía tây nam. Nếu ngươi chưa đến Nguyên Anh thì đừng có nghĩ đến việc vào đó. Ta đã thấy Kim Đan kỳ tu vào rồi không ra.',
    lore_track: 'Đọc dấu vết để sống sót: móng vuốt sâu trên vỏ cây là Hắc Mãnh Hổ — cỡ lớp 3. Mùi hôi nồng từ phía tây là Độc Mãng — đừng lại gần nếu chưa có giải độc đan. Cành gãy ngọn sạch là Cự Hùng đang đánh dấu lãnh địa — nguy hiểm nhất rừng này. Hiểu dấu vết mới biết cái gì né, cái gì săn.',
  },

  // ── Linh Dược Cốc ─────────────────────────────────────────────────────────
  duoc_su_ldc: {
    name: 'Già Dược Sư', emoji: '🌸',
    greeting: 'Khách lạ đến thăm Linh Dược Cốc? Vào đây đi, đừng giẫm lên Huyết Liên. Mấy nhánh đó trồng tốn ba năm đấy.',
    greetingDV: {
      50:  'Ta có nghe tên ngươi từ mấy người qua cốc tuần trước. Người có danh tiếng thường hiểu giá trị thảo dược hơn kẻ tầm thường — mời ngươi xem vườn.',
      150: 'Ồ! Ngươi là người được nhắc đến nhiều ở Vạn Linh Thị à? Ta ít ra ngoài nhưng cũng nghe. Thảo dược ta trồng có loại hiếm lắm — ngươi xứng đáng được biết.',
      300: 'Danh tiếng của ngươi... ta cảm nhận được. Người tu tiên mạnh thường mang theo luồng linh khí đặc biệt. Ngươi có muốn thử dùng mấy loại linh thảo cấp cao ta đang thử nghiệm không?',
      500: 'Ta đã sống ở cốc này mấy trăm năm, thấy không biết bao người đến rồi đi. Nhưng danh tiếng như ngươi... thật sự rất lâu mới gặp lại. Vào đây, ta có thứ muốn tặng.',
    },
    options: [
      { label: '💬 Hỏi về linh thảo',      action: 'lore',         hint: 'Học về thảo dược từ chuyên gia' },
      { label: '🌿 Thu Thập Dược Liệu',     action: 'gather',       hint: 'Vào khu thu thập' },
      { label: '⚗ Bí quyết luyện đan',     action: 'lore_dan',     hint: 'Nghe bí quyết từ dược sư' },
      { label: '⚠ Sai lầm của người mới',   action: 'lore_caution', hint: 'Nghe dược sư cảnh báo về sai lầm phổ biến' },
    ],
    lore: 'Linh Dược Cốc là thánh địa thảo dược. Huyết Khí ở đây đặc biệt — thảo dược lớn nhanh hơn bên ngoài gấp mấy lần. Vạn Niên Huyết Liên... ta chỉ thấy nó nở một lần trong đời. Cần đủ cơ duyên mới gặp được.',
    lore_dan: 'Luyện đan thất bại chủ yếu vì hai lý do: lửa đan không đều hoặc tỷ lệ nguyên liệu sai. Đan lò tốt hơn quan trọng hơn công thức lạ. Đừng vội thử công thức khó khi lò chưa đủ cấp.',
    lore_caution: 'Người mới hay mắc một lỗi: thu thập đủ loại thảo dược rồi nhét hết vào một mẻ đan. Dược liệu tương khắc sẽ làm nổ lò — hoặc tệ hơn là đan thành công nhưng bên trong chứa độc. Mỗi công thức chỉ dùng đúng những gì nó cần. Không nhiều hơn, không ít hơn.',
  },

  // ── Thiên Kiếp Địa ────────────────────────────────────────────────────────
  di_dan_tien_nhan: {
    name: 'Di Dân Tiền Nhân', emoji: '👁',
    greeting: '...Ngươi... có thể thấy ta? (giọng mơ hồ như từ xa vọng lại) Đã lâu lắm rồi không có người đến đây mà không bị lôi trận đánh cho chạy ngược.',
    greetingDV: {
      50:  '...Ngươi đã có chút danh tiếng trong thế gian. Ta ở đây quá lâu, không còn quan tâm thế sự. Nhưng người như ngươi... ta muốn nói đôi lời.',
      150: '...Danh tiếng của ngươi... đã vang vào cả cõi này. Lạ lắm. Ngươi chắc chắn không phải người thường — hãy hỏi ta bất cứ điều gì.',
      300: '(bóng hình trở nên rõ hơn một chút) Ngươi... mạnh hơn ta đã nghĩ. Ở cảnh giới này mà đã có danh tiếng như vậy. Ta ngày xưa cũng như ngươi...',
      500: '(Di Dân Tiền Nhân lần đầu tiên nhìn thẳng vào mắt ngươi) Lừng lẫy thiên hạ... ngươi đã đạt được điều ta chưa bao giờ làm được trước khi rơi vào đây. Hãy nghe ta nói — đây là điều quan trọng nhất ngươi cần biết.',
    },
    options: [
      { label: '💬 Hỏi về Thiên Kiếp Địa', action: 'lore',         hint: 'Tìm hiểu vùng đất hỗn loạn' },
      { label: '👁 Hỏi về danh tính hắn',   action: 'lore_identity', hint: 'Hắn là ai?' },
      { label: '⚡ Bí ẩn lôi trận',          action: 'lore_lei',      hint: 'Nghe về sức mạnh sấm sét' },
    ],
    lore: 'Thiên Kiếp Địa... vốn là chiến trường cũ của một cuộc đại chiến ngàn năm trước. Linh khí hỗn loạn vì ý niệm chiến đấu của hàng vạn tu sĩ ngã xuống đây vẫn chưa tan. Tốt để tu luyện — nếu ngươi đủ mạnh để không bị cuốn vào.',
    lore_identity: 'Ta là... ai? (im lặng dài) Ta từng là tu sĩ Kim Đan, đến đây tu luyện. Rồi lôi trận đánh trúng trong lúc đột phá. Thân xác mất, linh hồn vướng lại đây. Đã... không nhớ bao nhiêu năm rồi.',
    lore_lei: 'Lôi trận ở Lôi Trì — đó là linh khí sấm sét thuần túy nhất Phàm Nhân Giới có thể tiếp xúc. Tu luyện ở đó nguy hiểm nhưng hiệu quả gấp bội. Nếu ngươi có căn cơ sấm sét... đây là thánh địa của ngươi.',
  },

  // ── Địa Phủ Môn ───────────────────────────────────────────────────────────
  canh_binh_dia_phu: {
    name: 'Canh Binh Địa Phủ', emoji: '💀',
    greeting: '... (im lặng, ánh mắt rỗng không nhìn qua ngươi) Muốn vào? Vào thì vào. Nhưng đừng trách ta không cảnh báo.',
    greetingDV: {
      50:  '...(nhìn ngươi một lúc) Có chút danh tiếng. Không quan trọng ở đây. Bên trong Địa Phủ, kẻ mạnh nhất cũng có thể chết ở tầng 3.',
      150: '...Ngươi có danh tiếng bên ngoài. Tốt. Kẻ tự tin thường chết nhanh hơn ở đây. Hãy nhớ điều đó.',
      300: '(Canh Binh nhìn ngươi lâu hơn thường lệ) Ngươi... không phải kẻ thường. Ít người có danh tiếng như vậy mà còn dám bước vào đây. Ta tôn trọng điều đó — nhưng Địa Phủ không tôn trọng gì hết.',
      500: '(giọng trở nên ít lạnh hơn một chút) Lừng lẫy... ta phục vụ Địa Phủ mấy ngàn năm, nghe nhiều tên lắm. Tên ngươi... ta cũng nghe rồi. Hãy cẩn thận bên trong — không phải vì ngươi yếu, mà vì Địa Phủ không tha ai.',
    },
    options: [
      { label: '💬 Hỏi về Địa Phủ',       action: 'lore',        hint: 'Tìm hiểu về dungeon nguy hiểm' },
      { label: '☠ Vào Địa Phủ',            action: 'dungeon',     hint: 'Bước vào Thiên Ma Địa Phủ' },
      { label: '⚠ Nghe cảnh báo',           action: 'lore_warn',   hint: 'Canh binh cảnh báo gì?' },
      { label: '🏛 Về các tầng sâu hơn',    action: 'lore_floors', hint: 'Hỏi về cấu trúc các tầng bên dưới' },
    ],
    lore: 'Thiên Ma Địa Phủ có 10 tầng. Mỗi tầng là một thế giới riêng — địa hình, yêu ma, quy tắc đều khác nhau. Nhiều tu sĩ vào đây tìm loot rồi không ra. Loot thật sự hiếm — nguy hiểm thật sự nhiều.',
    lore_warn: 'Đừng tham lam. Nhiều kẻ chết vì ở lại quá lâu sau khi đã thắng. Khi HP còn 30% — ra ngay. Không có loot nào đáng hơn mạng sống. Và đừng bao giờ chiến đấu với hơn một kẻ địch cùng lúc nếu có thể tránh.',
    lore_floors: 'Tầng 1-3 — ma quân thường, LK hậu kỳ đủ sức nếu không liều. Tầng 4-6 — ma quân đặc biệt, cần Trúc Cơ. Tầng 7-9 — ta không biết. Không ai từng bảo ta chuyện gì ở đó. Tầng 10 — truyền thuyết. Không ai từng quay về kể lại.',
  },

  // ── Ẩn Long Động ──────────────────────────────────────────────────────────
  linh_nhan_co_dong: {
    name: 'Linh Nhân Cổ Động', emoji: '🧝',
    greeting: 'Khách từ xa đến... (giọng trầm, cổ xưa) Long Uyên không chào đón người yếu lòng. Nhưng ngươi đã đến được đây — nghĩa là có cơ duyên.',
    greetingDV: {
      50:  'Danh tiếng nhỏ... nhưng bắt đầu. Ta trông coi nơi này từ khi Long Uyên còn là biển lửa, biết được người nào có tiềm năng và người nào không. Ngươi — có tiềm năng.',
      150: 'Danh tiếng của ngươi vang đến cả nơi u tịch này. Linh nhan cổ động như ta ít khi để ý thế sự — nhưng người nổi danh thường mang theo vận khí mạnh. Ta cảm nhận được.',
      300: 'Hmm... (ngước nhìn ngươi) Vận khí của ngươi rất đặc biệt. Không nhiều người đạt danh tiếng ở cảnh giới này mà linh căn vẫn còn thuần. Ngươi xứng đáng biết bí mật của Long Uyên.',
      500: '(Linh Nhân cúi đầu — điều chưa từng xảy ra) Lừng lẫy thiên hạ trong khi còn ở Phàm Nhân Giới... ngươi có thể trở thành người vĩ đại nhất từng bước qua Ẩn Long Động. Ta tôn trọng ngươi.',
    },
    options: [
      { label: '💬 Hỏi về Ẩn Long Động',   action: 'lore',          hint: 'Tìm hiểu bí mật động phủ' },
      { label: '🐉 Hỏi về Long Uyên',       action: 'lore_long',     hint: 'Bí ẩn của vực rồng' },
      { label: '🧘 Tu luyện tại đây',        action: 'cultivate',     hint: 'Tận dụng linh khí Động Phủ' },
      { label: '⚠ Nguy hiểm của Long Uyên', action: 'lore_danger',   hint: 'Nghe cảnh báo về vực rồng' },
    ],
    lore: 'Ẩn Long Động là một trong những nơi linh khí đậm đặc nhất Phàm Nhân Giới — vì Long Uyên bên trong. Rồng là sinh vật thuần linh khí, hàng ngàn năm tích lũy biến cả vùng thành Động Phủ cấp cao nhất. Chỉ người có duyên mới tìm được đường vào.',
    lore_long: 'Long Uyên — vực rồng cổ đại. Không có rồng thật ở đó nữa, chỉ còn lại linh khí mà rồng để lại sau khi hóa trời. Nhưng linh khí đó vẫn còn sức mạnh khủng khiếp. Tu luyện ở đó với Động Phủ buff... hiếm có nơi nào bằng ở Phàm Nhân Giới.',
    lore_danger: 'Long Uyên thu hút người vì linh khí mạnh — nhưng cũng vì vậy mà căn cơ yếu sẽ bị linh khí xé nát từ bên trong. Tu sĩ LK thấp kỳ vào đó như đổ nước vào bình đã đầy — áp lực vỡ ra theo hướng ngươi không muốn. Phải có nền tảng nhất định mới an toàn ở đây.',
  },

  // ── Hàn Băng Thôn ────────────────────────────────────────────────────────
  an_tu_bang: {
    name: 'Ẩn Tu Băng', emoji: '🧘',
    greeting: 'Tiểu hữu có vẻ còn non nớt. Hàn Băng Thôn lạnh giá nhưng linh khí dày đặc — đây là nơi tốt để bắt đầu tu luyện. Ngươi muốn hỏi điều gì?',
    greetingAge: {
      80: '(mở mắt, gật đầu nhẹ) Tám mươi năm tu tiên. Ngươi đã đi rất xa. Bất kể đường phía trước thế nào — đây là một cuộc đời đáng sống.',
      70: 'Bảy mươi rồi à. Ta dừng ở LK9 khi còn trẻ hơn ngươi — không phải vì bị ép, mà vì hiểu bản thân. Ngươi đã tự hỏi điều đó chưa?',
      60: '(không nói gì ngay, nhìn ngươi một lúc) Ngươi đang ở độ tuổi quan trọng. Điều quan trọng hơn đột phá là biết mình thực sự muốn gì.',
    },
    greetingDV: {
      50:  'Ngươi đã bắt đầu có chút danh phận. Tốt — người tu tiên cần được thế gian biết đến, không phải vì kiêu ngạo mà vì trách nhiệm.',
      150: 'Ta cảm nhận được... ngươi đã trưởng thành nhiều. Danh tiếng ngươi đến tai ta ngay cả trong thiền định. Thế giới tu tiên cần người như ngươi.',
      300: 'Hmm. (mở mắt) Ngươi đến rồi à. Ta đã thiền định chờ ngươi — Tâm Cảnh ta mách bảo có người nổi danh sẽ đến hỏi đạo hôm nay.',
      500: '(Ẩn Tu Băng từ từ mở mắt, ánh mắt ấm áp lạ thường) Danh tiếng của ngươi vang tới cả trong cõi thiền. Ngươi xứng đáng biết điều ta chưa từng nói với ai...',
    },
    options: [
      { label: '💬 Hỏi về vùng này',      action: 'lore',          hint: 'Tìm hiểu Hàn Băng Thôn' },
      { label: '🧘 Hỏi về thiền định',     action: 'lore_meditate', hint: 'Bí quyết bế quan từ ẩn tu' },
      { label: '❄ Hỏi về con đường tu',   action: 'lore_path',     hint: 'Nghe ông kể về hành trình tu tiên của mình' },
    ],
    lore: 'Hàn Băng Thôn lạnh giá quanh năm vì linh khí băng tụ lại từ ngàn năm. Tốt cho tu luyện thủy hệ và thiền định. Nhưng yêu thú băng cũng mạnh hơn những nơi khác — hãy cẩn thận.',
    lore_meditate: 'Thiền định không phải ngồi cho yên. Là để tâm trí thật sự buông xuống — không lo sắp tới, không tiếc đã qua. Khi ngươi đạt được trạng thái đó, linh khí tự chảy vào. Không cần gắng sức, chỉ cần buông.',
    lore_path: 'Ta tu đến Luyện Khí tầng 9. Rồi dừng. Không phải vì không thể — mà vì ta hiểu bản thân mình. Biết mình đến đâu là đủ, đó cũng là một loại trí tuệ. Không phải ai cũng có thể Trúc Cơ — và không phải ai dừng lại đều là thất bại.',
  },
};

function _showNpcDialog(G, loc, actions) {
  const npcId  = loc.npcId || 'unknown';
  const npc    = NPC_DIALOGS[npcId];
  const name   = loc.name || npc?.name || 'NPC';
  const emoji  = npc?.emoji || '👤';

  // Kiểm tra NPC có quest muốn giao không
  const pendingQuest = getNpcPendingQuest(G, npcId);

  // Chọn greeting theo Danh Vọng
  const dv = G.danhVong ?? 0;
  let greeting = npc?.greeting || 'Chào tiểu hữu, ta có thể giúp gì cho ngươi?';
  if (npc?.greetingDV) {
    const thresholds = Object.keys(npc.greetingDV).map(Number).sort((a,b) => b-a);
    for (const t of thresholds) {
      if (dv >= t) { greeting = npc.greetingDV[t]; break; }
    }
  }

  // DV tier badge nếu đủ nổi danh
  const dvBadge = dv >= 150
    ? `<div style="font-size:10px;color:#f0d47a;margin-top:3px">
         🌟 NPC biết danh tiếng của ngươi
       </div>`
    : '';

  // L6 — H3: Rep tier badge + progress bar
  const repInfo = getNpcRepInfo(G, npcId);
  const repBarHtml = (() => {
    const { rep, tierName, nextThreshold, tierMin } = repInfo;
    const tierColors = ['#a0a0b0', '#7fc87a', '#4ab8d8', '#d4a843', '#e86c3a'];
    const tierColor  = tierColors[repInfo.tierIdx] ?? '#a0a0b0';
    if (nextThreshold === null) {
      return `<div class="npc-rep-bar-wrap" style="margin-top:4px;font-size:10px">
        <span style="color:${tierColor};font-weight:700">${tierName}</span>
        <span style="color:var(--text-dim);margin-left:4px">❆ Đã đạt tột đỉnh</span>
      </div>`;
    }
    const rangeSize = nextThreshold - tierMin;
    const progress  = rangeSize > 0 ? Math.min(100, ((rep - tierMin) / rangeSize) * 100) : 100;
    return `<div class="npc-rep-bar-wrap" style="margin-top:4px">
      <div style="display:flex;align-items:center;gap:5px;font-size:10px">
        <span style="color:${tierColor};font-weight:700">${tierName}</span>
        <span style="color:var(--text-dim)">${rep}/${nextThreshold}</span>
      </div>
      <div style="height:3px;background:#1a1a2e;border-radius:2px;margin-top:2px;overflow:hidden">
        <div style="height:100%;width:${progress.toFixed(1)}%;background:${tierColor};border-radius:2px;transition:width 0.3s"></div>
      </div>
    </div>`;
  })();

  // Nếu NPC có quest → greeting ưu tiên đề cập đến việc muốn nhờ
  const questGreeting = pendingQuest
    ? greeting + '<br><br><em style="color:#f0d47a">「Ta có việc muốn nhờ ngươi...」</em>'
    : greeting;

  // S8 — Age-reactive remark (LK only, greetingAge map trong NPC_DIALOGS)
  let ageRemark = '';
  if (G.realmIdx === 0 && npc?.greetingAge) {
    const year = Math.floor(G.gameTime?.currentYear ?? 0);
    const thresholds = Object.keys(npc.greetingAge).map(Number).sort((a,b) => b-a);
    for (const t of thresholds) {
      if (year >= t) { ageRemark = npc.greetingAge[t]; break; }
    }
  }
  const dialogHtml = ageRemark
    ? `"${questGreeting}"<div class="npc-age-remark">「${ageRemark}」</div>`
    : `"${questGreeting}"`;

  // Nút nhận quest từ NPC (chỉ hiện khi NPC có quest)
  const npcQuestBtn = pendingQuest
    ? `<button class="npc-opt-btn npc-opt-quest" data-action="receive_npc_quest" title="${pendingQuest.name}">
         📜 Nghe Việc Nhờ — ${pendingQuest.name}
       </button>`
    : '';

  // L7 — H3: Tier-based reputation reward buttons
  const repTierBtns = (() => {
    const rewards = NPC_REWARDS[npcId];
    if (!rewards) return '';
    const repTier  = repInfo.tierIdx;  // 0-4
    const btns = [];

    // Tier 2 (rep ≥ 50, Tin Cậy): Mở vùng đất bí mật
    if (repTier >= 2 && rewards.tier2_secret) {
      const { zoneId, label, hint } = rewards.tier2_secret;
      const alreadyUnlocked = G.flags?.unlockedSecretZones?.[zoneId];
      if (alreadyUnlocked) {
        btns.push(`<button class="npc-opt-btn" data-action="rep_secret_info" data-zoneid="${zoneId}" style="opacity:0.65" title="${hint}">
          ✅ ${label} — Đã mở khóa
        </button>`);
      } else {
        btns.push(`<button class="npc-opt-btn npc-opt-secret" data-action="unlock_secret_zone" data-zoneid="${zoneId}" title="${hint}">
          🗝 Hỏi về vùng đất bí mật: ${label}
        </button>`);
      }
    }

    // Tier 3 (rep ≥ 80, Tâm Giao): Nhận quà — 1 lần
    if (repTier >= 3 && rewards.tier3_gift) {
      const { label, emoji: giftEmoji, once } = rewards.tier3_gift;
      const alreadyClaimed = G._npcGiftClaimed?.[npcId];
      if (!alreadyClaimed) {
        btns.push(`<button class="npc-opt-btn npc-opt-gift" data-action="claim_npc_gift" title="Quà hiếm từ ${name} — chỉ tặng 1 lần">
          ${giftEmoji} Nhận quà từ ${name}: ${label}
        </button>`);
      } else {
        btns.push(`<button class="npc-opt-btn" style="opacity:0.55" disabled title="Đã nhận">
          ✅ ${giftEmoji} ${label} — Đã nhận
        </button>`);
      }
    }

    // Tier 4 (rep = 100, Khẩu Khẩu): Bái sư
    if (repTier >= 4 && rewards.tier4_buff) {
      const { label: buffLabel, desc: buffDesc } = rewards.tier4_buff;
      const alreadyBai    = G._npcKhauKhau?.[npcId];
      const kkGate        = checkKhauKhauGate(G, npcId);
      if (alreadyBai) {
        btns.push(`<button class="npc-opt-btn" style="opacity:0.65" disabled title="${buffDesc}">
          ✨ ${buffLabel} — Đã bái sư
        </button>`);
      } else if (!kkGate.ok) {
        btns.push(`<button class="npc-opt-btn" style="opacity:0.45" disabled title="${kkGate.msg}">
          🚫 Bái Sư Khẩu Khẩu — ${kkGate.msg}
        </button>`);
      } else {
        btns.push(`<button class="npc-opt-btn npc-opt-khaukhau" data-action="bai_su_khau_khau" title="${buffDesc}">
          🙏 Bái Sư Khẩu Khẩu — ${buffLabel}
        </button>`);
      }
    }

    return btns.join('');
  })();

  const existing = document.getElementById('modal-npc-dialog');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-npc-dialog';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box npc-dialog-box">
      <div class="npc-dialog-header">
        <span class="npc-dialog-emoji">${emoji}</span>
        <div style="flex:1;min-width:0">
          <div class="npc-dialog-name">${name}</div>
          <div class="npc-dialog-role" style="font-size:10px;color:var(--text-dim)">${loc.desc||''}</div>
          ${dvBadge}
          ${repBarHtml}
        </div>
      </div>
      <div class="npc-dialog-text" id="npc-dialog-text">
        ${dialogHtml}
      </div>
      <div class="npc-dialog-options" id="npc-dialog-opts">
        ${npcQuestBtn}
        ${(npc?.options||[{label:'📜 Xem Nhiệm Vụ', action:'quests'}]).map(opt => `
          <button class="npc-opt-btn" data-action="${opt.action}" title="${opt.hint||''}">
            ${opt.label}
          </button>`).join('')}
        ${repTierBtns}
        <button class="npc-opt-btn npc-opt-close" data-action="close">🚪 Tạm Biệt</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  modal.querySelectorAll('.npc-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.action;
      if (act === 'close') { modal.remove(); return; }

      // S-D: Nhận quest từ NPC
      if (act === 'receive_npc_quest') {
        const result = giveQuestFromNPC(G, npcId);
        if (result.ok) {
          const q = result.quest;
          // Hiển thị hội thoại giao quest
          document.getElementById('npc-dialog-text').innerHTML =
            `"${q.lore}"<br><br><span style="color:#c8f09a;font-size:11px">📜 Nhiệm vụ <strong>${q.name}</strong> đã được nhận. Kiểm tra tab Nhiệm Vụ để theo dõi.</span>`;
          modal.querySelectorAll('.npc-opt-btn:not(.npc-opt-close)').forEach(b => b.remove());
          if (actions?.toast) actions.toast(`📜 Nhận nhiệm vụ: ${q.name}`, 'jade');
        } else {
          document.getElementById('npc-dialog-text').innerHTML =
            `"${result.msg}"`;
          modal.querySelectorAll('.npc-opt-btn:not(.npc-opt-close)').forEach(b => b.remove());
        }
        return;
      }

      if (act === 'lore' || act.startsWith('lore_')) {
        // Hiển thị lore variant, ẩn tất cả nút option (trừ nút đóng)
        const loreText = npc?.[act] || npc?.lore || '';
        document.getElementById('npc-dialog-text').textContent = `"${loreText}"`;
        modal.querySelectorAll('.npc-opt-btn:not(.npc-opt-close)').forEach(b => b.remove());
        return;
      }

      if (act === 'give_first_quest') {
        // Cập nhật progress talk_npc → checkCompletions → hoàn thành sq_00
        // → completeQuest tự unlock sq_01 qua rewards.unlockQuest
        if (actions.updateQuest) {
          actions.updateQuest('talk_npc', { target: 'elder', qty: 1 });
        }
        // Hiện hội thoại kết thúc, ẩn các nút option
        document.getElementById('npc-dialog-text').textContent =
          '"Tốt lắm! Hãy ra Rừng Ven Thôn phía nam để rèn giũa bản thân. Diệt một con yêu thú rồi quay lại báo cáo ta."';
        modal.querySelectorAll('.npc-opt-btn:not(.npc-opt-close)').forEach(b => b.remove());
        return;
      }

      // L7 — H3: Secret zone info (already unlocked)
      if (act === 'rep_secret_info') {
        const rewards = NPC_REWARDS[npcId];
        const { label, hint } = rewards?.tier2_secret || {};
        document.getElementById('npc-dialog-text').innerHTML =
          `"${label} đã được mở khóa. ${hint || ''} Đến đó trên bản đồ thế giới để thu thập nguyên liệu."`;
        modal.querySelectorAll('.npc-opt-btn:not(.npc-opt-close)').forEach(b => b.remove());
        return;
      }

      // L7 — H3: Mở khóa secret zone (Tier 2, rep ≥ 50)
      if (act === 'unlock_secret_zone') {
        const rewards = NPC_REWARDS[npcId];
        const { zoneId, label, hint } = rewards?.tier2_secret || {};
        if (!zoneId) return;
        if (!G.flags) G.flags = {};
        if (!G.flags.unlockedSecretZones) G.flags.unlockedSecretZones = {};
        G.flags.unlockedSecretZones[zoneId] = true;
        document.getElementById('npc-dialog-text').innerHTML =
          `"Tốt lắm tiểu hữu, ta đã tin tưởng ngươi. ${hint} — đường vào đã được mở."<br><br>` +
          `<span style="color:#d4a843;font-size:11px">🗝 Đã mở khóa: <strong>${label}</strong> — xuất hiện trên bản đồ thế giới.</span>`;
        modal.querySelectorAll('.npc-opt-btn:not(.npc-opt-close)').forEach(b => b.remove());
        if (actions?.toast) actions.toast(`🗝 Mở khóa bí cảnh: ${label}`, 'legendary');
        return;
      }

      // L7 — H3: Nhận quà từ NPC (Tier 3, rep ≥ 80, 1 lần)
      if (act === 'claim_npc_gift') {
        const rewards = NPC_REWARDS[npcId];
        const gift = rewards?.tier3_gift;
        if (!gift) return;
        if (!G._npcGiftClaimed) G._npcGiftClaimed = {};
        if (G._npcGiftClaimed[npcId]) {
          document.getElementById('npc-dialog-text').textContent = '"Ta đã trao tất cả những gì có thể trao rồi."';
          return;
        }
        // Trao vật phẩm
        let giftMsg = '';
        if (gift.type === 'inventory') {
          const item = ITEMS.find(i => i.id === gift.itemId);
          if (item) { addToInventory(G, item, gift.qty ?? 1); giftMsg = `${gift.emoji} ${gift.label} ×${gift.qty}`; }
        } else if (gift.type === 'special') {
          // Linh Mạch Đồ — synthetic item
          const item = ITEMS.find(i => i.id === gift.itemId)
            || { id: gift.itemId, name: gift.label, emoji: gift.emoji };
          addToInventory(G, item, gift.qty ?? 1);
          giftMsg = `${gift.emoji} ${gift.label} ×${gift.qty}`;
        } else if (gift.type === 'ingredient') {
          if (!G.alchemy) G.alchemy = { furnaceLevel:0, knownRecipes:[], ingredients:{}, craftsCount:0, successStreak:0 };
          if (!G.alchemy.ingredients) G.alchemy.ingredients = {};
          G.alchemy.ingredients[gift.itemId] = (G.alchemy.ingredients[gift.itemId] || 0) + (gift.qty ?? 1);
          giftMsg = `${gift.emoji} ${gift.label} ×${gift.qty} (vào kho vật liệu trận)`;
        } else if (gift.type === 'stat') {
          // Sprint 6 — direct stat boost (không phải item, là tâm pháp / kiến thức)
          const _statNames = { ngoTinh:'Ngộ Tính', tamCanh:'Tâm Cảnh', canCot:'Căn Cốt', khiVan:'Khí Vận' };
          const prev = G[gift.statKey] ?? 50;
          G[gift.statKey] = Math.min(100, prev + (gift.value ?? 0));
          giftMsg = `${gift.emoji} ${gift.label} — +${gift.value} ${_statNames[gift.statKey] || gift.statKey} (${prev.toFixed(1)}→${G[gift.statKey].toFixed(1)})`;
        }
        G._npcGiftClaimed[npcId] = true;
        document.getElementById('npc-dialog-text').innerHTML =
          `"Ngươi xứng đáng được nhận thứ này. Hãy dùng tốt."<br><br>` +
          `<span style="color:#d4a843;font-size:11px">🎁 Nhận được: <strong>${giftMsg}</strong></span>`;
        modal.querySelectorAll('.npc-opt-btn:not(.npc-opt-close)').forEach(b => b.remove());
        if (actions?.toast) actions.toast(`🎁 Nhận quà: ${giftMsg}`, 'legendary');
        return;
      }

      // L7 — H3: Bái sư khẩu khẩu (Tier 4, rep = 100)
      if (act === 'bai_su_khau_khau') {
        const rewards = NPC_REWARDS[npcId];
        const buff = rewards?.tier4_buff;
        if (!buff) return;
        const gate = checkKhauKhauGate(G, npcId);
        if (!gate.ok) {
          if (actions?.toast) actions.toast(gate.msg, 'danger');
          return;
        }
        // Hiện confirm dialog
        document.getElementById('npc-dialog-text').innerHTML =
          `"Ngươi thực sự muốn bái ta làm sư phụ khẩu khẩu? Đây là lựa chọn vĩnh viễn — ngươi sẽ không thể bái sư NPC khác trong lần tu tiên này."<br><br>` +
          `<span style="color:#e86c3a;font-size:11px">⚠ Buff vĩnh viễn: ${buff.desc}</span>`;
        modal.querySelectorAll('.npc-opt-btn:not(.npc-opt-close)').forEach(b => b.remove());
        // Thêm nút confirm
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'npc-opt-btn npc-opt-khaukhau';
        confirmBtn.dataset.action = 'confirm_khau_khau';
        confirmBtn.textContent = '🙏 Xác Nhận Bái Sư — Không Thể Đổi';
        document.getElementById('npc-dialog-opts').appendChild(confirmBtn);
        // Listener cho nút confirm
        confirmBtn.addEventListener('click', () => {
          applyKhauKhauBuff(G, npcId);
          document.getElementById('npc-dialog-text').innerHTML =
            `"Tốt. Từ nay ngươi là đệ tử khẩu khẩu của ta."<br><br>` +
            `<span style="color:#e86c3a;font-size:11px">❆ Buff đã kích hoạt: ${buff.label}</span>`;
          confirmBtn.remove();
          if (actions?.toast) actions.toast(`🙏 Bái sư thành công! ${buff.label}`, 'legendary');
        });
        return;
      }

      modal.remove();
      actions.switchTab(act);
    });
  });

  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// ============================================================
// DRAG SUPPORT
// ============================================================
export function _setupDrag(svgId) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  let drag = false, sx=0, sy=0, ox=0, oy=0;
  const g = svg.querySelector('g') || svg;

  // Get current transform
  let tx = 0, ty = 0;

  svg.addEventListener('mousedown', e => {
    if (e.target.closest('.wnode,.znode')) return; // let node clicks through
    drag = true; sx = e.clientX; sy = e.clientY; ox = tx; oy = ty;
    svg.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    tx = ox + (e.clientX - sx);
    ty = oy + (e.clientY - sy);
    // Clamp
    tx = Math.max(-200, Math.min(200, tx));
    ty = Math.max(-150, Math.min(150, ty));
    svg.style.transform = `translate(${tx}px,${ty}px)`;
  });
  window.addEventListener('mouseup', () => {
    drag = false; svg.style.cursor = 'grab';
  });

  // Touch support
  svg.addEventListener('touchstart', e => {
    const t = e.touches[0];
    drag = true; sx = t.clientX; sy = t.clientY; ox = tx; oy = ty;
  }, {passive:true});
  window.addEventListener('touchmove', e => {
    if (!drag) return;
    const t = e.touches[0];
    tx = Math.max(-200, Math.min(200, ox + (t.clientX - sx)));
    ty = Math.max(-150, Math.min(150, oy + (t.clientY - sy)));
    svg.style.transform = `translate(${tx}px,${ty}px)`;
  }, {passive:true});
  window.addEventListener('touchend', () => { drag = false; });
}

// ============================================================
// TÂN THỦ THÔN — 4 thôn khởi đầu ngẫu nhiên
// ============================================================
export const STARTER_VILLAGES = [
  {
    id: 'thanh_phong_thon',
    name: 'Thanh Phong Thôn',
    emoji: '🌿',
    desc: 'Thôn yên bình dưới chân Thanh Vân Sơn. Linh khí thanh tú.',
    bg: 'linear-gradient(160deg,#051a05 0%,#0a2a0a 60%,#051505 100%)',
    color: '#56c46a',
    nearZone: 'thanh_van_son',
    bonus: 'herbs',
    bonusDesc: 'Thiên về thảo dược — dễ tiếp cận vườn linh thảo trong thôn',
    locations: [
      { id: 'sv_npc_elder',    name: 'Lão Dược Sư', emoji: '👴', x:200, y:140, type:'npc',
        desc: 'Lão nhân am hiểu thảo dược. Giao quest cho tân thủ.',
        npcId: 'lao_duoc_su' },
      { id: 'sv_npc_ba_nguyen', name: 'Bà Nguyên', emoji: '🌾', x:300, y:155, type:'npc',
        desc: 'Bà lão trồng linh thảo bảy mươi năm. Biết nhiều về dược điền và thổ nhưỡng.',
        npcId: 'ba_nguyen' },
      { id: 'sv_shop',         name: 'Tiệm Tạp Hóa', emoji: '🏪', x:390, y:140, type:'market',
        desc: 'Cửa hàng nhỏ bán đồ cơ bản. Giá rẻ hơn phố lớn.' },
      { id: 'sv_forest',       name: 'Rừng Ven Thôn', emoji: '🌲', x:140, y:260, type:'hunt_zone',
        desc: 'Rừng nhỏ ven thôn, yêu thú yếu. Phù hợp tân thủ.',
        enemyTier: 1 },
      { id: 'sv_herb_field',   name: 'Thảo Dược Điền', emoji: '🌿', x:320, y:265, type:'gather_zone',
        desc: 'Vườn thảo dược tự nhiên. Linh Thảo và Ngọc Liên.' },
      { id: 'sv_exit',         name: 'Cổng Ra', emoji: '🚪', x:230, y:345, type:'exit',
        desc: 'Rời thôn, bước vào thế giới rộng lớn. Cần hoàn thành 1 quest trong thôn.' },
    ],
  },
  {
    id: 'hoa_diem_thon',
    name: 'Hỏa Diệm Thôn',
    emoji: '🔥',
    desc: 'Thôn nóng bức gần núi lửa. Người dân dũng cảm và mạnh mẽ.',
    bg: 'linear-gradient(160deg,#200500 0%,#3a0a00 60%,#150300 100%)',
    color: '#e05c1a',
    nearZone: 'thien_kiep_dia',
    bonus: 'atk',           // ATK khởi đầu cao hơn
    bonusDesc: 'ATK khởi đầu +10',
    locations: [
      { id: 'hd_npc_warrior', name: 'Đao Khách Già', emoji: '⚔', x:200, y:140, type:'npc',
        desc: 'Cựu chiến binh, dạy kỹ năng chiến đấu cơ bản.',
        npcId: 'dao_khach_gia' },
      { id: 'hd_shop',        name: 'Lò Rèn Nhỏ', emoji: '🔨', x:310, y:150, type:'market',
        desc: 'Bán vũ khí cơ bản. Giá rẻ, chất lượng trung bình.' },
      { id: 'hd_lava_field',  name: 'Dung Nham Ngoài', emoji: '🌋', x:140, y:250, type:'hunt_zone',
        desc: 'Vùng dung nham, Hỏa Thử và Hỏa Nha Trư sinh sống.',
        enemyTier: 1, element: 'huo' },
      { id: 'hd_ore_mine',    name: 'Mỏ Đá Linh', emoji: '⛏', x:320, y:260, type:'gather_zone',
        desc: 'Khai thác Hỏa Tinh Thạch và Huyền Thiết.' },
      { id: 'hd_exit',        name: 'Cổng Ra', emoji: '🚪', x:230, y:340, type:'exit',
        desc: 'Rời thôn. Cần hoàn thành 1 quest.' },
    ],
  },
  {
    id: 'han_bang_thon',
    name: 'Hàn Băng Thôn',
    emoji: '❄',
    desc: 'Thôn lạnh giá phía bắc. Cư dân sống ẩn dật, thiên về tu luyện.',
    bg: 'linear-gradient(160deg,#000a15 0%,#001530 60%,#000a15 100%)',
    color: '#87ceeb',
    nearZone: 'hac_phong_lam',
    bonus: 'rate',          // Tu luyện nhanh hơn ban đầu
    bonusDesc: '+0.5/s tốc độ tu luyện khởi đầu',
    locations: [
      { id: 'hb_npc_hermit', name: 'Ẩn Tu Băng', emoji: '🧘', x:200, y:140, type:'npc',
        desc: 'Ẩn tu sống cô độc, truyền dạy bí quyết bế quan.',
        npcId: 'an_tu_bang' },
      { id: 'hb_shop',       name: 'Tiệm Thuốc', emoji: '💊', x:310, y:150, type:'market',
        desc: 'Bán đan dược hồi phục. Chuyên hệ Thủy và Băng.' },
      { id: 'hb_ice_lake',   name: 'Hồ Băng', emoji: '🌊', x:140, y:250, type:'hunt_zone',
        desc: 'Hồ băng, Hải Sắc Xà và Băng Linh Thú sinh sống.',
        enemyTier: 1, element: 'bang' },
      { id: 'hb_cave',       name: 'Hang Tuyết', emoji: '🕳', x:320, y:260, type:'gather_zone',
        desc: 'Thu thập Băng Tinh Thể và Hàn Băng Thảo.' },
      { id: 'hb_exit',       name: 'Cổng Ra', emoji: '🚪', x:230, y:340, type:'exit',
        desc: 'Rời thôn. Cần hoàn thành 1 quest.' },
    ],
  },
  {
    id: 'lam_hai_thon',
    name: 'Lâm Hải Thôn',
    emoji: '🌊',
    desc: 'Thôn ven sông gần Linh Dược Cốc. Ngư dân và thảo dược sư.',
    bg: 'linear-gradient(160deg,#001520 0%,#002a3a 60%,#001020 100%)',
    color: '#3a9fd5',
    nearZone: 'linh_duoc_coc',
    bonus: 'stone',
    bonusDesc: 'Ven sông — ngư trường & thảo dược thủy hệ (linh thạch kiếm bằng việc làm, không tặng sẵn)',
    locations: [
      { id: 'lh_npc_fisherman', name: 'Lão Ngư Ông', emoji: '🎣', x:200, y:140, type:'npc',
        desc: 'Ngư ông kỳ lạ, biết nhiều bí mật dưới lòng sông.',
        npcId: 'lao_ngu_ong' },
      { id: 'lh_shop',          name: 'Chợ Cá', emoji: '🐟', x:310, y:150, type:'market',
        desc: 'Bán nguyên liệu từ sông và biển. Giá tốt.' },
      { id: 'lh_river',         name: 'Sông Linh', emoji: '🌊', x:140, y:250, type:'hunt_zone',
        desc: 'Sông linh khí, Thủy Trạch Ngạc sinh sống.',
        enemyTier: 1, element: 'shui' },
      { id: 'lh_herb_shore',    name: 'Bờ Thảo Dược', emoji: '🌿', x:320, y:260, type:'gather_zone',
        desc: 'Ven sông có nhiều Thủy Ngọc Hoa và Ngọc Liên hiếm.' },
      { id: 'lh_exit',          name: 'Cổng Ra', emoji: '🚪', x:230, y:340, type:'exit',
        desc: 'Rời thôn. Cần hoàn thành 1 quest.' },
    ],
  },
];

// Random thôn khi tạo nhân vật mới