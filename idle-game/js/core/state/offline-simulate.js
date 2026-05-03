// ============================================================
// core/state/offline-simulate.js
// Simulate bế quan offline — chính xác như online thật
//
// Nguyên tắc:
//   - Không dùng hệ số nhân tùy tiện
//   - Tính từng thứ đúng như gameTick khi meditating=true
//   - Buff có timer → trừ dần, hết thì tắt đúng lúc
//   - Tuổi thọ trôi đúng tỉ lệ thời gian thực
// ============================================================

import { calcQiRate, calcMaxQi, calcPurityRate } from './computed.js';
import { calcMasteryGainPerTick }                from '../phap-dia.js';

// Hằng số thời gian — khớp với time-engine.js và tick.js
const MINS_PER_YEAR  = 525600;
const YEARS_PER_SEC  = 30 / MINS_PER_YEAR; // 1s thực = 30 phút game

// ============================================================
// simulateOfflineMeditate
//
// Tính toàn bộ tiến trình bế quan offline.
// Mutate G trực tiếp (giống calcOfflineProgress cũ).
//
// @param {object} G        — game state
// @param {number} offSec   — số giây thực offline (đã cap ở caller)
// @returns {object}        — kết quả để hiển thị modal
// ============================================================
export function simulateOfflineMeditate(G, offSec) {
  // Đảm bảo trạng thái bế quan khi simulate
  const wasActuallyMeditating = G.meditating;
  G.meditating = true;

  // ── 1. Tính qi và purity ────────────────────────────────
  // Các buff có timer ảnh hưởng calcQiRate — phải tính trước khi trừ timer
  // Chia nhỏ thành các đoạn theo thời điểm buff hết hạn
  const { qiEarned, purityEarned, segments } = _simulateQiWithBuffs(G, offSec);

  // Apply kết quả qi / purity
  const maxQ = calcMaxQi(G);
  const qiBefore = G.qi ?? 0;
  G.qi = Math.min(qiBefore + qiEarned, maxQ);

  // Nếu qi đã đầy trong quá trình simulate → phần dư chuyển sang purity
  const qiCapped = qiEarned - (G.qi - qiBefore); // lượng qi bị cap
  const extraPurity = qiCapped > 0
    ? _calcExtraPurity(G, offSec, qiBefore, maxQ)
    : 0;
  G.purity = (G.purity ?? 0) + purityEarned + extraPurity;

  // ── 2. Thuần thục công pháp ─────────────────────────────
  const masteryGained = {};
  if (G.congPhap?.activeIds && G.congPhap?.mastery) {
    for (const cpId of G.congPhap.activeIds) {
      const current = G.congPhap.mastery[cpId] ?? 0;
      if (current < 100) {
        // calcMasteryGainPerTick trả về gain/tick (0.1s)
        // offSec giây = offSec / 0.1 ticks
        const totalGain = calcMasteryGainPerTick(G, cpId) * (offSec / 0.1);
        const gained    = Math.min(100 - current, totalGain);
        G.congPhap.mastery[cpId] = current + gained;
        if (gained > 0.001) masteryGained[cpId] = gained;
      }
    }
  }

  // ── 3. Trừ timer các buff — theo đúng thời gian offline ─
  const buffsExpired = _tickAllBuffTimers(G, offSec);

  // ── 4. Đan độc giảm dần ──────────────────────────────────
  // danDoc giảm theo dtYears, giống tick.js: danDoc -= dtYears / 5
  if ((G.danDoc ?? 0) > 0) {
    const offYears = offSec * YEARS_PER_SEC;
    G.danDoc = Math.max(0, G.danDoc - offYears / 5);
  }

  // ── 5. Stamina giảm khi bế quan ──────────────────────────
  // tick.js: stamina -= 0.008 * dt * 10 mỗi tick 0.1s
  // 1 giây = 10 ticks → mỗi giây mất 0.008 * 10 * 10 = 0.8 stamina/s
  const staminaDrain = 0.008 * 10 * offSec;
  G.stamina = Math.max(0, (G.stamina ?? 0) - staminaDrain);

  // ── 6. Tuổi thọ trôi ─────────────────────────────────────
  const offlineYears = offSec * YEARS_PER_SEC;
  let gameOver = false;
  if (G.gameTime && !G.gameTime.isGameOver) {
    const maxLife = (G.gameTime.lifespanMax || 120) + (G.gameTime.lifespanBonus || 0);
    G.gameTime.currentYear = Math.min(
      (G.gameTime.currentYear ?? 0) + offlineYears,
      maxLife
    );
    G.gameTime.totalYears = (G.gameTime.totalYears ?? 0) + offlineYears;
    if (G.gameTime.currentYear >= maxLife) {
      G.gameTime.isGameOver = true;
      G.gameTime.currentYear = maxLife;
      gameOver = true;
    }
  }

  // ── 7. totalTime ──────────────────────────────────────────
  G.totalTime = (G.totalTime ?? 0) + offSec;

  // ── 8. Quest progress meditate_time ──────────────────────
  let questsProgressed = 0;
  if (G.quests?.daily?.length) {
    for (const entry of G.quests.daily) {
      if (entry.completed) continue;
      if (entry.progress?.meditate_time !== undefined) {
        entry.progress.meditate_time = (entry.progress.meditate_time || 0) + offSec;
        questsProgressed++;
      }
    }
  }

  // Khôi phục trạng thái meditating gốc
  G.meditating = wasActuallyMeditating;

  return {
    offSec,
    qiEarned:       Math.floor(qiEarned),
    purityEarned:   parseFloat((purityEarned + extraPurity).toFixed(2)),
    masteryGained,
    buffsExpired,
    offlineYears:   parseFloat(offlineYears.toFixed(2)),
    gameOver,
    questsProgressed,
    segments,       // để debug nếu cần
    choseMeditate:  true,
  };
}

// ============================================================
// _simulateQiWithBuffs
//
// Chia timeline offline thành các đoạn theo lúc buff hết hạn.
// Mỗi đoạn tính qi rate độc lập với buff còn hiệu lực lúc đó.
//
// Ví dụ: buff đan dược còn 2 ngày game, offline 5 ngày game
//   → đoạn 1: 2 ngày, rate = base × buff
//   → đoạn 2: 3 ngày, rate = base (không buff)
// ============================================================
function _simulateQiWithBuffs(G, offSec) {
  // Thu thập tất cả thời điểm buff sẽ hết (tính bằng giây thực)
  const expiryPoints = _collectBuffExpiries(G);

  // Sắp xếp và lọc chỉ lấy những điểm trong khoảng [0, offSec]
  const breakpoints = [0, ...expiryPoints.filter(t => t > 0 && t < offSec).sort((a, b) => a - b), offSec];

  let totalQi     = 0;
  let totalPurity = 0;
  const segments  = [];

  // Clone G tạm để simulate từng đoạn mà không mutate G.buff timers sớm
  // (timers sẽ được trừ thật sự sau ở _tickAllBuffTimers)
  const Gtmp = _shallowCloneForRate(G);
  Gtmp.meditating = true;

  for (let i = 0; i < breakpoints.length - 1; i++) {
    const segStart = breakpoints[i];
    const segEnd   = breakpoints[i + 1];
    const segSec   = segEnd - segStart;

    const rate    = calcQiRate(Gtmp);
    const maxQ    = calcMaxQi(Gtmp);
    const qiRoom  = Math.max(0, maxQ - (Gtmp.qi ?? 0));

    const qiThisSeg = rate * segSec;

    if (qiRoom > 0) {
      const actualQi = Math.min(qiThisSeg, qiRoom);
      Gtmp.qi = (Gtmp.qi ?? 0) + actualQi;
      totalQi += actualQi;

      // Nếu qi đầy trong đoạn này → phần còn lại chuyển sang purity
      if (actualQi < qiThisSeg) {
        const overflowSec   = segSec * (1 - qiRoom / qiThisSeg);
        const purityRate    = calcPurityRate(Gtmp);
        totalPurity        += purityRate * overflowSec * 10; // ×10 như tick.js
      }
    } else {
      // qi đã đầy từ đầu đoạn → toàn đoạn tích purity
      const purityRate  = calcPurityRate(Gtmp);
      totalPurity      += purityRate * segSec * 10;
    }

    segments.push({ segSec, rate: parseFloat(rate.toFixed(4)), qiEarned: parseFloat((Math.min(qiThisSeg, qiRoom)).toFixed(2)) });

    // Advance Gtmp timers tới cuối đoạn (để đoạn sau tính đúng buff)
    _advanceTimers(Gtmp, segSec);
  }

  return { qiEarned: totalQi, purityEarned: totalPurity, segments };
}

// ============================================================
// _collectBuffExpiries
// Trả về danh sách thời điểm (giây thực) mà từng buff sẽ hết
// ============================================================
function _collectBuffExpiries(G) {
  const points = [];

  // G-level timers (đơn vị giây thực)
  const timerFields = ['atkBuffTimer', 'defBuffTimer', 'stoneBuffTimer', 'eventRateTimer', 'eventExpTimer'];
  for (const f of timerFields) {
    if ((G[f] ?? 0) > 0) points.push(G[f]);
  }

  // Linh Thực buffs
  if (Array.isArray(G.linhThuc?.activeBuffs)) {
    for (const b of G.linhThuc.activeBuffs) {
      if ((b.timer ?? 0) > 0) points.push(b.timer);
    }
  }

  // Trận Pháp arrays
  if (Array.isArray(G.tranPhap?.activeArrays)) {
    for (const a of G.tranPhap.activeArrays) {
      if ((a.timer ?? 0) > 0) points.push(a.timer);
    }
  }

  // Phù Chú buffs
  if (Array.isArray(G.phuChu?.activeBuffs)) {
    for (const b of G.phuChu.activeBuffs) {
      if ((b.timer ?? 0) > 0) points.push(b.timer);
    }
  }

  return points;
}

// ============================================================
// _advanceTimers — trừ timer Gtmp cho từng segment
// ============================================================
function _advanceTimers(Gtmp, sec) {
  const timerPairs = [
    ['atkBuff','atkBuffTimer'], ['defBuff','defBuffTimer'],
    ['stoneBuffPct','stoneBuffTimer'], ['eventRateBonus','eventRateTimer'],
    ['eventExpBonus','eventExpTimer'],
  ];
  for (const [buff, timer] of timerPairs) {
    if ((Gtmp[timer] ?? 0) > 0) {
      Gtmp[timer] = Math.max(0, Gtmp[timer] - sec);
      if (Gtmp[timer] === 0) Gtmp[buff] = 0;
    }
  }

  if (Array.isArray(Gtmp.linhThuc?.activeBuffs)) {
    Gtmp.linhThuc.activeBuffs = Gtmp.linhThuc.activeBuffs
      .map(b => ({ ...b, timer: Math.max(0, b.timer - sec) }))
      .filter(b => b.timer > 0);
  }
  if (Array.isArray(Gtmp.tranPhap?.activeArrays)) {
    Gtmp.tranPhap.activeArrays = Gtmp.tranPhap.activeArrays
      .map(a => a.timer !== undefined ? { ...a, timer: Math.max(0, a.timer - sec) } : a)
      .filter(a => a.timer === undefined || a.timer > 0);
  }
  if (Array.isArray(Gtmp.phuChu?.activeBuffs)) {
    Gtmp.phuChu.activeBuffs = Gtmp.phuChu.activeBuffs
      .map(b => ({ ...b, timer: Math.max(0, b.timer - sec) }))
      .filter(b => b.timer > 0);
  }
}

// ============================================================
// _tickAllBuffTimers — trừ timer THẬT trên G, trả về list buff hết
// ============================================================
function _tickAllBuffTimers(G, offSec) {
  const expired = [];

  const timerPairs = [
    ['atkBuff','atkBuffTimer'], ['defBuff','defBuffTimer'],
    ['stoneBuffPct','stoneBuffTimer'], ['eventRateBonus','eventRateTimer'],
    ['eventExpBonus','eventExpTimer'],
  ];
  for (const [buff, timer] of timerPairs) {
    if ((G[timer] ?? 0) > 0) {
      G[timer] = Math.max(0, G[timer] - offSec);
      if (G[timer] === 0) { G[buff] = 0; expired.push(buff); }
    }
  }

  if (Array.isArray(G.linhThuc?.activeBuffs)) {
    const before = G.linhThuc.activeBuffs.length;
    G.linhThuc.activeBuffs = G.linhThuc.activeBuffs
      .map(b => ({ ...b, timer: Math.max(0, b.timer - offSec) }))
      .filter(b => b.timer > 0);
    const lost = before - G.linhThuc.activeBuffs.length;
    if (lost > 0) expired.push(`${lost} buff Linh Thực`);
  }

  if (Array.isArray(G.tranPhap?.activeArrays)) {
    const before = G.tranPhap.activeArrays.length;
    G.tranPhap.activeArrays = G.tranPhap.activeArrays
      .map(a => a.timer !== undefined ? { ...a, timer: Math.max(0, a.timer - offSec) } : a)
      .filter(a => a.timer === undefined || a.timer > 0);
    const lost = before - G.tranPhap.activeArrays.length;
    if (lost > 0) expired.push(`${lost} trận pháp`);
  }

  if (Array.isArray(G.phuChu?.activeBuffs)) {
    const before = G.phuChu.activeBuffs.length;
    G.phuChu.activeBuffs = G.phuChu.activeBuffs
      .map(b => ({ ...b, timer: Math.max(0, b.timer - offSec) }))
      .filter(b => b.timer > 0);
    const lost = before - G.phuChu.activeBuffs.length;
    if (lost > 0) expired.push(`${lost} phù chú`);
  }

  return expired;
}

// ============================================================
// _calcExtraPurity — purity từ qi overflow (qi đã đầy)
// ============================================================
function _calcExtraPurity(G, offSec, qiBefore, maxQ) {
  if (qiBefore >= maxQ) {
    // qi đã đầy từ đầu — toàn bộ thời gian tích purity
    const pRate = calcPurityRate(G);
    return pRate * offSec * 10;
  }
  return 0;
}

// ============================================================
// _shallowCloneForRate
// Clone G đủ để calcQiRate / calcPurityRate chạy đúng,
// không ảnh hưởng G gốc khi advance timers trong simulate
// ============================================================
function _shallowCloneForRate(G) {
  return {
    ...G,
    linhThuc: G.linhThuc
      ? { ...G.linhThuc, activeBuffs: (G.linhThuc.activeBuffs || []).map(b => ({ ...b })) }
      : G.linhThuc,
    tranPhap: G.tranPhap
      ? { ...G.tranPhap, activeArrays: (G.tranPhap.activeArrays || []).map(a => ({ ...a })) }
      : G.tranPhap,
    phuChu: G.phuChu
      ? { ...G.phuChu, activeBuffs: (G.phuChu.activeBuffs || []).map(b => ({ ...b })) }
      : G.phuChu,
  };
}