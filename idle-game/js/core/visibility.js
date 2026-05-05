// ============================================================
// core/visibility.js — Tab Visibility Gate System (Session S-B)
//
// Kiểm soát tập trung: tab nào xuất hiện trong bottom nav
// dựa theo trạng thái tiến trình của người chơi.
//
// Triết lý: người chơi mới chỉ thấy tabs họ cần ngay.
// Các tabs mở dần theo progression để tránh overwhelm.
//
// API:
//   getVisibleTabs(G) → string[]   — danh sách tabId được phép hiển thị
//
// Lưu ý:
//   - Đây là gate visibility (ẩn/hiện button), KHÔNG phải gate access
//   - nav-progression.js vẫn kiểm soát điều kiện mở từng tab (lock/unlock)
//   - Game logic (combatActions, dungeonActions...) vẫn có thể switch tab
//     dù tab chưa visible trong nav (để không phá game flow)
// ============================================================

/** Tabs luôn hiển thị bất kể điều kiện — ngay cả khi chưa setup xong */
const ALWAYS_VISIBLE = new Set([
  'cultivate',  // Màn hình chính (bản đồ thế giới)
  'skills',     // Kỹ năng cơ bản
  'inventory',  // Túi đồ
  'passive',    // Thiên Phú (passive tree)
  'ranking',    // Bảng xếp hạng
]);

/**
 * Trả về array các tabId được phép hiển thị trong bottom nav
 * tại trạng thái hiện tại của người chơi.
 *
 * Thứ tự ưu tiên: ALWAYS_VISIBLE → setupDone → flags → progression
 *
 * @param {object} G — game state
 * @returns {string[]} — mảng tabId visible
 */
export function getVisibleTabs(G) {
  const visible = new Set(ALWAYS_VISIBLE);

  // Chưa setup xong (chưa tạo nhân vật) → chỉ hiển thị tabs cơ bản
  if (!G || !G.setupDone) return [...visible];

  // ── Mở ngay sau khi setup xong ──────────────────────────────
  visible.add('quests');   // nhiệm vụ (S-D sẽ refine: chỉ sau khi NPC giao)
  visible.add('phapdia');  // pháp địa

  // ── Luyện Đan + Trang Bị: LK Trung Kỳ (stage >= 3) ─────────
  const realm = G.realmIdx ?? 0;
  const stage = G.stage ?? 1;
  if (stage >= 3) {
    visible.add('alchemy');
    visible.add('equipment');
  }

  // ── Shop: chỉ mở sau khi tương tác NPC shop ─────────────────
  // (S-C sẽ wire trigger từ NPC → set flags.shopUnlocked)
  if (G.flags?.shopUnlocked) visible.add('shop');

  // ── Dungeon: hoàn thành dungeon quest đầu (S-D) HOẶC Kim Đan ─
  if (G.flags?.dungeonQuestDone || realm >= 2) visible.add('dungeon');

  // ── Tông Môn: đã gia nhập ───────────────────────────────────
  if (G.sectId != null) visible.add('sect');

  // ── Linh Thú: có ít nhất 1 linh thú ────────────────────────
  if ((G.linhThu?.slots ?? []).some(s => s !== null)) visible.add('linh_thu');

  // ── Nghề Nghiệp: hiện khi ít nhất 1 nghề phụ đã mở ─────────
  // S-E sẽ define điều kiện mở từng nghề (flag.unlockedProfessions)
  // Hiện tại: dùng flags.unlockedProfessions để kiểm tra
  const profs = G.flags?.unlockedProfessions ?? [];
  const CRAFT_SUBS = ['tran_phap', 'phu_chu', 'khoi_loi', 'linh_thuc'];

  if (profs.includes('alchemy')) visible.add('alchemy');   // fallback nếu đã dùng trước S-B

  if (profs.some(p => CRAFT_SUBS.includes(p) || p === 'nghe_nghiep')) {
    visible.add('nghe_nghiep');
    for (const sub of CRAFT_SUBS) {
      if (profs.includes(sub)) visible.add(sub);
    }
  }

  // ── Combat đầy đủ: Trúc Cơ+ ─────────────────────────────────
  // Trước Trúc Cơ: combat vẫn mở được qua startHunt (programmatic),
  // nhưng nav button ẩn để giảm overwhelm cho người mới.
  if (realm >= 1) visible.add('combat');

  return [...visible];
}
