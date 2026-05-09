// ============================================================
// core/phap-dia.js — Pháp Địa & Công Pháp System
// Tài · Lữ · Pháp · Địa — yếu tố Địa và Pháp
// ============================================================
import { SECTS } from './data.js';
import { REALM_NAMES } from './constants.js';
import { addChronicle } from './time-engine.js';
import { bus } from '../utils/helpers.js';
import { SECT_RANKS } from '../sect/sect-data.js';

// ============================================================
// PHÁP ĐỊA — Vị trí tu luyện
// ============================================================
export const PHAP_DIA_LIST = [
  {
    id: 'pham_dia',
    name: 'Phàm Địa',
    emoji: '🏚',
    desc: 'Nơi ở bình thường. Linh khí loãng, tu luyện chậm.',
    rateMultiplier: 0.8,
    tier: 0,
    unlockRealm: 0,
    cost: 0,
    costType: 'none',
    lore: 'Nhà tranh vách đất, linh khí không tụ. Đây là điểm khởi đầu của mọi tu sĩ.',
  },
  {
    id: 'linh_dia',
    name: 'Linh Địa',
    emoji: '🌿',
    desc: 'Vùng có linh mạch nhẹ. Tu luyện nhanh hơn.',
    rateMultiplier: 1.2,
    tier: 1,
    unlockRealm: 0,
    cost: 500,
    costType: 'stone',
    lore: 'Nơi linh khí tự nhiên tụ lại, cây cỏ xanh tốt quanh năm. Phải trả phí thuê hàng tháng.',
  },
  {
    id: 'phuc_dia',
    name: 'Phúc Địa',
    emoji: '🏔',
    desc: 'Đất lành linh khí dày. Tông môn phân phát theo cấp bậc.',
    rateMultiplier: 1.8,
    tier: 2,
    unlockRealm: 1,
    cost: 0,
    costType: 'sect_rank',
    requiredSectRank: 2,
    lore: 'Phúc địa thiên nhiên, linh khí đậm đặc. Chỉ đệ tử Chân Truyền trở lên mới được sử dụng.',
  },
  {
    id: 'dong_phu',
    name: 'Động Phủ',
    emoji: '🕳',
    desc: 'Hang động thiên nhiên tích tụ linh khí ngàn năm.',
    rateMultiplier: 3.0,
    tier: 3,
    unlockRealm: 2,
    cost: 0,
    costType: 'explore',
    lore: 'Tiền nhân để lại. Phải khám phá mới tìm được, và chỉ dùng được có hạn.',
    duration: 7200, // giây thực — 2 giờ
  },
  {
    id: 'bao_dia',
    name: 'Bảo Địa',
    emoji: '💎',
    desc: 'Thánh địa hiếm. Tranh giành với tông môn mới có.',
    rateMultiplier: 5.0,
    tier: 4,
    unlockRealm: 4,
    cost: 0,
    costType: 'sect_war',
    lore: 'Bảo địa của thiên địa. Một tông môn chỉ có một — phải chiến đấu để giữ.',
  },
];

// ============================================================
// CÔNG PHÁP — Phương pháp tu luyện
// ============================================================
// ============================================================
// CÔNG PHÁP — Redesign v2
// Mỗi công pháp có:
//   element: hệ ngũ hành (kim/moc/shui/huo/tu/null)
//   stages: số tầng, tương ứng cảnh giới (9 tầng = hết LK, 13 = LK+TC, v.v.)
//   realmRange: [minRealm, maxRealm] — cảnh giới có thể tu
//   grade: 0=Tạp, 1=Hạ, 2=Trung, 3=Thượng, 4=Địa, 5=Thiên
//   acquireType: 'default'|'buy'|'sect'|'co_duyen'
//   maxMastery: 100 (thuần thục tối đa)
//   buffs: hàm (mastery, elementMatch) → { ratePct, atkPct, defPct, hpPct, danBonus }
//         buff tăng dần theo thuần thục, bonus thêm nếu linh căn khớp hệ
// ============================================================
export const CONG_PHAP_MAX_SLOTS = 4; // tối đa 4 công pháp tu cùng lúc

export const CONG_PHAP_LIST = [

  // ══════════════════════════════════════════
  // TẠP PHẨM — mặc định cho mọi nhân vật
  // ══════════════════════════════════════════
  {
    id: 'vo_danh',
    name: 'Vô Danh Công Pháp',
    emoji: '📜',
    grade: 0, gradeName: 'Tạp Phẩm',
    element: null,
    stages: 9, realmRange: [0, 0], // chỉ dùng hết LK
    acquireType: 'default',
    cost: 0,
    sectId: null,
    desc: 'Công pháp không rõ nguồn gốc, tán tu tự mày mò. Hiệu quả kém.',
    lore: 'Không có sư môn truyền thụ, chỉ dựa vào tự lực. Con đường chông gai.',
    buffs: (mastery, match) => ({
      ratePct: Math.floor(mastery * 0.3),  // max 30% ở thuần thục 100
    }),
  },

  // ══════════════════════════════════════════
  // HẠ PHẨM — mua tại cửa hàng hoặc tông môn
  // ══════════════════════════════════════════
  {
    id: 'truong_xuan_cong',
    name: 'Trường Xuân Công',
    emoji: '🌿',
    grade: 1, gradeName: 'Hạ Phẩm',
    element: 'mu', // hệ Mộc
    stages: 9, realmRange: [0, 0], // 9 tầng, chỉ LK
    acquireType: 'buy',
    cost: 800,
    sectId: null,
    desc: 'Hệ Mộc. Tích lũy chân khí bền bỉ như mùa xuân bất tận. Chỉ dùng hết LK.',
    lore: 'Công pháp phổ thông lưu truyền trong dân gian. Chú trọng tích lũy, không cầu tốc độ.',
    buffs: (mastery, match) => ({
      ratePct: Math.floor(mastery * (match ? 0.6 : 0.45)), // max 60% nếu khớp hệ, 45% nếu không
      hpPct:   Math.floor(mastery * 0.15),                 // max 15% HP
    }),
  },
  {
    id: 'tay_tuy_quyet',
    name: 'Tẩy Tủy Quyết',
    emoji: '💎',
    grade: 1, gradeName: 'Hạ Phẩm',
    element: null, // không thuộc hệ nào — rèn thân
    stages: 13, realmRange: [0, 1], // LK + TC
    acquireType: 'buy',
    cost: 1500,
    sectId: null,
    desc: 'Bí pháp rèn luyện thân thể, tẩy kinh phạt tủy. Dùng được LK và TC.',
    lore: 'Dược lực và pháp lực phối hợp loại bỏ tạp chất trong xương cốt. Nhục thân bền khỏe, linh căn cải thiện đáng kể.',
    buffs: (mastery, match) => ({
      hpPct:    Math.floor(mastery * 0.5),  // max 50% HP — chuyên rèn thân
      defPct:   Math.floor(mastery * 0.3),  // max 30% phòng thủ
      ratePct:  Math.floor(mastery * 0.1),  // max 10% tốc tu (thứ yếu)
      // Đặc biệt: tăng Căn Cốt — xử lý riêng trong calcCongPhapMasteryBonus
      canCotBonus: Math.floor(mastery * 0.2), // max +20 Căn Cốt
    }),
  },
  {
    id: 'thanh_nguyen_kiem_quyet',
    name: 'Thanh Nguyên Kiếm Quyết',
    emoji: '⚔',
    grade: 2, gradeName: 'Trung Phẩm',
    element: 'kim', // hệ Kim
    stages: 17, realmRange: [1, 4], // TC trở lên
    acquireType: 'buy',
    cost: 8000,
    sectId: null,
    desc: 'Hệ Kim. Kiếm quyết tâm pháp của Hoàng Phong Cốc. Yêu cầu từ TC trở lên.',
    lore: 'Tu đến tầng cao có thể phát xuất Thanh Nguyên kiếm khí chém địch thủ từ xa. Pháp quyết chú trọng ngưng luyện kiếm mang lợi hại.',
    buffs: (mastery, match) => ({
      atkPct:  Math.floor(mastery * (match ? 0.7 : 0.5)), // max 70% ATK nếu khớp Kim
      ratePct: Math.floor(mastery * 0.2),                  // max 20% tốc tu
    }),
  },

  // ══════════════════════════════════════════
  // HẠ PHẨM TÁN TU — Thủy & Thổ (mua tại cửa hàng)
  // ══════════════════════════════════════════
  {
    id: 'hoi_thuy_quyet',
    name: 'Hồi Thủy Quyết',
    emoji: '💧',
    grade: 1, gradeName: 'Hạ Phẩm',
    element: 'shui', // hệ Thủy
    stages: 9, realmRange: [0, 0], // chỉ LK
    acquireType: 'buy',
    cost: 900,
    sectId: null,
    desc: 'Hệ Thủy. Pháp quyết nước xoáy tuần hoàn, kiên trì mà bền bỉ. Tán tu phù hợp.',
    lore: 'Nước không tranh mà thắng, lặng lẽ mòn đá. Tán tu lĩnh ngộ từ quan sát dòng suối chảy qua đêm đông.',
    buffs: (mastery, match) => ({
      ratePct: Math.floor(mastery * (match ? 0.55 : 0.40)), // max 55% / 40% — Thủy thiên về tốc tu
      hpPct:   Math.floor(mastery * 0.20),                  // max 20% HP — nước nuôi dưỡng
    }),
  },
  {
    id: 'cuong_tho_kinh',
    name: 'Cương Thổ Kinh',
    emoji: '🪨',
    grade: 1, gradeName: 'Hạ Phẩm',
    element: 'tu', // hệ Thổ
    stages: 9, realmRange: [0, 0], // chỉ LK
    acquireType: 'buy',
    cost: 1000,
    sectId: null,
    desc: 'Hệ Thổ. Bí kinh rèn thân theo đạo đất, vững chắc và khó lay chuyển.',
    lore: 'Đất sinh vạn vật, bền bỉ ngàn năm. Pháp môn này nhấn mạnh trường tồn hơn tốc độ — phù hợp tán tu thể chất.',
    buffs: (mastery, match) => ({
      defPct:  Math.floor(mastery * (match ? 0.50 : 0.35)), // max 50% / 35% — Thổ thiên về phòng
      hpPct:   Math.floor(mastery * 0.15),                  // max 15% HP
      ratePct: Math.floor(mastery * 0.10),                  // max 10% — đất chậm mà chắc
    }),
  },

  // ══════════════════════════════════════════
  // TRUNG PHẨM TÁN TU — Thủy & Null (mua)
  // ══════════════════════════════════════════
  {
    id: 'bac_minh_thuy_kinh',
    name: 'Bắc Minh Thủy Kinh',
    emoji: '🌊',
    grade: 2, gradeName: 'Trung Phẩm',
    element: 'shui', // hệ Thủy
    stages: 13, realmRange: [1, 2], // TC + KĐ
    acquireType: 'buy',
    cost: 6500,
    sectId: null,
    desc: 'Hệ Thủy. Bí kinh nói về biển bắc vô tận — thủy lực tuần hoàn không ngừng nghỉ.',
    lore: 'Có cá nằm trong biển bắc, tên gọi là Côn. Nước tích lại ngàn dặm, người tu thấm nhuần trí tuệ của sự rộng lớn.',
    buffs: (mastery, match) => ({
      ratePct: Math.floor(mastery * (match ? 0.60 : 0.45)), // max 60% / 45% — Thủy tốc tu cao
      defPct:  Math.floor(mastery * (match ? 0.35 : 0.25)), // max 35% / 25% — nước thích nghi
    }),
  },
  {
    id: 'hon_nguyen_hoa_kinh',
    name: 'Hỗn Nguyên Hóa Kinh',
    emoji: '☯',
    grade: 2, gradeName: 'Trung Phẩm',
    element: null, // không thuộc hệ nào — viên dung vạn hệ
    stages: 13, realmRange: [1, 2], // TC + KĐ
    acquireType: 'buy',
    cost: 7500,
    sectId: null,
    desc: 'Không thuộc hệ. Tổng hợp nhiều luồng pháp lực, viên dung mà không thiên lệch. Tán tu dễ lĩnh ngộ.',
    lore: 'Hỗn Nguyên là trước khi trời đất phân chia. Không mạnh về một hướng nhưng không yếu ở đâu — con đường của tán tu không căn.',
    buffs: (mastery, match) => ({
      ratePct: Math.floor(mastery * 0.30), // max 30%
      atkPct:  Math.floor(mastery * 0.25), // max 25%
      defPct:  Math.floor(mastery * 0.25), // max 25%
      hpPct:   Math.floor(mastery * 0.15), // max 15%
      // Tổng 95% — tương đương thanh_nguyen_kiem_quyet (90% với match) nhưng cân bằng hơn
    }),
  },

  // ══════════════════════════════════════════
  // THƯỢNG PHẨM TÁN TU — Thổ & Null (cơ duyên)
  // ══════════════════════════════════════════
  {
    id: 'dia_tang_chon_kinh',
    name: 'Địa Tạng Chân Kinh',
    emoji: '🏔',
    grade: 3, gradeName: 'Thượng Phẩm',
    element: 'tu', // hệ Thổ
    stages: 17, realmRange: [3, 4], // NA + HT
    acquireType: 'co_duyen',
    cost: 0,
    sectId: null,
    desc: 'Hệ Thổ. Chân kinh tuyệt học về đạo đất — bất hoại chi thân, vạn vật không phá.',
    lore: 'Thổ tàng vạn vật, kiên bất khả hủy. Địa Tạng Chân Kinh là bí pháp mà đại địa truyền lại cho người hữu duyên — chỉ ai ngộ được sự trường tồn mới lĩnh hội được.',
    buffs: (mastery, match) => ({
      defPct:  Math.floor(mastery * (match ? 0.90 : 0.70)), // max 90% / 70% — Thổ phòng tối thượng
      hpPct:   Math.floor(mastery * 0.50),                  // max 50% HP — thân thể bất hoại
      ratePct: Math.floor(mastery * 0.30),                  // max 30% — đất bền, không ngừng
      // Tổng với match: 170% — bằng kiem_quyet_thuong (170%) nhưng thiên DEF thay ATK
    }),
  },
  {
    id: 'hon_nguyen_chon_kinh',
    name: 'Hỗn Nguyên Chân Kinh',
    emoji: '🌀',
    grade: 3, gradeName: 'Thượng Phẩm',
    element: null, // không hệ — đỉnh cao của viên dung
    stages: 17, realmRange: [3, 4], // NA + HT
    acquireType: 'co_duyen',
    cost: 0,
    sectId: null,
    desc: 'Không thuộc hệ. Chân kinh tột đỉnh của tán tu — dung hợp tất cả ngũ hành, không thiên không lệch.',
    lore: 'Không phải tông môn nào có thể truyền thụ — đây là pháp mà trời đất trao cho kẻ không cửa không môn, tự ngộ ra đạo lý trước khi âm dương phân lập.',
    buffs: (mastery, match) => ({
      ratePct: Math.floor(mastery * 0.50), // max 50%
      atkPct:  Math.floor(mastery * 0.40), // max 40%
      defPct:  Math.floor(mastery * 0.35), // max 35%
      hpPct:   Math.floor(mastery * 0.25), // max 25%
      // Tổng 150% — thấp hơn sect Thượng (170%) bù lại không cần căn hệ khớp
    }),
  },

  // ══════════════════════════════════════════
  // HẠ PHẨM TÁN TU — Kim & Hỏa (mua tại cửa hàng)
  // L5 fix S-LK1: tán tu Kim/Hỏa LK trước đây không có công pháp Hạ phẩm match hệ
  // ══════════════════════════════════════════
  {
    id: 'kim_quang_jue',
    name: 'Kim Quang Quyết',
    emoji: '⚔',
    grade: 1, gradeName: 'Hạ Phẩm',
    element: 'kim',
    stages: 9, realmRange: [0, 0],
    acquireType: 'buy',
    cost: 1100,
    sectId: null,
    desc: 'Hệ Kim. Kiếm khí sơ khai, rèn luyện ý chí cứng rắn. Tán tu Kim linh căn phù hợp.',
    lore: 'Bí quyết lưu truyền trong giới thương nhân buôn pháp bảo — tàm tạm nhưng đủ dùng hết LK.',
    buffs: (mastery, match) => ({
      atkPct:  Math.floor(mastery * (match ? 0.55 : 0.40)), // max 55%/40% ATK
      ratePct: Math.floor(mastery * 0.15),                  // max 15% tốc tu
    }),
  },
  {
    id: 'hoa_diem_quyet',
    name: 'Hỏa Diệm Quyết',
    emoji: '🔥',
    grade: 1, gradeName: 'Hạ Phẩm',
    element: 'huo',
    stages: 9, realmRange: [0, 0],
    acquireType: 'buy',
    cost: 1050,
    sectId: null,
    desc: 'Hệ Hỏa. Nội công đốt linh khí như lửa — luyện đan tốt hơn, công kích mạnh hơn. Tán tu phù hợp.',
    lore: 'Học lỏm từ một đan sư phế đồ — không hoàn chỉnh nhưng đủ để tán tu Hỏa linh dùng hết LK.',
    buffs: (mastery, match) => ({
      ratePct:  Math.floor(mastery * 0.30),                   // max 30% tốc tu
      danBonus: Math.floor(mastery * (match ? 0.45 : 0.25)), // max 45%/25% luyện đan
    }),
  },

  // ══════════════════════════════════════════
  // TÔNG MÔN — nhận khi gia nhập
  // ══════════════════════════════════════════
  {
    id: 'kiem_quyet_ha',
    name: 'Thanh Vân Kiếm Quyết (Hạ)',
    emoji: '⚔',
    grade: 1, gradeName: 'Hạ Phẩm',
    element: 'kim',
    stages: 9, realmRange: [0, 0],
    acquireType: 'sect',
    cost: 0, sectId: 'kiem_tong',
    desc: 'Hệ Kim. Nhập môn kiếm pháp của Thanh Vân Kiếm Tông. Nền tảng vững chắc.',
    lore: 'Mọi đệ tử Thanh Vân đều bắt đầu từ đây.',
    buffs: (mastery, match) => ({
      atkPct:  Math.floor(mastery * (match ? 0.55 : 0.40)),
      ratePct: Math.floor(mastery * 0.25),
    }),
  },
  {
    id: 'dan_kinh_ha',
    name: 'Vạn Linh Đan Kinh (Hạ)',
    emoji: '⚗',
    grade: 1, gradeName: 'Hạ Phẩm',
    element: 'huo',
    stages: 9, realmRange: [0, 0],
    acquireType: 'sect',
    cost: 0, sectId: 'dan_tong',
    desc: 'Hệ Hỏa. Căn bản đan đạo của Vạn Linh Đan Tông.',
    lore: 'Luyện khí và luyện đan song hành, đây là con đường của đan sư.',
    buffs: (mastery, match) => ({
      ratePct:  Math.floor(mastery * 0.30),
      danBonus: Math.floor(mastery * (match ? 0.5 : 0.3)),
    }),
  },
  {
    id: 'tran_phap_ha',
    name: 'Huyền Cơ Trận Kinh (Hạ)',
    emoji: '🔮',
    grade: 1, gradeName: 'Hạ Phẩm',
    element: 'tu',
    stages: 9, realmRange: [0, 0],
    acquireType: 'sect',
    cost: 0, sectId: 'tran_phap',
    desc: 'Hệ Thổ. Trận pháp nhập môn của Huyền Cơ Các.',
    lore: 'Trận pháp như đất, kiên cố và bền vững.',
    buffs: (mastery, match) => ({
      defPct:  Math.floor(mastery * (match ? 0.55 : 0.40)),
      ratePct: Math.floor(mastery * 0.25),
    }),
  },
  {
    id: 'the_tu_ha',
    name: 'Thiết Cốt Thần Công (Hạ)',
    emoji: '💪',
    grade: 1, gradeName: 'Hạ Phẩm',
    element: null, // thể tu không thuộc hệ
    stages: 9, realmRange: [0, 0],
    acquireType: 'sect',
    cost: 0, sectId: 'the_tu',
    desc: 'Thể tu nhập môn của Thiết Cốt Môn. Rèn luyện thân thể.',
    lore: 'Thân thể là pháp bảo tốt nhất.',
    buffs: (mastery, match) => ({
      hpPct:  Math.floor(mastery * 0.6),
      defPct: Math.floor(mastery * 0.3),
    }),
  },

  // ══════════════════════════════════════════
  // TRUNG PHẨM — tông môn cấp cao / cơ duyên
  // ══════════════════════════════════════════
  {
    id: 'kiem_quyet_trung',
    name: 'Thanh Vân Kiếm Quyết (Trung)',
    emoji: '⚔',
    grade: 2, gradeName: 'Trung Phẩm',
    element: 'kim',
    stages: 13, realmRange: [1, 2], // TC + KĐ
    acquireType: 'sect',
    cost: 5000, sectId: 'kiem_tong',
    desc: 'Hệ Kim. Kiếm pháp cấp trung, kiếm ý bắt đầu ngưng tụ.',
    lore: 'Đệ tử xuất sắc mới được truyền thụ. Kiếm khí có thể thương người từ xa.',
    buffs: (mastery, match) => ({
      atkPct:  Math.floor(mastery * (match ? 0.80 : 0.60)),
      ratePct: Math.floor(mastery * 0.35),
    }),
  },
  {
    id: 'dan_kinh_trung',
    name: 'Vạn Linh Đan Kinh (Trung)',
    emoji: '⚗',
    grade: 2, gradeName: 'Trung Phẩm',
    element: 'huo',
    stages: 13, realmRange: [1, 2],
    acquireType: 'sect',
    cost: 5000, sectId: 'dan_tong',
    desc: 'Hệ Hỏa. Đan kinh cấp trung, có thể luyện đan thất phẩm.',
    lore: 'Nắm được bí quyết phối liệu, đan thành tự có linh tính.',
    buffs: (mastery, match) => ({
      ratePct:  Math.floor(mastery * 0.40),
      danBonus: Math.floor(mastery * (match ? 0.7 : 0.5)),
    }),
  },
  {
    id: 'tran_phap_trung',
    name: 'Huyền Cơ Trận Kinh (Trung)',
    emoji: '🔮',
    grade: 2, gradeName: 'Trung Phẩm',
    element: 'tu',
    stages: 13, realmRange: [1, 2],
    acquireType: 'sect',
    cost: 5000, sectId: 'tran_phap',
    desc: 'Hệ Thổ. Trận pháp cấp trung, có thể bày đại trận.',
    lore: 'Một trận có thể nhốt Kim Đan tu sĩ.',
    buffs: (mastery, match) => ({
      defPct:  Math.floor(mastery * (match ? 0.80 : 0.60)),
      ratePct: Math.floor(mastery * 0.35),
    }),
  },
  {
    id: 'the_tu_trung',
    name: 'Thiết Cốt Thần Công (Trung)',
    emoji: '💪',
    grade: 2, gradeName: 'Trung Phẩm',
    element: null,
    stages: 13, realmRange: [1, 2],
    acquireType: 'sect',
    cost: 5000, sectId: 'the_tu',
    desc: 'Thể tu cấp trung, da thịt cứng hơn giáp sắt.',
    lore: 'Tay không đánh vỡ Kim Đan, thân thể là vũ khí.',
    buffs: (mastery, match) => ({
      hpPct:  Math.floor(mastery * 0.80),
      defPct: Math.floor(mastery * 0.45),
    }),
  },

  // ══════════════════════════════════════════
  // THƯỢNG PHẨM — chỉ qua Cơ Duyên
  // ══════════════════════════════════════════
  {
    id: 'kiem_quyet_thuong',
    name: 'Thanh Vân Kiếm Quyết (Thượng)',
    emoji: '⚔',
    grade: 3, gradeName: 'Thượng Phẩm',
    element: 'kim',
    stages: 17, realmRange: [3, 4], // NA + HT
    acquireType: 'co_duyen',
    cost: 0, sectId: 'kiem_tong',
    desc: 'Hệ Kim. Kiếm pháp đỉnh cao, kiếm ý thông thiên.',
    lore: 'Chỉ Trưởng Lão mới truyền thụ. Mỗi thế hệ chỉ có một người được chọn.',
    buffs: (mastery, match) => ({
      atkPct:  Math.floor(mastery * (match ? 1.20 : 0.90)),
      ratePct: Math.floor(mastery * 0.50),
    }),
  },
  {
    id: 'dan_kinh_thuong',
    name: 'Vạn Linh Đan Kinh (Thượng)',
    emoji: '⚗',
    grade: 3, gradeName: 'Thượng Phẩm',
    element: 'huo',
    stages: 17, realmRange: [3, 4],
    acquireType: 'co_duyen',
    cost: 0, sectId: 'dan_tong',
    desc: 'Hệ Hỏa. Đan kinh tuyệt học, có thể luyện tiên đan.',
    lore: 'Bí kíp của Tổ Sư Đan Tông. Ngàn năm mới xuất hiện một người lĩnh ngộ được.',
    buffs: (mastery, match) => ({
      ratePct:  Math.floor(mastery * 0.55),
      danBonus: Math.floor(mastery * (match ? 1.0 : 0.75)),
    }),
  },
];

// ============================================================
// THUẦN THỤC CÔNG PHÁP
// ============================================================

// Multiplier nền theo grade công pháp cao nhất đang tu
// Đảm bảo tạp phẩm (vo_danh) vẫn chậm hơn hạ phẩm dù thuần thục 0
export function calcCongPhapBaseMult(G) {
  const activeIds = G.congPhap?.activeIds || [G.congPhap?.currentId || 'vo_danh'];
  let topGrade = 0;
  for (const id of activeIds) {
    const cp = CONG_PHAP_LIST.find(c => c.id === id);
    if (cp && (cp.grade ?? 0) > topGrade) topGrade = cp.grade;
  }
  // Grade 0 (Tạp Phẩm) = ×0.7, Grade 1+ = ×1.0
  return topGrade === 0 ? 0.7 : 1.0;
}

export function getActiveCongPhap(G) {
  if (!G.congPhap?.activeIds) return [];
  return G.congPhap.activeIds
    .map(id => ({ cp: CONG_PHAP_LIST.find(c => c.id === id), mastery: G.congPhap.mastery?.[id] ?? 0 }))
    .filter(x => x.cp);
}

export function checkElementMatch(G, cp) {
  if (!cp.element) return false;
  const main = G.spiritData?.mainElement;
  if (!main) return false;
  return cp.element === main;
}

export function calcCongPhapMasteryBonus(G) {
  const active = getActiveCongPhap(G);
  const total = { ratePct:0, atkPct:0, defPct:0, hpPct:0, danBonus:0, canCotBonus:0 };
  for (const { cp, mastery } of active) {
    const match = checkElementMatch(G, cp);
    const b = cp.buffs(mastery, match);
    for (const key of Object.keys(total)) {
      total[key] += b[key] ?? 0;
    }
  }
  return total;
}

export function calcMasteryGainPerTick(G, cpId) {
  const cp = CONG_PHAP_LIST.find(c => c.id === cpId);
  if (!cp) return 0;
  const ngoTinh = G.ngoTinh ?? 50;
  const match   = checkElementMatch(G, cp);
  const base = 0.01 + (ngoTinh / 100) * 0.04;
  return base * (match ? 1.3 : 1.0);
}

export function addCongPhapSlot(G, congPhapId) {
  if (!G.congPhap) G.congPhap = { currentId:'vo_danh', unlockedIds:['vo_danh'], activeIds:['vo_danh'], mastery:{} };
  if (!G.congPhap.activeIds) G.congPhap.activeIds = [G.congPhap.currentId || 'vo_danh'];
  if (!G.congPhap.mastery)   G.congPhap.mastery   = {};
  if (G.congPhap.activeIds.includes(congPhapId))
    return { ok:false, msg:'Đã đang tu luyện công pháp này rồi', type:'danger' };
  if (G.congPhap.activeIds.length >= CONG_PHAP_MAX_SLOTS)
    return { ok:false, msg:`Tối đa ${CONG_PHAP_MAX_SLOTS} công pháp cùng lúc — cần bỏ bớt trước`, type:'danger' };
  G.congPhap.activeIds.push(congPhapId);
  if (!G.congPhap.mastery[congPhapId]) G.congPhap.mastery[congPhapId] = 0;
  const cp = CONG_PHAP_LIST.find(c => c.id === congPhapId);
  return { ok:true, msg:`📖 Bắt đầu tu luyện ${cp?.name}`, type:'jade' };
}

export function removeCongPhapSlot(G, congPhapId) {
  if (congPhapId === 'vo_danh')
    return { ok:false, msg:'Không thể bỏ Vô Danh Công Pháp', type:'danger' };
  if (!G.congPhap?.activeIds) return { ok:false, msg:'Không có dữ liệu', type:'danger' };
  G.congPhap.activeIds = G.congPhap.activeIds.filter(id => id !== congPhapId);
  return { ok:true, msg:'Đã dừng tu luyện công pháp này', type:'info' };
}

// ============================================================
// ENGINE
// ============================================================

// Lấy Pháp Địa hiện tại
export function getCurrentPhapDia(G) {
  const id = G.phapDia?.currentId || 'pham_dia';
  return PHAP_DIA_LIST.find(p => p.id === id) || PHAP_DIA_LIST[0];
}

// Lấy Công Pháp hiện tại
export function getCurrentCongPhap(G) {
  const id = G.congPhap?.currentId || 'vo_danh';
  return CONG_PHAP_LIST.find(c => c.id === id) || CONG_PHAP_LIST[0];
}

// Chuyển Pháp Địa
export function moveToPhapDia(G, phapDiaId) {
  const target = PHAP_DIA_LIST.find(p => p.id === phapDiaId);
  if (!target) return { ok: false, msg: 'Pháp địa không tồn tại', type: 'danger' };

  if (G.realmIdx < target.unlockRealm) {
      return { ok: false, msg: `Cần ${REALM_NAMES[target.unlockRealm]} để vào ${target.name}`, type: 'danger' };
  }

  if (target.costType === 'stone' && target.cost > 0) {
    if (G.stone < target.cost) return { ok: false, msg: `Cần ${target.cost} 💎 để thuê ${target.name}`, type: 'danger' };
    G.stone -= target.cost;
  }

  if (target.costType === 'sect_rank') {
    const sectExp = G.sect?.exp || 0;
    // Dùng SECT_RANKS để tính rank đúng, tránh hardcode Math.floor(exp/500)
    let rank = 0;
    for (const r of SECT_RANKS) {
      if (sectExp >= r.expRequired) rank = r.rank;
    }
    if (rank < (target.requiredSectRank || 2)) {
      return { ok: false, msg: `Cần cấp bậc Chân Truyền trong tông môn`, type: 'danger' };
    }
  }

  if (!G.phapDia) G.phapDia = { currentId: 'pham_dia' };
  const oldDia = getCurrentPhapDia(G);
  G.phapDia.currentId = phapDiaId;

  // Động Phủ có thời hạn
  if (target.duration) {
    G.phapDia.expiresAt = Date.now() + (target.duration * 1000);
  }

  addChronicle(G, `Di chuyển từ ${oldDia.name} → ${target.name}. Tốc độ tu luyện ×${target.rateMultiplier}.`);

  bus.emit('phapdia:changed', { phapDia: target });
  return {
    ok: true,
    msg: `🏔 Di chuyển đến ${target.name} — tốc độ tu luyện ×${target.rateMultiplier}`,
    type: 'jade',
  };
}

// ============================================================
// PHÍ LINH ĐỊA ĐỊNH KỲ
// Mỗi 1 năm game, trừ phí thuê Linh Địa.
// Nếu không đủ stone: cảnh báo, không kick ra ngay (Audit #6).
// ============================================================
export const LINH_DIA_ANNUAL_FEE = 150; // 💎/năm game

export function checkLinhDiaFee(G) {
  if (G.phapDia?.currentId !== 'linh_dia') return;

  const currentYear = G.gameTime?.currentYear ?? 0;

  // Lần đầu gặp (save cũ hoặc fresh): init lastFeeYear = năm hiện tại, không trừ phí
  if (G.phapDia.lastFeeYear == null) {
    G.phapDia.lastFeeYear = currentYear;
    return;
  }

  // Chưa đủ 1 năm game → bỏ qua
  if (currentYear - G.phapDia.lastFeeYear < 1) return;

  // Tính số năm cần tính phí (ít nhất 1)
  const yearsDue = Math.floor(currentYear - G.phapDia.lastFeeYear);
  G.phapDia.lastFeeYear += yearsDue;

  const totalFee = LINH_DIA_ANNUAL_FEE * yearsDue;

  if (G.stone >= totalFee) {
    G.stone -= totalFee;
    bus.emit('phapdia:fee_paid', { amount: totalFee, years: yearsDue });
  } else {
    // Trừ toàn bộ stone còn lại (tính như nợ), cảnh báo nhưng không kick
    const paid = G.stone;
    G.stone = 0;
    bus.emit('phapdia:fee_overdue', { owed: totalFee, paid, shortfall: totalFee - paid });
  }
}

// Kiểm tra Pháp Địa hết hạn (Động Phủ)
export function checkPhapDiaExpiry(G) {
  if (!G.phapDia?.expiresAt) return;
  if (Date.now() > G.phapDia.expiresAt) {
    G.phapDia.currentId = 'pham_dia';
    G.phapDia.expiresAt = null;
    bus.emit('phapdia:expired', {});
    return { expired: true };
  }
}

// Nâng cấp Công Pháp
export function upgradeCongPhap(G, congPhapId) {
  const target = CONG_PHAP_LIST.find(c => c.id === congPhapId);
  if (!target) return { ok: false, msg: 'Công pháp không tồn tại', type: 'danger' };

  if (!G.congPhap) G.congPhap = { currentId:'vo_danh', unlockedIds:['vo_danh'], activeIds:['vo_danh'], mastery:{ vo_danh:0 } };
  if (!G.congPhap.activeIds) G.congPhap.activeIds = [G.congPhap.currentId || 'vo_danh'];
  if (!G.congPhap.mastery)   G.congPhap.mastery   = {};

  // Kiểm tra tông môn
  if (target.sectId && G.sectId !== target.sectId) {
    const sect = SECTS.find(s => s.id === target.sectId);
    return { ok: false, msg: `Chỉ đệ tử ${sect?.name || target.sectId} mới tu luyện được`, type: 'danger' };
  }

  // Tán tu chỉ dùng công pháp không thuộc tông
  if (target.acquireType === 'sect' && !G.sectId) {
    return { ok: false, msg: 'Công pháp tông môn — cần gia nhập tông môn trước', type: 'danger' };
  }

  // Kiểm tra cảnh giới
  const [minRealm, maxRealm] = target.realmRange;
  if (G.realmIdx < minRealm) {
    return { ok: false, msg: `Cần đạt ${REALM_NAMES[minRealm]} mới tu được công pháp này`, type: 'danger' };
  }

  // Cơ duyên không thể mua
  if (target.acquireType === 'co_duyen') {
    return { ok: false, msg: 'Công pháp này chỉ có được qua Cơ Duyên — không thể mua!', type: 'danger' };
  }

  // Kiểm tra đã unlock chưa
  if (G.congPhap.unlockedIds.includes(congPhapId)) {
    // Đã có rồi — thêm vào slot tu luyện
    return addCongPhapSlot(G, congPhapId);
  }

  // Mua mới
  if (target.cost > 0) {
    if (G.stone < target.cost) return { ok: false, msg: `Cần ${target.cost} 💎`, type: 'danger' };
    G.stone -= target.cost;
  }

  G.congPhap.unlockedIds.push(congPhapId);
  G.congPhap.mastery[congPhapId] = 0;
  G.congPhap.currentId = congPhapId; // tương thích ngược

  // Thêm vào slot tu luyện nếu còn chỗ
  if (!G.congPhap.activeIds.includes(congPhapId)) {
    if (G.congPhap.activeIds.length < CONG_PHAP_MAX_SLOTS) {
      G.congPhap.activeIds.push(congPhapId);
    }
  }

  addChronicle(G, `Lĩnh ngộ ${target.name} [${target.gradeName}].`);
  return {
    ok: true,
    msg: `📖 Lĩnh ngộ ${target.name} [${target.gradeName}]! Bắt đầu tu luyện.`,
    type: 'jade',
  };
}

// Lấy danh sách Công Pháp có thể xem/mua
export function getAvailableCongPhap(G) {
  return CONG_PHAP_LIST.filter(c => {
    if (c.acquireType === 'co_duyen') return false; // cơ duyên không hiện ở đây
    // Tông môn: chỉ hiện công pháp của tông mình
    if (c.acquireType === 'sect') {
      if (!c.sectId || c.sectId !== G.sectId) return false;
    }
    // Công pháp mua: hiện với tất cả (kể cả đệ tử tông môn)
    // vo_danh: luôn hiện
    return true;
  });
}