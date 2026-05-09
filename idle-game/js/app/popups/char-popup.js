// ============================================================
// app/popups/char-popup.js — Character Info Popup
// Session 17: dùng PopupManager (drag + resize + header đẹp)
//             Xóa overlay kiểu cũ, xóa CSS char-popup-overlay riêng
// ============================================================
import { REALMS }                from '../../core/data.js';
import { REALM_NAMES }           from '../../core/constants.js';
import { calcMaxQi, calcQiRate, calcQiRateBreakdown, calcPurityThreshold, calcKienCoCeiling } from '../../core/state.js';
import { getDanhVongTier, DANH_VONG_TIERS } from '../../core/danh-vong.js';
import { getSpiritDisplayName, getSpiritMainColor, getSpiritProphecy,
         calcSpiritRateMulti, SPIRIT_ROOT_TYPES, SPIRIT_ELEMENTS } from '../../core/spirit-root.js';
import PopupManager              from '../../ui/popup-manager.js';

const POPUP_ID = 'char-info';

export function showCharPopup(G, { cultivateActions, saveGame, renderCurrentTab }) {
  // Toggle: nếu đang mở thì đóng
  if (PopupManager.isOpen(POPUP_ID)) {
    PopupManager.close(POPUP_ID);
    return;
  }

  const GENDER_EMOJI = { male:'♂', female:'♀' };
  const SECT_NAMES   = { kiem_tong:'Thanh Vân Kiếm Tông ⚔', dan_tong:'Vạn Linh Đan Tông ⚗', tran_phap:'Huyền Cơ Trận Tông 🔮', the_tu:'Thiết Cốt Thể Tu 💪' };
  const HUONG_TU     = { kiem:'⚔ Kiếm Tu', dan:'⚗ Đan Tu', the:'💪 Thể Tu', tran:'🔮 Trận Tu' };

  const sd = G.spiritData;
  let spiritHtml = '';
  if (sd && sd.type) {
    const typeInfo    = SPIRIT_ROOT_TYPES[sd.type] || {};
    const mainColor   = getSpiritMainColor(sd);
    const displayName = getSpiritDisplayName(sd);
    const prophecy    = getSpiritProphecy(sd);
    const rateMulti   = calcSpiritRateMulti(sd);
    const sortedElems = Object.entries(sd.points||{}).sort((a,b) => b[1]-a[1]);
    const elemRows = sortedElems.map(([el, pts]) => {
      const info  = SPIRIT_ELEMENTS[el] || {};
      const color = info.color || '#888';
      return `<div class="sr-elem-row">
        <span style="color:${color};font-size:14px">${info.emoji||'?'}</span>
        <span style="color:${color};font-weight:600">${info.name||el}</span>
        <div class="sr-elem-bar-wrap"><div class="sr-elem-bar" style="width:${Math.round(pts)}%;background:${color}"></div></div>
        <span style="color:${color};font-size:11px;font-weight:700">${pts}</span>
      </div>`;
    }).join('');
    const rarityColors = { 'thường':'#888','hiếm':'#56c46a','cực hiếm':'#c084fc','huyền thoại':'#f0d47a' };
    spiritHtml = `<div class="cp-section" style="border-color:${mainColor}33">
      <div class="cp-section-title">🌀 Linh Căn</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="color:${rarityColors[typeInfo.rarity]||'#888'};font-size:13px;font-weight:700">${typeInfo.label||sd.type}</span>
        <span style="color:${mainColor};font-size:11px">×${rateMulti.toFixed(1)} tu tốc</span>
      </div>
      <div style="font-size:11px;color:${mainColor};margin-bottom:8px">${displayName}</div>
      <div class="sr-elems">${elemRows}</div>
      ${prophecy ? `<div class="sr-prophecy">"${prophecy}"</div>` : ''}
    </div>`;
  } else if (G.spiritRoot) {
    const LEGACY = { jin:'Kim ⚔️', mu:'Mộc 🌿', shui:'Thủy 💧', huo:'Hỏa 🔥', tu:'Thổ 🗿', yin_yang:'Âm Dương ☯', hun:'Hỗn Nguyên 🌌' };
    spiritHtml = `<div class="cp-section"><div class="cp-section-title">🌀 Linh Căn</div><div style="color:var(--gold)">${LEGACY[G.spiritRoot]||G.spiritRoot}</div></div>`;
  } else {
    spiritHtml = `<div class="cp-section"><div class="cp-section-title">🌀 Linh Căn</div><div style="color:var(--text-dim);font-size:12px">Chưa giác ngộ linh căn</div></div>`;
  }

  function statBar(label, val, max, color, tooltip) {
    const pct = Math.min(100, Math.round((val / Math.max(1, max)) * 100));
    return `<div class="cp-stat-bar-row" title="${tooltip||''}">
      <span class="csb-label">${label}</span>
      <div class="csb-track"><div class="csb-fill" style="width:${pct}%;background:${color}"></div></div>
      <span class="csb-val">${val}</span>
    </div>`;
  }

  const khiVan    = G.khiVan    ?? 20;
  const ngoTinh   = G.ngoTinh   ?? 50;
  const canCot    = G.canCot    ?? 50;
  const tamCanh   = G.tamCanh   ?? 50;
  const kienCo      = G.kienCo ?? 0;
  const kcCeiling   = calcKienCoCeiling(G);
  const kcPct       = Math.min(100, Math.round(kienCo / Math.max(1, kcCeiling) * 100));
  // R4: Bottleneck info
  const _bnMap      = { 3:40, 6:70, 9:90 };
  const isBottleneck = G.realmIdx === 0 && (G.stage === 3 || G.stage === 6 || G.stage === 9);
  const bnRequired   = isBottleneck ? _bnMap[G.stage] : null;
  const qiRate  = calcQiRate(G);
  const bd      = calcQiRateBreakdown(G);
  const maxQi   = calcMaxQi(G);
  const qiFull  = (G.qi||0) >= maxQi;
  const qiPct   = Math.min(100, Math.floor(((G.qi||0)/Math.max(1,maxQi))*100));
  const realm   = REALMS[G.realmIdx];
  const khiVanColor  = khiVan>=70?'#f0d47a':khiVan>=40?'#56c46a':'#3a9fd5';
  const khiVanStatus = khiVan<30 ? '⚠ Dưới 30 — kỳ ngộ không thể xuất hiện' : khiVan<70 ? '✦ Cơ duyên bình thường' : '🌟 Khí vận cao — cơ duyên chiếu mệnh!';
  const PDNAMES = { pham_dia:'🏚 Phàm Địa ×0.8', linh_dia:'🌿 Linh Địa ×1.2', phuc_dia:'🏔 Phúc Địa ×1.8', dong_phu:'🕳 Động Phủ ×3.0', bao_dia:'💎 Bảo Địa ×5.0' };
  const pdName  = PDNAMES[G.phapDia?.currentId||'pham_dia'];

  function _fmtStone(G) {
    const t = Math.floor(G.stone||0);
    if (t>=1000000) return `${(t/1000000).toFixed(1)}M 🔮`;
    if (t>=10000)   return `${(t/10000).toFixed(1)}K 💠`;
    if (t>=1000)    return `${(t/1000).toFixed(1)}K 💎`;
    return `${t} 💎`;
  }

  const dv   = G.danhVong ?? 0;
  const tier = getDanhVongTier(dv);

  // ---- Tuổi & cửa sổ đột phá ----
  const currentAge = Math.floor(G.gameTime?.currentYear || 0);
  let ageColor = '#56c46a', ageWindowText = 'Cửa sổ < 70';
  if (currentAge >= 75) { ageColor = '#e05c4a'; ageWindowText = '☠ Cơ hội gần như 0'; }
  else if (currentAge >= 70) { ageColor = '#f0d47a'; ageWindowText = '⚠ Đang suy giảm'; }

  // ---- Danh Vọng progress bar đến tier tiếp theo ----
  const _dvTiersSorted = [...DANH_VONG_TIERS].sort((a, b) => a.min - b.min);
  const _nextTierEntry = _dvTiersSorted.find(t => t.min > dv);
  let dvProgressHtml = '';
  if (_nextTierEntry) {
    const _prevMin = [..._dvTiersSorted].reverse().find(t => t.min <= dv)?.min ?? 0;
    const _dvPct   = Math.min(100, Math.round((dv - _prevMin) / Math.max(1, _nextTierEntry.min - _prevMin) * 100));
    dvProgressHtml = `
      <div style="margin-top:6px">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-dim);margin-bottom:3px">
          <span>${tier.label}</span>
          <span>${dv} / ${_nextTierEntry.min} → ${_nextTierEntry.label}</span>
        </div>
        <div style="height:5px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${_dvPct}%;background:${tier.color};border-radius:3px"></div>
        </div>
      </div>`;
  } else {
    dvProgressHtml = `<div style="font-size:10px;color:${tier.color};margin-top:4px;text-align:center">✦ Đã đạt danh vọng tối cao</div>`;
  }

  const bodyEl = document.createElement('div');
  bodyEl.className = 'char-popup char-popup-full';
  bodyEl.innerHTML = `
    <div class="char-popup-header">
      <div class="cp-portrait-mini" id="cp-portrait-mini"></div>
      <div class="cp-header-info">
        <div class="char-popup-name">${G.name} <span style="font-size:12px;color:#888">${GENDER_EMOJI[G.gender||'male']}</span></div>
        <div class="char-popup-realm" style="color:var(--gold)">${REALM_NAMES[G.realmIdx]||'?'} · Tầng ${G.stage}</div>
        <div style="font-size:11px;margin-top:2px">
          <span id="cp-live-age" style="color:${ageColor}">⏳ ${currentAge} tuổi</span>
          <span id="cp-live-window" style="font-size:10px;color:${ageColor};opacity:0.85"> · ${ageWindowText}</span>
        </div>
        <div style="font-size:10px;color:#5a7a9a;margin-top:3px;display:flex;gap:8px">
          <span title="Tổng thời gian tu luyện trong game">🎮 <span id="cp-live-gametime">--</span></span>
          <span>·</span>
          <span title="Thời gian thực bạn đã chơi">🕐 <span id="cp-live-realtime">--</span></span>
        </div>
        <div class="char-popup-sect">${SECT_NAMES[G.sectId]||'🌿 Tán Tu'}</div>
        <div class="char-popup-direction" style="color:#7b9ef0">${HUONG_TU[G.huongTu]||'— Chưa xác định hướng tu'}</div>
      </div>
    </div>
    <div class="char-popup-body">
      <div class="cp-section cp-cultivate-section" style="border-color:${realm?.color||'#c8a84b'}44">
        <div class="cp-section-title">🧘 Tu Luyện</div>
        <div class="cp-realm-display" style="color:${realm?.color||'#c8a84b'}">${realm?.emoji||'⚡'} ${REALM_NAMES[G.realmIdx]||'?'} · Tầng ${G.stage} / ${realm?.stages||9}</div>
        <div class="cp-bar-row"><span class="cp-bar-label">Linh Lực</span><div class="cp-bar-track"><div class="cp-bar-fill" style="width:${qiPct}%;background:${qiFull?'#f0d47a':'#4a9eff'}"></div></div><span class="cp-bar-val ${qiFull?'cp-bar-full':''}">${qiPct}%</span></div>
        <div class="cp-bar-row"><span class="cp-bar-label">💎 Linh Thạch</span><div class="cp-bar-track" style="background:transparent;flex:unset"></div><span class="cp-bar-val" style="color:var(--gold);width:auto">${_fmtStone(G)}</span></div>
        <div class="cp-bar-row" title="Kiên Cố — rèn qua chiến đấu, thám hiểm, thiết đả. Không tích qua bế quan. Reset khi đột phá.${isBottleneck ? ` | Bình Cảnh: cần ${bnRequired} để đột phá` : ''}">
          <span class="cp-bar-label" style="color:${isBottleneck && kienCo < bnRequired ? '#b090ff' : '#c8763a'}">🔥 Kiên Cố${isBottleneck ? ' ⚠' : ''}</span>
          <div class="cp-bar-track" style="${isBottleneck ? 'position:relative;overflow:visible' : ''}">
            <div class="cp-bar-fill" style="width:${kcPct}%;background:linear-gradient(90deg,#8b3a00,#e07030)"></div>
            ${isBottleneck ? `<div style="position:absolute;top:-1px;bottom:-1px;left:${Math.min(100, Math.round(bnRequired/Math.max(1,kcCeiling)*100))}%;width:2px;background:#c084fc;border-radius:1px"></div>` : ''}
          </div>
          <span class="cp-bar-val" style="color:#e08040">${kienCo.toFixed(0)}/${kcCeiling}</span>
        </div>
        ${isBottleneck ? `<div style="font-size:10px;padding:3px 6px;border-radius:4px;margin-top:2px;margin-bottom:2px;${kienCo < bnRequired ? 'color:#b090ff;background:rgba(100,40,200,0.15);border:1px solid #7040c044' : 'color:#56c46a;background:rgba(60,160,80,0.1);border:1px solid #56c46a44'}">
          ${kienCo < bnRequired
            ? `⚠ Bình Cảnh — cần Kiên Cố ${bnRequired} để đột phá. Rèn qua chiến đấu và nhiệm vụ.`
            : `✓ Bình Cảnh — Kiên Cố đủ điều kiện đột phá.`}
        </div>` : ''}
        <div class="cp-cultivate-meta">
          <span>⚡ Tu tốc: <strong>${bd.totalQiRate}/s</strong></span>
          <span>📍 ${pdName}</span>
          <span>${G.meditating ? '🧘 Đang nhập định' : '⚠ Chưa vận công'}</span>
        </div>
        <div style="font-size:10px;color:#5a7a9a;margin-top:4px;padding:4px 6px;background:rgba(0,0,0,0.15);border-radius:4px">
          Chi tiết tu tốc → xem popup <strong style="color:#7fb2ff">Tu Luyện</strong>
          ${(G.qi >= calcMaxQi(G))
            ? `<span style="color:#56c46a;margin-left:6px">✨ Qi đầy — tích Thuần Độ: ${bd.purityPerSec.toFixed(3)}/s</span>`
            : ''}
        </div>
        ${(() => {
          if (!qiFull) return `<div class="cp-bt-hint">Tích lũy đủ linh lực (${qiPct}%) để đột phá.</div>`;
          const btThreshold = calcPurityThreshold(G);
          const btPurity    = G.purity ?? 0;
          const btRatio     = btPurity / Math.max(1, btThreshold);
          const btPurityPct = Math.floor(btRatio * 100);
          if (btRatio < 0.5) return `<div class="cp-bt-hint" style="color:#888">
            ⚡ Qi đầy — đang tích Thuần Độ (${btPurityPct}% / cần 50%+)</div>`;
          if (btRatio < 0.75) return `
            <button class="cp-bt-btn" id="cp-btn-breakthrough"
              style="background:rgba(180,30,30,0.2);border-color:#c0392b;color:#e74c3c;animation:pulse-danger 1.5s infinite">
              ⚠ CẢNH BÁO: Thuần Độ ${btPurityPct}% — Xác Suất 0%! (Guaranteed Fail)
            </button>
            <div style="font-size:10px;color:#e05c4a;text-align:center;margin-top:4px;padding:4px 8px;background:rgba(180,30,30,0.1);border-radius:4px;border:1px solid rgba(180,30,30,0.3);line-height:1.6">
              ☠ Đại thất bại đảm bảo: Linh lực −40% · Thuần Độ −50% · Tâm Cảnh −15~25 · mất 3~7 năm tuổi thọ.<br>
              <span style="color:#f0a0a0">Tiếp tục bế quan đến Thuần Độ ≥75% để có cơ hội thành công.</span>
            </div>`;
          if (btRatio < 1.0) return `<button class="cp-bt-btn cp-bt-ready" id="cp-btn-breakthrough"
            style="background:rgba(180,120,0,0.2);border-color:#d4a017;color:#d4a017">
            ⚡ ĐỦ LINH LỰC — ĐỘT PHÁ (Thuần Độ ${btPurityPct}%)</button>`;
          return `<button class="cp-bt-btn cp-bt-ready" id="cp-btn-breakthrough">
            ⚡ ĐỦ ĐIỀU KIỆN — ĐỘT PHÁ (Thuần Độ ${btPurityPct}%)</button>`;
        })()}
        <div id="cp-live-med-status" style="font-size:11px;text-align:center;margin-top:4px;padding:3px 6px;border-radius:4px;background:rgba(0,0,0,0.15);color:${G.meditating?'#56c46a':'#888'}">
          ${G.meditating ? '🧘 Đang nhập định' : '⚠ Chưa nhập định'}
        </div>
      </div>
      ${spiritHtml}
      <div class="cp-section">
        <div class="cp-section-title">⚔ Chiến Lực</div>
        <div class="cps-grid">
          <div class="cps-item"><span class="cps-label">⚔ Công Kích</span><span class="cps-val">${Math.floor(G.atk||0)}</span></div>
          <div class="cps-item"><span class="cps-label">🛡 Phòng Thủ</span><span class="cps-val">${Math.floor(G.def||0)}</span></div>
          <div class="cps-item"><span class="cps-label">❤ HP Tối Đa</span><span class="cps-val">${Math.floor(G.maxHp||0)}</span></div>
          <div class="cps-item"><span class="cps-label">⚡ Linh Lực/giây</span><span class="cps-val">${qiRate}</span></div>
        </div>
      </div>
      <div class="cp-section">
        <div class="cp-section-title">🌟 Chỉ Số Tu Tiên</div>
        ${statBar('🌟 Ngộ Tính', ngoTinh, 100, '#c8a84b', 'Thiên phú học hỏi — ảnh hưởng luyện đan, thuần thục công pháp, cơ duyên')}
        ${statBar('💪 Căn Cốt',  canCot,  100, '#e05c1a', 'Thể chất tự nhiên')}
        ${statBar('🌀 Khí Vận',  khiVan,  100, khiVanColor, 'Cơ duyên gặp kỳ ngộ')}
        ${statBar('🧠 Tâm Cảnh', tamCanh, 100, '#7b9ef0', 'Ảnh hưởng tỉ lệ đột phá')}
        <div style="font-size:10px;color:${khiVanColor};text-align:center;margin-top:4px;padding:3px;background:rgba(0,0,0,0.2);border-radius:4px">${khiVanStatus}</div>
      </div>
      ${(() => {
        const at = G.amThuong;
        if (!at || at.points <= 0) return '';
        const c = at.points>=50?'#e05c4a':at.points>=25?'#e07030':'#f0d47a';
        return `<div class="cp-section" style="border-color:${c}44">
          <div class="cp-section-title" style="color:${c}">🩸 Ám Thương</div>
          ${statBar('Mức Độ', at.points, 100, c, 'Tích lũy từ chiến đấu')}
          ${at.canCotPenalty>0?`<div class="cps-item"><span class="cps-label">Căn Cốt bị ảnh hưởng</span><span class="cps-val" style="color:${c}">-${at.canCotPenalty}</span></div>`:''}
          <div style="font-size:10px;color:var(--text-dim);margin-top:4px">Tự hồi ~1 điểm/3 ngày · Dùng Tái Sinh Đan để hồi nhanh</div>
        </div>`;
      })()}
      ${G.realmIdx===0 ? (() => {
        const h = G.hunger; const days=h?.hungerDays??0; const linh_me=h?.linhMeCount??0; const ichCoc=Math.ceil(h?.ichCocDanDays??0); const danDoc=G.danDoc??0;
        const color=days>0?'#e05c4a':'#56c46a';
        return `<div class="cp-section" style="border-color:${color}33">
          <div class="cp-section-title" style="color:${color}">🌾 Lương Thực</div>
          <div class="cps-item"><span class="cps-label">Linh Mễ kho</span><span class="cps-val">${linh_me} phần</span></div>
          ${ichCoc>0?`<div class="cps-item"><span class="cps-label">💊 Ích Cốc Đan</span><span class="cps-val">còn ${ichCoc} ngày</span></div>`:''}
          ${days>0?`<div style="font-size:11px;color:#e05c4a;margin-top:4px">⚠ Đang đói ${days.toFixed(1)} ngày!</div>`:''}
          ${danDoc>40?`<div class="cps-item"><span class="cps-label">⚠ Đan Độc</span><span class="cps-val" style="color:${danDoc>70?'#e05c4a':'#f0d47a'}">${danDoc.toFixed(0)}/100</span></div>`:''}
        </div>`;
      })() : ''}
      <div class="cp-section">
        <div class="cp-section-title">📜 Hành Trình</div>
        <div class="cps-grid">
          <div class="cps-item">
            <span class="cps-label">🔥 Đột Phá</span>
            <span class="cps-val">${G.breakthroughs||0}<span style="font-size:10px;color:var(--text-dim);margin-left:2px">lần</span></span>
          </div>
          <div class="cps-item">
            <span class="cps-label">🏆 Quái Đã Giết</span>
            <span class="cps-val">${G.totalKills||0}<span style="font-size:10px;color:var(--text-dim);margin-left:2px">con</span></span>
          </div>
          <div class="cps-item">
            <span class="cps-label">⚗ Đan Đã Luyện</span>
            <span class="cps-val">${G.alchemySuccess||0}<span style="font-size:10px;color:var(--text-dim);margin-left:2px">viên</span></span>
          </div>
          <div class="cps-item">
            <span class="cps-label">📜 Nhiệm Vụ</span>
            <span class="cps-val">${G.totalQuestsCompleted||0}<span style="font-size:10px;color:var(--text-dim);margin-left:2px">hoàn thành</span></span>
          </div>
        </div>
        <div class="cp-danhvong-row" style="margin-top:10px;padding:8px;background:${tier.color}15;border:1px solid ${tier.color}44;border-radius:8px">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:12px;color:var(--text-dim)">🌟 Danh Vọng</span>
            <span style="font-size:13px;font-weight:700;color:${tier.color}">${dv} · ${tier.label}</span>
            ${tier.discountPct>0?`<span style="font-size:11px;color:#56c46a">-${tier.discountPct}% shop</span>`:''}
          </div>
          ${dvProgressHtml}
        </div>
      </div>
    </div>
  `;

  const w = Math.min(window.innerWidth - 40, 480);
  const h = Math.min(window.innerHeight - 80, 700);
  PopupManager.open(POPUP_ID, {
    title:      `👤 ${G.name} — Thông Tin Nhân Vật`,
    content:    bodyEl,
    width:      w,
    height:     h,
    x:          Math.max(10, (window.innerWidth - w) / 2),
    y:          Math.max(10, (window.innerHeight - h) / 2),
    extraClass: 'pm-char-info',
  });

  // Wire buttons
  document.getElementById('cp-btn-breakthrough')?.addEventListener('click', () => {
    PopupManager.close(POPUP_ID);
    cultivateActions.breakthrough();
  });

  // Load portrait
  import('../../ui/portrait.js').then(({ buildPortraitSVG }) => {
    const el = document.getElementById('cp-portrait-mini');
    if (el) el.innerHTML = buildPortraitSVG(G);
  });
}

// ---- Live-update cho các chỉ số thay đổi theo thời gian ----
// Gọi mỗi 2 ticks từ main.js (an toàn nếu popup đang đóng)
export function updateCharPopup(G) {
  if (!PopupManager.isOpen(POPUP_ID)) return;

  const currentAge = Math.floor(G.gameTime?.currentYear ?? 16);
  let ageColor = '#56c46a', ageWindowText = 'Cửa sổ < 70';
  if (currentAge >= 75)      { ageColor = '#e05c4a'; ageWindowText = '☠ Cơ hội gần như 0'; }
  else if (currentAge >= 70) { ageColor = '#f0d47a'; ageWindowText = '⚠ Đang suy giảm'; }

  const _upd = (id, text, color) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.textContent !== text) el.textContent = text;
    if (color && el.style.color !== color) el.style.color = color;
  };

  _upd('cp-live-age',    `⏳ ${currentAge} tuổi`, ageColor);
  _upd('cp-live-window', ` · ${ageWindowText}`,   ageColor);

  // Thời gian game (totalYears) và thực tế (totalTime giây)
  const totalYears = G.gameTime?.totalYears ?? 0;
  const realSec    = Math.floor(G.totalTime ?? 0);

  // Game time — tích qua nhiều cảnh giới, có thể hàng trăm năm
  let gameStr;
  if (totalYears <= 0)     gameStr = '< 1 tháng game';
  else if (totalYears < 1) gameStr = `${Math.floor(totalYears * 12)} tháng game`;
  else if (totalYears < 10) gameStr = `${totalYears.toFixed(1)} năm game`;
  else                     gameStr = `${Math.floor(totalYears)} năm game`;

  // Real time — tích qua nhiều phiên chơi, có thể hàng trăm giờ
  let realStr;
  if (realSec < 60)        realStr = `${realSec}s`;
  else if (realSec < 3600) realStr = `${Math.floor(realSec / 60)} phút`;
  else {
    const h = Math.floor(realSec / 3600);
    const m = Math.floor((realSec % 3600) / 60);
    if (h < 24) realStr = m > 0 ? `${h}g ${m}p` : `${h}g`;
    else {
      const d  = Math.floor(h / 24);
      const rh = h % 24;
      realStr = rh > 0 ? `${d} ngày ${rh}g` : `${d} ngày`;
    }
  }

  _upd('cp-live-gametime', gameStr);
  _upd('cp-live-realtime', realStr);

  // Trạng thái nhập định
  const medEl = document.getElementById('cp-live-med-status');
  if (medEl) {
    const isMed   = !!G.meditating;
    const medText = isMed ? '🧘 Đang nhập định' : '⚠ Chưa nhập định';
    const medCol  = isMed ? '#56c46a' : '#888';
    if (medEl.textContent !== medText) medEl.textContent = medText;
    if (medEl.style.color !== medCol)  medEl.style.color = medCol;
  }
}
