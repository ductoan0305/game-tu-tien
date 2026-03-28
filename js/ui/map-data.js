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