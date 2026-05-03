// ============================================================
// core/kiep-tu-engine.js — Kiếp Tu (劫修) System
// Kiếp Tu là những tu sĩ chuyên cướp bóc, phục kích người yếu hơn.
//
// 2 CHIỀU:
//   1. Bị phục kích (passive): Kiếp Tu chọn player khi player yếu
//   2. Chủ động làm Kiếp Tu (active): player tấn công NPC tán tu yếu hơn
// ============================================================
import { bus } from '../utils/helpers.js';
import { addChronicle } from './time-engine.js';
import { REALMS } from './data.js';
import { getAmbushWardFactor } from './thuong-hoi-engine.js';

// ============================================================
// DATA — Kiếp Tu NPC pool
// Luôn cảnh giới >= player (chúng chọn kẻ yếu hơn!)
// ============================================================
export const KIEP_TU_POOL = [
  // Tán Kiếp — cô độc, LK-TC
  { id:'tan_kiep_1', name:'Lý Đen',       emoji:'🗡', realmIdx:0, stage:7,
    type:'tan_kiep', desc:'Tên Kiếp Tu già dơ. Mắt ti hí, lưng còng, tay không rời đao.',
    stoneLoot:[30,80], itemLoot:['linh_thao','tan_thuoc_vien'] },
  { id:'tan_kiep_2', name:'Quỷ Liên',     emoji:'🗡', realmIdx:1, stage:2,
    type:'tan_kiep', desc:'Trúc Cơ phế nhân, từng bị trục xuất khỏi tông môn vì trộm cắp.',
    stoneLoot:[100,300], itemLoot:['thien_linh_thao','hoi_khoi_dan'] },
  { id:'tan_kiep_3', name:'Mộc Sát',      emoji:'🗡', realmIdx:1, stage:5,
    type:'tan_kiep', desc:'Tán tu mất đường tu luyện, chuyển sang cướp bóc để sống sót.',
    stoneLoot:[200,500], itemLoot:['than_thong_thao','hoi_linh_dan'] },
  { id:'tan_kiep_4', name:'Huyết Dao Lão',emoji:'⚔', realmIdx:2, stage:2,
    type:'tan_kiep', desc:'Kim Đan lão yêu hành nghề cướp bóc hàng chục năm. Cực kỳ hung tàn.',
    stoneLoot:[800,2000], itemLoot:['ngoc_linh_chi','phi_thang_dan'] },

  // Kiếp Đoàn — có tổ chức, TC+
  { id:'kiep_doan_1', name:'Kiếp Đoàn Hắc Phong', emoji:'👥', realmIdx:1, stage:3,
    type:'kiep_doan', waveCount:3, desc:'Nhóm 3 Kiếp Tu Trúc Cơ từ Hắc Phong Lâm, chuyên phục kích người ra khỏi bí cảnh.',
    stoneLoot:[400,1000], itemLoot:['thien_linh_thao','hoi_linh_dan','than_thong_thao'] },
  { id:'kiep_doan_2', name:'Huyết Nguyệt Bang', emoji:'👥', realmIdx:2, stage:1,
    type:'kiep_doan', waveCount:3, desc:'Bang hội Kiếp Tu khét tiếng. Có nội gián trong nhiều tông môn lớn.',
    stoneLoot:[1500,4000], itemLoot:['ngoc_linh_chi','phi_thang_dan','hoi_linh_dan'] },
];

// NPC tán tu yếu — mục tiêu khi player chủ động làm Kiếp Tu
export const TAN_TU_TARGETS = [
  { id:'target_1', name:'Lão Tiều Phu',   emoji:'🧑‍🌾', realmIdx:0, stage:2,
    desc:'Tản tu già, thu thập thảo dược kiếm sống.',
    stoneLoot:[10,30], itemLoot:['linh_thao'] },
  { id:'target_2', name:'Tiểu Thư Phế',   emoji:'👧', realmIdx:0, stage:4,
    desc:'Tiểu thư nhà phú hộ, linh căn kém, tu luyện chậm.',
    stoneLoot:[50,150], itemLoot:['linh_thao','tan_thuoc_vien'], sectId:'dan_tong' },
  { id:'target_3', name:'Thương Nhân Tán Tu', emoji:'🧳', realmIdx:0, stage:6,
    desc:'Thương nhân tán tu vừa bán được mớ thảo dược quý.',
    stoneLoot:[200,500], itemLoot:['thien_linh_thao','hoi_khoi_dan'] },
  { id:'target_4', name:'Đệ Tử Tông Môn Lạc Đường', emoji:'🧑‍🎓', realmIdx:1, stage:1,
    desc:'Đệ tử tông môn đi ngoài một mình, không có hộ tống.',
    stoneLoot:[300,800], itemLoot:['hoi_linh_dan'], sectId:'kiem_tong' },
  { id:'target_5', name:'Lão Tán Tu Kiệt Sức', emoji:'🧓', realmIdx:1, stage:3,
    desc:'Tản tu già vừa ra khỏi bí cảnh, linh lực gần cạn.',
    stoneLoot:[500,1200], itemLoot:['thien_linh_thao','ngoc_linh_chi'] },
];

// ============================================================
// FRESH STATE
// ============================================================
export function createKiepTuState() {
  return {
    ambushCooldown: 0,    // năm game — cooldown sau lần bị phục kích
    totalAmbushed:  0,    // tổng lần bị phục kích
    totalDefeated:  0,    // tổng Kiếp Tu đã đánh bại
    robbedCount:    0,    // bị cướp thành công bao nhiêu lần
    nghiepLuc:      0,    // nghiệp lực tích lũy khi chủ động cướp (0-100)
    activeCount:    0,    // số NPC đã chủ động cướp
    lastActiveYear: 0,    // năm game lần cuối chủ động cướp
  };
}

// ============================================================
// TÍNH XÁC SUẤT BỊ PHỤC KÍCH
// Chỉ xảy ra khi di chuyển map, không phải mỗi tick
// ============================================================
export function calcAmbushChance(G) {
  if (!G.kiepTu) G.kiepTu = createKiepTuState();

  // Cooldown — vừa bị phục kích, chờ một thời gian
  if ((G.gameTime?.currentYear ?? 0) < (G.kiepTu.ambushCooldown ?? 0)) return 0;

  let chance = 0.06; // base 6% mỗi lần di chuyển node

  // Tản tu dễ bị nhắm hơn — không có tông môn bảo vệ
  if (!G.sectId) chance += 0.06;

  // Vừa ra khỏi dungeon — mang theo bảo vật
  if ((G.dungeon?.lastClearedFloor ?? 0) >= 3) chance += 0.08;

  // HP thấp — trông yếu đuối
  const hpPct = (G.hp ?? 100) / Math.max(1, G.maxHp ?? 100);
  if (hpPct < 0.4) chance += 0.08;
  else if (hpPct < 0.7) chance += 0.03;

  // Stamina cạn — kiệt sức
  const staPct = (G.stamina ?? 100) / Math.max(1, G.maxStamina ?? 100);
  if (staPct < 0.3) chance += 0.05;

  // Cảnh giới thấp dễ bị nhắm hơn (LK nhiều Kiếp Tu hơn)
  if (G.realmIdx === 0) chance += 0.04;

  // Danh vọng cao → Kiếp Tu e ngại
  const dv = G.danhVong ?? 0;
  if (dv >= 300) chance -= 0.05;
  else if (dv >= 150) chance -= 0.03;
  else if (dv >= 50) chance -= 0.01;

  // Node nguy hiểm (rừng, hang động) tăng xác suất
  const dangerNodes = ['hac_phong_lam', 'an_long_dong', 'dia_phu_mon'];
  if (dangerNodes.includes(G.worldMap?.currentNodeId)) chance += 0.05;

  // Bùa Trừ Kiếp Tu (mua từ Thương Hội)
  const wardFactor = getAmbushWardFactor(G);

  return Math.max(0, Math.min(0.45, chance)) * wardFactor;
}

// ============================================================
// CHỌN KIẾP TU PHÙ HỢP — luôn >= cảnh giới player
// ============================================================
export function pickAmbusher(G) {
  const pRealm = G.realmIdx ?? 0;
  const pStage = G.stage ?? 1;

  // Lọc Kiếp Tu có cảnh giới >= player
  // Nhưng không quá mạnh (cách 1 realm là tối đa — chúng muốn thắng chắc, không phải thách thức mạnh)
  const valid = KIEP_TU_POOL.filter(k => {
    const kScore = k.realmIdx * 10 + k.stage;
    const pScore = pRealm * 10 + pStage;
    return kScore >= pScore && kScore <= pScore + 15; // không quá mạnh hơn 1.5 realm
  });

  if (valid.length === 0) {
    // Fallback: Kiếp Tu mạnh nhất phù hợp
    return KIEP_TU_POOL.filter(k => k.realmIdx <= pRealm + 1)[0] || KIEP_TU_POOL[0];
  }

  // Ưu tiên Kiếp Đoàn nếu player đang ở TC+
  if (pRealm >= 1) {
    const doan = valid.filter(k => k.type === 'kiep_doan');
    if (doan.length > 0 && Math.random() < 0.35) {
      return doan[Math.floor(Math.random() * doan.length)];
    }
  }

  return valid[Math.floor(Math.random() * valid.length)];
}

// ============================================================
// TRIGGER PHỤC KÍCH — gọi khi player di chuyển node
// Trả về { triggered, kiepTu } hoặc { triggered: false }
// ============================================================
export function checkAmbush(G) {
  const chance = calcAmbushChance(G);
  if (Math.random() > chance) return { triggered: false };

  const kt = pickAmbusher(G);
  if (!kt) return { triggered: false };

  // Set cooldown — 15-30 ngày game
  if (!G.kiepTu) G.kiepTu = createKiepTuState();
  G.kiepTu.totalAmbushed = (G.kiepTu.totalAmbushed ?? 0) + 1;
  G.kiepTu.ambushCooldown = (G.gameTime?.currentYear ?? 0) + (15 + Math.random() * 15) / 365;

  bus.emit('kieptu:ambush', { kiepTu: kt });
  return { triggered: true, kiepTu: kt };
}

// ============================================================
// KẾT QUẢ CHIỀU 1 — Thắng/Thua khi bị phục kích
// ============================================================
export function resolveAmbushWin(G, kiepTu) {
  if (!G.kiepTu) G.kiepTu = createKiepTuState();
  G.kiepTu.totalDefeated = (G.kiepTu.totalDefeated ?? 0) + 1;

  // Loot stone
  const [min, max] = kiepTu.stoneLoot || [20, 100];
  const stoneGain = Math.floor(min + Math.random() * (max - min));
  G.stone = (G.stone ?? 0) + stoneGain;

  // Danh vọng tăng nhẹ — đánh bại Kiếp Tu là việc tốt
  const dvGain = kiepTu.type === 'kiep_doan' ? 12 : 6;
  G.danhVong = (G.danhVong ?? 0) + dvGain;

  addChronicle(G, `Đánh bại Kiếp Tu ${kiepTu.name}, thu ${stoneGain}💎.`);
  bus.emit('danhvong:gained', { amount: dvGain, source: `Đánh bại Kiếp Tu ${kiepTu.name}` });

  return {
    ok: true,
    stoneGain,
    dvGain,
    msg: `⚔ Đánh bại ${kiepTu.name}! +${stoneGain}💎 +${dvGain}🌟`,
  };
}

export function resolveAmbushLoss(G, kiepTu) {
  if (!G.kiepTu) G.kiepTu = createKiepTuState();
  G.kiepTu.robbedCount = (G.kiepTu.robbedCount ?? 0) + 1;

  // Mất 20-40% stone
  const lossPct = 0.20 + Math.random() * 0.20;
  const stoneLost = Math.floor((G.stone ?? 0) * lossPct);
  G.stone = Math.max(0, (G.stone ?? 0) - stoneLost);

  // Mất 1 item ngẫu nhiên từ inventory (không phải equipment)
  const inv = G.inventory ?? [];
  const filledSlots = inv.map((s, i) => s ? i : -1).filter(i => i >= 0);
  let itemLostName = null;
  if (filledSlots.length > 0) {
    const lostIdx = filledSlots[Math.floor(Math.random() * filledSlots.length)];
    itemLostName = inv[lostIdx]?.name || 'Vật phẩm';
    G.inventory[lostIdx] = null;
  }

  addChronicle(G, `Bị Kiếp Tu ${kiepTu.name} cướp mất ${stoneLost}💎.`);

  return {
    ok: false,
    stoneLost,
    itemLostName,
    msg: `💀 Bị ${kiepTu.name} cướp! -${stoneLost}💎${itemLostName ? ` -${itemLostName}` : ''}`,
  };
}

// ============================================================
// CHIỀU 2 — PLAYER CHỦ ĐỘNG LÀM KIẾP TU
// ============================================================

// Lấy danh sách mục tiêu có thể cướp — yếu hơn player
export function getAvailableTargets(G) {
  const pScore = (G.realmIdx ?? 0) * 10 + (G.stage ?? 1);
  return TAN_TU_TARGETS.filter(t => {
    const tScore = t.realmIdx * 10 + t.stage;
    return tScore < pScore; // yếu hơn player
  });
}

// Thực hiện cướp NPC — gọi khi player xác nhận
export function robTarget(G, targetId) {
  const target = TAN_TU_TARGETS.find(t => t.id === targetId);
  if (!target) return { ok: false, msg: 'Mục tiêu không tồn tại' };

  const pScore = (G.realmIdx ?? 0) * 10 + (G.stage ?? 1);
  const tScore = target.realmIdx * 10 + target.stage;
  if (tScore >= pScore) return { ok: false, msg: '⚠ Mục tiêu không yếu hơn ngươi!' };

  if (!G.kiepTu) G.kiepTu = createKiepTuState();

  // Loot stone
  const [min, max] = target.stoneLoot || [20, 100];
  const stoneGain = Math.floor(min + Math.random() * (max - min));
  G.stone = (G.stone ?? 0) + stoneGain;

  // Hậu quả — nghiệp lực tăng
  const nghiepGain = target.sectId ? 20 : 12; // cướp người có tông môn tội nặng hơn
  G.kiepTu.nghiepLuc = Math.min(100, (G.kiepTu.nghiepLuc ?? 0) + nghiepGain);
  G.kiepTu.activeCount = (G.kiepTu.activeCount ?? 0) + 1;
  G.kiepTu.lastActiveYear = G.gameTime?.currentYear ?? 0;

  // Danh vọng giảm
  const dvLoss = target.sectId ? 15 : 10;
  G.danhVong = Math.max(0, (G.danhVong ?? 0) - dvLoss);

  // Ma Khí tăng nếu Ma Đạo đã mở
  if (G.maDaoState?.isOpen) {
    G.maDaoState.maQi = Math.min(100, (G.maDaoState.maQi ?? 0) + 8);
  }

  // Nếu nạn nhân cùng tông môn → bị trục xuất!
  let expelled = false;
  if (target.sectId && G.sectId === target.sectId) {
    G.sectId = null;
    G.sect = null;
    expelled = true;
    bus.emit('sect:expelled', { reason: 'Tấn công đồng môn' });
    addChronicle(G, `Bị trục xuất khỏi tông môn vì tấn công đồng môn ${target.name}.`);
  }

  addChronicle(G, `Làm Kiếp Tu, cướp ${target.name} được ${stoneGain}💎.`);
  bus.emit('kieptu:robbed', { target, stoneGain, nghiepGain, dvLoss, expelled });

  return {
    ok: true,
    stoneGain,
    nghiepGain,
    dvLoss,
    expelled,
    nghiepLuc: G.kiepTu.nghiepLuc,
    msg: expelled
      ? `⚠ Cướp đồng môn! Bị trục xuất tông môn! +${stoneGain}💎 -${dvLoss}🌟`
      : `🗡 Cướp ${target.name}! +${stoneGain}💎 -${dvLoss}🌟 Nghiệp Lực +${nghiepGain}`,
  };
}

// ============================================================
// NGHIỆP LỰC — ảnh hưởng gameplay
// ============================================================
export function getNghiepLucPenalty(G) {
  const nl = G.kiepTu?.nghiepLuc ?? 0;
  if (nl >= 80) return { label: '☠ Nghiệp Chướng Cực Nặng', qiPenalty: 0.30, dvPenaltyPerDay: 1 };
  if (nl >= 60) return { label: '⚠ Nghiệp Chướng Nặng',     qiPenalty: 0.15, dvPenaltyPerDay: 0 };
  if (nl >= 40) return { label: '· Nghiệp Lực Tích Lũy',    qiPenalty: 0.07, dvPenaltyPerDay: 0 };
  if (nl >= 20) return { label: '· Nghiệp Lực Nhẹ',         qiPenalty: 0.03, dvPenaltyPerDay: 0 };
  return { label: '', qiPenalty: 0, dvPenaltyPerDay: 0 };
}

// Nghiệp lực tự giảm dần theo thời gian (làm việc tốt, tu luyện chính đạo)
export function tickNghiepLuc(G, dtYears) {
  if (!G.kiepTu) return;
  const nl = G.kiepTu.nghiepLuc ?? 0;
  if (nl <= 0) return;
  // Giảm ~1 điểm/10 ngày game khi không cướp
  const daysSinceRob = ((G.gameTime?.currentYear ?? 0) - (G.kiepTu.lastActiveYear ?? 0)) * 365;
  if (daysSinceRob > 30) {
    G.kiepTu.nghiepLuc = Math.max(0, nl - dtYears * 365 * 0.1);
  }
}