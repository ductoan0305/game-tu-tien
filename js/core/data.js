// ============================================================
// DATA.JS — Single source of truth for all game content
// To add new realms, skills, items: only edit this file
// ============================================================

export const REALMS = [
  {
    id: 'luyen_khi',
    name: 'Luyện Khí',
    lifespan: 120,
    lifespanCap: 144,
    nameCN: '練氣',
    stages: 9,
    // Sơ Kỳ (1-3): linh khí dạng khí mỏng manh, vào cơ thể yếu ớt
    // Trung Kỳ (4-6): khí dày đặc hơn, kinh mạch bắt đầu chịu được linh khí
    // Hậu Kỳ (7-9): linh khí gần như bão hòa thể xác, chuẩn bị chuyển hóa sang dịch
    stageNames: [
      'Sơ Kỳ I','Sơ Kỳ II','Sơ Kỳ III',
      'Trung Kỳ I','Trung Kỳ II','Trung Kỳ III',
      'Hậu Kỳ I','Hậu Kỳ II','Hậu Kỳ III',
    ],
    qiBase: 100,
    qiScaling: 1.6,
    rate: 0.06,           // v12: rate_base = 0.06 (GDD mục 21)
    // purityRateFactor: tốc độ tích Thuần Độ = calcQiRate × factor
    // Khi qi đã đầy 100%, bế quan tiếp → tích Thuần Độ thay vì qi
    purityRateFactor: 0.5,
    // purityThresholds[i]: ngưỡng Thuần Độ cần đạt để đột phá tầng i+1
    // Calibrated via simulation (Session 9):
    // Target: Tam LC tán tu Linh Địa xong LK ở tuổi ~110/120
    //         Thiên LC tông môn xong LK ở tuổi ~60/144
    //         Ngũ LC tán tu chết ở LK 6-7 (ĐÚNG thiết kế)
    purityThresholds: [
       107,   // LK 1 (Sơ Kỳ I)
       182,   // LK 2 (Sơ Kỳ II)
       310,   // LK 3 (Sơ Kỳ III) — vách ngăn sơ→trung
       528,   // LK 4 (Trung Kỳ I)   ← bước nhảy ~1.7×
       898,   // LK 5 (Trung Kỳ II)
      1527,   // LK 6 (Trung Kỳ III) — vách ngăn trung→hậu
      2597,   // LK 7 (Hậu Kỳ I)    ← bước nhảy ~1.7×
      4414,   // LK 8 (Hậu Kỳ II)
      7505,   // LK 9 (Hậu Kỳ III)  — vách ngăn lớn nhất → Trúc Cơ
    ],
    // Tuổi tối đa (tính trong cảnh giới này) để đột phá lên cảnh giới tiếp
    // Bắt đầu từ tuổi 10 thực, nên 60 năm LK = tương đương tuổi 70
    breakthroughAgeLimitToNext: 60,
    atk: 10, def: 5, hp: 100,
    emoji: '🧘',
    color: '#888780',
    fate: 'Phàm nhân chưa khai linh',
    breakthroughText: [
      'Linh khí mong manh như sương mai, len lỏi qua kinh mạch.',
      'Hơi thở dài, linh khí tụ đan điền, cảnh giới nâng cao một tầng.',
      'Phàm thể dần thay đổi. Con đường tu tiên bắt đầu từ đây.',
      'Kinh mạch nở rộng, linh khí chảy thông suốt hơn trước.',
      'Đan điền ấm áp — linh khí tích tụ ngày một nhiều hơn.',
      'Thân thể nhẹ nhàng, tinh thần sáng suốt. Trung kỳ viên mãn.',
      'Linh khí dày đặc trong huyết mạch — hậu kỳ bắt đầu.',
      'Từng tế bào thấm đẫm linh khí. Sức mạnh vượt xa phàm nhân.',
      'Luyện Khí hậu kỳ viên mãn. Linh khí chực chờ chuyển hóa thành dịch.',
    ],
    realmBreakthroughText: 'Luyện Khí viên mãn! Linh khí trong thân thể như thủy triều dâng — sẵn sàng đột phá Trúc Cơ, hóa khí thành dịch.',
  },
  {
    id: 'truc_co',
    name: 'Trúc Cơ',
    lifespan: 200,
    lifespanCap: 240,
    nameCN: '築基',
    stages: 4,
    // Linh lực chuyển hóa từ khí sang dịch — đặc, lỏng, có trọng lượng
    // Không còn là "tích lũy thêm" mà là "nén chặt và tinh luyện"
    stageNames: ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ', 'Viên Mãn'],
    qiBase: 2000,
    qiScaling: 2.5,
    rate: 0.3,
    purityRateFactor: 0.5,
    // Purity ở TC khó hơn LK nhiều — dịch thể không dễ tinh luyện như khí
    // ⚠ Cần playtesting
    purityThresholds: [
      // Calibrated Session 10 — dùng LK làm anchor (duty cycle 1.5% bế quan):
      // Target: Tam LC tán tu (Linh Địa, hạ phẩm) xong TC ở tuổi ~165/200
      //         Tam LC tông môn (Phúc Địa, trung phẩm) xong TC ở tuổi ~140
      //         Song LC tông môn (Bảo Địa, thượng phẩm) xong TC ở tuổi ~123
       1100,   // TC Sơ Kỳ
       3081,   // TC Trung Kỳ
       8625,   // TC Hậu Kỳ
      24151,   // TC Viên Mãn — vách ngăn lớn trước Kim Đan
    ],
    // Phải đột phá KĐ trước khi 150 năm trôi qua trong TC (tương đương tuổi 160 thực)
    breakthroughAgeLimitToNext: 150,
    atk: 60, def: 30, hp: 400,
    emoji: '🌀',
    color: '#c8a84b',
    fate: 'Linh căn khai mở, đạo tâm kiên định',
    breakthroughText: [
      'Nền móng tu tiên được đặt vững chắc như bàn thạch.',
      'Dịch thể linh lực chảy âm ỉ qua kinh mạch, mạnh hơn gấp bội.',
      'Trúc Cơ hậu kỳ — dịch thể gần như bão hòa, sắp ngưng tụ thành đan.',
      'Trúc Cơ viên mãn! Toàn bộ dịch thể linh lực đang chực nén lại...',
    ],
    realmBreakthroughText: 'Trúc Cơ viên mãn! Dịch thể linh lực nén chặt, ánh vàng bắt đầu le lói trong đan điền — Kim Đan sắp hình thành!',
  },
  {
    id: 'kim_dan',
    name: 'Kim Đan',
    lifespan: 500,
    lifespanCap: 600,
    nameCN: '金丹',
    stages: 4,
    // Dịch thể linh lực nén thành viên kim đan trong đan điền
    // Không còn "tích lũy" — mà là "nén chặt không ngừng"
    // Kim đan càng đặc, áp lực lên đan điền càng lớn
    stageNames: ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ', 'Viên Mãn'],
    qiBase: 20000,
    qiScaling: 2.5,
    rate: 1.2,
    purityRateFactor: 0.5,
    // Ở Kim Đan, "Thuần Độ" thực chất là độ đặc của kim đan
    // Nén kim đan từ mức sơ kỳ lên viên mãn là hành trình cực kỳ dài
    // ⚠ Cần playtesting
    purityThresholds: [
      // Calibrated Session 10 — dùng LK làm anchor (duty cycle 1.5% bế quan):
      // Target: Tam LC tán tu (Linh Địa, hạ phẩm) xong KĐ ở tuổi ~375/500
      //         Tam LC tông môn (Phúc Địa, trung phẩm) xong KĐ ở tuổi ~258
      //         Song LC tông môn (Bảo Địa, thượng phẩm) xong KĐ ở tuổi ~177
       11570,   // KĐ Sơ Kỳ
       40495,   // KĐ Trung Kỳ
      141734,   // KĐ Hậu Kỳ
      496069,   // KĐ Viên Mãn — vách ngăn khổng lồ trước Nguyên Anh
    ],
    // Phải đột phá NA trước 250 năm trong KĐ (tuổi thực ~410)
    breakthroughAgeLimitToNext: 250,
    atk: 300, def: 150, hp: 2000,
    emoji: '⚡',
    color: '#f0d47a',
    fate: 'Kim đan ngưng tụ, vượt thoát phàm thai',
    breakthroughText: [
      'Kim đan xoay vòng trong đan điền, tỏa ánh hào quang nhỏ.',
      'Sức nén tăng lên — kim đan đặc hơn, áp lực trong đan điền lớn dần.',
      'Kim đan hậu kỳ — từng phân tử linh lực bị ép chặt không thoát ra được.',
      'Kim Đan viên mãn! Viên đan gần như hoàn hảo — nguyên anh đang cựa quậy bên trong.',
    ],
    realmBreakthroughText: 'Kim Đan toái vỡ! Nguyên Anh phá kén, xuất thế — một sinh linh nhỏ mang ngoại hình của ngươi hiện ra trong đan điền!',
  },
  {
    id: 'nguyen_anh',
    name: 'Nguyên Anh',
    lifespan: 1000,
    lifespanCap: 1200,
    nameCN: '元嬰',
    stages: 4,
    // Nguyên Anh là hài nhi linh lực mang ngoại hình của chủ nhân
    // Không còn "tích lũy vào thân xác" — mà nuôi dưỡng một sinh linh khác
    // Nguyên Anh lớn dần, mạnh dần, đến khi có thể xuất thể tự do
    stageNames: ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ', 'Viên Mãn'],
    qiBase: 150000,
    qiScaling: 3.0,
    rate: 3.6,
    purityRateFactor: 0.5,
    // "Thuần Độ" ở NA = mức độ trưởng thành và ổn định của Nguyên Anh
    // Nguyên Anh trưởng thành cực kỳ chậm — không thể cưỡng cầu
    // ⚠ Cần playtesting — đây là cảnh giới rất hiếm người đạt được
    purityThresholds: [
      // Calibrated Session 10 — dùng LK làm anchor (duty cycle 1.5% bế quan):
      // Target: Tam LC tán tu (Linh Địa, hạ phẩm) xong NA ở tuổi ~720/1000
      //         Tam LC tông môn (Phúc Địa, trung phẩm) xong NA ở tuổi ~528
      //         Song LC tông môn (Bảo Địa, thượng phẩm) xong NA ở tuổi ~394
        40001,   // NA Sơ Kỳ
       160003,   // NA Trung Kỳ
       640013,   // NA Hậu Kỳ
      2560052,   // NA Viên Mãn — cực kỳ khó, chỉ 1/1000 người chơi có thể đạt
    ],
    // Phải đột phá HT trước 350 năm trong NA (tuổi thực ~700)
    breakthroughAgeLimitToNext: 350,
    atk: 1200, def: 600, hp: 10000,
    emoji: '🔥',
    color: '#e05c1a',
    fate: 'Nguyên anh xuất thế, thần thức thiên lý',
    breakthroughText: [
      'Nguyên Anh nhỏ bé trong đan điền — đôi mắt nó nhìn ngươi, trong vắt.',
      'Nguyên Anh lớn dần, linh trí mở rộng. Thần thức có thể cảm nhận xa hơn.',
      'Nguyên Anh hậu kỳ — đôi khi nó xuất thể ngắn, du ngoạn quanh nơi tu luyện.',
      'Nguyên Anh viên mãn! Nó gần như độc lập — sẵn sàng hợp nhất với thiên đạo.',
    ],
    realmBreakthroughText: 'Nguyên Anh đại thành! Thần thức hòa làm một với thiên địa — bước vào Hóa Thần, thần thức khai mở vô hạn!',
  },
  {
    id: 'hoa_than',
    name: 'Hóa Thần',
    lifespan: 2000,
    lifespanCap: 2400,
    nameCN: '化神',
    stages: 4,
    // Thần thức khai mở — không còn giới hạn trong thể xác
    // Mỗi tầng là một lần thần thức mở rộng thêm, chạm đến biên giới mới của vũ trụ
    stageNames: ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ', 'Viên Mãn'],
    qiBase: 1000000,
    qiScaling: 3.5,
    rate: 10.8,
    purityRateFactor: 0.5,
    // Hóa Thần là đỉnh của Nhân Giới — phi thăng lên Linh Giới
    // ⚠ Chỉ những người chơi cực kỳ hiếm có thể đạt đến đây
    purityThresholds: [
      50000000,    // HT Sơ Kỳ
      250000000,   // HT Trung Kỳ
      1200000000,  // HT Hậu Kỳ
      6000000000,  // HT Viên Mãn — đỉnh Nhân Giới, chuẩn bị phi thăng
    ],
    breakthroughAgeLimitToNext: null, // HT là đỉnh Nhân Giới — không có giới hạn tuổi
    atk: 5000, def: 2500, hp: 50000,
    emoji: '✨',
    color: '#a89df5',
    fate: 'Hóa thần nhập đạo, thiên nhân cảm ứng',
    breakthroughText: [
      'Thần thức mở rộng — ngươi cảm nhận được linh khí trong toàn bộ đại lục.',
      'Mỗi hơi thở hòa nhịp với thiên địa. Sự tồn tại của ngươi trở thành một phần của vũ trụ.',
      'Hóa Thần hậu kỳ — ranh giới giữa ngươi và thiên đạo mờ dần.',
      'Hóa Thần viên mãn! Nhân Giới đã không còn giới hạn được ngươi. Linh Giới đang chờ.',
    ],
    realmBreakthroughText: 'PHI THĂNG! Thân ngươi hòa tan vào luồng linh khí — Linh Giới đón nhận một tu sĩ đã vượt qua tất cả giới hạn của Nhân Giới.',
  },
  {
    id: 'luyen_hu',
    name: 'Luyện Hư',
    lifespan: 5000,
    lifespanCap: 6000,
    nameCN: '煉虛',
    stages: 3,
    qiBase: 8000000,
    qiScaling: 4.0,
    rate: 500,
    atk: 20000, def: 10000, hp: 200000,
    emoji: '💫',
    color: '#56e8be',
    fate: 'Hư không hợp đạo, siêu xuất tam giới',
    breakthroughText: [
      'Hư không trở thành ngôi nhà thứ hai.',
      'Pháp lực vô biên, một chiêu có thể xóa núi lấp biển.',
      'Đứng ở đỉnh cao nhìn xuống, vạn linh như kiến.',
    ],
    realmBreakthroughText: 'Luyện Hư đại thành! Hợp Thể chi cảnh — thân thể và thiên địa hợp nhất thành một!',
  },
  {
    id: 'hop_the',
    name: 'Hợp Thể',
    lifespan: 10000,
    lifespanCap: 12000,
    nameCN: '合體',
    stages: 3,
    qiBase: 60000000,
    qiScaling: 5.0,
    rate: 1500,
    atk: 80000, def: 40000, hp: 1000000,
    emoji: '🌌',
    color: '#6fc3f0',
    fate: 'Thiên địa hợp nhất, vạn đạo quy tông',
    breakthroughText: [
      'Thân và trời đất hòa làm một, không còn phân biệt ta và vũ trụ.',
      'Đại thừa chi cảnh hiện ra trước mắt.',
      'Cánh cửa cuối cùng của tu tiên đang mở.',
    ],
    realmBreakthroughText: 'Hợp Thể đại thành! Đại Thừa — đứng trước ngưỡng cửa thành tiên!',
  },
  {
    id: 'dai_thua',
    name: 'Đại Thừa',
    lifespan: 999999,     // Vô hạn — gần thành tiên
    lifespanCap: 999999,
    nameCN: '大乘',
    stages: 1,
    qiBase: 500000000,
    qiScaling: 1,
    rate: 5000,
    atk: 300000, def: 150000, hp: 5000000,
    emoji: '☀',
    color: '#ffe9a0',
    fate: 'Thành tiên tại vọng, vĩnh hằng bất tử',
    breakthroughText: [
      'Đại Thừa viên mãn. Thành tiên chỉ còn trong gang tấc.',
      'Ánh hào quang tỏa ra từ thân thể, thiên địa rung chuyển.',
      'Vĩnh hằng... bất tử... đây là điểm đến cuối cùng.',
    ],
    realmBreakthroughText: 'THÀNH TIÊN! Bạn đã vượt qua vòng luân hồi, đạt đến cảnh giới bất tử vĩnh hằng!',
  },
];

export const SPIRIT_ROOTS = [
  {
    id: 'jin',
    name: 'Kim Linh Căn',
    element: 'Kim',
    color: '#f0d47a',
    rarity: 'hiếm',
    emoji: '⚔',
    bonus: { atkPct: 20, ratePct: 0 },
    desc: 'Thiên phú về kiếm đạo. Luyện kiếm nhanh gấp đôi người thường.',
    prophecy: 'Kiếm khí xuyên vân, một thân kiếm đạo vạn ma bất xâm. Ngươi sinh ra đã mang theo sát khí — con đường của ngươi là kiếm tiên.',
    favored: ['kiem_tong'],
  },
  {
    id: 'mu',
    name: 'Mộc Linh Căn',
    element: 'Mộc',
    color: '#56c46a',
    rarity: 'thường',
    emoji: '🌿',
    bonus: { hpPct: 30, ratePct: 5 },
    desc: 'Sinh cơ vô hạn. Hồi phục nhanh, sức bền vượt trội.',
    prophecy: 'Cây xanh bất tử, sinh cơ vô tận. Ngươi như cây cổ thụ ngàn năm — bền bỉ, trường tồn, cuối cùng sẽ che bóng cả thiên hạ.',
    favored: ['the_tu'],
  },
  {
    id: 'shui',
    name: 'Thủy Linh Căn',
    element: 'Thủy',
    color: '#3a9fd5',
    rarity: 'thường',
    emoji: '💧',
    bonus: { ratePct: 25, defPct: 10 },
    desc: 'Nhu nhược thắng cương mạnh. Tốc độ tu luyện vượt trội.',
    prophecy: 'Nước chảy không ngừng, mềm mà thắng cứng. Con đường của ngươi dài và bền — chậm mà chắc, cuối cùng vượt qua tất cả.',
    favored: ['dan_tong'],
  },
  {
    id: 'huo',
    name: 'Hỏa Linh Căn',
    element: 'Hỏa',
    color: '#e05c1a',
    rarity: 'hiếm',
    emoji: '🔥',
    bonus: { atkPct: 15, danBonus: 30 },
    desc: 'Lửa thiêng đốt thiên. Luyện đan tốt nhất, công kích mạnh mẽ.',
    prophecy: 'Lửa thiêng đốt thiên, đan lò trăm luyện thành thánh đan đạo. Ngươi mang ngọn lửa của tạo hóa — dùng nó để luyện vạn vật.',
    favored: ['dan_tong'],
  },
  {
    id: 'tu',
    name: 'Thổ Linh Căn',
    element: 'Thổ',
    color: '#a07850',
    rarity: 'thường',
    emoji: '🗿',
    bonus: { defPct: 40, hpPct: 20 },
    desc: 'Vững như núi Thái Sơn. Phòng thủ và HP vượt trội mọi loại căn.',
    prophecy: 'Thổ trầm hậu đức, vạn vật quy về đất. Ngươi như đại địa — không ai có thể lay chuyển, tất cả đều phải dựa vào ngươi.',
    favored: ['tran_phap'],
  },
  {
    id: 'yin_yang',
    name: 'Âm Dương Linh Căn',
    element: 'Âm Dương',
    color: '#c8a84b',
    rarity: 'cực hiếm',
    emoji: '☯',
    bonus: { atkPct: 10, defPct: 10, ratePct: 10, hpPct: 10 },
    desc: 'Âm dương điều hòa — toàn năng nhất trong các loại linh căn.',
    prophecy: 'Âm dương hội tụ, vạn đạo quy nhất. Ngươi là kẻ hiếm có trong ngàn năm — không thiên lệch, không giới hạn. Tiên đạo của ngươi chưa được định hình.',
    favored: ['kiem_tong', 'dan_tong', 'tran_phap', 'the_tu'],
  },
  {
    id: 'hun',
    name: 'Hỗn Nguyên Linh Căn',
    element: 'Hỗn Nguyên',
    color: '#7b68ee',
    rarity: 'huyền thoại',
    emoji: '🌌',
    bonus: { atkPct: 25, defPct: 25, ratePct: 25, hpPct: 25 },
    desc: 'Linh căn của thiên mệnh. Xuất hiện một lần trong vạn năm.',
    prophecy: 'Hỗn nguyên khai thiên, vạn đạo hội tụ. Từ khi ngươi ra đời, thiên địa đã run rẩy. Đây không phải may mắn — đây là số phận.',
    favored: ['kiem_tong', 'dan_tong', 'tran_phap', 'the_tu'],
  },
];

export const SECTS = [
  {
    id: 'kiem_tong',
    name: 'Thanh Vân Kiếm Tông',
    nameCN: '青雲劍宗',
    emoji: '⚔',
    element: 'Kim',
    desc: 'Đệ nhất kiếm tông đại lục. Một kiếm phá vạn pháp.',
    lore: 'Thanh Vân Kiếm Tông lập môn ba ngàn năm, kiếm ý truyền đời. Tổ sư là Thanh Vân Kiếm Tiên, người đã dùng một kiếm chém núi Thái Hư.',
    bonus: { atkPct: 25, ratePct: 10 },
    bonusDesc: '+25% công kích · +10% tốc độ tu luyện',
    color: '#c8a84b',
    favored: ['jin'],
  },
  {
    id: 'dan_tong',
    name: 'Vạn Linh Đan Tông',
    nameCN: '萬靈丹宗',
    emoji: '⚗',
    element: 'Hỏa/Thủy',
    desc: 'Đứng đầu về luyện đan. Đan dược có thể đổi lấy mọi thứ.',
    lore: 'Vạn Linh Đan Tông nắm giữ bí quyết luyện đan thất phẩm. Đan sư ở đây được cả cõi tu tiên kính trọng. Tiền không mua được, chỉ có thể đổi bằng đan.',
    bonus: { danBonus: 50, ratePct: 15 },
    bonusDesc: '+50% hiệu quả đan dược · +15% tốc độ tu luyện',
    color: '#e05c1a',
    favored: ['huo', 'shui'],
  },
  {
    id: 'tran_phap',
    name: 'Huyền Cơ Các',
    nameCN: '玄機閣',
    emoji: '🔮',
    element: 'Thổ',
    desc: 'Trận pháp vô địch. Một trận có thể nhốt thiên hạ.',
    lore: 'Huyền Cơ Các giữ trong tay 3600 đại trận, trong đó có Chu Thiên Tinh Đấu Đại Trận có thể giam giữ cả Nguyên Anh cường giả.',
    bonus: { defPct: 30, stoneBonus: 0.5 },
    bonusDesc: '+30% phòng thủ · +0.5 linh lực/s thụ động',
    color: '#7b68ee',
    favored: ['tu'],
  },
  {
    id: 'the_tu',
    name: 'Thiết Cốt Môn',
    nameCN: '鐵骨門',
    emoji: '💪',
    element: 'Mộc/Thổ',
    desc: 'Thể tu số một. Thân thể vững hơn pháp bảo thượng phẩm.',
    lore: 'Thiết Cốt Môn chuyên về thể tu — luyện thân thể trở thành pháp bảo. Đệ tử môn này không cần vũ khí, tay không cũng có thể đánh vỡ Kim Đan.',
    bonus: { hpPct: 50, defPct: 20 },
    bonusDesc: '+50% HP tối đa · +20% phòng thủ',
    color: '#a07850',
    favored: ['mu', 'tu'],
  },
];

export const SKILLS = [
  // Tier 1 — unlock at realm 0
  { id: 'qi_control',   name: 'Ngự Khí Thuật',    nameCN: '御氣術',   emoji: '🌬', tier: 1, maxLv: 5, unlockRealm: 0, costBase: 50,  costScale: 3,  stat: 'qiBonus',   perLv: 1,    unit: '/s',  desc: 'Kiểm soát linh khí nhuần nhuyễn hơn, tốc độ tích lũy tăng.' },
  { id: 'body_refine',  name: 'Thể Tôi Quyết',    nameCN: '體淬訣',   emoji: '💪', tier: 1, maxLv: 5, unlockRealm: 0, costBase: 80,  costScale: 3,  stat: 'hpBonus',   perLv: 50,   unit: 'HP',  desc: 'Tôi luyện thể xác, tăng cường sức chịu đựng.' },
  { id: 'swift_step',   name: 'Tốc Hành Công',    nameCN: '速行功',   emoji: '💨', tier: 1, maxLv: 5, unlockRealm: 0, costBase: 100, costScale: 3,  stat: 'spdBonus',  perLv: 0.15, unit: 'x',   desc: 'Vận khí gia tốc, mọi hành động đều nhanh hơn.' },
  // Tier 2 — unlock at realm 1
  { id: 'sword_heart',  name: 'Kiếm Tâm Quyết',   nameCN: '劍心訣',   emoji: '⚔', tier: 2, maxLv: 5, unlockRealm: 1, costBase: 200, costScale: 4,  stat: 'atkPct',    perLv: 15,   unit: '%',   desc: 'Kiếm tâm thuần tịnh, công kích tăng mạnh.' },
  { id: 'alchemy_fire', name: 'Đan Hỏa Thuật',    nameCN: '丹火術',   emoji: '⚗', tier: 2, maxLv: 5, unlockRealm: 1, costBase: 250, costScale: 4,  stat: 'danBonus',  perLv: 20,   unit: '%',   desc: 'Kiểm soát hỏa lực khi luyện đan, hiệu quả tăng vọt.' },
  { id: 'iron_defense', name: 'Thiết Giáp Công',  nameCN: '鐵甲功',   emoji: '🛡', tier: 2, maxLv: 5, unlockRealm: 1, costBase: 300, costScale: 4,  stat: 'defBonus',  perLv: 20,   unit: 'DEF', desc: 'Luyện da thịt như sắt thép, phòng thủ bất phá.' },
  // Tier 3 — unlock at realm 2
  { id: 'array_master', name: 'Trận Pháp Tinh Thông', nameCN: '陣法精通', emoji: '🔮', tier: 3, maxLv: 5, unlockRealm: 2, costBase: 800, costScale: 5,  stat: 'arrayBonus',perLv: 30,   unit: '%',   desc: 'Tinh thông trận pháp, uy lực tăng gấp bội.' },
  { id: 'spirit_sense', name: 'Thần Thức Thuật',  nameCN: '神識術',   emoji: '👁', tier: 3, maxLv: 5, unlockRealm: 2, costBase: 1000,costScale: 5,  stat: 'expBonus',  perLv: 20,   unit: '%',   desc: 'Thần thức mở rộng, tiếp thu kiến thức nhanh hơn.' },
  { id: 'heaven_eye',   name: 'Thiên Nhãn Thuật', nameCN: '天眼術',   emoji: '🌟', tier: 3, maxLv: 3, unlockRealm: 3, costBase: 3000,costScale: 6,  stat: 'stoneBonus',perLv: 2,    unit: '/s',  desc: 'Mở thiên nhãn, nhìn thấu linh khí ẩn trong vạn vật.' },
];

export const ITEMS = [
  // ---- Lương Thực (chỉ cần ở LK) ----
  {
    id: 'linh_me', name: 'Linh Mễ', nameCN: '靈米', emoji: '🌾',
    cost: 5, costTier: '💎 Hạ', rarity: 'thường', unlockRealm: 0,
    type: 'food', action: 'eat_linh_me', val: 1,
    desc: 'Gạo chứa linh khí — lương thực cơ bản của tu sĩ LK. Ăn 1 phần mỗi 2 ngày game.',
    effect: 'Hết đói 2 ngày | +8% tốc tu luyện 2 ngày',
    shopCategory: 'food',
  },
  {
    id: 'linh_me_seed', name: 'Hạt Linh Mễ', nameCN: '靈米種', emoji: '🫘',
    cost: 15, costTier: '💎 Hạ', rarity: 'thường', unlockRealm: 0,
    type: 'seed', action: 'seed', val: 1,
    desc: 'Hạt giống Linh Mễ để trồng trong Dược Điền. Thu hoạch sẽ trả lại 2 hạt.',
    effect: 'Gieo vào ô Dược Điền → 5 ngày → 8-12 Linh Mễ',
    shopCategory: 'food',
  },
  {
    id: 'ich_coc_dan', name: 'Ích Cốc Đan', nameCN: '益穀丹', emoji: '💊',
    cost: 280, costTier: '💎 Hạ', rarity: 'hiếm', unlockRealm: 0,
    type: 'consume', action: 'ich_coc_dan', val: 30,
    desc: 'Đan dược đặc biệt — 1 viên đảm bảo no trong 30 ngày game, không cần lo lương thực.',
    effect: 'Hết đói 30 ngày game (không buff qi)',
    shopCategory: 'food',
  },

  // ---- Realm 0 — Luyện Khí ----
  { id: 'lingrong',     name: 'Linh Dung Thảo',    nameCN: '靈蓉草',  emoji: '🌿',  cost: 80,   costTier:'💎 Hạ',    rarity: 'thường',    unlockRealm: 0, type: 'consume', action: 'hp',      val: 100,  desc: 'Thảo dược linh phẩm, hồi phục thể lực.',               effect: '+100 HP tức thì' },
  { id: 'linghidan',    name: 'Linh Khí Đan',      nameCN: '靈氣丹',  emoji: '⚗',  cost: 120,  costTier:'💎 Hạ',    rarity: 'thường',    unlockRealm: 0, type: 'consume', action: 'qi',      val: 80,   desc: 'Đan dược sơ phẩm, kết tinh linh khí thiên địa.',       effect: '+80 linh lực tức thì' },
  { id: 'stamina_pill', name: 'Khí Lực Đan',       nameCN: '氣力丹',  emoji: '💊',  cost: 60,   costTier:'💎 Hạ',    rarity: 'thường',    unlockRealm: 0, type: 'consume', action: 'stamina', val: 50,   desc: 'Đan dược hồi phục thể năng cơ bản.',                   effect: '+50 thể năng tức thì' },

  // ---- Realm 1 — Trúc Cơ ----
  { id: 'peilingdan',   name: 'Bồi Linh Đan',      nameCN: '培靈丹',  emoji: '💊',  cost: 500,  costTier:'💎 Hạ',    rarity: 'hiếm',      unlockRealm: 1, type: 'consume', action: 'rate',    val: 1.5,  desc: 'Trung phẩm đan dược, tăng vĩnh viễn tốc độ tu luyện.', effect: '+1.5 linh lực/s mãi mãi' },
  { id: 'jujingshi',    name: 'Tụ Linh Thạch',     nameCN: '聚靈石',  emoji: '💠',  cost: 800,  costTier:'💎 Hạ',    rarity: 'hiếm',      unlockRealm: 1, type: 'passive', action: 'rate',    val: 2.0,  desc: 'Linh thạch thiên nhiên tích lũy linh khí không ngừng.', effect: '+2.0 linh lực/s vĩnh viễn' },
  { id: 'feisword',     name: 'Phi Kiếm Phù',      nameCN: '飛劍符',  emoji: '🗡',  cost: 1200, costTier:'💎 Hạ',    rarity: 'hiếm',      unlockRealm: 1, type: 'passive', action: 'atkPct',  val: 25,   desc: 'Cổ phù lưu lại từ tiền nhân kiếm tu vô song.',         effect: '+25% công kích vĩnh viễn' },

  // ---- Realm 2 — Kim Đan ----
  { id: 'tianlingdan',  name: 'Thiên Linh Đan',    nameCN: '天靈丹',  emoji: '🌟',  cost: 50,   costTier:'💠 Trung', rarity: 'cực hiếm',  unlockRealm: 2, type: 'consume', action: 'qi',      val: 1000, desc: 'Thiên phẩm đan dược, linh khí sung mãn.',               effect: '+1000 linh lực tức thì' },
  { id: 'shouyuanzhu',  name: 'Thọ Nguyên Châu',   nameCN: '壽元珠',  emoji: '🔴',  cost: 100,  costTier:'💠 Trung', rarity: 'cực hiếm',  unlockRealm: 2, type: 'passive', action: 'hpPct',   val: 50,   desc: 'Ngọc linh vật kéo dài thọ nguyên, thể lực dồi dào.',   effect: '+50% HP tối đa vĩnh viễn' },
  { id: 'jinchan_dan',  name: 'Kim Thiền Đan',     nameCN: '金蟬丹',  emoji: '🟡',  cost: 80,   costTier:'💠 Trung', rarity: 'cực hiếm',  unlockRealm: 2, type: 'passive', action: 'defPct',  val: 30,   desc: 'Đan dược từ xác Kim Thiền ngàn năm, tăng phòng ngự.',   effect: '+30% phòng ngự vĩnh viễn' },

  // ---- Realm 3 — Nguyên Anh ----
  { id: 'shenbingling', name: 'Thần Binh Lệnh',    nameCN: '神兵令',  emoji: '⚜',  cost: 200,  costTier:'💠 Trung', rarity: 'huyền thoại', unlockRealm: 3, type: 'timed',  action: 'atkBuff', val: 150,  desc: 'Thần binh bí lệnh — pháp lực bạo phát 60 giây.',       effect: '+150% ATK trong 60s' },
  { id: 'tiandi_jing',  name: 'Thiên Địa Tinh',    nameCN: '天地晶',  emoji: '🔷',  cost: 300,  costTier:'💠 Trung', rarity: 'huyền thoại', unlockRealm: 3, type: 'passive', action: 'ratePct', val: 20,   desc: 'Tinh thể kết tụ linh khí thiên địa trải qua vạn năm.', effect: '+20% tốc độ tu luyện vĩnh viễn' },
  { id: 'yuan_ying_dan',name: 'Nguyên Anh Đan',    nameCN: '元嬰丹',  emoji: '🥚',  cost: 500,  costTier:'💠 Trung', rarity: 'huyền thoại', unlockRealm: 3, type: 'consume', action: 'exp',     val: 5000, desc: 'Đan dược nuôi dưỡng Nguyên Anh, kinh nghiệm bùng nổ.', effect: '+5000 EXP tức thì' },

  // ---- Realm 4 — Hóa Thần ----
  { id: 'huashen_jing', name: 'Hóa Thần Tinh',     nameCN: '化神晶',  emoji: '💎',  cost: 800,  costTier:'💠 Trung', rarity: 'huyền thoại', unlockRealm: 4, type: 'passive', action: 'atkPct',  val: 50,   desc: 'Tinh hoa cảnh Hóa Thần, tăng mạnh công kích.',         effect: '+50% ATK vĩnh viễn' },
  { id: 'lifespan_zhu', name: 'Diên Thọ Châu',     nameCN: '延壽珠',  emoji: '🟠',  cost: 600,  costTier:'💠 Trung', rarity: 'huyền thoại', unlockRealm: 4, type: 'passive', action: 'lifespan', val: 50,  desc: 'Châu báu hiếm có kéo dài tuổi thọ thêm 50 năm.',       effect: '+50 năm tuổi thọ' },

  // ---- Lò Đan (mua trong shop, type: furnace) ----
  { id: 'lo_dan_1',  name: 'Lò Đan Thô',     nameCN: '初級丹爐', emoji: '🔥', cost: 200,  costTier:'💎 Hạ',    rarity: 'thường',    unlockRealm: 0, type: 'furnace', action: 'buyFurnace', val: 1, desc: 'Lò đất nung thô sơ, dùng được khi mới bước vào con đường luyện đan.', effect: 'Mở khóa Luyện Đan' },
  { id: 'lo_dan_2',  name: 'Lò Đan Đồng',    nameCN: '銅丹爐',   emoji: '🔥', cost: 500,  costTier:'💎 Hạ',    rarity: 'hiếm',      unlockRealm: 0, type: 'furnace', action: 'buyFurnace', val: 2, desc: 'Lò đồng linh được khắc trận pháp sơ cấp, tỉ lệ thành công cao hơn.', effect: '+5% tỉ lệ luyện đan (yêu cầu đã có Lò Cấp 1)' },
  { id: 'lo_dan_3',  name: 'Lò Đan Bạc',     nameCN: '銀丹爐',   emoji: '🔥', cost: 1200, costTier:'💎 Hạ',    rarity: 'cực hiếm',  unlockRealm: 1, type: 'furnace', action: 'buyFurnace', val: 3, desc: 'Lò bạc tinh luyện, ổn định nhiệt độ tốt, giảm thất bại khi luyện đan hiếm.', effect: '+10% tỉ lệ luyện đan (yêu cầu Lò Cấp 2)' },
  { id: 'lo_dan_4',  name: 'Lò Đan Vàng',    nameCN: '金丹爐',   emoji: '🔥', cost: 3000, costTier:'💠 Trung', rarity: 'huyền thoại', unlockRealm: 2, type: 'furnace', action: 'buyFurnace', val: 4, desc: 'Lò vàng thuần khiết khắc trận pháp thượng cổ, luyện đan thượng phẩm không còn khó.', effect: '+15% tỉ lệ luyện đan (yêu cầu Lò Cấp 3)' },
  { id: 'lo_dan_5',  name: 'Lò Đan Cửu Tiên', nameCN: '九仙丹爐', emoji: '🔥', cost: 8000, costTier:'💠 Trung', rarity: 'huyền thoại', unlockRealm: 3, type: 'furnace', action: 'buyFurnace', val: 5, desc: 'Lò Cửu Tiên đệ nhất luyện đan vật — huyền thoại trong giới tu tiên.', effect: '+20% tỉ lệ luyện đan (yêu cầu Lò Cấp 4)' },

  // ---- Bễ Rèn (mua trong shop, type: forge_furnace) ----
  { id:'bei_ren_1', name:'Bễ Rèn Đất',      nameCN:'土鍛爐', emoji:'⚒', cost:250,  costTier:'💎 Hạ',    rarity:'thường',      unlockRealm:0, type:'forge_furnace', val:1, desc:'Bễ rèn đất nung thô sơ, dùng rèn pháp bảo sơ cấp.',                effect:'Mở khóa Luyện Khí Sư (8 lần rèn)' },
  { id:'bei_ren_2', name:'Bễ Rèn Đồng',     nameCN:'銅鍛爐', emoji:'⚒', cost:600,  costTier:'💎 Hạ',    rarity:'hiếm',        unlockRealm:0, type:'forge_furnace', val:2, desc:'Bễ đồng khắc trận pháp sơ cấp, bền hơn và tỷ lệ rèn cao hơn.',   effect:'+5% tỷ lệ rèn, 15 lần (cần Bễ Rèn Cấp 1)' },
  { id:'bei_ren_3', name:'Bễ Rèn Thiết',    nameCN:'鐵鍛爐', emoji:'⚒', cost:1500, costTier:'💎 Hạ',    rarity:'cực hiếm',    unlockRealm:1, type:'forge_furnace', val:3, desc:'Bễ thiết linh, ổn định nhiệt cao, giảm thất bại pháp bảo hiếm.',  effect:'+10% tỷ lệ rèn, 25 lần (cần Bễ Rèn Cấp 2)' },
  { id:'bei_ren_4', name:'Bễ Rèn Ngân',     nameCN:'銀鍛爐', emoji:'⚒', cost:3500, costTier:'💠 Trung', rarity:'huyền thoại', unlockRealm:2, type:'forge_furnace', val:4, desc:'Bễ ngân thuần khiết, trận pháp thượng cổ khắc lên, rèn thượng phẩm.',effect:'+18% tỷ lệ rèn, 40 lần (cần Bễ Rèn Cấp 3)' },
  { id:'bei_ren_5', name:'Bễ Rèn Tiên Kim', nameCN:'仙金鍛爐',emoji:'⚒', cost:9000, costTier:'💠 Trung', rarity:'huyền thoại', unlockRealm:3, type:'forge_furnace', val:5, desc:'Bễ Tiên Kim đệ nhất — truyền thuyết của giới rèn bảo.',            effect:'+28% tỷ lệ rèn, 60 lần (cần Bễ Rèn Cấp 4)' },

  // ---- Bếp Linh Thực (type: kitchen) ----
  { id:'bep_lt_1', name:'Bếp Đất Linh',    nameCN:'土靈廚', emoji:'🍳', cost:200,  costTier:'💎 Hạ',    rarity:'thường',      unlockRealm:0, type:'kitchen', val:1, desc:'Bếp đất linh cơ bản, bắt đầu hành trình linh thực.',         effect:'Mở khóa Linh Thực Sư (10 lần nấu)' },
  { id:'bep_lt_2', name:'Bếp Đồng Linh',   nameCN:'銅靈廚', emoji:'🍳', cost:550,  costTier:'💎 Hạ',    rarity:'hiếm',        unlockRealm:0, type:'kitchen', val:2, desc:'Bếp đồng khắc trận giữ nhiệt, tỷ lệ nấu cao hơn.',          effect:'+5% tỷ lệ, 18 lần (cần Bếp Cấp 1)' },
  { id:'bep_lt_3', name:'Bếp Ngân Linh',   nameCN:'銀靈廚', emoji:'🍳', cost:1400, costTier:'💎 Hạ',    rarity:'cực hiếm',    unlockRealm:1, type:'kitchen', val:3, desc:'Bếp ngân linh điều tiết lửa hoàn hảo, nấu linh thực cao cấp.',effect:'+10% tỷ lệ, 30 lần (cần Bếp Cấp 2)' },
  { id:'bep_lt_4', name:'Bếp Ngọc Thiên',  nameCN:'玉天廚', emoji:'🍳', cost:3200, costTier:'💠 Trung', rarity:'huyền thoại', unlockRealm:2, type:'kitchen', val:4, desc:'Bếp ngọc từ thiên địa, lửa linh thiêng không tắt.',          effect:'+18% tỷ lệ, 45 lần (cần Bếp Cấp 3)' },
  { id:'bep_lt_5', name:'Bếp Tiên Hỏa',   nameCN:'仙火廚', emoji:'🍳', cost:8500, costTier:'💠 Trung', rarity:'huyền thoại', unlockRealm:3, type:'kitchen', val:5, desc:'Bếp Tiên Hỏa truyền thuyết — nấu tiên thực không có đối thủ.', effect:'+28% tỷ lệ, 70 lần (cần Bếp Cấp 4)' },
];

export const WORLD_EVENTS = [
  { id: 'lei_jie',   name: 'Thiên Lôi Kiếp',     emoji: '⚡', desc: 'Thiên đạo vận hành, lôi kiếp giáng xuống! Linh khí dồn dào bất thường. Tốc độ tu luyện +300% trong 45 giây.', reward: 'rate300', dur: 45, rarity: 'epic' },
  { id: 'ling_mai',  name: 'Linh Mạch Phún Phát', emoji: '🌋', desc: 'Linh mạch ngầm phún phát! Linh khí thiên địa tràn ngập. Nhận ngay 800 linh thạch.', reward: 'stone800', dur: 60, rarity: 'rare' },
  { id: 'xing_chen', name: 'Tinh Trần Đổi Ngôi',  emoji: '☄', desc: 'Tinh trần từ thiên ngoại lao xuống, mang theo tinh hoa vũ trụ. Nhận 400 linh lực ngay.', reward: 'qi400', dur: 30, rarity: 'rare' },
  { id: 'wu_xing',   name: 'Ngũ Hành Cộng Minh',  emoji: '🌈', desc: 'Ngũ hành điều hòa hoàn hảo! Kinh nghiệm +500% trong 30 giây.', reward: 'exp500', dur: 30, rarity: 'epic' },
  { id: 'huo_shan',  name: 'Hỏa Linh Sơn Thức Tỉnh', emoji: '🔥', desc: 'Hỏa linh sơn thức tỉnh sau ngàn năm ngủ! HP tối đa +200 vĩnh viễn.', reward: 'maxhp200', dur: 0, rarity: 'epic' },
  { id: 'xian_ji',   name: 'Tiên Cơ Hội Tụ',      emoji: '🌟', desc: 'Tiên khí từ thượng giới rò rỉ xuống hạ giới! Tất cả chỉ số +15% trong 60 giây.', reward: 'all15', dur: 60, rarity: 'legendary' },
];

export const ACHIEVEMENTS = [
  // ---- Đột Phá ----
  { id: 'first_bt',    name: 'Khai Mở Linh Căn',      emoji: '⭐', desc: 'Đột phá lần đầu tiên',                    check: g => g.breakthroughs >= 1 },
  { id: 'bt5',         name: 'Ngũ Đột Chi Lộ',          emoji: '🌟', desc: 'Đột phá 5 lần',                           check: g => g.breakthroughs >= 5 },
  { id: 'bt15',        name: 'Thập Ngũ Cảnh',            emoji: '💫', desc: 'Đột phá 15 lần',                          check: g => g.breakthroughs >= 15 },
  { id: 'bt36',        name: 'Ba Mươi Sáu Tầng Trời',   emoji: '🌠', desc: 'Đột phá 36 lần',                          check: g => g.breakthroughs >= 36 },

  // ---- Cảnh Giới ----
  { id: 'truc_co',     name: 'Trúc Cơ Thành Công',      emoji: '🌀', desc: 'Bước vào cảnh Trúc Cơ',                  check: g => g.realmIdx >= 1 },
  { id: 'kim_dan',     name: 'Kim Đan Đại Đạo',          emoji: '⚡', desc: 'Bước vào cảnh Kim Đan',                   check: g => g.realmIdx >= 2 },
  { id: 'nguyen_anh',  name: 'Nguyên Anh Xuất Thế',     emoji: '🔥', desc: 'Bước vào cảnh Nguyên Anh',                check: g => g.realmIdx >= 3 },
  { id: 'hoa_than',    name: 'Hóa Thần Khai Ngộ',       emoji: '👁', desc: 'Bước vào cảnh Hóa Thần',                  check: g => g.realmIdx >= 4 },

  // ---- Chiến Đấu ----
  { id: 'hunt10',      name: 'Yêu Sát Thần',             emoji: '⚔',  desc: 'Diệt 10 yêu thú',                        check: g => g.hunts >= 10 },
  { id: 'hunt50',      name: 'Vạn Yêu Chi Địch',         emoji: '🗡',  desc: 'Diệt 50 yêu thú',                        check: g => g.hunts >= 50 },
  { id: 'hunt200',     name: 'Đồ Sát Vô Song',           emoji: '💀',  desc: 'Diệt 200 yêu thú',                       check: g => g.hunts >= 200 },
  { id: 'kills500',    name: 'Thiên Sát Chi Danh',       emoji: '☠',   desc: 'Tổng số tiêu diệt đạt 500',              check: g => (g.totalKills || 0) >= 500 },

  // ---- Luyện Đan ----
  { id: 'alchemy10',   name: 'Đan Sư Sơ Cấp',            emoji: '⚗',  desc: 'Luyện đan thành công 10 lần',            check: g => g.alchemySuccess >= 10 },
  { id: 'alchemy50',   name: 'Đan Sư Trung Cấp',         emoji: '🧪',  desc: 'Luyện đan thành công 50 lần',            check: g => g.alchemySuccess >= 50 },
  { id: 'alchemy100',  name: 'Đại Đan Sư',               emoji: '🔮',  desc: 'Luyện đan thành công 100 lần',           check: g => g.alchemySuccess >= 100 },
  { id: 'recipes5',    name: 'Bác Học Đan Đạo',          emoji: '📜',  desc: 'Biết 5 công thức luyện đan',             check: g => (g.alchemy?.knownRecipes?.length || 0) >= 5 },

  // ---- Địa Phủ ----
  { id: 'dungeon1',    name: 'Kẻ Liều Lĩnh',             emoji: '🚪',  desc: 'Vào Địa Phủ lần đầu tiên',              check: g => (g.dungeon?.maxFloorReached || 0) >= 1 },
  { id: 'dungeon5',    name: 'Thám Hiểm Địa Phủ',        emoji: '🕳',  desc: 'Vượt qua tầng 5',                        check: g => (g.dungeon?.maxFloorReached || 0) >= 5 },
  { id: 'dungeon10',   name: 'Chúa Tể Địa Phủ',         emoji: '👹',  desc: 'Chinh phục toàn bộ 10 tầng',             check: g => (g.dungeon?.maxFloorReached || 0) >= 10 },

  // ---- Tông Môn ----
  { id: 'join_sect',   name: 'Tìm Được Chốn Nương Thân', emoji: '🏯',  desc: 'Gia nhập tông môn',                      check: g => !!g.sectId },
  { id: 'sect_rank3',  name: 'Đệ Tử Nội Môn',           emoji: '🎖',  desc: 'Đạt cấp bậc rank 3 trong tông môn',     check: g => (g.sect?.rank || 0) >= 3 },
  { id: 'sect_rank6',  name: 'Trưởng Lão Tông Môn',     emoji: '🏅',  desc: 'Đạt cấp bậc rank 6 trong tông môn',     check: g => (g.sect?.rank || 0) >= 6 },
  { id: 'contrib50',   name: 'Trụ Cột Tông Môn',        emoji: '🤝',  desc: 'Đóng góp 50 lần cho tông môn',          check: g => (g.sect?.totalContributions || 0) >= 50 },

  // ---- Tài Sản ----
  { id: 'rich500',     name: 'Tiểu Phú',                 emoji: '💎',  desc: 'Tích lũy 500 linh thạch',                check: g => g.stone >= 500 },
  { id: 'rich5000',    name: 'Phú Giả Một Phương',       emoji: '💰',  desc: 'Tích lũy 5000 linh thạch',               check: g => g.stone >= 5000 },
  { id: 'rich50000',   name: 'Cự Phú Thiên Hạ',         emoji: '🏆',  desc: 'Tích lũy 50000 linh thạch',              check: g => g.stone >= 50000 },

  // ---- Tuổi Thọ & Thời Gian ----
  { id: 'playtime1h',  name: 'Chuyên Tâm Tu Đạo',       emoji: '⏰',  desc: 'Tu luyện tổng cộng 1 giờ thực',         check: g => g.totalTime >= 3600 },
  { id: 'playtime5h',  name: 'Kiên Trì Bất Bại',        emoji: '⌛',  desc: 'Tu luyện tổng cộng 5 giờ thực',         check: g => g.totalTime >= 18000 },
  { id: 'age100',      name: 'Bách Tuế Thần Tiên',      emoji: '🧓',  desc: 'Đạt 100 tuổi trong game',               check: g => (g.gameTime?.currentYear || 0) >= 100 },
  { id: 'survive_near',name: 'Tử Mà Bất Tử',            emoji: '💀',  desc: 'Còn sống với tuổi thọ dưới 10%',        check: g => {
    if (!g.gameTime) return false;
    const max = (g.gameTime.lifespanMax || 120) + (g.gameTime.lifespanBonus || 0);
    const rem = max - (g.gameTime.currentYear || 0);
    return rem > 0 && rem / max < 0.1;
  }},

  // ---- Đặc Biệt ----
  { id: 'skill3',      name: 'Tam Tài Dị Nhân',         emoji: '✨',  desc: 'Học 3 kỹ năng',                          check: g => g.skillsLearned >= 3 },
  { id: 'quest20',     name: 'Hiệp Nghĩa Hành Giả',     emoji: '📖',  desc: 'Hoàn thành 20 nhiệm vụ',                 check: g => (g.totalQuestsCompleted || 0) >= 20 },
  { id: 'hun_root',    name: 'Thiên Mệnh Chi Tử',       emoji: '🌌',  desc: 'Sở hữu Hỗn Nguyên Linh Căn',            check: g => g.spiritRoot === 'hun' || g.spiritData?.type === 'hun' },
  { id: 'all_elements',name: 'Ngũ Hành Dung Hòa',       emoji: '🌈',  desc: 'Có linh căn Âm Dương hoặc Hỗn Nguyên',  check: g => ['yin_yang','hun'].includes(g.spiritRoot) || ['yin_yang','hun'].includes(g.spiritData?.type) },
];

export const NPC_RIVALS = [
  // Realm 0-1 — đối thủ sớm
  { name: 'Vân Tiêu',      title: 'Thiên Kiếm Truyền Nhân', realmIdx: 0, stage: 5,
    desc: 'Thiên tài bậc nhất Thanh Vân Kiếm Tông. Kiếm ý sắc bén từ nhỏ, luôn ở trước ngươi một bước.' },
  { name: 'Đan Mai',        title: 'Đan Tông Tiểu Thần Đồng', realmIdx: 0, stage: 3,
    desc: 'Đệ tử nhỏ tuổi nhất Vạn Linh Đan Tông. Mê đắm đan đạo đến quên ăn quên ngủ.' },
  { name: 'Thiết Minh',    title: 'Luyện Thể Kỳ Tài',        realmIdx: 1, stage: 1,
    desc: 'Con gái trưởng lão Thiết Cốt Môn, thân thể cứng rắn đáng sợ dù tuổi còn nhỏ.' },

  // Realm 1-2 — đối thủ trung kỳ
  { name: 'Hỏa Linh Nhi',  title: 'Đệ Tử Truyền Nhân',       realmIdx: 1, stage: 4,
    desc: 'Con gái của Đan Tông chủ. Phong độ hơn người, hỏa linh căn thuần túy hiếm có.' },
  { name: 'Huyền Kỳ',      title: 'Trận Pháp Thiên Tài',      realmIdx: 1, stage: 7,
    desc: 'Thiên tài trận pháp của Huyền Cơ Các, nhớ hàng trăm trận văn không sai một chữ.' },
  { name: 'Lăng Phong',    title: 'Kiếm Đạo Mới Nổi',         realmIdx: 2, stage: 1,
    desc: 'Sư đệ tinh nghịch của Thanh Vân, vừa bước vào Kim Đan với tốc độ khiến mọi người kinh ngạc.' },

  // Realm 2-3 — đối thủ mạnh
  { name: 'Bắc Minh',      title: 'Ma Đạo Thiên Tài',         realmIdx: 2, stage: 5,
    desc: 'Thiên tài ma đạo bí ẩn. Đi con đường tắt nguy hiểm, mạnh một cách đáng sợ.' },
  { name: 'Bạch Diệu',     title: 'Đan Đạo Tông Sư',          realmIdx: 3, stage: 2,
    desc: 'Đệ tử xuất sắc nhất Vạn Linh Đan Tông, tỷ lệ thành công luyện đan cao nhất thế hệ.' },

  // Realm 3-4 — đối thủ đỉnh
  { name: 'Vân Tiêu Thần', title: 'Kiếm Thần Nhân Giới',      realmIdx: 4, stage: 1,
    desc: 'Phiên bản tương lai của Vân Tiêu sau nhiều năm tu luyện. Đạt Hóa Thần trước mọi người.' },
];

// Spirit root draw weights (total = 1000)
export const SPIRIT_ROOT_WEIGHTS = {
  jin: 150, mu: 180, shui: 180, huo: 150, tu: 200,
  yin_yang: 100, hun: 40,
};