// ============================================================
// alchemy/linh-thuc-data.js — Linh Thực Sư
// Nghề phụ: nấu linh thực từ thảo dược + linh vật, tăng buff tuổi thọ/HP/chiến đấu
// Session 5
// ============================================================

// ---- Bếp Linh Thực (5 cấp) ----
export const KITCHEN_DURABILITY = {
  1: { max:10, repairCost:60  },  // Bếp Đất
  2: { max:18, repairCost:120 },  // Bếp Đồng
  3: { max:30, repairCost:220 },  // Bếp Ngân
  4: { max:45, repairCost:400 },  // Bếp Ngọc
  5: { max:70, repairCost:750 },  // Bếp Tiên Hỏa
};
export const KITCHEN_SUCCESS_BONUS = { 1:0, 2:0.05, 3:0.10, 4:0.18, 5:0.28 };

// ---- Nguyên Liệu Nấu Ăn (25 loại) ----
// Một số dùng chung với alchemy INGREDIENTS, một số mới
export const FOOD_INGREDIENTS = [
  // == Rau & Thảo (tier 1-2) — gather từ rừng/thung lũng ==
  { id:'linh_thao',       name:'Linh Thảo Tươi',      emoji:'🌿', rarity:'common',    tier:1, desc:'Thảo dược linh cơ bản, vị ngọt, bổ khí.',         zone:'spirit_forest' },
  { id:'van_linh_co',     name:'Vân Linh Cô',          emoji:'🍄', rarity:'common',    tier:1, desc:'Nấm mây trắng, thanh bổ, tốt cho tuổi thọ.',      zone:'cloud_valley'  },
  { id:'bach_ngoc_lien',  name:'Bạch Ngọc Liên',       emoji:'🪷', rarity:'uncommon',  tier:2, desc:'Hoa sen ngọc, cải thiện linh lực nội tại.',        zone:'spirit_forest' },
  { id:'nguyet_lo_thao',  name:'Nguyệt Lộ Thảo',       emoji:'🌙', rarity:'uncommon',  tier:2, desc:'Thảo dược chỉ ra ban đêm, thu thập linh khí nguyệt.', zone:'cloud_valley' },
  { id:'tuyet_linh_nhung',name:'Tuyết Linh Nhung',     emoji:'🤍', rarity:'uncommon',  tier:2, desc:'Nấm tuyết núi cao, bổ dưỡng, kháng băng.',         zone:'ice_mountain'  },
  { id:'hoa_linh_thao',   name:'Hỏa Linh Thảo',        emoji:'🌺', rarity:'uncommon',  tier:2, desc:'Xích linh thảo chứa hỏa khí, kích thích ATK.',     zone:'demon_wilds'   },
  { id:'cam_lo_linh',     name:'Cam Lộ Linh',           emoji:'🍯', rarity:'rare',      tier:3, desc:'Mật ngọt tiên thiên, cực phẩm hồi phục.',          zone:'spirit_forest' },

  // == Thịt & Vật liệu động vật (tier 1-3) — drop từ yêu thú ==
  { id:'linh_thu_nhuc',   name:'Linh Thú Nhục',        emoji:'🥩', rarity:'common',    tier:1, desc:'Thịt linh thú thường, ngon béo bổ dưỡng.',         zone:'drop' },
  { id:'linh_thu_xuong',  name:'Linh Thú Cốt',         emoji:'🦴', rarity:'common',    tier:1, desc:'Xương linh thú ninh canh, ngọt đậm đà.',           zone:'drop' },
  { id:'xa_ngạnh_linh',   name:'Xà Ngạnh Linh',        emoji:'🐍', rarity:'uncommon',  tier:2, desc:'Vảy xà linh khí băng hệ, bổ thận.',               zone:'drop' },
  { id:'ung_vu_linh',     name:'Ưng Vũ Linh',          emoji:'🪶', rarity:'uncommon',  tier:2, desc:'Lông ưng linh, chứa lôi khí, tăng tốc độ.',        zone:'drop' },
  { id:'phuong_vu',       name:'Phượng Vũ',             emoji:'🦅', rarity:'rare',      tier:3, desc:'Lông phượng hoàng, hỏa khí thuần túy, đại bổ.',    zone:'drop' },
  { id:'long_can',        name:'Long Can',               emoji:'🐲', rarity:'epic',      tier:4, desc:'Mật rồng tinh, cực kỳ quý, đại bổ tuổi thọ.',     zone:'drop' },

  // == Gia vị & Tinh tủy (tier 2-4) ==
  { id:'ngũ_hanh_yen',   name:'Ngũ Hành Yên',          emoji:'🧂', rarity:'uncommon',  tier:2, desc:'Muối linh ngũ hành, gia vị cơ bản linh thực.',     zone:'demon_wilds'   },
  { id:'linh_tuong',     name:'Linh Tương',              emoji:'🫙', rarity:'uncommon',  tier:2, desc:'Tương linh thảo lên men, tăng cường hương vị.',    zone:'spirit_forest' },
  { id:'huyet_sam',      name:'Huyết Sâm',               emoji:'🌱', rarity:'rare',      tier:3, desc:'Sâm huyết đỏ ngàn năm, đại bổ sinh lực.',          zone:'ice_mountain'  },
  { id:'linh_tuỷ',       name:'Linh Tủy',                emoji:'💧', rarity:'rare',      tier:3, desc:'Tủy linh thú cao cấp, tinh hoa nhục thân.',        zone:'drop'          },
  { id:'thien_duoc',     name:'Thiên Dược Thảo',        emoji:'🍀', rarity:'epic',      tier:4, desc:'Thảo dược hiếm từ thiên địa giao hội.',             zone:'thunder_peak'  },
  { id:'bat_bao_tieu',   name:'Bát Bảo Tiêu',           emoji:'✨', rarity:'epic',      tier:4, desc:'Tám loại linh liệu pha trộn, cực phẩm gia vị.',    zone:'fire_plains'   },

  // == Tinh hoa thiên địa (tier 4-5) ==
  { id:'tien_can',       name:'Tiên Căn Tinh Hoa',      emoji:'☘️', rarity:'epic',      tier:4, desc:'Tinh hoa tiên căn, dùng nấu linh thực thượng phẩm.', zone:'dragon_nest'  },
  { id:'hon_don_tinh',   name:'Hỗn Độn Tinh',           emoji:'🔮', rarity:'legendary', tier:5, desc:'Tinh nguyên hỗn độn, tụ tam nguyên chi lực.',      zone:'drop'          },
  { id:'nhat_quang_lo',  name:'Nhật Quang Lộ',          emoji:'☀️', rarity:'legendary', tier:5, desc:'Chỉ thu được lúc bình minh, tụ dương khí cực phẩm.', zone:'spirit_forest', timeRestrict:'dawn' },
  { id:'bac_dao_bang',   name:'Bắc Đẩu Băng',           emoji:'❄️', rarity:'legendary', tier:5, desc:'Băng từ cực bắc vũ trụ, nguồn gốc lạnh vĩnh hằng.', zone:'ice_mountain'  },

  // == Dùng chung với alchemy (alias) — không khai báo lại, tham chiếu sang ==
  // spirit_herb → linh_thao (dùng id gốc từ INGREDIENTS)
  // jade_lotus   → bach_ngoc_lien
  // blood_ginseng → huyet_sam
];

// ---- Buff Effects của Linh Thực ----
// Áp dụng qua G.linhThucBuffs: [{type, value, timer, source}]
export const FOOD_BUFF_TYPES = {
  hp_instant:    { label:'Hồi HP tức thì',       color:'#e05c4a', apply:(G,v)=>{ G.hp = Math.min(G.maxHp||(G.hp||1), (G.hp||0)+v); } },
  hp_regen:      { label:'Hồi HP mỗi giây',       color:'#56c46a', timed:true },
  hp_max_pct:    { label:'Tăng HP tối đa %',      color:'#c8a84b', timed:true },
  atk_pct:       { label:'Tăng ATK %',             color:'#e07030', timed:true },
  def_pct:       { label:'Tăng DEF %',             color:'#3a9fd5', timed:true },
  rate_pct:      { label:'Tăng Tốc Tu Luyện %',   color:'#56c46a', timed:true },
  stamina_regen: { label:'Hồi thể lực',            color:'#a855f7', apply:(G,v)=>{ G.stamina = Math.min(G.maxStamina||100, (G.stamina||0)+v); } },
  lifespan:      { label:'Tăng Tuổi Thọ (năm)',   color:'#f0d47a', apply:(G,v,eng)=>eng?.addLifespanBonus(G,v,'Linh Thực') },
  stone_pct:     { label:'Tăng Linh Thạch %',     color:'#c8a84b', timed:true },
  exp_pct:       { label:'Tăng EXP %',             color:'#7b68ee', timed:true },
  atk_flat:      { label:'Tăng ATK thuần',         color:'#e07030', timed:true },
};

// ---- 35 Công Thức Linh Thực (tier 1-5) ----
// category: 'tra' | 'canh' | 'com' | 'banh' | 'tiec'
// buff: { type, value, duration(giây game-time) }
// duration: 60=1 phút game, 300=5 phút, 1800=30 phút, 3600=1 giờ
export const FOOD_RECIPES = [

  // ══════════════════════════════════════════
  // TIER 1 — Phàm Thực (realm 0, rank 0)
  // successChance 0.85-0.92 | buff nhỏ, ngắn
  // ══════════════════════════════════════════
  {
    id:'cook_linh_tra',       name:'Linh Thảo Trà',         emoji:'🍵', category:'tra',   tier:1,
    materials:[{id:'linh_thao',qty:3},{id:'van_linh_co',qty:1}],
    stoneCost:20, successChance:0.92, requireRealm:0, requireRank:0,
    buffs:[{type:'rate_pct', value:15, duration:1200}],
    desc:'Trà linh thảo đơn giản. +8% tốc tu luyện trong 5 phút game.',
    lore:'Mỗi tu sĩ nhập môn đều biết pha trà linh thảo.',
  },
  {
    id:'cook_van_co_soup',    name:'Vân Cô Thanh Canh',     emoji:'🥣', category:'canh',  tier:1,
    materials:[{id:'van_linh_co',qty:3},{id:'linh_thu_xuong',qty:2}],
    stoneCost:25, successChance:0.90, requireRealm:0, requireRank:0,
    buffs:[{type:'hp_instant', value:200}],
    desc:'Canh nấm mây trong, hồi phục 200 HP tức thì.',
    lore:'Canh ngọt từ nấm mây, vị thanh mát dịu nhẹ.',
  },
  {
    id:'cook_linh_thu_com',   name:'Linh Thú Nhục Cơm',     emoji:'🍚', category:'com',   tier:1,
    materials:[{id:'linh_thu_nhuc',qty:3},{id:'linh_thao',qty:2}],
    stoneCost:30, successChance:0.88, requireRealm:0, requireRank:0,
    buffs:[{type:'atk_flat', value:15, duration:1800}],
    desc:'Cơm thịt linh thú, ấm bụng. +15 ATK trong 10 phút game.',
    lore:'Bữa ăn chắc bụng của tu sĩ đang tu ở Luyện Khí kỳ.',
  },
  {
    id:'cook_canh_xuong',     name:'Canh Xương Linh Thú',   emoji:'🦴', category:'canh',  tier:1,
    materials:[{id:'linh_thu_xuong',qty:4},{id:'linh_thao',qty:2}],
    stoneCost:22, successChance:0.91, requireRealm:0, requireRank:0,
    buffs:[{type:'def_pct', value:5, duration:1800},{type:'hp_instant', value:100}],
    desc:'Canh xương ninh kỹ. +5% DEF 10 phút + hồi 100 HP.',
    lore:'Canh xương ninh lâu tiết ra tinh chất bổ thân.',
  },
  {
    id:'cook_stamina_tra',    name:'Trà Thể Lực Linh',      emoji:'🍃', category:'tra',   tier:1,
    materials:[{id:'linh_thao',qty:2},{id:'nguyet_lo_thao',qty:1}],
    stoneCost:18, successChance:0.92, requireRealm:0, requireRank:0,
    buffs:[{type:'stamina_regen', value:30}],
    desc:'Trà hồi thể lực. Khôi phục 30 thể lực tức thì.',
    lore:'Trà quen thuộc của thợ thu thập nguyên liệu.',
  },
  {
    id:'cook_banh_linh',      name:'Bánh Linh Thảo',        emoji:'🧁', category:'banh',  tier:1,
    materials:[{id:'linh_thao',qty:4},{id:'van_linh_co',qty:2}],
    stoneCost:28, successChance:0.88, requireRealm:0, requireRank:0,
    buffs:[{type:'rate_pct', value:12, duration:2700},{type:'hp_instant', value:80}],
    desc:'Bánh nhỏ linh thảo. +5% tốc tu 15 phút + 80 HP.',
    lore:'Bánh nhỏ nhắn, tiện mang theo khi tu luyện.',
  },

  // ══════════════════════════════════════════
  // TIER 2 — Linh Thực (realm 0+, rank 1)
  // successChance 0.72-0.82 | buff trung bình
  // ══════════════════════════════════════════
  {
    id:'cook_bach_lien_tra',  name:'Bạch Ngọc Liên Trà',   emoji:'🫖', category:'tra',   tier:2,
    materials:[{id:'bach_ngoc_lien',qty:2},{id:'cam_lo_linh',qty:1},{id:'linh_thao',qty:2}],
    stoneCost:80, successChance:0.80, requireRealm:0, requireRank:1,
    buffs:[{type:'rate_pct', value:18, duration:2700},{type:'hp_max_pct', value:5, duration:2700}],
    desc:'Trà bạch ngọc liên. +18% tốc tu + 5% HP tối đa trong 15 phút.',
    lore:'Hoa sen trắng ngâm trong cam lộ, hương thơm ngào ngạt.',
  },
  {
    id:'cook_tuyet_nham_canh',name:'Tuyết Nhung Linh Canh', emoji:'🍲', category:'canh',  tier:2,
    materials:[{id:'tuyet_linh_nhung',qty:3},{id:'linh_thu_xuong',qty:3},{id:'ngũ_hanh_yen',qty:1}],
    stoneCost:90, successChance:0.78, requireRealm:0, requireRank:1,
    buffs:[{type:'def_pct', value:12, duration:1200},{type:'hp_instant', value:350}],
    desc:'Canh tuyết nhung nóng hổi. +12% DEF 20 phút + 350 HP.',
    lore:'Canh nấm tuyết núi cao, ấm từ trong ra ngoài.',
  },
  {
    id:'cook_hoa_linh_xao',   name:'Hỏa Linh Thảo Xào',   emoji:'🥘', category:'com',   tier:2,
    materials:[{id:'hoa_linh_thao',qty:3},{id:'linh_thu_nhuc',qty:3},{id:'ngũ_hanh_yen',qty:1}],
    stoneCost:85, successChance:0.79, requireRealm:0, requireRank:1,
    buffs:[{type:'atk_pct', value:10, duration:1200}],
    desc:'Xào hỏa linh thảo cháy sém. +10% ATK trong 20 phút game.',
    lore:'Lửa hỏa linh thảo thiêu đốt nguyên liệu, bùng cháy sắc đỏ.',
  },
  {
    id:'cook_nguyet_lo_banh', name:'Nguyệt Lộ Linh Bánh',  emoji:'🥮', category:'banh',  tier:2,
    materials:[{id:'nguyet_lo_thao',qty:3},{id:'van_linh_co',qty:2},{id:'linh_thao',qty:2}],
    stoneCost:75, successChance:0.82, requireRealm:0, requireRank:1,
    buffs:[{type:'rate_pct', value:12, duration:1800},{type:'stamina_regen', value:20}],
    desc:'Bánh nguyệt lộ. +12% tốc tu luyện 30 phút + 20 thể lực.',
    lore:'Bánh thấm đẫm nguyệt lộ, ăn dưới trăng tuyệt vời.',
  },
  {
    id:'cook_xa_linh_lau',    name:'Xà Linh Lẩu',           emoji:'🍜', category:'tiec',  tier:2,
    materials:[{id:'xa_ngạnh_linh',qty:2},{id:'linh_thu_nhuc',qty:4},{id:'linh_tuong',qty:1}],
    stoneCost:100, successChance:0.75, requireRealm:0, requireRank:1,
    buffs:[{type:'def_pct', value:8, duration:1800},{type:'hp_regen', value:10, duration:1800}],
    desc:'Lẩu xà linh tinh. +8% DEF + hồi 10 HP/giây trong 30 phút.',
    lore:'Nước lẩu màu xanh lạnh, mùi tanh thanh mát của linh xà.',
  },
  {
    id:'cook_ung_chien_com',  name:'Ưng Linh Cơm Chiên',   emoji:'🍳', category:'com',   tier:2,
    materials:[{id:'ung_vu_linh',qty:2},{id:'linh_thu_nhuc',qty:3},{id:'ngũ_hanh_yen',qty:1}],
    stoneCost:95, successChance:0.77, requireRealm:0, requireRank:1,
    buffs:[{type:'atk_pct', value:8, duration:1800},{type:'rate_pct', value:5, duration:1800}],
    desc:'Cơm chiên vũ linh ưng. +8% ATK + 5% tốc tu trong 30 phút.',
    lore:'Cánh ưng áp chảo, vị ngọt đậm, kích thích tốc độ.',
  },

  // ══════════════════════════════════════════
  // TIER 3 — Cao Phẩm (realm 1+, rank 2)
  // successChance 0.58-0.68 | buff mạnh, dài
  // ══════════════════════════════════════════
  {
    id:'cook_huyet_sam_tra',  name:'Huyết Sâm Thiên Niên Trà',emoji:'🍶', category:'tra', tier:3,
    materials:[{id:'huyet_sam',qty:2},{id:'cam_lo_linh',qty:2},{id:'bach_ngoc_lien',qty:1}],
    stoneCost:300, successChance:0.65, requireRealm:1, requireRank:2,
    buffs:[{type:'hp_max_pct', value:15, duration:3600},{type:'rate_pct', value:20, duration:3600}],
    desc:'Trà huyết sâm thiên niên. +15% HP tối đa + 20% tốc tu trong 1 giờ game.',
    lore:'Huyết sâm ngàn năm ngâm trong cam lộ — hương vị thiên giới.',
  },
  {
    id:'cook_linh_tuỷ_canh',  name:'Linh Tủy Đại Bổ Canh',  emoji:'🫕', category:'canh',  tier:3,
    materials:[{id:'linh_tuỷ',qty:2},{id:'linh_thu_xuong',qty:4},{id:'huyet_sam',qty:1}],
    stoneCost:320, successChance:0.62, requireRealm:1, requireRank:2,
    buffs:[{type:'hp_instant', value:800},{type:'def_pct', value:18, duration:3600}],
    desc:'Canh đại bổ linh tủy. +800 HP tức thì + 18% DEF trong 1 giờ.',
    lore:'Linh tủy tan chảy trong canh xương, màu vàng óng sáng.',
  },
  {
    id:'cook_phuong_vu_chien',name:'Phượng Vũ Chiên Giòn',   emoji:'🍗', category:'com',   tier:3,
    materials:[{id:'phuong_vu',qty:2},{id:'bat_bao_tieu',qty:1},{id:'linh_thu_nhuc',qty:4}],
    stoneCost:380, successChance:0.60, requireRealm:1, requireRank:2,
    buffs:[{type:'atk_pct', value:22, duration:3600},{type:'atk_flat', value:50, duration:3600}],
    desc:'Thịt phượng chiên giòn. +22% ATK + 50 ATK thuần trong 1 giờ.',
    lore:'Lông phượng cháy bùng biến thịt thành màu vàng rực rỡ.',
  },
  {
    id:'cook_ngu_hanh_lau',   name:'Ngũ Hành Đại Lẩu',       emoji:'🍲', category:'tiec',  tier:3,
    materials:[{id:'ngũ_hanh_yen',qty:2},{id:'linh_tuong',qty:2},{id:'xa_ngạnh_linh',qty:2},{id:'linh_thu_nhuc',qty:5}],
    stoneCost:400, successChance:0.58, requireRealm:1, requireRank:2,
    buffs:[{type:'atk_pct', value:12, duration:3600},{type:'def_pct', value:12, duration:3600},{type:'rate_pct', value:12, duration:3600}],
    desc:'Lẩu ngũ hành tam bổ. +12% ATK + 12% DEF + 12% tốc tu trong 1 giờ.',
    lore:'Năm màu ngũ hành hoà quyện trong nồi lẩu linh thiêng.',
  },
  {
    id:'cook_thien_duoc_banh',name:'Thiên Dược Linh Bánh',   emoji:'🎂', category:'banh',  tier:3,
    materials:[{id:'thien_duoc',qty:2},{id:'cam_lo_linh',qty:2},{id:'van_linh_co',qty:3}],
    stoneCost:350, successChance:0.63, requireRealm:1, requireRank:2,
    buffs:[{type:'rate_pct', value:30, duration:3600},{type:'stamina_regen', value:50}],
    desc:'Bánh thiên dược. +30% tốc tu 1 giờ + 50 thể lực.',
    lore:'Thiên dược hiếm nhào với cam lộ, hương thơm bay xa trăm dặm.',
  },
  {
    id:'cook_linh_shou_tra',  name:'Trường Thọ Linh Trà',    emoji:'🫗', category:'tra',   tier:3,
    materials:[{id:'huyet_sam',qty:1},{id:'nguyet_lo_thao',qty:3},{id:'cam_lo_linh',qty:1}],
    stoneCost:500, successChance:0.60, requireRealm:1, requireRank:2,
    buffs:[{type:'lifespan', value:1}],
    desc:'Trà trường thọ. +1 năm tuổi thọ (không tạm thời).',
    lore:'Một chén trà đổi một năm thọ mệnh — kỳ diệu thiên địa.',
  },
  {
    id:'cook_stone_feast',    name:'Linh Thạch Tăng Ích Canh',emoji:'💎', category:'canh', tier:3,
    materials:[{id:'bat_bao_tieu',qty:1},{id:'linh_tuong',qty:2},{id:'linh_thu_nhuc',qty:3}],
    stoneCost:360, successChance:0.62, requireRealm:1, requireRank:2,
    buffs:[{type:'stone_pct', value:25, duration:3600}],
    desc:'Canh tăng ích. +25% thu linh thạch trong 1 giờ game.',
    lore:'Bí quyết của thương nhân tu sĩ — ăn canh này trước khi đi thu thạch.',
  },

  // ══════════════════════════════════════════
  // TIER 4 — Thượng Phẩm (realm 2+, rank 3)
  // successChance 0.42-0.52 | buff rất mạnh
  // ══════════════════════════════════════════
  {
    id:'cook_long_can_tra',   name:'Long Can Thiên Trà',      emoji:'🐲', category:'tra',   tier:4,
    materials:[{id:'long_can',qty:1},{id:'cam_lo_linh',qty:3},{id:'huyet_sam',qty:2}],
    stoneCost:1200, successChance:0.50, requireRealm:2, requireRank:3,
    buffs:[{type:'rate_pct', value:50, duration:7200},{type:'lifespan', value:3}],
    desc:'Trà long can thần phẩm. +50% tốc tu 2 giờ + 3 năm tuổi thọ.',
    lore:'Long can tan trong nước trà, vị đắng rồi ngọt, linh hồn như rung chuyển.',
  },
  {
    id:'cook_bat_bo_tiec',    name:'Bát Bảo Toàn Tịch',       emoji:'🎉', category:'tiec',  tier:4,
    materials:[{id:'bat_bao_tieu',qty:2},{id:'phuong_vu',qty:2},{id:'xa_ngạnh_linh',qty:2},{id:'linh_tuỷ',qty:2}],
    stoneCost:1400, successChance:0.46, requireRealm:2, requireRank:3,
    buffs:[{type:'atk_pct', value:30, duration:7200},{type:'def_pct', value:30, duration:7200},{type:'hp_max_pct', value:20, duration:7200}],
    desc:'Toàn tịch bát bảo. +30% ATK + 30% DEF + 20% HP tối đa trong 2 giờ.',
    lore:'Tám báu phẩm tụ thành một bàn tiệc — chỉ đại nhân mới xứng hưởng.',
  },
  {
    id:'cook_tien_can_com',   name:'Tiên Căn Thánh Cốc',      emoji:'🍱', category:'com',   tier:4,
    materials:[{id:'tien_can',qty:2},{id:'long_can',qty:1},{id:'thien_duoc',qty:2}],
    stoneCost:1500, successChance:0.44, requireRealm:2, requireRank:3,
    buffs:[{type:'rate_pct', value:60, duration:7200},{type:'hp_max_pct', value:25, duration:7200}],
    desc:'Cơm tiên căn thánh. +60% tốc tu + 25% HP tối đa trong 2 giờ.',
    lore:'Hạt gạo từ đất tiên, mỗi hạt tụ linh khí thiên địa.',
  },
  {
    id:'cook_shou_xing_banh', name:'Thọ Tinh Linh Bánh',      emoji:'🌟', category:'banh',  tier:4,
    materials:[{id:'tien_can',qty:1},{id:'huyet_sam',qty:3},{id:'cam_lo_linh',qty:3}],
    stoneCost:1800, successChance:0.42, requireRealm:2, requireRank:3,
    buffs:[{type:'lifespan', value:5}],
    desc:'Bánh thọ tinh. +5 năm tuổi thọ vĩnh viễn.',
    lore:'Tiên nhân chúc thọ tặng bánh này — một chiếc có thể kéo dài mệnh người.',
  },
  {
    id:'cook_long_fung_canh', name:'Long Phượng Đại Bổ Canh', emoji:'🥗', category:'canh',  tier:4,
    materials:[{id:'long_can',qty:1},{id:'phuong_vu',qty:2},{id:'linh_tuỷ',qty:3},{id:'bat_bao_tieu',qty:1}],
    stoneCost:1600, successChance:0.45, requireRealm:2, requireRank:3,
    buffs:[{type:'hp_instant', value:2000},{type:'hp_regen', value:50, duration:7200}],
    desc:'Canh long phượng đại bổ. +2000 HP tức thì + 50 HP/giây trong 2 giờ.',
    lore:'Long và Phượng hoà thành một nồi canh — uy lực thiên hạ vô song.',
  },
  {
    id:'cook_five_element',   name:'Ngũ Hành Linh Thực Tiệc', emoji:'🌈', category:'tiec',  tier:4,
    materials:[{id:'hoa_linh_thao',qty:3},{id:'tuyet_linh_nhung',qty:3},{id:'thien_duoc',qty:2},{id:'linh_tuỷ',qty:2}],
    stoneCost:1700, successChance:0.44, requireRealm:2, requireRank:3,
    buffs:[{type:'exp_pct', value:40, duration:7200},{type:'rate_pct', value:40, duration:7200},{type:'stone_pct', value:30, duration:7200}],
    desc:'Tiệc ngũ hành toàn hệ. +40% EXP + 40% tốc tu + 30% linh thạch trong 2 giờ.',
    lore:'Nấu đủ năm hành hội tụ — trời đất đều phải nhường mình.',
  },

  // ══════════════════════════════════════════
  // TIER 5 — Tiên Thực (realm 3+, rank 4-5)
  // successChance 0.25-0.35 | buff đỉnh cao
  // ══════════════════════════════════════════
  {
    id:'cook_tien_tra_jiu',   name:'Tiên Trà Cửu Bảo',        emoji:'🏆', category:'tra',   tier:5,
    materials:[{id:'hon_don_tinh',qty:1},{id:'long_can',qty:2},{id:'cam_lo_linh',qty:4},{id:'tien_can',qty:2}],
    stoneCost:5000, successChance:0.32, requireRealm:3, requireRank:4,
    buffs:[{type:'rate_pct', value:100, duration:18000},{type:'lifespan', value:8}],
    desc:'Tiên trà cửu bảo. +100% tốc tu trong 5 giờ game + 8 năm tuổi thọ.',
    lore:'Chín loại linh bảo ngâm thành trà — chỉ tiên nhân mới có thể thưởng thức.',
  },
  {
    id:'cook_shen_xian_tiec', name:'Thần Tiên Đại Tiệc',       emoji:'👑', category:'tiec',  tier:5,
    materials:[{id:'hon_don_tinh',qty:1},{id:'long_can',qty:2},{id:'phuong_vu',qty:3},{id:'bat_bao_tieu',qty:3},{id:'tien_can',qty:3}],
    stoneCost:8000, successChance:0.25, requireRealm:3, requireRank:5,
    buffs:[
      {type:'atk_pct', value:60, duration:18000},
      {type:'def_pct', value:60, duration:18000},
      {type:'rate_pct', value:80, duration:18000},
      {type:'hp_max_pct', value:40, duration:18000},
    ],
    desc:'Thần tiên đại tiệc. +60% ATK + 60% DEF + 80% tốc tu + 40% HP trong 5 giờ.',
    lore:'Bàn tiệc đầy đủ khiến trời đất biến sắc — tu sĩ ăn xong như lên tiên.',
  },
  {
    id:'cook_wan_shou_banh',  name:'Vạn Thọ Tiên Bánh',        emoji:'🎂', category:'banh',  tier:5,
    materials:[{id:'nhat_quang_lo',qty:2},{id:'bac_dao_bang',qty:2},{id:'tien_can',qty:3},{id:'hon_don_tinh',qty:1}],
    stoneCost:7000, successChance:0.28, requireRealm:3, requireRank:4,
    buffs:[{type:'lifespan', value:15}],
    desc:'Bánh vạn thọ tiên phẩm. +15 năm tuổi thọ vĩnh viễn.',
    lore:'Mỗi miếng bánh chứa ánh nhật quang và băng bắc cực — cực phẩm trường thọ.',
  },
  {
    id:'cook_chaos_soup',     name:'Hỗn Độn Nguồn Gốc Canh',  emoji:'🌌', category:'canh',  tier:5,
    materials:[{id:'hon_don_tinh',qty:2},{id:'long_can',qty:2},{id:'linh_tuỷ',qty:4}],
    stoneCost:6000, successChance:0.30, requireRealm:3, requireRank:4,
    buffs:[{type:'hp_instant', value:9999},{type:'hp_regen', value:200, duration:18000}],
    desc:'Canh hỗn độn. Hồi toàn bộ HP + 200 HP/giây trong 5 giờ.',
    lore:'Nước canh màu vũ trụ — uống vào như trở về khởi nguồn vạn vật.',
  },
  {
    id:'cook_sun_moon_tiec',  name:'Nhật Nguyệt Tịnh Huy Tiệc',emoji:'☯️', category:'tiec', tier:5,
    materials:[{id:'nhat_quang_lo',qty:2},{id:'bac_dao_bang',qty:2},{id:'hon_don_tinh',qty:1},{id:'tien_can',qty:4}],
    stoneCost:7500, successChance:0.27, requireRealm:3, requireRank:5,
    buffs:[
      {type:'exp_pct', value:80, duration:18000},
      {type:'stone_pct', value:60, duration:18000},
      {type:'rate_pct', value:100, duration:18000},
      {type:'lifespan', value:5},
    ],
    desc:'Tiệc nhật nguyệt. +80% EXP + 60% Stone + 100% tốc tu 5 giờ + 5 năm thọ.',
    lore:'Nhật quang và nguyệt băng hội tụ — âm dương điều hoà, trời đất chứng nhân.',
  },

  // == Thực phẩm đặc biệt (realm-specific) ==
  {
    id:'cook_breakthr_soup',  name:'Đột Phá Trợ Lực Canh',    emoji:'⚡', category:'canh',  tier:3,
    materials:[{id:'thien_duoc',qty:1},{id:'huyet_sam',qty:2},{id:'linh_tuỷ',qty:1}],
    stoneCost:600, successChance:0.60, requireRealm:1, requireRank:2,
    buffs:[{type:'rate_pct', value:40, duration:1800},{type:'exp_pct', value:25, duration:1800}],
    desc:'Canh trợ đột phá. +40% tốc tu + 25% EXP trong 30 phút — nên ăn trước khi đột phá.',
    lore:'Kinh nghiệm của tiền nhân: ăn canh này trước khi vượt thiên kiếp.',
  },
  {
    id:'cook_regen_feast',    name:'Hồi Phục Đại Tiệc',        emoji:'💚', category:'tiec',  tier:2,
    materials:[{id:'cam_lo_linh',qty:2},{id:'van_linh_co',qty:4},{id:'linh_thu_xuong',qty:4}],
    stoneCost:150, successChance:0.75, requireRealm:0, requireRank:1,
    buffs:[{type:'hp_regen', value:25, duration:1800},{type:'stamina_regen', value:40}],
    desc:'Tiệc hồi phục toàn diện. 25 HP/giây trong 30 phút + 40 thể lực.',
    lore:'Bàn tiệc hồi phục cho tu sĩ sau trận chiến ác liệt.',
  },
  {
    id:'cook_combat_banh',    name:'Chiến Đấu Linh Bánh',      emoji:'⚔️', category:'banh',  tier:2,
    materials:[{id:'ung_vu_linh',qty:3},{id:'hoa_linh_thao',qty:3},{id:'ngũ_hanh_yen',qty:1}],
    stoneCost:140, successChance:0.77, requireRealm:0, requireRank:1,
    buffs:[{type:'atk_pct', value:15, duration:1800},{type:'def_pct', value:8, duration:1800}],
    desc:'Bánh chiến đấu. +15% ATK + 8% DEF trong 30 phút.',
    lore:'Tu sĩ chiến đấu thường mang bánh này — vừa đánh vừa ăn.',
  },
];

// ---- Cấp Bậc Linh Thực Sư ----
export const CHEF_RANKS = [
  { rank:0, name:'Linh Thực',      emoji:'🍽',  minCooks:0,   bonus:0,  desc:'Mới vào bếp, chỉ nấu được món đơn giản.' },
  { rank:1, name:'Học Đồ Linh Thực',   emoji:'🧑‍🍳', minCooks:5,   bonus:5,  desc:'+5% tỷ lệ thành công. Mở công thức Tier 2.' },
  { rank:2, name:'Linh Thực Thủ',      emoji:'👨‍🍳', minCooks:20,  bonus:12, desc:'+12% tỷ lệ. Mở công thức Tier 3.' },
  { rank:3, name:'Linh Thực Sư',       emoji:'⭐',  minCooks:50,  bonus:22, desc:'+22% tỷ lệ. Mở công thức Tier 4.' },
  { rank:4, name:'Đại Sư Linh Thực',   emoji:'🌟',  minCooks:100, bonus:35, desc:'+35% tỷ lệ. Mở công thức Tiên Thực Tier 5.' },
  { rank:5, name:'Linh Thực Thánh',    emoji:'👑',  minCooks:200, bonus:50, desc:'+50% tỷ lệ. Nấu được tuyệt phẩm thần tiên.' },
];

export function getChefRank(cooksCount) {
  for (let i = CHEF_RANKS.length - 1; i >= 0; i--) {
    if (cooksCount >= CHEF_RANKS[i].minCooks) return CHEF_RANKS[i];
  }
  return CHEF_RANKS[0];
}

export function getNextChefRank(cooksCount) {
  for (let i = 0; i < CHEF_RANKS.length; i++) {
    if (cooksCount < CHEF_RANKS[i].minCooks) return CHEF_RANKS[i];
  }
  return null;
}

// Helper: format duration
export function fmtDuration(secs) {
  if (secs >= 3600) return `${(secs/3600).toFixed(1)}h`;
  if (secs >= 60)   return `${Math.round(secs/60)} phút`;
  return `${secs}s`;
}