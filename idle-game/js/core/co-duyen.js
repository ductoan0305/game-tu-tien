// ============================================================
// core/co-duyen.js — Hệ thống Cơ Duyên (Lữ)
// Những thứ không thể mua, không thể farm
// v2 — 52 events, phân theo zone + cảnh giới + ngũ hành
// v3 — +18 events LK3-LK9 (Giai đoạn 2 content deepening)
// P11 — NPC Rivals encounter system
// ============================================================
import { addChronicle, addLifespanBonus } from './time-engine.js';
import { bus } from '../utils/helpers.js';
import { NPC_RIVALS } from './data.js';
import { calcPurityThreshold } from './state/computed.js';

// ============================================================
// BẢNG CƠ DUYÊN — 70 events
// tier 1 (xanh): phổ thông   — baseChance 0.04-0.07
// tier 2 (tím):  hiếm        — baseChance 0.008-0.018
// tier 3 (vàng): cực hiếm    — baseChance 0.001-0.003
// ============================================================
export const CO_DUYEN_EVENTS = [

  // ============================================================
  // TIER 1 — Kỳ Ngộ Nhỏ (thường gặp)
  // ============================================================

  // --- Thọ Mệnh ---
  {
    id: 'herb_lifespan_small',
    name: 'Trường Sinh Thảo', tier: 1, emoji: '🌿',
    desc: 'Tìm được một cây Trường Sinh Thảo ngàn năm trong khe núi sâu.',
    lore: 'Thảo dược này tuy không quý hiếm lắm, nhưng uống vào có thể kéo dài thọ mệnh đôi chút.',
    baseChance: 0.05,
    effect: { type: 'lifespan', years: 10, source: 'Trường Sinh Thảo' },
    unlockRealm: 0,
    conditions: ['explore'],
  },
  {
    id: 'mountain_dew_herb',
    name: 'Sơn Lộ Linh Thảo', tier: 1, emoji: '🍃',
    desc: 'Sau cơn mưa, tìm thấy một cụm thảo dược hấp thụ sương núi linh.',
    lore: 'Sương núi sáng sớm thấm vào thảo dược ngàn năm, tạo ra tinh hoa tự nhiên.',
    baseChance: 0.06,
    effect: { type: 'lifespan', years: 8, source: 'Sơn Lộ Linh Thảo' },
    unlockRealm: 0,
    conditions: ['explore', 'gather'],
  },
  {
    id: 'old_tree_resin',
    name: 'Cổ Thụ Linh Nhựa', tier: 1, emoji: '🌳',
    desc: 'Một cây cổ thụ ngàn tuổi tiết ra giọt nhựa vàng, uống vào thọ mệnh tăng thêm.',
    lore: 'Linh khí tích tụ ngàn năm trong cây cổ thụ kết thành nhựa vàng quý.',
    baseChance: 0.04,
    effect: { type: 'lifespan', years: 12, source: 'Cổ Thụ Linh Nhựa' },
    unlockRealm: 0,
    conditions: ['explore'],
    zoneBonus: ['thanh_van_son', 'hac_phong_lam'],
  },

  // --- Linh Lực & Kinh Nghiệm ---
  {
    id: 'elder_guidance',
    name: 'Cao Nhân Chỉ Điểm', tier: 1, emoji: '👴',
    desc: 'Gặp một ẩn sĩ bạch phát, ông chỉ điểm một câu khẩu quyết quan trọng.',
    lore: '"Đạo pháp tự nhiên, vô vi nhi trị." Một câu nói mà ngộ được vạn điều.',
    baseChance: 0.04,
    effect: { type: 'exp_burst', amount: 500 },
    unlockRealm: 0,
    conditions: ['explore', 'meditate'],
  },
  {
    id: 'spirit_spring',
    name: 'Linh Tuyền Bí Cảnh', tier: 1, emoji: '💧',
    desc: 'Phát hiện một dòng suối linh khí ẩn sâu trong rừng.',
    lore: 'Nước suối ngấm đẫm linh khí thiên nhiên qua hàng trăm năm. Uống vào thần thanh khí sảng.',
    baseChance: 0.06,
    effect: { type: 'qi_burst', pct: 0.5 },
    unlockRealm: 0,
    conditions: ['explore'],
  },
  {
    id: 'meditation_insight',
    name: 'Tham Thiền Khai Ngộ', tier: 1, emoji: '🧘',
    desc: 'Trong lúc tham thiền, đột nhiên tâm cảnh khai sáng, ngộ ra một tầng đạo lý.',
    lore: 'Thiên địa tĩnh lặng. Trong khoảnh khắc đó, ý thức lan rộng không giới hạn.',
    baseChance: 0.05,
    effect: { type: 'exp_burst', amount: 300 },
    unlockRealm: 0,
    conditions: ['meditate'],
  },
  {
    id: 'wild_qi_vortex',
    name: 'Linh Khí Xoáy Tự Nhiên', tier: 1, emoji: '🌀',
    desc: 'Một vòng xoáy linh khí tự nhiên bất ngờ xuất hiện, cuốn ngươi vào giữa.',
    lore: 'Thiên địa linh khí đôi khi tụ thành xoáy, may mắn gặp được là đại cơ duyên nhỏ.',
    baseChance: 0.055,
    effect: { type: 'qi_burst', pct: 0.8 },
    unlockRealm: 0,
    conditions: ['explore', 'cultivate'],
  },
  {
    id: 'forgotten_scripture',
    name: 'Tàn Kinh Dưới Đá', tier: 1, emoji: '📜',
    desc: 'Vô tình lật hòn đá bên đường, phát hiện tờ kinh văn mục nát của tiền nhân.',
    lore: 'Dù chỉ còn vài dòng, nhưng những gì còn đọc được đều là tinh hoa.',
    baseChance: 0.04,
    effect: { type: 'exp_burst', amount: 800 },
    unlockRealm: 1,
    conditions: ['explore'],
  },

  // --- Chỉ Số Vĩnh Viễn ---
  {
    id: 'ancient_rune',
    name: 'Cổ Đại Phù Văn', tier: 1, emoji: '🔮',
    desc: 'Tìm được tàn tích phù văn của tiền nhân, ngộ được một chút tinh tủy.',
    lore: 'Những nét chữ mờ nhạt, nhưng ẩn chứa đạo lý thâm sâu về tốc độ tu luyện.',
    baseChance: 0.04,
    effect: { type: 'permanent_stat', stat: 'ratePct', value: 3 },
    unlockRealm: 1,
    conditions: ['explore', 'array'],
  },
  {
    id: 'beast_blood_baptism',
    name: 'Yêu Thú Huyết Tẩy', tier: 1, emoji: '🩸',
    desc: 'Tiêu diệt một yêu thú, huyết khí của nó ngấm vào kinh mạch, tăng thể lực.',
    lore: 'Huyết khí yêu thú có linh lực, khi chiến đấu gần, một phần ngấm qua da thịt.',
    baseChance: 0.05,
    effect: { type: 'permanent_stat', stat: 'atkPct', value: 2 },
    unlockRealm: 0,
    conditions: ['combat'],
  },
  {
    id: 'iron_skin_training',
    name: 'Kim Thân Tôi Luyện', tier: 1, emoji: '💪',
    desc: 'Sau trận chiến sinh tử, thân thể tôi luyện đến một tầng mới.',
    lore: 'Giữa lằn ranh sinh tử, tiềm năng bùng phát. Lần này thân thể cường tráng hơn.',
    baseChance: 0.04,
    effect: { type: 'permanent_stat', stat: 'defPct', value: 2 },
    unlockRealm: 0,
    conditions: ['combat'],
  },
  {
    id: 'spiritual_resonance',
    name: 'Linh Căn Cộng Hưởng', tier: 1, emoji: '✨',
    desc: 'Linh khí thiên địa đột nhiên cộng hưởng với linh căn, tốc độ tu luyện tăng nhẹ.',
    lore: 'Đây là cảm giác mà mọi tu sĩ đều mơ — thiên địa và bản thân như một.',
    baseChance: 0.045,
    effect: { type: 'permanent_stat', stat: 'ratePct', value: 2 },
    unlockRealm: 0,
    conditions: ['meditate', 'cultivate'],
  },

  // --- Vật Phẩm / Nguyên Liệu ---
  {
    id: 'mushroom_basket',
    name: 'Rổ Linh Nấm Hoang', tier: 1, emoji: '🍄',
    desc: 'Tìm được một rổ linh nấm hoang dại, nguyên liệu luyện đan tốt.',
    lore: 'Mọc ở nơi ẩm thấp, hút linh khí đất qua hàng chục năm. Bình dị mà quý.',
    baseChance: 0.07,
    effect: { type: 'add_ingredient', itemId: 'cloud_mushroom', qty: 5 },
    unlockRealm: 0,
    conditions: ['explore', 'gather'],
  },
  {
    id: 'spirit_herb_patch',
    name: 'Bãi Linh Thảo Ẩn', tier: 1, emoji: '🌱',
    desc: 'Phát hiện một bãi linh thảo ẩn sau tảng đá lớn, thu hoạch được nhiều.',
    lore: 'Che chắn bởi đá lớn, linh thảo nơi này không bị ai tìm thấy bao giờ.',
    baseChance: 0.07,
    effect: { type: 'add_ingredient', itemId: 'spirit_herb', qty: 8 },
    unlockRealm: 0,
    conditions: ['explore', 'gather'],
  },
  {
    id: 'stone_windfall',
    name: 'Linh Thạch Lộ Thiên', tier: 1, emoji: '💎',
    desc: 'Phát hiện một mảng linh thạch lộ thiên sau trận mưa lớn.',
    lore: 'Mưa lớn bào mòn lớp đất, để lộ mảng linh thạch vốn ẩn bên dưới.',
    baseChance: 0.06,
    effect: { type: 'stone_reward', min: 200, max: 500 },
    unlockRealm: 0,
    conditions: ['explore'],
  },
  {
    id: 'lotus_pond',
    name: 'Hồ Sen Linh', tier: 1, emoji: '🪷',
    desc: 'Tìm thấy một hồ sen linh nhỏ, hái được vài bông bạch ngọc liên.',
    lore: 'Hoa sen linh chỉ nở vào đêm rằm, may mắn lắm mới gặp lúc nở.',
    baseChance: 0.05,
    effect: { type: 'add_ingredient', itemId: 'jade_lotus', qty: 3 },
    unlockRealm: 0,
    conditions: ['explore', 'gather'],
    zoneBonus: ['linh_duoc_coc'],
  },

  // --- Linh Thú ---
  {
    id: 'spirit_beast_friend',
    name: 'Linh Thú Kết Giao', tier: 1, emoji: '🦊',
    desc: 'Gặp một linh thú bị thương, cứu nó và nó kết giao với bạn.',
    lore: 'Linh thú cảm nhận được thiện tâm. Nó tặng ngươi một viên linh hạch quý.',
    baseChance: 0.01,
    effect: { type: 'permanent_stat', stat: 'hpPct', value: 5 },
    unlockRealm: 0,
    conditions: ['explore'],
  },
  {
    id: 'bird_guidance',
    name: 'Linh Điểu Dẫn Đường', tier: 1, emoji: '🐦',
    desc: 'Một con chim linh dẫn ngươi đến vùng đất linh khí đặc biệt.',
    lore: 'Linh điểu chỉ dẫn đường cho người có thiện tâm. Đây là một trong những dấu hiệu đó.',
    baseChance: 0.05,
    effect: { type: 'phapdia_temp', phapDiaId: 'phuc_dia', duration: 1800 },
    unlockRealm: 0,
    conditions: ['explore'],
  },

  // ============================================================
  // TIER 2 — Kỳ Ngộ Vừa (hiếm)
  // ============================================================

  // --- Thọ Mệnh ---
  {
    id: 'herb_lifespan_medium',
    name: 'Thiên Niên Linh Chi', tier: 2, emoji: '🍄',
    desc: 'Thiên Niên Linh Chi — thảo dược ngàn năm không nở, nở một lần kéo dài thọ mệnh.',
    lore: 'Loại linh chi này chỉ mọc ở nơi linh khí cực kỳ dày đặc. Không phải ai cũng có duyên gặp.',
    baseChance: 0.015,
    effect: { type: 'lifespan', years: 25, source: 'Thiên Niên Linh Chi' },
    unlockRealm: 1,
    conditions: ['explore'],
  },
  {
    id: 'ice_lotus_root',
    name: 'Băng Hồ Liên Căn', tier: 2, emoji: '❄',
    desc: 'Trong hồ băng sâu thẳm, tìm thấy căn sen băng ngàn năm.',
    lore: 'Căn sen này hút tinh hoa từ nước băng thiên nhiên, mang linh lực lạnh giá bảo vệ sinh cơ.',
    baseChance: 0.012,
    effect: { type: 'lifespan', years: 20, source: 'Băng Hồ Liên Căn' },
    unlockRealm: 1,
    conditions: ['explore', 'gather'],
    zoneBonus: ['bang_son'],
  },

  // --- Pháp Địa & Công Pháp ---
  {
    id: 'hidden_cave',
    name: 'Tiền Nhân Động Phủ', tier: 2, emoji: '🕳',
    desc: 'Phát hiện động phủ của một tiền nhân! Linh khí cực kỳ dày đặc.',
    lore: 'Tiền nhân tu luyện tại đây ngàn năm, linh khí tụ lại không tan. Có thể tu luyện tại đây 2 giờ.',
    baseChance: 0.012,
    effect: { type: 'phapdia_temp', phapDiaId: 'dong_phu', duration: 7200 },
    unlockRealm: 1,
    conditions: ['explore'],
  },
  {
    id: 'ley_line_node',
    name: 'Long Mạch Tiết Điểm', tier: 2, emoji: '🌐',
    desc: 'Tình cờ đứng trúng điểm giao thoa long mạch, linh lực dâng trào.',
    lore: 'Long mạch chạy ngầm dưới đất, tiết điểm là nơi linh khí bùng phát mạnh nhất.',
    baseChance: 0.010,
    effect: { type: 'phapdia_temp', phapDiaId: 'phuc_dia', duration: 3600 },
    unlockRealm: 0,
    conditions: ['explore', 'cultivate'],
  },
  {
    id: 'cong_phap_medium',
    name: 'Trung Phẩm Công Pháp Tàn Quyển', tier: 2, emoji: '📖',
    desc: 'Tìm được tàn quyển công pháp Trung Phẩm của tiền nhân.',
    lore: 'Tuy chỉ là tàn quyển, nhưng đủ để nâng cao bản thân lên một tầng.',
    baseChance: 0.008,
    effect: { type: 'unlock_congphap_mid' },
    unlockRealm: 1,
    conditions: ['explore'],
  },
  {
    id: 'sect_secret_room',
    name: 'Bí Thất Tông Môn', tier: 2, emoji: '🏯',
    desc: 'Vô tình phát hiện bí thất bị lãng quên trong tông môn, bên trong có bí kíp tu luyện.',
    lore: 'Cánh cửa đã bị bỏ quên trăm năm. Bên trong vẫn còn nguyên vẹn.',
    baseChance: 0.010,
    effect: { type: 'exp_burst', amount: 3000 },
    unlockRealm: 1,
    conditions: ['explore'],
    requireSect: true,
  },
  {
    id: 'array_formation_ruin',
    name: 'Trận Pháp Phế Tích', tier: 2, emoji: '⬡',
    desc: 'Tìm thấy phế tích trận pháp tiền nhân, nghiên cứu được tinh hoa trận đạo.',
    lore: 'Dù đã tan vỡ, nhưng dấu vết trận văn vẫn còn. Ai hiểu được sẽ đại tiến.',
    baseChance: 0.009,
    effect: { type: 'permanent_stat', stat: 'arrayBonus', value: 20 },
    unlockRealm: 1,
    conditions: ['explore', 'array'],
  },

  // --- Chỉ Số Cao ---
  {
    id: 'thunder_baptism',
    name: 'Thiên Lôi Tẩy Kinh Mạch', tier: 2, emoji: '⚡',
    desc: 'Bị sét đánh trúng nhưng không chết — kinh mạch mở rộng đáng kể.',
    lore: 'Thiên lôi tẩy luyện kinh mạch, đau đớn cực độ nhưng kết quả vô cùng tốt.',
    baseChance: 0.008,
    effect: { type: 'permanent_stat', stat: 'ratePct', value: 8 },
    unlockRealm: 1,
    conditions: ['explore'],
    zoneBonus: ['thien_kiep_dia', 'loi_dinh'],
  },
  {
    id: 'spiritual_awakening',
    name: 'Linh Căn Tỉnh Thức', tier: 2, emoji: '💫',
    desc: 'Linh căn đột nhiên tỉnh thức sâu hơn, cảm nhận rõ ràng hơn thiên địa linh lực.',
    lore: 'Không phải ai cũng trải qua điều này. Đây là dấu hiệu của tiềm năng lớn.',
    baseChance: 0.009,
    effect: { type: 'permanent_stat', stat: 'ratePct', value: 5 },
    unlockRealm: 0,
    conditions: ['meditate', 'cultivate'],
  },
  {
    id: 'battle_breakthrough',
    name: 'Chiến Đấu Ngộ Đạo', tier: 2, emoji: '⚔',
    desc: 'Trong trận chiến cân não, đột nhiên ngộ ra tầng đạo lý chiến đấu mới.',
    lore: 'Giữa sinh tử, trí tuệ và bản năng hợp nhất. Từ đây đòn đánh sắc bén hơn.',
    baseChance: 0.010,
    effect: { type: 'permanent_stat', stat: 'atkPct', value: 8 },
    unlockRealm: 1,
    conditions: ['combat'],
  },
  {
    id: 'iron_bone_tempering',
    name: 'Huyền Thiết Cốt Tẩy', tier: 2, emoji: '🦴',
    desc: 'Xương cốt bỗng nhiên được linh khí tẩy luyện, cứng rắn phi thường.',
    lore: 'Huyền thiết linh khí từ lòng đất ngấm qua, tôi luyện từng tế bào xương.',
    baseChance: 0.009,
    effect: { type: 'permanent_stat', stat: 'defPct', value: 8 },
    unlockRealm: 1,
    conditions: ['combat', 'explore'],
  },
  {
    id: 'alchemist_mentor',
    name: 'Đan Sư Truyền Thụ', tier: 2, emoji: '⚗',
    desc: 'Gặp một lão đan sư ẩn cư, ông truyền thụ bí quyết luyện đan.',
    lore: 'Lão nhân ngắm ngươi hồi lâu rồi gật đầu: "Có duyên mới gặp. Ta truyền ngươi một chiêu."',
    baseChance: 0.010,
    effect: { type: 'permanent_stat', stat: 'danBonus', value: 20 },
    unlockRealm: 1,
    conditions: ['explore', 'alchemy'],
  },

  // --- Nguyên Liệu Hiếm ---
  {
    id: 'blood_ginseng_find',
    name: 'Huyết Sâm Ẩn Trong Vách', tier: 2, emoji: '🌱',
    desc: 'Phát hiện một củ huyết sâm ngàn năm ẩn trong vách núi.',
    lore: 'Ngàn năm hút tinh khí đất, huyết sâm này đỏ thẫm như máu, quý hơn vàng.',
    baseChance: 0.015,
    effect: { type: 'add_ingredient', itemId: 'blood_ginseng', qty: 2 },
    unlockRealm: 1,
    conditions: ['explore', 'gather'],
  },
  {
    id: 'lightning_crystal_vein',
    name: 'Lôi Tinh Mạch Quặng', tier: 2, emoji: '⚡',
    desc: 'Phát hiện một mạch quặng lôi tinh nhỏ ẩn trong vách núi.',
    lore: 'Tiếng kêu rè rè từ trong đá dẫn đường. Bên trong là lôi tinh nguyên chất.',
    baseChance: 0.012,
    effect: { type: 'add_ingredient', itemId: 'lightning_core', qty: 2 },
    unlockRealm: 1,
    conditions: ['explore', 'gather'],
    zoneBonus: ['thien_kiep_dia', 'loi_dinh'],
  },
  {
    id: 'demon_core_cache',
    name: 'Hang Ổ Yêu Thú Bỏ Lại', tier: 2, emoji: '🔴',
    desc: 'Tìm thấy hang ổ bị bỏ lại của yêu thú, bên trong có yêu hạch chưa lấy.',
    lore: 'Yêu thú đã rời đi từ lâu, nhưng các yêu hạch nó để lại vẫn còn nguyên vẹn.',
    baseChance: 0.012,
    effect: { type: 'add_ingredient', itemId: 'demon_core_1', qty: 3 },
    unlockRealm: 0,
    conditions: ['explore'],
  },

  // --- Stone / Tài Nguyên ---
  {
    id: 'buried_treasure',
    name: 'Kho Báu Chôn Giấu', tier: 2, emoji: '💰',
    desc: 'Tìm được kho báu của tu sĩ bỏ lại từ trăm năm trước.',
    lore: 'Một cái hộp gỗ cũ kỹ, bên trong là linh thạch tích lũy cả đời tu hành.',
    baseChance: 0.010,
    effect: { type: 'stone_reward', min: 1000, max: 3000 },
    unlockRealm: 1,
    conditions: ['explore'],
  },
  {
    id: 'spirit_vein_pulse',
    name: 'Linh Mạch Xung Nhịp', tier: 2, emoji: '🌊',
    desc: 'Linh mạch dưới đất đột nhiên xung nhịp, phun linh khí phong phú lên mặt đất.',
    lore: 'Hiện tượng này xảy ra vài chục năm một lần. Ai gặp được là đại phúc.',
    baseChance: 0.008,
    effect: { type: 'qi_burst', pct: 2.0 },
    unlockRealm: 1,
    conditions: ['explore', 'cultivate'],
  },

  // --- Mở Nghề Phụ qua Cơ Duyên ---
  {
    id: 'cd_dan_kinh_co_nhan',
    name: 'Đan Kinh Từ Cao Nhân', tier: 2, emoji: '📜',
    desc: 'Một vị cao nhân ẩn cư nhận ra thiên phú luyện đan của ngươi và truyền lại bí quyết căn bản.',
    lore: 'Lão nhân không hỏi linh căn ngươi là gì. Ông chỉ nói: "Ngộ Tính đủ sâu, lửa có thể mượn từ đất trời."',
    baseChance: 0.006,
    effect: { type: 'unlock_profession', profId: 'luyen_dan' },
    unlockRealm: 0,
    conditions: ['explore', 'meditate'],
    // extraCondition: chỉ xuất hiện khi chưa mở luyen_dan và ngoTinh >= 20
    // (không cần Hỏa căn — đây là path thay thế cho tán tu không có Hỏa)
    extraCondition: (G) =>
      (G.ngoTinh ?? 0) >= 20 &&
      !(G.flags?.unlockedProfessions ?? []).includes('luyen_dan'),
  },
  // --- Mở 4 Nghề Phụ Còn Lại (S-P4) ---
  {
    id: 'cd_luyen_khi_lo_ren',
    name: 'Lão Thợ Rèn Truyền Nghề', tier: 2, emoji: '⚒',
    desc: 'Gặp một lão thợ rèn ẩn cư, ông nhận ra chất liệu trong xương ngươi và truyền lại bí quyết tôi luyện.',
    lore: 'Lão nhân ngắm bàn tay ngươi hồi lâu: "Tay ngươi biết lắng nghe kim loại. Ta chỉ ngươi cách để nó lắng nghe lại."',
    baseChance: 0.005,
    effect: { type: 'unlock_profession', profId: 'luyen_khi' },
    unlockRealm: 0,
    conditions: ['explore', 'combat'],
    extraCondition: (G) =>
      ((G.realmIdx ?? 0) > 0 || (G.stage ?? 1) >= 4) &&
      !(G.flags?.unlockedProfessions ?? []).includes('luyen_khi'),
  },
  {
    id: 'cd_tran_kinh_phe_tich',
    name: 'Trận Kinh Phế Tích', tier: 2, emoji: '🔮',
    desc: 'Trong phế tích cổ đại, tìm thấy mảnh Trận Kinh còn nguyên vẹn — tinh hoa trận đạo tiền nhân.',
    lore: 'Những nét khắc trên đá mờ nhạt, nhưng hễ tâm tĩnh ngồi xuống là chúng tự dưng hiện rõ trong tâm trí.',
    baseChance: 0.004,
    effect: { type: 'unlock_profession', profId: 'tran_phap' },
    unlockRealm: 0,
    conditions: ['explore', 'array'],
    extraCondition: (G) =>
      ((G.realmIdx ?? 0) > 0 || (G.stage ?? 1) >= 4) &&
      !(G.flags?.unlockedProfessions ?? []).includes('tran_phap'),
  },
  {
    id: 'cd_phu_chu_bi_thu',
    name: 'Phù Thư Bí Truyền', tier: 2, emoji: '📿',
    desc: 'Một bức thư pháp bỏ lại trong hoang miếu — nhìn vào, các phù văn tự nhiên thấm vào tâm khảm.',
    lore: 'Người xưa viết phù không bằng mực mà bằng linh lực. Ai đủ duyên nhìn vào thì linh lực tự khắc hiểu.',
    baseChance: 0.004,
    effect: { type: 'unlock_profession', profId: 'phu_chu' },
    unlockRealm: 0,
    conditions: ['explore', 'meditate'],
    extraCondition: (G) =>
      ((G.realmIdx ?? 0) > 0 || (G.stage ?? 1) >= 4) &&
      !(G.flags?.unlockedProfessions ?? []).includes('phu_chu'),
  },
  {
    id: 'cd_khoi_loi_cuon_ky',
    name: 'Cuốn Ký Lục Khôi Lỗi', tier: 2, emoji: '🤖',
    desc: 'Trong tàn tích môn phái cũ, tìm thấy cuốn ký lục về Khôi Lỗi — sơ đồ cấu trúc còn đọc được.',
    lore: 'Môn phái này đã diệt từ trăm năm trước, nhưng bí thuật Khôi Lỗi họ để lại vẫn chờ người có duyên.',
    baseChance: 0.004,
    effect: { type: 'unlock_profession', profId: 'khoi_loi' },
    unlockRealm: 0,
    conditions: ['explore', 'combat'],
    extraCondition: (G) =>
      ((G.realmIdx ?? 0) > 0 || (G.stage ?? 1) >= 4) &&
      !(G.flags?.unlockedProfessions ?? []).includes('khoi_loi'),
  },


  // ============================================================
  // TIER 3 — Đại Cơ Duyên (cực hiếm)
  // ============================================================

  // --- Thọ Mệnh Lớn ---
  {
    id: 'herb_lifespan_large',
    name: 'Vạn Niên Huyết Liên', tier: 3, emoji: '🌺',
    desc: 'VẠN NIÊN HUYẾT LIÊN — truyền thuyết nói chỉ xuất hiện 1 lần trong vạn năm.',
    lore: 'Hoa sen đỏ thắm nở trong đêm, ánh hào quang chiếu sáng cả một vùng. Ngươi có duyên lớn mới gặp.',
    baseChance: 0.002,
    effect: { type: 'lifespan', years: 50, source: 'Vạn Niên Huyết Liên' },
    unlockRealm: 2,
    conditions: ['explore'],
    zoneBonus: ['linh_duoc_coc'],
  },
  {
    id: 'immortal_spring',
    name: 'Tiên Tuyền Truyền Thuyết', tier: 3, emoji: '🏞',
    desc: 'ĐẠI CƠ DUYÊN! Tìm thấy tiên tuyền trong truyền thuyết, uống vào thọ mệnh đại tăng!',
    lore: 'Suối nước trong vắt, uống vào thân thể như được tắm rửa từ bên trong. Thọ mệnh vọt tăng.',
    baseChance: 0.001,
    effect: { type: 'lifespan', years: 80, source: 'Tiên Tuyền' },
    unlockRealm: 3,
    conditions: ['explore'],
  },

  // --- Công Pháp Thượng Phẩm ---
  {
    id: 'cong_phap_high',
    name: 'Thượng Phẩm Công Pháp Truyền Thừa', tier: 3, emoji: '📖',
    desc: 'ĐẠI CƠ DUYÊN! Tiền nhân hiển linh truyền thụ Thượng Phẩm Công Pháp!',
    lore: 'Trong giấc mơ, một bóng người trong suốt xuất hiện, truyền vào tâm trí toàn bộ bí quyết thượng phẩm.',
    baseChance: 0.001,
    effect: { type: 'unlock_congphap_high' },
    unlockRealm: 3,
    conditions: ['explore', 'meditate'],
  },
  {
    id: 'ancient_sword_spirit',
    name: 'Thượng Cổ Kiếm Linh Nhận Chủ', tier: 3, emoji: '⚔',
    desc: 'ĐẠI CƠ DUYÊN! Một kiếm linh thượng cổ ngủ yên ngàn năm đột nhiên nhận ngươi làm chủ!',
    lore: 'Kiếm tiếng kêu leng keng. Linh khí của nó hợp nhất với ngươi, sức chiến đấu vọt tăng.',
    baseChance: 0.001,
    effect: { type: 'permanent_stat_multi', stats: { atkPct: 15, ratePct: 5 } },
    unlockRealm: 2,
    conditions: ['explore', 'combat'],
    zoneBonus: ['thanh_van_son'],
  },

  // --- Thiên Đạo ---
  {
    id: 'heaven_dao_insight',
    name: 'Thiên Đạo Cảm Ngộ', tier: 3, emoji: '✨',
    desc: 'ĐẠI CƠ DUYÊN! Đột ngột ngộ được một tia thiên đạo!',
    lore: 'Trời đất bỗng nhiên tĩnh lặng. Trong khoảnh khắc đó, ngươi cảm nhận được sợi tơ mỏng manh kết nối vạn vật.',
    baseChance: 0.001,
    effect: { type: 'breakthrough_chance' },
    unlockRealm: 2,
    conditions: ['meditate', 'explore'],
  },
  {
    id: 'dao_tablet_complete',
    name: 'Hoàn Chỉnh Thiên Đạo Thạch Bích', tier: 3, emoji: '🪨',
    desc: 'ĐẠI CƠ DUYÊN! Tìm thấy thạch bích khắc hoàn chỉnh thiên đạo tâm pháp!',
    lore: 'Người xưa khắc đạo lý lên đá để lại cho hậu thế. Ngươi là người đầu tiên đọc được toàn bộ.',
    baseChance: 0.0015,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 10, expBonus: 15 } },
    unlockRealm: 2,
    conditions: ['explore'],
  },
  {
    id: 'dragon_vein_awakening',
    name: 'Long Mạch Tỉnh Thức', tier: 3, emoji: '🐉',
    desc: 'ĐẠI CƠ DUYÊN! Long mạch bên dưới đột nhiên tỉnh thức, linh khí bùng phát!',
    lore: 'Long mạch ngủ say ngàn năm. Hôm nay vì duyên phận với ngươi mà tỉnh giấc.',
    baseChance: 0.001,
    effect: { type: 'all_stats_small' },
    unlockRealm: 3,
    conditions: ['explore', 'cultivate'],
  },
  {
    id: 'celestial_opportunity',
    name: 'Thiên Cơ Trời Ban', tier: 3, emoji: '🌟',
    desc: 'ĐẠI CƠ DUYÊN! Thiên cơ đột ngột xuất hiện, vạn vật hội tụ về phía ngươi!',
    lore: 'Có những khoảnh khắc thiên định — khi trời đất, thời gian, và con người hội tụ thành một.',
    baseChance: 0.001,
    effect: { type: 'phapdia_temp_bao_dia', duration: 10800 },
    unlockRealm: 2,
    conditions: ['explore', 'meditate', 'cultivate'],
  },

  // --- Nguyên Liệu Legendary ---
  {
    id: 'void_grass_meadow',
    name: 'Hư Không Cỏ Đồng', tier: 3, emoji: '🌌',
    desc: 'ĐẠI CƠ DUYÊN! Một vùng cỏ hư không xuất hiện thoáng qua — hái nhanh!',
    lore: 'Hư không cỏ chỉ xuất hiện khi hai thế giới chồng chéo. Cơ hội chỉ có một lần.',
    baseChance: 0.0015,
    effect: { type: 'add_ingredient', itemId: 'void_grass', qty: 3 },
    unlockRealm: 3,
    conditions: ['explore', 'gather'],
  },
  {
    id: 'dragon_scale_gift',
    name: 'Rồng Xưa Tặng Vảy', tier: 3, emoji: '🐲',
    desc: 'ĐẠI CƠ DUYÊN! Một con rồng cổ đại xuất hiện và tặng ngươi một chiếc vảy!',
    lore: 'Ánh mắt rồng già nhìn ngươi sâu thẳm, rồi rụng một chiếc vảy xuống chân ngươi.',
    baseChance: 0.001,
    effect: { type: 'add_ingredient', itemId: 'dragon_scale', qty: 1 },
    unlockRealm: 3,
    conditions: ['explore'],
  },

  // ============================================================
  // TRÚC CƠ (realmIdx 1) — Chuyên Biệt
  // ============================================================

  {
    id: 'tc_foundation_resonance',
    name: 'Trúc Cơ Cộng Hưởng', tier: 1, emoji: '🔶',
    desc: 'Căn cơ của ngươi bỗng nhiên cộng hưởng với linh mạch thiên nhiên, Trúc Cơ thêm vững chắc.',
    lore: 'Trúc Cơ kỳ là giai đoạn căn cơ định hình. Linh mạch này như đá mài giũa, ép Trúc Cơ ngươi tinh thuần hơn.',
    baseChance: 0.05,
    effect: { type: 'permanent_stat', stat: 'ratePct', value: 3 },
    unlockRealm: 1, maxRealm: 1,
    conditions: ['explore', 'meditate'],
    zoneBonus: ['thanh_van_son', 'an_long_dong'],
  },
  {
    id: 'tc_qi_pool_expansion',
    name: 'Linh Hải Khai Mở', tier: 1, emoji: '🌊',
    desc: 'Tu luyện trong lúc tinh thần đạt tới cảnh giới đặc biệt, linh hải bỗng nhiên mở rộng.',
    lore: 'Trúc Cơ thành công nghĩa là linh hải đã hình thành. Hôm nay nó mở rộng thêm một lần nữa.',
    baseChance: 0.045,
    effect: { type: 'permanent_stat', stat: 'qiBonus', value: 20 },
    unlockRealm: 1, maxRealm: 1,
    conditions: ['meditate', 'cultivate'],
  },
  {
    id: 'tc_elder_test_passed',
    name: 'Trưởng Lão Bí Mật Khảo Nghiệm', tier: 2, emoji: '👴',
    desc: 'Một trưởng lão ẩn danh thử thách ngươi bằng câu hỏi đạo pháp — ngươi trả lời đúng và được truyền thụ bí thuật.',
    lore: '"Đạo là gì?" Ngươi không trả lời bằng lời mà bằng một cú đánh thuần túy. Lão nhân cười, gật đầu.',
    baseChance: 0.012,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 5, expBonus: 8 } },
    unlockRealm: 1, maxRealm: 2,
    conditions: ['explore'],
    zoneBonus: ['van_linh_thi', 'thanh_van_son'],
  },
  {
    id: 'tc_spirit_vein_bathing',
    name: 'Linh Mạch Tắm Gội', tier: 2, emoji: '💎',
    desc: 'Tìm thấy điểm giao nhau của hai linh mạch — nằm xuống tắm trong linh khí thuần túy nhất.',
    lore: 'Nơi hai mạch linh khí giao thoa, năng lượng tinh thuần tích tụ. Ngươi nằm trong đó suốt một ngày một đêm.',
    baseChance: 0.010,
    effect: { type: 'permanent_stat_multi', stats: { hpPct: 8, defPct: 5 } },
    unlockRealm: 1, maxRealm: 2,
    conditions: ['explore', 'cultivate'],
    zoneBonus: ['linh_duoc_coc', 'an_long_dong'],
  },
  {
    id: 'tc_foundation_pill_windfall',
    name: 'Trúc Cơ Đan Trời Cho', tier: 2, emoji: '💊',
    desc: 'Trong hốc đá cổ đại tìm thấy một viên Trúc Cơ Đan không rõ xuất xứ — phẩm chất hoàn hảo.',
    lore: 'Hộp ngọc phủ bụi ngàn năm. Bên trong một viên đan tỏa hào quang xanh nhạt — Trúc Cơ Đan thượng phẩm.',
    baseChance: 0.008,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 8, qiBonus: 30 } },
    unlockRealm: 1, maxRealm: 1,
    conditions: ['explore'],
  },
  {
    id: 'tc_lost_manual',
    name: 'Thủ Quyển Thất Truyền', tier: 3, emoji: '📜',
    desc: 'ĐẠI CƠ DUYÊN! Tìm thấy thủ quyển bí thuật dành riêng cho Trúc Cơ kỳ — bí thuật tuyệt truyền!',
    lore: 'Chữ viết mờ nhạt nhưng ngươi đọc được từng chữ. Bí thuật này đã thất truyền hàng ngàn năm.',
    baseChance: 0.0015,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 10, hpPct: 10, atkPct: 8 } },
    unlockRealm: 1, maxRealm: 1,
    conditions: ['explore'],
    zoneBonus: ['an_long_dong', 'hac_phong_lam'],
  },

  // ============================================================
  // KIM ĐAN (realmIdx 2) — Chuyên Biệt
  // ============================================================

  {
    id: 'kd_golden_core_pulse',
    name: 'Kim Đan Mạch Đập', tier: 1, emoji: '✨',
    desc: 'Kim Đan trong người bỗng nhiên mạch đập mạnh, tinh chất linh lực bùng phát.',
    lore: 'Kim Đan hình thành từ Trúc Cơ tinh thuần nhất. Mỗi lần nó cộng hưởng với thiên địa, sức mạnh tăng lên một bậc.',
    baseChance: 0.045,
    effect: { type: 'permanent_stat', stat: 'ratePct', value: 4 },
    unlockRealm: 2, maxRealm: 2,
    conditions: ['meditate', 'cultivate'],
    zoneBonus: ['thien_kiep_dia'],
  },
  {
    id: 'kd_dan_fire_epiphany',
    name: 'Đan Hỏa Khai Ngộ', tier: 1, emoji: '🔥',
    desc: 'Trong lúc luyện đan, đột ngột ngộ ra tầng sâu hơn của Đan Hỏa — thuần thục tăng vọt.',
    lore: 'Đan Hỏa không chỉ là nhiệt. Nó là ý chí của người luyện đan, hợp nhất với thiên địa linh khí.',
    baseChance: 0.04,
    effect: { type: 'permanent_stat', stat: 'danBonus', value: 10 },
    unlockRealm: 2, maxRealm: 3,
    conditions: ['alchemy', 'meditate'],
    zoneBonus: ['linh_duoc_coc', 'van_linh_thi'],
  },
  {
    id: 'kd_slaughter_dao_fragment',
    name: 'Sát Đạo Tàn Phiến', tier: 2, emoji: '🗡',
    desc: 'Trong tay một yêu thú hùng mạnh vừa hạ, tìm thấy mảnh vỡ của Sát Đạo — hấp thu vào người.',
    lore: 'Sát Đạo tàn phiến tích tụ ý chí chiến đấu của vạn kẻ đã chết. Hấp thu nó — sức chiến đấu vọt tăng.',
    baseChance: 0.010,
    effect: { type: 'permanent_stat_multi', stats: { atkPct: 10, defPct: 6 } },
    unlockRealm: 2, maxRealm: 3,
    conditions: ['combat'],
    zoneBonus: ['hac_phong_lam', 'thien_kiep_dia'],
  },
  {
    id: 'kd_earth_vein_crystallize',
    name: 'Địa Mạch Kết Tinh', tier: 2, emoji: '💠',
    desc: 'Phát hiện một viên tinh thể địa mạch — linh khí đất đai tích lũy ngàn năm kết thành.',
    lore: 'Màu xanh lam trong suốt. Khi ngươi cầm lên, linh khí tràn vào người như dòng sông.',
    baseChance: 0.009,
    effect: { type: 'permanent_stat_multi', stats: { hpPct: 12, defPct: 8 } },
    unlockRealm: 2, maxRealm: 3,
    conditions: ['explore', 'gather'],
    zoneBonus: ['an_long_dong', 'linh_duoc_coc'],
  },
  {
    id: 'kd_ancient_formation_core',
    name: 'Cổ Trận Pháp Lõi', tier: 2, emoji: '🔮',
    desc: 'Tìm thấy lõi trận pháp cổ đại còn hoạt động — hấp thu tinh hoa trận đạo.',
    lore: 'Trận pháp ngàn năm vẫn vận hành theo quán tính. Lõi nó chứa đựng đạo lý trận văn thuần túy nhất.',
    baseChance: 0.008,
    effect: { type: 'permanent_stat_multi', stats: { arrayBonus: 15, ratePct: 5 } },
    unlockRealm: 2, maxRealm: 3,
    conditions: ['explore'],
    zoneBonus: ['thien_kiep_dia', 'van_linh_thi'],
  },
  {
    id: 'kd_golden_core_cleansing',
    name: 'Kim Đan Tịnh Hóa', tier: 3, emoji: '🌟',
    desc: 'ĐẠI CƠ DUYÊN! Kim Đan trong người tự nhiên phát quang và tịnh hóa hoàn toàn — đại thành!',
    lore: 'Kim Đan phát ra ánh vàng chói lóa trong suốt một canh giờ. Sau đó mọi tạp chất biến mất.',
    baseChance: 0.0012,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 15, hpPct: 15, atkPct: 10 } },
    unlockRealm: 2, maxRealm: 2,
    conditions: ['meditate', 'cultivate'],
    zoneBonus: ['thien_kiep_dia', 'an_long_dong'],
  },

  // ============================================================
  // NGUYÊN ANH (realmIdx 3) — Chuyên Biệt
  // ============================================================

  {
    id: 'na_nascent_soul_resonance',
    name: 'Nguyên Anh Cộng Minh', tier: 1, emoji: '👶',
    desc: 'Nguyên Anh trong người bỗng nhiên cộng minh với linh khí trời đất — sức mạnh bùng phát.',
    lore: 'Nguyên Anh là tiểu ngã thứ hai. Khi nó cộng hưởng với thiên địa, cả hai cùng tăng trưởng.',
    baseChance: 0.04,
    effect: { type: 'permanent_stat', stat: 'ratePct', value: 5 },
    unlockRealm: 3, maxRealm: 3,
    conditions: ['meditate', 'cultivate'],
    zoneBonus: ['thien_kiep_dia', 'an_long_dong'],
  },
  {
    id: 'na_void_comprehension',
    name: 'Hư Không Cảm Ngộ', tier: 2, emoji: '🌌',
    desc: 'Trong lúc tu luyện, tâm trí đột ngột trải rộng vào hư không — ngộ được bản chất hư vô.',
    lore: 'Nguyên Anh kỳ tu sĩ bắt đầu tiếp xúc với cõi vượt Phàm Nhân Giới. Hư không không phải trống rỗng — nó chứa đựng vô tận.',
    baseChance: 0.009,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 8, expBonus: 12 } },
    unlockRealm: 3, maxRealm: 4,
    conditions: ['meditate', 'explore'],
    zoneBonus: ['an_long_dong', 'thien_kiep_dia'],
  },
  {
    id: 'na_heavenly_tribulation_scar',
    name: 'Vết Thương Thiên Kiếp Tịnh Hóa', tier: 2, emoji: '⚡',
    desc: 'Sẹo từ thiên kiếp cũ bỗng nhiên phát sáng và tịnh hóa — nghịch cảnh hóa sức mạnh.',
    lore: 'Tu sĩ Nguyên Anh đã trải qua nhiều thiên kiếp. Mỗi vết thương là chứng minh của sự sống sót.',
    baseChance: 0.008,
    effect: { type: 'permanent_stat_multi', stats: { atkPct: 12, hpPct: 10 } },
    unlockRealm: 3, maxRealm: 4,
    conditions: ['combat', 'explore'],
    zoneBonus: ['thien_kiep_dia'],
  },
  {
    id: 'na_primordial_chaos_drop',
    name: 'Hỗn Nguyên Linh Lộ', tier: 3, emoji: '🌀',
    desc: 'ĐẠI CƠ DUYÊN! Một giọt Hỗn Nguyên Linh Lộ từ thuở khai thiên tịch địa hiện ra trước mặt!',
    lore: 'Linh lộ từ thuở khai thiên. Uống vào — tâm trí ngươi lóe sáng với ký ức của vũ trụ mới tạo.',
    baseChance: 0.0008,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 20, hpPct: 20, atkPct: 15, expBonus: 20 } },
    unlockRealm: 3,
    conditions: ['meditate', 'explore'],
    zoneBonus: ['an_long_dong'],
  },
  {
    id: 'na_ancient_soul_guidance',
    name: 'Cổ Hồn Dẫn Đường', tier: 3, emoji: '👁',
    desc: 'ĐẠI CƠ DUYÊN! Một cổ hồn trú ngụ trong khu vực này xuất hiện và chỉ điểm ngươi con đường!',
    lore: 'Nó không nói bằng lời — nó truyền thẳng vào tâm trí ngươi hàng vạn năm kinh nghiệm tu tiên.',
    baseChance: 0.0009,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 12, expBonus: 25, qiBonus: 50 } },
    unlockRealm: 3,
    conditions: ['explore', 'meditate'],
    zoneBonus: ['an_long_dong', 'thien_kiep_dia'],
  },

  // ============================================================
  // LUYỆN KHÍ (realmIdx 0, stage 3-9) — Chuyên Biệt: Dead Zone Content
  // Mục tiêu: lấp đầy giai đoạn LK3-LK9 với narrative về tuổi tác,
  // áp lực thời gian, tán tu, và con đường của người bình thường.
  // ============================================================

  // --- LK3 — Milestone: Đủ mạnh để thấy giới hạn ---
  {
    id: 'lk_wasted_year',
    name: 'Năm Tháng Trôi Qua', tier: 1, emoji: '⏳',
    desc: 'Trong lúc bế quan, nhận ra mình đã mất một năm mà không tiến triển gì đáng kể.',
    lore: 'Không phải thất bại mà là tỉnh ngộ. Một năm. Ngươi nhìn bàn tay mình — nhăn hơn một chút, gân xanh hơn một chút.',
    baseChance: 0.05,
    effect: { type: 'purity_burst', amount: 0.03 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate', 'cultivate'],
    extraCondition: (G) => (G.stage ?? 1) >= 3 && (G.stage ?? 1) <= 5,
  },
  {
    id: 'lk_peer_surpassed',
    name: 'Đồng Môn Vượt Trội', tier: 1, emoji: '👥',
    desc: 'Một người vào cùng lúc với ngươi đã đột phá Trúc Cơ. Ngươi vẫn ở đây.',
    lore: 'Cảm giác cay đắng. Nhưng cay đắng cũng là nhiên liệu — nếu ngươi biết đốt đúng cách.',
    baseChance: 0.04,
    effect: { type: 'exp_burst', amount: 600 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore', 'meditate'],
    extraCondition: (G) => (G.stage ?? 1) >= 3 && (G.stage ?? 1) <= 6,
  },
  {
    id: 'lk_lifespan_panic',
    name: 'Nhìn Lại Tuổi Thọ', tier: 1, emoji: '💀',
    desc: 'Nhẩm tính thọ mệnh còn lại — số năm không nhiều. Tim thắt lại.',
    lore: 'Con số thô ráp: ngươi có bao nhiêu năm còn lại? Đủ để đột phá không? Áp lực này... thực ra giúp ích.',
    baseChance: 0.045,
    effect: { type: 'purity_burst', amount: 0.05 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate'],
    extraCondition: (G) => {
      const remaining = (G.gameTime?.lifespanMax ?? 100) - (G.gameTime?.currentYear ?? 16);
      return remaining < 60 && (G.stage ?? 1) >= 3;
    },
  },

  // --- LK4-LK5 — Tán tu: những người không vượt qua ---
  {
    id: 'lk_scattered_meeting',
    name: 'Gặp Tán Tu', tier: 1, emoji: '🧓',
    desc: 'Trong chuyến thám hiểm, gặp một người tu tiên cứng tuổi ngồi bên đường, mắt trống rỗng.',
    lore: 'Ông ta không nói nhiều. Nhưng nhìn ngươi với ánh mắt vừa thương vừa cảnh cáo — đừng như ta.',
    baseChance: 0.04,
    effect: { type: 'purity_burst', amount: 0.04 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore'],
    extraCondition: (G) => (G.stage ?? 1) >= 4 && (G.stage ?? 1) <= 7,
  },
  {
    id: 'lk_failed_bt_lesson',
    name: 'Thất Bại Đột Phá Ngộ Đạo', tier: 2, emoji: '💥',
    desc: 'Lần đột phá thất bại khiến ngươi mất kiểm soát linh lực trong một giờ — nhưng sau đó, ngộ ra điều gì đó quan trọng.',
    lore: 'Thất bại không phải lãng phí. Mỗi lần nổ tung là một lần hiểu rõ hơn giới hạn của mình.',
    baseChance: 0.012,
    effect: { type: '_btFailStreak_reset' },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['cultivate', 'meditate'],
    extraCondition: (G) => (G._btFailStreak ?? 0) >= 2 && (G.stage ?? 1) >= 4,
  },
  {
    id: 'lk_aging_body_push',
    name: 'Thân Thể Tuổi Tác Phản Kháng', tier: 1, emoji: '💪',
    desc: 'Thân thể đã bắt đầu thoái hóa nhẹ — nhưng hôm nay linh lực dâng trào bất ngờ, như ý chí kháng cự.',
    lore: 'Tu tiên không phải chỉ là tinh thần. Thân thể cũng có ý chí. Hôm nay nó chứng minh điều đó.',
    baseChance: 0.035,
    effect: { type: 'permanent_stat', stat: 'ratePct', value: 4 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['cultivate', 'meditate'],
    extraCondition: (G) => {
      const age = G.gameTime?.currentYear ?? 16;
      return age >= 40 && (G.stage ?? 1) >= 4;
    },
  },

  // --- LK5-LK6 — Nhận ra con đường —
  {
    id: 'lk_five_root_epiphany',
    name: 'Ngộ Ngũ Căn', tier: 2, emoji: '🌿',
    desc: 'Lần đầu tiên ngươi cảm nhận được cả năm luồng linh khí cùng một lúc — dù chỉ trong một thoáng.',
    lore: 'Ngũ Linh Căn vốn bị xem là yếu. Nhưng trong khoảnh khắc đó, ngươi hiểu: năm con sông nhỏ cộng lại vẫn là sông.',
    baseChance: 0.008,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 6, expBonus: 10 } },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate', 'cultivate'],
    extraCondition: (G) => {
      const t = G.spiritData?.type;
      return t === 'NGU' && (G.stage ?? 1) >= 5;
    },
  },
  {
    id: 'lk_triple_root_harmony',
    name: 'Tam Căn Hoà Hợp', tier: 2, emoji: '🔺',
    desc: 'Ba luồng linh căn trong người đột nhiên hòa hợp hoàn toàn — linh lực vận hành mượt mà hơn bao giờ hết.',
    lore: 'Tam Linh Căn vốn khó điều phối. Nhưng hôm nay ba luồng như ba dòng nước hợp thành một.',
    baseChance: 0.009,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 8, qiBonus: 25 } },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate', 'cultivate'],
    extraCondition: (G) => {
      const t = G.spiritData?.type;
      return t === 'TAM' && (G.stage ?? 1) >= 5;
    },
  },
  {
    id: 'lk_dual_root_resonance',
    name: 'Song Căn Cộng Minh', tier: 2, emoji: '☯',
    desc: 'Hai luồng linh căn đối lập trong người bỗng cộng minh — sinh ra năng lượng vượt trội.',
    lore: 'Âm Dương tương khắc nhưng cũng tương sinh. Ngươi hôm nay ngộ được điều mà ít tu sĩ hiểu.',
    baseChance: 0.010,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 10, atkPct: 6 } },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate', 'cultivate'],
    extraCondition: (G) => {
      const t = G.spiritData?.type;
      return t === 'SONG' && (G.stage ?? 1) >= 5;
    },
  },
  {
    id: 'lk_isolated_recluse',
    name: 'Ẩn Tu Đơn Độc', tier: 1, emoji: '🏔',
    desc: 'Tự nguyện vào vùng hoang vu một mình, không tiếp xúc ai — sự đơn độc tự nhiên làm tâm tĩnh hơn.',
    lore: 'Đơn độc không phải trừng phạt. Đối với tu tiên, đó là trạng thái lý tưởng — không nhiễu loạn, không phân tâm.',
    baseChance: 0.045,
    effect: { type: 'permanent_stat', stat: 'ratePct', value: 3 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore', 'meditate'],
    extraCondition: (G) => (G.stage ?? 1) >= 5 && (G.stage ?? 1) <= 8,
  },

  // --- LK6-LK7 — Giữa đường nguy hiểm nhất —
  {
    id: 'lk_halfway_dread',
    name: 'Giữa Đường Sợ Hãi', tier: 1, emoji: '😰',
    desc: 'Đêm nay trong bế quan, nỗi sợ bất ngờ tràn về — nếu không đột phá được Trúc Cơ thì sao?',
    lore: 'Mồ hôi lạnh. Tim đập loạn. Nhưng ngươi không bỏ dậy. Không bỏ cuộc. Đó đã là chiến thắng.',
    baseChance: 0.04,
    effect: { type: 'purity_burst', amount: 0.06 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate', 'cultivate'],
    extraCondition: (G) => (G.stage ?? 1) >= 6 && (G.stage ?? 1) <= 8,
  },
  {
    id: 'lk_ghost_tu_encounter',
    name: 'Gặp Tán Tu Cuối Đời', tier: 2, emoji: '👻',
    desc: 'Gặp một tán tu đang hấp hối trong túp lều hoang — ông ta nhìn ngươi và nói: Đừng dừng lại.',
    lore: '"Ta đã dừng ở LK6. Nghĩ rằng còn thời gian. Bây giờ..." Ông ta không nói hết. Không cần.',
    baseChance: 0.009,
    effect: { type: 'purity_burst', amount: 0.08 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore'],
    extraCondition: (G) => (G.stage ?? 1) >= 6,
    cooldownSec: 86400,
  },
  {
    id: 'lk_ancient_tome_lk',
    name: 'Bí Kíp Luyện Khí Cổ', tier: 2, emoji: '📚',
    desc: 'Tìm thấy một quyển bí kíp cũ dành riêng cho giai đoạn Luyện Khí — chứa đựng tinh hoa mà người hiện đại bỏ qua.',
    lore: 'Người xưa không vội. Họ có thể dành cả trăm năm ở Luyện Khí và vẫn đột phá thành công. Bí quyết của họ khác.',
    baseChance: 0.010,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 7, expBonus: 12 } },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore'],
    extraCondition: (G) => (G.stage ?? 1) >= 6,
  },

  // --- LK7-LK8 — Vùng nguy hiểm nhất, gần cuối —
  {
    id: 'lk_final_stretch_resolve',
    name: 'Quyết Tâm Chặng Cuối', tier: 1, emoji: '🔥',
    desc: 'LK7 — cảm giác như đã đi nửa đường. Nhưng nửa còn lại mới là thực sự khó.',
    lore: 'Nhiều người tán tu ở LK7. Không phải vì yếu — mà vì đã kiệt sức trước khi đến đây. Ngươi vẫn còn đây.',
    baseChance: 0.04,
    effect: { type: 'purity_burst', amount: 0.05 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate', 'cultivate'],
    extraCondition: (G) => (G.stage ?? 1) >= 7,
  },
  {
    id: 'lk_lifespan_window_closing',
    name: 'Cửa Sổ Đang Đóng', tier: 2, emoji: '⌛',
    desc: 'Tính toán lại: nếu mỗi đột phá cần thêm thời gian và tuổi thọ cạn dần — cửa sổ đang đóng.',
    lore: 'Không phải tuyệt vọng. Là tỉnh táo. Ngươi cần Trúc Cơ trong X năm nữa. Biết rõ thì mới hành động đúng.',
    baseChance: 0.009,
    effect: { type: 'purity_burst', amount: 0.1 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate'],
    extraCondition: (G) => {
      const remaining = (G.gameTime?.lifespanMax ?? 100) - (G.gameTime?.currentYear ?? 16);
      return remaining < 40 && (G.stage ?? 1) >= 7;
    },
    cooldownSec: 72000,
  },
  {
    id: 'lk_last_companion_left',
    name: 'Người Bạn Cuối Rời Đi', tier: 1, emoji: '🌅',
    desc: 'Người bạn đồng hành cuối cùng cũng đã đột phá hoặc tán tu — ngươi chỉ còn lại một mình.',
    lore: 'Cô đơn ở LK8 khác với LK1. LK1 là cô đơn của người mới bắt đầu. LK8 là cô đơn của người đã biết tất cả.',
    baseChance: 0.04,
    effect: { type: 'exp_burst', amount: 1500 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore', 'meditate'],
    extraCondition: (G) => (G.stage ?? 1) >= 8,
  },

  // --- LK9 — Ngưỡng cửa cuối cùng —
  {
    id: 'lk_peak_desperation',
    name: 'Tuyệt Vọng Ở Đỉnh', tier: 2, emoji: '🗻',
    desc: 'LK9 — stage cuối cùng trước Trúc Cơ. Ở đây, ngươi thấy rõ hơn bao giờ hết mình là ai.',
    lore: 'Không còn chỗ để tự dối. Không còn "thời gian để tính sau". Chỉ còn ngươi và ngưỡng cửa trước mặt.',
    baseChance: 0.012,
    effect: { type: 'purity_burst', amount: 0.12 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate', 'cultivate'],
    extraCondition: (G) => (G.stage ?? 1) >= 9,
    cooldownSec: 86400,
  },
  {
    id: 'lk_final_gift_ancestor',
    name: 'Di Sản Tiền Nhân', tier: 3, emoji: '🎁',
    desc: 'ĐẠI CƠ DUYÊN! Trong hang sâu tìm thấy di sản của một tán tu LK9 đã từng cố đột phá — thứ ông để lại là kinh nghiệm.',
    lore: 'Ông ta ghi lại tất cả những gì mình đã sai, những gì mình đã biết quá muộn. Đây là món quà cuối của một người đã thất bại — để người sau không thất bại nữa.',
    baseChance: 0.002,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 12, expBonus: 20 } },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore'],
    extraCondition: (G) => (G.stage ?? 1) >= 9,
  },

  // ============================================================
  // SPRINT 5 — LK Hậu Kỳ Atmospheric Events (stage ≥ 7)
  // Không khí nặng nề, cô đơn, và những khoảnh khắc thiên nhiên
  // mang ý nghĩa sâu hơn khi ngươi đã đứng quá lâu ở ngưỡng cửa.
  // ============================================================
  {
    id: 'lk_hk_stone_crack',
    name: 'Vết Nứt Trên Đá', tier: 1, emoji: '🪨',
    desc: 'Trong chuyến thám hiểm, ngươi nhìn thấy nước nhỏ giọt đã xẻ đôi một tảng đá khổng lồ — không phải bằng lực, mà bằng thời gian.',
    lore: '"Nước không cố gắng phá đá. Nước chỉ là nước. Nhưng đá thì vỡ."',
    baseChance: 0.030,
    effect: { type: 'permanent_stat', stat: 'ratePct', value: 5 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore', 'gather'],
    extraCondition: (G) => (G.stage ?? 1) >= 7,
    cooldownSec: 604800,
  },
  {
    id: 'lk_hk_yearend_moon',
    name: 'Trăng Cuối Năm', tier: 1, emoji: '🌕',
    desc: 'Đêm cuối năm, trăng sáng như bạc. Ngươi ngồi thiền dưới ánh trăng và cảm thấy linh lực trong không khí dày đặc hơn bình thường.',
    lore: 'Trăng không hỏi ngươi đã tu bao năm. Trăng chỉ chiếu — và chiếu như nhau cho tất cả mọi người.',
    baseChance: 0.025,
    effect: { type: 'qi_burst', pct: 0.40 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate', 'cultivate'],
    extraCondition: (G) => (G.stage ?? 1) >= 7,
    cooldownSec: 259200,
  },
  {
    id: 'lk_hk_breakthrough_witness',
    name: 'Tiếng Trống Trúc Cơ', tier: 2, emoji: '🥁',
    desc: 'Từ phía núi xa, một luồng linh khí bùng lên — ai đó đã đột phá Trúc Cơ. Tiếng vang như sấm, xuyên qua mây và đến tai ngươi.',
    lore: 'Một phần ngươi ghen tị. Một phần ngươi vui cho họ. Nhưng phần lớn hơn — ngươi muốn biết: tại sao họ được và ta thì chưa?',
    baseChance: 0.012,
    effect: { type: 'khivan_boost', value: 8 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore', 'meditate'],
    extraCondition: (G) => (G.stage ?? 1) >= 7,
    cooldownSec: 432000,
  },
  {
    id: 'lk_hk_butterfly_fog',
    name: 'Cánh Bướm Qua Màn Sương', tier: 2, emoji: '🦋',
    desc: 'Ngồi thiền trong buổi sáng sương mù, một con bướm bay ngang — chậm rãi, không mục đích rõ ràng, nhưng chính xác đến nơi nó muốn đến.',
    lore: 'Con bướm không cố trở thành bướm. Nó chỉ là bướm. Khoảnh khắc đó, ngươi hiểu ra điều gì đó không thể nói bằng lời.',
    baseChance: 0.010,
    effect: { type: 'ngoTinh_boost', value: 5 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate'],
    extraCondition: (G) => (G.stage ?? 1) >= 8,
    cooldownSec: 604800,
  },
  {
    id: 'lk_hk_empty_cave',
    name: 'Động Không Người', tier: 3, emoji: '🕳',
    desc: 'ĐẠI CƠ DUYÊN! Trong hang núi hoang vắng, ngươi tìm thấy dấu vết của một tu sĩ đã bế quan hàng thập kỷ — và không ai biết họ đã đi đâu.',
    lore: '"Họ có thể đã đột phá. Họ có thể đã chết trong im lặng. Ngươi không biết — và chính sự không biết đó là thứ khiến ngươi nhớ mãi: con đường này cô đơn đến tận cùng."',
    baseChance: 0.003,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 8, expBonus: 15 } },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore'],
    extraCondition: (G) => (G.stage ?? 1) >= 7,
  },

  // ============================================================
  // SPRINT 3 — Age Crisis Events (tuổi 65-80, LK only)
  // Cơ duyên đặc biệt cho tu sĩ già trong LK — áp lực thời gian,
  // sự tương phản với người đã đột phá, và những lựa chọn liều lĩnh.
  // ============================================================
  {
    id: 'age_crisis_suhuynh',
    name: 'Sư Huynh Đã Trúc Cơ', tier: 1, emoji: '🙏',
    desc: 'Trong chuyến thám hiểm, ngươi tình cờ gặp lại một người từng tu tiên cùng năm. Hắn đã Trúc Cơ. Ngươi vẫn đang ở LK.',
    lore: '"Đường của ta và đường của ngươi khác nhau. Nhưng ngươi vẫn còn thời gian — đừng nhìn ta mà tự bỏ cuộc."',
    baseChance: 0.035,
    effect: { type: 'khivan_boost', value: 6 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore'],
    extraCondition: (G) => (G.gameTime?.currentYear ?? 0) >= 65,
    cooldownSec: 172800,
  },
  {
    id: 'age_crisis_diary',
    name: 'Nhật Ký Bỏ Lại', tier: 1, emoji: '📓',
    desc: 'Trong một hang đá cũ, ngươi tìm thấy nhật ký của một tu sĩ đã mất ở tuổi 78, dừng lại mãi mãi ở LK8.',
    lore: '"Ngày 72 tuổi: vẫn còn hy vọng. Ngày 78 tuổi: hối tiếc không dùng thời gian tốt hơn — đừng như ta."',
    baseChance: 0.040,
    effect: { type: 'purity_burst', amount: 0.08 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore', 'gather'],
    extraCondition: (G) => (G.gameTime?.currentYear ?? 0) >= 65,
    cooldownSec: 259200,
  },
  {
    id: 'age_crisis_elder_secret',
    name: 'Tiên Lão Trao Bí', tier: 2, emoji: '👴',
    desc: 'Một lão tu sĩ đang hấp hối, thọ mệnh gần cạn, muốn truyền lại kiến thức cả đời trước khi về hư vô.',
    lore: '"Ta sắp đi. Thứ này không mang được theo — hãy mang đi giúp ta, và đừng lãng phí nó."',
    baseChance: 0.010,
    effect: { type: 'ngoTinh_boost', value: 4 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore'],
    extraCondition: (G) => {
      const age = G.gameTime?.currentYear ?? 0;
      return age >= 67 && age <= 80;
    },
    cooldownSec: 604800,
  },
  {
    id: 'age_crisis_risky_pill',
    name: 'Linh Dược Đánh Cược', tier: 2, emoji: '⚗',
    desc: 'Một lão dược sư hấp hối muốn trao viên linh dược bí truyền cuối đời — kết quả tốt xấu không ai biết trước.',
    lore: '"Đến tuổi này mới hiểu — tiếc cái gì đó chưa dùng còn tệ hơn dùng mà thất bại. Uống đi."',
    baseChance: 0.008,
    effect: { type: 'risky_lifespan', successYears: 20, successPct: 0.60, failYears: -8, failCanCotPenalty: 5 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore'],
    extraCondition: (G) => {
      const age = G.gameTime?.currentYear ?? 0;
      return age >= 67 && age <= 80;
    },
    cooldownSec: 604800,
  },
  {
    id: 'age_crisis_last_chance',
    name: 'Vô Thường Cơ Duyên', tier: 3, emoji: '☯',
    desc: 'Ngay khoảnh khắc gần như từ bỏ, một cảm ngộ kỳ lạ ập đến — như thiên đạo thấy lòng ngươi vẫn chưa tắt.',
    lore: '"Đạo không từ bỏ kẻ không từ bỏ đạo."',
    baseChance: 0.002,
    effect: { type: '_btFailStreak_reset' },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate', 'cultivate'],
    extraCondition: (G) => {
      const age = G.gameTime?.currentYear ?? 0;
      return age >= 70 && (G._btFailStreak ?? 0) >= 2;
    },
  },

  // ============================================================
  // SPRINT 9 — LK Stage 4-6: Những khoảnh khắc giữa đường
  // Dead zone content: không còn hứng thú của người mới,
  // chưa có áp lực của người gần cuối.
  // Chủ đề: thành thạo nghề, buông bỏ vội vàng, tìm vận nhỏ.
  // ============================================================

  // --- Tier 1 ---
  {
    id: 'lk_familiar_forest',
    name: 'Rừng Quen Như Nhà', tier: 1, emoji: '🌲',
    desc: 'Sau hàng ngàn lần đi qua, rừng này không còn xa lạ. Một nhánh cành tự buông xuống trước mặt — đó là linh thảo ngươi từng tìm mãi không thấy.',
    lore: 'Cây cối không tặng thứ gì cho người lạ. Nhưng người đã đủ quen — thì khác.',
    baseChance: 0.040,
    effect: { type: 'add_ingredient', itemId: 'spirit_herb', qty: 6 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore', 'gather'],
    extraCondition: (G) => (G.stage ?? 1) >= 4 && (G.stage ?? 1) <= 7,
  },
  {
    id: 'lk_nightwatch_calm',
    name: 'Đêm Canh Tĩnh Lặng', tier: 1, emoji: '🌙',
    desc: 'Canh ba đêm nay không có gì cả. Không kỳ ngộ, không cơ duyên. Chỉ có ngươi và sự tĩnh lặng. Và ngươi chợt nhận ra — đây mới là tu tiên thật.',
    lore: 'Người ta hay hỏi tu tiên có gì hay. Câu trả lời là: đêm nay. Không có gì. Và vẫn ngồi đây.',
    baseChance: 0.045,
    effect: { type: 'ngoTinh_boost', value: 2 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate', 'cultivate'],
    extraCondition: (G) => (G.stage ?? 1) >= 4 && (G.stage ?? 1) <= 6,
  },
  {
    id: 'lk_market_rumor',
    name: 'Tin Đồn Thị Trường', tier: 1, emoji: '🗣',
    desc: 'Người bán hàng già kéo ngươi lại thì thầm: "Năm trước ai đó để lại một túi linh thạch dưới gốc đa phía đông..." Ngươi thử đi tìm — và có thật.',
    lore: 'Vận may đôi khi đến từ những tin đồn không ai tin.',
    baseChance: 0.050,
    effect: { type: 'stone_reward', min: 300, max: 900 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore'],
    extraCondition: (G) => (G.stage ?? 1) >= 4 && (G.stage ?? 1) <= 6,
  },
  {
    id: 'lk_craft_intuition',
    name: 'Tay Nghề Trực Giác', tier: 1, emoji: '🤲',
    desc: 'Trong khi hành nghề, đột nhiên tay ngươi biết làm gì trước khi đầu óc nghĩ xong — bản năng của người đã quen việc.',
    lore: 'Thành thạo không phải khi ngươi làm được. Mà khi ngươi làm mà không cần nghĩ.',
    baseChance: 0.035,
    effect: { type: 'permanent_stat', stat: 'danBonus', value: 8 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['alchemy', 'array'],
    extraCondition: (G) =>
      (G.stage ?? 1) >= 4 && (G.stage ?? 1) <= 7 &&
      (G.flags?.unlockedProfessions ?? []).length >= 1,
  },

  // --- Tier 2 ---
  {
    id: 'lk_dao_resonance',
    name: 'Đạo Lý Chợt Thấu', tier: 2, emoji: '💡',
    desc: 'Không phải trong lúc thiền định mà khi đang nhặt củi — ngươi đột nhiên hiểu một tầng đạo lý mà tháng trước còn mù tịt.',
    lore: 'Ngộ đạo không cần tư thế. Nó đến khi tâm thật sự buông — dù tay đang làm gì.',
    baseChance: 0.010,
    effect: { type: 'permanent_stat_multi', stats: { ratePct: 5, expBonus: 8 } },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['meditate', 'explore'],
    extraCondition: (G) =>
      (G.stage ?? 1) >= 4 && (G.stage ?? 1) <= 7 &&
      (G.ngoTinh ?? 0) >= 45,
    cooldownSec: 259200,
  },
  {
    id: 'lk_tamcanh_tempest',
    name: 'Bão Bên Trong', tier: 2, emoji: '⛈',
    desc: 'Trong chuyến thám hiểm, gặp phải tình huống không tưởng — và ngươi vượt qua không bằng sức mạnh mà bằng bình tĩnh. Tâm Cảnh tăng thật sự là vậy.',
    lore: 'Sức mạnh thật sự không phải là không bị lung lay. Là bị lung lay mà vẫn đứng vững.',
    baseChance: 0.009,
    effect: { type: 'tamCanh_boost', value: 4 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore', 'combat'],
    extraCondition: (G) =>
      (G.stage ?? 1) >= 4 && (G.stage ?? 1) <= 6 &&
      (G.tamCanh ?? 50) < 65,
    cooldownSec: 345600,
  },
  {
    id: 'lk_profession_mastery',
    name: 'Bước Qua Ngưỡng', tier: 2, emoji: '🏅',
    desc: 'Lần đầu tiên thứ ngươi làm tốt hơn những gì ngươi được dạy — ngươi đã không còn là học trò nữa.',
    lore: '"Có người dạy ngươi cách cầm bút. Nhưng ai dạy ngươi viết điều chưa ai viết?"',
    baseChance: 0.010,
    effect: { type: 'khivan_boost', value: 6 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['alchemy', 'array'],
    extraCondition: (G) =>
      (G.stage ?? 1) >= 4 && (G.stage ?? 1) <= 7 &&
      (G.flags?.unlockedProfessions ?? []).length >= 1,
    cooldownSec: 432000,
  },
  {
    id: 'lk_elder_nod',
    name: 'Lão Nhân Gật Đầu', tier: 2, emoji: '👁',
    desc: 'Một ẩn tu già đang ngồi bên đường. Ngươi cúi đầu qua. Ông nhìn ngươi một lúc rồi gật đầu — không nói gì. Cảm giác đó theo ngươi cả tuần.',
    lore: 'Không phải lời khen nào cũng bằng lời. Đôi khi một cái gật đầu từ đúng người đúng lúc còn có giá hơn một năm tu luyện.',
    baseChance: 0.009,
    effect: { type: 'ngoTinh_boost', value: 3 },
    unlockRealm: 0, maxRealm: 0,
    conditions: ['explore', 'meditate'],
    extraCondition: (G) =>
      (G.stage ?? 1) >= 5 && (G.stage ?? 1) <= 7 &&
      ((G.ngoTinh ?? 50) >= 50 || (G.tamCanh ?? 50) >= 50),
    cooldownSec: 345600,
  },

];

// ============================================================
// ENGINE
// ============================================================

// Mức trần khiVan theo loại linh căn — NGU LC không được > 45
export function getKhiVanMax(G) {
  const TYPE_MAXES = { NGU: 45, TU: 55, TAM: 65, SONG: 75, BIEN_DI: 90, TIEN: 100 };
  const type = G.spiritData?.type;
  if (TYPE_MAXES[type] !== undefined) return TYPE_MAXES[type];
  // Legacy fallback (spiritRoot string cũ)
  const LEGACY_MAXES = { tu:35, mu:40, jin:45, huo:45, shui:55, yin_yang:75, hun:95 };
  return LEGACY_MAXES[G.spiritRoot] ?? 45;
}

export function getLuckMultiplier(G) {
  const khiVan = G.khiVan ?? 20;
  if (khiVan < 30) return 0;

  const khiVanMult = 0.5 + ((khiVan - 30) / 70) * 2.5;

  let rootMult = 1.0;
  if (G.spiritData?.type === 'BIEN_DI') rootMult = 2.5;
  else if (G.spiritData?.type === 'TIEN')  rootMult = 1.5;
  else if (G.spiritData?.type === 'SONG')  rootMult = 1.2;
  if (!G.spiritData) {
    const legacyBonus = { yin_yang: 1.5, hun: 2.5, shui: 1.2, mu: 1.1 };
    rootMult = legacyBonus[G.spiritRoot] || 1.0;
  }
  if (G.spiritData?.mainElement === 'am') rootMult *= 2.0;

  const realmBonus   = 1 + (G.realmIdx || 0) * 0.05;
  const phapDiaBonus = G.phapDia?.currentId === 'dong_phu' ? 1.5
    : G.phapDia?.currentId === 'bao_dia' ? 2.0 : 1.0;

  // Ngộ Tính — người hiểu sâu dễ nhận ra và nắm bắt cơ duyên hơn
  const ngoTinh = G.ngoTinh ?? 50;
  const ngoTinhBonus = ngoTinh < 30 ? 0.9
    : ngoTinh < 60  ? 1.0
    : ngoTinh < 80  ? 1.10
    : ngoTinh < 95  ? 1.20
    : 1.35;

  return khiVanMult * rootMult * realmBonus * phapDiaBonus * ngoTinhBonus;
}

export function rollCoDuyen(G, actionType) {
  const STARTER_NODES = ['thanh_phong_thon','hoa_diem_thon','han_bang_thon','lam_hai_thon'];
  if (G.worldMap?.currentNodeId && STARTER_NODES.includes(G.worldMap.currentNodeId)) {
    return null;
  }
  const globalCd = Number(G._coDuyenGlobalCd || 0);
  if (Date.now() < globalCd) return null;

  const luckMult = getLuckMultiplier(G);
  if (luckMult === 0) return null;

  const currentZone = G.worldMap?.currentNodeId || '';

  const candidates = CO_DUYEN_EVENTS.filter(e => {
    if (!e.conditions.includes(actionType)) return false;
    if (G.realmIdx < (e.unlockRealm || 0)) return false;
    if (e.maxRealm !== undefined && G.realmIdx > e.maxRealm) return false;
    if (_isOnCooldown(G, e.id)) return false;
    if (e.requireSect && !G.sectId) return false;
    // extraCondition(G): điều kiện bổ sung dành riêng cho event đặc biệt
    // (ví dụ: chưa unlock nghề, chưa có linh thú, cần stat ngưỡng cụ thể, ...)
    if (e.extraCondition && !e.extraCondition(G)) return false;
    return true;
  });

  for (const event of candidates) {
    let chance = (event.baseChance / 3) * luckMult;
    // Zone bonus: +50% nếu đang ở zone phù hợp
    if (event.zoneBonus?.includes(currentZone)) chance *= 1.5;
    if (Math.random() < chance) {
      // Cooldown tỉ lệ NGHỊCH với khí vận:
      // khiVan=100 → 1 năm game (17520s thực) — ngắn nhất
      // khiVan=30  → 5 năm game (87600s thực) — dài nhất
      const kv = G.khiVan ?? 30;
      const scale = 1 + (1 - (kv - 30) / 70) * 4;
      G._coDuyenGlobalCd = Date.now() + Math.floor(17520000 * scale);
      return applyCoduyen(G, event);
    }
  }
  return null;
}

export function applyCoduyen(G, event) {
  _setCooldown(G, event.id, event.tier === 3 ? 86400 : event.tier === 2 ? 3600 : 600);

  const khiVanCost = [0, 5, 15, 30][event.tier] || 5;
  G.khiVan = Math.max(0, (G.khiVan ?? 20) - khiVanCost);

  const effect = event.effect;
  let detail = '';

  switch (effect.type) {
    case 'lifespan': {
      const result = addLifespanBonus(G, effect.years, effect.source);
      detail = result.msg;
      break;
    }
    case 'exp_burst': {
      G.exp = (G.exp || 0) + effect.amount;
      detail = `+${effect.amount} kinh nghiệm tu luyện`;
      break;
    }
    case 'qi_burst': {
      const add = Math.floor((G.qi || 100) * effect.pct);
      G.qi = (G.qi || 0) + add;
      detail = `+${add} linh lực`;
      break;
    }
    case 'permanent_stat': {
      G[effect.stat] = (G[effect.stat] || 0) + effect.value;
      const statNames = {
        ratePct: 'tốc độ tu luyện', hpPct: 'HP tối đa', atkPct: 'công kích',
        defPct: 'phòng thủ', danBonus: 'kỹ thuật luyện đan', arrayBonus: 'trận pháp',
        expBonus: 'kinh nghiệm', stoneBonus: 'linh thạch',
      };
      detail = `+${effect.value}${effect.stat.endsWith('Pct') || effect.stat.endsWith('Bonus') ? '%' : ''} ${statNames[effect.stat] || effect.stat} vĩnh viễn`;
      break;
    }
    case 'permanent_stat_multi': {
      const parts = [];
      for (const [stat, val] of Object.entries(effect.stats)) {
        G[stat] = (G[stat] || 0) + val;
        parts.push(`+${val}% ${stat}`);
      }
      detail = parts.join(', ') + ' vĩnh viễn';
      break;
    }
    case 'phapdia_temp': {
      if (!G.phapDia) G.phapDia = { currentId: 'pham_dia', expiresAt: null };
      G.phapDia.currentId = effect.phapDiaId;
      G.phapDia.expiresAt = Date.now() + effect.duration * 1000;
      const phapNames = { dong_phu: 'Động Phủ ×3.0', phuc_dia: 'Phúc Địa ×1.8', bao_dia: 'Bảo Địa ×5.0' };
      detail = `${phapNames[effect.phapDiaId] || effect.phapDiaId} trong ${Math.floor(effect.duration / 60)} phút!`;
      break;
    }
    case 'phapdia_temp_bao_dia': {
      if (!G.phapDia) G.phapDia = { currentId: 'pham_dia', expiresAt: null };
      G.phapDia.currentId = 'bao_dia';
      G.phapDia.expiresAt = Date.now() + effect.duration * 1000;
      detail = `Bảo Địa ×5.0 trong ${Math.floor(effect.duration / 60)} phút!`;
      break;
    }
    case 'unlock_congphap_mid': {
      if (!G.congPhap) G.congPhap = { currentId: 'vo_danh', unlockedIds: [] };
      const midId = {
        kiem_tong: 'kiem_quyet_trung', dan_tong: 'dan_kinh_trung',
        tran_phap: 'tran_phap_trung',  the_tu: 'the_tu_trung',
      }[G.sectId] || 'kiem_quyet_trung';
      if (!G.congPhap.unlockedIds.includes(midId)) {
        G.congPhap.unlockedIds.push(midId);
        G.congPhap.currentId = midId;
        detail = `Mở khóa và tu luyện Trung Phẩm Công Pháp!`;
      } else {
        G.stone = (G.stone || 0) + 2000;
        detail = `Đã có công pháp này — nhận 2000 linh thạch thay thế`;
      }
      break;
    }
    case 'unlock_congphap_high': {
      if (!G.congPhap) G.congPhap = { currentId: 'vo_danh', unlockedIds: [] };
      const highId = {
        kiem_tong: 'kiem_quyet_thuong', dan_tong: 'dan_kinh_thuong',
      }[G.sectId];
      if (highId) {
        G.congPhap.unlockedIds.push(highId);
        G.congPhap.currentId = highId;
        detail = `Thượng Phẩm Công Pháp! Tốc độ ×2.5!`;
      } else {
        G.stone = (G.stone || 0) + 10000;
        detail = `Tông môn không có Thượng Phẩm — nhận 10000 linh thạch`;
      }
      break;
    }
    case 'breakthrough_chance': {
      // G._breakthroughCoDuyenBonus được cộng thẳng vào P trong calcBreakthroughChance
      // +0.15 = +15 điểm % tỷ lệ đột phá lần tới (reset sau khi dùng)
      G._breakthroughCoDuyenBonus = (G._breakthroughCoDuyenBonus ?? 0) + 0.15;
      detail = `Thiên đạo cảm ngộ — tỷ lệ đột phá +15% lần tới!`;
      break;
    }
    case 'add_ingredient': {
      if (!G.alchemy) G.alchemy = { ingredients: {} };
      if (!G.alchemy.ingredients) G.alchemy.ingredients = {};
      G.alchemy.ingredients[effect.itemId] = (G.alchemy.ingredients[effect.itemId] || 0) + effect.qty;
      detail = `Nhận được ${effect.itemId} ×${effect.qty}`;
      break;
    }
    case 'stone_reward': {
      const amount = Math.floor(Math.random() * (effect.max - effect.min + 1)) + effect.min;
      G.stone = (G.stone || 0) + amount;
      detail = `+${amount} linh thạch`;
      break;
    }
    case 'all_stats_small': {
      G.atk  = Math.floor((G.atk || 10)  * 1.05);
      G.def  = Math.floor((G.def || 5)   * 1.05);
      G.maxHp = Math.floor((G.maxHp || 100) * 1.05);
      G.qiBonus = (G.qiBonus || 0) + 2;
      detail = `Tất cả chỉ số +5% vĩnh viễn`;
      break;
    }
    case 'unlock_profession': {
      if (!G.flags) G.flags = {};
      if (!Array.isArray(G.flags.unlockedProfessions)) G.flags.unlockedProfessions = [];
      const { profId } = effect;
      const PROF_NAMES = {
        luyen_dan: 'Luyện Đan', luyen_khi: 'Luyện Khí',
        tran_phap: 'Trận Pháp', phu_chu: 'Phù Chú',
        khoi_loi: 'Khôi Lỗi', linh_thuc: 'Linh Thực',
      };
      if (!G.flags.unlockedProfessions.includes(profId)) {
        G.flags.unlockedProfessions.push(profId);
        detail = `Mở khoá nghề phụ: ${PROF_NAMES[profId] || profId}!`;
      } else {
        detail = `Đã biết ${PROF_NAMES[profId] || profId} — nhận thêm kinh nghiệm`;
        G.exp = (G.exp || 0) + 1000;
      }
      break;
    }
        case 'khivan_boost': {
      const prev = G.khiVan ?? 20;
      G.khiVan = Math.min(getKhiVanMax(G), prev + (effect.value || 5));
      detail = `+${effect.value || 5} Khí Vận (${prev} → ${G.khiVan})`;
      break;
    }
    case 'purity_burst': {
      // Tăng tức thì độ tinh thuần hiện tại — giúp LK dead zone có cảm giác tiến triển
      // amount: tỷ lệ tăng (0.05 = +5% về phía ngưỡng đột phá)
      const pt = calcPurityThreshold(G);
      const purityNeeded = pt - (G.purity ?? 0);
      const add = Math.floor(purityNeeded * (effect.amount || 0.05));
      G.purity = Math.min(pt, (G.purity ?? 0) + add);
      detail = `Tâm cảnh khai sáng — tinh thuần +${add} (${Math.round((G.purity / Math.max(1, pt)) * 100)}%)`;
      break;
    }
    case '_btFailStreak_reset': {
      // Sau chuỗi thất bại đột phá, cơ duyên giúp ngộ đạo — reset streak và bù purity
      const streak = G._btFailStreak ?? 0;
      G._btFailStreak = 0;
      G._btFailCooldownUntil = 0;
      const ptReset = calcPurityThreshold(G);
      const bonus = Math.min(Math.floor(ptReset * 0.15), streak * 8);
      G.purity = Math.min(ptReset, (G.purity ?? 0) + bonus);
      detail = `Thất bại ${streak} lần → Ngộ Đạo! Tinh thuần +${bonus}, streak & cooldown đột phá reset`;
      break;
    }
    // --- SPRINT 3: Age Crisis effect types ---
    case 'ngoTinh_boost': {
      const prevNT = G.ngoTinh ?? 50;
      G.ngoTinh = Math.min(100, prevNT + (effect.value || 3));
      detail = `Ngộ Tính +${effect.value || 3} (${prevNT} → ${G.ngoTinh}/100)`;
      break;
    }
    case 'tamCanh_boost': {
      const prevTC = G.tamCanh ?? 50;
      G.tamCanh = Math.min(100, prevTC + (effect.value || 3));
      detail = `Tâm Cảnh +${effect.value || 3} (${prevTC} → ${G.tamCanh}/100)`;
      break;
    }
    case 'risky_lifespan': {
      // Linh dược đánh cược — thành công +thọ, thất bại -thọ và -căn cốt
      const roll = Math.random();
      if (roll < (effect.successPct ?? 0.60)) {
        const result = addLifespanBonus(G, effect.successYears, event.name);
        detail = `✨ Linh dược hiệu nghiệm! ${result.msg}`;
      } else {
        if (!G.gameTime) G.gameTime = {};
        G.gameTime.lifespanMax = Math.max(10, (G.gameTime.lifespanMax ?? 120) + (effect.failYears ?? -8));
        if (effect.failCanCotPenalty) {
          G.canCot = Math.max(1, (G.canCot ?? 50) - effect.failCanCotPenalty);
        }
        detail = `💥 Linh dược phản tác dụng! Thọ mệnh ${effect.failYears ?? -8} năm, Căn Cốt -${effect.failCanCotPenalty ?? 0}`;
      }
      break;
    }
  }

  addChronicle(G, `Kỳ Ngộ: ${event.name}`, detail);
  bus.emit('coduyen:triggered', { event, detail });

  // Cơ duyên tier cao có thể cải thiện khí vận (ngẫu nhiên)
  // tier2: +1~3 | tier3: +3~6 — phản ánh "thiên đạo ưu ái"
  // Luôn clamp theo trần của loại linh căn
  if (event.tier >= 2) {
    const boost = event.tier === 3
      ? Math.floor(Math.random() * 4) + 3
      : Math.floor(Math.random() * 3) + 1;
    G.khiVan = Math.min(getKhiVanMax(G), (G.khiVan ?? 20) + boost);
  }

  return {
    ok: true, event, detail,
    tier: event.tier,
    msg: `${event.emoji} ${event.name}`,
    type: event.tier === 3 ? 'legendary' : event.tier === 2 ? 'epic' : 'jade',
  };
}

function _isOnCooldown(G, eventId) {
  return Date.now() < (G._coDuyenCooldowns?.[eventId] || 0);
}

function _setCooldown(G, eventId, seconds) {
  if (!G._coDuyenCooldowns) G._coDuyenCooldowns = {};
  G._coDuyenCooldowns[eventId] = Date.now() + seconds * 1000;
}

// ============================================================
// NPC RIVALS — Encounter System (P11)
// Đối thủ xuất hiện theo cảnh giới tương đương player
// ============================================================

// Danh Vọng nhận được khi đánh thắng đối thủ theo realmIdx
export const RIVAL_DV_REWARD = [10, 22, 50, 90, 150];

// Cooldown giữa các lần gặp đối thủ: 4 giờ real time
const RIVAL_COOLDOWN_MS = 4 * 3600 * 1000;

// Xác suất cơ bản mỗi action
const RIVAL_BASE_CHANCE = 0.004;

/**
 * rollRivalEncounter(G, actionType)
 * Gọi từ cultivation.js (explore) và combat-engine.js (sau win)
 * Trả về { rival } nếu gặp đối thủ, null nếu không
 * Tự emit 'rival:encounter' bus event khi trigger
 */
export function rollRivalEncounter(G, actionType) {
  // Không trigger khi đang chiến đấu hoặc game over
  if (G.combat?.active) return null;
  if (G.gameTime?.isGameOver) return null;
  // Chỉ trigger từ explore và combat
  if (actionType !== 'explore' && actionType !== 'combat') return null;

  // Cooldown check
  const now = Date.now();
  if (now < (G._rivalEncounterCd || 0)) return null;

  // Roll xác suất
  if (Math.random() > RIVAL_BASE_CHANCE) return null;

  // Lọc đối thủ theo realmIdx tương đương (±1 từ player)
  const playerRealm = G.realmIdx || 0;
  const eligible = NPC_RIVALS.filter(r => Math.abs(r.realmIdx - playerRealm) <= 1);
  if (eligible.length === 0) return null;

  // Random chọn 1 đối thủ (chưa đánh thắng gần đây)
  const beaten = G._rivalBeaten || {};
  // Ưu tiên đối thủ chưa gặp; nếu tất cả đã gặp thì chọn ngẫu nhiên
  const notBeaten = eligible.filter(r => !beaten[r.name]);
  const pool = notBeaten.length > 0 ? notBeaten : eligible;
  const rival = pool[Math.floor(Math.random() * pool.length)];

  // Set cooldown
  G._rivalEncounterCd = now + RIVAL_COOLDOWN_MS;

  // Emit bus event — event-bus-handlers.js sẽ hiện popup
  bus.emit('rival:encounter', { rival });

  return { rival };
}
