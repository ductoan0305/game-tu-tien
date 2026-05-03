// ============================================================
// alchemy/alchemy-data.js — Recipes, pill catalog
// Chỉ là data thuần — không import state
// v2 — Mở rộng: 45 đan, 45 công thức, 20 nguyên liệu, 8 zone
// ============================================================

// ---- Pill definitions ----
// effect.type:
//   qi, hp, permanent_stamina, permanent_rate, permanent_atk, permanent_def,
//   permanent_maxhp, reduce_breakthrough, all_stats,
//   lifespan_bonus, expBonus, danBonus, stoneBonus,
//   timed_qi_rate, timed_atk, timed_def, clear_debuff,
//   hp_regen, stamina_restore
export const PILLS = [

  // ============================================================
  // TIER 1 — Phàm Phẩm (realm 0, phổ thông)
  // ============================================================
  {
    id: 'basic_qi_pill',
    name: 'Tụ Linh Đan', nameCN: '聚靈丹', emoji: '⚗',
    tier: 1, rarity: 'common',
    desc: 'Đan dược cơ bản ngưng tụ linh khí, mọi tu sĩ đều biết.',
    effect: { type: 'qi', value: 0.15 },
    unlockDefault: true,
  },
  {
    id: 'healing_pill',
    name: 'Hồi Nguyên Đan', nameCN: '回元丹', emoji: '💊',
    tier: 1, rarity: 'common',
    desc: 'Hồi phục HP nhanh chóng, thiết yếu mỗi ngày.',
    effect: { type: 'hp', value: 0.3 },
    unlockDefault: true,
  },
  {
    id: 'vigor_pill',
    name: 'Khí Lực Đan', nameCN: '氣力丹', emoji: '💪',
    tier: 1, rarity: 'uncommon',
    desc: 'Tăng thể năng vĩnh viễn một chút.',
    effect: { type: 'permanent_stamina', value: 10 },
    unlockDefault: false,
  },
  {
    id: 'qing_shen_dan',
    name: 'Khinh Thần Đan', nameCN: '輕神丹', emoji: '🍃',
    tier: 1, rarity: 'common',
    desc: 'Phục hồi thể năng nhanh, thích hợp sau khi thu thảo mệt mỏi.',
    effect: { type: 'stamina_restore', value: 40 },
    unlockDefault: true,
  },
  {
    id: 'ming_mu_dan',
    name: 'Minh Mục Đan', nameCN: '明目丹', emoji: '👁',
    tier: 1, rarity: 'common',
    desc: 'Tăng nhận thức — EXP nhận được +15% trong 5 phút.',
    effect: { type: 'timed_exp', value: 15, duration: 300 },
    unlockDefault: false,
  },
  {
    id: 'an_shen_dan',
    name: 'An Thần Đan', nameCN: '安神丹', emoji: '🌙',
    tier: 1, rarity: 'common',
    desc: 'Bình ổn thần trí, tăng hiệu quả bế quan +10% trong 8 phút.',
    effect: { type: 'timed_qi_rate', value: 10, duration: 480 },
    unlockDefault: false,
  },
  {
    id: 'zhu_ji_dan_small',
    name: 'Tiểu Trúc Cơ Đan', nameCN: '小築基丹', emoji: '🌀',
    tier: 1, rarity: 'uncommon',
    desc: 'Hỗ trợ nhỏ cho việc đột phá. Giảm 10% linh lực đột phá.',
    effect: { type: 'reduce_breakthrough', value: 0.1 },
    unlockDefault: false,
  },
  {
    id: 'bao_pi_dan',
    name: 'Bảo Bì Đan', nameCN: '保皮丹', emoji: '🛡',
    tier: 1, rarity: 'common',
    desc: 'Tăng phòng thủ tạm thời +15% trong 5 phút.',
    effect: { type: 'timed_def', value: 15, duration: 300 },
    unlockDefault: false,
  },
  {
    id: 'sha_qi_dan',
    name: 'Sát Khí Đan', nameCN: '殺氣丹', emoji: '⚔',
    tier: 1, rarity: 'common',
    desc: 'Tăng công kích tạm thời +15% trong 5 phút.',
    effect: { type: 'timed_atk', value: 15, duration: 300 },
    unlockDefault: false,
  },

  // ============================================================
  // TIER 2 — Địa Phẩm (realm 1, trung cấp)
  // ============================================================
  {
    id: 'cultivate_pill',
    name: 'Bồi Nguyên Đan', nameCN: '培元丹', emoji: '🌟',
    tier: 2, rarity: 'uncommon',
    desc: 'Tăng vĩnh viễn tốc độ tu luyện.',
    effect: { type: 'permanent_rate', value: 2.0 },
    unlockDefault: false,
  },
  {
    id: 'strength_pill',
    name: 'Thiên Hổ Đan', nameCN: '天虎丹', emoji: '🐯',
    tier: 2, rarity: 'rare',
    desc: 'Tăng vĩnh viễn sức công kích.',
    effect: { type: 'permanent_atk', value: 10 },
    unlockDefault: false,
  },
  {
    id: 'defense_pill',
    name: 'Kim Cương Đan', nameCN: '金剛丹', emoji: '🛡',
    tier: 2, rarity: 'rare',
    desc: 'Tăng vĩnh viễn phòng thủ.',
    effect: { type: 'permanent_def', value: 8 },
    unlockDefault: false,
  },
  {
    id: 'shou_yuan_dan_1',
    name: 'Tiểu Thọ Nguyên Đan', nameCN: '小壽元丹', emoji: '🌿',
    tier: 2, rarity: 'uncommon',
    desc: 'Kéo dài thọ mệnh thêm 10 năm. Giới hạn tối đa theo cảnh giới.',
    effect: { type: 'lifespan_bonus', value: 10 },
    element: 'moc',
  },
  {
    id: 'ling_tri_dan',
    name: 'Linh Trí Đan', nameCN: '靈智丹', emoji: '📖',
    tier: 2, rarity: 'uncommon',
    desc: 'Tăng Ngộ Tính — EXP nhận được +30% trong 10 phút.',
    effect: { type: 'timed_exp', value: 30, duration: 600 },
  },
  {
    id: 'kim_linh_dan',
    name: 'Kim Linh Đan', nameCN: '金靈丹', emoji: '⚔',
    tier: 2, rarity: 'uncommon',
    desc: 'Hệ Kim — tăng vĩnh viễn ATK. Kim linh căn dùng hiệu quả hơn.',
    effect: { type: 'permanent_atk', value: 15 },
    element: 'kim',
  },
  {
    id: 'moc_sinh_dan',
    name: 'Mộc Sinh Đan', nameCN: '木生丹', emoji: '🌿',
    tier: 2, rarity: 'uncommon',
    desc: 'Hệ Mộc — tăng HP tối đa vĩnh viễn.',
    effect: { type: 'permanent_maxhp', value: 200 },
    element: 'moc',
  },
  {
    id: 'thuy_nguyen_dan',
    name: 'Thủy Nguyên Đan', nameCN: '水元丹', emoji: '💧',
    tier: 2, rarity: 'uncommon',
    desc: 'Hệ Thủy — tăng tốc độ tu luyện vĩnh viễn.',
    effect: { type: 'permanent_rate', value: 1.5 },
    element: 'thuy',
  },
  {
    id: 'hoa_linh_dan',
    name: 'Hỏa Linh Đan', nameCN: '火靈丹', emoji: '🔥',
    tier: 2, rarity: 'uncommon',
    desc: 'Hệ Hỏa — tăng hiệu quả luyện đan +20. Hỏa linh căn cực phẩm.',
    effect: { type: 'danBonus', value: 20 },
    element: 'hoa',
  },
  {
    id: 'tho_thu_dan',
    name: 'Thổ Thủ Đan', nameCN: '土守丹', emoji: '🗿',
    tier: 2, rarity: 'uncommon',
    desc: 'Hệ Thổ — tăng DEF vĩnh viễn.',
    effect: { type: 'permanent_def', value: 12 },
    element: 'tho',
  },
  {
    id: 'zhu_qi_dan',
    name: 'Trú Khí Đan', nameCN: '駐氣丹', emoji: '💫',
    tier: 2, rarity: 'uncommon',
    desc: 'Duy trì linh lực ổn định — +20% tốc độ bế quan trong 15 phút.',
    effect: { type: 'timed_qi_rate', value: 20, duration: 900 },
  },
  {
    id: 'jing_xue_dan',
    name: 'Tịnh Huyết Đan', nameCN: '淨血丹', emoji: '🩸',
    tier: 2, rarity: 'uncommon',
    desc: 'Thanh lọc máu huyết — hồi phục 50% HP, giải trừ debuff.',
    effect: { type: 'clear_debuff' },
  },
  {
    id: 'han_bing_dan',
    name: 'Hàn Băng Đan', nameCN: '寒冰丹', emoji: '🧊',
    tier: 2, rarity: 'rare',
    desc: 'Hệ Băng — Tăng DEF +10 vĩnh viễn và làm chậm kẻ địch.',
    effect: { type: 'permanent_def', value: 10 },
    element: 'bang',
  },
  {
    id: 'lei_dao_dan',
    name: 'Lôi Đạo Đan', nameCN: '雷道丹', emoji: '⚡',
    tier: 2, rarity: 'rare',
    desc: 'Hệ Lôi — Tăng ATK +12 vĩnh viễn, có thể gây stun.',
    effect: { type: 'permanent_atk', value: 12 },
    element: 'loi',
  },

  // ============================================================
  // TIER 3 — Thiên Phẩm (realm 2, cao cấp)
  // ============================================================
  {
    id: 'breakthrough_aid',
    name: 'Thiên Long Đại Đan', nameCN: '天龍大丹', emoji: '🐉',
    tier: 3, rarity: 'epic',
    desc: 'Giảm 20% linh lực cần cho đột phá tiếp theo.',
    effect: { type: 'reduce_breakthrough', value: 0.2 },
    unlockDefault: false,
  },
  {
    id: 'lifespan_pill',
    name: 'Diên Thọ Đan', nameCN: '延壽丹', emoji: '☯',
    tier: 3, rarity: 'epic',
    desc: 'Tăng HP tối đa vĩnh viễn rất nhiều.',
    effect: { type: 'permanent_maxhp', value: 500 },
    unlockDefault: false,
  },
  {
    id: 'shou_yuan_dan_2',
    name: 'Trung Thọ Nguyên Đan', nameCN: '中壽元丹', emoji: '💙',
    tier: 3, rarity: 'rare',
    desc: 'Kéo dài thọ mệnh thêm 25 năm.',
    effect: { type: 'lifespan_bonus', value: 25 },
    element: 'moc',
  },
  {
    id: 'truc_co_dan',
    name: 'Trúc Cơ Đan', nameCN: '築基丹', emoji: '🌀',
    tier: 3, rarity: 'rare',
    desc: 'Hỗ trợ đột phá Trúc Cơ. Giảm 30% linh lực cần cho đột phá kế.',
    effect: { type: 'reduce_breakthrough', value: 0.3 },
    unlockRealm: 0,
  },
  {
    id: 'zhen_qi_dan',
    name: 'Chân Khí Đan', nameCN: '真氣丹', emoji: '🌊',
    tier: 3, rarity: 'epic',
    desc: 'Tổng hợp linh khí thuần túy — +5 linh lực/s vĩnh viễn.',
    effect: { type: 'permanent_rate', value: 5.0 },
  },
  {
    id: 'tian_gang_dan',
    name: 'Thiên Cương Đan', nameCN: '天罡丹', emoji: '🗡',
    tier: 3, rarity: 'epic',
    desc: 'Linh khí thiên cương — ATK +25 vĩnh viễn.',
    effect: { type: 'permanent_atk', value: 25 },
  },
  {
    id: 'xuan_tie_dan',
    name: 'Huyền Thiết Đan', nameCN: '玄鐵丹', emoji: '⛓',
    tier: 3, rarity: 'epic',
    desc: 'Cứng như thiên thiết — DEF +20 vĩnh viễn.',
    effect: { type: 'permanent_def', value: 20 },
  },
  {
    id: 'wang_ling_dan',
    name: 'Vạn Linh Đan', nameCN: '萬靈丹', emoji: '✨',
    tier: 3, rarity: 'epic',
    desc: 'Linh lực vạn hóa — tăng linh thạch nhận được +25% tạm thời trong 20 phút.',
    effect: { type: 'timed_stone', value: 25, duration: 1200 },
  },
  {
    id: 'pi_li_dan',
    name: 'Tích Lịch Đan', nameCN: '霹靂丹', emoji: '🌩',
    tier: 3, rarity: 'epic',
    desc: 'Sức mạnh lôi thiên — ATK tạm thời +60% trong 10 phút.',
    effect: { type: 'timed_atk', value: 60, duration: 600 },
    element: 'loi',
  },
  {
    id: 'bing_xin_dan',
    name: 'Băng Tâm Đan', nameCN: '冰心丹', emoji: '❄',
    tier: 3, rarity: 'rare',
    desc: 'Tâm như băng tuyết — giải trừ toàn bộ debuff, hồi 80% HP.',
    effect: { type: 'clear_debuff_full' },
  },
  {
    id: 'dan_dao_dan',
    name: 'Đan Đạo Đan', nameCN: '丹道丹', emoji: '⚗',
    tier: 3, rarity: 'rare',
    desc: 'Thông hiểu đạo luyện đan — danBonus +35 vĩnh viễn.',
    effect: { type: 'danBonus', value: 35 },
  },

  // ============================================================
  // ---- Đặc Biệt — Hồi Phục Ám Thương ----
  {
    id: 'tai_sinh_dan',
    name: 'Tái Sinh Đan', nameCN: '再生丹', emoji: '🩹',
    tier: 3, rarity: 'epic',
    desc: 'Đan dược chữa lành vết thương ẩn tàng trong kinh mạch. Hồi phục 15 điểm Ám Thương, khôi phục Căn Cốt tương ứng.',
    effect: { type: 'heal_am_thuong', value: 15 },
    unlockDefault: false,
  },

  // TIER 4 — Thần Phẩm (realm 3+, cực hiếm)
  // ============================================================
  {
    id: 'heaven_pill',
    name: 'Thiên Địa Hóa Nguyên Đan', nameCN: '天地化元丹', emoji: '☀',
    tier: 4, rarity: 'legendary',
    desc: 'Đan phẩm tối thượng — tăng toàn bộ chỉ số vĩnh viễn +15%.',
    effect: { type: 'all_stats', value: 0.15 },
    unlockDefault: false,
  },
  {
    id: 'shou_yuan_dan_3',
    name: 'Đại Thọ Nguyên Đan', nameCN: '大壽元丹', emoji: '💛',
    tier: 4, rarity: 'epic',
    desc: 'Kéo dài thọ mệnh thêm 50 năm. Cực hiếm.',
    effect: { type: 'lifespan_bonus', value: 50 },
    element: 'moc',
  },
  {
    id: 'jin_dan_da_cheng',
    name: 'Kim Đan Đại Thành Đan', nameCN: '金丹大成丹', emoji: '🔮',
    tier: 4, rarity: 'legendary',
    desc: 'Hỗ trợ cảnh giới Kim Đan — giảm 40% linh lực đột phá.',
    effect: { type: 'reduce_breakthrough', value: 0.4 },
    unlockRealm: 2,
  },
  {
    id: 'tian_di_dan',
    name: 'Thiên Địa Đan', nameCN: '天地丹', emoji: '🌌',
    tier: 4, rarity: 'legendary',
    desc: 'Thọ mệnh +30 năm và tất cả chỉ số +10% vĩnh viễn.',
    effect: { type: 'all_stats_lifespan', value: 0.10, lifespan: 30 },
  },
  {
    id: 'yuan_ying_dan',
    name: 'Nguyên Anh Đan', nameCN: '元嬰丹', emoji: '👼',
    tier: 4, rarity: 'legendary',
    desc: 'Thần đan hỗ trợ hình thành Nguyên Anh — giảm 50% yêu cầu đột phá.',
    effect: { type: 'reduce_breakthrough', value: 0.5 },
    unlockRealm: 3,
  },
  {
    id: 'hun_yuan_dan',
    name: 'Hỗn Nguyên Đan', nameCN: '混元丹', emoji: '🔱',
    tier: 4, rarity: 'legendary',
    desc: 'Dung hợp ngũ hành — tăng tất cả chỉ số +20% vĩnh viễn.',
    effect: { type: 'all_stats', value: 0.20 },
    unlockRealm: 4,
  },

  // ============================================================
  // ĐỊA PHỦ ĐỘC QUYỀN — chỉ luyện từ nguyên liệu Địa Phủ
  // ============================================================
  {
    id: 'am_tinh_dan', name: 'Ám Tinh Đan', nameCN: '暗晶丹', emoji: '🔮',
    tier: 3, rarity: 'epic',
    desc: 'Luyện từ Ám Tinh Thạch địa phủ — tăng phòng ngự và HP trong thời gian dài.',
    effect: { type: 'timed_def', value: 40, duration: 1800 },
    unlockRealm: 2,
  },
  {
    id: 'hon_phach_dan', name: 'Hồn Phách Đan', nameCN: '魂魄丹', emoji: '💠',
    tier: 3, rarity: 'epic',
    desc: 'Tinh luyện từ Hồn Phách Mảnh — tăng mạnh tốc độ tu luyện theo thời gian.',
    effect: { type: 'timed_qi_rate', value: 50, duration: 1200 },
    unlockRealm: 2,
  },
  {
    id: 'hu_khong_dan', name: 'Hư Không Đan', nameCN: '虛空丹', emoji: '🌌',
    tier: 4, rarity: 'legendary',
    desc: 'Chưng cất Hư Không Tinh Tủy — tăng vĩnh viễn tốc độ tu luyện.',
    effect: { type: 'permanent_rate', value: 3.0 },
    unlockRealm: 3,
  },
  {
    id: 'dia_nguc_dan', name: 'Địa Ngục Hỏa Đan', nameCN: '地獄火丹', emoji: '🔥',
    tier: 4, rarity: 'legendary',
    desc: 'Rèn từ ngọn lửa địa ngục — tăng ATK đột biến trong 10 phút.',
    effect: { type: 'timed_atk', value: 120, duration: 600 },
    unlockRealm: 3,
  },
  {
    id: 'thien_ma_dan', name: 'Thiên Ma Phá Đan', nameCN: '天魔破丹', emoji: '🌑',
    tier: 4, rarity: 'legendary',
    desc: 'Đỉnh cao Địa Phủ Đan — tăng tất cả chỉ số +10% vĩnh viễn.',
    effect: { type: 'all_stats', value: 0.10 },
    unlockRealm: 4,
  },
];

// ---- Ingredient definitions (for display name lookup) ----
export const INGREDIENTS = {
  // Tier 1 — phổ thông
  spirit_herb:      { name: 'Linh Thảo',         emoji: '🌿', zone: 'spirit_forest' },
  jade_lotus:       { name: 'Bạch Ngọc Liên',     emoji: '🪷', zone: 'spirit_forest' },
  wolf_fang:        { name: 'Nanh Sói Đen',        emoji: '🦷', zone: 'demon_wilds' },
  earth_stone:      { name: 'Thổ Tinh Thạch',      emoji: '🪨', zone: 'demon_wilds' },
  fire_essence:     { name: 'Hỏa Tinh Hoa',        emoji: '🔥', zone: 'demon_wilds' },
  rabbit_fur:       { name: 'Linh Thố Lông',       emoji: '🐇', zone: 'spirit_forest' },
  // Tier 2 — trung cấp
  serpent_scale:    { name: 'Xà Ngạnh Linh',       emoji: '🐍', zone: 'ice_mountain' },
  ice_crystal:      { name: 'Băng Tinh Thể',        emoji: '💎', zone: 'ice_mountain' },
  blood_ginseng:    { name: 'Huyết Sâm',            emoji: '🌱', zone: 'ice_mountain' },
  demon_core_1:     { name: 'Yêu Hạch Sơ Cấp',     emoji: '🔴', zone: 'demon_wilds' },
  hawk_feather:     { name: 'Ưng Vũ Linh',          emoji: '🪶', zone: 'thunder_peak' },
  cloud_mushroom:   { name: 'Vân Linh Cô',          emoji: '🍄', zone: 'cloud_valley' },
  moon_dew:         { name: 'Nguyệt Lộ Thảo',       emoji: '🌙', zone: 'cloud_valley' },
  // Tier 3 — cao cấp
  lightning_core:   { name: 'Lôi Tinh Hạch',        emoji: '⚡', zone: 'thunder_peak' },
  phoenix_feather:  { name: 'Phượng Vũ',            emoji: '🦅', zone: 'fire_plains' },
  crimson_herb:     { name: 'Xích Linh Thảo',        emoji: '🌺', zone: 'fire_plains' },
  void_grass:       { name: 'Hư Không Cỏ',           emoji: '🌌', zone: 'void_realm' },
  dark_essence:     { name: 'Ám Tinh Tủy',           emoji: '🌑', zone: 'void_realm' },
  demon_core_2:     { name: 'Yêu Hạch Trung Cấp',   emoji: '🟠', zone: 'abyss_cave' },
  demon_core_3:     { name: 'Yêu Hạch Thượng Cấp',  emoji: '🟡', zone: 'abyss_cave' },
  // Tier 4 — huyền thoại
  heaven_stone:     { name: 'Thiên Địa Linh Thạch', emoji: '✨', zone: 'void_realm' },
  dragon_scale:     { name: 'Long Lân',              emoji: '🐲', zone: 'dragon_nest' },
  immortal_root:    { name: 'Tiên Căn',              emoji: '☘',  zone: 'dragon_nest' },
  chaos_pearl:      { name: 'Hỗn Độn Minh Châu',    emoji: '🔮', zone: 'chaos_rift' },
  // Địa Phủ — chỉ thu từ dungeon
  dark_crystal:       { name: 'Ám Tinh Thạch',      emoji: '🔮', zone: 'dungeon' },
  soul_shard:         { name: 'Hồn Phách Mảnh',     emoji: '💠', zone: 'dungeon' },
  void_essence:       { name: 'Hư Không Tinh Tủy',  emoji: '🌌', zone: 'dungeon' },
  hell_flame_essence: { name: 'Địa Ngục Hỏa Tinh',  emoji: '🔥', zone: 'dungeon' },
  demon_soul_crystal: { name: 'Thiên Ma Hồn Tinh',  emoji: '🌑', zone: 'dungeon' },
};

// ---- Recipe definitions ----
export const RECIPES = [

  // ---- Đặc Biệt ----
  {
    id: 'tai_sinh_dan', pillId: 'tai_sinh_dan',
    name: 'Công Thức Tái Sinh Đan', tier: 3,
    ingredients: [
      { id: 'blood_ginseng',  qty: 2 },
      { id: 'jade_lotus',     qty: 3 },
      { id: 'spirit_herb',    qty: 5 },
    ],
    stoneCost: 150, successChance: 0.55, failEffect: 'lose_ingredients',
    unlockRealm: 1, craftTime: 10,
    desc: 'Chữa lành Ám Thương ẩn tàng trong kinh mạch — cần nguyên liệu quý và tay nghề cao.',
  },

  // ============================================================
  // TIER 1
  // ============================================================
  {
    id: 'basic_qi_pill', pillId: 'basic_qi_pill',
    name: 'Công Thức Tụ Linh Đan', tier: 1,
    ingredients: [{ id: 'spirit_herb', qty: 2 }],
    stoneCost: 10, successChance: 0.80, failEffect: 'nothing',
    unlockRealm: 0, craftTime: 3,
    desc: 'Công thức cơ bản nhất, khó thất bại.',
  },
  {
    id: 'healing_pill', pillId: 'healing_pill',
    name: 'Công Thức Hồi Nguyên Đan', tier: 1,
    ingredients: [{ id: 'spirit_herb', qty: 1 }, { id: 'jade_lotus', qty: 1 }],
    stoneCost: 15, successChance: 0.75, failEffect: 'nothing',
    unlockRealm: 0, craftTime: 4,
    desc: 'Đan hồi HP, cần hoa sen linh.',
  },
  {
    id: 'qing_shen_dan', pillId: 'qing_shen_dan',
    name: 'Công Thức Khinh Thần Đan', tier: 1,
    ingredients: [{ id: 'spirit_herb', qty: 2 }, { id: 'rabbit_fur', qty: 1 }],
    stoneCost: 12, successChance: 0.80, failEffect: 'nothing',
    unlockRealm: 0, craftTime: 3,
    desc: 'Đan phục hồi thể năng.',
  },
  {
    id: 'vigor_pill', pillId: 'vigor_pill',
    name: 'Công Thức Khí Lực Đan', tier: 1,
    ingredients: [{ id: 'spirit_herb', qty: 2 }, { id: 'wolf_fang', qty: 1 }],
    stoneCost: 25, successChance: 0.65, failEffect: 'lose_half',
    unlockRealm: 0, craftTime: 5,
    desc: 'Kết hợp thảo dược và nanh sói, cần kỹ thuật.',
  },
  {
    id: 'ming_mu_dan', pillId: 'ming_mu_dan',
    name: 'Công Thức Minh Mục Đan', tier: 1,
    ingredients: [{ id: 'jade_lotus', qty: 1 }, { id: 'spirit_herb', qty: 2 }],
    stoneCost: 20, successChance: 0.70, failEffect: 'nothing',
    unlockRealm: 0, craftTime: 4,
    desc: 'Khai sáng trí tuệ, tăng hấp thu EXP.',
  },
  {
    id: 'an_shen_dan', pillId: 'an_shen_dan',
    name: 'Công Thức An Thần Đan', tier: 1,
    ingredients: [{ id: 'moon_dew', qty: 1 }, { id: 'spirit_herb', qty: 1 }],
    stoneCost: 20, successChance: 0.72, failEffect: 'nothing',
    unlockRealm: 0, craftTime: 4,
    desc: 'Dùng nguyệt lộ thảo bình ổn thần trí.',
  },
  {
    id: 'sha_qi_dan', pillId: 'sha_qi_dan',
    name: 'Công Thức Sát Khí Đan', tier: 1,
    ingredients: [{ id: 'wolf_fang', qty: 1 }, { id: 'fire_essence', qty: 1 }],
    stoneCost: 22, successChance: 0.68, failEffect: 'nothing',
    unlockRealm: 0, craftTime: 4,
    desc: 'Kết hợp nanh sói và hỏa tinh, bùng sát khí.',
  },
  {
    id: 'bao_pi_dan', pillId: 'bao_pi_dan',
    name: 'Công Thức Bảo Bì Đan', tier: 1,
    ingredients: [{ id: 'earth_stone', qty: 2 }, { id: 'spirit_herb', qty: 1 }],
    stoneCost: 22, successChance: 0.70, failEffect: 'nothing',
    unlockRealm: 0, craftTime: 4,
    desc: 'Dùng thổ tinh tăng cường da thịt.',
  },
  {
    id: 'zhu_ji_dan_small', pillId: 'zhu_ji_dan_small',
    name: 'Công Thức Tiểu Trúc Cơ Đan', tier: 1,
    ingredients: [{ id: 'jade_lotus', qty: 2 }, { id: 'spirit_herb', qty: 3 }],
    stoneCost: 50, successChance: 0.60, failEffect: 'lose_half',
    unlockRealm: 0, craftTime: 6,
    desc: 'Phiên bản nhỏ của Trúc Cơ Đan, dễ luyện hơn.',
  },

  // ============================================================
  // TIER 2
  // ============================================================
  {
    id: 'cultivate_pill', pillId: 'cultivate_pill',
    name: 'Công Thức Bồi Nguyên Đan', tier: 2,
    ingredients: [
      { id: 'jade_lotus', qty: 2 }, { id: 'demon_core_1', qty: 1 }, { id: 'spirit_herb', qty: 3 },
    ],
    stoneCost: 60, successChance: 0.55, failEffect: 'lose_half',
    unlockRealm: 1, craftTime: 8,
    desc: 'Đan tốc độ tu luyện, cần yêu hạch.',
  },
  {
    id: 'strength_pill', pillId: 'strength_pill',
    name: 'Công Thức Thiên Hổ Đan', tier: 2,
    ingredients: [
      { id: 'wolf_fang', qty: 2 }, { id: 'fire_essence', qty: 2 }, { id: 'demon_core_1', qty: 1 },
    ],
    stoneCost: 80, successChance: 0.50, failEffect: 'lose_half',
    unlockRealm: 1, craftTime: 8,
    desc: 'Đan tăng ATK, cần hỏa tinh hoa.',
  },
  {
    id: 'defense_pill', pillId: 'defense_pill',
    name: 'Công Thức Kim Cương Đan', tier: 2,
    ingredients: [
      { id: 'earth_stone', qty: 3 }, { id: 'serpent_scale', qty: 2 }, { id: 'demon_core_1', qty: 1 },
    ],
    stoneCost: 80, successChance: 0.50, failEffect: 'lose_half',
    unlockRealm: 1, craftTime: 8,
    desc: 'Đan tăng DEF, cần thổ tinh.',
  },
  {
    id: 'shou_yuan_dan_1', pillId: 'shou_yuan_dan_1',
    name: 'Công Thức Tiểu Thọ Nguyên Đan', tier: 2,
    ingredients: [
      { id: 'jade_lotus', qty: 2 }, { id: 'spirit_herb', qty: 3 }, { id: 'rabbit_fur', qty: 2 },
    ],
    stoneCost: 80, successChance: 0.55, failEffect: 'lose_half',
    unlockRealm: 0, element: 'moc', craftTime: 7,
    desc: 'Công thức kéo dài thọ mệnh cơ bản.',
  },
  {
    id: 'ling_tri_dan', pillId: 'ling_tri_dan',
    name: 'Công Thức Linh Trí Đan', tier: 2,
    ingredients: [
      { id: 'moon_dew', qty: 2 }, { id: 'jade_lotus', qty: 2 }, { id: 'cloud_mushroom', qty: 1 },
    ],
    stoneCost: 70, successChance: 0.58, failEffect: 'lose_half',
    unlockRealm: 1, craftTime: 7,
    desc: 'Nguyệt lộ và vân linh cô khai tuệ căn.',
  },
  {
    id: 'kim_linh_dan', pillId: 'kim_linh_dan',
    name: 'Công Thức Kim Linh Đan', tier: 2,
    ingredients: [{ id: 'wolf_fang', qty: 2 }, { id: 'spirit_herb', qty: 2 }],
    stoneCost: 50, successChance: 0.65, failEffect: 'nothing',
    unlockRealm: 0, element: 'kim', craftTime: 6,
    desc: 'Đan hệ Kim, tốt nhất cho Kim linh căn.',
  },
  {
    id: 'moc_sinh_dan', pillId: 'moc_sinh_dan',
    name: 'Công Thức Mộc Sinh Đan', tier: 2,
    ingredients: [{ id: 'jade_lotus', qty: 3 }, { id: 'rabbit_fur', qty: 2 }],
    stoneCost: 55, successChance: 0.62, failEffect: 'nothing',
    unlockRealm: 0, element: 'moc', craftTime: 6,
    desc: 'Đan hệ Mộc, tăng sinh lực.',
  },
  {
    id: 'thuy_nguyen_dan', pillId: 'thuy_nguyen_dan',
    name: 'Công Thức Thủy Nguyên Đan', tier: 2,
    ingredients: [{ id: 'ice_crystal', qty: 2 }, { id: 'moon_dew', qty: 2 }],
    stoneCost: 65, successChance: 0.58, failEffect: 'nothing',
    unlockRealm: 1, element: 'thuy', craftTime: 7,
    desc: 'Đan hệ Thủy, bằng băng tinh và nguyệt lộ.',
  },
  {
    id: 'hoa_linh_dan', pillId: 'hoa_linh_dan',
    name: 'Công Thức Hỏa Linh Đan', tier: 2,
    ingredients: [{ id: 'fire_essence', qty: 3 }, { id: 'crimson_herb', qty: 1 }],
    stoneCost: 70, successChance: 0.55, failEffect: 'lose_half',
    unlockRealm: 1, element: 'hoa', craftTime: 7,
    desc: 'Đan hệ Hỏa, cần xích linh thảo từ Hỏa Bình Nguyên.',
  },
  {
    id: 'tho_thu_dan', pillId: 'tho_thu_dan',
    name: 'Công Thức Thổ Thủ Đan', tier: 2,
    ingredients: [{ id: 'earth_stone', qty: 4 }, { id: 'serpent_scale', qty: 1 }],
    stoneCost: 60, successChance: 0.60, failEffect: 'nothing',
    unlockRealm: 1, element: 'tho', craftTime: 6,
    desc: 'Đan hệ Thổ, dùng thổ tinh và xà ngạnh.',
  },
  {
    id: 'zhu_qi_dan', pillId: 'zhu_qi_dan',
    name: 'Công Thức Trú Khí Đan', tier: 2,
    ingredients: [
      { id: 'cloud_mushroom', qty: 2 }, { id: 'spirit_herb', qty: 2 }, { id: 'jade_lotus', qty: 1 },
    ],
    stoneCost: 65, successChance: 0.58, failEffect: 'nothing',
    unlockRealm: 1, craftTime: 7,
    desc: 'Vân linh cô giúp duy trì linh khí bền bỉ.',
  },
  {
    id: 'jing_xue_dan', pillId: 'jing_xue_dan',
    name: 'Công Thức Tịnh Huyết Đan', tier: 2,
    ingredients: [
      { id: 'blood_ginseng', qty: 1 }, { id: 'jade_lotus', qty: 2 }, { id: 'moon_dew', qty: 1 },
    ],
    stoneCost: 90, successChance: 0.52, failEffect: 'lose_half',
    unlockRealm: 1, craftTime: 8,
    desc: 'Huyết sâm cùng bạch ngọc liên thanh lọc kinh mạch.',
  },
  {
    id: 'han_bing_dan', pillId: 'han_bing_dan',
    name: 'Công Thức Hàn Băng Đan', tier: 2,
    ingredients: [
      { id: 'ice_crystal', qty: 3 }, { id: 'serpent_scale', qty: 2 }, { id: 'moon_dew', qty: 1 },
    ],
    stoneCost: 100, successChance: 0.50, failEffect: 'lose_half',
    unlockRealm: 1, element: 'bang', craftTime: 8,
    desc: 'Hàn khí thuần túy từ băng sơn.',
  },
  {
    id: 'lei_dao_dan', pillId: 'lei_dao_dan',
    name: 'Công Thức Lôi Đạo Đan', tier: 2,
    ingredients: [
      { id: 'hawk_feather', qty: 2 }, { id: 'fire_essence', qty: 2 }, { id: 'demon_core_1', qty: 1 },
    ],
    stoneCost: 100, successChance: 0.48, failEffect: 'lose_half',
    unlockRealm: 1, element: 'loi', craftTime: 8,
    desc: 'Lôi lực từ ưng vũ và hỏa tinh.',
  },

  // ============================================================
  // TIER 3
  // ============================================================
  {
    id: 'breakthrough_aid', pillId: 'breakthrough_aid',
    name: 'Công Thức Thiên Long Đại Đan', tier: 3,
    ingredients: [
      { id: 'blood_ginseng', qty: 1 }, { id: 'demon_core_2', qty: 2 },
      { id: 'lightning_core', qty: 1 }, { id: 'jade_lotus', qty: 3 },
    ],
    stoneCost: 200, successChance: 0.40, failEffect: 'lose_all',
    unlockRealm: 2, craftTime: 12,
    desc: 'Đan hỗ trợ đột phá, khó luyện.',
  },
  {
    id: 'lifespan_pill', pillId: 'lifespan_pill',
    name: 'Công Thức Diên Thọ Đan', tier: 3,
    ingredients: [
      { id: 'blood_ginseng', qty: 2 }, { id: 'ice_crystal', qty: 2 }, { id: 'demon_core_2', qty: 1 },
    ],
    stoneCost: 180, successChance: 0.38, failEffect: 'lose_all',
    unlockRealm: 2, craftTime: 12,
    desc: 'Đan kéo dài thọ nguyên, cực kỳ quý.',
  },
  {
    id: 'shou_yuan_dan_2', pillId: 'shou_yuan_dan_2',
    name: 'Công Thức Trung Thọ Nguyên Đan', tier: 3,
    ingredients: [
      { id: 'blood_ginseng', qty: 2 }, { id: 'moon_dew', qty: 3 },
      { id: 'demon_core_1', qty: 2 }, { id: 'jade_lotus', qty: 2 },
    ],
    stoneCost: 220, successChance: 0.40, failEffect: 'lose_all',
    unlockRealm: 2, element: 'moc', craftTime: 14,
    desc: 'Thọ mệnh trung phẩm, cần nguyên liệu đa dạng.',
  },
  {
    id: 'truc_co_dan', pillId: 'truc_co_dan',
    name: 'Công Thức Trúc Cơ Đan', tier: 3,
    ingredients: [
      { id: 'jade_lotus', qty: 3 }, { id: 'blood_ginseng', qty: 1 }, { id: 'demon_core_1', qty: 2 },
    ],
    stoneCost: 200, successChance: 0.45, failEffect: 'lose_half',
    unlockRealm: 0, craftTime: 12,
    desc: 'Cực kỳ quý giá. Hỗ trợ đột phá Trúc Cơ.',
  },
  {
    id: 'zhen_qi_dan', pillId: 'zhen_qi_dan',
    name: 'Công Thức Chân Khí Đan', tier: 3,
    ingredients: [
      { id: 'lightning_core', qty: 1 }, { id: 'blood_ginseng', qty: 2 }, { id: 'cloud_mushroom', qty: 3 },
    ],
    stoneCost: 250, successChance: 0.38, failEffect: 'lose_all',
    unlockRealm: 2, craftTime: 14,
    desc: 'Tổng hợp linh khí thuần túy nhất.',
  },
  {
    id: 'tian_gang_dan', pillId: 'tian_gang_dan',
    name: 'Công Thức Thiên Cương Đan', tier: 3,
    ingredients: [
      { id: 'demon_core_2', qty: 2 }, { id: 'phoenix_feather', qty: 1 }, { id: 'fire_essence', qty: 3 },
    ],
    stoneCost: 280, successChance: 0.36, failEffect: 'lose_all',
    unlockRealm: 2, craftTime: 14,
    desc: 'Thiên cương khí từ phượng vũ linh.',
  },
  {
    id: 'xuan_tie_dan', pillId: 'xuan_tie_dan',
    name: 'Công Thức Huyền Thiết Đan', tier: 3,
    ingredients: [
      { id: 'demon_core_2', qty: 2 }, { id: 'earth_stone', qty: 5 }, { id: 'serpent_scale', qty: 3 },
    ],
    stoneCost: 260, successChance: 0.38, failEffect: 'lose_all',
    unlockRealm: 2, craftTime: 13,
    desc: 'Huyền thiết cứng như thiên cương.',
  },
  {
    id: 'wang_ling_dan', pillId: 'wang_ling_dan',
    name: 'Công Thức Vạn Linh Đan', tier: 3,
    ingredients: [
      { id: 'void_grass', qty: 1 }, { id: 'demon_core_2', qty: 1 }, { id: 'moon_dew', qty: 3 },
    ],
    stoneCost: 300, successChance: 0.35, failEffect: 'lose_all',
    unlockRealm: 2, craftTime: 14,
    desc: 'Linh khí vạn hóa từ hư không cỏ hiếm.',
  },
  {
    id: 'pi_li_dan', pillId: 'pi_li_dan',
    name: 'Công Thức Tích Lịch Đan', tier: 3,
    ingredients: [
      { id: 'lightning_core', qty: 2 }, { id: 'hawk_feather', qty: 3 }, { id: 'demon_core_2', qty: 1 },
    ],
    stoneCost: 280, successChance: 0.35, failEffect: 'lose_all',
    unlockRealm: 2, element: 'loi', craftTime: 14,
    desc: 'Lôi thiên cực phẩm, tăng sức đánh kinh thiên.',
  },
  {
    id: 'bing_xin_dan', pillId: 'bing_xin_dan',
    name: 'Công Thức Băng Tâm Đan', tier: 3,
    ingredients: [
      { id: 'ice_crystal', qty: 4 }, { id: 'moon_dew', qty: 3 }, { id: 'blood_ginseng', qty: 1 },
    ],
    stoneCost: 240, successChance: 0.40, failEffect: 'lose_half',
    unlockRealm: 2, craftTime: 12,
    desc: 'Băng tâm trong sáng giải trừ bách độc.',
  },
  {
    id: 'dan_dao_dan', pillId: 'dan_dao_dan',
    name: 'Công Thức Đan Đạo Đan', tier: 3,
    ingredients: [
      { id: 'cloud_mushroom', qty: 3 }, { id: 'void_grass', qty: 1 }, { id: 'demon_core_1', qty: 3 },
    ],
    stoneCost: 300, successChance: 0.38, failEffect: 'lose_all',
    unlockRealm: 2, craftTime: 14,
    desc: 'Đỉnh cao đan đạo, cần linh khí hư không.',
  },

  // ============================================================
  // TIER 4
  // ============================================================
  {
    id: 'heaven_pill', pillId: 'heaven_pill',
    name: 'Công Thức Thiên Địa Hóa Nguyên Đan', tier: 4,
    ingredients: [
      { id: 'void_grass', qty: 1 }, { id: 'dragon_scale', qty: 1 },
      { id: 'heaven_stone', qty: 1 }, { id: 'demon_core_3', qty: 1 }, { id: 'blood_ginseng', qty: 3 },
    ],
    stoneCost: 1000, successChance: 0.25, failEffect: 'explosion',
    unlockRealm: 3, craftTime: 20,
    desc: 'Đan phẩm tối thượng. Thất bại có thể nổ lò!',
  },
  {
    id: 'shou_yuan_dan_3', pillId: 'shou_yuan_dan_3',
    name: 'Công Thức Đại Thọ Nguyên Đan', tier: 4,
    ingredients: [
      { id: 'immortal_root', qty: 1 }, { id: 'blood_ginseng', qty: 4 },
      { id: 'demon_core_2', qty: 3 }, { id: 'moon_dew', qty: 5 },
    ],
    stoneCost: 800, successChance: 0.28, failEffect: 'explosion',
    unlockRealm: 3, element: 'moc', craftTime: 18,
    desc: 'Cần tiên căn từ Long Sào — cực hiếm.',
  },
  {
    id: 'jin_dan_da_cheng', pillId: 'jin_dan_da_cheng',
    name: 'Công Thức Kim Đan Đại Thành Đan', tier: 4,
    ingredients: [
      { id: 'heaven_stone', qty: 1 }, { id: 'demon_core_3', qty: 2 }, { id: 'lightning_core', qty: 2 },
    ],
    stoneCost: 900, successChance: 0.27, failEffect: 'explosion',
    unlockRealm: 2, craftTime: 18,
    desc: 'Hỗ trợ cảnh giới Kim Đan, nguyên liệu cực khó.',
  },
  {
    id: 'tian_di_dan', pillId: 'tian_di_dan',
    name: 'Công Thức Thiên Địa Đan', tier: 4,
    ingredients: [
      { id: 'dragon_scale', qty: 1 }, { id: 'immortal_root', qty: 1 },
      { id: 'demon_core_3', qty: 1 }, { id: 'void_grass', qty: 2 }, { id: 'heaven_stone', qty: 1 },
    ],
    stoneCost: 1200, successChance: 0.22, failEffect: 'explosion',
    unlockRealm: 3, craftTime: 22,
    desc: 'Đan thiên địa hòa hợp — thọ và lực đều tăng.',
  },
  {
    id: 'yuan_ying_dan', pillId: 'yuan_ying_dan',
    name: 'Công Thức Nguyên Anh Đan', tier: 4,
    ingredients: [
      { id: 'chaos_pearl', qty: 1 }, { id: 'dragon_scale', qty: 1 },
      { id: 'immortal_root', qty: 2 }, { id: 'demon_core_3', qty: 2 },
    ],
    stoneCost: 1500, successChance: 0.20, failEffect: 'explosion',
    unlockRealm: 3, craftTime: 24,
    desc: 'Đan tối thượng cho Nguyên Anh, cần hỗn độn minh châu.',
  },
  {
    id: 'hun_yuan_dan', pillId: 'hun_yuan_dan',
    name: 'Công Thức Hỗn Nguyên Đan', tier: 4,
    ingredients: [
      { id: 'chaos_pearl', qty: 2 }, { id: 'heaven_stone', qty: 2 },
      { id: 'immortal_root', qty: 2 }, { id: 'dragon_scale', qty: 2 },
    ],
    stoneCost: 2000, successChance: 0.15, failEffect: 'explosion',
    unlockRealm: 4, craftTime: 30,
    desc: 'Đỉnh cao của đan đạo. Luyện thành bất bại.',
  },

  // ============================================================
  // ĐỊA PHỦ ĐỘC QUYỀN RECIPES
  // ============================================================
  {
    id: 'am_tinh_dan', pillId: 'am_tinh_dan',
    name: 'Công Thức Ám Tinh Đan', tier: 3,
    ingredients: [
      { id: 'dark_crystal', qty: 2 },
      { id: 'dark_essence', qty: 1 },
    ],
    stoneCost: 150, successChance: 0.60, failEffect: 'lose_half',
    unlockRealm: 2, craftTime: 12,
    isDungeonRecipe: true,
    desc: 'Cần Ám Tinh Thạch từ Địa Phủ tầng 3+. Tăng DEF trong thời gian dài.',
  },
  {
    id: 'hon_phach_dan', pillId: 'hon_phach_dan',
    name: 'Công Thức Hồn Phách Đan', tier: 3,
    ingredients: [
      { id: 'soul_shard', qty: 2 },
      { id: 'moon_dew', qty: 2 },
    ],
    stoneCost: 200, successChance: 0.55, failEffect: 'lose_half',
    unlockRealm: 2, craftTime: 14,
    isDungeonRecipe: true,
    desc: 'Cần Hồn Phách Mảnh từ Địa Phủ tầng 4+. Buff tu tốc mạnh.',
  },
  {
    id: 'hu_khong_dan', pillId: 'hu_khong_dan',
    name: 'Công Thức Hư Không Đan', tier: 4,
    ingredients: [
      { id: 'void_essence', qty: 1 },
      { id: 'void_grass', qty: 2 },
      { id: 'heaven_stone', qty: 1 },
    ],
    stoneCost: 500, successChance: 0.40, failEffect: 'explosion',
    unlockRealm: 3, craftTime: 20,
    isDungeonRecipe: true,
    desc: 'Cần Hư Không Tinh Tủy từ Địa Phủ tầng 6+. Buff vĩnh viễn.',
  },
  {
    id: 'dia_nguc_dan', pillId: 'dia_nguc_dan',
    name: 'Công Thức Địa Ngục Hỏa Đan', tier: 4,
    ingredients: [
      { id: 'hell_flame_essence', qty: 2 },
      { id: 'phoenix_feather', qty: 1 },
      { id: 'demon_core_2', qty: 1 },
    ],
    stoneCost: 600, successChance: 0.35, failEffect: 'explosion',
    unlockRealm: 3, craftTime: 22,
    isDungeonRecipe: true,
    desc: 'Cần Địa Ngục Hỏa Tinh từ Địa Phủ tầng 8+. ATK bùng nổ.',
  },
  {
    id: 'thien_ma_dan', pillId: 'thien_ma_dan',
    name: 'Công Thức Thiên Ma Phá Đan', tier: 4,
    ingredients: [
      { id: 'demon_soul_crystal', qty: 1 },
      { id: 'chaos_pearl', qty: 1 },
      { id: 'immortal_root', qty: 1 },
    ],
    stoneCost: 1000, successChance: 0.25, failEffect: 'explosion',
    unlockRealm: 4, craftTime: 30,
    isDungeonRecipe: true,
    desc: 'Cần Thiên Ma Hồn Tinh từ Boss tầng 10. Đỉnh cao Địa Phủ Đan.',
  },
];

// ---- Ingredient gather zones ----
export const GATHER_ZONES = [
  {
    id: 'spirit_forest',
    name: 'Linh Thảo Rừng', emoji: '🌲',
    unlockRealm: 0, staminaCost: 8,
    travelDays: 30,   // ngày game di chuyển + tìm kiếm
    travelDesc: 'Rừng gần làng nhưng rộng lớn, phải mất vài tuần lùng sục.',
    items: [
      { id: 'spirit_herb',  chance: 0.40, qty: [1, 2] },
      { id: 'jade_lotus',   chance: 0.12, qty: [1, 1] },
      { id: 'rabbit_fur',   chance: 0.20, qty: [1, 2] },
    ],
    desc: 'Rừng thảo dược phổ thông, cần thời gian tìm kiếm.',
  },
  {
    id: 'demon_wilds',
    name: 'Yêu Thú Hoang Dã', emoji: '🌑',
    unlockRealm: 0, staminaCost: 10,
    travelDays: 45,
    travelDesc: 'Vùng hoang dã nguy hiểm, đường xa hiểm trở.',
    items: [
      { id: 'wolf_fang',    chance: 0.30, qty: [1, 2] },
      { id: 'earth_stone',  chance: 0.28, qty: [1, 2] },
      { id: 'fire_essence', chance: 0.12, qty: [1, 1] },
      { id: 'demon_core_1', chance: 0.06, qty: [1, 1] },
    ],
    desc: 'Vùng hoang dã đầy yêu thú, nguyên liệu lẫn với nguy hiểm.',
  },
  {
    id: 'cloud_valley',
    name: 'Vân Linh Cốc', emoji: '☁',
    unlockRealm: 0, staminaCost: 10,
    travelDays: 40,
    travelDesc: 'Thung lũng ẩn trong mây mù, khó định hướng.',
    items: [
      { id: 'moon_dew',       chance: 0.25, qty: [1, 2] },
      { id: 'cloud_mushroom', chance: 0.22, qty: [1, 2] },
      { id: 'jade_lotus',     chance: 0.10, qty: [1, 1] },
    ],
    desc: 'Thung lũng mây mờ, nguyệt lộ và vân linh cô mọc đầy.',
  },
  {
    id: 'ice_mountain',
    name: 'Băng Sơn Tuyết Đỉnh', emoji: '🏔',
    unlockRealm: 1, staminaCost: 15,
    travelDays: 60,
    travelDesc: 'Núi băng hiểm trở, leo núi mất hàng tháng.',
    items: [
      { id: 'serpent_scale',  chance: 0.22, qty: [1, 2] },
      { id: 'ice_crystal',    chance: 0.18, qty: [1, 1] },
      { id: 'blood_ginseng',  chance: 0.07, qty: [1, 1] },
      { id: 'moon_dew',       chance: 0.14, qty: [1, 1] },
    ],
    desc: 'Núi băng cao ngàn trượng, nguyên liệu quý ẩn trong băng.',
  },
  {
    id: 'thunder_peak',
    name: 'Lôi Đỉnh Thiên Cung', emoji: '⛰',
    unlockRealm: 2, staminaCost: 20,
    travelDays: 90,
    travelDesc: 'Đỉnh lôi thiên biến khôn lường, đường lên đầy nguy hiểm.',
    items: [
      { id: 'lightning_core', chance: 0.18, qty: [1, 1] },
      { id: 'hawk_feather',   chance: 0.28, qty: [1, 2] },
      { id: 'void_grass',     chance: 0.03, qty: [1, 1] },
    ],
    desc: 'Nơi sấm sét không ngừng, linh khí cực mạnh.',
  },
  {
    id: 'fire_plains',
    name: 'Hỏa Bình Nguyên', emoji: '🌋',
    unlockRealm: 2, staminaCost: 18,
    travelDays: 75,
    travelDesc: 'Đồng bằng lửa, sức nóng thiêu đốt từ xa.',
    items: [
      { id: 'crimson_herb',    chance: 0.22, qty: [1, 2] },
      { id: 'phoenix_feather', chance: 0.07, qty: [1, 1] },
      { id: 'fire_essence',    chance: 0.28, qty: [1, 2] },
      { id: 'demon_core_2',    chance: 0.05, qty: [1, 1] },
    ],
    desc: 'Đồng bằng lửa nổi tiếng với xích linh thảo và phượng vũ.',
  },
  {
    id: 'abyss_cave',
    name: 'Vực Thẳm Yêu Quật', emoji: '🕳',
    unlockRealm: 3, staminaCost: 25,
    travelDays: 120,
    travelDesc: 'Vực thẳm sâu không đáy, áp lực yêu khí nặng nề.',
    items: [
      { id: 'demon_core_2',  chance: 0.15, qty: [1, 1] },
      { id: 'demon_core_3',  chance: 0.05, qty: [1, 1] },
      { id: 'dark_essence',  chance: 0.25, qty: [1, 2] },
      { id: 'void_grass',    chance: 0.10, qty: [1, 1] },
    ],
    desc: 'Hang động sâu thẳm đầy yêu khí, nguyên liệu cao cấp dồi dào.',
  },
  {
    id: 'void_realm',
    name: 'Hư Không Thác Giới', emoji: '🌌',
    unlockRealm: 3, staminaCost: 28,
    travelDays: 150,
    travelDesc: 'Ranh giới hư không, không gian bất ổn, mỗi bước là thách thức.',
    items: [
      { id: 'void_grass',   chance: 0.16, qty: [1, 1] },
      { id: 'heaven_stone', chance: 0.06, qty: [1, 1] },
      { id: 'dark_essence', chance: 0.22, qty: [1, 2] },
    ],
    desc: 'Ranh giới hư không — chỉ người mạnh mới đặt chân được.',
  },
  {
    id: 'dragon_nest',
    name: 'Long Sào Tiên Địa', emoji: '🐲',
    unlockRealm: 4, staminaCost: 35,
    travelDays: 180,
    travelDesc: 'Thánh địa Long tộc, đường vào đầy trận pháp và yêu long canh giữ.',
    items: [
      { id: 'dragon_scale',  chance: 0.10, qty: [1, 1] },
      { id: 'immortal_root', chance: 0.07, qty: [1, 1] },
      { id: 'demon_core_3',  chance: 0.12, qty: [1, 1] },
      { id: 'heaven_stone',  chance: 0.09, qty: [1, 1] },
    ],
    desc: 'Thánh địa của Long tộc — nguyên liệu đệ nhất thiên hạ.',
  },
];

// ============================================================
// LUYỆN ĐAN SYSTEM DATA — thêm session 5
// ============================================================

// ---- Rank Đan Sư ----
export const DAN_SU_RANKS = [
  { rank: 0, name: 'Phàm Nhân',     minSuccess: 0,    bonus: 0,    canCraft: false,
    desc: 'Chưa bước vào con đường luyện đan.' },
  { rank: 1, name: 'Học Đồ',        minSuccess: 0,    bonus: 0,    canCraft: true,  maxTier: 1,
    desc: 'Vừa có lò, tập luyện đan tier 1.' },
  { rank: 2, name: 'Đan Đồ',        minSuccess: 10,   bonus: 5,    canCraft: true,  maxTier: 1,
    desc: 'Tay nghề ổn định hơn, tỉ lệ thành công +5%.' },
  { rank: 3, name: 'Luyện Đan Sư',  minSuccess: 30,   bonus: 10,   canCraft: true,  maxTier: 2,
    desc: 'Mở tier 2. Có thể luyện đôi (×2 nguyên liệu, ×2 đan).' },
  { rank: 4, name: 'Đan Sư',        minSuccess: 80,   bonus: 15,   canCraft: true,  maxTier: 2,
    desc: 'Thần Đan tỉ lệ tăng. Tỉ lệ thành công +15%.' },
  { rank: 5, name: 'Đại Đan Sư',    minSuccess: 200,  bonus: 20,   canCraft: true,  maxTier: 3,
    desc: 'Mở tier 3. Luyện hàng loạt ×5.' },
  { rank: 6, name: 'Đan Vương',     minSuccess: 500,  bonus: 25,   canCraft: true,  maxTier: 4,
    desc: 'Mở tier 4. Bí truyền đan phương.' },
  { rank: 7, name: 'Đan Thánh',     minSuccess: 1000, bonus: 30,   canCraft: true,  maxTier: 4,
    desc: 'Đỉnh cao luyện đan. Mọi đan đều có thể ra Thần Phẩm.' },
];

export function getDanSuRank(alchemySuccess) {
  let r = DAN_SU_RANKS[0];
  for (const rank of DAN_SU_RANKS) {
    if (alchemySuccess >= rank.minSuccess) r = rank;
  }
  return r;
}

export function getNextDanSuRank(alchemySuccess) {
  for (const rank of DAN_SU_RANKS) {
    if (alchemySuccess < rank.minSuccess) return rank;
  }
  return null;
}

// ---- Đan Phẩm (chất lượng) ----
export const DAN_PHAM = [
  { id: 'pham',   name: 'Phàm Phẩm', emoji: '⬜', color: '#888',    mult: 1.0,  weight: 60 },
  { id: 'linh',   name: 'Linh Phẩm', emoji: '🟢', color: '#56c46a', mult: 1.5,  weight: 28 },
  { id: 'thuong', name: 'Thượng Phẩm',emoji: '🔵', color: '#4a9eff', mult: 2.5,  weight: 10 },
  { id: 'than',   name: 'Thần Phẩm', emoji: '🟡', color: '#f0d47a', mult: 5.0,  weight: 2  },
];

// Roll đan phẩm — trả về DAN_PHAM entry
// bonusWeight tăng theo rank đan sư và lò cấp
export function rollDanPham(rankBonus, furnaceLevel) {
  const bonus = (rankBonus / 30) * 8 + (furnaceLevel || 0) * 0.5; // max ~+10 weight shift
  const weights = DAN_PHAM.map((p, i) => {
    if (i === 0) return Math.max(20, p.weight - bonus * 2);
    if (i === 1) return p.weight;
    if (i === 2) return p.weight + bonus * 0.8;
    return p.weight + bonus * 1.2; // Thần Phẩm hưởng nhiều nhất
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < DAN_PHAM.length; i++) {
    r -= weights[i];
    if (r <= 0) return DAN_PHAM[i];
  }
  return DAN_PHAM[0];
}

// ---- Nổ Lò Config ----
export const FURNACE_EXPLOSION = {
  // Tỉ lệ nổ lò = baseRate × (1 - furnaceLevelReduction)
  // Khi thất bại, xác suất nổ lò trong số thất bại
  baseRate: 0.15,            // 15% trong số thất bại là nổ lò
  furnaceLevelReduction: 0.03, // mỗi cấp lò giảm 3% (lò cấp 5 giảm 12%)
  hpLoss: 0.20,              // mất 20% HP hiện tại
  furnaceDurabilityLoss: 1,  // giảm 1 durability
  msg: '💥 NỔ LÒ! Mất toàn bộ nguyên liệu, bị thương nặng!',
};

// ---- Lò Đan Durability ----
// Mỗi lò có durability tối đa theo cấp, khi về 0 cần sửa
export const FURNACE_DURABILITY = {
  1: { max: 10, repairCost: 50,   repairItems: [{ id: 'earth_stone', qty: 2 }] },
  2: { max: 15, repairCost: 120,  repairItems: [{ id: 'earth_stone', qty: 3 }, { id: 'spirit_herb', qty: 2 }] },
  3: { max: 20, repairCost: 300,  repairItems: [{ id: 'earth_stone', qty: 5 }, { id: 'serpent_scale', qty: 2 }] },
  4: { max: 30, repairCost: 800,  repairItems: [{ id: 'serpent_scale', qty: 4 }, { id: 'lightning_core', qty: 1 }] },
  5: { max: 50, repairCost: 2000, repairItems: [{ id: 'lightning_core', qty: 2 }, { id: 'heaven_stone', qty: 1 }] },
};

// ---- Đan Phương unlock theo rank ----
// Công thức nào mở sẵn khi đạt rank, không cần học từ ngoài
export const RECIPE_AUTO_UNLOCK = {
  1: ['basic_qi_pill', 'healing_pill', 'qing_shen_dan'],           // Học Đồ: 3 công thức cơ bản
  2: ['vigor_pill', 'ming_mu_dan', 'an_shen_dan',
      'sha_qi_dan', 'bao_pi_dan', 'zhu_ji_dan_small'],             // Đan Đồ: unlock nốt tier 1
  3: ['cultivate_pill', 'strength_pill', 'defense_pill',
      'speed_pill', 'life_extension_pill'],                        // Luyện Đan Sư: tier 2 cơ bản
  4: ['great_healing_pill', 'burst_pill', 'iron_body_pill',
      'spirit_surge_pill', 'foundation_pill'],                     // Đan Sư: tier 2 cao
  5: ['breakthrough_pill', 'dragon_qi_pill', 'void_heart_pill',
      'heaven_step_pill', 'ten_thousand_year_pill'],               // Đại Đan Sư: tier 3
  6: ['immortal_qi_pill', 'chaos_dan', 'nirvana_pill',
      'soul_return_pill', 'creation_pill'],                        // Đan Vương: tier 4
  7: ['heaven_dan', 'ultimate_dan'],                               // Đan Thánh: bí truyền
};

// Công thức học từ NPC/loot/quest (không tự mở theo rank)
// source: 'npc_dan_su' | 'loot_realm_X' | 'quest' | 'coduyen'
export const RECIPE_LEARN_SOURCES = [
  { id: 'zhu_ji_dan',         source: 'npc_dan_su',   minRealm: 0, cost: 500,  currency: 'danphuong' },
  { id: 'golden_body_pill',   source: 'npc_dan_su',   minRealm: 1, cost: 800,  currency: 'danphuong' },
  { id: 'xuan_yin_dan',       source: 'loot_realm_1', minRealm: 1, dropRate: 0.05 },
  { id: 'void_spirit_pill',   source: 'loot_realm_2', minRealm: 2, dropRate: 0.04 },
  { id: 'thunder_dan',        source: 'loot_realm_2', minRealm: 2, dropRate: 0.03 },
  { id: 'rebirth_pill',       source: 'quest',        minRealm: 2 },
  { id: 'phoenix_pill',       source: 'coduyen',      minRealm: 3, tier: 2 },
  { id: 'immortal_body_pill', source: 'npc_dan_su',   minRealm: 3, cost: 3000, currency: 'danphuong' },
  { id: 'ten_thousand_year_pill', source: 'coduyen',  minRealm: 3, tier: 3 },
  { id: 'chaos_dan',          source: 'npc_dan_su',   minRealm: 4, cost: 8000, currency: 'danphuong' },
];

// ---- Đan Phương Tệ ----
// Tiền riêng để mua công thức từ NPC đan sư
// Kiếm từ: bán đan dược (10% giá trị), đóng góp đan tông, nhiệm vụ đan sư
export const DAN_PHUONG_TE_INFO = {
  name: 'Đan Phương Tệ',
  emoji: '📜',
  desc: 'Tệ riêng của giới đan sư, dùng để đổi lấy bí phương quý. Không thể mua bằng linh thạch thông thường.',
  earnSources: [
    'Bán đan dược cho NPC: nhận 1 Đan Phương Tệ / 10 đan thành phẩm',
    'Nhiệm vụ Đan Tông: thưởng trực tiếp',
    'Đóng góp Đan Tông cấp cao: cộng Đan Phương Tệ',
    'Cơ Duyên loại đan sư: nhận lượng lớn',
  ],
};