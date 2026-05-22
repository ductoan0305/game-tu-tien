// ============================================================
// ui/map-data.js — World Map & Zone data constants
// Tách riêng để tránh circular import giữa world-map.js và location-popup.js
// ============================================================

export const WORLD_NODES = [
  { id:'thanh_van_son',  name:'Thanh Vân Sơn', emoji:'🏔', x:160, y:100,
    desc:'Căn cứ địa Kiếm Tông. Linh khí thanh tú.', color:'#4a9eff',
    unlockRealm:0, entryCost:0,
    connections:['hac_phong_lam','van_linh_thi','an_long_dong'] },
  { id:'van_linh_thi',   name:'Vạn Linh Thị',  emoji:'🏮', x:340, y:180,
    desc:'Chợ lớn nhất. Mua bán mọi thứ.', color:'#f0d47a',
    unlockRealm:0, entryCost:0,
    connections:['thanh_van_son','linh_duoc_coc','thien_kiep_dia'] },
  { id:'hac_phong_lam',  name:'Hắc Phong Lâm', emoji:'🌲', x:120, y:240,
    desc:'Rừng âm u, yêu thú hoành hành.', color:'#56c46a',
    unlockRealm:0, unlockStage:3, entryCost:0,
    connections:['thanh_van_son','linh_duoc_coc','dia_phu_mon'] },
  { id:'linh_duoc_coc',  name:'Linh Dược Cốc',  emoji:'🌿', x:300, y:320,
    desc:'Thung lũng thảo dược quý hiếm.', color:'#7bcf8a',
    unlockRealm:0, entryCost:0,
    connections:['van_linh_thi','hac_phong_lam','dia_phu_mon'] },
  { id:'thien_kiep_dia', name:'Thiên Kiếp Địa', emoji:'⚡', x:460, y:110,
    desc:'Linh khí hỗn loạn, sấm sét bất thường.', color:'#c084fc',
    unlockRealm:2, entryCost:500,
    connections:['van_linh_thi'] },
  { id:'dia_phu_mon',    name:'Cổng Địa Phủ',   emoji:'☠', x:260, y:430,
    desc:'Lối vào Thiên Ma Địa Phủ.', color:'#e05c4a',
    unlockRealm:2, entryCost:0,
    connections:['hac_phong_lam','linh_duoc_coc'] },
  { id:'an_long_dong',   name:'Ẩn Long Động',   emoji:'🕳', x:60,  y:170,
    desc:'Động phủ bí ẩn, linh khí cực đậm.', color:'#a89df5',
    unlockRealm:1, needCoDuyen:true, entryCost:0,
    connections:['thanh_van_son'] },
];

// ============================================================
// DỮ LIỆU ZONE MAP — locations trong từng vùng
// ============================================================
export const ZONE_DATA = {
  thanh_van_son: {
    bg: 'linear-gradient(160deg,#0a1628 0%,#1a2840 50%,#0d2010 100%)',
    locations: [
      { id:'kiem_tong_gate', name:'Thanh Vân Kiếm Tông', emoji:'🏯',
        x:200, y:130, type:'sect_gate', sectId:'kiem_tong',
        desc:'Cổng tông môn uy nghiêm, kiếm khí bao phủ.',
        requireSect:'kiem_tong', lockedMsg:'Chỉ đệ tử Thanh Vân mới được vào.' },
      { id:'phuong_thi_son', name:'Phường Thị Sơn Cước', emoji:'🏮',
        x:330, y:220, type:'market',
        desc:'Chợ nhỏ dưới chân núi. Ai cũng vào được.' },
      { id:'rung_ngoai_mon', name:'Rừng Ngoại Môn', emoji:'🌲',
        x:120, y:260, type:'hunt_zone',
        desc:'Rừng cạnh tông môn. Yêu thú cấp thấp.' },
      { id:'linh_phong_dinh', name:'Linh Phong Đỉnh', emoji:'🗻',
        x:260, y:60, type:'cultivate_spot', requireRealm:1, entryCost:200,
        desc:'Đỉnh núi có linh khí đậm đặc. Phúc Địa ×1.8.', phapDia:'phuc_dia' },
      // L7 — H3: Secret Zone — Lão Dược Sư tier 2 reward
      { id:'duoc_thao_bi_canh_thanh_phong', name:'Dược Thảo Bí Cảnh', emoji:'🌺',
        x:390, y:310, type:'secret_gather',
        requireSecret:'duoc_thao_bi_canh_thanh_phong',
        desc:'Vùng dược thảo hiếm ẩn sau Thanh Vân Sơn. Nguyên liệu cao cấp, có cooldown 30 ngày thực.' },
      // Sprint 6 — Bà Nguyên tier 2 secret zone
      { id:'linh_phu_nguyen_vuon', name:'Linh Phủ Vườn Nguyên', emoji:'🪴',
        x:100, y:280, type:'secret_gather',
        requireSecret:'linh_phu_nguyen_vuon',
        desc:'Vườn linh thảo ẩn của Bà Nguyên bảy mươi năm. Nguyên liệu hạ phẩm nhưng đa dạng — hạt giống, thảo mộc, linh căn thực vật. Cooldown 30 ngày thực.' },
    ]
  },
  van_linh_thi: {
    bg: 'linear-gradient(160deg,#1a1000 0%,#2a1a00 50%,#1a1200 100%)',
    locations: [
      { id:'dai_phuong_thi', name:'Đại Phường Thị', emoji:'🏮',
        x:220, y:170, type:'market',
        desc:'Chợ lớn nhất Phàm Nhân Giới. Mua bán thoải mái.' },
      { id:'dan_tong_gate', name:'Vạn Linh Đan Tông', emoji:'⚗',
        x:120, y:100, type:'sect_gate', sectId:'dan_tong',
        desc:'Đan tông hùng mạnh. Đan hương ngào ngạt.',
        requireSect:'dan_tong', lockedMsg:'Chỉ đệ tử Đan Tông mới được vào.' },
      { id:'hoi_thuong_nhan', name:'Hội Thương Nhân', emoji:'🔨',
        x:330, y:100, type:'freelance_quest',
        desc:'Tán tu nhận nhiệm vụ du hiệp tại đây.' },
      { id:'dau_gia_truong', name:'Đấu Giá Trường', emoji:'💰',
        x:220, y:290, type:'auction', requireRealm:1,
        desc:'Đấu giá vật phẩm hiếm. Cần Trúc Cơ+.' },
      { id:'thien_bang', name:'Thiên Bảng', emoji:'🏆',
        x:360, y:220, type:'ranking',
        desc:'Bảng xếp hạng tu sĩ Phàm Nhân Giới.' },
      { id:'lao_thuong_nhan_vlt', name:'Lão Thương Nhân', emoji:'🧓', npcId:'lao_thuong_nhan',
        x:120, y:230, type:'npc',
        desc:'Thương nhân kỳ cựu ngồi góc chợ. Biết nhiều bí mật.' },
    ]
  },
  hac_phong_lam: {
    bg: 'linear-gradient(160deg,#050a05 0%,#0a1a0a 50%,#050505 100%)',
    locations: [
      { id:'rung_co_thu', name:'Rừng Cổ Thụ', emoji:'🌲',
        x:180, y:180, type:'hunt_zone',
        desc:'Cây cổ thụ ngàn năm. Yêu thú mạnh hơn.' },
      { id:'hang_dong_bi_an', name:'Hang Động Bí Ẩn', emoji:'🕳',
        x:300, y:120, type:'mystery_cave', requireRealm:1,
        desc:'Hang tối bí ẩn. Cơ duyên xuất hiện nhiều hơn.' },
      { id:'sao_huyet_yeu_vuong', name:'Sào Huyệt Yêu Vương', emoji:'💀',
        x:150, y:300, type:'boss_zone', requireRealm:2,
        desc:'Nơi trú ngụ của Yêu Vương. Nguy hiểm cực độ.' },
      { id:'san_nhan_hpl', name:'Thợ Săn Già', emoji:'🏹', npcId:'san_nhan_gia',
        x:310, y:250, type:'npc',
        desc:'Thợ săn lão luyện ẩn cư trong rừng. Biết rõ từng góc khuất.' },
      // Sprint 6 — Ẩn Tu Băng tier 2 secret zone
      { id:'bang_dong_bi_canh', name:'Băng Động Bí Cảnh', emoji:'🧊',
        x:400, y:175, type:'secret_gather',
        requireSecret:'bang_dong_bi_canh',
        desc:'Động băng giá ẩn sau rừng già, nơi Ẩn Tu Băng từng thiền định suốt thập kỷ. Nguyên liệu băng hệ hiếm — Băng Tinh Thể thượng phẩm, Hàn Băng Thảo cổ. Cooldown 30 ngày thực.' },
    ]
  },
  linh_duoc_coc: {
    bg: 'linear-gradient(160deg,#051505 0%,#0a2a0a 50%,#051505 100%)',
    locations: [
      { id:'duoc_dien', name:'Dược Điền', emoji:'🌿',
        x:200, y:160, type:'gather_zone',
        desc:'Ruộng thảo dược quý. Thu thập ở đây tốt nhất.' },
      { id:'tieu_dan_phong', name:'Tiểu Đan Phòng', emoji:'💊',
        x:330, y:200, type:'alchemy',
        desc:'Lò đan nhỏ. Ai cũng có thể luyện đan.' },
      { id:'tham_coc_bi_canh', name:'Thâm Cốc Bí Cảnh', emoji:'🌺',
        x:150, y:290, type:'mystery_zone', requireRealm:2,
        desc:'Vực sâu bí ẩn. Nơi Vạn Niên Huyết Liên có thể xuất hiện.' },
      { id:'duoc_su_ldc', name:'Già Dược Sư', emoji:'🌸', npcId:'duoc_su_ldc',
        x:330, y:300, type:'npc',
        desc:'Nữ dược sư ẩn cư trong cốc. Thông thạo linh thảo hiếm.' },
      // L7 — H3: Secret Zone — Lão Ngư Ông tier 2 reward
      { id:'linh_ngu_dam_lam_hai', name:'Linh Ngư Đầm', emoji:'🐟',
        x:90, y:155, type:'secret_gather',
        requireSecret:'linh_ngu_dam_lam_hai',
        desc:'Đầm linh ngư ẩn sâu gần Linh Dược Cốc. Nguyên liệu thủy hệ hiếm, có cooldown 30 ngày thực.' },
    ]
  },
  thien_kiep_dia: {
    bg: 'linear-gradient(160deg,#0a0520 0%,#1a0a30 50%,#050a15 100%)',
    locations: [
      { id:'tran_phap_gate', name:'Huyền Cơ Các', emoji:'🔮',
        x:310, y:100, type:'sect_gate', sectId:'tran_phap',
        desc:'Tông môn trận pháp huyền bí. Trận văn khắc đầy cổng.',
        requireSect:'tran_phap', lockedMsg:'Chỉ đệ tử Huyền Cơ Các mới được vào.' },
      { id:'loi_tri', name:'Lôi Trì', emoji:'⚡',
        x:200, y:150, type:'cultivate_spot',
        desc:'Ao sấm sét. Tu luyện tại đây tăng tỷ lệ đột phá.', phapDia:'bao_dia' },
      { id:'vong_xoay_linh_khi', name:'Vòng Xoáy Linh Khí', emoji:'🌀',
        x:330, y:180, type:'cultivate_spot',
        desc:'Bảo Địa tự nhiên hiếm có. ×5.0 tốc độ tu luyện.', phapDia:'bao_dia' },
      { id:'dia_kiep_thu', name:'Địa Kiếp Thú', emoji:'⚔',
        x:200, y:290, type:'boss_zone', requireRealm:3,
        desc:'Linh thú của thiên kiếp. Mạnh nhất Phàm Nhân Giới.' },
      { id:'tien_nhan_tkd', name:'Di Dân Tiền Nhân', emoji:'👁', npcId:'di_dan_tien_nhan',
        x:120, y:200, type:'npc', requireRealm:2,
        desc:'Bóng hình mờ ảo giữa lôi trận. Không rõ còn sống hay đã chết.' },
      // L7 — H3: Secret Zone — Đao Khách Già tier 2 reward
      { id:'co_lo_phe_tich_hoa_diem', name:'Cổ Lò Phế Tích', emoji:'🔨',
        x:420, y:270, type:'secret_gather',
        requireSecret:'co_lo_phe_tich_hoa_diem',
        desc:'Phế tích lò rèn cổ đại chứa nguyên liệu rèn quý. Cooldown 30 ngày thực.' },
    ]
  },
  dia_phu_mon: {
    bg: 'linear-gradient(160deg,#0a0000 0%,#1a0500 50%,#050000 100%)',
    locations: [
      { id:'dia_phu_nhap_khau', name:'Địa Phủ Nhập Khẩu', emoji:'☠',
        x:210, y:150, type:'dungeon',
        desc:'Cửa vào Thiên Ma Địa Phủ. 10 tầng nguy hiểm.' },
      { id:'am_hon_pho', name:'Âm Hồn Phố', emoji:'👻',
        x:330, y:220, type:'ghost_market',
        desc:'Hồn ma bán vật phẩm kỳ lạ không nơi nào có.' },
      { id:'canh_binh_dia_phu', name:'Canh Binh Địa Phủ', emoji:'💀', npcId:'canh_binh_dia_phu',
        x:120, y:260, type:'npc',
        desc:'Binh sĩ trông coi cổng Địa Phủ. Lạnh lùng và không thể mua chuộc.' },
    ]
  },
  an_long_dong: {
    bg: 'linear-gradient(160deg,#050510 0%,#0a0a25 50%,#050510 100%)',
    locations: [
      { id:'the_tu_gate', name:'Thiết Cốt Môn', emoji:'💪',
        x:310, y:100, type:'sect_gate', sectId:'the_tu',
        desc:'Tông môn luyện thể cường tráng. Tiếng đập đá vang vọng.',
        requireSect:'the_tu', lockedMsg:'Chỉ đệ tử Thiết Cốt Môn mới được vào.' },
      { id:'long_uyen', name:'Long Uyên', emoji:'🐉',
        x:200, y:160, type:'cultivate_spot',
        desc:'Vực rồng cổ đại. Linh khí ngàn năm tụ đây.', phapDia:'dong_phu' },
      { id:'bi_kho_tien_nhan', name:'Bí Kho Tiền Nhân', emoji:'🗝',
        x:310, y:240, type:'treasure',
        desc:'Kho báu của tu sĩ tiền nhân. Mở ra là loot cực phẩm.' },
      { id:'linh_nhan_ald', name:'Linh Nhân Cổ Động', emoji:'🧝', npcId:'linh_nhan_co_dong',
        x:120, y:200, type:'npc', requireRealm:1,
        desc:'Sinh linh cổ đại trông coi Long Uyên. Tuổi tác vô lượng.' },
    ]
  },
};

// --- SVG labels (tránh cắt chữ một dòng trên node map) ---
function _escapeSvgText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Nhãn địa điểm zone / tân thủ thôn (1–2 dòng).
 * @param {string} name
 * @param {number} x
 * @param {number} yBase — baseline dòng dưới cùng (khi 1 dòng) hoặc giữa khối 2 dòng
 */
export function svgZoneLocLabel(name, x, yBase, opts = {}) {
  const fill = opts.fill || '#ccc';
  const fs = opts.fontSize ?? 8.5;
  const maxOneLine = opts.maxOneLine ?? 12;
  const n = String(name).trim();
  if (n.length <= maxOneLine) {
    return `<text x="${x}" y="${yBase}" text-anchor="middle" font-size="${fs}" fill="${fill}">${_escapeSvgText(n)}</text>`;
  }
  const mid = Math.floor(n.length / 2);
  let split = n.lastIndexOf(' ', mid + 2);
  if (split <= 0) split = mid;
  const l1 = n.slice(0, split).trim();
  const l2 = n.slice(split).trim();
  return `
    <text x="${x}" y="${yBase - 5}" text-anchor="middle" font-size="${fs - 0.5}" fill="${fill}">${_escapeSvgText(l1)}</text>
    <text x="${x}" y="${yBase + 6}" text-anchor="middle" font-size="${fs - 0.5}" fill="${fill}">${_escapeSvgText(l2)}</text>`;
}

// ============================================================
// KHUYẾT VỰC TERRITORY MAP — Hướng A (SVG Territory Polygon)
// ============================================================

/** Màu sắc + style theo phe */
export const FACTION_COLORS = {
  chinh_dao: {
    fill: 'rgba(10,68,58,0.84)',
    stroke: '#2dd4bf',
    light: '#5eead4',
    bg: '#0a443a',
    label: '正道 Chính Đạo',
  },
  ma_dao: {
    fill: 'rgba(80,8,22,0.84)',
    stroke: '#f43f5e',
    light: '#fb7185',
    bg: '#500816',
    label: '魔道 Ma Đạo',
  },
  trung_lap: {
    fill: 'rgba(82,62,8,0.84)',
    stroke: '#eab308',
    light: '#fde047',
    bg: '#523e08',
    label: '中立 Trung Lập',
  },
  hazard: {
    fill: 'rgba(20,24,32,0.92)',
    stroke: '#4b5563',
    light: '#9ca3af',
    bg: '#141820',
    label: '險地 Hiểm Địa',
  },
};

/**
 * Dữ liệu polygon lãnh thổ Khuyết Vực.
 * ViewBox: 700 × 520
 * mountains: [[x,y], ...] — vị trí ký hiệu núi
 * forests:   [[x,y], ...] — vị trí ký hiệu rừng
 * zoneId: liên kết sang ZONE_DATA khi click (null = chưa implement)
 */
export const KHUYETVUC_TERRITORIES = [
  // ─── HIỂM ĐỊA ────────────────────────────────────────────
  {
    id: 'bac_hiem_son', name: 'Bắc Hiểm Sơn', faction: 'hazard', terrain: 'mountain',
    chName: '北險山',
    points: '0,0 700,0 700,88 545,100 365,82 188,98 62,88 0,80',
    lx: 350, ly: 50,
    desc: 'Vùng núi phía bắc — yêu thú cấp cao, vô chủ. Linh Mạch Cấp 5 chưa ai khai thác được.',
    nodeId: null,
    mountains: [[120,40],[220,52],[340,38],[460,48],[580,42],[650,55]],
    forests: [],
  },
  {
    id: 'tay_sa_mac', name: 'Tây Sa Mạc', faction: 'hazard', terrain: 'desert',
    chName: '西沙漠',
    points: '0,80 62,88 45,250 15,400 0,450',
    lx: 22, ly: 290,
    desc: 'Sa mạc linh thạch phía tây — mỏ tự nhiên, không thế lực nào kiểm soát được lâu.',
    nodeId: null,
    mountains: [], forests: [],
  },
  // ─── CHÍNH ĐẠO ───────────────────────────────────────────
  {
    id: 'thai_thanh', name: 'Thái Thanh Kiếm Tông', faction: 'chinh_dao', terrain: 'mountain',
    chName: '太清劍宗',
    points: '62,88 188,98 255,185 218,295 130,318 45,285 15,195 45,128',
    lx: 148, ly: 210,
    desc: 'Bá chủ kiếm đạo, kiểm soát Thanh Phong Lĩnh. Linh Mạch Cấp 5 nằm sâu trong Thái Thanh Sơn.',
    nodeId: 'thanh_van_son',
    rank: 'dai_tong',
    mountains: [[100,138],[138,155],[82,172],[165,172],[112,200]],
    forests: [],
  },
  {
    id: 'bach_van', name: 'Bạch Vân Kiếm Phái', faction: 'chinh_dao', terrain: 'land',
    chName: '白雲劍派',
    points: '188,98 365,82 405,155 358,222 255,222 255,185',
    lx: 298, ly: 155,
    desc: 'Đại tông chính đạo kiểm soát cao nguyên trung tâm. Kiếm pháp mây trắng thanh thoát.',
    nodeId: 'hac_phong_lam',
    rank: 'dai_tong',
    mountains: [[282,112],[318,124],[352,108]],
    forests: [[248,168],[268,195]],
  },
  {
    id: 'tuyet_linh', name: 'Tuyết Linh Cung', faction: 'chinh_dao', terrain: 'land',
    chName: '雪靈宮',
    points: '255,185 358,222 368,318 280,348 190,332 130,318 218,295',
    lx: 262, ly: 288,
    desc: 'Đại tông nữ tu chính đạo. Pháp thuật băng và huyền thuật bậc thượng.',
    nodeId: 'linh_duoc_coc',
    rank: 'dai_tong',
    mountains: [],
    forests: [[222,258],[260,272],[298,242],[240,308]],
  },
  // ─── TRUNG LẬP ───────────────────────────────────────────
  {
    id: 'van_linh_hoi', name: 'Vạn Linh Hội', faction: 'trung_lap', terrain: 'land',
    chName: '萬靈會',
    points: '358,222 405,155 535,162 570,248 522,325 410,348 368,318',
    lx: 462, ly: 268,
    desc: 'Tông môn thương mại trung lập lớn nhất Khuyết Vực. Mua bán cả hai phe.',
    nodeId: 'van_linh_thi',
    rank: 'dai_tong',
    mountains: [],
    forests: [[440,192],[482,212],[415,235]],
  },
  {
    id: 'huyen_phu_duong', name: 'Huyền Phù Đường', faction: 'trung_lap', terrain: 'land',
    chName: '玄符堂',
    points: '190,332 280,348 368,318 410,348 395,428 268,458 142,438 118,368',
    lx: 262, ly: 398,
    desc: 'Tông môn phù chú trung lập. Bán phù lục cho cả Chính lẫn Ma đạo.',
    nodeId: 'an_long_dong',
    rank: 'dai_tong',
    mountains: [],
    forests: [[198,378],[240,362],[318,372],[352,398]],
  },
  {
    id: 'luyen_bao_tong', name: 'Luyện Bảo Tông', faction: 'trung_lap', terrain: 'land',
    chName: '煉寶宗',
    points: '118,368 142,438 268,458 335,520 0,520 0,450 15,400 45,285 130,318',
    lx: 102, ly: 455,
    desc: 'Tông môn luyện khí cụ trung lập. Cung cấp vũ khí và linh bảo cho toàn Khuyết Vực.',
    nodeId: null,
    rank: 'dai_tong',
    mountains: [],
    forests: [[75,392],[58,422],[98,432],[135,412]],
  },
  // ─── MA ĐẠO ──────────────────────────────────────────────
  {
    id: 'huyet_nguyet', name: 'Huyết Nguyệt Thành', faction: 'ma_dao', terrain: 'mountain',
    chName: '血月城',
    points: '405,155 535,162 570,248 598,285 700,285 700,88 545,100',
    lx: 562, ly: 185,
    desc: 'Ma đạo đại tông mạnh nhất Khuyết Vực. Thành trì không thể công phá từ bên ngoài.',
    nodeId: 'thien_kiep_dia',
    rank: 'dai_tong',
    mountains: [[548,118],[582,132],[612,148],[548,155],[578,162]],
    forests: [],
  },
  {
    id: 'doc_phong_linh', name: 'Độc Phong Lĩnh', faction: 'ma_dao', terrain: 'mountain',
    chName: '毒峰嶺',
    points: '522,325 570,248 598,285 700,285 700,390 555,445 428,440 395,428 410,348',
    lx: 572, ly: 352,
    desc: 'Dãy núi độc — khí độc lan ra khắp vùng, chỉ ma tu quen sống được.',
    nodeId: 'dia_phu_mon',
    rank: 'dai_tong',
    mountains: [[598,308],[628,322],[602,348],[648,305]],
    forests: [],
  },
  {
    id: 'minh_hoa_giao', name: 'Minh Hỏa Giáo', faction: 'ma_dao', terrain: 'land',
    chName: '冥火教',
    points: '268,458 395,428 428,440 555,445 518,520 335,520',
    lx: 415, ly: 480,
    desc: 'Giáo phái ma đạo bành trướng nhanh về phía nam. Dùng hỏa thuật tà môn.',
    nodeId: null,
    rank: 'dai_tong',
    mountains: [], forests: [],
  },
  {
    id: 'am_da_tong', name: 'Ảm Dạ Tông', faction: 'ma_dao', terrain: 'swamp',
    chName: '暗夜宗',
    points: '555,445 700,390 700,520 518,520',
    lx: 635, ly: 470,
    desc: 'Ma tông ẩn náu trong vùng lầy đen đông nam. Hoạt động về đêm, hành tung bí ẩn.',
    nodeId: null,
    rank: 'dai_tong',
    mountains: [], forests: [],
  },
];

// ============================================================
// NHÂN GIỚI TOÀN ĐỒ — 5 đại vùng (Tầng 1 world map)
// ============================================================

export const NHAN_GIOI_REGIONS = [
  {
    id: 'vinh_da',
    name: 'Vĩnh Dạ Hàn Nguyên', chName: '永夜寒原',
    implemented: false,
    fill: 'rgba(15,35,65,0.84)', stroke: '#93c5fd', light: '#bfdbfe', bg: '#0f2341',
    points: '0,0 700,0 700,162 582,142 452,158 310,146 168,160 52,144 0,168',
    lx: 350, ly: 76,
    desc: 'Thảo nguyên băng giá vô tận. Dài đêm ngắn ngày. Ma đạo chiếm ưu thế do môi trường khắc nghiệt.',
    patternId: 'ngp-ice',
  },
  {
    id: 'co_vuc',
    name: 'Cổ Vực', chName: '古域',
    implemented: false,
    fill: 'rgba(35,10,55,0.86)', stroke: '#a855f7', light: '#d8b4fe', bg: '#230a37',
    points: '0,168 52,144 82,218 65,312 92,392 75,492 0,510',
    lx: 40, ly: 330,
    desc: 'Vùng đất cổ đại, tàn tích văn minh tu tiên. Nguy hiểm bậc nhất Nhân Giới. Endgame content.',
    patternId: 'ngp-ruins',
  },
  {
    id: 'khuyetvuc',
    name: 'Khuyết Vực', chName: '缺域',
    implemented: true,
    fill: 'rgba(10,68,58,0.84)', stroke: '#2dd4bf', light: '#5eead4', bg: '#0a443a',
    points: '52,144 168,160 310,146 368,158 396,232 374,342 292,402 180,410 92,392 65,312 82,218',
    lx: 192, ly: 272,
    desc: 'Vùng văn minh chính của Nhân Giới. Nhiều tông môn, cơ duyên và chiến tranh. Nơi bắt đầu hành trình.',
    patternId: 'ngp-land',
  },
  {
    id: 'than_chau',
    name: 'Thần Châu Linh Thổ', chName: '神州靈土',
    implemented: false,
    fill: 'rgba(82,62,8,0.82)', stroke: '#eab308', light: '#fde047', bg: '#523e08',
    points: '310,146 452,158 582,142 700,162 700,332 628,358 538,364 444,334 396,232 368,158',
    lx: 530, ly: 240,
    desc: 'Linh khí phong phú nhất Nhân Giới. Trung tâm văn minh tu tiên. Nhiều Bí Cảnh nhất.',
    patternId: 'ngp-land',
  },
  {
    id: 'thien_tinh',
    name: 'Thiên Tinh Hải Vực', chName: '天星海域',
    implemented: false,
    fill: 'rgba(5,20,55,0.90)', stroke: '#38bdf8', light: '#7dd3fc', bg: '#051437',
    points: '75,492 92,392 180,410 292,402 374,342 444,334 538,364 628,358 700,332 700,510 0,510',
    lx: 418, ly: 445,
    desc: 'Quần đảo và đại dương bao la. Thương mại phát triển. Trung lập chiếm ưu thế.',
    patternId: 'ngp-ocean',
  },
];

// ============================================================
// TERRITORY INTERIORS — Nội dung Tầng 3 cho từng lãnh thổ
// Mỗi entry: { bg, locations[] }
// locations dùng territory id làm prefix (hn_, tt_, bv_, tl_, vlh_, hpd_, dpl_)
// ============================================================
export const TERRITORY_INTERIORS = {

  // ─── HUYẾT NGUYỆT THÀNH — Ma Đạo ───────────────────────────────────────
  huyet_nguyet: {
    bg: 'linear-gradient(160deg,#1a0008 0%,#3a0015 50%,#0a0005 100%)',
    locations: [
      { id:'hn_sect_gate', name:'Huyết Nguyệt Môn', emoji:'🏯',
        x:200, y:130, type:'sect_gate', sectId:'huyet_nguyet',
        desc:'Cổng thành Huyết Nguyệt. Khí Ma Đạo đặc quánh.',
        requireSect:'huyet_nguyet', lockedMsg:'Chỉ đệ tử Huyết Nguyệt mới vào được.' },
      { id:'hn_loi_tri', name:'Lôi Trì Huyết', emoji:'⚡',
        x:340, y:155, type:'cultivate_spot',
        desc:'Ao sấm huyết đỏ. Tu luyện tại đây tăng tỷ lệ đột phá.', phapDia:'bao_dia' },
      { id:'hn_hunt', name:'Bình Nguyên Huyết', emoji:'⚔',
        x:120, y:245, type:'hunt_zone',
        desc:'Bình nguyên đỏ thẫm. Linh thú Ma Đạo mạnh mẽ và hung hãn.' },
      { id:'hn_market', name:'Hắc Thị', emoji:'🏮',
        x:350, y:265, type:'market',
        desc:'Chợ đen Huyết Nguyệt. Mua bán vật phẩm Ma Đạo không nơi nào có.' },
      { id:'hn_npc_giam_hoa', name:'Giám Hóa Lão Ma', emoji:'👁',
        x:200, y:275, type:'npc', npcId:'giam_hoa_lao_ma',
        desc:'Lão ma tu hàng ngàn năm. Biết nhiều bí mật về cảnh giới cao.' },
    ],
  },

  // ─── THÁI THANH KIẾM TÔNG — Chính Đạo ──────────────────────────────────
  thai_thanh: {
    bg: 'linear-gradient(160deg,#041828 0%,#082840 50%,#031220 100%)',
    locations: [
      { id:'tt_sect_gate', name:'Thái Thanh Sơn Môn', emoji:'🏯',
        x:200, y:120, type:'sect_gate', sectId:'kiem_tong',
        desc:'Cổng tông môn uy nghiêm. Kiếm khí bao phủ vạn dặm.',
        requireSect:'kiem_tong', lockedMsg:'Chỉ đệ tử Thái Thanh mới được vào.' },
      { id:'tt_thien_kiem_dai', name:'Thiên Kiếm Đài', emoji:'🗻',
        x:340, y:120, type:'cultivate_spot', requireRealm:1, entryCost:200,
        desc:'Động Thiên Phúc Địa lớn nhất Thái Thanh. Tu luyện +40% hiệu quả.', phapDia:'phuc_dia' },
      { id:'tt_rung_thai_thanh', name:'Rừng Thái Thanh', emoji:'🌲',
        x:120, y:235, type:'hunt_zone',
        desc:'Rừng cạnh tông môn. Yêu thú phong hệ cấp cao.' },
      { id:'tt_linh_tuyen', name:'Thanh Phong Linh Tuyền', emoji:'💧',
        x:340, y:255, type:'gather_zone',
        desc:'Linh tuyền thanh mát. Nguyên liệu phong hệ và linh thảo quý.' },
      { id:'tt_phuong_thi', name:'Phường Thị Sơn Cước', emoji:'🏮',
        x:200, y:265, type:'market',
        desc:'Chợ nhỏ dưới chân núi. Ai cũng vào được.' },
      // Secret zone — Lão Dược Sư tier 2
      { id:'duoc_thao_bi_canh_thanh_phong', name:'Dược Thảo Bí Cảnh', emoji:'🌺',
        x:380, y:310, type:'secret_gather',
        requireSecret:'duoc_thao_bi_canh_thanh_phong',
        desc:'Vùng dược thảo hiếm ẩn sau Thanh Vân Sơn. Nguyên liệu cao cấp, cooldown 30 ngày thực.' },
      // Secret zone — Bà Nguyên tier 2
      { id:'linh_phu_nguyen_vuon', name:'Linh Phủ Vườn Nguyên', emoji:'🪴',
        x:100, y:290, type:'secret_gather',
        requireSecret:'linh_phu_nguyen_vuon',
        desc:'Vườn linh thảo ẩn của Bà Nguyên bảy mươi năm. Hạt giống, thảo mộc, linh căn thực vật. Cooldown 30 ngày thực.' },
    ],
  },

  // ─── BẠCH VÂN KIẾM PHÁI — Chính Đạo ───────────────────────────────────
  bach_van: {
    bg: 'linear-gradient(160deg,#081828 0%,#103040 50%,#061520 100%)',
    locations: [
      { id:'bv_sect_gate', name:'Bạch Vân Đỉnh', emoji:'🏯',
        x:200, y:120, type:'sect_gate', sectId:'bach_van',
        desc:'Cổng môn phái kiếm đạo mây trắng. Thanh thoát siêu trần.',
        requireSect:'bach_van', lockedMsg:'Chỉ đệ tử Bạch Vân mới được vào.' },
      { id:'bv_dong_thien', name:'Vân Phong Động Thiên', emoji:'🌤',
        x:340, y:130, type:'cultivate_spot', requireRealm:1,
        desc:'Không gian tu luyện tụ vân khí. Linh khí đặc biệt dày đặc.', phapDia:'phuc_dia' },
      { id:'bv_hunt', name:'Cao Nguyên Bạch Vân', emoji:'⚔',
        x:120, y:235, type:'hunt_zone',
        desc:'Cao nguyên trung tâm Bạch Vân kiểm soát. Yêu thú phong và thổ hệ.' },
      { id:'bv_market', name:'Chợ Bạch Vân', emoji:'🏮',
        x:340, y:250, type:'market',
        desc:'Thị trường nhỏ dưới sơn môn Bạch Vân.' },
      // Secret zone — Băng Đông — Ẩn Tu Băng tier 2
      { id:'bang_dong_bi_canh', name:'Băng Động Bí Cảnh', emoji:'🧊',
        x:200, y:295, type:'secret_gather',
        requireSecret:'bang_dong_bi_canh',
        desc:'Động băng giá ẩn sau rừng già. Nguyên liệu băng hệ hiếm. Cooldown 30 ngày thực.' },
    ],
  },

  // ─── TUYẾT LINH CUNG — Chính Đạo ───────────────────────────────────────
  tuyet_linh: {
    bg: 'linear-gradient(160deg,#080a28 0%,#0c1240 50%,#050820 100%)',
    locations: [
      { id:'tl_sect_gate', name:'Tuyết Linh Cung Môn', emoji:'🏯',
        x:200, y:120, type:'sect_gate', sectId:'tuyet_linh',
        desc:'Cổng môn Tuyết Linh Cung nữ tu. Băng khí lạnh buốt xương.',
        requireSect:'tuyet_linh', lockedMsg:'Chỉ đệ tử Tuyết Linh mới được vào.' },
      { id:'tl_linh_duoc_coc', name:'Linh Dược Cốc', emoji:'🌿',
        x:340, y:130, type:'gather_zone',
        desc:'Thung lũng thảo dược quý. Thu thập nguyên liệu tốt nhất vùng này.' },
      { id:'tl_tieu_dan_phong', name:'Tiểu Đan Phòng', emoji:'💊',
        x:200, y:245, type:'alchemy',
        desc:'Lò đan nhỏ công cộng. Ai cũng có thể luyện đan.' },
      { id:'tl_hunt', name:'Rừng Thâm Cốc', emoji:'⚔',
        x:120, y:235, type:'hunt_zone',
        desc:'Rừng thâm sâu quanh Tuyết Linh. Yêu thú băng và thủy hệ.' },
      { id:'tl_market', name:'Chợ Linh Dược', emoji:'🏮',
        x:340, y:250, type:'market',
        desc:'Chợ thảo dược nhỏ gần Tuyết Linh Cung.' },
      // Secret zone — Linh Ngư Đầm — Lão Ngư Ông tier 2
      { id:'linh_ngu_dam_lam_hai', name:'Linh Ngư Đầm', emoji:'🐟',
        x:200, y:300, type:'secret_gather',
        requireSecret:'linh_ngu_dam_lam_hai',
        desc:'Đầm linh ngư ẩn sâu. Nguyên liệu thủy hệ hiếm. Cooldown 30 ngày thực.' },
    ],
  },

  // ─── VẠN LINH HỘI — Trung Lập ──────────────────────────────────────────
  van_linh_hoi: {
    bg: 'linear-gradient(160deg,#1a1000 0%,#2a1a00 50%,#1a1200 100%)',
    locations: [
      { id:'vlh_sect_gate', name:'Vạn Linh Hội Đường', emoji:'🏯',
        x:200, y:120, type:'sect_gate', sectId:'dan_tong',
        desc:'Tổng đường Vạn Linh Hội. Thương mại và ngoại giao trung lập.',
        requireSect:'dan_tong', lockedMsg:'Chỉ thành viên Vạn Linh Hội mới được vào.' },
      { id:'vlh_dai_phuong_thi', name:'Đại Phường Thị', emoji:'🏮',
        x:340, y:140, type:'market',
        desc:'Chợ lớn nhất Khuyết Vực. Mua bán mọi thứ cả hai phe.' },
      { id:'vlh_dau_gia', name:'Đấu Giá Trường', emoji:'💰',
        x:200, y:245, type:'auction', requireRealm:1,
        desc:'Đấu giá vật phẩm hiếm. Cần Trúc Cơ+.' },
      { id:'vlh_hunt', name:'Vùng Săn Bắt', emoji:'⚔',
        x:120, y:240, type:'hunt_zone',
        desc:'Khu vực ngoại vi Vạn Linh Hội. Yêu thú nhiều loại hệ.' },
      { id:'vlh_freelance', name:'Hội Thương Nhân', emoji:'🔨',
        x:340, y:255, type:'freelance_quest',
        desc:'Tán tu nhận nhiệm vụ du hiệp. Không cần tông môn.' },
    ],
  },

  // ─── HUYỀN PHÙ ĐƯỜNG — Trung Lập ───────────────────────────────────────
  huyen_phu_duong: {
    bg: 'linear-gradient(160deg,#0f100a 0%,#1a1c10 50%,#0c0d08 100%)',
    locations: [
      { id:'hpd_sect_gate', name:'Huyền Phù Đường Môn', emoji:'🏯',
        x:200, y:120, type:'sect_gate', sectId:'tran_phap',
        desc:'Tổng đường Huyền Phù. Phù văn khắc đầy tường cổng.',
        requireSect:'tran_phap', lockedMsg:'Chỉ đệ tử Huyền Phù Đường mới được vào.' },
      { id:'hpd_phu_vien', name:'Phù Viện Công Cộng', emoji:'🔮',
        x:340, y:130, type:'alchemy',
        desc:'Xưởng phù chú công cộng. Học và luyện phù tại đây.' },
      { id:'hpd_hunt', name:'Cổ Lâm Huyền Ảo', emoji:'⚔',
        x:120, y:240, type:'hunt_zone',
        desc:'Rừng già huyền ảo xung quanh Huyền Phù Đường. Yêu thú đặc biệt.' },
      { id:'hpd_market', name:'Chợ Phù Lục', emoji:'🏮',
        x:340, y:250, type:'market',
        desc:'Chợ phù lục trung lập. Bán cho cả Chính lẫn Ma đạo.' },
      { id:'hpd_npc_phu_su', name:'Phù Sư Lão Nhân', emoji:'🧙',
        x:200, y:270, type:'npc', npcId:'phu_su_lao_nhan',
        desc:'Phù sư ẩn cư hàng trăm năm. Thông thạo phù chú thượng cổ.' },
      // Secret zone — Cổ Lò Phế Tích — Đao Khách Già tier 2
      { id:'co_lo_phe_tich_hoa_diem', name:'Cổ Lò Phế Tích', emoji:'🔨',
        x:200, y:310, type:'secret_gather',
        requireSecret:'co_lo_phe_tich_hoa_diem',
        desc:'Phế tích lò rèn cổ đại. Nguyên liệu rèn quý. Cooldown 30 ngày thực.' },
    ],
  },

  // ─── ĐỘC PHONG LĨNH — Ma Đạo ────────────────────────────────────────────
  doc_phong_linh: {
    bg: 'linear-gradient(160deg,#050f00 0%,#0a1a00 50%,#030800 100%)',
    locations: [
      { id:'dpl_sect_gate', name:'Độc Phong Lĩnh Môn', emoji:'🏯',
        x:200, y:120, type:'sect_gate', sectId:'doc_phong',
        desc:'Cổng Ma Tông dãy núi độc. Khí độc lan ra xung quanh.',
        requireSect:'doc_phong', lockedMsg:'Chỉ đệ tử Độc Phong Lĩnh mới vào được.' },
      { id:'dpl_dia_phu_nhap_khau', name:'Địa Phủ Nhập Khẩu', emoji:'☠',
        x:340, y:135, type:'dungeon',
        desc:'Cửa vào Thiên Ma Địa Phủ. 10 tầng nguy hiểm.' },
      { id:'dpl_hunt', name:'Dãy Núi Độc', emoji:'⚔',
        x:120, y:240, type:'hunt_zone',
        desc:'Dãy núi ngập khí độc. Chỉ ma tu và linh thú độc tồn tại được.' },
      { id:'dpl_am_hon_pho', name:'Âm Hồn Phố', emoji:'👻',
        x:340, y:255, type:'ghost_market',
        desc:'Hồn ma bán vật phẩm kỳ lạ không nơi nào có.' },
      { id:'dpl_npc_canh_binh', name:'Canh Binh Địa Phủ', emoji:'💀',
        x:200, y:270, type:'npc', npcId:'canh_binh_dia_phu',
        desc:'Binh sĩ trông coi cổng Địa Phủ. Lạnh lùng không thể mua chuộc.' },
    ],
  },
};

/** Tên vùng trên bản đồ thế giới (tier 1) — có thể xuống 2 dòng */
export function svgWorldNodeName(name, x, yBase, opts = {}) {
  const fill = opts.fill || '#bbb';
  const fs = opts.fontSize ?? 9.5;
  const weight = opts.fontWeight || 'normal';
  const maxOneLine = opts.maxOneLine ?? 11;
  const n = String(name).trim();
  if (n.length <= maxOneLine) {
    return (
      '<text x="' + x + '" y="' + yBase + '" text-anchor="middle" font-size="' + fs + '"' +
      ' fill="' + fill + '" font-weight="' + weight + '">' + _escapeSvgText(n) + '</text>'
    );
  }
  const mid = Math.floor(n.length / 2);
  let split = n.lastIndexOf(' ', mid + 2);
  if (split <= 0) split = mid;
  const l1 = n.slice(0, split).trim();
  const l2 = n.slice(split).trim();
  return (
    '<text x="' + x + '" y="' + (yBase - 5) + '" text-anchor="middle" font-size="' + (fs - 0.5) + '"' +
    ' fill="' + fill + '" font-weight="' + weight + '">' + _escapeSvgText(l1) + '</text>' +
    '<text x="' + x + '" y="' + (yBase + 6) + '" text-anchor="middle" font-size="' + (fs - 0.5) + '"' +
    ' fill="' + fill + '" font-weight="' + weight + '">' + _escapeSvgText(l2) + '</text>'
  );
}
