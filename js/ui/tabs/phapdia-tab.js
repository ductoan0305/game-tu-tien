// ============================================================
// ui/tabs/phapdia-tab.js — Pháp Địa & Công Pháp tab
// ============================================================
import { PHAP_DIA_LIST, CONG_PHAP_LIST, CONG_PHAP_MAX_SLOTS,
  getCurrentPhapDia, getAvailableCongPhap,
  getActiveCongPhap, checkElementMatch, calcCongPhapMasteryBonus } from '../../core/phap-dia.js';

const REALM_NAMES  = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
const GRADE_COLORS = { 0:'#888', 1:'#aaa', 2:'#56c46a', 3:'#c8a84b', 4:'#7b68ee', 5:'#e05c4a' };
const ELEM_NAMES   = { kim:'Kim 🔶', mu:'Mộc 🌿', shui:'Thủy 💧', huo:'Hỏa 🔥', tu:'Thổ 🪨' };

export function renderPhapDiaTab(G, actions) {
  const panel = document.getElementById('panel-phapdia');
  if (!panel) return;

  const curDia    = getCurrentPhapDia(G);
  const activeCP  = getActiveCongPhap(G);
  const cpBonus   = calcCongPhapMasteryBonus(G);

  // ── Pháp Địa list ──
  const diaHtml = PHAP_DIA_LIST.map(d => {
    const isCur  = d.id === curDia.id;
    const locked = G.realmIdx < d.unlockRealm;
    const expiresTxt = (isCur && G.phapDia?.expiresAt)
      ? `⏳ Còn ${Math.ceil((G.phapDia.expiresAt - Date.now())/60000)} phút` : '';
    let costTxt = '';
    if (d.cost > 0 && d.costType === 'stone') costTxt = `💎 ${d.cost}`;
    else if (d.costType === 'sect_rank') costTxt = '🏯 Cần Chân Truyền';
    else if (d.costType === 'explore')   costTxt = '🗺 Cơ duyên khám phá';
    else if (d.costType === 'sect_war')  costTxt = '⚔ Tông môn chiến';
    else costTxt = 'Miễn phí';
    return `
      <div class="phapdia-card ${isCur?'phapdia-current':''} ${locked?'phapdia-locked':''}">
        <div class="pd-header">
          <span class="pd-emoji">${d.emoji}</span>
          <div class="pd-info">
            <span class="pd-name">${d.name}</span>
            <span class="pd-mult">×${d.rateMultiplier} tốc độ tu luyện</span>
          </div>
          ${isCur ? `<span class="pd-badge">Đang ở</span>` : ''}
        </div>
        <p class="pd-lore">${d.lore}</p>
        <div class="pd-footer">
          <span class="pd-cost">${locked ? `🔒 ${REALM_NAMES[d.unlockRealm]}` : costTxt}</span>
          ${expiresTxt ? `<span class="pd-expires">${expiresTxt}</span>` : ''}
          ${!isCur && !locked && d.costType !== 'explore' && d.costType !== 'sect_war' && d.costType !== 'co_duyen'
            ? `<button class="btn-sm btn-primary btn-move-phapdia" data-id="${d.id}">Di Chuyển</button>`
            : isCur ? '' : locked ? '' :
              `<button class="btn-sm btn-disabled" disabled>🔒 ${d.costType === 'explore' ? 'Cần Khám Phá' : 'Cần Tông Môn Chiến'}</button>`
          }
        </div>
      </div>`;
  }).join('');

  // ── Công Pháp đang tu ──
  const activeHtml = activeCP.length === 0
    ? `<p style="color:var(--text-dim);text-align:center">Chưa có công pháp nào.</p>`
    : activeCP.map(({ cp, mastery }) => {
        const match   = checkElementMatch(G, cp);
        const color   = GRADE_COLORS[cp.grade] || '#888';
        const b       = cp.buffs(mastery, match);
        const buffTxt = [
          b.ratePct  ? `+${b.ratePct}% tốc tu` : '',
          b.atkPct   ? `+${b.atkPct}% ATK`     : '',
          b.defPct   ? `+${b.defPct}% DEF`     : '',
          b.hpPct    ? `+${b.hpPct}% HP`       : '',
          b.danBonus ? `+${b.danBonus} Đan`    : '',
        ].filter(Boolean).join(' · ');
        const realmTxt = `${REALM_NAMES[cp.realmRange[0]]}${cp.realmRange[1]>cp.realmRange[0]?' → '+REALM_NAMES[cp.realmRange[1]]:''}`;
        return `
          <div class="congphap-card congphap-current" style="border-color:${color}66">
            <div class="cp-header">
              <span class="cp-emoji">${cp.emoji}</span>
              <div class="cp-info">
                <span class="cp-name" style="color:${color}">${cp.name}</span>
                <span class="cp-grade" style="color:${color}">[${cp.gradeName}]${cp.element ? ' · '+ELEM_NAMES[cp.element] : ''}</span>
              </div>
              <span class="cp-badge">Đang tu</span>
            </div>
            <div style="margin:6px 0">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-dim);margin-bottom:3px">
                <span>Thuần Thục ${mastery.toFixed(1)}/100${match?' ✨ Khớp hệ':''}</span>
                <span>${cp.stages} tầng · ${realmTxt}</span>
              </div>
              <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px">
                <div style="height:100%;width:${mastery}%;background:${color};border-radius:3px;transition:width 0.5s"></div>
              </div>
            </div>
            <div style="font-size:11px;color:#56c46a;margin:4px 0">${buffTxt || 'Chưa có buff (thuần thục quá thấp)'}</div>
            <p class="cp-lore" style="font-size:10px;margin:4px 0">${cp.lore}</p>
            ${cp.id !== 'vo_danh'
              ? `<button class="btn-sm btn-danger btn-remove-cp" data-id="${cp.id}" style="margin-top:4px">Dừng tu luyện</button>`
              : ''}
          </div>`;
      }).join('');

  // ── Công Pháp có thể học ──
  const available = getAvailableCongPhap(G);
  const phapHtml = available.map(c => {
    const isActive   = G.congPhap?.activeIds?.includes(c.id);
    const isUnlocked = G.congPhap?.unlockedIds?.includes(c.id);
    const [minR, maxR] = c.realmRange;
    const locked  = G.realmIdx < minR;
    const color   = GRADE_COLORS[c.grade] || '#888';
    const mastery = G.congPhap?.mastery?.[c.id] ?? 0;
    const match   = checkElementMatch(G, c);
    const b       = c.buffs(100, match); // hiển thị buff tối đa
    const buffMax = [
      b.ratePct  ? `+${b.ratePct}% tốc tu` : '',
      b.atkPct   ? `+${b.atkPct}% ATK`     : '',
      b.defPct   ? `+${b.defPct}% DEF`     : '',
      b.hpPct    ? `+${b.hpPct}% HP`       : '',
      b.danBonus ? `+${b.danBonus} Đan`    : '',
    ].filter(Boolean).join(' · ');
    const realmTxt = `${REALM_NAMES[minR]}${maxR>minR?' → '+REALM_NAMES[maxR]:''}`;
    const slotsFull = (G.congPhap?.activeIds?.length ?? 0) >= CONG_PHAP_MAX_SLOTS;

    let actionBtn = '';
    if (locked) {
      actionBtn = `<button class="btn-sm btn-disabled" disabled>🔒 Cần ${REALM_NAMES[minR]}</button>`;
    } else if (isActive) {
      actionBtn = `<span style="color:#56c46a;font-size:11px">✓ Đang tu luyện</span>`;
    } else if (isUnlocked) {
      actionBtn = slotsFull
        ? `<button class="btn-sm btn-disabled" disabled>Đầy slot (${CONG_PHAP_MAX_SLOTS}/${CONG_PHAP_MAX_SLOTS})</button>`
        : `<button class="btn-sm btn-primary btn-add-cp" data-id="${c.id}">Thêm vào tu luyện</button>`;
    } else if (c.acquireType === 'co_duyen') {
      actionBtn = `<span style="color:#f0d47a;font-size:11px">✨ Chỉ qua Cơ Duyên</span>`;
    } else {
      actionBtn = `<button class="btn-sm btn-primary btn-upgrade-cp" data-id="${c.id}">
        ${c.cost > 0 ? `Mua 💎${c.cost}` : 'Lĩnh ngộ'}
      </button>`;
    }

    return `
      <div class="congphap-card ${locked?'congphap-locked':''}" style="border-color:${color}44">
        <div class="cp-header">
          <span class="cp-emoji">${c.emoji}</span>
          <div class="cp-info">
            <span class="cp-name" style="color:${color}">${c.name}</span>
            <span class="cp-grade" style="color:${color}">[${c.gradeName}]${c.element?' · '+ELEM_NAMES[c.element]:''}</span>
          </div>
        </div>
        <div style="font-size:10px;color:var(--text-dim);margin:3px 0">${c.stages} tầng · ${realmTxt}${match?' · <span style="color:#f0d47a">✨ Khớp linh căn</span>':''}</div>
        <div style="font-size:11px;color:var(--text-dim);margin:3px 0">Buff tối đa: <span style="color:#56c46a">${buffMax}</span></div>
        ${isUnlocked ? `<div style="font-size:10px;color:var(--text-dim)">Thuần thục: ${mastery.toFixed(1)}/100</div>` : ''}
        <p class="cp-lore" style="font-size:10px;margin:4px 0">${c.desc}</p>
        <div class="cp-footer">${actionBtn}</div>
      </div>`;
  }).join('');

  // ── Tổng buff công pháp ──
  const totalBuffTxt = [
    cpBonus.ratePct  ? `+${cpBonus.ratePct.toFixed(0)}% tốc tu`  : '',
    cpBonus.atkPct   ? `+${cpBonus.atkPct.toFixed(0)}% ATK`      : '',
    cpBonus.defPct   ? `+${cpBonus.defPct.toFixed(0)}% DEF`      : '',
    cpBonus.hpPct    ? `+${cpBonus.hpPct.toFixed(0)}% HP`        : '',
    cpBonus.danBonus ? `+${cpBonus.danBonus.toFixed(0)} Đan`     : '',
  ].filter(Boolean).join(' · ') || 'Chưa có buff';

  panel.innerHTML = `
    <div class="tab-content">
      <h2 class="tab-title">🏔 Pháp Địa · Công Pháp</h2>

      <div class="phapdia-summary">
        <div class="pds-item">
          <span>📍 Pháp Địa</span>
          <strong>${curDia.emoji} ${curDia.name} (×${curDia.rateMultiplier})</strong>
        </div>
        <div class="pds-item">
          <span>📖 Công Pháp (${activeCP.length}/${CONG_PHAP_MAX_SLOTS})</span>
          <strong style="color:#56c46a">${totalBuffTxt}</strong>
        </div>
        <div class="pds-item">
          <span>🧘 Trạng Thái</span>
          <strong>${G.meditating ? '🧘 Đang bế quan (thuần thục tăng)' : '👁 Xuất quan'}</strong>
        </div>
      </div>

      <div class="section-title">📖 Công Pháp Đang Tu (${activeCP.length}/${CONG_PHAP_MAX_SLOTS})</div>
      <div class="congphap-list">${activeHtml}</div>

      <div class="section-title" style="margin-top:16px">📚 Công Pháp Có Thể Học</div>
      ${available.length === 0
        ? `<p class="empty-msg">Gia nhập tông môn để nhận Công Pháp tông môn!</p>`
        : `<div class="congphap-list">${phapHtml}</div>`}

      <div class="section-title" style="margin-top:16px">🏔 Chọn Pháp Địa</div>
      <div class="phapdia-list">${diaHtml}</div>
    </div>`;

  // Wire events
  panel.querySelectorAll('.btn-move-phapdia').forEach(btn =>
    btn.addEventListener('click', () => actions.movePhapDia(btn.dataset.id)));
  panel.querySelectorAll('.btn-upgrade-cp').forEach(btn =>
    btn.addEventListener('click', () => actions.upgradeCongPhap(btn.dataset.id)));
  panel.querySelectorAll('.btn-add-cp').forEach(btn =>
    btn.addEventListener('click', () => actions.addCongPhapSlot(btn.dataset.id)));
  panel.querySelectorAll('.btn-remove-cp').forEach(btn =>
    btn.addEventListener('click', () => actions.removeCongPhapSlot(btn.dataset.id)));
}