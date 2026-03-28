// ============================================================
// ui/tabs/craft-tabs.js — Trận Pháp, Phù Chú, Khôi Lỗi, Linh Thực
// Phiên bản cơ bản — chờ phát triển đầy đủ sau
// ============================================================

const CRAFT_INFO = {
  tran_phap: {
    icon: '🔮', name: 'Trận Pháp', nameCN: '陣法師',
    color: '#56c46a',
    desc: 'Trận pháp là nghệ thuật bố trí linh lực thành các hình trận đặc biệt. Tu sĩ tinh thông trận pháp có thể tạo ra vùng cấm địa, tăng tốc tu luyện hoặc bẫy kẻ địch.',
    features: [
      { icon: '🛡', name: 'Hộ Thể Trận', desc: 'Bố trí trận pháp bảo vệ, giảm sát thương nhận vào.' },
      { icon: '⚡', name: 'Linh Khí Trận', desc: 'Khuếch đại linh khí khu vực, tăng tốc độ tu luyện.' },
      { icon: '🗡', name: 'Sát Thương Trận', desc: 'Trận pháp tấn công, tự động gây sát thương kẻ địch.' },
      { icon: '🔯', name: 'Phong Ấn Trận', desc: 'Trói buộc và làm suy yếu mục tiêu trong phạm vi.' },
    ],
    materials: ['Trận Kỳ', 'Linh Thạch Tinh Chế', 'Băng Tinh Thể', 'Lôi Tinh Thạch'],
    unlockRealm: 1,
    comingSoon: true,
  },
  bua_chu: {
    icon: '📿', name: 'Phù Chú', nameCN: '符籙師',
    color: '#a855f7',
    desc: 'Phù chú là nghệ thuật vẽ linh văn bằng linh lực, tạo ra các vật phẩm mang sức mạnh đặc biệt. Từ bùa tấn công, bùa phòng thủ đến bùa trị liệu.',
    features: [
      { icon: '🔥', name: 'Hỏa Hệ Phù', desc: 'Bùa hỏa thuật, gây sát thương lửa khi kích hoạt.' },
      { icon: '🛡', name: 'Hộ Thân Phù', desc: 'Bùa bảo hộ, tạo lá chắn linh khí tạm thời.' },
      { icon: '💊', name: 'Trị Thương Phù', desc: 'Bùa hồi máu, khôi phục sinh lực khi sử dụng.' },
      { icon: '👁', name: 'Tàng Hình Phù', desc: 'Bùa ẩn thân, thoát khỏi sự chú ý của kẻ địch.' },
    ],
    materials: ['Chu Sa', 'Linh Giấy', 'Mực Linh', 'Ngọc Linh Phù'],
    unlockRealm: 1,
    comingSoon: true,
  },
  khoi_loi: {
    icon: '🤖', name: 'Khôi Lỗi', nameCN: '傀儡師',
    color: '#e05c4a',
    desc: 'Khối lỗi sư chế tạo các hình nhân cơ giới chứa linh lực, có thể chiến đấu độc lập. Cấp cao hơn, khối lỗi có thể tích hợp pháp bảo và linh thú.',
    features: [
      { icon: '⚙', name: 'Khôi Lỗi Sơ Cấp', desc: 'Khối lỗi đồng đơn giản, chiến đấu cơ bản.' },
      { icon: '🗡', name: 'Khôi Lỗi Chiến Đấu', desc: 'Trang bị vũ khí linh, ATK cao hơn.' },
      { icon: '🛡', name: 'Khôi Lỗi Hộ Vệ', desc: 'Thân giáp dày, chịu đòn thay chủ nhân.' },
      { icon: '🐉', name: 'Khôi Lỗi Linh Thú', desc: 'Khắc hình linh thú, tích hợp sức mạnh linh vật.' },
    ],
    materials: ['Huyền Thiết', 'Thiên Vẫn Thạch', 'Linh Nhân Hình', 'Nguyên Thần Thạch'],
    unlockRealm: 2,
    comingSoon: true,
  },
  linh_thuc: {
    icon: '🍲', name: 'Linh Thực', nameCN: '靈食師',
    color: '#4db8a0',
    desc: 'Linh thực sư nấu các món ăn từ dược thảo và linh vật, tạo ra thức ăn có tác dụng tu tiên. Linh thực ngon không chỉ bổ dưỡng mà còn tăng tuổi thọ.',
    features: [
      { icon: '🍵', name: 'Linh Trà', desc: 'Trà dược thảo, tăng tốc hồi phục và tập trung tu luyện.' },
      { icon: '🥘', name: 'Linh Thang', desc: 'Canh linh dược, tăng tuổi thọ và hồi phục linh lực.' },
      { icon: '🍱', name: 'Linh Phạn', desc: 'Cơm linh gạo, buff dài hạn cho các chỉ số chiến đấu.' },
      { icon: '🍰', name: 'Linh Điểm', desc: 'Bánh linh thượng phẩm, buff mạnh và hiếm gặp.' },
    ],
    materials: ['Linh Gạo', 'Dược Thảo Tươi', 'Nước Suối Linh', 'Linh Thú Nhục'],
    unlockRealm: 0,
    comingSoon: true,
  },
};

export function renderCraftTab(tabId, G) {
  const panelId = `panel-${tabId}`;
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const info = CRAFT_INFO[tabId];
  if (!info) return;

  const isUnlocked = G.realmIdx >= info.unlockRealm;
  const crafts = G.crafts?.[tabId] || { level: 0, exp: 0 };

  // Level/rank display
  const levelInfo = isUnlocked && crafts.level > 0
    ? `<div class="craft-tab-level" style="color:${info.color}">Cấp ${crafts.level} · ${_getLevelTitle(tabId, crafts.level)}</div>`
    : '';

  panel.innerHTML = `
    <div class="tab-content">
      <h2 class="tab-title" style="color:${info.color}">${info.icon} ${info.name} <span style="font-size:13px;opacity:0.6">${info.nameCN}</span></h2>

      ${!isUnlocked ? `
        <div class="craft-locked-banner">
          <div style="font-size:48px;margin-bottom:12px">🔒</div>
          <h3>Chưa mở khóa</h3>
          <p>Cần đạt <strong>${_realmName(info.unlockRealm)}</strong> để học ${info.name}.</p>
        </div>
      ` : `
        ${levelInfo}

        <div class="craft-intro-box" style="border-color:${info.color}33;background:${info.color}0a">
          <p class="craft-intro-text">${info.desc}</p>
        </div>

        ${info.comingSoon ? `
          <div class="craft-coming-soon">
            <div style="font-size:40px;margin-bottom:10px">🚧</div>
            <h3 style="color:var(--gold);margin-bottom:8px">Đang Phát Triển</h3>
            <p style="color:var(--text-dim);font-size:13px;line-height:1.7">
              Nghề <strong style="color:${info.color}">${info.name}</strong> đang được xây dựng.<br>
              Dưới đây là tổng quan những gì sắp có:
            </p>
          </div>

          <div class="craft-features-grid">
            ${info.features.map(f => `
              <div class="craft-feature-card" style="border-color:${info.color}44">
                <span class="cfc-icon">${f.icon}</span>
                <div class="cfc-body">
                  <div class="cfc-name" style="color:${info.color}">${f.name}</div>
                  <div class="cfc-desc">${f.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="craft-materials-box">
            <div class="cmb-title">📦 Nguyên Liệu Cần Chuẩn Bị</div>
            <div class="cmb-list">
              ${info.materials.map(m => `<span class="cmb-item">${m}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      `}
    </div>
  `;
}

function _realmName(idx) {
  const names = ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần'];
  return names[idx] || 'Luyện Khí';
}

function _getLevelTitle(tabId, level) {
  const titles = {
    tran_phap: ['', 'Học Đồ', 'Trận Pháp Sư', 'Trận Pháp Đại Sư', 'Trận Pháp Tông Sư', 'Trận Pháp Thánh'],
    bua_chu:   ['', 'Học Đồ', 'Phù Lục Sư', 'Phù Lục Đại Sư', 'Phù Lục Tông Sư', 'Phù Lục Thánh'],
    khoi_loi:  ['', 'Học Đồ', 'Khôi Lỗi Sư', 'Khôi Lỗi Đại Sư', 'Khôi Lỗi Tông Sư', 'Khôi Lỗi Thánh'],
    linh_thuc: ['', 'Học Đồ', 'Linh Thực Sư', 'Linh Thực Đại Sư', 'Linh Thực Tông Sư', 'Linh Thực Thánh'],
  };
  const t = titles[tabId];
  return t ? (t[Math.min(level, t.length - 1)] || 'Tông Sư') : `Cấp ${level}`;
}