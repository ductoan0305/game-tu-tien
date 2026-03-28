// ============================================================
// alchemy/phu-chu-data.js — Phù Chú Sư
// Nghề phụ: vẽ bùa → item tiêu dùng 1 lần vào túi đồ
// Bùa có thời hạn (timed buff) khi dùng, nhiều loại effect
// Session 5
// ============================================================

// ---- Cấp Bậc Phù Chú Sư ----
export const TALISMAN_MASTER_RANKS = [
  { rank:0, name:'Phù Chú',   emoji:'📜', minDraws:0,   bonus:0,  desc:'Mới học vẽ bùa, chỉ làm bùa đơn giản.' },
  { rank:1, name:'Học Đồ Phù Lục',      emoji:'📿', minDraws:5,   bonus:5,  desc:'+5% tỷ lệ. Mở bùa Tier 2.' },
  { rank:2, name:'Phù Lục Sư',           emoji:'⭐', minDraws:20,  bonus:12, desc:'+12% tỷ lệ. Mở bùa Tier 3.' },
  { rank:3, name:'Phù Lục Đại Sư',      emoji:'🌟', minDraws:50,  bonus:22, desc:'+22% tỷ lệ. Mở bùa Tier 4.' },
  { rank:4, name:'Phù Lục Tông Sư',     emoji:'💫', minDraws:100, bonus:35, desc:'+35% tỷ lệ. Mở bùa Tier 5.' },
  { rank:5, name:'Phù Lục Thánh Nhân',  emoji:'👑', minDraws:200, bonus:50, desc:'+50% tỷ lệ. Vẽ bùa tiên phẩm.' },
];

export function getTalismanRank(count) {
  for (let i = TALISMAN_MASTER_RANKS.length - 1; i >= 0; i--) {
    if (count >= TALISMAN_MASTER_RANKS[i].minDraws) return TALISMAN_MASTER_RANKS[i];
  }
  return TALISMAN_MASTER_RANKS[0];
}
export function getNextTalismanRank(count) {
  for (let i = 0; i < TALISMAN_MASTER_RANKS.length; i++) {
    if (count < TALISMAN_MASTER_RANKS[i].minDraws) return TALISMAN_MASTER_RANKS[i];
  }
  return null;
}

// ---- 30 Công Thức Vẽ Bùa ----
// resultItem: id của bùa trong TALISMAN_ITEMS (dùng trong inventory)
// Bùa khi dùng (useItem) → áp dụng buff tạm thời
// action: 'talisman' → switch case riêng trong useItem
export const TALISMAN_RECIPES = [

  // ══════════════════════════════════════════
  // TIER 1 — Phàm Phù (realm 0, rank 0)
  // ══════════════════════════════════════════
  {
    id:'draw_qi_talisman',      name:'Vẽ Linh Khí Phù',         emoji:'📜', tier:1,
    resultItem:'qi_talisman',   qty:2,
    materials:[{id:'spirit_herb',qty:3},{id:'wolf_fang',qty:1}],
    stoneCost:25, successChance:0.88, requireRealm:0, requireRank:0,
    desc:'Tạo 2 Linh Khí Phù. Dùng → +20% tốc tu 10 phút.',
  },
  {
    id:'draw_shield_talisman',  name:'Vẽ Hộ Thân Phù',          emoji:'📜', tier:1,
    resultItem:'shield_talisman', qty:2,
    materials:[{id:'earth_stone',qty:4},{id:'spirit_herb',qty:2}],
    stoneCost:30, successChance:0.87, requireRealm:0, requireRank:0,
    desc:'Tạo 2 Hộ Thân Phù. Dùng → +15% DEF 10 phút.',
  },
  {
    id:'draw_hp_talisman',      name:'Vẽ Hồi Linh Phù',         emoji:'📜', tier:1,
    resultItem:'hp_talisman',   qty:2,
    materials:[{id:'jade_lotus',qty:3},{id:'spirit_herb',qty:2}],
    stoneCost:28, successChance:0.90, requireRealm:0, requireRank:0,
    desc:'Tạo 2 Hồi Linh Phù. Dùng → Hồi 300 HP tức thì.',
  },
  {
    id:'draw_atk_talisman',     name:'Vẽ Sát Khí Phù',          emoji:'📜', tier:1,
    resultItem:'atk_talisman',  qty:2,
    materials:[{id:'wolf_fang',qty:4},{id:'fire_essence',qty:2}],
    stoneCost:35, successChance:0.85, requireRealm:0, requireRank:0,
    desc:'Tạo 2 Sát Khí Phù. Dùng → +20% ATK 10 phút.',
  },
  {
    id:'draw_stone_talisman',   name:'Vẽ Tụ Tài Phù',           emoji:'📜', tier:1,
    resultItem:'stone_talisman', qty:2,
    materials:[{id:'earth_stone',qty:3},{id:'spirit_herb',qty:3}],
    stoneCost:22, successChance:0.90, requireRealm:0, requireRank:0,
    desc:'Tạo 2 Tụ Tài Phù. Dùng → +25% linh thạch 10 phút.',
  },

  // ══════════════════════════════════════════
  // TIER 2 — Linh Phù (realm 0, rank 1)
  // ══════════════════════════════════════════
  {
    id:'draw_speed_talisman',   name:'Vẽ Tốc Linh Phù',         emoji:'📜', tier:2,
    resultItem:'speed_talisman', qty:2,
    materials:[{id:'hawk_feather',qty:3},{id:'moon_dew',qty:2},{id:'spirit_herb',qty:3}],
    stoneCost:90, successChance:0.78, requireRealm:0, requireRank:1,
    desc:'Tạo 2 Tốc Linh Phù. Dùng → +40% tốc tu 30 phút.',
  },
  {
    id:'draw_iron_talisman',    name:'Vẽ Thiết Giáp Phù',       emoji:'📜', tier:2,
    resultItem:'iron_talisman', qty:2,
    materials:[{id:'serpent_scale',qty:3},{id:'earth_stone',qty:5}],
    stoneCost:100, successChance:0.75, requireRealm:0, requireRank:1,
    desc:'Tạo 2 Thiết Giáp Phù. Dùng → +30% DEF + -20% sát thương 30 phút.',
  },
  {
    id:'draw_war_talisman',     name:'Vẽ Chiến Thần Phù',       emoji:'📜', tier:2,
    resultItem:'war_talisman',  qty:2,
    materials:[{id:'wolf_fang',qty:5},{id:'fire_essence',qty:4},{id:'hawk_feather',qty:2}],
    stoneCost:120, successChance:0.72, requireRealm:0, requireRank:1,
    desc:'Tạo 2 Chiến Thần Phù. Dùng → +40% ATK 30 phút.',
  },
  {
    id:'draw_heal_talisman',    name:'Vẽ Đại Hồi Thương Phù',  emoji:'📜', tier:2,
    resultItem:'heal_talisman', qty:2,
    materials:[{id:'blood_ginseng',qty:2},{id:'jade_lotus',qty:4},{id:'moon_dew',qty:2}],
    stoneCost:110, successChance:0.76, requireRealm:0, requireRank:1,
    desc:'Tạo 2 Đại Hồi Thương Phù. Dùng → Hồi 800 HP + 20 HP/s 30 phút.',
  },
  {
    id:'draw_wealth_talisman',  name:'Vẽ Hồng Phúc Tụ Bảo Phù',emoji:'📜', tier:2,
    resultItem:'wealth_talisman', qty:2,
    materials:[{id:'moon_dew',qty:3},{id:'jade_lotus',qty:3},{id:'cloud_mushroom',qty:3}],
    stoneCost:95, successChance:0.78, requireRealm:0, requireRank:1,
    desc:'Tạo 2 Hồng Phúc Phù. Dùng → +40% linh thạch + 25% EXP 30 phút.',
  },

  // ══════════════════════════════════════════
  // TIER 3 — Cao Phù (realm 1, rank 2)
  // ══════════════════════════════════════════
  {
    id:'draw_thunder_talisman', name:'Vẽ Lôi Đình Sát Phù',    emoji:'📜', tier:3,
    resultItem:'thunder_talisman', qty:1,
    materials:[{id:'lightning_core',qty:3},{id:'hawk_feather',qty:4},{id:'demon_core_1',qty:2}],
    stoneCost:350, successChance:0.63, requireRealm:1, requireRank:2,
    desc:'Tạo 1 Lôi Đình Phù. Dùng → +65% ATK 1 giờ.',
  },
  {
    id:'draw_mountain_talisman',name:'Vẽ Thái Sơn Hộ Phù',     emoji:'📜', tier:3,
    resultItem:'mountain_talisman', qty:1,
    materials:[{id:'earth_stone',qty:10},{id:'serpent_scale',qty:5},{id:'blood_ginseng',qty:3}],
    stoneCost:380, successChance:0.61, requireRealm:1, requireRank:2,
    desc:'Tạo 1 Thái Sơn Phù. Dùng → -50% sát thương + 40% DEF 1 giờ.',
  },
  {
    id:'draw_insight_talisman', name:'Vẽ Khai Tuệ Ngộ Đạo Phù',emoji:'📜', tier:3,
    resultItem:'insight_talisman', qty:1,
    materials:[{id:'cloud_mushroom',qty:5},{id:'moon_dew',qty:5},{id:'jade_lotus',qty:4}],
    stoneCost:400, successChance:0.60, requireRealm:1, requireRank:2,
    desc:'Tạo 1 Khai Tuệ Phù. Dùng → +60% tốc tu + 40% EXP 1 giờ.',
  },
  {
    id:'draw_phoenix_talisman', name:'Vẽ Phượng Tái Sinh Phù',  emoji:'📜', tier:3,
    resultItem:'phoenix_talisman', qty:1,
    materials:[{id:'phoenix_feather',qty:2},{id:'crimson_herb',qty:4},{id:'blood_ginseng',qty:3}],
    stoneCost:500, successChance:0.58, requireRealm:1, requireRank:2,
    desc:'Tạo 1 Phượng Tái Sinh Phù. Dùng → Hồi toàn bộ HP + 60 HP/s 1 giờ.',
  },
  {
    id:'draw_triple_talisman',  name:'Vẽ Tam Bảo Đại Phù',     emoji:'📜', tier:3,
    resultItem:'triple_talisman', qty:1,
    materials:[{id:'lightning_core',qty:2},{id:'blood_ginseng',qty:3},{id:'phoenix_feather',qty:1},{id:'moon_dew',qty:4}],
    stoneCost:550, successChance:0.55, requireRealm:1, requireRank:2,
    desc:'Tạo 1 Tam Bảo Phù. Dùng → +45% ATK + 45% DEF + 45% tốc tu 1 giờ.',
  },

  // ══════════════════════════════════════════
  // TIER 4 — Thượng Phù (realm 2, rank 3)
  // ══════════════════════════════════════════
  {
    id:'draw_void_talisman',    name:'Vẽ Hư Không Thôn Thực Phù',emoji:'📜', tier:4,
    resultItem:'void_talisman', qty:1,
    materials:[{id:'void_grass',qty:4},{id:'dark_essence',qty:4},{id:'demon_core_2',qty:2}],
    stoneCost:1200, successChance:0.48, requireRealm:2, requireRank:3,
    desc:'Tạo 1 Hư Không Phù. Dùng → -70% sát thương nhận 2 giờ.',
  },
  {
    id:'draw_dragon_talisman',  name:'Vẽ Long Uy Bá Thiên Phù', emoji:'📜', tier:4,
    resultItem:'dragon_talisman', qty:1,
    materials:[{id:'dragon_scale',qty:2},{id:'demon_core_2',qty:3},{id:'void_grass',qty:3}],
    stoneCost:1500, successChance:0.44, requireRealm:2, requireRank:3,
    desc:'Tạo 1 Long Uy Phù. Dùng → +90% ATK 2 giờ.',
  },
  {
    id:'draw_heaven_talisman',  name:'Vẽ Thiên Địa Hoà Hợp Phù',emoji:'📜', tier:4,
    resultItem:'heaven_talisman', qty:1,
    materials:[{id:'heaven_stone',qty:2},{id:'void_grass',qty:3},{id:'dark_essence',qty:4}],
    stoneCost:1800, successChance:0.42, requireRealm:2, requireRank:3,
    desc:'Tạo 1 Thiên Địa Phù. Dùng → +80% tốc tu + 60% EXP 2 giờ.',
  },
  {
    id:'draw_wealth_ocean_talisman',name:'Vẽ Tài Lộc Đại Hải Phù',emoji:'📜', tier:4,
    resultItem:'wealth_ocean_talisman', qty:1,
    materials:[{id:'dark_essence',qty:5},{id:'demon_core_2',qty:3},{id:'heaven_stone',qty:1}],
    stoneCost:1400, successChance:0.45, requireRealm:2, requireRank:3,
    desc:'Tạo 1 Tài Lộc Phù. Dùng → +80% linh thạch + 60% EXP 2 giờ.',
  },
  {
    id:'draw_giant_talisman',   name:'Vẽ Hộ Thân Cự Linh Phù',  emoji:'📜', tier:4,
    resultItem:'giant_talisman', qty:1,
    materials:[{id:'dragon_scale',qty:1},{id:'earth_stone',qty:12},{id:'demon_core_2',qty:2},{id:'void_grass',qty:3}],
    stoneCost:1600, successChance:0.43, requireRealm:2, requireRank:3,
    desc:'Tạo 1 Cự Linh Phù. Dùng → +50% HP max + +80% DEF + 40 HP/s 2 giờ.',
  },

  // ══════════════════════════════════════════
  // TIER 5 — Tiên Phù (realm 3, rank 4-5)
  // ══════════════════════════════════════════
  {
    id:'draw_chaos_talisman',   name:'Vẽ Hỗn Độn Khai Thiên Phù',emoji:'📜', tier:5,
    resultItem:'chaos_talisman', qty:1,
    materials:[{id:'chaos_pearl',qty:1},{id:'dragon_scale',qty:2},{id:'immortal_root',qty:2}],
    stoneCost:5000, successChance:0.30, requireRealm:3, requireRank:4,
    desc:'Tạo 1 Hỗn Độn Phù. Dùng → +130% ATK + -60% sát thương 5 giờ.',
  },
  {
    id:'draw_immortal_talisman',name:'Vẽ Trường Sinh Tiên Phù',  emoji:'📜', tier:5,
    resultItem:'immortal_talisman', qty:1,
    materials:[{id:'immortal_root',qty:3},{id:'chaos_pearl',qty:1},{id:'heaven_stone',qty:2}],
    stoneCost:6000, successChance:0.27, requireRealm:3, requireRank:4,
    desc:'Tạo 1 Trường Sinh Phù. Dùng → +100% tốc tu + 80% EXP 5 giờ.',
  },
  {
    id:'draw_supreme_talisman', name:'Vẽ Vô Thượng Tiên Phù',   emoji:'📜', tier:5,
    resultItem:'supreme_talisman', qty:1,
    materials:[{id:'chaos_pearl',qty:2},{id:'immortal_root',qty:2},{id:'heaven_stone',qty:3}],
    stoneCost:8000, successChance:0.24, requireRealm:3, requireRank:5,
    desc:'Tạo 1 Vô Thượng Phù. Dùng → +120% ATK + 120% DEF + 100% tốc tu 5 giờ.',
  },
  {
    id:'draw_fortune_talisman', name:'Vẽ Hồng Vận Vô Lượng Phù',emoji:'📜', tier:5,
    resultItem:'fortune_talisman', qty:1,
    materials:[{id:'chaos_pearl',qty:1},{id:'heaven_stone',qty:3},{id:'immortal_root',qty:2}],
    stoneCost:7000, successChance:0.26, requireRealm:3, requireRank:5,
    desc:'Tạo 1 Hồng Vận Phù. Dùng → +120% linh thạch + 100% EXP 5 giờ.',
  },
  {
    id:'draw_god_talisman',     name:'Vẽ Thiên Đế Hộ Thân Phù', emoji:'📜', tier:5,
    resultItem:'god_talisman',  qty:1,
    materials:[{id:'chaos_pearl',qty:2},{id:'dragon_scale',qty:3},{id:'void_grass',qty:5}],
    stoneCost:7500, successChance:0.25, requireRealm:3, requireRank:5,
    desc:'Tạo 1 Thiên Đế Phù. Dùng → -80% sát thương + 80% DEF + 60 HP/s 5 giờ.',
  },
];

// ---- Talisman Items (vào inventory khi vẽ thành công) ----
// action: 'talisman' — xử lý riêng trong useItem
export const TALISMAN_ITEMS = [
  // Tier 1
  { id:'qi_talisman',       name:'Linh Khí Phù',           emoji:'🟡', rarity:'hiếm',        type:'timed', action:'talisman',
    buffs:[{type:'rate_pct',value:20,duration:600}],          desc:'Dùng: +20% tốc tu 10 phút.' },
  { id:'shield_talisman',   name:'Hộ Thân Phù',            emoji:'🔵', rarity:'hiếm',        type:'timed', action:'talisman',
    buffs:[{type:'def_pct',value:15,duration:600}],           desc:'Dùng: +15% DEF 10 phút.' },
  { id:'hp_talisman',       name:'Hồi Linh Phù',           emoji:'🟢', rarity:'hiếm',        type:'timed', action:'talisman',
    buffs:[{type:'hp_instant',value:300}],                    desc:'Dùng: Hồi 300 HP.' },
  { id:'atk_talisman',      name:'Sát Khí Phù',            emoji:'🔴', rarity:'hiếm',        type:'timed', action:'talisman',
    buffs:[{type:'atk_pct',value:20,duration:600}],           desc:'Dùng: +20% ATK 10 phút.' },
  { id:'stone_talisman',    name:'Tụ Tài Phù',             emoji:'💛', rarity:'hiếm',        type:'timed', action:'talisman',
    buffs:[{type:'stone_pct',value:25,duration:600}],         desc:'Dùng: +25% linh thạch 10 phút.' },
  // Tier 2
  { id:'speed_talisman',    name:'Tốc Linh Phù',           emoji:'⚡', rarity:'cực hiếm',    type:'timed', action:'talisman',
    buffs:[{type:'rate_pct',value:40,duration:1800}],         desc:'Dùng: +40% tốc tu 30 phút.' },
  { id:'iron_talisman',     name:'Thiết Giáp Phù',         emoji:'🛡', rarity:'cực hiếm',    type:'timed', action:'talisman',
    buffs:[{type:'def_pct',value:30,duration:1800},{type:'dmg_reduce',value:20,duration:1800}], desc:'Dùng: +30% DEF -20% sát thương 30 phút.' },
  { id:'war_talisman',      name:'Chiến Thần Phù',         emoji:'⚔', rarity:'cực hiếm',    type:'timed', action:'talisman',
    buffs:[{type:'atk_pct',value:40,duration:1800}],          desc:'Dùng: +40% ATK 30 phút.' },
  { id:'heal_talisman',     name:'Đại Hồi Thương Phù',    emoji:'💚', rarity:'cực hiếm',    type:'timed', action:'talisman',
    buffs:[{type:'hp_instant',value:800},{type:'hp_regen',value:20,duration:1800}], desc:'Dùng: +800 HP + 20 HP/s 30 phút.' },
  { id:'wealth_talisman',   name:'Hồng Phúc Phù',         emoji:'🏅', rarity:'cực hiếm',    type:'timed', action:'talisman',
    buffs:[{type:'stone_pct',value:40,duration:1800},{type:'exp_pct',value:25,duration:1800}], desc:'Dùng: +40% stone +25% EXP 30 phút.' },
  // Tier 3
  { id:'thunder_talisman',  name:'Lôi Đình Phù',          emoji:'🌩', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'atk_pct',value:65,duration:3600}],          desc:'Dùng: +65% ATK 1 giờ.' },
  { id:'mountain_talisman', name:'Thái Sơn Hộ Phù',       emoji:'⛰', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'dmg_reduce',value:50,duration:3600},{type:'def_pct',value:40,duration:3600}], desc:'Dùng: -50% sát thương +40% DEF 1 giờ.' },
  { id:'insight_talisman',  name:'Khai Tuệ Phù',          emoji:'🧠', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'rate_pct',value:60,duration:3600},{type:'exp_pct',value:40,duration:3600}], desc:'Dùng: +60% tốc tu +40% EXP 1 giờ.' },
  { id:'phoenix_talisman',  name:'Phượng Tái Sinh Phù',   emoji:'🦅', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'hp_instant',value:99999},{type:'hp_regen',value:60,duration:3600}], desc:'Dùng: Hồi full HP + 60 HP/s 1 giờ.' },
  { id:'triple_talisman',   name:'Tam Bảo Phù',           emoji:'🔱', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'atk_pct',value:45,duration:3600},{type:'def_pct',value:45,duration:3600},{type:'rate_pct',value:45,duration:3600}], desc:'Dùng: +45% ATK +45% DEF +45% tốc tu 1 giờ.' },
  // Tier 4
  { id:'void_talisman',     name:'Hư Không Phù',          emoji:'🌑', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'dmg_reduce',value:70,duration:7200}],       desc:'Dùng: -70% sát thương 2 giờ.' },
  { id:'dragon_talisman',   name:'Long Uy Phù',            emoji:'🐉', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'atk_pct',value:90,duration:7200}],          desc:'Dùng: +90% ATK 2 giờ.' },
  { id:'heaven_talisman',   name:'Thiên Địa Phù',          emoji:'🌌', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'rate_pct',value:80,duration:7200},{type:'exp_pct',value:60,duration:7200}], desc:'Dùng: +80% tốc tu +60% EXP 2 giờ.' },
  { id:'wealth_ocean_talisman',name:'Tài Lộc Đại Hải Phù',emoji:'💎', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'stone_pct',value:80,duration:7200},{type:'exp_pct',value:60,duration:7200}], desc:'Dùng: +80% stone +60% EXP 2 giờ.' },
  { id:'giant_talisman',    name:'Cự Linh Hộ Thân Phù',  emoji:'🏔', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'hp_max_pct',value:50,duration:7200},{type:'def_pct',value:80,duration:7200},{type:'hp_regen',value:40,duration:7200}], desc:'Dùng: +50% HP max +80% DEF +40 HP/s 2 giờ.' },
  // Tier 5
  { id:'chaos_talisman',    name:'Hỗn Độn Phù',           emoji:'💫', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'atk_pct',value:130,duration:18000},{type:'dmg_reduce',value:60,duration:18000}], desc:'Dùng: +130% ATK -60% sát thương 5 giờ.' },
  { id:'immortal_talisman', name:'Trường Sinh Tiên Phù',  emoji:'⭐', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'rate_pct',value:100,duration:18000},{type:'exp_pct',value:80,duration:18000}], desc:'Dùng: +100% tốc tu +80% EXP 5 giờ.' },
  { id:'supreme_talisman',  name:'Vô Thượng Tiên Phù',   emoji:'🌟', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'atk_pct',value:120,duration:18000},{type:'def_pct',value:120,duration:18000},{type:'rate_pct',value:100,duration:18000}], desc:'Dùng: +120% ATK +120% DEF +100% tốc tu 5 giờ.' },
  { id:'fortune_talisman',  name:'Hồng Vận Vô Lượng Phù',emoji:'🍀', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'stone_pct',value:120,duration:18000},{type:'exp_pct',value:100,duration:18000}], desc:'Dùng: +120% stone +100% EXP 5 giờ.' },
  { id:'god_talisman',      name:'Thiên Đế Hộ Thân Phù', emoji:'👑', rarity:'huyền thoại', type:'timed', action:'talisman',
    buffs:[{type:'dmg_reduce',value:80,duration:18000},{type:'def_pct',value:80,duration:18000},{type:'hp_regen',value:60,duration:18000}], desc:'Dùng: -80% sát thương +80% DEF +60 HP/s 5 giờ.' },
];