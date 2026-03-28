// ============================================================
// core/passive-data.js — Passive skill tree theo linh căn
// Mỗi linh căn có 1 cây gồm 3 nhánh × 3 tầng = 9 nodes
// Pure data — không import state
// ============================================================

// Node structure:
// {
//   id, name, emoji, desc,
//   spiritRoot: string,           // linh căn sở hữu node này
//   branch: 0|1|2,                // cột trong cây (0=trái, 1=giữa, 2=phải)
//   tier: 1|2|3,                  // hàng trong cây (cần mở tầng trước)
//   requires: [nodeId] | [],      // prerequisite nodes
//   maxRank: 3,                   // số lần có thể nâng
//   costPerRank: number,          // linh lực/đá linh mỗi rank
//   costType: 'stone'|'qi',
//   effect: { stat, perRank, unit } // stat boost mỗi rank
// }

export const PASSIVE_NODES = [

  // ================================================================
  // KIM LINH CĂN (jin) — Kiếm Đạo, Sát Thương, Crit
  // ================================================================
  { id: 'jin_1a', spiritRoot: 'jin', branch: 0, tier: 1, requires: [],
    name: 'Kiếm Khí Ngưng Tụ', emoji: '⚔', maxRank: 3, costPerRank: 200, costType: 'stone',
    effect: { stat: 'atkPct', perRank: 8, unit: '%' },
    desc: 'Tích tụ kiếm khí liên tục, công kích ngày càng sắc bén.' },
  { id: 'jin_1b', spiritRoot: 'jin', branch: 1, tier: 1, requires: [],
    name: 'Kim Cương Thân', emoji: '🛡', maxRank: 3, costPerRank: 180, costType: 'stone',
    effect: { stat: 'defPct', perRank: 6, unit: '%' },
    desc: 'Thân thể cứng như kim cương, chịu đựng tốt hơn.' },
  { id: 'jin_1c', spiritRoot: 'jin', branch: 2, tier: 1, requires: [],
    name: 'Tốc Kiếm Quyết', emoji: '💨', maxRank: 3, costPerRank: 150, costType: 'stone',
    effect: { stat: 'spdBonus', perRank: 0.1, unit: 'x' },
    desc: 'Kiếm pháp như gió, tốc độ hành động tăng nhanh.' },

  { id: 'jin_2a', spiritRoot: 'jin', branch: 0, tier: 2, requires: ['jin_1a'],
    name: 'Phá Giáp Kiếm Ý', emoji: '💥', maxRank: 3, costPerRank: 500, costType: 'stone',
    effect: { stat: 'atkPct', perRank: 15, unit: '%' },
    desc: 'Kiếm ý xuyên phá mọi phòng thủ, đòn tấn công mạnh hơn rất nhiều.' },
  { id: 'jin_2b', spiritRoot: 'jin', branch: 1, tier: 2, requires: ['jin_1b'],
    name: 'Kiếm Thuẫn Song Tu', emoji: '⚔🛡', maxRank: 3, costPerRank: 450, costType: 'stone',
    effect: { stat: 'hpBonus', perRank: 150, unit: 'HP' },
    desc: 'Cân bằng tấn công và phòng thủ, nền tảng sức mạnh vững chắc.' },
  { id: 'jin_2c', spiritRoot: 'jin', branch: 2, tier: 2, requires: ['jin_1c'],
    name: 'Vạn Kiếm Quy Tông', emoji: '🌟', maxRank: 3, costPerRank: 600, costType: 'stone',
    effect: { stat: 'ratePct', perRank: 12, unit: '%' },
    desc: 'Mọi đạo đều quy về kiếm. Tu luyện nhanh hơn nhờ kiếm tâm thuần tịnh.' },

  { id: 'jin_3', spiritRoot: 'jin', branch: 1, tier: 3, requires: ['jin_2a', 'jin_2b', 'jin_2c'],
    name: 'Thiên Kiếm Vô Song', emoji: '🌌', maxRank: 1, costPerRank: 2000, costType: 'stone',
    effect: { stat: 'atkPct', perRank: 40, unit: '%' },
    desc: 'Đỉnh cao kiếm đạo — thiên hạ vô đối. Công kích tăng vọt không thể sánh.' },

  // ================================================================
  // MỘC LINH CĂN (mu) — Sinh Mệnh, Hồi Phục, Bền Bỉ
  // ================================================================
  { id: 'mu_1a', spiritRoot: 'mu', branch: 0, tier: 1, requires: [],
    name: 'Sinh Cơ Vô Tận', emoji: '🌿', maxRank: 3, costPerRank: 200, costType: 'stone',
    effect: { stat: 'hpPct', perRank: 12, unit: '%' },
    desc: 'Như cây cổ thụ ngàn năm, sức sống tràn đầy.' },
  { id: 'mu_1b', spiritRoot: 'mu', branch: 1, tier: 1, requires: [],
    name: 'Mộc Linh Phục Hồi', emoji: '💚', maxRank: 3, costPerRank: 180, costType: 'stone',
    effect: { stat: 'hpBonus', perRank: 80, unit: 'HP' },
    desc: 'Mộc linh khí thúc đẩy hồi phục, thể lực tăng cao.' },
  { id: 'mu_1c', spiritRoot: 'mu', branch: 2, tier: 1, requires: [],
    name: 'Tự Nhiên Chi Đạo', emoji: '🍃', maxRank: 3, costPerRank: 160, costType: 'stone',
    effect: { stat: 'ratePct', perRank: 10, unit: '%' },
    desc: 'Hòa mình vào tự nhiên, tu luyện thuận theo thiên đạo.' },

  { id: 'mu_2a', spiritRoot: 'mu', branch: 0, tier: 2, requires: ['mu_1a'],
    name: 'Đại Thụ Căn Cơ', emoji: '🌳', maxRank: 3, costPerRank: 500, costType: 'stone',
    effect: { stat: 'hpPct', perRank: 20, unit: '%' },
    desc: 'Căn cơ sâu vững như cổ thụ, HP tối đa tăng mạnh.' },
  { id: 'mu_2b', spiritRoot: 'mu', branch: 1, tier: 2, requires: ['mu_1b'],
    name: 'Lục Hóa Thần Công', emoji: '🌱', maxRank: 3, costPerRank: 480, costType: 'stone',
    effect: { stat: 'defBonus', perRank: 30, unit: 'DEF' },
    desc: 'Lục khí hóa thành giáp bảo vệ, phòng thủ kiên cố.' },
  { id: 'mu_2c', spiritRoot: 'mu', branch: 2, tier: 2, requires: ['mu_1c'],
    name: 'Ngàn Năm Trường Thọ', emoji: '♾', maxRank: 3, costPerRank: 550, costType: 'stone',
    effect: { stat: 'qiBonus', perRank: 3, unit: '/s' },
    desc: 'Tuổi thọ dài, tích lũy linh lực không ngừng.' },

  { id: 'mu_3', spiritRoot: 'mu', branch: 1, tier: 3, requires: ['mu_2a', 'mu_2b', 'mu_2c'],
    name: 'Vạn Mộc Chi Linh', emoji: '🌲', maxRank: 1, costPerRank: 2000, costType: 'stone',
    effect: { stat: 'hpPct', perRank: 60, unit: '%' },
    desc: 'Tinh linh của vạn mộc hội tụ — không thể bị đánh bại bởi thương tổn thể xác.' },

  // ================================================================
  // THỦY LINH CĂN (shui) — Tốc Độ Tu Luyện, Mưu Trí
  // ================================================================
  { id: 'shui_1a', spiritRoot: 'shui', branch: 0, tier: 1, requires: [],
    name: 'Nước Chảy Bất Tận', emoji: '💧', maxRank: 3, costPerRank: 200, costType: 'stone',
    effect: { stat: 'ratePct', perRank: 12, unit: '%' },
    desc: 'Linh khí chảy như nước không ngừng, tu luyện nhanh hơn.' },
  { id: 'shui_1b', spiritRoot: 'shui', branch: 1, tier: 1, requires: [],
    name: 'Thủy Kính Phòng Ngự', emoji: '🌊', maxRank: 3, costPerRank: 180, costType: 'stone',
    effect: { stat: 'defPct', perRank: 8, unit: '%' },
    desc: 'Thủy khí tạo thành màng bảo vệ, phản lại đòn tấn công.' },
  { id: 'shui_1c', spiritRoot: 'shui', branch: 2, tier: 1, requires: [],
    name: 'Đan Đạo Thủy Hỏa', emoji: '⚗', maxRank: 3, costPerRank: 170, costType: 'stone',
    effect: { stat: 'danBonus', perRank: 15, unit: '%' },
    desc: 'Thủy hỏa điều hòa trong lò đan, tỷ lệ thành công cao hơn.' },

  { id: 'shui_2a', spiritRoot: 'shui', branch: 0, tier: 2, requires: ['shui_1a'],
    name: 'Thủy Nguyệt Vô Hình', emoji: '🌙', maxRank: 3, costPerRank: 500, costType: 'stone',
    effect: { stat: 'ratePct', perRank: 18, unit: '%' },
    desc: 'Như trăng soi đáy nước, tu luyện tựa thiền định thâm sâu.' },
  { id: 'shui_2b', spiritRoot: 'shui', branch: 1, tier: 2, requires: ['shui_1b'],
    name: 'Nhu Nhược Thắng Cương', emoji: '🌀', maxRank: 3, costPerRank: 470, costType: 'stone',
    effect: { stat: 'defPct', perRank: 15, unit: '%' },
    desc: 'Mềm thắng cứng — phòng thủ tăng vọt nhờ thủy nguyên lý.' },
  { id: 'shui_2c', spiritRoot: 'shui', branch: 2, tier: 2, requires: ['shui_1c'],
    name: 'Vạn Linh Tinh Thủy', emoji: '💎', maxRank: 3, costPerRank: 520, costType: 'stone',
    effect: { stat: 'stoneBonus', perRank: 1, unit: '/s' },
    desc: 'Thủy tinh chiết xuất linh nguyên từ đá, thu nhập linh thạch tăng.' },

  { id: 'shui_3', spiritRoot: 'shui', branch: 1, tier: 3, requires: ['shui_2a', 'shui_2b', 'shui_2c'],
    name: 'Thiên Địa Thủy Nguyên', emoji: '🌊', maxRank: 1, costPerRank: 2000, costType: 'stone',
    effect: { stat: 'ratePct', perRank: 50, unit: '%' },
    desc: 'Hội tụ thủy nguyên thiên địa — tốc độ tu luyện vượt mọi giới hạn.' },

  // ================================================================
  // HỎA LINH CĂN (huo) — Tấn Công, Luyện Đan, Đốt Cháy
  // ================================================================
  { id: 'huo_1a', spiritRoot: 'huo', branch: 0, tier: 1, requires: [],
    name: 'Lửa Thiêng Trái Tim', emoji: '🔥', maxRank: 3, costPerRank: 200, costType: 'stone',
    effect: { stat: 'atkPct', perRank: 10, unit: '%' },
    desc: 'Lửa thiêng đốt cháy từ bên trong, công kích mãnh liệt hơn.' },
  { id: 'huo_1b', spiritRoot: 'huo', branch: 1, tier: 1, requires: [],
    name: 'Đan Hỏa Chân Nguyên', emoji: '⚗', maxRank: 3, costPerRank: 190, costType: 'stone',
    effect: { stat: 'danBonus', perRank: 20, unit: '%' },
    desc: 'Hỏa căn tối thích hợp luyện đan, tỷ lệ thành công cao vượt trội.' },
  { id: 'huo_1c', spiritRoot: 'huo', branch: 2, tier: 1, requires: [],
    name: 'Hỏa Linh Nhật Nguyệt', emoji: '☀', maxRank: 3, costPerRank: 160, costType: 'stone',
    effect: { stat: 'ratePct', perRank: 8, unit: '%' },
    desc: 'Hỏa khí ngày đêm không ngừng, năng lượng tu luyện dồi dào.' },

  { id: 'huo_2a', spiritRoot: 'huo', branch: 0, tier: 2, requires: ['huo_1a'],
    name: 'Địa Ngục Nghiệp Hỏa', emoji: '🌋', maxRank: 3, costPerRank: 500, costType: 'stone',
    effect: { stat: 'atkPct', perRank: 20, unit: '%' },
    desc: 'Hỏa khí địa ngục đốt thiêu mọi thứ, công kích đáng sợ.' },
  { id: 'huo_2b', spiritRoot: 'huo', branch: 1, tier: 2, requires: ['huo_1b'],
    name: 'Thất Phẩm Đan Lò', emoji: '🏺', maxRank: 3, costPerRank: 520, costType: 'stone',
    effect: { stat: 'danBonus', perRank: 30, unit: '%' },
    desc: 'Luyện được đan dược thất phẩm, hiệu quả tăng vọt.' },
  { id: 'huo_2c', spiritRoot: 'huo', branch: 2, tier: 2, requires: ['huo_1c'],
    name: 'Hỏa Vân Tung Hoành', emoji: '💫', maxRank: 3, costPerRank: 480, costType: 'stone',
    effect: { stat: 'stoneBonus', perRank: 1.5, unit: '/s' },
    desc: 'Luyện đan phụ phẩm bán được giá cao, thu nhập tăng.' },

  { id: 'huo_3', spiritRoot: 'huo', branch: 1, tier: 3, requires: ['huo_2a', 'huo_2b', 'huo_2c'],
    name: 'Hỏa Thiên Chân Thân', emoji: '🔥', maxRank: 1, costPerRank: 2000, costType: 'stone',
    effect: { stat: 'atkPct', perRank: 50, unit: '%' },
    desc: 'Hỏa căn đạt đỉnh — thân thể trở thành ngọn lửa bất diệt.' },

  // ================================================================
  // THỔ LINH CĂN (tu) — Phòng Thủ, HP, Kiên Định
  // ================================================================
  { id: 'tu_1a', spiritRoot: 'tu', branch: 0, tier: 1, requires: [],
    name: 'Đại Địa Căn Cơ', emoji: '🗿', maxRank: 3, costPerRank: 200, costType: 'stone',
    effect: { stat: 'defPct', perRank: 12, unit: '%' },
    desc: 'Vững như Thái Sơn, phòng thủ không ai phá nổi.' },
  { id: 'tu_1b', spiritRoot: 'tu', branch: 1, tier: 1, requires: [],
    name: 'Hậu Thổ Thần Công', emoji: '⛰', maxRank: 3, costPerRank: 200, costType: 'stone',
    effect: { stat: 'hpBonus', perRank: 100, unit: 'HP' },
    desc: 'Đất dày bao dung vạn vật, thể lực vô hạn.' },
  { id: 'tu_1c', spiritRoot: 'tu', branch: 2, tier: 1, requires: [],
    name: 'Thổ Hành Linh Pháp', emoji: '🔮', maxRank: 3, costPerRank: 170, costType: 'stone',
    effect: { stat: 'arrayBonus', perRank: 20, unit: '%' },
    desc: 'Thổ linh căn tối phù hợp với trận pháp, hiệu quả tăng vọt.' },

  { id: 'tu_2a', spiritRoot: 'tu', branch: 0, tier: 2, requires: ['tu_1a'],
    name: 'Thái Sơn Bất Động', emoji: '🏔', maxRank: 3, costPerRank: 500, costType: 'stone',
    effect: { stat: 'defPct', perRank: 20, unit: '%' },
    desc: 'Không thể lay chuyển — phòng thủ đến mức không thể xuyên thủng.' },
  { id: 'tu_2b', spiritRoot: 'tu', branch: 1, tier: 2, requires: ['tu_1b'],
    name: 'Huyền Thổ Thần Thể', emoji: '💪', maxRank: 3, costPerRank: 550, costType: 'stone',
    effect: { stat: 'hpPct', perRank: 25, unit: '%' },
    desc: 'Thể xác hóa thành huyền thổ, HP tối đa vượt qua mọi giới hạn.' },
  { id: 'tu_2c', spiritRoot: 'tu', branch: 2, tier: 2, requires: ['tu_1c'],
    name: 'Địa Mạch Thần Thông', emoji: '🌐', maxRank: 3, costPerRank: 500, costType: 'stone',
    effect: { stat: 'stoneBonus', perRank: 2, unit: '/s' },
    desc: 'Kết nối địa mạch, linh thạch tự nhiên tụ về.' },

  { id: 'tu_3', spiritRoot: 'tu', branch: 1, tier: 3, requires: ['tu_2a', 'tu_2b', 'tu_2c'],
    name: 'Thần Đất Chứng Đạo', emoji: '🌍', maxRank: 1, costPerRank: 2000, costType: 'stone',
    effect: { stat: 'defPct', perRank: 60, unit: '%' },
    desc: 'Hóa thân thành thần đất — bất khả xâm phạm.' },

  // ================================================================
  // ÂM DƯƠNG LINH CĂN (yin_yang) — Cân Bằng, Toàn Năng
  // ================================================================
  { id: 'yy_1a', spiritRoot: 'yin_yang', branch: 0, tier: 1, requires: [],
    name: 'Âm Dương Song Luyện', emoji: '☯', maxRank: 3, costPerRank: 250, costType: 'stone',
    effect: { stat: 'atkPct', perRank: 7, unit: '%' },
    desc: 'Âm dương cân bằng trong tấn công.' },
  { id: 'yy_1b', spiritRoot: 'yin_yang', branch: 1, tier: 1, requires: [],
    name: 'Thái Cực Hóa Thần', emoji: '🌀', maxRank: 3, costPerRank: 250, costType: 'stone',
    effect: { stat: 'ratePct', perRank: 10, unit: '%' },
    desc: 'Thái cực vô vi, tu luyện siêu phàm.' },
  { id: 'yy_1c', spiritRoot: 'yin_yang', branch: 2, tier: 1, requires: [],
    name: 'Hòa Hợp Nguyên Khí', emoji: '🔄', maxRank: 3, costPerRank: 250, costType: 'stone',
    effect: { stat: 'defPct', perRank: 7, unit: '%' },
    desc: 'Âm dương dung hòa, thân tâm cân bằng.' },

  { id: 'yy_2a', spiritRoot: 'yin_yang', branch: 0, tier: 2, requires: ['yy_1a'],
    name: 'Dương Cực Tất Âm', emoji: '☀', maxRank: 3, costPerRank: 600, costType: 'stone',
    effect: { stat: 'atkPct', perRank: 15, unit: '%' },
    desc: 'Dương cực sinh âm — đòn tấn công biến hóa khôn lường.' },
  { id: 'yy_2b', spiritRoot: 'yin_yang', branch: 1, tier: 2, requires: ['yy_1b'],
    name: 'Vô Cực Thần Thông', emoji: '∞', maxRank: 3, costPerRank: 650, costType: 'stone',
    effect: { stat: 'hpPct', perRank: 15, unit: '%' },
    desc: 'Vô cực sinh thái cực, tiềm năng vô hạn.' },
  { id: 'yy_2c', spiritRoot: 'yin_yang', branch: 2, tier: 2, requires: ['yy_1c'],
    name: 'Âm Cực Tất Dương', emoji: '🌕', maxRank: 3, costPerRank: 600, costType: 'stone',
    effect: { stat: 'danBonus', perRank: 20, unit: '%' },
    desc: 'Âm dương trong đan lò hòa hợp, luyện đan đạt tiên phẩm.' },

  { id: 'yy_3', spiritRoot: 'yin_yang', branch: 1, tier: 3, requires: ['yy_2a', 'yy_2b', 'yy_2c'],
    name: 'Âm Dương Hợp Nhất', emoji: '☯', maxRank: 1, costPerRank: 3000, costType: 'stone',
    effect: { stat: 'ratePct', perRank: 40, unit: '%' },
    desc: 'Âm dương hoàn toàn hợp nhất — mọi thuộc tính cộng hưởng.' },

  // ================================================================
  // HỖN NGUYÊN LINH CĂN (hun) — Tất Cả, Huyền Thoại
  // ================================================================
  { id: 'hun_1a', spiritRoot: 'hun', branch: 0, tier: 1, requires: [],
    name: 'Hỗn Nguyên Khí Tụ', emoji: '🌌', maxRank: 3, costPerRank: 300, costType: 'stone',
    effect: { stat: 'ratePct', perRank: 15, unit: '%' },
    desc: 'Linh khí hỗn nguyên tự nhiên tụ lại.' },
  { id: 'hun_1b', spiritRoot: 'hun', branch: 1, tier: 1, requires: [],
    name: 'Vạn Đạo Quy Nhất', emoji: '✨', maxRank: 3, costPerRank: 300, costType: 'stone',
    effect: { stat: 'atkPct', perRank: 12, unit: '%' },
    desc: 'Hội tụ tinh hoa mọi đạo pháp vào một.' },
  { id: 'hun_1c', spiritRoot: 'hun', branch: 2, tier: 1, requires: [],
    name: 'Thiên Mệnh Bảo Hộ', emoji: '🛡', maxRank: 3, costPerRank: 300, costType: 'stone',
    effect: { stat: 'defPct', perRank: 12, unit: '%' },
    desc: 'Thiên mệnh bảo vệ kẻ được chọn.' },

  { id: 'hun_2a', spiritRoot: 'hun', branch: 0, tier: 2, requires: ['hun_1a'],
    name: 'Khai Thiên Tích Địa', emoji: '💥', maxRank: 3, costPerRank: 800, costType: 'stone',
    effect: { stat: 'atkPct', perRank: 25, unit: '%' },
    desc: 'Sức mạnh khai thiên tích địa — phá hủy mọi thứ.' },
  { id: 'hun_2b', spiritRoot: 'hun', branch: 1, tier: 2, requires: ['hun_1b'],
    name: 'Hỗn Nguyên Thần Thể', emoji: '🌠', maxRank: 3, costPerRank: 900, costType: 'stone',
    effect: { stat: 'hpPct', perRank: 30, unit: '%' },
    desc: 'Thể xác hỗn nguyên — không giới hạn.' },
  { id: 'hun_2c', spiritRoot: 'hun', branch: 2, tier: 2, requires: ['hun_1c'],
    name: 'Vạn Linh Triều Bái', emoji: '🌟', maxRank: 3, costPerRank: 850, costType: 'stone',
    effect: { stat: 'stoneBonus', perRank: 3, unit: '/s' },
    desc: 'Vạn linh quy phục, linh khí và linh thạch tự nhiên dâng lên.' },

  { id: 'hun_3', spiritRoot: 'hun', branch: 1, tier: 3, requires: ['hun_2a', 'hun_2b', 'hun_2c'],
    name: 'Hỗn Nguyên Khai Đạo', emoji: '🌌', maxRank: 1, costPerRank: 5000, costType: 'stone',
    effect: { stat: 'ratePct', perRank: 80, unit: '%' },
    desc: 'Đỉnh cao hỗn nguyên — vượt qua cả thiên đạo, tốc độ tu luyện đạt cảnh giới thần.' },
];

// Lấy nodes của một linh căn
export function getPassiveNodesForRoot(spiritRootId) {
  return PASSIVE_NODES.filter(n => n.spiritRoot === spiritRootId);
}
