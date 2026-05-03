// ============================================================
// alchemy/khoi-loi-data.js — Khôi Lỗi Sư
// Nghề phụ: chế tạo khối lỗi → chiến đấu cùng player
// Khối lỗi có HP, ATK, DEF riêng; tự động tấn công trong combat
// Session 5
// ============================================================

// ---- Cấp Bậc Khôi Lỗi Sư ----
export const PUPPET_MASTER_RANKS = [
  { rank:0, name:'Khôi Lỗi', emoji:'⚙',  minCrafted:0,   bonusPct:0,  desc:'Mới học làm khối lỗi, chỉ tạo được loại đồng đơn giản.' },
  { rank:1, name:'Học Đồ Khôi Lỗi Sư',  emoji:'🔧', minCrafted:5,   bonusPct:8,  desc:'+8% chỉ số khối lỗi. Mở khối lỗi Tier 2.' },
  { rank:2, name:'Khôi Lỗi Sư',          emoji:'🤖', minCrafted:20,  bonusPct:18, desc:'+18% chỉ số. Mở khối lỗi Tier 3.' },
  { rank:3, name:'Khôi Lỗi Đại Sư',     emoji:'⚡', minCrafted:50,  bonusPct:32, desc:'+32% chỉ số. Mở khối lỗi Tier 4.' },
  { rank:4, name:'Khôi Lỗi Tông Sư',    emoji:'🌟', minCrafted:100, bonusPct:50, desc:'+50% chỉ số. Mở khối lỗi Tier 5.' },
  { rank:5, name:'Khôi Lỗi Thánh Nhân', emoji:'👑', minCrafted:200, bonusPct:70, desc:'+70% chỉ số. Chế khối lỗi thần phẩm.' },
];

export function getPuppetRank(count) {
  for (let i = PUPPET_MASTER_RANKS.length - 1; i >= 0; i--) {
    if (count >= PUPPET_MASTER_RANKS[i].minCrafted) return PUPPET_MASTER_RANKS[i];
  }
  return PUPPET_MASTER_RANKS[0];
}
export function getNextPuppetRank(count) {
  for (let i = 0; i < PUPPET_MASTER_RANKS.length; i++) {
    if (count < PUPPET_MASTER_RANKS[i].minCrafted) return PUPPET_MASTER_RANKS[i];
  }
  return null;
}

// ---- 25 Công Thức Chế Tạo Khôi Lỗi ----
// Khối lỗi sau khi chế tạo vào G.khoiLoi.active (chỉ 1 khối lỗi hoạt động tại 1 thời điểm)
// Stat: hp, atk, def — tự chiến đấu trong combat
export const PUPPET_RECIPES = [

  // ══════════════════════════════════════════
  // TIER 1 — Khôi Lỗi Đồng (realm 0, rank 0)
  // ══════════════════════════════════════════
  {
    id:'craft_copper_puppet',     name:'Chế Đồng Nhân Cơ',     emoji:'⚙', tier:1,
    resultItem:'copper_puppet',   qty:1,
    materials:[{id:'earth_stone',qty:5},{id:'wolf_fang',qty:3}],
    stoneCost:80, successChance:0.90, requireRealm:0, requireRank:0,
    desc:'Tạo 1 Đồng Nhân Cơ. Khối lỗi đồng đơn giản, hỗ trợ chiến đấu.',
  },
  {
    id:'craft_iron_puppet',       name:'Chế Thiết Nhân Chiến',  emoji:'⚙', tier:1,
    resultItem:'iron_puppet',     qty:1,
    materials:[{id:'earth_stone',qty:8},{id:'serpent_scale',qty:3},{id:'wolf_fang',qty:2}],
    stoneCost:120, successChance:0.85, requireRealm:0, requireRank:0,
    desc:'Tạo 1 Thiết Nhân Chiến. ATK cao hơn Đồng Nhân.',
  },
  {
    id:'craft_shield_puppet',     name:'Chế Đồng Thuẫn Hộ',    emoji:'⚙', tier:1,
    resultItem:'shield_puppet',   qty:1,
    materials:[{id:'earth_stone',qty:10},{id:'hawk_feather',qty:2},{id:'spirit_herb',qty:4}],
    stoneCost:100, successChance:0.87, requireRealm:0, requireRank:0,
    desc:'Tạo 1 Đồng Thuẫn Hộ. DEF cao, chịu đòn thay chủ nhân.',
  },
  {
    id:'craft_swift_puppet',      name:'Chế Tốc Nhân Phong',   emoji:'⚙', tier:1,
    resultItem:'swift_puppet',    qty:1,
    materials:[{id:'hawk_feather',qty:5},{id:'moon_dew',qty:3}],
    stoneCost:90, successChance:0.88, requireRealm:0, requireRank:0,
    desc:'Tạo 1 Tốc Nhân Phong. Tốc độ tấn công cao hơn khối lỗi thường.',
  },
  {
    id:'craft_balanced_puppet',   name:'Chế Quân Hành Nhân',   emoji:'⚙', tier:1,
    resultItem:'balanced_puppet', qty:1,
    materials:[{id:'earth_stone',qty:6},{id:'wolf_fang',qty:3},{id:'spirit_herb',qty:3}],
    stoneCost:110, successChance:0.86, requireRealm:0, requireRank:0,
    desc:'Tạo 1 Quân Hành Nhân. Cân bằng ATK/DEF/HP.',
  },

  // ══════════════════════════════════════════
  // TIER 2 — Khôi Lỗi Bạc (realm 0, rank 1)
  // ══════════════════════════════════════════
  {
    id:'craft_silver_blade',      name:'Chế Bạc Kiếm Khối',    emoji:'🔧', tier:2,
    resultItem:'silver_blade_puppet', qty:1,
    materials:[{id:'serpent_scale',qty:5},{id:'lightning_core',qty:2},{id:'wolf_fang',qty:5}],
    stoneCost:350, successChance:0.75, requireRealm:0, requireRank:1,
    desc:'Tạo 1 Bạc Kiếm Khối. ATK rất cao, tích hợp lưỡi kiếm linh.',
  },
  {
    id:'craft_silver_tower',      name:'Chế Bạc Tháp Thủ',     emoji:'🔧', tier:2,
    resultItem:'silver_tower_puppet', qty:1,
    materials:[{id:'earth_stone',qty:15},{id:'serpent_scale',qty:4},{id:'blood_ginseng',qty:2}],
    stoneCost:380, successChance:0.73, requireRealm:0, requireRank:1,
    desc:'Tạo 1 Bạc Tháp Thủ. DEF và HP rất cao.',
  },
  {
    id:'craft_dual_puppet',       name:'Chế Song Nguyệt Khối',  emoji:'🔧', tier:2,
    resultItem:'dual_puppet',     qty:1,
    materials:[{id:'moon_dew',qty:5},{id:'hawk_feather',qty:4},{id:'lightning_core',qty:2}],
    stoneCost:420, successChance:0.70, requireRealm:0, requireRank:1,
    desc:'Tạo 1 Song Nguyệt Khối. Đánh 2 lần mỗi lượt.',
  },
  {
    id:'craft_regen_puppet',      name:'Chế Linh Tâm Khối',     emoji:'🔧', tier:2,
    resultItem:'regen_puppet',    qty:1,
    materials:[{id:'jade_lotus',qty:5},{id:'blood_ginseng',qty:2},{id:'moon_dew',qty:3}],
    stoneCost:400, successChance:0.72, requireRealm:0, requireRank:1,
    desc:'Tạo 1 Linh Tâm Khối. Hồi HP mỗi lượt chiến đấu.',
  },
  {
    id:'craft_fire_puppet',       name:'Chế Hỏa Linh Khối',     emoji:'🔧', tier:2,
    resultItem:'fire_puppet',     qty:1,
    materials:[{id:'fire_essence',qty:6},{id:'wolf_fang',qty:4},{id:'lightning_core',qty:2}],
    stoneCost:450, successChance:0.68, requireRealm:0, requireRank:1,
    desc:'Tạo 1 Hỏa Linh Khối. Gây thêm sát thương lửa.',
  },

  // ══════════════════════════════════════════
  // TIER 3 — Khôi Lỗi Vàng (realm 1, rank 2)
  // ══════════════════════════════════════════
  {
    id:'craft_golden_war',        name:'Chế Kim Chiến Thần',    emoji:'⚡', tier:3,
    resultItem:'golden_war_puppet', qty:1,
    materials:[{id:'lightning_core',qty:4},{id:'phoenix_feather',qty:2},{id:'demon_core_1',qty:3}],
    stoneCost:1200, successChance:0.60, requireRealm:1, requireRank:2,
    desc:'Tạo 1 Kim Chiến Thần. ATK mạnh + giảm DEF địch.',
  },
  {
    id:'craft_golden_fortress',   name:'Chế Kim Thành Bất Phá', emoji:'⚡', tier:3,
    resultItem:'golden_fortress_puppet', qty:1,
    materials:[{id:'earth_stone',qty:20},{id:'serpent_scale',qty:8},{id:'crimson_herb',qty:4}],
    stoneCost:1400, successChance:0.57, requireRealm:1, requireRank:2,
    desc:'Tạo 1 Kim Thành Bất Phá. DEF cực cao, giảm 30% sát thương nhận.',
  },
  {
    id:'craft_golden_phantom',    name:'Chế Kim Ảnh Hư Linh',  emoji:'⚡', tier:3,
    resultItem:'golden_phantom_puppet', qty:1,
    materials:[{id:'moon_dew',qty:8},{id:'hawk_feather',qty:6},{id:'phoenix_feather',qty:2}],
    stoneCost:1300, successChance:0.58, requireRealm:1, requireRank:2,
    desc:'Tạo 1 Kim Ảnh Hư Linh. Né tránh 20% đòn tấn công địch.',
  },
  {
    id:'craft_thunder_puppet',    name:'Chế Lôi Đình Khối',    emoji:'⚡', tier:3,
    resultItem:'thunder_puppet',  qty:1,
    materials:[{id:'lightning_core',qty:6},{id:'fire_essence',qty:5},{id:'demon_core_1',qty:2}],
    stoneCost:1500, successChance:0.55, requireRealm:1, requireRank:2,
    desc:'Tạo 1 Lôi Đình Khối. Gây sát thương diện rộng mỗi 3 lượt.',
  },
  {
    id:'craft_support_puppet',    name:'Chế Linh Dưỡng Khối',  emoji:'⚡', tier:3,
    resultItem:'support_puppet',  qty:1,
    materials:[{id:'blood_ginseng',qty:5},{id:'jade_lotus',qty:6},{id:'cloud_mushroom',qty:4}],
    stoneCost:1350, successChance:0.58, requireRealm:1, requireRank:2,
    desc:'Tạo 1 Linh Dưỡng Khối. Hồi HP chủ nhân mỗi 3 lượt.',
  },

  // ══════════════════════════════════════════
  // TIER 4 — Khôi Lỗi Tinh Thần (realm 2, rank 3)
  // ══════════════════════════════════════════
  {
    id:'craft_spirit_dragon',     name:'Chế Linh Long Khối',    emoji:'🌟', tier:4,
    resultItem:'spirit_dragon_puppet', qty:1,
    materials:[{id:'dragon_scale',qty:3},{id:'void_grass',qty:4},{id:'demon_core_2',qty:3}],
    stoneCost:4000, successChance:0.45, requireRealm:2, requireRank:3,
    desc:'Tạo 1 Linh Long Khối. Hình thức rồng, ATK+DEF đều xuất sắc.',
  },
  {
    id:'craft_void_puppet',       name:'Chế Hư Không Sát Thủ',  emoji:'🌟', tier:4,
    resultItem:'void_puppet',     qty:1,
    materials:[{id:'void_grass',qty:6},{id:'dark_essence',qty:5},{id:'demon_core_2',qty:2}],
    stoneCost:4500, successChance:0.42, requireRealm:2, requireRank:3,
    desc:'Tạo 1 Hư Không Sát Thủ. Mỗi đòn có 30% làm địch choáng 1 lượt.',
  },
  {
    id:'craft_iron_colossus',     name:'Chế Thiết Sơn Cự Nhân', emoji:'🌟', tier:4,
    resultItem:'iron_colossus_puppet', qty:1,
    materials:[{id:'earth_stone',qty:30},{id:'dragon_scale',qty:2},{id:'heaven_stone',qty:1},{id:'void_grass',qty:3}],
    stoneCost:5000, successChance:0.40, requireRealm:2, requireRank:3,
    desc:'Tạo 1 Thiết Sơn Cự Nhân. HP và DEF tối thượng, miễn nhiễm 1 đòn/lượt.',
  },
  {
    id:'craft_phoenix_puppet',    name:'Chế Hỏa Phượng Tái Sinh',emoji:'🌟', tier:4,
    resultItem:'phoenix_puppet',  qty:1,
    materials:[{id:'phoenix_feather',qty:4},{id:'fire_essence',qty:8},{id:'crimson_herb',qty:5}],
    stoneCost:4800, successChance:0.42, requireRealm:2, requireRank:3,
    desc:'Tạo 1 Hỏa Phượng Tái Sinh. Khi HP <20%, hồi phục 50% HP 1 lần/chiến đấu.',
  },
  {
    id:'craft_twin_stars',        name:'Chế Song Tinh Liên Hoàn',emoji:'🌟', tier:4,
    resultItem:'twin_stars_puppet', qty:1,
    materials:[{id:'heaven_stone',qty:2},{id:'dark_essence',qty:4},{id:'demon_core_2',qty:3}],
    stoneCost:5500, successChance:0.38, requireRealm:2, requireRank:3,
    desc:'Tạo 1 Song Tinh Liên Hoàn. Triệu hồi 2 khối nhỏ đồng thời tấn công.',
  },

  // ══════════════════════════════════════════
  // TIER 5 — Khôi Lỗi Thần Phẩm (realm 3, rank 4-5)
  // ══════════════════════════════════════════
  {
    id:'craft_chaos_golem',       name:'Chế Hỗn Độn Thần Hình', emoji:'👑', tier:5,
    resultItem:'chaos_golem',     qty:1,
    materials:[{id:'chaos_pearl',qty:2},{id:'dragon_scale',qty:3},{id:'void_grass',qty:5}],
    stoneCost:10000, successChance:0.30, requireRealm:3, requireRank:4,
    desc:'Tạo 1 Hỗn Độn Thần Hình. Khối lỗi mạnh nhất Tier 5.',
  },
  {
    id:'craft_immortal_golem',    name:'Chế Bất Tử Khối Thần',  emoji:'👑', tier:5,
    resultItem:'immortal_golem',  qty:1,
    materials:[{id:'immortal_root',qty:3},{id:'chaos_pearl',qty:1},{id:'heaven_stone',qty:3}],
    stoneCost:12000, successChance:0.27, requireRealm:3, requireRank:4,
    desc:'Tạo 1 Bất Tử Khối Thần. Không thể bị tiêu diệt trong 5 lượt đầu.',
  },
  {
    id:'craft_dragon_emperor',    name:'Chế Long Đế Thiên Oai',  emoji:'👑', tier:5,
    resultItem:'dragon_emperor_puppet', qty:1,
    materials:[{id:'chaos_pearl',qty:2},{id:'dragon_scale',qty:4},{id:'immortal_root',qty:2}],
    stoneCost:15000, successChance:0.24, requireRealm:3, requireRank:5,
    desc:'Tạo 1 Long Đế Thiên Oai. Tối thượng ATK, giảm 50% DEF địch.',
  },
  {
    id:'craft_heaven_sentinel',   name:'Chế Thiên Thủ Thần Vệ', emoji:'👑', tier:5,
    resultItem:'heaven_sentinel_puppet', qty:1,
    materials:[{id:'heaven_stone',qty:4},{id:'chaos_pearl',qty:2},{id:'immortal_root',qty:2}],
    stoneCost:14000, successChance:0.25, requireRealm:3, requireRank:5,
    desc:'Tạo 1 Thiên Thủ Thần Vệ. Chặn toàn bộ đòn có sát thương <500 mỗi lượt.',
  },
  {
    id:'craft_supreme_golem',     name:'Chế Vô Thượng Khối Thánh',emoji:'👑', tier:5,
    resultItem:'supreme_golem',   qty:1,
    materials:[{id:'chaos_pearl',qty:3},{id:'immortal_root',qty:3},{id:'heaven_stone',qty:3}],
    stoneCost:20000, successChance:0.20, requireRealm:3, requireRank:5,
    desc:'Tạo 1 Vô Thượng Khối Thánh. Khối lỗi đỉnh cao — cả ATK/DEF/HP đều tối thượng.',
  },
];

// ---- Puppet Items (vào G.khoiLoi.active khi triệu hồi) ----
// Mỗi khối lỗi có: hp, atk, def, special (hiệu ứng đặc biệt)
export const PUPPET_ITEMS = [
  // Tier 1
  { id:'copper_puppet',     name:'Đồng Nhân Cơ',         emoji:'⚙', rarity:'thường',
    tier:1, hp:200, atk:15, def:8,  special:null,
    desc:'Khối lỗi đồng cơ bản. ATK: 15, DEF: 8, HP: 200.' },
  { id:'iron_puppet',       name:'Thiết Nhân Chiến',      emoji:'⚙', rarity:'thường',
    tier:1, hp:180, atk:22, def:6,  special:null,
    desc:'Khối lỗi thiết, ATK cao. ATK: 22, DEF: 6, HP: 180.' },
  { id:'shield_puppet',     name:'Đồng Thuẫn Hộ',         emoji:'🛡', rarity:'thường',
    tier:1, hp:280, atk:10, def:20, special:{type:'taunt', desc:'Hút sát thương cho chủ nhân'},
    desc:'Khối lỗi phòng thủ. ATK: 10, DEF: 20, HP: 280. Kỹ năng: Hút sát thương.' },
  { id:'swift_puppet',      name:'Tốc Nhân Phong',        emoji:'💨', rarity:'thường',
    tier:1, hp:160, atk:18, def:5,  special:{type:'double_hit_chance', value:30, desc:'30% đánh 2 lần'},
    desc:'Khối lỗi tốc. ATK: 18, DEF: 5, HP: 160. 30% đánh 2 lần mỗi lượt.' },
  { id:'balanced_puppet',   name:'Quân Hành Nhân',        emoji:'⚙', rarity:'thường',
    tier:1, hp:220, atk:17, def:12, special:null,
    desc:'Khối lỗi cân bằng. ATK: 17, DEF: 12, HP: 220.' },

  // Tier 2
  { id:'silver_blade_puppet', name:'Bạc Kiếm Khối',       emoji:'⚔', rarity:'hiếm',
    tier:2, hp:350, atk:55, def:12, special:{type:'armor_break', value:15, desc:'Giảm 15% DEF địch'},
    desc:'ATK: 55, DEF: 12, HP: 350. Kỹ năng: Giảm 15% DEF địch.' },
  { id:'silver_tower_puppet', name:'Bạc Tháp Thủ',        emoji:'🏰', rarity:'hiếm',
    tier:2, hp:600, atk:25, def:50, special:{type:'reflect', value:20, desc:'Phản 20% sát thương nhận'},
    desc:'ATK: 25, DEF: 50, HP: 600. Kỹ năng: Phản 20% sát thương.' },
  { id:'dual_puppet',       name:'Song Nguyệt Khối',      emoji:'🌙', rarity:'hiếm',
    tier:2, hp:320, atk:40, def:20, special:{type:'double_attack', desc:'Luôn đánh 2 lần mỗi lượt'},
    desc:'ATK: 40, DEF: 20, HP: 320. Kỹ năng: Luôn đánh 2 lần.' },
  { id:'regen_puppet',      name:'Linh Tâm Khối',         emoji:'💚', rarity:'hiếm',
    tier:2, hp:400, atk:30, def:25, special:{type:'regen', value:20, desc:'Hồi 20 HP mỗi lượt'},
    desc:'ATK: 30, DEF: 25, HP: 400. Kỹ năng: Hồi 20 HP/lượt.' },
  { id:'fire_puppet',       name:'Hỏa Linh Khối',         emoji:'🔥', rarity:'hiếm',
    tier:2, hp:300, atk:50, def:15, special:{type:'burn', value:30, desc:'Gây thêm 30 sát thương lửa/lượt'},
    desc:'ATK: 50, DEF: 15, HP: 300. Kỹ năng: +30 sát thương lửa.' },

  // Tier 3
  { id:'golden_war_puppet', name:'Kim Chiến Thần',        emoji:'⚡', rarity:'cực hiếm',
    tier:3, hp:800, atk:120, def:40, special:{type:'armor_break', value:25, desc:'Giảm 25% DEF địch'},
    desc:'ATK: 120, DEF: 40, HP: 800. Kỹ năng: Giảm 25% DEF địch.' },
  { id:'golden_fortress_puppet', name:'Kim Thành Bất Phá', emoji:'🏯', rarity:'cực hiếm',
    tier:3, hp:1400, atk:50, def:150, special:{type:'dmg_reduce', value:30, desc:'Giảm 30% sát thương nhận'},
    desc:'ATK: 50, DEF: 150, HP: 1400. Kỹ năng: -30% sát thương.' },
  { id:'golden_phantom_puppet', name:'Kim Ảnh Hư Linh',   emoji:'👻', rarity:'cực hiếm',
    tier:3, hp:700, atk:100, def:60, special:{type:'evasion', value:20, desc:'20% né tránh đòn địch'},
    desc:'ATK: 100, DEF: 60, HP: 700. Kỹ năng: 20% né tránh.' },
  { id:'thunder_puppet',    name:'Lôi Đình Khối',         emoji:'⚡', rarity:'cực hiếm',
    tier:3, hp:750, atk:110, def:45, special:{type:'aoe', interval:3, value:150, desc:'Mỗi 3 lượt tung sét diện rộng'},
    desc:'ATK: 110, DEF: 45, HP: 750. Kỹ năng: Mỗi 3 lượt gây 150 sát thương diện rộng.' },
  { id:'support_puppet',    name:'Linh Dưỡng Khối',       emoji:'💊', rarity:'cực hiếm',
    tier:3, hp:900, atk:60, def:70, special:{type:'heal_owner', interval:3, value:80, desc:'Hồi 80 HP chủ nhân mỗi 3 lượt'},
    desc:'ATK: 60, DEF: 70, HP: 900. Kỹ năng: Hồi 80 HP chủ nhân mỗi 3 lượt.' },

  // Tier 4
  { id:'spirit_dragon_puppet', name:'Linh Long Khối',     emoji:'🐉', rarity:'huyền thoại',
    tier:4, hp:2200, atk:280, def:180, special:{type:'dragon_claw', value:400, interval:4, desc:'Mỗi 4 lượt dùng Long Trảo +400 sát thương'},
    desc:'ATK: 280, DEF: 180, HP: 2200. Kỹ năng: Long Trảo mỗi 4 lượt.' },
  { id:'void_puppet',       name:'Hư Không Sát Thủ',     emoji:'🌑', rarity:'huyền thoại',
    tier:4, hp:1800, atk:350, def:120, special:{type:'stun', chance:30, desc:'30% làm địch choáng 1 lượt'},
    desc:'ATK: 350, DEF: 120, HP: 1800. Kỹ năng: 30% choáng địch.' },
  { id:'iron_colossus_puppet', name:'Thiết Sơn Cự Nhân',  emoji:'🗻', rarity:'huyền thoại',
    tier:4, hp:4000, atk:150, def:400, special:{type:'immune_once', desc:'Miễn nhiễm 1 đòn mỗi lượt'},
    desc:'ATK: 150, DEF: 400, HP: 4000. Kỹ năng: Chặn 1 đòn/lượt.' },
  { id:'phoenix_puppet',    name:'Hỏa Phượng Tái Sinh',  emoji:'🦅', rarity:'huyền thoại',
    tier:4, hp:2500, atk:260, def:160, special:{type:'revive', threshold:20, healPct:50, desc:'HP<20% hồi 50% HP 1 lần'},
    desc:'ATK: 260, DEF: 160, HP: 2500. Kỹ năng: Hồi 50% HP khi HP nguy kịch.' },
  { id:'twin_stars_puppet', name:'Song Tinh Liên Hoàn',  emoji:'✨', rarity:'huyền thoại',
    tier:4, hp:2000, atk:220, def:200, special:{type:'twin_strike', desc:'Triệu 2 khối nhỏ, đánh đồng loạt'},
    desc:'ATK: 220, DEF: 200, HP: 2000. Kỹ năng: Tấn công đồng loạt 2 đòn.' },

  // Tier 5
  { id:'chaos_golem',       name:'Hỗn Độn Thần Hình',    emoji:'💫', rarity:'huyền thoại',
    tier:5, hp:3500, atk:420, def:220, special:{type:'chaos_burst', interval:5, value:600, desc:'Mỗi 5 lượt tung Hỗn Độn Lôi 600 sát thương'},
    desc:'ATK: 420, DEF: 220, HP: 3500. Kỹ năng: Hỗn Độn Lôi 600 mỗi 5 lượt.' },
  { id:'immortal_golem',    name:'Bất Tử Khối Thần',     emoji:'⭐', rarity:'huyền thoại',
    tier:5, hp:4500, atk:380, def:380, special:{type:'regen', value:80, desc:'Hồi 80 HP mỗi lượt chiến đấu'},
    desc:'ATK: 380, DEF: 380, HP: 4500. Kỹ năng: Hồi 80 HP/lượt.' },
  { id:'dragon_emperor_puppet', name:'Long Đế Thiên Oai', emoji:'🐲', rarity:'huyền thoại',
    tier:5, hp:3200, atk:480, def:180, special:{type:'armor_break', value:30, desc:'Giảm 30% DEF địch vĩnh viễn trong chiến đấu'},
    desc:'ATK: 480, DEF: 180, HP: 3200. Kỹ năng: Giảm 30% DEF địch.' },
  { id:'heaven_sentinel_puppet', name:'Thiên Thủ Thần Vệ', emoji:'🛡', rarity:'huyền thoại',
    tier:5, hp:5500, atk:180, def:520, special:{type:'taunt', desc:'Hút sát thương cho chủ nhân'},
    desc:'ATK: 180, DEF: 520, HP: 5500. Kỹ năng: Hút sát thương cho chủ nhân.' },
  { id:'supreme_golem',     name:'Vô Thượng Khối Thánh', emoji:'🌟', rarity:'huyền thoại',
    tier:5, hp:4800, atk:450, def:400, special:{type:'heal_owner', interval:2, value:120, desc:'Hồi 120 HP chủ nhân mỗi 2 lượt'},
    desc:'ATK: 450, DEF: 400, HP: 4800. Kỹ năng: Hồi 120 HP chủ nhân mỗi 2 lượt.' },
];

export function fmtPuppetDuration(s) {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}p`;
  return `${Math.floor(s/3600)}h`;
}