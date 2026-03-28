// ============================================================
// app/popups/gameover-popup.js — Game Over + Hall of Fame
// ============================================================
import { getSpiritDisplayName } from '../../core/spirit-root.js';

const HOF_KEY = 'tutien_hof';

export function showGameOverScreen(G) {
  const existing = document.getElementById('modal-gameover');
  if (existing) existing.remove();

  const chronicle  = G.chronicle || [];
  const totalYears = Math.floor(G.gameTime?.totalYears || 0);
  const REALM_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
  const finalRealm = REALM_NAMES[G.realmIdx] || 'Phàm Nhân';

  // Lưu Hall of Fame
  try {
    const hof = JSON.parse(localStorage.getItem(HOF_KEY) || '[]');
    hof.unshift({
      id:            Date.now(),
      name:          G.name || 'Vô Danh',
      gender:        G.gender || 'nam',
      spiritType:    G.spiritData?.type || 'NGU',
      spiritName:    G.spiritData ? getSpiritDisplayName(G.spiritData) : 'Ngũ Linh Căn',
      finalRealm, realmIdx:G.realmIdx, stage:G.stage, totalYears,
      totalKills:   G.totalKills||0, alchemySuccess:G.alchemySuccess||0,
      breakthroughs:G.breakthroughs||0, sectId:G.sectId||null, danhVong:G.danhVong||0,
      highlights:   chronicle.slice(-5).map(e => e.event),
      achievements: _buildHofAchievements(G),
      date:         new Date().toLocaleDateString('vi-VN'),
    });
    if (hof.length > 50) hof.splice(50);
    localStorage.setItem(HOF_KEY, JSON.stringify(hof));
  } catch(e) { console.warn('[HOF]', e); }

  const chronicleHtml = chronicle.slice(-20).map(e => `
    <div class="chronicle-entry">
      <span class="chr-year">Năm ${e.year}</span>
      <span class="chr-realm">[${e.realmName}]</span>
      <span class="chr-event">${e.event}</span>
    </div>`).join('');

  const modal = document.createElement('div');
  modal.id = 'modal-gameover';
  modal.className = 'modal-overlay';
  modal.style.cssText = 'display:flex;background:rgba(0,0,0,0.92);z-index:9999;';
  modal.innerHTML = `
    <div class="modal-box gameover-modal" style="max-width:520px;width:90%;max-height:80vh;overflow-y:auto;">
      <div class="gameover-header">
        <div class="gameover-emoji">💀</div>
        <h2>Tuổi Thọ Đã Cạn</h2>
        <p class="gameover-sub">${G.name} — ${finalRealm} · ${totalYears} năm tu hành</p>
      </div>
      <div class="gameover-stats">
        <div class="go-stat"><span>Cảnh Giới Cao Nhất</span><strong>${finalRealm}</strong></div>
        <div class="go-stat"><span>Tổng Số Năm</span><strong>${totalYears} năm</strong></div>
        <div class="go-stat"><span>Quái Đã Giết</span><strong>${G.totalKills||0}</strong></div>
        <div class="go-stat"><span>Đan Đã Luyện</span><strong>${G.alchemySuccess||0}</strong></div>
      </div>
      <div class="chronicle-section">
        <h3>📜 Ký Sự Tu Tiên</h3>
        <div class="chronicle-list">${chronicleHtml||'<p>Chưa có sự kiện nào được ghi lại.</p>'}</div>
      </div>
      <div class="gameover-actions">
        <button id="btn-gameover-hof" class="btn-secondary">🏆 Điện Danh Vọng</button>
        <button id="btn-gameover-restart" class="btn-primary">🔄 Đầu Thai Lại</button>
        <button id="btn-gameover-close" class="btn-secondary">📜 Đóng</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById('btn-gameover-hof')?.addEventListener('click', showHallOfFame);
  document.getElementById('btn-gameover-restart')?.addEventListener('click', () => {
    if (typeof window._setResetting === 'function') window._setResetting(true);
    localStorage.removeItem('tutien_v10');
    window.location.reload();
  });
  document.getElementById('btn-gameover-close')?.addEventListener('click', () => { modal.style.display = 'none'; });
}

export function showHallOfFame() {
  let entries = [];
  try { entries = JSON.parse(localStorage.getItem(HOF_KEY) || '[]'); } catch(e) {}

  const existing = document.getElementById('modal-hof');
  if (existing) existing.remove();

  const realmColors = ['#888','#c8a84b','#f0d47a','#e05c1a','#a89df5'];
  const entriesHtml = entries.length === 0
    ? '<p style="color:var(--text-dim);text-align:center;padding:20px">Chưa có ai được ghi vào đây.</p>'
    : entries.map(e => `
      <div style="padding:10px 12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;background:rgba(255,255,255,0.02)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:14px;font-weight:600;color:${realmColors[e.realmIdx]||'#888'}">${e.name}</span>
          <span style="font-size:11px;color:var(--text-dim)">${e.date}</span>
        </div>
        <div style="font-size:12px;color:var(--text-dim);margin:3px 0">${e.spiritName} · ${e.finalRealm} Tầng ${e.stage} · ${e.totalYears} năm</div>
        ${e.achievements?.length ? `<div style="font-size:11px;color:#f0d47a;margin-top:4px">${e.achievements.slice(0,2).join(' · ')}</div>` : ''}
      </div>`).join('');

  const modal = document.createElement('div');
  modal.id = 'modal-hof';
  modal.className = 'modal-overlay';
  modal.style.cssText = 'display:flex;z-index:9000;';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:480px;width:90%;max-height:80vh;overflow-y:auto">
      <h2 style="color:#f0d47a;text-align:center;margin-bottom:16px">🏆 Điện Danh Vọng</h2>
      <p style="font-size:12px;color:var(--text-dim);text-align:center;margin-bottom:16px">Những tu sĩ đã hoàn thành hành trình — ghi danh vĩnh cửu.</p>
      <div>${entriesHtml}</div>
      <div style="text-align:center;margin-top:16px">
        <button class="btn-secondary" onclick="document.getElementById('modal-hof').remove()">Đóng</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
}

function _buildHofAchievements(G) {
  const list = [];
  if (G.spiritData?.type === 'TIEN')    list.push('Thiên Linh Căn — dị số thiên hạ');
  if (G.spiritData?.type === 'BIEN_DI') list.push('Biến Dị Linh Căn — cực hiếm');
  if (G.spiritData?.type === 'SONG')    list.push('Song Linh Căn — thiên tài bẩm sinh');
  if (G.spiritData?.type === 'NGU' && G.realmIdx >= 1) list.push('Ngũ Linh Căn đạt Trúc Cơ — kỳ tích!');
  if (G.realmIdx >= 3) list.push('Đạt Nguyên Anh — top 0.1% người chơi');
  if (G.realmIdx >= 4) list.push('Đạt Hóa Thần — đỉnh Nhân Giới');
  if ((G.totalKills||0) >= 1000)      list.push(`Giết ${G.totalKills.toLocaleString()} kẻ thù`);
  if ((G.alchemySuccess||0) >= 100)   list.push('Luyện đan sư kỳ cựu (100+ thành công)');
  if ((G.breakthroughs||0) >= 50)     list.push(`${G.breakthroughs} lần đột phá`);
  if (G.sectId) list.push(`Đệ tử ${({'kiem_tong':'Thanh Vân Kiếm Tông','dan_tong':'Vạn Linh Đan Tông','tran_phap':'Huyền Cơ Các','the_tu':'Thiết Cốt Môn'}[G.sectId]||G.sectId)}`);
  if ((G.danhVong||0) >= 50) list.push(`Danh Vọng ${G.danhVong} — nổi tiếng khắp nơi`);
  return list;
}