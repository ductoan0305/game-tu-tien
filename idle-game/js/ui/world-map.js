// ============================================================
// ui/world-map.js — Map render (Tier1, Tier2)
// Location Popup → ui/location-popup.js
// Starter Village → ui/starter-village.js
// Sect Home → ui/sect-home.js
// ============================================================
import { bus } from '../utils/helpers.js';
import { addChronicle } from '../core/time-engine.js';
import { moveToPhapDia } from '../core/phap-dia.js';
import { calcMaxQi, calcQiRate, calcPurityThreshold, calcKienCoCeiling } from '../core/state.js';
import { getAvailableEnemies } from '../combat/combat-engine.js';
import { checkAmbush, getAvailableTargets, robTarget, getNghiepLucPenalty } from '../core/kiep-tu-engine.js';
import { STARTER_VILLAGES, _showLocationPopup, _setupDrag, _isLocLocked, _updateLocInfo } from './location-popup.js';
import PopupManager from './popup-manager.js';
import { renderStarterVillage, rollStarterVillage } from './starter-village.js';
import { renderSectHome } from './sect-home.js';
// Re-export để backward compat (các file khác import từ world-map.js)
export { renderStarterVillage, rollStarterVillage };
import { WORLD_NODES, ZONE_DATA, svgZoneLocLabel, svgWorldNodeName,
         FACTION_COLORS, KHUYETVUC_TERRITORIES,
         TERRITORY_INTERIORS,
         NHAN_GIOI_REGIONS,
         TRADE_ROUTES } from './map-data.js';
import {
  MAP_DEFS, renderTradeRoute,
  parchmentBackground, cloudBorder, agedSpots, vignette, renderStamp,
} from './map-defs.js';
import { REALM_NAMES } from '../core/constants.js';
// Re-export WORLD_NODES để backward compat
export { WORLD_NODES };
// ============================================================
// STATE quản lý map level hiện tại
// ============================================================
let _mapLevel = 1;           // 1=world, 2=zone
let _currentZoneId = null;
let _showingSectHome = true; // reset mỗi page-load; false sau khi player bấm sang zone map
let _showingKhuyetVuc = false; // true khi đang xem Khuyết Vực territory map
let _prevView = 'world';     // 'world' | 'khuyetvuc' | 'sect_home'

export function getCurrentNode(G) {
  const id = G.worldMap?.currentNodeId || 'thanh_van_son';
  return WORLD_NODES.find(n => n.id === id) || WORLD_NODES[0];
}

// ============================================================
// RENDER CHÍNH — quyết định hiển thị tầng nào
// ============================================================
export function renderWorldMap(G, actions) {
  const _wm = G.worldMap || {};
  console.log('[MAP POSITION]', {
    leftStarter:      _wm.leftStarter,
    currentNodeId:    _wm.currentNodeId,
    starterVillageId: _wm.starterVillageId,
    realmIdx:         G.realmIdx,
    stage:            G.stage,
    _showingSectHome,
    _showingKhuyetVuc,
    _mapLevel,
    _currentZoneId,
  });

  // Tân thủ thôn gate: player mới chưa rời làng → vào starter village
  if (!_wm.leftStarter) { renderStarterVillage(G, actions); return; }

  // Sect member: tab Tu Luyện luôn hiện sect home trừ khi đã bấm sang zone map
  if (G.sectId && _showingSectHome) {
    console.log('[MAP DEBUG] → renderSectHome:', G.sectId);
    renderSectHome(G, actions, () => {
      // Callback khi bấm "🗺 <Zone>" — chuyển sang zone map
      _showingSectHome  = false;
      _showingKhuyetVuc = false;
      _prevView         = 'sect_home';
      _mapLevel         = 2;
      _currentZoneId    = G.worldMap?.currentNodeId || null;
      console.log('[MAP DEBUG] → goToZoneMap:', _currentZoneId);
      renderTier2(G, actions, _currentZoneId);
    });
    return;
  }

  // Khuyết Vực territory map (between tier1 and tier2)
  if (_showingKhuyetVuc) {
    console.log('[MAP DEBUG] → renderKhuyetVucMap');
    renderKhuyetVucMap(G, actions);
    return;
  }

  // World map tier 1 / tier 2
  if (_mapLevel === 1) {
    console.log('[MAP DEBUG] → renderTier1');
    renderTier1(G, actions);
  } else if (_mapLevel === 2) {
    console.log('[MAP DEBUG] → renderTier2 zone:', _currentZoneId);
    renderTier2(G, actions, _currentZoneId);
  }
}

export function updateMapStats(G) {
  const rate = calcQiRate(G);
  const newText = G.meditating ? `${rate}/s 🧘` : `${rate}/s`;
  const newAge = G.gameTime ? String(Math.floor(G.gameTime.currentYear)) : '--';
  const newStone = Math.floor(G.stone || 0).toLocaleString();

  const setPair = (baseId, val) => {
    [document.getElementById(baseId), document.getElementById(`${baseId}-modal`)]
      .forEach(el => { if (el && el.textContent !== val) el.textContent = val; });
  };
  setPair('map-stat-rate', newText);
  setPair('map-stat-age', newAge);
  setPair('map-stat-stone', newStone);
}

// ============================================================
// TẦNG 1 — WORLD MAP
// ============================================================

// Nút Đột Phá — hiển thị khi đủ điều kiện, bao gồm cảnh báo purity và bottleneck
function _renderBreakthroughBtn(G) {
  const maxQi   = calcMaxQi(G);
  const pctFull = G.qi >= maxQi;
  const pctVal  = Math.floor(Math.min(100, (G.qi / Math.max(1, maxQi)) * 100));

  if (!pctFull) {
    return `<button id="btn-breakthrough" class="btn-breakthrough-map" disabled
      title="Tích lũy linh lực để đột phá (${pctVal}%)">
      ⚡ Đột Phá (${pctVal}%)
    </button>`;
  }

  // R4: Bottleneck check — hard gate trước purity (kienCo < required → blocked hoàn toàn)
  const isBottleneck = G.realmIdx === 0 && (G.stage === 3 || G.stage === 6 || G.stage === 9);
  const bnThresholds = { 3:40, 6:70, 9:90 };
  if (isBottleneck) {
    const bnRequired = bnThresholds[G.stage];
    const kienCo     = G.kienCo ?? 0;
    if (kienCo < bnRequired) {
      return `<button id="btn-breakthrough" class="btn-breakthrough-map"
        style="background:rgba(60,20,120,0.35);border:1px solid #7040c0;color:#b090ff;cursor:not-allowed"
        disabled
        title="Bình Cảnh — Linh lực chưa đủ vững. Kiên Cố ${Math.floor(kienCo)}/${bnRequired}. Rèn qua chiến đấu và nhiệm vụ.">
        ⚠ Bình Cảnh — Kiên Cố chưa đủ (${Math.floor(kienCo)}/${bnRequired})
      </button>`;
    }
  }

  // Qi đầy — kiểm tra purity
  const threshold = calcPurityThreshold(G);
  const purity    = G.purity ?? 0;
  const ratio     = purity / Math.max(1, threshold);
  const purityPct = Math.floor(ratio * 100);

  // Label/style bổ sung khi đã vượt bottleneck
  const bnLabel = isBottleneck ? ' 【Bình Cảnh】' : '';
  const bnStyle = isBottleneck ? 'box-shadow:0 0 8px #c084fc66;border-color:#c084fc;' : '';

  if (ratio < 0.5) {
    // Bị block hoàn toàn (doBreakthrough sẽ reject)
    return `<button id="btn-breakthrough" class="btn-breakthrough-map" disabled
      title="Thuần Độ chưa đủ tối thiểu 50% ngưỡng (${purityPct}%)">
      ⚡ Đột Phá (Thuần Độ ${purityPct}%)
    </button>`;
  }

  if (ratio < 0.75) {
    // NGUY HIỂM: allowed nhưng guaranteed fail (F_purity = 0.0 → chance = 0%)
    return `<button id="btn-breakthrough" class="btn-breakthrough-map btn-breakthrough-danger"
      title="CẢNH BÁO: Thuần Độ ${purityPct}% — xác suất đột phá = 0%! Sẽ mất Tâm Cảnh và tuổi thọ.">
      ⚠ Đột Phá (${purityPct}% — Guaranteed Fail!)
    </button>`;
  }

  if (ratio < 1.0) {
    // Thuần độ 75-99%: thấp nhưng có xác suất
    return `<button id="btn-breakthrough" class="btn-breakthrough-map btn-breakthrough-warn ready"
      style="${bnStyle}"
      title="Thuần Độ ${purityPct}%/100% ngưỡng${isBottleneck ? ' · Kiên Cố đã đủ' : ''} — có thể đột phá nhưng xác suất thấp">
      ⚡ Đột Phá (Thuần Độ ${purityPct}%)${bnLabel}
    </button>`;
  }

  // Đủ ngưỡng: sẵn sàng
  return `<button id="btn-breakthrough" class="btn-breakthrough-map ready"
    style="${bnStyle}"
    title="Thuần Độ ${purityPct}% — đủ điều kiện đột phá!${isBottleneck ? ' Đã vượt qua Bình Cảnh.' : ''}">
    ⚡ ĐỘT PHÁ — SẴN SÀNG!${bnLabel}
  </button>`;
}

// ============================================================
// KIẾP TU — UI helpers
// ============================================================

function _renderKiepTuPanel(G) {
  const targets = getAvailableTargets(G);
  const nl = G.kiepTu?.nghiepLuc ?? 0;
  const penalty = getNghiepLucPenalty(G);

  // Nghiệp Lực warning
  const nghiepHtml = nl > 0 ? `
    <div class="kt-nghiep-row ${nl >= 60 ? 'danger' : 'warning'}">
      <span class="kt-nghiep-label">${penalty.label}</span>
      <span class="kt-nghiep-value">Nghiệp Lực: ${Math.floor(nl)}/100</span>
      ${penalty.qiPenalty > 0 ? `<div class="kt-nghiep-penalty">⚡ Tu tốc -${Math.floor(penalty.qiPenalty*100)}%</div>` : ''}
    </div>` : '';

  // Nút chủ động cướp
  const targetsHtml = targets.length > 0 ? `
    <div class="kt-section">
      <div class="kt-section-title">🗡 Phục Kích</div>
      ${targets.map(t => `
        <div class="kt-target-row">
          <span class="kt-target-emoji">${t.emoji}</span>
          <div class="kt-target-main">
            <div class="kt-target-name">${t.name}</div>
            <div class="kt-target-desc">${t.desc}</div>
          </div>
          <button class="btn-kieptu-rob" data-target-id="${t.id}">
            🗡 Cướp
          </button>
        </div>`).join('')}
    </div>` : '';

  if (!targetsHtml && !nghiepHtml) return '';

  return `
    <div class="kt-panel">
      <div class="kt-title">劫修 Kiếp Tu</div>
      ${nghiepHtml}
      ${targetsHtml}
    </div>`;
}

// Popup cảnh báo bị phục kích — hiện trước khi vào combat
function _showAmbushAlert(G, kiepTu, actions) {
  const existing = document.getElementById('modal-ambush');
  if (existing) existing.remove();

  const isDoan = kiepTu.type === 'kiep_doan';
  const modal = document.createElement('div');
  modal.id = 'modal-ambush';

  modal.innerHTML = `
    <div class="ambush-card">
      <div class="ambush-emoji">${kiepTu.emoji}</div>
      <div class="ambush-title">
        ${isDoan ? '⚠ BỊ KIẾP ĐOÀN PHỤC KÍCH!' : '⚠ BỊ KIẾP TU CHẶN ĐƯỜNG!'}
      </div>
      <div class="ambush-name">${kiepTu.name}</div>
      <div class="ambush-desc">${kiepTu.desc}</div>
      ${isDoan ? `<div class="ambush-wave">Kiếp Đoàn ${kiepTu.waveCount} đợt sóng tấn công!</div>` : ''}
      <div class="ambush-loss">
        Thua → mất 20–40% linh thạch và 1 vật phẩm ngẫu nhiên
      </div>
      <div class="ambush-actions">
        <button id="btn-ambush-fight" class="btn-ambush-fight">
          ⚔ Nghênh Chiến
        </button>
        <button id="btn-ambush-flee" class="btn-ambush-flee">
          💨 Bỏ Chạy (-10% đá)
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  // Nghênh chiến → vào combat
  document.getElementById('btn-ambush-fight')?.addEventListener('click', () => {
    modal.remove();
    bus.emit('kieptu:start_combat', { kiepTu });
  });

  // Bỏ chạy → mất stone nhỏ, không combat
  document.getElementById('btn-ambush-flee')?.addEventListener('click', () => {
    modal.remove();
    const fleeLoss = Math.floor((G.stone || 0) * 0.10);
    G.stone = Math.max(0, (G.stone || 0) - fleeLoss);
    addChronicle(G, `Bỏ chạy khỏi ${kiepTu.name}, mất ${fleeLoss}💎.`);
    actions.toast(`💨 Bỏ chạy! Mất ${fleeLoss}💎`, 'danger');
    import('./tabs/../../ui/render-core.js').catch(() => {});
    bus.emit('map:moved', {});
    renderTier1(G, actions);
  });
}

// ctx: { mode:'panel'|'modal', svgSuffix:'', starterLocked:boolean }
function _buildTier1Html(G, ctx = {}) {
  const suf = ctx.svgSuffix || '';
  const isModal = ctx.mode === 'modal';
  const starterLocked = !!ctx.starterLocked;
  const statSuf = isModal ? '-modal' : '';
  const currentNodeId = G.worldMap?.currentNodeId || 'thanh_van_son';

  const connSvg = WORLD_NODES.flatMap(n =>
    (n.connections||[]).map(toId => {
      const to = WORLD_NODES.find(x=>x.id===toId);
      if (!to || to.id < n.id) return '';
      // Bezier control point — curve rõ lên giữa
      const mx = (n.x + to.x) / 2;
      const my = (n.y + to.y) / 2 - 55;
      // Kiểm tra đường đã unlock (cả 2 node accessible)
      // Current node không bao giờ locked — sect member luôn thấy đường về nhà
      const lockedN  = n.id !== currentNodeId  && (G.realmIdx < (n.unlockRealm||0)  || (n.unlockStage  && G.stage < n.unlockStage));
      const lockedTo = to.id !== currentNodeId && (G.realmIdx < (to.unlockRealm||0) || (to.unlockStage && G.stage < to.unlockStage));
      const pathUnlocked = !lockedN && !lockedTo;
      return `<path d="M${n.x},${n.y} Q${mx},${my} ${to.x},${to.y}"
        fill="none"
        stroke="${pathUnlocked ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)'}"
        stroke-width="1.5"
        ${pathUnlocked ? '' : 'stroke-dasharray="4 6"'}/>`;
    })
  ).join('');

  console.log('[MAP DEBUG] _buildTier1Html — currentNodeId =', currentNodeId, '| realmIdx =', G.realmIdx);
  const nodesSvg = WORLD_NODES.map(n => {
    const isCur  = n.id === currentNodeId;
    // Current node không bao giờ locked — sect member luôn thấy và vào được zone nhà
    const locked = !isCur && (
                   G.realmIdx < (n.unlockRealm||0) ||
                   (n.unlockStage && G.stage < n.unlockStage) ||
                   (n.needCoDuyen && !G.worldMap?.discovered?.[n.id]));
    console.log(`[MAP DEBUG]   node ${n.id}: isCur=${isCur}, locked=${locked}`);
    return `
      <g class="wnode${locked?' wnode-locked':''}" data-nid="${n.id}">
        <circle cx="${n.x}" cy="${n.y}" r="26"
          fill="rgba(5,10,20,0.9)" stroke="${isCur?n.color:'rgba(255,255,255,0.2)'}"
          stroke-width="${isCur?2.5:1.5}"/>
        ${isCur?`<circle cx="${n.x}" cy="${n.y}" r="30" fill="none"
          stroke="${n.color}" stroke-width="1" opacity="0.5">
          <animate attributeName="r" values="26;33;26" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>`:''}
        <text x="${n.x}" y="${n.y+6}" text-anchor="middle" font-size="16">${n.emoji}</text>
        ${svgWorldNodeName(n.name, n.x, n.y+42, { fill: isCur?n.color:'#bbb', fontWeight: isCur?'bold':'normal' })}
        ${locked&&n.unlockRealm?`<text x="${n.x}" y="${n.y+54}" text-anchor="middle" font-size="8" fill="#666">🔒 ${REALM_NAMES[n.unlockRealm]}</text>`:''}
        ${n.entryCost>0&&!locked?`<text x="${n.x}" y="${n.y+54}" text-anchor="middle" font-size="8" fill="#f0d47a">💎${n.entryCost}</text>`:''}
      </g>`;
  }).join('');

  const curNode = WORLD_NODES.find(n=>n.id===currentNodeId);

  const starterBanner = isModal && starterLocked ? `
    <div class="wm-starter-banner">
      Đang ở <strong>tân thủ thôn</strong> — chỉ xem bản đồ thế giới. Rời làng sau khi hoàn thành hướng dẫn để đi xa và tự do di chuyển.
    </div>` : '';

  const extra = isModal ? '' : `
        <div id="btn-breakthrough-wrap">
          ${_renderBreakthroughBtn(G)}
        </div>
        ${_renderKiepTuPanel(G)}`;

  const hint = isModal
    ? (starterLocked ? 'Đóng để quay lại thôn' : 'Click node để di chuyển · Đóng khi xong')
    : 'Click vào node để di chuyển<br>Bấm "Vào vùng đất" để khám phá';

  return `
    <div class="map-wrap-t1">
      <div class="map-svg-t1" id="map-svg-t1${suf}">
        <svg id="world-svg${suf}" viewBox="0 0 560 500" xmlns="http://www.w3.org/2000/svg"
             class="map-world-svg">
          <defs>
            <filter id="glow-node${suf}">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <pattern id="grid-pat${suf}" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M50 0L0 0 0 50" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="0.5"/>
            </pattern>
          </defs>
          <!-- Không có <rect> bg — background đến từ CSS .map-svg-t1, tránh double background -->
          <rect width="560" height="500" fill="url(#grid-pat${suf})"/>
          <text x="280" y="20" text-anchor="middle" font-size="10" fill="rgba(200,168,75,0.5)" letter-spacing="4">✦ PHÀM NHÂN GIỚI ✦</text>
          ${connSvg}
          ${nodesSvg}
        </svg>
      </div>
      <div class="map-side-t1">
        ${starterBanner}
        <div class="mst1-loc mst1-loc-current" data-node-color="${curNode?.color||'#444'}">
          <div class="mst1-loc-emoji">${curNode?.emoji||'?'}</div>
          <div>
            <div class="mst1-loc-name">${curNode?.name||'--'}</div>
            <div class="mst1-loc-desc">${curNode?.desc||''}</div>
          </div>
        </div>
        <button type="button" class="btn-enter-zone btn-primary" id="btn-enter-zone${suf}">
          🚶 Vào ${curNode?.name||'vùng đất'} →
        </button>
        ${extra}
        ${!isModal ? `
        <div class="mst1-stats">
          <div class="mst1-s"><span>⚡ Tu tốc</span><strong id="map-stat-rate${statSuf}">--</strong></div>
          <div class="mst1-s"><span>⏳ Tuổi</span><strong id="map-stat-age${statSuf}">--</strong></div>
          <div class="mst1-s"><span>💎</span><strong id="map-stat-stone${statSuf}">--</strong></div>
        </div>` : ''}
        <div class="mst1-hint">${hint}</div>
      </div>
    </div>`;
}

function _wireTier1Handlers(rootEl, G, actions, opts = {}) {
  const suf = opts.svgSuffix || '';
  const svgId = `world-svg${suf}`;
  const starterLocked = !!opts.starterLocked;
  const isModal = !!opts.modal;
  const modalEl = opts.modalEl;

  const nodeInfo = rootEl.querySelector('.mst1-loc-current[data-node-color]');
  if (nodeInfo?.dataset?.nodeColor) {
    nodeInfo.style.setProperty('--node-color', nodeInfo.dataset.nodeColor);
  }

  _setupDrag(svgId.replace(/^#/, ''));

  // Set --node-color CSS variable per wnode để glow đúng màu từng địa điểm
  rootEl.querySelectorAll('.wnode').forEach(g => {
    const nid  = g.dataset.nid;
    const node = WORLD_NODES.find(n => n.id === nid);
    if (node?.color) g.style.setProperty('--node-color', node.color);
  });

  // Star field cho cả modal + panel; particles chỉ panel mode
  _addMapAtmosphere(svgId.replace(/^#/, ''), rootEl, { particlesEnabled: !isModal });

  const onNode = (g) => {
    g.addEventListener('click', () => {
      if (starterLocked) {
        actions.toast('Trong tân thủ thôn chưa thể đi xa — hoàn thành hướng dẫn rồi rời làng.', 'warning');
        return;
      }
      if (g.classList.contains('wnode-locked')) return;
      const nid  = g.dataset.nid;
      const node = WORLD_NODES.find(n => n.id === nid);
      if (!node) return;

      const isCurrentNode = nid === (G.worldMap?.currentNodeId);

      if (!isCurrentNode) {
        // Chỉ tính phí + chronicle + ambush khi thực sự di chuyển sang node mới
        if (node.entryCost > 0 && (G.stone||0) < node.entryCost) {
          actions.toast(`Cần ${node.entryCost}💎 để vào ${node.name}`, 'danger'); return;
        }
        if (node.entryCost > 0) G.stone -= node.entryCost;
        if (!G.worldMap) G.worldMap = { currentNodeId:'thanh_van_son' };
        G.worldMap.currentNodeId = nid;
        addChronicle(G, `Di chuyển đến ${node.name}.`);
        bus.emit('map:moved', { node });

        const ambush = checkAmbush(G);
        if (ambush.triggered) {
          bus.emit('kieptu:ambush', { kiepTu: ambush.kiepTu });
          _showAmbushAlert(G, ambush.kiepTu, actions);
          return;
        }
      }

      if (isModal) {
        modalEl?.remove();
        openWorldMapModal(G, actions);
      } else {
        renderTier1(G, actions);
        // Sau re-render, mở popup với nội dung side panel
        const freshPanel = document.getElementById('panel-cultivate');
        if (freshPanel) _openNodeInfoPopup(freshPanel, G, actions, node);
      }
    });
  };
  rootEl.querySelectorAll('.wnode').forEach(onNode);

  rootEl.querySelector(`#btn-enter-zone${suf}`)?.addEventListener('click', () => {
    console.log('[MAP DEBUG] btn-enter-zone clicked | starterLocked:', starterLocked, '| isModal:', isModal);
    if (isModal) modalEl?.remove();
    // Vào zone detail (Tầng 2) của node hiện tại — như cũ
    _showingKhuyetVuc = false;
    _mapLevel = 2;
    _currentZoneId = G.worldMap?.currentNodeId || 'thanh_van_son';
    console.log('[MAP DEBUG] btn-enter-zone → renderTier2:', _currentZoneId);
    actions.switchTab?.('cultivate');
    renderTier2(G, actions, _currentZoneId);
  });

  if (!isModal) {
    rootEl.querySelector('#btn-breakthrough-wrap')?.addEventListener('click', (e) => {
      if (e.target.closest('#btn-breakthrough:not([disabled])')) {
        actions.breakthrough?.();
      }
    });

    rootEl.querySelectorAll('.btn-kieptu-rob').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.targetId;
        const result = robTarget(G, targetId);
        if (result.ok) {
          actions.toast(result.msg, result.expelled ? 'danger' : 'gold');
          if (result.expelled) actions.toast('⚠ Bị trục xuất tông môn!', 'danger');
        } else {
          actions.toast(result.msg, 'danger');
        }
        renderTier1(G, actions);
      });
    });
  }

  updateMapStats(G);
}

// ============================================================
// ATMOSPHERE — star field + ambient particles
// ============================================================

/**
 * Append star field vào SVG (z-order dưới cùng) và spawn particles vào .map-svg-t1.
 * Gọi sau khi HTML đã được insert vào DOM.
 * @param {string} svgId  — id của <svg> element (không có #)
 * @param {Element} rootEl — container chứa .map-svg-t1
 */
function _addMapAtmosphere(svgId, rootEl, opts = {}) {
  const { particlesEnabled = true } = opts;
  // ---- Star field ----
  const svgEl = document.getElementById(svgId);
  if (svgEl && !svgEl.querySelector('.star-field-g')) {
    const NS = 'http://www.w3.org/2000/svg';
    const g  = document.createElementNS(NS, 'g');
    g.classList.add('star-field-g');
    // 70 ngôi sao kích thước/độ sáng ngẫu nhiên
    for (let i = 0; i < 70; i++) {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', (Math.random() * 560).toFixed(1));
      c.setAttribute('cy', (Math.random() * 500).toFixed(1));
      c.setAttribute('r',  (Math.random() < 0.25 ? 1.2 : 0.55).toFixed(2));
      c.setAttribute('fill', `rgba(255,255,255,${(Math.random() * 0.35 + 0.08).toFixed(2)})`);
      g.appendChild(c);
    }
    // Insert NGAY SAU rect đầu tiên (bg gradient), trước grid rect và nodes
    // z-order: bg → stars → grid → paths → nodes (tự nhiên nhất)
    const firstRect = svgEl.querySelector(':scope > rect');
    svgEl.insertBefore(g, firstRect ? firstRect.nextSibling : svgEl.firstChild);
  }

  // ---- Ambient particles (panel only) ----
  const mapArea = rootEl.querySelector('.map-svg-t1');
  if (particlesEnabled && mapArea && !mapArea.querySelector('.map-particle')) {
    for (let i = 0; i < 12; i++) {
      const p       = document.createElement('div');
      p.className   = 'map-particle';
      const px      = (Math.random() * 80 - 40).toFixed(0);
      const delay   = (Math.random() * 8).toFixed(1);
      const left    = (Math.random() * 90 + 5).toFixed(0);
      const top     = (Math.random() * 70 + 15).toFixed(0);
      p.style.cssText = `--px:${px}px;animation-delay:${delay}s;left:${left}%;top:${top}%;`;
      mapArea.appendChild(p);
    }
  }
}

// ============================================================
// NODE POPUP — copy side panel HTML → PopupManager popup
// ============================================================

/**
 * Mở/cập nhật popup 'map-node' với nội dung từ .map-side-t1 đang ẩn.
 * Rewire các button tương tác trong popup body.
 */
function _openNodeInfoPopup(panelEl, G, actions, node) {
  const sidePanel = panelEl.querySelector('.map-side-t1');
  if (!sidePanel) return;

  const content = sidePanel.innerHTML;
  PopupManager.close('map-node');
  PopupManager.open('map-node', {
    title: `${node.emoji || ''} ${node.name}`,
    content,
    width: 300,
    x: Math.max(10, window.innerWidth - 325),
    y: 64,
  });

  // Rewire các button bên trong popup (chúng là bản sao innerHTML, chưa có listeners)
  const popup = document.querySelector('[data-popup-id="map-node"]');
  if (!popup) return;

  // Nút "Vào vùng đất"
  popup.querySelector('[id^="btn-enter-zone"]')?.addEventListener('click', () => {
    PopupManager.close('map-node');
    _showingKhuyetVuc = true;
    _mapLevel = 1;
    actions.switchTab?.('cultivate');
    renderKhuyetVucMap(G, actions);
  });

  // Nút Đột Phá
  const btBtn = popup.querySelector('#btn-breakthrough:not([disabled])');
  btBtn?.addEventListener('click', () => {
    actions.breakthrough?.();
    PopupManager.close('map-node');
  });

  // Nút Kiếp Tu cướp (robTarget đã import static ở đầu file)
  popup.querySelectorAll('.btn-kieptu-rob').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.targetId;
      const result   = robTarget(G, targetId);
      if (result.ok) {
        actions.toast(result.msg, result.expelled ? 'danger' : 'gold');
        if (result.expelled) actions.toast('⚠ Bị trục xuất tông môn!', 'danger');
      } else {
        actions.toast(result.msg, 'danger');
      }
      PopupManager.close('map-node');
      renderTier1(G, actions);
    });
  });
}

// ============================================================
// TẦNG 1 — NHÂN GIỚI TOÀN ĐỒ (Painted Scroll Map)
// ============================================================

/** SVG parchment-style world map — 5 đại vùng từ NHAN_GIOI_REGIONS (panel version) */
function _buildNhanGioiPanelSVG(G) {
  const W = 700, H = 510;

  const defs = `<defs>
    <pattern id="ng-waves" width="70" height="20" patternUnits="userSpaceOnUse">
      <path d="M0,10 Q17.5,4 35,10 Q52.5,16 70,10" fill="none" stroke="rgba(80,150,145,0.22)" stroke-width="1.2"/>
      <path d="M0,16 Q17.5,10 35,16 Q52.5,22 70,16" fill="none" stroke="rgba(80,150,145,0.12)" stroke-width="0.7"/>
    </pattern>
    <pattern id="ng-snow" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="1.3" fill="rgba(200,220,240,0.40)"/>
      <circle cx="16" cy="14" r="0.9" fill="rgba(200,220,240,0.28)"/>
      <circle cx="11" cy="20" r="0.7" fill="rgba(200,220,240,0.20)"/>
    </pattern>
    <pattern id="ng-ruins" width="26" height="26" patternUnits="userSpaceOnUse">
      <rect x="4" y="10" width="7" height="12" fill="none" stroke="rgba(140,100,180,0.22)" stroke-width="0.8"/>
      <rect x="15" y="6" width="5" height="16" fill="none" stroke="rgba(140,100,180,0.16)" stroke-width="0.7"/>
      <line x1="2" y1="22" x2="24" y2="22" stroke="rgba(140,100,180,0.12)" stroke-width="0.5"/>
    </pattern>
    <pattern id="ng-land" width="28" height="28" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="28" y2="28" stroke="rgba(80,55,20,0.07)" stroke-width="0.5"/>
      <line x1="28" y1="0" x2="0" y2="28" stroke="rgba(80,55,20,0.04)" stroke-width="0.5"/>
    </pattern>
    <filter id="ng-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="ng-vignette" cx="50%" cy="50%" r="55%">
      <stop offset="55%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(10,6,2,0.68)"/>
    </radialGradient>
  </defs>`;

  // Ocean base
  const bg = `
    <rect width="${W}" height="${H}" fill="#9ec8c0"/>
    <rect width="${W}" height="${H}" fill="url(#ng-waves)" opacity="0.9"/>`;

  // Terrain config per region
  const terrainFill   = { vinh_da:'#c8dce8', co_vuc:'#4a5a3a', khuyetvuc:'#7a9e60', than_chau:'#c0a040', thien_tinh:'#88c0b8' };
  const terrainPat    = { vinh_da:'ng-snow',  co_vuc:'ng-ruins', khuyetvuc:'ng-land',  than_chau:'ng-land',  thien_tinh:'ng-waves' };
  const terrainBorder = { vinh_da:'#8a9ab0',  co_vuc:'#5a4070', khuyetvuc:'#4a7040',  than_chau:'#806020',  thien_tinh:'#5a9890' };

  const regionPolys = NHAN_GIOI_REGIONS.map(r => {
    const fill   = terrainFill[r.id]   || '#a0905a';
    const pat    = terrainPat[r.id]    || 'ng-land';
    const border = terrainBorder[r.id] || '#806040';
    const isImpl = r.implemented;
    return `
      <g class="ng-region${isImpl ? ' ng-region-clickable ng-region-active' : ' ng-region-locked'}"
         data-rid="${r.id}" style="cursor:${isImpl ? 'pointer' : 'default'}">
        <polygon points="${r.points}" fill="${fill}" stroke="${border}" stroke-width="1.4" stroke-linejoin="round"/>
        <polygon points="${r.points}" fill="url(#${pat})" opacity="0.55" pointer-events="none"/>
        ${!isImpl ? `<polygon points="${r.points}" fill="rgba(18,12,5,0.40)" pointer-events="none"/>` : ''}
      </g>`;
  }).join('');

  // Mountain icons — Vĩnh Dạ, Cổ Vực, Khuyết Vực, Thần Châu
  const mtnPos = [
    [88,48],[162,55],[252,42],[358,50],[468,44],[578,52],[643,48],
    [30,205],[48,272],[32,348],[44,415],
    [108,175],[150,222],[93,295],[183,310],[253,272],[298,195],
    [438,188],[488,225],[528,265],[418,300],
  ];
  const mountainSvg = mtnPos.map(([x,y]) => _svgMountain(x, y)).join('');

  // Forest icons — Khuyết Vực, Thần Châu
  const fstPos = [
    [172,192],[212,245],[268,325],[322,285],[158,345],[228,382],
    [398,195],[452,228],[498,262],[442,300],[382,338],
  ];
  const forestSvg = fstPos.map(([x,y]) => _svgForest(x, y)).join('');

  // Thiên Tinh — islands
  const islandSvg = `
    <g pointer-events="none" opacity="0.52">
      <ellipse cx="192" cy="460" rx="18" ry="9"  fill="#80b5b0" stroke="#5a9090" stroke-width="0.8"/>
      <ellipse cx="348" cy="488" rx="13" ry="6"  fill="#80b5b0" stroke="#5a9090" stroke-width="0.8"/>
      <ellipse cx="478" cy="472" rx="16" ry="8"  fill="#80b5b0" stroke="#5a9090" stroke-width="0.8"/>
      <ellipse cx="588" cy="456" rx="20" ry="9"  fill="#80b5b0" stroke="#5a9090" stroke-width="0.8"/>
    </g>`;

  // Con dấu chữ Hán (印章)
  const stampData = {
    vinh_da:    { char:'寒', bg:'#18304a', stroke:'#6ab5d5', light:'#bfdbfe' },
    co_vuc:     { char:'古', bg:'#1a0a2a', stroke:'#9055cc', light:'#d8b4fe' },
    khuyetvuc:  { char:'缺', bg:'#0a3a28', stroke:'#2dd4bf', light:'#5eead4' },
    than_chau:  { char:'聖', bg:'#3a2a00', stroke:'#eab308', light:'#fde047' },
    thien_tinh: { char:'海', bg:'#051830', stroke:'#38bdf8', light:'#7dd3fc' },
  };
  const stamps = NHAN_GIOI_REGIONS.map(r => {
    const sd = stampData[r.id]; if (!sd) return '';
    const isImpl = r.implemented;
    const sw = 34, sh = 34;
    return `
      <g pointer-events="none" opacity="${isImpl ? 1 : 0.42}"
         transform="translate(${r.lx},${r.ly - 42})">
        ${isImpl ? `<rect x="${-sw/2-4}" y="${-sh/2-4}" width="${sw+8}" height="${sh+8}" rx="5"
          fill="${sd.bg}" opacity="0.35" filter="url(#ng-glow)"/>` : ''}
        <rect x="${-sw/2}" y="${-sh/2}" width="${sw}" height="${sh}" rx="3"
          fill="${sd.bg}" stroke="${sd.stroke}" stroke-width="${isImpl ? 1.8 : 1.1}" opacity="${isImpl ? 0.95 : 0.65}"/>
        <rect x="${-sw/2+3}" y="${-sh/2+3}" width="${sw-6}" height="${sh-6}" rx="1.5"
          fill="none" stroke="${sd.stroke}" stroke-width="0.5" opacity="0.45"/>
        <text x="0" y="8" text-anchor="middle" font-size="18" fill="${sd.light}" font-weight="bold"
          font-family="'Noto Serif SC','PingFang SC','STSong','Source Han Serif',serif">${sd.char}</text>
      </g>`;
  }).join('');

  // Region name labels
  const labels = NHAN_GIOI_REGIONS.map(r => {
    const sd  = stampData[r.id];
    const col = sd ? (r.implemented ? sd.light : 'rgba(200,180,130,0.42)') : 'rgba(200,180,130,0.4)';
    const words = r.name.split(' ');
    const mid   = Math.ceil(words.length / 2);
    const l1 = words.slice(0, mid).join(' ');
    const l2 = words.slice(mid).join(' ');
    const hasL2 = l2.length > 0;
    return `
      <g pointer-events="none">
        ${hasL2
          ? `<text x="${r.lx}" y="${r.ly + 6}"  text-anchor="middle" font-size="7.5" fill="${col}" font-family="serif" letter-spacing="0.3">${l1}</text>
             <text x="${r.lx}" y="${r.ly + 17}" text-anchor="middle" font-size="7.5" fill="${col}" font-family="serif" letter-spacing="0.3">${l2}</text>`
          : `<text x="${r.lx}" y="${r.ly + 10}" text-anchor="middle" font-size="8"   fill="${col}" font-family="serif" letter-spacing="0.3">${r.name}</text>`
        }
        ${!r.implemented
          ? `<text x="${r.lx}" y="${r.ly + 30}" text-anchor="middle" font-size="6.5" fill="rgba(180,150,85,0.38)" font-family="sans-serif" letter-spacing="0.8">未探索</text>`
          : ''}
      </g>`;
  }).join('');

  // Cloud border — parchment-cream puffs along all 4 edges
  const cc = 'rgba(228,215,188,0.92)';
  const puff = (cx, cy, r) => [
    [0,0,1],[0.55,-0.28,0.72],[-0.55,-0.28,0.68],
    [0.88,0.05,0.58],[-0.88,0.05,0.54],
    [0.22,-0.52,0.58],[-0.22,-0.52,0.55],
  ].map(([dx,dy,s]) =>
    `<circle cx="${(cx+dx*r).toFixed(1)}" cy="${(cy+dy*r).toFixed(1)}" r="${(r*s).toFixed(1)}" fill="${cc}"/>`
  ).join('');

  let clouds = `<g class="ng-cloud-border" pointer-events="none">`;
  for (let x = 0; x <= W; x += 88) clouds += puff(x, -8, 28 + (x * 0.12) % 10);
  for (let x = 0; x <= W; x += 88) clouds += puff(x, H + 8, 28 + (x * 0.1) % 10);
  for (let y = 55; y <= H - 55; y += 82) clouds += puff(-8, y, 25);
  for (let y = 55; y <= H - 55; y += 82) clouds += puff(W + 8, y, 25);
  [[0,0,48],[W,0,48],[0,H,48],[W,H,48]].forEach(([x,y,r]) => { clouds += puff(x, y, r); });
  clouds += '</g>';

  const vignette = `<rect width="${W}" height="${H}" fill="url(#ng-vignette)" pointer-events="none"/>`;
  const title    = `<text x="${W/2}" y="${H-8}" text-anchor="middle" font-size="9.5"
    fill="rgba(50,35,8,0.42)" letter-spacing="6" pointer-events="none" font-family="serif">✦ 人 界 全 圖 ✦</text>`;

  return `${defs}${bg}${regionPolys}${mountainSvg}${forestSvg}${islandSvg}${labels}${stamps}${clouds}${vignette}${title}`;
}

function _buildNhanGioiPanelHtml(G) {
  return `
    <div class="map-wrap-ng">
      <div class="map-svg-ng" id="map-svg-ng">
        <svg id="ng-svg" viewBox="0 0 700 510" xmlns="http://www.w3.org/2000/svg" class="map-ng-svg">
          ${_buildNhanGioiPanelSVG(G)}
        </svg>
      </div>
      <div class="map-side-ng">
        <div class="ng-map-title">
          <div class="ng-ch">人界全圖</div>
          <div class="ng-vn">NHÂN GIỚI TOÀN ĐỒ</div>
        </div>
        <div class="ng-region-info" id="ng-region-info">
          <div class="ng-info-empty">Click vào vùng để xem thông tin</div>
        </div>
        <div class="ng-legend">
          <div class="ng-leg-row">
            <span class="ng-leg-dot" style="background:#2dd4bf;border-radius:2px"></span>
            <span class="ng-leg-active">Khuyết Vực — Đang khám phá</span>
          </div>
          <div class="ng-leg-row">
            <span class="ng-leg-dot" style="background:rgba(180,155,90,0.50);border-radius:2px"></span>
            <span class="ng-leg-locked">4 vùng khác — Chưa mở</span>
          </div>
        </div>
        <div class="ng-hint">Tầng 1 · Nhân Giới Toàn Đồ</div>
        <div class="mst1-stats">
          <div class="mst1-s"><span>⚡</span><strong id="map-stat-rate">--</strong></div>
          <div class="mst1-s"><span>⏳</span><strong id="map-stat-age">--</strong></div>
          <div class="mst1-s"><span>💎</span><strong id="map-stat-stone">--</strong></div>
        </div>
      </div>
    </div>`;
}

/** Wire click handlers cho Nhân Giới panel map */
function _wireNhanGioiPanelRegions(panel, G, actions) {
  const stampColors = {
    vinh_da:    { stroke:'#6ab5d5', light:'#bfdbfe' },
    co_vuc:     { stroke:'#9055cc', light:'#d8b4fe' },
    khuyetvuc:  { stroke:'#2dd4bf', light:'#5eead4' },
    than_chau:  { stroke:'#eab308', light:'#fde047' },
    thien_tinh: { stroke:'#38bdf8', light:'#7dd3fc' },
  };

  panel.querySelectorAll('.ng-region').forEach(g => {
    const rid    = g.dataset.rid;
    const region = NHAN_GIOI_REGIONS.find(r => r.id === rid);
    if (!region) return;
    const sc = stampColors[rid] || { stroke:'#888', light:'#ccc' };

    g.addEventListener('mouseenter', () => {
      if (!region.implemented) return;
      g.querySelector('polygon')?.setAttribute('stroke-width', '2.8');
    });
    g.addEventListener('mouseleave', () => {
      if (!region.implemented) return;
      g.querySelector('polygon')?.setAttribute('stroke-width', '1.4');
    });

    g.addEventListener('click', () => {
      const infoEl = panel.querySelector('#ng-region-info');
      if (!infoEl) return;

      if (!region.implemented) {
        infoEl.innerHTML = `
          <div class="ng-info-card">
            <div class="ng-info-ch" style="color:${sc.stroke}">${region.chName}</div>
            <div class="ng-info-name">${region.name}</div>
            <div class="ng-info-desc">${region.desc}</div>
            <div class="ng-info-lock">🔒 Chưa khám phá · Sẽ mở trong tương lai</div>
          </div>`;
        return;
      }

      // Khuyết Vực — implemented, hiện nút vào
      infoEl.innerHTML = `
        <div class="ng-info-card" style="border-color:${sc.stroke}30">
          <div class="ng-info-ch" style="color:${sc.stroke}">${region.chName}</div>
          <div class="ng-info-name" style="color:${sc.light}">${region.name}</div>
          <div class="ng-info-desc">${region.desc}</div>
          <div class="ng-info-enter"
               style="color:${sc.light};background:${sc.stroke}18;border:1px solid ${sc.stroke}45"
               id="btn-ng-enter-region">→ Vào Khuyết Vực</div>
        </div>`;

      panel.querySelector('#btn-ng-enter-region')?.addEventListener('click', () => {
        _showingKhuyetVuc = true;
        _mapLevel = 1;
        _prevView = 'world';
        renderKhuyetVucMap(G, actions);
      });
    });
  });
}

export function renderNhanGioiMap(G, actions) {
  const panel = document.getElementById('panel-cultivate');
  if (!panel) return;
  panel.className = 'center-panel map-panel';
  panel.innerHTML  = _buildNhanGioiPanelHtml(G);
  _setupDrag('ng-svg');
  _wireNhanGioiPanelRegions(panel, G, actions);
  updateMapStats(G);
}

function renderTier1(G, actions) {
  renderNhanGioiMap(G, actions);
}

// ============================================================
// KHUYẾT VỰC TERRITORY MAP — Hướng A (SVG thuần)
// ============================================================

/**
 * Per-faction visual decor cho Painted Scroll Tầng 2.
 * Tách khỏi FACTION_COLORS để giữ data legacy compat,
 * đồng thời cho phép terrain fill warm phù hợp parchment.
 *
 * - terrFill: màu nền polygon trên parchment (warm tint, opacity 0.5-0.65)
 * - terrStroke: stroke màu hợp tone
 * - ink: stamp ink color (key trong m-grad-ink-*)
 * - inkLight: màu text Việt label (tone đậm vừa đủ contrast với parchment)
 */
const KV_FACTION_DECOR = {
  chinh_dao: { terrFill: 'rgba(120,170,150,0.50)', terrStroke: '#2A5848', ink: 'chinh',  inkLight: '#0A3828' },
  ma_dao:    { terrFill: 'rgba(190,120,100,0.50)', terrStroke: '#6A2820', ink: 'ma',     inkLight: '#5A0810' },
  trung_lap: { terrFill: 'rgba(218,182,108,0.55)', terrStroke: '#7A5020', ink: 'gold',   inkLight: '#604008' },
  hazard:    { terrFill: 'rgba(140,128,140,0.42)', terrStroke: '#4A4048', ink: 'hazard', inkLight: '#3A2838' },
};

/**
 * Chọn mountain symbol variant theo index/position hash để có đa dạng.
 * Tránh tất cả mountain trông giống hệt nhau.
 */
function _kvPickMtSymbol(mx, my) {
  const h = ((mx * 31 + my * 17) | 0) % 100;
  if (h < 70) return 'm-sym-mt-peak';   // 70% peak (phổ biến)
  if (h < 92) return 'm-sym-mt-twin';   // 22% twin
  return 'm-sym-mt-ridge';              // 8% ridge
}

/** Xây dựng toàn bộ SVG nội dung bản đồ lãnh thổ — Painted Scroll style */
function _buildKhuyetVucSVG(G) {
  const W = 700, H = 520;

  // ── 1. Territory polygons (warm faction fill + terrain pattern + coast wobble)
  const territories = KHUYETVUC_TERRITORIES.map(t => {
    const decor       = KV_FACTION_DECOR[t.faction] || KV_FACTION_DECOR.trung_lap;
    const patId       = `m-pat-${t.terrain === 'desert' ? 'dunes' : (t.terrain || 'land')}`;
    const isClickable = !!t.nodeId;
    return (
      `<g class="kv-territory${isClickable ? ' kv-ter-clickable' : ''}" data-tid="${t.id}"` +
        ` style="cursor:${isClickable ? 'pointer' : 'default'}" filter="url(#m-filt-coast)">` +
        `<polygon points="${t.points}" fill="${decor.terrFill}" stroke="${decor.terrStroke}"` +
          ` stroke-width="1.2" stroke-linejoin="round"/>` +
        `<polygon points="${t.points}" fill="url(#${patId})" opacity="0.75" pointer-events="none"/>` +
      `</g>`
    );
  }).join('');

  // ── 2. Mountain symbols (variant theo hash để không đồng nhất)
  const mountains = KHUYETVUC_TERRITORIES
    .flatMap(t => (t.mountains || []).map(([mx, my]) => {
      const sym = _kvPickMtSymbol(mx, my);
      // mt-ridge rộng hơn nên scale to hơn để cân đối
      const w = sym === 'm-sym-mt-ridge' ? 36 : sym === 'm-sym-mt-twin' ? 32 : 24;
      const h = sym === 'm-sym-mt-ridge' ? 22 : sym === 'm-sym-mt-twin' ? 22 : 20;
      return `<use href="#${sym}" x="${mx - w/2}" y="${my - h * 0.75}" width="${w}" height="${h}" opacity="0.88" pointer-events="none"/>`;
    })).join('');

  // ── 3. Forest symbols
  const forests = KHUYETVUC_TERRITORIES
    .flatMap(t => (t.forests || []).map(([fx, fy]) =>
      `<use href="#m-sym-forest" x="${fx - 16}" y="${fy - 12}" width="32" height="18" opacity="0.85" pointer-events="none"/>`
    )).join('');

  // ── 4. Rivers (tone warm hơn cho parchment)
  const rivers = `
    <g class="kv-rivers" pointer-events="none" opacity="0.55">
      <path d="M255,185 Q235,238 218,295" fill="none" stroke="#3A6890" stroke-width="1.3" stroke-dasharray="4 3"/>
      <path d="M368,318 Q370,365 395,428" fill="none" stroke="#3A6890" stroke-width="1.1" stroke-dasharray="4 3"/>
      <path d="M405,155 Q410,188 358,222" fill="none" stroke="#3A6890" stroke-width="1" stroke-dasharray="4 3"/>
    </g>`;

  // ── 5. Trade routes (tier2, animated)
  const tier2Routes = TRADE_ROUTES.filter(r => r.tier === 'tier2');
  const routes = `<g class="kv-trade-routes">` +
    tier2Routes.map(r => renderTradeRoute(r, { animate: true })).join('') +
    `</g>`;

  // ── 6. Sect stamps (ấn mộc với ink bleed theo phe)
  // Bỏ hazard (Bắc Hiểm Sơn, Tây Sa Mạc) — chỉ stamp cho tông môn thật
  const stamps = KHUYETVUC_TERRITORIES
    .filter(t => t.chName && t.faction !== 'hazard')
    .map(t => {
      const decor = KV_FACTION_DECOR[t.faction] || KV_FACTION_DECOR.trung_lap;
      const ch    = t.chName.length >= 2 ? t.chName[0] : t.chName;
      return renderStamp({
        x: t.lx, y: t.ly,
        chName: ch,
        inkGrad: decor.ink,
        size: 18,
        name: t.id,
      });
    }).join('');

  // ── 7. Vietnamese sect labels (đặt dưới stamps)
  const labels = KHUYETVUC_TERRITORIES
    .filter(t => t.chName && t.faction !== 'hazard')
    .map(t => {
      const decor = KV_FACTION_DECOR[t.faction] || KV_FACTION_DECOR.trung_lap;
      const viName = t.name && t.name.length > 18 ? t.name.slice(0, 16) + '…' : (t.name || '');
      return (
        `<g pointer-events="none" opacity="0.88">` +
          `<text x="${t.lx}" y="${t.ly + 30}" text-anchor="middle" font-size="9.5"` +
            ` fill="${decor.inkLight}" letter-spacing="1" font-family="'Noto Serif SC','STSong',serif"` +
            ` font-weight="600" filter="url(#m-filt-label)">${viName}</text>` +
        `</g>`
      );
    }).join('');

  // ── 8. Hazard region labels (Bắc Hiểm Sơn, Tây Sa Mạc) — không stamp, chỉ label nhỏ
  const hazardLabels = KHUYETVUC_TERRITORIES
    .filter(t => t.faction === 'hazard')
    .map(t => {
      const decor = KV_FACTION_DECOR.hazard;
      const rot   = t.id === 'tay_sa_mac' ? ` transform="rotate(-90,${t.lx},${t.ly})"` : '';
      return (
        `<g pointer-events="none" opacity="0.7"${rot}>` +
          `<text x="${t.lx}" y="${t.ly - 4}" text-anchor="middle" font-size="9"` +
            ` fill="${decor.inkLight}" letter-spacing="2" font-family="'Noto Serif SC','STSong',serif"` +
            ` font-weight="600" filter="url(#m-filt-label)">${t.chName}</text>` +
          `<text x="${t.lx}" y="${t.ly + 8}" text-anchor="middle" font-size="8"` +
            ` fill="${decor.inkLight}" opacity="0.85">${t.name}</text>` +
        `</g>`
      );
    }).join('');

  // ── 9. Title (in chìm dưới cùng)
  const title = `
    <text x="350" y="510" text-anchor="middle" font-size="9" letter-spacing="5"
      fill="rgba(58,40,24,0.7)" pointer-events="none" font-family="'STSong',serif"
      filter="url(#m-filt-ink)">缺 域 · KHUYẾT VỰC</text>`;

  // ── Assembly (layer order theo spec analysis §2.8)
  return (
    MAP_DEFS +
    parchmentBackground(W, H) +     // L1: parchment 3-layer
    agedSpots(W, H) +                // L2: aged ink spots
    territories +                    // L3: territory polygons
    mountains +                      // L4-5: hero terrain (mountains via use)
    forests +                        // L4-5: hero terrain (forests)
    rivers +                         // L6: rivers
    routes +                         // L7: trade routes animated
    stamps +                         // L8: sect stamps
    labels +                         // L9a: sect names Vietnamese
    hazardLabels +                   // L9b: hazard region names
    cloudBorder(W, H, true) +        // L10: cloud swirl border animated
    vignette(W, H) +                 // L11: vignette mềm
    title                            // L14: title
  );
}

/** HTML panel Khuyết Vực — mode: 'panel' (Tu Luyện) hoặc 'modal' (popup 🗺) */
function _buildKhuyetVucHtml(G, mode = 'panel') {
  const isPanel = mode === 'panel';
  const currentNodeId = G.worldMap?.currentNodeId || 'thanh_van_son';
  const curTer = KHUYETVUC_TERRITORIES.find(t => t.nodeId === currentNodeId);
  const fc = curTer ? FACTION_COLORS[curTer.faction] : FACTION_COLORS.hazard;

  const legendItems = Object.entries(FACTION_COLORS).map(([key, fc]) => `
    <div class="kv-leg-item">
      <span class="kv-leg-dot" style="background:${fc.stroke}"></span>
      <span style="color:rgba(255,255,255,0.7);font-size:10px">${fc.label}</span>
    </div>`).join('');

  // Side panel: panel mode có breakthrough + kieptu, modal mode chỉ có legend + info
  const sideExtra = isPanel ? `
    <div id="btn-breakthrough-wrap">${_renderBreakthroughBtn(G)}</div>
    ${_renderKiepTuPanel(G)}` : '';

  const curLocHtml = curTer ? `
    <div class="mst1-loc mst1-loc-current" style="--node-color:${fc.stroke}">
      <div class="mst1-loc-emoji" style="font-size:16px">${curTer.chName || '?'}</div>
      <div>
        <div class="mst1-loc-name" style="color:${fc.light}">${curTer.name}</div>
        <div class="mst1-loc-desc" style="font-size:9px;opacity:0.6">${fc.label}</div>
      </div>
    </div>` : '';

  return `
    <div class="map-wrap-kv">
      <div class="map-svg-kv" id="map-svg-kv">
        <svg id="kv-svg" viewBox="0 0 700 520" xmlns="http://www.w3.org/2000/svg"
             class="map-kv-svg">
          ${_buildKhuyetVucSVG(G)}
        </svg>
      </div>
      <div class="map-side-kv">
        <button class="btn-back-world" id="btn-back-nhangioi">← Nhân Giới</button>
        <div class="kv-region-title">
          <span class="kv-region-ch">缺域</span>
          <span class="kv-region-sep"> · </span>
          <span class="kv-region-vn">Khuyết Vực</span>
        </div>
        ${curLocHtml}
        <div class="kv-legend">${legendItems}</div>
        <div class="kv-ter-info" id="kv-ter-info">
          <div class="kv-ter-empty">Click vào lãnh thổ để xem thông tin</div>
        </div>
        ${sideExtra}
        ${isPanel ? `
        <div class="mst1-stats">
          <div class="mst1-s"><span>⚡</span><strong id="map-stat-rate">--</strong></div>
          <div class="mst1-s"><span>⏳</span><strong id="map-stat-age">--</strong></div>
          <div class="mst1-s"><span>💎</span><strong id="map-stat-stone">--</strong></div>
        </div>` : ''}
      </div>
    </div>`;
}

/** Điền thông tin lãnh thổ vào side panel #kv-ter-info trong cùng container */
function _fillTerInfoPanel(container, ter, node, locked, isCur, G, actions, onNavigate) {
  const el = container.querySelector('#kv-ter-info');
  if (!el) return;

  const fc = FACTION_COLORS[ter.faction];

  let actionHtml = '';
  if (!ter.nodeId) {
    actionHtml = '<div class="kv-ter-card-locked">⚠ Khu vực chưa thể vào</div>';
  } else if (locked) {
    actionHtml = '<div class="kv-ter-card-locked">🔒 ' +
                 (REALM_NAMES[node?.unlockRealm] || 'Chưa mở khóa') + '</div>';
  } else {
    const btnLabel = isCur ? '→ Vào khu vực này' : '→ Vào lãnh thổ';
    actionHtml =
      (isCur ? '<div class="kv-ter-card-enter" style="color:' + fc.light + ';margin-bottom:4px">📍 Vị trí hiện tại</div>' : '') +
      '<button class="btn-ter-enter-panel" data-nid="' + ter.nodeId + '" ' +
      'style="margin-top:6px;width:100%;padding:6px 0;' +
      'background:' + fc.bg + ';border:1px solid ' + fc.stroke + ';border-radius:4px;' +
      'color:' + fc.light + ';font-size:12px;font-weight:600;cursor:pointer">' +
      btnLabel + '</button>';
  }

  el.innerHTML =
    '<div class="kv-ter-card" style="border-color:' + fc.stroke + '30;background:' + fc.bg + '55">' +
    '<div class="kv-ter-card-ch" style="color:' + fc.stroke + '">' + (ter.chName || '') + '</div>' +
    '<div class="kv-ter-card-name" style="color:' + fc.light + '">' + ter.name + '</div>' +
    '<div class="kv-ter-card-faction" style="color:' + fc.stroke + '99">' + fc.label + '</div>' +
    '<div class="kv-ter-card-desc">' + ter.desc + '</div>' +
    actionHtml +
    '</div>';

  // Gắn sự kiện cho nút Vào
  const btn = el.querySelector('.btn-ter-enter-panel');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const curId = G.worldMap?.currentNodeId || 'thanh_van_son';
    const nid   = ter.nodeId;
    if (nid !== curId) {
      if (node.entryCost > 0 && (G.stone || 0) < node.entryCost) {
        actions.toast('Cần ' + node.entryCost + '💎 để vào ' + node.name, 'danger'); return;
      }
      if (node.entryCost > 0) G.stone -= node.entryCost;
      if (!G.worldMap) G.worldMap = { currentNodeId: 'thanh_van_son' };
      G.worldMap.currentNodeId = nid;
      addChronicle(G, 'Di chuyển đến ' + node.name + '.');
      bus.emit('map:moved', { node });
      const ambush = checkAmbush(G);
      if (ambush.triggered) {
        bus.emit('kieptu:ambush', { kiepTu: ambush.kiepTu });
        _showAmbushAlert(G, ambush.kiepTu, actions);
        return;
      }
    }
    onNavigate?.();
    _prevView = 'khuyetvuc';
    _mapLevel = 2;
    _currentZoneId = ter.id;  // dùng territory id, không phải nodeId
    renderTier2(G, actions, ter.id);
  });
}

/** Wire territory hover/click cho panel hoặc popup container */
function _wireKvTerritories(container, G, actions, opts = {}) {
  const { onNavigate } = opts;
  const currentNodeId = () => G.worldMap?.currentNodeId || 'thanh_van_son';

  container.querySelectorAll('.kv-territory').forEach(g => {
    const tid = g.dataset.tid;
    const ter = KHUYETVUC_TERRITORIES.find(t => t.id === tid);
    if (!ter) return;
    const fc = FACTION_COLORS[ter.faction];
    const node = ter.nodeId ? WORLD_NODES.find(n => n.id === ter.nodeId) : null;

    const isCur = ter.nodeId === currentNodeId();
    const locked = !isCur && node && (
      G.realmIdx < (node.unlockRealm || 0) ||
      (node.unlockStage && G.stage < node.unlockStage) ||
      (node.needCoDuyen && !G.worldMap?.discovered?.[node.id])
    );

    if (locked) g.classList.add('kv-ter-locked');
    if (isCur)  g.classList.add('kv-ter-current');

    g.addEventListener('mouseenter', () => {
      g.querySelector('polygon')?.setAttribute('stroke-width', '2.8');
    });

    g.addEventListener('mouseleave', () => {
      g.querySelector('polygon')?.setAttribute('stroke-width', '1.5');
    });

    // Click: điền thông tin + button vào side panel cùng container
    g.addEventListener('click', () => {
      _fillTerInfoPanel(container, ter, node, locked, isCur, G, actions, onNavigate);
    });
  });
}

/** Render Khuyết Vực territory map vào panel-cultivate (thay thế node-circle cũ) */
export function renderKhuyetVucMap(G, actions) {
  const panel = document.getElementById('panel-cultivate');
  if (!panel) return;
  console.log('[MAP DEBUG] renderKhuyetVucMap | currentNode:', G.worldMap?.currentNodeId);
  panel.className = 'center-panel map-panel';
  panel.innerHTML = _buildKhuyetVucHtml(G, 'panel');

  _setupDrag('kv-svg');
  _addMapAtmosphere('kv-svg', panel, { particlesEnabled: true });

  panel.querySelector('#btn-breakthrough-wrap')?.addEventListener('click', e => {
    if (e.target.closest('#btn-breakthrough:not([disabled])')) actions.breakthrough?.();
  });

  panel.querySelectorAll('.btn-kieptu-rob').forEach(btn => {
    btn.addEventListener('click', () => {
      const result = robTarget(G, btn.dataset.targetId);
      actions.toast(result.msg, result.ok ? (result.expelled ? 'danger' : 'gold') : 'danger');
      if (result.expelled) actions.toast('⚠ Bị trục xuất tông môn!', 'danger');
      renderKhuyetVucMap(G, actions);
    });
  });

  // Nút quay lại Nhân Giới Toàn Đồ (Tầng 1)
  panel.querySelector('#btn-back-nhangioi')?.addEventListener('click', () => {
    _showingKhuyetVuc = false;
    _mapLevel = 1;
    renderNhanGioiMap(G, actions);
  });

  _wireKvTerritories(panel, G, actions);
  updateMapStats(G);
}

// ============================================================
// TẦNG 1 — NHÂN GIỚI TOÀN ĐỒ (5 đại vùng popup)
// ============================================================

/**
 * Per-region visual decor cho Painted Scroll style.
 * Tách khỏi data layer để dễ tinh chỉnh visual mà không sửa NHAN_GIOI_REGIONS.
 */
const NG_REGION_DECOR = {
  vinh_da:    { terrFill: 'rgba(190,212,228,0.55)', terrStroke: '#5A7A9A', pattern: 'm-pat-ice',    stampChar: '寒', ink: 'chinh',  inkLight: '#3A5878' },
  co_vuc:     { terrFill: 'rgba(140,110,150,0.42)', terrStroke: '#5A4060', pattern: 'm-pat-ruins',  stampChar: '古', ink: 'co-vuc', inkLight: '#4A2868' },
  khuyetvuc:  { terrFill: 'rgba(184,208,152,0.60)', terrStroke: '#3A6038', pattern: 'm-pat-land',   stampChar: '缺', ink: 'trung',  inkLight: '#0A4838' },
  than_chau:  { terrFill: 'rgba(218,180,108,0.55)', terrStroke: '#7A5020', pattern: 'm-pat-land',   stampChar: '聖', ink: 'gold',   inkLight: '#604008' },
  thien_tinh: { terrFill: 'rgba(123,165,184,0.55)', terrStroke: '#3A6080', pattern: 'm-pat-ocean',  stampChar: '海', ink: 'gold',   inkLight: '#604008' },
};

/**
 * Hero terrain decor (mountains, forests, islands) đặt trên mỗi region.
 * x, y, size, sym = symbol id.
 */
const NG_TERRAIN_HERO = [
  // Vĩnh Dạ Hàn Nguyên — ice peaks rải rác top
  { region:'vinh_da', sym:'m-sym-mt-ridge', x:20, y:30, w:120, h:40 },
  { region:'vinh_da', sym:'m-sym-mt-peak',  x:190, y:38, w:30, h:28 },
  { region:'vinh_da', sym:'m-sym-mt-peak',  x:260, y:52, w:34, h:30 },
  { region:'vinh_da', sym:'m-sym-mt-ridge', x:380, y:32, w:120, h:40 },
  { region:'vinh_da', sym:'m-sym-mt-peak',  x:550, y:42, w:32, h:28 },
  { region:'vinh_da', sym:'m-sym-mt-peak',  x:620, y:50, w:28, h:24 },
  // Khuyết Vực — mountains + forest mix
  { region:'khuyetvuc', sym:'m-sym-mt-peak',     x:90, y:170, w:32, h:28 },
  { region:'khuyetvuc', sym:'m-sym-mt-peak',     x:240, y:195, w:34, h:30 },
  { region:'khuyetvuc', sym:'m-sym-mt-ridge',    x:115, y:290, w:80, h:32 },
  { region:'khuyetvuc', sym:'m-sym-forest',      x:180, y:220, w:42, h:24 },
  { region:'khuyetvuc', sym:'m-sym-forest',      x:280, y:260, w:40, h:22 },
  { region:'khuyetvuc', sym:'m-sym-forest',      x:140, y:350, w:38, h:22 },
  // Thần Châu Linh Thổ — rich forest + 1-2 mountain
  { region:'than_chau', sym:'m-sym-forest',  x:430, y:200, w:42, h:24 },
  { region:'than_chau', sym:'m-sym-forest',  x:520, y:240, w:38, h:22 },
  { region:'than_chau', sym:'m-sym-mt-peak', x:580, y:200, w:30, h:26 },
  { region:'than_chau', sym:'m-sym-mt-peak', x:450, y:290, w:32, h:28 },
  // Thiên Tinh Hải Vực — islands
  { region:'thien_tinh', sym:'m-sym-island', x:185, y:443, w:28, h:16 },
  { region:'thien_tinh', sym:'m-sym-island', x:325, y:473, w:28, h:16 },
  { region:'thien_tinh', sym:'m-sym-island', x:465, y:438, w:30, h:16 },
  { region:'thien_tinh', sym:'m-sym-island', x:585, y:468, w:28, h:16 },
];

/** Build SVG bản đồ Nhân Giới 5 vùng — Painted Scroll style */
function _buildNhanGioiSVG() {
  const W = 700, H = 520;

  // ── 1. Region polygons (giữ nguyên points; coast wobble qua feDisplacementMap
  // global noise pattern → shared edges displace cùng amount → không gap)
  const regions = NHAN_GIOI_REGIONS.map(r => {
    const decor   = NG_REGION_DECOR[r.id] || NG_REGION_DECOR.khuyetvuc;
    const isImpl  = r.implemented;
    const opacity = isImpl ? 1 : 0.55;
    const sw      = isImpl ? 1.2 : 0.7;
    return (
      `<g class="ng-region${isImpl ? ' ng-region-active' : ' ng-region-locked'}"` +
        ` data-rid="${r.id}" style="cursor:${isImpl ? 'pointer' : 'default'}" opacity="${opacity}"` +
        ` filter="url(#m-filt-coast)">` +
        // base fill
        `<polygon points="${r.points}" fill="${decor.terrFill}" stroke="${decor.terrStroke}"` +
          ` stroke-width="${sw}" stroke-linejoin="round"/>` +
        // texture overlay nhẹ (cùng filter coast nên match)
        `<polygon points="${r.points}" fill="url(#${decor.pattern})" opacity="0.75" pointer-events="none"/>` +
      `</g>`
    );
  }).join('');

  // ── 2. Hero terrain symbols (mountains, forests, islands)
  const terrain = NG_TERRAIN_HERO.map(t => {
    const r = NHAN_GIOI_REGIONS.find(x => x.id === t.region);
    const op = r && r.implemented ? 0.88 : 0.42;
    return `<use href="#${t.sym}" x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" opacity="${op}" pointer-events="none"/>`;
  }).join('');

  // ── 3. Rivers inside Khuyết Vực (giữ từ design cũ, đổi màu warm)
  const rivers = `
    <g class="ng-rivers" fill="none" stroke="#3A6890" stroke-width="1.2" opacity="0.55" pointer-events="none">
      <path d="M255,165 Q230,210 218,280 Q210,340 215,395"/>
      <path d="M368,158 Q380,240 410,310"/>
    </g>`;

  // ── 4. Trade routes (animated, từ TRADE_ROUTES tier1)
  const tier1Routes = TRADE_ROUTES.filter(r => r.tier === 'tier1');
  const routes = `<g class="ng-trade-routes">` +
    tier1Routes.map(r => renderTradeRoute(r, { animate: true })).join('') +
    `</g>`;

  // ── 5. Sect/region stamps (ink bleed, lệch nhẹ)
  const stamps = NHAN_GIOI_REGIONS.map(r => {
    const decor = NG_REGION_DECOR[r.id] || NG_REGION_DECOR.khuyetvuc;
    if (!r.implemented) {
      // Stamp mờ + dấu khóa cho region locked
      return (
        `<g pointer-events="none" opacity="0.45">` +
          renderStamp({
            x: r.lx, y: r.ly,
            chName: decor.stampChar,
            inkGrad: decor.ink,
            size: r.id === 'co_vuc' ? 16 : 18,
            name: r.id,
          }) +
        `</g>`
      );
    }
    return renderStamp({
      x: r.lx, y: r.ly,
      chName: decor.stampChar,
      inkGrad: decor.ink,
      size: 22,
      name: r.id,
    });
  }).join('');

  // ── 6. Vietnamese labels (đặt dưới stamps, calligraphic)
  const labels = NHAN_GIOI_REGIONS.map(r => {
    const decor   = NG_REGION_DECOR[r.id] || NG_REGION_DECOR.khuyetvuc;
    const isImpl  = r.implemented;
    const opacity = isImpl ? 0.85 : 0.5;
    const fs      = r.id === 'co_vuc' ? 9 : 10.5;
    const offsetY = r.id === 'co_vuc' ? 0 : 32;
    const rot     = r.id === 'co_vuc' ? ` transform="rotate(-90,${r.lx + 30},${r.ly})"` : '';
    const x       = r.id === 'co_vuc' ? r.lx + 30 : r.lx;
    const y       = r.id === 'co_vuc' ? r.ly : r.ly + offsetY;
    const lockTxt = !isImpl
      ? `<text x="${x}" y="${y + 14}" text-anchor="middle" font-size="8.5" fill="${decor.inkLight}" opacity="0.65">— Chưa khám phá —</text>`
      : '';
    return (
      `<g pointer-events="none" opacity="${opacity}"${rot}>` +
        `<text x="${x}" y="${y}" text-anchor="middle" font-size="${fs}"` +
          ` fill="${decor.inkLight}" letter-spacing="2" font-family="'Noto Serif SC','STSong',serif" font-weight="600"` +
          ` filter="url(#m-filt-label)">${r.name}</text>` +
        lockTxt +
      `</g>`
    );
  }).join('');

  // ── 7. Player marker (pulse) tại Khuyết Vực
  const marker = `
    <g pointer-events="none">
      <circle cx="192" cy="272" r="6" fill="url(#m-grad-marker)" opacity="0.7">
        <animate attributeName="r" values="6;11;6" dur="2.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0.15;0.7" dur="2.4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="192" cy="272" r="3" fill="#0A4838" stroke="#F0E0B8" stroke-width="0.8"/>
    </g>`;

  // ── 8. Compass + title
  const compass = `<use href="#m-sym-compass" x="630" y="430" width="60" height="60" opacity="0.85"/>`;

  const title = `
    <text x="350" y="510" text-anchor="middle" font-size="9" letter-spacing="5"
      fill="rgba(58,40,24,0.7)" pointer-events="none" font-family="'STSong',serif"
      filter="url(#m-filt-ink)">人 界 全 圖 · NHÂN GIỚI TOÀN ĐỒ</text>`;

  // ── Assembly (layer order strict, theo spec analysis §2.8)
  return (
    MAP_DEFS +
    parchmentBackground(W, H) +     // L1: parchment 3-layer
    agedSpots(W, H) +                // L2: aged ink spots
    regions +                        // L3: region polygons
    terrain +                        // L5: hero mountains/forests/islands
    rivers +                         // L6: rivers
    routes +                         // L7: trade routes animated
    stamps +                         // L8: sect stamps
    labels +                         // L9: region labels Vietnamese
    cloudBorder(W, H, true) +        // L10: cloud swirl border animated
    vignette(W, H) +                 // L11: vignette mềm
    compass +                        // L12: compass rose
    marker +                         // L13: player marker
    title                            // L14: title
  );
}

/** HTML popup Nhân Giới Toàn Đồ */
function _buildNhanGioiHtml() {
  return (
    `<div class="map-wrap-ng">` +
    `<div class="map-svg-ng">` +
    `<svg id="ng-svg" viewBox="0 0 700 520" xmlns="http://www.w3.org/2000/svg" class="map-ng-svg">` +
    _buildNhanGioiSVG() +
    `</svg></div>` +
    `<div class="map-side-ng">` +
    `<div class="ng-map-title"><div class="ng-ch">人界全圖</div><div class="ng-vn">Nhân Giới Toàn Đồ</div></div>` +
    `<div class="ng-region-info" id="ng-region-info"><div class="ng-info-empty">Hover vào đại vùng để xem thông tin</div></div>` +
    `<div class="ng-legend">` +
    `<div class="ng-leg-row ng-leg-active"><span class="ng-leg-dot" style="background:#2dd4bf"></span>Khuyết Vực — Đã mở khóa</div>` +
    `<div class="ng-leg-row ng-leg-locked"><span class="ng-leg-dot" style="background:#444"></span>4 vùng còn lại — Chưa khám phá</div>` +
    `</div>` +
    `<div class="ng-hint">Click vào <strong style="color:#5eead4">Khuyết Vực</strong> để xem bản đồ chi tiết</div>` +
    `</div></div>`
  );
}

/** Wire hover/click cho các ng-region trong popup */
function _wireNhanGioiRegions(container, G, actions) {
  const popupEl = document.querySelector('[data-popup-id="world-map"]');

  container.querySelectorAll('.ng-region').forEach(g => {
    const rid    = g.dataset.rid;
    const region = NHAN_GIOI_REGIONS.find(r => r.id === rid);
    if (!region) return;

    g.addEventListener('mouseenter', () => {
      const el = container.querySelector('#ng-region-info');
      if (!el) return;
      const lockHtml  = !region.implemented ? `<div class="ng-info-lock">🔒 Chưa được khám phá</div>` : '';
      const enterHtml = region.implemented  ? `<div class="ng-info-enter" style="color:${region.light}">→ Click để vào bản đồ chi tiết</div>` : '';
      el.innerHTML =
        `<div class="ng-info-card" style="border-color:${region.stroke}44;background:${region.bg}55">` +
        `<div class="ng-info-ch" style="color:${region.stroke}">${region.chName}</div>` +
        `<div class="ng-info-name" style="color:${region.light}">${region.name}</div>` +
        `<div class="ng-info-desc">${region.desc}</div>` +
        lockHtml + enterHtml + `</div>`;
      if (region.implemented) g.style.filter = 'brightness(1.18)';
    });

    g.addEventListener('mouseleave', () => { g.style.filter = ''; });

    g.addEventListener('click', () => {
      if (!region.implemented) {
        actions.toast(region.name + ' — vùng này chưa được khám phá.', 'warning');
        return;
      }
      if (region.id === 'khuyetvuc') _showKhuyetVucInModal(G, actions, popupEl);
    });
  });
}

/** Chuyển nội dung popup sang Khuyết Vực territory map */
function _showKhuyetVucInModal(G, actions, popupEl) {
  const titleEl = popupEl && popupEl.querySelector('.pm-title');
  if (titleEl) titleEl.textContent = '🗺 缺域 · Khuyết Vực';

  const pmBody = popupEl && popupEl.querySelector('.pm-body');
  if (!pmBody) return;

  const bodyEl = document.createElement('div');
  bodyEl.style.cssText = 'min-width:0;height:100%;display:flex;flex-direction:column';
  bodyEl.innerHTML =
    `<div style="display:flex;align-items:center;gap:8px;padding:4px 6px 2px;border-bottom:1px solid rgba(255,255,255,0.06)">` +
    `<button id="ng-back-btn" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);` +
    `border-radius:4px;padding:3px 10px;font-size:11px;color:#9ca3af;cursor:pointer">` +
    `← Nhân Giới Toàn Đồ</button>` +
    `<span style="font-size:10px;color:rgba(255,255,255,0.3)">缺域 · Khuyết Vực</span></div>` +
    `<div id="ng-kv-inner" style="flex:1;min-height:0;overflow:hidden">` +
    _buildKhuyetVucHtml(G, 'modal') +
    `</div>`;

  pmBody.innerHTML = '';
  pmBody.appendChild(bodyEl);

  bodyEl.querySelector('#ng-back-btn').addEventListener('click', () => {
    if (titleEl) titleEl.textContent = '🗺 人界全圖 · Nhân Giới';
    _showNhanGioiInModal(G, actions, popupEl);
  });

  const kvInner = bodyEl.querySelector('#ng-kv-inner');
  if (kvInner) {
    _setupDrag('kv-svg');
    _wireKvTerritories(kvInner, G, actions, {
      onNavigate: () => PopupManager.close('world-map'),
    });
  }
}

/** Chuyển nội dung popup về Nhân Giới Toàn Đồ */
function _showNhanGioiInModal(G, actions, popupEl) {
  const pmBody = popupEl && popupEl.querySelector('.pm-body');
  if (!pmBody) return;

  const bodyEl = document.createElement('div');
  bodyEl.style.cssText = 'min-width:0;height:100%;display:flex;flex-direction:column';
  bodyEl.innerHTML = _buildNhanGioiPanelHtml(G);

  pmBody.innerHTML = '';
  pmBody.appendChild(bodyEl);
  _wireNhanGioiRegions(bodyEl, G, actions);
}

/** Popup bản đồ thế giới — Tầng 1: Nhân Giới Toàn Đồ (5 đại vùng) */
export function openWorldMapModal(G, actions) {
  if (PopupManager.isOpen('world-map')) { PopupManager.close('world-map'); return; }

  const bodyEl = document.createElement('div');
  bodyEl.style.cssText = 'min-width:0;height:100%;display:flex;flex-direction:column';
  bodyEl.innerHTML = _buildNhanGioiPanelHtml(G);

  const w = window.innerWidth;
  const h = window.innerHeight;
  PopupManager.open('world-map', {
    title:      '🗺 人界全圖 · Nhân Giới',
    content:    bodyEl,
    width:      w,
    height:     h,
    x:          0,
    y:          0,
    extraClass: 'pm-world-map pm-nhangioi',
  });

  const popupEl = document.querySelector('[data-popup-id="world-map"]');
  const pmBody  = popupEl && popupEl.querySelector('.pm-body');
  if (!pmBody) return;
  _wireNhanGioiRegions(pmBody, G, actions);
}

// ============================================================
// TẦNG 3 — TERRITORY INTERIOR MAP (mới, dùng TERRITORY_INTERIORS)
// ============================================================

/**
 * Map location.type → SVG symbol id.
 * Hết emoji (vi phạm WORLD_MAP_DESIGN §8.4 đã được khắc phục).
 */
const LOC_TYPE_SYMBOL = {
  sect_gate:        'm-sym-pagoda',
  market:           'm-sym-market',
  ghost_market:     'm-sym-ghost',
  auction:          'm-sym-auction',
  freelance_quest:  'm-sym-market',
  hunt_zone:        'm-sym-swords',
  boss_zone:        'm-sym-swords',
  cultivate_spot:   'm-sym-altar',
  alchemy:          'm-sym-altar',
  gather_zone:      'm-sym-herb',
  secret_gather:    'm-sym-herb',
  mystery_zone:     'm-sym-altar',
  mystery_cave:     'm-sym-cave',
  dungeon:          'm-sym-cave',
  treasure:         'm-sym-treasure',
  npc:              'm-sym-person',
};

/** Symbol size theo loại — sect_gate to nhất, others vừa */
function _t3SymBox(type) {
  if (type === 'sect_gate')  return { w: 44, h: 44, yOff: 22 };
  if (type === 'auction')    return { w: 32, h: 28, yOff: 14 };
  if (type === 'market' || type === 'ghost_market' || type === 'freelance_quest')
                             return { w: 36, h: 28, yOff: 14 };
  if (type === 'cultivate_spot' || type === 'alchemy' || type === 'mystery_zone')
                             return { w: 28, h: 32, yOff: 16 };
  if (type === 'cave' || type === 'dungeon' || type === 'mystery_cave' || type === 'boss_zone')
                             return { w: 30, h: 24, yOff: 12 };
  if (type === 'treasure')   return { w: 26, h: 20, yOff: 10 };
  if (type === 'npc')        return { w: 22, h: 26, yOff: 13 };
  // hunt_zone (swords), gather_zone (herb), secret_gather (herb)
  return { w: 28, h: 28, yOff: 14 };
}

/**
 * Build SVG terrain décor (Painted Scroll) — hero terrain symbols.
 * Vị trí cố định theo faction để background phong phú nhưng không che locations.
 */
function _buildTerritoryTerrainDecor(ter) {
  const decor = KV_FACTION_DECOR[ter.faction] || KV_FACTION_DECOR.trung_lap;
  const terrain = ter.terrain || 'land';
  const patId = `m-pat-${terrain === 'desert' ? 'dunes' : terrain}`;

  // Base terrain tint full panel (warm faction color)
  const baseTint = `<rect width="500" height="390" fill="${decor.terrFill}" opacity="0.6" pointer-events="none"/>`;
  const basePat  = `<rect width="500" height="390" fill="url(#${patId})" opacity="0.6" pointer-events="none"/>`;

  // Hero terrain accent — góc trái dưới + góc phải dưới (không chồng locations 120-300 y)
  let hero = '';
  if (ter.faction === 'ma_dao') {
    // Volcano + dark mountains
    hero = (
      `<use href="#m-sym-volcano"   x="20"  y="290" width="40" height="50" opacity="0.75" pointer-events="none"/>` +
      `<use href="#m-sym-mt-peak"   x="68"  y="320" width="32" height="28" opacity="0.7"  pointer-events="none"/>` +
      `<use href="#m-sym-mt-ridge"  x="420" y="310" width="68" height="36" opacity="0.7"  pointer-events="none"/>`
    );
  } else if (ter.faction === 'chinh_dao' && terrain === 'mountain') {
    hero = (
      `<use href="#m-sym-mt-ridge"  x="10"  y="305" width="90" height="42" opacity="0.85" pointer-events="none"/>` +
      `<use href="#m-sym-mt-peak"   x="105" y="335" width="30" height="24" opacity="0.7"  pointer-events="none"/>` +
      `<use href="#m-sym-mt-twin"   x="395" y="305" width="70" height="42" opacity="0.85" pointer-events="none"/>`
    );
  } else if (ter.faction === 'chinh_dao') {
    hero = (
      `<use href="#m-sym-forest"    x="15"  y="330" width="50" height="24" opacity="0.75" pointer-events="none"/>` +
      `<use href="#m-sym-forest"    x="75"  y="345" width="44" height="22" opacity="0.7"  pointer-events="none"/>` +
      `<use href="#m-sym-forest"    x="395" y="335" width="50" height="24" opacity="0.75" pointer-events="none"/>` +
      `<use href="#m-sym-forest"    x="445" y="350" width="40" height="20" opacity="0.7"  pointer-events="none"/>`
    );
  } else {
    // Trung lập / hazard
    hero = (
      `<use href="#m-sym-forest"    x="15"  y="335" width="46" height="22" opacity="0.7"  pointer-events="none"/>` +
      `<use href="#m-sym-mt-peak"   x="430" y="320" width="30" height="26" opacity="0.7"  pointer-events="none"/>` +
      `<use href="#m-sym-mt-peak"   x="460" y="335" width="26" height="22" opacity="0.65" pointer-events="none"/>`
    );
  }

  return baseTint + basePat + hero;
}

/** Render Tầng 3 từ territory id + TERRITORY_INTERIORS */
function _renderTier2Territory(G, actions, ter) {
  const panel = document.getElementById('panel-cultivate');
  if (!panel) return;

  const fc = FACTION_COLORS[ter.faction];
  const interior = TERRITORY_INTERIORS[ter.id];

  // Fallback khi chưa có interior data
  if (!interior) {
    panel.innerHTML =
      '<div class="map-wrap-t2">' +
      '<div class="map-svg-t2" style="display:flex;align-items:center;justify-content:center">' +
      '<div style="text-align:center;padding:40px;color:' + fc.light + '">' +
      '<div style="font-size:32px;margin-bottom:12px">' + (ter.chName || ter.name) + '</div>' +
      '<div style="font-size:14px;opacity:0.6">Khu vực đang xây dựng...</div>' +
      '</div></div>' +
      '<div class="map-side-t2">' +
      '<button class="btn-back-world" id="btn-back-world">← Khuyết Vực</button>' +
      '<div class="mst2-zone-name" style="color:' + fc.light + ';--zone-color:' + fc.stroke + '">' + ter.name + '</div>' +
      '<div class="mst2-zone-desc" style="color:' + fc.stroke + '66;font-size:10px">' + fc.label + '</div>' +
      '<div class="mst2-zone-desc">' + ter.desc + '</div>' +
      '</div></div>';
    document.getElementById('btn-back-world')?.addEventListener('click', () => {
      _showingKhuyetVuc = true;
      renderKhuyetVucMap(G, actions);
    });
    return;
  }

  const allLocs = interior.locations;
  const decor = KV_FACTION_DECOR[ter.faction] || KV_FACTION_DECOR.trung_lap;

  // ── Terrain ────────────────────────────────────────────────────────────────
  const terrainSvg = _buildTerritoryTerrainDecor(ter);

  // ── Connection paths: sect_gate (nếu có) → các locations khác ──────────────
  const sectGate = allLocs.find(l => l.type === 'sect_gate');
  let connSvg = '';
  if (sectGate) {
    connSvg =
      '<g class="t3-connections" pointer-events="none" opacity="0.45">' +
      allLocs
        .filter(l => l.id !== sectGate.id)
        .map(l => {
          // Cong nhẹ theo Bezier để đỡ thẳng cứng
          const mx = (sectGate.x + l.x) / 2;
          const my = (sectGate.y + l.y) / 2 + 8;
          return (
            `<path d="M${sectGate.x},${sectGate.y} Q${mx},${my} ${l.x},${l.y}" ` +
            `fill="none" stroke="#7A5018" stroke-width="0.8" stroke-dasharray="2.5,3.5"/>`
          );
        }).join('') +
      '</g>';
  }

  // ── SVG location nodes (symbol-based, no emoji) ─────────────────────────────
  const locSvg = allLocs.map(loc => {
    const locked = _isLocLocked(G, loc);
    const symId  = LOC_TYPE_SYMBOL[loc.type] || 'm-sym-altar';
    const box    = _t3SymBox(loc.type);
    const dim    = locked ? 0.40 : 1.0;
    const isSecret = loc.type === 'secret_gather' || loc.type === 'mystery_zone' || loc.type === 'mystery_cave';

    // Lock label
    let lockTxt = '';
    if (locked) {
      const lockMsg =
        loc.requireSect   ? 'Nội môn' :
        loc.requireRealm  ? (REALM_NAMES[loc.requireRealm] || 'Cảnh giới cao') :
        loc.requireSecret ? 'Bí Cảnh' : 'Khóa';
      lockTxt =
        `<use href="#m-sym-lock" x="${loc.x + box.w/2 - 6}" y="${loc.y - box.yOff - 4}" width="10" height="12" opacity="0.85"/>` +
        `<text x="${loc.x}" y="${loc.y + 38}" text-anchor="middle" font-size="7.5" fill="${decor.inkLight}" opacity="0.7">🔒 ${lockMsg}</text>`;
    }

    // Secret glow halo (cho secret_gather, mystery_*)
    const glowSvg = isSecret && !locked
      ? `<use href="#m-sym-glow" x="${loc.x - 15}" y="${loc.y - 15}" width="30" height="30"/>`
      : '';

    // Soft drop shadow ellipse dưới chân icon
    const shadow = `<ellipse cx="${loc.x}" cy="${loc.y + box.yOff - 2}" rx="${box.w/2 - 2}" ry="2.5" fill="#3A2818" opacity="${0.32 * dim}"/>`;

    // Label text dưới icon
    const labelY = loc.y + box.yOff + 12;
    const labelSvg = svgZoneLocLabel(loc.name, loc.x, labelY, {
      fill: locked ? '#7A6048' : decor.inkLight,
      fontSize: 9,
    });

    return (
      `<g class="znode${locked ? ' znode-locked' : ''}" data-lid="${loc.id}" style="cursor:${locked ? 'default' : 'pointer'};opacity:${dim}">` +
        glowSvg +
        shadow +
        `<use href="#${symId}" x="${loc.x - box.w/2}" y="${loc.y - box.yOff}" width="${box.w}" height="${box.h}"/>` +
        // Invisible hit area
        `<rect x="${loc.x - box.w/2 - 4}" y="${loc.y - box.yOff - 4}" width="${box.w + 8}" height="${box.h + 8}" fill="transparent" pointer-events="all"/>` +
        labelSvg +
        lockTxt +
      `</g>`
    );
  }).join('');

  // ── Title stamp + chữ Hán góc trên ──────────────────────────────────────────
  const titleStamp = ter.chName
    ? `<g pointer-events="none">` +
        renderStamp({ x: 36, y: 30, chName: ter.chName[0], inkGrad: decor.ink, size: 14, name: ter.id }) +
        `<text x="60" y="22" font-size="10.5" fill="${decor.inkLight}" letter-spacing="2" font-family="'Noto Serif SC','STSong',serif" font-weight="600" filter="url(#m-filt-label)">${ter.chName}</text>` +
        `<text x="60" y="38" font-size="9" fill="${decor.inkLight}" opacity="0.85" letter-spacing="1.5">${ter.name}</text>` +
      `</g>`
    : '';

  // ── Back button label ───────────────────────────────────────────────────────
  const backLabel = _prevView === 'sect_home' ? '← Tông Môn' : '← Khuyết Vực';

  // ── Render HTML ─────────────────────────────────────────────────────────────
  panel.innerHTML =
    '<div class="map-wrap-t2">' +
    '<div class="map-svg-t2 map-svg-t3-painted" id="map-svg-t2">' +
    '<svg id="zone-svg" viewBox="0 0 500 390" xmlns="http://www.w3.org/2000/svg" class="map-zone-svg">' +
    MAP_DEFS +
    parchmentBackground(500, 390) +
    agedSpots(500, 390) +
    terrainSvg +
    connSvg +
    locSvg +
    cloudBorder(500, 390, true, 't3-cloud') +
    vignette(500, 390) +
    titleStamp +
    '</svg></div>' +
    // Right panel — faction-aware
    '<div class="map-side-t2" style="border-left:1px solid ' + fc.stroke + '33">' +
    '<button class="btn-back-world" id="btn-back-world">' + backLabel + '</button>' +
    '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
    '<div class="mst2-zone-name" style="--zone-color:' + fc.stroke + ';color:' + fc.light + ';margin-bottom:0">' + ter.name + '</div>' +
    '<span class="ter-faction-badge" style="background:' + fc.bg + ';border:1px solid ' + fc.stroke + '55;border-radius:3px;' +
    'padding:1px 5px;font-size:8.5px;color:' + fc.stroke + ';white-space:nowrap">' + fc.label + '</span>' +
    '</div>' +
    '<div class="mst2-zone-desc">' + ter.desc + '</div>' +
    '<div class="mst2-loc-info" id="mst2-loc-info"><div class="mst2-loc-empty-hint">Click vào địa điểm để xem chi tiết</div></div>' +
    '<div class="mst1-stats mst-stats-top">' +
    '<div class="mst1-s"><span>⚡</span><strong id="map-stat-rate">--</strong></div>' +
    '<div class="mst1-s"><span>⏳</span><strong id="map-stat-age">--</strong></div>' +
    '<div class="mst1-s"><span>💸</span><strong id="map-stat-stone">--</strong></div>' +
    '</div></div></div>';

  _setupDrag('zone-svg');

  // ── Back button ───────────────────────────────────────────────────────────
  document.getElementById('btn-back-world').addEventListener('click', () => {
    if (_prevView === 'sect_home') {
      _showingSectHome = true;
      _showingKhuyetVuc = false;
      renderSectHome(G, actions, () => {
        _showingSectHome  = false;
        _prevView         = 'sect_home';
        _mapLevel         = 2;
        _currentZoneId    = G.worldMap?.currentNodeId || null;
        renderTier2(G, actions, _currentZoneId);
      });
    } else {
      _showingKhuyetVuc = true;
      renderKhuyetVucMap(G, actions);
    }
  });

  // ── Location click handlers ────────────────────────────────────────────────────
  panel.querySelectorAll('.znode').forEach(g => {
    g.addEventListener('click', () => {
      if (g.classList.contains('znode-locked')) return;
      const loc = allLocs.find(l => l.id === g.dataset.lid);
      if (!loc) return;
      _updateLocInfo(G, loc, actions);
    });
  });

  updateMapStats(G);
}

function renderTier2(G, actions, zoneId) {
  const panel = document.getElementById('panel-cultivate');
  if (!panel) return;
  panel.className = 'center-panel map-panel';

  const territory = KHUYETVUC_TERRITORIES.find(t => t.id === zoneId);
  if (territory) {
    _renderTier2Territory(G, actions, territory);
    return;
  }

  // zoneId không khớp territory nào — fallback về Khuyết Vực
  _showingKhuyetVuc = true;
  renderKhuyetVucMap(G, actions);
}
