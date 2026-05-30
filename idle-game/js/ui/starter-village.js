// ============================================================
// ui/starter-village.js — Làng khởi đầu Tân Thủ
// Painted Scroll style (Phase 6): parchment + symbols + cloud border.
// SVG defs reuse từ MAP_DEFS (map-defs.js).
// ============================================================
import { STARTER_VILLAGES, _setupDrag, _handleLocAction } from './location-popup.js';
import { svgZoneLocLabel, KHUYETVUC_TERRITORIES, FACTION_COLORS } from './map-data.js';
import {
  MAP_DEFS, parchmentBackground, cloudBorder, vignette, agedSpots, renderStamp,
} from './map-defs.js';
import { getNpcPendingQuest } from '../quest/quest-engine.js';
// L7 — H3: Secret zone unlock indicator
import { NPC_REWARDS } from '../core/npc-data.js';

export function rollStarterVillage() {
  return STARTER_VILLAGES[Math.floor(Math.random() * STARTER_VILLAGES.length)];
}

/**
 * Per-village decor: ink stamp + hero terrain symbols phù hợp theme.
 * - inkGrad: m-grad-ink-* key cho stamp
 * - stampChar: chữ Hán đại diện
 * - hero: array of <use> symbols cho background terrain
 */
const SV_VILLAGE_DECOR = {
  thanh_phong_thon: {
    inkGrad: 'trung', stampChar: '青', inkLight: '#0A4838',
    bgTint: 'rgba(140,180,120,0.40)',
    hero: [
      '<use href="#m-sym-forest"   x="20"  y="320" width="50" height="26" opacity="0.78"/>',
      '<use href="#m-sym-forest"   x="80"  y="335" width="44" height="22" opacity="0.72"/>',
      '<use href="#m-sym-mt-peak"  x="380" y="58"  width="32" height="28" opacity="0.65"/>',
      '<use href="#m-sym-mt-peak"  x="410" y="70"  width="28" height="24" opacity="0.60"/>',
      '<use href="#m-sym-herb"     x="55"  y="358" width="22" height="18" opacity="0.7"/>',
      '<use href="#m-sym-herb"     x="430" y="358" width="22" height="18" opacity="0.7"/>',
    ],
  },
  hoa_diem_thon: {
    inkGrad: 'ma', stampChar: '炎', inkLight: '#5A0810',
    bgTint: 'rgba(200,120,80,0.40)',
    hero: [
      '<use href="#m-sym-volcano"  x="40"  y="55"  width="50" height="60" opacity="0.78"/>',
      '<use href="#m-sym-mt-ridge" x="380" y="55"  width="80" height="38" opacity="0.7"/>',
      '<use href="#m-sym-mt-peak"  x="20"  y="320" width="30" height="26" opacity="0.6"/>',
      '<use href="#m-sym-mt-peak"  x="450" y="328" width="30" height="26" opacity="0.6"/>',
    ],
  },
  han_bang_thon: {
    inkGrad: 'chinh', stampChar: '寒', inkLight: '#3A5878',
    bgTint: 'rgba(170,195,215,0.40)',
    hero: [
      '<use href="#m-sym-mt-ridge" x="20"  y="42"  width="90" height="40" opacity="0.78"/>',
      '<use href="#m-sym-mt-peak"  x="380" y="50"  width="36" height="32" opacity="0.7"/>',
      '<use href="#m-sym-mt-peak"  x="420" y="62"  width="30" height="26" opacity="0.65"/>',
      '<use href="#m-sym-cave"     x="20"  y="325" width="36" height="28" opacity="0.65"/>',
      '<use href="#m-sym-cave"     x="450" y="335" width="32" height="24" opacity="0.6"/>',
    ],
  },
  lam_hai_thon: {
    inkGrad: 'gold', stampChar: '泽', inkLight: '#604008',
    bgTint: 'rgba(130,180,200,0.42)',
    hero: [
      '<use href="#m-sym-island"   x="20"  y="335" width="40" height="22" opacity="0.78"/>',
      '<use href="#m-sym-island"   x="430" y="345" width="44" height="22" opacity="0.78"/>',
      '<use href="#m-sym-forest"   x="80"  y="60"  width="44" height="22" opacity="0.65"/>',
      '<use href="#m-sym-forest"   x="380" y="55"  width="44" height="22" opacity="0.65"/>',
      '<use href="#m-sym-herb"     x="60"  y="360" width="22" height="18" opacity="0.7"/>',
    ],
  },
};

/** Map location.type → SVG symbol id (Painted Scroll). */
const SV_LOC_TYPE_SYMBOL = {
  sect_gate:   'm-sym-pagoda',
  npc:         'm-sym-person',
  market:      'm-sym-market',
  hunt_zone:   'm-sym-swords',
  gather_zone: 'm-sym-herb',
  exit:        'm-sym-gate',
};

/** Symbol bounding box theo loại — sect_gate to nhất */
function _svSymBox(type) {
  if (type === 'sect_gate')  return { w: 44, h: 44, yOff: 22 };
  if (type === 'market')     return { w: 36, h: 28, yOff: 14 };
  if (type === 'exit')       return { w: 32, h: 28, yOff: 14 };
  if (type === 'npc')        return { w: 22, h: 26, yOff: 13 };
  if (type === 'hunt_zone')  return { w: 28, h: 28, yOff: 14 };
  if (type === 'gather_zone')return { w: 26, h: 24, yOff: 12 };
  return { w: 28, h: 28, yOff: 14 };
}

/** Dotted bezier links từ village center hub (cx,cy) đến mỗi location */
function _pathLinks(locs) {
  const cx = 250;
  const cy = 218;
  return locs.map(loc => {
    const mx = (cx + loc.x) / 2 + (loc.y - cy) * 0.06;
    const my = (cy + loc.y) / 2 - (loc.x - cx) * 0.04;
    return `<path d="M${cx},${cy} Q${mx},${my} ${loc.x},${loc.y}" fill="none" stroke="#7A5018" stroke-opacity="0.45" stroke-width="0.9" stroke-dasharray="2.5,3.5"/>`;
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
        <animate attributeName="opacity" values="0;0.32;0.12;0.25;0;0.18;0" dur="${dur}s" repeatCount="indefinite" begin="${i * 0.35}s"/>
        <animate attributeName="cy" values="${y};${yf};${y + 4};${y}" dur="${dur + 3}s" repeatCount="indefinite" begin="${i * 0.2}s"/>
        <animate attributeName="cx" values="${x};${x + (i % 3 - 1) * 6};${x}" dur="${dur + 5}s" repeatCount="indefinite"/>
      </circle>`;
  }).join('');
}

/** Trang trí theo từng thôn — Painted Scroll: hero terrain symbols + base tint */
function _backdropDecor(vid) {
  const decor = SV_VILLAGE_DECOR[vid] || SV_VILLAGE_DECOR.thanh_phong_thon;
  const tint = `<rect width="500" height="390" fill="${decor.bgTint}" opacity="0.6" pointer-events="none"/>`;
  const heroSvg = decor.hero
    .map(s => s.replace(/<use/, '<use pointer-events="none"'))
    .join('');
  return tint + heroSvg;
}

/** Build location nodes — symbol-based (no emoji), drop shadow, lock/secret indicators */
function _buildLocNodes(village, G) {
  const vid = village.id;
  const decor = SV_VILLAGE_DECOR[vid] || SV_VILLAGE_DECOR.thanh_phong_thon;
  return village.locations.map(loc => {
    const isExit = loc.type === 'exit';
    const exitLocked = isExit && !(G.worldMap?.starterQuestDone);
    const symId = SV_LOC_TYPE_SYMBOL[loc.type] || 'm-sym-altar';
    const box = _svSymBox(loc.type);
    const dim = exitLocked ? 0.42 : 1.0;

    // S-D: Indicator "!" khi NPC có quest chờ giao
    const hasQuestIndicator = loc.type === 'npc' && loc.npcId
      ? getNpcPendingQuest(G, loc.npcId) !== null
      : false;

    // L7 — H3: Indicator key khi NPC đã mở khóa secret zone (tier 2 reward)
    const npcReward = loc.type === 'npc' && loc.npcId ? NPC_REWARDS[loc.npcId] : null;
    const secretZoneId = npcReward?.tier2_secret?.zoneId;
    const hasSecretZoneUnlocked = secretZoneId
      ? (G.flags?.unlockedSecretZones?.[secretZoneId] === true)
      : false;

    // Drop shadow ellipse
    const shadow = `<ellipse cx="${loc.x}" cy="${loc.y + box.yOff - 2}" rx="${box.w/2 - 2}" ry="2.5" fill="#3A2818" opacity="${0.32 * dim}"/>`;

    // Label color: exit highlight gold, locked dim
    const labelFill = exitLocked ? '#7A6048' : (isExit ? '#A86018' : decor.inkLight);
    const labelSvg = svgZoneLocLabel(loc.name, loc.x, loc.y + box.yOff + 12, {
      fill: labelFill,
      fontSize: 9,
    });

    // Indicators (giữ logic cũ, dùng warm tone)
    const questBadge = hasQuestIndicator
      ? `<g pointer-events="none">` +
          `<circle cx="${loc.x + 14}" cy="${loc.y - box.yOff + 2}" r="7" fill="#D4A030" stroke="#3A1808" stroke-width="1.2"/>` +
          `<text x="${loc.x + 14}" y="${loc.y - box.yOff + 5}" text-anchor="middle" font-size="9" font-weight="bold" fill="#3A1808">!</text>` +
        `</g>`
      : '';

    const secretBadge = hasSecretZoneUnlocked
      ? `<g pointer-events="none">` +
          `<circle cx="${loc.x - 14}" cy="${loc.y - box.yOff + 2}" r="6.5" fill="#3A2818" stroke="#D4A040" stroke-width="1"/>` +
          // Mini key icon thay emoji
          `<path d="M${loc.x - 16},${loc.y - box.yOff} L${loc.x - 11},${loc.y - box.yOff} M${loc.x - 11},${loc.y - box.yOff - 1.5} L${loc.x - 11},${loc.y - box.yOff + 1.5}" stroke="#D4A040" stroke-width="0.9" stroke-linecap="round"/>` +
          `<circle cx="${loc.x - 17}" cy="${loc.y - box.yOff}" r="1.6" fill="none" stroke="#D4A040" stroke-width="0.9"/>` +
        `</g>`
      : '';

    const lockIndicator = exitLocked
      ? `<use href="#m-sym-lock" x="${loc.x + box.w/2 - 6}" y="${loc.y - box.yOff - 4}" width="10" height="12" opacity="0.85" pointer-events="none"/>` +
        `<text x="${loc.x}" y="${loc.y + box.yOff + 24}" text-anchor="middle" font-size="7.5" fill="#7A6048" opacity="0.8" pointer-events="none">🔒 Cần xong 1 quest</text>`
      : '';

    return (
      `<g class="znode${exitLocked ? ' znode-locked' : ''}" data-lid="${loc.id}"` +
        ` data-locked="${exitLocked ? '1' : '0'}" style="cursor:${exitLocked ? 'not-allowed' : 'pointer'};opacity:${dim}">` +
        shadow +
        `<use href="#${symId}" x="${loc.x - box.w/2}" y="${loc.y - box.yOff}" width="${box.w}" height="${box.h}"/>` +
        // Invisible hit area
        `<rect x="${loc.x - box.w/2 - 4}" y="${loc.y - box.yOff - 4}" width="${box.w + 8}" height="${box.h + 8}" fill="transparent" pointer-events="all"/>` +
        labelSvg +
        lockIndicator +
        questBadge +
        secretBadge +
      `</g>`
    );
  }).join('');
}

// ============================================================
// Drag helper cho sv-side-popup (absolute position trong map container)
// ============================================================
export function _makeSvPopupDraggable(popupEl, handleEl) {
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

  // Tìm lãnh thổ Khuyết Vực chứa thôn này
  const _ter = village.nearZone
    ? KHUYETVUC_TERRITORIES.find(t => t.nodeId === village.nearZone)
    : null;
  const _fc  = _ter ? FACTION_COLORS[_ter.faction] : null;
  const _locationBreadcrumb = _ter
    ? `<div class="sv-location-breadcrumb" style="border-color:${_fc.stroke}40">` +
      `<span class="sv-lb-region" style="color:${_fc.stroke}">缺域 · Khuyết Vực</span>` +
      `<span class="sv-lb-sep"> › </span>` +
      `<span class="sv-lb-territory" style="color:${_fc.light}">${_ter.name}</span>` +
      `</div>`
    : '';

  const vid = village.id;
  const vDecor = SV_VILLAGE_DECOR[vid] || SV_VILLAGE_DECOR.thanh_phong_thon;
  const locSvg = _buildLocNodes(village, G);

  // Village stamp ở góc trên-trái SVG
  const villageStamp =
    `<g pointer-events="none">` +
      renderStamp({ x: 36, y: 30, chName: vDecor.stampChar, inkGrad: vDecor.inkGrad, size: 14, name: vid }) +
      `<text x="60" y="22" font-size="10.5" fill="${vDecor.inkLight}" letter-spacing="2" font-family="'Noto Serif SC','STSong',serif" font-weight="600" filter="url(#m-filt-label)">${village.name}</text>` +
      `<text x="60" y="38" font-size="8.5" fill="${vDecor.inkLight}" opacity="0.85" letter-spacing="1.5">Tân thủ · An cư</text>` +
    `</g>`;

  const svgInner =
    MAP_DEFS +
    parchmentBackground(500, 390) +
    agedSpots(500, 390) +
    _backdropDecor(vid) +
    `<g class="sv-lingqi" pointer-events="none">${_lingQiParticles(village.color)}</g>` +
    `<g class="sv-links" pointer-events="none">${_pathLinks(village.locations)}</g>` +
    locSvg +
    cloudBorder(500, 390, true, 'sv-cloud') +
    vignette(500, 390) +
    villageStamp;

  panel.className = 'center-panel map-panel';
  panel.innerHTML = `
    <div class="map-wrap-t2 map-wrap-starter">
      <div class="map-svg-t2 starter-village-scene sv-painted" id="map-svg-village" data-sv-accent="${village.color}">
        <div class="starter-village-aura" aria-hidden="true"></div>
        <div class="starter-village-frame" aria-hidden="true"></div>
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
          ${_locationBreadcrumb}
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
  // Painted Scroll: bg parchment trong SVG, scene container chỉ giữ accent var cho frame/aura
  const sceneEl = panel.querySelector('.starter-village-scene[data-sv-accent]');
  if (sceneEl?.dataset?.svAccent) {
    sceneEl.style.setProperty('--sv-accent', sceneEl.dataset.svAccent);
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
    market:     [['shop','🛒 Mua Sắm']],
    hunt_zone:  [['combat','⚔ Săn Thú'],['gather','🌿 Thu Thập']],
    gather_zone:[['gather','🌿 Thu Thảo']],
    exit:       [['exit','🚪 Rời Thôn']],
  };
  return (map[loc.type]||[]).map(([act,label]) =>
    `<button class="loc-action-btn" data-act="${act}">${label}</button>`
  ).join('');
}
