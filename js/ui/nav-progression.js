// ============================================================
// ui/nav-progression.js — Hệ thống mở khóa tab theo progression
// ============================================================

export const TAB_UNLOCK_CONFIG = {

  // ---- Luôn mở ----
  cultivate: { always: true },
  inventory: { always: true },
  ranking:   { always: true },

  // ---- Thế Giới ----
  combat: {
    condition: (G) => true, // ngay từ đầu có thể đánh nhau
    label: '⚔ Chiến Đấu',
    unlockMsg: null,
  },
  quests: {
    condition: (G) => true, // luôn mở — NPC giao nhiệm vụ ngay từ đầu
    label: '📜 Nhiệm Vụ',
    lockDesc: 'Đến gặp NPC trong làng để nhận nhiệm vụ đầu tiên.',
    unlockMsg: null,
  },
  dungeon: {
    condition: (G) => G.realmIdx >= 2,
    label: '☠ Địa Phủ',
    lockDesc: 'Cần đạt Kim Đan để thách thức Địa Phủ.',
    unlockMsg: '☠ Địa Phủ đã mở! 10 tầng nguy hiểm đang chờ.',
  },

  // ---- Nghề Nghiệp ----
  alchemy: {
    condition: (G) => (G.realmIdx >= 0 && (G.stage||1) >= 2) || (G.alchemy?.ingredients && Object.keys(G.alchemy.ingredients).length > 0),
    label: '⚗ Luyện Đan',
    lockDesc: 'Đạt Luyện Khí Tầng 2 để mở Đan Luyện Các.',
    unlockMsg: '⚗ Luyện Đan đã mở! Thu thảo nguyên liệu, học công thức và bắt đầu luyện đan.',
  },
  phapdia: {
    condition: (G) => (G.realmIdx >= 0 && (G.stage||1) >= 2),
    label: '🏔 Pháp Địa',
    lockDesc: 'Đạt Luyện Khí Tầng 2 để hiểu về Pháp Địa.',
    unlockMsg: '🏔 Pháp Địa đã mở! Chọn vị trí tu luyện để tăng tốc độ.',
  },
  sect: {
    condition: (G) => G.realmIdx >= 0 && (G.stage||1) >= 3,
    label: '🏯 Tông Môn',
    lockDesc: 'Cần Luyện Khí Tầng 3 để gia nhập tông môn.',
    unlockMsg: '🏯 Đủ điều kiện gia nhập Tông Môn! Đến vùng đất tương ứng để xin vào.',
  },

  // ---- Nhân Vật ----
  skills: {
    condition: (G) => (G.realmIdx >= 0 && (G.stage||1) >= 3) || (G.totalKills||0) >= 5,
    label: '✦ Kỹ Năng',
    lockDesc: 'Chiến đấu 5 lần hoặc đạt Luyện Khí Tầng 3 để học kỹ năng.',
    unlockMsg: '✦ Kỹ Năng đã mở! Học kỹ năng để tăng sức mạnh chiến đấu.',
  },
  passive: {
    condition: (G) => G.realmIdx >= 1,
    label: '✦ Thiên Phú',
    lockDesc: 'Đạt Trúc Cơ để khai mở Thiên Phú.',
    unlockMsg: '✦ Thiên Phú đã mở! Phát triển tiềm năng linh căn của ngươi.',
  },
  equipment: {
    condition: (G) => (G.totalKills||0) >= 3,
    label: '⚔ Trang Bị',
    lockDesc: 'Tiêu diệt 3 yêu thú để nhận trang bị đầu tiên.',
    unlockMsg: '⚔ Trang Bị đã mở! Trang bị pháp bảo để tăng chiến lực.',
  },

  // ---- Khác ----
  shop: {
    condition: (G) => true,
    label: '🏮 Cửa Hàng',
    lockDesc: '',
    unlockMsg: '🏮 Cửa Hàng đã mở!',
  },

  nghe_nghiep: { always: true },

  // ---- Nghề Nghiệp mới ----
  tran_phap: {
    condition: (G) => G.realmIdx >= 1,
    label: '🔮 Trận Pháp',
    lockDesc: 'Cần đạt Trúc Cơ để học Trận Pháp.',
    unlockMsg: '🔮 Trận Pháp đã mở! Bố trận pháp tăng cường sức mạnh.',
  },
  phu_chu: {
    condition: (G) => G.realmIdx >= 1,
    label: '📿 Phù Chú',
    lockDesc: 'Cần đạt Trúc Cơ để học Phù Chú.',
    unlockMsg: '📿 Phù Chú đã mở! Vẽ bùa linh tăng cường chiến đấu.',
  },
  khoi_loi: {
    condition: (G) => G.realmIdx >= 2,
    label: '🤖 Khôi Lỗi',
    lockDesc: 'Cần đạt Kim Đan để học Khôi Lỗi.',
    unlockMsg: '🤖 Khôi Lỗi đã mở! Chế tạo khối lỗi chiến đấu.',
  },
  linh_thuc: {
    condition: (G) => G.realmIdx >= 0 && (G.stage||1) >= 3,
    label: '🍲 Linh Thực',
    lockDesc: 'Cần đạt Luyện Khí Tầng 3 để học Linh Thực.',
    unlockMsg: '🍲 Linh Thực đã mở! Nấu linh thực tăng tuổi thọ.',
  },
  linh_thu: {
    condition: (G) => G.realmIdx >= 0,
    label: '🐾 Linh Thú',
    lockDesc: '',
    unlockMsg: '🐾 Linh Thú đã mở! Thuần dưỡng linh thú hỗ trợ tu luyện.',
    always: true,
  },
};

// Kiểm tra tab có mở không
export function isTabUnlocked(tabId, G) {
  const cfg = TAB_UNLOCK_CONFIG[tabId];
  if (!cfg) return true; // không config = luôn mở
  if (cfg.always) return true;
  return cfg.condition ? cfg.condition(G) : true;
}

// Lấy thông tin lock
export function getTabLockInfo(tabId, G) {
  const cfg = TAB_UNLOCK_CONFIG[tabId];
  if (!cfg || isTabUnlocked(tabId, G)) return null;
  return {
    label: cfg.label,
    desc: cfg.lockDesc || 'Chưa mở khóa.',
  };
}

// Kiểm tra tab vừa mở (để hiện thông báo)
export function checkNewlyUnlocked(G, prevG) {
  const newlyUnlocked = [];
  for (const [tabId, cfg] of Object.entries(TAB_UNLOCK_CONFIG)) {
    if (!cfg.unlockMsg) continue;
    const wasLocked = prevG ? !isTabUnlocked(tabId, prevG) : false;
    const nowOpen   = isTabUnlocked(tabId, G);
    if (wasLocked && nowOpen) {
      newlyUnlocked.push({ tabId, msg: cfg.unlockMsg });
    }
  }
  return newlyUnlocked;
}