// ============================================================
// core/spirit-root.js — Hệ thống Linh Căn Ngũ Hành
// Thay thế SPIRIT_ROOTS cũ bằng hệ thống điểm số thực tế
// ============================================================

// ---- Loại linh căn ----
export const SPIRIT_ROOT_TYPES = {
  TIEN:    { label: 'Thiên Linh Căn',     rarity: 'huyền thoại', rateMulti: 3.0,  color: '#ffe9a0', emoji: '🌟' },
  SONG:    { label: 'Song Linh Căn',       rarity: 'cực hiếm',    rateMulti: 2.2,  color: '#c8a84b', emoji: '✦' },
  TAM:     { label: 'Tam Linh Căn',        rarity: 'thường',      rateMulti: 1.4,  color: '#7b9ef0', emoji: '◈' },
  TU:      { label: 'Tứ Linh Căn',         rarity: 'thường',      rateMulti: 0.7,  color: '#888',    emoji: '◇' },
  NGU:     { label: 'Ngũ Linh Căn',        rarity: 'thường',      rateMulti: 0.4,  color: '#666',    emoji: '○' },
  BIEN_DI: { label: 'Biến Dị Linh Căn',   rarity: 'cực hiếm',    rateMulti: 2.8,  color: '#c084fc', emoji: '⚡' },
};

// ---- Các hệ ngũ hành + biến dị ----
export const SPIRIT_ELEMENTS = {
  // Ngũ hành cơ bản
  kim:   { name: 'Kim',   emoji: '⚔',  color: '#f0d47a', desc: 'Bén nhọn, phá hủy',     nghePhuBonus: 'luyen_vu_khi', combatBonus: 'atk' },
  moc:   { name: 'Mộc',   emoji: '🌿', color: '#56c46a', desc: 'Sinh trưởng, hồi phục', nghePhuBonus: 'thu_thao',     combatBonus: 'hp'  },
  shui:  { name: 'Thủy',  emoji: '💧', color: '#3a9fd5', desc: 'Linh hoạt, bền bỉ',     nghePhuBonus: 'tran_phap',    combatBonus: 'spd' },
  huo:   { name: 'Hỏa',   emoji: '🔥', color: '#e05c1a', desc: 'Bùng nổ, luyện đan',   nghePhuBonus: 'luyen_dan',    combatBonus: 'atk' },
  tu:    { name: 'Thổ',   emoji: '🗿', color: '#a07850', desc: 'Vững chắc, phòng thủ', nghePhuBonus: 'tran_phap',    combatBonus: 'def' },
  // Biến dị
  phong: { name: 'Phong', emoji: '🌪', color: '#a8e6cf', desc: 'Tốc độ, né tránh',      nghePhuBonus: 'du_hiep',      combatBonus: 'spd' },
  loi:   { name: 'Lôi',   emoji: '⚡', color: '#ffd700', desc: 'Hủy diệt, choáng',      nghePhuBonus: 'luyen_vu_khi', combatBonus: 'atk' },
  bang:  { name: 'Băng',  emoji: '❄',  color: '#87ceeb', desc: 'Kiểm soát, làm chậm',   nghePhuBonus: 'tran_phap',    combatBonus: 'def' },
  am:    { name: 'Âm',    emoji: '🌑', color: '#9370db', desc: 'Bí ẩn, cơ duyên',       nghePhuBonus: 'co_duyen',     combatBonus: 'luck'},
  duong: { name: 'Dương', emoji: '☀', color: '#ffa500', desc: 'Trường sinh, hồi phục',  nghePhuBonus: 'thu_thao',     combatBonus: 'hp'  },
};

// ---- Tương khắc ngũ hành ----
export const ELEMENT_COUNTERS = {
  kim: 'moc',   // Kim khắc Mộc
  moc: 'tu',    // Mộc khắc Thổ
  tu:  'shui',  // Thổ khắc Thủy
  shui:'huo',   // Thủy khắc Hỏa
  huo: 'kim',   // Hỏa khắc Kim
};

// ---- Roll linh căn ----
// v12 — Xác suất mới theo GDD mục 21:
//   Thiên    0.01% | Biến Dị 1.5% | Song 3.5%
//   Tam       21%  | Tứ       39% | Ngũ    35%
// Dùng r trên 10000 để đủ precision cho Thiên 0.01%
export function rollSpiritRoot() {
  const r = Math.random() * 10000;
  const BASE_ELEMENTS = ['kim','moc','shui','huo','tu'];
  const BIEN_DI_ELEMENTS = ['phong','loi','bang','am','duong'];

  if (r < 1) {
    // Thiên Linh Căn 0.01% — dị số ngàn năm có một
    const el = BASE_ELEMENTS[Math.floor(Math.random() * 5)];
    return { type:'TIEN', points:{ [el]: 92 + _rand(8) }, mainElement:el };
  }
  if (r < 151) {
    // Biến Dị Linh Căn 1.5%
    const el = BIEN_DI_ELEMENTS[Math.floor(Math.random() * BIEN_DI_ELEMENTS.length)];
    return { type:'BIEN_DI', points:{ [el]: 88 + _rand(10) }, mainElement:el };
  }
  if (r < 501) {
    // Song Linh Căn 3.5%
    const [m, s] = _shuffle(BASE_ELEMENTS);
    return { type:'SONG', points:{ [m]: 52+_rand(10), [s]: 18+_rand(8) }, mainElement:m };
  }
  if (r < 2601) {
    // Tam Linh Căn 21% — thường, không phải hiếm
    const [a,b,c] = _shuffle(BASE_ELEMENTS);
    return { type:'TAM', points:{ [a]:28+_rand(6), [b]:15+_rand(6), [c]:10+_rand(5) }, mainElement:a };
  }
  if (r < 6501) {
    // Tứ Linh Căn 39%
    const [a,b,c,d] = _shuffle(BASE_ELEMENTS);
    return { type:'TU', points:{ [a]:14+_rand(3),[b]:11+_rand(3),[c]:11+_rand(3),[d]:9+_rand(3) }, mainElement:a };
  }
  // Ngũ Linh Căn 35% — phổ biến nhất
  const sh = _shuffle(BASE_ELEMENTS);
  const pts = [8,7,6,5,5].map(v => v+_rand(3));
  const points = {};
  sh.forEach((el,i) => points[el] = pts[i]);
  return { type:'NGU', points, mainElement:sh[0] };
}

function _rand(n) { return Math.floor(Math.random() * n); }
function _shuffle(arr) { return [...arr].sort(() => Math.random()-0.5); }

// ---- Tính multiplier tốc độ tu luyện ----
export function calcSpiritRateMulti(spiritData) {
  if (!spiritData?.points) return 1.0;
  const vals = Object.values(spiritData.points);
  if (!vals.length) return 1.0;
  const maxPts = Math.max(...vals);
  const n = vals.length;
  let base;
  if (maxPts >= 90) base = 3.0;
  else if (maxPts >= 70) base = 2.5;
  else if (maxPts >= 50) base = 2.0;
  else if (maxPts >= 30) base = 1.5;
  else if (maxPts >= 20) base = 1.0;
  else base = 0.5;
  // Penalty mỗi hệ phụ × 0.85
  return parseFloat((base * Math.pow(0.85, n - 1)).toFixed(2));
}

// ---- Bonus theo nghề phụ ----
export function getSpiritCraftBonus(spiritData, craftType) {
  if (!spiritData?.points) return 1.0;
  const BONUSES = {
    luyen_dan:    ['huo', 'shui'],
    thu_thao:     ['moc', 'duong'],
    tran_phap:    ['shui', 'tu', 'bang'],
    luyen_vu_khi: ['kim', 'loi'],
    du_hiep:      ['am', 'phong'],
  };
  const relevant = BONUSES[craftType] || [];
  let bonus = 1.0;
  for (const el of relevant) {
    const pts = spiritData.points[el] || 0;
    bonus += pts * 0.005; // mỗi điểm = +0.5%
  }
  return parseFloat(bonus.toFixed(2));
}

// ---- Bonus nguyên liệu luyện đan theo hệ ----
export function getSpiritAlchemyBonus(spiritData, ingredientElement) {
  if (!spiritData?.points || !ingredientElement) return 1.0;
  const pts = spiritData.points[ingredientElement] || 0;
  // Dùng nguyên liệu đúng hệ linh căn → bonus tỷ lệ thành công
  return 1.0 + pts * 0.004;
}

// ---- Hiển thị tên đầy đủ ----
export function getSpiritDisplayName(spiritData) {
  if (!spiritData) return '?';
  const typeInfo = SPIRIT_ROOT_TYPES[spiritData.type];
  const sorted = Object.entries(spiritData.points).sort((a,b) => b[1]-a[1]);
  const elemStr = sorted.map(([el,pts]) => {
    const e = SPIRIT_ELEMENTS[el];
    return `${e?.emoji||'?'}${e?.name||el}`;
  }).join('+');
  return `${typeInfo?.label||'?'} (${elemStr})`;
}

// ---- Lấy màu chính ----
export function getSpiritMainColor(spiritData) {
  if (!spiritData?.mainElement) return '#888';
  return SPIRIT_ELEMENTS[spiritData.mainElement]?.color || '#888';
}

// ---- Prophecy theo linh căn ----
const PROPHECIES = {
  TIEN: {
    kim: 'Kiếm khí xuyên vân — Thiên Kim Linh Căn, một trong vạn người. Con đường của ngươi là đỉnh cao kiếm đạo.',
    moc: 'Sinh cơ vô tận — Thiên Mộc Linh Căn, như cây cổ thụ ngàn năm. Ngươi sẽ là người cuối cùng đứng vững.',
    shui: 'Nước thắng mọi thứ — Thiên Thủy Linh Căn, tu luyện không ngừng. Mềm mà thắng cứng, đó là đạo của ngươi.',
    huo: 'Lửa thiêng đốt thiên — Thiên Hỏa Linh Căn, đan đạo thiên tài. Lò đan trong tay ngươi sẽ luyện ra tiên đan.',
    tu: 'Đại địa bất biến — Thiên Thổ Linh Căn, phòng thủ vô song. Trận pháp của ngươi sẽ nhốt thiên hạ.',
  },
  BIEN_DI: {
    phong: 'Phong Linh Căn — Di chuyển như gió, không ai theo kịp. Tốc độ là vũ khí mạnh nhất.',
    loi: 'Lôi Linh Căn — Sấm sét giáng xuống, vạn ma tan biến. Hủy diệt là bản năng của ngươi.',
    bang: 'Băng Linh Căn — Lạnh như băng ngàn năm, kiểm soát toàn bộ chiến trường.',
    am: 'Âm Linh Căn — Bí ẩn như đêm tối, cơ duyên luôn theo ngươi. Người người đều ganh tị.',
    duong: 'Dương Linh Căn — Ánh sáng mặt trời, thọ nguyên dài vô tận. Ngươi sẽ sống đến khi thiên địa diệt vong.',
  },
  SONG:    'Song Linh Căn — Hai hệ điều hòa, thiên tài bẩm sinh. Ít người có duyên như ngươi.',
  TAM:     'Tam Linh Căn — Ba hệ song hành, bình thường nhưng bền vững. Tu luyện chăm chỉ, ngươi vẫn có thể đạt đỉnh cao.',
  TU:      'Tứ Linh Căn — Bốn hệ xung đột, con đường gian nan. Nhưng nếu vượt qua, ngươi sẽ mạnh theo cách khác người.',
  NGU:     'Ngũ Linh Căn — Năm hệ hỗn loạn, phàm nhân tu tiên khó khăn nhất. Nhưng không phải là không thể.',
};

export function getSpiritProphecy(spiritData) {
  if (!spiritData) return '';
  const { type, mainElement } = spiritData;
  if (type === 'TIEN' && PROPHECIES.TIEN[mainElement]) return PROPHECIES.TIEN[mainElement];
  if (type === 'BIEN_DI' && PROPHECIES.BIEN_DI[mainElement]) return PROPHECIES.BIEN_DI[mainElement];
  return PROPHECIES[type] || '';
}

// ---- Tông môn phù hợp ----
export function getRecommendedSects(spiritData) {
  if (!spiritData?.type) return [];
  const SECT_MAP = {
    kim:  ['kiem_tong'],
    huo:  ['dan_tong'],
    shui: ['dan_tong','tran_phap'],
    tu:   ['tran_phap'],
    moc:  ['the_tu'],
    loi:  ['kiem_tong'],
    bang: ['tran_phap'],
    am:   [],
    phong:[],
    duong:['the_tu'],
  };
  const recs = new Set();
  if (spiritData.type === 'TIEN' || spiritData.type === 'BIEN_DI') {
    // Chỉ recommend tông phù hợp hệ chính
    (SECT_MAP[spiritData.mainElement] || []).forEach(s => recs.add(s));
  } else if (spiritData.type === 'SONG' || spiritData.type === 'TAM') {
    Object.keys(spiritData.points).forEach(el => {
      (SECT_MAP[el] || []).forEach(s => recs.add(s));
    });
  }
  // Hỗn Nguyên / Âm Dương type — tất cả tông
  if (['TU','NGU'].includes(spiritData.type) && Object.keys(spiritData.points).length >= 4) {
    return []; // Quá nhiều hệ → không tông nào thực sự phù hợp
  }
  return [...recs];
}

// ============================================================
// BIẾN DỊ LINH CĂN — Mechanics đặc biệt
// ============================================================
export const BIEN_DI_MECHANICS = {
  phong: {
    name: 'Phong Linh',
    passiveDesc: 'Né tránh +15%, tốc độ di chuyển +20%',
    combatPassive: (G) => ({ evasion: 0.15, spdBonus: 0.2 }),
    skillUnlock: 'phong_bo',  // Kỹ năng đặc biệt
  },
  loi: {
    name: 'Lôi Linh',
    passiveDesc: 'ATK +20%, 10% cơ hội choáng kẻ địch',
    combatPassive: (G) => ({ atkPct: 20, stunChance: 0.1 }),
    skillUnlock: 'loi_phap',
  },
  bang: {
    name: 'Băng Linh',
    passiveDesc: 'DEF +15%, làm chậm kẻ địch -20% tốc độ',
    combatPassive: (G) => ({ defPct: 15, slowEnemy: 0.2 }),
    skillUnlock: 'bang_phong',
  },
  am: {
    name: 'Âm Linh',
    passiveDesc: 'Cơ duyên ×2.5, phát hiện bí cảnh dễ hơn',
    combatPassive: (G) => ({ luckMult: 2.5 }),
    skillUnlock: 'am_dun',
  },
  duong: {
    name: 'Dương Linh',
    passiveDesc: 'HP hồi phục +50%/s, thọ mệnh bonus +20%',
    combatPassive: (G) => ({ hpRegen: 0.5, lifespanBonus: 0.2 }),
    skillUnlock: 'duong_quang',
  },
};

// Áp dụng passive biến dị vào G
export function applyBienDiPassive(G) {
  if (!G.spiritData || G.spiritData.type !== 'BIEN_DI') return;
  const el = G.spiritData.mainElement;
  const mechanic = BIEN_DI_MECHANICS[el];
  if (!mechanic) return;

  const bonuses = mechanic.combatPassive(G);
  if (bonuses.evasion)     G.evasion    = (G.evasion||0)    + bonuses.evasion;
  if (bonuses.atkPct)      G.atkPct     = (G.atkPct||0)      + bonuses.atkPct;
  if (bonuses.defPct)      G.defPct     = (G.defPct||0)      + bonuses.defPct;
  if (bonuses.spdBonus)    G.spdBonus   = (G.spdBonus||0)    + bonuses.spdBonus;
  if (bonuses.stunChance)  G.stunChance = (G.stunChance||0)  + bonuses.stunChance;
  if (bonuses.luckMult)    G.luckMult   = (G.luckMult||1)    * bonuses.luckMult;
}