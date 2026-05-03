// ============================================================
// ui/craft-popup.js — Popup chọn Nghề Nghiệp
// 6 nghề: Luyện Đan, Luyện Khí, Trận Pháp, Phù Chú, Khôi Lỗi, Linh Thực
// ============================================================

export const CRAFT_PROFESSIONS = [
  {
    id: 'alchemy',
    tabId: 'alchemy',
    icon: '⚗',
    name: 'Luyện Đan',
    nameCN: '丹藥師',
    desc: 'Luyện chế đan dược tăng khí lực, hồi máu và các chỉ số tu tiên.',
    unlockDesc: null, // luôn mở (theo nav-progression)
    color: '#e8a020',
  },
  {
    id: 'luyen_khi',
    tabId: 'alchemy', // hiện tại dùng chung tab alchemy, subtab forge
    icon: '⚒',
    name: 'Luyện Khí',
    nameCN: '煉器師',
    desc: 'Rèn pháp bảo, vũ khí và giáp từ khoáng vật linh.',
    unlockDesc: null,
    color: '#7b9fd4',
    subtab: 'forge', // khi bấm vào, switch tab alchemy rồi chuyển subtab forge
  },
  {
    id: 'tran_phap',
    tabId: 'tran_phap',
    icon: '🔮',
    name: 'Trận Pháp',
    nameCN: '陣法師',
    desc: 'Bố trí trận pháp phòng thủ và tấn công, gia tăng linh lực khu vực.',
    unlockCond: (G) => G.realmIdx >= 1,
    unlockDesc: 'Cần đạt Trúc Cơ để học Trận Pháp.',
    color: '#56c46a',
  },
  {
    id: 'phu_chu',
    tabId: 'phu_chu',
    icon: '📿',
    name: 'Phù Chú',
    nameCN: '符籙師',
    desc: 'Vẽ bùa linh tăng cường chiến đấu, bảo hộ và trói buộc kẻ địch.',
    unlockCond: (G) => G.realmIdx >= 1,
    unlockDesc: 'Cần đạt Trúc Cơ để học Phù Chú.',
    color: '#a855f7',
  },
  {
    id: 'khoi_loi',
    tabId: 'khoi_loi',
    icon: '🤖',
    name: 'Khôi Lỗi',
    nameCN: '傀儡師',
    desc: 'Chế tạo và điều khiển khối lỗi chiến đấu thay tu sĩ.',
    unlockCond: (G) => G.realmIdx >= 2,
    unlockDesc: 'Cần đạt Kim Đan để học Khôi Lỗi.',
    color: '#e05c4a',
  },
  {
    id: 'linh_thuc',
    tabId: 'linh_thuc',
    icon: '🍲',
    name: 'Linh Thực',
    nameCN: '靈食師',
    desc: 'Nấu linh thực từ dược thảo, tăng tuổi thọ và hồi phục sinh lực.',
    unlockCond: (G) => G.realmIdx >= 0 && (G.stage || 1) >= 3,
    unlockDesc: 'Cần đạt Luyện Khí Tầng 3 để học Linh Thực.',
    color: '#4db8a0',
  },
];

// Khởi tạo popup và wire events
export function initCraftPopup(switchTabFn) {
  const btn = document.getElementById('bnav-craft-btn');
  const overlay = document.getElementById('craft-popup-overlay');
  const closeBtn = document.getElementById('craft-popup-close');

  if (!btn || !overlay) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Toggle
    const isOpen = overlay.style.display !== 'none';
    // Đóng các panel khác trước
    document.getElementById('bnav-more-panel')?.style && (document.getElementById('bnav-more-panel').style.display = 'none');
    overlay.style.display = isOpen ? 'none' : 'flex';
    btn.classList.toggle('active', !isOpen);
    if (!isOpen) renderCraftPopupGrid(window._G, switchTabFn);
  });

  closeBtn?.addEventListener('click', () => {
    overlay.style.display = 'none';
    btn.classList.remove('active');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.display = 'none';
      btn.classList.remove('active');
    }
  });
}

export function renderCraftPopupGrid(G, switchTabFn) {
  const grid = document.getElementById('craft-popup-grid');
  if (!grid || !G) return;

  grid.innerHTML = CRAFT_PROFESSIONS.map(prof => {
    const locked = prof.unlockCond ? !prof.unlockCond(G) : false;
    const lockMsg = locked ? prof.unlockDesc : null;

    // Lấy level/rank của nghề từ G (nếu có)
    const rankText = _getProfRank(prof.id, G);

    return `
      <div class="craft-prof-card ${locked ? 'craft-locked' : ''}"
           data-prof="${prof.id}"
           style="--prof-color:${prof.color}">
        <div class="cpc-icon">${prof.icon}</div>
        <div class="cpc-body">
          <div class="cpc-name">${prof.name} <span class="cpc-cn">${prof.nameCN}</span></div>
          ${rankText ? `<div class="cpc-rank">${rankText}</div>` : ''}
          <div class="cpc-desc">${locked ? lockMsg : prof.desc}</div>
        </div>
        ${locked
          ? `<div class="cpc-lock">🔒</div>`
          : `<button class="cpc-enter btn-sm" data-prof="${prof.id}">Vào →</button>`}
      </div>`;
  }).join('');

  // Wire buttons
  grid.querySelectorAll('.cpc-enter').forEach(btn => {
    btn.addEventListener('click', () => {
      const profId = btn.dataset.prof;
      const prof = CRAFT_PROFESSIONS.find(p => p.id === profId);
      if (!prof) return;

      // Đóng popup
      document.getElementById('craft-popup-overlay').style.display = 'none';
      document.getElementById('bnav-craft-btn')?.classList.remove('active');

      // Switch tab
      if (prof.subtab) {
        // Luyện Khí dùng chung tab alchemy, chuyển subtab
        switchTabFn('alchemy', G);
        // Delay nhỏ để tab render xong rồi click subtab
        setTimeout(() => {
          const subtabBtn = document.querySelector(`.subtab-btn[data-subtab="${prof.subtab}"]`);
          subtabBtn?.click();
        }, 50);
      } else {
        switchTabFn(prof.tabId, G);
      }
    });
  });
}

function _getProfRank(profId, G) {
  switch (profId) {
    case 'alchemy': {
      const count = G.alchemy?.craftsCount || 0;
      if (count === 0) return null;
      if (count < 10)  return '🔰 Học Đồ';
      if (count < 30)  return '⚗ Luyện Đan Sư';
      if (count < 100) return '⚗⚗ Luyện Đan Đại Sư';
      return '⚗⚗⚗ Đan Vương';
    }
    case 'luyen_khi': {
      const count = G.alchemy?.craftsCount || 0; // dùng chung craftsCount
      if (count === 0) return null;
      return count < 20 ? '🔰 Học Đồ' : count < 60 ? '⚒ Luyện Khí Sư' : '⚒⚒ Luyện Khí Đại Sư';
    }
    case 'tran_phap': {
      const lv = G.crafts?.tran_phap?.level || 0;
      return lv > 0 ? `🔮 Cấp ${lv}` : null;
    }
    case 'phu_chu': {
      const lv = G.crafts?.phu_chu?.level || 0;
      return lv > 0 ? `📿 Cấp ${lv}` : null;
    }
    case 'khoi_loi': {
      const lv = G.crafts?.khoi_loi?.level || 0;
      return lv > 0 ? `🤖 Cấp ${lv}` : null;
    }
    case 'linh_thuc': {
      const lv = G.crafts?.linh_thuc?.level || 0;
      return lv > 0 ? `🍲 Cấp ${lv}` : null;
    }
    default: return null;
  }
}