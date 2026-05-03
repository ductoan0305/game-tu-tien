# Session Prompts — UI Redesign (5 phases)
> Token-optimized. Mỗi prompt là một session độc lập, copy-paste nguyên văn.

---

## SESSION 1 — Layout Collapse + Popup Manager Foundation

```
CONTEXT: Tu Tiên Idle — Vanilla JS ES modules, Firebase, no framework.
Save key: tutien_v10. 12 CSS files, 19 tabs.

TASK: Phá layout 3-cột, biến màn hình chính thành canvas full-screen + popup system foundation.

ĐỌCDOC: idle-game/docs/HANDOFF.md trước khi code.

CURRENT LAYOUT (layout.css):
  .game-layout { display: grid; grid-template-columns: 170px 1fr 220px; height: calc(100vh - 52px); }
  .panel-left (170px) — character info, bars, quick stats
  .panel-center (1fr) — tab content
  .panel-right (220px) — log, events
  .bottom-nav (52px) — tab switcher

TARGET LAYOUT:
  .game-layout → position: fixed; inset: 0; (no grid)
  .panel-left, .panel-right → display:none (content migrated to popups later)
  .panel-center → position: fixed; inset: 0; padding: 0; overflow: hidden; (full canvas)
  .bottom-nav → giữ nguyên vị trí, z-index: 100

POPUP MANAGER (new file: idle-game/js/ui/popup-manager.js):
  - PopupManager singleton, export default
  - API: PopupManager.open(id, { title, content, width, height, x, y })
  - API: PopupManager.close(id)
  - API: PopupManager.toggle(id)
  - API: PopupManager.isOpen(id) → bool
  - Stores open popups in Map<id, {el, state}>
  - Injects popup DOM into #popup-layer div (create if not exists, append to body, z-index 500)
  - Popup HTML structure:
      <div class="pm-popup" data-popup-id="...">
        <div class="pm-header"><span class="pm-title">...</span><button class="pm-close">✕</button></div>
        <div class="pm-body"><!-- content --></div>
      </div>
  - Click .pm-close → PopupManager.close(id)
  - Click outside popup → KHÔNG đóng (game context)
  - ESC key → close last opened popup
  - Default position: center screen. Accept x/y to override.

CSS (add to idle-game/css/components.css):
  .pm-popup: position:fixed; background:var(--bg-card); border:1px solid var(--border-glow);
             border-radius:12px; box-shadow:0 8px 40px rgba(0,0,0,0.7); overflow:hidden;
             display:flex; flex-direction:column; min-width:280px; min-height:120px;
  .pm-header: padding:10px 14px; border-bottom:1px solid var(--border); display:flex;
              align-items:center; justify-content:space-between; cursor:move; background:rgba(0,0,0,0.15);
              flex-shrink:0; user-select:none;
  .pm-title: font-size:13px; font-weight:600; color:var(--gold);
  .pm-close: background:none; border:none; color:var(--text-dim); font-size:16px; cursor:pointer;
             padding:0 2px; transition:color 0.15s; line-height:1;
  .pm-close:hover: color:var(--text);
  .pm-body: flex:1; overflow-y:auto; padding:14px;
  #popup-layer: position:fixed; inset:0; pointer-events:none; z-index:500;
  #popup-layer .pm-popup: pointer-events:all;

IMPORT: Thêm PopupManager vào main.js (import nhưng chưa dùng — chỉ init).

CONSTRAINTS:
  - Không đụng game logic, balance, save/load
  - Không migrate panel content vào popup (session sau)
  - Không làm drag/resize (session sau)
  - Chỉ sửa layout.css + components.css + tạo popup-manager.js + import trong main.js
  - Kiểm tra game vẫn load được sau thay đổi layout (panel-left/right hidden nhưng DOM còn đó)
```

---

## SESSION 2 — Minimal HUD Strip

```
CONTEXT: Tu Tiên Idle — Vanilla JS ES modules, Firebase, no framework.
Save key: tutien_v10. Session này build HUD tối giản thay thế panel-left.
Đọc HANDOFF.md trước.

PREREQUISITE: Session 1 đã xong. .panel-left display:none, PopupManager đã có.

TASK: Tạo HUD strip dọc bên trái (48px wide) + status pill phải trên + bottom nav badges.

LEFT HUD STRIP (#hud-left):
  - position:fixed; left:0; top:0; bottom:52px; width:48px; z-index:90
  - background: linear-gradient(180deg, rgba(6,8,16,0.92) 0%, transparent 100%)
  - Hiển thị (từ trên xuống):
      1. Avatar nhỏ (32x32, border 1px solid element color của mainElement)
      2. Realm badge (vertical text hoặc icon, 10px)
      3. HP bar dọc (cao 60px, màu #e05c4a)
      4. MP bar dọc (cao 60px, màu var(--spirit))
      5. EXP bar dọc (cao 80px, màu var(--jade))
  - Tooltip hover (CSS ::after) hiện số value/max
  - Click vào avatar → PopupManager.toggle('char-panel')

RIGHT STATUS PILL (#hud-right):
  - position:fixed; top:8px; right:8px; z-index:90
  - background: rgba(6,8,16,0.85); border:1px solid var(--border); border-radius:20px
  - padding:5px 10px; display:flex; align-items:center; gap:8px; font-size:11px
  - Hiển thị: 💰{lingthach} · ⚗️{cultivating?'🟢':'⚫'} · 🗺️{location_name}
  - Dữ liệu lấy từ window.gameState (đọc HANDOFF.md để biết state structure)
  - Update mỗi 2s qua setInterval trong hud.js

BOTTOM NAV BADGES:
  - Tab nào có notification/pending → hiện dot badge (6px, màu #e05c4a)
  - CSS: .nav-btn { position:relative } .nav-badge { position:absolute; top:4px; right:4px; width:6px; height:6px; border-radius:50%; background:#e05c4a; }
  - Logic badge: quests tab → có quest chưa claim; inventory → item mới (chưa implement, skip)

NEW FILE: idle-game/js/ui/hud.js
  - export function initHUD() — tạo #hud-left, #hud-right, append to body
  - export function updateHUD() — sync values từ gameState
  - Gọi initHUD() trong main.js wireEvents(), gọi updateHUD() trong game tick loop

CSS: Add .hud-bar-v (vertical bar) vào layout.css:
  .hud-bar-v { width:6px; border-radius:3px; background:rgba(255,255,255,0.08); position:relative; overflow:hidden; }
  .hud-bar-v-fill { position:absolute; bottom:0; width:100%; border-radius:3px; transition:height 0.4s; }

CONSTRAINTS:
  - Không đụng game logic/balance/save
  - Không đụng .panel-left DOM (vẫn hidden, sẽ dùng sau)
  - Chỉ đọc gameState, không write
  - Nếu gameState undefined → HUD render với giá trị 0/placeholder, không throw
```

---

## SESSION 3 — Bản Đồ Full-Screen Redesign

```
CONTEXT: Tu Tiên Idle — Vanilla JS ES modules, Firebase, no framework. Save key: tutien_v10.
Session này redesign world map thành background sống động. Đọc HANDOFF.md trước.

CURRENT MAP:
  - Tab "map" trong .panel-center — .map-wrap-t1 { grid: 1fr 220px; height:100% }
  - SVG world map (.map-world-svg), side panel (.map-side-t1, 220px)
  - Starter village: .map-wrap-starter với CSS gradient scene + SVG (rất đẹp, giữ nguyên logic)
  - map.css có: .map-svg-t1 { background:#060810 }, .wnode, .znode classes
  - map-data.js: không import gì (circular import đã fix — KHÔNG thêm import vào file này)
  - location-popup.js: chỉ import map-data.js

TARGET:
  Panel map trở thành full-screen background khi đang ở tab map:
    .game-layout.on-map-tab .panel-center { padding:0; }
    Tab map render toàn màn hình (trừ bottom nav 52px và HUD strip 48px trái)

MAP VISUAL UPGRADE (chỉ CSS + SVG attributes, không đụng map logic/data):

1. Background atmosphere:
   .map-svg-t1 {
     background: radial-gradient(ellipse 80% 60% at 50% 40%, #0a1020 0%, #030508 100%);
   }
   Thêm star field: <defs><filter id="stars-blur">...<filter></defs> — vẽ bằng JS fill SVG
   (append vào map SVG khi render, z-order: dưới cùng)

2. World nodes (.wnode):
   - Giữ nguyên position/click logic
   - CSS upgrade:
       .wnode circle:first-child { filter: drop-shadow(0 0 8px var(--node-color, #4a9eff)); }
       .wnode text { font-size: 10px; fill: rgba(255,255,255,0.7); }
       .wnode:not(.wnode-locked):hover circle:first-child { filter: drop-shadow(0 0 16px var(--node-color,#4a9eff)); transform: scale(1.1); transform-box: fill-box; transform-origin: center; transition: all 0.2s; }

3. Paths between nodes (bezier):
   - Hiện tại dùng <line> — đổi sang <path d="M...Q..."> trong map render JS
   - Đường chưa unlock: stroke: rgba(255,255,255,0.08); stroke-dasharray: 4 6
   - Đường đã unlock: stroke: rgba(74,158,255,0.3); stroke-width: 1.5

4. Ambient particles (CSS only, không JS):
   Thêm vào map SVG container:
   .map-particle { position:absolute; width:2px; height:2px; border-radius:50%; background:rgba(160,140,255,0.4); animation: particle-drift 8s linear infinite; pointer-events:none; }
   @keyframes particle-drift { 0%{transform:translateY(0) translateX(0);opacity:0} 10%{opacity:1} 90%{opacity:0.3} 100%{transform:translateY(-120px) translateX(var(--px,20px));opacity:0} }
   Spawn 12 particles (JS, random --px -40px to +40px, random animation-delay 0-8s)

5. Map side panel → popup:
   - Khi click node: PopupManager.open('map-node', { title: nodeName, content: sidePanel_html, width: 300, x: window.innerWidth-320, y: 60 })
   - Không xóa .map-side-t1 DOM — ẩn nó đi (display:none) và inject content của nó vào popup body
   - map-side-t1 render vẫn chạy như cũ, sau đó copy innerHTML → popup

CSS: Thêm vào map.css:
  .map-wrap-fullscreen { position:absolute; inset:0 0 52px 48px; }
  .map-svg-t1.fs { width:100%; height:100%; }

CONSTRAINTS:
  - KHÔNG sửa map-data.js (circular import guard)
  - KHÔNG đụng location-popup.js logic
  - KHÔNG thay đổi node data, zone data, unlock logic
  - KHÔNG đụng starter village scene (giữ nguyên, rất đẹp)
  - Chỉ CSS + minor SVG attribute + particle spawn JS
```

---

## SESSION 4 — Full Popup System (Drag, Resize, Z-index, Migrate Panels)

```
CONTEXT: Tu Tiên Idle — Vanilla JS ES modules, Firebase, no framework. Save key: tutien_v10.
Session này hoàn thiện popup system và migrate tất cả panel vào popup.
Đọc HANDOFF.md trước. Session 1+2+3 đã xong.

PREREQUISITE: popup-manager.js đã có API: open(id,opts), close(id), toggle(id), isOpen(id).

TASK A — Drag & Resize cho popup:
  Sửa popup-manager.js:
  
  DRAG (mousedown trên .pm-header):
    - Lưu offset = {x: e.clientX - rect.left, y: e.clientY - rect.top}
    - mousemove trên document: el.style.left = (e.clientX - offset.x) + 'px'; el.style.top = ...
    - mouseup: cleanup. Touch events: touchstart/touchmove/touchend tương tự.
    - Clamp vào viewport: Math.max(0, Math.min(window.innerWidth - el.offsetWidth, x))
    - Lưu position vào Map state để restore sau toggle

  RESIZE (option resizable:true trong open()):
    - Append <div class="pm-resize-handle"> vào popup (bottom-right corner)
    - .pm-resize-handle: position:absolute; right:0; bottom:0; width:14px; height:14px; cursor:se-resize;
      background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.15) 50%);
    - mousedown trên handle: track startW/startH/startX/startY
    - mousemove: el.style.width = ...; el.style.height = ...; clamp min 200px/120px

  Z-INDEX STACK:
    - Mỗi popup có zBase 500. Click popup bất kỳ → zIndex = max(all open popups) + 1
    - Click .pm-header (mousedown) trigger z-raise

TASK B — Migrate panels vào popup:
  
  1. CHAR PANEL (id:'char-panel', title:'Nhân Vật', width:240, resizable:false):
     - Content = .panel-left innerHTML
     - Mở khi click avatar trong HUD strip
     - Default position: left:60px, top:60px

  2. LOG PANEL (id:'log-panel', title:'Nhật Ký', width:260, resizable:true):
     - Content = .panel-right innerHTML (combat log, event log)
     - Default: right:10px, top:60px (x = window.innerWidth-270)
     - Bottom nav: thêm nút 📜 Log → toggle log-panel

  3. CULTIVATE PANEL (id:'cultivate-panel'):
     - Tab cultivate hiện render vào .panel-center
     - Khi tab cultivate active → nếu isOpen('cultivate-panel') false → auto open
     - Width:340, height:480, center screen

  4. Mỗi tab trong bottom nav:
     - Tab map → render map full-screen (không popup, như session 3)
     - Tab combat, alchemy, quests, skills, inventory, shop → mở popup tương ứng
     - PopupManager.open(tabId, { title: tabLabel, content: renderTab(tabId), width:380, resizable:true })

  5. Khi popup đóng mà game logic tab đang active:
     - Không cần deactivate logic — popup chỉ ẩn UI, game tick vẫn chạy
     - Reopen popup → re-render content mới nhất

CSS thêm vào components.css:
  .pm-popup.minimized .pm-body { display:none; }
  .pm-popup.minimized { height:auto !important; }
  Thêm minimize button vào .pm-header (trước close):
    <button class="pm-minimize">─</button>
  .pm-minimize: giống .pm-close style

CONSTRAINTS:
  - KHÔNG đụng game logic/balance/save/load
  - KHÔNG xóa DOM của .panel-left, .panel-right (giữ hidden — fallback)
  - Tab render functions phải được gọi với đúng argument như cũ
  - Mọi event listener trong tab content vẫn phải work sau khi inject vào popup body
    (dùng event delegation hoặc re-wire sau inject)
  - KHÔNG dùng innerHTML = tabEl.innerHTML nếu tab có active event listeners —
    dùng el.appendChild(tabEl.cloneNode(true)) hoặc re-render function
```

---

## SESSION 5 — Polish: Element Theming + Ambient + Mobile

```
CONTEXT: Tu Tiên Idle — Vanilla JS ES modules, Firebase, no framework. Save key: tutien_v10.
Session cuối: polish toàn bộ visual. Đọc HANDOFF.md trước.
Sessions 1-4 đã xong: layout full-screen, HUD strip, map full-screen, popup system.

ELEMENT COLOR SYSTEM (base.css — thêm vào :root):
  --el-kim:   #f0d47a;  /* Kim */
  --el-moc:   #56c46a;  /* Mộc */
  --el-shui:  #3a9fd5;  /* Thủy */
  --el-huo:   #e05c1a;  /* Hỏa */
  --el-tu:    #a07850;  /* Thổ */
  --el-phong: #a8e6cf;  /* Phong */
  --el-loi:   #ffd700;  /* Lôi */
  --el-bang:  #87ceeb;  /* Băng */
  --el-am:    #9370db;  /* Âm */
  --el-duong: #ffa500;  /* Dương */

Khi game load, inject vào :root:
  document.documentElement.style.setProperty('--player-element-color', getElementColor(gameState.spiritRoot?.mainElement))
  Hàm getElementColor(el) → map el → --el-* value ở trên

Apply --player-element-color:
  - .char-avatar border-color
  - HUD strip left bar (một accent line dọc cạnh trái)
  - .pm-header border-bottom-color của char-panel popup
  - Bottom nav active tab dot indicator

POPUP OPEN/CLOSE ANIMATION:
  .pm-popup { transform-origin: top center; }
  Open: animation: pm-open 0.2s ease both;
  @keyframes pm-open { from { opacity:0; transform: scale(0.92) translateY(-8px); } to { opacity:1; transform:none; } }
  Close: add class .pm-closing → animation: pm-close 0.15s ease both → sau đó remove từ DOM
  @keyframes pm-close { to { opacity:0; transform: scale(0.88) translateY(-6px); } }

TIME-OF-DAY AMBIENT (dùng real clock):
  function getTimeOfDay() → 'dawn'|'day'|'dusk'|'night' theo giờ thực (Date().getHours())
    dawn: 5-7, day: 7-17, dusk: 17-19, night: 19-5
  Inject class lên body: body.time-dawn / body.time-day / body.time-dusk / body.time-night
  Update mỗi 60s.
  CSS overlay trên map background:
    body.time-dawn  .map-svg-t1::before { background: radial-gradient(ellipse at 50% 100%, rgba(255,160,80,0.08) 0%, transparent 60%); }
    body.time-night .map-svg-t1::before { background: radial-gradient(ellipse at 50% 0%, rgba(60,40,120,0.15) 0%, transparent 70%); }
  (position:absolute inset:0 pointer-events:none z-index:1 trên map SVG container)

MOBILE RESPONSIVE (bổ sung vào layout.css):
  @media (max-width: 767px) {
    #hud-left { width:36px; }
    .hud-bar-v { width:4px; }
    #hud-right { top:4px; right:4px; padding:3px 8px; font-size:10px; }
    .pm-popup { max-width:calc(100vw - 16px) !important; left:8px !important; }
    .pm-resize-handle { display:none; } /* no resize on mobile */
    .bottom-nav { height:48px; }
    .bottom-nav .nav-btn { font-size:10px; }
  }

PERFORMANCE AUDIT:
  - Kiểm tra xem có setInterval chạy nhanh hơn 500ms không → gộp vào game tick
  - HUD update: chạy trong game tick (mỗi 1000ms) thay vì setInterval riêng
  - Particles: dùng CSS animation, không JS animation frame
  - will-change: opacity, transform trên .pm-popup

CONSTRAINTS:
  - KHÔNG đụng game logic/balance/save
  - KHÔNG thay đổi state structure
  - Element color chỉ read từ spiritRoot.mainElement, KHÔNG compute lại
  - Time-of-day chỉ ảnh hưởng visual (CSS), KHÔNG ảnh hưởng game mechanics
  - Mobile: test breakpoint 375px width minimum
```
