// ============================================================
// app/popups/misc-popups.js
// Các popup nhỏ: breakthrough, sect join, reset, welcome/guide,
//               cơ duyên, linh thú encounter, age decay
// ============================================================
import { LINH_THU_DATA, tryTame, pickupEgg } from '../../core/linh-thu-engine.js';
import { saveGame }                           from '../../core/state.js';
import { showToast }                          from '../../ui/render-core.js';
import { auth }                               from '../../firebase/firebase-config.js';
import { REALM_NAMES }                        from '../../core/constants.js';

// ---- Mô tả thân thể 9 tầng Luyện Khí (index 0 = LK Sơ Kỳ I) ----
// Dùng: LK_STAGE_BODY_DESC[result.statDelta.stage - 1]
const LK_STAGE_BODY_DESC = [
  // LK1 — Sơ Kỳ I
  'Linh khí len lỏi qua kinh mạch mong manh như sợi chỉ. Da thịt ửng hồng, hơi thở sâu hơn đôi chút — phàm thể vừa mở cửa trước linh giới.',
  // LK2 — Sơ Kỳ II
  'Đan điền bắt đầu ấm áp, linh khí ngưng tụ thành luồng mỏng. Cơ bắp săn chắc hơn, vết thương nhỏ liền sẹo nhanh hơn người thường.',
  // LK3 — Sơ Kỳ III
  'Sơ Kỳ viên mãn — phàm thể đã chịu được linh khí tuần hoàn đều đặn. Mắt sáng hơn, khứu giác bén nhạy, bước chân nhẹ nhàng như không trọng lượng.',
  // LK4 — Trung Kỳ I
  'Kinh mạch nở rộng đáng kể, linh khí chảy thông suốt như suối gặp khe rộng. Sức lực tăng vọt — tay không bẻ gãy đá cuội, sải chân vượt xa người thường.',
  // LK5 — Trung Kỳ II
  'Đan điền nóng rực, linh khí tích tụ dày đặc như sương sớm thành mây. Cơ thể không còn cảm giác mệt mỏi sau đi bộ dài, giấc ngủ chỉ cần nửa thời lượng thường.',
  // LK6 — Trung Kỳ III
  'Trung Kỳ viên mãn — thân thể nhẹ nhàng như lông chim. Linh khí tràn ngập từng tế bào, nội lực đủ sức kháng cự thú thương hạng thấp. Tinh thần sáng suốt, tư duy nhanh bén.',
  // LK7 — Hậu Kỳ I
  'Linh khí dày đặc trong huyết mạch — huyết quản nhìn xuyên da như ngọc lưu ly. Thoáng nghe tiếng gió sau lưng, phản xạ đã tức thì. Sức mạnh vượt xa phàm nhân bội phần.',
  // LK8 — Hậu Kỳ II
  'Từng tế bào thấm đẫm linh khí, da thịt cứng rắn như đồng luyện. Thân nhiệt kiểm soát được trong trời lạnh giá, hô hấp có thể ngừng nhiều giờ khi cần. Bước vào ngưỡng tinh anh của thế gian.',
  // LK9 — Hậu Kỳ III
  'Hậu Kỳ viên mãn — linh khí chực chờ chuyển hóa. Cơ thể đã chạm đỉnh giới hạn của Luyện Khí: linh quang thoáng ẩn trên da vào lúc bình minh, nội tức sâu như vực thẳm. Trúc Cơ — một bước trời vực — đang chờ.',
];

// ---- Breakthrough Modal ----
export function showBreakthroughModal(result) {
  const existing = document.getElementById('modal-breakthrough');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id        = 'modal-breakthrough';
  modal.className = 'modal-overlay';

  // ── Type 'stage' (Tiến Cảnh trong cùng cảnh giới) — hiển thị full stats panel
  if (result.type === 'stage' && result.statDelta) {
    const d = result.statDelta;

    // Hàm tạo dòng chỉ số trước/sau
    const statRow = (emoji, label, before, after) => {
      const diff = after - before;
      const sign = diff >= 0 ? '+' : '';
      const diffStr = diff !== 0
        ? `<span style="color:#56c46a;font-weight:700">(${sign}${diff})</span>`
        : `<span style="color:#666">(±0)</span>`;
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.05)">
          <span style="font-size:13px;color:#c8d8f0">${emoji} ${label}</span>
          <span style="font-size:13px;color:#fff;letter-spacing:0.5px">
            <span style="color:#aaa">${before}</span>
            <span style="color:#666;margin:0 4px">→</span>
            <strong>${after}</strong>
            &nbsp;${diffStr}
          </span>
        </div>`;
    };

    // Body desc theo tầng LK (chỉ LK, index 0-8)
    const bodyDesc = LK_STAGE_BODY_DESC[d.stage - 1] || '';

    modal.innerHTML = `
      <div class="modal-box breakthrough-modal" style="max-width:420px;padding:0;overflow-x:hidden;overflow-y:auto;max-height:90vh;border-color:#c8a84b55">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1a2a0a,#0d2010);padding:18px 20px 14px;text-align:center;border-bottom:1px solid rgba(200,168,75,0.25)">
          <h2 style="margin:0 0 4px;font-size:18px;color:#f0d47a">${result.title || '✨ Tiến Cảnh Thành Công'}</h2>
          <div class="bt-sub" style="font-size:14px;color:#a3d977;margin:0">${result.sub || ''}</div>
        </div>

        <!-- Flavor lore -->
        ${result.flavor ? `
        <div style="padding:10px 16px;background:rgba(255,255,255,0.025);border-bottom:1px solid rgba(255,255,255,0.06);text-align:center">
          <p class="bt-flavor" style="margin:0;font-size:12px;color:#8ba8c8;line-height:1.6;font-style:italic">${result.flavor}</p>
        </div>` : ''}

        <!-- Stat deltas -->
        <div style="padding:8px 0 0;background:#0d1828">
          ${statRow('⚔', 'Công Kích', d.atkBefore, d.atkAfter)}
          ${statRow('🛡', 'Phòng Ngự', d.defBefore, d.defAfter)}
          ${statRow('❤', 'Thể Lực tối đa', d.hpBefore, d.hpAfter)}
          <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.05)">
            <span style="font-size:13px;color:#c8d8f0">🌀 Linh Lực tối đa</span>
            <span style="font-size:13px;color:#7fb2ff;font-weight:700">↑ ${d.newMaxQi}</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.05)">
            <span style="font-size:13px;color:#c8d8f0">💚 Tâm Cảnh</span>
            <span style="font-size:13px;color:#fff">
              <span style="color:#aaa">${d.tamCanhBefore}</span>
              <span style="color:#666;margin:0 4px">→</span>
              <strong>${d.tamCanhAfter}</strong>
              &nbsp;<span style="color:#56c46a;font-weight:700">(+${d.tamCanhAfter - d.tamCanhBefore})</span>
            </span>
          </div>
        </div>

        <!-- Kiên Cố warning -->
        <div style="margin:0;padding:10px 14px;background:rgba(224,92,26,0.12);border-top:1px solid rgba(224,92,26,0.3);border-bottom:1px solid rgba(224,92,26,0.3)">
          <div style="font-size:12px;color:#e09060;font-weight:700;margin-bottom:2px">⚠ Kiên Cố đã reset về 0</div>
          <div style="font-size:11px;color:#a07050;line-height:1.5">Linh lực tầng mới chưa vững — cần rèn luyện qua chiến đấu và nhiệm vụ để tích lại Kiên Cố trước khi đột phá tiếp.</div>
        </div>

        <!-- Mô tả thân thể -->
        ${bodyDesc ? `
        <div style="padding:10px 14px;background:rgba(255,255,255,0.02);border-bottom:1px solid rgba(255,255,255,0.06)">
          <div style="font-size:10px;color:#4a6a9a;letter-spacing:1px;margin-bottom:6px">— THÂN THỂ BIẾN HÓA —</div>
          <p style="margin:0;font-size:12px;color:#8ba8c8;line-height:1.7;font-style:italic">${bodyDesc}</p>
        </div>` : ''}

        <!-- Footer -->
        <div style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;background:#080f1a">
          <span style="font-size:11px;color:#4a6080">Tỷ lệ thành công: <strong style="color:#7fb2ff">${d.chance}%</strong></span>
          <button id="btn-bt-continue" class="btn-primary" style="padding:8px 22px;font-size:13px">Tiếp Tục</button>
        </div>
      </div>`;

    document.body.appendChild(modal);
    document.getElementById('btn-bt-continue')?.addEventListener('click', () => modal.remove());
    // Không tự đóng — người chơi cần đọc thông tin này
    return;
  }

  // ── Type 'realm' / 'ascend' (hoặc fallback) — giữ nguyên layout đơn giản
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
function _getTutorialQuests(G) {
  const isSectStart = !!G.sectId && (G.worldMap?.leftStarter === true || !G.worldMap?.starterVillageId);
  const quest0 = isSectStart
    ? {
        id:'tut_0',
        title:'0. Nhận chỉ dẫn ở tông môn',
        desc:'Ngươi đã ở tông môn. Mở tab 📜 Nhiệm Vụ để nhận hướng đi đầu tiên, rồi bế quan tích lũy linh lực.',
        icon:'🏯',
        check:(G)=>(G.quests?.active?.length||0)>=1||(G.totalQuestsCompleted||0)>=1,
        reward:'Mở khóa hướng đi đầu',
      }
    : {
        id:'tut_0',
        title:'0. Gặp Trưởng Lão trong làng',
        desc:'Ngay trên màn hiện tại, vào khu làng và nói chuyện với 👴 Trưởng Lão để nhận chỉ dẫn đầu tiên.',
        icon:'👴',
        check:(G)=>(G.quests?.active?.length||0)>=1||(G.totalQuestsCompleted||0)>=1,
        reward:'Mở khóa chuỗi nhiệm vụ chính',
      };

  return [
    quest0,
    { id:'tut_1',
      title:'1. Hiểu bản đồ và vị trí hiện tại',
      desc:'Tab Tu Luyện là hiện trường (làng / vùng đất). Nút Bản Đồ dưới thanh điều hướng mở bản đồ thế giới (Phàm Nhân Giới) để xem các vùng lân cận.',
      icon:'🗺',
      check:(G)=>!!G.worldMap?.currentNodeId,
      reward:'Biết đường đi nước bước' },
    { id:'tut_2',
      title:'2. Săn thú để sinh tồn',
      desc:'⚔ Săn thú không chỉ để kiếm linh thạch: còn để mở nhiệm vụ, tích danh tiếng, kiếm nguyên liệu và cơ hội rơi trang bị.',
      icon:'⚔',
      check:(G)=>(G.hunts||0)>=1,
      reward:'Nguồn tài nguyên đầu game' },
    { id:'tut_3',
      title:'3. Bế quan tu luyện',
      desc:'Bấm 🧘 Bế Quan để tích linh lực. Khi offline, chọn bế quan để thời gian tu hành không bị lãng phí.',
      icon:'🧘',
      check:(G)=>G.meditating,
      reward:'Tiến trình dài hạn' },
    { id:'tut_4',
      title:'4. Xem công pháp và pháp địa',
      desc:'Vào 🏔 Pháp Địa để xem công pháp đang tu (thuần thục) và môi trường tu luyện. Đây là “đường dài” của tán tu.',
      icon:'🏔',
      check:(G)=>G.activeTab==='phapdia' || (G.tutorial?.progress?.openedPhapdiaTab===true),
      reward:'Hiểu đường tu' },
    { id:'tut_5',
      title:'5. Thử đột phá (chấp nhận thất bại)',
      desc:'Khi linh lực đầy, hãy tích Thuần Độ rồi thử ⚡ Đột Phá. Thất bại là bình thường, nhưng giúp ngươi hiểu số mệnh.',
      icon:'⚡',
      check:(G)=>(G.breakthroughs||0)>=1,
      reward:'Hiểu rủi ro và giới hạn tuổi' },
  ];
}

function _getSpiritBadge(G) {
  const type = G.spiritData?.type;
  const main = G.spiritData?.mainElement || G.spiritRoot;
  const elName = { jin:'Kim', mu:'Mộc', shui:'Thủy', huo:'Hỏa', tu:'Thổ' }[main] || 'Vô';
  const elEmoji = { jin:'⚔', mu:'🌿', shui:'💧', huo:'🔥', tu:'🗿' }[main] || '✦';
  const typeName = {
    NGU:'Ngũ linh căn',
    TU:'Tứ linh căn',
    TAM:'Tam linh căn',
    SONG:'Song linh căn',
    BIEN_DI:'Biến dị linh căn',
    TIEN:'Thiên linh căn',
  }[type] || 'Linh căn';

  const thiênVề = (type === 'NGU' || type === 'TU' || type === 'TAM' || type === 'SONG') && main
    ? ` · thiên về ${elName}`
    : (type === 'BIEN_DI' && main ? ` · hệ ${elName}` : '');

  return {
    badge: `${typeName}${thiênVề}`,
    short: `${elName} ${elEmoji}`,
  };
}

function _getRootPathGuidance(G) {
  const type = G.spiritData?.type || '';
  const main = G.spiritData?.mainElement || G.spiritRoot;

  const mainMap = {
    kim:  { path:'Kiếm tu / công kích', tip:'Ưu tiên công pháp hệ Kim, săn yêu thú vừa sức để tích lũy ổn định.' },
    mu:   { path:'Sinh tồn / hồi phục', tip:'Đi đường dài an toàn, ưu tiên giữ thể trạng và tránh liều đột phá sớm.' },
    shui: { path:'Cơ duyên / ổn định',  tip:'Thám hiểm có kiểm soát để tìm kỳ ngộ, không đổi mạng lấy tài nguyên nhỏ.' },
    huo:  { path:'Bùng nổ / đan đạo',   tip:'Hệ Hỏa hợp hướng luyện đan và đột phá nhanh, nhưng cần kiểm soát rủi ro.' },
    tu:   { path:'Phòng thủ / bền bỉ',  tip:'Đánh chắc tiến chắc, tích lũy tài nguyên trước khi thử các bước nguy hiểm.' },
  };

  if (type === 'NGU') {
    return {
      title: 'Ngũ linh căn — con đường sinh tồn',
      lines: [
        'Xác suất thành công thấp là bình thường, không phải lỗi build.',
        'Mục tiêu thực tế: sống lâu, tối ưu từng bước nhỏ, chờ cơ duyên lớn.',
      ],
    };
  }
  if (type === 'TU') {
    return {
      title: 'Tứ linh căn — con đường kiên trì',
      lines: [
        'Có thể tới Luyện Khí hậu kỳ nếu đi đúng nhịp.',
        'Trước 70 tuổi là cửa sổ vàng; qua mốc này đột phá giảm rất mạnh.',
      ],
    };
  }
  if (type === 'TAM') {
    return {
      title: 'Tam linh căn — con đường có cơ hội',
      lines: [
        'Có cửa nhỏ Trúc Cơ nếu quản lý tuổi và tài nguyên tốt.',
        'Ưu tiên công pháp hợp hệ chính, tránh đốt tài nguyên vào buff ngắn hạn.',
      ],
    };
  }
  if (type === 'SONG' || type === 'BIEN_DI' || type === 'TIEN') {
    return {
      title: 'Linh căn hiếm — con đường thiên phú',
      lines: [
        'Tiềm năng cao hơn trung bình, nhưng vẫn có thể thất bại nếu chủ quan.',
        'Tập trung kỷ luật đột phá và giữ nhịp tăng trưởng dài hạn.',
      ],
    };
  }

  const picked = mainMap[main] || { path:'Tán tu căn bản', tip:'Đi chậm mà chắc, đừng đốt cơ hội tuổi trẻ vào nước đi rủi ro.' };
  return {
    title: `Gợi ý theo linh căn chính: ${picked.path}`,
    lines: [picked.tip],
  };
}

export function showWelcomeModal(G) {
  const existing = document.getElementById('modal-welcome');
  if (existing) existing.remove();

  const rootDesc  = { jin:'Thiên phú về chiến đấu', mu:'Hồi phục tốt', shui:'Cơ duyên nhiều hơn', huo:'Bùng nổ mạnh', tu:'Phòng thủ vững' };
  const spirit = _getSpiritBadge(G);
  const genderEmoji = G.gender === 'female' ? '👩' : '👨';
  const guidance = _getRootPathGuidance(G);
  const tutorialQuests = _getTutorialQuests(G);

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
        <span class="wm-root-badge">${spirit.badge}</span>
        <span class="wm-root-desc">${rootDesc[G.spiritData?.mainElement]||rootDesc[G.spiritRoot]||'Con đường tu tiên bắt đầu từ linh căn'}</span>
      </div>
      <div style="background:rgba(255,255,255,0.04);border:1px solid #2a3b55;border-radius:10px;padding:10px 12px;margin:10px 0 12px 0;text-align:left">
        <div style="font-size:12px;color:#7fb2ff;margin-bottom:6px">🧭 ${guidance.title}</div>
        ${guidance.lines.map(line => `<div style="font-size:12px;color:#d2def5;line-height:1.6">- ${line}</div>`).join('')}
      </div>
      <div class="wm-steps">
        <div class="wm-step-title">📖 Hướng dẫn nhanh</div>
        ${tutorialQuests.slice(0,4).map(q=>`
          <div class="wm-step">
            <span class="wm-step-icon">${q.icon}</span>
            <div><div class="wm-step-name">${q.title}</div><div class="wm-step-desc">${q.desc}</div></div>
          </div>`).join('')}
      </div>
      <div class="wm-warning">⏳ <strong>Quan trọng:</strong> Ngươi đang ở Luyện Khí tầng 1 với ~120 năm thọ mệnh. ${G.sectId ? 'Hãy mở <strong>📜 Nhiệm Vụ</strong> để nhận hướng đi đầu tiên.' : 'Hãy tìm <strong>👴 Trưởng Lão</strong> để nhận nhiệm vụ đầu tiên.'}</div>
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

  const TUTORIAL_QUESTS = _getTutorialQuests(G);
  const completed = TUTORIAL_QUESTS.filter(q => q.check(G));
  const pct = Math.round(completed.length / Math.max(1, TUTORIAL_QUESTS.length) * 100);

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
// ============================================================
// NPC Rivals — Encounter Popup (P11)
// ============================================================
import { RIVAL_DV_REWARD } from '../../core/co-duyen.js';
import { bus }             from '../../utils/helpers.js';

// Thông tin trade theo tên đối thủ (ingredient trades)
const RIVAL_TRADES = {
  'Van Tieu':      [{ id:'earth_stone',   qty:5, cost:80  }, { id:'wolf_fang',      qty:3, cost:120 }],
  'Dan Mai':       [{ id:'jade_lotus',    qty:3, cost:150 }, { id:'cloud_mushroom', qty:5, cost:60  }],
  'Thiet Minh':   [{ id:'earth_stone',   qty:8, cost:60  }, { id:'demon_core_1',   qty:2, cost:180 }],
  'Hoa Linh Nhi': [{ id:'blood_ginseng', qty:2, cost:280 }, { id:'spirit_herb',    qty:10,cost:80  }],
  'Huyen Ky':     [{ id:'tran_ky',       qty:2, cost:150 }, { id:'moon_dew',       qty:3, cost:200 }],
  'Lang Phong':   [{ id:'lightning_core',qty:1, cost:400 }, { id:'wolf_fang',      qty:5, cost:100 }],
  'Bac Minh':     [{ id:'demon_core_1',  qty:3, cost:180 }, { id:'blood_ginseng',  qty:1, cost:350 }],
  'Bach Dieu':    [{ id:'blood_ginseng', qty:2, cost:250 }, { id:'jade_lotus',     qty:5, cost:200 }],
  'Van Tieu Than':[{ id:'dragon_scale',  qty:1, cost:2000}, { id:'lightning_core', qty:3, cost:500 }],
};

// Normalize tên có dấu → không dấu để dùng làm key lookup
function normName(name) {
  return name.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D');
}

// Màu border theo realmIdx
const REALM_COLORS = ['#56c46a','#3a9fd5','#f0d47a','#a855f7','#f97316'];
const REALM_LABELS = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];

/**
 * showRivalEncounterPopup(G, rival, callbacks)
 * Hiển thị dialog gặp đối thủ với 3 lựa chọn:
 *   Thi Đấu → emit rival:start_combat
 *   Trao Đổi → inline trade panel
 *   Bỏ Qua → đóng modal
 */
export function showRivalEncounterPopup(G, rival, { renderCurrentTab }) {
  const existing = document.getElementById('modal-rival-encounter');
  if (existing) existing.remove();

  const rColor  = REALM_COLORS[rival.realmIdx] || '#56c46a';
  const rLabel  = REALM_LABELS[rival.realmIdx] || 'Luyện Khí';
  const dvGain  = RIVAL_DV_REWARD[rival.realmIdx] || 10;
  const key     = normName(rival.name);
  const trades  = RIVAL_TRADES[key] || [];

  // Tên ingredient hiển thị (đơn giản)
  const INGR_NAMES = {
    earth_stone:'Địa Thạch',jade_lotus:'Ngọc Liên',cloud_mushroom:'Vân Nấm',
    wolf_fang:'Sói Nha',blood_ginseng:'Huyết Sâm',spirit_herb:'Linh Thảo',
    moon_dew:'Nguyệt Lộ',tran_ky:'Trận Kỳ',lightning_core:'Lôi Tinh',
    demon_core_1:'Yêu Hạch Hạ',dragon_scale:'Long Lân',
  };

  const tradeRowsHtml = trades.map((t,i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:rgba(255,255,255,0.04);border-radius:6px;margin-bottom:4px">
      <span style="font-size:12px;color:#ddd">${INGR_NAMES[t.id]||t.id} ×${t.qty}</span>
      <button class="rival-trade-btn" data-idx="${i}" style="padding:4px 10px;background:${rColor}22;color:${rColor};border:1px solid ${rColor}44;border-radius:6px;font-size:11px;cursor:pointer">
        💎 ${t.cost}
      </button>
    </div>`).join('');

  const modal = document.createElement('div');
  modal.id = 'modal-rival-encounter';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;display:flex;align-items:center;justify-content:center';

  modal.innerHTML = `
    <div id="rival-modal-inner" style="background:#0d1828;border:2px solid ${rColor};border-radius:14px;padding:24px;max-width:320px;width:90%;text-align:center">
      <div style="font-size:11px;color:${rColor};letter-spacing:2px;font-weight:700;margin-bottom:6px">⚔ ĐỐI THỦ XUẤT HIỆN ⚔</div>
      <div style="font-size:36px;margin-bottom:6px">🧙</div>
      <div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:4px">${rival.name}</div>
      <div style="font-size:11px;color:${rColor};margin-bottom:8px">${rival.title}</div>
      <div style="font-size:11px;color:#888;margin-bottom:4px">${rLabel} · Thắng: +${dvGain} Danh Vọng</div>
      <div style="font-size:11px;color:var(--text-dim);line-height:1.6;margin-bottom:16px;padding:0 4px">${rival.desc}</div>

      <div id="rival-action-area" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button id="btn-rival-fight" style="padding:10px 16px;background:${rColor};color:#000;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">⚔ Thi Đấu</button>
        ${trades.length > 0 ? `<button id="btn-rival-trade" style="padding:10px 14px;background:#1e2a3a;color:${rColor};border:1px solid ${rColor}55;border-radius:8px;font-size:13px;cursor:pointer">🔄 Trao Đổi</button>` : ''}
        <button id="btn-rival-skip" style="padding:10px 14px;background:#1a2030;color:#666;border:1px solid #333;border-radius:8px;font-size:13px;cursor:pointer">Bỏ Qua</button>
      </div>

      <div id="rival-trade-panel" style="display:none;margin-top:14px;text-align:left">
        <div style="font-size:11px;color:#888;margin-bottom:8px;text-align:center">— Trao đổi nguyên liệu —</div>
        ${tradeRowsHtml}
        <div style="text-align:center;margin-top:8px">
          <button id="btn-rival-trade-back" style="padding:6px 14px;background:#1a2030;color:#666;border:1px solid #333;border-radius:6px;font-size:11px;cursor:pointer">← Quay lại</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);

  // === Thi Đấu ===
  document.getElementById('btn-rival-fight')?.addEventListener('click', () => {
    modal.remove();
    bus.emit('rival:start_combat', { rival });
  });

  // === Trao Đổi — toggle panel ===
  document.getElementById('btn-rival-trade')?.addEventListener('click', () => {
    document.getElementById('rival-action-area').style.display  = 'none';
    document.getElementById('rival-trade-panel').style.display  = 'block';
  });
  document.getElementById('btn-rival-trade-back')?.addEventListener('click', () => {
    document.getElementById('rival-action-area').style.display  = 'flex';
    document.getElementById('rival-trade-panel').style.display  = 'none';
  });

  // === Trade buttons ===
  modal.querySelectorAll('.rival-trade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx   = Number(btn.dataset.idx);
      const offer = trades[idx];
      if (!offer) return;
      if ((G.stone || 0) < offer.cost) {
        btn.textContent = '❌ Không đủ';
        btn.style.color = '#e05c4a';
        return;
      }
      if (!G.alchemy)             G.alchemy = { furnaceLevel:0, knownRecipes:[], ingredients:{}, craftsCount:0 };
      if (!G.alchemy.ingredients) G.alchemy.ingredients = {};
      G.stone -= offer.cost;
      G.alchemy.ingredients[offer.id] = (G.alchemy.ingredients[offer.id] || 0) + offer.qty;
      btn.textContent = `✓ Đã mua`;
      btn.disabled    = true;
      btn.style.opacity = '0.5';
      saveGame(G);
      showToast(`🔄 Mua ${INGR_NAMES[offer.id]||offer.id} ×${offer.qty} từ ${rival.name}!`, 'jade');
    });
  });

  // === Bỏ Qua ===
  document.getElementById('btn-rival-skip')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// ---- Giai Đoạn Suy Tàn — Age Decay Popup ----
// bracket: 'age60' | 'age65' | 'age70' | 'age75'
export function showAgeDecayPopup(bracket, realAge) {
  const existing = document.getElementById('modal-age-decay');
  if (existing) existing.remove();

  const CONFIGS = {
    age60: {
      emoji:   '🌫',
      title:   'Nội Khí Bắt Đầu Cứng Đọng',
      color:   '#c8a84b',
      body:    'Tuổi sáu mươi — nội khí không còn lưu chuyển thuần thục như thuở thiếu niên. Đây là quy luật của trời đất, không phân biệt phàm nhân hay tu sĩ.',
      sub:     null,
      autoMs:  8000,
      btnText: 'Hiểu rồi',
    },
    age65: {
      emoji:   '⏳',
      title:   'Khí Mạch Dần Suy',
      color:   '#e0a020',
      body:    'Tuổi sáu mươi lăm — tốc độ tích lũy Thuần Độ bắt đầu suy giảm. Linh lực bên ngoài vẫn đủ, nhưng cơ thể không còn hấp thu hiệu quả như trước.',
      sub:     '⚠ Tốc độ tích Thuần Độ −15%',
      autoMs:  10000,
      btnText: 'Chấp nhận',
    },
    age70: {
      emoji:   '💀',
      title:   'Suy Tàn Khí Huyết',
      color:   '#e05c1a',
      body:    'Tuổi bảy mươi — khí huyết suy kiệt rõ rệt. Con đường đột phá ngày càng hẹp. Từng ngày trôi qua là một cơ hội đang vụt tắt. Có cơ duyên cũng cần nắm lấy ngay.',
      sub:     '🔴 Tốc độ tích Thuần Độ −30%',
      autoMs:  0, // không tự đóng — phải click
      btnText: 'Vẫn tiếp tục',
    },
    age75: {
      emoji:   '🕯',
      title:   'Ngọn Đèn Trước Gió',
      color:   '#e03030',
      body:    'Tuổi bảy mươi lăm — ngọn đèn sinh mệnh lay động trước gió. Đột phá lúc này như leo dốc với đôi chân mỏi — không phải không thể, nhưng cần cơ duyên trời cho.',
      sub:     '🔴 Tốc độ tích Thuần Độ −50% · Nút Đột Phá mờ (soft)',
      autoMs:  0,
      btnText: 'Quyết không bỏ cuộc',
    },
  };

  const cfg = CONFIGS[bracket];
  if (!cfg) return;

  const modal = document.createElement('div');
  modal.id        = 'modal-age-decay';
  modal.className = 'modal-overlay';
  modal.style.cssText = 'display:flex;z-index:950;';

  modal.innerHTML = `
    <div class="modal-box" style="max-width:380px;text-align:center;border-color:${cfg.color}66;padding:24px 20px">
      <div style="font-size:44px;margin-bottom:10px">${cfg.emoji}</div>
      <h2 style="color:${cfg.color};margin-bottom:10px;font-size:17px">${cfg.title}</h2>
      <div style="font-size:11px;color:var(--text-dim);letter-spacing:1px;margin-bottom:14px">
        Năm thứ ${realAge} — Giai Đoạn Suy Tàn
      </div>
      <p style="color:var(--text-muted,#aaa);font-style:italic;font-size:13px;line-height:1.7;margin-bottom:14px">
        ${cfg.body}
      </p>
      ${cfg.sub ? `<div style="background:rgba(${cfg.color === '#e03030' ? '224,48,48' : '224,92,26'},0.15);border:1px solid ${cfg.color}44;border-radius:8px;padding:8px 12px;margin-bottom:16px;color:${cfg.color};font-size:12px;font-weight:bold">
        ${cfg.sub}
      </div>` : ''}
      <button class="btn-secondary" id="btn-age-decay-close" style="width:100%;padding:10px;border-color:${cfg.color}55;color:${cfg.color}">
        ${cfg.btnText}
      </button>
    </div>`;

  document.body.appendChild(modal);

  document.getElementById('btn-age-decay-close')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  // Tự đóng sau autoMs nếu được cấu hình
  if (cfg.autoMs > 0) setTimeout(() => modal?.remove(), cfg.autoMs);
}

// ============================================================
// Ngộ Đạo Ký — Chronicle Panel
// ============================================================
export function showChroniclePanel(G) {
  const existing = document.getElementById('modal-chronicle');
  if (existing) { existing.remove(); return; }

  const entries  = G.chronicle || [];
  const charName = G.name || 'Vô Danh';

  // ---- Phân loại entry để highlight ----
  function _entryClass(e) {
    const t = e.event || '';
    // Đột phá cảnh giới lớn (realm breakthrough) → gold
    if (/ĐẠI ĐỘT PHÁ|PHI THĂNG|Đột phá (Trúc Cơ|Kim Đan|Nguyên Anh|Hóa Thần|Luyện Khí)|Tuổi thọ tăng lên/i.test(t)) return 'chr-entry-gold';
    // Thất bại / mất mát / bị đánh → đỏ mờ
    if (/thất bại|Thất bại|bị.*cướp|Bị Kiếp Tu|trục xuất|Tẩu Hỏa|Ma Tính|sụp đổ/i.test(t)) return 'chr-entry-fail';
    return '';
  }

  // ---- Build entry HTML ----
  function _entryHtml(e) {
    const cls    = _entryClass(e);
    const detail = e.detail ? `<div class="chr-entry-detail">${e.detail}</div>` : '';
    return `
      <div class="chr-entry ${cls}">
        <span class="chr-entry-year">Năm ${e.year} · ${e.realmName}</span>
        <div class="chr-entry-event">${e.event}</div>
        ${detail}
      </div>`;
  }

  const listHtml = entries.length === 0
    ? '<div class="chr-empty">Chưa có ký sự nào được ghi lại.</div>'
    : [...entries].reverse().map(_entryHtml).join('');

  const modal = document.createElement('div');
  modal.id        = 'modal-chronicle';
  modal.className = 'modal-overlay';
  modal.style.cssText = 'display:flex;z-index:950;align-items:center;justify-content:center;';

  modal.innerHTML = `
    <div class="chr-panel">
      <div class="chr-panel-header">
        <span class="chr-panel-title">📜 Ngộ Đạo Ký · ${charName}</span>
        <span class="chr-panel-count">${entries.length} mục</span>
      </div>
      <div class="chr-panel-body">
        ${listHtml}
      </div>
      <div class="chr-panel-footer">
        <button class="btn-secondary" id="btn-chronicle-close">Đóng</button>
      </div>
    </div>

    <style>
      .chr-panel {
        background: #0d1828;
        border: 1px solid rgba(200,168,75,0.3);
        border-radius: 12px;
        width: 400px;
        max-width: 95vw;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.7);
      }
      .chr-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        background: linear-gradient(135deg, #1a2a0a, #0d2010);
        border-bottom: 1px solid rgba(200,168,75,0.2);
        flex-shrink: 0;
      }
      .chr-panel-title {
        font-size: 15px;
        font-weight: 700;
        color: #f0d47a;
      }
      .chr-panel-count {
        font-size: 11px;
        color: #5a7a9a;
      }
      .chr-panel-body {
        flex: 1;
        overflow-y: auto;
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .chr-panel-footer {
        padding: 10px 14px;
        border-top: 1px solid rgba(255,255,255,0.06);
        display: flex;
        justify-content: flex-end;
        flex-shrink: 0;
      }
      .chr-entry {
        padding: 8px 10px;
        border-radius: 6px;
        background: rgba(255,255,255,0.03);
        border-left: 2px solid rgba(255,255,255,0.06);
      }
      .chr-entry-gold {
        background: rgba(240,212,122,0.07);
        border-left-color: #f0d47a;
      }
      .chr-entry-fail {
        background: rgba(224,92,74,0.06);
        border-left-color: rgba(224,92,74,0.4);
      }
      .chr-entry-year {
        font-size: 10px;
        color: #5a7a9a;
        letter-spacing: 0.5px;
      }
      .chr-entry-event {
        font-size: 12px;
        color: #c8d8f0;
        margin-top: 3px;
        line-height: 1.5;
      }
      .chr-entry-gold .chr-entry-event {
        color: #f0d47a;
      }
      .chr-entry-fail .chr-entry-event {
        color: #c88070;
      }
      .chr-entry-detail {
        font-size: 11px;
        color: #5a7a9a;
        margin-top: 3px;
        font-style: italic;
        line-height: 1.4;
      }
      .chr-empty {
        font-size: 13px;
        color: #5a7a9a;
        text-align: center;
        padding: 30px 0;
        font-style: italic;
      }
    </style>`;

  document.body.appendChild(modal);
  document.getElementById('btn-chronicle-close')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
