// ============================================================
// core/time-engine.js — Hệ thống Thời Gian & Tuổi Thọ
// 1 giây thực = 30 phút game
// 1 tick (0.1s) = 3 phút game
// 1 năm game = 365 ngày × 24 giờ × 60 phút = 525,600 phút
// Ticks/năm = 525600 / 3 = 175,200 ticks
// ============================================================
import { REALMS } from './data.js';
import { bus } from '../utils/helpers.js';

// ---- Hằng số ----
const MINS_PER_TICK    = 3;       // 3 phút game mỗi tick 0.1s
const MINS_PER_YEAR    = 525600;  // phút trong 1 năm
const YEARS_PER_TICK   = MINS_PER_TICK / MINS_PER_YEAR; // ~0.00000571 năm/tick

export const TIME_CONSTANTS = { MINS_PER_TICK, MINS_PER_YEAR, YEARS_PER_TICK };

// ---- Tên cảnh giới ----
const REALM_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh',
                     'Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa'];

// ---- Khởi tạo tuổi thọ khi bắt đầu game ----
export function initLifespan(G) {
  if (!G.gameTime) {
    G.gameTime = {
      currentYear: 0,
      totalYears: 0,
      lifespanMax: 120, // Luyện Khí tầng 1 — không phải phàm nhân 70t
      lifespanBonus: 0,
      isGameOver: false,
    };
  }
  // Luyện Khí tầng 1 — tuổi thọ dao động 120~144, lấy mức cơ bản 120
  // (Phàm nhân 70t chỉ áp dụng cho người không tu luyện)
  G.gameTime.lifespanMax = 120;
  G.gameTime.currentYear = 0;
  G.chronicle = G.chronicle || [];
  addChronicle(G, 'Bắt đầu tu luyện ở tuổi 10, thọ mệnh ~120 năm theo Luyện Khí tầng 1.');
}

// ---- Cập nhật thời gian mỗi tick ----
export function tickTime(G, dt) {
  if (!G.gameTime || G.gameTime.isGameOver) return null;

  const yearsAdded = YEARS_PER_TICK * dt * 10; // dt=0.1, ×10 = 1 tick
  G.gameTime.currentYear += yearsAdded;
  G.gameTime.totalYears  += yearsAdded;

  const maxLife = getMaxLifespan(G);
  const remaining = maxLife - G.gameTime.currentYear;

  // Cảnh báo khi gần hết tuổi thọ
  if (remaining <= 10 && remaining > 9.95) {
    bus.emit('lifespan:warning', { remaining: Math.floor(remaining), level: 'critical' });
  } else if (remaining <= 30 && remaining > 29.95) {
    bus.emit('lifespan:warning', { remaining: Math.floor(remaining), level: 'danger' });
  } else if (remaining <= 100 && remaining > 99.95) {
    bus.emit('lifespan:warning', { remaining: Math.floor(remaining), level: 'warning' });
  }

  // Game Over
  if (G.gameTime.currentYear >= maxLife) {
    G.gameTime.isGameOver = true;
    G.gameTime.currentYear = maxLife;
    bus.emit('lifespan:gameover', { chronicle: G.chronicle });
    return { gameOver: true };
  }

  return null;
}

// ---- Lấy tuổi thọ tối đa hiện tại ----
export function getMaxLifespan(G) {
  return G.gameTime.lifespanMax + (G.gameTime.lifespanBonus || 0);
}

// ---- Tuổi thọ còn lại ----
export function getRemainingLifespan(G) {
  return Math.max(0, getMaxLifespan(G) - (G.gameTime?.currentYear || 0));
}

// ---- Tỷ lệ % tuổi thọ còn lại ----
export function getLifespanPercent(G) {
  const maxAge   = getMaxLifespan(G);
  const startAge = 10; // tuổi bắt đầu tu luyện
  const totalSpan = maxAge - startAge; // tổng số năm có thể sống
  if (totalSpan <= 0) return 0;
  const remaining = getRemainingLifespan(G);
  return Math.max(0, Math.min(100, (remaining / totalSpan) * 100));
}

// ---- Cập nhật tuổi thọ khi đột phá cảnh giới ----
export function onRealmBreakthrough(G, newRealmIdx) {
  const realm = REALMS[newRealmIdx];
  if (!realm || !G.gameTime) return;

  const oldMax = G.gameTime.lifespanMax;
  G.gameTime.lifespanMax = realm.lifespan || oldMax;
  // Reset tuổi hiện tại về 0 khi lên cảnh giới mới
  // (bắt đầu đếm lại từ đầu trong cảnh giới mới)
  G.gameTime.currentYear = 0;
  G.gameTime.lifespanBonus = 0; // reset bonus — phải kiếm lại

  const realmName = REALM_NAMES[newRealmIdx] || realm.name;
  addChronicle(G,
    `Đột phá ${realmName}! Tuổi thọ tăng lên ${realm.lifespan} năm.`,
    `Đây là năm thứ ${Math.floor(G.gameTime.totalYears)} trong cuộc đời tu tiên.`
  );

  bus.emit('lifespan:breakthrough', {
    realmName,
    newLifespan: realm.lifespan,
    totalYears: G.gameTime.totalYears,
  });
}

// ---- Tăng tuổi thọ từ thảo dược/đan dược ----
export function addLifespanBonus(G, years, source) {
  if (!G.gameTime) return { ok: false, msg: 'Lỗi hệ thống thời gian' };

  const realm = REALMS[G.realmIdx];
  const cap = realm ? (realm.lifespanCap - realm.lifespan) : 20;
  const currentBonus = G.gameTime.lifespanBonus || 0;

  if (currentBonus >= cap) {
    return {
      ok: false,
      msg: `Tuổi thọ đã đạt giới hạn tối đa (${G.gameTime.lifespanMax + cap} năm)!`,
      type: 'danger'
    };
  }

  const actual = Math.min(years, cap - currentBonus);
  G.gameTime.lifespanBonus = currentBonus + actual;

  addChronicle(G,
    `Nhận được ${source} — tuổi thọ tăng thêm ${actual} năm.`,
  );

  return {
    ok: true,
    msg: `+${actual} năm tuổi thọ từ ${source}!`,
    type: 'jade',
    actual,
  };
}

// ---- Trừ tuổi thọ khi di chuyển / tìm kiếm ----
// Dùng cho thu thập thảo dược và săn thú
// @param {number} days — ngày game cần tiêu
// @returns {{ ok: boolean, msg: string, daysSpent: number, gameOver: boolean }}
export function spendTravelTime(G, days) {
  if (!G.gameTime || G.gameTime.isGameOver) return { ok: false, msg: 'Game đã kết thúc.', daysSpent: 0, gameOver: true };
  const years = days / 365;
  const maxLife = getMaxLifespan(G);
  const remaining = maxLife - (G.gameTime.currentYear ?? 0);
  if (years >= remaining) {
    // Di chuyển vét hết tuổi thọ
    G.gameTime.currentYear = maxLife;
    G.gameTime.totalYears = (G.gameTime.totalYears ?? 0) + remaining;
    G.gameTime.isGameOver = true;
    return { ok: false, msg: '💀 Tuổi thọ cạn kiệt trên đường di chuyển!', daysSpent: Math.floor(remaining * 365), gameOver: true };
  }
  G.gameTime.currentYear += years;
  G.gameTime.totalYears = (G.gameTime.totalYears ?? 0) + years;
  return { ok: true, msg: '', daysSpent: days, gameOver: false };
}

// ---- Ghi ký sự ----
export function addChronicle(G, event, detail = '') {
  if (!G.chronicle) G.chronicle = [];
  const year = Math.floor(G.gameTime?.totalYears || 0);
  const realm = REALMS[G.realmIdx];
  G.chronicle.push({
    year,
    event,
    detail,
    realmName: realm?.name || 'Phàm Nhân',
    realmIdx: G.realmIdx,
  });
  // Giới hạn 200 entries
  if (G.chronicle.length > 200) G.chronicle.shift();
}

// ---- Format năm hiển thị ----
export function formatYear(years) {
  const y = Math.floor(years);
  if (y < 1) {
    const months = Math.floor(years * 12);
    return months <= 1 ? 'vài tháng' : `${months} tháng`;
  }
  return `${y} năm`;
}

// ---- Màu sắc thanh tuổi thọ theo % ----
export function getLifespanColor(pct) {
  if (pct > 60) return '#56c46a';   // xanh — an toàn
  if (pct > 30) return '#f0d47a';   // vàng — cảnh báo
  if (pct > 10) return '#e05c1a';   // cam — nguy hiểm
  return '#e03030';                  // đỏ — cực kỳ nguy hiểm
}