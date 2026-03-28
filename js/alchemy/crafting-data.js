// ============================================================
// alchemy/crafting-data.js — Luyện Khí Sư: Khoáng Vật + Bễ Rèn + Công Thức
// Session 5 — rewrite đầy đủ
// ============================================================

// ---- Bễ Rèn config ----
export const FORGE_DURABILITY = {
  1: { max:8,  repairCost:80  },
  2: { max:15, repairCost:150 },
  3: { max:25, repairCost:280 },
  4: { max:40, repairCost:500 },
  5: { max:60, repairCost:900 },
};
export const FORGE_SUCCESS_BONUS = { 1:0, 2:0.05, 3:0.10, 4:0.18, 5:0.28 };

// ---- Khoáng Vật Linh (19 loại) ----
export const MINERALS = [
  // Tier 1 — cơ bản
  { id:'huyen_thiet',      name:'Huyền Thiết',        emoji:'🔩', rarity:'common',    tier:1, desc:'Kim loại linh cơ bản.',          gatherZone:'rung_ngoai_mon' },
  { id:'dong_linh',        name:'Đồng Linh',           emoji:'🟠', rarity:'common',    tier:1, desc:'Đồng linh thấm linh khí đất.',   gatherZone:'rung_ngoai_mon' },
  { id:'thach_tinh',       name:'Thạch Tinh',          emoji:'🪨', rarity:'common',    tier:1, desc:'Tinh thể đá cứng cơ bản.',       gatherZone:'rung_ngoai_mon' },
  // Tier 2
  { id:'hoa_tinh_thach',   name:'Hỏa Tinh Thạch',     emoji:'🔴', rarity:'uncommon',  tier:2, desc:'Tinh thể hỏa hệ.',               gatherZone:'hac_phong_lam'  },
  { id:'bang_tinh_the',    name:'Băng Tinh Thể',       emoji:'❄️', rarity:'uncommon',  tier:2, desc:'Tinh thể băng ngàn năm.',        gatherZone:'han_bang_thon'  },
  { id:'lam_ngoc',         name:'Lam Ngọc Khoáng',    emoji:'💎', rarity:'uncommon',  tier:2, desc:'Ngọc lam linh tụ khí thủy.',     gatherZone:'linh_duoc_coc'  },
  { id:'phi_sa',           name:'Phi Sa Khê',          emoji:'✨', rarity:'uncommon',  tier:2, desc:'Cát kim loại từ suối linh.',      gatherZone:'linh_duoc_coc'  },
  // Tier 3
  { id:'bach_kim_sa',      name:'Bạch Kim Sa',         emoji:'⚪', rarity:'rare',      tier:3, desc:'Cát kim trắng tinh phẩm trung.', gatherZone:'linh_duoc_coc'  },
  { id:'loi_tinh_thach',   name:'Lôi Tinh Thạch',     emoji:'⚡', rarity:'rare',      tier:3, desc:'Tinh thạch tích điện sét ngàn năm.', gatherZone:'thien_kiep_dia' },
  { id:'hoang_long_tho',   name:'Hoàng Long Thổ',     emoji:'🟡', rarity:'rare',      tier:3, desc:'Đất linh từ mạch rồng.',          gatherZone:'linh_duoc_coc'  },
  { id:'han_thiet',        name:'Hàn Thiết',           emoji:'🩵', rarity:'rare',      tier:3, desc:'Thiết linh băng hàn nghìn năm.',  gatherZone:'han_bang_thon'  },
  // Tier 4
  { id:'thien_van_thach',  name:'Thiên Vẫn Thạch',    emoji:'☄️', rarity:'epic',      tier:4, desc:'Đá trời, tinh hoa vũ trụ.',      gatherZone:'thien_kiep_dia' },
  { id:'long_cot_phien',   name:'Long Cốt Phiến',     emoji:'🦴', rarity:'epic',      tier:4, desc:'Xương rồng cổ đại, cực cứng.',   gatherZone:'thien_kiep_dia' },
  { id:'tam_hoa_ngoc',     name:'Tam Hoa Ngọc',       emoji:'🌸', rarity:'epic',      tier:4, desc:'Ngọc kết từ ba linh hoa.',        gatherZone:'linh_duoc_coc'  },
  // Tier 5
  { id:'suong_linh_can',   name:'Sương Linh Căn',     emoji:'🌫️', rarity:'legendary', tier:5, desc:'Chỉ xuất hiện lúc bình minh.',   gatherZone:'any', timeRestrict:'dawn' },
  { id:'nguyet_quang_tinh',name:'Nguyệt Quang Tinh',  emoji:'🌙', rarity:'legendary', tier:5, desc:'Chỉ xuất hiện đêm rằm.',          gatherZone:'any', timeRestrict:'full_moon' },
  { id:'tien_kim_tinh',    name:'Tiên Kim Tinh',       emoji:'⭐', rarity:'legendary', tier:5, desc:'Kim tinh thiên ngoại cực hiếm.', gatherZone:'thien_kiep_dia' },
  // Drop từ yêu thú
  { id:'demon_core_1',     name:'Ma Cốt Nhân (Hạ)',   emoji:'💠', rarity:'uncommon',  tier:2, desc:'Hạch tâm yêu thú hạ phẩm.',     gatherZone:'drop' },
  { id:'demon_core_2',     name:'Ma Cốt Nhân (Trung)',emoji:'🔷', rarity:'rare',      tier:3, desc:'Hạch tâm yêu thú trung phẩm.',  gatherZone:'drop' },
  { id:'dragon_scale',     name:'Long Lân Phiến',      emoji:'🐉', rarity:'epic',      tier:4, desc:'Vảy rồng, cứng như kim loại.',   gatherZone:'drop' },
];

// ---- Công Thức Rèn (30 công thức, tier 1-5) ----
export const CRAFTING_RECIPES = [
  // ── TIER 1 ── Phàm Phẩm | realm 0 | rank 0 | chance 80-90% | failEffect: nothing
  { id:'craft_iron_sword',       name:'Rèn Thiết Kiếm',          resultItem:'iron_sword',       category:'weapon',    tier:1,
    materials:[{id:'huyen_thiet',qty:3},{id:'thach_tinh',qty:2}],
    stoneCost:50, successChance:0.88, requireRealm:0, requireRank:0, failEffect:'nothing',
    desc:'Kiếm sắt đơn giản. ATK+12.' },
  { id:'craft_cloth_robe',       name:'May Bào Phục Linh',        resultItem:'cloth_robe',       category:'armor',     tier:1,
    materials:[{id:'dong_linh',qty:3},{id:'thach_tinh',qty:2}],
    stoneCost:35, successChance:0.90, requireRealm:0, requireRank:0, failEffect:'nothing',
    desc:'Bào phục linh nhẹ bền. DEF+8.' },
  { id:'craft_leather_belt',     name:'Rèn Đai Da Linh',          resultItem:'leather_belt',     category:'that_lung', tier:1,
    materials:[{id:'huyen_thiet',qty:2},{id:'dong_linh',qty:3}],
    stoneCost:30, successChance:0.90, requireRealm:0, requireRank:0, failEffect:'nothing',
    desc:'Đai da linh thú. HP+40.' },
  { id:'craft_speed_ring',       name:'Đúc Nhẫn Tốc Linh',       resultItem:'speed_ring',       category:'nhan_trai', tier:1,
    materials:[{id:'dong_linh',qty:4},{id:'lam_ngoc',qty:2}],
    stoneCost:60, successChance:0.82, requireRealm:0, requireRank:0, failEffect:'nothing',
    desc:'Nhẫn tốc độ. SPD+0.1, Rate+3%.' },
  { id:'craft_flying_sword',     name:'Rèn Phi Kiếm Linh',       resultItem:'flying_sword',     category:'phap_bao',  tier:1,
    materials:[{id:'huyen_thiet',qty:4},{id:'phi_sa',qty:3}],
    stoneCost:70, successChance:0.80, requireRealm:0, requireRank:0, failEffect:'nothing',
    desc:'Phi kiếm tự vận. ATK%+8.' },
  { id:'craft_power_ring',       name:'Đúc Nhẫn Lực Thần',       resultItem:'power_ring',       category:'nhan_phai', tier:1,
    materials:[{id:'dong_linh',qty:3},{id:'hoa_tinh_thach',qty:2}],
    stoneCost:55, successChance:0.83, requireRealm:0, requireRank:0, failEffect:'nothing',
    desc:'Nhẫn lực ngưng tụ. ATK%+5, DEF%+3.' },

  // ── TIER 2 ── Linh Phẩm | realm 0 | rank 1 | chance 65-75% | failEffect: lose_half
  { id:'craft_thunder_blade',    name:'Rèn Lôi Linh Kiếm',       resultItem:'thunder_blade',    category:'weapon',    tier:2,
    materials:[{id:'huyen_thiet',qty:5},{id:'loi_tinh_thach',qty:3},{id:'demon_core_1',qty:1}],
    stoneCost:180, successChance:0.72, requireRealm:0, requireRank:1, failEffect:'lose_half',
    desc:'Kiếm lôi hệ. ATK+40, ATK%+5.' },
  { id:'craft_ice_spear',        name:'Rèn Băng Hà Thương',      resultItem:'ice_spear',        category:'weapon',    tier:2,
    materials:[{id:'han_thiet',qty:4},{id:'bang_tinh_the',qty:4},{id:'demon_core_1',qty:1}],
    stoneCost:200, successChance:0.68, requireRealm:0, requireRank:1, failEffect:'lose_half',
    desc:'Thương băng hệ. ATK+60, ATK%+8.' },
  { id:'craft_spirit_armor',     name:'Rèn Linh Giáp Đồng',      resultItem:'spirit_armor',     category:'armor',     tier:2,
    materials:[{id:'dong_linh',qty:6},{id:'hoang_long_tho',qty:3},{id:'demon_core_1',qty:1}],
    stoneCost:160, successChance:0.73, requireRealm:0, requireRank:1, failEffect:'lose_half',
    desc:'Giáp linh phẩm. DEF+30, HP+80.' },
  { id:'craft_spirit_badge',     name:'Đúc Hộ Thân Linh Bài',   resultItem:'spirit_badge',     category:'phap_bao',  tier:2,
    materials:[{id:'bach_kim_sa',qty:3},{id:'lam_ngoc',qty:4},{id:'hoang_long_tho',qty:2}],
    stoneCost:220, successChance:0.67, requireRealm:0, requireRank:1, failEffect:'lose_half',
    desc:'Linh bài hộ thân. DEF%+10, HP+150.' },
  { id:'craft_storage_belt',     name:'Rèn Đai Túi Càn Khôn',   resultItem:'storage_belt',     category:'that_lung', tier:2,
    materials:[{id:'bach_kim_sa',qty:3},{id:'phi_sa',qty:4},{id:'dong_linh',qty:5}],
    stoneCost:190, successChance:0.70, requireRealm:0, requireRank:1, failEffect:'lose_half',
    desc:'Đai không gian. HP+80, Stone+0.5%.' },
  { id:'craft_luck_charm',       name:'Đúc Duyên Khởi Linh Bài',resultItem:'luck_charm',       category:'phap_bao',  tier:2,
    materials:[{id:'lam_ngoc',qty:5},{id:'phi_sa',qty:3},{id:'hoang_long_tho',qty:2}],
    stoneCost:170, successChance:0.71, requireRealm:0, requireRank:1, failEffect:'lose_half',
    desc:'Linh bài cơ duyên. Rate%+5.' },

  // ── TIER 3 ── Cao Phẩm | realm 1 | rank 2 | chance 50-62% | failEffect: lose_all
  { id:'craft_demon_saber',      name:'Rèn Hắc Yêu Đao',         resultItem:'demon_saber',      category:'weapon',    tier:3,
    materials:[{id:'thien_van_thach',qty:2},{id:'demon_core_2',qty:2},{id:'loi_tinh_thach',qty:3}],
    stoneCost:500, successChance:0.58, requireRealm:1, requireRank:2, failEffect:'lose_all',
    desc:'Đao yêu tướng. ATK+120, ATK%+12.' },
  { id:'craft_iron_hauberk',     name:'Rèn Thiết Linh Khải Giáp',resultItem:'iron_hauberk',     category:'armor',     tier:3,
    materials:[{id:'huyen_thiet',qty:8},{id:'long_cot_phien',qty:2},{id:'hoang_long_tho',qty:4}],
    stoneCost:450, successChance:0.60, requireRealm:1, requireRank:2, failEffect:'lose_all',
    desc:'Giáp thiết linh. DEF+80, HP+200.' },
  { id:'craft_void_ring',        name:'Đúc Nhẫn Hư Không',       resultItem:'void_ring',        category:'nhan_trai', tier:3,
    materials:[{id:'tam_hoa_ngoc',qty:3},{id:'suong_linh_can',qty:1},{id:'bach_kim_sa',qty:4}],
    stoneCost:600, successChance:0.52, requireRealm:1, requireRank:2, failEffect:'lose_all', requireSpiritElement:'shui',
    desc:'Nhẫn hư không. Rate%+15, SPD+0.3. Thủy linh +10%.' },
  { id:'craft_fire_robe',        name:'Rèn Hỏa Vân Bào',         resultItem:'fire_robe',        category:'armor',     tier:3,
    materials:[{id:'hoa_tinh_thach',qty:6},{id:'demon_core_2',qty:2},{id:'phi_sa',qty:5}],
    stoneCost:420, successChance:0.61, requireRealm:1, requireRank:2, failEffect:'lose_all',
    desc:'Bào hỏa hệ. DEF%+12, kháng hỏa.' },
  { id:'craft_ice_armor',        name:'Rèn Băng Thể Linh Giáp',  resultItem:'ice_armor',        category:'armor',     tier:3,
    materials:[{id:'bang_tinh_the',qty:6},{id:'han_thiet',qty:5},{id:'demon_core_1',qty:3}],
    stoneCost:400, successChance:0.62, requireRealm:1, requireRank:2, failEffect:'lose_all',
    desc:'Giáp băng hệ. DEF+60, HP+250.' },
  { id:'craft_power_necklace',   name:'Rèn Cường Lực Ngọc Bội',  resultItem:'power_necklace',   category:'accessory', tier:3,
    materials:[{id:'tam_hoa_ngoc',qty:2},{id:'long_cot_phien',qty:1},{id:'bach_kim_sa',qty:3}],
    stoneCost:520, successChance:0.55, requireRealm:1, requireRank:2, failEffect:'lose_all',
    desc:'Ngọc bội. ATK%+10, DEF%+8.' },

  // ── TIER 4 ── Thượng Phẩm | realm 2 | rank 3 | chance 38-48% | forgeDamage 2-3
  { id:'craft_jade_sword',       name:'Rèn Bích Ngọc Kiếm',      resultItem:'jade_sword',       category:'weapon',    tier:4,
    materials:[{id:'thien_van_thach',qty:3},{id:'long_cot_phien',qty:2},{id:'tam_hoa_ngoc',qty:2},{id:'demon_core_2',qty:3}],
    stoneCost:1200, successChance:0.45, requireRealm:2, requireRank:3, failEffect:'lose_all', forgeDamage:2,
    desc:'Kiếm bích ngọc. ATK+350, ATK%+20.' },
  { id:'craft_linh_kiep_sword',  name:'Rèn Linh Kiếp Kiếm',      resultItem:'linh_kiep_sword',  category:'weapon',    tier:4,
    materials:[{id:'thien_van_thach',qty:3},{id:'loi_tinh_thach',qty:4},{id:'long_cot_phien',qty:2},{id:'dragon_scale',qty:1}],
    stoneCost:1500, successChance:0.40, requireRealm:2, requireRank:3, failEffect:'lose_all', forgeDamage:2, requireSpiritElement:'kim',
    desc:'Pháp kiếm lôi-kim. ATK+420, ATK%+25. Kim linh +15%.' },
  { id:'craft_dragon_armor',     name:'Rèn Long Vảy Khải Giáp',  resultItem:'dragon_armor',     category:'armor',     tier:4,
    materials:[{id:'dragon_scale',qty:3},{id:'long_cot_phien',qty:3},{id:'thien_van_thach',qty:2}],
    stoneCost:1400, successChance:0.42, requireRealm:2, requireRank:3, failEffect:'lose_all', forgeDamage:2,
    desc:'Giáp long vảy. DEF+200, DEF%+18, HP+400.' },
  { id:'craft_heaven_ring',      name:'Đúc Thiên Đạo Linh Nhẫn', resultItem:'heaven_ring',      category:'nhan_phai', tier:4,
    materials:[{id:'tien_kim_tinh',qty:1},{id:'tam_hoa_ngoc',qty:3},{id:'nguyet_quang_tinh',qty:1}],
    stoneCost:1800, successChance:0.38, requireRealm:2, requireRank:3, failEffect:'lose_all', forgeDamage:3,
    desc:'Nhẫn thiên đạo. Rate%+20, ATK%+12, DEF%+12.' },
  { id:'craft_chaos_badge',      name:'Đúc Hỗn Nguyên Linh Bài', resultItem:'chaos_badge',      category:'phap_bao',  tier:4,
    materials:[{id:'suong_linh_can',qty:2},{id:'tien_kim_tinh',qty:1},{id:'dragon_scale',qty:2}],
    stoneCost:1600, successChance:0.40, requireRealm:2, requireRank:3, failEffect:'lose_all', forgeDamage:2,
    desc:'Linh bài hỗn nguyên. HP+500, Rate%+10.' },
  { id:'craft_storm_spear',      name:'Rèn Lôi Thần Thương',     resultItem:'storm_spear',      category:'weapon',    tier:4,
    materials:[{id:'loi_tinh_thach',qty:5},{id:'thien_van_thach',qty:2},{id:'long_cot_phien',qty:2},{id:'demon_core_2',qty:3}],
    stoneCost:1300, successChance:0.44, requireRealm:2, requireRank:3, failEffect:'lose_all', forgeDamage:2,
    desc:'Thương lôi thần. ATK+380, ATK%+22.' },

  // ── TIER 5 ── Tiên Phẩm | realm 3 | rank 4-5 | chance 22-30% | forgeDamage 4-6
  { id:'craft_celestial_sword',  name:'Rèn Thiên Kiếm Linh Nguyên', resultItem:'celestial_sword', category:'weapon',  tier:5,
    materials:[{id:'tien_kim_tinh',qty:2},{id:'dragon_scale',qty:3},{id:'suong_linh_can',qty:2},{id:'nguyet_quang_tinh',qty:1}],
    stoneCost:5000, successChance:0.30, requireRealm:3, requireRank:4, failEffect:'lose_all', forgeDamage:4,
    desc:'Kiếm tiên phẩm. ATK+800, ATK%+40.' },
  { id:'craft_immortal_robe',    name:'Rèn Tiên Y Ngũ Sắc',      resultItem:'immortal_robe',    category:'armor',     tier:5,
    materials:[{id:'suong_linh_can',qty:3},{id:'tam_hoa_ngoc',qty:4},{id:'tien_kim_tinh',qty:2}],
    stoneCost:4500, successChance:0.28, requireRealm:3, requireRank:4, failEffect:'lose_all', forgeDamage:4,
    desc:'Áo tiên ngũ sắc. DEF%+35, HP+1000, Rate%+15.' },
  { id:'craft_void_crown',       name:'Đúc Hư Không Vương Miện', resultItem:'void_crown',       category:'hat',       tier:5,
    materials:[{id:'nguyet_quang_tinh',qty:2},{id:'tien_kim_tinh',qty:2},{id:'long_cot_phien',qty:4}],
    stoneCost:6000, successChance:0.25, requireRealm:3, requireRank:4, failEffect:'lose_all', forgeDamage:5,
    desc:'Vương miện hư không. ATK%+20, DEF%+20, Rate%+20.' },
  { id:'craft_dragon_sovereign', name:'Rèn Long Hoàng Thiên Giáp',resultItem:'dragon_sovereign', category:'armor',    tier:5,
    materials:[{id:'dragon_scale',qty:5},{id:'long_cot_phien',qty:5},{id:'tien_kim_tinh',qty:3},{id:'suong_linh_can',qty:2}],
    stoneCost:8000, successChance:0.22, requireRealm:3, requireRank:5, failEffect:'lose_all', forgeDamage:6,
    desc:'Thánh giáp long hoàng. DEF+500, DEF%+45, HP+2000.' },
  { id:'craft_chaos_ring',       name:'Đúc Hỗn Độn Linh Nhẫn',  resultItem:'chaos_ring',       category:'accessory', tier:5,
    materials:[{id:'tien_kim_tinh',qty:3},{id:'nguyet_quang_tinh',qty:2},{id:'suong_linh_can',qty:2},{id:'dragon_scale',qty:2}],
    stoneCost:7000, successChance:0.25, requireRealm:3, requireRank:5, failEffect:'lose_all', forgeDamage:5,
    desc:'Nhẫn hỗn độn. ATK%+30, DEF%+30, Rate%+25.' },
];

// ---- Trang Bị Chỉ Rèn Được (không drop) ----
// Thêm vào equipment-data.js EQUIPMENT array
export const CRAFTABLE_EQUIPMENT = [
  // Tier 3
  { id:'iron_hauberk',      name:'Thiết Linh Khải Giáp', emoji:'🛡', slot:'armor',     rarity:'rare',      minRealm:1,
    statsBase:{def:80,hp:200}, statsPerRarity:{def:50,hp:120},
    craftOnly:true, lore:'Khải giáp thiết linh, rèn từ huyền thiết và xương rồng.' },
  { id:'fire_robe',         name:'Hỏa Vân Bào',          emoji:'🔴', slot:'armor',     rarity:'rare',      minRealm:1,
    statsBase:{defPct:12}, statsPerRarity:{defPct:8},
    craftOnly:true, lore:'Bào hỏa vân, kháng hỏa cực tốt.' },
  { id:'ice_armor',         name:'Băng Thể Linh Giáp',   emoji:'❄️', slot:'armor',     rarity:'rare',      minRealm:1,
    statsBase:{def:60,hp:250,defPct:8}, statsPerRarity:{def:40,hp:150,defPct:5},
    craftOnly:true, lore:'Giáp băng hệ, rèn từ hàn thiết ngàn năm.' },
  { id:'power_necklace',    name:'Cường Lực Ngọc Bội',   emoji:'📿', slot:'accessory', rarity:'rare',      minRealm:1,
    statsBase:{atkPct:10,defPct:8}, statsPerRarity:{atkPct:7,defPct:5},
    craftOnly:true, lore:'Ngọc bội ngưng tụ lực lượng song nguyên.' },
  // Tier 4
  { id:'dragon_armor',      name:'Long Vảy Khải Giáp',   emoji:'🐲', slot:'armor',     rarity:'epic',      minRealm:2,
    statsBase:{def:200,defPct:18,hp:400}, statsPerRarity:{def:100,defPct:10,hp:200},
    craftOnly:true, lore:'Giáp long vảy tối thượng, cứng vô song.' },
  { id:'heaven_ring',       name:'Thiên Đạo Linh Nhẫn',  emoji:'🌀', slot:'nhan_phai', rarity:'epic',      minRealm:2,
    statsBase:{ratePct:20,atkPct:12,defPct:12}, statsPerRarity:{ratePct:12,atkPct:8,defPct:8},
    craftOnly:true, lore:'Nhẫn thiên đạo, dung hòa tam nguyên.' },
  { id:'chaos_badge',       name:'Hỗn Nguyên Linh Bài',  emoji:'🔮', slot:'phap_bao',  rarity:'epic',      minRealm:2,
    statsBase:{hp:500,ratePct:10,atkPct:8}, statsPerRarity:{hp:300,ratePct:7,atkPct:5},
    craftOnly:true, lore:'Linh bài hỗn nguyên, tụ tam linh chi lực.' },
  { id:'storm_spear',       name:'Lôi Thần Thương',       emoji:'⚡', slot:'weapon',    rarity:'epic',      minRealm:2,
    statsBase:{atk:380,atkPct:22}, statsPerRarity:{atk:200,atkPct:15},
    craftOnly:true, lore:'Thương lôi thần, chém một nhát sét trời chấn động.' },
  // Tier 5
  { id:'celestial_sword',   name:'Thiên Kiếm Linh Nguyên',emoji:'🗡', slot:'weapon',    rarity:'legendary', minRealm:3,
    statsBase:{atk:800,atkPct:40}, statsPerRarity:{atk:400,atkPct:25},
    craftOnly:true, lore:'Kiếm tiên phẩm đỉnh nhân giới, ngay cả thần cũng kiêng dè.' },
  { id:'immortal_robe',     name:'Tiên Y Ngũ Sắc',        emoji:'👘', slot:'armor',     rarity:'legendary', minRealm:3,
    statsBase:{defPct:35,hp:1000,ratePct:15}, statsPerRarity:{defPct:20,hp:600,ratePct:10},
    craftOnly:true, lore:'Áo tiên ngũ sắc, mỗi màu là một cảnh giới.' },
  { id:'void_crown',        name:'Hư Không Vương Miện',   emoji:'👑', slot:'hat',       rarity:'legendary', minRealm:3,
    statsBase:{atkPct:20,defPct:20,ratePct:20}, statsPerRarity:{atkPct:15,defPct:15,ratePct:15},
    craftOnly:true, lore:'Vương miện hư không, ai đội lên trời đất nghiêng mình.' },
  { id:'dragon_sovereign',  name:'Long Hoàng Thiên Giáp',  emoji:'🏯', slot:'armor',     rarity:'legendary', minRealm:3,
    statsBase:{def:500,defPct:45,hp:2000}, statsPerRarity:{def:300,defPct:28,hp:1200},
    craftOnly:true, lore:'Thánh giáp rồng hoàng, cực phẩm thiên hạ vô địch.' },
  { id:'chaos_ring',        name:'Hỗn Độn Linh Nhẫn',     emoji:'💫', slot:'nhan_trai', rarity:'legendary', minRealm:3,
    statsBase:{atkPct:30,defPct:30,ratePct:25}, statsPerRarity:{atkPct:20,defPct:20,ratePct:18},
    craftOnly:true, lore:'Nhẫn hỗn độn vô cực, mang trong mình nguồn gốc vũ trụ.' },
];

// ---- Cấp Bậc Luyện Khí Sư ----
export const CRAFTSMAN_RANKS = [
  { rank:0, name:'Nhập Môn',  emoji:'🔨', minCrafts:0,   bonus:0,  desc:'Mới nhập môn. Rèn được Phàm Phẩm.' },
  { rank:1, name:'Học Đồ Luyện Khí',  emoji:'⚒',  minCrafts:5,   bonus:5,  desc:'+5% tỷ lệ. Mở công thức Linh Phẩm.' },
  { rank:2, name:'Thợ Rèn Sơ Cấp',   emoji:'🔧', minCrafts:20,  bonus:12, desc:'+12% tỷ lệ. Mở công thức Cao Phẩm.' },
  { rank:3, name:'Thợ Rèn Trung Cấp', emoji:'⚙',  minCrafts:50,  bonus:22, desc:'+22% tỷ lệ. Mở công thức Thượng Phẩm.' },
  { rank:4, name:'Đại Sư Rèn Bảo',   emoji:'🏆', minCrafts:100, bonus:35, desc:'+35% tỷ lệ. Mở công thức Tiên Phẩm.' },
  { rank:5, name:'Luyện Bảo Thánh',   emoji:'👑', minCrafts:200, bonus:50, desc:'+50% tỷ lệ. Rèn được tuyệt phẩm.' },
];

export function getCraftsmanRank(craftsCount) {
  for (let i = CRAFTSMAN_RANKS.length - 1; i >= 0; i--) {
    if (craftsCount >= CRAFTSMAN_RANKS[i].minCrafts) return CRAFTSMAN_RANKS[i];
  }
  return CRAFTSMAN_RANKS[0];
}

export function getNextCraftsmanRank(craftsCount) {
  for (let i = 0; i < CRAFTSMAN_RANKS.length; i++) {
    if (craftsCount < CRAFTSMAN_RANKS[i].minCrafts) return CRAFTSMAN_RANKS[i];
  }
  return null;
}