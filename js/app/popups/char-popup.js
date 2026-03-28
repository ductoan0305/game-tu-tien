// ============================================================
// app/popups/char-popup.js — Character Info Popup
// ============================================================
import { REALMS }                from '../../core/data.js';
import { calcMaxQi, calcQiRate } from '../../core/state.js';
import { getDanhVongTier }       from '../../core/danh-vong.js';
import { getSpiritDisplayName, getSpiritMainColor, getSpiritProphecy,
         calcSpiritRateMulti, SPIRIT_ROOT_TYPES, SPIRIT_ELEMENTS } from '../../core/spirit-root.js';

export function showCharPopup(G, { cultivateActions, saveGame, renderCurrentTab }) {
  const existing = document.getElementById('modal-char-popup');
  if (existing) { existing.remove(); return; }

  const REALMS_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
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

  const khiVan  = G.khiVan  ?? 20;
  const ngoTinh = G.ngoTinh ?? 50;
  const canCot  = G.canCot  ?? 50;
  const tamCanh = G.tamCanh ?? 50;
  const qiRate  = calcQiRate(G);
  const maxQi   = calcMaxQi(G);
  const qiFull  = (G.qi||0) >= maxQi;
  const qiPct   = Math.min(100, Math.floor(((G.qi||0)/Math.max(1,maxQi))*100));
  const expPct  = Math.min(100, Math.floor(((G.exp||0)/Math.max(1,G.maxExp||200))*100));
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

  const overlay = document.createElement('div');
  overlay.id        = 'modal-char-popup';
  overlay.className = 'char-popup-overlay';
  overlay.innerHTML = `
    <div class="char-popup char-popup-full">
      <div class="char-popup-header">
        <div class="cp-portrait-mini" id="cp-portrait-mini"></div>
        <div class="cp-header-info">
          <div class="char-popup-name">${G.name} <span style="font-size:12px;color:#888">${GENDER_EMOJI[G.gender||'male']}</span></div>
          <div class="char-popup-realm" style="color:var(--gold)">${REALMS_NAMES[G.realmIdx]||'?'} · Tầng ${G.stage}</div>
          <div class="char-popup-sect">${SECT_NAMES[G.sectId]||'🌿 Tán Tu'}</div>
          <div class="char-popup-direction" style="color:#7b9ef0">${HUONG_TU[G.huongTu]||'— Chưa xác định hướng tu'}</div>
        </div>
      </div>
      <div class="char-popup-body">
        <div class="cp-section cp-cultivate-section" style="border-color:${realm?.color||'#c8a84b'}44">
          <div class="cp-section-title">🧘 Tu Luyện</div>
          <div class="cp-realm-display" style="color:${realm?.color||'#c8a84b'}">${realm?.emoji||'⚡'} ${REALMS_NAMES[G.realmIdx]||'?'} · Tầng ${G.stage} / ${realm?.stages||9}</div>
          <div class="cp-bar-row"><span class="cp-bar-label">Linh Lực</span><div class="cp-bar-track"><div class="cp-bar-fill" style="width:${qiPct}%;background:${qiFull?'#f0d47a':'#4a9eff'}"></div></div><span class="cp-bar-val ${qiFull?'cp-bar-full':''}">${qiPct}%</span></div>
          <div class="cp-bar-row"><span class="cp-bar-label">Kinh Nghiệm</span><div class="cp-bar-track"><div class="cp-bar-fill" style="width:${expPct}%;background:#56c46a"></div></div><span class="cp-bar-val">${G.exp||0} / ${G.maxExp||200}</span></div>
          <div class="cp-bar-row"><span class="cp-bar-label">💎 Linh Thạch</span><div class="cp-bar-track" style="background:transparent;flex:unset"></div><span class="cp-bar-val" style="color:var(--gold);width:auto">${_fmtStone(G)}</span></div>
          <div class="cp-cultivate-meta"><span>⚡ Tu tốc: <strong>${qiRate}/s</strong></span><span>📍 ${pdName}</span><span>${G.meditating?'🧘 Đang bế quan':'⚠ Chưa bế quan'}</span></div>
          ${qiFull
            ? `<button class="cp-bt-btn cp-bt-ready" id="cp-btn-breakthrough">⚡ ĐỦ LINH LỰC — ẤN ĐỂ ĐỘT PHÁ!</button>`
            : `<div class="cp-bt-hint">Tích lũy đủ linh lực (${qiPct}%) để đột phá.</div>`}
          <button class="cp-meditate-btn ${G.meditating?'cp-med-active':''}" id="cp-btn-meditate">
            ${G.meditating
              ? '⏹ Xuất Quan'
              : '🧘 Bế Quan'}
          </button>
          <div style="font-size:10px;color:var(--text-dim);text-align:center;margin-top:4px;line-height:1.5">
            ${G.meditating
              ? '🧘 Đang bế quan — đóng cửa tu luyện. Linh lực tích lũy, thuần thục công pháp tăng dần, tiêu thể năng. Không thể chiến đấu hay di chuyển.'
              : 'Bế quan: đóng cửa tập trung tu luyện. Linh lực mới tích lũy, thuần thục công pháp tăng. Không thể chiến đấu hay di chuyển.'}
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
          <div class="cp-section-title">📊 Thành Tích</div>
          <div class="cps-grid">
            <div class="cps-item"><span class="cps-label">⏳ Tuổi</span><span class="cps-val">${Math.floor(G.gameTime?.currentYear||0)}</span></div>
            <div class="cps-item"><span class="cps-label">🔥 Đột Phá</span><span class="cps-val">${G.breakthroughs||0}</span></div>
            <div class="cps-item"><span class="cps-label">🏆 Quái Đã Giết</span><span class="cps-val">${G.totalKills||0}</span></div>
            <div class="cps-item"><span class="cps-label">⚗ Đan Đã Luyện</span><span class="cps-val">${G.alchemySuccess||0}</span></div>
            <div class="cps-item"><span class="cps-label">📜 Nhiệm Vụ</span><span class="cps-val">${G.totalQuestsCompleted||0}</span></div>
          </div>
          <div class="cp-danhvong-row" style="margin-top:10px;padding:8px;background:${tier.color}15;border:1px solid ${tier.color}44;border-radius:8px;display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:12px;color:var(--text-dim)">🌟 Danh Vọng</span>
            <span style="font-size:13px;font-weight:700;color:${tier.color}">${dv} · ${tier.label}</span>
            ${tier.discountPct>0?`<span style="font-size:11px;color:#56c46a">-${tier.discountPct}% shop</span>`:''}
          </div>
        </div>
      </div>
      <button class="btn-secondary char-popup-close" onclick="document.getElementById('modal-char-popup').remove()">✕ Đóng</button>
    </div>`;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector('#cp-btn-breakthrough')?.addEventListener('click', () => {
    overlay.remove();
    cultivateActions.breakthrough();
  });
  overlay.querySelector('#cp-btn-meditate')?.addEventListener('click', () => {
    cultivateActions.meditate();
    overlay.remove();
  });

  import('../../ui/portrait.js').then(({ buildPortraitSVG }) => {
    const el = document.getElementById('cp-portrait-mini');
    if (el) el.innerHTML = buildPortraitSVG(G);
  });
}