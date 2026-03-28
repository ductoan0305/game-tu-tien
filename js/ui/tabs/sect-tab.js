// ============================================================
// ui/tabs/sect-tab.js — Sect activities tab UI
// ============================================================
import { getSectInfo, SECT_CONTRIBUTIONS, SECT_RANKS } from '../../sect/sect-engine.js';
import { SECT_NPCS } from '../../sect/sect-data.js';

export function renderSectTab(G, actions) {
  const panel = document.getElementById('panel-sect');
  if (!panel) return;

  const info = getSectInfo(G);
  const { sectDef, exp, rankData, nextRank, totalContributions } = info;

  const expToNext = nextRank ? nextRank.expRequired - exp : 0;
  const expPct = nextRank
    ? Math.round(((exp - rankData.expRequired) / (nextRank.expRequired - rankData.expRequired)) * 100)
    : 100;

  const now = Date.now();
  const realmNames = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa'];

  // ---- Contribution cards ----
  const contribHtml = SECT_CONTRIBUTIONS.map(c => {
    const locked = G.realmIdx < c.minRealm;
    const lastUsed = G.sect?.cooldowns?.[c.id] || 0;
    const elapsed = (now - lastUsed) / 1000;
    const onCooldown = c.cooldown > 0 && elapsed < c.cooldown;
    const remaining = onCooldown ? Math.ceil(c.cooldown - elapsed) : 0;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;

    const costStr = Object.entries(c.cost)
      .map(([k, v]) => `${v} ${k === 'stone' ? '💎' : k === 'qi' ? '🌀' : '⚡'}`)
      .join(' + ');

    return `
      <div class="sect-contrib-card ${locked ? 'sect-locked' : ''} ${onCooldown ? 'sect-cooldown' : ''}">
        <div class="sc-header">
          <span class="sc-emoji">${c.emoji}</span>
          <div class="sc-info">
            <span class="sc-name">${c.name}</span>
            <span class="sc-desc">${c.desc}</span>
          </div>
        </div>
        <div class="sc-footer">
          <div class="sc-cost-reward">
            <span class="sc-cost">Chi phí: ${costStr}</span>
            <span class="sc-reward">Nhận: ${c.reward.desc}</span>
          </div>
          ${locked
            ? `<button class="btn-sm btn-disabled" disabled>🔒 Cần ${realmNames[c.minRealm]}</button>`
            : onCooldown
              ? `<button class="btn-sm btn-disabled" disabled>⏳ ${mins > 0 ? mins + 'p ' : ''}${secs}s</button>`
              : `<button class="btn-sm btn-primary btn-sect-contrib" data-id="${c.id}">Thực Hiện</button>`
          }
        </div>
      </div>`;
  }).join('');

  // ---- Rank progression ----
  const ranksHtml = SECT_RANKS.map(r => {
    const isCurrent = r.rank === rankData.rank;
    const isPast = r.rank < rankData.rank;
    return `
      <div class="sect-rank-row ${isCurrent ? 'sect-rank-current' : ''} ${isPast ? 'sect-rank-past' : ''}">
        <span class="sr-emoji">${r.emoji}</span>
        <span class="sr-name">${r.name}</span>
        <span class="sr-exp">${r.expRequired} công lao</span>
        <span class="sr-bonus">${r.bonus ? r.bonus.desc : '—'}</span>
        ${isCurrent ? '<span class="sr-badge">CỦA NGƯƠI</span>' : ''}
        ${isPast ? '<span class="sr-done">✅</span>' : ''}
      </div>`;
  }).join('');

  // ---- NPC list — lọc theo tông môn + rank ----
  const sectNpcs = SECT_NPCS.filter(npc =>
    npc.sectId === G.sectId &&
    (npc.minRank || 0) <= (G.sect?.rank || 0)
  );
  const npcHtml = sectNpcs.length
    ? sectNpcs.map(npc => `
        <div class="sect-npc-card">
          <span class="snc-emoji">${npc.emoji}</span>
          <div class="snc-info">
            <div class="snc-name">${npc.name}</div>
            <div class="snc-role">${npc.role}</div>
          </div>
          <button class="btn-sm btn-primary snc-talk-btn" data-npc-id="${npc.id}">💬 Nói Chuyện</button>
        </div>`).join('')
    : `<div class="sect-npc-empty">Chưa có nhân vật nào quen biết trong tông môn.</div>`;

  // ---- Render ----
  panel.innerHTML = `
    <div class="tab-content">
      <h2 class="tab-title">🏯 Tông Môn</h2>

      <div class="sect-header">
        <div class="sect-banner" style="border-color:${sectDef.color}44; background:${sectDef.color}11">
          <span class="sect-banner-emoji" style="color:${sectDef.color}">${sectDef.emoji}</span>
          <div class="sect-banner-info">
            <span class="sect-banner-name" style="color:${sectDef.color}">${sectDef.name}</span>
            <span class="sect-banner-namecn">${sectDef.nameCN}</span>
            <span class="sect-banner-desc">${sectDef.desc}</span>
          </div>
        </div>

        <div class="sect-rank-info">
          <div class="sect-rank-badge">
            <span class="srb-emoji">${rankData.emoji}</span>
            <div>
              <div class="srb-name">${rankData.name}</div>
              <div class="srb-contrib">Đóng góp tổng: <strong>${totalContributions}</strong> lần</div>
            </div>
          </div>
          ${nextRank ? `
            <div class="sect-exp-bar-wrap">
              <div class="sect-exp-label">
                <span>${exp.toLocaleString()} / ${nextRank.expRequired.toLocaleString()} công lao</span>
                <span>Còn ${expToNext.toLocaleString()} để lên ${nextRank.name}</span>
              </div>
              <div class="sect-exp-bar"><div class="sect-exp-fill" style="width:${expPct}%"></div></div>
            </div>`
          : `<div class="sect-max-rank">✨ Đã đạt cấp bậc tối cao!</div>`}
        </div>
      </div>

      <div class="sect-section">
        <h3 class="section-title">⚡ Hoạt Động Tông Môn</h3>
        <div class="sect-contrib-grid">${contribHtml}</div>
      </div>

      <div class="sect-section">
        <h3 class="section-title">👥 Nhân Vật Tông Môn</h3>
        <div class="sect-npc-list" id="sect-npc-list">${npcHtml}</div>
        <div class="sect-npc-dialog" id="sect-npc-dialog" style="display:none"></div>
      </div>

      <div class="sect-section">
        <h3 class="section-title">📊 Bậc Tông Môn</h3>
        <div class="sect-ranks-list">${ranksHtml}</div>
      </div>
    </div>`;

  // Wire contribution buttons
  panel.querySelectorAll('.btn-sect-contrib').forEach(btn => {
    btn.addEventListener('click', () => actions.sectContrib(btn.dataset.id));
  });

  // Wire NPC talk buttons
  panel.querySelectorAll('.snc-talk-btn').forEach(btn => {
    btn.addEventListener('click', () => _showNpcDialogue(G, btn.dataset.npcId));
  });
}

// ============================================================
// NPC Dialogue
// ============================================================
function _showNpcDialogue(G, npcId) {
  const npc = SECT_NPCS.find(n => n.id === npcId);
  if (!npc) return;

  const dialogBox = document.getElementById('sect-npc-dialog');
  const npcList   = document.getElementById('sect-npc-list');
  if (!dialogBox || !npcList) return;

  // Lọc dialogue phù hợp realm + rank
  const lines = (npc.dialogues || []).filter(d =>
    (d.unlockRealm === undefined || G.realmIdx >= d.unlockRealm) &&
    (d.minRank     === undefined || (G.sect?.rank || 0) >= d.minRank)
  );
  const line = lines.length
    ? lines[Math.floor(Math.random() * lines.length)]
    : { text: 'Ngươi lại đến rồi. Hãy cứ tiếp tục tu luyện.' };

  npcList.style.display = 'none';
  dialogBox.style.display = 'block';
  dialogBox.innerHTML = `
    <div class="sncd-header">
      <span class="sncd-emoji">${npc.emoji}</span>
      <div>
        <div class="sncd-name">${npc.name}</div>
        <div class="sncd-role">${npc.role}</div>
      </div>
    </div>
    <div class="sncd-desc">${npc.desc}</div>
    <div class="sncd-text">"${line.text}"</div>
    <div class="sncd-actions">
      <button class="btn-sm btn-primary" id="sncd-btn-more">🔄 Hỏi Thêm</button>
      <button class="btn-sm" id="sncd-btn-back">← Quay Lại</button>
    </div>`;

  document.getElementById('sncd-btn-back')?.addEventListener('click', () => {
    dialogBox.style.display = 'none';
    npcList.style.display = 'block';
  });

  document.getElementById('sncd-btn-more')?.addEventListener('click', () => {
    _showNpcDialogue(G, npcId);
  });
}