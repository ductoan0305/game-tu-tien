// ============================================================
// alchemy/tran-phap-data.js — Trận Pháp Sư
// Nghề phụ: bố trận tốn linh thạch, buff nhiều loại
// Session 5
// ============================================================

// ---- Loại Trận Pháp ----
// 'passive'  — Thường trực: tốn stone/phút game, buff liên tục, có thể huỷ
// 'active'   — Kích hoạt: tốn stone 1 lần, buff X giây game-time
// 'defense'  — Phòng ngự: tốn stone 1 lần, giảm damage nhận vào X giây

// ---- Cấp Bậc Trận Pháp Sư ----
export const ARRAY_MASTER_RANKS = [
  { rank:0, name:'Trận Pháp',  emoji:'🔯', minArrays:0,   bonus:0,  desc:'Mới nhập môn, bố trận đơn giản nhất.' },
  { rank:1, name:'Trận Pháp Học Đồ',  emoji:'🌀', minArrays:5,   bonus:8,  desc:'+8% hiệu quả trận. Mở Tier 2.' },
  { rank:2, name:'Trận Pháp Sư',       emoji:'⭐', minArrays:20,  bonus:15, desc:'+15% hiệu quả. Mở Tier 3.' },
  { rank:3, name:'Trận Pháp Đại Sư',  emoji:'🌟', minArrays:50,  bonus:25, desc:'+25% hiệu quả. Mở Tier 4.' },
  { rank:4, name:'Trận Pháp Tông Sư', emoji:'💫', minArrays:100, bonus:40, desc:'+40% hiệu quả. Mở Tier 5.' },
  { rank:5, name:'Trận Pháp Thánh',   emoji:'👑', minArrays:200, bonus:60, desc:'+60% hiệu quả. Trận pháp thiên hạ vô địch.' },
];

export function getArrayMasterRank(count) {
  for (let i = ARRAY_MASTER_RANKS.length - 1; i >= 0; i--) {
    if (count >= ARRAY_MASTER_RANKS[i].minArrays) return ARRAY_MASTER_RANKS[i];
  }
  return ARRAY_MASTER_RANKS[0];
}

export function getNextArrayMasterRank(count) {
  for (let i = 0; i < ARRAY_MASTER_RANKS.length; i++) {
    if (count < ARRAY_MASTER_RANKS[i].minArrays) return ARRAY_MASTER_RANKS[i];
  }
  return null;
}

// ---- 35 Trận Pháp ----
// stoneCostOnce: tốn 1 lần khi kích hoạt
// stoneCostPerMin: tốn mỗi phút game-time (passive)
// effect: { type, value }
//   type: rate_pct | atk_pct | def_pct | hp_max_pct | stone_pct | exp_pct | def_flat | hp_regen | stamina_regen | dmg_reduce
// duration (giây game): chỉ dùng cho active/defense
export const ARRAY_RECIPES = [

  // ══════════════════════════════════════════
  // TIER 1 — Sơ Cấp Trận (realm 0, rank 0)
  // ══════════════════════════════════════════

  // Passive — tu luyện
  {
    id:'array_qi_field',     name:'Linh Khí Tụ Tán Trận',   emoji:'🌀', category:'passive', tier:1,
    requireRealm:0, requireRank:0,
    materials:[{id:'spirit_herb',qty:5},{id:'earth_stone',qty:3}],
    stoneCostOnce:80, stoneCostPerMin:5,
    effect:{ type:'rate_pct', value:10 },
    desc:'Tụ linh khí xung quanh. +10% tốc tu luyện. Tiêu 5💎/phút.',
    lore:'Trận pháp đơn giản nhất, mọi tu sĩ đều biết vẽ.',
  },
  {
    id:'array_exp_field',    name:'Ngộ Đạo Khai Minh Trận', emoji:'📚', category:'passive', tier:1,
    requireRealm:0, requireRank:0,
    materials:[{id:'spirit_herb',qty:5},{id:'jade_lotus',qty:2}],
    stoneCostOnce:100, stoneCostPerMin:6,
    effect:{ type:'exp_pct', value:12 },
    desc:'Khai minh trí tuệ. +12% EXP nhận được. Tiêu 6💎/phút.',
    lore:'Tu sĩ ngồi trong trận này cảm thấy đầu óc sáng suốt hơn bao giờ hết.',
  },
  // Active — tức thì
  {
    id:'array_burst_qi',     name:'Bạo Phát Linh Khí Trận', emoji:'⚡', category:'active',  tier:1,
    requireRealm:0, requireRank:0,
    materials:[{id:'fire_essence',qty:3},{id:'earth_stone',qty:2}],
    stoneCostOnce:60, duration:600,
    effect:{ type:'rate_pct', value:25 },
    desc:'Linh khí bạo phát 10 phút. +25% tốc tu luyện. Tốn 60💎.',
    lore:'Trận bạo phát ngắn hạn — lý tưởng trước khi thiền định.',
  },
  {
    id:'array_shield_basic', name:'Hộ Thể Linh Khí Trận',  emoji:'🛡', category:'defense', tier:1,
    requireRealm:0, requireRank:0,
    materials:[{id:'earth_stone',qty:5},{id:'wolf_fang',qty:2}],
    stoneCostOnce:70, duration:900,
    effect:{ type:'dmg_reduce', value:15 },
    desc:'Hộ thể 15 phút. Giảm 15% sát thương nhận vào. Tốn 70💎.',
    lore:'Màn linh khí bảo vệ tu sĩ trước đòn tấn công.',
  },
  {
    id:'array_stone_boost',  name:'Linh Thạch Tụ Tài Trận', emoji:'💎', category:'active',  tier:1,
    requireRealm:0, requireRank:0,
    materials:[{id:'earth_stone',qty:4},{id:'spirit_herb',qty:3}],
    stoneCostOnce:50, duration:900,
    effect:{ type:'stone_pct', value:20 },
    desc:'Tụ tài linh thạch. +20% linh thạch thu được 15 phút. Tốn 50💎.',
    lore:'Trận pháp yêu thích của các thương nhân tu tiên.',
  },
  {
    id:'array_hp_regen',     name:'Sinh Cơ Hồi Phục Trận',  emoji:'💚', category:'passive', tier:1,
    requireRealm:0, requireRank:0,
    materials:[{id:'jade_lotus',qty:4},{id:'spirit_herb',qty:3}],
    stoneCostOnce:90, stoneCostPerMin:7,
    effect:{ type:'hp_regen', value:15 },
    desc:'Hồi phục sinh cơ. +15 HP/giây. Tiêu 7💎/phút.',
    lore:'Trận pháp của y tu sĩ chuyên hồi phục.',
  },

  // ══════════════════════════════════════════
  // TIER 2 — Trung Cấp Trận (realm 0, rank 1)
  // ══════════════════════════════════════════
  {
    id:'array_dual_rate',    name:'Song Nguyên Tụ Linh Trận',emoji:'🌊', category:'passive', tier:2,
    requireRealm:0, requireRank:1,
    materials:[{id:'jade_lotus',qty:5},{id:'moon_dew',qty:3},{id:'earth_stone',qty:4}],
    stoneCostOnce:200, stoneCostPerMin:12,
    effect:{ type:'rate_pct', value:20 }, effect2:{ type:'exp_pct', value:10 },
    desc:'Tụ song nguyên linh khí. +20% tốc tu + 10% EXP. Tiêu 12💎/phút.',
    lore:'Hai nguồn linh khí âm dương hoà hợp thành song nguyên.',
  },
  {
    id:'array_war_field',    name:'Chiến Khí Phẫn Nộ Trận', emoji:'⚔', category:'active',  tier:2,
    requireRealm:0, requireRank:1,
    materials:[{id:'wolf_fang',qty:5},{id:'fire_essence',qty:4},{id:'demon_core_1',qty:1}],
    stoneCostOnce:180, duration:1800,
    effect:{ type:'atk_pct', value:25 },
    desc:'Chiến khí dâng trào. +25% ATK trong 30 phút. Tốn 180💎.',
    lore:'Trận pháp của chiến tu sĩ trước khi xông trận.',
  },
  {
    id:'array_iron_wall',    name:'Thiết Bích Sơn Hà Trận', emoji:'🗿', category:'defense', tier:2,
    requireRealm:0, requireRank:1,
    materials:[{id:'earth_stone',qty:8},{id:'serpent_scale',qty:3},{id:'demon_core_1',qty:1}],
    stoneCostOnce:200, duration:1800,
    effect:{ type:'dmg_reduce', value:30 }, effect2:{ type:'def_pct', value:15 },
    desc:'Thiết bích phòng thủ. -30% sát thương + 15% DEF trong 30 phút. Tốn 200💎.',
    lore:'Trận pháp bất phá của môn phái luyện thể.',
  },
  {
    id:'array_hp_mountain',  name:'Thiên Sơn Tích Thể Trận', emoji:'⛰', category:'passive', tier:2,
    requireRealm:0, requireRank:1,
    materials:[{id:'blood_ginseng',qty:3},{id:'earth_stone',qty:6},{id:'jade_lotus',qty:3}],
    stoneCostOnce:220, stoneCostPerMin:14,
    effect:{ type:'hp_max_pct', value:20 },
    desc:'Tăng cường nhục thân. +20% HP tối đa. Tiêu 14💎/phút.',
    lore:'Núi cao bền vững — trận pháp học từ Thiết Cốt Môn.',
  },
  {
    id:'array_speed_hunt',   name:'Ưng Mục Tốc Liệp Trận',  emoji:'🦅', category:'active',  tier:2,
    requireRealm:0, requireRank:1,
    materials:[{id:'hawk_feather',qty:4},{id:'wolf_fang',qty:4}],
    stoneCostOnce:160, duration:1800,
    effect:{ type:'stone_pct', value:35 }, effect2:{ type:'exp_pct', value:20 },
    desc:'Ưng mục săn mồi. +35% linh thạch + 20% EXP trong 30 phút. Tốn 160💎.',
    lore:'Trận pháp của các thợ săn yêu thú chuyên nghiệp.',
  },

  // ══════════════════════════════════════════
  // TIER 3 — Cao Cấp Trận (realm 1, rank 2)
  // ══════════════════════════════════════════
  {
    id:'array_heaven_qi',    name:'Thiên Địa Linh Khí Đại Trận',emoji:'🌌', category:'passive', tier:3,
    requireRealm:1, requireRank:2,
    materials:[{id:'cloud_mushroom',qty:5},{id:'moon_dew',qty:5},{id:'lightning_core',qty:2}],
    stoneCostOnce:500, stoneCostPerMin:25,
    effect:{ type:'rate_pct', value:35 },
    desc:'Thiên địa linh khí vô tận. +35% tốc tu luyện. Tiêu 25💎/phút.',
    lore:'Trận hoà mình vào thiên địa, linh khí vô hạn tuôn vào.',
  },
  {
    id:'array_five_element', name:'Ngũ Hành Toàn Hệ Trận',   emoji:'🌈', category:'passive', tier:3,
    requireRealm:1, requireRank:2,
    materials:[{id:'fire_essence',qty:4},{id:'ice_crystal',qty:4},{id:'lightning_core',qty:2},{id:'earth_stone',qty:5},{id:'moon_dew',qty:3}],
    stoneCostOnce:600, stoneCostPerMin:30,
    effect:{ type:'rate_pct', value:25 }, effect2:{ type:'atk_pct', value:15 }, effect3:{ type:'def_pct', value:15 },
    desc:'Ngũ hành toàn hệ. +25% tốc tu + 15% ATK + 15% DEF. Tiêu 30💎/phút.',
    lore:'Năm hành hội tụ — trận pháp uy lực nhất Trúc Cơ kỳ.',
  },
  {
    id:'array_thunder_war',  name:'Lôi Đình Chiến Trận',      emoji:'⚡', category:'active',  tier:3,
    requireRealm:1, requireRank:2,
    materials:[{id:'lightning_core',qty:3},{id:'hawk_feather',qty:5},{id:'demon_core_1',qty:2}],
    stoneCostOnce:450, duration:3600,
    effect:{ type:'atk_pct', value:45 },
    desc:'Lôi đình chiến khí. +45% ATK trong 1 giờ. Tốn 450💎.',
    lore:'Sét trời dẫn vào trận, tu sĩ như được lôi thần phù hộ.',
  },
  {
    id:'array_fortress',     name:'Kim Thành Đại Phòng Trận', emoji:'🏯', category:'defense', tier:3,
    requireRealm:1, requireRank:2,
    materials:[{id:'serpent_scale',qty:5},{id:'earth_stone',qty:10},{id:'blood_ginseng',qty:3}],
    stoneCostOnce:500, duration:3600,
    effect:{ type:'dmg_reduce', value:45 }, effect2:{ type:'def_pct', value:25 },
    desc:'Kim thành bất phá. -45% sát thương + 25% DEF trong 1 giờ. Tốn 500💎.',
    lore:'Kiên cố như thành vàng, địch quân không thể phá.',
  },
  {
    id:'array_dual_harvest', name:'Song Thu Phong Tài Trận',  emoji:'🌾', category:'active',  tier:3,
    requireRealm:1, requireRank:2,
    materials:[{id:'cloud_mushroom',qty:4},{id:'hawk_feather',qty:4},{id:'moon_dew',qty:4}],
    stoneCostOnce:400, duration:3600,
    effect:{ type:'stone_pct', value:50 }, effect2:{ type:'exp_pct', value:35 },
    desc:'Song thu tài lộc. +50% linh thạch + 35% EXP trong 1 giờ. Tốn 400💎.',
    lore:'Hai luồng tài khí song song — lý tưởng để tích lũy nguồn lực.',
  },
  {
    id:'array_life_spring',  name:'Sinh Mệnh Tuyền Vĩnh Trận',emoji:'🌊', category:'passive', tier:3,
    requireRealm:1, requireRank:2,
    materials:[{id:'blood_ginseng',qty:5},{id:'moon_dew',qty:5},{id:'jade_lotus',qty:4}],
    stoneCostOnce:550, stoneCostPerMin:28,
    effect:{ type:'hp_regen', value:50 }, effect2:{ type:'hp_max_pct', value:15 },
    desc:'Suối sinh mệnh. +50 HP/giây + 15% HP tối đa. Tiêu 28💎/phút.',
    lore:'Suối nước từ đất linh chảy qua trận — sinh lực vô tận.',
  },

  // ══════════════════════════════════════════
  // TIER 4 — Thượng Cấp Trận (realm 2, rank 3)
  // ══════════════════════════════════════════
  {
    id:'array_nirvana',      name:'Niết Bàn Bất Diệt Trận',  emoji:'🔥', category:'passive', tier:4,
    requireRealm:2, requireRank:3,
    materials:[{id:'phoenix_feather',qty:3},{id:'crimson_herb',qty:5},{id:'demon_core_2',qty:2}],
    stoneCostOnce:1200, stoneCostPerMin:60,
    effect:{ type:'rate_pct', value:55 }, effect2:{ type:'hp_regen', value:80 },
    desc:'Niết bàn bất diệt. +55% tốc tu + 80 HP/giây. Tiêu 60💎/phút.',
    lore:'Phượng hoàng tái sinh — trận pháp của những người đã chạm đến ranh giới cái chết.',
  },
  {
    id:'array_dragon_might', name:'Long Uy Chiến Thần Trận',  emoji:'🐉', category:'active',  tier:4,
    requireRealm:2, requireRank:3,
    materials:[{id:'dragon_scale',qty:2},{id:'lightning_core',qty:4},{id:'demon_core_2',qty:3}],
    stoneCostOnce:1500, duration:7200,
    effect:{ type:'atk_pct', value:70 }, effect2:{ type:'def_pct', value:30 },
    desc:'Long uy thiên hạ. +70% ATK + 30% DEF trong 2 giờ. Tốn 1500💎.',
    lore:'Long uy bùng phát — kẻ địch chưa đánh đã khiếp sợ.',
  },
  {
    id:'array_void_defense', name:'Hư Không Vô Ngã Phòng Trận',emoji:'🌀', category:'defense', tier:4,
    requireRealm:2, requireRank:3,
    materials:[{id:'void_grass',qty:3},{id:'dark_essence',qty:4},{id:'demon_core_2',qty:2}],
    stoneCostOnce:1400, duration:7200,
    effect:{ type:'dmg_reduce', value:60 }, effect2:{ type:'def_pct', value:40 },
    desc:'Hư không phòng ngự. -60% sát thương + 40% DEF trong 2 giờ. Tốn 1400💎.',
    lore:'Hư không vô hình — đòn tấn công như đâm vào khoảng trống.',
  },
  {
    id:'array_wealth_ocean', name:'Phú Quý Như Hải Đại Trận', emoji:'🌊', category:'passive', tier:4,
    requireRealm:2, requireRank:3,
    materials:[{id:'dark_essence',qty:5},{id:'cloud_mushroom',qty:6},{id:'heaven_stone',qty:1}],
    stoneCostOnce:1300, stoneCostPerMin:65,
    effect:{ type:'stone_pct', value:60 }, effect2:{ type:'exp_pct', value:40 },
    desc:'Phú quý vô biên. +60% linh thạch + 40% EXP. Tiêu 65💎/phút.',
    lore:'Trận pháp của các phú hào tu tiên — tài lộc cuồn cuộn như đại dương.',
  },
  {
    id:'array_six_harmony',  name:'Lục Hợp Thiên Địa Trận',  emoji:'☯', category:'passive', tier:4,
    requireRealm:2, requireRank:3,
    materials:[{id:'void_grass',qty:4},{id:'crimson_herb',qty:4},{id:'ice_crystal',qty:4},{id:'lightning_core',qty:3}],
    stoneCostOnce:1600, stoneCostPerMin:80,
    effect:{ type:'rate_pct', value:50 }, effect2:{ type:'atk_pct', value:25 }, effect3:{ type:'hp_max_pct', value:25 },
    desc:'Lục hợp thiên địa. +50% tốc tu + 25% ATK + 25% HP max. Tiêu 80💎/phút.',
    lore:'Sáu hướng trời đất hoà làm một — uy lực vô song.',
  },

  // ══════════════════════════════════════════
  // TIER 5 — Tiên Cấp Trận (realm 3, rank 4-5)
  // ══════════════════════════════════════════
  {
    id:'array_immortal_qi',  name:'Trường Sinh Tiên Khí Đại Trận',emoji:'⭐', category:'passive', tier:5,
    requireRealm:3, requireRank:4,
    materials:[{id:'immortal_root',qty:2},{id:'heaven_stone',qty:2},{id:'chaos_pearl',qty:1}],
    stoneCostOnce:4000, stoneCostPerMin:200,
    effect:{ type:'rate_pct', value:80 }, effect2:{ type:'exp_pct', value:60 },
    desc:'Tiên khí trường thọ. +80% tốc tu + 60% EXP. Tiêu 200💎/phút.',
    lore:'Linh khí tiên giới tràn xuống nhân giới qua trận pháp huyền bí.',
  },
  {
    id:'array_god_of_war',   name:'Chiến Thần Vô Địch Trận',  emoji:'🗡', category:'active',  tier:5,
    requireRealm:3, requireRank:4,
    materials:[{id:'dragon_scale',qty:3},{id:'chaos_pearl',qty:1},{id:'demon_core_3',qty:3}],
    stoneCostOnce:5000, duration:18000,
    effect:{ type:'atk_pct', value:80 }, effect2:{ type:'dmg_reduce', value:20 },
    desc:'Chiến thần vô địch. +80% ATK + -20% sát thương nhận 5 giờ. Tốn 5000💎.',
    lore:'Trận pháp mô phỏng chiến thần cổ đại — uy chấn thiên hạ.',
  },
  {
    id:'array_heaven_gate',  name:'Thiên Môn Vạn Pháp Trận',  emoji:'🌟', category:'passive', tier:5,
    requireRealm:3, requireRank:5,
    materials:[{id:'chaos_pearl',qty:2},{id:'immortal_root',qty:3},{id:'heaven_stone',qty:3}],
    stoneCostOnce:6000, stoneCostPerMin:300,
    effect:{ type:'rate_pct', value:100 }, effect2:{ type:'atk_pct', value:40 }, effect3:{ type:'def_pct', value:40 },
    desc:'Thiên môn vạn pháp. +100% tốc tu + 40% ATK + 40% DEF. Tiêu 300💎/phút.',
    lore:'Cửa trời mở ra — vạn pháp chảy vào tu sĩ không ngừng.',
  },
  {
    id:'array_chaos_seal',   name:'Hỗn Độn Phong Ấn Phòng Trận',emoji:'🌀', category:'defense', tier:5,
    requireRealm:3, requireRank:4,
    materials:[{id:'chaos_pearl',qty:2},{id:'void_grass',qty:5},{id:'dark_essence',qty:5}],
    stoneCostOnce:4500, duration:18000,
    effect:{ type:'dmg_reduce', value:75 }, effect2:{ type:'def_pct', value:60 },
    desc:'Hỗn độn phong ấn. -75% sát thương + 60% DEF trong 5 giờ. Tốn 4500💎.',
    lore:'Phong ấn từ hỗn độn — mọi đòn tấn công đều bị hấp thụ vào hư không.',
  },
  {
    id:'array_supreme_harvest',name:'Vạn Tài Quy Nguyên Trận', emoji:'💫', category:'active',  tier:5,
    requireRealm:3, requireRank:5,
    materials:[{id:'heaven_stone',qty:3},{id:'immortal_root',qty:3},{id:'chaos_pearl',qty:1}],
    stoneCostOnce:5500, duration:18000,
    effect:{ type:'stone_pct', value:100 }, effect2:{ type:'exp_pct', value:80 },
    desc:'Vạn tài quy nguyên. +100% linh thạch + 80% EXP trong 5 giờ. Tốn 5500💎.',
    lore:'Tài lộc từ vũ trụ đổ về một điểm — trận pháp ước mơ của mọi tu sĩ.',
  },
];

// Helper format duration
export function fmtArrayDuration(secs) {
  if (secs >= 3600) return `${(secs/3600).toFixed(1)}h`;
  if (secs >= 60)   return `${Math.round(secs/60)} phút`;
  return `${secs}s`;
}

// Helper: lấy tất cả effects của 1 trận
export function getArrayEffects(recipe) {
  const effects = [recipe.effect];
  if (recipe.effect2) effects.push(recipe.effect2);
  if (recipe.effect3) effects.push(recipe.effect3);
  return effects.filter(Boolean);
}