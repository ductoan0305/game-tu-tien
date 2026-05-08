// ============================================================
// core/visibility.js — Hệ thống gate tab duy nhất (S-Phase1 refactor)
//
// Hấp thụ toàn bộ logic từ ui/nav-progression.js (đã deprecated).
// Nguyên tắc: tab hiện = tab dùng được. Không còn khái niệm "hiện nhưng 🔒".
//
// API:
//   getVisibleTabs(G)            → string[]   — tab được phép hiện trong nav
//   isTabVisible(tabId, G)       → bool        — check một tab cụ thể
//   getUnlockMessages(G, prevSet)→ string[]   — messages cho tab vừa mở
//
// Lưu ý:
//   - Game logic (combatActions, dungeonActions...) vẫn có thể switch tab
//     dù tab chưa visible trong nav (không phá game flow)
//   - nav-progression.js giờ là thin shim re-export từ file này
// ============================================================

// ---- Thông điệp khi tab lần đầu mở ----
const UNLOCK_MESSAGES = {
  combat:      '⚔ Chiến Đấu đã mở! Săn yêu thú để tích lũy kinh nghiệm.',
  phapdia:     '🏔 Pháp Địa đã mở! Chọn vị trí tu luyện để tăng tốc độ.',
  alchemy:     '⚗ Luyện Đan đã mở! Thu thảo nguyên liệu, học công thức.',
  equipment:   '🗡 Trang Bị đã mở! Trang bị pháp bảo để tăng chiến lực.',
  skills:      '✦ Kỹ Năng đã mở! Học kỹ năng tăng sức mạnh chiến đấu.',
  shop:        '🏮 Cửa Hàng đã mở! Mua vật phẩm tu luyện.',
  dungeon:     '☠ Địa Phủ đã mở! 10 tầng nguy hiểm đang chờ.',
  sect:        '🏯 Đủ điều kiện gia nhập Tông Môn!',
  passive:     '✦ Thiên Phú đã mở! Phát triển tiềm năng linh căn.',
  ranking:     '🏆 Bảng Xếp Hạng đã mở!',
  nghe_nghiep: '🛠 Nghề Nghiệp đã mở! Luyện đan, nấu linh thực và hơn thế nữa.',
  linh_thu:    '🐾 Linh Thú đã mở! Thuần dưỡng linh thú hỗ trợ tu luyện.',
  linh_thuc:   '🍲 Linh Thực đã mở! Nấu linh thực tăng tuổi thọ.',
  tran_phap:   '🔮 Trận Pháp đã mở! Bố trận pháp tăng cường sức mạnh.',
  phu_chu:     '📿 Phù Chú đã mở! Vẽ bùa linh tăng cường chiến đấu.',
  khoi_loi:    '🤖 Khôi Lỗi đã mở! Chế tạo khối lỗi chiến đấu.',
};

/**
 * Trả về array các tabId được phép hiển thị trong bottom nav.
 * Tab visible = tab dùng được ngay. Không có khái niệm "visible nhưng bị khóa".
 *
 * @param {object} G — game state
 * @returns {string[]}
 */
export function getVisibleTabs(G) {
  const visible = new Set();

  // Luôn hiện — bất kể mọi điều kiện
  visible.add('cultivate');
  visible.add('inventory');

  // Chưa tạo nhân vật → chỉ 2 tabs cơ bản
  if (!G || !G.setupDone) return [...visible];

  const realm = G.realmIdx ?? 0;
  const stage = G.stage ?? 1;
  const kills = G.totalKills ?? 0;
  const profs = G.flags?.unlockedProfessions ?? [];

  // ── Mở ngay sau setup ────────────────────────────────────────
  visible.add('quests');    // Nhiệm Vụ — tab chính, luôn có (empty state hướng NPC)

  // ── Pháp Địa: LK Tầng 2 ─────────────────────────────────────
  if (stage >= 2) visible.add('phapdia');

  // ── Chiến Đấu: Trúc Cơ+ trong nav, nhưng vẫn mở được programmatic từ LK ──
  // Nav button ẩn ở LK để tránh overwhelm người mới.
  if (realm >= 1) visible.add('combat');

  // ── Trang Bị: tiêu diệt 3 yêu thú đầu tiên ─────────────────
  if (kills >= 3) visible.add('equipment');

  // ── Luyện Đan: LK Tầng 2 hoặc đã có nguyên liệu ─────────────
  const hasIngredients = G.alchemy?.ingredients
    && Object.keys(G.alchemy.ingredients).length > 0;
  if ((stage >= 2) || hasIngredients) visible.add('alchemy');

  // ── Kỹ Năng: LK Tầng 3 hoặc 5 kill ────────────────────────
  if (stage >= 3 || kills >= 5) visible.add('skills');

  // ── Shop: tương tác NPC shop (flag) ────────────────────────
  if (G.flags?.shopUnlocked) visible.add('shop');

  // ── Tông Môn: đã gia nhập ──────────────────────────────────
  if (G.sectId != null) visible.add('sect');

  // ── Địa Phủ: Trúc Cơ+ HOẶC flag quest đã done ─────────────
  // realm >= 1 thay vì >= 2: TC cần thấy tab để làm side_dungeon_01
  // dungeonQuestDone được wire từ event-bus khi side_dungeon_01 hoàn thành
  if (G.flags?.dungeonQuestDone || realm >= 1) visible.add('dungeon');

  // ── Thiên Phú (Passive): Trúc Cơ ───────────────────────────
  if (realm >= 1) visible.add('passive');

  // ── Xếp Hạng: LK Tầng 3 (có gì để xem) ────────────────────
  if (stage >= 3) visible.add('ranking');

  // ── Nghề Nghiệp + Sub-tabs ──────────────────────────────────
  const CRAFT_SUBS = ['tran_phap', 'phu_chu', 'khoi_loi', 'linh_thuc'];
  const ALL_PROF_IDS = [...CRAFT_SUBS, 'luyen_dan', 'luyen_khi'];

  // S-G FIX: check điều kiện luyen_dan trực tiếp để tránh chicken-and-egg
  const luyenDanEligible = (G.spiritData?.points?.huo ?? 0) > 0 && (G.ngoTinh ?? 0) >= 40;
  const hasProf = luyenDanEligible
    || profs.some(p => ALL_PROF_IDS.includes(p) || p === 'nghe_nghiep');

  if (hasProf || profs.includes('alchemy')) {  // compat fallback pre-S-B
    visible.add('nghe_nghiep');
    for (const sub of CRAFT_SUBS) {
      if (profs.includes(sub)) visible.add(sub);
    }
    // Linh Thực: LK Tầng 3 (ai đủ điều kiện đều có thể học)
    if (stage >= 3) visible.add('linh_thuc');
    // Trận Pháp / Phù Chú: Trúc Cơ
    if (realm >= 1) { visible.add('tran_phap'); visible.add('phu_chu'); }
    // Khôi Lỗi: Kim Đan
    if (realm >= 2) visible.add('khoi_loi');
  }

  // ── Linh Thú: có slot đang dùng hoặc đã gặp encounter ──────
  const hasLinhThu = (G.linhThu?.slots ?? []).some(s => s !== null)
    || (G.linhThu?.eggs ?? []).length > 0;
  if (hasLinhThu) visible.add('linh_thu');

  return [...visible];
}

/**
 * Check một tab cụ thể.
 * Dùng thay cho isTabUnlocked() cũ.
 * @param {string} tabId
 * @param {object} G
 * @returns {boolean}
 */
export function isTabVisible(tabId, G) {
  return getVisibleTabs(G).includes(tabId);
}

/**
 * Trả về messages cho các tab vừa mở lần đầu.
 * Dùng để hiện toast khi player đạt milestone.
 *
 * @param {object}   G           — state hiện tại
 * @param {Set}      prevVisible  — Set tabId visible ở state trước (từ lần gọi trước)
 * @returns {string[]} — array thông điệp
 */
export function getUnlockMessages(G, prevVisible) {
  if (!prevVisible) return [];
  const now = new Set(getVisibleTabs(G));
  const msgs = [];
  for (const tabId of now) {
    if (!prevVisible.has(tabId) && UNLOCK_MESSAGES[tabId]) {
      msgs.push(UNLOCK_MESSAGES[tabId]);
    }
  }
  return msgs;
}
