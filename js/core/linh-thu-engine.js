// ============================================================
// core/linh-thu-engine.js — Hệ thống Linh Thú (靈獸)
// Tối đa 2 linh thú. Buff nhẹ (5-10%), đúng logic từng loài.
// ============================================================
import { bus } from '../utils/helpers.js';
import { addChronicle } from './time-engine.js';

// ============================================================
// DATA — 8 loại Linh Thú
// ============================================================
export const LINH_THU_DATA = {
  hoa_ho_ly: {
    id: 'hoa_ho_ly',
    name: 'Hỏa Hồ Ly',
    nameCN: '火狐狸',
    emoji: '🦊',
    element: 'hoa',        // hỏa hệ
    rarity: 'uncommon',
    desc: 'Hồ ly linh hỏa, lanh lợi và tinh ranh. Giỏi ảo thuật và tấn công bùng cháy.',
    // Buff: ATK +7%, crit chance +5% trong combat
    buffs: [
      { type: 'atk_pct',    value: 7,  label: 'ATK +7%' },
      { type: 'crit_pct',   value: 5,  label: 'Bạo kích +5%' },
    ],
    // Kỹ năng mở khi thân thiết 50
    skill50: { name: 'Hỏa Cầu', desc: 'Tấn công bổ trợ trong combat — 15% xác suất tạo thêm đòn hỏa' },
    // Kỹ năng mở khi thân thiết 100
    skill100: { name: 'Linh Hỏa Trận', desc: 'ATK +10% thay vì +7% khi thân thiết tối đa' },
    // Thức ăn ưa thích
    foodId: 'linh_thu_nhuc',
    // Điều kiện unlock khi mua ở shop
    shopUnlockRealm: 0,
    shopCost: 3000,
    // Xác suất gặp khi explore (base, nhân với node modifier)
    encounterRate: 0.04,
    encounterNodes: ['hac_phong_lam', 'an_long_dong'],
    // Thuần hóa: xác suất base khi gặp trực tiếp
    tameChance: 0.20,
    // Trứng: ấp bao nhiêu ngày
    eggDays: 4,
  },

  thanh_long_tu: {
    id: 'thanh_long_tu',
    name: 'Thanh Long Tử',
    nameCN: '青龍子',
    emoji: '🐉',
    element: 'moc',
    rarity: 'rare',
    desc: 'Long tử của Thanh Long mộc hệ. Linh khí sung mãn, thúc đẩy tu luyện.',
    buffs: [
      { type: 'rate_pct',     value: 8,  label: 'Tu tốc +8%' },
      { type: 'lifespan_pct', value: 5,  label: 'Thọ mạng +5%' },
    ],
    skill50:  { name: 'Linh Khí Quang Hoàn', desc: 'Purity tích lũy nhanh hơn +10% khi bế quan' },
    skill100: { name: 'Thanh Long Phù Hộ', desc: 'Tu tốc +10% thay vì +8%' },
    foodId: 'linh_thu_xuong',
    shopUnlockRealm: 1,
    shopCost: 15000,
    encounterRate: 0.015,
    encounterNodes: ['an_long_dong', 'thien_kiep_dia'],
    tameChance: 0.10,
    eggDays: 7,
  },

  linh_quy: {
    id: 'linh_quy',
    name: 'Linh Quy',
    nameCN: '靈龜',
    emoji: '🐢',
    element: 'thuy',
    rarity: 'uncommon',
    desc: 'Rùa linh cổ xưa, mang mai giáp huyền thoại. Phòng thủ kiên cố, trường thọ bền bỉ.',
    buffs: [
      { type: 'def_pct',      value: 8,  label: 'DEF +8%' },
      { type: 'hp_max_pct',   value: 6,  label: 'HP tối đa +6%' },
    ],
    skill50:  { name: 'Huyền Giáp', desc: 'Giảm thêm 3% sát thương nhận vào trong combat' },
    skill100: { name: 'Trường Sinh Khí', desc: 'HP tự hồi +0.05/s thêm ngoài combat' },
    foodId: 'linh_thu_xuong',
    shopUnlockRealm: 0,
    shopCost: 2500,
    encounterRate: 0.05,
    encounterNodes: ['linh_duoc_coc', 'van_linh_thi'],
    tameChance: 0.25,   // hiền lành, dễ thuần nhất
    eggDays: 5,
  },

  chu_tuoc_nhan: {
    id: 'chu_tuoc_nhan',
    name: 'Chu Tước Nhạn',
    nameCN: '朱雀燕',
    emoji: '🐦',
    element: 'hoa',
    rarity: 'rare',
    desc: 'Thiên điểu hỏa hệ, mang điềm lành và thịnh vượng. Bay nhanh như chớp.',
    buffs: [
      { type: 'stone_pct',  value: 8,  label: 'Linh thạch +8%' },
      { type: 'exp_pct',    value: 6,  label: 'EXP +6%' },
    ],
    skill50:  { name: 'Hồng Vận', desc: 'Xác suất tìm được nguyên liệu hiếm khi Explore +5%' },
    skill100: { name: 'Chu Tước Chiếu Mệnh', desc: 'Linh thạch +10% thay vì +8%' },
    foodId: 'linh_thu_nhuc',
    shopUnlockRealm: 1,
    shopCost: 12000,
    encounterRate: 0.02,
    encounterNodes: ['thien_kiep_dia', 'van_linh_thi'],
    tameChance: 0.12,
    eggDays: 6,
  },

  bach_ho_au: {
    id: 'bach_ho_au',
    name: 'Bạch Hổ Ấu',
    nameCN: '白虎幼',
    emoji: '🐯',
    element: 'kim',
    rarity: 'uncommon',
    desc: 'Hổ con kim hệ, dữ tợn và trung thành. Chiến đấu cùng chủ nhân không ngại nguy hiểm.',
    buffs: [
      { type: 'atk_pct',  value: 6,  label: 'ATK +6%' },
      { type: 'def_pct',  value: 5,  label: 'DEF +5%' },
    ],
    skill50:  { name: 'Kiêu Hổ Hộ Vệ', desc: 'Trong combat: 10% xác suất linh thú đỡ đòn thay chủ (giảm 30% sát thương)' },
    skill100: { name: 'Bạch Hổ Chiến Hồn', desc: 'ATK +8% và DEF +7% thay vì +6/+5%' },
    foodId: 'linh_thu_nhuc',
    shopUnlockRealm: 0,
    shopCost: 4000,
    encounterRate: 0.03,
    encounterNodes: ['hac_phong_lam', 'thanh_van_son'],
    tameChance: 0.18,
    eggDays: 4,
  },

  bang_tam: {
    id: 'bang_tam',
    name: 'Băng Tằm',
    nameCN: '冰蠶',
    emoji: '🐛',
    element: 'thuy',
    rarity: 'rare',
    desc: 'Tằm băng cực phẩm, kiên nhẫn tích lũy thuần khiết. Hỗ trợ đột phá tốt nhất trong các linh thú.',
    buffs: [
      { type: 'purity_pct',       value: 10, label: 'Thuần độ tích +10%' },
      { type: 'breakthrough_pct', value: 5,  label: 'Cơ hội đột phá +5%' },
    ],
    skill50:  { name: 'Thuần Khiết Chi Kén', desc: 'Khi thất bại đột phá: purity chỉ mất 80% thay vì 100%' },
    skill100: { name: 'Băng Tằm Hóa Tiên', desc: 'Purity tích +12% và breakthrough +7%' },
    foodId: 'linh_thu_xuong',
    shopUnlockRealm: 1,
    shopCost: 18000,
    encounterRate: 0.012,
    encounterNodes: ['thien_kiep_dia', 'an_long_dong'],
    tameChance: 0.08,
    eggDays: 7,
  },

  loi_lang: {
    id: 'loi_lang',
    name: 'Lôi Lang',
    nameCN: '雷狼',
    emoji: '🐺',
    element: 'loi',
    rarity: 'uncommon',
    desc: 'Sói sấm hung hãn. Bình thường im lặng nhưng trong chiến đấu bùng nổ dữ dội.',
    buffs: [
      { type: 'atk_pct',      value: 9,  label: 'ATK +9% (combat)' },
      { type: 'stun_pct',     value: 5,  label: 'Choáng địch +5%' },
    ],
    skill50:  { name: 'Lôi Nha Liệt Trảo', desc: 'Tấn công bổ trợ trong combat — 20% xác suất tạo đòn sét' },
    skill100: { name: 'Bão Sấm Liên Hoàn', desc: 'ATK +10% khi combat, stun tăng lên 8%' },
    foodId: 'linh_thu_nhuc',
    shopUnlockRealm: 1,
    shopCost: 8000,
    encounterRate: 0.035,
    encounterNodes: ['hac_phong_lam', 'dia_phu_mon'],
    tameChance: 0.15,
    eggDays: 4,
  },

  kim_si_dieu: {
    id: 'kim_si_dieu',
    name: 'Kim Sí Điểu',
    nameCN: '金翅鳥',
    emoji: '🦅',
    element: 'kim',
    rarity: 'uncommon',
    desc: 'Đại bàng kim sí, mắt tinh tường, khứu giác nhạy bén. Chuyên tìm kiếm tài vật.',
    buffs: [
      { type: 'stone_pct',   value: 7,  label: 'Linh thạch +7%' },
      { type: 'explore_pct', value: 8,  label: 'Khám phá hiệu quả +8%' },
    ],
    skill50:  { name: 'Tầm Bảo Chi Nhãn', desc: 'Node map tốn entryCost giảm 10%' },
    skill100: { name: 'Kim Dực Tuần Thiên', desc: 'Linh thạch +9% và Khám phá +10%' },
    foodId: 'linh_thu_nhuc',
    shopUnlockRealm: 0,
    shopCost: 3500,
    encounterRate: 0.04,
    encounterNodes: ['thanh_van_son', 'thien_kiep_dia'],
    tameChance: 0.18,
    eggDays: 4,
  },
};

// Rarity colors
export const RARITY_COLORS = {
  common: '#888', uncommon: '#56c46a', rare: '#3a9fd5', epic: '#a855f7', legendary: '#f0d47a'
};

// ============================================================
// STATE HELPERS
// ============================================================
export function createFreshLinhThuState() {
  return {
    slots: [null, null],  // tối đa 2 linh thú
    eggs: [],             // [{id, beastId, plantedAt(năm game), hatchAt}]
  };
}

// Tạo linh thú mới từ id
function _newBeast(beastId, source = 'tame') {
  return {
    beastId,
    source,          // 'tame' | 'egg' | 'shop'
    intimacy: 0,     // 0-100 thân thiết
    lastFedYear: 0,  // năm game lần cuối cho ăn
    hungry: false,   // đang đói → buff giảm 50%
    skill50Unlocked: false,
    skill100Unlocked: false,
  };
}

// ============================================================
// GET BUFFS — tính buff thực tế từ tất cả linh thú đang có
// ============================================================
export function getLinhThuBuffs(G) {
  const lt = G.linhThu;
  if (!lt?.slots) return {};

  const totals = {};

  for (const beast of lt.slots) {
    if (!beast) continue;
    const data = LINH_THU_DATA[beast.beastId];
    if (!data) continue;

    const hungry = beast.hungry;
    const mult = hungry ? 0.5 : 1.0;

    // Kỹ năng 100 thay thế buff cơ bản
    const buffsToApply = (beast.skill100Unlocked && data.skill100?.replacesBuffs)
      ? data.skill100.replacesBuffs
      : data.buffs;

    for (const b of buffsToApply) {
      totals[b.type] = (totals[b.type] || 0) + b.value * mult;
    }
  }

  return totals;
}

// Lấy 1 buff cụ thể
export function getLinhThuBuff(G, type) {
  return getLinhThuBuffs(G)[type] || 0;
}

// Kiểm tra skill50 của linh thú đang có (cho combat dùng)
export function getLinhThuSkills(G) {
  const lt = G.linhThu;
  if (!lt?.slots) return [];
  const skills = [];
  for (const beast of lt.slots) {
    if (!beast) continue;
    const data = LINH_THU_DATA[beast.beastId];
    if (!data) continue;
    if (beast.skill50Unlocked) skills.push({ beastId: beast.beastId, skill: data.skill50, data });
    if (beast.skill100Unlocked) skills.push({ beastId: beast.beastId, skill: data.skill100, data });
  }
  return skills;
}

// ============================================================
// KHÁM PHÁ — encounter khi doExplore
// ============================================================
export function rollLinhThuEncounter(G) {
  const curNode = G.worldMap?.currentNodeId || '';

  // Tìm linh thú có thể xuất hiện ở node này
  const candidates = Object.values(LINH_THU_DATA).filter(d =>
    d.encounterNodes.includes(curNode) || d.encounterNodes.length === 0
  );
  if (!candidates.length) return null;

  // Roll từng con
  for (const data of candidates.sort(() => Math.random() - 0.5)) {
    const nodeBonus = data.encounterNodes.includes(curNode) ? 1.5 : 0.5;
    if (Math.random() < data.encounterRate * nodeBonus) {
      // Gặp trứng hay linh thú trưởng thành? Trứng xác suất 40%
      const isEgg = Math.random() < 0.40;
      return { data, isEgg };
    }
  }
  return null;
}

// ============================================================
// THUẦN HÓA — khi gặp linh thú hoang dã
// ============================================================
export function tryTame(G, beastId) {
  if (!G.linhThu) G.linhThu = createFreshLinhThuState();
  const lt = G.linhThu;
  const data = LINH_THU_DATA[beastId];
  if (!data) return { ok: false, msg: 'Linh thú không tồn tại' };

  // Kiểm tra còn slot không
  const emptySlot = lt.slots.findIndex(s => s === null);
  if (emptySlot === -1) return { ok: false, msg: '⚠ Đã có 2 linh thú — cần thả bớt trước!' };

  // Tính xác suất thuần hóa — tăng nếu linh căn hợp
  let chance = data.tameChance;
  const mainEl = G.spiritData?.mainElement || '';
  if (mainEl === data.element) chance += 0.10; // hợp nguyên tố → dễ thuần hơn
  if ((G.realmIdx || 0) >= 2) chance += 0.05;  // Kim Đan trở lên có uy
  chance = Math.min(0.55, chance);

  if (Math.random() > chance) {
    addChronicle(G, `Cố thuần hóa ${data.name} thất bại — linh thú bỏ trốn.`);
    return { ok: false, msg: `💨 ${data.name} bỏ trốn! Thuần hóa thất bại.`, type: 'danger' };
  }

  const beast = _newBeast(beastId, 'tame');
  lt.slots[emptySlot] = beast;

  addChronicle(G, `Thuần hóa thành công ${data.name}!`);
  bus.emit('linhthu:tamed', { beastId, data });

  return {
    ok: true,
    msg: `🎉 Thuần hóa thành công ${data.emoji} ${data.name}!`,
    type: 'legendary',
  };
}

// ============================================================
// TRỨNG — nhặt trứng + ấp
// ============================================================
export function pickupEgg(G, beastId) {
  if (!G.linhThu) G.linhThu = createFreshLinhThuState();
  const data = LINH_THU_DATA[beastId];
  if (!data) return { ok: false, msg: 'Trứng lỗi' };

  const eggId = `egg_${Date.now()}`;
  const now = G.gameTime?.currentYear || 0;
  const hatchAt = now + data.eggDays / 365;

  G.linhThu.eggs.push({ id: eggId, beastId, plantedAt: now, hatchAt });
  addChronicle(G, `Nhặt được trứng ${data.name}. Nở sau ${data.eggDays} ngày.`);
  bus.emit('linhthu:egg_found', { beastId, data, eggDays: data.eggDays });

  return {
    ok: true,
    msg: `🥚 Tìm được trứng ${data.emoji} ${data.name}! Nở sau ${data.eggDays} ngày.`,
    type: 'epic',
  };
}

// Kiểm tra trứng nở mỗi tick
export function tickLinhThu(G, dtYears) {
  if (!G.linhThu) return;
  const lt = G.linhThu;
  const now = G.gameTime?.currentYear || 0;

  // Kiểm tra trứng nở
  const hatched = [];
  lt.eggs = lt.eggs.filter(egg => {
    if (now >= egg.hatchAt) {
      hatched.push(egg);
      return false;
    }
    return true;
  });

  for (const egg of hatched) {
    const emptySlot = lt.slots.findIndex(s => s === null);
    if (emptySlot === -1) {
      // Không có slot — giữ trứng lại (push lại với hatchAt kéo dài)
      egg.hatchAt = now + 1 / 365; // thử lại sau 1 ngày
      lt.eggs.push(egg);
      bus.emit('linhthu:egg_waiting', { egg });
      continue;
    }
    const beast = _newBeast(egg.beastId, 'egg');
    lt.slots[emptySlot] = beast;
    const data = LINH_THU_DATA[egg.beastId];
    addChronicle(G, `Trứng ${data?.name} nở thành công!`);
    bus.emit('linhthu:hatched', { beastId: egg.beastId, data });
  }

  // Tick đói — cần cho ăn mỗi 5 ngày game
  const HUNGRY_DAYS = 5;
  for (const beast of lt.slots) {
    if (!beast) continue;
    const daysSinceFed = (now - (beast.lastFedYear || 0)) * 365;
    beast.hungry = daysSinceFed > HUNGRY_DAYS;
  }

  // Tăng thân thiết chậm qua thời gian (khi không đói) — +1 thân thiết / 3 ngày
  for (const beast of lt.slots) {
    if (!beast || beast.hungry) continue;
    beast.intimacy = Math.min(100, (beast.intimacy || 0) + dtYears * 365 / 3);
    // Mở kỹ năng
    if (!beast.skill50Unlocked  && beast.intimacy >= 50)  beast.skill50Unlocked  = true;
    if (!beast.skill100Unlocked && beast.intimacy >= 100) beast.skill100Unlocked = true;
  }
}

// ============================================================
// CHO ĂN
// ============================================================
export function feedBeast(G, slotIdx) {
  if (!G.linhThu) return { ok: false, msg: 'Chưa có linh thú' };
  const beast = G.linhThu.slots[slotIdx];
  if (!beast) return { ok: false, msg: 'Không có linh thú ở slot này' };

  const data = LINH_THU_DATA[beast.beastId];
  if (!data) return { ok: false, msg: 'Dữ liệu linh thú lỗi' };

  // Kiểm tra nguyên liệu
  const foodId = data.foodId;
  const foodQty = G.alchemy?.ingredients?.[foodId] || 0;
  if (foodQty <= 0) {
    return { ok: false, msg: `❌ Thiếu ${foodId === 'linh_thu_nhuc' ? 'Linh Thú Nhục' : 'Linh Thú Cốt'} để cho ăn!`, type: 'danger' };
  }

  G.alchemy.ingredients[foodId]--;
  beast.lastFedYear = G.gameTime?.currentYear || 0;
  beast.hungry = false;
  // Cho ăn tăng thân thiết nhanh hơn
  beast.intimacy = Math.min(100, (beast.intimacy || 0) + 3);
  if (!beast.skill50Unlocked  && beast.intimacy >= 50)  beast.skill50Unlocked  = true;
  if (!beast.skill100Unlocked && beast.intimacy >= 100) beast.skill100Unlocked = true;

  return {
    ok: true,
    msg: `🍖 Cho ${data.emoji} ${data.name} ăn! Thân thiết: ${Math.floor(beast.intimacy)}/100`,
    type: 'jade',
  };
}

// ============================================================
// MUA TỪ SHOP (trứng)
// ============================================================
export function buyLinhThuEgg(G, beastId) {
  if (!G.linhThu) G.linhThu = createFreshLinhThuState();
  const data = LINH_THU_DATA[beastId];
  if (!data) return { ok: false, msg: 'Linh thú không tồn tại' };
  if ((G.realmIdx || 0) < (data.shopUnlockRealm || 0)) {
    return { ok: false, msg: `🔒 Cần đạt cảnh giới cao hơn!`, type: 'danger' };
  }
  if ((G.stone || 0) < data.shopCost) {
    return { ok: false, msg: `💎 Cần ${data.shopCost} linh thạch!`, type: 'danger' };
  }
  G.stone -= data.shopCost;
  return pickupEgg(G, beastId);
}

// ============================================================
// THẢ LINH THÚ
// ============================================================
export function releaseBeast(G, slotIdx) {
  if (!G.linhThu) return { ok: false, msg: 'Chưa có linh thú' };
  const beast = G.linhThu.slots[slotIdx];
  if (!beast) return { ok: false, msg: 'Không có linh thú ở slot này' };
  const data = LINH_THU_DATA[beast.beastId];
  G.linhThu.slots[slotIdx] = null;
  addChronicle(G, `Thả ${data?.name} về tự nhiên.`);
  bus.emit('linhthu:released', { beastId: beast.beastId });
  return { ok: true, msg: `${data?.emoji} ${data?.name} đã được thả về tự nhiên.`, type: 'jade' };
}

// ============================================================
// SHOP EGG LIST — danh sách trứng bán trong shop
// ============================================================
export const SHOP_EGGS = Object.values(LINH_THU_DATA).map(d => ({
  id:          `egg_${d.id}`,
  beastId:     d.id,
  name:        `Trứng ${d.name}`,
  emoji:       '🥚',
  beastEmoji:  d.emoji,
  desc:        `Trứng linh thú ${d.name}. Ấp ${d.eggDays} ngày sẽ nở.`,
  cost:        d.shopCost,
  unlockRealm: d.shopUnlockRealm,
  rarity:      d.rarity,
}));