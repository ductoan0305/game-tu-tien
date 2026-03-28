// ============================================================
// js/core/ma-dao-engine.js — Hệ thống Ma Đạo
// GDD mục 36: Con đường thứ ba — không phải "ác" đơn giản
// Tích Ma Khí thay vì Thuần Độ để đột phá
// Session 6 — v12
// ============================================================

import { bus } from '../utils/helpers.js';
import { addChronicle } from './time-engine.js';
import { REALMS } from './data.js';

// ============================================================
// CONSTANTS
// ============================================================

// Cách tiếp cận Ma Đạo (GDD mục 36 — không thể chọn từ đầu)
export const MA_DAO_TRIGGERS = {
  ancient_tome:    { id:'ancient_tome',    name:'Ma Công Bí Lục',     desc:'Tìm thấy bí kịp ma công trong dungeon/thám hiểm. Đọc → mở Ma Đạo, Tâm Cảnh -20.' },
  desperation:     { id:'desperation',     name:'Tuyệt Vọng',          desc:'Sắp chết vì tuổi thọ cạn (<10 năm còn lại), NPC bí ẩn xuất hiện đề nghị pháp môn đặc biệt.' },
  forced_implant:  { id:'forced_implant',  name:'Bị Cưỡng Bức Ma Căn', desc:'Bị Thiên Ma "trồng Ma Căn" — có thể giải trừ (quest dài) hoặc chấp nhận.' },
};

// Nguồn tích Ma Khí (GDD mục 36)
export const MA_QI_SOURCES = {
  kill_monster:   { label:'Hấp thụ linh lực quái',   maQiPerKill: 0.5,  note:'Hiệu quả thấp — quái thường' },
  kill_strong:    { label:'Hấp thụ linh lực quái mạnh', maQiPerKill: 2.0, note:'Quái mạnh hơn player' },
  kill_cultivator:{ label:'Giết tu sĩ hấp thụ',      maQiPerKill: 15.0, note:'Hiệu quả cao — lý do Ma Tu nguy hiểm' },
  ma_pill:        { label:'Ma Đan',                   maQiPerUse: 5.0,   note:'Không có danDoc thường nhưng có Ma Khí riêng' },
};

// Ngưỡng Ma Khí để đột phá (thay thế Thuần Độ)
// Nhanh hơn Chính Đạo đáng kể (GDD mục 36)
export const MA_QI_BREAKTHROUGH_THRESHOLD = {
  0: 40,   // LK→TC: cần 40 Ma Khí
  1: 80,   // TC→KĐ
  2: 150,  // KĐ→NA
  3: 280,  // NA→HT
  4: 500,  // HT→LH (Linh Giới)
};

// Tâm Cảnh mất mỗi lần tích Ma Khí (không thể ngăn)
export const TAM_CANH_LOSS_PER_MA_QI = {
  kill_monster:    0.1,
  kill_strong:     0.3,
  kill_cultivator: 2.0,
  ma_pill:         0.5,
};

// Mức độ Tâm Cảnh ảnh hưởng Ma Đạo
export const MA_DAO_TAM_CANH_THRESHOLDS = {
  warning: 30,      // Dưới 30: cảnh báo đỏ
  dangerous: 15,    // Dưới 15: nguy hiểm — đột phá có thể thất bại kiểm soát
  lost: 0,          // 0: Tẩu Hỏa Ma Tính vĩnh viễn
};

// Kỹ năng Ẩn Ma — che giấu Ma Đạo (GDD mục 36)
export const AN_MA_SKILL = {
  id: 'an_ma',
  name: 'Ẩn Ma Thuật',
  desc: 'Che giấu Ma Khí, trông như tu sĩ bình thường. Tốn linh lực duy trì.',
  qiCostPerTick: 0.5,  // qi/tick khi duy trì
  unlockMaQi: 10,       // Cần tích đủ 10 Ma Khí mới học được
};

// ============================================================
// STATE HELPERS — đảm bảo G.maDaoState tồn tại
// ============================================================

export function ensureMaDaoState(G) {
  if (!G.maDaoState) {
    G.maDaoState = {
      active: false,          // đã khai mở Ma Đạo chưa
      trigger: null,          // MA_DAO_TRIGGERS key
      maQi: 0,                // Ma Khí tích lũy (0-1000+)
      anMaActive: false,      // đang dùng Ẩn Ma Thuật không
      exposed: false,         // bị lộ tẩy trong tông môn
      karmaBlack: 0,          // Nghiệp Lực hắc ám (0-100)
      cultivatorKills: 0,     // số tu sĩ đã giết
      monsterKills: 0,        // số quái đã hấp thụ Ma Khí
      tauHoaPermanent: false, // Tẩu Hỏa Ma Tính vĩnh viễn
      purifyQuestActive: false, // đang trong quest giải trừ Ma Căn
      totalMaQiEarned: 0,     // tổng Ma Khí đã tích (cho thống kê)
    };
  }
  return G.maDaoState;
}

// ============================================================
// KHAI MỞ MA ĐẠO
// ============================================================

/**
 * Mở Ma Đạo qua trigger cụ thể.
 * Không thể chủ động chọn từ đầu game (GDD mục 36).
 */
export function openMaDao(G, triggerId) {
  const ms = ensureMaDaoState(G);
  if (ms.active) return { ok: false, msg: 'Đã khai mở Ma Đạo rồi.' };

  const trigger = MA_DAO_TRIGGERS[triggerId];
  if (!trigger) return { ok: false, msg: 'Trigger không hợp lệ.' };

  ms.active = true;
  ms.trigger = triggerId;

  // Hậu quả ngay lập tức
  if (triggerId === 'ancient_tome') {
    G.tamCanh = Math.max(0, (G.tamCanh ?? 50) - 20);
    addChronicle(G, `Tuổi ${Math.floor(G.gameTime?.currentYear??0)}: Đọc Ma Công Bí Lục — con đường hắc ám bắt đầu. Tâm Cảnh -20.`);
  } else if (triggerId === 'desperation') {
    addChronicle(G, `Tuổi ${Math.floor(G.gameTime?.currentYear??0)}: Tuyệt vọng trước tử thần, chấp nhận pháp môn ma đạo của người lạ.`);
  } else if (triggerId === 'forced_implant') {
    ms.purifyQuestActive = true; // có thể giải trừ
    addChronicle(G, `Tuổi ${Math.floor(G.gameTime?.currentYear??0)}: Bị Thiên Ma trồng Ma Căn — con đường không lối thoát đã mở.`);
  }

  // Rời tông môn ngay nếu đang có (bị phát hiện)
  if (ms.exposed && G.sectId) {
    expelFromSect(G);
  }

  bus.emit('ma_dao:opened', { trigger: triggerId });
  return {
    ok: true,
    msg: trigger.desc,
    canPurify: triggerId === 'forced_implant',
  };
}

// ============================================================
// TÍCH MA KHÍ
// ============================================================

/**
 * Tích Ma Khí sau khi giết quái hoặc dùng Ma Đan.
 * Tự động giảm Tâm Cảnh (không thể ngăn).
 * @param {string} source — key trong MA_QI_SOURCES
 * @param {number} qty — số lần (mặc định 1)
 */
export function gainMaQi(G, source, qty = 1) {
  const ms = ensureMaDaoState(G);
  if (!ms.active) return { ok: false };

  const src = MA_QI_SOURCES[source];
  if (!src) return { ok: false };

  const gained = (src.maQiPerKill ?? src.maQiPerUse ?? 0) * qty;
  ms.maQi += gained;
  ms.totalMaQiEarned += gained;

  // Tâm Cảnh giảm — không thể ngăn (GDD mục 36)
  const tamCanhLoss = (TAM_CANH_LOSS_PER_MA_QI[source] ?? 0.2) * qty;
  G.tamCanh = Math.max(0, (G.tamCanh ?? 50) - tamCanhLoss);

  // Nghiệp Lực tăng khi giết tu sĩ
  if (source === 'kill_cultivator') {
    ms.cultivatorKills += qty;
    ms.karmaBlack = Math.min(100, ms.karmaBlack + 5 * qty);
  } else if (source === 'kill_monster' || source === 'kill_strong') {
    ms.monsterKills += qty;
    ms.karmaBlack = Math.min(100, ms.karmaBlack + 0.5 * qty);
  }

  // Kiểm tra Tẩu Hỏa Ma Tính
  checkTauHoa(G);

  return { ok: true, gained, tamCanhLoss };
}

/**
 * Kiểm tra và xử lý Tẩu Hỏa Ma Tính vĩnh viễn (Tâm Cảnh về 0).
 */
function checkTauHoa(G) {
  const ms = ensureMaDaoState(G);
  if (ms.tauHoaPermanent) return;
  if ((G.tamCanh ?? 50) <= 0) {
    ms.tauHoaPermanent = true;
    addChronicle(G, `Tuổi ${Math.floor(G.gameTime?.currentYear??0)}: Tâm Cảnh sụp đổ hoàn toàn — Tẩu Hỏa Ma Tính vĩnh viễn. Mất kiểm soát trong chiến đấu.`);
    bus.emit('ma_dao:tau_hoa_permanent');
  }
}

// ============================================================
// ĐỘT PHÁ MA ĐẠO
// ============================================================

/**
 * Đột phá theo Ma Đạo — dùng Ma Khí thay vì Thuần Độ.
 * Nhanh hơn Chính Đạo nhưng Tâm Cảnh giảm thêm.
 */
export function doMaBreakthrough(G) {
  const ms = ensureMaDaoState(G);
  if (!ms.active) return { ok: false, msg: 'Chưa khai mở Ma Đạo.' };
  if (ms.tauHoaPermanent) return { ok: false, msg: 'Tẩu Hỏa Ma Tính — không thể kiểm soát đột phá.' };

  const realm = REALMS[G.realmIdx];
  const isRealmBreak = G.stage >= realm.stages;

  if (!isRealmBreak) {
    // Đột phá tầng nội bộ — Ma Đạo không có ưu thế đặc biệt
    // Dùng doBreakthrough thường cho tầng nội bộ
    return { ok: false, msg: 'Ma Đạo chỉ hỗ trợ đại đột phá cảnh giới. Dùng đột phá thường cho tầng nội bộ.' };
  }

  const threshold = MA_QI_BREAKTHROUGH_THRESHOLD[G.realmIdx];
  if (threshold === undefined) return { ok: false, msg: 'Cảnh giới này chưa hỗ trợ Ma Đạo đột phá.' };
  if (ms.maQi < threshold) {
    return {
      ok: false,
      msg: `Ma Khí chưa đủ. Cần ${threshold}, hiện có ${ms.maQi.toFixed(1)}.`,
      type: 'danger',
    };
  }

  // Ma Đạo không có Thiên Kiếp thông thường — thay bằng Ma Kiếp (GDD mục 36)
  // Ma Tu mạnh hơn xuất hiện thách đấu
  ms.maQi -= threshold;

  // Tâm Cảnh mất thêm khi đột phá Ma Đạo
  const tamCanhLost = 5 + Math.floor(Math.random() * 6);
  G.tamCanh = Math.max(0, (G.tamCanh ?? 50) - tamCanhLost);

  checkTauHoa(G);

  const nextRealmIdx = G.realmIdx + 1;
  G._pendingRealmIdx = nextRealmIdx;

  addChronicle(G, `Tuổi ${Math.floor(G.gameTime?.currentYear??0)}: Đột phá Ma Đạo — Ma Kiếp giáng xuống. Tâm Cảnh -${tamCanhLost}.`);

  // Trigger Ma Kiếp thay vì Thiên Kiếp
  bus.emit('ma_dao:ma_kiep', { realmIdx: nextRealmIdx });

  return {
    ok: true,
    type: 'ma_kiep',
    title: '👹 MA KIẾP GIÁNG XUỐNG',
    sub: 'Đồng loại Ma Tu đến tranh vị!',
    flavor: 'Thiên đạo không thừa nhận Ma Đạo — đồng loại tự phân cao thấp.',
    tamCanhLost,
  };
}

// ============================================================
// ẨN MA THUẬT
// ============================================================

/**
 * Bật/tắt Ẩn Ma Thuật — che giấu Ma Khí tốn linh lực duy trì.
 */
export function toggleAnMa(G) {
  const ms = ensureMaDaoState(G);
  if (!ms.active) return { ok: false, msg: 'Chưa khai mở Ma Đạo.' };
  if (ms.maQi < AN_MA_SKILL.unlockMaQi && !ms.anMaActive) {
    return { ok: false, msg: `Cần tích đủ ${AN_MA_SKILL.unlockMaQi} Ma Khí để học Ẩn Ma Thuật.` };
  }

  ms.anMaActive = !ms.anMaActive;
  return {
    ok: true,
    active: ms.anMaActive,
    msg: ms.anMaActive ? 'Ẩn Ma Thuật kích hoạt — Ma Khí bị che giấu.' : 'Ẩn Ma Thuật tắt.',
  };
}

/**
 * Tick Ẩn Ma — tốn qi mỗi tick khi đang duy trì.
 * Gọi từ gameTick hoặc tickAlchemyBuffs.
 */
export function tickAnMa(G, dt = 0.1) {
  const ms = G.maDaoState;
  if (!ms?.active || !ms.anMaActive) return;

  const cost = AN_MA_SKILL.qiCostPerTick * dt * 10;
  if ((G.qi ?? 0) < cost) {
    // Hết qi → tự tắt Ẩn Ma, có thể bị lộ
    ms.anMaActive = false;
    bus.emit('ma_dao:an_ma_off', { reason: 'no_qi' });
    return;
  }
  G.qi -= cost;
}

// ============================================================
// BỊ PHÁT HIỆN / TRỤC XUẤT
// ============================================================

/**
 * Kiểm tra nguy cơ bị lộ khi ở trong tông môn mà không dùng Ẩn Ma.
 * Gọi mỗi khi player thực hiện hành động trong tông môn.
 * @returns {boolean} true nếu bị lộ
 */
export function checkExposure(G) {
  const ms = G.maDaoState;
  if (!ms?.active) return false;
  if (ms.anMaActive) return false; // Ẩn Ma đang hoạt động
  if (!G.sectId) return false;     // không có tông môn

  // Xác suất bị lộ tùy Ma Khí tích lũy
  const exposureChance = Math.min(0.3, ms.maQi / 200);
  if (Math.random() < exposureChance) {
    ms.exposed = true;
    expelFromSect(G);
    return true;
  }
  return false;
}

/**
 * Trục xuất khỏi tông môn khi bị phát hiện là Ma Tu.
 */
function expelFromSect(G) {
  const sectId = G.sectId;
  G.sectId = null;
  G.sect = G.sect ?? {};
  G.sect.rank = 0;
  G.sect.contribution = 0;
  // Công Lao mất hết (GDD mục 36)
  if (G.sect?.gongLao !== undefined) G.sect.gongLao = 0;

  // Danh Vọng giảm mạnh
  G.danhVong = Math.max(0, (G.danhVong ?? 0) - 20);

  addChronicle(G, `Tuổi ${Math.floor(G.gameTime?.currentYear??0)}: Bị phát hiện là Ma Tu — trục xuất khỏi tông môn, mất tất cả Công Lao.`);
  bus.emit('ma_dao:exposed', { sectId });
}

// ============================================================
// GIẢI TRỪ MA ĐẠO — Quay về Chính Đạo
// ============================================================

/**
 * Bắt đầu quest giải trừ Ma Đạo.
 * Cần Tịnh Tâm Đan cực hiếm (GDD mục 36).
 * @param {boolean} hasTinhTamDan — player đã có Tịnh Tâm Đan chưa
 */
export function startPurifyQuest(G, hasTinhTamDan = false) {
  const ms = ensureMaDaoState(G);
  if (!ms.active) return { ok: false, msg: 'Chưa khai mở Ma Đạo.' };
  if (!hasTinhTamDan) {
    return {
      ok: false,
      msg: 'Cần Tịnh Tâm Đan cực hiếm — tìm trong dungeon tầng cao hoặc Đấu Giá đặc biệt.',
    };
  }

  ms.purifyQuestActive = true;
  bus.emit('quest:add', { questId: 'sq_purify_ma_dao' });

  return {
    ok: true,
    msg: 'Bắt đầu hành trình quay về Chính Đạo. Con đường gian nan — Tâm Cảnh phải xây lại từ đầu.',
  };
}

/**
 * Hoàn tất giải trừ Ma Đạo (gọi khi quest sq_purify_ma_dao hoàn thành).
 * Ma Khí chuyển thành Hỗn Nguyên Khí — bonus nhỏ vĩnh viễn.
 */
export function completePurify(G) {
  const ms = ensureMaDaoState(G);
  if (!ms.active || !ms.purifyQuestActive) return { ok: false };

  // Ma Khí còn lại → Hỗn Nguyên Khí → bonus nhỏ vĩnh viễn
  const hunYuanBonus = Math.floor(ms.maQi / 50) * 0.01; // mỗi 50 Ma Khí → +1% rate vĩnh viễn
  G.ratePct = (G.ratePct ?? 0) + hunYuanBonus * 100;

  // Reset Ma Đạo state
  const cultivatorKills = ms.cultivatorKills;
  ms.active = false;
  ms.maQi = 0;
  ms.anMaActive = false;
  ms.exposed = false;
  ms.purifyQuestActive = false;
  ms.tauHoaPermanent = false;

  // Tâm Cảnh reset về 0 — phải xây lại
  G.tamCanh = 0;

  // Nghiệp Lực không biến mất hoàn toàn
  ms.karmaBlack = Math.max(0, ms.karmaBlack - 50);

  addChronicle(G, `Tuổi ${Math.floor(G.gameTime?.currentYear??0)}: Giải trừ Ma Căn thành công. Ma Khí hóa Hỗn Nguyên, mang vết sẹo nhưng trở lại Chính Đạo.`);
  bus.emit('ma_dao:purified', { hunYuanBonus, cultivatorKills });

  return {
    ok: true,
    hunYuanBonus: (hunYuanBonus * 100).toFixed(1) + '%',
    msg: `Hỗn Nguyên Khí hình thành — +${(hunYuanBonus * 100).toFixed(1)}% tốc độ tu luyện vĩnh viễn. Tâm Cảnh về 0, hành trình tu tâm lại bắt đầu.`,
  };
}

// ============================================================
// GETTERS / UI HELPERS
// ============================================================

/**
 * Trả về trạng thái Ma Đạo để render UI.
 */
export function getMaDaoStatus(G) {
  const ms = G.maDaoState;
  if (!ms?.active) return null;

  const nextThreshold = MA_QI_BREAKTHROUGH_THRESHOLD[G.realmIdx];
  const tamCanh = G.tamCanh ?? 50;

  let dangerLevel = 'safe';
  if (ms.tauHoaPermanent)         dangerLevel = 'lost';
  else if (tamCanh <= MA_DAO_TAM_CANH_THRESHOLDS.dangerous) dangerLevel = 'critical';
  else if (tamCanh <= MA_DAO_TAM_CANH_THRESHOLDS.warning)   dangerLevel = 'warning';

  return {
    active: true,
    maQi: ms.maQi,
    maQiFormatted: ms.maQi.toFixed(1),
    nextThreshold,
    readyToBreak: nextThreshold !== undefined && ms.maQi >= nextThreshold,
    anMaActive: ms.anMaActive,
    exposed: ms.exposed,
    karmaBlack: ms.karmaBlack,
    tauHoaPermanent: ms.tauHoaPermanent,
    dangerLevel,
    tamCanh,
    canPurify: ms.purifyQuestActive || ms.trigger === 'forced_implant',
    trigger: ms.trigger,
  };
}

/**
 * Mô tả cảnh báo Đan Độc tích lũy cho Ma Đạo.
 * Ma Đan không có danDoc thường nhưng có maQi penalty riêng.
 */
export function getMaDaoDanDocNote(source) {
  if (source === 'ma_pill') {
    return 'Ma Đan không tích Đan Độc thường — nhưng tăng Ma Khí trực tiếp, đẩy nhanh sụp đổ Tâm Cảnh.';
  }
  return null;
}