// ============================================================
// ui/world-map.js — Map render (Tier1, Tier2)
// Location Popup → ui/location-popup.js
// Starter Village → ui/starter-village.js
// ============================================================
import { bus } from '../utils/helpers.js';
import { addChronicle } from '../core/time-engine.js';
import { moveToPhapDia } from '../core/phap-dia.js';
import { calcMaxQi, calcQiRate, calcPurityThreshold, calcKienCoCeiling } from '../core/state.js';
import { getAvailableEnemies } from '../combat/combat-engine.js';
import { checkAmbush, getAvailableTargets, robTarget, getNghiepLucPenalty } from '../core/kiep-tu-engine.js';
import { _showLocationPopup, _setupDrag, _isLocLocked } from './location-popup.js';
import PopupManager from './popup-manager.js';
import { renderStarterVillage, rollStarterVillage } from './starter-village.js';
// Re-export để backward compat (các file khác import từ world-map.js)
export { renderStarterVillage, rollStarterVillage };
import { WORLD_NODES, ZONE_DATA, svgZoneLocLabel, svgWorldNodeName } from './map-data.js';
import { REALM_NAMES } from '../core/constants.js';
// Re-export WORLD_NODES để backward compat
export { WORLD_NODES };
// ============================================================
// STATE quản lý map level hiện tại
// ============================================================
let _mapLevel = 1;        // 1=world, 2=zone
let _currentZoneId = null;

export function getCurrentNode(G) {
  const id = G.worldMap?.currentNodeId || 'thanh_van_son';
  return WORLD_NODES.find(n => n.id === id) || WORLD_NODES[0];
}

// ============================================================
// RENDER CHÍNH — quyết định hiển thị tầng nào
// ============================================================
export function renderWorldMap(G, actions) {
  // Tân thủ thôn — nếu chưa rời thôn thì show starter village
  if (!G.worldMap?.leftStarter) {
    renderStarterVillage(G, actions);
    return;
  }
  if (_mapLevel === 1) renderTier1(G, actions);
  else if (_mapLevel === 2) renderTier2(G, actions, _currentZoneId);
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
      const lockedN  = G.realmIdx < (n.unlockRealm||0)  || (n.unlockStage  && G.stage < n.unlockStage);
      const lockedTo = G.realmIdx < (to.unlockRealm||0) || (to.unlockStage && G.stage < to.unlockStage);
      const pathUnlocked = !lockedN && !lockedTo;
      return `<path d="M${n.x},${n.y} Q${mx},${my} ${to.x},${to.y}"
        fill="none"
        stroke="${pathUnlocked ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)'}"
        stroke-width="1.5"
        ${pathUnlocked ? '' : 'stroke-dasharray="4 6"'}/>`;
    })
  ).join('');

  const nodesSvg = WORLD_NODES.map(n => {
    const isCur  = n.id === currentNodeId;
    const locked = G.realmIdx < (n.unlockRealm||0) ||
                   (n.unlockStage && G.stage < n.unlockStage) ||
                   (n.needCoDuyen && !G.worldMap?.discovered?.[n.id]);
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
    if (starterLocked) {
      actions.toast('Rời tân thủ thôn trước khi vào vùng chi tiết trên bản đồ thế giới.', 'warning');
      return;
    }
    if (isModal) modalEl?.remove();
    _mapLevel = 2;
    _currentZoneId = G.worldMap?.currentNodeId || 'thanh_van_son';
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
    _mapLevel = 2;
    _currentZoneId = G.worldMap?.currentNodeId || 'thanh_van_son';
    actions.switchTab?.('cultivate');
    renderTier2(G, actions, _currentZoneId);
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

function renderTier1(G, actions) {
  const panel = document.getElementById('panel-cultivate');
  if (!panel) return;
  panel.className = 'center-panel map-panel';
  panel.innerHTML = _buildTier1Html(G, { mode: 'panel', svgSuffix: '', starterLocked: false });
  _wireTier1Handlers(panel, G, actions, { modal: false, starterLocked: false, svgSuffix: '' });
}

/** Popup bản đồ thế giới — dùng PopupManager (drag + resize) */
export function openWorldMapModal(G, actions) {
  // Toggle: nếu đang mở thì đóng
  if (PopupManager.isOpen('world-map')) {
    PopupManager.close('world-map');
    return;
  }

  const starterLocked = !G.worldMap?.leftStarter;

  const modal = { id: 'world-map' }; // placeholder, không tạo DOM element nữa
  // Dùng PopupManager để có drag + resize thống nhất
  const bodyEl = document.createElement('div');
  bodyEl.style.minWidth = '0';
  bodyEl.innerHTML = _buildTier1Html(G, { mode: 'modal', svgSuffix: '-modal', starterLocked });

  const w = Math.min(window.innerWidth - 20, 740);
  const h = Math.min(window.innerHeight - 80, 540);
  PopupManager.open('world-map', {
    title:      '🗺 Phàm Nhân Giới',
    content:    bodyEl,
    width:      w,
    height:     h,
    x:          Math.max(10, (window.innerWidth - w) / 2),
    y:          Math.max(10, (window.innerHeight - h) / 2),
    extraClass: 'pm-world-map',
  });

  // Wire handlers vào body bên trong popup
  const pmBody = document.querySelector('[data-popup-id="world-map"] .pm-body > div');
  if (pmBody) {
    _wireTier1Handlers(pmBody, G, actions, {
      modal:       true,
      modalEl:     pmBody,
      starterLocked,
      svgSuffix:   '-modal',
    });
  }
}

// ============================================================
// TẦNG 2 — ZONE MAP
// ============================================================
function renderTier2(G, actions, zoneId) {
  const panel = document.getElementById('panel-cultivate');
  if (!panel) return;
  panel.className = 'center-panel map-panel';

  const worldNode = WORLD_NODES.find(n=>n.id===zoneId);
  const zone = ZONE_DATA[zoneId];
  if (!zone || !worldNode) { _mapLevel=1; renderTier1(G,actions); return; }

  // Build location SVG nodes
  const locSvg = zone.locations.map(loc => {
    const locked = _isLocLocked(G, loc);
    return `
      <g class="znode${locked?' znode-locked':''}" data-lid="${loc.id}">
        <circle cx="${loc.x}" cy="${loc.y}" r="24"
          fill="rgba(5,10,20,0.92)" stroke="${locked?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.4)'}" stroke-width="1.5"/>
        <text x="${loc.x}" y="${loc.y+6}" text-anchor="middle" font-size="16">${loc.emoji}</text>
        ${svgZoneLocLabel(loc.name, loc.x, loc.y+40, { fill: locked?'#555':'#ccc', fontSize: 8.5 })}
        ${locked&&loc.requireSect?`<text x="${loc.x}" y="${loc.y+54}" text-anchor="middle" font-size="7.5" fill="#555">🔒 Nội môn</text>`:''}
        ${locked&&loc.requireRealm?`<text x="${loc.x}" y="${loc.y+54}" text-anchor="middle" font-size="7.5" fill="#555">🔒 ${REALM_NAMES[loc.requireRealm]}</text>`:''}
        ${locked&&loc.requireSecret?`<text x="${loc.x}" y="${loc.y+54}" text-anchor="middle" font-size="7.5" fill="#6a5000">🔒 Bí Cảnh</text>`:''}
      </g>`;
  }).join('');

  panel.innerHTML = `
    <div class="map-wrap-t2">
      <div class="map-svg-t2" id="map-svg-t2">
        <svg id="zone-svg" viewBox="0 0 500 390" xmlns="http://www.w3.org/2000/svg"
             class="map-zone-svg">
          <defs>
            <filter id="glow-z"><feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <rect width="500" height="390" fill="${zone.bg}" rx="0"/>
          <!-- Zone label -->
          <text x="250" y="22" text-anchor="middle" font-size="11"
            fill="rgba(255,255,255,0.35)" letter-spacing="3">${worldNode.emoji} ${worldNode.name.toUpperCase()}</text>
          <!-- Locations -->
          ${locSvg}
        </svg>
      </div>
      <div class="map-side-t2">
        <button class="btn-back-world" id="btn-back-world">← Thế Giới</button>
        <div class="mst2-zone-name mst2-zone-name-color" data-zone-color="${worldNode.color}">${worldNode.emoji} ${worldNode.name}</div>
        <div class="mst2-zone-desc">${worldNode.desc}</div>
        <div class="mst2-loc-info" id="mst2-loc-info">
          <div class="mst2-loc-empty-hint">
            Click vào địa điểm để xem chi tiết
          </div>
        </div>
        <div class="mst1-stats mst-stats-top">
          <div class="mst1-s"><span>⚡</span><strong id="map-stat-rate">--</strong></div>
          <div class="mst1-s"><span>⏳</span><strong id="map-stat-age">--</strong></div>
          <div class="mst1-s"><span>💎</span><strong id="map-stat-stone">--</strong></div>
        </div>
      </div>
    </div>`;

  _setupDrag('zone-svg');

  const zoneName = panel.querySelector('.mst2-zone-name-color[data-zone-color]');
  if (zoneName?.dataset?.zoneColor) {
    zoneName.style.setProperty('--zone-color', zoneName.dataset.zoneColor);
  }

  // Back button
  document.getElementById('btn-back-world')?.addEventListener('click', () => {
    _mapLevel = 1; renderTier1(G, actions);
  });

  // Location clicks
  panel.querySelectorAll('.znode:not(.znode-locked)').forEach(g => {
    g.addEventListener('click', () => {
      const lid = g.dataset.lid;
      const loc = zone.locations.find(l=>l.id===lid);
      if (!loc) return;
      // Update side panel info
      _updateLocInfo(G, loc, actions);
    });
  });

  updateMapStats(G);
}