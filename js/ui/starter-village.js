// ============================================================
// ui/starter-village.js — Làng khởi đầu Tân Thủ
// ============================================================
import { bus } from '../utils/helpers.js';
import { addChronicle } from '../core/time-engine.js';
import { calcMaxQi, calcQiRate } from '../core/state.js';
import { getAvailableEnemies } from '../combat/combat-engine.js';
import { STARTER_VILLAGES, _setupDrag, _handleLocAction } from './location-popup.js';

export function rollStarterVillage() {
  return STARTER_VILLAGES[Math.floor(Math.random() * STARTER_VILLAGES.length)];
}

// Render Zone Map cho tân thủ thôn
export function renderStarterVillage(G, actions) {
  const panel = document.getElementById('panel-cultivate');
  if (!panel) return;

  const villageId = G.worldMap?.starterVillageId || 'thanh_phong_thon';
  const village = STARTER_VILLAGES.find(v => v.id === villageId) || STARTER_VILLAGES[0];

  const locSvg = village.locations.map(loc => {
    const isExit = loc.type === 'exit';
    const exitLocked = isExit && !(G.worldMap?.starterQuestDone);
    return `
      <g class="znode${exitLocked?' znode-locked':''}" data-lid="${loc.id}"
         style="cursor:${exitLocked?'not-allowed':'pointer'};opacity:${exitLocked?0.35:1}">
        <circle cx="${loc.x}" cy="${loc.y}" r="26"
          fill="rgba(5,10,20,0.92)"
          stroke="${isExit?(exitLocked?'#555':'#f0d47a'):'rgba(255,255,255,0.35)'}"
          stroke-width="${isExit?2:1.5}"/>
        <text x="${loc.x}" y="${loc.y+6}" text-anchor="middle" font-size="16">${loc.emoji}</text>
        <text x="${loc.x}" y="${loc.y+42}" text-anchor="middle" font-size="9"
          fill="${isExit&&!exitLocked?'#f0d47a':'#ccc'}">${loc.name.length>8?loc.name.slice(0,8)+'…':loc.name}</text>
        ${exitLocked?`<text x="${loc.x}" y="${loc.y+53}" text-anchor="middle" font-size="7.5" fill="#666">🔒 Quest</text>`:''}
      </g>`;
  }).join('');

  panel.className = 'center-panel map-panel';
  panel.innerHTML = `
    <div class="map-wrap-t2">
      <div class="map-svg-t2" id="map-svg-village">
        <svg id="village-svg" viewBox="0 0 500 390" xmlns="http://www.w3.org/2000/svg"
             style="width:100%;height:100%;cursor:grab">
          <rect width="500" height="390" fill="${village.bg}" rx="0"/>
          <text x="250" y="22" text-anchor="middle" font-size="11"
            fill="rgba(255,255,255,0.4)" letter-spacing="3">
            ${village.emoji} ${village.name.toUpperCase()}
          </text>
          ${locSvg}
        </svg>
      </div>
      <div class="map-side-t2">
        <div class="mst2-zone-name" style="color:${village.color}">${village.emoji} ${village.name}</div>
        <div class="mst2-zone-desc">${village.desc}</div>
        <div class="village-bonus" style="color:${village.color}">
          ✦ ${village.bonusDesc}
        </div>
        <div class="mst2-loc-info" id="mst2-loc-info">
          <div style="color:var(--text-dim);font-size:11px;font-style:italic;margin-top:8px">
            Click vào địa điểm để khám phá
          </div>
        </div>
        <div class="mst1-stats" style="margin-top:auto;padding-top:8px;border-top:1px solid var(--border)">
          <div class="mst1-s"><span>⚡</span><strong id="map-stat-rate">--</strong></div>
          <div class="mst1-s"><span>⏳</span><strong id="map-stat-age">--</strong></div>
          <div class="mst1-s"><span>💎</span><strong id="map-stat-stone">--</strong></div>
        </div>
      </div>
    </div>`;

  // Setup drag
  const svgEl = document.getElementById('village-svg');
  if (svgEl) _setupDrag('village-svg');

  // Location clicks
  panel.querySelectorAll('.znode:not(.znode-locked)').forEach(g => {
    g.addEventListener('click', () => {
      const lid = g.dataset.lid;
      const loc = village.locations.find(l => l.id === lid);
      if (!loc) return;

      if (loc.type === 'exit') {
        // Rời thôn → vào World Map
        if (!G.worldMap) G.worldMap = {};
        G.worldMap.leftStarter = true;
        G.worldMap.currentNodeId = village.nearZone || 'thanh_van_son';
        actions.toast(`🚶 Rời ${village.name}, bước vào thế giới rộng lớn!`, 'jade');
        window._renderWorldMap?.(G, actions);
        return;
      }

      // Hiện info panel
      const el = document.getElementById('mst2-loc-info');
      if (el) {
        const actionBtns = _getStarterLocBtns(loc);
        el.innerHTML = `
          <div class="mst2-loc-card">
            <div class="mst2-lc-header">
              <span style="font-size:22px">${loc.emoji}</span>
              <div>
                <div style="font-size:13px;font-weight:600;color:#fff">${loc.name}</div>
                <div style="font-size:10px;color:var(--text-dim)">${loc.desc}</div>
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

  window._updateMapStats?.(G);
}

function _getStarterLocBtns(loc) {
  const map = {
    npc:        [['npc','💬 Nói Chuyện']],
    market:     [['shop','🏪 Mua Sắm']],
    hunt_zone:  [['combat','⚔ Săn Thú'],['gather','🌿 Thu Thập']],
    gather_zone:[['gather','🌿 Thu Thảo']],
    exit:       [['exit','🚪 Rời Thôn']],
  };
  return (map[loc.type]||[]).map(([act,label])=>
    `<button class="loc-action-btn" data-act="${act}">${label}</button>`
  ).join('');
}