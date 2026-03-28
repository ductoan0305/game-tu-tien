// ============================================================
// app/popups/misc-popups.js
// Các popup nhỏ: breakthrough, sect join, reset, welcome/guide,
//               cơ duyên, linh thú encounter
// ============================================================
import { LINH_THU_DATA, tryTame, pickupEgg } from '../../core/linh-thu-engine.js';
import { saveGame }                           from '../../core/state.js';
import { showToast }                          from '../../ui/render-core.js';
import { auth }                               from '../../firebase/firebase-config.js';

// ---- Breakthrough Modal ----
export function showBreakthroughModal(result) {
  const existing = document.getElementById('modal-breakthrough');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id        = 'modal-breakthrough';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box breakthrough-modal">
      <h2>${result.title || '✨ Đột Phá'}</h2>
      <p class="bt-sub">${result.sub || ''}</p>
      <p class="bt-flavor">${result.flavor || ''}</p>
      <button onclick="document.getElementById('modal-breakthrough').remove()" class="btn-primary">Tiếp Tục</button>
    </div>`;
  document.body.appendChild(modal);
  setTimeout(() => modal?.remove(), 10000);
}

// ---- Cơ Duyên Modal ----
export function showCoDuyenModal(G, event, detail) {
  const existing = document.getElementById('modal-coduyen');
  if (existing) existing.remove();

  const tierColors = { 1:'#56c46a', 2:'#c084fc', 3:'#f0d47a' };
  const tierNames  = { 1:'Kỳ Ngộ Nhỏ', 2:'Kỳ Ngộ Lớn', 3:'⭐ ĐẠI CƠ DUYÊN' };
  const color = tierColors[event.tier] || '#56c46a';

  const realSec  = G._sessionStartTime ? Math.floor((Date.now() - G._sessionStartTime) / 1000) : 0;
  const rMin = Math.floor(realSec/60); const rSec = realSec%60;
  const realStr  = rMin > 0 ? `${rMin} phút ${rSec}s` : `${rSec}s`;
  const curAge   = G.gameTime?.currentYear || 16;
  const gameStr  = `tuổi ${curAge.toFixed(1)} (${Math.max(0,curAge-16).toFixed(2)} năm tu tiên)`;

  const nextCdSec  = G._coDuyenGlobalCd ? Math.max(0, Math.ceil((G._coDuyenGlobalCd - Date.now()) / 1000)) : 0;
  const nextCdStr  = nextCdSec > 3600
    ? `${(nextCdSec/3600).toFixed(1)} giờ thực (~${(nextCdSec/17520).toFixed(2)} năm game)`
    : `${Math.floor(nextCdSec/60)} phút thực`;

  const modal = document.createElement('div');
  modal.id        = 'modal-coduyen';
  modal.className = 'modal-overlay';
  modal.style.cssText = 'display:flex;z-index:1000;';
  modal.innerHTML = `
    <div class="modal-box coduyen-modal" style="border-color:${color}55;max-width:400px;text-align:center;">
      <div class="cd-tier" style="color:${color};font-size:12px;letter-spacing:2px;margin-bottom:8px">${tierNames[event.tier]||'Kỳ Ngộ'}</div>
      <div class="cd-emoji" style="font-size:48px;margin:8px 0">${event.emoji}</div>
      <h2 style="color:${color};margin-bottom:8px">${event.name}</h2>
      <p style="color:var(--text-dim);font-style:italic;font-size:13px;margin-bottom:12px;line-height:1.6">${event.lore}</p>
      <div class="cd-effect" style="background:rgba(0,0,0,0.3);border-radius:8px;padding:10px;margin-bottom:12px;color:${color};font-size:13px">${detail}</div>
      <div style="font-size:10px;color:var(--text-dim);background:rgba(0,0,0,0.2);border-radius:6px;padding:6px 10px;margin-bottom:14px;text-align:left;line-height:1.8">
        🕐 Thực: <strong>${realStr}</strong> · game: <strong>${gameStr}</strong><br>
        ⏳ Cơ duyên tiếp theo sớm nhất: <strong>${nextCdStr}</strong><br>
        ✨ Khí Vận: <strong>${G.khiVan??20}</strong>/100
      </div>
      <button class="btn-primary" onclick="document.getElementById('modal-coduyen').remove()">Tiếp nhận Cơ Duyên</button>
    </div>`;
  document.body.appendChild(modal);
  setTimeout(() => modal?.remove(), 15000);
}

// ---- Sect Join Modal ----
export function showSectJoinModal(G, sectId, sectName, { appendLog, renderCurrentTab }) {
  const existing = document.getElementById('modal-sect-join');
  if (existing) existing.remove();

  const SECT_INFO = {
    kiem_tong: { emoji:'⚔', name:'Thanh Vân Kiếm Tông', req:'Luyện Khí Tầng 3+', realmReq:0, stageReq:3, questDesc:'Diệt 5 con Sói Linh', bonus:'+25% Công Kích · +10% Tu tốc', color:'#c8a84b' },
    dan_tong:  { emoji:'⚗', name:'Vạn Linh Đan Tông',   req:'Luyện Khí Tầng 3+', realmReq:0, stageReq:3, questDesc:'Luyện 3 viên Tụ Linh Đan',   bonus:'+50% Hiệu quả đan · +15% Tu tốc', color:'#e05c1a' },
    tran_phap: { emoji:'🔮', name:'Huyền Cơ Các',        req:'Luyện Khí Tầng 3+', realmReq:0, stageReq:3, questDesc:'Bố trận 3 lần thành công',   bonus:'+30% Phòng thủ · +0.5/s', color:'#7b68ee' },
    the_tu:    { emoji:'💪', name:'Thiết Cốt Môn',       req:'Luyện Khí Tầng 3+', realmReq:0, stageReq:3, questDesc:'Thiết đả 5 lần',              bonus:'+50% HP · +20% Phòng thủ', color:'#a07850' },
  };
  const info = SECT_INFO[sectId];
  if (!info) return;

  const canJoin      = G.realmIdx >= info.realmReq && G.stage >= info.stageReq;
  const alreadyIn    = !!G.sectId;
  const wasInvited   = (G.sectInvites||[]).includes(sectId);
  const isNgu        = G.spiritData?.type === 'NGU';

  const overlay = document.createElement('div');
  overlay.id        = 'modal-sect-join';
  overlay.className = 'modal-overlay';
  overlay.style.cssText = 'display:flex;z-index:900;';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:380px;text-align:center;border-color:${info.color}44">
      <div style="font-size:36px;margin-bottom:8px">${info.emoji}</div>
      <h2 style="color:${info.color};margin-bottom:6px">${info.name}</h2>
      ${wasInvited ? `<div style="font-size:11px;color:#56c46a;margin-bottom:8px">✉ Tông môn này đã gửi thư mời cho ngươi!</div>` : ''}
      ${alreadyIn ? `<p style="color:#e05c4a">Ngươi đã thuộc ${G.sectId} rồi.</p>`
        : isNgu ? `<p style="color:#e05c4a">Ngũ Linh Căn không đủ điều kiện gia nhập tông môn.</p>`
        : !canJoin ? `<p style="color:var(--text-dim)">Cần <strong>${info.req}</strong> để gia nhập.</p>`
        : `<div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:12px;margin:10px 0;text-align:left">
             <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px">Thử thách nhập môn:</div>
             <div style="font-size:13px;color:#fff">${info.questDesc}</div>
           </div>
           <div style="font-size:12px;color:${info.color};margin-bottom:14px">Phần thưởng: ${info.bonus}</div>`}
      <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
        <button class="btn-secondary" onclick="document.getElementById('modal-sect-join').remove()">Đóng</button>
        ${!alreadyIn && !isNgu && canJoin ? `<button class="btn-primary" id="btn-join-confirm">✅ Gia Nhập</button>` : ''}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); });

  document.getElementById('btn-join-confirm')?.addEventListener('click', () => {
    G.sectId = sectId;
    const CP_MAP = { kiem_tong:'kiem_quyet_ha', dan_tong:'dan_kinh_ha', tran_phap:'tran_phap_ha', the_tu:'the_tu_ha' };
    if (!G.congPhap) G.congPhap = { currentId:'vo_danh', unlockedIds:[] };
    const cpId = CP_MAP[sectId];
    if (cpId) { G.congPhap.currentId = cpId; G.congPhap.unlockedIds = [cpId]; }
    showToast(`🎉 Gia nhập ${info.name} thành công!`, 'legendary');
    appendLog(`🏯 Chính thức trở thành đệ tử ${info.name}. Công pháp: ${cpId}`, 'gold');
    overlay.remove();
    saveGame(G);
    renderCurrentTab();
  });
}

// ---- Reset Confirm ----
export function showResetConfirm(G, { clearIntervals }) {
  const existing = document.getElementById('modal-reset');
  if (existing) existing.remove();

  const totalYears = Math.floor(G?.gameTime?.totalYears||0);
  const REALM_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];
  const overlay = document.createElement('div');
  overlay.id        = 'modal-reset';
  overlay.className = 'modal-overlay';
  overlay.style.cssText = 'display:flex;z-index:9999;';
  overlay.innerHTML = `
    <div class="reset-modal">
      <div style="font-size:40px;margin-bottom:12px">⚠️</div>
      <h2>Chơi Lại Từ Đầu?</h2>
      <p><strong>${G?.name||'Vô Danh'}</strong> — ${REALM_NAMES[G?.realmIdx||0]} · ${totalYears} năm tu hành sẽ bị xóa hoàn toàn.</p>
      <div class="reset-modal-btns">
        <button class="btn-secondary" id="btn-reset-cancel">Hủy</button>
        <button class="btn-danger" id="btn-reset-confirm">🔄 Xác Nhận Đầu Thai</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('btn-reset-cancel')?.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); });
  document.getElementById('btn-reset-confirm')?.addEventListener('click', async () => {
    clearIntervals();
    window._setResetting?.(true);

    // Đánh dấu reset trong sessionStorage — sẽ xóa localStorage SAU khi reload
    sessionStorage.setItem('_pendingReset', '1');

    // Đánh dấu cloud save là đã reset
    const user = auth.currentUser;
    if (user && !user.isAnonymous) {
      try {
        const { db } = await import('../../firebase/firebase-config.js');
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        await setDoc(doc(db, 'saves', user.uid), {
          reset: true,
          saveData: null,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn('[Reset] Could not mark cloud save as reset:', e);
      }
    }

    window.location.reload();
  });
}

// ---- Welcome + Full Guide ----
const TUTORIAL_QUESTS = [
  { id:'tut_0', title:'0. Tìm Trưởng Lão trong làng', desc:'Vào 🗺 Bản Đồ → chọn Làng Khởi Điểm → vào làng → tìm và nói chuyện với 👴 Trưởng Lão.', icon:'👴', check:(G)=>(G.quests?.active?.length||0)>=1||(G.totalQuestsCompleted||0)>=1, reward:'Mở khóa chuỗi nhiệm vụ chính' },
  { id:'tut_1', title:'1. Khám phá Phàm Nhân Giới',    desc:'Click vào node để chọn vùng đất, bấm "Vào vùng đất" để khám phá.', icon:'🗺', check:(G)=>G.worldMap?.currentNodeId!=='thanh_van_son', reward:'📖 Mở khóa Tàng Kinh Các' },
  { id:'tut_2', title:'2. Vào Rừng Ngoại Môn săn thú', desc:'Tìm 🌲 Rừng Ngoại Môn → Click → Chọn ⚔ Săn Thú để chiến đấu kiếm linh thạch.', icon:'⚔', check:(G)=>(G.hunts||0)>=1, reward:'+100 Linh Thạch' },
  { id:'tut_3', title:'3. Bế quan tu luyện',            desc:'Bấm nút 🧘 Bế Quan để tu luyện. Khi offline, có thể chọn bế quan để tận dụng thời gian.', icon:'🧘', check:(G)=>G.meditating, reward:'Tốc độ tu luyện tăng thêm' },
  { id:'tut_4', title:'4. Tìm Pháp Địa tốt hơn',       desc:'Vào tab 🏔 Pháp Địa → Mua Linh Địa (500💎) để tăng tốc ×1.2.', icon:'🏔', check:(G)=>(G.phapDia?.currentId||'pham_dia')!=='pham_dia', reward:'Mở khóa thông tin Cơ Duyên' },
  { id:'tut_5', title:'5. Đột phá cảnh giới',           desc:'Khi thanh Linh Lực đầy 100%, nút ⚡ Đột Phá sáng lên. Bấm để lên tầng mới.', icon:'⚡', check:(G)=>(G.breakthroughs||0)>=1, reward:'Tăng tuổi Thọ' },
  { id:'tut_6', title:'6. Gia nhập Tông Môn',           desc:'Khi đạt Luyện Khí Tầng 3, vào Zone Map tương ứng, click cổng tông môn.', icon:'🏯', check:(G)=>!!G.sectId, reward:'Công Pháp Hạ Phẩm + nhiệm vụ' },
];

export function showWelcomeModal(G) {
  const existing = document.getElementById('modal-welcome');
  if (existing) existing.remove();

  const rootNames = { jin:'Kim ⚔', mu:'Mộc 🌿', shui:'Thủy 💧', huo:'Hỏa 🔥', tu:'Thổ 🗿', yin_yang:'Âm Dương ☯', hun:'Hỗn Nguyên 🌌' };
  const rootDesc  = { jin:'Thiên phú về chiến đấu', mu:'Hồi phục tốt', shui:'Cơ duyên nhiều hơn', huo:'Bùng nổ mạnh', tu:'Phòng thủ vững', yin_yang:'Cân bằng, cơ duyên ×1.5', hun:'Huyền thoại' };
  const root      = G.spiritRoot;
  const genderEmoji = G.gender === 'female' ? '👩' : '👨';

  const overlay = document.createElement('div');
  overlay.id = 'modal-welcome'; overlay.className = 'modal-overlay';
  overlay.style.cssText = 'display:flex;z-index:9998;background:rgba(0,0,0,0.88)';
  overlay.innerHTML = `
    <div class="welcome-modal">
      <div class="wm-header">
        <div class="wm-emoji">${genderEmoji}</div>
        <h1 class="wm-title">Chào Mừng, <span style="color:var(--gold)">${G.name}</span>!</h1>
        <p class="wm-sub">Hành trình tu tiên của ngươi bắt đầu từ đây</p>
      </div>
      <div class="wm-root-info">
        <span class="wm-root-badge">${rootNames[root]||root}</span>
        <span class="wm-root-desc">${rootDesc[root]||'Linh căn đặc biệt'}</span>
      </div>
      <div class="wm-steps">
        <div class="wm-step-title">📖 Hướng dẫn nhanh</div>
        ${TUTORIAL_QUESTS.slice(0,4).map(q=>`
          <div class="wm-step">
            <span class="wm-step-icon">${q.icon}</span>
            <div><div class="wm-step-name">${q.title}</div><div class="wm-step-desc">${q.desc}</div></div>
          </div>`).join('')}
      </div>
      <div class="wm-warning">⏳ <strong>Quan trọng:</strong> Ngươi đang ở Luyện Khí tầng 1 với ~120 năm thọ mệnh. Hãy tìm <strong>👴 Trưởng Lão trong làng</strong> để nhận nhiệm vụ đầu tiên.</div>
      <div class="wm-buttons">
        <button class="btn-secondary wm-btn-guide" id="btn-show-guide">📖 Xem đầy đủ hướng dẫn</button>
        <button class="btn-primary wm-btn-start" id="btn-close-welcome">⚡ Bắt Đầu Tu Tiên!</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('btn-close-welcome')?.addEventListener('click', () => overlay.remove());
  document.getElementById('btn-show-guide')?.addEventListener('click', () => { overlay.remove(); showFullGuide(G); });
}

export function showFullGuide(G) {
  const existing = document.getElementById('modal-guide');
  if (existing) existing.remove();

  const completed = TUTORIAL_QUESTS.filter(q => q.check(G));
  const pct = Math.round(completed.length / TUTORIAL_QUESTS.length * 100);

  const overlay = document.createElement('div');
  overlay.id = 'modal-guide'; overlay.className = 'modal-overlay';
  overlay.style.cssText = 'display:flex;z-index:9998;';
  overlay.innerHTML = `
    <div class="guide-modal">
      <div class="guide-header">
        <h2>📖 Cẩm Nang Tu Tiên</h2>
        <div class="guide-progress-wrap">
          <div class="guide-progress-bar"><div class="guide-progress-fill" style="width:${pct}%"></div></div>
          <span class="guide-pct">${completed.length}/${TUTORIAL_QUESTS.length} hoàn thành</span>
        </div>
      </div>
      <div class="guide-quests">
        ${TUTORIAL_QUESTS.map(q => {
          const done = q.check(G);
          return `<div class="guide-quest ${done?'guide-quest-done':''}">
            <span class="gq-icon">${done?'✅':q.icon}</span>
            <div class="gq-body">
              <div class="gq-title">${q.title}</div>
              <div class="gq-desc">${q.desc}</div>
              ${done?'':`<div class="gq-reward">🎁 ${q.reward}</div>`}
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="guide-tips">
        <div class="guide-tips-title">💡 Mẹo sinh tồn</div>
        <div class="guide-tip">🧘 Luôn bật Bế Quan khi không chơi — offline 20% hiệu suất</div>
        <div class="guide-tip">⏳ Tuổi thọ cạn = Game Over. Đột phá cảnh giới là ưu tiên số 1</div>
        <div class="guide-tip">✨ Cơ Duyên xuất hiện ngẫu nhiên khi Thám Hiểm</div>
        <div class="guide-tip">🏔 Pháp Địa tốt hơn = tu luyện nhanh hơn</div>
      </div>
      <button class="btn-primary guide-close" id="btn-close-guide" style="width:100%;margin-top:12px">Đã Hiểu, Bắt Đầu!</button>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('btn-close-guide')?.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); });
}

// ---- Linh Thú Encounter Popup ----
export function showLinhThuEncounterPopup(G, encounter, { renderCurrentTab }) {
  const existing = document.getElementById('modal-linhthu-encounter');
  if (existing) existing.remove();

  const data = LINH_THU_DATA[encounter.beastId];
  if (!data) return;

  const isEgg    = encounter.type === 'egg';
  const hasSlot  = (G.linhThu?.slots||[]).some(s => s === null);
  const RARITY   = { common:'#888', uncommon:'#56c46a', rare:'#3a9fd5', epic:'#a855f7', legendary:'#f0d47a' };
  const rarColor = RARITY[data.rarity] || '#888';
  const buffLines = data.buffs.map(b => `<div style="font-size:11px;color:#56c46a">✦ ${b.label}</div>`).join('');

  const modal = document.createElement('div');
  modal.id = 'modal-linhthu-encounter';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `
    <div style="background:#0d1828;border:2px solid ${rarColor};border-radius:14px;padding:24px;max-width:300px;width:90%;text-align:center">
      <div style="font-size:48px;margin-bottom:8px">${isEgg?'🥚':data.emoji}</div>
      <div style="font-size:11px;color:${rarColor};font-weight:700;letter-spacing:2px;margin-bottom:6px">${data.rarity.toUpperCase()} · ${data.nameCN}</div>
      <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px">${isEgg?`Trứng ${data.name}`:data.name}</div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:10px;line-height:1.6">${data.desc}</div>
      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px;margin-bottom:14px">
        ${buffLines}
        ${isEgg?`<div style="font-size:11px;color:#f0d47a;margin-top:4px">🥚 Ấp ${data.eggDays} ngày sẽ nở</div>`:''}
      </div>
      ${!hasSlot?`<div style="font-size:11px;color:#e05c4a;margin-bottom:12px">⚠ Đã có 2 linh thú — cần thả bớt trước!</div>`:''}
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        ${isEgg
          ? `<button id="btn-lt-pickup" style="padding:10px 18px;background:${rarColor};color:#000;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;${!hasSlot?'opacity:0.4;pointer-events:none':''}">🥚 Nhặt Trứng</button>`
          : `<button id="btn-lt-tame"   style="padding:10px 18px;background:${rarColor};color:#000;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;${!hasSlot?'opacity:0.4;pointer-events:none':''}">✋ Thuần Hóa (~${Math.floor(data.tameChance*100)}%)</button>`}
        <button id="btn-lt-skip" style="padding:10px 14px;background:#1a2030;color:#888;border:1px solid #333;border-radius:8px;font-size:13px;cursor:pointer">Bỏ Qua</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById('btn-lt-pickup')?.addEventListener('click', () => {
    modal.remove();
    const r = pickupEgg(G, encounter.beastId);
    showToast(r.msg, r.ok?'epic':'danger');
    saveGame(G);
  });
  document.getElementById('btn-lt-tame')?.addEventListener('click', () => {
    modal.remove();
    const r = tryTame(G, encounter.beastId);
    showToast(r.msg, r.ok?'legendary':'danger');
    if (r.ok) renderCurrentTab();
    saveGame(G);
  });
  document.getElementById('btn-lt-skip')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
}