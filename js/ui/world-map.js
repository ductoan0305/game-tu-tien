// ============================================================
// ui/world-map.js — Map render (Tier1, Tier2)
// Location Popup → ui/location-popup.js
// Starter Village → ui/starter-village.js
// ============================================================
import { bus } from '../utils/helpers.js';
import { addChronicle } from '../core/time-engine.js';
import { moveToPhapDia } from '../core/phap-dia.js';
import { calcMaxQi, calcQiRate } from '../core/state.js';
import { getAvailableEnemies } from '../combat/combat-engine.js';
import { checkAmbush, getAvailableTargets, robTarget, getNghiepLucPenalty } from '../core/kiep-tu-engine.js';
import { _showLocationPopup, _setupDrag } from './location-popup.js';
import { renderStarterVillage, rollStarterVillage } from './starter-village.js';
// Re-export để backward compat (các file khác import từ world-map.js)
export { renderStarterVillage, rollStarterVillage };
import { WORLD_NODES, ZONE_DATA } from './map-data.js';
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
  const rateEl  = document.getElementById('map-stat-rate');
  const ageEl   = document.getElementById('map-stat-age');
  const stoneEl = document.getElementById('map-stat-stone');

  // Hiển thị tốc độ thực (X/s) thay vì hệ số nhân
  if (rateEl) {
    const rate = calcQiRate(G);
    const newText = G.meditating ? `${rate}/s 🧘` : `${rate}/s`;
    if (rateEl.textContent !== newText) rateEl.textContent = newText;
  }
  if (ageEl && G.gameTime) {
    const newAge = String(Math.floor(G.gameTime.currentYear));
    if (ageEl.textContent !== newAge) ageEl.textContent = newAge;
  }
  if (stoneEl) {
    const newStone = Math.floor(G.stone||0).toLocaleString();
    if (stoneEl.textContent !== newStone) stoneEl.textContent = newStone;
  }
}

// ============================================================
// TẦNG 1 — WORLD MAP
// ============================================================

// Nút Đột Phá — hiển thị khi đủ điều kiện
function _renderBreakthroughBtn(G) {
  const maxQi  = calcMaxQi(G);
  const pctFull = G.qi >= maxQi;
  const pctVal  = Math.floor(Math.min(100, (G.qi / Math.max(1, maxQi)) * 100));
  return `
    <button id="btn-breakthrough"
      class="btn-breakthrough-map ${pctFull ? 'ready' : ''}"
      ${pctFull ? '' : 'disabled'}
      title="${pctFull ? 'Linh lực đầy — có thể đột phá!' : `Tích lũy linh lực để đột phá (${pctVal}%)`}">
      ${pctFull ? '⚡ ĐỘT PHÁ — SẴN SÀNG!' : `⚡ Đột Phá (${pctVal}%)`}
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
    <div class="kt-nghiep-row" style="background:${nl>=60?'#e05c4a22':'#f0d47a11'};border:1px solid ${nl>=60?'#e05c4a44':'#f0d47a33'};border-radius:6px;padding:6px 8px;margin-bottom:6px;font-size:11px">
      <span style="color:${nl>=60?'#e05c4a':'#f0d47a'}">${penalty.label}</span>
      <span style="color:var(--text-dim);margin-left:6px">Nghiệp Lực: ${Math.floor(nl)}/100</span>
      ${penalty.qiPenalty > 0 ? `<div style="color:#e05c4a;font-size:10px;margin-top:2px">⚡ Tu tốc -${Math.floor(penalty.qiPenalty*100)}%</div>` : ''}
    </div>` : '';

  // Nút chủ động cướp
  const targetsHtml = targets.length > 0 ? `
    <div class="kt-section">
      <div class="kt-section-title" style="font-size:11px;color:#e05c4a;margin-bottom:6px">🗡 Phục Kích</div>
      ${targets.map(t => `
        <div class="kt-target-row" style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-size:14px">${t.emoji}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;font-weight:600;color:#ddd">${t.name}</div>
            <div style="font-size:10px;color:var(--text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.desc}</div>
          </div>
          <button class="btn-kieptu-rob" data-target-id="${t.id}"
            style="font-size:10px;padding:3px 8px;background:#e05c4a22;border:1px solid #e05c4a66;color:#e05c4a;border-radius:4px;cursor:pointer;white-space:nowrap">
            🗡 Cướp
          </button>
        </div>`).join('')}
    </div>` : '';

  if (!targetsHtml && !nghiepHtml) return '';

  return `
    <div class="kt-panel" style="margin:8px 0;padding:8px;background:rgba(224,92,74,0.06);border:1px solid rgba(224,92,74,0.2);border-radius:8px">
      <div style="font-size:11px;color:#e05c4a;font-weight:600;margin-bottom:6px">劫修 Kiếp Tu</div>
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
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center';

  modal.innerHTML = `
    <div style="background:#0d1828;border:2px solid #e05c4a;border-radius:12px;padding:24px;max-width:320px;width:90%;text-align:center">
      <div style="font-size:40px;margin-bottom:12px">${kiepTu.emoji}</div>
      <div style="font-size:16px;font-weight:700;color:#e05c4a;margin-bottom:8px">
        ${isDoan ? '⚠ BỊ KIẾP ĐOÀN PHỤC KÍCH!' : '⚠ BỊ KIẾP TU CHẶN ĐƯỜNG!'}
      </div>
      <div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:6px">${kiepTu.name}</div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">${kiepTu.desc}</div>
      ${isDoan ? `<div style="font-size:11px;color:#f0d47a;margin-bottom:12px">Kiếp Đoàn ${kiepTu.waveCount} đợt sóng tấn công!</div>` : ''}
      <div style="font-size:11px;color:#aaa;margin-bottom:16px">
        Thua → mất 20–40% linh thạch và 1 vật phẩm ngẫu nhiên
      </div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button id="btn-ambush-fight" style="padding:10px 20px;background:#e05c4a;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">
          ⚔ Nghênh Chiến
        </button>
        <button id="btn-ambush-flee" style="padding:10px 20px;background:#333;color:#aaa;border:1px solid #555;border-radius:8px;font-size:13px;cursor:pointer">
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

function renderTier1(G, actions) {
  const panel = document.getElementById('panel-cultivate');
  if (!panel) return;
  panel.className = 'center-panel map-panel';

  const REALM_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
  const currentNodeId = G.worldMap?.currentNodeId || 'thanh_van_son';

  // Build connections SVG
  const connSvg = WORLD_NODES.flatMap(n =>
    (n.connections||[]).map(toId => {
      const to = WORLD_NODES.find(x=>x.id===toId);
      if (!to || to.id < n.id) return '';
      return `<line x1="${n.x}" y1="${n.y}" x2="${to.x}" y2="${to.y}"
        stroke="rgba(255,255,255,0.1)" stroke-width="1.5" stroke-dasharray="5,4"/>`;
    })
  ).join('');

  // Build nodes SVG
  const nodesSvg = WORLD_NODES.map(n => {
    const isCur  = n.id === currentNodeId;
    const locked = G.realmIdx < (n.unlockRealm||0) ||
                   (n.unlockStage && G.stage < n.unlockStage) ||
                   (n.needCoDuyen && !G.worldMap?.discovered?.[n.id]);
    const op = locked ? '0.3' : '1';
    return `
      <g class="wnode${locked?' wnode-locked':''}" data-nid="${n.id}"
         style="cursor:${locked?'not-allowed':'pointer'};opacity:${op}">
        <circle cx="${n.x}" cy="${n.y}" r="26"
          fill="rgba(5,10,20,0.9)" stroke="${isCur?n.color:'rgba(255,255,255,0.2)'}"
          stroke-width="${isCur?2.5:1.5}"/>
        ${isCur?`<circle cx="${n.x}" cy="${n.y}" r="30" fill="none"
          stroke="${n.color}" stroke-width="1" opacity="0.5">
          <animate attributeName="r" values="26;33;26" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>`:''}
        <text x="${n.x}" y="${n.y+6}" text-anchor="middle" font-size="16">${n.emoji}</text>
        <text x="${n.x}" y="${n.y+42}" text-anchor="middle" font-size="9.5"
          fill="${isCur?n.color:'#bbb'}" font-weight="${isCur?'bold':'normal'}">${n.name}</text>
        ${locked&&n.unlockRealm?`<text x="${n.x}" y="${n.y+54}" text-anchor="middle" font-size="8" fill="#666">🔒 ${REALM_NAMES[n.unlockRealm]}</text>`:''}
        ${n.entryCost>0&&!locked?`<text x="${n.x}" y="${n.y+54}" text-anchor="middle" font-size="8" fill="#f0d47a">💎${n.entryCost}</text>`:''}
      </g>`;
  }).join('');

  const curNode = WORLD_NODES.find(n=>n.id===currentNodeId);

  panel.innerHTML = `
    <div class="map-wrap-t1">
      <div class="map-svg-t1" id="map-svg-t1">
        <svg id="world-svg" viewBox="0 0 560 500" xmlns="http://www.w3.org/2000/svg"
             style="width:100%;height:100%;cursor:grab">
          <defs>
            <filter id="glow-node">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <radialGradient id="map-bg-grad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stop-color="#0d1828"/>
              <stop offset="100%" stop-color="#060810"/>
            </radialGradient>
            <pattern id="grid-pat" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M50 0L0 0 0 50" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="560" height="500" fill="url(#map-bg-grad)"/>
          <rect width="560" height="500" fill="url(#grid-pat)"/>
          <text x="280" y="20" text-anchor="middle" font-size="10" fill="rgba(200,168,75,0.5)" letter-spacing="4">✦ PHÀM NHÂN GIỚI ✦</text>
          ${connSvg}
          ${nodesSvg}
        </svg>
      </div>
      <div class="map-side-t1">
        <div class="mst1-loc" style="border-color:${curNode?.color||'#444'}44">
          <div style="font-size:22px">${curNode?.emoji||'?'}</div>
          <div>
            <div style="font-size:13px;font-weight:600;color:${curNode?.color||'#fff'}">${curNode?.name||'--'}</div>
            <div style="font-size:11px;color:var(--text-dim);margin-top:2px">${curNode?.desc||''}</div>
          </div>
        </div>
        <button class="btn-enter-zone btn-primary" id="btn-enter-zone">
          🚶 Vào ${curNode?.name||'vùng đất'} →
        </button>
        <div id="btn-breakthrough-wrap">
          ${_renderBreakthroughBtn(G)}
        </div>
        ${_renderKiepTuPanel(G)}
        <div class="mst1-stats">
          <div class="mst1-s"><span>⚡ Tu tốc</span><strong id="map-stat-rate">--</strong></div>
          <div class="mst1-s"><span>⏳ Tuổi</span><strong id="map-stat-age">--</strong></div>
          <div class="mst1-s"><span>💎</span><strong id="map-stat-stone">--</strong></div>
        </div>
        <div class="mst1-hint">Click vào node để di chuyển<br>Bấm "Vào vùng đất" để khám phá</div>
      </div>
    </div>`;

  // Drag support
  _setupDrag('world-svg');

  // Node click → di chuyển + highlight + check phục kích
  panel.querySelectorAll('.wnode:not(.wnode-locked)').forEach(g => {
    g.addEventListener('click', () => {
      const nid = g.dataset.nid;
      const node = WORLD_NODES.find(n=>n.id===nid);
      if (!node) return;
      if (node.entryCost > 0 && (G.stone||0) < node.entryCost) {
        actions.toast(`Cần ${node.entryCost}💎 để vào ${node.name}`, 'danger'); return;
      }
      if (node.entryCost > 0) G.stone -= node.entryCost;
      if (!G.worldMap) G.worldMap = { currentNodeId:'thanh_van_son' };
      G.worldMap.currentNodeId = nid;
      addChronicle(G, `Di chuyển đến ${node.name}.`);
      bus.emit('map:moved', { node });

      // Kiểm tra bị phục kích khi di chuyển
      const ambush = checkAmbush(G);
      if (ambush.triggered) {
        bus.emit('kieptu:ambush', { kiepTu: ambush.kiepTu });
        _showAmbushAlert(G, ambush.kiepTu, actions);
        return; // không re-render ngay — chờ combat xong
      }

      renderTier1(G, actions);
    });
  });

  // Enter zone button
  document.getElementById('btn-enter-zone')?.addEventListener('click', () => {
    _mapLevel = 2;
    _currentZoneId = G.worldMap?.currentNodeId || 'thanh_van_son';
    renderTier2(G, actions, _currentZoneId);
  });

  // Breakthrough button — dùng event delegation vì nút refresh theo tick
  document.getElementById('btn-breakthrough-wrap')?.addEventListener('click', (e) => {
    if (e.target.closest('#btn-breakthrough:not([disabled])')) {
      actions.breakthrough?.();
    }
  });

  // Kiếp Tu — chủ động cướp NPC
  panel.querySelectorAll('.btn-kieptu-rob').forEach(btn => {
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

  updateMapStats(G);
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

  const REALM_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa'];

  // Build location SVG nodes
  const locSvg = zone.locations.map(loc => {
    const locked = _isLocLocked(G, loc);
    const op = locked ? '0.35' : '1';
    return `
      <g class="znode${locked?' znode-locked':''}" data-lid="${loc.id}"
         style="cursor:${locked?'not-allowed':'pointer'};opacity:${op}">
        <circle cx="${loc.x}" cy="${loc.y}" r="24"
          fill="rgba(5,10,20,0.92)" stroke="${locked?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.4)'}" stroke-width="1.5"/>
        <text x="${loc.x}" y="${loc.y+6}" text-anchor="middle" font-size="16">${loc.emoji}</text>
        <text x="${loc.x}" y="${loc.y+40}" text-anchor="middle" font-size="9"
          fill="${locked?'#555':'#ccc'}">${loc.name.length>8?loc.name.slice(0,8)+'…':loc.name}</text>
        ${locked&&loc.requireSect?`<text x="${loc.x}" y="${loc.y+52}" text-anchor="middle" font-size="7.5" fill="#555">🔒 Nội môn</text>`:''}
        ${locked&&loc.requireRealm?`<text x="${loc.x}" y="${loc.y+52}" text-anchor="middle" font-size="7.5" fill="#555">🔒 ${REALM_NAMES[loc.requireRealm]}</text>`:''}
      </g>`;
  }).join('');

  panel.innerHTML = `
    <div class="map-wrap-t2">
      <div class="map-svg-t2" id="map-svg-t2">
        <svg id="zone-svg" viewBox="0 0 500 390" xmlns="http://www.w3.org/2000/svg"
             style="width:100%;height:100%;cursor:grab">
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
        <div class="mst2-zone-name" style="color:${worldNode.color}">${worldNode.emoji} ${worldNode.name}</div>
        <div class="mst2-zone-desc">${worldNode.desc}</div>
        <div class="mst2-loc-info" id="mst2-loc-info">
          <div style="color:var(--text-dim);font-size:11px;font-style:italic;margin-top:8px">
            Click vào địa điểm để xem chi tiết
          </div>
        </div>
        <div class="mst1-stats" style="margin-top:auto;padding-top:8px;border-top:1px solid var(--border)">
          <div class="mst1-s"><span>⚡</span><strong id="map-stat-rate">--</strong></div>
          <div class="mst1-s"><span>⏳</span><strong id="map-stat-age">--</strong></div>
          <div class="mst1-s"><span>💎</span><strong id="map-stat-stone">--</strong></div>
        </div>
      </div>
    </div>`;

  _setupDrag('zone-svg');

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