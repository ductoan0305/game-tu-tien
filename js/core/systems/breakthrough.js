// ============================================================
// core/systems/breakthrough.js
// calcBreakthroughChance, doBreakthrough, applyRealmBreakthrough
// ============================================================
import { REALMS }                             from '../data.js';
import { calcMaxQi, calcMaxHp,
         calcPurityThreshold }                from '../state/computed.js';
import { bus }                               from '../../utils/helpers.js';
import { onRealmBreakthrough, addChronicle } from '../time-engine.js';

export function calcBreakthroughChance(G) {
  const realm       = REALMS[G.realmIdx];
  const isRealmBreak = G.stage >= realm.stages;

  // P_base
  let P_base;
  if (G.realmIdx === 0) {
    if (!isRealmBreak) {
      if (G.stage <= 2)       P_base = 0.90;
      else if (G.stage === 3) P_base = 0.75;
      else if (G.stage <= 5)  P_base = 0.82;
      else if (G.stage === 6) P_base = 0.60;
      else if (G.stage <= 8)  P_base = 0.72;
      else                    P_base = 0.65;
    } else { P_base = 0.12; }
  } else if (G.realmIdx === 1) {
    if (!isRealmBreak) {
      if (G.stage === 1)      P_base = 0.70;
      else if (G.stage === 2) P_base = 0.55;
      else                    P_base = 0.40;
    } else { P_base = 0.07; }
  } else if (G.realmIdx === 2) {
    if (!isRealmBreak) {
      if (G.stage === 1)      P_base = 0.60;
      else if (G.stage === 2) P_base = 0.45;
      else                    P_base = 0.30;
    } else { P_base = 0.04; }
  } else if (G.realmIdx === 3) {
    if (!isRealmBreak) {
      if (G.stage === 1)      P_base = 0.50;
      else if (G.stage === 2) P_base = 0.35;
      else                    P_base = 0.22;
    } else { P_base = 0.015; }
  } else {
    if (!isRealmBreak) P_base = Math.max(0.05, 0.40 - G.stage * 0.08);
    else               P_base = 0.005;
  }

  // F_lingcan
  const lingcanMult = { TIEN:1.5, BIEN_DI:1.4, SONG:1.2, TAM:1.0, TU:0.7, NGU:0.4 };
  const F_lingcan   = lingcanMult[G.spiritData?.type] ?? 1.0;

  // F_tuoi
  const age      = G.gameTime?.currentYear ?? 0;
  const ageLimit = realm.breakthroughAgeLimitToNext;
  let F_tuoi = 1.0;
  if (ageLimit) {
    if (age <= ageLimit * 0.7) {
      F_tuoi = 1.0;
    } else if (age <= ageLimit) {
      const t = (age - ageLimit * 0.7) / (ageLimit * 0.3);
      F_tuoi = 1.0 - t * 0.25;
    } else {
      const overshoot = (age - ageLimit) / ageLimit;
      F_tuoi = Math.max(0.005, 0.75 * Math.pow(0.35, overshoot * 5));
    }
  }

  // F_purity
  const purity      = G.purity ?? 0;
  const threshold   = calcPurityThreshold(G);
  const purityRatio = purity / threshold;
  let F_purity;
  if      (purityRatio < 0.5)  F_purity = 0.0;
  else if (purityRatio < 0.75) F_purity = 0.5;
  else if (purityRatio < 1.0)  F_purity = 0.85;
  else if (purityRatio < 1.5)  F_purity = 1.0;
  else if (purityRatio < 2.0)  F_purity = 1.2;
  else                         F_purity = 1.4;

  // F_cancot
  const canCotBonus = Math.max(0, ((G.canCot ?? 50) - 50) / 10) * 0.05;

  // F_ngotinh
  const ngoTinh = G.ngoTinh ?? 50;
  // Ngộ Tính ảnh hưởng đột phá — người hiểu sâu dễ phá vỡ bình cảnh hơn
  const F_ngotinh = ngoTinh < 20 ? 0.80
    : ngoTinh < 40  ? 0.90
    : ngoTinh < 60  ? 1.00
    : ngoTinh < 80  ? 1.12
    : ngoTinh < 90  ? 1.25
    : 1.40;

  // F_tamcanh
  const tamCanh = G.tamCanh ?? 50;
  const F_tamcanh = tamCanh <= 20 ? 0.7 : tamCanh <= 50 ? 0.9 : tamCanh <= 80 ? 1.1 : 1.3;

  const danduocMult  = G._breakthroughDanduoc      ?? 1.0;
  const bonusCoduyen = G._breakthroughCoDuyenBonus ?? 0;
  const danDoc       = G.danDoc ?? 0;

  let P = P_base * F_lingcan * F_tuoi * F_purity * F_ngotinh * F_tamcanh * danduocMult;
  P = Math.min(P + canCotBonus + bonusCoduyen, 0.95);
  P = Math.max(P, 0);
  if (danDoc > 90)      P *= 0.6;
  else if (danDoc > 70) P *= 0.85;

  return {
    chance: Math.round(P * 1000) / 10,
    breakdown: { P_base, F_lingcan, F_tuoi, F_purity, F_ngotinh, F_tamcanh, F_danduoc:danduocMult, canCotBonus, bonusCoduyen, danDoc, purity, threshold, purityRatio:Math.round(purityRatio*100), ageLimit, age },
  };
}

export function doBreakthrough(G) {
  const maxQ      = calcMaxQi(G);
  const realm     = REALMS[G.realmIdx];
  const threshold = calcPurityThreshold(G);

  if ((G.qi ?? 0) < maxQ)
    return { ok:false, msg:'Linh lực chưa đủ 100%!', type:'danger' };

  const purity = G.purity ?? 0;
  if (purity < threshold * 0.5) {
    const pct = Math.round(purity / threshold * 100);
    return { ok:false, msg:`Thuần Độ chưa đủ (${pct}% / cần ít nhất 50% ngưỡng). Tiếp tục bế quan để tinh luyện linh lực.`, type:'warning' };
  }

  const { chance, breakdown } = calcBreakthroughChance(G);
  const success = Math.random() * 100 < chance;

  if (!success) {
    const purityRatio = purity / threshold;
    const isSevere    = purityRatio < 0.75 || (G.danDoc ?? 0) > 80;
    const qiLossPct   = isSevere ? 0.40 : 0.20;
    const tamCanhLoss = isSevere ? 15 + Math.floor(Math.random()*11) : 5 + Math.floor(Math.random()*6);
    const lifeLoss    = isSevere ? 3 + Math.floor(Math.random()*5)   : 1 + Math.floor(Math.random()*3);
    const purLossPct  = isSevere ? 0.50 : 0.30;

    G.qi      = Math.floor(maxQ * (1 - qiLossPct));
    G.purity  = Math.floor(purity * (1 - purLossPct));
    G.tamCanh = Math.max(0, (G.tamCanh ?? 50) - tamCanhLoss);
    if (G.gameTime) G.gameTime.lifespanMax = Math.max(1, G.gameTime.lifespanMax - lifeLoss);
    G._breakthroughDanduoc      = 1.0;
    G._breakthroughCoDuyenBonus = 0;

    const stageName = realm.stageNames
      ? realm.stageNames[G.stage] ?? `Tầng ${G.stage+1}`
      : `Tầng ${G.stage+1}`;
    addChronicle(G, `Tuổi ${Math.floor(G.gameTime?.currentYear??0)}: Thất bại đột phá ${realm.name} ${stageName}. Tâm Cảnh -${tamCanhLoss}.`);

    return {
      ok:false, type:isSevere?'fail_severe':'fail', chance:chance.toFixed(1), breakdown,
      msg: isSevere
        ? `Đại thất bại! Linh lực hỗn loạn, kinh mạch tổn thương nặng. Tâm Cảnh -${tamCanhLoss}, mất ${lifeLoss} năm tuổi thọ.`
        : `Đột phá thất bại. Linh lực tán loạn. Tâm Cảnh -${tamCanhLoss}, mất ${lifeLoss} năm tuổi thọ.`,
    };
  }

  // Thành công
  G.qi      = 0;
  G.purity  = 0;
  G._breakthroughDanduoc      = 1.0;
  G._breakthroughCoDuyenBonus = 0;
  G.breakthroughs = (G.breakthroughs ?? 0) + 1;
  G.exp     = 0;
  G.maxExp  = Math.floor(G.maxExp * 1.5);
  G.tamCanh = Math.min(100, (G.tamCanh ?? 50) + 3);
  bus.emit('quest:update', { type:'breakthrough', qty:1 });

  if (G.stage < realm.stages) {
    G.stage++;
    G.atk   = Math.floor(G.atk * 1.18);
    G.def   = Math.floor(G.def * 1.12);
    G.maxHp = Math.floor(G.maxHp * 1.1);
    G.hp    = calcMaxHp(G);
    const stageName = realm.stageNames?.[G.stage-1] ?? `Tầng ${G.stage}`;
    const flavor    = realm.breakthroughText?.[G.stage-1] ?? realm.breakthroughText?.[Math.floor(Math.random()*realm.breakthroughText?.length)] ?? '';
    addChronicle(G, `Tuổi ${Math.floor(G.gameTime?.currentYear??0)}: Đột phá ${realm.name} ${stageName} thành công. Tỷ lệ: ${chance.toFixed(1)}%.`);
    return { ok:true, type:'stage', title:'✨ Tiến Cảnh Thành Công', sub:`${realm.name} · ${stageName}`, flavor, chance:chance.toFixed(1), newMaxQi:calcMaxQi(G) };

  } else if (G.realmIdx + 1 < REALMS.length) {
    const nextIdx = G.realmIdx + 1;
    const next    = REALMS[nextIdx];
    G.realmIdx = nextIdx; G.stage = 1;
    G.atk      = next.atk; G.def = next.def;
    G.maxHp    = Math.floor(next.hp * (1 + (G.hpPct??0)/100) + (G.hpBonus??0));
    G.hp       = G.maxHp;
    G.danhVong = (G.danhVong ?? 0) + 10 * nextIdx;
    if (G.gameTime) onRealmBreakthrough(G, nextIdx);
    bus.emit('quest:update', { type:'reach_realm', target:G.realmIdx, qty:1 });
    addChronicle(G, `Tuổi ${Math.floor(G.gameTime?.totalYears??0)}: ĐẠI ĐỘT PHÁ — đạt ${next.name}! Thọ mệnh mới: ${next.lifespan} năm.`);
    return { ok:true, type:'realm', title:'⚡ ĐẠI ĐỘT PHÁ', sub:next.name, flavor:realm.realmBreakthroughText, newRealm:next, chance:chance.toFixed(1) };

  } else {
    addChronicle(G, 'PHI THĂNG THÀNH CÔNG — vượt thoát Nhân Giới, bước vào Linh Giới.');
    return { ok:true, type:'ascend', title:'☀ PHI THĂNG', sub:'Nhân Giới viên mãn — Linh Giới đợi chờ', flavor:realm.realmBreakthroughText };
  }
}

export function applyRealmBreakthrough(G) {
  const nextRealmIdx = G._pendingRealmIdx;
  if (nextRealmIdx === null || nextRealmIdx === undefined)
    return { ok:false, msg:'Không có đột phá đang chờ' };
  const next    = REALMS[nextRealmIdx];
  G.realmIdx    = nextRealmIdx; G.stage = 1; G._pendingRealmIdx = null;
  G.atk         = next.atk; G.def = next.def;
  G.maxHp       = Math.floor(next.hp * (1 + G.hpPct/100) + G.hpBonus);
  G.hp          = G.maxHp;
  bus.emit('quest:update', { type:'reach_realm', target:G.realmIdx, qty:1 });
  return { ok:true, newRealm:next, msg:`⚡ Đại đột phá thành công — ${next.name}!` };
}