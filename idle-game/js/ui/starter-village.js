// ============================================================
// ui/starter-village.js — Làng khởi đầu Tân Thủ
// Nền gradient: dùng CSS trên lớp HTML (SVG fill không hỗ trợ linear-gradient).
// ============================================================
import { STARTER_VILLAGES, _setupDrag, _handleLocAction } from './location-popup.js';
import { svgZoneLocLabel } from './map-data.js';
import { getNpcPendingQuest } from '../quest/quest-engine.js';
// L7 — H3: Secret zone unlock indicator
import { NPC_REWARDS } from '../core/npc-data.js';

export function rollStarterVillage() {
  return STARTER_VILLAGES[Math.floor(Math.random() * STARTER_VILLAGES.length)];
}

function _pathLinks(locs, accent) {
  const cx = 250;
  const cy = 218;
  return locs.map(loc => {
    const mx = (cx + loc.x) / 2 + (loc.y - cy) * 0.06;
    const my = (cy + loc.y) / 2 - (loc.x - cx) * 0.04;
    return `<path d="M${cx},${cy} Q${mx},${my} ${loc.x},${loc.y}" fill="none" stroke="${accent}" stroke-opacity="0.14" stroke-width="1" stroke-dasharray="3,6"/>`;
  }).join('');
}

/** Hạt linh khí — SMIL, nhẹ, không ảnh hưởng tương tác */
const _LINGQI_PTS = [
  [72, 88], [428, 95], [250, 155], [118, 228], [382, 242],
  [250, 318], [190, 118], [310, 128], [95, 300], [405, 305],
  [250, 52], [48, 195], [452, 188], [165, 68], [335, 72],
];

function _lingQiParticles(accent) {
  return _LINGQI_PTS.map(([x, y], i) => {
    const r = 1.1 + (i % 4) * 0.35;
    const dur = 9 + (i % 5) * 1.4;
    const yf = y + (i % 2 === 0 ? -10 : 8);
    return `
      <circle cx="${x}" cy="${y}" r="${r}" fill="${accent}" opacity="0">
        <animate attributeName="opacity" values="0;0.22;0.08;0.18;0;0.15;0" dur="${dur}s" repeatCount="indefinite" begin="${i * 0.35}s"/>
        <animate attributeName="cy" values="${y};${yf};${y + 4};${y}" dur="${dur + 3}s" repeatCount="indefinite" begin="${i * 0.2}s"/>
        <animate attributeName="cx" values="${x};${x + (i % 3 - 1) * 6};${x}" dur="${dur + 5}s" repeatCount="indefinite"/>
      </circle>`;
  }).join('');
}

/** Trang trí theo từng thôn (SVG, trong <defs> đã có gradient riêng) */
function _backdropDecor(vid) {
  switch (vid) {
    case 'lam_hai_thon':
      return `
        <g class="sv-decor" opacity="0.55" pointer-events="none">
          <ellipse cx="120" cy="300" rx="90" ry="40" fill="url(#sv-deco-glow-${vid})"/>
          <ellipse cx="380" cy="295" rx="70" ry="35" fill="url(#sv-deco-glow-${vid})"/>
          <path d="M0 288 Q125 268 250 282 T500 276 L500 390 L0 390 Z" fill="url(#sv-deco-water-${vid})"/>
          <path d="M0 305 Q100 295 200 308 T400 302 T500 312" stroke="rgba(130,200,255,0.2)" fill="none" stroke-width="0.9"/>
          <path d="M0 325 Q150 312 300 326 T500 332" stroke="rgba(90,160,220,0.12)" fill="none" stroke-width="0.7"/>
        </g>`;
    case 'thanh_phong_thon':
      return `
        <g class="sv-decor" opacity="0.45" pointer-events="none">
          <ellipse cx="250" cy="95" rx="180" ry="55" fill="url(#sv-deco-glow-${vid})"/>
          <path d="M40 120 Q250 40 460 120" stroke="rgba(100,200,120,0.15)" fill="none" stroke-width="1.2"/>
          <circle cx="90" cy="200" r="3" fill="rgba(180,255,200,0.12)"/>
          <circle cx="410" cy="180" r="2.5" fill="rgba(180,255,200,0.1)"/>
          <circle cx="300" cy="95" r="2" fill="rgba(200,255,220,0.15)"/>
        </g>`;
    case 'hoa_diem_thon':
      return `
        <g class="sv-decor" opacity="0.5" pointer-events="none">
          <ellipse cx="250" cy="360" rx="200" ry="50" fill="url(#sv-deco-ember-${vid})"/>
          <path d="M80 100 L100 140 M420 110 L400 150 M250 70 L250 100" stroke="rgba(255,140,60,0.2)" stroke-width="1"/>
        </g>`;
    case 'han_bang_thon':
      return `
        <g class="sv-decor" opacity="0.4" pointer-events="none">
          <ellipse cx="250" cy="100" rx="190" ry="60" fill="url(#sv-deco-frost-${vid})"/>
          <path d="M60 130 L80 125 M400 125 L420 130 M200 90 L210 88" stroke="rgba(180,220,255,0.2)" stroke-width="0.8"/>
        </g>`;
    default:
      return '';
  }
}

function _defsBlock(village) {
  const vid = village.id;
  const ac = village.color;
  return `
    <defs>
      <radialGradient id="sv-deco-glow-${vid}" cx="50%" cy="50%" r="0.7">
        <stop offset="0%" stop-color="${ac}" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="${ac}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="sv-deco-water-${vid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a6a9a" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#050a12" stop-opacity="0.75"/>
      </linearGradient>
      <radialGradient id="sv-deco-ember-${vid}" cx="50%" cy="0%" r="0.9">
        <stop offset="0%" stop-color="#ff6a20" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#200500" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="sv-deco-frost-${vid}" cx="50%" cy="100%" r="0.8">
        <stop offset="0%" stop-color="#a8d8ff" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#000a15" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="sv-mist-${vid}" cx="50%" cy="42%" r="0.55">
        <stop offset="0%" stop-color="rgba(255,255,255,0.07)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
      <linearGradient id="sv-node-grad-${vid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>
        <stop offset="50%" stop-color="rgba(255,255,255,0.04)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.5)"/>
      </linearGradient>
      <filter id="sv-node-glow-${vid}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
}

function _buildLocNodes(village, G) {
  const vid = village.id;
  const ac = village.color;
  return village.locations.map(loc => {
    const isExit = loc.type === 'exit';
    const exitLocked = isExit && !(G.worldMap?.starterQuestDone);
    const strokeMain = isExit ? (exitLocked ? '#555' : ac) : ac;
    const opRing = isExit ? (exitLocked ? 0.2 : 0.45) : 0.28;

    // S-D: Indicator "!" khi NPC có quest chờ giao
    const hasQuestIndicator = loc.type === 'npc' && loc.npcId
      ? getNpcPendingQuest(G, loc.npcId) !== null
      : false;

    // L7 — H3: Indicator "🗝" khi NPC đã mở khóa secret zone (tier 2 reward)
    const npcReward = loc.type === 'npc' && loc.npcId ? NPC_REWARDS[loc.npcId] : null;
    const secretZoneId = npcReward?.tier2_secret?.zoneId;
    const hasSecretZoneUnlocked = secretZoneId
      ? (G.flags?.unlockedSecretZones?.[secretZoneId] === true)
      : false;

    return `
      <g class="znode${exitLocked ? ' znode-locked' : ''}" data-lid="${loc.id}"
         data-locked="${exitLocked ? '1' : '0'}">
        <circle cx="${loc.x}" cy="${loc.y}" r="34" fill="none" stroke="${ac}" stroke-opacity="0.06" stroke-width="1"/>
        <circle cx="${loc.x}" cy="${loc.y}" r="29" fill="none" stroke="${strokeMain}" stroke-opacity="${opRing}" stroke-width="${isExit ? 2 : 1.2}"
          stroke-dasharray="${exitLocked ? '4 3' : '0'}"/>
        <circle cx="${loc.x}" cy="${loc.y}" r="26" fill="url(#sv-node-grad-${vid})" stroke="${strokeMain}" stroke-opacity="0.65" stroke-width="1.4"
          filter="url(#sv-node-glow-${vid})"/>
        <text x="${loc.x}" y="${loc.y + 6}" text-anchor="middle" font-size="17">${loc.emoji}</text>
        ${svgZoneLocLabel(loc.name, loc.x, loc.y + 42, { fill: isExit && !exitLocked ? '#f0d47a' : '#d8dce4', fontSize: 8.5 })}
        ${exitLocked ? `<text x="${loc.x}" y="${loc.y + 54}" text-anchor="middle" font-size="7.5" fill="#8899aa">🔒 Quest</text>` : ''}
        ${hasQuestIndicator ? `
          <circle cx="${loc.x + 18}" cy="${loc.y - 18}" r="9" fill="#f0d47a" stroke="#1a1506" stroke-width="1.5"/>
          <text x="${loc.x + 18}" y="${loc.y - 14}" text-anchor="middle" font-size="11" font-weight="bold" fill="#1a1506">!</text>
        ` : ''}
        ${hasSecretZoneUnlocked ? `
          <circle cx="${loc.x - 18}" cy="${loc.y - 18}" r="8" fill="#2a1a00" stroke="#d4a843" stroke-width="1.2" opacity="0.9"/>
          <text x="${loc.x - 18}" y="${loc.y - 13}" text-anchor="middle" font-size="9">🗝</text>
        ` : ''}
      </g>`;
  }).join('');
}

// ============================================================
// Drag helper cho sv-side-popup (absolute position trong map container)
// ============================================================
function _makeSvPopupDraggable(popupEl, handleEl) {
  if (!handleEl || !popupEl) return;
  let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;

  function startDrag(cx, cy) {
    ox = popupEl.offsetLeft;
    oy = popupEl.offsetTop;
    sx = cx; sy = cy;
    dragging = true;
    handleEl.style.cursor = 'grabbing';
  }

  function moveDrag(cx, cy) {
    if (!dragging) return;
    const parent = popupEl.offsetParent || document.body;
    const maxX = parent.offsetWidth  - popupEl.offsetWidth;
    const maxY = parent.offsetHeight - popupEl.offsetHeight;
    const nx = Math.max(0, Math.min(maxX, ox + (cx - sx)));
    const ny = Math.max(0, Math.min(maxY, oy + (cy - sy)));
    popupEl.style.left  = nx + 'px';
    popupEl.style.top   = ny + 'px';
    popupEl.style.right = 'auto';
  }

  function endDrag() {
    dragging = false;
    handleEl.style.cursor = 'grab';
  }

  handleEl.addEventListener('mousedown', (e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); });
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  handleEl.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchend', endDrag);
}

// Render Zone Map cho tân thủ thôn
export function renderStarterVillage(G, actions) {
  const panel = document.getElementById('panel-cultivate');
  if (!panel) return;

  const villageId = G.worldMap?.starterVillageId || 'thanh_phong_thon';
  const village = STARTER_VILLAGES.find(v => v.id === villageId) || STARTER_VILLAGES[0];

  if (!G.worldMap) G.worldMap = {};
  if (village.nearZone) G.worldMap.currentNodeId = village.nearZone;

  const vid = village.id;
  const locSvg = _buildLocNodes(village, G);
  const svgInner = `
    ${_defsBlock(village)}
    <rect width="500" height="390" fill="transparent"/>
    <ellipse cx="250" cy="185" rx="210" ry="130" fill="url(#sv-mist-${vid})" opacity="0.85" pointer-events="none"/>
    ${_backdropDecor(vid)}
    <g class="sv-lingqi" pointer-events="none">${_lingQiParticles(village.color)}</g>
    <g class="sv-links" pointer-events="none">${_pathLinks(village.locations, village.color)}</g>
    ${locSvg}`;

  panel.className = 'center-panel map-panel';
  panel.innerHTML = `
    <div class="map-wrap-t2 map-wrap-starter">
      <div class="map-svg-t2 starter-village-scene" id="map-svg-village" data-sv-bg="${village.bg}" data-sv-accent="${village.color}">
        <div class="starter-village-aura" aria-hidden="true"></div>
        <div class="starter-village-vignette" aria-hidden="true"></div>
        <div class="starter-village-frame" aria-hidden="true"></div>
        <div class="starter-village-titlebar">
          <span class="starter-village-emoji">${village.emoji}</span>
          <div class="starter-village-titles">
            <span class="starter-village-name">${village.name}</span>
            <span class="starter-village-badge">Tân thủ · An cư</span>
          </div>
        </div>
        <svg id="village-svg" class="starter-village-svg" viewBox="0 0 500 390" xmlns="http://www.w3.org/2000/svg">
          ${svgInner}
        </svg>
      </div>
      <!-- Floating info popup — draggable, có close button, dùng class riêng sv-side-popup -->
      <div class="sv-side-popup" id="sv-side-popup" data-sv-accent="${village.color}">
        <div class="sv-popup-header" id="sv-popup-drag-handle">
          <span class="sv-popup-drag-hint">⠿</span>
          <span class="sv-popup-title">${village.emoji} ${village.name}</span>
          <button class="sv-popup-close" id="sv-popup-close" title="Đóng">✕</button>
        </div>
        <div class="sv-popup-body">
          <div class="mst2-zone-desc">${village.desc}</div>
          <div class="village-map-hint">Bấm <strong>Bản Đồ</strong> dưới thanh điều hướng để xem toàn Phàm Nhân Giới.</div>
          <div class="mst2-loc-info" id="mst2-loc-info">
            <div class="starter-village-side-hint">Chọn địa điểm trên sơ đồ để tương tác</div>
          </div>
        </div>
      </div>
    </div>`;

  const svgEl = document.getElementById('village-svg');
  if (svgEl) _setupDrag('village-svg');

  // Apply CSS variables cho scene và popup accent color
  const sceneEl = panel.querySelector('.starter-village-scene[data-sv-bg][data-sv-accent]');
  if (sceneEl?.dataset?.svBg) {
    sceneEl.style.background = sceneEl.dataset.svBg;
    if (sceneEl.dataset.svAccent) sceneEl.style.setProperty('--sv-accent', sceneEl.dataset.svAccent);
  }
  const sidePopup = document.getElementById('sv-side-popup');
  if (sidePopup?.dataset?.svAccent) {
    sidePopup.style.setProperty('--sv-accent', sidePopup.dataset.svAccent);
  }

  // Drag cho popup
  const dragHandle = document.getElementById('sv-popup-drag-handle');
  if (sidePopup && dragHandle) _makeSvPopupDraggable(sidePopup, dragHandle);

  // Close button
  document.getElementById('sv-popup-close')?.addEventListener('click', () => {
    if (sidePopup) sidePopup.style.display = 'none';
  });

  panel.querySelectorAll('.znode:not(.znode-locked)').forEach(g => {
    g.addEventListener('click', () => {
      const lid = g.dataset.lid;
      const loc = village.locations.find(l => l.id === lid);
      if (!loc) return;

      if (loc.type === 'exit') {
        if (!G.worldMap) G.worldMap = {};
        G.worldMap.leftStarter = true;
        G.worldMap.currentNodeId = village.nearZone || 'thanh_van_son';
        actions.toast(`🚶 Rời ${village.name}, bước vào thế giới rộng lớn!`, 'jade');
        window._renderWorldMap?.(G, actions);
        return;
      }

      // Hiện popup nếu đang ẩn (sau khi bấm close)
      if (sidePopup && sidePopup.style.display === 'none') {
        sidePopup.style.display = '';
      }

      const el = document.getElementById('mst2-loc-info');
      if (el) {
        const actionBtns = _getStarterLocBtns(loc);
        el.innerHTML = `
          <div class="mst2-loc-card starter-loc-card">
            <div class="mst2-lc-header">
              <span class="sv-loc-emoji">${loc.emoji}</span>
              <div>
                <div class="sv-loc-name">${loc.name}</div>
                <div class="sv-loc-desc">${loc.desc}</div>
              </div>
            </div>
            <div class="mst2-lc-actions">${actionBtns}</div>
          </div>`;
        el.querySelectorAll('.loc-action-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            _handleLocAction(G, loc, btn.dataset.act, actions);
          });
        });
      }
    });
  });
}

function _getStarterLocBtns(loc) {
  const map = {
    npc:        [['npc','💬 Nói Chuyện']],
    market:     [['shop','🏪 Mua Sắm']],
    hunt_zone:  [['combat','⚔ Săn Thú'],['gather','🌿 Thu Thập']],
    gather_zone:[['gather','🌿 Thu Thảo']],
    exit:       [['exit','🚪 Rời Thôn']],
  };
  return (map[loc.type]||[]).map(([act,label]) =>
    `<button class="loc-action-btn" data-act="${act}">${label}</button>`
  ).join('');
}
