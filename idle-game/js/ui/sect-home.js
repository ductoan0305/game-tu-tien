// ============================================================
// ui/sect-home.js — Sect Home View
// Pattern giống renderStarterVillage — full view thay thế zone map
// trên tab Tu Luyện cho sect member.
// ============================================================
import { _handleLocAction, _setupDrag } from './location-popup.js';
import { _makeSvPopupDraggable } from './starter-village.js';
import { svgZoneLocLabel } from './map-data.js';

// ============================================================
// Dữ liệu nội thất từng tông môn
// ============================================================
export const SECT_HOME_DATA = {
  the_tu: {
    name: 'Thiết Cốt Môn',
    emoji: '💪',
    color: '#c08040',
    bg: 'linear-gradient(160deg,#0a0500 0%,#1a0d00 50%,#0a0500 100%)',
    desc: 'Tông môn luyện thể cường tráng. Tiếng đập đá vang vọng khắp động phủ.',
    zoneName: 'Ẩn Long Động',
    locations: [
      { id:'sh_quest',  name:'Nhiệm Vụ Đường',  emoji:'📜', x:250, y:90,  act:'quest',   desc:'Nhận và nộp nhiệm vụ tông môn' },
      { id:'sh_skill',  name:'Tàng Kinh Các',   emoji:'📖', x:390, y:195, act:'skill',   desc:'Học công pháp và bí kỹ luyện thể' },
      { id:'sh_spar',   name:'Sân Luyện Võ',    emoji:'🏋', x:110, y:195, act:'spar',    desc:'Luyện tập thể lực và tỉ thí đồng môn' },
      { id:'sh_elder',  name:'Trưởng Lão Đường', emoji:'👴', x:250, y:300, act:'npc',    desc:'Diện kiến trưởng lão, xin chỉ dẫn tu hành' },
      { id:'sh_exit',   name:'Ẩn Long Động',    emoji:'🚪', x:250, y:360, act:'exit',    desc:'Rời tông môn, thám hiểm Ẩn Long Động', type:'exit' },
    ],
  },
  kiem_tong: {
    name: 'Kiếm Tông',
    emoji: '⚔',
    color: '#4a9eff',
    bg: 'linear-gradient(160deg,#000a18 0%,#001428 50%,#000a18 100%)',
    desc: 'Kiếm khí thanh tú, linh khí đậm đặc trong từng nhát kiếm.',
    zoneName: 'Thanh Vân Sơn',
    locations: [
      { id:'sh_quest',  name:'Nhiệm Vụ Đường', emoji:'📜', x:250, y:90,  act:'quest', desc:'Nhận nhiệm vụ luyện kiếm và hành tẩu' },
      { id:'sh_skill',  name:'Kiếm Khí Các',   emoji:'⚔',  x:390, y:195, act:'skill', desc:'Học kiếm pháp và kiếm khí bí thuật' },
      { id:'sh_spar',   name:'Đài Tỉ Kiếm',    emoji:'🗡', x:110, y:195, act:'spar',  desc:'Tỉ kiếm với sư huynh đệ cùng môn' },
      { id:'sh_elder',  name:'Chưởng Môn Điện', emoji:'👴', x:250, y:300, act:'npc',  desc:'Diện kiến chưởng môn nhận chỉ dẫn' },
      { id:'sh_exit',   name:'Thanh Vân Sơn',  emoji:'🚪', x:250, y:360, act:'exit', desc:'Rời tông môn, thám hiểm Thanh Vân Sơn', type:'exit' },
    ],
  },
  dan_tong: {
    name: 'Đan Tông',
    emoji: '⚗',
    color: '#f0d47a',
    bg: 'linear-gradient(160deg,#0d0a00 0%,#1a1400 50%,#0d0a00 100%)',
    desc: 'Hương đan thơm ngát, khói lửa bốc lên từ lò luyện đan suốt ngày đêm.',
    zoneName: 'Vạn Linh Thị',
    locations: [
      { id:'sh_quest',  name:'Nhiệm Vụ Đường', emoji:'📜', x:250, y:90,  act:'quest',   desc:'Nhận nhiệm vụ thu thảo và luyện đan' },
      { id:'sh_skill',  name:'Đan Kinh Các',   emoji:'📖', x:390, y:195, act:'skill',   desc:'Nghiên cứu đan phương và luyện đan bí thuật' },
      { id:'sh_spar',   name:'Lò Luyện Đan',   emoji:'🔥', x:110, y:195, act:'alchemy', desc:'Luyện đan dưới sự hướng dẫn của sư phụ' },
      { id:'sh_elder',  name:'Đan Sư Điện',    emoji:'👴', x:250, y:300, act:'npc',     desc:'Xin chỉ dẫn từ đại đan sư tông môn' },
      { id:'sh_exit',   name:'Vạn Linh Thị',   emoji:'🚪', x:250, y:360, act:'exit',    desc:'Rời tông môn, thám hiểm Vạn Linh Thị', type:'exit' },
    ],
  },
  tran_phap: {
    name: 'Trận Pháp Tông',
    emoji: '🔯',
    color: '#a89df5',
    bg: 'linear-gradient(160deg,#050010 0%,#0a0020 50%,#050010 100%)',
    desc: 'Trận pháp vây phủ toàn khu, khiến kẻ lạ lạc đường không tìm ra lối thoát.',
    zoneName: 'Thiên Kiếp Địa',
    locations: [
      { id:'sh_quest',  name:'Nhiệm Vụ Đường',  emoji:'📜', x:250, y:90,  act:'quest', desc:'Nhận nhiệm vụ bố trận và thám hiểm' },
      { id:'sh_skill',  name:'Trận Đồ Các',     emoji:'📖', x:390, y:195, act:'skill', desc:'Học trận pháp và trận đồ bí thuật' },
      { id:'sh_spar',   name:'Thực Chiến Trận', emoji:'⚡', x:110, y:195, act:'spar',  desc:'Thực chiến trong trận pháp mô phỏng' },
      { id:'sh_elder',  name:'Pháp Trận Tổ',    emoji:'👴', x:250, y:300, act:'npc',   desc:'Xin chỉ giáo từ pháp trận tổ sư' },
      { id:'sh_exit',   name:'Thiên Kiếp Địa',  emoji:'🚪', x:250, y:360, act:'exit',  desc:'Rời tông môn, thám hiểm Thiên Kiếp Địa', type:'exit' },
    ],
  },
};

// ============================================================
// Helpers
// ============================================================
function _pathLinks(locs, color) {
  const cx = 250, cy = 195;
  return locs.map(loc => {
    const mx = (cx + loc.x) / 2 + (loc.y - cy) * 0.06;
    const my = (cy + loc.y) / 2 - (loc.x - cx) * 0.04;
    return `<path d="M${cx},${cy} Q${mx},${my} ${loc.x},${loc.y}"
      fill="none" stroke="${color}" stroke-opacity="0.12"
      stroke-width="1" stroke-dasharray="3,6"/>`;
  }).join('');
}

function _buildRoomNodes(sect) {
  return sect.locations.map(loc => {
    const isExit = loc.type === 'exit';
    const stroke = isExit ? '#f0d47a' : sect.color;
    const strokeOp = isExit ? '0.7' : '0.65';
    const dash = isExit ? 'stroke-dasharray="4 3"' : '';
    const labelFill = isExit ? '#f0d47a' : '#d8dce4';
    return `
    <g class="znode" data-lid="${loc.id}" style="cursor:pointer">
      <circle cx="${loc.x}" cy="${loc.y}" r="34" fill="none"
        stroke="${stroke}" stroke-opacity="0.06" stroke-width="1"/>
      <circle cx="${loc.x}" cy="${loc.y}" r="29" fill="none"
        stroke="${stroke}" stroke-opacity="0.35" stroke-width="${isExit ? 2 : 1.2}" ${dash}/>
      <circle cx="${loc.x}" cy="${loc.y}" r="26"
        fill="rgba(5,5,10,0.88)" stroke="${stroke}"
        stroke-opacity="${strokeOp}" stroke-width="1.4"/>
      <text x="${loc.x}" y="${loc.y + 6}" text-anchor="middle" font-size="17">${loc.emoji}</text>
      ${svgZoneLocLabel(loc.name, loc.x, loc.y + 42, { fill: labelFill, fontSize: 8.5 })}
    </g>`;
  }).join('');
}

// ============================================================
// Main export
// ============================================================
export function renderSectHome(G, actions, goToZoneMap) {
  const panel = document.getElementById('panel-cultivate');
  if (!panel) return;

  const sect = SECT_HOME_DATA[G.sectId];
  if (!sect) {
    // Tông môn chưa có home data → fallback zone map
    goToZoneMap?.();
    return;
  }

  const roomSvg  = _buildRoomNodes(sect);
  const pathSvg  = _pathLinks(sect.locations, sect.color);

  panel.className = 'center-panel map-panel';
  panel.innerHTML = `
    <div class="map-wrap-t2 map-wrap-starter">
      <div class="map-svg-t2 starter-village-scene" id="map-svg-sect"
           style="background:${sect.bg}; --sv-accent:${sect.color}">
        <div class="starter-village-aura" aria-hidden="true"></div>
        <div class="starter-village-vignette" aria-hidden="true"></div>
        <div class="starter-village-titlebar">
          <span class="starter-village-emoji">${sect.emoji}</span>
          <div class="starter-village-titles">
            <span class="starter-village-name">${sect.name}</span>
            <span class="starter-village-badge">Đệ Tử · Tông Môn</span>
          </div>
        </div>
        <svg id="sect-home-svg" class="starter-village-svg"
             viewBox="0 0 500 390" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sect-mist" cx="50%" cy="42%" r="0.55">
              <stop offset="0%" stop-color="rgba(255,255,255,0.06)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
            </radialGradient>
          </defs>
          <rect width="500" height="390" fill="transparent"/>
          <ellipse cx="250" cy="195" rx="200" ry="130"
            fill="url(#sect-mist)" opacity="0.8" pointer-events="none"/>
          <g class="sv-links" pointer-events="none">${pathSvg}</g>
          ${roomSvg}
        </svg>
      </div>

      <div class="sv-side-popup" id="sv-side-popup"
           style="--sv-accent:${sect.color}">
        <div class="sv-popup-header" id="sv-popup-drag-handle">
          <span class="sv-popup-drag-hint">⠿</span>
          <span class="sv-popup-title">${sect.emoji} ${sect.name}</span>
          <button class="sv-popup-close" id="sv-popup-close">✕</button>
        </div>
        <div class="sv-popup-body">
          <div class="mst2-zone-desc">${sect.desc}</div>
          <div class="mst2-loc-info" id="mst2-loc-info">
            <div class="starter-village-side-hint">Chọn khu vực để tương tác</div>
          </div>
        </div>
      </div>
    </div>`;

  _setupDrag('sect-home-svg');

  // Drag cho side popup
  const sidePopup  = document.getElementById('sv-side-popup');
  const dragHandle = document.getElementById('sv-popup-drag-handle');
  if (sidePopup && dragHandle) _makeSvPopupDraggable(sidePopup, dragHandle);

  // Popup close
  document.getElementById('sv-popup-close')?.addEventListener('click', () => {
    if (sidePopup) sidePopup.style.display = 'none';
  });

  // Click rooms
  panel.querySelectorAll('.znode').forEach(g => {
    g.addEventListener('click', () => {
      const lid  = g.dataset.lid;
      const room = sect.locations.find(l => l.id === lid);
      if (!room) return;

      // Exit node → vào zone map ngay, không cần popup
      if (room.act === 'exit') {
        goToZoneMap?.();
        return;
      }

      // Hiện lại popup nếu đang ẩn
      if (sidePopup?.style.display === 'none') sidePopup.style.display = '';

      // Sidebar info
      const el = document.getElementById('mst2-loc-info');
      if (el) {
        el.innerHTML = `
          <div class="mst2-loc-card starter-loc-card">
            <div class="mst2-lc-header">
              <span style="font-size:22px">${room.emoji}</span>
              <div>
                <div style="font-size:13px;font-weight:600;color:#fff">${room.name}</div>
                <div style="font-size:10px;color:var(--text-dim);margin-top:2px">${room.desc}</div>
              </div>
            </div>
            <div class="mst2-lc-actions">
              <button class="loc-action-btn btn-primary btn-sm" data-act="${room.act}">
                ${room.emoji} Vào ${room.name}
              </button>
            </div>
          </div>`;

        el.querySelector('.loc-action-btn')?.addEventListener('click', () => {
          _triggerSectRoomAction(G, room.act, actions);
        });
      }
    });
  });
}

// ============================================================
// Xử lý action từng phòng
// ============================================================
function _triggerSectRoomAction(G, act, actions) {
  const tabMap = {
    quest:   'quests',
    skill:   'skills',
    spar:    'skills',
    alchemy: 'alchemy',
    npc:     'sect',
  };
  const tab = tabMap[act];
  if (tab && actions?.switchTab) {
    actions.switchTab(tab);
  }
}
