// ============================================================
// quest/quest-data.js — Quest definitions
// v3 — S-D: NPC-gated quest system (Manifesto §6)
//      Quest chỉ xuất hiện khi được NPC giao.
//      Thêm trường: givenBy, giveCondition, unlocks
// ============================================================

// ============================================================
// NPC QUESTS — 5 quest LK đầu tiên, có người giao cụ thể
// Đây là quest duy nhất hiển thị cho tân thủ trong tab Nhiệm Vụ.
// Không ai giao → không ai thấy.
// ============================================================
export const NPC_QUESTS = [
  {
    id: 'nq_01_clear_vermin',
    name: 'Trừ Họa Cho Thôn',
    type: 'npc_quest',
    givenBy: 'lao_duoc_su',          // NPC id trong STARTER_VILLAGES[*].locations
    givenByName: 'Lão Dược Sư',
    givenByVillage: 'thanh_phong_thon',
    // Điều kiện để NPC chịu giao quest (kiểm tra tại giveQuestFromNPC)
    giveCondition: (G) => G.setupDone && G.realmIdx === 0 && G.stage >= 1,
    desc: 'Lão Dược Sư bảo: Yêu thú dạo gần đây thường xuyên quấy phá vườn thuốc. Ta không còn sức để xua chúng — ngươi còn trẻ, hãy ra tay giúp thôn.',
    objectives: [{ key: 'kill', label: 'Diệt yêu thú', required: 3 }],
    rewards: {
      // Không phải "mưa tài nguyên" — lão nhân trả bằng thứ ông có
      items: [{ id: 'linh_thao', qty: 2 }],   // linh thảo tự trồng, không phải linh thạch
      exp: 40,
      // Mở ra quan hệ và thông tin, không phải vật phẩm
      unlocks: 'Lão Dược Sư tin tưởng ngươi hơn — có thể hỏi ông về bí quyết thu thảo dược.'
    },
    lore: '"Yêu thú nhỏ cũng đủ dẫm nát cả vườn Linh Thảo. Ta trồng mấy khóm đó ba năm rồi. Ngươi giúp ta được không?"',
    // Quest tiếp theo NPC này có thể giao (sau khi quest này hoàn thành)
    nextQuest: 'nq_02_herb_knowledge',
    order: 1,
  },

  {
    id: 'nq_02_herb_knowledge',
    name: 'Học Nhận Linh Thảo',
    type: 'npc_quest',
    givenBy: 'lao_duoc_su',
    givenByName: 'Lão Dược Sư',
    givenByVillage: 'thanh_phong_thon',
    giveCondition: (G) =>
      G.setupDone &&
      G.quests?.completed?.includes('nq_01_clear_vermin'),
    desc: 'Lão Dược Sư muốn truyền lại kiến thức phân biệt linh thảo thật và giả cho ngươi — nhưng trước hết phải chứng tỏ bằng cách tự tay thu thập.',
    objectives: [{ key: 'gather', label: 'Thu thập thảo dược', required: 5 }],
    rewards: {
      // Phần thưởng là kiến thức và mở đường, không phải linh thạch
      recipe: 'healing_pill',
      exp: 60,
      unlocks: 'Mở khóa khả năng luyện Hồi Khí Đan cơ bản — NPC đầu tiên dạy ngươi nghề luyện đan.'
    },
    lore: '"Thu thập không khó — khó là biết loại nào dùng được, loại nào độc. Đi lấy về năm cụm, ta nhìn xem ngươi có nhận đúng không."',
    nextQuest: null,  // kết thúc chain Lão Dược Sư tạm thời
    order: 2,
  },

  {
    id: 'nq_03_patrol_duty',
    name: 'Tuần Tra Đêm',
    type: 'npc_quest',
    givenBy: 'lao_ngu_ong',
    givenByName: 'Lão Ngư Ông',
    givenByVillage: 'lam_hai_thon',
    giveCondition: (G) => G.setupDone && G.realmIdx === 0 && G.stage >= 1,
    desc: 'Lão Ngư Ông nói: Đêm qua có tiếng động lạ ven sông. Mấy con Thủy Trạch Ngạc hay kéo lên bờ về đêm phá lưới. Ta già rồi không đi được — nhờ ngươi đi kiểm tra một chuyến.',
    objectives: [{ key: 'kill_specific', target: 'water_croc', label: 'Diệt Thủy Trạch Ngạc', required: 2 }],
    rewards: {
      items: [{ id: 'linh_ngu', qty: 1 }],  // cá linh — ngư ông trả bằng cá ông đánh được
      stone: 4,
      exp: 45,
      unlocks: 'Lão Ngư Ông chỉ cho ngươi bãi cá linh bí mật ven sông — tăng tỷ lệ thu thập Thủy Ngọc Hoa.'
    },
    lore: '"Ta đánh cá ở đây bốn mươi năm. Con sông này nuôi cả thôn. Không thể để yêu thú phá lưới ta mãi được."',
    nextQuest: 'nq_04_river_secret',
    order: 1,
  },

  {
    id: 'nq_04_river_secret',
    name: 'Bí Mật Đáy Sông',
    type: 'npc_quest',
    givenBy: 'lao_ngu_ong',
    givenByName: 'Lão Ngư Ông',
    givenByVillage: 'lam_hai_thon',
    giveCondition: (G) =>
      G.setupDone &&
      G.quests?.completed?.includes('nq_03_patrol_duty'),
    desc: 'Lão Ngư Ông kéo ngươi ra chỗ vắng, nói nhỏ: Tháng trước lưới ta kéo lên được một thứ kỳ lạ — một phiến đá có linh khí. Ta giữ không dùng được, ngươi tu tiên thì mang đi. Nhưng trước hết hãy giúp ta một việc.',
    objectives: [{ key: 'explore', label: 'Thám hiểm khu vực', required: 3 }],
    rewards: {
      items: [{ id: 'linh_thach_phien', qty: 1 }],  // phiến đá linh — có lore, không phải linh thạch thường
      exp: 80,
      unlocks: 'Lão Ngư Ông kể cho ngươi nghe về một hang nước cổ dưới đáy sông — chưa ai biết ngoài ông.'
    },
    lore: '"Cái đá này... nó ấm trong tay ta cả tuần. Ngươi tu tiên chắc hiểu được nó hơn lão ngư ông già này."',
    nextQuest: null,
    order: 2,
  },

  {
    id: 'nq_05_forge_test',
    name: 'Thử Lửa',
    type: 'npc_quest',
    givenBy: 'dao_khach_gia',
    givenByName: 'Đao Khách Già',
    givenByVillage: 'hoa_diem_thon',
    giveCondition: (G) => G.setupDone && G.realmIdx === 0 && G.stage >= 1,
    desc: 'Đao Khách Già nhìn ngươi từ đầu đến chân, gật đầu: Ta đã thấy quá nhiều kẻ vào rừng chưa đánh đã run. Ngươi muốn ta nói chuyện thật thì phải chứng minh trước — diệt năm con yêu thú rồi quay lại.',
    objectives: [{ key: 'kill', label: 'Diệt yêu thú', required: 5 }],
    rewards: {
      // Phần thưởng là lời khuyên chiến đấu và mối quan hệ — không phải tài nguyên
      exp: 55,
      stone: 5,
      unlocks: 'Đao Khách Già chỉ ngươi điểm yếu của yêu thú hệ Hỏa — tăng damage khi chiến đấu trong vùng núi lửa.'
    },
    lore: '"Ta không dạy kẻ yếu đuối. Không phải vì ta khinh — mà vì dạy kẻ chưa sẵn sàng chỉ tổ hại họ thêm."',
    nextQuest: null,
    order: 1,
  },

  // ============================================================
  // GIAI ĐOẠN 2 — LK3-LK8: NPC Quest mới (dead zone content)
  // Nguyên tắc: mỗi quest mở ra quan hệ/thông tin/cơ hội có bối cảnh
  // KHÔNG phải reward tài nguyên — phần thưởng là lore và mối quan hệ
  // ============================================================

  // ---- Lão Dược Sư chain 3 (LK4+) ----
  {
    id: 'nq_06_poison_antidote',
    name: 'Giải Độc Cho Thôn',
    type: 'npc_quest',
    givenBy: 'lao_duoc_su',
    givenByName: 'Lão Dược Sư',
    givenByVillage: 'thanh_phong_thon',
    giveCondition: (G) =>
      G.setupDone &&
      G.realmIdx === 0 && G.stage >= 4 &&
      G.quests?.completed?.includes('nq_02_herb_knowledge'),
    desc: 'Lão Dược Sư trông lo lắng: Có mấy đứa trẻ trong thôn bị trúng độc từ quả rừng lạ. Ta biết thuốc giải nhưng cần Huyết Sâm Lục Diệp — chỉ mọc sâu trong vùng nguy hiểm. Ngươi đã đủ mạnh, có thể thay ta vào không?',
    objectives: [{ key: 'gather_specific', target: 'blood_ginseng', label: 'Thu Huyết Sâm Lục Diệp', required: 3 }],
    rewards: {
      exp: 120,
      items: [{ id: 'linh_ngu', qty: 1 }],
      unlocks: 'Lão Dược Sư truyền cho ngươi bài thuốc giải độc cổ phương — mở ra kiến thức về Độc Đan.'
    },
    lore: '"Ba đứa trẻ nằm sốt cả tuần rồi. Thuốc thường không tác dụng gì. Ngươi đi được không?"',
    nextQuest: 'nq_07_elder_regret',
    order: 3,
  },

  {
    id: 'nq_07_elder_regret',
    name: 'Tâm Sự Của Lão Nhân',
    type: 'npc_quest',
    givenBy: 'lao_duoc_su',
    givenByName: 'Lão Dược Sư',
    givenByVillage: 'thanh_phong_thon',
    giveCondition: (G) =>
      G.setupDone &&
      G.realmIdx === 0 && G.stage >= 5 &&
      G.quests?.completed?.includes('nq_06_poison_antidote'),
    desc: 'Lão Dược Sư ngồi trước cửa nhìn trời, gọi ngươi lại: Ta trẻ cũng từng muốn tu tiên như ngươi. Nhưng tuổi tác... Hôm nay ta nhờ ngươi một việc cuối — tìm lại thứ ta bỏ dở.',
    objectives: [{ key: 'explore', label: 'Thám hiểm tìm di vật', required: 5 }],
    rewards: {
      exp: 200,
      unlocks: 'Lão Dược Sư trao cho ngươi cuốn nhật ký tu tiên của ông — bên trong có ghi lại những bài học đắt giá về sự thất bại.',
      chronicle: 'Tuổi {year}: Lão Dược Sư kể về tuổi trẻ bỏ lỡ — một lời nhắc nhở về cửa sổ vàng của tu tiên.'
    },
    lore: '"Ta tu đến LK3 thì bỏ cuộc. Nghĩ rằng thôn cần ta hơn. Bây giờ nhìn lại... không biết mình chọn đúng hay sai."',
    nextQuest: null,
    order: 4,
  },

  // ---- Lão Ngư Ông chain 3 (LK5+) ----
  {
    id: 'nq_08_river_guardian',
    name: 'Hộ Thần Dòng Sông',
    type: 'npc_quest',
    givenBy: 'lao_ngu_ong',
    givenByName: 'Lão Ngư Ông',
    givenByVillage: 'lam_hai_thon',
    giveCondition: (G) =>
      G.setupDone &&
      G.realmIdx === 0 && G.stage >= 5 &&
      G.quests?.completed?.includes('nq_04_river_secret'),
    desc: 'Lão Ngư Ông nói thầm: Sông này có một con linh vật canh giữ từ ngàn năm trước. Nó đang yếu — yêu thú từ hạ lưu lợi dụng kéo lên quấy phá. Nếu linh vật chết, cả dòng sông này sẽ khô cạn dần.',
    objectives: [{ key: 'kill_specific', target: 'water_croc', label: 'Diệt Thủy Kỳ Xâm Lấn', required: 5 }],
    rewards: {
      exp: 180,
      stone: 8,
      unlocks: 'Hộ Thần Sông ban phước — khu vực ven sông giờ có linh khí đặc biệt, tỷ lệ câu được linh ngư tăng.'
    },
    lore: '"Con linh vật đó già lắm rồi. Nó không chiến đấu được nữa. Ngươi giúp nó một lần thôi."',
    nextQuest: 'nq_09_fishmans_last_lesson',
    order: 3,
  },

  {
    id: 'nq_09_fishmans_last_lesson',
    name: 'Bài Học Cuối Của Ngư Ông',
    type: 'npc_quest',
    givenBy: 'lao_ngu_ong',
    givenByName: 'Lão Ngư Ông',
    givenByVillage: 'lam_hai_thon',
    giveCondition: (G) =>
      G.setupDone &&
      G.realmIdx === 0 && G.stage >= 7 &&
      G.quests?.completed?.includes('nq_08_river_guardian'),
    desc: 'Lão Ngư Ông bây giờ đi chậm hơn, tay run. Ông gọi ngươi đến: Ta dạy ngươi câu cá từ thuở ngươi còn bé. Hôm nay ta chỉ ngươi thứ ta biết về nước — về dòng chảy, về thời cơ. Nghe một lần, nhớ cả đời.',
    objectives: [{ key: 'fish', label: 'Câu cá (luyện tập cuối)', required: 5 }],
    rewards: {
      exp: 300,
      unlocks: 'Kỹ năng "Ngư Ông Tâm Pháp" — quan sát dòng chảy linh khí tốt hơn, tăng nhận thức khi bế quan.',
      chronicle: 'Tuổi {year}: Lão Ngư Ông truyền tâm pháp cuối — về dòng chảy, về chờ đúng thời.'
    },
    lore: '"Sông không vội mà vẫn đến biển. Ngươi đang vội quá — cứ sợ hết thời gian. Nước biết đợi, ngươi phải học đợi."',
    nextQuest: null,
    order: 4,
  },

  // ---- Bà Già Trồng Trọt (NPC mới, LK5-LK7) ----
  {
    id: 'nq_10_baguyen_seeds',
    name: 'Hạt Giống Linh',
    type: 'npc_quest',
    givenBy: 'ba_nguyen',
    givenByName: 'Bà Nguyên Trồng Trọt',
    givenByVillage: 'thanh_phong_thon',
    giveCondition: (G) =>
      G.setupDone &&
      G.realmIdx === 0 && G.stage >= 5,
    desc: 'Bà Nguyên — người trồng thuốc đã bảy mươi tuổi trong thôn — kéo tay ngươi: Ta có mấy hạt giống linh quý lắm, nhưng cần người ra vùng hoang tìm đất linh khí để gieo. Ngươi còn trẻ, còn đi được.',
    objectives: [{ key: 'explore', label: 'Thám hiểm tìm đất linh', required: 4 }],
    rewards: {
      exp: 150,
      items: [{ id: 'spirit_herb', qty: 5 }],
      unlocks: 'Bà Nguyên dạy ngươi kỹ thuật phân biệt đất linh thổ — hữu dụng khi mở Dược Điền.'
    },
    lore: '"Bảy mươi năm trồng trọt. Mỗi mùa thu hoạch tôi đều nhớ ơn đất. Đất tốt thì cây sống, đất xấu thì cây héo — tu tiên cũng vậy thôi."',
    nextQuest: 'nq_11_baguyen_confession',
    order: 1,
  },

  {
    id: 'nq_11_baguyen_confession',
    name: 'Lời Tâm Sự Của Bà',
    type: 'npc_quest',
    givenBy: 'ba_nguyen',
    givenByName: 'Bà Nguyên Trồng Trọt',
    givenByVillage: 'thanh_phong_thon',
    giveCondition: (G) =>
      G.setupDone &&
      G.realmIdx === 0 && G.stage >= 7 &&
      G.quests?.completed?.includes('nq_10_baguyen_seeds'),
    desc: 'Bà Nguyên ngồi nhổ cỏ, không nhìn ngươi: Tôi có đứa cháu cũng tu tiên, mất tích ba năm trước. Nếu ngươi đi thám hiểm gặp... cho tôi biết tin. Tôi chỉ cần biết nó còn sống.',
    objectives: [{ key: 'explore', label: 'Thám hiểm tìm tung tích', required: 8 }],
    rewards: {
      exp: 400,
      unlocks: 'Không tìm được tin tức — nhưng hành trình đó khiến ngươi hiểu rõ hơn sự cô đơn của tu tiên.',
      chronicle: 'Tuổi {year}: Tìm kiếm cháu Bà Nguyên — vô kết quả. Lần đầu thấy rõ cái giá của việc rời xa thôn làng.'
    },
    lore: '"Không cần ngươi tìm được. Chỉ cần biết có người đang tìm... là tôi yên tâm hơn rồi."',
    nextQuest: null,
    order: 2,
  },

];

// Map nhanh: npcId → danh sách quest có thể giao (theo thứ tự)
export const NPC_QUEST_MAP = NPC_QUESTS.reduce((acc, q) => {
  if (!acc[q.givenBy]) acc[q.givenBy] = [];
  acc[q.givenBy].push(q);
  return acc;
}, {});

// ============================================================
// QUESTS — hệ thống cũ, GIỮ NGUYÊN (không xóa)
// Các quest này hiện KHÔNG hiển thị trong tab trừ khi
// được giao qua NPC (story quest) hoặc là daily/bounty/sect.
// ============================================================
export const QUESTS = [

  // ============================================================
  // STORY QUESTS — chain chính, theo thứ tự
  // ============================================================
  {
    id: 'sq_00_meet_elder',
    name: 'Gặp Gỡ Trưởng Lão',
    type: 'story', chain: 'main', order: 0,
    desc: 'Đến gặp Trưởng Lão tại làng để nghe lời chỉ dẫn ban đầu.',
    unlockRealm: 0,
    autoAccept: true,
    objectives: [{ key: 'talk_npc', target: 'elder', label: 'Nói chuyện Trưởng Lão', required: 1 }],
    rewards: { unlockQuest: 'sq_01_first_kill' },
    lore: '"Ngươi đã đến rồi. Ta chờ đã lâu. Trước tiên, hãy để ta nói cho ngươi nghe về con đường phía trước."',
    npcHint: '👴 Trưởng Lão đang đứng ở trung tâm làng. Hãy đến nói chuyện để bắt đầu hành trình.',
  },
  {
    id: 'sq_01_first_kill',
    name: 'Bước Đầu Trên Đường Tu',
    type: 'story', chain: 'main', order: 1,
    desc: 'Trưởng Lão dặn: Diệt con yêu thú đầu tiên ở khu vực ngoại ô để rèn giũa bản thân.',
    unlockRealm: 0,
    objectives: [{ key: 'kill', label: 'Diệt yêu thú', required: 1 }],
    rewards: { stone: 6, exp: 30, unlockQuest: 'sq_02_gather_herb' },
    lore: 'Mỗi cao nhân đều có lần đầu tiên — đây là bước đầu của ngươi.',
    npcHint: '🌲 Vào 🗺 Bản Đồ → Rừng Ven Thôn → Săn Thú để tìm yêu thú đầu tiên.',
  },
  {
    id: 'sq_02_gather_herb',
    name: 'Linh Thảo Tiên Phương',
    type: 'story', chain: 'main', order: 2,
    desc: 'Thu thập linh thảo để luyện đan cơ bản.',
    unlockRealm: 0,
    objectives: [{ key: 'gather', label: 'Thu thập nguyên liệu', required: 3 }],
    rewards: { stone: 10, exp: 40, recipe: 'healing_pill', unlockQuest: 'sq_03_first_pill' },
    lore: 'Đan sư nói: không có linh thảo, không có đan dược.',
  },
  {
    id: 'sq_03_first_pill',
    name: 'Sơ Nhập Đan Đạo',
    type: 'story', chain: 'main', order: 3,
    desc: 'Luyện thành viên đan đầu tiên.',
    unlockRealm: 0,
    objectives: [{ key: 'alchemy', label: 'Luyện đan thành công', required: 1 }],
    rewards: { stone: 12, exp: 60, unlockQuest: 'sq_04_breakthrough' },
    lore: 'Khi lửa đan bùng cháy lần đầu, ngươi biết đây là con đường của mình.',
  },
  {
    id: 'sq_04_breakthrough',
    name: 'Vượt Cảnh Giới',
    type: 'story', chain: 'main', order: 4,
    desc: 'Đột phá lần đầu tiên.',
    unlockRealm: 0,
    objectives: [{ key: 'breakthrough', label: 'Đột phá cảnh giới', required: 1 }],
    rewards: { stone: 18, exp: 80, recipe: 'cultivate_pill', unlockQuest: 'sq_05_truc_co' },
    lore: 'Mỗi lần đột phá là một lần chết đi sống lại.',
  },
  {
    id: 'sq_05_truc_co',
    name: 'Trúc Cơ Thành Tựu',
    type: 'story', chain: 'main', order: 5,
    desc: 'Đạt đến cảnh giới Trúc Cơ.',
    unlockRealm: 0,
    objectives: [{ key: 'reach_realm', target: 1, label: 'Đạt Trúc Cơ', required: 1 }],
    rewards: { stone: 100, exp: 800, recipe: 'strength_pill', unlockQuest: 'sq_06_defeat_general' },
    lore: 'Trúc Cơ viên mãn — ngươi chính thức trở thành tu sĩ thực thụ.',
  },
  {
    id: 'sq_06_defeat_general',
    name: 'Thảo Phạt Yêu Tướng',
    type: 'story', chain: 'main', order: 6,
    desc: 'Tiêu diệt Yêu Tướng Hắc Giáp — mối họa lớn nhất vùng này.',
    unlockRealm: 2,
    objectives: [{ key: 'kill_specific', target: 'demon_general', label: 'Diệt Yêu Tướng', required: 1 }],
    rewards: { stone: 150, exp: 2000, recipe: 'breakthrough_aid', unlockQuest: 'sq_07_nguyen_anh' },
    lore: 'Yêu Tướng Hắc Giáp đã tàn sát ngàn người tu. Đã đến lúc kết thúc.',
  },
  {
    id: 'sq_07_nguyen_anh',
    name: 'Nguyên Anh Xuất Thế',
    type: 'story', chain: 'main', order: 7,
    desc: 'Đột phá đến cảnh giới Nguyên Anh.',
    unlockRealm: 2,
    objectives: [{ key: 'reach_realm', target: 3, label: 'Đạt Nguyên Anh', required: 1 }],
    rewards: { stone: 300, exp: 5000, unlockQuest: 'sq_08_blood_bat' },
    lore: 'Nguyên Anh cất tiếng khóc chào đời — linh hồn và thể xác hợp nhất. Thiên địa rung chuyển.',
  },
  {
    id: 'sq_08_blood_bat',
    name: 'Huyết Dực Ô Vân',
    type: 'story', chain: 'main', order: 8,
    desc: 'Đàn Huyết Dực Ma Thú đang tàn phá vùng linh địa, hãy tiêu diệt 3 con.',
    unlockRealm: 3,
    objectives: [{ key: 'kill_specific', target: 'blood_bat', label: 'Diệt Huyết Dực Ma Thú', required: 3 }],
    rewards: { stone: 300, exp: 7000, unlockQuest: 'sq_09_hoa_than' },
    lore: 'Những đàn ma thú uống máu đe dọa cả khu linh địa.',
  },
  {
    id: 'sq_09_hoa_than',
    name: 'Hóa Thần Chi Cảnh',
    type: 'story', chain: 'main', order: 9,
    desc: 'Đột phá Hóa Thần — đỉnh cao của Nhân Giới.',
    unlockRealm: 3,
    objectives: [{ key: 'reach_realm', target: 4, label: 'Đạt Hóa Thần', required: 1 }],
    rewards: { stone: 500, exp: 12000, unlockQuest: 'sq_10_earth_dragon' },
    lore: 'Hóa Thần — khi tinh thần hóa thành thần, vũ trụ thu vào trong tâm.',
  },
  {
    id: 'sq_10_earth_dragon',
    name: 'Phục Long Chiến',
    type: 'story', chain: 'main', order: 10,
    desc: 'Địa Long Cổ Thần thức giấc, đánh bại nó để thu phục linh địa — hoàn thành hành trình Nhân Giới.',
    unlockRealm: 4,
    objectives: [{ key: 'kill_specific', target: 'earth_dragon', label: 'Đánh bại Địa Long', required: 1 }],
    rewards: { stone: 800, exp: 20000 },
    lore: 'Ngàn năm ngủ vùi trong lòng đất, Địa Long thức dậy trong cơn thịnh nộ. Đây là thử thách cuối cùng của Nhân Giới.',
  },

  // ============================================================
  // SIDE QUESTS
  // ============================================================
  {
    id: 'side_hunter_01',
    name: 'Liệp Yêu Sơ Học',
    type: 'side', category: 'combat',
    desc: 'Diệt 10 yêu thú.',
    unlockRealm: 0,
    objectives: [{ key: 'kill', label: 'Diệt yêu thú', required: 10 }],
    rewards: { stone: 30, exp: 200 },
    repeatable: false,
    lore: 'Tu sĩ không rèn kiếm ở trường đấu — họ rèn trong máu và lửa thực chiến.',
  },
  {
    id: 'side_hunter_02',
    name: 'Bách Yêu Thách Đấu',
    type: 'side', category: 'combat',
    desc: 'Diệt 100 yêu thú.',
    unlockRealm: 0,
    prereq: 'side_hunter_01',
    objectives: [{ key: 'kill', label: 'Diệt yêu thú', required: 100 }],
    rewards: { stone: 100, exp: 800, recipe: 'defense_pill' },
    repeatable: false,
    lore: 'Trăm trận thành thần. Mỗi trận chiến là một bài học.',
  },
  {
    id: 'side_hunter_03',
    name: 'Vạn Yêu Đồ Sát',
    type: 'side', category: 'combat',
    desc: 'Diệt 500 yêu thú — danh hiệu Đồ Yêu Giả.',
    unlockRealm: 1,
    prereq: 'side_hunter_02',
    objectives: [{ key: 'kill', label: 'Diệt yêu thú', required: 500 }],
    rewards: { stone: 300, exp: 3000, recipe: 'strength_pill' },
    repeatable: false,
    lore: 'Ngươi đã trở thành ác mộng của yêu tộc.',
  },
  {
    id: 'side_wolf_slayer',
    name: 'Trừ Sói Linh Sơn',
    type: 'side', category: 'combat',
    desc: 'Tiêu diệt 15 Yêu Sói Đen đang quấy phá Linh Sơn.',
    unlockRealm: 0,
    objectives: [{ key: 'kill_specific', target: 'demon_wolf', label: 'Diệt Yêu Sói Đen', required: 15 }],
    rewards: { stone: 60, exp: 400 },
    repeatable: false,
    lore: 'Bầy sói yêu dạo gần làng, tiều phu không dám vào rừng. Hãy giải quyết chúng.',
  },
  {
    id: 'side_ice_serpent',
    name: 'Băng Xà Hiểm Địa',
    type: 'side', category: 'combat',
    desc: 'Tiêu diệt 5 Băng Hàn Xà kiểm soát đường lên băng sơn.',
    unlockRealm: 1,
    objectives: [{ key: 'kill_specific', target: 'ice_serpent', label: 'Diệt Băng Hàn Xà', required: 5 }],
    rewards: { stone: 120, exp: 1200, recipe: 'han_bing_dan' },
    repeatable: false,
    lore: 'Đường lên băng sơn bị Băng Hàn Xà chiếm. Ai muốn qua phải trả bằng máu.',
  },
  {
    id: 'side_phantom_fox',
    name: 'Ảo Ảnh Hồ Truy Sát',
    type: 'side', category: 'combat',
    desc: 'Đánh bại 3 Ảo Ảnh Cửu Vĩ Hồ đang mê hoặc tu sĩ.',
    unlockRealm: 3,
    objectives: [{ key: 'kill_specific', target: 'phantom_fox', label: 'Diệt Ảo Ảnh Cửu Vĩ Hồ', required: 3 }],
    rewards: { stone: 400, exp: 6000 },
    repeatable: false,
    lore: 'Cửu Vĩ Hồ hóa hình thiếu nữ mê hoặc tu sĩ, nhiều người mất cả công lực.',
  },
  {
    id: 'side_alchemy_01',
    name: 'Đan Sư Sơ Cấp',
    type: 'side', category: 'alchemy',
    desc: 'Luyện đan thành công 5 lần.',
    unlockRealm: 0,
    objectives: [{ key: 'alchemy', label: 'Luyện đan thành công', required: 5 }],
    rewards: { stone: 40, exp: 300 },
    repeatable: false,
    lore: 'Năm lần thành công — đủ để gọi là có duyên với đan đạo.',
  },
  {
    id: 'side_alchemy_02',
    name: 'Đan Sư Trung Cấp',
    type: 'side', category: 'alchemy',
    desc: 'Luyện đan thành công 30 lần.',
    unlockRealm: 1,
    prereq: 'side_alchemy_01',
    objectives: [{ key: 'alchemy', label: 'Luyện đan thành công', required: 30 }],
    rewards: { stone: 120, exp: 1000, recipe: 'dan_dao_dan' },
    repeatable: false,
    lore: 'Ba mươi lần luyện — lò đan quen hơi tay ngươi rồi.',
  },
  {
    id: 'side_alchemy_03',
    name: 'Đại Đan Sư',
    type: 'side', category: 'alchemy',
    desc: 'Luyện đan thành công 100 lần — danh hiệu Đại Đan Sư.',
    unlockRealm: 2,
    prereq: 'side_alchemy_02',
    objectives: [{ key: 'alchemy', label: 'Luyện đan thành công', required: 100 }],
    rewards: { stone: 300, exp: 5000, recipe: 'zhen_qi_dan' },
    repeatable: false,
    lore: 'Trăm lần luyện đan — tên ngươi bắt đầu được nhắc đến trong giới đan sư.',
  },
  {
    id: 'side_explore_01',
    name: 'Khám Phá Bốn Phương',
    type: 'side', category: 'explore',
    desc: 'Thu thập nguyên liệu 20 lần.',
    unlockRealm: 0,
    objectives: [{ key: 'gather', label: 'Thu thập', required: 20 }],
    rewards: { stone: 60, exp: 400 },
    repeatable: false,
    lore: 'Kẻ không dám rời tông môn sẽ không bao giờ tìm thấy cơ duyên thực sự.',
  },
  {
    id: 'side_gather_lotus',
    name: 'Sen Linh Ngàn Hoa',
    type: 'side', category: 'explore',
    desc: 'Thu thập 10 Bạch Ngọc Liên từ các hồ sen linh.',
    unlockRealm: 0,
    objectives: [{ key: 'gather_specific', target: 'jade_lotus', label: 'Thu Bạch Ngọc Liên', required: 10 }],
    rewards: { stone: 80, exp: 500, recipe: 'shou_yuan_dan_1' },
    repeatable: false,
    lore: 'Hoa sen linh nở trong im lặng, ai biết nhẫn nại mới tìm thấy đủ.',
  },
  {
    id: 'side_break_05',
    name: 'Ngũ Đột Kỳ Nhân',
    type: 'side', category: 'cultivate',
    desc: 'Đột phá 5 lần.',
    unlockRealm: 0,
    objectives: [{ key: 'breakthrough', label: 'Đột phá', required: 5 }],
    rewards: { stone: 80, exp: 600 },
    repeatable: false,
    lore: 'Năm lần vượt ải — ý chí ngươi đã được thử thách đủ rồi.',
  },
  {
    id: 'side_dungeon_01',
    name: 'Địa Phủ Sơ Thám',
    type: 'side', category: 'dungeon',
    desc: 'Hoàn thành 5 tầng dungeon.',
    unlockRealm: 1,
    objectives: [{ key: 'dungeon_floor', label: 'Tầng dungeon', required: 5 }],
    rewards: { stone: 90, exp: 900 },
    repeatable: false,
    lore: 'Địa Phủ không phải nơi để thăm quan — nhưng phần thưởng thì xứng đáng.',
  },

  // ============================================================
  // SECT INTRO QUESTS
  // ============================================================
  {
    id: 'sq_sect_intro_kiem_tong',
    name: 'Nhập Môn Thanh Vân',
    type: 'story', chain: 'sect', order: 0,
    desc: 'Gặp Trưởng Lão Kiếm để nhận nhiệm vụ đầu tiên của môn phái.',
    unlockRealm: 0,
    objectives: [{ key: 'talk_npc', target: 'elder', label: 'Gặp Trưởng Lão Kiếm', required: 1 }],
    rewards: { stone: 10, exp: 80, unlockQuest: 'sq_01_first_kill' },
    lore: '"Ngươi đến rồi. Ta đã nghe tin về linh căn của ngươi. Thanh Vân Kiếm Tông chào đón ngươi."',
    npcHint: '🏯 Vào cổng tông môn → tìm Trưởng Lão Kiếm Lão để nhận nhiệm vụ đầu tiên.',
  },
  {
    id: 'sq_sect_intro_dan_tong',
    name: 'Nhập Môn Vạn Linh',
    type: 'story', chain: 'sect', order: 0,
    desc: 'Gặp Vạn Linh Đan Lão để nhận chỉ dẫn đầu tiên về đan đạo.',
    unlockRealm: 0,
    objectives: [{ key: 'talk_npc', target: 'elder', label: 'Gặp Đan Lão', required: 1 }],
    rewards: { stone: 10, exp: 80, unlockQuest: 'sq_01_first_kill' },
    lore: '"Lửa đan sẽ phán xét ngươi. Trước tiên, hãy để ta xem tay ngươi có mang mùi thảo dược không."',
    npcHint: '⚗ Vào cổng Vạn Linh Đan Tông → tìm Vạn Linh Đan Lão để bắt đầu.',
  },
  {
    id: 'sq_sect_intro_tran_phap',
    name: 'Nhập Môn Huyền Cơ',
    type: 'story', chain: 'sect', order: 0,
    desc: 'Tìm Huyền Cơ Trận Lão tại Huyền Cơ Các để được chỉ dạy những điều cơ bản về trận pháp.',
    unlockRealm: 0,
    objectives: [{ key: 'talk_npc', target: 'elder', label: 'Gặp Trận Lão', required: 1 }],
    rewards: { stone: 10, exp: 80, unlockQuest: 'sq_01_first_kill' },
    lore: '"Trận pháp không có bắt đầu và kết thúc. Chỉ có quy tắc. Ngươi đã sẵn sàng học chưa?"',
    npcHint: '🔮 Vào cổng Huyền Cơ Các → tìm Huyền Cơ Trận Lão để nhận nhiệm vụ đầu tiên.',
  },
  {
    id: 'sq_sect_intro_the_tu',
    name: 'Nhập Môn Thiết Cốt',
    type: 'story', chain: 'sect', order: 0,
    desc: 'Ra mắt Thiết Cốt Môn Lão — trưởng lão đầy quyền uy của Thiết Cốt Môn.',
    unlockRealm: 0,
    objectives: [{ key: 'talk_npc', target: 'elder', label: 'Gặp Môn Lão', required: 1 }],
    rewards: { stone: 10, exp: 80, unlockQuest: 'sq_01_first_kill' },
    lore: '"Thân thể yếu ớt thì linh lực cao cũng vô dụng. Thiết Cốt Môn không cần thiên tài — cần người dám chịu đau."',
    npcHint: '💪 Vào cổng Thiết Cốt Môn → tìm Thiết Cốt Môn Lão để bắt đầu hành trình.',
  },

  // ============================================================
  // DAILY QUESTS
  // ============================================================
  {
    id: 'daily_kill_3',
    name: '[Nhật Tu] Liệp Yêu',
    type: 'daily',
    desc: 'Diệt 3 yêu thú hôm nay.',
    unlockRealm: 0,
    objectives: [{ key: 'kill', label: 'Diệt yêu thú', required: 3 }],
    rewards: { stone: 20, exp: 120 },
  },
  {
    id: 'daily_kill_10',
    name: '[Nhật Tu] Thập Yêu Trảm',
    type: 'daily',
    desc: 'Diệt 10 yêu thú hôm nay.',
    unlockRealm: 1,
    objectives: [{ key: 'kill', label: 'Diệt yêu thú', required: 10 }],
    rewards: { stone: 40, exp: 300 },
  },
  {
    id: 'daily_alchemy_1',
    name: '[Nhật Tu] Luyện Đan',
    type: 'daily',
    desc: 'Luyện đan 1 lần thành công hôm nay.',
    unlockRealm: 1,
    objectives: [{ key: 'alchemy', label: 'Luyện đan', required: 1 }],
    rewards: { stone: 15, exp: 100 },
  },
  {
    id: 'daily_alchemy_3',
    name: '[Nhật Tu] Tam Đan Thành',
    type: 'daily',
    desc: 'Luyện đan thành công 3 lần hôm nay.',
    unlockRealm: 2,
    objectives: [{ key: 'alchemy', label: 'Luyện đan', required: 3 }],
    rewards: { stone: 36, exp: 280 },
  },
  {
    id: 'daily_gather_5',
    name: '[Nhật Tu] Thu Thảo',
    type: 'daily',
    desc: 'Thu thập nguyên liệu 5 lần hôm nay.',
    unlockRealm: 1,
    objectives: [{ key: 'gather', label: 'Thu thập', required: 5 }],
    rewards: { stone: 18, exp: 110 },
  },
  {
    id: 'daily_gather_10',
    name: '[Nhật Tu] Đại Thu Hoạch',
    type: 'daily',
    desc: 'Thu thập nguyên liệu 10 lần hôm nay.',
    unlockRealm: 2,
    objectives: [{ key: 'gather', label: 'Thu thập', required: 10 }],
    rewards: { stone: 30, exp: 220 },
  },
  {
    id: 'daily_meditate_10m',
    name: '[Nhật Tu] Bế Quan',
    type: 'daily',
    desc: 'Bế quan tu luyện tổng cộng 10 phút.',
    unlockRealm: 0,
    objectives: [{ key: 'meditate_time', label: 'Thời gian bế quan (giây)', required: 600 }],
    rewards: { stone: 25, exp: 150 },
  },
  {
    id: 'daily_meditate_30m',
    name: '[Nhật Tu] Thâm Nhập Thiền Định',
    type: 'daily',
    desc: 'Bế quan tu luyện tổng cộng 30 phút.',
    unlockRealm: 1,
    objectives: [{ key: 'meditate_time', label: 'Thời gian bế quan (giây)', required: 1800 }],
    rewards: { stone: 50, exp: 380 },
  },
  {
    id: 'daily_dungeon_1',
    name: '[Nhật Tu] Địa Phủ Tuần Tra',
    type: 'daily',
    desc: 'Hoàn thành 1 tầng dungeon hôm nay.',
    unlockRealm: 1,
    objectives: [{ key: 'dungeon_floor', label: 'Tầng dungeon', required: 1 }],
    rewards: { stone: 24, exp: 180 },
  },
  {
    id: 'daily_explore_3',
    name: '[Nhật Tu] Du Lịch Hành Cước',
    type: 'daily',
    desc: 'Khám phá/hành động 3 lần trong thế giới.',
    unlockRealm: 0,
    objectives: [{ key: 'explore', label: 'Khám phá', required: 3 }],
    rewards: { stone: 15, exp: 90 },
  },
  {
    id: 'daily_breakthrough',
    name: '[Nhật Tu] Đột Phá Tinh Tấn',
    type: 'daily',
    desc: 'Đột phá cảnh giới 1 lần hôm nay.',
    unlockRealm: 0,
    objectives: [{ key: 'breakthrough', label: 'Đột phá', required: 1 }],
    rewards: { stone: 60, exp: 500 },
  },

  // ============================================================
  // BOUNTY QUESTS
  // ============================================================
  {
    id: 'bounty_wolf_pack',
    name: '[Truy Sát] Bầy Sói Đêm',
    type: 'bounty',
    desc: 'Tiêu diệt 5 Yêu Sói Đen — truy nã cấp địa phương.',
    unlockRealm: 0,
    objectives: [{ key: 'kill_specific', target: 'demon_wolf', label: 'Diệt Yêu Sói Đen', required: 5 }],
    rewards: { stone: 50, exp: 350 },
    repeatable: true,
    cooldownHours: 24,
    lore: 'Thông báo truy nã: Bầy sói yêu 7 con quấy phá vùng ngoại ô. Ai diệt được thưởng nặng.',
  },
  {
    id: 'bounty_stone_golem',
    name: '[Truy Sát] Thổ Nguyên Cự Thạch',
    type: 'bounty',
    desc: 'Tiêu diệt 3 Thổ Nguyên Quỷ đang cản trở khai thác linh mạch.',
    unlockRealm: 0,
    objectives: [{ key: 'kill_specific', target: 'stone_golem', label: 'Diệt Thổ Nguyên Quỷ', required: 3 }],
    rewards: { stone: 60, exp: 400 },
    repeatable: true,
    cooldownHours: 24,
    lore: 'Linh mạch phía đông bị Thổ Nguyên Quỷ chiếm. Hội Thương Nhân trả tiền để dọn sạch.',
  },
  {
    id: 'bounty_fire_fox',
    name: '[Truy Sát] Hỏa Hồ Tác Quái',
    type: 'bounty',
    desc: 'Tiêu diệt 5 Hỏa Linh Hồ đốt cháy nhà dân.',
    unlockRealm: 0,
    objectives: [{ key: 'kill_specific', target: 'fire_fox', label: 'Diệt Hỏa Linh Hồ', required: 5 }],
    rewards: { stone: 70, exp: 450 },
    repeatable: true,
    cooldownHours: 24,
    lore: 'Đêm qua ba ngôi nhà bị thiêu rụi. Hồ linh phóng hỏa từ trong bóng tối.',
  },
  {
    id: 'bounty_thunder_hawk',
    name: '[Truy Sát] Lôi Ưng Không Phận',
    type: 'bounty',
    desc: 'Tiêu diệt 3 Lôi Ưng Quỷ đang kiểm soát bầu trời vùng này.',
    unlockRealm: 1,
    objectives: [{ key: 'kill_specific', target: 'thunder_hawk', label: 'Diệt Lôi Ưng Quỷ', required: 3 }],
    rewards: { stone: 90, exp: 900 },
    repeatable: true,
    cooldownHours: 48,
    lore: 'Đường hàng không bị phong tỏa. Không phi kiếm nào dám bay qua vùng đó.',
  },
  {
    id: 'bounty_ice_serpent',
    name: '[Truy Sát] Băng Xà Phong Lộ',
    type: 'bounty',
    desc: 'Tiêu diệt 2 Băng Hàn Xà phong tỏa tuyến đường linh dược.',
    unlockRealm: 1,
    objectives: [{ key: 'kill_specific', target: 'ice_serpent', label: 'Diệt Băng Hàn Xà', required: 2 }],
    rewards: { stone: 105, exp: 1000 },
    repeatable: true,
    cooldownHours: 48,
    lore: 'Tuyến đường vận chuyển linh dược từ băng sơn bị hai con Băng Hàn Xà chiếm đóng.',
  },
  {
    id: 'bounty_demon_general',
    name: '[Truy Sát] Thảo Phạt Yêu Tướng',
    type: 'bounty',
    desc: 'Tiêu diệt Yêu Tướng Hắc Giáp — kẻ thù số một vùng linh địa.',
    unlockRealm: 2,
    objectives: [{ key: 'kill_specific', target: 'demon_general', label: 'Diệt Yêu Tướng Hắc Giáp', required: 1 }],
    rewards: { stone: 300, exp: 3000 },
    repeatable: true,
    cooldownHours: 72,
    lore: 'Yêu Tướng Hắc Giáp tái xuất. Mỗi lần nó xuất hiện là một lần thảm họa.',
  },
  {
    id: 'bounty_jade_serpent',
    name: '[Truy Sát] Bích Ngọc Xà Linh',
    type: 'bounty',
    desc: 'Tiêu diệt 1 Bích Ngọc Thần Xà — linh vật nguy hiểm bậc nhất.',
    unlockRealm: 3,
    objectives: [{ key: 'kill_specific', target: 'jade_serpent', label: 'Diệt Bích Ngọc Thần Xà', required: 1 }],
    rewards: { stone: 400, exp: 6000 },
    repeatable: true,
    cooldownHours: 72,
    lore: 'Bích Ngọc Thần Xà xuất hiện mỗi trăm năm một lần. Ai diệt được sẽ trở thành huyền thoại.',
  },
  {
    id: 'bounty_phantom_fox_elite',
    name: '[Truy Sát] Ảo Ảnh Ma Hồ',
    type: 'bounty',
    desc: 'Tiêu diệt 2 Ảo Ảnh Cửu Vĩ Hồ đang thu thập linh lực người tu.',
    unlockRealm: 3,
    objectives: [{ key: 'kill_specific', target: 'phantom_fox', label: 'Diệt Ảo Ảnh Cửu Vĩ Hồ', required: 2 }],
    rewards: { stone: 500, exp: 7000 },
    repeatable: true,
    cooldownHours: 72,
    lore: 'Hai con Cửu Vĩ Hồ hóa thành thiếu nữ để dụ dỗ và hút cạn linh lực tu sĩ.',
  },

  // ============================================================
  // SECT QUESTS
  // ============================================================
  {
    id: 'sect_patrol_01',
    name: '[Tông Vụ] Tuần Tra Lãnh Thổ',
    type: 'sect',
    desc: 'Tuần tra lãnh thổ tông môn, diệt yêu thú xâm nhập.',
    unlockRealm: 0,
    requireSect: true,
    objectives: [{ key: 'kill', label: 'Diệt yêu thú xâm nhập', required: 5 }],
    rewards: { stone: 30, exp: 200, sectExp: 100 },
    repeatable: true,
    cooldownHours: 12,
    lore: 'Bảo vệ lãnh thổ là bổn phận của mỗi đệ tử.',
  },
  {
    id: 'sect_herb_collect',
    name: '[Tông Vụ] Thu Thảo Cung Cấp',
    type: 'sect',
    desc: 'Thu thập linh thảo cho kho dược của tông môn.',
    unlockRealm: 0,
    requireSect: true,
    objectives: [{ key: 'gather', label: 'Thu thập nguyên liệu', required: 8 }],
    rewards: { stone: 24, exp: 160, sectExp: 80 },
    repeatable: true,
    cooldownHours: 12,
    lore: 'Kho dược của tông môn luôn cần được bổ sung. Đây là việc không bao giờ hết.',
  },
  {
    id: 'sect_alchemy_supply',
    name: '[Tông Vụ] Cung Cấp Đan Dược',
    type: 'sect',
    desc: 'Luyện đan 3 lần để cung cấp cho tông môn.',
    unlockRealm: 1,
    requireSect: true,
    objectives: [{ key: 'alchemy', label: 'Luyện đan cho tông', required: 3 }],
    rewards: { stone: 60, exp: 400, sectExp: 200 },
    repeatable: true,
    cooldownHours: 24,
    lore: 'Đan dược luôn là tài nguyên quý. Tông môn không bao giờ từ chối đệ tử luyện đan.',
  },
  {
    id: 'sect_escort_mission',
    name: '[Tông Vụ] Hộ Tống Thương Đội',
    type: 'sect',
    desc: 'Hộ tống thương đội tông môn qua vùng nguy hiểm — tiêu diệt 10 yêu thú.',
    unlockRealm: 1,
    requireSect: true,
    objectives: [{ key: 'kill', label: 'Bảo vệ thương đội', required: 10 }],
    rewards: { stone: 80, exp: 600, sectExp: 300 },
    repeatable: true,
    cooldownHours: 24,
    lore: 'Thương đội mang hàng hóa quan trọng. Mất hàng là mất mặt tông môn.',
  },
  {
    id: 'sect_elite_hunt',
    name: '[Tông Vụ] Tiêu Diệt Yêu Thú Tinh Nhuệ',
    type: 'sect',
    desc: 'Tiêu diệt yêu thú mạnh đang đe dọa vùng linh địa tông môn.',
    unlockRealm: 2,
    requireSect: true,
    objectives: [{ key: 'kill_tier', minTier: 4, label: 'Diệt yêu thú mạnh', required: 3 }],
    rewards: { stone: 120, exp: 1200, sectExp: 500 },
    repeatable: true,
    cooldownHours: 48,
    lore: 'Chỉ có đệ tử xuất sắc mới được giao nhiệm vụ loại này.',
  },
];

// ---- Export helpers ----
export const DAILY_QUEST_IDS = QUESTS
  .filter(q => q.type === 'daily')
  .map(q => q.id);

export const STORY_QUEST_IDS = QUESTS
  .filter(q => q.type === 'story')
  .map(q => q.id);

export const BOUNTY_QUEST_IDS = QUESTS
  .filter(q => q.type === 'bounty')
  .map(q => q.id);

export const SECT_QUEST_IDS = QUESTS
  .filter(q => q.type === 'sect')
  .map(q => q.id);
